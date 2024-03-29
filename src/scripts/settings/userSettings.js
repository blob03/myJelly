import appSettings from './appSettings';
import { getDefaultTheme, loadUserPresets, listUserPresets, WBScreen3Refresh } from './webSettings';
import Events from '../../utils/events.ts';
import { toBoolean, toPrecision } from '../../utils/string.ts';
import { pad } from '../../utils/number.ts';
import globalize from '../globalize';
import datetime from '../datetime';
import { ajax } from '../../components/fetchhelper';

function onSaveTimeout() {
    this.saveTimeout = null;
    this.currentApiClient.updateDisplayPreferences('usersettings', this.displayPrefs, this.currentUserId, 'emby');
}

function getSavePromise(self) {
    return self.currentApiClient.updateDisplayPreferences('usersettings', self.displayPrefs, self.currentUserId, 'emby');
}

function saveServerPreferences(instance) {
    if (instance.saveTimeout) {
        clearTimeout(instance.saveTimeout);
    }

    instance.saveTimeout = setTimeout(onSaveTimeout.bind(instance), 50);
}

function hdrClock() {
	const x = new Date();
	const _hdrclk_time = datetime.toLocaleTimeString(x, currentSettings._opts_time); 
	const _hdrclk_date = datetime.toLocaleDateString(x, currentSettings._opts_date);
	currentSettings._hdrclkdate.innerHTML = _hdrclk_date;
	currentSettings._hdrclktime.innerHTML = _hdrclk_time;
	return;
}

function isSecure() {
   return location.protocol == 'https:';
}

//
// api.openweathermap.org
//

function hdrWeather() {
	const self = this;
	const _lat = this.getlatitude();
	const _lon = this.getlongitude();
	const wapikey = this.weatherApiKey();
	const enableUSUnits = (globalize.getCurrentDateTimeLocale() === 'en-US')? true: false;
	
	if (!wapikey) {
		console.warn("No OpenWeather API key has been configured. Weatherbot will now stop.");
		this._hdrwth.msg.innerHTML = globalize.translate('MissingAPIKey');
		this.WB_setButtons(0);
		return;
	}
	
	let url = {};
	url.proto = isSecure() ? 'https://' : 'http://' ;
	url.base_icon = 'openweathermap.org/img/wn/';
	url.base = 'api.openweathermap.org/data/2.5/';
	url.apiMethod = 'weather';
	url.params = '?appid=' + wapikey
		+ '&lat=' + _lat + '&lon=' + _lon
		+ '&units=' + (enableUSUnits? 'imperial': 'metric')
		+ '&mode=xml'
		+ '&lang=' + this.convertCountryCode(this.language());
	
	let req = {};
	req.dataType = 'text';
	req.url = url.proto + url.base + url.apiMethod + url.params; 
	
	let _contimeout = setTimeout(() => {
		self._hdrwth.msg.innerHTML = globalize.translate('Connecting');
		self.WB_setButtons(0);
	}, 3000);
	
	ajax(req).then(function (data) {
		clearInterval(_contimeout);
		let _xmlDoc;
		let _root;
		let _parser;
		let _dyn;
		let _data = {};
		
		if (window.DOMParser) {
			_parser = new DOMParser();
			if (_parser) {
				_xmlDoc = _parser.parseFromString(data, "text/xml");
				if (_xmlDoc) 
					_root = _xmlDoc.getElementsByTagName("current")[0];
			}
		}
		
		if (_root) {
			if (_root.getElementsByTagName("weather")[0]) {
				_data.icon = _root.getElementsByTagName("weather")[0].getAttribute("icon");
				_data.title = _root.getElementsByTagName("weather")[0].getAttribute("value");
			}
			if (_root.getElementsByTagName("temperature")[0])
				_data.temp = _root.getElementsByTagName("temperature")[0].getAttribute("value");
			if (_root.getElementsByTagName("feels_like")[0])
				_data.feelslike = _root.getElementsByTagName("feels_like")[0].getAttribute("value");
			if (_root.getElementsByTagName("city")[0])
				_data.name = _root.getElementsByTagName("city")[0].getAttribute("name");
			
			if (_root.getElementsByTagName("humidity")[0])
				_data.hum = _root.getElementsByTagName("humidity")[0].getAttribute("value");
			
			if (_root.getElementsByTagName("pressure")[0]) {
				_data.pressure = _root.getElementsByTagName("pressure")[0].getAttribute("value");
				_data.pressureUnit = _root.getElementsByTagName("pressure")[0].getAttribute("unit");
			}
			if (_root.getElementsByTagName("wind")[0]) {
				_data.speed = _root.getElementsByTagName("wind")[0].getElementsByTagName("speed")[0].getAttribute("value");
				_data.dir = _root.getElementsByTagName("wind")[0].getElementsByTagName("direction")[0].getAttribute("value");
				_data.code = _root.getElementsByTagName("wind")[0].getElementsByTagName("direction")[0].getAttribute("code");
			}
			if (_root.getElementsByTagName("city")[0]) {
				_data.sunrise = _root.getElementsByTagName("city")[0].getElementsByTagName("sun")[0].getAttribute("rise");
				_data.sunset = _root.getElementsByTagName("city")[0].getElementsByTagName("sun")[0].getAttribute("set");
				_data.country = _root.getElementsByTagName("city")[0].getElementsByTagName("country")[0].textContent;
			}
		}
		
		if (_data.icon) {
			self._hdrwth.icon.src = url.proto + url.base_icon + _data.icon + '.png';
			if (_data.title)
				self._hdrwth.icon.title = _data.title;
		} 
		
		if (_data.temp) {
			if (_data.feelslike && (self.enableWeatherBot() & 4)) {
				_dyn = '<div style="display: flex;flex-direction: column;justify-content: center;align-items: center;">';
				_dyn += '<div title="' + globalize.translate('WeatherbotShowFeelsLikeTemp') + '" id="feelsLikeTempFrame">' + toPrecision(_data.feelslike, 1) + '</div>';
				_dyn += '<div title="' + globalize.translate('Temperature') + '" id="measuredTempFrame">' + toPrecision(_data.temp, 1) + '</div>';
				_dyn += '</div>';
				_dyn += '<div class="headerWthTempUnit">';
				_dyn += (enableUSUnits? '&#8457;': '&#8451;');
				_dyn += '</div>';
			} else {
				_dyn = '<div title="' + globalize.translate('Temperature') + '" style="display: flex;flex-direction: row;justify-content: center; align-items: flex-start; height: 100%;">';
				_dyn += '<div>';
				_dyn += toPrecision(_data.temp, 1);
				_dyn += '</div>';
				_dyn += '<span class="headerWthUnit">';
				_dyn += (enableUSUnits? '&#8457;': '&#8451;');
				_dyn += '</span></div>';
			}
			self._hdrwth.temp.innerHTML = _dyn;
		}
		
		self._hdrwth.city.classList.toggle('hide', !(self.enableWeatherBot() & 8));
		
		if (_data.name) {
			self._hdrwth.city.innerHTML = _data.name;
			if (_data.country)
				self._hdrwth.city.title = _data.country;
		}
		
		if (_data.hum) {
			_dyn = toPrecision(_data.hum, 1);
			_dyn += '<span class="headerWthUnit">%</span>';
			self._hdrwth.hum.innerHTML = _dyn;
			self._hdrwth.hum.title = globalize.translate('Humidity');
		}
		
		if (_data.pressure) {
			_dyn = toPrecision(_data.pressure, 1);
			_dyn += '<span class="headerWthUnit">';
			if (_data.pressureUnit)
				_dyn += _data.pressureUnit;
			else
				_dyn += 'hPa';
			_dyn += '</span>';
			self._hdrwth.pressure.innerHTML = _dyn;
			self._hdrwth.pressure.title = globalize.translate('Pressure');
		}
		
		if (_data.speed) {
			let wspeed = _data.speed;
			if (!enableUSUnits)
				wspeed *= 3.6; // m/s -> km/h
			_dyn = toPrecision(wspeed, 1);
			_dyn += '<span class="headerWthUnit">';
			_dyn += (enableUSUnits? 'mph': 'km/h') + '</span>';
			self._hdrwth.wind.innerHTML = _dyn;
			self._hdrwth.wind.title = globalize.translate('WindSpeed');
		}
		
		if (_data.dir) {
			_dyn = _data.dir;
			_dyn += '<span class="headerWthUnit">&deg;</span>';
			self._hdrwth.windDir.innerHTML = _dyn;
			self._hdrwth.windDir.title = globalize.translate('WindDir');
			if (_data.code) {
				_dyn = '<span class="headerWthWDirection">' + _data.code + '</span>';
				self._hdrwth.windDir.innerHTML += _dyn;
			}
		}
		
		self._date_sunrise = 0;
		self._date_sunset = 0;
		
		if (_data.sunrise) {
			 if (_data.sunrise.charAt(_data.sunrise.length - 1).toUpperCase() !== 'Z')
				_data.sunrise += 'Z';
			const x = new Date(_data.sunrise);
			self._date_sunrise = x.getTime();
			self._hdrwth.sr.current = datetime.toLocaleTimeString(x, currentSettings._opts_time);
			if (self._hdrwth.sr.innerHTML === "")
				self._hdrwth.sr.innerHTML = self._hdrwth.sr.current;
		}
		
		if (_data.sunset) {
			if (_data.sunset.charAt(_data.sunset.length - 1).toUpperCase() !== 'Z')
				_data.sunset += 'Z'; 
			const x = new Date(_data.sunset);
			self._date_sunset = x.getTime();
			self._hdrwth.ss.current = datetime.toLocaleTimeString(x, currentSettings._opts_time);
			if (self._hdrwth.ss.innerHTML === "")
				self._hdrwth.ss.innerHTML = self._hdrwth.ss.current;
		}
		
		const z = Date.now();
		const _WBdayTime = document.getElementById('WBdayTime'); 
		const _WBnightTime = document.getElementById('WBnightTime'); 
		
		if (self._date_sunrise && self._date_sunset) {
			if (z >= self._date_sunrise && z < self._date_sunset) {
				_WBdayTime.classList.add('active');
				_WBnightTime.classList.remove('active');
				if (self.enableNightModeSwitch() === 2)
					self.toggleNightMode({toggle: false, newval: false});
			} else {
				_WBdayTime.classList.remove('active');
				_WBnightTime.classList.add('active');
				if (self.enableNightModeSwitch() === 2)
					self.toggleNightMode({toggle: false, newval: true});
			}
		} 
		
		self.WB_setButtons();
		
	}).catch(function (data) {
		clearInterval(_contimeout);
		console.warn(data);
		if (data.status) {
			let _msg = data.status;
			if (data.statusText)
				_msg += '<br/>' + data.statusText;
			self._hdrwth.msg.innerHTML = _msg; 
		} else
			self._hdrwth.msg.innerHTML = globalize.translate('NoConnectivity');
		self.WB_setButtons(0);
	});
	return;
}

