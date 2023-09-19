(function() {
    "use strict";

    if (location.protocol === "file:") {
        console.log("Annotations functionality is not available when loading from the file:// protocol.");
        return;
    }

    const LoadManager = (function() {
        const LoadManager = {},
            annotationsContainers = [];
        let preLoadedPages = [],
            annotationsPages,
            config;

        const initPreloadedPages = function() {
            if (preLoadedPages.length) {
                for (let i = 0; i < preLoadedPages.length; i++) {
                    initPage(preLoadedPages[i]);
                }
                preLoadedPages = [];
            }
        };

        const initPage = function(page) {
            const pageContainer = document.getElementById("page" + page);

            const annotationsContainer = document.createElement("div");
            annotationsContainer.className = "page-inner";
            annotationsContainer.setAttribute("style", "position: absolute; pointer-events: none;");
            annotationsContainer.style.width = pageContainer.style.width;
            annotationsContainer.style.height = pageContainer.style.height;
            pageContainer.appendChild(annotationsContainer);
            annotationsContainers[page] = annotationsContainer;

            for (let i = 0; i < annotationsPages.length; i++) {
                if (annotationsPages[i].page === page) {
                    const annotations = annotationsPages[i].annotations;
                    for (let j = 0; j < annotations.length; j++) {
                        loadFunction(annotationsContainer, annotations[j], config);
                    }
                }
            }
        };

        IDRViewer.on("ready", function(data) {
            config = data;
            const baseUrl = data.url || "";

            const request = new XMLHttpRequest();
            request.open('GET', baseUrl + 'annotations.json', true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    annotationsPages = JSON.parse(request.responseText).pages;
                    initPreloadedPages();
                }
            };

            request.send();
        });

        IDRViewer.on("pageload", function(data) {
            if (annotationsPages) {
                initPage(data.page);
            } else {
                preLoadedPages.push(data.page);
            }
        });

        IDRViewer.on("pageunload", function(data) {
            if (annotationsContainers[data.page]) {
                annotationsContainers[data.page].parentNode.removeChild(annotationsContainers[data.page]);
                annotationsContainers[data.page] = null;
            }
        });

        let loadFunction;
        LoadManager.setLoadFunction = function(loadFn) {
            loadFunction = loadFn;
        };

        return LoadManager;
    })();

    const ActionHandler = (function() {
        const ActionHandler = {},
            handlers = {
                'click': [],
                'mouseover': [],
                'mouseout': [],
                'touchstart': [],
                'setup': []
            };

        ActionHandler.register = function(types, events, handler) {
            for (let i = 0; i < types.length; i++) {
                for (let j = 0; j < events.length; j++) {
                    handlers[events[j]].push({
                        type: types[i],
                        handler: handler
                    });
                }
            }
        };

        ActionHandler.onclick = function(data, config) {
            for (let i = 0; i < handlers.click.length; i++) {
                if (data.type === handlers.click[i].type) {
                    handlers.click[i].handler.onclick.apply(this, [data, config]);
                }
            }
        };

        ActionHandler.onmouseover = function(data, config) {
            for (let i = 0; i < handlers.mouseover.length; i++) {
                if (data.type === handlers.mouseover[i].type) {
                    handlers.mouseover[i].handler.onmouseover.apply(this, [data, config]);
                }
            }
        };

        ActionHandler.onmouseout = function(data, config) {
            for (let i = 0; i < handlers.mouseout.length; i++) {
                if (data.type === handlers.mouseout[i].type) {
                    handlers.mouseout[i].handler.onmouseout.apply(this, [data, config]);
                }
            }
        };

        ActionHandler.ontouchstart = function(data, config) {
            for (let i = 0; i < handlers.touchstart.length; i++) {
                if (data.type === handlers.touchstart[i].type) {
                    handlers.touchstart[i].handler.ontouchstart.apply(this, [data, config]);
                }
            }
        };

        ActionHandler.onsetup = function(data, config) {
            for (let i = 0; i < handlers.setup.length; i++) {
                if (data.type === handlers.setup[i].type) {
                    handlers.setup[i].handler.onsetup.apply(this, [data, config]);
                }
            }
        };

        return ActionHandler;
    })();

    const SoundHelper = (function() {
        let currentSound,
            currentRef;

        return {
            play: function(src, ref) {
                // HTMLAudioElement is not supported in any version of IE
                const isPlaying = currentSound && !currentSound.ended && !currentSound.paused;
                if (isPlaying) {
                    currentSound.pause();
                    if (ref === currentRef) {
                        return;
                    }
                }
                currentRef = ref;
                currentSound = new Audio(src);
                currentSound.play();
            }
        };
    })();

    (function() {
        const LinkActionHandler = {};

        let pageCount;
        IDRViewer.on("ready", function(data) {
            pageCount = data.pagecount;
        });

        LinkActionHandler.onsetup = function(data) {
            if (data.action && data.action.type === "URI") {
                const element = document.createElement("a");
                element.href = data.action.uri;
                element.title = data.action.uri;
                element.target = "_blank";
                element.style.position = "absolute";
                element.style.width = "100%";
                element.style.height = "100%";
                this.appendChild(element);
            }
        };

        LinkActionHandler.onmouseover = function(data) {
            if (data.action && data.action.type !== "URI") {
                this.style.cursor = "pointer";
            }
        };

        LinkActionHandler.onclick = function(data, config) {
            if (data.action) {
                switch (data.action.type) {
                    case "GoTo":
                        IDRViewer.goToPage(data.action.page, data.action.zoom);
                        break;

                    case "Named":
                        switch(data.action.name) {
                            case "NextPage":
                                IDRViewer.next();
                                break;
                            case "PrevPage":
                                IDRViewer.prev();
                                break;
                            case "FirstPage":
                                IDRViewer.goToPage(1);
                                break;
                            case "LastPage":
                                if (pageCount) {
                                    IDRViewer.goToPage(pageCount);
                                }
                                break;
                        }
                        break;
                    case "Sound":
                        SoundHelper.play((config.url || "") + data.action.sound, data.objref);
                        break;
                    case "Launch":
                        if (config.enableLaunchActions) {
                            window.open("../" + data.action.target, "_blank");
                        }
                        break;
                }

            }
        };

        ActionHandler.register(["Link", "Widget", "TextLink"], ["click", "mouseover", "setup"], LinkActionHandler);
    })();

    (function() {
        const SoundHandler = {};

        SoundHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        SoundHandler.onclick = function(data, config) {
            if (data.sound) {
                SoundHelper.play((config.url || "") + data.sound, data.objref);
            }
        };

        ActionHandler.register(["Sound"], ["click", "mouseover"], SoundHandler);
    })();

    (function() {
        const FileAttachmentHandler = {};

        FileAttachmentHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        FileAttachmentHandler.onclick = function(data, config) {
            const downloadLink = document.createElement("a");
            downloadLink.href = (config.url || "") + data.attachment;
            downloadLink.download = data.filename;
            downloadLink.target = "_blank";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        ActionHandler.register(["FileAttachment"], ["click", "mouseover"], FileAttachmentHandler);
    })();

    (function() {
        const PopupHandler = {};
        let currentPopup,
            isMobile;

        const createPopup = function(data) {
            if (data["contents"] && data["objref"]) {
                const boundingRect = document.querySelector("[data-objref='" + data.objref + "']").getBoundingClientRect();
                const midX = ((boundingRect.right - boundingRect.left) / 2) + boundingRect.left;
                const bottomY = boundingRect.bottom;

                const element = document.createElement("div");
                element.dataset.parentRef = data.objref;
                element.setAttribute("style", "position: fixed; width: 300px; min-height: 200px; left: " + (midX - 150) + "px; top: "
                    + (bottomY + 5) + "px; background-color: #FFFFEF; border-radius: 10px; border: 1px #bbb solid; padding: 10px; box-sizing: border-box; font-family: Arial;");
                const p1 = document.createElement("p");
                if (data["title"]) {
                    p1.innerText = data["title"];
                }
                p1.setAttribute("style", "font-weight: bold; margin: 0;");
                const p2 = document.createElement("p");
                if (data["contents"]) {
                    p2.innerText = data["contents"];
                }
                element.appendChild(p1);
                element.appendChild(p2);
                document.body.appendChild(element);
                return element;
            }
            return null;
        };

        PopupHandler.onmouseover = function(data) {
            if (!isMobile) { // Prevent mobile/tablet (Android) firing both mouseover and click (shows then immediately hides popup)
                if (!currentPopup) {
                    currentPopup = createPopup(data);
                } else {
                    currentPopup.parentNode.removeChild(currentPopup);
                    currentPopup = null;
                }
            }
        };

        PopupHandler.onmouseout = function() {
            if (currentPopup) {
                currentPopup.parentNode.removeChild(currentPopup);
                currentPopup = null;
            }
        };

        PopupHandler.onclick = function(data) {
            if (isMobile) {
                // For mobile/tablet (touch screens)
                if (currentPopup) {
                    const currentRef = currentPopup.dataset.parentRef;
                    currentPopup.parentNode.removeChild(currentPopup);
                    currentPopup = null;
                    if (currentRef !== data.objref) {
                        currentPopup = createPopup(data);
                    }
                } else {
                    currentPopup = createPopup(data);
                }
            }
        };

        PopupHandler.ontouchstart = function() {
            isMobile = true;
        };

        ActionHandler.register(["Text", "Line", "Square", "Circle", "Polygon", "PolyLine", "Highlight", "Underline",
            "Squiggly", "StrikeOut", "Stamp", "Caret", "Ink", "FileAttachment", "Redact", "Projection"],
            ["click", "mouseover", "mouseout", "touchstart"], PopupHandler);
    })();

    (function() {
        const RichMediaHandler = {};

        RichMediaHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        RichMediaHandler.onclick = function(data, config) {
            if (data.richmedia.length) {
                const isVideo = data.richmedia[0].type.startsWith("video");
                const newElement = document.createElement(isVideo ? "video" : "audio");
                newElement.setAttribute("style", "position: absolute; object-fit: fill; pointer-events: auto;");
                newElement.setAttribute("controls", "");
                newElement.setAttribute("autoplay", "");
                newElement.style.left = data.bounds[0] + "px";
                newElement.style.top = data.bounds[1] + "px";
                if (isVideo) {
                    newElement.style.width = data.bounds[2] + "px";
                } else {
                    newElement.style.minWidth = data.bounds[2] + "px";
                }
                newElement.style.height = data.bounds[3] + "px";
                newElement.title = data.type;
                newElement.dataset.objref = data.objref;
                for (let i = 0; i < data.richmedia.length; i++) {
                    const src = document.createElement("source");
                    src.setAttribute("src", (config.url || "") + data.richmedia[i].src);
                    src.setAttribute("type", data.richmedia[i].type);
                    newElement.appendChild(src);
                }
                this.parentNode.replaceChild(newElement, this);
            }

        };

        ActionHandler.register(["RichMedia"], ["click", "mouseover"], RichMediaHandler);
    })();

    (function() {
        const ScreenHandler = {};

        ScreenHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        const isMediaTypeSupported = function(mediaType) {
            return mediaType === "video/mp4" || mediaType === "audio/mpeg";
        };

        const handleSupportedMediaType = function(data, config) {
            const newElement = document.createElement(data.action.media.type.substr(0, 5)); // 5 = length of "audio" or "video"
            newElement.setAttribute("style", "position: absolute; pointer-events: auto;");
            newElement.setAttribute("controls", "controls");
            newElement.style.left = data.bounds[0] + "px";
            newElement.style.top = data.bounds[1] + "px";
            newElement.title = data.type;
            newElement.dataset.objref = data.objref;

            if (data.action.media.type === "video/mp4") {
                newElement.style.objectFit = "fill";
                newElement.style.width = data.bounds[2] + "px";
                newElement.style.height = data.bounds[3] + "px";

                const src = document.createElement("source");
                src.setAttribute("src", (config.url || "") + data.action.media.src);
                src.setAttribute("type", data.action.media.type);
                newElement.appendChild(src);
            } else if (data.action.media.type === "audio/mpeg") {
                newElement.setAttribute("src", (config.url || "") + data.action.media.src);
            }

            this.parentNode.replaceChild(newElement, this);
            newElement.play();
        };

        const handleUnsupportedMediaType = function(data, config) {
            const downloadLink = document.createElement("a");
            downloadLink.href = (config.url || "") + data.action.media.src;
            if (data.action.media.filename) {
                console.log(JSON.stringify(data.action.media));
                downloadLink.download = data.action.media.filename;
            }
            downloadLink.target = "_blank";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        ScreenHandler.onclick = function(data, config) {
            if (data.action) {
                if (isMediaTypeSupported(data.action.media.type)) {
                    handleSupportedMediaType(data, config);
                } else {
                    handleUnsupportedMediaType(data, config);
                }
            }
        };

        ActionHandler.register(["Screen"], ["click", "mouseover"], ScreenHandler);
    })();

    (function() {
        const createAnnotation = function(container, data, config) {
            const annotation = document.createElement("div");
            annotation.setAttribute("style", "position: absolute; pointer-events: auto; -webkit-user-select: none;");
            annotation.style.left = data.bounds[0] + "px";
            annotation.style.top = data.bounds[1] + "px";
            annotation.style.width = data.bounds[2] + "px";
            annotation.style.height = data.bounds[3] + "px";
            if (data.objref) {
                annotation.dataset.objref = data.objref;
            }

            if (data.appearance) {
                annotation.style.backgroundImage = "url('" + data.appearance + "')";
                annotation.style.backgroundSize = "100% 100%";
            }

            container.appendChild(annotation);
            annotation.addEventListener("click", function() {
                ActionHandler.onclick.apply(this, [data, config]);
            });
            annotation.addEventListener("mouseover", function() {
                ActionHandler.onmouseover.apply(this, [data, config]);
            });
            annotation.addEventListener("mouseout", function() {
                ActionHandler.onmouseout.apply(this, [data, config]);
            });
            annotation.addEventListener("touchstart", function() {
                ActionHandler.ontouchstart.apply(this, [data, config]);
            });
            ActionHandler.onsetup.apply(annotation, [data, config]);
        };

        LoadManager.setLoadFunction(createAnnotation);
    })();

})();
