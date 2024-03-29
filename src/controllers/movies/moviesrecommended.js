
import layoutManager from '../../components/layoutManager';
import inputManager from '../../scripts/inputManager';
import * as userSettings from '../../scripts/settings/userSettings';
import libraryMenu from '../../scripts/libraryMenu';
import libraryBrowser from '../../scripts/libraryBrowser';
import * as mainTabsManager from '../../components/maintabsmanager';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import dom from '../../scripts/dom';
import listView from '../../components/listview/listview';
import imageLoader from '../../components/images/imageLoader';
import { playbackManager } from '../../components/playback/playbackmanager';
import globalize from '../../scripts/globalize';
import { LibraryTab } from '../../types/libraryTab.ts';
import Dashboard from '../../utils/dashboard';
import Events from '../../utils/events.ts';

import '../../elements/emby-scroller/emby-scroller';
import '../../elements/emby-itemscontainer/emby-itemscontainer';
import '../../elements/emby-tabs/emby-tabs';
import '../../elements/emby-button/emby-button';

/* eslint-disable indent */
	
	export default function (view, params) {
		
		const self = this;
		const savedKey = params.topParentId;
        const savedViewKey = 'view-recommended-' + savedKey;
		const savedQueryKey = 'query-recommended-' + savedKey; 
		
		let query = {
            SortBy: 'SortName,ProductionYear',
            SortOrder: 'Ascending',
            IncludeItemTypes: 'Movie',
            Recursive: true,
            Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
            StartIndex: 0,
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

		function getPortraitShape() {
			return enableScrollX() ? 'overflowPortrait' : 'portrait';
		}

		function getThumbShape() {
			return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
		}

		function loadLatest(page, userId, parentId) {
			
			const screenWidth = dom.getWindowSize().innerWidth;
			const viewStyle = getCurrentViewStyle();
			let options = query;
			options.userId = userId;
			options.categoryLimit = 6;
			
			if (viewStyle == 'Thumb' || viewStyle == 'ThumbCard') {
				options.Limit = screenWidth >= 1920 ? 4 : 3;
			} else {
				if (layoutManager.tv)
					options.Limit = screenWidth >= 1200 ? 6 : 5;
				else
					options.Limit = screenWidth >= 1200 ? 7 : 6;
			}
		
			const url = ApiClient.getUrl('Users/' + userId + '/Items/Latest', options);
			
			ApiClient.getJSON(url).then(function (items) {
				
				if (items.length) {
	
					const allowBottomPadding = !enableScrollX();
					const elem = page.querySelector('#recentlyAddedItems');
					let html = "";
					
					if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					} else {
						elem.classList.add('vertical-wrap');
						elem.classList.remove('vertical-list');
					}
					
					if (viewStyle == 'Thumb') {
						html += cardBuilder.getCardsHtml(items, {
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
						html += cardBuilder.getCardsHtml(items, {
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
						html += cardBuilder.getCardsHtml(items, {
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
						html += listView.getListViewHtml({
							items: items,
							context: 'movies'
						});
					} else if (viewStyle == 'PosterCard') {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'auto',
							context: 'movies',
							showTitle: true,
							showYear: true,
							overlayMoreButton: true,
							centerText: true,
							cardLayout: true
						});
					} else {
						html += cardBuilder.getCardsHtml(items, {
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
					
					page.querySelector('#latestSection').classList.remove('hide');
				} else {
					page.querySelector('#latestSection').classList.add('hide');
				}

				// FIXME: Wait for all sections to load
				autoFocus(page);
			});
		}

		function loadResume(page, userId, parentId) {
			
			const screenWidth = dom.getWindowSize().innerWidth;			
			const viewStyle = getCurrentViewStyle();
			let options = query;
			options.SortBy = 'DatePlayed';
			options.SortOrder = 'Descending';
			options.Filters = 'IsResumable';
			options.userId = userId;
			options.categoryLimit = 6;
			
			if (viewStyle == 'Thumb' || viewStyle == 'ThumbCard') {
				options.Limit = screenWidth >= 1920 ? 4 : 3;
			} else {
				if (layoutManager.tv)
					options.Limit = screenWidth >= 1200 ? 6 : 5;
				else
					options.Limit = screenWidth >= 1200 ? 7 : 6;
			}
			
			ApiClient.getItems(userId, options).then(function (result) {

				if (result.Items.length) {
	
					const allowBottomPadding = !enableScrollX();
					const elem = page.querySelector('#resumableItems');
					let html = "";
					
					if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					} else {
						elem.classList.add('vertical-wrap');
						elem.classList.remove('vertical-list');
					}
						
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
					
					page.querySelector('#resumableSection').classList.remove('hide');
				} else {
					page.querySelector('#resumableSection').classList.add('hide');
				}
				
				// FIXME: Wait for all sections to load
				autoFocus(page);
			});
		}

		function getRecommendationHtml(recommendation) {
			let html = '';
			let title = '';

			switch (recommendation.RecommendationType) {
				case 'SimilarToRecentlyPlayed':
					title = globalize.translate('RecommendationBecauseYouWatched', recommendation.BaselineItemName);
					break;

				case 'SimilarToLikedItem':
					title = globalize.translate('RecommendationBecauseYouLike', recommendation.BaselineItemName);
					break;

				case 'HasDirectorFromRecentlyPlayed':
				case 'HasLikedDirector':
					title = globalize.translate('RecommendationDirectedBy', recommendation.BaselineItemName);
					break;

				case 'HasActorFromRecentlyPlayed':
				case 'HasLikedActor':
					title = globalize.translate('RecommendationStarring', recommendation.BaselineItemName);
					break;
			}

			html += '<div class="verticalSection">';
			html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + title + '</h2>';
			const allowBottomPadding = true;
			
			const viewStyle = getCurrentViewStyle();

			if (viewStyle == 'List')
				html += '<div is="emby-itemscontainer" class="itemsContainer focuscontainer-x padded-left padded-right vertical-list">';
			else if (enableScrollX()) {
				html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true">';
				html += '<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">';
			} else {
				html += '<div is="emby-itemscontainer" class="itemsContainer focuscontainer-x padded-left padded-right vertical-wrap">';
			}

			if (viewStyle == 'Thumb') {
				html += cardBuilder.getCardsHtml(recommendation.Items, {
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
				html += cardBuilder.getCardsHtml(recommendation.Items, {
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
				html += cardBuilder.getCardsHtml(recommendation.Items, {
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
				html += listView.getListViewHtml({
					items: recommendation.Items,
					context: 'movies',
					SortBy: 'SortName,ProductionYear',
					SortOrder: 'Ascending'
				});
			} else if (viewStyle == 'PosterCard') {
				html += cardBuilder.getCardsHtml(recommendation.Items, {
					shape: 'auto',
					context: 'movies',
					showTitle: true,
					showYear: true,
					overlayMoreButton: true,
					centerText: true,
					cardLayout: true
				});
			} else {
				html += cardBuilder.getCardsHtml(recommendation.Items, {
					shape: 'auto',
					overlayMoreButton: true,
					context: 'movies',
					allowBottomPadding: allowBottomPadding,
					centerText: true,
					showYear: true,
					showTitle: true
				});
			}
					
			if (enableScrollX()) {
				html += '</div>';
			}
			html += '</div>';
			html += '</div>';
			return html;
		}

		function loadSuggestions(page, userId) {
			const screenWidth = dom.getWindowSize().innerWidth;
			const viewStyle = getCurrentViewStyle();
			let options = query;
			options.userId = userId;
			options.categoryLimit = 6;
			
			if (viewStyle == 'Thumb' || viewStyle == 'ThumbCard') {
				options.Limit = screenWidth >= 1920 ? 4 : 3;
			} else {
				if (layoutManager.tv)
					options.Limit = screenWidth >= 1200 ? 6 : 5;
				else
					options.Limit = screenWidth >= 1200 ? 7 : 6;
			}
		
			const url = ApiClient.getUrl('Movies/Recommendations', options);
			ApiClient.getJSON(url).then(function (recommendations) {
				
				if (recommendations.length) {
					const html = recommendations.map(getRecommendationHtml).join('');
					
					page.querySelector('.noItemsMessage').classList.add('hide');
					const recs = page.querySelector('.recommendations');
					
					recs.innerHTML = html;
					imageLoader.lazyChildren(recs);

					// FIXME: Wait for all sections to load
					autoFocus(page);
				} else {
					page.querySelector('.noItemsMessage').classList.remove('hide');
					page.querySelector('.recommendations').innerHTML = '';
				}
			});
		}

		function autoFocus(page) {
			import('../../components/autoFocuser').then(({default: autoFocuser}) => {
				autoFocuser.autoFocus(page);
			});
		}

		function setScrollClasses(elem, scrollX) {
			if (scrollX) {
				elem.classList.add('hiddenScrollX');

				if (layoutManager.tv) {
					elem.classList.add('smoothScrollX');
					elem.classList.add('padded-top-focusscale');
					elem.classList.add('padded-bottom-focusscale');
				}

				elem.classList.add('scrollX');
				elem.classList.remove('vertical-wrap');
			} else {
				elem.classList.remove('hiddenScrollX');
				elem.classList.remove('smoothScrollX');
				elem.classList.remove('scrollX');
				elem.classList.add('vertical-wrap');
			}
		}

		function initSuggestedTab(page, tabContent) {
			const containers = tabContent.querySelectorAll('.itemsContainer');

			for (const container of containers) {
				setScrollClasses(container, enableScrollX());
			}
		}

		function loadSuggestionsTab(params, tabContent) {
			const parentId = params.topParentId;
			const userId = ApiClient.getCurrentUserId();
			
			loadResume(tabContent, userId, parentId);
			loadLatest(tabContent, userId, parentId);
			loadSuggestions(tabContent, userId);
		}
		
		function getTabs() {
			return [{
				name: globalize.translate('Movies')
			}, {
				name: globalize.translate('Suggestions')
			}, {
				name: globalize.translate('Trailers')
			}, {
				name: globalize.translate('Favorites')
			}, {
				name: globalize.translate('Collections')
			}, {
				name: globalize.translate('Genres')
			}];
		}

		function getDefaultTabIndex(folderId) {
			switch (userSettings.get('landing-' + folderId)) {
				case LibraryTab.Suggestions:
					return 1;

				case LibraryTab.Favorites:
					return 3;

				case LibraryTab.Collections:
					return 4;

				case LibraryTab.Genres:
					return 5;

				default:
					return 0;
			}
		}
		
        function onBeforeTabChange(e) {
            preLoadTab(view, parseInt(e.detail.selectedTabIndex));
        }

        function onTabChange(e) {
            const newIndex = parseInt(e.detail.selectedTabIndex);
            loadTab(view, newIndex);
        }

        function getTabContainers() {
            return view.querySelectorAll('.pageTabContent');
        }

        function initTabs() {
            mainTabsManager.setTabs(view, currentTabIndex, getTabs, getTabContainers, onBeforeTabChange, onTabChange);
        }

        const getTabController = (page, index, callback) => {
            let depends = '';

            switch (index) {
                case 0:
                    depends = 'movies';
                    break;

                case 1:
                    depends = 'moviesrecommended.js';
                    break;

                case 2:
                    depends = 'movietrailers';
                    break;

                case 3:
                    depends = 'movies';
                    break;

                case 4:
                    depends = 'moviecollections';
                    break;

                case 5:
                    depends = 'moviegenres';
                    break;
            }

            import(`../movies/${depends}`).then(({default: controllerFactory}) => {
                let tabContent;

                if (index === suggestionsTabIndex) {
                    tabContent = view.querySelector(".pageTabContent[data-index='" + index + "']");
                    this.tabContent = tabContent;
                }

                let controller = tabControllers[index];

                if (!controller) {
                    tabContent = view.querySelector(".pageTabContent[data-index='" + index + "']");

                    if (index === suggestionsTabIndex) {
                        controller = this;
                    } else if (index == 0 || index == 3) {
                        controller = new controllerFactory(view, params, tabContent, {
                            mode: index ? 'favorites' : 'movies'
                        });
                    } else {
                        controller = new controllerFactory(view, params, tabContent);
                    }

                    tabControllers[index] = controller;

                    if (controller.initTab) {
                        controller.initTab();
                    }
                }

                callback(controller);
            });
        };

        function preLoadTab(page, index) {
            getTabController(page, index, function (controller) {
                if (renderedTabs.indexOf(index) == -1 && controller.preRender) {
                    controller.preRender();
                }
            });
        }

        function loadTab(page, index) {
            currentTabIndex = index;
            getTabController(page, index, ((controller) => {
                if (renderedTabs.indexOf(index) == -1) {
                    renderedTabs.push(index);
                    controller.renderTab();
                }
            }));
        }

        function onPlaybackStop(e, state) {
            if (state.NowPlayingItem && state.NowPlayingItem.MediaType == 'Video') {
                renderedTabs = [];
                mainTabsManager.getTabsElement().triggerTabChange();
            }
        }

        function onInputCommand(e) {
            switch (e.detail.command) {
                case 'search':
                    e.preventDefault();
                    Dashboard.navigate('search.html?collectionType=movies&parentId=' + params.topParentId);
            }
        }

        let currentTabIndex = parseInt(params.tab || getDefaultTabIndex(params.topParentId));
        const suggestionsTabIndex = 1;

		const tabContent = view.querySelector(".pageTabContent[data-index='" + suggestionsTabIndex + "']");
		
		const btnSelectView = tabContent.querySelector('.btnSelectView');
		btnSelectView.addEventListener('click', (e) => {
			libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
		});
		btnSelectView.addEventListener('layoutchange', function (e) {
			const viewStyle = e.detail.viewStyle;
			setCurrentViewStyle(viewStyle);
			loadSuggestionsTab(params, tabContent);
		});

		const btnFilter = tabContent.querySelector('.btnFilter');
		if (btnFilter) {
			btnFilter.addEventListener('click', () => {
				self.showFilterMenu();
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
					loadSuggestionsTab(params, tabContent);
				});
				filterDialog.show();
			});
		};
		
        this.initTab = function () {
            const tabContent = view.querySelector(".pageTabContent[data-index='" + suggestionsTabIndex + "']");
            initSuggestedTab(view, tabContent);
        };

        this.renderTab = function () {
            loadSuggestionsTab(params, tabContent);
        };

        const tabControllers = [];
        let renderedTabs = [];
        view.addEventListener('viewshow', function () {
            initTabs();
            if (!view.getAttribute('data-title')) {
                const parentId = params.topParentId;

                if (parentId) {
                    ApiClient.getItem(ApiClient.getCurrentUserId(), parentId).then(function (item) {
                        view.setAttribute('data-title', item.Name);
                        libraryMenu.setTitle(item.Name);
                    });
                } else {
                    view.setAttribute('data-title', globalize.translate('Movies'));
                    libraryMenu.setTitle(globalize.translate('Movies'));
                }
            }

            Events.on(playbackManager, 'playbackstop', onPlaybackStop);
            inputManager.on(window, onInputCommand);
        });
        view.addEventListener('viewbeforehide', function () {
            inputManager.off(window, onInputCommand);
        });
        for (const tabController of tabControllers) {
            if (tabController.destroy) {
                tabController.destroy();
            }
        }
    }

/* eslint-enable indent */
