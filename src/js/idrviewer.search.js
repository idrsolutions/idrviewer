/*jshint esversion: 6 */
(function() {
    "use strict";

    let textContent;
    let baseUrl;
    const isLocal = location.protocol === "file:";

    let results;
    let selectedResult = -1;

    let curPg;

    if (isLocal) {
        console.log("Search functionality is not available when loading from the file:// protocol.");
    }


    IDRViewer.on("ready", function(data) {
        baseUrl = data.url || "";
        curPg = data.page;
    });

    IDRViewer.on("pagechange", data => {
        curPg = data.page;
    });

    IDRViewer.loadSearch = function(loadListener, progressListener) {
        if (!textContent) {
            if (isLocal) {
                if (loadListener) { loadListener(false); }
                return;
            }

            const request = new XMLHttpRequest();
            request.open('GET', baseUrl + 'search.json', true);

            if (progressListener) {
                request.addEventListener('progress', function(event) {
                    if (event.lengthComputable) {
                        progressListener(Math.floor(event.loaded / event.total * 100));
                    }
                });
            }

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    textContent = JSON.parse(request.responseText);

                    IDRViewer.fire("searchready", {});
                }
                if (loadListener) { loadListener(!!textContent); }
            };

            request.onerror = function() {
                if (loadListener) { loadListener(false); }
            };

            request.send();
        } else { // Already loaded
            if (loadListener) {
                setTimeout(function() {
                    loadListener(true);
                }, 0);
            }
        }
    };

    let resultsLimit;

    IDRViewer.search = function(searchTerm, matchCase, limitOnePerPage, decomposeSnippets = false) {
        if (!textContent) {
            throw new Error("Search not loaded. loadSearch() must be called first.");
        }

        results = [];
        selectedResult = -1;
        if (textContent && searchTerm) {
            searchTerm = matchCase ? searchTerm : searchTerm.toUpperCase();

            for (let i = 0; i < textContent.length; i++) {
                const pageContent = matchCase ? textContent[i] : textContent[i].toUpperCase();
                let index = -1;
                let resultIndex = 0;

                do {
                    index = pageContent.indexOf(searchTerm, index + 1);
                    if (index >= 0) {
                        const SNIPPET_LENGTH = 50;
                        const snippetStart = index >= SNIPPET_LENGTH ? index - SNIPPET_LENGTH : 0;
                        const snippetEnd = index + searchTerm.length < textContent[i].length - SNIPPET_LENGTH ? index + searchTerm.length + SNIPPET_LENGTH : textContent[i].length;
                        const result = {
                            page: i + 1,
                            index: resultIndex++
                        };
                        if (decomposeSnippets) {
                            result.preSnippet = textContent[i].substring(snippetStart, index);
                            result.postSnippet = textContent[i].substring(index + searchTerm.length, snippetEnd);
                            result.result = textContent[i].substring(index, index + searchTerm.length);
                        } else {
                            result.snippet = (i + 1) + " - " + textContent[i].substr(snippetStart, snippetEnd - snippetStart);
                        }
                        results.push(result);
                    }
                } while (!limitOnePerPage && index !== -1 && (!resultsLimit || results.length < resultsLimit));
            }
        }

        IDRViewer.fire("search", {
            searchTerm,
            results,
            settings: {
                matchCase,
                limitOnePerPage,
                decomposeSnippets
            }
        });

        return results;
    };

    IDRViewer.nextSearchResult = function() {
        const result = selectedResult >= 0 ?
            results[(selectedResult + 1) % results.length] :
            results.find(result => result.page >= curPg);

        if (!result) {
            console.warn("Failed to find next search result");
            return;
        }

        IDRViewer.selectSearchResult(result.page, result.index);
    };

    IDRViewer.prevSearchResult = function() {
        const result = selectedResult >= 0 ?
            results[(selectedResult - 1) >= 0 ? (selectedResult - 1) : results.length - 1] :
            results.reduce((finalResult, result) => {
                return result.page <= curPg ? result : finalResult;
            });

        if (!result) {
            console.warn("Failed to find previous search result");
            return;
        }

        IDRViewer.selectSearchResult(result.page, result.index);
    };

    IDRViewer.selectSearchResult = function(page, index) {
        if (!results) {
            console.warn("There isn't currently a search");
            return;
        }

        const resultIndex = results.findIndex(result => result.page === page && result.index === index);

        if (resultIndex === -1) {
            console.warn("That isn't a valid search result");
            return;
        }

        selectedResult = resultIndex;
        IDRViewer.goToPage(page);

        IDRViewer.fire("searchresultselected", {
            resultIndex,
            result: results[resultIndex]
        });
    };
})();

