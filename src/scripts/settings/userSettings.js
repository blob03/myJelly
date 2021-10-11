import appSettings from './appSettings';
import { Events } from 'jellyfin-apiclient';
import globalize from '../globalize';
import datetime from '../datetime';

function onSaveTimeout() {
    const self = this;
    self.saveTimeout = null;
    self.currentApiClient.updateDisplayPreferences('usersettings', self.displayPrefs, self.currentUserId, 'emby');
}

function saveServerPreferences(instance) {
    if (instance.saveTimeout) {
        clearTimeout(instance.saveTimeout);
    }

    instance.saveTimeout = setTimeout(onSaveTimeout.bind(instance), 50);
}

const defaultSubtitleAppearanceSettings = {
	verticalPosition: -1
};

function hdrClock(obj) {
	const _hdrclck = document.getElementById("headerClock");
	if (_hdrclck === null)
		return false;
	
	// If clock is disabled 
	// remove any pending timer
	// hide the clock 
	// return
	if (obj.enableClock() !== true) {
		if (obj.clockTimer !== undefined) {
			clearInterval(obj.clockTimer);
			obj.clockTimer = undefined;
		}
		_hdrclck.classList.add('hide');
		return;
	}

	var _hdrclkdate_span = document.getElementById("headerClockDate");
	if (_hdrclkdate_span == null) {
		setTimeout(function() { hdrClock(obj) }, 2000);
		return;
	}
	var _hdrclktime_span = document.getElementById("headerClockTime");
	if (_hdrclktime_span == null) {
		setTimeout(function() { hdrClock(obj) }, 2000);
		return;
	}
	globalize.updateCurrentCulture();
	const x = new Date();
	const _hdrclk_day = datetime.toLocaleDateString(x, {
			weekday: 'short',
	});
	const _hdrclk_date = datetime.toLocaleDateString(x);
	const _hdrclk_time = datetime.toLocaleTimeString(x, {
			hour: 'numeric',
			minute: '2-digit'
	});
	_hdrclkdate_span.innerHTML = _hdrclk_day + " " + _hdrclk_date;
	_hdrclktime_span.innerHTML = _hdrclk_time;
	_hdrclck.classList.remove('hide');

	if (!obj.clockTimer)
		obj.clockTimer = setInterval(function() { hdrClock(obj) }, 10000);
	
	return;
}

export class UserSettings {
    constructor() {
    }

	static clockTimer = undefined;
	
    /**
     * Bind UserSettings instance to user.
     * @param {string} - User identifier.
     * @param {Object} - ApiClient instance.
     */
    setUserInfo(userId, apiClient) {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.currentUserId = userId;
        this.currentApiClient = apiClient;

        if (!userId) {
            this.displayPrefs = null;
            return Promise.resolve();
        }

        const self = this;

        return apiClient.getDisplayPreferences('usersettings', userId, 'emby').then(function (result) {
            result.CustomPrefs = result.CustomPrefs || {};
            self.displayPrefs = result;
			hdrClock(self);
        });
    }

    // FIXME: Seems unused
    getData() {
        return this.displayPrefs;
    }

    // FIXME: Seems unused
    importFrom(instance) {
        this.displayPrefs = instance.getData();
    }

    // FIXME: 'appSettings.set' doesn't return any value
    /**
     * Set value of setting.
     * @param {string} name - Name of setting.
     * @param {mixed} value - Value of setting.
     * @param {boolean} enableOnServer - Flag to save preferences on server.
     */
    set(name, value, enableOnServer) {
        const userId = this.currentUserId;
        const currentValue = this.get(name, enableOnServer);
        const result = appSettings.set(name, value, userId);

        if (enableOnServer !== false && this.displayPrefs) {
            this.displayPrefs.CustomPrefs[name] = value == null ? value : value.toString();
            saveServerPreferences(this);
        }

        if (currentValue !== value) {
            Events.trigger(this, 'change', [name]);
        }

        return result;
    }

