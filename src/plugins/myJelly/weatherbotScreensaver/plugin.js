/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import { PluginType } from '../../../types/plugin.ts';
import { randomInt } from '../../../utils/number.ts';
import { ajax } from '../../../components/fetchhelper';
import * as userSettings from '../../../scripts/settings/userSettings';
import globalize from '../../../scripts/globalize';
import datetime from '../../../scripts/datetime';
import loading from '../../../components/loading/loading';
import appSettings from '../../../scripts/settings/appSettings';
import { toPrecision } from '../../../utils/string.ts';

function _show(item, visible) {
	if (!item || typeof visible != "boolean")
		return;
	let els = document.getElementsByClassName(item);
	if (els.length) {
		Array.prototype.forEach.call(els, function(el) {
			el.classList.toggle('hide', visible !== true);
		});
	}
}

export default function () {
    const self = this;

	self.name = 'Weatherbot';
	self.group = 'myJelly';
	self.version = '1.6';
	self.description = 'WeatherbotScreensaverHelp';
	self.type = PluginType.Screensaver;
	self.id = 'weatherbotscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;
	self.interval = null;
	self.opts = {};
	
	function isSecure() {
		return location.protocol == 'https:';
	}

	function weather() {

		// Note that API keys can be obtained free of charge by registering at the address below
		// https://home.openweathermap.org/users/sign_up

		const url = {};
		url.proto = isSecure() ? 'https://' : 'http://' ;
		url.base_icon = 'openweathermap.org/img/wn/';
		url.base = 'api.openweathermap.org/data/2.5/';
		url.apiMethod = 'weather';
		
		const wapikey = this.opts.apikey;
		if (!wapikey) {
			console.warn("No OpenWeather API key has been configured. Weatherbot will now stop.");
			_show('ssForeplane', false);
			this.opts.msgstr.innerHTML = globalize.translate('MissingAPIKey');
			_show('ssFailure', true);
			return;
		}
		url.params = '?appid=' +  wapikey
		+ '&lat=' + this.opts.lat + '&lon=' + this.opts.lon
		+ '&units=' + (this.opts.USUnits === true?'imperial':'metric')
		+ '&mode=xml'
		+ '&lang=' + this.opts.language;

		const req = {};
		req.dataType = 'text';
		req.url = url.proto + url.base + url.apiMethod + url.params;

		let self = this;
		loading.show();
		const _contimeout = setTimeout( () => {
			_show('ssForeplane', false);
			self.opts.msgstr.innerHTML = globalize.translate('Connecting');
			_show('ssFailure', true);
		}, 3000);
		
		ajax(req).then(function (xmldata) {
			clearInterval(_contimeout);
			_show('ssFailure', false);

			let _root;
			let data = {};
			
			if (window.DOMParser) {
				const _parser = new DOMParser();
				if (_parser) {
					const _xmlDoc = _parser.parseFromString(xmldata, "text/xml");
					if (_xmlDoc) 
						_root = _xmlDoc.getElementsByTagName("current")[0];
				}
			}

			if (_root) {
				if (_root.getElementsByTagName("weather")[0]) {
					data.icon = _root.getElementsByTagName("weather")[0].getAttribute("icon");
					data.title = _root.getElementsByTagName("weather")[0].getAttribute("value");
				}
				if (_root.getElementsByTagName("temperature")[0])
					data.temp = _root.getElementsByTagName("temperature")[0].getAttribute("value");
				if (_root.getElementsByTagName("feels_like")[0])
					data.feelslike = _root.getElementsByTagName("feels_like")[0].getAttribute("value");
				if (_root.getElementsByTagName("city")[0])
					data.name = _root.getElementsByTagName("city")[0].getAttribute("name");
				
				if (_root.getElementsByTagName("humidity")[0])
					data.hum = _root.getElementsByTagName("humidity")[0].getAttribute("value");
				if (_root.getElementsByTagName("pressure")[0]) {
					data.pressure = _root.getElementsByTagName("pressure")[0].getAttribute("value");
					data.pressureUnit = _root.getElementsByTagName("pressure")[0].getAttribute("unit");
				}
				if (_root.getElementsByTagName("wind")[0]) {
					data.speed = _root.getElementsByTagName("wind")[0].getElementsByTagName("speed")[0].getAttribute("value");
					data.dir = _root.getElementsByTagName("wind")[0].getElementsByTagName("direction")[0].getAttribute("value");
					data.code = _root.getElementsByTagName("wind")[0].getElementsByTagName("direction")[0].getAttribute("code");
				}
				if (_root.getElementsByTagName("clouds")[0]) {
					data.desc = _root.getElementsByTagName("clouds")[0].getAttribute("name");
				}
				if (_root.getElementsByTagName("visibility")[0]) {
					data.visibility = _root.getElementsByTagName("visibility")[0].getAttribute("value");
				}
				if (_root.getElementsByTagName("city")[0]) {
					data.sunrise = _root.getElementsByTagName("city")[0].getElementsByTagName("sun")[0].getAttribute("rise");
					data.sunset = _root.getElementsByTagName("city")[0].getElementsByTagName("sun")[0].getAttribute("set");
					data.country = _root.getElementsByTagName("city")[0].getElementsByTagName("country")[0].textContent;
				}
		
				let _data;
				
				self.opts.city.innerHTML = data.name || '';
				self.opts.country.innerHTML = data.country || '';
				self.opts.conditionstr.innerHTML = data.desc || '';
				
				if (data.icon)
					self.opts.iconstr.src = url.proto + url.base_icon + data.icon + '.png';
				if (data.temp) {
					if (data.feelslike && self.opts.feelslikeTemp) {
						_data = '<div style="display: flex;flex-direction: column;justify-content: center;align-items: center;">';
						_data += '<div title="' + globalize.translate('WeatherbotShowFeelsLikeTemp') + '" id="ssTempFeelsLike">' + toPrecision(data.feelslike, 1) + '</div>';
						_data += '<div title="' + globalize.translate('Temperature') + '" id="ssTempMeasured">' + toPrecision(data.temp, 1) + '</div>';
						_data += '</div>';
						self.opts.tempstr.innerHTML = _data;
					} else {
						_data = data.temp;
						self.opts.tempstr.innerHTML = toPrecision(_data, 1);
					}
				}
				if (data.hum) {
					_data = data.hum;
					self.opts.humstr.innerHTML = toPrecision(_data, 1);
				}
				if (data.pressure) {
					_data = data.pressure;
					self.opts.pressstr.innerHTML = toPrecision(_data, 1);
				}
				if (data.speed) {
					_data = data.speed;
					if (!self.opts.USUnits)
						_data *= 3.6; // m/s -> km/h
					self.opts.windstr.innerHTML = toPrecision(_data, 1);
				}
				self.opts.windirangle.innerHTML = "";
				if (data.dir) {
					self.opts.windirangle.innerHTML += data.dir;
					if (data.code)
						self.opts.windirname.innerHTML = data.code;
				}
				
				_show('ssForeplane', true);
			}
		}).catch(function (data) {
			clearInterval(_contimeout);
			_show('ssForeplane', false);
			
			if (data.status) {
				let _msg = data.status;
				if (data.statusText)
					_msg += '<br/>' + data.statusText;
				self.opts.msgstr.innerHTML = _msg; 
			} else
				self.opts.msgstr.innerHTML = globalize.translate('NoConnectivity');
			_show('ssFailure', true);

		}).finally(() => {
			loading.hide();
		});
	}

    function stopInterval() {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
		_show('ssFailure', false);
		_show('ssForeplane', false);
    }

    self.show = function (TEST) {
		
		// Stop any instance that could be running.
		stopInterval();
		
        import('./style.scss').then(() => {
			
			let elem = document.querySelector('.screenSaver');
			if (elem)
				elem.remove();
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the ones saved.
			self.opts = {};
	
			if (TEST === true) {
				self.hideOnMouse = false;
				// Read options as they are currently set in the page.
				const _lang = document.querySelector('.selectLanguage').value;
				self.opts.language = userSettings.convertCountryCode(_lang);
				self.opts.feelslikeTemp = document.querySelector('#wbOptFeelsLike').checked;
				self.opts.stationName = document.querySelector('#wbOptStation').checked;
				self.opts.langDir = globalize.getIsRTL(_lang);
				// Get an API key from the form.
				self.opts.apikey = document.querySelector('#inputApikey').value || "";
				self.opts.USUnits = false;
				const _userLocale = document.querySelector('#selectDateTimeLocale').value;
				if (_userLocale === 'en-US' || (_userLocale === '' && _lang === 'en-US'))
					self.opts.USUnits = true;
				self.opts.lat = document.querySelector('#inputLat').value || '78.69';
				self.opts.lon = document.querySelector('#inputLon').value || '15.72';
				self.opts.delay = (document.querySelector('#sliderAPIFrequency').value * 60000) || 300000;
			} else {
				self.hideOnMouse = true;
				self.opts.langDir = globalize.getIsRTL();
				self.opts.feelslikeTemp = userSettings.enableWeatherBot() & 4;
				self.opts.stationName = userSettings.enableWeatherBot() & 8;
				// get the last saved API key.
				self.opts.apikey = userSettings.weatherApiKey() || "";
				self.opts.language = userSettings.convertCountryCode(userSettings.language());
				self.opts.USUnits = (globalize.getCurrentDateTimeLocale() === 'en-US')? true: false;
				self.opts.lat = userSettings.getlatitude();
				self.opts.lon = userSettings.getlongitude();
				self.opts.delay = userSettings.APIDelay() * 60000;
			}

			elem = document.createElement('div');
			elem.classList.add('screenSaver');
			elem.classList.add('weatherbotScreenSaver');
			elem.classList.add('backdropImage');
			elem.classList.add('ssbackdropImage');
			elem.classList.add('themeBackdrop');
			const idx = randomInt(1, 4);
			if (idx)
				elem.classList.add('alt' + idx);
			
			let content ='<div id="ssBackplane" class="ssBackplane skinHeader-withBackground headerWthMain" dir="' + (self.opts.langDir? 'rtl':'ltr') + '">'
			+ '<div class="ssFailure hide">'
			+ '<span id="ssMsg" class="ssWeatherData"></span>'
			+ '</div>'
			+ '<div id="ssPosition" class="ssForeplane hide">'
			+ '<div id="ssLoc" class="ssWeatherData ssWeatherTitle"></div>'
			+ '<div id="ssLoc2" class="ssWeatherData ssWeatherDataSmall"></div>'
			+ '</div>'
			+ '<div class="ssForeplane ssWeatherIcon hide">'
			+ '<img id="ssIcon" class="ssWeatherData">'
			+ '</div>'
			+ '<div class="ssForeplane hide">'
			+ '<span id="ssCond" class="ssWeatherData ssWeatherDataSmall"></span>'
			+ '</div>'
			
			+'<div id="ssDataSection">'
			
			+ '<div class="ssForeplane hide" style="font-size: 250%">'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons thermostat"></span>'
			+ '<div dir="ltr" style="display: flex;">'
			+ '<span id="ssTemp" class="ssWeatherData"></span>';
			
			if (self.opts.USUnits)
				content += '<span class="ssWeatherTempUnit ssWeatherDataUnit">&#8457;</span>';
			else
				content += '<span class="ssWeatherTempUnit ssWeatherDataUnit">&#8451;</span>';
			
			content += '</div>'
			+ '</div>'
			+ '</div>'
			
			+ '<div id="ssDataSubSection">'
			
			+ '<div class="ssForeplane hide">'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons ssIconsSmall water_drop"></span>'
			+ '</div>'
			+ '<div class="ssDataSection">'
			+ '<div dir="ltr" style="display: flex;">'
			+ '<span id="ssHum" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">%</span>'
			+ '</div>'
			+ '</div>'
			+ '<div class="ssDataSection">'
			+ '<div dir="ltr" style="display: flex;">'
			+ '<span id="ssPressureValue" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">hPa</span>';
			
			content += '</div>'
			+ '</div>'
			+ '</div>'
			+ '<div class="ssForeplane hide">'
			
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons ssIconsSmall air"></span>'
			+ '</div>'
			+ '<div class="ssDataSection">'
			+ '<div dir="ltr" style="display: flex;">'
			+ '<span id="ssWind" class="ssWeatherData"></span>';
			
			if (self.opts.USUnits)
				content += '<span class="ssWeatherDataUnit">mph</span>';
			else
				content += '<span class="ssWeatherDataUnit">km/h</span>';
			
			content += '</div>'
			+ '</div>'
			+ '<div class="ssDataSection">'
			+ '<div dir="ltr" style="display: flex;">'
			+ '<span id="ssWinDirAngle" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">&deg;</span>'
			+ '<span id="ssWinDirName" class="ssWeatherDataUnit"></span>'
			+ '</div>'
			+ '</div>'
			
			elem.innerHTML = content;
			document.body.appendChild(elem);
			
			self.opts.elem = elem; 
			self.opts.tempstr = elem.querySelector("#ssTemp");
			self.opts.humstr = elem.querySelector("#ssHum");
			self.opts.pressstr = elem.querySelector("#ssPressureValue");
			self.opts.visistr = elem.querySelector("#ssVisi");
			self.opts.windstr = elem.querySelector("#ssWind");
			self.opts.windirangle = elem.querySelector("#ssWinDirAngle");
			self.opts.windirname = elem.querySelector("#ssWinDirName");
			self.opts.msgstr = elem.querySelector("#ssMsg");
			self.opts.conditionstr = elem.querySelector("#ssCond");
			self.opts.iconstr = elem.querySelector("#ssIcon");
			self.opts.city = elem.querySelector("#ssLoc");
			self.opts.country = elem.querySelector("#ssLoc2");
			self.opts.position = elem.querySelector("#ssPosition");
			self.opts.city.classList.toggle('hide', !(self.opts.stationName));
			self.opts.country.classList.toggle('hide', !(self.opts.stationName));
			
			setTimeout( weather.bind(self), 10);
			// Refresh every x minutes.
			this.weatherTimer = setInterval( function() { weather.bind(self) }, self.opts.delay);
		});
	};

    self.hide = function () {
        stopInterval();
		const elem = document.querySelector('.screenSaver');
		if (elem) {
            return new Promise((resolve) => {
				elem.parentNode.removeChild(elem);
				resolve();
            });
        }
        return Promise.resolve();
    };
}
