/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import { ajax } from '../../../components/fetchhelper';
import * as userSettings from '../../../scripts/settings/userSettings';
import globalize from '../../../scripts/globalize';
import datetime from '../../../scripts/datetime';
import loading from '../../../components/loading/loading';

function show(item, visible) {
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
	self.version = '1.22';
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

	function weather(self) {	

		// Note that API keys can be obtained free of charge by registering at the address below
		// https://home.openweathermap.org/users/sign_up
		// Remember to copy any new key into its dedicated field in the display settings.
		let req = {};
		req.dataType = 'json';
		const url_proto = 'http://';
		const url_proto_SSL = 'https://';
		const url_base_icon = 'openweathermap.org/img/wn/';
		const url_base = 'api.openweathermap.org/data/2.5/';
		const url_apiMethod = 'weather';	
		const wapikey = self.opts.apikey;	
		if (!wapikey) {
			console.warn("No OpenWeather API key has been configured. Weatherbot will now stop.");
			show('ssForeplane', false);
			self.opts.msgstr.innerHTML = globalize.translate('MissingAPIKey');
			show('ssFailure', true);
			return;
		}
		const url_params = '?appid=' +  wapikey
		+ '&lat=' + self.opts.lat + '&lon=' + self.opts.lon
		+ '&units=' + (self.opts.USUnits === true?'imperial':'metric') 
		+ '&lang=' + userSettings.convertCountryCode(self.opts.language);
		req.url = ( isSecure() ? url_proto_SSL : url_proto) + url_base + url_apiMethod + url_params; 
		
		loading.show();	
		let _contimeout = setTimeout(() => {show('ssForeplane', false);self.opts.msgstr.innerHTML = globalize.translate('Connecting');show('ssFailure', true);}, 3000);
		
		ajax(req).then(function (data) {
			clearInterval(_contimeout);
			show('ssFailure', false);

			if (data.name)
				self.opts.locationstr.innerHTML = data.name;
			self.opts.location2str.innerHTML = "";
			if (data.sys.country)
				self.opts.location2str.innerHTML += data.sys.country;
			if (data.weather["0"].description)
				self.opts.conditionstr.innerHTML = data.weather["0"].description;
			if (data.weather["0"].icon)
				self.opts.iconstr.src = ( isSecure() ? url_proto_SSL : url_proto) + url_base_icon + data.weather["0"].icon + '.png';
			if (data.main.temp) {
				let _data = data.main.temp;
				self.opts.tempstr.innerHTML = Number(_data.toFixed(1));
			}
			if (data.main.humidity) {
				let _data = data.main.humidity;
				self.opts.humstr.innerHTML = Number(_data.toFixed(1));
			}
			if (data.visibility) {
				let _data = data.visibility;
				if (self.opts.USUnits)
					_data = _data/1609; // miles
				else
					_data = _data/1000; // km
				self.opts.visistr.innerHTML = Number(_data.toFixed(1));
			}
			if (data.wind.speed) {
				let _data = data.wind.speed;
				if (!self.opts.USUnits)
					_data *= 3.6; // m/s -> km/h
				self.opts.windstr.innerHTML = Number(_data.toFixed(1));
			}
			self.opts.windirstr.innerHTML = "";
			if (data.wind.deg)
				self.opts.windirstr.innerHTML += data.wind.deg + '&deg;'
			show('ssForeplane', true);
			
		}).catch(function (data) {
			clearInterval(_contimeout);
			show('ssForeplane', false);
			
			if (data.status) {
				let _msg = data.status;
				if (data.statusText)
					_msg += '<br/>' + data.statusText;
				self.opts.msgstr.innerHTML = _msg; 
			} else
				self.opts.msgstr.innerHTML = globalize.translate('NoConnectivity');
			show('ssFailure', true);

		}).finally(() => {
			loading.hide();
		});;
	}

    function stopInterval() {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
		show('ssFailure', false);
		show('ssForeplane', false);
    }

    self.show = function (TEST) {
		// If another instance is running, return.
		if (self.interval !== null) 
			return;
		
        import('./style.scss').then(() => {
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the ones saved.
			self.opts = {};
	
			if (TEST === true) {
				self.hideOnMouse = false;
				// Get currently selected Language.
				self.opts.language = document.querySelector('.selectLanguage').value;
				// If display language is set to 'auto' then request the default value.
				if (self.opts.language === "")
					self.opts.language = globalize.getDefaultCulture();
				// Get an API key from the form.
				self.opts.apikey = document.querySelector('#inputApikey').value || "";
				
				self.opts.USUnits = false;
				if (document.querySelector('#selectDateTimeLocale').value === 'en-US') 
					self.opts.USUnits = true;
				else if (document.querySelector('#selectDateTimeLocale').value === '') {
					if (self.opts.language === 'en-US')
						self.opts.USUnits = true;
				}
			
				self.opts.lat = document.querySelector('#inputLat').value || '78.69';
				self.opts.lon = document.querySelector('#inputLon').value || '15.72';
				self.opts.delay = (document.querySelector('#sliderAPIFrequency').value * 60000) || 300000;
			} else {
				self.hideOnMouse = true;
				// get the last saved API key.
				self.opts.apikey = userSettings.weatherApiKey() || "";
				self.opts.language = globalize.getCurrentLocale();
				self.opts.USUnits = (globalize.getCurrentDateTimeLocale() === 'en-US')? true: false;
				self.opts.lat = userSettings.getlatitude();
				self.opts.lon = userSettings.getlongitude();
				self.opts.delay = (userSettings.APIDelay()? userSettings.APIDelay() * 60000 : 300000)
			}
				
			stopInterval();
			
			let elem = document.querySelector('.weatherbotScreenSaver');
            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('weatherbotScreenSaver');
                document.body.appendChild(elem);
				let content ='<div class="ssBackplane">'
				+ '<div class="ssFailure hide">'
				+ '<span id="ssMsg" class="ssWeatherData"></span>'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span id="ssLoc" class="ssWeatherData"></span>'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span id="ssLoc2" class="ssWeatherData ssWeatherDataSmall"></span>'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<img id="ssIcon" class="ssWeatherData ssWeatherDataSmall">'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span id="ssCond" class="ssWeatherData ssWeatherDataSmall"></span>'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span class="material-icons thermostat"></span>'
				+ '<span id="ssTemp" class="ssWeatherData"></span>';
				
				if (self.opts.USUnits)
					content += '<span class="ssWeatherDataUnit">&#8457;</span>';
				else
					content += '<span class="ssWeatherDataUnit">&#8451;</span>';
				
				content += '&nbsp;<span class="material-icons water_drop">'
				+ '</span><span id="ssHum" class="ssWeatherData"></span>'
				+ '<span class="ssWeatherDataUnit">%</span>'
				+ '&nbsp;<span class="material-icons visibility">'
				+ '</span><span id="ssVisi" class="ssWeatherData"></span>';	
				
				if (self.opts.USUnits)
					content += '<span class="ssWeatherDataUnit">miles</span>';		
				else
					content += '<span class="ssWeatherDataUnit">km</span>';
				
				content += '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span class="material-icons air"></span>'
				+ '<span id="ssWind" class="ssWeatherData"></span>';
				
				if (self.opts.USUnits)
					content += '<span class="ssWeatherDataUnit">mph</span>';
				else
					content += '<span class="ssWeatherDataUnit">km/h</span>';
				
				content += '<span id="ssWindir" class="ssWeatherData ssWeatherDataSmall"></span>'
				+ '</div>'
				+ '</div>';
				
				elem.innerHTML = content;
            }

			self.opts.tempstr = document.getElementById("ssTemp");
			self.opts.humstr = document.getElementById("ssHum");
			self.opts.visistr = document.getElementById("ssVisi");
			self.opts.windstr = document.getElementById("ssWind");
			self.opts.windirstr = document.getElementById("ssWindir");
			self.opts.msgstr = document.getElementById("ssMsg");
			self.opts.conditionstr = document.getElementById("ssCond");
			self.opts.locationstr = document.getElementById("ssLoc");
			self.opts.location2str = document.getElementById("ssLoc2");
			self.opts.iconstr = document.getElementById("ssIcon");
						
			weather(self);
			// Refresh every x minutes.
			this.weatherTimer = setInterval( function() { weather(self) }, self.opts.delay);
        });
    };

    self.hide = function () {
        stopInterval();
		const elem = document.querySelector('.weatherbotScreenSaver');
		if (elem) {
            return new Promise((resolve) => {
				elem.parentNode.removeChild(elem);
				resolve();
            });
        }
        return Promise.resolve();
    };
}
