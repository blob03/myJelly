import ServerConnections from '../components/ServerConnections';
import toast from '../components/toast/toast';
import loading from '../components/loading/loading';
import { appRouter } from '../components/appRouter';
import baseAlert from '../components/alert';
import baseConfirm from '../components/confirm/confirm';
import globalize from '../scripts/globalize';
import * as webSettings from '../scripts/settings/webSettings';
import datetime from '../scripts/datetime';
import { setBackdropTransparency } from '../components/backdrop/backdrop';
import DirectoryBrowser from '../components/directorybrowser/directorybrowser';
import dialogHelper from '../components/dialogHelper/dialogHelper';
import itemIdentifier from '../components/itemidentifier/itemidentifier';
import { showClock } from '../scripts/settings/userSettings';
import { getLocationSearch } from './url.ts';
import browser from '../scripts/browser';

export function getCurrentUser() {
    return window.ApiClient.getCurrentUser(false);
}

// TODO: investigate url prefix support for serverAddress function
export async function serverAddress() {
    const apiClient = window.ApiClient;

    if (apiClient) {
        return Promise.resolve(apiClient.serverAddress());
    }

    // Use servers specified in config.json
    const urls = await webSettings.getServers();

    if (urls.length === 0) {
        // Don't use app URL as server URL
        if (window.NativeShell) {
            return Promise.resolve();
        }

        // Otherwise use computed base URL
        const index = window.location.href.toLowerCase().lastIndexOf('/web');
        if (index != -1) {
            urls.push(window.location.href.substring(0, index));
        } else {
            // fallback to location without path
            urls.push(window.location.origin);
        }
    }

    console.debug('URL candidates:', urls);

    const promises = urls.map(url => {
        return fetch(`${url}/System/Info/Public`)
            .then(async resp => {
                if (!resp.ok) {
                    return;
                }

                return {
                    url,
                    config: await resp.json()
                };
            }).catch(error => {
                console.error(error);
            });
    });

    return Promise.all(promises).then(responses => {
     return responses.filter(obj => obj?.config);
    }).then(configs => {
        const selection = configs.find(obj => !obj.config.StartupWizardCompleted) || configs[0];
        return selection?.url;
    }).catch(error => {
        console.error(error);
    });
}

export function getCurrentUserId() {
    const apiClient = window.ApiClient;

    if (apiClient) {
        return apiClient.getCurrentUserId();
    }

    return null;
}

export function onServerChanged(_userId, _accessToken, apiClient) {
    ServerConnections.setLocalApiClient(apiClient);
}

export function logout() {
	const apiClient = window.ApiClient;
	const serverId = apiClient._serverInfo.Id;
	
	/*
    ServerConnections.logout().then(function () {
        webSettings.getMultiServer().then(multi => {
            multi ? navigate('selectserver.html') : navigate('login.html?serverid=' + serverId, false);
        });
    });
	*/
	ServerConnections.logout().then(() => {navigate('login.html?serverid=' + serverId, false)});
}

export function getPluginUrl(name) {
    return 'configurationpage?name=' + encodeURIComponent(name);
}

export function getConfigurationResourceUrl(name) {
	const apiClient = window.ApiClient;
    return apiClient.getUrl('web/ConfigurationPage', {
        name: name
    });
}

export function navigate(url, preserveQueryString) {
    if (!url) {
        throw new Error('url cannot be null or empty');
    }

    const queryString = getLocationSearch();

    if (preserveQueryString && queryString) {
        url += queryString;
    }

    return appRouter.show(url);
}

export function processPluginConfigurationUpdateResult() {
    loading.hide();
    toast(globalize.translate('SettingsSaved'));
}

export function processServerConfigurationUpdateResult() {
    loading.hide();
    toast(globalize.translate('SettingsSaved'));
}

export function processErrorResponse(response) {
    loading.hide();

    let status = '' + response.status;

    if (response.statusText) {
        status = response.statusText;
    }

    baseAlert({
        title: status,
        text: response.headers ? response.headers.get('X-Application-Error-Code') : null
    });
}

export function alert(options) {
    if (typeof options == 'string') {
        toast({
            text: options
        });
    } else {
        baseAlert({
			dialogOptions: { ...options.dialogOptions },
            title: options.title || globalize.translate('HeaderAlert'),
            text: options.message,
			buttonTitle: options.buttonTitle || '',
			buttonClass: options.buttonClass || ''
        }).then(options.callback || function () {});
    }
}

export function capabilities(appHost) {
    return Object.assign({
        PlayableMediaTypes: ['Audio', 'Video'],
        SupportedCommands: ['MoveUp', 'MoveDown', 'MoveLeft', 'MoveRight', 'PageUp', 'PageDown', 'PreviousLetter', 'NextLetter', 'ToggleOsd', 'ToggleContextMenu', 'Select', 'Back', 'SendKey', 'SendString', 'GoHome', 'GoToSettings', 'VolumeUp', 'VolumeDown', 'Mute', 'Unmute', 'ToggleMute', 'SetVolume', 'SetAudioStreamIndex', 'SetSubtitleStreamIndex', 'DisplayContent', 'GoToSearch', 'DisplayMessage', 'SetRepeatMode', 'SetShuffleQueue', 'ChannelUp', 'ChannelDown', 'PlayMediaSource', 'PlayTrailers'],
        SupportsPersistentIdentifier: window.appMode === 'cordova' || window.appMode === 'android',
        SupportsMediaControl: true
    }, appHost.getPushTokenInfo());
}

export function selectServer() {
    if (!browser.web0s && window.NativeShell && typeof window.NativeShell.selectServer === 'function') {
        window.NativeShell.selectServer();
    } else {
        navigate('selectserver.html', true);
    }
}

export function hideLoadingMsg() {
    loading.hide();
}

export function showLoadingMsg() {
    loading.show();
}

export function confirm(message, title, callback) {
    baseConfirm(message, title).then(function() {
        callback(true);
    }).catch(function() {
        callback(false);
    });
}

export const pageClassOn = function(eventName, className, fn) {
    document.addEventListener(eventName, function (event) {
        const target = event.target;

        if (target.classList.contains(className)) {
            fn.call(target, event);
        }
    });
};

export const pageIdOn = function(eventName, id, fn) {
    document.addEventListener(eventName, function (event) {
        const target = event.target;

        if (target.id === id) {
            fn.call(target, event);
        }
    });
};

const Dashboard = {
    alert,
    capabilities,
    confirm,
    getPluginUrl,
    getConfigurationResourceUrl,
    getCurrentUser,
    getCurrentUserId,
    hideLoadingMsg,
    logout,
    navigate,
    onServerChanged,
    processErrorResponse,
    processPluginConfigurationUpdateResult,
    processServerConfigurationUpdateResult,
    selectServer,
    serverAddress,
    showLoadingMsg,
    datetime,
    DirectoryBrowser,
    dialogHelper,
    itemIdentifier,
    setBackdropTransparency
};

// This is used in plugins and templates, so keep it defined for now.
// TODO: Remove once plugins don't need it
window.Dashboard = Dashboard;

export default Dashboard;