const defaultComicsPlayerSettings = {
    langDir: 'ltr',
    pagesPerView: 1
};
		
export class UserSettings {
    constructor() {
		this.clockTimer = null;
		this.weatherTimer = null;
		this._hdrclkdate;
		this._hdrclktime;
		this._hdrwth = {};
		this._clkmode = 4;
		this._wbmode = 1;
		this._pwrButtons = false;
		this._opts_date = {year: 'numeric', day: '2-digit', weekday: 'long', month: 'long', timeZoneName: undefined};
		this._opts_time = {hour: 'numeric', minute: '2-digit'};
		this._date_sunrise = 0;
		this._date_sunset = 0;
    }
	
	/**
     * Convert country codes between jellyfin and the OpenWeather API.
     */
	convertCountryCode(code) {
		let ret = code;
		// Auto mode
		if (ret === '')
			ret = globalize.getDefaultCulture().ccode;
	
		switch(ret) {
			case 'nb':
			case 'nn':
				ret = 'no';
				break;
			case 'fr-CA':
				ret = 'fr';
				break;
			case 'en-US':
			case 'en-GB':
				ret = 'en';
				break;
			case 'es-419':
			case 'es-MX':
			case 'es-AR':
			case 'es-DO':
				ret = 'es';
				break;
			case 'pt-PT':
				ret = 'pt';
				break;
			case 'pt-BR':
				ret = 'pt_br';
				break;
			case 'zh-TW':
				ret = 'zh_tw';
				break;
			case 'zh-CN':
				ret = 'zh_cn';
				break;
		}
		return ret;
	}
	
