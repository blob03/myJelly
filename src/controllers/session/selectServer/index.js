import loading from '../../../components/loading/loading';
import { appRouter } from '../../../components/appRouter';
import layoutManager from '../../../components/layoutManager';
import libraryMenu from '../../../scripts/libraryMenu';
import appSettings from '../../../scripts/settings/appSettings';
import focusManager from '../../../components/focusManager';
import globalize from '../../../scripts/globalize';
import actionSheet from '../../../components/actionSheet/actionSheet';
import dom from '../../../scripts/dom';
import browser from '../../../scripts/browser';
import 'material-design-icons-iconfont';
import '../../../assets/css/flexstyles.scss';
import '../../../elements/emby-scroller/emby-scroller';
import '../../../elements/emby-itemscontainer/emby-itemscontainer';
import '../../../components/cardbuilder/card.scss';
import '../../../elements/emby-button/emby-button';
import Dashboard from '../../../utils/dashboard';
import ServerConnections from '../../../components/ServerConnections';
import alert from '../../../components/alert';
import cardBuilder from '../../../components/cardbuilder/cardBuilder';
import { ConnectionState } from '../../../utils/jellyfin-apiclient/ConnectionState.ts';

/* eslint-disable indent */

    const enableFocusTransform = !browser.slow && !browser.edge;

    function renderSelectServerItems(view, servers) {
        const items = servers.map(function (server) {
            return {
                name: server.Name,
                icon: 'storage',
                cardType: '',
                id: server.Id,
                server: server
            };
        });
        let html = items.map(function (item) {
            // TODO move card creation code to Card component
			const cardImageContainer = '<span class="cardImageIcon material-icons ' + item.icon + '" aria-hidden="true"></span>';
            let cssClass = 'card overflowSquareCard loginSquareCard scalableCard overflowSquareCard-scalable';

            if (layoutManager.tv) {
                cssClass += ' show-focus';

                if (enableFocusTransform) {
                    cssClass += ' show-animation';
                }
            }

            const cardBoxCssClass = 'cardBox';

            const innerOpening = '<div class="' + cardBoxCssClass + '">';
            let cardContainer = '';
            cardContainer += '<button raised class="' + cssClass + '" style="display:inline-block;" data-id="' + item.id + '" data-url="' + (item.url || '') + '" data-cardtype="' + item.cardType + '">';
            cardContainer += innerOpening;
            cardContainer += '<div class="cardScalable">';
            cardContainer += '<div class="cardPadder cardPadder-square">';
            cardContainer += '</div>';
            cardContainer += '<div class="cardContent">';
            cardContainer += `<div class="cardImageContainer coveredImage ${cardBuilder.getDefaultBackgroundClass()}">`;
            cardContainer += cardImageContainer;
            cardContainer += '</div>';
            cardContainer += '</div>';
            cardContainer += '</div>';
            cardContainer += '<div class="cardFooter">';
            cardContainer += '<div class="cardText cardTextCentered">' + item.name + '</div>';
            cardContainer += '</div></div></button>';
            return cardContainer;
        }).join('');
        const itemsContainer = view.querySelector('.servers');

        if (!items.length) {
            html = '<p>' + globalize.translate('MessageNoServersAvailable') + '</p>';
        }

        itemsContainer.innerHTML = html;
        loading.hide();
    }

    function updatePageStyle(view, params) {
        if (params.showuser == '1') {
            view.classList.add('libraryPage');
            view.classList.remove('standalonePage');
            view.classList.add('noSecondaryNavPage');
        } else {
            view.classList.add('standalonePage');
            view.classList.remove('libraryPage');
            view.classList.remove('noSecondaryNavPage');
        }
    }

    function alertText(text) {
        alertTextWithOptions({
            text: text
        });
    }

    function alertTextWithOptions(options) {
        alert(options);
    }

    function showServerConnectionFailure() {
        alertText(globalize.translate('MessageUnableToConnectToServer'));
    }

    export default function (view, params) {
        function connectToServer(server) {
            loading.show();
            ServerConnections.connectToServer(server, {
                enableAutoLogin: appSettings.enableAutoLogin()
            }).then(function (result) {
                const apiClient = result.ApiClient;

                switch (result.State) {
                    case ConnectionState.SignedIn:
                        Dashboard.onServerChanged(apiClient.getCurrentUserId(), apiClient.accessToken(), apiClient);
                        Dashboard.navigate('home.html');
                        break;

                    case ConnectionState.ServerSignIn:
                        Dashboard.onServerChanged(null, null, apiClient);
                        Dashboard.navigate('login.html?serverid=' + result.Servers[0].Id);
                        break;

                    case ConnectionState.ServerUpdateNeeded:
                        alertTextWithOptions({
                            text: globalize.translate('core#ServerUpdateNeeded', 'https://github.com/jellyfin/jellyfin'),
                            html: globalize.translate('core#ServerUpdateNeeded', '<a href="https://github.com/jellyfin/jellyfin">https://github.com/jellyfin/jellyfin</a>')
                        });
                        break;

                    default:
                        showServerConnectionFailure();
                }
            }).finally(()=>{loading.hide();});
        }

        function deleteServer(server) {
            loading.show();
            ServerConnections.deleteServer(server.Id).then(function () {
                loading.hide();
                loadServers();
            }).finally(()=>{loading.hide();});
        }

        function onServerClick(server) {
            const menuItems = [];
            menuItems.push({
                name: globalize.translate('Connect'),
                id: 'connect'
            });
            menuItems.push({
                name: globalize.translate('Delete'),
                id: 'delete'
            });
            actionSheet.show({
                items: menuItems,
                title: server.Name
            }).then(function (id) {
                switch (id) {
                    case 'connect':
                        connectToServer(server);
                        break;

                    case 'delete':
                        deleteServer(server);
                }
            });
        }

        function onServersRetrieved(result) {
            servers = result;
            renderSelectServerItems(view, result);

            if (layoutManager.tv) {
                focusManager.autoFocus(view);
            }
        }

        function loadServers() {
            loading.show();
            ServerConnections.getAvailableServers()
			.then(onServersRetrieved)
			.finally(()=>{loading.hide();});
        }

        let servers;
        updatePageStyle(view, params);
        view.addEventListener('viewshow', function (e) {
            const isRestored = e.detail.isRestored;
            libraryMenu.setTitle(null);
            libraryMenu.setTransparentMenu(true);
			
			view.querySelector('.btnCancel').classList.toggle('hide', !appRouter.canGoBack());
            if (!isRestored) {
                loadServers();
            }
        });
		
		view.querySelector('.btnAddServer').addEventListener('click', function (e) {
           Dashboard.navigate("addserver.html", true);
        });
		view.querySelector('.btnCancel').addEventListener('click', function (e) {
           appRouter.back();
        });
        view.querySelector('.servers').addEventListener('click', function (e) {
            const card = dom.parentWithClass(e.target, 'card');
            if (card) {
                const url = card.getAttribute('data-url');
                if (url) {
                    appRouter.show(url);
                } else {
                    const id = card.getAttribute('data-id');
                    onServerClick(servers.filter(function (s) {
                        return s.Id === id;
                    })[0]);
                }
            }
        });
    }

/* eslint-enable indent */
