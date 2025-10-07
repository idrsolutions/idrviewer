(function () {
    "use strict";

    const IDR = {
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

    let curPg = 1,
        pgCount = 0,
        pageContainer,
        mainContainer,
        layout,
        bounds,
        paddingX,
        paddingY,
        isSetup = false;
    const pages = [];

    IDR.setup = function (config) {
        if (!config) {
            config = IDRViewer.config;
        }

        isSetup = true;

        bounds = config.bounds;
        pgCount = config.pagecount;
        paddingX = typeof config.paddingX !== 'undefined' ? config.paddingX : 5;
        paddingY = typeof config.paddingY !== 'undefined' ? config.paddingY : 5;

        // Validate starting page
        if (curPg < 1 || curPg > pgCount) {
            curPg = 1;
        }

        mainContainer = document.getElementById("idrviewer");

        const contain = document.createElement('div');
        contain.style.position = "relative";
        contain.style.display = "inline-block"; // Required for continuous mode when pages larger than browser width
        contain.style.verticalAlign = "middle"; // Fixes Chrome showing scrollbars in presentation/magazine layout
        // contain.style.float = "left"; // Other potential fix for Chrome scrollbars.
        contain.style.minWidth = "100%";
        contain.style.lineHeight = "normal";
        contain.style.overflow = "hidden"; // Needed otherwise transitions create scroll bars
        mainContainer.appendChild(contain);

        pageContainer = document.createElement('div');
        pageContainer.id = "contentContainer";
        pageContainer.style.transform = "translateZ(0)";
        pageContainer.style.padding = paddingY + "px " + paddingX + "px";
        contain.appendChild(pageContainer);

        for (let i = 1; i <= pgCount; i++) {
            const page = document.createElement('div');
            page.id = 'page' + i;
            page.setAttribute('style', 'width: ' + bounds[i - 1][0] + 'px; height: ' + bounds[i - 1][1] + 'px;');
            page.className = "page";
            page.role = "region";
            page.ariaLabel = `Page ${i}`;
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

        const data = {
            selectMode: SelectionManager.currentSelectMode,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            layout: layout.toString(),
            availableLayouts: LayoutManager.getAvailableLayouts(),
            isFirstPage: curPg === 1,
            isLastPage: layout.isLastPage(curPg)
        };
        for (let prop in config) {
            if (config.hasOwnProperty(prop)) {
                data[prop] = config[prop];
            }
        }
        data.page = curPg;
        IDR.fire('ready', data);
    };

    const PageManager = (function() {
        const exports = {},
            isLocal = location.protocol === "file:",
            fontList = [];
        let fontsSheet,
            isSharedCssAppended = false,
            isSVG,
            isSVGZ,
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

            const fontStyleElement = document.createElement('style');
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

        const clearSelection = function(win) {
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

        const clearSelectionAll = function(win) {
            try {
                clearSelection(win);
                for (let i = 1; i <= pgCount; i++) {
                    if (LoadManager.isVisible(i)) {
                        clearSelection(pages[i].firstChild.contentDocument);
                    }
                }
            } catch (ignore) {}
        };

        const iframeLoad = function(page, callback) {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'page-inner');
            iframe.setAttribute('src', URL + page + '.html');
            iframe.setAttribute('tabindex', '-1');
            iframe.setAttribute('style', 'width: ' + bounds[page - 1][0] + 'px; height: ' + bounds[page - 1][1] + 'px; position: absolute; border: 0;');
            iframe.onload = callback;
            pages[page].appendChild(iframe);
        };

        const svgLoad = function(page, callback) {
            const svgLoadHandler = function() {
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

            const svgElement = document.createElement('object');
            svgElement.setAttribute('width', '' + bounds[page - 1][0]);
            svgElement.setAttribute('height', '' + bounds[page - 1][1]);
            svgElement.setAttribute('data', URL + page + (isSVGZ ? '.svgz' : '.svg'));
            svgElement.setAttribute('type', 'image/svg+xml');
            svgElement.setAttribute('class', 'page-inner');
            svgElement.setAttribute('style', 'position: absolute');
            svgElement.addEventListener('load', svgLoadHandler);
            pages[page].appendChild(svgElement);
        };

        const handleLoad = function(html, page, callback) {
            const newDoc = document.createElement('div');
            newDoc.innerHTML = html;
            const pageElement = newDoc.querySelector("#p" + page);
            pageElement.style.margin = '0';
            pageElement.style.overflow = 'hidden';
            pageElement.style.position = 'absolute';

            const setLoaded = function() {
                if (this) {
                    this.removeEventListener('load', setLoaded);
                }
                callback();
            };

            const background = pageElement.querySelector('#pdf' + page);
            background.setAttribute("tabindex", "-1"); // Prevent object element appearing in tab order
            background.ariaHidden = "true";

            const externalBackground = background.getAttribute("data") || background.getAttribute("src");
            if (externalBackground) {
                background.addEventListener('load', setLoaded);
            }

            if (URL) {
                let currentSrc = background.getAttribute("data"); // NS_ERROR_UNEXPECTED (before appending)
                if (currentSrc) {
                    background.setAttribute("data", URL + currentSrc);
                } else {
                    currentSrc = background.getAttribute("src");
                    if (currentSrc && !currentSrc.startsWith("data:")) {
                        background.setAttribute("src", URL + currentSrc);
                    }
                }
            }

            const fontFaceElement = pageElement.querySelector('#fonts' + page);
            if (fontFaceElement) {
                const fontFacesString = fontFaceElement.innerHTML;
                fontFaceElement.parentNode.removeChild(fontFaceElement);

                fontFacesString.match(/@font-face\s*{[\s\S]*?}/g).forEach(function(fontFace) {
                    if (fontList.indexOf(fontFace) === -1) {
                        fontList.push(fontFace);
                        // Replace does not catch base64 fonts because they do not include the quote
                        fontsSheet.insertRule(fontFace.replace("url(\"", "url(\"" + URL), fontsSheet.cssRules.length);
                    }
                });
            }

            const sharedCssElement = pageElement.querySelector(".shared-css");
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

        const ajaxLoad = function(page, callback) {
            const request = new XMLHttpRequest();
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

    const LoadManager = (function() {
        const PageStates = {
            LOADING: 'loading',
            HIDDEN: 'hidden',
            UNLOADED: 'unloaded',
            LOADED: 'loaded'
        };

        const exports = { },
            DELAY = 500,
            MAX_LOADED = 50,
            MAX_VISIBLE = 20,
            MAX_SIMULTANEOUS = 2,
            states = [];
        let page,
            timer,
            numLoading = 0,
            numLoaded = 0,
            numHidden = 0,
            numUnloaded;

        exports.setup = function() {
            numUnloaded = pgCount;

            for (let i = 1; i <= pgCount; i++) {
                states[i] = PageStates.UNLOADED; // Initialise states to unloaded
                pages[i].dataset.state = PageStates.UNLOADED;
            }
        };

        const setState = function(page, state) {
            updateStateCounts(states[page], state);
            states[page] = state;
            pages[page].dataset.state = state;
        };

        const updateStateCounts = function(before, after) {
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

        const isVisible = function(page) {
            return states[page] === PageStates.LOADED;
        };

        const isLoaded = function(page) {
            return states[page] === PageStates.LOADED || states[page] === PageStates.HIDDEN;
        };

        const hide = function(page) {
            if (states[page] === PageStates.LOADED) {
                setState(page, PageStates.HIDDEN);
                PageManager.hide(page);
            }
        };

        const load = function(page) {
            if (states[page] === PageStates.HIDDEN) {
                setState(page, PageStates.LOADED);
                PageManager.show(page);
            }
            if (states[page] === PageStates.UNLOADED) {
                setState(page, PageStates.LOADING);

                const callback = function() {
                    setState(page, PageStates.LOADED);
                    IDR.fire('pageload', {
                        page: page
                    });
                };

                PageManager.load(page, callback);
            }
        };

        const unload = function(page) {
            if (states[page] === PageStates.LOADED || states[page] === PageStates.HIDDEN) {
                setState(page, PageStates.UNLOADED);
                PageManager.unload(page);
                IDR.fire('pageunload', {
                    page: page
                });
            }
        };

        const process = function() {
            load(page); // Always load the current page

            if (numLoading < MAX_SIMULTANEOUS) {
                for (let i = 1; i < MAX_VISIBLE / 2; i++) {
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
            let pointerA = 1;
            let pointerB = pgCount;
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

        const checkBounds = function(page) {
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

    const LayoutManager = (function() {
        const exports = { },
            layouts = {};
        let defaultLayout,
            allPagesSameSize = true,
            isDirectionR2L = false;

        exports.setup = function(isR2L) {
            isDirectionR2L = isR2L;

            for (let i = 0; i < pgCount; i++) {
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
        const Presentation = { };
        let allPagesSameSize;

        Presentation.setup = function(sameSizePages) {
            allPagesSameSize = sameSizePages;
        };

        Presentation.unload = function() {
            /*jshint loopfunc: true */
            for (let i = 1; i <= pgCount; i++) {
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

        const updateClasses = function(pg) {
            /*jshint loopfunc: true */
            for (let i = 1; i <= pgCount; i++) {
                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');
                delete pages[i].dataset.visible;

                if (i < pg) {
                    ClassHelper.addClass(pages[i], 'before');
                } else if (i > pg) {
                    ClassHelper.addClass(pages[i], 'after');
                }
            }
            ClassHelper.addClass(pages[pg], 'current');
            pages[pg].dataset.visible = 'true';

            if (pg - 1 >= 1) {
                ClassHelper.addClass(pages[pg - 1], 'prev');
            }
            if (pg + 1 <= pgCount) {
                ClassHelper.addClass(pages[pg + 1], 'next');
            }
        };

        Presentation.updateLayout = function() {
            const zoom = ZoomManager.getZoom();
            const pageWidth = Math.floor(bounds[curPg - 1][0] * zoom);
            let marginLeft = 0;
            let viewPortWidth = mainContainer.clientWidth - (paddingX * 2);
            if (viewPortWidth > pageWidth) {
                marginLeft = (viewPortWidth - pageWidth) / 2;
            } else {
                viewPortWidth = pageWidth;
            }

            const pageHeight = Math.floor(bounds[curPg - 1][1] * zoom);
            let marginTop = 0;
            let viewPortHeight = mainContainer.clientHeight - (paddingY * 2);
            if (viewPortHeight > pageHeight) {
                marginTop = (viewPortHeight - pageHeight) / 2;
            } else {
                viewPortHeight = pageHeight;
            }

            pageContainer.style.width = viewPortWidth + "px";
            pageContainer.style.height = viewPortHeight + "px";

            // Will be wrong if not all pages same size
            for (let i = 1; i <= pgCount; i++) {
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
        const Magazine = { };
        let allPagesSameSize,
            isDirectionR2L,
            visiblePages = []; // Pages that should remain visible during zoom/relayout

        function isDoubleSpread(page) {
            return page > 1 && page < pgCount;
        }

        Magazine.setup = function(sameSizePages, isR2L) {
            allPagesSameSize = sameSizePages;
            isDirectionR2L = isR2L;
        };

        Magazine.unload = function() {
            /*jshint loopfunc: true */
            for (let i = 1; i <= pgCount; i++) {
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
            return visiblePages;
        };

        const updateClasses = function(pg) {
            /*jshint loopfunc: true */
            for (let i = 1; i <= pgCount; i++) {
                ClassHelper.removeClass(pages[i], 'current', 'prev', 'next', 'before', 'after');
                delete pages[i].dataset.visible;
            }
            visiblePages = [];

            ClassHelper.addClass(pages[pg], 'current');
            pages[pg].dataset.visible = 'true';
            visiblePages.push(pg);
            if (isDoubleSpread(pg)) {
                ClassHelper.addClass(pages[pg + 1], 'current');
                pages[pg + 1].dataset.visible = 'true';
                visiblePages.push(pg + 1);
            }

            if (pg == 1) {
                pg = 0;
            }

            if (pg + 2 <= pgCount) {
                ClassHelper.addClass(pages[pg + 2], 'next');
                visiblePages.push(pg + 2); // Seen during magazine transition
                if (pg + 3 <= pgCount) {
                    ClassHelper.addClass(pages[pg + 3], 'next');
                    visiblePages.push(pg + 3); // Seen during magazine transition
                }
            }

            if (pg - 1 > 0) {
                ClassHelper.addClass(pages[pg - 1], 'prev');
                visiblePages.push(pg - 1); // Seen during magazine transition
                if (pg - 2 > 0) {
                    ClassHelper.addClass(pages[pg - 2], 'prev');
                    visiblePages.push(pg - 2); // Seen during magazine transition
                }
            }

            if (pg + 4 <= pgCount) {
                for (let i = pg + 4; i <= pgCount; i++) {
                    ClassHelper.addClass(pages[i], 'after');
                }
            }
            if (pg - 3 > 0) {
                for (let i = pg - 3; i > 0; i--) {
                    ClassHelper.addClass(pages[i], 'before');
                }
            }
        };

        Magazine.updateLayout = function() {
            const isTwoPages = isDoubleSpread(curPg);
            const zoom = ZoomManager.getZoom();

            const getPageWidth = page => Math.floor(bounds[page - 1][0] * zoom);
            const getPageHeight = page => Math.floor(bounds[page - 1][1] * zoom);

            // Calculate viewPortWidth
            const pageWidthA = getPageWidth(curPg);
            const pageWidthB = isTwoPages ? getPageWidth(curPg + 1) : pageWidthA;
            const pageWidth = 2 * Math.max(pageWidthA, pageWidthB);
            const viewPortWidth = Math.max(pageWidth, mainContainer.clientWidth - (paddingX * 2));
            pageContainer.style.width = viewPortWidth + 'px';

            // Calculate viewPortHeight
            const pageHeightA = getPageHeight(curPg);
            const pageHeightB = isTwoPages ? getPageHeight(curPg + 1) : pageHeightA;
            const viewPortHeight = Math.max(pageHeightA, pageHeightB, mainContainer.clientHeight - (paddingY * 2));
            pageContainer.style.height = viewPortHeight + 'px';

            // Layout pages that are currently visible or will be visible during transitions
            const centerX = Math.floor(viewPortWidth / 2);
            const centerY = Math.floor(viewPortHeight / 2);
            const currentPage = curPg === 1 ? 0 : curPg; // Normalise to left page
            for (let i = Math.max(0, currentPage - 2); i <= Math.min(pgCount, currentPage + 2); i += 2) {
                // Left page (right when R2L)
                if (i > 0) {
                    pages[i].style.marginLeft = (isDirectionR2L ? centerX : centerX - getPageWidth(i)) + "px";
                    pages[i].style.marginTop = (centerY - Math.floor(getPageHeight(i) / 2)) + "px";
                }
                // Right page (left when R2L)
                if (i < pgCount) {
                    pages[i + 1].style.marginLeft = (isDirectionR2L ? centerX - getPageWidth(i + 1) : centerX) + "px";
                    pages[i + 1].style.marginTop = (centerY - Math.floor(getPageHeight(i + 1) / 2)) + "px";
                }
            }
        };

        Magazine.isLastPage = function(page) {
            return page + (page == 1 ? 1 : 2) > pgCount;
        };

        Magazine.getZoomBounds = function() {
            const isTwoPages = isDoubleSpread(curPg);
            const pageWidthA = Math.floor(bounds[curPg - 1][0]);
            const pageWidthB = isTwoPages ? Math.floor(bounds[curPg][0]) : 0;
            const pageHeightA = Math.floor(bounds[curPg - 1][1]);
            const pageHeightB = isTwoPages ? Math.floor(bounds[curPg][1]) : 0;
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
        const Continuous = { };
        let largestWidth = 0,
            largestHeight = 0,
            visiblePages = [];

        Continuous.setup = function() {
            mainContainer.addEventListener('scroll', scrollEvent);

            for (let i = 0; i < pgCount; i++) {
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

        const scrollEvent = function() {
            LoadManager.stopLoading();
            scrollUpdate();
        };

        const scrollUpdate = function() {
            let i, y;

            if (pages[1].getBoundingClientRect().top > 0) {
                LayoutManager.updatePage(1);
            } else {
                for (i = 1; i <= pgCount; i++) {
                    const bounds = pages[i].getBoundingClientRect();
                    y = bounds.top;
                    const height = bounds.bottom - bounds.top;

                    if (y <= height*0.25 && y > -height*0.5) {
                        LayoutManager.updatePage(i);
                        break;
                    }
                }
            }
            setVisiblePages();
        };

        const setVisiblePages = function() {
            visiblePages.forEach(page => {
                delete pages[page].dataset.visible;
            });

            visiblePages = [curPg];
            let i, bounds;
            const viewPortHeight = mainContainer.clientHeight;

            const isPageVisible = function(page) {
                bounds = pages[page].getBoundingClientRect();
                return bounds.bottom > 0 && bounds.top < viewPortHeight;
            };

            for (i = curPg - 1; i >= 1 && isPageVisible(i); i--) {
                visiblePages.push(i);
            }
            for (i = curPg + 1; i <= pgCount && isPageVisible(i); i++) {
                visiblePages.push(i);
            }

            visiblePages.forEach(page => {
                pages[page].dataset.visible = "true";
            });
        };

        Continuous.goToPage = function(pg, location) {
            let offset = 0;

            if (location) {
                const locationArr = location.split(" ");
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

            const zoom = ZoomManager.getZoom();
            mainContainer.scrollTop = pages[pg].offsetTop - paddingY + (offset * zoom);
            LayoutManager.updatePage(pg);
            setVisiblePages();
        };

        Continuous.getVisiblePages = function() {
            return visiblePages;
        };

        Continuous.updateLayout = function() {
            setVisiblePages();
        };

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
            if (Continuous.getZoomBounds().width > mainContainer.clientWidth - (paddingX * 2)) {
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
    const SelectionManager = (function() {
        const Selection = { };
        let mouseX,
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

        const handleMouseDown = function(e) {
            e = e || window.event;
            ClassHelper.addClass(overlay, "mousedown");
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseDown = true;
            return false;
        };

        const handleMouseUp = function() {
            ClassHelper.removeClass(overlay, "mousedown");
            isMouseDown = false;
        };

        const handleMouseMove = function(e) {
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

    const ZoomManager = (function() {
        const exports = {},
            zoomValues = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4],
            namedZoomValues = [IDR.ZOOM_AUTO, IDR.ZOOM_FITPAGE, IDR.ZOOM_FITHEIGHT, IDR.ZOOM_FITWIDTH, IDR.ZOOM_ACTUALSIZE];
        let zoomType = IDR.ZOOM_AUTO,
            lastRulePosition,
            zoomCount = 0,
            styleSheet,
            zoom = 1,
            defaultZoom;

        exports.setup = function() {
            const styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            document.head.appendChild(styleElement);
            styleSheet = styleElement.sheet;

            window.addEventListener('resize', function() { updateZoom(); });

            updateZoom(defaultZoom);
        };

        const setTransform = function(element, x, y, scale, hardwareAccelerate) {
            let transform;
            if (hardwareAccelerate) {
                transform = "translate3d(" + x + "px, " + y + "px, 0) scale(" + scale + ")";
            } else {
                transform = "translateX(" + x + "px) translateY(" + y + "px) scale(" + scale + ")";
            }

            return "-webkit-transform: " + transform + ";\n" +
                "-ms-transform: " + transform + ";\n" +
                "transform: " + transform + ";";
        };

        const updateZoom = function(value) {
            LoadManager.stopLoading();

            zoom = calculateZoomValue(value);

            let isMinZoom = false, isMaxZoom = false;

            if (zoom >= zoomValues[zoomValues.length - 1]) {
                zoom = zoomValues[zoomValues.length - 1];
                isMaxZoom = true;
            } else if (zoom <= zoomValues[0]) {
                zoom = zoomValues[0];
                isMinZoom = true;
            }

            const scrollRatio = mainContainer.scrollTop / mainContainer.scrollHeight;

            layout.updateLayout();

            const visiblePages = layout.getVisiblePages();
            for (let j = 1; j <= pgCount; j++) {
                if (visiblePages.indexOf(j) === -1) {
                    LoadManager.hide(j);
                }
            }

            if (lastRulePosition) {
                styleSheet.deleteRule(lastRulePosition);
            }

            const transform = setTransform(null, 0, 0, zoom, false);
            lastRulePosition = styleSheet.insertRule(".page-inner { \n" + transform + "\n}", styleSheet.cssRules.length);

            for (let i = 0; i < pgCount; i++) {
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

        const calculateNextZoom = function() {
            const oldZoom = zoom;
            let newZoom = zoomValues[zoomValues.length - 1];
            for (let i = 0; i < zoomValues.length; i++) {
                if (zoomValues[i] > oldZoom) {
                    newZoom = zoomValues[i];
                    break;
                }
            }
            let bestNamedValue;
            for (let i = 0; i < namedZoomValues.length; i++) {
                const value = calculateZoomValue(namedZoomValues[i]);
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

        const calculatePrevZoom = function() {
            const oldZoom = zoom;
            let newZoom = zoomValues[0];
            for (let i = zoomValues.length - 1; i >= 0; i--) {
                if (zoomValues[i] < oldZoom) {
                    newZoom = zoomValues[i];
                    break;
                }
            }
            let bestNamedValue;
            for (let i = 0; i < namedZoomValues.length; i++) {
                const value = calculateZoomValue(namedZoomValues[i]);
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

        const calculateZoomValue = function(value) {
            const zoomBounds = layout.getZoomBounds();
            const fitWidthZoom = (mainContainer.clientWidth - (paddingX * 2)) / zoomBounds.width;
            const fitHeightZoom = (mainContainer.clientHeight - (paddingY * 2)) / zoomBounds.height;

            const zoomValue = parseFloat(value);
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
        const events = {};

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
                const index = events[eventType].indexOf(eventListener);
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

    const ClassHelper = (function() {
        return {
            addClass: function(ele, name) {
                const classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
                const index = classes.indexOf(name);
                if (index === -1) {
                    classes.push(name);
                    ele.className = classes.join(" ");
                }
            },

            removeClass: function() {
                const ele = arguments[0];
                const classes = ele.className.length !== 0 ? ele.className.split(" ") : [];

                for (let i = 1; i < arguments.length; i++) {
                    const index = classes.indexOf(arguments[i]);
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
    }
    if (window) {
        window.IDRViewer = IDR;
    }

}());
