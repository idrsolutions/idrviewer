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

(function() {
    "use strict";

    IDRViewer.setLayout(IDRViewer.LAYOUT_PRESENTATION);

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
        Button.prev = d('btnPrev');
        Button.next = d('btnNext');

        const pageLabels = data.pageLabels;

        function getPageString(page, pageCount) {
            let result = page + " / " + pageCount;
            if (pageLabels.length) {
                result =  pageLabels[page - 1];
            }
            return result;
        }

        document.title = data.title ? data.title : data.fileName;
        d('btnPage').innerHTML = getPageString(data.page, data.pagecount);
        d('btnPage').title = data.page + " of " + data.pagecount;

        Button.prev.onclick = function(e) { IDRViewer.prev(); e.preventDefault(); };
        Button.next.onclick = function(e) { IDRViewer.next(); e.preventDefault(); };
        d('idrviewer').onclick = function(e) {
            if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'A') {
                IDRViewer.next();
                e.preventDefault();
            }
        };

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
            d('btnPage').innerHTML = getPageString(data.page, data.pagecount);
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

        IDRViewer.on('fullscreenchange', function(data) {
            if (data.isFullscreen) {
                ClassHelper.addClass(document.body, 'hide-controls');
                IDRViewer.updateLayout();
            } else {
                ClassHelper.removeClass(document.body, 'hide-controls');
                IDRViewer.updateLayout();
            }
        });

    });

})();
