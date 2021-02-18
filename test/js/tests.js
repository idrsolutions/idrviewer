QUnit.test( "ready listener", function( assert ) {
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        assert.ok(false, "listener did not fire");
        done();
    }, 1000);

    IDRViewer.on('ready', function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.page, 1, "data.page equals 1");
        assert.equal(data.pagecount, 10, "data.pagecount equals 10");
        assert.equal(data.thumbnailType, "jpg", "data.thumbnailType equals jpg");
        assert.equal(data.selectMode, "select", "data.selectMode equals select");
        assert.equal(data.isMobile, false, "data.isMobile equals false");
        assert.equal(data.layout, "continuous", "data.layout equals continuous");
        assert.equal(data.title, "Amber Waves June 2003", "data.title equals Amber Waves June 2003");
        assert.equal(data.pageType, "html", "data.pageType equals html");
        assert.equal(data.isFirstPage, true, "data.isFirstPage equals true");
        assert.equal(data.isLastPage, false, "data.isLastPage equals false");
        
        for (var i = 0; i < data.bookmarks.length; i++) {
            var page = -1;
            var title = "Not Set";
            switch(i){
                case 0 :
                    page = 6;
                    title = "Diet and Health";
                    break;
            }
            assert.equal(data.bookmarks[i].page, page, "data.bookmarks["+i+"].page equals "+page);
            assert.equal(data.bookmarks[i].title, title, "data.bookmarks["+i+"].title equals "+title);
        }

        assert.ok(data.availableLayouts.includes("presentation", "data.availableLayouts contains presentation"))
        assert.ok(data.availableLayouts.includes("magazine", "data.availableLayouts contains magazine"))
        assert.ok(data.availableLayouts.includes("continuous", "data.availableLayouts contains continuous"))

        for (var i = 0; i < data.bounds.length; i++) {
            assert.equal(data.bounds[i][0], 990, "data.bounds["+i+"][0] equals 990");
            assert.equal(data.bounds[i][1], 1185, "data.bounds["+i+"][1] equals 1185");
        }
        clearTimeout(fallback);
        done();
    });

    IDRViewer.setup(); // Should trigger 'ready' event listener
});


QUnit.test( "pagechange listener next", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.page, 2, "event.page equals 2");
        assert.equal(data.pagecount, 10, "event.pagecount equals 10");
        assert.equal(data.isFirstPage , false, "event.isFirstPage equals false");
        assert.equal(data.isLastPage , false, "event.isLastPage equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('pagechange', event);
    };
    IDRViewer.on('pagechange', event);

    IDRViewer.next(); // Should trigger 'pagechange' event listener
});


QUnit.test( "pagechange listener previous", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);

    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.page, 1, "event.page equals 1");
        assert.equal(data.pagecount, 10, "event.pagecount equals 10");
        assert.equal(data.isFirstPage , true, "event.isFirstPage equals true");
        assert.equal(data.isLastPage , false, "event.isLastPage equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('pagechange', event);
    };
    IDRViewer.on('pagechange', event);

    IDRViewer.prev(); // Should trigger 'pagechange' event listener
});

QUnit.test( "pagechange listener goto", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.page, 10, "event.page equals 10");
        assert.equal(data.pagecount, 10, "event.pagecount equals 10");
        assert.equal(data.isFirstPage , false, "event.isFirstPage equals false");
        assert.equal(data.isLastPage , true, "event.isLastPage equals true");
        clearTimeout(fallback);
        done();
        IDRViewer.off('pagechange', event);
    };
    IDRViewer.on('pagechange', event);

    IDRViewer.goToPage(10); // Should trigger 'pagechange' event listener
});

QUnit.test( "zoomchange listener zoomIn", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "specific", "event.zoomType equals specific");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.zoomIn(); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener zoomOut", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "auto", "event.zoomType equals auto");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.zoomOut(); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener setZoom 0% (stop at smallest)", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "specific", "event.zoomType equals specific");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , true, "event.isMinZoom equals true");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(0); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener setZoom 10000% (stop at largest)", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "specific", "event.zoomType equals specific");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , true, "event.isMaxZoom equals true");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(100); // Should trigger 'zoomchange' event listener
});


