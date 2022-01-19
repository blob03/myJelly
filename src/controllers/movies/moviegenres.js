import layoutManager from '../../components/layoutManager';
import loading from '../../components/loading/loading';
import { Events } from 'jellyfin-apiclient';
import dom from '../../scripts/dom';
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
		
		const savedKey = params.topParentId;
        const savedViewKey = 'view-genres-' + savedKey;
		const savedQueryKey = 'query-genres-' + savedKey; 
		
		let query = {
			//SortBy: 'Random',
			SortBy: 'SortName,ProductionYear',
			SortOrder: 'Ascending',
			IncludeItemTypes: 'Movie',
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
            fullyReload();
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

        const fillItemsContainer = (entry) => {
            const elem = entry.target;
            const viewStyle = getCurrentViewStyle(); 
            const screenWidth = dom.getWindowSize().innerWidth;			
			
			if (viewStyle == 'Thumb' || viewStyle == 'ThumbCard') {
				query.Limit = screenWidth >= 1920 ? 4 : 3;
			} else {
				if (layoutManager.tv)
					query.Limit = screenWidth >= 1200 ? 6 : 5;
				else
					query.Limit = screenWidth >= 1200 ? 7 : 6;
			}
			
            query.enableImageTypes = viewStyle == 'Thumb' || viewStyle == 'ThumbCard' ? 'Primary,Backdrop,Thumb' : 'Primary';
			query.GenreIds = elem.getAttribute('data-id');
			
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
					
					//if (result.Items.length >= query.Limit) {
					//	tabContent.querySelector('.btnMoreFromGenre' + id + ' .material-icons').classList.remove('hide');
					//}
					
					elem.classList.remove('hide');
				} 				
            });
        };

        function reloadItems(context, genres) {
		
			const elem = context.querySelector('#items');
			let html = '';
		
			for (let i = 0, length = genres.length; i < length; i++) {
				const genre = genres[i];

				html += '<div class="verticalSection">';
				html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">';
				html += '<a is="emby-linkbutton" href="' + appRouter.getRouteUrl(genre, {
					context: 'movies',
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

					html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' lazy padded-left padded-right hide" data-id="' + genre.Id + '">';
				} else {
					html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap lazy padded-left padded-right hide" data-id="' + genre.Id + '">';
				} 

				html += '</div>';
				html += '</div>';
			}

			if (!genres.length) {
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

        const fullyReload = () => {
            this.renderTab();
        };

        const data = {};

        this.getViewStyles = function () {
            return 'Poster,PosterCard,Thumb,ThumbCard'.split(',');
        };

		const self = this;
		let genreslst = [];
		
        this.renderTab = function () {
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
		if (btnSelectView) {
			btnSelectView.addEventListener('click', (e) => {
				libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
			});
			btnSelectView.addEventListener('layoutchange', function (e) {
				const viewStyle = e.detail.viewStyle;
				setCurrentViewStyle(viewStyle);
			});
		}
		const btnSort = tabContent.querySelector('.btnSort');
		if (btnSort) {
			btnSort.addEventListener('click', (e) => {
				libraryBrowser.showSortMenu({
					items: [
					//{
					//	name: globalize.translate('OptionRandom'),
					//	id: 'Random'
					//}, 
					{
						name: globalize.translate('Name'),
						id: 'SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionImdbRating'),
						id: 'CommunityRating,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionCriticRating'),
						id: 'CriticRating,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionDateAdded'),
						id: 'DateCreated,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionDatePlayed'),
						id: 'DatePlayed,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionParentalRating'),
						id: 'OfficialRating,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionPlayCount'),
						id: 'PlayCount,SortName,ProductionYear'
					}, {
						name: globalize.translate('OptionReleaseDate'),
						id: 'PremiereDate,SortName,ProductionYear'
					}, {
						name: globalize.translate('Runtime'),
						id: 'Runtime,SortName,ProductionYear'
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
		const btnFilter = tabContent.querySelector('.btnFilter');
		if (btnFilter) {
			btnFilter.addEventListener('click', () => {
				this.showFilterMenu();
			});
		}
		this.showFilterMenu = function () {
			import('../../components/filterdialog/filterdialog').then(({default: filterDialogFactory}) => {
				const filterDialog = new filterDialogFactory({
					query: query,
					mode: 'movies',
					serverId: ApiClient.serverId()
				});
				Events.on(filterDialog, 'filterchange', () => {
					query.StartIndex = 0;
					userSettings.saveQuerySettings(savedQueryKey, query);
					self.renderTab();
					});
				filterDialog.show();
			});
		};
    }

/* eslint-enable indent */
