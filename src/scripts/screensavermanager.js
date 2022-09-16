import { Events } from 'jellyfin-apiclient';
import { playbackManager } from '../components/playback/playbackmanager';
import { pluginManager } from '../components/pluginManager';
import inputManager from './inputManager';
import * as userSettings from './settings/userSettings';
import ServerConnections from '../components/ServerConnections';
import layoutManager from '../components/layoutManager';
import './screensavermanager.scss';

function getMinIdleTime() {
    // Returns the minimum amount of idle time required before the screen saver can be displayed
    //time units used Millisecond
	const timedefault = 180000;
	let idletime;
	try {
        idletime = userSettings.get('screensaverTime', false) || timedefault;
    } catch (err) {
        idletime = timedefault;
    }
    return idletime;
}

let lastFunctionalEvent = 0;

function getFunctionalEventIdleTime() {
    return new Date().getTime() - lastFunctionalEvent;
}

Events.on(playbackManager, 'playbackstop', function (_e, stopInfo) {
    const state = stopInfo.state;
    if (state.NowPlayingItem && state.NowPlayingItem.MediaType == 'Video') {
        lastFunctionalEvent = new Date().getTime();
    }
});

export function getScreensaverPlugin(isLoggedIn) {
    let option;
    try {
        option = userSettings.get('screensaver', false);
    } catch (err) {
        option = isLoggedIn ? 'backdropscreensaver' : 'logoscreensaver';
    }

    const plugins = pluginManager.ofType('screensaver');

	// If random screensaver was selected.
	if (option === "any") {
		let rand = Math.floor(Math.random() * Object.keys(plugins).length);
		return plugins[rand];
	}
		
    for (const plugin of plugins) {
        if (plugin.id === option) {
            return plugin;
        }
    }

    return null;
}

export function getScreensaverPluginByName(name) {
	if (!name)
        return null;

    const plugins = pluginManager.ofType('screensaver');

	// If random screensaver was selected.
	if (name === "any") {
		let rand = Math.floor(Math.random() * Object.keys(plugins).length);
		return plugins[rand];
	}
		
    for (const plugin of plugins) {
        if (plugin.id === name) {
            return plugin;
        }
    }

    return null;
}

export function ScreenSaverManager() {
    let activeScreenSaver;
	let self = this;
	
	this.showScreenSaver = (ssplugin, TEST) => {
        if (self.activeScreenSaver) 
            throw new Error('An existing screensaver is already active.');

        console.debug('Showing screensaver ' + ssplugin.name);
        document.body.classList.add('screensaver-noScroll');

        self.activeScreenSaver = ssplugin;	
		ssplugin.show(TEST);
		
		setTimeout(() => {
			if (ssplugin.hideOnClick !== false) {
				window.addEventListener('click', self.hide, true);
			}
			if (!layoutManager.tv && ssplugin.hideOnMouse !== false) {
				window.addEventListener('mousemove', self.hide, true);
			}
			if (ssplugin.hideOnKey !== false) {
				window.addEventListener('keydown', self.hide, true);
			}
		}, 1500);
    }

    this.hide = () => {
        if (self.activeScreenSaver) {
            console.debug('Hiding screensaver');
            self.activeScreenSaver.hide().then( () => {
                document.body.classList.remove('screensaver-noScroll');
            });
            self.activeScreenSaver = null;
        }
        window.removeEventListener('click', self.hide, true);
        window.removeEventListener('mousemove', self.hide, true);
        window.removeEventListener('keydown', self.hide, true);
    }

    this.isShowing = () => {
        return self.activeScreenSaver != null;
    };

    this.show = function () {
        let isLoggedIn;
        const apiClient = ServerConnections.currentApiClient();

        if (apiClient && apiClient.isLoggedIn())
            isLoggedIn = true;
        
        const screensaver = getScreensaverPlugin(isLoggedIn);
        if (screensaver) 
            self.showScreenSaver(screensaver, false);
    };

    const onInterval = () => {
        if (self.isShowing()) {
            return;
        }

        if (inputManager.idleTime() < getMinIdleTime()) {
            return;
        }

        if (getFunctionalEventIdleTime() < getMinIdleTime()) {
            return;
        }

        if (playbackManager.isPlayingVideo()) {
            return;
        }

        self.show();
    };

    setInterval(onInterval, 10000);
}

export const ssmanager = new ScreenSaverManager;
export const showScreenSaver = ssmanager.showScreenSaver.bind(ssmanager);

export default new ScreenSaverManager;
