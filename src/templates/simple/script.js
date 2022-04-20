(function() {
    "use strict";

    /**
     * Shorthand helper function to getElementById
     * @param id
     * @returns {Element}
     */
    var d = function (id) {
        return document.getElementById(id);
    };

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

            removeClass: function(ele, name) {
                var classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
                var index = classes.indexOf(name);
                if (index !== -1) {
                    classes.splice(index, 1);
                }
                ele.className = classes.join(" ");
            }
        };
    })();

    var Button = {};

    IDRViewer.on('ready', function(data) {
        // Grab buttons
        Button.prev = d('btnPrev');
        Button.next = d('btnNext');
        Button.zoomIn = d('btnZoomIn');
        Button.zoomOut = d('btnZoomOut');

        document.title = data.title ? data.title : data.fileName;
        var pageLabels = data.pageLabels;
        d('btnPage').innerHTML = pageLabels.length ? pageLabels[data.page - 1] : data.page;
        d('btnPage').title = data.page + " of " + data.pagecount;

        Button.prev.onclick = function(e) { IDRViewer.prev(); e.preventDefault(); };
        Button.next.onclick = function(e) { IDRViewer.next(); e.preventDefault(); };
        Button.zoomOut.onclick = function(e) { IDRViewer.zoomOut(); e.preventDefault(); };
        Button.zoomIn.onclick = function(e) { IDRViewer.zoomIn(); e.preventDefault(); };

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

        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Setup controls hiding after 1s of inactivity
        // Disable if local as iframes used for pages which absorb mousemove events and break this behavior
        if (!isMobile && window.location.protocol !== 'file:' && data.pageType !== 'svg') {
            var mouseOverControls = false;
            var controls = d('controls');
            var timer;
            controls.addEventListener('mouseenter', function () {
                mouseOverControls = true;
            });
            controls.addEventListener('mouseleave', function () {
                mouseOverControls = false;
            });
            document.body.addEventListener('mousemove', function () {
                clearTimeout(timer);
                ClassHelper.removeClass(controls, 'hide');

                if (!mouseOverControls) {
                    timer = setTimeout(function () {
                        ClassHelper.addClass(controls, 'hide');
                    }, 1000);
                }
            });
        }

    });

})();
