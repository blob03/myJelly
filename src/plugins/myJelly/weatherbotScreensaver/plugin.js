/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
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
			visible === true? el.classList.remove('hide') : el.classList.add('hide');
		});
	}
}

export default function () {
    const self = this;

	self.name = 'Weatherbot';
	self.group = 'myJelly';
	self.version = '1.35';
	self.description = 'WeatherbotScreensaverHelp';
	self.type = 'screensaver';
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
				self.opts.locationstr.innerHTML = data.name || '';
				self.opts.location2str.innerHTML = data.country || '';
				self.opts.conditionstr.innerHTML = data.desc || '';
				if (data.icon)
					self.opts.iconstr.src = url.proto + url.base_icon + data.icon + '.png';
				if (data.temp) {
					_data = data.temp;
					self.opts.tempstr.innerHTML = toPrecision(_data, 1);
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
				self.opts.windirstr.innerHTML = "";
				if (data.dir) {
					self.opts.windirstr.innerHTML += data.dir;
					if (data.code)
						self.opts.windircodestr.innerHTML = data.code;
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
				// Get currently selected Language.
				const _lang = document.querySelector('.selectLanguage').value;
				self.opts.language = userSettings.convertCountryCode(_lang);
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
			elem.classList.add('themeBackdrop');
			const idx = Math.ceil(Math.random() * 4);
			if (idx)
				elem.classList.add('alt' + idx);
			
			let content ='<div id="ssBackplane" class="ssBackplane skinHeader-withBackground">'
			+ '<div class="ssFailure hide">'
			+ '<span id="ssMsg" class="ssWeatherData"></span>'
			+ '</div>'
			+ '<div class="ssForeplane hide">'
			+ '<span id="ssLoc" class="ssWeatherData ssWeatherTitle"></span>'
			+ '</div>'
			+ '<div class="ssForeplane hide">'
			+ '<span id="ssLoc2" class="ssWeatherData ssWeatherDataSmall"></span>'
			+ '</div>'
			+ '<div class="ssForeplane ssWeatherIcon hide">'
			+ '<img id="ssIcon" class="ssWeatherData" style="width: 80px;height: 80px;">'
			+ '</div>'
			+ '<div class="ssForeplane hide">'
			+ '<span id="ssCond" class="ssWeatherData ssWeatherDataSmall"></span>'
			+ '</div>'
			
			+'<div style="display: flex;align-items: center;justify-content: space-evenly;align-items: center;width: 22em;">'
			
			+ '<div class="ssForeplane hide" style="font-size: 350%">'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons thermostat" style="margin: 0;font-size: 60%"></span>'
			+ '<span id="ssTemp" class="ssWeatherData"></span>';
			
			if (self.opts.USUnits)
				content += '<span class="ssWeatherTempUnit ssWeatherDataUnit">&#8457;</span>';
			else
				content += '<span class="ssWeatherTempUnit ssWeatherDataUnit">&#8451;</span>';
			
			content += '</div>'
			+ '</div>'
			
			+ '<div style="display: flex;flex-direction: column;font-size: 80%; align-items: flex-start;justify-content: center;">'
			
			+ '<div class="ssForeplane hide">'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons water_drop"></span>'
			+ '<span id="ssHum" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">%</span>'
			+ '</div>'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons"></span>'
			+ '<span id="ssPressureValue" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">hPa</span>';
			
			content += '</div>'
			+ '</div>'
			
			+ '<div class="ssForeplane hide">'
			+ '<div class="ssDataSection">'
			+ '<span class="material-icons ssIcons air"></span>'
			+ '<span id="ssWind" class="ssWeatherData"></span>';
			
			if (self.opts.USUnits)
				content += '<span class="ssWeatherDataUnit">mph</span>';
			else
				content += '<span class="ssWeatherDataUnit">km/h</span>';
			
			content += '</div>'
			+ '<div class="ssDataSection">'
			+ '<span id="ssWindir" class="ssWeatherData"></span>'
			+ '<span class="ssWeatherDataUnit">&deg;</span>'
			+ '<span id="ssWindircode" class="ssWeatherDataUnit"></span>'
			+ '</div>'
			+ '</div>'
			
			+ '</div>'
			+ '</div>';
			
			elem.innerHTML = content;
			document.body.appendChild(elem);

			self.opts.tempstr = document.getElementById("ssTemp");
			self.opts.humstr = document.getElementById("ssHum");
			self.opts.pressstr = document.getElementById("ssPressureValue");
			self.opts.visistr = document.getElementById("ssVisi");
			self.opts.windstr = document.getElementById("ssWind");
			self.opts.windirstr = document.getElementById("ssWindir");
			self.opts.windircodestr = document.getElementById("ssWindircode");
			self.opts.msgstr = document.getElementById("ssMsg");
			self.opts.conditionstr = document.getElementById("ssCond");
			self.opts.locationstr = document.getElementById("ssLoc");
			self.opts.location2str = document.getElementById("ssLoc2");
			self.opts.iconstr = document.getElementById("ssIcon");
			
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
