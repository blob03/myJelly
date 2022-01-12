import layoutManager from '../../components/layoutManager';
import loading from '../../components/loading/loading';
import libraryBrowser from '../../scripts/libraryBrowser';
import * as userSettings from '../../scripts/settings/userSettings';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import lazyLoader from '../../components/lazyLoader/lazyLoaderIntersectionObserver';
import globalize from '../../scripts/globalize';
import listView from '../../components/listview/listview';
import imageLoader from '../../components/images/imageLoader';
import { appRouter } from '../../components/appRouter';
import '../../elements/emby-button/emby-button';

/* eslint-disable indent */

    export default function (view, params, tabContent) {
		
		const savedQueryKey = params.topParentId;
        const savedViewKey = savedQueryKey + '-genres-view';
		
		function getCurrentViewStyle() {
            return userSettings.get(savedViewKey) ||  'PosterCard';
        };

		function setCurrentViewStyle(viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
            fullyReload();
        };
		
        function getPageData() {
            const key = getSavedQueryKey();
            let pageData = data[key];
			
            if (!pageData) {
				let dflView = getCurrentViewStyle();
		
                pageData = data[key] = {
                    query: {
                        SortBy: 'Random',
                        SortOrder: 'Ascending',
                        IncludeItemTypes: 'Movie',
                        Recursive: true,
                        EnableTotalRecordCount: false
                    },
                    view: dflView
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
            return libraryBrowser.getSavedQueryKey('moviegenres');
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

        const fillItemsContainer = (entry) => {
            const elem = entry.target;
            const id = elem.getAttribute('data-id');
            const viewStyle = getCurrentViewStyle(); 
            let limit = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 5 : 9;

            if (enableScrollX()) {
                limit = 10;
            }

            const enableImageTypes = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 'Primary,Backdrop,Thumb' : 'Primary';
            const query = {
                SortBy: 'Random',
                SortOrder: 'Ascending',
                IncludeItemTypes: 'Movie',
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
				
				if (result.Items.length) {
	
					const allowBottomPadding = !enableScrollX();
					let html = "";
					
					if (viewStyle == 'Thumb') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'backdrop',
							preferThumb: true,
							context: 'movies',
							overlayMoreButton: true,
							centerText: true,
							showTitle: true,
							allowBottomPadding: allowBottomPadding,
							showYear: true
						});
					} else if (viewStyle == 'ThumbCard') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'backdrop',
							preferThumb: true,
							context: 'movies',
							overlayMoreButton: true,
							lazy: true,
							cardLayout: true,
							centerText: true,
							showTitle: true,
							showYear: true
						});
					} else if (viewStyle == 'Banner') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'banner',
							overlayMoreButton: true,
							preferBanner: true,
							centerText: true,
							context: 'movies',
							showTitle: false,
							allowBottomPadding: allowBottomPadding,
							showYear: false,
							lazy: true
						});
					} else if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					
						html += listView.getListViewHtml({
							items: result.Items,
							context: 'movies'
						});
					} else if (viewStyle == 'PosterCard') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'auto',
							context: 'movies',
							showTitle: true,
							showYear: true,
							overlayMoreButton: true,
							centerText: true,
							cardLayout: true
						});
					} else {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'auto',
							overlayMoreButton: true,
							context: 'movies',
							allowBottomPadding: allowBottomPadding,
							centerText: true,
							showYear: true,
							showTitle: true
						});
					}
					
					elem.innerHTML = html;
					imageLoader.lazyChildren(elem);
					
					if (result.Items.length >= query.Limit) {
						tabContent.querySelector('.btnMoreFromGenre' + id + ' .material-icons').classList.remove('hide');
					}
					
					elem.classList.remove('hide');
				} 
            });
        };

        function reloadItems(context, promise) {
            const query = getQuery();
            promise.then(function (result) {
				
                const elem = context.querySelector('#items');
                let html = '';
                const items = result.Items;

                for (let i = 0, length = items.length; i < length; i++) {
                    const item = items[i];

                    html += '<div class="verticalSection">';
                    html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">';
                    html += '<a is="emby-linkbutton" href="' + appRouter.getRouteUrl(item, {
                        context: 'movies',
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

                        html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' lazy padded-left padded-right hide" data-id="' + item.Id + '">';
                    } else {
                        html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap lazy padded-left padded-right hide" data-id="' + item.Id + '">';
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

        const fullyReload = () => {
            this.preRender();
            this.renderTab();
        };

        const data = {};

        this.getViewStyles = function () {
            return 'Poster,PosterCard,Thumb,ThumbCard'.split(',');
        };

        this.enableViewSelection = true;
        let promise;

        this.preRender = function () {
            promise = getPromise();
        };

        this.renderTab = function () {
            reloadItems(tabContent, promise);
        };
		
		const btnSelectView = tabContent.querySelector('.btnSelectView');
		
		btnSelectView.addEventListener('click', (e) => {
			libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
		});
		
		btnSelectView.addEventListener('layoutchange', function (e) {
			const viewStyle = e.detail.viewStyle;
			setCurrentViewStyle(viewStyle);
		});
		
    }

/* eslint-enable indent */