	/**
     * Return the user the current instance is bound to.
     */
	getCurrentUserId() {
		return this.currentUserId;
	}
	
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
        });
    }
	
	/**
	* Reset current user settings.
	* @param {string} - User identifier.
	* @param {Object} - ApiClient instance.
	*/
    resetUserInfo(userId, presetsName, resetLocalization) {
        if (!userId)
			userId = this.currentUserId;
		let apiClient = this.currentApiClient;
        let prefs = this.displayPrefs;
		
		if (!prefs || !apiClient || !userId)
            return Promise.reject();
		
		if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        } 

		// user.Configuration contains configuration used by the server code.
		let userConf = {};
		userConf.AudioLanguagePreference = "";
		userConf.DisplayCollectionsView = false;
		userConf.DisplayMissingEpisodes = false;
		userConf.EnableNextEpisodeAutoPlay = false;
		userConf.GroupedFolders = [];
		userConf.HidePlayedInLatest = true;
		userConf.LatestItemsExcludes = [];
		userConf.MyMediaExcludes = [];
		userConf.OrderedViews = [];
		userConf.PlayDefaultAudioTrack = true;
		userConf.RememberAudioSelections = false;
		userConf.RememberSubtitleSelections = false;
		userConf.SubtitleLanguagePreference = "";
		userConf.SubtitleMode = "Default";
		
		// usersettings.CustomPrefs contains parameters for the web client.
		let defaultTheme = getDefaultTheme();
		let userPrefs = { ...prefs.CustomPrefs };
		userPrefs.appTheme = defaultTheme? defaultTheme.id : "";
		userPrefs.backdropDelay = "150";
		userPrefs.backdropWidget = "0";
		userPrefs.blurhash = "8";
		userPrefs.chromecastVersion = "stable";
		userPrefs.clock = "0";
		userPrefs.clock_pos = "0";
		userPrefs.dashboardTheme = defaultTheme? defaultTheme.id : "";
		userPrefs.detailsBanner = "false";
		userPrefs.displayFontSize = "0";
		userPrefs.enableBackdrops = "none";
		userPrefs.enableNextVideoInfoOverlay = "false";
		userPrefs.enableRewatchingInNextUp = "false";
		userPrefs.enableThemeSongs = "false";
		userPrefs.enableThemeVideos = "false";
		userPrefs.fastFadein = "false";
		userPrefs.libraryPageSize = "";
		userPrefs.menuPin = "0";
		userPrefs.muteButton = "false";
		userPrefs.volumeSlider = "false";
		userPrefs.nightModeSwitch = "0";
		userPrefs.preferFmp4HlsContainer = "false";
		userPrefs.screensaver = "none";
		userPrefs.screensaverTime = "0";
		userPrefs.skipBackLength = "30000";
		userPrefs.skipForwardLength = "30000";
		userPrefs.subtitlesAppearance = "{}";
		userPrefs.swiperDelay = "";
		userPrefs.swiperFX = "horizontal";
		userPrefs.tvhome = "";
		userPrefs.useCardLayoutInHomeSections = "false";
		userPrefs.useEpisodeImagesInNextUpAndResume = "false";
		if (resetLocalization) {
			userPrefs.latitude = "";
			userPrefs.longitude = "";
			userPrefs.weatherApiKey = "";
			userPrefs.APIDelay = "";
			userPrefs.weatherbot = "0";
			userPrefs.language = "";
			userPrefs.languageAlt = "";
			userPrefs.datetimelocale = "";
		}
		prefs.CustomPrefs = { ...userPrefs };
		
		const x = loadUserPresets(presetsName);
		if (x?.userPrefs)
			prefs.CustomPrefs = { ...userPrefs, ...x.userPrefs };
		if (x?.userConf)
			userConf = { ...userConf, ...x.userConf };
	
		return apiClient.updateUserConfiguration(userId, userConf).then( () => {
					apiClient.updateDisplayPreferences('usersettings', prefs, userId, 'emby')} );
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

        if (this.displayPrefs) {
            this.displayPrefs.CustomPrefs[name] = value == null ? value : value.toString();
			if (enableOnServer === true)
				saveServerPreferences(this);
        }

        if (currentValue !== value) {
            Events.trigger(this, 'change', [name]);
        }

        return result;
    }
	
	/**
	 * Ask the API to save the user preferences into the server storage, all at once
	 * and provide a promise to the caller.
	 */
	commit() {
		if (this.displayPrefs)
			return getSavePromise(this);
		return new Promise((resolve, reject) => {});
	}

    /**
     * Get value of setting.
     * @param {string} name - Name of setting.
     * @param {boolean} enableOnServer - Flag to return preferences from server (cached).
     * @return {string} Value of setting or ''.
     */
	get(name, enableOnServer) {
        if (enableOnServer !== false && this.displayPrefs) {
            return this.displayPrefs.CustomPrefs[name];
        }
		const userId = this.currentUserId;
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
            return this.set('allowedAudioChannels', val);
        }

        return this.get('allowedAudioChannels') || '-1';
    }

    /**
     * Get or set 'Perfer fMP4-HLS Container' state.
     * @param {boolean|undefined} val - Flag to enable 'Perfer fMP4-HLS Container' or undefined.
     * @return {boolean} 'Prefer fMP4-HLS Container' state.
     */
    preferFmp4HlsContainer(val) {
        if (val !== undefined) {
            return this.set('preferFmp4HlsContainer', val.toString());
        }

        return toBoolean(this.get('preferFmp4HlsContainer'), false);
    }
	
    /**
     * Get or set 'Cinema Mode' state.
     * @param {boolean|undefined} val - Flag to enable 'Cinema Mode' or undefined.
     * @return {boolean} 'Cinema Mode' state.
     */
    enableCinemaMode(val) {
        if (val !== undefined) {
            return this.set('enableCinemaMode', val.toString());
        }

        return toBoolean(this.get('enableCinemaMode'), true);
    }
	
	/**
     * Get or set 'AudioLanguagePreference' state.
     * @param {boolean|undefined} val - Language to set or undefined.
     * @return {boolean} 'AudioLanguagePreference' state.
     */
    AudioLanguagePreference(val) {
        if (val !== undefined) {
            return this.set('AudioLanguagePreference', val.toString());
        }

        val = this.get('AudioLanguagePreference') || '';
        return val;
    }

	/**
     * Get or set 'Enable Audio Normalization' state.
     * @param {boolean|undefined} val - Flag to enable 'Enable Audio Normalization' or undefined.
     * @return {boolean} 'Enable Audio Normalization' state.
     */
    enableAudioNormalization(val) {
        if (val !== undefined) {
            return this.set('enableAudioNormalization', val.toString(), false);
        }

        return toBoolean(this.get('enableAudioNormalization', false), true);
    }
	
    /**
     * Get or set 'Next Video Info Overlay' state.
     * @param {boolean|undefined} val - Flag to enable 'Next Video Info Overlay' or undefined.
     * @return {boolean} 'Next Video Info Overlay' state.
     */
    enableNextVideoInfoOverlay(val) {
        if (val !== undefined) {
            return this.set('enableNextVideoInfoOverlay', val.toString()); 
        }

        return toBoolean(this.get('enableNextVideoInfoOverlay'), false);
    }
	
	/**
     * Get or set 'Video Remaining/Total Time' state.
     * @param {boolean|undefined} val - Flag to enable 'Video Remaining/Total Time' or undefined.
     * @return {boolean} 'Video Remaining/Total Time' state.
     */
    enableVideoRemainingTime(val) {
        if (val !== undefined) {
            return this.set('enableVideoRemainingTime', val.toString());
        }

        return toBoolean(this.get('enableVideoRemainingTime', false), true);
    }
	
	/**
     * Get or set 'Latitude' coordinate.
     * @param {boolean|undefined} val - Value to set 'Latitude' or undefined.
     * @return {boolean} 'Latitude' currently set.
     */
    getlatitude(val) {
        if (val !== undefined) {
            return this.set('latitude', val.toString()); 
        }

        val = this.get('latitude') || 78.69;
        return val.toString();
    }
	
	/**
     * Get or set 'longitude' coordinate.
     * @param {boolean|undefined} val - Value to set 'longitude' or undefined.
     * @return {boolean} 'longitude' currently set.
     */
    getlongitude(val) {
        if (val !== undefined) {
            return this.set('longitude', val.toString()); 
        }

        val = this.get('longitude') || 15.72;
        return val.toString();
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

        return toBoolean(this.get('enableThemeSongs'), false);
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

        return toBoolean(this.get('enableThemeVideos'), false);
    }
	
	/**
     * Get or set 'Mute button' state.
     * @param {boolean|undefined} val - Flag to force 'mute' button in osd or undefined.
     * @return {boolean} 'Mute button' state.
     */
	muteButton(val) {
		if (val !== undefined) {
			return this.set('muteButton', val.toString());
		}
		
		return toBoolean(this.get('muteButton'), false);
	}
	
	/**
     * Get or set 'Volume slider' state.
     * @param {boolean|undefined} val - Flag to force the 'volume' slider in osd or undefined.
     * @return {boolean} 'Volume slider' state.
     */
	volumeSlider(val) {
		if (val !== undefined) {
			return this.set('volumeSlider', val.toString());
		}
		
		return toBoolean(this.get('volumeSlider'), false);
	}
	
	/**
     * Get or set 'Use Episode Images in Next Up and Continue Watching' state.
     * @param {string|boolean|undefined} val - Flag to enable 'Use Episode Images in Next Up and Continue Watching' or undefined.
     * @return {boolean} 'Use Episode Images in Next Up' state.
     */
    useEpisodeImagesInNextUpAndResume(val) {
        if (val !== undefined) {
            return this.set('useEpisodeImagesInNextUpAndResume', val.toString());
        }

        return toBoolean(this.get('useEpisodeImagesInNextUpAndResume'), false);
    }
	
	/**
     * Get or set 'Use Card Layout in Home Sections' state.
     * @param {string|boolean|undefined} val - Flag to enable 'Use Card Layout in Home Sections' or undefined.
     * @return {boolean} 'Use Card Layout in Home Sections' state.
     */
    useCardLayoutInHomeSections(val) {
        if (val !== undefined) {
            return this.set('useCardLayoutInHomeSections', val.toString());
        }

		return toBoolean(this.get('useCardLayoutInHomeSections'), false);
    }
	
	/**
     * Get or set 'Meteo' state.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Meteo' (Set) or undefined (Get).
     * @return {boolean} 'Meteo' state (Get) or success/failure status (Set).
     */
	enableWeatherBot(val, norefresh) {
        if (val !== undefined) {
			let newval = parseInt(val, 10);
			if (isNaN(newval) || newval < 0 || newval > 15)
				newval = 0;
			
			/*** Save the new value. ***/
			this.set('weatherbot', newval);

			if (norefresh === true)
				return true;
			
			switch(newval & 3) {
				case 0:
				case 2:
					/***
						If weatherbot is disabled or only enabled during video playbacks,
						clear any existing timer then hide the widget
						and return. 
					***/
					this.showWeatherBot(false);
					break;
					
				default:
					this.showWeatherBot(true);
			}
            return true;
        }
		
		let ret = parseInt(this.get('weatherbot'), 10);
		if (isNaN(ret) || ret < 0 || ret > 15)
			ret = 0;
        return ret;
    }
	
	/** Show or hide the Top bar Weather Widget **/
	showWeatherBot(val) {
		const _hdrwtb = document.getElementById('headerWthRight');
		if (!_hdrwtb) 
			return;
		this._hdrwth.temp = document.getElementById('headerWthTemp');
		this._hdrwth.city = document.getElementById('headerWthCity');
		this._hdrwth.sunrise = document.getElementById('headerWthSunrise');
		this._hdrwth.sr = document.getElementById('_sr');
		this._hdrwth.sunset = document.getElementById('headerWthSunset');
		this._hdrwth.ss = document.getElementById('_ss');
		this._hdrwth.icon = document.getElementById('headerWthIcon');
		this._hdrwth.wind = document.getElementById('headerWthWind');
		this._hdrwth.windDir = document.getElementById('headerWthWindDir');
		this._hdrwth.windDirCode = document.getElementById('headerWthWindDirCode');
		this._hdrwth.hum = document.getElementById('headerWthHum');
		this._hdrwth.pressure = document.getElementById('headerWthPressure');
		this._hdrwth.msg = document.getElementById('headerWthMsg');
		
		// is an instance of the widget running already?
		if (this.weatherTimer !== null) {
			clearInterval(this.weatherTimer);
			this.weatherTimer = null;
		}	
		
		if (val === true) {
			/*** Show ***/
			this.toggleNightMode({toggle: false});
			const self = this;
			const delay = (this.APIDelay()? this.APIDelay() * 60000 : 300000);
			setTimeout( hdrWeather.bind(self), 10);
			this.weatherTimer = setInterval( hdrWeather.bind(self), delay);
			_hdrwtb.classList.remove('hide');
		} else {
			/*** Hide ***/
			_hdrwtb.classList.add('hide');
		}
		
		return true;
	}

	toggleNightMode(OPTS) {
		const _hdrnmb = document.getElementsByClassName('headerNightmodeButton')[0]; 
		if (!_hdrnmb)
			return;
		const _icon = _hdrnmb.getElementsByClassName('material-icons')[0];
		if (!_icon)
			return;
		const _hdrnf = document.getElementsByClassName('nightFilter')[0]; 
		if (!_hdrnf)
			return;
		const _isPlayingVideo = document.getElementsByClassName('videoPlayerContainer')[0]; 
		let val = appSettings.enableNightMode() || false;

		if (OPTS?.toggle !== false) {
			val = !val;
		} else {
			if (OPTS?.newval !== undefined)
				val = OPTS.newval;
		}
		
		if (OPTS?.nosave !== true) {
			appSettings.enableNightMode(val);
			_icon.classList.toggle('sunny', !val);
			_icon.classList.toggle('bedtime', val);
		}
		
		document.body.classList.toggle('nightMode', val);
		// If a night filter should be applied but a video is currently playing with the OSD overlay hidden, then just leave.
		if (val === true && _isPlayingVideo !== undefined && OPTS?.osd !== true)
			return;
		_hdrnf.classList.toggle('hide', !val);
	}
	
	togglePin(TOGGLE, newval) {
		const pinIcon = document.getElementById("pin");
		const skinHeader = document.querySelector('.skinHeader');
		if (!pinIcon)
			return;
		
		let _pinned = appSettings.pinMenubar();
		if (TOGGLE === undefined || TOGGLE === true) {
			_pinned = !_pinned;
			appSettings.pinMenubar(_pinned);
		}
		if (TOGGLE === false && newval !== undefined) {
			_pinned = newval === true;
			appSettings.pinMenubar(_pinned);
		}
		document.body.classList.toggle('pinned', _pinned);
		pinIcon.classList.toggle('lock_open', !_pinned);
		pinIcon.classList.toggle('lock', _pinned);
	}
	
    /**
     * Get or set 'Clock' state.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Clock' (Set) or undefined (Get).
     * @return {boolean} 'Clock' state (Get) or success/failure status (Set).
     */
	enableClock(val, norefresh) {
        if (val !== undefined) {
			let newval = parseInt(val, 10);
			if (isNaN(newval) || newval < 0 || newval > 3)
				newval = 0;
			
			/*** Save the new value. ***/
			this.set('clock', newval);
			
			if (norefresh === true)
				return true;
			
			switch(newval) {
				case 0:
				case 2:
					/***
						If clock is disabled or enabled only during video playbacks,
						clear any existing timer then hide the clock 
						and return. 
					***/
					this.showClock(false);
					break;
					
				default:
					this.showClock(true);
			}
            return true;
        }
		
		let ret = parseInt(this.get('clock'), 10);
		if (isNaN(ret) || ret < 0 || ret > 3)
			ret = 0;
        return ret;
    }
	
	/** Show or hide the Top bar clock **/
	showClock(val) {
		let _hdrclck = document.getElementsByClassName('headerClockActive')[0];
		if (!_hdrclck) {
			this.placeClock(0);
			_hdrclck = document.getElementsByClassName('headerClockActive')[0];
		}
		const _current = _hdrclck.getElementsByClassName('_dc_current')[0];
		this._hdrclkdate = _current.getElementsByClassName('headerClockDate')[0];
		this._hdrclktime = _current.getElementsByClassName('headerClockTime')[0];
		
		if (val === true) {
			/*** Start and Show ***/
			this.toggleNightMode({toggle: false});
			const self = this;
			setTimeout(hdrClock.bind(self), 10);
			if (this.clockTimer === null) {
				this.clockTimer = setInterval( hdrClock.bind(self), 10000);
			}
			this.setClockFormat(currentSettings._clkmode);
			_hdrclck.parentElement.classList.remove('hide');
		} else {
			/*** Hide and Halt ***/
			_hdrclck.parentElement.classList.add('hide');
			if (this.clockTimer !== null) {
				clearInterval(this.clockTimer);
				this.clockTimer = null;
			}
		}
		
		return true;
	}
	
	moveR() {
		placeClock(+1);
	}
	
	moveL() {
		placeClock(-1);
	}
	
	getClockFormat(mode) {
		if (isNaN(mode))
			mode = 0;
		
		let _opts_date = {
			'year': 'numeric',
			'day': '2-digit' };
		let _opts_time = {
			'hour': 'numeric',
			'minute': '2-digit' };
		
		switch (mode) {
			case 0:
				_opts_date['month'] = '2-digit';
				break;
			case 1:
				_opts_date['weekday'] = 'long';
				_opts_date['month'] = 'long';
				break;
			case 2:
				_opts_date['weekday'] = 'long';
				_opts_date['month'] = 'long';
				delete _opts_date['year'];
				break;
			case 3:
				_opts_date['weekday'] = 'short';
				_opts_date['month'] = '2-digit';
				_opts_date['timeZoneName'] = 'short';
				break;
			case 4:
				_opts_date['weekday'] = 'short';
				_opts_date['month'] = '2-digit';
				break;
		}
		return {'_opts_date': _opts_date, '_opts_time': _opts_time};
	}
	
	setClockFormat(val) {
		const FORMATS_NBR = 9;
		const elms = document.getElementsByClassName("headerClockMain");
		if (!elms || !elms.length)
			return;
		
		if (val !== undefined) {
			let idx = parseInt(val, 10);
			if (isNaN(idx) || idx < 0 || idx >= FORMATS_NBR)
				return;
			currentSettings._clkmode = idx;
		} else {
			currentSettings._clkmode = (currentSettings._clkmode + 1) % FORMATS_NBR;
		}
	
		const format = currentSettings.getClockFormat(currentSettings._clkmode);
		currentSettings._opts_date = format._opts_date;
		currentSettings._opts_time = format._opts_time;
		
		let _hdrclck = document.getElementsByClassName('headerClockActive')[0];
		let _current = _hdrclck.getElementsByClassName('_dc_current')[0];
		let _next = _hdrclck.getElementsByClassName('_dc_next')[0];
		_next.className = _next.className.replace(/clockFmt.+?/g, '');
		_next.classList.add('clockFmt' + currentSettings._clkmode);
		
		currentSettings._hdrclkdate = _next.getElementsByClassName('headerClockDate')[0];
		currentSettings._hdrclktime = _next.getElementsByClassName('headerClockTime')[0];
		
		setTimeout(hdrClock, 10);
		
		_current.classList.replace('_dc_current', '_dc_next');
		_next.classList.replace('_dc_next', '_dc_current');
	}
	
	initButtons(pos) {
		let elm;
		if (!pos)
			return;
		
		const self = this;
		const x = function() {self.setClockFormat();};
		
		elm = pos.getElementsByClassName("headerClockMain")[0];
		if (elm) {
			elm.removeEventListener('click', x);
			elm.addEventListener('click', x);
		}
		
		elm = pos.getElementsByClassName("moveLeftButton")[0];
		if (elm) {
			elm.removeEventListener('click', self.moveL);
			elm.addEventListener('click', self.moveL);
		}
		
		elm = pos.getElementsByClassName("moveRightButton")[0];
		if (elm) {
			elm.removeEventListener('click', self.moveR);
			elm.addEventListener('click', self.moveR);
		}
	}
	
	initClockPlaces() {
		let _l_hdrclck = document.getElementById("headerClockLeft");
		let _r_hdrclck = document.getElementById("headerClockRight");
		if (!_l_hdrclck || !_r_hdrclck)
			return;
		
		this.initButtons(_l_hdrclck);
		this.initButtons(_r_hdrclck);
	}
	
	WB_setButtons(nb) {
		if (nb === 0)
			this._pwrButtons = false;
		else
			this._pwrButtons = true;
		const elms = document.getElementsByClassName("WBScreen");
		if (!elms.length)
			return;
		const _active = (nb !== undefined)? nb: this._wbmode;
		let i = 0;
		for (let elm of elms) {
			elm.classList.toggle('hide2', i++ !== _active);
		}
		
		const x = function() {
			const _WBdayTime = document.getElementById('WBdayTime'); 
			const _WBnightTime = document.getElementById('WBnightTime');
			const self = this;
			let z = Date.now();
			
			this._hdrwth.sr.classList.toggle('alt');
			this._hdrwth.ss.classList.toggle('alt');
					
			if (this._hdrwth.sr.classList.contains('alt')) {
				
				const sr_date = new Date(this._date_sunrise);
				const ss_date = new Date(this._date_sunset);
				let _ss_ = ss_date.getTime() / 1000;
				let _sr_ = sr_date.getTime() / 1000;
				let _diff;
				
				if (z >= this._date_sunrise && z < this._date_sunset) {
					_WBdayTime.classList.add('active');
					_WBnightTime.classList.remove('active');
					z = z / 1000;
					_diff = z - _sr_;
					this._hdrwth.sr.differential = "-&nbsp;" + pad(Math.floor(_diff / 3600), 2) + ":" + pad(Math.floor((_diff % 3600) / 60), 2);
					_diff = _ss_ - z;
					this._hdrwth.ss.differential = "+&nbsp;" + pad(Math.floor(_diff / 3600), 2) + ":" + pad(Math.floor((_diff % 3600) / 60), 2);				
					if (this.enableNightModeSwitch() === 2)
						this.toggleNightMode({toggle: false, newval: false});
				} else {
					_WBdayTime.classList.remove('active');
					_WBnightTime.classList.add('active');
					z = z / 1000;
					if (z > _sr_)
						_sr_ += 86400;
					_diff = _sr_ - z;
					this._hdrwth.sr.differential = "+&nbsp;" + pad(Math.floor(_diff / 3600), 2) + ":" + pad(Math.floor((_diff % 3600) / 60), 2);
					if (z < _ss_)
						_ss_ -= 86400;
					_diff = z - _ss_;
					this._hdrwth.ss.differential = "-&nbsp;" + pad(Math.floor(_diff / 3600), 2) + ":" + pad(Math.floor((_diff % 3600) / 60), 2);				
					if (this.enableNightModeSwitch() === 2)
						this.toggleNightMode({toggle: false, newval: true});
				}
					
				this._hdrwth.sr.classList.replace("in", "out");
				this._hdrwth.ss.classList.replace("in", "out");
				setTimeout(() => {
					self._hdrwth.sr.innerHTML = self._hdrwth.sr.differential;
					self._hdrwth.ss.innerHTML = self._hdrwth.ss.differential;
					self._hdrwth.sr.classList.replace("out", "in2");
					self._hdrwth.ss.classList.replace("out", "in2");
				},800);
				
			} else {

				this._hdrwth.sr.classList.replace("in2", "out2");
				this._hdrwth.ss.classList.replace("in2", "out2");
				setTimeout(() => {
					self._hdrwth.sr.innerHTML = self._hdrwth.sr.current;
					self._hdrwth.ss.innerHTML = self._hdrwth.ss.current;
					self._hdrwth.sr.classList.replace("out2", "in");
					self._hdrwth.ss.classList.replace("out2", "in");
				},800);
				
			}
		};
		
		clearInterval(this._astrodiff);
		if (_active === 3) {
			const self = this;
			x.bind(this);
			this._astrodiff = setInterval( x.bind(self), WBScreen3Refresh()*1000); 
		}
	}
	
	WB_nextScreen() {
		if (currentSettings._pwrButtons === true) {
			currentSettings._wbmode = (currentSettings._wbmode % 3) + 1;
			currentSettings.WB_setButtons();
		}
	}
	
	WB_init() {
		let elm = document.getElementsByClassName("headerWthMain")[0];
		if (elm) {
			const self = this;
			elm.removeEventListener('click', self.WB_nextScreen);
			elm.addEventListener('click', self.WB_nextScreen);
		}
	}
	
	/**
     * Get or set 'Clock' location.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Clock' (Set) or undefined (Get).
     * @return {boolean} 'Clock' state (Get) or success/failure status (Set).
     */
	hideClockPos(pos) {
		if (pos)
			pos.classList.add('hide');
		let elm = pos.getElementsByClassName("headerClockMain")[0];
		if (elm)
			elm.classList.remove('headerClockActive');
	}
	 
	showClockPos(pos) {
		if (pos)
			pos.classList.remove('hide');
		let elm = pos.getElementsByClassName("headerClockMain")[0];
		if (elm)
			elm.classList.add('headerClockActive');
	}
	 
	placeClock(val, abs) {
		let pos = parseInt(this.get('clock_pos'), 10);
		if (isNaN(pos) || pos < 0 || pos > 1)
			pos = 0;
        if (val !== undefined) {
			const x = parseInt(val, 10);
			if (abs === true){
				// val contains the new position.
				if (x == 0 || x == 1)
					pos = x;
			} else {
				// val is an offset.
				if (x == -1 || x == 1)
					pos = Math.abs(pos + x) % 2; 
			}
			let _l_hdrclck = document.getElementById("headerClockLeft");
			let _r_hdrclck = document.getElementById("headerClockRight");
			if (!_l_hdrclck || !_r_hdrclck)
				return false;

			switch(pos) {
				/*** left side ***/
				case 0:
					this.hideClockPos(_r_hdrclck);
					this.showClockPos(_l_hdrclck);
					break;
				/*** right side ***/
				case 1:
					this.hideClockPos(_l_hdrclck);
					this.showClockPos(_r_hdrclck);
					break;
			}
		
			/*** Save the new position. ***/
			this.set('clock_pos', pos, true);
			this.showClock(true);
			return true;
		}
		
		return pos;
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

        return toBoolean(this.get('fastFadein'), false);
    }
	
	/**
     * Get or set 'Night Mode Switch' state.
     * @param {int|undefined} val - mode ref to enable 'Night Mode Switch' or undefined.
     * @return {boolean} 'Night Mode Switch' state.
     */
    enableNightModeSwitch(val) {
        if (val !== undefined)
            return this.set('nightModeSwitch', parseInt(val, 10));

		let ret = parseInt(this.get('nightModeSwitch'), 10);
		// 0 is a valid value.
		if (isNaN(ret) || ret < 0 || ret > 3) 
			ret = 0; // default to 0 (disabled).
        return ret;
    }
	
	/**
     * Get or set 'Menu Pin' state.
     * @param {int|undefined} val - mode ref to enable 'Menu Pin' or undefined.
     * @return {boolean} 'Menu Pin' state.
     */
    enableMenuPin(val) {
        if (val !== undefined)
            return this.set('menuPin', parseInt(val, 10));

		const x = parseInt(this.get('menuPin'), 10);
		// 0 is a valid value.
		if (isNaN(x) || x < 0 || x > 2) 
			return 0; // default to 0 (disabled).
        else 
            return x;
    }

    /**
     * Get or set 'Blurhash quality' state.
     * @param {boolean|undefined} val - Quality level between 0 (disabled) and 32 (max quality) inclusively.
     * @return {boolean} 'Blurhash quality' state.
     */
    enableBlurhash(val) {
		if (val !== undefined) 
            return this.set('blurhash', parseInt(val, 10));
        
		const blurhash = parseInt(this.get('blurhash'), 10);
		// 0 is a valid value.
		if (isNaN(blurhash) || blurhash < 0 || blurhash > 32) 
			return 8; // default to 8 (performance).
        else 
            return blurhash;
    }
	
	/**
     * Get or set 'Backdrop widget' state.
     * @param {boolean|undefined} val - Between 0 and 3 inclusively.
     * @return {boolean} 'Backdrop widget' state.
		0: Nothing
		7: Everything
		1: Details
		2: Control pannel
		4: BackdropContrast
     */
    enableBackdropWidget(val) {
		if (val !== undefined) 
            return this.set('backdropWidget', parseInt(val, 10));
        
		const bw = parseInt(this.get('backdropWidget'), 10);
		if (isNaN(bw) || bw < 0 || bw > 7) 
			return 0; // default to 0 (none).
        else 
            return bw;
    }

    /**
     * Get or set 'TVHome' mode.
     * @param {string|undefined} val - horizontal or vertical.
     * @return {string} 'TVHome' mode.
     */
    TVHome(val) {
		if (val !== undefined) {
			val = val.toString();
            return this.set('tvhome', val === "vertical"? val: "horizontal");
		}
        
		val = this.get('tvhome');
		val = val?.toString() || '';
		if (val === "vertical")
			return val;
		else
			return "horizontal"; //default to horizontal
    }
	
	 /**
     * Get or set rewatching in next up.
     * @param {boolean|undefined} val - If rewatching items should be included in next up.
     * @returns {boolean} Rewatching in next up state.
     */
    enableRewatchingInNextUp(val) {
        if (val !== undefined) {
            return this.set('enableRewatchingInNextUp', val, false);
        }

         return toBoolean(this.get('enableRewatchingInNextUp'), false);
    }
	
    /**
     * Get or set 'Swiper delay' state.
     * @param {int|undefined} val - Delay between each image in s.
     * @return {int} 'Swiper delay' state.
     */
    swiperDelay(val) {
		if (val !== undefined) 
            return this.set('swiperDelay', parseInt(val, 10));
        
		const swiperDelay = parseInt(this.get('swiperDelay'), 10);
		if (isNaN(swiperDelay) || swiperDelay < 4 || swiperDelay > 60) 
			return 4; // default to minimum.
        else 
            return swiperDelay;
    }
	
	/**
     * Get or set 'Backdrop rotation delay' state.
     * @param {int|undefined} val - Delay in seconds between each backdrop rotation.
     * @return {int} 'Backdrop delay' state.
     */
    backdropDelay(val) {
		if (val !== undefined) 
            return this.set('backdropDelay', parseInt(val, 10));
        
		const backdropDelay = parseInt(this.get('backdropDelay'), 10);
		if (isNaN(backdropDelay) || backdropDelay < 0 || backdropDelay > 300) 
			return 30;
        else 
            return backdropDelay;
    }
	
	/**
     * Get or set 'Weather API call' rate.
     * @param {int|undefined} val - Delay between each call in mins.
     * @return {int} 'Weather API call' rate.
     */
    APIDelay(val) {
		if (val !== undefined) 
            return this.set('APIDelay', parseInt(val, 10));
        
		const APIDelay = parseInt(this.get('APIDelay'), 10);
		if (isNaN(APIDelay) || APIDelay < 1 || APIDelay > 30) 
			return 10; // default to 10.
        else 
            return APIDelay;
    }
	
	/**
     * Get or set 'Swiper FX' state.
     * @param {string|undefined} val - Can be horizontal, vertical, fade, cube or flip.
     * @return {string} 'Swiper FX' state.
     */
    swiperFX(val) {
		if (val !== undefined) {
            return this.set('swiperFX', val.toString());
		}
        
		val = this.get('swiperFX');
        return val?.toString() || 'horizontal';
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
		
		const enableBackdrops = this.get('enableBackdrops');
		if (enableBackdrops && typeof(enableBackdrops) === 'string') 
			return enableBackdrops; 
        else 
            return 'none'; 
    }
	
	/**
     * Get or set 'disableCustomCss' state.
     * @param {boolean|undefined} val - Flag to enable 'disableCustomCss' or undefined.
     * @return {boolean} 'disableCustomCss' state.
     */
    disableCustomCss(val) {
        if (val !== undefined) {
            return this.set('disableCustomCss', val.toString(), false);
        }

        return toBoolean(this.get('disableCustomCss'), false);
    }
	
	/**
     * Get or set customCss.
     * @param {string|undefined} val - Language.
     * @return {string} Language.
     */
    customCss(val) {
        if (val !== undefined) {
            return this.set('customCss', val.toString(), false);
        }

        return this.get('customCss', false);
    }
	
	/**
     * Get or set key for 'Weatherapi'.
     * @param {string|undefined} val - Key to set or undefined.
     * @return {string} current 'key'.
     */
    weatherApiKey(val) {
        if (val !== undefined) {
            return this.set('weatherApiKey', val.toString());
        }
		
		const apikey = this.get('weatherApiKey');
		if (apikey && typeof(apikey) === 'string') 
			return apikey; 
        else 
            return ""; 
    }

    /**
     * Get or set 'Details Banner' state.
     * @param {boolean|undefined} val - Flag to enable 'Details Banner' or undefined.
     * @return {boolean} 'Details Banner' state.
     */
    detailsBanner(val) {
        if (val !== undefined) {
            return this.set('detailsBanner', val.toString());
        }

        return toBoolean(this.get('detailsBanner'));
    }

    /**
     * Get or set language.
     * @param {string|undefined} val - Language.
     * @return {string} Language.
     */
    language(val) {
        if (val !== undefined) {
            return this.set('language', val.toString());
        }

		const language = this.get('language');
		if (language && typeof(language) === 'string') 
			return language; 
        else 
            return ''; // defaults to 'auto'.
    }
	
	/**
     * Get or set custom fallback language.
     * @param {string|undefined} val - Language.
     * @return {string} Language.
     */
    languageAlt(val) {
        if (val !== undefined) {
            return this.set('languageAlt', val.toString());
        }

		const language = this.get('languageAlt');
		if (language && typeof(language) === 'string') 
			return language; 
        else 
            return "none"; // defaults to 'none'.
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
		
		const datetimelocale = this.get('datetimelocale');
		if (datetimelocale && typeof(datetimelocale) === 'string') 
			return datetimelocale; 
        else 
            return ''; // defaults to 'auto'.
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
        if (val !== undefined) 
            return this.set('skipBackLength', parseInt(val, 10) * 1000);
        
		const skipBackLength = parseInt(this.get('skipBackLength'), 10);
		if (isNaN(skipBackLength) || skipBackLength < 5000 || skipBackLength > 60000) 
			return 30; // default to 30s.
        else 
            return skipBackLength/1000;
    }

    /**
     * Get or set amount of fast forward.
     * @param {number|undefined} val - Amount of fast forward.
     * @return {number} Amount of fast forward.
     */
    skipForwardLength(val) {
		if (val !== undefined) 
            return this.set('skipForwardLength', parseInt(val, 10) * 1000);
        
		const skipForwardLength = parseInt(this.get('skipForwardLength'), 10);
		if (isNaN(skipForwardLength) || skipForwardLength < 5000 || skipForwardLength > 60000) 
			return 30; // default to 30s.
        else 
            return skipForwardLength/1000;
    }
	
    /**
     * Get or set the amount of resizing expressed in % of the value set by the application.
     * @param {number|undefined} % of resizing, between -20 and 20 inclusively.
     * @return {number} % of resizing saved.
     */		
    displayFontSize(val) {
        if (val !== undefined) 
            return this.set('displayFontSize', parseInt(val, 10));
        
		const fontSize = parseInt(this.get('displayFontSize'), 10);
		if (isNaN(fontSize) || fontSize < -20 || fontSize > 20) 
			return 0; // use application default.
        else 
            return fontSize;
    }

    /**
     * Get or set theme for Dashboard.
     * @param {string|undefined} val - Theme for Dashboard.
     * @return {string} Theme for Dashboard.
     */
    dashboardTheme(val) {
        if (val !== undefined) {
            return this.set('dashboardTheme', val.toString());
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
            return this.set('skin', val.toString());
        }

        return this.get('skin');
    }

    /**
     * Get or set main theme.
     * @param {string|undefined} val - Main theme.
     * @return {string} Main theme.
     */
    theme(val) {
        if (val !== undefined) {
            return this.set('appTheme', val.toString());
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
            return this.set('screensaver', val.toString());
        }

        return this.get('screensaver') || 'none';
    }

    /**
     * Get or set screensaver delay before activation.
     * @param {number|undefined} val - Screensaver-idletime.
     * @return {number} Screensaver-idletime.
     */
    screensaverTime(val) {
        if (val !== undefined) 
            return this.set('screensaverTime', parseInt(val, 10) * 60000);
        
		const screensaverTime = parseInt(this.get('screensaverTime'), 10);
		if (isNaN(screensaverTime) || screensaverTime < 0 || screensaverTime > 7200000) 
			return 10; // default to 10min.
        else 
            return screensaverTime/60000;
    }
	
    /**
     * Get or set library page size.
     * @param {number|undefined} val - Library page size.
     * @return {number} Library page size.
     */
    libraryPageSize(val) {
		const defaultPageSize = 64;
        if (val !== undefined) 
            return this.set('libraryPageSize', parseInt(val, 10));

		const libraryPageSize = parseInt(this.get('libraryPageSize'), 10);
		if (isNaN(libraryPageSize) || libraryPageSize < 0 || libraryPageSize > 128) 
			return defaultPageSize;
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

		const maxDaysForNextUp = parseInt(this.get('maxDaysForNextUp'), 10);
        if (isNaN(maxDaysForNextUp) || maxDaysForNextUp <= 0 || maxDaysForNextUp > 365) 
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
            return this.set('soundeffects', val);
        }

        return this.get('soundeffects');
    }

   /**
    * @typedef {Object} Query
    * @property {number} StartIndex - query StartIndex.
    * @property {number} Limit - query Limit.
    */
	
    /**
     * Load query settings.
     * @param {string} key - Query key.
     * @param {Object} query - Query base.
     * @return {Query} Query.
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
    getSubtitlesAppearance() {
		const defaultSubtitlesAppearance = { verticalPosition: -1 };
        return Object.assign(defaultSubtitlesAppearance, JSON.parse(this.get('subtitlesAppearance') || '{}'));
    }

    /**
     * Set subtitle appearance settings.
     * @param {Object} value - Subtitle appearance settings.
     * @param {string|undefined} key - Settings key.
     */
    setSubtitlesAppearance(value) {
        return this.set('subtitlesAppearance', JSON.stringify(value));
    }

    /**
     * Get comics player settings.
     * @param {string} mediaSourceId - Media Source Id.
     * @return {Object} Comics player settings.
     */
    getComicsPlayerSettings(mediaSourceId) {
        const settings = JSON.parse(this.get('comicsPlayerSettings', false) || '{}');
        return Object.assign(defaultComicsPlayerSettings, settings[mediaSourceId]);
    }

    /**
     * Set comics player settings.
     * @param {Object} value - Comics player settings.
     * @param {string} mediaSourceId - Media Source Id.
     */
    setComicsPlayerSettings(value, mediaSourceId) {
        const settings = JSON.parse(this.get('comicsPlayerSettings', false) || '{}');
        settings[mediaSourceId] = value;
        return this.set('comicsPlayerSettings', JSON.stringify(settings), false);
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

export const getCurrentUserId = currentSettings.getCurrentUserId.bind(currentSettings);
export const resetUserInfo = currentSettings.resetUserInfo.bind(currentSettings);
export const setUserInfo = currentSettings.setUserInfo.bind(currentSettings);
export const getData = currentSettings.getData.bind(currentSettings);
export const importFrom = currentSettings.importFrom.bind(currentSettings);
export const set = currentSettings.set.bind(currentSettings);
export const commit = currentSettings.commit.bind(currentSettings);
export const get = currentSettings.get.bind(currentSettings);
export const serverConfig = currentSettings.serverConfig.bind(currentSettings);
export const allowedAudioChannels = currentSettings.allowedAudioChannels.bind(currentSettings);
export const preferFmp4HlsContainer = currentSettings.preferFmp4HlsContainer.bind(currentSettings);
export const enableCinemaMode = currentSettings.enableCinemaMode.bind(currentSettings);
export const AudioLanguagePreference = currentSettings.AudioLanguagePreference.bind(currentSettings);
export const enableAudioNormalization = currentSettings.enableAudioNormalization.bind(currentSettings);
export const enableNextVideoInfoOverlay = currentSettings.enableNextVideoInfoOverlay.bind(currentSettings);
export const enableVideoRemainingTime = currentSettings.enableVideoRemainingTime.bind(currentSettings);
export const enableThemeSongs = currentSettings.enableThemeSongs.bind(currentSettings);
export const enableThemeVideos = currentSettings.enableThemeVideos.bind(currentSettings);
export const convertCountryCode = currentSettings.convertCountryCode.bind(currentSettings);
export const getlatitude = currentSettings.getlatitude.bind(currentSettings);
export const getlongitude = currentSettings.getlongitude.bind(currentSettings);
export const weatherApiKey = currentSettings.weatherApiKey.bind(currentSettings);
export const enableFastFadein = currentSettings.enableFastFadein.bind(currentSettings);
export const enableNightModeSwitch = currentSettings.enableNightModeSwitch.bind(currentSettings);
export const enableMenuPin = currentSettings.enableMenuPin.bind(currentSettings);
export const enableClock = currentSettings.enableClock.bind(currentSettings);
export const enableBackdropWidget = currentSettings.enableBackdropWidget.bind(currentSettings);
export const enableWeatherBot = currentSettings.enableWeatherBot.bind(currentSettings);
export const initClockPlaces = currentSettings.initClockPlaces.bind(currentSettings);
export const WB_init = currentSettings.WB_init.bind(currentSettings);
export const showClock = currentSettings.showClock.bind(currentSettings);
export const getClockFormat = currentSettings.getClockFormat.bind(currentSettings);
export const setClockFormat = currentSettings.setClockFormat.bind(currentSettings);
export const showWeatherBot = currentSettings.showWeatherBot.bind(currentSettings);
export const placeClock = currentSettings.placeClock.bind(currentSettings);
export const toggleNightMode = currentSettings.toggleNightMode.bind(currentSettings);
export const togglePin = currentSettings.togglePin.bind(currentSettings);
export const enableBlurhash = currentSettings.enableBlurhash.bind(currentSettings);
export const TVHome = currentSettings.TVHome.bind(currentSettings);
export const swiperDelay = currentSettings.swiperDelay.bind(currentSettings);
export const backdropDelay = currentSettings.backdropDelay.bind(currentSettings);
export const APIDelay = currentSettings.APIDelay.bind(currentSettings);
export const swiperFX = currentSettings.swiperFX.bind(currentSettings);
export const enableBackdrops = currentSettings.enableBackdrops.bind(currentSettings);
export const displayFontSize = currentSettings.displayFontSize.bind(currentSettings);
export const detailsBanner = currentSettings.detailsBanner.bind(currentSettings);
export const useEpisodeImagesInNextUpAndResume = currentSettings.useEpisodeImagesInNextUpAndResume.bind(currentSettings);
export const useCardLayoutInHomeSections = currentSettings.useCardLayoutInHomeSections.bind(currentSettings);
export const language = currentSettings.language.bind(currentSettings);
export const languageAlt = currentSettings.languageAlt.bind(currentSettings);
export const dateTimeLocale = currentSettings.dateTimeLocale.bind(currentSettings);
export const chromecastVersion = currentSettings.chromecastVersion.bind(currentSettings);
export const muteButton = currentSettings.muteButton.bind(currentSettings);
export const volumeSlider = currentSettings.volumeSlider.bind(currentSettings);
export const enableRewatchingInNextUp = currentSettings.enableRewatchingInNextUp.bind(currentSettings);
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
export const getSubtitlesAppearance = currentSettings.getSubtitlesAppearance.bind(currentSettings);
export const setSubtitlesAppearance = currentSettings.setSubtitlesAppearance.bind(currentSettings);
export const getComicsPlayerSettings = currentSettings.getComicsPlayerSettings.bind(currentSettings);
export const setComicsPlayerSettings = currentSettings.setComicsPlayerSettings.bind(currentSettings);
export const setFilter = currentSettings.setFilter.bind(currentSettings);
export const getFilter = currentSettings.getFilter.bind(currentSettings);
export const customCss = currentSettings.customCss.bind(currentSettings);
export const disableCustomCss = currentSettings.disableCustomCss.bind(currentSettings);
