import appSettings from './appSettings';
import { Events } from 'jellyfin-apiclient';
import { toBoolean } from '../../utils/string.ts';
import globalize from '../globalize';
import datetime from '../datetime';
import { ajax } from '../../components/fetchhelper';

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
	
function hdrClock() {
	let _weekday;
	let _month;
	globalize.updateCurrentCulture();
	let _opts_date = {year: 'numeric', day: '2-digit'};
	
	switch (this._clkmode) {
		case 2: 
			_opts_date['weekday'] = 'long';
			_opts_date['month'] = 'long';
			break;
		
		case 3: 
			_opts_date['weekday'] = 'short';
			_opts_date['month'] = '2-digit';
			_opts_date['timeZoneName'] = 'shortOffset';
			break;
			
		default:
			_opts_date['weekday'] = 'short';
			_opts_date['month'] = '2-digit';
	}
	const x = new Date();
	const _hdrclk_date = datetime.toLocaleDateString(x, _opts_date);
	const _hdrclk_time = datetime.toLocaleTimeString(x, {
			hour: 'numeric',
			minute: '2-digit'
	}); 
	
	switch (this._clkmode) {
		case 1:
			this._hdrclkdate_span.innerHTML = '';
			this._hdrclktime_span.innerHTML = _hdrclk_time;
			break;
			
		default:
			this._hdrclkdate_span.innerHTML = _hdrclk_date;
			this._hdrclktime_span.innerHTML = _hdrclk_time;
	}
	return;
}

function isSecure() {
   return location.protocol == 'https:';
}

function hdrWeather() {
	let req = {};
	const self = this;
	req.dataType = 'json';
	const url_proto = isSecure() ? 'https://' : 'http://' ;
	const url_base_icon = 'openweathermap.org/img/wn/';
	const url_base = 'api.openweathermap.org/data/2.5/';
	const url_apiMethod = 'weather';
	const _lat = self.getlatitude();
	const _lon = self.getlongitude();
	const wapikey = self.weatherApiKey();
	
	if (!wapikey) {
		self._hdrwth_icon.src = "";
		self._hdrwth_temp.innerHTML = "";
		self._hdrwth_wind.innerHTML = "";
		self._hdrwth_hum.innerHTML = globalize.translate('MissingAPIKey');
		console.warn("No OpenWeather API key has been configured. Weatherbot will now stop.");
		return;
	}
	const url_params = '?appid=' + wapikey
		+ '&lat=' + _lat + '&lon=' + _lon
		+ '&units=' + (self.enableUSUnits()?'imperial':'metric') 
		+ '&lang=' + self.convertCountryCode(self.language());
		
	req.url = url_proto + url_base + url_apiMethod + url_params; 
	
	let _contimeout = setTimeout(() => {
		self._hdrwth_icon.src = "";
		self._hdrwth_temp.innerHTML = "";
		self._hdrwth_wind.innerHTML = "";
		self._hdrwth_hum.innerHTML = globalize.translate('Connecting');
	}, 3000);
	
	ajax(req).then(function (data) {
		clearInterval(_contimeout);
		let _dyn;
		if (data.weather["0"].icon) {
			self._hdrwth_icon.src = url_proto + url_base_icon + data.weather["0"].icon + '.png';
			if (data.weather["0"].description)
				self._hdrwth_icon.title = data.weather["0"].description;
		} else
			self._hdrwth_icon.src = "";
		
		if (data.main.temp) {
			_dyn = Number(data.main.temp.toFixed(1));
			_dyn += '<span class="ssWeatherDataUnit" style="font-size: 40%;padding: 0 0 .3rem 0;">';
			if (self.enableUSUnits())
				_dyn += '&#8457;</span>';
			else
				_dyn += '&#8451;</span>';
			self._hdrwth_temp.innerHTML = _dyn;
			self._hdrwth_temp.title = globalize.translate('Temperature');
		} else
			self._hdrwth_temp.innerHTML = "";
		
		if (data.main.humidity) {
			_dyn = Number(data.main.humidity.toFixed(1));
			_dyn += '<span class="ssWeatherDataUnit" style="font-size: 40%;padding: 0 0 .4rem 0;">%</span>';
			self._hdrwth_hum.innerHTML = _dyn;
			self._hdrwth_hum.title = globalize.translate('Humidity');
		} else
			self._hdrwth_hum.innerHTML = "";
		
		if (data.wind.speed) {
			let wspeed = data.wind.speed;
			if (!self.enableUSUnits())
				wspeed *= 3.6; // m/s -> km/h
			_dyn = "&nbsp;&nbsp;&nbsp;" + Number(wspeed.toFixed(1));
			_dyn += '<span class="ssWeatherDataUnit" style="font-size: 40%;padding: 0 0 .3rem 0;">';
			if (self.enableUSUnits())
				_dyn += 'mph</span>';
			else
				_dyn += 'km/h</span>';
			self._hdrwth_wind.innerHTML = _dyn;
			self._hdrwth_wind.title = globalize.translate('WindSpeed');
		} else
			self._hdrwth_wind.innerHTML = "";
		
	}).catch(function (data) {
		clearInterval(_contimeout);
		console.warn(data);
		self._hdrwth_icon.src = "";
		self._hdrwth_temp.innerHTML = "";
		self._hdrwth_wind.innerHTML = "";
		if (data.status) {
			let _msg = data.status;
			if (data.statusText)
				_msg += '<br/>' + data.statusText;
			self._hdrwth_hum.innerHTML = _msg; 
		} else
			self._hdrwth_hum.innerHTML = globalize.translate('NoConnectivity');
	});
	return;
}

	
export class UserSettings {
    constructor() {
		this.clockTimer = null;
		this.weatherTimer = null;
		this._clkmode = 2;
		this._hdrclkdate_span;
		this._hdrclktime_span;
		this._hdrwth_temp;
		this._hdrwth_icon;
		this._hdrwth_wind;
		this._hdrwth_hum;
    }
	