    /**
     * Get value of setting.
     * @param {string} name - Name of setting.
     * @param {boolean} enableOnServer - Flag to return preferences from server (cached).
     * @return {string} Value of setting.
     */
    get(name, enableOnServer) {
        const userId = this.currentUserId;
        if (enableOnServer !== false && this.displayPrefs) {
            return this.displayPrefs.CustomPrefs[name];
        }

        return appSettings.get(name, userId);
    }

    /**
     * Get or set user config.
     * @param {Object|undefined} config - Configuration or undefined.
     * @return {Object|Promise} Configuration or Promise.
     */
    serverConfig(config) {
        const apiClient = this.currentApiClient;
        if (config) {
            return apiClient.updateUserConfiguration(this.currentUserId, config);
        }

        return apiClient.getUser(this.currentUserId).then(function (user) {
            return user.Configuration;
        });
    }

    /**
     * Get or set 'Allowed Audio Channels'.
     * @param {string|undefined} val - 'Allowed Audio Channels'.
     * @return {string} 'Allowed Audio Channels'.
     */
    allowedAudioChannels(val) {
        if (val !== undefined) {
            return this.set('allowedAudioChannels', val, false);
        }

        return this.get('allowedAudioChannels', false) || '-1';
    }

    /**
     * Get or set 'Perfer fMP4-HLS Container' state.
     * @param {boolean|undefined} val - Flag to enable 'Perfer fMP4-HLS Container' or undefined.
     * @return {boolean} 'Prefer fMP4-HLS Container' state.
     */
    preferFmp4HlsContainer(val) {
        if (val !== undefined) {
            return this.set('preferFmp4HlsContainer', val.toString(), false);
        }

        val = this.get('preferFmp4HlsContainer', false);
        return val === 'true';
    }

    /**
     * Get or set 'Cinema Mode' state.
     * @param {boolean|undefined} val - Flag to enable 'Cinema Mode' or undefined.
     * @return {boolean} 'Cinema Mode' state.
     */
    enableCinemaMode(val) {
        if (val !== undefined) {
            return this.set('enableCinemaMode', val.toString(), false);
        }

        val = this.get('enableCinemaMode', false);
        return val === 'true';
    }

    /**
     * Get or set 'Next Video Info Overlay' state.
     * @param {boolean|undefined} val - Flag to enable 'Next Video Info Overlay' or undefined.
     * @return {boolean} 'Next Video Info Overlay' state.
     */
    enableNextVideoInfoOverlay(val) {
        if (val !== undefined) {
            return this.set('enableNextVideoInfoOverlay', val.toString(), false); 
        }

        val = this.get('enableNextVideoInfoOverlay', false);
        return val === 'true';
    }

    /**
     * Get or set 'Theme Songs' state.
     * @param {boolean|undefined} val - Flag to enable 'Theme Songs' or undefined.
     * @return {boolean} 'Theme Songs' state.
     */
    enableThemeSongs(val) {
        if (val !== undefined) {
            return this.set('enableThemeSongs', val.toString());
        }

        val = this.get('enableThemeSongs');
        return val === 'true';
    }

    /**
     * Get or set 'Theme Videos' state.
     * @param {boolean|undefined} val - Flag to enable 'Theme Videos' or undefined.
     * @return {boolean} 'Theme Videos' state.
     */
    enableThemeVideos(val) {
        if (val !== undefined) {
            return this.set('enableThemeVideos', val.toString());
        }

        val = this.get('enableThemeVideos');
        return val === 'true';
    }
	
	/**
     * Get or set 'Use Episode Images in Next Up and Continue Watching' state.
     * @param {string|boolean|undefined} val - Flag to enable 'Use Episode Images in Next Up and Continue Watching' or undefined.
     * @return {boolean} 'Use Episode Images in Next Up' state.
     */
    useEpisodeImagesInNextUpAndResume(val) {
        if (val !== undefined) {
            return this.set('useEpisodeImagesInNextUpAndResume', val.toString(), true);
        }

        val = this.get('useEpisodeImagesInNextUpAndResume', true);
        return val === 'true';
    }

