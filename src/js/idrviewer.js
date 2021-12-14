(function () {
    "use strict";

    var IDR = {
        LAYOUT_PRESENTATION: 'presentation',
        LAYOUT_MAGAZINE: 'magazine',
        LAYOUT_CONTINUOUS: 'continuous',

        SELECT_SELECT: 'select',
        SELECT_PAN: 'pan',

        ZOOM_SPECIFIC: 'specific',
        ZOOM_ACTUALSIZE: 'actualsize',
        ZOOM_FITWIDTH: 'fitwidth',
        ZOOM_FITHEIGHT: 'fitheight',
        ZOOM_FITPAGE: 'fitpage',
        ZOOM_AUTO: 'auto'
    };

    var curPg = 1,
        pgCount = 0,
        pageContainer,
        mainContainer,
        layout,
        bounds,
        pages = [],
        PADDING = 10,
        isSetup = false;

    IDR.setup = function (config) {
        if (!config) {
            config = IDRViewer.config;
        }

        isSetup = true;

        bounds = config.bounds;
        pgCount = config.pagecount;

        // Validate starting page
        if (curPg < 1 || curPg > pgCount) {
            curPg = 1;
        }

        mainContainer = document.getElementById("idrviewer");

        var contain = document.createElement('div');
        contain.style.position = "relative";
        contain.style.display = "inline-block"; // Required for continuous mode when pages larger than browser width
        contain.style.verticalAlign = "middle"; // Fixes Chrome showing scrollbars in presentation/magazine layout
        // contain.style.float = "left"; // Other potential fix for Chrome scrollbars.
        contain.style.minWidth = "100%";
        contain.style.lineHeight = "normal";
        mainContainer.appendChild(contain);

        pageContainer = document.createElement('div');
        pageContainer.id = "contentContainer";
        pageContainer.style.overflow = "hidden";
        pageContainer.style.transform = "translateZ(0)";
        pageContainer.style.padding = (PADDING / 2) + "px";
        contain.appendChild(pageContainer);

        for (var i = 1; i <= pgCount; i++) {
            var page = document.createElement('div');
            page.id = 'page' + i;
            page.setAttribute('style', 'width: ' + bounds[i - 1][0] + 'px; height: ' + bounds[i - 1][1] + 'px;');
            page.className = "page";
            pageContainer.appendChild(page);
            pages[i] = page;
        }

        SelectionManager.setup();

        LoadManager.setup();

        PageManager.setup(config.pageType, config.url);

        LayoutManager.setup(!!config.isR2L);

        ZoomManager.setup();

        layout.goToPage(curPg);
        LoadManager.setPage(curPg, true);

        var data = {
            selectMode: SelectionManager.currentSelectMode,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            layout: layout.toString(),
            availableLayouts: LayoutManager.getAvailableLayouts(),
            isFirstPage: curPg === 1,
            isLastPage: layout.isLastPage(curPg)
        };
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                data[prop] = config[prop];
            }
        }
        data.page = curPg;
        IDR.fire('ready', data);
    };

    var PageManager = (function() {
        var exports = {},
            fontsSheet,
            isSharedCssAppended = false,
            fontList = [],
            isSVG,
            isSVGZ,
            isLocal = location.protocol === "file:",
            URL = "";

        exports.setup = function(pageType, url) {
            isSVGZ = pageType === "svgz";
            isSVG = isSVGZ || pageType === "svg";

            if (url) {
                URL = url;
            }

            if (isLocal && !isSVG) {
                console.log("Cannot load pages using AJAX over the file:// protocol. Falling back to iframes (some features may not be available).");
            }

            var fontStyleElement = document.createElement('style');
            fontStyleElement.setAttribute('type', 'text/css');
            document.head.appendChild(fontStyleElement);
            fontsSheet = fontStyleElement.sheet;

            if (isSVG) {
                window.addEventListener('mousedown', function (event) {
                    if (event.button === 0) {
                        clearSelectionAll(window);
                    }
                });
            }
        };

        exports.clearSelection = function() {
            if (isSVG) {
                clearSelectionAll(window);
            } else {
                clearSelection(window);
            }
        };

        var clearSelection = function(win) {
            try {
                if (win.getSelection) {
                    if (win.getSelection().empty) {  // Chrome / Edge
                        win.getSelection().empty();
                    } else if (win.getSelection().removeAllRanges) {  // Firefox / IE 11
                        win.getSelection().removeAllRanges();
                    }
                } else if (win.document.selection) {  // IE 11 does not use, maybe older versions do?
                    win.document.selection.empty();   // Note: This might break if used as svg's pass document as argument
                }                                     // rather than window.
            } catch (ignore) {}
        };

        var clearSelectionAll = function(win) {
            try {
                clearSelection(win);
                for (var i = 1; i <= pgCount; i++) {
                    if (LoadManager.isVisible(i)) {
                        clearSelection(pages[i].firstChild.contentDocument);
                    }
                }
            } catch (ignore) {}
        };

        var iframeLoad = function(page, callback) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'page-inner');
            iframe.setAttribute('src', URL + page + '.html');
            iframe.setAttribute('style', 'width: ' + bounds[page - 1][0] + 'px; height: ' + bounds[page - 1][1] + 'px; position: absolute; border: 0;');
            iframe.onload = callback;
            pages[page].appendChild(iframe);
        };

        var svgLoad = function(page, callback) {
            var svgLoadHandler = function() {
                this.removeEventListener('load', svgLoadHandler);
                try {
                    this.contentDocument.addEventListener('mousedown', function (event) {
                        if (event.button === 0) {
                            clearSelectionAll(window);
                        }
                    });
                } catch (ignore) {}
                callback();
            };

            var svgElement = document.createElement('object');
            svgElement.setAttribute('width', '' + bounds[page - 1][0]);
            svgElement.setAttribute('height', '' + bounds[page - 1][1]);
            svgElement.setAttribute('data', URL + page + (isSVGZ ? '.svgz' : '.svg'));
            svgElement.setAttribute('type', 'image/svg+xml');
            svgElement.setAttribute('class', 'page-inner');
            svgElement.setAttribute('style', 'position: absolute');
            svgElement.addEventListener('load', svgLoadHandler);
            pages[page].appendChild(svgElement);
        };

        var handleLoad = function(html, page, callback) {
            var newDoc = document.createElement('div');
            newDoc.innerHTML = html;
            var pageElement = newDoc.querySelector("#p" + page);
            pageElement.style.margin = '0';
            pageElement.style.overflow = 'hidden';
            pageElement.style.position = 'absolute';

            var setLoaded = function() {
                if (this) {
                    this.removeEventListener('load', setLoaded);
                }
                callback();
            };

            var background = pageElement.querySelector('#pdf' + page);
            var externalBackground = background.getAttribute("data") || background.getAttribute("src");
            if (externalBackground) {
                background.addEventListener('load', setLoaded);
            }

            if (URL) {
                var currentSrc = background.getAttribute("data"); // NS_ERROR_UNEXPECTED (before appending)
                if (currentSrc) {
                    background.setAttribute("data", URL + currentSrc);
                } else {
                    currentSrc = background.getAttribute("src");
                    if (currentSrc && currentSrc.indexOf("base64") === -1) {
                        background.setAttribute("src", URL + currentSrc);
                    }
                }
            }

            var fontFaceElement = pageElement.querySelector('#fonts' + page);
            if (fontFaceElement) {
                var fontFacesString = fontFaceElement.innerHTML;
                fontFaceElement.parentNode.removeChild(fontFaceElement);

                fontFacesString.match(/@font-face {[\s\S]*?}/g).forEach(function(fontFace) {
                    if (fontList.indexOf(fontFace) === -1) {
                        fontList.push(fontFace);
                        // Replace does not catch base64 fonts because they do not include the quote
                        fontsSheet.insertRule(fontFace.replace("url(\"", "url(\"" + URL), fontsSheet.cssRules.length);
                    }
                });
            }

            var sharedCssElement = pageElement.querySelector(".shared-css");
            if (sharedCssElement) {
                sharedCssElement.parentNode.removeChild(sharedCssElement);
                if (!isSharedCssAppended) {
                    document.head.appendChild(sharedCssElement);
                    isSharedCssAppended = true;
                }
            }

            ClassHelper.addClass(pageElement, 'page-inner');

            pages[page].appendChild(pageElement);

            if (!externalBackground) {
                setLoaded();
            }
        };

        var ajaxLoad = function(page, callback) {
            var request = new XMLHttpRequest();
            request.open('GET', URL + page + ".html", true);
            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    handleLoad(request.responseText, page, callback);
                } else {
                    iframeLoad(page, callback); // Fall back to iframe
                }
            };
            request.onerror = function() {
                iframeLoad(page, callback); // Fall back to iframe
            };
            request.send();
        };

        exports.show = function(page) {
            pages[page].firstChild.style.display = "block";
        };

        exports.hide = function(page) {
            pages[page].firstChild.style.display = "none";
        };

        exports.load = function(page, callback) {
            if (isSVG) {
                svgLoad(page, callback);
            } else if (isLocal) {
                iframeLoad(page, callback);
            } else {
                ajaxLoad(page, callback);
            }
        };

        exports.unload = function(page) {
            pages[page].removeChild(pages[page].firstChild);
        };

        return exports;
    })();

    var LoadManager = (function() {
        var PageStates = {
            LOADING: 'loading',
            HIDDEN: 'hidden',
            UNLOADED: 'unloaded',
            LOADED: 'loaded'
        };

        var exports = { },
            page,
            timer,
            DELAY = 500,
            MAX_LOADED = 50,
            MAX_VISIBLE = 20,
            MAX_SIMULTANEOUS = 2,
            numLoading = 0,
            numLoaded = 0,
            numHidden = 0,
            numUnloaded,
            states = [];

        exports.setup = function() {
            numUnloaded = pgCount;

            for (var i = 1; i <= pgCount; i++) {
                states[i] = PageStates.UNLOADED; // Initialise states to unloaded
                pages[i].dataset.state = PageStates.UNLOADED;
            }
        };

        var setState = function(page, state) {
            updateStateCounts(states[page], state);
            states[page] = state;
            pages[page].dataset.state = state;
        };

        var updateStateCounts = function(before, after) {
            switch(before) {
                case PageStates.LOADING:
                    numLoading--;
                    break;
                case PageStates.LOADED:
                    numLoaded--;
                    break;
                case PageStates.HIDDEN:
                    numHidden--;
                    break;
                case PageStates.UNLOADED:
                    numUnloaded--;
                    break;
            }
            switch(after) {
                case PageStates.LOADING:
                    numLoading++;
                    break;
                case PageStates.LOADED:
                    numLoaded++;
                    break;
                case PageStates.HIDDEN:
                    numHidden++;
                    break;
                case PageStates.UNLOADED:
                    numUnloaded++;
                    break;
            }
        };

        var isVisible = function(page) {
            return states[page] === PageStates.LOADED;
        };

        var isLoaded = function(page) {
            return states[page] === PageStates.LOADED || states[page] === PageStates.HIDDEN;
        };

        var hide = function(page) {
            if (states[page] === PageStates.LOADED) {
                setState(page, PageStates.HIDDEN);
                PageManager.hide(page);
            }
        };

        var load = function(page) {
            if (states[page] === PageStates.HIDDEN) {
                setState(page, PageStates.LOADED);
                PageManager.show(page);
            }
            if (states[page] === PageStates.UNLOADED) {
                setState(page, PageStates.LOADING);

                var callback = function() {
                    setState(page, PageStates.LOADED);
                    IDR.fire('pageload', {
                        page: page
                    });
                };

                PageManager.load(page, callback);
            }
        };

        var unload = function(page) {
            if (states[page] === PageStates.LOADED || states[page] === PageStates.HIDDEN) {
                setState(page, PageStates.UNLOADED);
                PageManager.unload(page);
                IDR.fire('pageunload', {
                    page: page
                });
            }
        };

        var process = function() {
            load(page); // Always load the current page

            if (numLoading < MAX_SIMULTANEOUS) {
                for (var i = 1; i < MAX_VISIBLE / 2; i++) {
                    if (checkBounds(page - i)) {
                        if (!isVisible(page - i)) {
                            load(page - i);
                        }
                    }
                    if (numLoading === MAX_SIMULTANEOUS) {
                        break;
                    }
                    if (checkBounds(page + i)) {
                        if (!isVisible(page + i)) {
                            load(page + i);
                        }
                    }
                    if (numLoading === MAX_SIMULTANEOUS) {
                        break;
                    }
                }
            }

            // Hide pages
            var pointerA = 1;
            var pointerB = pgCount;
            while (numLoaded + numLoading > MAX_VISIBLE) {
                // Using the current page as the midpoint, start at the extremities and gradually work inwards
                // hiding pages until number of pages loaded is within tolerance.
                if (page - pointerA > pointerB - page) {
                    if (isVisible(pointerA)) {
                        hide(pointerA);
                    }
                    pointerA++;
                } else {
                    if (isVisible(pointerB)) {
                        hide(pointerB);
                    }
                    pointerB--;
                }
            }

            // Unload pages
            pointerA = 1;
            pointerB = pgCount;
            while ((pgCount - numUnloaded) > MAX_LOADED) {
                // Using the current page as the midpoint, start at the extremities and gradually work inwards
                // unloading pages until number of pages loaded is within tolerance.
                if (page - pointerA > pointerB - page) {
                    if (isLoaded(pointerA)) {
                        unload(pointerA);
                    }
                    pointerA++;
                } else {
                    if (isLoaded(pointerB)) {
                        unload(pointerB);
                    }
                    pointerB--;
                }
            }

            timer = setTimeout(process, DELAY);
        };

        var checkBounds = function(page) {
            return page >= 1 && page <= pgCount;
        };

        exports.setPage = function(pg, forceLoad) {
            page = pg;
            if (forceLoad) {
                load(pg);
            }
            clearTimeout(timer);
            timer = setTimeout(process, DELAY);
        };

        exports.stopLoading = function() {
            clearTimeout(timer);
            timer = setTimeout(process, DELAY);
        };

        exports.hide = hide;

        exports.isVisible = isVisible;

        return exports;
    })();

    var LayoutManager = (function() {
        var exports = { },
            layouts = {},
            defaultLayout,
            allPagesSameSize = true,
            isDirectionR2L = false;

        exports.setup = function(isR2L) {
            isDirectionR2L = isR2L;

            for (var i = 0; i < pgCount; i++) {
                if (bounds[i][0] !== bounds[0][0] || bounds[i][1] !== bounds[0][1]) {
                    allPagesSameSize = false;
                    break;
                }
            }

            layout = layouts[defaultLayout] || layouts[IDRViewer.LAYOUT_CONTINUOUS];
            layout.setup(allPagesSameSize, isDirectionR2L);

            ClassHelper.addClass(mainContainer, 'layout-' + layout.toString());

            if (isDirectionR2L) {
                ClassHelper.addClass(mainContainer, "isR2L");
            }
        };

        exports.setLayout = function(name) {
            layout.unload();
            ClassHelper.removeClass(mainContainer, 'layout-' + layout.toString());

            layout = layouts[name];

            layout.setup(allPagesSameSize, isDirectionR2L);
            ClassHelper.addClass(mainContainer, 'layout-' + layout.toString());

            ZoomManager.updateZoom(IDRViewer.ZOOM_AUTO);
            layout.goToPage(curPg);

            IDR.fire('layoutchange', {
                layout: name
            });
        };

        exports.addLayout = function(name, layout) {
            layouts[name] = layout;
        };

        exports.setDefault = function(layout) {
            defaultLayout = layout;
        };

        exports.getAvailableLayouts = function() {
            return Object.keys(layouts);
        };

        exports.updatePage = function(page) {
            if (curPg != page) {
                curPg = page;
                LoadManager.setPage(page);

                IDR.fire('pagechange', {
                    page : curPg,
                    pagecount: pgCount,
                    isFirstPage: curPg === 1,
                    isLastPage: layout.isLastPage(page)
                });
            }
        };

        return exports;
    })();

    LayoutManager.addLayout(IDR.LAYOUT_PRESENTATION, (function() {
        var Presentation = { },
            allPagesSameSize;

        Presentation.setup = function(sameSizePages) {
            allPagesSameSize = sameSizePages;
        };

        Presentation.unload = function() {
            /*jshint loopfunc: true */
            for (var i = 1; i <= pgCount; i++) {
                pages[i].style.marginLeft = "";
                pages[i].style.marginTop = "";

                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');
            }

            pageContainer.style.width = "";
            pageContainer.style.height = "";
        };

        Presentation.goToPage = function(pg) {
            LayoutManager.updatePage(pg);

            if (!allPagesSameSize) {
                ZoomManager.updateZoom();
            }

            mainContainer.scrollTop = 0;

            updateClasses(pg);

            Presentation.updateLayout();
        };

        Presentation.getVisiblePages = function() {
            return [curPg];
        };

        var updateClasses = function(pg) {
            /*jshint loopfunc: true */
            for (var i = 1; i <= pgCount; i++) {
                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');

                if (i < pg) {
                    ClassHelper.addClass(pages[i], 'before');
                } else if (i > pg) {
                    ClassHelper.addClass(pages[i], 'after');
                }
            }
            ClassHelper.addClass(pages[pg], 'current');

            if (pg - 1 >= 1) {
                ClassHelper.addClass(pages[pg - 1], 'prev');
            }
            if (pg + 1 <= pgCount) {
                ClassHelper.addClass(pages[pg + 1], 'next');
            }
        };

        Presentation.updateLayout = function() {
            var zoom = ZoomManager.getZoom();
            var pageWidth = Math.floor(bounds[curPg - 1][0] * zoom);
            var marginLeft = 0;
            var viewPortWidth = (mainContainer.clientWidth - PADDING);
            if (viewPortWidth > pageWidth) {
                marginLeft = (viewPortWidth - pageWidth) / 2;
            } else {
                viewPortWidth = pageWidth;
            }

            var pageHeight = Math.floor(bounds[curPg - 1][1] * zoom);
            var marginTop = 0;
            var viewPortHeight = (mainContainer.clientHeight - PADDING);
            if (viewPortHeight > pageHeight) {
                marginTop = (viewPortHeight - pageHeight) / 2;
            } else {
                viewPortHeight = pageHeight;
            }

            pageContainer.style.width = viewPortWidth + "px";
            pageContainer.style.height = viewPortHeight + "px";

            // Will be wrong if not all pages same size
            for (var i = 1; i <= pgCount; i++) {
                pages[i].style.marginLeft = marginLeft + "px";
                pages[i].style.marginTop = marginTop + "px";
            }
        };

        Presentation.isLastPage = function(page) {
            return page === pgCount;
        };

        Presentation.getZoomBounds = function() {
            return {
                width: bounds[curPg - 1][0],
                height: bounds[curPg - 1][1]
            };
        };

        Presentation.getAutoZoom = function(fitWidth, fitHeight) {
            return Math.min(fitWidth, fitHeight);
        };

        Presentation.next = function() {
            IDR.goToPage(curPg + 1);
        };

        Presentation.prev = function() {
            IDR.goToPage(curPg - 1);
        };

        Presentation.toString = function() {
            return IDRViewer.LAYOUT_PRESENTATION;
        };

        return Presentation;
    })());

    LayoutManager.addLayout(IDR.LAYOUT_MAGAZINE, (function() {
        var Magazine = { },
            allPagesSameSize,
            isDirectionR2L;

        function isDoubleSpread(page) {
            return page > 1 && page < pgCount;
        }

        Magazine.setup = function(sameSizePages, isR2L) {
            allPagesSameSize = sameSizePages;
            isDirectionR2L = isR2L;
        };

        Magazine.unload = function() {
            /*jshint loopfunc: true */
            for (var i = 1; i <= pgCount; i++) {
                pages[i].style.marginLeft = "";
                pages[i].style.marginTop = "";

                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');
            }
            pageContainer.style.width = "";
            pageContainer.style.height = "";
        };

        Magazine.goToPage = function(pg) {
            if (pg !== 1 && pg % 2 !== 0) {
                pg -= 1; // Normalise to left page
            }

            LayoutManager.updatePage(pg);

            if (!allPagesSameSize) {
                ZoomManager.updateZoom();
            }

            updateClasses(pg);

            Magazine.updateLayout();
        };

        Magazine.getVisiblePages = function() {
            var visiblePages = [curPg];
            if (isDoubleSpread(curPg)) {
                visiblePages.push(curPg + 1);
            }
            return visiblePages;
        };

        var updateClasses = function(pg) {
            /*jshint loopfunc: true */
            for (var i = 1; i <= pgCount; i++) {
                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');
            }

            ClassHelper.addClass(pages[pg], 'current');
            if (isDoubleSpread(pg)) {
                ClassHelper.addClass(pages[pg + 1], 'current');
            }

            if (pg == 1) {
                pg = 0;
            }

            if (pg + 2 <= pgCount) {
                ClassHelper.addClass(pages[pg + 2], 'next');
                if (pg + 3 <= pgCount) {
                    ClassHelper.addClass(pages[pg + 3], 'next');
                }
            }

            if (pg - 1 > 0) {
                ClassHelper.addClass(pages[pg - 1], 'prev');
                if (pg - 2 > 0) {
                    ClassHelper.addClass(pages[pg - 2], 'prev');
                }
            }

            if (pg + 4 <= pgCount) {
                for (i = pg + 4; i <= pgCount; i++) {
                    ClassHelper.addClass(pages[i], 'after');
                }
            }
            if (pg - 3 > 0) {
                for (i = pg - 3; i > 0; i--) {
                    ClassHelper.addClass(pages[i], 'before');
                }
            }
        };

        Magazine.updateLayout = function() {
            var isTwoPages = isDoubleSpread(curPg);
            var zoom = ZoomManager.getZoom();

            // Calculate left margins & viewPortWidth
            var pageWidthA = Math.floor(bounds[curPg - 1][0] * zoom);
            var pageWidthB = isTwoPages ? Math.floor(bounds[curPg][0] * zoom) : pageWidthA;
            var pageWidth = 2 * Math.max(pageWidthA, pageWidthB);
            var viewPortWidth = Math.max(pageWidth, mainContainer.clientWidth - PADDING);

            var centerX = Math.floor(viewPortWidth / 2);
            var marginLeftA = centerX;
            var marginLeftB = centerX;

            if (isDirectionR2L) {
                marginLeftB -= pageWidthB; // B|A
            } else {
                marginLeftA -= pageWidthA; // A|B
            }

            // Calculate top margins & viewPortHeight
            var pageHeightA = Math.floor(bounds[curPg - 1][1] * zoom);
            var pageHeightB = isTwoPages ? Math.floor(bounds[curPg][1] * zoom) : pageHeightA;
            var viewPortHeight = Math.max(pageHeightA, pageHeightB, mainContainer.clientHeight - PADDING);
            var marginTopA = Math.floor((viewPortHeight - (isDirectionR2L ? pageHeightB : pageHeightA)) / 2);
            var marginTopB = Math.floor((viewPortHeight - (isDirectionR2L ? pageHeightA : pageHeightB)) / 2);

            // Apply viewport sizes & margins
            // We need to adjust all pages because other pages may become visible if transitions are used and the
            // viewport size changes (which would adjust the margins).
            // If pages are not all the same size then pages will be visible anyway if transitions used because pages
            // can't be hidden behind other pages if bounds are different.
            pageContainer.style.width = viewPortWidth + 'px';
            pageContainer.style.height = viewPortHeight + 'px';

            pages[1].style.marginLeft = marginLeftB + "px";
            pages[1].style.marginTop = marginTopB + "px";

            for (var i = 2; i <= pgCount; i += 2) {
                pages[i].style.marginLeft = marginLeftA + "px";
                pages[i].style.marginTop = marginTopA + "px";
                if (i < pgCount) {
                    pages[i + 1].style.marginLeft = marginLeftB + "px";
                    pages[i + 1].style.marginTop = marginTopB + "px";
                }
            }
        };

        Magazine.isLastPage = function(page) {
            return page + (page == 1 ? 1 : 2) > pgCount;
        };

        Magazine.getZoomBounds = function() {
            var isTwoPages = isDoubleSpread(curPg);
            var pageWidthA = Math.floor(bounds[curPg - 1][0]);
            var pageWidthB = isTwoPages ? Math.floor(bounds[curPg][0]) : 0;
            var pageHeightA = Math.floor(bounds[curPg - 1][1]);
            var pageHeightB = isTwoPages ? Math.floor(bounds[curPg][1]) : 0;
            return {
                width: 2 * Math.max(pageWidthA, pageWidthB),
                height: Math.max(pageHeightA, pageHeightB)
            };
        };

        Magazine.getAutoZoom = function(fitWidth, fitHeight) {
            return Math.min(fitWidth, fitHeight);
        };

        Magazine.next = function() {
            IDR.goToPage(curPg + (curPg == 1 ? 1 : 2));
        };

        Magazine.prev = function() {
            IDR.goToPage(curPg - 1);
        };

        Magazine.toString = function() {
            return IDRViewer.LAYOUT_MAGAZINE;
        };

        return Magazine;
    })());

    LayoutManager.addLayout(IDR.LAYOUT_CONTINUOUS, (function() {
        var Continuous = { },
            largestWidth = 0,
            largestHeight = 0,
            visiblePages = [];

        Continuous.setup = function() {
            mainContainer.addEventListener('scroll', scrollEvent);

            for (var i = 0; i < pgCount; i++) {
                if (bounds[i][0] > largestWidth) {
                    largestWidth = bounds[i][0];
                }
                if (bounds[i][1] > largestHeight) {
                    largestHeight = bounds[i][1];
                }
            }
        };

        Continuous.unload = function() {
            mainContainer.removeEventListener('scroll', scrollEvent);
        };

        var scrollEvent = function() {
            LoadManager.stopLoading();
            scrollUpdate();
        };

        var scrollUpdate = function() {
            var i, y;

            if (pages[1].getBoundingClientRect().top > 0) {
                LayoutManager.updatePage(1);
            } else {
                for (i = 1; i <= pgCount; i++) {
                    var bounds = pages[i].getBoundingClientRect();
                    y = bounds.top;
                    var height = bounds.bottom - bounds.top;

                    if (y <= height*0.25 && y > -height*0.5) {
                        LayoutManager.updatePage(i);
                        break;
                    }
                }
            }
            setVisiblePages();
        };

        var setVisiblePages = function() {
            visiblePages = [curPg];
            var i, bounds, viewPortHeight = mainContainer.clientHeight;

            var isPageVisible = function(page) {
                bounds = pages[page].getBoundingClientRect();
                return bounds.bottom > 0 && bounds.top < viewPortHeight;
            };

            for (i = curPg - 1; i >= 1 && isPageVisible(i); i--) {
                visiblePages.push(i);
            }
            for (i = curPg + 1; i <= pgCount && isPageVisible(i); i++) {
                visiblePages.push(i);
            }
        };

        Continuous.goToPage = function(pg, location) {
            var offset = 0;

            if (location) {
                var locationArr = location.split(" ");
                switch(locationArr[0]) {
                    case "XYZ":
                        offset = Number(locationArr[2]);
                        break;
                    case "FitH":
                        offset = Number(locationArr[1]);
                        break;
                    case "FitR":
                        offset = Number(locationArr[4]);
                        break;
                    case "FitBH":
                        offset = Number(locationArr[1]);
                        break;
                }
                if (isNaN(offset) || offset < 0 || offset > bounds[pg - 1][1]) {
                    offset = 0;
                }
                if (offset !== 0) {
                    offset = bounds[pg - 1][1] - offset;
                }
            }

            var zoom = ZoomManager.getZoom();
            mainContainer.scrollTop = pages[pg].offsetTop - (PADDING / 2) + (offset * zoom);
            LayoutManager.updatePage(pg);
            setVisiblePages();
        };

        Continuous.getVisiblePages = function() {
            return visiblePages;
        };

        Continuous.updateLayout = function() { };

        Continuous.isLastPage = function(page) {
            return page === pgCount;
        };

        Continuous.getZoomBounds = function() {
            return {
                width: largestWidth,
                height: largestHeight
            };
        };

        Continuous.getAutoZoom = function(fitWidth) {
            if (Continuous.getZoomBounds().width > mainContainer.clientWidth - PADDING) {
                return fitWidth;
            } else {
                return 1;
            }
        };

        Continuous.next = function() {
            IDR.goToPage(curPg + 1);
        };

        Continuous.prev = function() {
            IDR.goToPage(curPg - 1);
        };

        Continuous.toString = function() {
            return IDRViewer.LAYOUT_CONTINUOUS;
        };

        return Continuous;
    })());

    /**
     * @name window.chrome
     */
    /**
     * @name InstallTrigger
     */
    var SelectionManager = (function() {
        var Selection = { },
            mouseX,
            mouseY,
            isMouseDown = false,
            defaultMode,
            overlay;

        Selection.setup = function() {
            overlay = document.createElement('div');
            overlay.id = 'overlay';
            pageContainer.parentNode.insertBefore(overlay, pageContainer);

            // Validate defaultMode
            switch (defaultMode) {
                case IDRViewer.SELECT_PAN:
                case IDRViewer.SELECT_SELECT:
                    break; // Allow PAN and SELECT.
                default:
                    defaultMode = IDRViewer.SELECT_SELECT; // Set fallback/default value
            }

            this.currentSelectMode = defaultMode;

            if (this.currentSelectMode == IDR.SELECT_SELECT) {
                Selection.enableTextSelection();
            } else {
                Selection.enablePanning();
            }
        };

        Selection.enableTextSelection = function() {
            this.currentSelectMode = IDR.SELECT_SELECT;
            ClassHelper.removeClass(overlay, "panning");

            overlay.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
            overlay.removeEventListener("mousemove", handleMouseMove);
        };

        var handleMouseDown = function(e) {
            e = e || window.event;
            ClassHelper.addClass(overlay, "mousedown");
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseDown = true;
            return false;
        };

        var handleMouseUp = function() {
            ClassHelper.removeClass(overlay, "mousedown");
            isMouseDown = false;
        };

        var handleMouseMove = function(e) {
            if (isMouseDown) {
                e = e || window.event;
                mainContainer.scrollLeft = mainContainer.scrollLeft + mouseX - e.clientX;
                mainContainer.scrollTop = mainContainer.scrollTop + mouseY - e.clientY;
                mouseX = e.clientX;
                mouseY = e.clientY;
                return false;
            }
        };

        Selection.enablePanning = function() {
            this.currentSelectMode = IDR.SELECT_PAN;
            PageManager.clearSelection();

            ClassHelper.addClass(overlay, "panning");

            overlay.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("mouseup", handleMouseUp);
            overlay.addEventListener("mousemove", handleMouseMove);
        };

        Selection.setDefaultMode = function(mode) {
            defaultMode = mode;
        };

        return Selection;
    })();


    IDR.setSelectMode = function(type) {
        if (isSetup) {
            if (type == IDR.SELECT_SELECT) {
                SelectionManager.enableTextSelection();
            } else {
                SelectionManager.enablePanning();
            }

            IDR.fire('selectchange', {
                type: type
            });
        } else {
            SelectionManager.setDefaultMode(type); // Set default mode
        }
    };

    var ZoomManager = (function() {
        var exports = {},
            zoomType = IDR.ZOOM_AUTO,
            lastRulePosition,
            zoomValues = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4],
            namedZoomValues = [IDR.ZOOM_AUTO, IDR.ZOOM_FITPAGE, IDR.ZOOM_FITHEIGHT, IDR.ZOOM_FITWIDTH, IDR.ZOOM_ACTUALSIZE],
            zoomCount = 0,
            styleSheet,
            zoom = 1,
            defaultZoom;

        exports.setup = function() {
            var styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            document.head.appendChild(styleElement);
            styleSheet = styleElement.sheet;

            window.addEventListener('resize', function() { updateZoom(); });

            updateZoom(defaultZoom);
        };

        var setTransform = function(element, x, y, scale, hardwareAccelerate) {
            var transform;
            if (hardwareAccelerate) {
                transform = "translate3d(" + x + "px, " + y + "px, 0) scale(" + scale + ")";
            } else {
                transform = "translateX(" + x + "px) translateY(" + y + "px) scale(" + scale + ")";
            }

            return "-webkit-transform: " + transform + ";\n" +
                "-ms-transform: " + transform + ";\n" +
                "transform: " + transform + ";";
        };

        var updateZoom = function(value) {
            LoadManager.stopLoading();

            zoom = calculateZoomValue(value);

            var isMinZoom = false, isMaxZoom = false;

            if (zoom >= 4) {
                zoom = 4;
                isMaxZoom = true;
            } else if (zoom <= 0.25) {
                zoom = 0.25;
                isMinZoom = true;
            }

            var scrollRatio = mainContainer.scrollTop / mainContainer.scrollHeight;

            layout.updateLayout();

            var visiblePages = layout.getVisiblePages();
            for (var j = 1; j <= pgCount; j++) {
                if (visiblePages.indexOf(j) === -1) {
                    LoadManager.hide(j);
                }
            }

            if (lastRulePosition) {
                styleSheet.deleteRule(lastRulePosition);
            }

            var transform = setTransform(null, 0, 0, zoom, false);
            lastRulePosition = styleSheet.insertRule(".page-inner { \n" + transform + "\n}", styleSheet.cssRules.length);

            for (var i = 0; i < pgCount; i++) {
                pages[i + 1].style.width = Math.floor(bounds[i][0] * zoom) + "px";
                pages[i + 1].style.height = Math.floor(bounds[i][1] * zoom) + "px";
            }

            mainContainer.scrollTop = mainContainer.scrollHeight * scrollRatio;

            zoomCount++;
            if (zoomCount % 2 === 1) {
                updateZoom();//Re-run zoom to fix scroll bar calculation issues
            }

            IDR.fire('zoomchange', {
                zoomType: zoomType,
                zoomValue: zoom,
                isMinZoom: isMinZoom,
                isMaxZoom: isMaxZoom
            });
        };

        var calculateNextZoom = function() {
            var oldZoom = zoom;
            var newZoom = zoomValues[zoomValues.length - 1];
            for (var i = 0; i < zoomValues.length; i++) {
                if (zoomValues[i] > oldZoom) {
                    newZoom = zoomValues[i];
                    break;
                }
            }
            var bestNamedValue;
            for (i = 0; i < namedZoomValues.length; i++) {
                var value = calculateZoomValue(namedZoomValues[i]);
                if (value > oldZoom && value <= newZoom) {
                    if (bestNamedValue && value === newZoom) {
                        continue; // If multiple named values correspond to the same zoom level then use the earliest
                    }
                    bestNamedValue = namedZoomValues[i];
                    newZoom = value;
                }
            }
            return bestNamedValue || newZoom;
        };

        var calculatePrevZoom = function() {
            var oldZoom = zoom;
            var newZoom = zoomValues[0];
            for (var i = zoomValues.length - 1; i >= 0; i--) {
                if (zoomValues[i] < oldZoom) {
                    newZoom = zoomValues[i];
                    break;
                }
            }
            var bestNamedValue;
            for (i = 0; i < namedZoomValues.length; i++) {
                var value = calculateZoomValue(namedZoomValues[i]);
                if (value < oldZoom && value >= newZoom) {
                    if (bestNamedValue && value === newZoom) {
                        continue; // If multiple named values correspond to the same zoom level then use the earliest
                    }
                    bestNamedValue = namedZoomValues[i];
                    newZoom = value;
                }
            }
            return bestNamedValue || newZoom;
        };

        var calculateZoomValue = function(value) {
            var zoomBounds = layout.getZoomBounds();
            var fitWidthZoom = (mainContainer.clientWidth - PADDING) / zoomBounds.width;
            var fitHeightZoom = (mainContainer.clientHeight - PADDING) / zoomBounds.height;

            var zoomValue = parseFloat(value);
            if (!isNaN(zoomValue)) {
                zoom = zoomValue;
                value = IDR.ZOOM_SPECIFIC;
            }

            if (!value) {
                value = zoomType;
            }

            switch(value) {
                case IDR.ZOOM_AUTO:
                    zoom = layout.getAutoZoom(fitWidthZoom, fitHeightZoom);
                    break;
                case IDR.ZOOM_FITWIDTH:
                    zoom = fitWidthZoom;
                    break;
                case IDR.ZOOM_FITHEIGHT:
                    zoom = fitHeightZoom;
                    break;
                case IDR.ZOOM_FITPAGE:
                    zoom = Math.min(fitWidthZoom, fitHeightZoom);
                    break;
                case IDR.ZOOM_ACTUALSIZE:
                    zoom = 1;
                    break;
            }
            zoomType = value;

            return zoom;
        };

        exports.updateZoom = updateZoom;
        exports.zoomIn = function() {
            updateZoom(calculateNextZoom());
        };
        exports.zoomOut = function() {
            updateZoom(calculatePrevZoom());
        };
        exports.getZoom = function() {
            return zoom;
        };
        exports.setDefault =  function(zoom) {
            defaultZoom = zoom;
        };
        return exports;
    })();


    IDR.zoomIn = function() {
        ZoomManager.zoomIn();
    };

    IDR.zoomOut = function() {
        ZoomManager.zoomOut();
    };

    IDR.setZoom = function(zoomType) {
        if (isSetup) {
            ZoomManager.updateZoom(zoomType);
        } else {
            ZoomManager.setDefault(zoomType);
        }
    };

    IDR.goToPage = function(pg, location) {
        if (isSetup) {
            if (pg >= 1 && pg <= pgCount) {
                layout.goToPage(Number(pg), location);
            }
        } else {
            curPg = pg; // Sets the default page
        }
    };

    IDR.next = function() {
        layout.next();
    };

    IDR.prev = function() {
        layout.prev();
    };

    IDR.setLayout = function(name) {
        if (isSetup) {
            LayoutManager.setLayout(name);
        } else {
            LayoutManager.setDefault(name);
        }
    };

    IDR.updateLayout = function() {
        ZoomManager.updateZoom();
    };

    /* EventManager */
    (function() {
        var events = {};

        IDR.on = function(eventType, eventListener) {
            if (!events[eventType]) {
                events[eventType] = [];
            }
            if (events[eventType].indexOf(eventListener) === -1) {
                events[eventType].push(eventListener);
            }
        };

        IDR.off = function(eventType, eventListener) {
            if (events[eventType]) {
                var index = events[eventType].indexOf(eventListener);
                if (index !== -1) {
                    events[eventType].splice(index, 1);
                }
            }
        };

        IDR.fire = function(type, data) {
            if (events[type]) {
                events[type].forEach(function(listener) {
                    listener(data);
                });
            }
        };
    })();

    var ClassHelper = (function() {
        return {
            addClass: function(ele, name) {
                var classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
                var index = classes.indexOf(name);
                if (index === -1) {
                    classes.push(name);
                    ele.className = classes.join(" ");
                }
            },

            removeClass: function() {
                var ele = arguments[0];
                var classes = ele.className.length !== 0 ? ele.className.split(" ") : [];

                for (var i = 1; i < arguments.length; i++) {
                    var index = classes.indexOf(arguments[i]);
                    if (index !== -1) {
                        classes.splice(index, 1);
                    }
                }

                ele.className = classes.join(" ");
            }
        };
    })();

    if(typeof define === "function" && define.amd) {
        //noinspection JSUnresolvedFunction
        define(['idrviewer'], [], function() {
            return IDR;
        });
    } else if(typeof module === "object" && module.exports) {
        module.exports = IDR;
    } else {
        window.IDRViewer = IDR;
    }

}());
