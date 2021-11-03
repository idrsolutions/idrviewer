/* v1.4.0 */
(function() {
    "use strict";

    let searchParams;
    if ("URLSearchParams" in window) {
        searchParams = (new URL(document.location)).searchParams;
    } else {
        searchParams = (function() {
            let queries = {};
            let url = document.URL;
            let jumIdx = url.toString().indexOf('?');
            if (jumIdx != -1) {
                url.substr(jumIdx + 1).split("&").forEach(function(query) {
                    let kv = query.split("=");
                    queries[kv[0]] = kv[1];
                });
            }
            return {
                get: function(key) {
                    return queries[key];
                },
                set: function(key, value) {
                    queries[key] = value;
                },
                toString: function() {
                    let arr = [];
                    for (let queriesKey in queries) {
                        arr.push(queriesKey + "=" + queries[queriesKey]);
                    }
                    return arr.join("&");
                }
            };
        })();
    }

    let layout;
    let continuousTimeout;
    let CONTINUOUS_THRESHOLD = 1000; // Length of time (in millis) required on page required to be considered a pageview in continuous layout
    let handlePageChange = function(data) {
        if (history.pushState) {
            if (layout === IDRViewer.LAYOUT_CONTINUOUS) {
                if (continuousTimeout) {
                    clearTimeout(continuousTimeout);
                }
                continuousTimeout = setTimeout(function() {
                    addPageToHistory(data.page);
                }, CONTINUOUS_THRESHOLD);
            } else {
                addPageToHistory(data.page);
            }
        }
    };

    let addPageToHistory = function(page) {
        try {
            searchParams.set("page", page);
            history.pushState({page: page}, null, '?' + searchParams.toString());
        } catch (ignore) { } // Chrome throws error on file:// protocol
    };

    IDRViewer.goToPage(parseInt(searchParams.get("page")) || 1);

    if (history.pushState) {
        IDRViewer.on('ready', function (data) {
            layout = data.layout;

            try {
                searchParams.set("page", data.page);
                history.replaceState({page: data.page}, null, '?' + searchParams.toString());
            } catch (ignore) { } // Chrome throws error on file:// protocol

            window.onpopstate = function (event) {
                IDRViewer.off('pagechange', handlePageChange);
                IDRViewer.goToPage(event.state.page);
                IDRViewer.on('pagechange', handlePageChange);
            };

            IDRViewer.on('pagechange', handlePageChange);

            IDRViewer.on('layoutchange', function (data) {
                layout = data.layout;
            });
        });
    }

})();