    /**
     * Get or set 'Clock' state.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Clock' (Set) or undefined (Get).
     * @return {boolean} 'Clock' state (Get) or success/failure status (Set).
     */
	enableClock(val) {
        if (val !== undefined) {
			if (val === false) {
				/* Stop and hide the clock. */
				this.set('clock', 'false');
				hdrClock(this);
			} else {
				/* In case the clock isn't running already, unhide and start it. */
				this.set('clock', 'true');
				hdrClock(this);
			}
            return true;
        }
		val = this.get('clock');
        return val === 'true';
    }

    /**
     * Get or set 'Fast Fade-in' state.
     * @param {boolean|undefined} val - Flag to enable 'Fast Fade-in' or undefined.
     * @return {boolean} 'Fast Fade-in' state.
     */
    enableFastFadein(val) {
        if (val !== undefined) {
            return this.set('fastFadein', val.toString());
        }

        val = this.get('fastFadein');
        return val !== 'false';
    }

    /**
     * Get or set 'Blurhash' state.
     * @param {boolean|undefined} val - Flag to enable 'Blurhash' or undefined.
     * @return {boolean} 'Blurhash' state.
     */
    enableBlurhash(val) {
        if (val !== undefined) {
            return this.set('blurhash', val.toString());
        }

        val = this.get('blurhash');
        return val !== 'false';
    }

    /**
     * Get or set 'Backdrops' source.
     * @param {string|undefined} val - String to set 'Backdrops' source or undefined.
     * @return {string} 'Backdrops' source.
     */
    enableBackdrops(val) {
        if (val !== undefined) {
            return this.set('enableBackdrops', val.toString());
        }

        val = this.get('enableBackdrops');
        return val;
    }

    /**
     * Get or set 'Details Banner' state.
     * @param {boolean|undefined} val - Flag to enable 'Details Banner' or undefined.
     * @return {boolean} 'Details Banner' state.
     */
    detailsBanner(val) {
        if (val !== undefined) {
            return this.set('detailsBanner', val.toString(), false);
        }

        val = this.get('detailsBanner', false);
        return val !== 'false';
    }

    /**
     * Get or set language.
     * @param {string|undefined} val - Language.
     * @return {string} Language.
     */
    language(val) {
        if (val !== undefined) {
            return this.set('language', val.toString(), true);
        }

        return this.get('language');
    }

    /**
     * Get or set datetime locale.
     * @param {string|undefined} val - Datetime locale.
     * @return {string} Datetime locale.
     */
    dateTimeLocale(val) {
        if (val !== undefined) {
            return this.set('datetimelocale', val.toString());
        }

        return this.get('datetimelocale');
    }

    /**
     * Get or set Chromecast version.
     * @param {string|undefined} val - Chromecast version.
     * @return {string} Chromecast version.
     */
    chromecastVersion(val) {
        if (val !== undefined) {
            return this.set('chromecastVersion', val.toString());
        }

        return this.get('chromecastVersion') || 'stable';
    }

    /**
     * Get or set amount of rewind.
     * @param {number|undefined} val - Amount of rewind.
     * @return {number} Amount of rewind.
     */
    skipBackLength(val) {
        if (val !== undefined) {
            return this.set('skipBackLength', val.toString());
        }

        return parseInt(this.get('skipBackLength') || '10000');
    }

    /**
     * Get or set amount of fast forward.
     * @param {number|undefined} val - Amount of fast forward.
     * @return {number} Amount of fast forward.
     */
    skipForwardLength(val) {
        if (val !== undefined) {
            return this.set('skipForwardLength', val.toString());
        }

        return parseInt(this.get('skipForwardLength') || '30000');
    }

