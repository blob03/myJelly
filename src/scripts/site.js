import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'jquery';
import 'fast-text-encoding';
import 'intersection-observer';
import 'classlist.js';
import 'whatwg-fetch';
import 'resize-observer-polyfill';
import '../assets/css/site.scss';
import { Events } from 'jellyfin-apiclient';
import ServerConnections from '../components/ServerConnections';
import globalize from './globalize';
import browser from './browser';
import keyboardNavigation from './keyboardNavigation';
import './mouseManager';
import autoFocuser from '../components/autoFocuser';
import { appHost } from '../components/apphost';
import { getPlugins } from './settings/webSettings';
import { pluginManager } from '../components/pluginManager';
import packageManager from '../components/packageManager';
import { appRouter } from '../components/appRouter';
import '../elements/emby-button/emby-button';
import './autoThemes';
import './libraryMenu';
import './routes';
import '../components/themeMediaPlayer';
import './autoBackdrops';
import { pageClassOn, serverAddress } from '../utils/dashboard';
import './screensavermanager';
import './serverNotifications';
import '../components/playback/playerSelectionMenu';
import '../legacy/domParserTextHtml';
import '../legacy/focusPreventScroll';
import '../legacy/htmlMediaElement';
import '../legacy/vendorStyles';
import SyncPlay from '../components/syncPlay/core';
import { playbackManager } from '../components/playback/playbackmanager';
import SyncPlayNoActivePlayer from '../components/syncPlay/ui/players/NoActivePlayer';
import SyncPlayHtmlVideoPlayer from '../components/syncPlay/ui/players/HtmlVideoPlayer';
import SyncPlayHtmlAudioPlayer from '../components/syncPlay/ui/players/HtmlAudioPlayer';
import { currentSettings } from './settings/userSettings';
import taskButton from './taskbutton';

function loadCoreDictionary() {
    return globalize.loadStrings('core');
}

function init() {
	// This is used in plugins
    window.Events = Events;
    window.TaskButton = taskButton;
	
    serverAddress().then(server => {
        if (server) {
            ServerConnections.initApiClient(server);
        }
    }).then(() => {
        console.debug('initAfterDependencies promises resolved');

        loadCoreDictionary().then(function () {
            onGlobalizeInit();
        });

        keyboardNavigation.enable();
        autoFocuser.enable();

        Events.on(ServerConnections, 'localusersignedin', globalize.updateCurrentCulture);
    });
}

function onGlobalizeInit() {
    if (window.appMode === 'android') {
        if (window.location.href.toString().toLowerCase().indexOf('start=backgroundsync') !== -1) {
            return onAppReady();
        }
    }

    document.title = globalize.translateHtml(document.title, 'core');

    if (browser.tv && !browser.android) {
        console.debug('using system fonts with explicit sizes');
        import('../assets/css/fonts.sized.scss');
    } else {
        console.debug('using default fonts');
        import('../assets/css/fonts.scss');
    }

    import('../assets/css/librarybrowser.scss');

    loadPlugins().then(function () {
        initSyncPlay();
        onAppReady();
    });
}

function loadPlugins() {
    console.groupCollapsed('loading installed plugins');
    console.dir(pluginManager);
    return getPlugins().then(function (list) {
        if (!appHost.supports('remotecontrol')) {
            // Disable remote player plugins if not supported
            list = list.filter(plugin => !plugin.startsWith('sessionPlayer')
                && !plugin.startsWith('chromecastPlayer'));
        } else if (!browser.chrome && !browser.edgeChromium && !browser.opera) {
            // Disable chromecast player in unsupported browsers
            list = list.filter(plugin => !plugin.startsWith('chromecastPlayer'));
        }

        // add any native plugins
        if (window.NativeShell) {
            list = list.concat(window.NativeShell.getPlugins());
        }

        Promise.all(list.map(plugin => pluginManager.loadPlugin(plugin)))
            .then(() => console.debug('finished loading plugins'))
            .catch(e => console.warn('failed loading plugins', e))
            .finally(() => {
                console.groupEnd('loading installed plugins');
                packageManager.init();
            })
        ;
    });
}

function initSyncPlay() {
    // Register player wrappers.
    SyncPlay.PlayerFactory.setDefaultWrapper(SyncPlayNoActivePlayer);
    SyncPlay.PlayerFactory.registerWrapper(SyncPlayHtmlVideoPlayer);
    SyncPlay.PlayerFactory.registerWrapper(SyncPlayHtmlAudioPlayer);

    // Listen for player changes.
    Events.on(playbackManager, 'playerchange', (event, newPlayer, newTarget, oldPlayer) => {
        SyncPlay.Manager.onPlayerChange(newPlayer, newTarget, oldPlayer);
    });

    // Start SyncPlay.
    const apiClient = ServerConnections.currentApiClient();
    if (apiClient) SyncPlay.Manager.init(apiClient);

    // FIXME: Multiple apiClients?
    Events.on(ServerConnections, 'apiclientcreated', (e, newApiClient) => SyncPlay.Manager.init(newApiClient));
}

function onAppReady() {
    console.debug('begin onAppReady');

    console.debug('onAppReady: loading dependencies');

    if (browser.iOS) {
        import('../assets/css/ios.scss');
    }
	
	Events.on(appHost, 'resume', () => {
        ServerConnections.currentApiClient()?.ensureWebSocket();
    });
	
    appRouter.start();

    if (!browser.tv && !browser.xboxOne && !browser.ps4) {
        import('../components/nowPlayingBar/nowPlayingBar');
    }

    if (appHost.supports('remotecontrol')) {
        import('../components/playback/playerSelectionMenu');
        import('../components/playback/remotecontrolautoplay');
    }

    if (!appHost.supports('physicalvolumecontrol') || browser.touch) {
        import('../components/playback/volumeosd');
    }

    /* eslint-disable-next-line compat/compat */
    if (navigator.mediaSession || window.NativeShell) {
        import('../components/playback/mediasession');
    }

    if (!browser.tv && !browser.xboxOne) {
        import('../components/playback/playbackorientation');
        registerServiceWorker();

        if (window.Notification) {
            import('../components/notifications/notifications');
        }
    }

    const apiClient = ServerConnections.currentApiClient();
    if (apiClient) {
        fetch(apiClient.getUrl('Branding/Css'))
            .then(function(response) {
                if (!response.ok) {
                    throw new Error(response.status + ' ' + response.statusText);
                }
                return response.text();
            })
            .then(function(css) {
                let style = document.querySelector('#cssBranding');
                if (!style) {
                    // Inject the branding css as a dom element in body so it will take
                    // precedence over other stylesheets
                    style = document.createElement('style');
                    style.id = 'cssBranding';
                    document.body.appendChild(style);
                }
                style.textContent = css;
            })
            .catch(function(err) {
                console.warn('Error applying custom css', err);
            });
    }
}

function registerServiceWorker() {
    /* eslint-disable compat/compat */
    if (navigator.serviceWorker && window.appMode !== 'cordova' && window.appMode !== 'android') {
        navigator.serviceWorker.register('serviceworker.js').then(() =>
            console.log('serviceWorker registered')
        ).catch(error =>
            console.log('error registering serviceWorker: ' + error)
        );
    } else {
        console.warn('serviceWorker unsupported');
    }
    /* eslint-enable compat/compat */
}

init();

pageClassOn('viewshow', 'standalonePage', function () {
    document.querySelector('.skinHeader').classList.add('noHeaderRight');
});

pageClassOn('viewhide', 'standalonePage', function () {
    document.querySelector('.skinHeader').classList.remove('noHeaderRight');
});