QUnit.test( "zoomchange listener setZoom 100%", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "specific", "event.zoomType equals specific");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(1); // Should trigger 'zoomchange' event listener
});


QUnit.test( "zoomchange listener setZoom IDRViewer.ZOOM_AUTO", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "auto", "event.zoomType equals auto");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(IDRViewer.ZOOM_AUTO); // Should trigger 'zoomchange' event listener
});


QUnit.test( "zoomchange listener setZoom IDRViewer.ZOOM_ACTUALSIZE", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "actualsize", "event.zoomType equals actualsize");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(IDRViewer.ZOOM_ACTUALSIZE); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener setZoom IDRViewer.ZOOM_FITHEIGHT", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "fitheight", "event.zoomType equals fitheight");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(IDRViewer.ZOOM_FITHEIGHT); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener setZoom IDRViewer.ZOOM_FITWIDTH", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "fitwidth", "event.zoomType equals fitwidth");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(IDRViewer.ZOOM_FITWIDTH); // Should trigger 'zoomchange' event listener
});

QUnit.test( "zoomchange listener setZoom IDRViewer.ZOOM_FITPAGE", function( assert ) {
    assert.expect(5);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.zoomType , "fitpage", "event.zoomType equals fitpage");
        assert.equal(data.scale , undefined, "event.scale equals undefined");
        assert.equal(data.isMinZoom , false, "event.isMinZoom equals false");
        assert.equal(data.isMaxZoom , false, "event.isMaxZoom equals false");
        clearTimeout(fallback);
        done();
        IDRViewer.off('zoomchange', event);
    };
    IDRViewer.on('zoomchange', event);

    IDRViewer.setZoom(IDRViewer.ZOOM_FITPAGE); // Should trigger 'zoomchange' event listener
});


QUnit.test( "layoutchange listener setLayout IDRViewer.LAYOUT_PRESENTATION", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.layout  , "presentation", "event.layout equals presentation");
        clearTimeout(fallback);
        done();
        IDRViewer.off('layoutchange', event);
    };
    IDRViewer.on('layoutchange', event);

    IDRViewer.setLayout(IDRViewer.LAYOUT_PRESENTATION); // Should trigger 'layoutchange' event listener
});

QUnit.test( "layoutchange listener setLayout IDRViewer.LAYOUT_MAGAZINE", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.layout  , "magazine", "event.layout equals magazine");
        clearTimeout(fallback);
        done();
        IDRViewer.off('layoutchange', event);
    };
    IDRViewer.on('layoutchange', event);

    IDRViewer.setLayout(IDRViewer.LAYOUT_MAGAZINE); // Should trigger 'layoutchange' event listener
});


QUnit.test( "layoutchange listener setLayout IDRViewer.LAYOUT_CONTINUOUS", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.layout  , "continuous", "event.layout equals continuous");
        clearTimeout(fallback);
        done();
        IDRViewer.off('layoutchange', event);
    };
    IDRViewer.on('layoutchange', event);

    IDRViewer.setLayout(IDRViewer.LAYOUT_CONTINUOUS); // Should trigger 'layoutchange' event listener
});

QUnit.test( "selectchange listener setSelectMode IDRViewer.SELECT_PAN", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.type  , "pan", "event.type equals pan");
        clearTimeout(fallback);
        done();
        IDRViewer.off('selectchange', event);
    };
    IDRViewer.on('selectchange', event);

    IDRViewer.setSelectMode(IDRViewer.SELECT_PAN); // Should trigger 'layoutchange' event listener
});

QUnit.test( "selectchange listener setSelectMode IDRViewer.SELECT_SELECT", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    // Fallback to ensure the test will end if the listener does not fire
    var fallback = setTimeout(function() {
        done();
    }, 1000);
    
    var event = function(data) {
        assert.ok(true, "listener was fired");
        assert.equal(data.type  , "select", "event.type equals select");
        clearTimeout(fallback);
        done();
        IDRViewer.off('selectchange', event);
    };
    IDRViewer.on('selectchange', event);

    IDRViewer.setSelectMode(IDRViewer.SELECT_SELECT); // Should trigger 'layoutchange' event listener
});
