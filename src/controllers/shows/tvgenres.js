import layoutManager from '../../components/layoutManager';
import loading from '../../components/loading/loading';
import libraryBrowser from '../../scripts/libraryBrowser';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import imageLoader from '../../components/images/imageLoader';
import * as userSettings from '../../scripts/settings/userSettings';
import listView from '../../components/listview/listview';
import lazyLoader from '../../components/lazyLoader/lazyLoaderIntersectionObserver';
import globalize from '../../scripts/globalize';
import { appRouter } from '../../components/appRouter';
import '../../elements/emby-button/emby-button';

/* eslint-disable indent */

    export default function (view, params, tabContent) {
		
		const savedKey = params.topParentId;
		const savedViewKey = 'view-genres-' + savedKey;

		function getCurrentViewStyle() {
			return userSettings.get(savedViewKey) ||  'PosterCard';
		};
				
		function setCurrentViewStyle(viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
		};
		
        function getPageData() {
            const key = getSavedQueryKey();
            let pageData = data[key];

            if (!pageData) {
                pageData = data[key] = {
                    query: {
                        SortBy: 'Random',
                        SortOrder: 'Ascending',
                        IncludeItemTypes: 'Series',
                        Recursive: true,
                        EnableTotalRecordCount: false
                    },
                    view: getCurrentViewStyle()
                };
                pageData.query.ParentId = params.topParentId;
                libraryBrowser.loadSavedQueryValues(key, pageData.query);
            }

            return pageData;
        }

        function getQuery() {
            return getPageData().query;
        }

        function getSavedQueryKey() {
            return libraryBrowser.getSavedQueryKey('seriesgenres');
        }

        function getPromise() {
            loading.show();
            const query = getQuery();
            return ApiClient.getGenres(ApiClient.getCurrentUserId(), query);
        }

        function enableScrollX() {
            return !layoutManager.desktop;
        }

        function getThumbShape() {
            return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
        }

        function getPortraitShape() {
            return enableScrollX() ? 'overflowPortrait' : 'portrait';
        }

        function fillItemsContainer(entry) {
            const elem = entry.target;
            const id = elem.getAttribute('data-id');
            const viewStyle = getCurrentViewStyle();
            let limit = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 5 : 9;

            if (enableScrollX()) {
                limit = 10;
            }
			const allowBottomPadding = !enableScrollX();
			
            const enableImageTypes = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 'Primary,Backdrop,Thumb' : 'Primary';
            const query = {
                SortBy: 'Random',
                SortOrder: 'Ascending',
                IncludeItemTypes: 'Series',
                Recursive: true,
                Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
                ImageTypeLimit: 1,
                EnableImageTypes: enableImageTypes,
                Limit: limit,
                GenreIds: id,
                EnableTotalRecordCount: false,
                ParentId: params.topParentId
            };
            ApiClient.getItems(ApiClient.getCurrentUserId(), query).then(function (result) {
				
				let html = "";
				
				if (viewStyle == 'Thumb') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						centerText: true,
						showTitle: true,
						lazy: true,
						scalable: true,
						allowBottomPadding: allowBottomPadding,
						showDetailsMenu: true,
						showYear: true
					});
				} else if (viewStyle == 'ThumbCard') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						lazy: true,
						cardLayout: true,
						centerText: true,
						showTitle: true,
						scalable: true,
						allowBottomPadding: allowBottomPadding,
						showDetailsMenu: true,
						showYear: true
					});
				} else if (viewStyle == 'Banner') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'banner',
						overlayMoreButton: true,
						preferBanner: true,
						centerText: true,
						showTitle: false,
						allowBottomPadding: allowBottomPadding,
						showYear: false,
						showDetailsMenu: true,
						scalable: true,
						lazy: true
					});
				} else if (viewStyle == 'List') {
					elem.classList.add('vertical-list');
					elem.classList.remove('vertical-wrap');
				
					html += listView.getListViewHtml({
						items: result.Items
					});
				} else if (viewStyle == 'PosterCard') {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'auto',
						showTitle: true,
						showYear: true,
						lazy: true,
						allowBottomPadding: allowBottomPadding,
						overlayMoreButton: true,
						centerText: true,
						scalable: true,
						showDetailsMenu: true,
						cardLayout: true
					});
				} else {
					html += cardBuilder.getCardsHtml(result.Items, {
						shape: 'auto',
						overlayMoreButton: true,
						allowBottomPadding: allowBottomPadding,
						centerText: true,
						showYear: true,
						lazy: true,
						scalable: true,
						showDetailsMenu: true,
						showTitle: true
					});
				}
				
				elem.innerHTML = html;
				imageLoader.lazyChildren(elem);
			
                if (result.Items.length >= query.Limit) {
                    tabContent.querySelector('.btnMoreFromGenre' + id + ' .material-icons').classList.remove('hide');
                }
            });
        }

        function reloadItems(context, promise) {
            const query = getQuery();
            promise.then(function (result) {
                const elem = context.querySelector('#items');
                let html = '';
                const items = result.Items;

                for (const item of items) {
                    html += '<div class="verticalSection">';
                    html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">';
                    html += '<a is="emby-linkbutton" href="' + appRouter.getRouteUrl(item, {
                        context: 'tvshows',
                        parentId: params.topParentId
                    }) + '" class="more button-flat button-flat-mini sectionTitleTextButton btnMoreFromGenre' + item.Id + '">';
                    html += '<h2 class="sectionTitle sectionTitle-cards">';
                    html += item.Name;
                    html += '</h2>';
                    html += '<span class="material-icons hide chevron_right"></span>';
                    html += '</a>';
                    html += '</div>';
                    if (enableScrollX()) {
                        let scrollXClass = 'scrollX hiddenScrollX';
                        if (layoutManager.tv) {
                            scrollXClass += 'smoothScrollX padded-top-focusscale padded-bottom-focusscale';
                        }
                        html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' lazy padded-left padded-right" data-id="' + item.Id + '">';
                    } else {
                        html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap lazy padded-left padded-right" data-id="' + item.Id + '">';
                    }
                    html += '</div>';
                    html += '</div>';
                }

                if (!result.Items.length) {
                    html = '';

                    html += '<div class="noItemsMessage centerMessage">';
                    html += '<h1>' + globalize.translate('MessageNothingHere') + '</h1>';
                    html += '<p>' + globalize.translate('MessageNoGenresAvailable') + '</p>';
                    html += '</div>';
                }

                elem.innerHTML = html;
                lazyLoader.lazyChildren(elem, fillItemsContainer);
                libraryBrowser.saveQueryValues(getSavedQueryKey(), query);
                loading.hide();
            });
        }

        function fullyReload() {
            self.preRender();
            self.renderTab();
        }

        const self = this;
        const data = {};

        self.getViewStyles = function () {
            return 'Poster,PosterCard,Thumb,ThumbCard'.split(',');
        };

        self.setCurrentViewStyle = function (viewStyle) {
            getPageData().view = viewStyle;
            libraryBrowser.saveViewSetting(getSavedQueryKey(), viewStyle);
            fullyReload();
        };

        self.enableViewSelection = true;
        let promise;

        self.preRender = function () {
            promise = getPromise();
        };

        self.renderTab = function () {
            reloadItems(tabContent, promise);
        };
		
		const btnSelectView = tabContent.querySelector('.btnSelectView');
		btnSelectView.addEventListener('click', (e) => {
			libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
		});
		btnSelectView.addEventListener('layoutchange', function (e) {
			const viewStyle = e.detail.viewStyle;
			setCurrentViewStyle(viewStyle);
			reloadItems(tabContent, promise);
		});
    }

/* eslint-enable indent */