    /**
     * Get or set theme for Dashboard.
     * @param {string|undefined} val - Theme for Dashboard.
     * @return {string} Theme for Dashboard.
     */
    dashboardTheme(val) {
        if (val !== undefined) {
            return this.set('dashboardTheme', val);
        }

        return this.get('dashboardTheme');
    }

    /**
     * Get or set skin.
     * @param {string|undefined} val - Skin.
     * @return {string} Skin.
     */
    skin(val) {
        if (val !== undefined) {
            return this.set('skin', val, false);
        }

        return this.get('skin', false);
    }

    /**
     * Get or set main theme.
     * @param {string|undefined} val - Main theme.
     * @return {string} Main theme.
     */
    theme(val) {
        if (val !== undefined) {
            return this.set('appTheme', val);
        }

        return this.get('appTheme');
    }

    /**
     * Get or set screensaver.
     * @param {string|undefined} val - Screensaver.
     * @return {string} Screensaver.
     */
    screensaver(val) {
        if (val !== undefined) {
            return this.set('screensaver', val);
        }

        return this.get('screensaver');
    }

    /**
     * Get or set screensaver minimum time before activation.
     * @param {string|undefined} val - Screensaver-idletime.
     * @return {string} Screensaver-idletime.
     */
    screensaverTime(val) {
        if (val !== undefined) 
            return this.set('screensaverTime', parseInt(val, 10));
        
		const screensaverTime = this.get('screensaverTime');
		if (isNaN(screensaverTime) || screensaverTime > 1800000) 
			return 180000; // default to 3min in ms.
        else 
            return screensaverTime;
    }
	
    /**
     * Get or set library page size.
     * @param {number|undefined} val - Library page size.
     * @return {number} Library page size.
     */
    libraryPageSize(val) {
        if (val !== undefined) 
            return this.set('libraryPageSize', parseInt(val, 10));

        const libraryPageSize = this.get('libraryPageSize');
		if (isNaN(libraryPageSize) || libraryPageSize > 128) 
			return 60;
        else 
            return libraryPageSize;
    }

	/**
     * Get or set max days for next up list.
     * @param {number|undefined} val - Max days for next up.
     * @return {number} Max days for a show to stay in next up without being watched.
     */
    maxDaysForNextUp(val) {
        if (val !== undefined) 
            return this.set('maxDaysForNextUp', parseInt(val, 10));

        const maxDaysForNextUp = this.get('maxDaysForNextUp');
        if (isNaN(maxDaysForNextUp) || !maxDaysForNextUp || maxDaysForNextUp > 365) 
			return 30;
        else 
            return maxDaysForNextUp;
    }
	
    /**
     * Get or set sound effects.
     * @param {string|undefined} val - Sound effects.
     * @return {string} Sound effects.
     */
    soundEffects(val) {
        if (val !== undefined) {
            return this.set('soundeffects', val, false);
        }

        return this.get('soundeffects', false);
    }

    /**
     * Load query settings.
     * @param {string} key - Query key.
     * @param {Object} query - Query base.
     * @return {Object} Query.
     */
    loadQuerySettings(key, query) {
        let values = this.get(key);
        if (values) {
            values = JSON.parse(values);
            return Object.assign(query, values);
        }

        return query;
    }

    /**
     * Save query settings.
     * @param {string} key - Query key.
     * @param {Object} query - Query.
     */
    saveQuerySettings(key, query) {
        const values = {};
        if (query.SortBy) {
            values.SortBy = query.SortBy;
        }

        if (query.SortOrder) {
            values.SortOrder = query.SortOrder;
        }

        return this.set(key, JSON.stringify(values));
    }



    /**
     * Get subtitle appearance settings.
     * @param {string|undefined} key - Settings key.
     * @return {Object} Subtitle appearance settings.
     */
    getSubtitleAppearanceSettings(key) {
        key = key || 'localplayersubtitleappearance3';
        return Object.assign(defaultSubtitleAppearanceSettings, JSON.parse(this.get(key, false) || '{}'));
    }

