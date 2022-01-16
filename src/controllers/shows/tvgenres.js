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
		const savedQueryKey = 'query-genres-' + savedKey; 

		let query = {
			//SortBy: 'Random',
			SortBy: 'SortName,ProductionYear',
			SortOrder: 'Ascending',
			IncludeItemTypes: 'Series',
			Recursive: true,
			Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
			ImageTypeLimit: 1,
			EnableTotalRecordCount: false,
			ParentId: params.topParentId
		};
		
		query = userSettings.loadQuerySettings(savedQueryKey, query);
		
		function getCurrentViewStyle() {
			return userSettings.get(savedViewKey) ||  'PosterCard';
		};
				
		function setCurrentViewStyle(viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
		};

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
            const enableImageTypes = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 'Primary,Backdrop,Thumb' : 'Primary';
			query.Limit = limit;
			query.GenreIds = id;
			query.EnableImageTypes = enableImageTypes;
			
            ApiClient.getItems(ApiClient.getCurrentUserId(), query).then(function (result) {
				
				let html = "";
				const allowBottomPadding = !enableScrollX();
				
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

        function reloadItems(context, genres) {
			const elem = context.querySelector('#items');
			let html = '';

			if (genres.length) {
				for (const genre of genres) {
					html += '<div class="verticalSection">';
					html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">';
					html += '<a is="emby-linkbutton" href="' + appRouter.getRouteUrl(genre, {
						context: 'tvshows',
						parentId: params.topParentId
					}) + '" class="more button-flat button-flat-mini sectionTitleTextButton btnMoreFromGenre' + genre.Id + '">';
					html += '<h2 class="sectionTitle sectionTitle-cards">';
					html += genre.Name;
					html += '</h2>';
					html += '<span class="material-icons hide chevron_right"></span>';
					html += '</a>';
					html += '</div>';
					if (enableScrollX()) {
						let scrollXClass = 'scrollX hiddenScrollX';
						if (layoutManager.tv) {
							scrollXClass += 'smoothScrollX padded-top-focusscale padded-bottom-focusscale';
						}
						html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' lazy padded-left padded-right" data-id="' + genre.Id + '">';
					} else {
						html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap lazy padded-left padded-right" data-id="' + genre.Id + '">';
					}
					html += '</div>';
					html += '</div>';
				}
			} else {
				html = '';

				html += '<div class="noItemsMessage centerMessage">';
				html += '<h1>' + globalize.translate('MessageNothingHere') + '</h1>';
				html += '<p>' + globalize.translate('MessageNoGenresAvailable') + '</p>';
				html += '</div>';
			}

			elem.innerHTML = html;
			lazyLoader.lazyChildren(elem, fillItemsContainer);
			userSettings.saveQuerySettings(savedQueryKey, query);
			loading.hide();
        }

        const self = this;
        const data = {};

        self.getViewStyles = function () {
            return 'Poster,PosterCard,Thumb,ThumbCard'.split(',');
        };

        self.setCurrentViewStyle = function (viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
			self.renderTab();
        };

        self.enableViewSelection = true;

		let genreslst = [];
		
        self.renderTab = function () {
			loading.show();
			if (!genreslst.length) {
				let genresPromise = ApiClient.getGenres(ApiClient.getCurrentUserId(), query);
				genresPromise.then(function (result) {
					genreslst = [].concat(result.Items);
					reloadItems(tabContent, genreslst);
				});
			} else 
				reloadItems(tabContent, genreslst);
        };
		
		const btnSelectView = tabContent.querySelector('.btnSelectView');
		btnSelectView.addEventListener('click', (e) => {
			libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
		});
		btnSelectView.addEventListener('layoutchange', function (e) {
			const viewStyle = e.detail.viewStyle;
			setCurrentViewStyle(viewStyle);
			self.renderTab();
		});
		const btnSort = tabContent.querySelector('.btnSort');
		if (btnSort) {
			btnSort.addEventListener('click', (e) => {
				libraryBrowser.showSortMenu({
                    items: [{
                        name: globalize.translate('Name'),
                        id: 'SortName'
                    }, {
                        name: globalize.translate('OptionImdbRating'),
                        id: 'CommunityRating,SortName'
                    }, {
                        name: globalize.translate('OptionDateAdded'),
                        id: 'DateCreated,SortName'
                    }, {
                        name: globalize.translate('OptionDatePlayed'),
                        id: 'DatePlayed,SortName'
                    }, {
                        name: globalize.translate('OptionParentalRating'),
                        id: 'OfficialRating,SortName'
                    }, {
                        name: globalize.translate('OptionReleaseDate'),
                        id: 'PremiereDate,SortName'
                    }],
					callback: function () {
						query.StartIndex = 0;
						userSettings.saveQuerySettings(savedQueryKey, query);
						self.renderTab();
					},
					query: query,
					button: e.target
				});
			});
		}
    }

/* eslint-enable indent */
