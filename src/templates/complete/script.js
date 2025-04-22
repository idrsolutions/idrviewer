(function () {
    "use strict";
    const LanguageHelper = (function () {
        const translationsList = {
            "da":{"control.sidebar":"Sidepanel","control.theme-toggle":"Skift tema","control.prev":"Forrige side","control.next":"Næste side","control.select":"Vælg","control.move":"Flytte","control.zoom-out":"Zoom ud","control.zoom-in":"Zoom ind","control.actual-size":"Faktisk størrelse","control.fit-width":"Tilpas bredde","control.fit-height":"Tilpas højde","control.fit-page":"Tilpas side","control.auto":"Automatisk","control.fullscreen":"Fuld skærm","control.thumbnails":"Miniaturebilleder","control.bookmarks":"Bogmærker","control.presentation":"Præsentation","control.magazine":"Magasin","control.continuous":"Kontinuerlig","control.search":"Søg","control.page":"Side","search.search":"Søg","search.match-case":"Match case","search.limit-results-1":"Begræns resultater til 1 pr. side","search.limit-results-500":"Begrænset til de første 500 resultater","search.unavailable":"Søgning ikke tilgængelig","search.loading":"Indlæser"},
            "el":{"control.sidebar":"Πλευρική Μπάρα","control.theme-toggle":"Αλλαγή Θέματος","control.prev":"Προηγούμενη Σελίδα","control.next":"Επόμενη Σελίδα","control.select":"Επιλογή","control.move":"Μετατόπιση","control.zoom-out":"Σμίκρυνση","control.zoom-in":"Μεγέθυνση","control.actual-size":"Πραγματικό Μέγεθος","control.fit-width":"Προσαρμογή σε Πλάτος","control.fit-height":"Προσαρμογή σε Ύψος","control.fit-page":"Προσαρμογή Πλήρους Σελίδας","control.auto":"Αυτόματα","control.fullscreen":"Πλήρης Οθόνη","control.thumbnails":"Μικρογραφίες","control.bookmarks":"Σελιδοδείκτες","control.presentation":"Παρουσίαση","control.magazine":"Περιοδικό","control.continuous":"Συνεχής","control.search":"Αναζήτηση","control.page":"Σελίδα","search.search":"Αναζήτηση","search.match-case":"Ταίριασμα Κεφαλαίων-Πεζών","search.limit-results-1":"Περιορισμός αποτελεσμάτων 1 ανά σελίδα","search.limit-results-500":"Περιορισμός στα πρώτα 500 αποτελέσματα","search.unavailable":"Αναζήτηση μη διαθέσιμη","search.loading":"Φόρτωση"},
            "es":{"control.sidebar":"Panel lateral","control.theme-toggle":"Alternar tema","control.prev":"Página anterior","control.next":"Siguiente página","control.select":"Selecto","control.move":"Mover","control.zoom-out":"Zoom afuera","control.zoom-in":"Zoom en","control.actual-size":"Tamaño real","control.fit-width":"Adaptar anchura","control.fit-height":"Adaptar altura","control.fit-page":"Adaptar página","control.auto":"Automático","control.fullscreen":"Pantalla completa","control.thumbnails":"Miniaturas","control.bookmarks":"Marcadores","control.presentation":"Presentación","control.magazine":"Revista","control.continuous":"Continuo","control.search":"Buscar","control.page":"Página","search.search":"Buscar","search.match-case":"Caso de coincidencia","search.limit-results-1":"Límite de resultados 1 por página","search.limit-results-500":"Limitado a los primeros 500 resultados","search.unavailable":"Buscar No disponible","search.loading":"Cargando"},
            "de":{"control.sidebar":"Seitenleiste","control.theme-toggle":"Darstellung wechseln","control.prev":"Vorherige Seite","control.next":"Nächste Seite","control.select":"Auswählen","control.move":"Bewegen","control.zoom-out":"Zoom Out","control.zoom-in":"Zoom In","control.actual-size":"Tatsächliche Grösse","control.fit-width":"Breite füllend","control.fit-height":"Höhe füllend","control.fit-page":"Seite füllend","control.auto":"Automatisch","control.fullscreen":"Ganzer Bildschirm","control.thumbnails":"Mini-Ansichten","control.bookmarks":"Lesezeichen","control.presentation":"Präsentationsdarstellung","control.magazine":"Magazindarstellung","control.continuous":"Fortlaufende Darstellung","control.search":"Suchen","control.page":"Seite","search.search":"Suchen","search.match-case":"Gross-/Kleinschreibung beachten","search.limit-results-1":"Auf 1 Resultat pro Seite begrenzen","search.limit-results-500":"Auf die ersten 500 Resultate begrenzen.","search.unavailable":"Suche nicht verfügbar.","search.loading":"Lade"},
            "fr":{"control.sidebar":"Barre latérale","control.theme-toggle":"Basculer entre les thèmes","control.prev":"Page précédente","control.next":"Page suivante","control.select":"Sélectionner","control.move":"Déplacer","control.zoom-out":"Zoom arrière","control.zoom-in":"Zoom avant","control.actual-size":"Taille réelle","control.fit-width":"Pleine largeur","control.fit-height":"Pleine hauteur","control.fit-page":"Page entière","control.auto":"Automatique","control.fullscreen":"Plein écran","control.thumbnails":"Vignettes","control.bookmarks":"Signets","control.presentation":"Présentation","control.magazine":"Magazine","control.continuous":"En continu","control.search":"Recherche","control.page":"Page","search.search":"Rechercher","search.match-case":"Respecter la casse","search.limit-results-1":"Limiter les résultats à 1 par page","search.limit-results-500":"Limitée aux 500 premiers résultats","search.unavailable":"Recherche non accessible","search.loading":"Chargement en cours"},
            "hi":{"control.sidebar":"साइडबार","control.theme-toggle":"विषय टॉगल","control.prev":"पिछला पृष्ठ","control.next":"अगला पृष्ठ","control.select":"चुनते हैं","control.move":"पान","control.zoom-out":"छोटा करें","control.zoom-in":"बड़ा करें","control.actual-size":"वास्तविक आकार","control.fit-width":"चौड़ाई पर फ़िट","control.fit-height":"ठीक ऊंचाई","control.fit-page":"फिट पेज","control.auto":"स्वचालित","control.fullscreen":"पूर्ण स्क्रीन","control.thumbnails":"थंबनेल","control.bookmarks":"बुकमार्क","control.presentation":"प्रदर्शन","control.magazine":"पत्रिका","control.continuous":"निरंतर","control.search":"खोज","control.page":"पृष्ठ","search.search":"खोज","search.match-case":"मिलान घटना","search.limit-results-1":"सीमा परिणाम 1 प्रति पृष्ठ","search.limit-results-500":"पहले 500 परिणामों तक सीमित है","search.unavailable":"उपलब्ध नहीं खोजें।","search.loading":"लोड हो रहा है"},
            "hr":{"control.sidebar":"Bočna traka","control.theme-toggle":"Izmjena teme","control.prev":"Predhodna stranica","control.next":"Sljedeća stranica","control.select":"Odabir","control.move":"Vodoravni pomak","control.zoom-out":"Umanjeni prikaz","control.zoom-in":"Uvećani prikaz","control.actual-size":"Originalna veličina","control.fit-width":"Prikaz pune širine stranice","control.fit-height":"Prikaz pune visine stranice","control.fit-page":"Prikaz cijele stranice","control.auto":"Automatski","control.fullscreen":"Puni zaslon","control.thumbnails":"Sličice","control.bookmarks":"Oznake stranica","control.presentation":"Prezentacija","control.magazine":"Magazin","control.continuous":"Tekući prikaz","control.search":"Pretraživanje","control.page":"Stranica","search.search":"Pretraživanje","search.match-case":"Razlikuj velika i mala slova","search.limit-results-1":"Ograničenje rezultata na 1 po stranici","search.limit-results-500":"Ograničenje na prvih 500 rezultata","search.unavailable":"Pretraživanje nije omogućeno","search.loading":"Učitavanja"},
            "hu":{"control.sidebar":"Oldalsáv","control.theme-toggle":"Témaváltó","control.prev":"Előző oldal","control.next":"Következő oldal","control.select":"Kijelölés","control.move":"Pásztázás","control.zoom-out":"Kicsinyítés","control.zoom-in":"Nagyítás","control.actual-size":"Tényleges méret","control.fit-width":"Igazítás a szélességhez","control.fit-height":"Igazítás a magassághoz","control.fit-page":"Teljes oldal","control.auto":"Automatikus","control.fullscreen":"Teljes képernyő","control.thumbnails":"Miniatűrök","control.bookmarks":"Könyvjelzők","control.presentation":"Prezentáció","control.magazine":"Magazin","control.continuous":"Folyamatosan","control.search":"Keresés","control.page":"Oldal","search.search":"Keresés","search.match-case":"Kis- és nagybetűk megkülönböztetése","search.limit-results-1":"Oldalanként csak egy találat","search.limit-results-500":"Korlátozás az első 500 találatra.","search.unavailable":"A keresés nem elérhető.","search.loading":"Betöltés"},
            "ja":{"control.sidebar":"サイドバー","control.theme-toggle":"テーマ切換","control.prev":"前のページ","control.next":"次のページ","control.select":"選択","control.move":"パン","control.zoom-out":"縮小","control.zoom-in":"拡大","control.actual-size":"実際のサイズ","control.fit-width":"幅に合わせる","control.fit-height":"高さに合わせる","control.fit-page":"ページに合わせる","control.auto":"自動","control.fullscreen":"フルスクリーン","control.thumbnails":"サムネイル","control.bookmarks":"ブックマーク","control.presentation":"プレゼンテーション","control.magazine":"マガジン","control.continuous":"スクロール","control.search":"検索","control.page":"ページ","search.search":"検索","search.match-case":"大文字・小文字を区別","search.limit-results-1":"結果を1ページ１つに制限する","search.limit-results-500":"最初の500件が表示されます。","search.unavailable":"検索できません","search.loading":"ローディング"},
            "ru":{"control.sidebar":"Боковая панель","control.theme-toggle":"Переключатель темы","control.prev":"Предыдущая страница","control.next":"Следующая страница","control.select":"Выбор","control.move":"Панорамирование","control.zoom-out":"Уменьшить масштаб","control.zoom-in":"Увеличить масштаб","control.actual-size":"Фактический размер","control.fit-width":"Увеличить по ширине","control.fit-height":"Увеличить по высоте","control.fit-page":"Масштаб по размеру страницы","control.auto":"Автоматически","control.fullscreen":"Полный экран","control.thumbnails":"Эскиз","control.bookmarks":"Закладка","control.presentation":"Презентация","control.magazine":"Журнал","control.continuous":"Лента","control.search":"Поиск","control.page":"Страница","search.search":"Поиск","search.match-case":"Поиск по символу","search.limit-results-1":"Ограничить результаты по 1 на страницу","search.limit-results-500":"Ограничено до первых 500 результатов","search.unavailable":"Поиск невозможен","search.loading":"Загрузка"},
            "uk":{"control.sidebar":"Бокова панель","control.theme-toggle":"Перемикач теми","control.prev":"Попередня сторінка","control.next":"Наступна сторінка","control.select":"Вибір","control.move":"Панорамування","control.zoom-out":"Зменшити масштаб","control.zoom-in":"Збільшити масштаб","control.actual-size":"Фактичний розмір","control.fit-width":"Збільши по ширині","control.fit-height":"Збільшити по висоті","control.fit-page":"Масштаб по розміру сторінки","control.auto":"Автоматично","control.fullscreen":"Повний екран","control.thumbnails":"Ескіз","control.bookmarks":"Закладка","control.presentation":"Презентація","control.magazine":"Журнал","control.continuous":"Стрічка","control.search":"Пошук","control.page":"Сторінка","search.search":"Пошук","search.match-case":"Пошук по символу","search.limit-results-1":"Обмежити результат по 1 на сторінку","search.limit-results-500":"Обмежено до перших 500 результатів","search.unavailable":"Пошук неможливий","search.loading":"Завантаження"},
            "zh":{"control.sidebar":"侧 栏","control.theme-toggle":"主题切换","control.prev":"上一页","control.next":"下一页","control.select":"选择","control.move":"左右转动","control.zoom-out":"缩小","control.zoom-in":"放大","control.actual-size":"实际尺寸","control.fit-width":"适合宽度","control.fit-height":"适合高度","control.fit-page":"适合页面","control.auto":"自动","control.fullscreen":"全屏","control.thumbnails":"缩略 图","control.bookmarks":"书签","control.presentation":"介绍","control.magazine":"杂志","control.continuous":"连续的","control.search":"搜索","control.page":"页","search.search":"搜索","search.match-case":"匹配案例","search.limit-results-1":"每页限制结果 1 个","search.limit-results-500":"仅限前 500 个结果。","search.unavailable":"搜索不可用.","search.loading":"装载中"},
        };

        const lang = (navigator.language || navigator.userLanguage).substr(0, 2);
        const translations = translationsList[lang] ? translationsList[lang] : false;

        return {
            getTranslation: function (name) {
                return translations ? translations[name] : null;
            },

            updateElements: function () {
                if (translations) {
                    let i, element;
                    const titleElements = document.querySelectorAll('[data-lang-title]');
                    for (i = 0; i < titleElements.length; i++) {
                        element = titleElements[i];
                        if (translations[element.dataset.langTitle]) {
                            element.title = translations[element.dataset.langTitle];
                        }
                    }
                    const textElements = document.querySelectorAll('[data-lang-text]');
                    for (i = 0; i < textElements.length; i++) {
                        element = textElements[i];
                        if (translations[element.dataset.langText]) {
                            element.innerText = translations[element.dataset.langText];
                        }
                    }
                }
            }
        };
    })();

    /**
     * Shorthand helper function to getElementById
     * @param id
     * @returns {Element}
     */
    const d = function (id) {
        return document.getElementById(id);
    };

    const ClassHelper = (function () {
        return {
            addClass: function (ele, name) {
                const classes = ele.className.length !== 0 ? ele.className.split(' ') : [];
                const index = classes.indexOf(name);
                if (index === -1) {
                    classes.push(name);
                    ele.className = classes.join(' ');
                }
            },

            removeClass: function (ele, name) {
                const classes = ele.className.length !== 0 ? ele.className.split(' ') : [];
                const index = classes.indexOf(name);
                if (index !== -1) {
                    classes.splice(index, 1);
                }
                ele.className = classes.join(' ');
            },

            toggleClass: function (ele, name) {
                const classes = ele.className.length !== 0 ? ele.className.split(' ') : [];
                const index = classes.indexOf(name);
                let wasClassAdded;
                if (index === -1) {
                    classes.push(name);
                    wasClassAdded = true;
                } else {
                    classes.splice(index, 1);
                    wasClassAdded = false;
                }
                ele.className = classes.join(' ');
                return wasClassAdded;
            }
        };
    })();

    /**
     * Encapsulation of sidebar functionality
     */
    const Sidebar = (function () {
        const Sidebar = {},
            panels = {};
        let sidebar,
            sidebarToggleBtn,
            defaultPanel,
            currentPanel;

        const setSidebarNavTabIndex = function(index) {
            document.querySelectorAll("#sidebar-controls > button").forEach(button => {
                button.setAttribute("tabindex", index);
            });
        };

        IDRViewer.on('ready', function (data) {
            sidebarToggleBtn = d('btnSideToggle');
            sidebar = d('sidebar');

            sidebarToggleBtn.addEventListener('click', Sidebar.toggleSidebar);

            for (let prop in panels) {
                panels[prop].setup(data);
                panels[prop].hide();
            }
            currentPanel = defaultPanel;

            sidebar.ariaHidden = "true";
            setSidebarNavTabIndex("-1");
        });

        Sidebar.register = function (name, handler, isDefault) {
            panels[name] = handler;
            if (isDefault) {
                defaultPanel = name;
            }
        };

        Sidebar.switchTo = function (name) {
            if (currentPanel === name) {
                return;
            }
            panels[currentPanel].hide();
            currentPanel = name;
            panels[currentPanel].show();
        };

        Sidebar.openSidebar = function () {
            if (document.body.className.indexOf('sidebar-open') === -1) {
                Sidebar.toggleSidebar();
            }
        };

        /**
         * Toggle the sidebar open and closed
         */
        Sidebar.toggleSidebar = function () {
            if (ClassHelper.toggleClass(document.body, 'sidebar-open')) {
                sidebarToggleBtn.ariaExpanded = "true";
                sidebar.ariaHidden = "false";
                setSidebarNavTabIndex("0");
                panels[currentPanel].show();
            } else {
                panels[currentPanel].hide();
                sidebarToggleBtn.ariaExpanded = "false";
                sidebar.ariaHidden = "true";
                setSidebarNavTabIndex("-1");
            }
        };

        return Sidebar;
    })();

    /**
     * Encapsulation of Search panel
     */
    (function () {
        let searchPanel,
            searchBtn,
            isSearchLoaded,
            searchInputEle,
            resultsSelectEle,
            resultsCountEle,
            highlightNextBtn,
            highlightPrevBtn,
            matchCaseCheckbox,
            limitResultsCheckbox;

        const setup = function () {
            searchBtn = d('btnSearch');
            searchBtn.addEventListener('click', function () {
                Sidebar.switchTo('search');
            });

            searchPanel = d('search-panel');
            searchInputEle = d('searchInput');
            resultsSelectEle = d('searchHighlightSelected');
            resultsCountEle = d('searchHighlightTotal');
            highlightNextBtn = d('nextHighlight');
            highlightPrevBtn = d('prevHighlight');
            matchCaseCheckbox = d('cbMatchCase');
            limitResultsCheckbox = d('cbLimitResults');

            searchInputEle.value = LanguageHelper.getTranslation('search.loading') || 'Loading';
            searchInputEle.disabled = 'disabled';
            searchInputEle.addEventListener('input', doSearch);
            searchInputEle.addEventListener('keydown', function (event) {
                switch (event.key) {
                    case "Esc": // IE/Edge specific value
                    case "Escape":
                        if (searchInputEle.value !== "") {
                            searchInputEle.value = "";
                            doSearch();
                        } else {
                            searchInputEle.blur();
                            Sidebar.toggleSidebar();
                        }
                        break;
                    case "Enter":
                        event.shiftKey ? IDRViewer.prevSearchResult() : IDRViewer.nextSearchResult();
                        break;
                }
            });
            matchCaseCheckbox.addEventListener('click', doSearch);
            limitResultsCheckbox.addEventListener('click', doSearch);

            highlightNextBtn.addEventListener('click', function () {
                IDRViewer.nextSearchResult();
            });
            highlightPrevBtn.addEventListener('click', function () {
                IDRViewer.prevSearchResult();
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
                    Sidebar.openSidebar();
                    Sidebar.switchTo('search');
                    searchInputEle.focus();
                    searchInputEle.select();
                    event.preventDefault();
                }
            });

            IDRViewer.on("searchresultselected", function (data) {
                resultsSelectEle.innerText = data.resultIndex + 1;
            });
        };

        const clickHandler = function (e) {
            const count = IDRViewer.selectSearchResult(parseInt(this.dataset.page), parseInt(this.dataset.index));
            if (count) resultsSelectEle.innerText = String(count);

            e.preventDefault();
        };

        const htmlEncode = function(string) {
            return string.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        };

        const setNextPrevButtonsDisabled = function (disable) {
            highlightNextBtn.ariaDisabled = String(disable);
            highlightPrevBtn.ariaDisabled = String(disable);
        };

        const doSearch = function () {
            const resultDiv = document.getElementById('searchResults');
            resultDiv.innerText = '';

            const searchTerm = searchInputEle.value;
            const matchCase = matchCaseCheckbox.checked;
            const limitOnePerPage = limitResultsCheckbox.checked;

            const results = IDRViewer.search(searchTerm, matchCase, limitOnePerPage, true);

            resultsCountEle.innerText = String(results.length);
            resultsSelectEle.innerText = "0";

            setNextPrevButtonsDisabled(results.length === 0);

            const docFrag = document.createDocumentFragment();
            for (let i = 0; i < results.length && i < 500; i++) {
                const pg = results[i].page;
                const index = results[i].index;

                const link = document.createElement('a');
                link.href = '?page=' + pg;
                link.innerHTML = pg + " - " + htmlEncode(results[i].preSnippet) + "<b>" + htmlEncode(results[i].result) + "</b>" + htmlEncode(results[i].postSnippet);
                link.className = 'result';
                link.dataset.page = pg;
                link.dataset.index = index;
                link.addEventListener('click', clickHandler);

                docFrag.appendChild(link);
            }
            if (results.length >= 500) {
                const element = document.createElement('span');
                element.innerText = LanguageHelper.getTranslation('search.limit-results-500') || 'Limited to first 500 results.';
                element.className = 'result';
                docFrag.appendChild(element);
            }
            resultDiv.appendChild(docFrag);
        };

        Sidebar.register('search', {
            setup: setup,
            show: function () {
                ClassHelper.removeClass(searchPanel, 'hidden');
                searchBtn.ariaSelected = "true";

                const loadListener = function (loaded) {
                    if (loaded) {
                        searchInputEle.value = '';
                        searchInputEle.disabled = '';
                        searchInputEle.focus();
                    } else {
                        searchInputEle.value = LanguageHelper.getTranslation('search.unavailable') || 'Search not available.';
                    }
                };
                const progressListener = function (percentageLoaded) {
                    searchInputEle.value = (LanguageHelper.getTranslation('search.loading') || 'Loading') + ' (' + percentageLoaded + '%)';
                };
                if (!isSearchLoaded) {
                    isSearchLoaded = true;
                    IDRViewer.loadSearch(loadListener, progressListener);
                }
                searchInputEle.focus();
            },
            hide: function () {
                ClassHelper.addClass(searchPanel, 'hidden');
                searchBtn.ariaSelected = "false";
            }
        });
    })();

    /**
     * Encapsulation of Thumbnails panel
     */
    (function () {
        const loadedThumbsArray = [],
            thumbnailPositions = [],
            MAX_THUMBNAIL_WIDTH = 160,
            MAX_THUMBNAIL_HEIGHT = 200;
        let thumbnailPanel,
            thumbnailBtn,
            imageType,
            pgCount,
            curPg,
            baseUrl,
            scrollSidebar = true,
            thumbnailTimeout,
            spinnerInterval;

        const setup = function (data) {
            thumbnailBtn = d('btnThumbnails');
            thumbnailBtn.addEventListener('click', function () {
                Sidebar.switchTo('thumbnails');
            });

            thumbnailPanel = d('thumbnails-panel');
            thumbnailPanel.addEventListener('scroll', handleThumbnailBarScroll);

            new ResizeObserver(handleThumbnailBarScroll).observe(thumbnailPanel);

            curPg = data.page;
            pgCount = data.pagecount;
            imageType = data.thumbnailType;
            baseUrl = data.url || "";

            loadThumbnailFrames(data.bounds);
            // Initialise loaded array
            for (let i = 0; i < pgCount; i++) {
                loadedThumbsArray[i] = false;
            }
        };

        /**
         * Load the frames for all the thumbnails
         * @param bounds Page bound array
         */
        const loadThumbnailFrames = function (bounds) {
            const heights = [];
            // Calculate height for max width of 160px and max height of 200px
            for (let i = 0; i < bounds.length; i++) {
                const height = Math.floor(bounds[i][1] * (MAX_THUMBNAIL_WIDTH / bounds[i][0]));
                heights[i] = (bounds[i][0] > bounds[i][1] || height <= MAX_THUMBNAIL_HEIGHT) ? height : MAX_THUMBNAIL_HEIGHT;
            }

            const clickHandler = function (e) {
                scrollSidebar = false;
                IDRViewer.goToPage(this.dataset.page);
                e.preventDefault();
            }

            for (let page = 1; page <= bounds.length; page++) {
                const ele = document.createElement('a');
                ele.style.height = heights[page - 1] + 'px';
                ele.className = 'thumbnail';
                ele.href = '?page=' + page;
                ele.id = 'thumb' + page;
                ele.dataset.page = String(page);
                ele.addEventListener('click', clickHandler);
                ele.setAttribute("tabindex", "-1");
                ele.setAttribute('title', (LanguageHelper.getTranslation('control.page') || 'Page') + ' ' + page);
                const margin = Math.floor((heights[page - 1] - 42) / 2);
                ele.innerHTML = '<div class="spinner" style="margin-top: ' + margin + 'px;"></div>';
                thumbnailPanel.appendChild(ele);
            }

            for (let page = 1; page <= bounds.length; page++) {
                thumbnailPositions[page - 1] = thumbnailPanel.children[page - 1].offsetTop;
            }
        };

        const handleThumbnailBarScroll = function () {
            if (!spinnerInterval) {
                spinnerInterval = setInterval(showVisibleSpinners, 250);
            }
            if (thumbnailTimeout) {
                clearTimeout(thumbnailTimeout);
            }
            thumbnailTimeout = setTimeout(loadVisibleThumbnails, 250);
        };

        const showVisibleSpinners = function () {
            const startY = thumbnailPanel.scrollTop;
            const endY = startY + thumbnailPanel.clientHeight;
            for (let index = 0; index < pgCount; index++) {
                if (!loadedThumbsArray[index]) {
                    if (thumbnailPositions[index] + MAX_THUMBNAIL_WIDTH > startY && thumbnailPositions[index] < endY) {
                        ClassHelper.addClass(thumbnailPanel.children[index].firstChild, 'spinning');
                    } else {
                        ClassHelper.removeClass(thumbnailPanel.children[index].firstChild, 'spinning');
                    }
                }
            }
        };

        const loadVisibleThumbnails = function () {
            if (spinnerInterval) {
                spinnerInterval = clearInterval(spinnerInterval);
            }
            thumbnailTimeout = null;

            // load thumbs in view
            for (let thumbIndex = 0; thumbIndex < pgCount; thumbIndex++) {
                if (!loadedThumbsArray[thumbIndex]) {
                    const curThumb = thumbnailPanel.children[thumbIndex];
                    // Bails out of the loop when the next thumbnail is below the viewable area
                    if (curThumb.offsetTop > thumbnailPanel.scrollTop + thumbnailPanel.clientHeight) {
                        break;
                    }
                    if (curThumb.offsetTop + curThumb.clientHeight > thumbnailPanel.scrollTop) {
                        curThumb.innerHTML = '<img src="' + baseUrl + 'thumbnails/' + (thumbIndex + 1) + '.' + imageType + '" />';
                        loadedThumbsArray[thumbIndex] = true;
                    }
                }
            }
        };

        IDRViewer.on('pagechange', function (data) {
            curPg = data.page;
            if (thumbnailPanel.className.indexOf('hidden') === -1) {
                updateThumbnailPanelToCurrentPage();
            }
            scrollSidebar = true;
        });

        const updateThumbnailPanelToCurrentPage = function () {
            const curThumb = thumbnailPanel.children[curPg - 1];
            if (curThumb.className.indexOf('currentPageThumbnail') === -1) {

                for (let i = 0; i < pgCount; i++) {
                    ClassHelper.removeClass(thumbnailPanel.children[i], 'currentPageThumbnail');
                }

                ClassHelper.addClass(curThumb, 'currentPageThumbnail');

                if (scrollSidebar) {
                    curThumb.scrollIntoView();
                }
            }
        };

        Sidebar.register('thumbnails', {
            setup: setup,
            show: function () {
                ClassHelper.removeClass(thumbnailPanel, 'hidden');
                thumbnailBtn.ariaSelected = "true";

                setTimeout(showVisibleSpinners, 250);
                loadVisibleThumbnails();
                updateThumbnailPanelToCurrentPage();
            },
            hide: function () {
                ClassHelper.addClass(thumbnailPanel, 'hidden');
                thumbnailBtn.ariaSelected = "false";
            }
        }, true);
    })();

    /**
     * Encapsulation of Bookmarks panel
     */
    (function () {
        let bookmarkPanel,
            bookmarkBtn;

        const setup = function (data) {
            bookmarkBtn = d('btnBookmarks');
            bookmarkBtn.addEventListener('click', function () {
                Sidebar.switchTo('bookmarks');
            });

            bookmarkPanel = d('bookmarks-panel');
            if (data.bookmarks.length > 0) {
                addBookmark(bookmarkPanel, data.bookmarks);
            } else {
                ClassHelper.addClass(bookmarkBtn, 'hidden');
            }
        };

        const clickHandler = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.detail === 2) {
                this.parentElement.classList.toggle("open");
                return;
            }
            IDRViewer.goToPage(parseInt(this.dataset.page), this.dataset.zoom);
        };

        const addBookmark = function (container, bookmarks) {
            const outer = document.createElement('div');
            outer.classList.add("bookmark-container");
            for (let i = 0; i < bookmarks.length; i++) {
                const bookmark = bookmarks[i];
                const bookmarkEle = document.createElement('div');
                bookmarkEle.classList.add("bookmark-item");
                const a = document.createElement('a');
                a.title = 'Page ' + bookmark.page;
                a.innerText = bookmark.title;
                a.dataset.page = bookmark.page;
                a.dataset.zoom = bookmark.zoom;
                a.href = "?page=" + a.dataset.page;
                a.addEventListener('click', clickHandler);
                bookmarkEle.appendChild(a);
                outer.appendChild(bookmarkEle);
                if (typeof(bookmark.children) != 'undefined') {
                    bookmarkEle.classList.add("parent");

                    const toggle = document.createElement("div");
                    toggle.classList.add("toggle");
                    toggle.tabIndex = 0;
                    bookmarkEle.prepend(toggle);
                    const toggleChildren = () => bookmarkEle.classList.toggle("open");
                    toggle.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleChildren();
                    });
                    toggle.addEventListener('keypress', event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleChildren();
                        }
                    });

                    addBookmark(bookmarkEle, bookmark.children);
                }
            }
            container.appendChild(outer);
        };

        Sidebar.register('bookmarks', {
            setup: setup,
            show: function () {
                ClassHelper.removeClass(bookmarkPanel, 'hidden');
                bookmarkBtn.ariaSelected = "true";
            },
            hide: function () {
                ClassHelper.addClass(bookmarkPanel, 'hidden');
                bookmarkBtn.ariaSelected = "false";
            }
        });
    })();

    /**
     * Encapsulation of navigation controls
     */
    (function () {
        let hasPageLabels,
            pgCountEle,
            pageCount,
            isR2L,
            goBtn,
            nextBtn,
            prevBtn;

        const handleGoBtn = function () {
            IDRViewer.goToPage(parseInt(goBtn.options[goBtn.selectedIndex].value));
            this.blur();
        };

        const populateGoBtn = function (initialPage, pgCount, pageLabels) {
            goBtn.innerText = '';
            for (let i = 1; i <= pgCount; i++) {
                const opt = document.createElement('option');
                opt.value = String(i);
                opt.innerText = pageLabels.length ? pageLabels[i - 1] : String(i);
                goBtn.appendChild(opt);
            }
            goBtn.selectedIndex = initialPage - 1;
        };

        const getPageString = function (page, pageCount) {
            let result = '/ ' + pageCount;
            if (hasPageLabels) {
                result =  '(' + page + ' / ' + pageCount + ')';
            }
            return result;
        };

        const swapNavButtonsForR2L = function () {
            nextBtn.parentNode.insertBefore(prevBtn, nextBtn);
            prevBtn.parentNode.insertBefore(nextBtn, prevBtn.parentNode.firstChild);
            const nextInnerHtml = nextBtn.innerHTML;
            nextBtn.innerHTML = prevBtn.innerHTML;
            prevBtn.innerHTML = nextInnerHtml;
        };

        const keyDownHandler = function (e) {
            if (document.activeElement != null && document.activeElement.tagName === "INPUT") {
                return;
            }
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
                    isR2L ? IDRViewer.next() : IDRViewer.prev();
                    e.preventDefault();
                    break;
                case 39: // Right Arrow
                    isR2L ? IDRViewer.prev() : IDRViewer.next();
                    e.preventDefault();
                    break;

                case 36: // Home
                    IDRViewer.goToPage(1);
                    e.preventDefault();
                    break;
                case 35: // End
                    IDRViewer.goToPage(pageCount);
                    e.preventDefault();
                    break;
            }
        };

        const pageChangeListener = function (data) {
            pgCountEle.innerText = getPageString(data.page, data.pagecount);
            goBtn.selectedIndex = data.page - 1;

            prevBtn.ariaDisabled = String(data.isFirstPage);
            nextBtn.ariaDisabled = String(data.isLastPage);
        };

        IDRViewer.on('ready', function (data) {
            hasPageLabels = !!data.pageLabels.length;
            pageCount = data.pagecount;
            isR2L = data.isR2L;

            pgCountEle = d('pgCount');
            goBtn = d('btnGo');
            prevBtn = d('btnPrev');
            nextBtn = d('btnNext');

            prevBtn.ariaDisabled = String(data.isFirstPage);
            nextBtn.ariaDisabled = String(data.isLastPage);

            goBtn.addEventListener('change', handleGoBtn);
            prevBtn.addEventListener('click', function (e) { IDRViewer.prev(); e.preventDefault(); });
            nextBtn.addEventListener('click', function (e) { IDRViewer.next(); e.preventDefault(); });

            if (data.isR2L) {
                swapNavButtonsForR2L();
            }

            document.addEventListener('keydown', keyDownHandler);

            populateGoBtn(data.page, data.pagecount, data.pageLabels);

            pgCountEle.innerText = getPageString(data.page, data.pagecount);

            IDRViewer.on('pagechange', pageChangeListener);
        });
    })();

    /**
     * Encapsulation of Zoom controls
     */
    (function () {
        let zoomBtn,
            zoomInBtn,
            zoomOutBtn;

        const handleZoomUpdate = function (data) {
            zoomBtn.value = data.zoomType;
            zoomBtn.options[0].innerText = Math.floor(data.zoomValue * 100) + '%';

            zoomOutBtn.ariaDisabled = String(data.isMinZoom);
            zoomInBtn.ariaDisabled = String(data.isMaxZoom);
        };

        const handleZoomBtn = function () {
            const zoomType = zoomBtn.value;
            if (zoomType !== IDRViewer.ZOOM_SPECIFIC) {
                IDRViewer.setZoom(zoomType);
            }
            this.blur();
        };

        IDRViewer.on('ready', function () {
            zoomBtn = d('btnZoom');
            zoomInBtn = d('btnZoomIn');
            zoomOutBtn = d('btnZoomOut');

            zoomBtn.addEventListener('change', handleZoomBtn);

            zoomInBtn.addEventListener('click', function (e) { IDRViewer.zoomIn(); e.preventDefault(); });
            zoomOutBtn.addEventListener('click', function (e) { IDRViewer.zoomOut(); e.preventDefault(); });

            document.addEventListener('keydown', function (event) {
                if (event.ctrlKey || event.metaKey) {
                    if (event.key === '0') {
                        IDRViewer.setZoom(IDRViewer.ZOOM_AUTO);
                        event.preventDefault();
                    } else if (event.key === '-') {
                        IDRViewer.zoomOut();
                        event.preventDefault();
                    } else if (event.key === '+' || event.key === '=') {
                        IDRViewer.zoomIn();
                        event.preventDefault();
                    }
                }
            });

            document.addEventListener('wheel', function (event) {
                if (event.ctrlKey || event.metaKey) {
                    if (event.deltaY > 0) {
                        IDRViewer.zoomOut();
                        event.preventDefault();
                    } else if (event.deltaY < 0) {
                        IDRViewer.zoomIn();
                        event.preventDefault();
                    }
                }
            }, { passive: false });

            zoomBtn.value = IDRViewer.ZOOM_AUTO;

            IDRViewer.on('zoomchange', handleZoomUpdate);
        });
    })();

    /**
     * Encapsulation of Layout controls
     */
    (function () {
        let viewBtn;

        const handleViewBtn = function () {
            IDRViewer.setLayout(viewBtn.value);
            this.blur();
        };

        const setupLayoutSwitching = function (pgCount, layout, availableLayouts) {
            if (availableLayouts.length > 1 && pgCount > 1) {
                let temp = document.createElement('option');
                temp.innerText = LanguageHelper.getTranslation('control.presentation') || 'Presentation';
                temp.value = IDRViewer.LAYOUT_PRESENTATION;
                viewBtn.appendChild(temp);

                if (availableLayouts.indexOf(IDRViewer.LAYOUT_MAGAZINE) !== -1) {
                    temp = document.createElement('option');
                    temp.innerText = LanguageHelper.getTranslation('control.magazine') || 'Magazine';
                    temp.value = IDRViewer.LAYOUT_MAGAZINE;
                    viewBtn.appendChild(temp);
                }
                if (availableLayouts.indexOf(IDRViewer.LAYOUT_CONTINUOUS) !== -1) {
                    temp = document.createElement('option');
                    temp.innerText = LanguageHelper.getTranslation('control.continuous') || 'Continuous';
                    temp.value = IDRViewer.LAYOUT_CONTINUOUS;
                    viewBtn.appendChild(temp);
                }
                viewBtn.addEventListener('change', handleViewBtn);
                viewBtn.value = layout;
            } else {
                ClassHelper.addClass(viewBtn, 'hidden');
            }
        };

        IDRViewer.on('ready', function (data) {
            viewBtn = d('btnView');
            setupLayoutSwitching(data.pagecount, data.layout, data.availableLayouts);
        });
    })();

    /**
     * Encapsulation of Selection/Panning controls
     */
    (function () {
        let moveBtn,
            selectBtn;

        const updateSelectionButtons = function (mode) {
            switch (mode) {
                case IDRViewer.SELECT_PAN:
                    selectBtn.ariaChecked = "false";
                    moveBtn.ariaChecked = "true";
                    break;
                case IDRViewer.SELECT_SELECT:
                    moveBtn.ariaChecked = "false";
                    selectBtn.ariaChecked = "true";
                    break;
            }
        };

        const handleSelectionChange = function (data) {
            updateSelectionButtons(data.type);
        };

        IDRViewer.on('ready', function (data) {
            moveBtn = d('btnMove');
            selectBtn = d('btnSelect');

            moveBtn.addEventListener('click', function (e) { IDRViewer.setSelectMode(IDRViewer.SELECT_PAN); e.preventDefault(); });
            selectBtn.addEventListener('click', function (e) { IDRViewer.setSelectMode(IDRViewer.SELECT_SELECT); e.preventDefault(); });

            updateSelectionButtons(data.selectMode);

            IDRViewer.on('selectchange', handleSelectionChange);
        });
    })();

    /**
     * Main setup function that runs on load
     */
    IDRViewer.on('ready', function (data) {
        LanguageHelper.updateElements(); // Set up localization

        document.title = data.title ? data.title : data.fileName; // Set title

        // Trigger a relayout when opening/closing the sidebar changes the viewport bounds
        d('idrviewer').addEventListener('transitionend', function(event) {
            if (event.target.id !== 'idrviewer') {
                return;
            }
            IDRViewer.updateLayout();
        });

        // Set up theme toggle
        const setTheme = function(isDarkTheme) {
            ClassHelper.removeClass(document.body, "light-theme");
            ClassHelper.removeClass(document.body, "dark-theme");
            ClassHelper.addClass(document.body, isDarkTheme ? "dark-theme" : "light-theme");
        };
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
        d('btnThemeToggle').addEventListener('click', function() {
            setTheme(document.body.className.indexOf('dark-theme') === -1);
        });
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            setTheme(event.matches);
        });

        // Set up fullscreen toggle
        const fullScreenBtn = d('btnFullScreen');
        if (IDRViewer.isFullscreenEnabled()) {
            fullScreenBtn.addEventListener('click', function(e) { IDRViewer.toggleFullScreen(); e.preventDefault(); });
        } else {
            ClassHelper.addClass(fullScreenBtn, 'hidden');
        }

        // Remove buttons which are unnecessary mobile/tablet touch screens
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            ClassHelper.addClass(document.body, 'is-mobile');
        }

        /*~*/
    });
})();
