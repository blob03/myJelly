
import { Events } from 'jellyfin-apiclient';
import inputManager from '../../scripts/inputManager';
import libraryMenu from '../../scripts/libraryMenu';
import layoutManager from '../../components/layoutManager';
import libraryBrowser from '../../scripts/libraryBrowser';
import loading from '../../components/loading/loading';
import listView from '../../components/listview/listview';
import dom from '../../scripts/dom';
import * as userSettings from '../../scripts/settings/userSettings';
import imageLoader from '../../components/images/imageLoader';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import { playbackManager } from '../../components/playback/playbackmanager';
import * as mainTabsManager from '../../components/maintabsmanager';
import globalize from '../../scripts/globalize';
import '../../assets/css/scrollstyles.scss';
import '../../elements/emby-itemscontainer/emby-itemscontainer';
import '../../elements/emby-button/emby-button';
import Dashboard from '../../scripts/clientUtils';
import autoFocuser from '../../components/autoFocuser';

/* eslint-disable indent */

    export default function (view, params) {
		
		const savedKey = params.topParentId;
		const savedViewKey = 'view-recommended-' + savedKey;

		function getCurrentViewStyle() {
			return userSettings.get(savedViewKey) ||  'PosterCard';
		};
				
		function setCurrentViewStyle(viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
		};
		
		function getTabs() {
			return [{
				name: globalize.translate('Shows')
			}, {
				name: globalize.translate('Suggestions')
			}, {
				name: globalize.translate('TabUpcoming')
			}, {
				name: globalize.translate('Genres')
			}, {
				name: globalize.translate('TabNetworks')
			}, {
				name: globalize.translate('Episodes')
			}];
		}

		function getDefaultTabIndex(folderId) {
			switch (userSettings.get('landing-' + folderId)) {
				case 'suggestions':
					return 1;

				case 'upcoming':
					return 2;

				case 'genres':
					return 3;

				case 'networks':
					return 4;

				case 'episodes':
					return 5;

				default:
					return 0;
			}
		}

		function setScrollClasses(elem, scrollX) {
			if (scrollX) {
				elem.classList.add('hiddenScrollX');

				if (layoutManager.tv) {
					elem.classList.add('smoothScrollX');
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

			for (let i = 0, length = containers.length; i < length; i++) {
				setScrollClasses(containers[i], enableScrollX());
			}
		}

		function loadSuggestionsTab(view, params, tabContent) {
			const parentId = params.topParentId;
			const userId = ApiClient.getCurrentUserId();
			console.debug('loadSuggestionsTab');
			loadResume(tabContent, userId, parentId);
			loadLatest(tabContent, userId, parentId);
			loadNextUp(tabContent, userId, parentId);
			
			const btnSelectView = tabContent.querySelector('.btnSelectView');
			btnSelectView.addEventListener('click', (e) => {
				libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
			});
			btnSelectView.addEventListener('layoutchange', function (e) {
				const viewStyle = e.detail.viewStyle;
				const parentId = params.topParentId;
				const userId = ApiClient.getCurrentUserId();
				
				setCurrentViewStyle(viewStyle);
				loadResume(tabContent, userId, parentId);
				loadLatest(tabContent, userId, parentId);
				loadNextUp(tabContent, userId, parentId);
			});
		}

		function loadResume(view, userId, parentId) {
			const screenWidth = dom.getWindowSize().innerWidth;
			const options = {
				SortBy: 'DatePlayed',
				SortOrder: 'Descending',
				IncludeItemTypes: 'Episode',
				Filters: 'IsResumable',
				Limit: screenWidth >= 1920 ? 5 : screenWidth >= 1600 ? 5 : 3,
				Recursive: true,
				Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
				CollapseBoxSetItems: false,
				ParentId: parentId,
				ImageTypeLimit: 1,
				EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
				EnableTotalRecordCount: false
			};
			ApiClient.getItems(userId, options).then(function (result) {
				
				const section = view.querySelector('#resumableSection');	
				
				if (result.Items.length) {
					
					const allowBottomPadding = !enableScrollX();
					let elem = view.querySelector('#resumableItems');
					let viewStyle = getCurrentViewStyle();
					let html = "";
					
					if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					} else {
						elem.classList.remove('vertical-list');
						elem.classList.add('vertical-wrap');
					}
					
					if (viewStyle == 'Thumb') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'backdrop',
							preferThumb: true,
							overlayMoreButton: true,
							inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
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
							inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
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
					section.classList.remove('hide');
					autoFocuser.autoFocus(view);
				} else {
					section.classList.add('hide');
				}
				
				loading.hide();
			});
		}

		function loadLatest(view, userId, parentId) {
			const options = {
				userId: userId,
				IncludeItemTypes: 'Episode',
				Limit: 30,
				Fields: 'PrimaryImageAspectRatio,BasicSyncInfo',
				ParentId: parentId,
				ImageTypeLimit: 1,
				EnableImageTypes: 'Primary,Backdrop,Thumb'
			};
			ApiClient.getLatestItems(options).then(function (items) {
				
				const section = view.querySelector('#latestItemsSection');
				
				if (items.length) {
					
					const allowBottomPadding = !enableScrollX();
					let elem = section.querySelector('#latestEpisodesItems');
					let viewStyle = getCurrentViewStyle();
					
					let html = "";
					
					if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					} else {
						elem.classList.remove('vertical-list');
						elem.classList.add('vertical-wrap');
					}
						
					if (viewStyle == 'Thumb') {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'backdrop',
							preferThumb: true,
							overlayMoreButton: true,
							inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
							centerText: true,
							showTitle: true,
							lazy: true,
							scalable: true,
							allowBottomPadding: allowBottomPadding,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showSeriesYear: true
						});
					} else if (viewStyle == 'ThumbCard') {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'backdrop',
							preferThumb: true,
							overlayMoreButton: true,
							inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
							lazy: true,
							cardLayout: true,
							centerText: true,
							showTitle: true,
							scalable: true,
							allowBottomPadding: allowBottomPadding,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showSeriesYear: true
						});
					} else if (viewStyle == 'Banner') {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'banner',
							overlayMoreButton: true,
							preferBanner: true,
							centerText: true,
							showTitle: false,
							allowBottomPadding: allowBottomPadding,
							showSeriesYear: false,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							scalable: true,
							lazy: true
						});
					} else if (viewStyle == 'List') {
						html += listView.getListViewHtml({
							items: items
						});
					} else if (viewStyle == 'PosterCard') {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'auto',
							showTitle: true,
							showSeriesYear: true,
							lazy: true,
							allowBottomPadding: allowBottomPadding,
							overlayMoreButton: true,
							centerText: true,
							scalable: true,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							cardLayout: true
						});
					} else {
						html += cardBuilder.getCardsHtml(items, {
							shape: 'auto',
							overlayMoreButton: true,
							allowBottomPadding: allowBottomPadding,
							centerText: true,
							showSeriesYear: true,
							lazy: true,
							scalable: true,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showTitle: true
						});
					}
					
					elem.innerHTML = html;
					imageLoader.lazyChildren(elem);
					section.classList.remove('hide');
					autoFocuser.autoFocus(view);
				} else {
					section.classList.add('hide');
				}
				
				loading.hide();
			});
		}

		function loadNextUp(view, userId, parentId) {
			const query = {
				userId: userId,
				Limit: 24,
				Fields: 'PrimaryImageAspectRatio,DateCreated,BasicSyncInfo',
				ParentId: parentId,
				ImageTypeLimit: 1,
				EnableImageTypes: 'Primary,Backdrop,Thumb',
				EnableTotalRecordCount: false
			};
			query.ParentId = libraryMenu.getTopParentId();
			ApiClient.getNextUpEpisodes(query).then(function (result) {
				
				const section = view.querySelector('#nextUpItemsSection');
				
				if (result.Items.length) {
				
					const allowBottomPadding = !enableScrollX();
					
					let elem = section.querySelector('#nextUpItems');
					let viewStyle = getCurrentViewStyle();
					let html = "";
					
					if (viewStyle == 'List') {
						elem.classList.add('vertical-list');
						elem.classList.remove('vertical-wrap');
					} else {
						elem.classList.remove('vertical-list');
						elem.classList.add('vertical-wrap');
					}
					
					if (viewStyle == 'Thumb') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'backdrop',
							preferThumb: true,
							overlayMoreButton: true,
							inheritThumb: !userSettings.useEpisodeImagesInNextUpAndResume(),
							centerText: true,
							showTitle: true,
							lazy: true,
							scalable: true,
							allowBottomPadding: allowBottomPadding,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showSeriesYear: true
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
							allowBottomPadding: allowBottomPadding,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showSeriesYear: true
						});
					} else if (viewStyle == 'Banner') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'banner',
							overlayMoreButton: true,
							preferBanner: true,
							centerText: true,
							showTitle: false,
							allowBottomPadding: allowBottomPadding,
							showSeriesYear: false,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							scalable: true,
							lazy: true
						});
					} else if (viewStyle == 'List') {
						html += listView.getListViewHtml({
							items: result.Items
						});
					} else if (viewStyle == 'PosterCard') {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'auto',
							showTitle: true,
							showSeriesYear: true,
							lazy: true,
							allowBottomPadding: allowBottomPadding,
							overlayMoreButton: true,
							centerText: true,
							scalable: true,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							cardLayout: true
						});
					} else {
						html += cardBuilder.getCardsHtml(result.Items, {
							shape: 'auto',
							overlayMoreButton: true,
							allowBottomPadding: allowBottomPadding,
							centerText: true,
							showSeriesYear: true,
							lazy: true,
							scalable: true,
							showDetailsMenu: true,
							showChildCountIndicator: true,
							showTitle: true
						});
					}
					
					elem.innerHTML = html;
					imageLoader.lazyChildren(elem);
					section.classList.remove('hide');
					autoFocuser.autoFocus(view);
				} else {
					section.classList.add('hide');
				}
				
				loading.hide();
			});
		}

		function enableScrollX() {
			return !layoutManager.desktop;
		}

		function getThumbShape() {
			return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
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

        function getTabController(page, index, callback) {
            let depends;

            switch (index) {
                case 0:
                    depends = 'tvshows';
                    break;

                case 1:
                    depends = 'tvrecommended';
                    break;

                case 2:
                    depends = 'tvupcoming';
                    break;

                case 3:
                    depends = 'tvgenres';
                    break;

                case 4:
                    depends = 'tvstudios';
                    break;

                case 5:
                    depends = 'episodes';
                    break;
            }

            import(`../shows/${depends}`).then(({default: controllerFactory}) => {
                let tabContent;

                if (index === 1) {
                    tabContent = view.querySelector(".pageTabContent[data-index='" + index + "']");
                    self.tabContent = tabContent;
                }

                let controller = tabControllers[index];

                if (!controller) {
                    tabContent = view.querySelector(".pageTabContent[data-index='" + index + "']");

                    if (index === 1) {
                        controller = self;
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
        }

        function preLoadTab(page, index) {
            getTabController(page, index, function (controller) {
                if (renderedTabs.indexOf(index) == -1 && controller.preRender) {
                    controller.preRender();
                }
            });
        }

        function loadTab(page, index) {
            currentTabIndex = index;
            getTabController(page, index, function (controller) {
                if (renderedTabs.indexOf(index) == -1) {
                    renderedTabs.push(index);
                    controller.renderTab();
                }
            });
        }

        function onPlaybackStop(e, state) {
            if (state.NowPlayingItem && state.NowPlayingItem.MediaType == 'Video') {
                renderedTabs = [];
                mainTabsManager.getTabsElement().triggerTabChange();
            }
        }

        function onWebSocketMessage(e, data) {
            const msg = data;

            if (msg.MessageType === 'UserDataChanged' && msg.Data.UserId == ApiClient.getCurrentUserId()) {
                renderedTabs = [];
            }
        }

        function onInputCommand(e) {
            switch (e.detail.command) {
                case 'search':
                    e.preventDefault();
                    Dashboard.navigate('search.html?collectionType=tv&parentId=' + params.topParentId);
            }
        }

        const self = this;
        let currentTabIndex = parseInt(params.tab || getDefaultTabIndex(params.topParentId));
        const suggestionsTabIndex = 1;

        self.initTab = function () {
            const tabContent = view.querySelector(".pageTabContent[data-index='" + suggestionsTabIndex + "']");
            initSuggestedTab(view, tabContent);
        };

        self.renderTab = function () {
            const tabContent = view.querySelector(".pageTabContent[data-index='" + suggestionsTabIndex + "']");
            loadSuggestionsTab(view, params, tabContent);
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
                    view.setAttribute('data-title', globalize.translate('Shows'));
                    libraryMenu.setTitle(globalize.translate('Shows'));
                }
            }

            Events.on(playbackManager, 'playbackstop', onPlaybackStop);
            Events.on(ApiClient, 'message', onWebSocketMessage);
            inputManager.on(window, onInputCommand);
        });
        view.addEventListener('viewbeforehide', function () {
            inputManager.off(window, onInputCommand);
            Events.off(playbackManager, 'playbackstop', onPlaybackStop);
            Events.off(ApiClient, 'message', onWebSocketMessage);
        });
        view.addEventListener('viewdestroy', function () {
            tabControllers.forEach(function (t) {
                if (t.destroy) {
                    t.destroy();
                }
            });
        });
    }

/* eslint-enable indent */