    /**
     * Set subtitle appearance settings.
     * @param {Object} value - Subtitle appearance settings.
     * @param {string|undefined} key - Settings key.
     */
    setSubtitleAppearanceSettings(value, key) {
        key = key || 'localplayersubtitleappearance3';
        return this.set(key, JSON.stringify(value), true);
    }

    /**
     * Set filter.
     * @param {string} key - Filter key.
     * @param {string} value - Filter value.
     */
    setFilter(key, value) {
        return this.set(key, value, true);
    }

    /**
     * Get filter.
     * @param {string} key - Filter key.
     * @return {string} Filter value.
     */
    getFilter(key) {
        return this.get(key, true);
    }
}

export const currentSettings = new UserSettings;

// Wrappers for non-ES6 modules and backward compatibility
export const setUserInfo = currentSettings.setUserInfo.bind(currentSettings);
export const getData = currentSettings.getData.bind(currentSettings);
export const importFrom = currentSettings.importFrom.bind(currentSettings);
export const set = currentSettings.set.bind(currentSettings);
export const get = currentSettings.get.bind(currentSettings);
export const serverConfig = currentSettings.serverConfig.bind(currentSettings);
export const allowedAudioChannels = currentSettings.allowedAudioChannels.bind(currentSettings);
export const preferFmp4HlsContainer = currentSettings.preferFmp4HlsContainer.bind(currentSettings);
export const enableCinemaMode = currentSettings.enableCinemaMode.bind(currentSettings);
export const enableNextVideoInfoOverlay = currentSettings.enableNextVideoInfoOverlay.bind(currentSettings);
export const enableThemeSongs = currentSettings.enableThemeSongs.bind(currentSettings);
export const enableThemeVideos = currentSettings.enableThemeVideos.bind(currentSettings);
export const enableFastFadein = currentSettings.enableFastFadein.bind(currentSettings);
export const enableClock = currentSettings.enableClock.bind(currentSettings);
export const enableBlurhash = currentSettings.enableBlurhash.bind(currentSettings);
export const enableBackdrops = currentSettings.enableBackdrops.bind(currentSettings);
export const detailsBanner = currentSettings.detailsBanner.bind(currentSettings);
export const useEpisodeImagesInNextUpAndResume = currentSettings.useEpisodeImagesInNextUpAndResume.bind(currentSettings);
export const language = currentSettings.language.bind(currentSettings);
export const dateTimeLocale = currentSettings.dateTimeLocale.bind(currentSettings);
export const chromecastVersion = currentSettings.chromecastVersion.bind(currentSettings);
export const skipBackLength = currentSettings.skipBackLength.bind(currentSettings);
export const skipForwardLength = currentSettings.skipForwardLength.bind(currentSettings);
export const dashboardTheme = currentSettings.dashboardTheme.bind(currentSettings);
export const skin = currentSettings.skin.bind(currentSettings);
export const theme = currentSettings.theme.bind(currentSettings);
export const screensaver = currentSettings.screensaver.bind(currentSettings);
export const screensaverTime = currentSettings.screensaverTime.bind(currentSettings);
export const libraryPageSize = currentSettings.libraryPageSize.bind(currentSettings);
export const maxDaysForNextUp = currentSettings.maxDaysForNextUp.bind(currentSettings);
export const soundEffects = currentSettings.soundEffects.bind(currentSettings);
export const loadQuerySettings = currentSettings.loadQuerySettings.bind(currentSettings);
export const saveQuerySettings = currentSettings.saveQuerySettings.bind(currentSettings);
export const getSubtitleAppearanceSettings = currentSettings.getSubtitleAppearanceSettings.bind(currentSettings);
export const setSubtitleAppearanceSettings = currentSettings.setSubtitleAppearanceSettings.bind(currentSettings);
export const setFilter = currentSettings.setFilter.bind(currentSettings);
export const getFilter = currentSettings.getFilter.bind(currentSettings);
