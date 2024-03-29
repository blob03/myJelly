import loading from '../../components/loading/loading';
import libraryBrowser from '../../scripts/libraryBrowser';
import imageLoader from '../../components/images/imageLoader';
import listView from '../../components/listview/listview';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import { playbackManager } from '../../components/playback/playbackmanager';
import * as userSettings from '../../scripts/settings/userSettings';
import globalize from '../../scripts/globalize';
import Dashboard from '../../utils/dashboard';
import Events from '../../utils/events.ts';

import '../../elements/emby-itemscontainer/emby-itemscontainer';

/* eslint-disable indent */

    export default function (view, params, tabContent) {
		
        function getPageData(context) {
            const key = getSavedQueryKey(context);
            let pageData = data[key];

            if (!pageData) {
                pageData = data[key] = {
                    query: {
                        SortBy: 'SeriesSortName,SortName',
                        SortOrder: 'Ascending',
                        IncludeItemTypes: 'Episode',
                        Recursive: true,
                        Fields: 'PrimaryImageAspectRatio,MediaSourceCount',
                        IsMissing: false,
                        ImageTypeLimit: 1,
                        EnableImageTypes: 'Primary,Backdrop,Thumb',
                        StartIndex: 0
                    },
                    view: libraryBrowser.getSavedView(key) || 'ThumbCard'
                };

                if (userSettings.libraryPageSize() > 0) {
                    pageData.query['Limit'] = userSettings.libraryPageSize();
                }

                pageData.query.ParentId = params.topParentId;
                libraryBrowser.loadSavedQueryValues(key, pageData.query);
            }

            return pageData;
        }

        function getQuery(context) {
            return getPageData(context).query;
        }

        function getSavedQueryKey(context) {
            if (!context.savedQueryKey) {
                context.savedQueryKey = libraryBrowser.getSavedQueryKey('episodes');
            }

            return context.savedQueryKey;
        }
		
		function shuffle() {
			ApiClient.getItem(
				ApiClient.getCurrentUserId(),
				params.topParentId
			).then((item) => {
				playbackManager.shuffle(item);
			});
		}

        function onViewStyleChange() {
            const viewStyle = self.getCurrentViewStyle();
            const itemsContainer = tabContent.querySelector('.itemsContainer');

            if (viewStyle == 'List') {
                itemsContainer.classList.add('vertical-list');
                itemsContainer.classList.remove('vertical-wrap');
            } else {
                itemsContainer.classList.remove('vertical-list');
                itemsContainer.classList.add('vertical-wrap');
            }

            itemsContainer.innerHTML = '';
        }

        function reloadItems(page) {
            loading.show();
            isLoading = true;
            const query = getQuery(page);
            ApiClient.getItems(Dashboard.getCurrentUserId(), query).then(function (result) {
                function onNextPageClick() {
                    if (isLoading) {
                        return;
                    }

                    if (userSettings.libraryPageSize() > 0) {
                        query.StartIndex += parseInt(query.Limit, 10);
                    }
                    reloadItems(tabContent);
                }

                function onPreviousPageClick() {
                    if (isLoading) {
                        return;
                    }

                    if (userSettings.libraryPageSize() > 0) {
                        query.StartIndex = Math.max(0, query.StartIndex - query.Limit);
                    }
                    reloadItems(tabContent);
                }

                window.scrollTo(0, 0);
                let html = '';
                const pagingHtml = libraryBrowser.getQueryPagingHtml({
                    startIndex: query.StartIndex,
                    limit: query.Limit,
                    totalRecordCount: result.TotalRecordCount,
                    showLimit: false,
                    updatePageSizeSetting: false,
                    addLayoutButton: false,
                    sortButton: false,
                    filterButton: false
                });
				
                const viewStyle = self.getCurrentViewStyle();
                const itemsContainer = tabContent.querySelector('.itemsContainer');
				
                if (viewStyle == 'List') {
                    html += listView.getListViewHtml({
                        items: result.Items,
                        sortBy: query.SortBy,
                        showParentTitle: true
                    });
				} else if (viewStyle == 'Thumb') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
						centerText: true,
						showTitle: true,
						lazy: true,
						scalable: true,
						showDetailsMenu: true,
						showYear: true
					});
				} else if (viewStyle == 'ThumbCard') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
						lazy: true,
						cardLayout: true,
						centerText: true,
						showTitle: true,
						scalable: true,
						showDetailsMenu: true,
						showYear: true
					});
                } else {
                    html = cardBuilder.getCardsHtml({
                        items: result.Items,
                        shape: 'backdrop',
                        showTitle: true,
                        showParentTitle: true,
                        overlayText: false,
                        centerText: true,
                        scalable: true,
                        overlayMoreButton: true
                    });
                }
                let elems;

                elems = tabContent.querySelectorAll('.paging');
                for (let i = 0, length = elems.length; i < length; i++) {
                    elems[i].innerHTML = pagingHtml;
                }

                elems = tabContent.querySelectorAll('.btnNextPage');
                for (let i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener('click', onNextPageClick);
                }

                elems = tabContent.querySelectorAll('.btnPreviousPage');
                for (let i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener('click', onPreviousPageClick);
                }

                itemsContainer.innerHTML = html;
                imageLoader.lazyChildren(itemsContainer);
                libraryBrowser.saveQueryValues(getSavedQueryKey(page), query);
				
				const btnShuffle = tabContent.querySelector('.btnShuffle');
				if (btnShuffle)
					btnShuffle.classList.toggle('hide', result.TotalRecordCount < 1);
			
                loading.hide();
                isLoading = false;

                import('../../components/autoFocuser').then(({default: autoFocuser}) => {
                    autoFocuser.autoFocus(page);
                });
            });
        }

        const self = this;
        const data = {};
        let isLoading = false;

        self.showFilterMenu = function () {
            import('../../components/filterdialog/filterdialog').then(({default: filterDialogFactory}) => {
                const filterDialog = new filterDialogFactory({
                    query: getQuery(tabContent),
                    mode: 'episodes',
                    serverId: ApiClient.serverId()
                });
                Events.on(filterDialog, 'filterchange', function () {
                    reloadItems(tabContent);
                });
                filterDialog.show();
            });
        };

        self.getCurrentViewStyle = function () {
            return getPageData(tabContent).view;
        };

        function initPage(tabContent) {
            tabContent.querySelector('.btnFilter').addEventListener('click', function () {
                self.showFilterMenu();
            });
            tabContent.querySelector('.btnSort').addEventListener('click', function (e) {
                libraryBrowser.showSortMenu({
                    items: [{
                        name: globalize.translate('Name'),
                        id: 'SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionTvdbRating'),
                        id: 'CommunityRating,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionDateAdded'),
                        id: 'DateCreated,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionPremiereDate'),
                        id: 'PremiereDate,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionDatePlayed'),
                        id: 'DatePlayed,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionParentalRating'),
                        id: 'OfficialRating,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('OptionPlayCount'),
                        id: 'PlayCount,SeriesSortName,SortName'
                    }, {
                        name: globalize.translate('Runtime'),
                        id: 'Runtime,SeriesSortName,SortName'
                    }],
                    callback: function () {
                        reloadItems(tabContent);
                    },
                    query: getQuery(tabContent),
                    button: e.target
                });
            });
			
			const btnShuffle = tabContent.querySelector('.btnShuffle');
			if (btnShuffle)
				btnShuffle.addEventListener('click', shuffle);
			
            const btnSelectView = tabContent.querySelector('.btnSelectView');
            btnSelectView.addEventListener('click', function (e) {
				libraryBrowser.showLayoutMenu(e.target, self.getCurrentViewStyle(), 'List,Thumb,ThumbCard'.split(','));
            });
            btnSelectView.addEventListener('layoutchange', function (e) {
                const viewStyle = e.detail.viewStyle;
                getPageData(tabContent).view = viewStyle;
                libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent), viewStyle);
                onViewStyleChange();
                reloadItems(tabContent);
            });
        }

        initPage(tabContent);
        onViewStyleChange();

        self.renderTab = function () {
            reloadItems(tabContent);
        };
    }

/* eslint-enable indent */