	/**
     * Convert country codes between jellyfin and the OpenWeather API.
     */
	convertCountryCode(code) {
		let ret = code || 'en';
		
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

        const obj = this;

        return apiClient.getDisplayPreferences('usersettings', userId, 'emby').then(function (result) {
            result.CustomPrefs = result.CustomPrefs || {};
            obj.displayPrefs = result;
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
	 * Save the user preferences into the server storage, all at once.
	 */
	commit() {
		if (this.displayPrefs)     
			saveServerPreferences(this);
		
		return true;
	}

    /**
     * Get value of setting.
     * @param {string} name - Name of setting.
     * @param {boolean} enableOnServer - Flag to return preferences from server (cached).
     * @return {string} Value of setting or ''.
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

        return toBoolean(this.get('preferFmp4HlsContainer', false), false);
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

        return toBoolean(this.get('enableCinemaMode', false), true);
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
     * Get or set 'Next Video Info Overlay' state.
     * @param {boolean|undefined} val - Flag to enable 'Next Video Info Overlay' or undefined.
     * @return {boolean} 'Next Video Info Overlay' state.
     */
    enableNextVideoInfoOverlay(val) {
        if (val !== undefined) {
            return this.set('nextVideoInfoOverlay', val.toString()); 
        }

        return toBoolean(this.get('enableNextVideoInfoOverlay', false), true);
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
     * Get or set 'SetUsingLastTracks' state.
     * @param {boolean|undefined} val - Flag to enable 'SetUsingLastTracks' or undefined.
     * @return {boolean} 'SetUsingLastTracks' state.
     */
    enableSetUsingLastTracks(val) {
        if (val !== undefined) {
            return this.set('enableSetUsingLastTracks', val.toString());
        }

        return toBoolean(this.get('enableSetUsingLastTracks', false), true);
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

        return toBoolean(this.get('enableThemeSongs', false), false);
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

        return toBoolean(this.get('enableThemeVideos', false), false);
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

        return toBoolean(this.get('useEpisodeImagesInNextUpAndResume', true), false);
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

		return toBoolean(this.get('useCardLayoutInHomeSections'), true);
    }
	
	    /**
     * Get or set 'Meteo' state.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Meteo' (Set) or undefined (Get).
     * @return {boolean} 'Meteo' state (Get) or success/failure status (Set).
     */
	enableWeatherBot(val) {
        if (val !== undefined) {
			let newval = parseInt(val, 10);
			if (newval < 0 || newval > 3)
				newval = 0;
			
			/*** Save the new value. ***/
			this.set('weatherbot', newval);
			
			/***
				If weatherbot is disabled or enabled only for video,
				clear any existing timer
				then hide the widget
				and return. 
			***/
			switch(newval) {
				case 0:
				case 3:
					this.showWeatherBot(false);
					break;
					
				default:
					this.showWeatherBot(true);
			}
            return true;
        }
		
		const ret = parseInt(this.get('weatherbot'), 10) || 0;
		if (ret < 0 || ret > 3)
			return 0;
        return ret;
    }
	
	/** Show or hide the Top bar Weather Widget **/
	showWeatherBot(val) {
		const _hdrwtb = document.getElementById('headerWthRight');
		if (!_hdrwtb) 
			return;
		this._hdrwth_temp = document.getElementById('headerWthTempRight');
		this._hdrwth_icon = document.getElementById('headerWthIconRight');
		this._hdrwth_wind = document.getElementById('headerWthWindRight');
		this._hdrwth_hum = document.getElementById('headerWthHumRight');
		
		// is an instance of the widget running already?
		if (this.weatherTimer !== null) {
			clearInterval(this.weatherTimer);
			this.weatherTimer = null;
		}	
		
		if (val === true) {
			/*** Show ***/
			this.toggleNightMode(false);
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

	toggleNightMode(TOGGLE) {
		const _hdrwtb = document.getElementsByClassName('headerWthMain')[0];
		if (!_hdrwtb) 
			return;
		const _hdrclck = document.getElementsByClassName('headerClockActive')[0]; 
		if (!_hdrclck) 
			return;
		const _hdrnmb = document.getElementsByClassName('headerNightmodeButton')[0]; 
		if (!_hdrnmb)
			return;
		const _icon = _hdrnmb.getElementsByClassName('material-icons')[0];
		if (!_icon)
			return;
		
		let val = appSettings.enableNightMode() || false;

		if (TOGGLE === undefined || TOGGLE === true) {
			val = !val;
			appSettings.enableNightMode(val);
		}
		
		switch (val) {
			case true:
				_icon.classList.add('light_mode');
				_icon.classList.remove('dark_mode');
				_hdrwtb.classList.remove('nightMode');
				_hdrclck.classList.remove('nightMode');
				break;
			default:
				_icon.classList.add('dark_mode');
				_icon.classList.remove('light_mode');
				_hdrwtb.classList.add('nightMode');
				_hdrclck.classList.add('nightMode');
		}
	}
	
    /**
     * Get or set 'Clock' state.
     * @param {boolean|undefined} val - Flag to (en|dis)able 'Clock' (Set) or undefined (Get).
     * @return {boolean} 'Clock' state (Get) or success/failure status (Set).
     */
	enableClock(val) {
        if (val !== undefined) {
			let newval = parseInt(val, 10);
			if (newval < 0 || newval > 3)
				newval = 0;
			
			/*** Save the new value. ***/
			this.set('clock', newval);
			
			/***
				If clock is disabled or enabled only for videos,
				clear any existing timer
				hide the clock 
				return. 
			***/
			switch(newval) {
				case 0:
				case 3:
					this.showClock(false);
					break;
					
				default:
					this.showClock(true);
			}
            return true;
        }
		
		const ret = parseInt(this.get('clock'), 10) || 0;
		if (ret < 0 || ret > 3)
			return 0;
        return ret;
    }
	
	/** Show or hide the Top bar clock **/
	showClock(val) {
		let _hdrclck = document.getElementsByClassName('headerClockActive')[0];
		if (!_hdrclck) {
			this.placeClock(0);
			_hdrclck = document.getElementsByClassName('headerClockActive')[0];
		}			
		this._hdrclkdate_span = _hdrclck.getElementsByClassName('headerClockDate')[0];
		this._hdrclktime_span = _hdrclck.getElementsByClassName('headerClockTime')[0];	
		
		if (val === true) {
			/*** Show ***/
			this.toggleNightMode(false);
			const self = this;
			setTimeout(hdrClock.bind(self), 10);
			if (this.clockTimer === null) {
				this.clockTimer = setInterval( hdrClock.bind(self), 10000);
			}
			_hdrclck.parentElement.classList.remove('hide');
		} else {
			/*** Hide ***/
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
	
	initButtons(pos) {
		const self = this;
		let elm;
		if (pos) {
			var nextClockMode = function(self) {
				return function curried(e) {
					const elms = document.getElementsByClassName("headerClockMain");
					if (elms.length) {
						self._clkmode = (self._clkmode + 1) % 4;
						switch (self._clkmode) {
							case 0:					
								for (let elm of elms) {
									elm.classList.add('headerClockMode0');
									elm.classList.remove('headerClockMode1');
									elm.classList.remove('headerClockMode2');
									elm.classList.remove('headerClockMode3');
								}
								break;
							case 1:
								for (let elm of elms) {
									elm.classList.add('headerClockMode1');
									elm.classList.remove('headerClockMode0');
									elm.classList.remove('headerClockMode2');
									elm.classList.remove('headerClockMode3');
								}
								break;
							case 2:
								for (let elm of elms) {
									elm.classList.add('headerClockMode2');
									elm.classList.remove('headerClockMode0');
									elm.classList.remove('headerClockMode1');
									elm.classList.remove('headerClockMode3');
								}
								break;
							case 3:
								for (let elm of elms) {
									elm.classList.add('headerClockMode3');
									elm.classList.remove('headerClockMode0');
									elm.classList.remove('headerClockMode1');
									elm.classList.remove('headerClockMode2');
								}
								break;
						}
						setTimeout(hdrClock.bind(self), 10);
					}
				}
			}
			elm = pos.getElementsByClassName("headerClockMain")[0];
			if (elm) {
				elm.removeEventListener('click', nextClockMode(self));
				elm.addEventListener('click', nextClockMode(self));
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
	}
	
	initWeatherBot() {
		const self = this;
		
		//let elm = document.getElementsByClassName("headerWthMain")[0];
		//if (elm) {
		//	elm.removeEventListener('click', self.doToggle );
		//	elm.addEventListener('click', self.doToggle );
		//}
	}
	
	initClockPlaces() {
		let _l_hdrclck = document.getElementById("headerClockLeft");
		let _m_hdrclck = document.getElementById("headerClockRight");
		let _r_hdrclck = document.getElementById("headerClockMiddle");
		if (!_l_hdrclck || !_m_hdrclck || !_r_hdrclck)
			return;
				
		this.initButtons(_l_hdrclck);
		this.initButtons(_m_hdrclck);
		this.initButtons(_r_hdrclck);
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
	 
	placeClock(val) {
		let pos = parseInt(this.get('clock_pos'), 10) || 0;
        if (val !== undefined) {
			
			let newval = parseInt(val, 10) || 0;
			if (newval < -1 || newval > 1)
				newval = 0;
			
			pos += newval;
			if (pos > 2)
				pos = 0;
			if (pos < 0)
				pos = 2;
		
			let _l_hdrclck = document.getElementById("headerClockLeft");
			let _m_hdrclck = document.getElementById("headerClockMiddle");
			let _r_hdrclck = document.getElementById("headerClockRight");
			if (!_l_hdrclck || !_m_hdrclck || !_r_hdrclck)
				return false;
		
			this.hideClockPos(_l_hdrclck);
			this.hideClockPos(_m_hdrclck);
			this.hideClockPos(_r_hdrclck);	
		
			switch(pos) {
				/*** left side ***/
				case 0:
					this.showClockPos(_l_hdrclck);
					break;
				/*** Middle ***/
				case 1:		
					this.showClockPos(_m_hdrclck);
					break;
				/*** right side ***/
				case 2:
					this.showClockPos(_r_hdrclck);
					break;
			}
		
			/*** Save the new position. ***/
			this.set('clock_pos', pos, true);
			this.showClock(true);
            return true;
        }
		
		if (pos < 0 || pos > 2)
			return 0;
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

        return toBoolean(this.get('fastFadein', false), true);
    }

    /**
     * Get or set 'USUnits' state.
     * @param {boolean|undefined} val - Flag to enable 'USUnits' or undefined.
     * @return {boolean} 'USUnits' state.
     */
    enableUSUnits(val) {
        if (val !== undefined) {
            return this.set('USUnits', val.toString());
        }

		return toBoolean(this.get('USUnits'), false);
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
		if (blurhash < 0 || blurhash > 32) 
			return 8; // default to 8 (performance).
        else 
            return blurhash;
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
		val = val.toString();
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

         return toBoolean(this.get('enableRewatchingInNextUp', false), false);
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
		if (swiperDelay < 4 || swiperDelay > 60) 
			return 4; // default to minimum.
        else 
            return swiperDelay;
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
		if (APIDelay < 1 || APIDelay > 30) 
			return 5; // default to 5.
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
        return val.toString() || 'horizontal';
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
            return 'Auto'; 
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

        return toBoolean(this.get('disableCustomCss', false), false);
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

        return toBoolean(this.get('detailsBanner', false), true);
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
            return this.set('skipBackLength', parseInt(val, 10));
        
		const skipBackLength = parseInt(this.get('skipBackLength'), 10);
		if (skipBackLength < 5000 || skipBackLength > 60000) 
			return 30000; // default to 30s in ms.
        else 
            return skipBackLength;
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
		if (fontSize < -20 || fontSize > 20) 
			return 0; // use application default.
        else 
            return fontSize;
    }
	
    /**
     * Get or set amount of fast forward.
     * @param {number|undefined} val - Amount of fast forward.
     * @return {number} Amount of fast forward.
     */
    skipForwardLength(val) {
		if (val !== undefined) 
            return this.set('skipForwardLength', parseInt(val, 10));
        
		const skipForwardLength = parseInt(this.get('skipForwardLength'), 10);
		if (skipForwardLength < 5000 || skipForwardLength > 60000) 
			return 30000; // default to 30s in ms.
        else 
            return skipForwardLength;
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

        return this.get('screensaver');
    }

    /**
     * Get or set screensaver minimum time before activation.
     * @param {number|undefined} val - Screensaver-idletime.
     * @return {number} Screensaver-idletime.
     */
    screensaverTime(val) {
        if (val !== undefined) 
            return this.set('screensaverTime', parseInt(val, 10));
        
		const screensaverTime = parseInt(this.get('screensaverTime'), 10);
		if (screensaverTime > 1800000) 
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

		const libraryPageSize = parseInt(this.get('libraryPageSize'), 10);
		if (libraryPageSize > 128) 
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

		const maxDaysForNextUp = parseInt(this.get('maxDaysForNextUp'), 10);
        if (!maxDaysForNextUp || maxDaysForNextUp > 365) 
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
        return Object.assign(defaultSubtitleAppearanceSettings, JSON.parse(this.get(key) || '{}'));
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
export const commit = currentSettings.commit.bind(currentSettings);
export const get = currentSettings.get.bind(currentSettings);
export const serverConfig = currentSettings.serverConfig.bind(currentSettings);
export const allowedAudioChannels = currentSettings.allowedAudioChannels.bind(currentSettings);
export const preferFmp4HlsContainer = currentSettings.preferFmp4HlsContainer.bind(currentSettings);
export const enableCinemaMode = currentSettings.enableCinemaMode.bind(currentSettings);
export const AudioLanguagePreference = currentSettings.AudioLanguagePreference.bind(currentSettings);
export const enableNextVideoInfoOverlay = currentSettings.enableNextVideoInfoOverlay.bind(currentSettings);
export const enableSetUsingLastTracks = currentSettings.enableSetUsingLastTracks.bind(currentSettings);
export const enableThemeSongs = currentSettings.enableThemeSongs.bind(currentSettings);
export const enableThemeVideos = currentSettings.enableThemeVideos.bind(currentSettings);
export const convertCountryCode = currentSettings.convertCountryCode.bind(currentSettings);
export const getlatitude = currentSettings.getlatitude.bind(currentSettings);
export const getlongitude = currentSettings.getlongitude.bind(currentSettings);
export const weatherApiKey = currentSettings.weatherApiKey.bind(currentSettings);
export const enableFastFadein = currentSettings.enableFastFadein.bind(currentSettings);
export const enableUSUnits = currentSettings.enableUSUnits.bind(currentSettings);
export const enableClock = currentSettings.enableClock.bind(currentSettings);
export const enableWeatherBot = currentSettings.enableWeatherBot.bind(currentSettings);
export const initClockPlaces = currentSettings.initClockPlaces.bind(currentSettings);
export const initWeatherBot = currentSettings.initWeatherBot.bind(currentSettings);
export const showClock = currentSettings.showClock.bind(currentSettings);
export const showWeatherBot = currentSettings.showWeatherBot.bind(currentSettings);
export const placeClock = currentSettings.placeClock.bind(currentSettings);
export const toggleNightMode = currentSettings.toggleNightMode.bind(currentSettings);
export const enableBlurhash = currentSettings.enableBlurhash.bind(currentSettings);
export const TVHome = currentSettings.TVHome.bind(currentSettings);
export const swiperDelay = currentSettings.swiperDelay.bind(currentSettings);
export const APIDelay = currentSettings.APIDelay.bind(currentSettings);
export const swiperFX = currentSettings.swiperFX.bind(currentSettings);
export const enableBackdrops = currentSettings.enableBackdrops.bind(currentSettings);
export const displayFontSize = currentSettings.displayFontSize.bind(currentSettings);
export const detailsBanner = currentSettings.detailsBanner.bind(currentSettings);
export const useEpisodeImagesInNextUpAndResume = currentSettings.useEpisodeImagesInNextUpAndResume.bind(currentSettings);
export const useCardLayoutInHomeSections = currentSettings.useCardLayoutInHomeSections.bind(currentSettings);
export const language = currentSettings.language.bind(currentSettings);
export const dateTimeLocale = currentSettings.dateTimeLocale.bind(currentSettings);
export const chromecastVersion = currentSettings.chromecastVersion.bind(currentSettings);
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
export const getSubtitleAppearanceSettings = currentSettings.getSubtitleAppearanceSettings.bind(currentSettings);
export const setSubtitleAppearanceSettings = currentSettings.setSubtitleAppearanceSettings.bind(currentSettings);
export const setFilter = currentSettings.setFilter.bind(currentSettings);
export const getFilter = currentSettings.getFilter.bind(currentSettings);
export const customCss = currentSettings.customCss.bind(currentSettings);
export const disableCustomCss = currentSettings.disableCustomCss.bind(currentSettings);