// Highlighting
(function() {
    "use strict";

    let pageHandler;

    let searchSettings;

    let matches = {};
    let selectedMatch = null;

    let polling = [];
    let timer;

    function getPageNumberFromId(pageId) {
        return parseInt(pageId.substring(4));
    }

    IDRViewer.on("ready", data => {
        pageHandler = data.pageType === "html" ? HTMLPageHandler : SVGPageHandler;
    });

    IDRViewer.on("pageunload", data => {
        delete matches[data.page];
        if (selectedMatch && selectedMatch.page === data.page) {
            clearSelectedMatch();
        }
    });

    IDRViewer.on("searchready", () => {
        IDRViewer.on("pageload", function(page) {
            if (matches.hasOwnProperty(page.page)) {
                findSearchTermsInPage(document.querySelector("#page" + page.page));

                if (selectedMatch && selectedMatch.page === page.page) {
                    matches[page.page].pageHandler.setMatchDescriptorSelected(selectedMatch.index, true);
                }
            }
        });

        // Setup the polling logic for unloaded SVG Documents
        if (pageHandler === SVGPageHandler) {
            setInterval(function() {
                if (polling.length > 0) {
                    // Only deal with one page per .5 seconds for performance reasons, more can likely be used to increase snappiness, a shorter interval is also an option
                    let page = polling.shift();

                    if (page) {
                        if (page.querySelector("object").contentDocument.querySelector("text").getComputedTextLength() !== 0) {
                            findSearchTermsInPage(page);

                            if (selectedMatch && selectedMatch.page === page.page) {
                                matches[page.page].pageHandler.setMatchDescriptorSelected(selectedMatch.index, true);
                            }
                        } else {
                            polling.push(page);
                        }
                    }
                }
            }, 500);
        }
    });

    IDRViewer.on("search", data => {
        clearSelectedMatch();
        matches = data.results.reduce((acc, result) => {
            if (acc.hasOwnProperty(result.page)) acc[result.page].count++;
            else acc[result.page] = {
                count: 1,
                pageHandler: null
            };
            return acc;
        }, {});

        // Debouncing, this will wait 300ms before performing a search and reset the timer every time a character is input to prevent lag while the user is typing a search string
        clearTimeout(timer);
        timer = setTimeout(function() {
            searchSettings = {
                "searchTerm": data.searchTerm,
                "matchCase": data.settings.matchCase,
                "limitOnePerPage": data.settings.limitOnePerPage
            };

            let pages = document.getElementsByClassName("page");

            for (let i = 0; i < pages.length; i++) {
                let page = pages[i];
                if (page.innerHTML) {
                    findSearchTermsInPage(page);
                }
            }
        }, 300);
    });

    function getEmptyMatchDescriber() {
        return {
            "beginning": 0,
            "end": 0,
            "elements": []
        };
    }

    /**
     * This function handles both HTML and SVG
     * There are a few differences that have been separated out using isHTML() and isSVG()
     * @param page The page element to search
     */
    function findSearchTermsInPage(page) {
        const handler = pageHandler(page);

        let textElements = handler.getTextElements();

        if (!textElements) {
            // no text content (I.E. unloaded pages, pages without text, pages that haven't rendered yet)
            return;
        }

        handler.clearHighlights();

        if (!searchSettings || !searchSettings.searchTerm || !matches.hasOwnProperty(getPageNumberFromId(page.id))) {
            return;
        }

        // If the file is a svg and the svg hasn't loaded then add it to the polling list
        if (pageHandler === SVGPageHandler && textElements[0].getComputedTextLength() === 0) {
            if (!polling.includes(page)) polling.push(page);
            return;
        }

        // Copy search terms, since we're gonna manipulate them
        const search = JSON.parse(JSON.stringify(searchSettings));

        let searchOffset = 0;

        let matchDescriber = getEmptyMatchDescriber();

        search.searchTerm = handler.processSearchTerm(search.searchTerm);

        // Search for content that matches the search term
        for (const textElement of textElements) {
            const mappings = textElement.dataset.mappings !== undefined ? JSON.parse(textElement.dataset.mappings) : undefined;
            let rawText = handler.getRawText(textElement);
            let text;
            const differences = [];

            if (mappings) {
                // Track special character (&gt;, &ls;, etc) positions as if they weren't expanded as so we can adjust the ligature indexes
                const specials = [...rawText.matchAll(/&(?:gt|lt|amp);/gi)].reduce((acc, match) => {
                    acc.push({
                        index: match.index - acc.reduce((acc2, value) => acc2 + value.offset, 0),
                        offset: match[0].length - 1
                    });

                    return acc;
                }, []);

                for (const mapping of mappings) {
                    // Finds the index of the ligature based off it's stored position before expansion, plus the offset
                    // from all the previous ligatures, and plus the offsets of all the special characters upto the
                    // stored index
                    const index = mapping[0] + differences.reduce((acc, value) => acc + value.offset, 0) +
                        specials.filter(value => value.index < mapping[0])
                            .reduce((acc, value) => acc + value.offset, 0);
                    const ligature = mapping[1];

                    rawText = rawText.substring(0, index) + ligature + rawText.substring(index + 1);

                    differences.push({
                        index: index,
                        offset: ligature.length - 1
                    });
                }
            }

            if (!search.matchCase) {
                text = rawText.toUpperCase();

                // Re-uppercase in case the sanitization ruined it
                search.searchTerm = search.searchTerm.toUpperCase();

                if (text.length !== rawText.length) {
                    console.error("Failed to handle a ligature");
                }
            } else {
                text = rawText;
            }

            let i = 0;
            let elementOffset;
            let insideSpecial = false;

            // Loop until we reach the end of the element's text to catch all the occurrences
            while (i < text.length) {
                for (elementOffset = 0; (i + elementOffset) < text.length && searchOffset < search.searchTerm.length;) {
                    // Store whether we're inside a special character (starts with &, ends with ;, E.G. &amp;
                    if (text.charAt(i + elementOffset) === "&") insideSpecial = true;
                    else if (insideSpecial && text.charAt(i + elementOffset) === ";") insideSpecial = false;

                    if (text.charAt(i + elementOffset) === search.searchTerm.charAt(searchOffset)) {
                        elementOffset++;
                        searchOffset++;
                    } else {
                        elementOffset = 0;
                        searchOffset = 0;

                        if (!matchDescriber.elements.length) i++;

                        matchDescriber = getEmptyMatchDescriber();
                    }
                }

                if (elementOffset > 0) {
                    // We never want to highlight part of an escape character, that will break the escape, so if we're in the middle of an escape character
                    // we need to avoid saving the match describer
                    // (This is only necessary for short character strings (up to 4 characters long))
                    if (insideSpecial) {
                        matchDescriber = getEmptyMatchDescriber();
                        searchOffset = 0;
                        i++;
                    } else {
                        if (!matchDescriber.elements.length) {
                            matchDescriber.beginning = i;

                            for (const difference of differences) {
                                if (matchDescriber.beginning > difference.index) {
                                    if (matchDescriber.beginning < difference.index + difference.offset) {
                                        matchDescriber.beginning -= (matchDescriber.beginning - difference.index);
                                    } else {
                                        matchDescriber.beginning -= difference.offset;
                                    }
                                } else {
                                    break;
                                }
                            }
                        }

                        matchDescriber.elements.push(textElement);

                        if (searchOffset === search.searchTerm.length) {
                            matchDescriber.end = i + elementOffset;

                            for (const difference of differences) {
                                if (matchDescriber.end > difference.index) {
                                    if (matchDescriber.end < difference.index + difference.offset) {
                                        matchDescriber.end -= (matchDescriber.end - difference.index);
                                    } else {
                                        matchDescriber.end -= difference.offset;
                                    }
                                } else {
                                    break;
                                }
                            }

                            handler.storeDescriber(matchDescriber);
                            searchOffset = 0;
                            matchDescriber = getEmptyMatchDescriber();
                        }

                        i += elementOffset;
                    }
                }
            }
        }

        handler.highlightResults();
        matches[getPageNumberFromId(page.id)].pageHandler = handler;
    }

    // Highlight Selection
    IDRViewer.on("searchresultselected", data => {
        clearSelectedMatch();

        selectedMatch = {page:data.result.page, index:data.result.index};
        const match = matches[data.result.page];

        if (match === undefined) {
            console.error("That page doesn't have any results on it");
            return;
        } else if (match.count <= data.result.index) {
            console.error("There aren't that many results on that page");
            return;
        } else if (!match.pageHandler) {
            return;
        }

        match.pageHandler.setMatchDescriptorSelected(data.result.index, true);

        match.pageHandler.scrollIntoView(data.result.index);
    });

    function clearSelectedMatch() {
        if (Object.keys(matches) && selectedMatch) {
            const match = matches[selectedMatch.page];
            if (match)
                match.pageHandler.setMatchDescriptorSelected(selectedMatch.index, false);
        }

        selectedMatch = null;
    }

    // Page Handler Utility Functions
    function makeIndexString(index) {
        return Number(index).toString(16).padStart(6, "0");
    }

    // Page Handlers
    let SVGPageHandler = function(page) {
        const svgns = "http://www.w3.org/2000/svg";

        let svgPageHandler = {
            searchResults: []
        };

        function getHighlightBounds(x, y, width, height, transform, refElement) {
            return {
                x: x,
                y: y,
                width: width,
                height: height,
                transform: transform,
                refElement: refElement
            };
        }

        function createHighlightFromBounds(highlightBounds, index) {
            return createHighlightRect(highlightBounds.x, highlightBounds.y, highlightBounds.width, highlightBounds.height, highlightBounds.transform, index);
        }

        function createHighlightRect(x, y, width, height, transform, index) {
            const rect = document.createElementNS(svgns, "rect");
            rect.setAttributeNS(null, "x", x);
            rect.setAttributeNS(null, "y", y);
            rect.setAttributeNS(null, "width", width);
            rect.setAttributeNS(null, "height", height);
            rect.setAttributeNS(null, "fill", "yellow");
            rect.setAttributeNS(null, "class", "highlight");
            rect.setAttributeNS(null, "data-index", makeIndexString(index));
            if (transform) rect.setAttributeNS(null, "transform", transform);
            return rect;
        }

        function calculateHighlights(matchDescriber) {
            const highlightBounds = [];

            if (matchDescriber.elements.length === 1) {
                let element = matchDescriber.elements[0];

                let startExtent = element.getExtentOfChar(matchDescriber.beginning);
                let endExtent = element.getExtentOfChar(matchDescriber.end - 1);

                highlightBounds.push(getHighlightBounds(startExtent.x, startExtent.y, endExtent.x + endExtent.width - startExtent.x, endExtent.y + endExtent.height - startExtent.y, element.getAttribute("transform"), element));
            } else {
                let element = matchDescriber.elements[0];

                let startExtent = element.getExtentOfChar(matchDescriber.beginning);
                let endExtent = element.getExtentOfChar(element.textContent.length - 1);

                highlightBounds.push(getHighlightBounds(startExtent.x, startExtent.y, endExtent.x + endExtent.width - startExtent.x, endExtent.y + endExtent.height - startExtent.y, element.getAttribute("transform"), element));

                for (let i = 1; i < matchDescriber.elements.length - 1; i++) {
                    element = matchDescriber.elements[i];

                    startExtent = element.getBBox();

                    highlightBounds.push(getHighlightBounds(startExtent.x, startExtent.y, startExtent.width, startExtent.height, element.getAttribute("transform"), element));
                }

                element = matchDescriber.elements[matchDescriber.elements.length - 1];

                startExtent = element.getBBox();
                endExtent = element.getExtentOfChar(matchDescriber.end - 1);

                highlightBounds.push(getHighlightBounds(startExtent.x, startExtent.y, endExtent.x + endExtent.width - startExtent.x, endExtent.y + endExtent.height - startExtent.y, element.getAttribute("transform"), element));
            }

            return highlightBounds;
        }

        svgPageHandler.getTextElements = function() {
            let textElements = page.querySelector("object").contentDocument;

            if (textElements) {
                textElements = textElements.querySelectorAll("text");

                if (textElements.length === 0) return undefined;
            }

            return textElements;
        };

        svgPageHandler.clearHighlights = function() {
            // clear out the existing highlights by removing all the shapes that use the highlight class
            let highlighted = [...page.querySelector("object").contentDocument.querySelectorAll(".highlight")];
            while (highlighted.length > 0) {
                let child = highlighted.pop();
                child.parentNode.removeChild(child);
            }
        };

        svgPageHandler.processSearchTerm = function(text) {
            return text;
        };

        svgPageHandler.getRawText = function(textElement) {
            return textElement.textContent;
        };

        svgPageHandler.storeDescriber = function(matchDescriber) {
            svgPageHandler.searchResults = svgPageHandler.searchResults.concat(calculateHighlights(matchDescriber));
        };

        svgPageHandler.highlightResults = function() {
            for (let i = 0; i < svgPageHandler.searchResults.length; i++) {
                const bounds = svgPageHandler.searchResults[i];
                bounds.refElement.parentNode.insertBefore(createHighlightFromBounds(bounds, i), bounds.refElement);
            }
        };

        svgPageHandler.setMatchDescriptorSelected = function(index, selected) {
            const highlights = page.querySelector("object").contentDocument.querySelectorAll("[data-index=\"" + makeIndexString(index) + "\"].highlight");

            for (const highlight of highlights) {
                if (selected) {
                    highlight.classList.add("selected");
                    highlight.style.fill = "orange";
                }
                else {
                    highlight.classList.remove("selected");
                    highlight.style.fill = "";
                }
            }
        };

        svgPageHandler.scrollIntoView = function(index) {
            const highlightedElement = svgPageHandler.searchResults[index].refElement;

            highlightedElement.scrollIntoView({
                block: 'nearest',
                inline: 'start'
            });
        };

        svgPageHandler.getMatchesCount = function() {
            return svgPageHandler.searchResults.length;
        };

        return svgPageHandler;
    };

    let HTMLPageHandler = function(page) {
        let htmlPageHandler = {
            textElements: undefined,
            searchResults: []
        };

        function makeHighlightString(text, index) {
            // 6 hexadecimal numbers should allow us to store about 16,777,216 indices per page
            // We need to know the length of the index to be constant for the sake of the offset function below
            // If we find 6 digits isn't enough, we could change it to 8 for 4,294,967,296 indices per page, or swallow the extra processing cost of parsing the highlight string for the length

            return "<span class=\"highlight\" data-index=\"" + makeIndexString(index) + "\">" + text + "</span>";
        }

        function updateChangedElements(changedElements, element) {
            // The length of the <span class="highlight" data-index="xxxxxx"></span> (not including the text between it)
            const length = 51;
            const changedElement = changedElements.find((item) => item.element === element);

            if (changedElement) {
                changedElement.length += length;
            } else {
                changedElements.push({
                    element: element,
                    length: length
                });
            }
        }

        htmlPageHandler.getTextElements = function() {
            htmlPageHandler.textElements = page.querySelector(".text-container");

            if (htmlPageHandler.textElements) {
                htmlPageHandler.textElements = htmlPageHandler.textElements.children;

                if (htmlPageHandler.textElements.length === 0) return undefined;
            }

            return htmlPageHandler.textElements;
        };

        htmlPageHandler.clearHighlights = function() {
            // Clear out the existing search highlighting by removing all the highlight spans
            for (let i = 0; i < htmlPageHandler.textElements.length; i++) {
                const element = htmlPageHandler.textElements[i];
                element.innerHTML = element.innerHTML.replace(/<span class="highlight(?: selected)?" data-index="[a-fA-F0-9]{6}">|<\/span>/gmi, "");
            }
        };

        htmlPageHandler.processSearchTerm = function(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        htmlPageHandler.getRawText = function(textElement) {
            return textElement.innerHTML;
        };

        htmlPageHandler.storeDescriber = function(matchDescriber) {
            htmlPageHandler.searchResults.push(matchDescriber);
        };

        htmlPageHandler.highlightResults = function() {
            const changedElements = [];

            // Add highlighting to search terms
            for (let i = 0; i < htmlPageHandler.searchResults.length; i++) {
                let describer = htmlPageHandler.searchResults[i];
                if (describer.elements.length === 1) {
                    let element = describer.elements[0];
                    let text = element.innerHTML;

                    let offsetObject;

                    for (let j = 0; j < changedElements.length; j++) {
                        if (changedElements[j].element === element) {
                            offsetObject = changedElements[j];
                            break;
                        }
                    }

                    let elementOffset;
                    if (offsetObject) elementOffset = offsetObject.length;
                    else elementOffset = 0;

                    element.innerHTML = text.substring(0, describer.beginning + elementOffset);

                    let highlightString = makeHighlightString(text.substring(describer.beginning + elementOffset, describer.end + elementOffset), i);
                    element.innerHTML += highlightString;

                    updateChangedElements(changedElements, element, highlightString);

                    element.innerHTML += text.substring(describer.end + elementOffset, text.length);
                } else {
                    let element = describer.elements[0];
                    let text = element.innerHTML;

                    let offsetObject;
                    for (let j = 0; j < changedElements.length; j++) {
                        if (changedElements[j].element === element) {
                            offsetObject = changedElements[j];
                            break;
                        }
                    }

                    let elementOffset;
                    if (offsetObject) elementOffset = offsetObject.length;
                    else elementOffset = 0;

                    element.innerHTML = text.substring(0, describer.beginning + elementOffset);
                    let highlightString = makeHighlightString(text.substring(describer.beginning + elementOffset, text.length), i);
                    element.innerHTML += highlightString;

                    updateChangedElements(changedElements, element, highlightString);

                    for (let j = 1; j < describer.elements.length - 1; j++) {
                        element = describer.elements[j];
                        text = element.innerHTML;
                        element.innerHTML = "";
                        highlightString = makeHighlightString(text, i);
                        element.innerHTML += highlightString;

                        updateChangedElements(changedElements, element, highlightString);
                    }

                    element = describer.elements[describer.elements.length - 1];
                    text = element.innerHTML;

                    element.innerHTML = "";
                    highlightString = makeHighlightString(text.substring(0, describer.end), i);
                    element.innerHTML += highlightString;
                    element.innerHTML += text.substring(describer.end, text.length);

                    updateChangedElements(changedElements, element, highlightString);
                }
            }
        };

        htmlPageHandler.setMatchDescriptorSelected = function(index, selected) {
            const highlights = page.querySelectorAll("[data-index=\"" + makeIndexString(index) + "\"].highlight");

            for (const highlight of highlights) {
                if (selected) highlight.classList.add("selected");
                else highlight.classList.remove("selected");
            }
        };

        htmlPageHandler.scrollIntoView = function(index) {
            const highlightedElement = htmlPageHandler.searchResults[index].elements[0];

            highlightedElement.scrollIntoView({
                block: 'nearest',
                inline: 'start'
            });
        };

        htmlPageHandler.getMatchesCount = function() {
            return htmlPageHandler.searchResults.length;
        };

        return htmlPageHandler;
    };
})();