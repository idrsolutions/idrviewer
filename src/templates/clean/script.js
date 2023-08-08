(function() {
    "use strict";

    /**
     * Shorthand helper function to getElementById
     * @param id
     * @returns {Element}
     */
    const d = function (id) {
        return document.getElementById(id);
    };

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

            removeClass: function(ele, name) {
                const classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
                const index = classes.indexOf(name);
                if (index !== -1) {
                    classes.splice(index, 1);
                }
                ele.className = classes.join(" ");
            }
        };
    })();

    const Button = {};

    const navHelper = (function() {
        return {
            swapNavButtonsForR2L: function () {
                Button.next.parentNode.insertBefore(Button.prev, Button.next);
                Button.prev.parentNode.insertBefore(Button.next, Button.prev.parentNode.firstChild);
                const nextInnerHtml = Button.next.innerHTML;
                Button.next.innerHTML = Button.prev.innerHTML;
                Button.prev.innerHTML = nextInnerHtml;
            }
        };
    })();

    IDRViewer.on('ready', function(data) {
        // Grab buttons
        Button.fullscreen = d('btnFullScreen');
        Button.themeToggle = d('btnThemeToggle');
        Button.prev = d('btnPrev');
        Button.next = d('btnNext');
        Button.zoomIn = d('btnZoomIn');
        Button.zoomOut = d('btnZoomOut');

        document.title = data.title ? data.title : data.fileName;
        d('title').innerHTML = document.title;
        const pageLabels = data.pageLabels;
        d('btnPage').innerHTML = pageLabels.length ? pageLabels[data.page - 1] : data.page;

        Button.prev.onclick = function(e) { IDRViewer.prev(); e.preventDefault(); };
        Button.next.onclick = function(e) { IDRViewer.next(); e.preventDefault(); };
        Button.zoomIn.onclick = function(e) { IDRViewer.zoomIn(); e.preventDefault(); };
        Button.zoomOut.onclick = function(e) { IDRViewer.zoomOut(); e.preventDefault(); };

        if (data.isR2L) {
            navHelper.swapNavButtonsForR2L();
        }

        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 33: // Page Up
                    IDRViewer.prev();
                    e.preventDefault();
                    break;
                case 34: // Page Down
                    IDRViewer.next();
                    e.preventDefault();
                    break;
                case 37: // Left Arrow
                    data.isR2L ? IDRViewer.next() : IDRViewer.prev();
                    e.preventDefault();
                    break;
                case 39: // Right Arrow
                    data.isR2L ? IDRViewer.prev() : IDRViewer.next();
                    e.preventDefault();
                    break;
                case 36: // Home
                    IDRViewer.goToPage(1);
                    e.preventDefault();
                    break;
                case 35: // End
                    IDRViewer.goToPage(data.pagecount);
                    e.preventDefault();
                    break;
            }
        };

        if (IDRViewer.isFullscreenEnabled()) {
            Button.fullscreen.onclick = function (e) {
                IDRViewer.toggleFullScreen();
                e.preventDefault();
            };
        } else {
            Button.fullscreen.parentNode.removeChild(Button.fullscreen);
        }

        if (data.isFirstPage) {
            ClassHelper.addClass(Button.prev, 'disabled');
        } else if (data.isLastPage) {
            ClassHelper.addClass(Button.next, 'disabled');
        }

        IDRViewer.on('pagechange', function(data) {
            d('btnPage').innerHTML = pageLabels.length ? pageLabels[data.page - 1] : data.page;
            d('btnPage').title = data.page + " of " + data.pagecount;

            if (data.isFirstPage) {
                ClassHelper.addClass(Button.prev, 'disabled');
            } else {
                ClassHelper.removeClass(Button.prev, 'disabled');
            }

            if (data.isLastPage) {
                ClassHelper.addClass(Button.next, 'disabled');
            } else {
                ClassHelper.removeClass(Button.next, 'disabled');
            }
        });

        IDRViewer.on('zoomchange', function(data) {
            if (data.isMinZoom) {
                ClassHelper.addClass(Button.zoomOut, 'disabled');
            } else {
                ClassHelper.removeClass(Button.zoomOut, 'disabled');
            }

            if (data.isMaxZoom) {
                ClassHelper.addClass(Button.zoomIn, 'disabled');
            } else {
                ClassHelper.removeClass(Button.zoomIn, 'disabled');
            }
        });

        const setTheme = function(isDarkTheme) {
            ClassHelper.removeClass(document.body, "light-theme");
            ClassHelper.removeClass(document.body, "dark-theme");
            ClassHelper.addClass(document.body, isDarkTheme ? "dark-theme" : "light-theme");
        };
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
        Button.themeToggle.addEventListener('click', function() {
            setTheme(document.body.className.indexOf('dark-theme') === -1);
        });
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            setTheme(event.matches);
        });
    });

})();
