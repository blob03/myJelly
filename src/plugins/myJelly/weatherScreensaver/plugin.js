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

	self.name = 'The Weatherbot';
	self.group = 'myJelly';
	self.version = '0.5';
	self.description = 'WeatherbotScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'weatherbotscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;
	self.interval = null;
	self.opts = {};
	
	function weather(self) {	

		loading.show();
		
		// Note that API keys can be obtained free of charge by registering at the address below
		// https://www.weatherapi.com/signup.aspx
		// Remember to copy any new key into its dedicated field in the display settings.
		let req = {};
		req.dataType = 'json';
		const url_base = 'http://api.weatherapi.com/v1/';
		const url_apiMethod = 'current.json';
		const url_params = '?key=' + self.opts.apikey + '&q=auto:ip&aqi=no&lang=' + self.opts.dateTimeLocale;
		req.url = url_base + url_apiMethod + url_params; 
		
		ajax(req).then(function (data) {
			show('ssFailure', false);

			if (data.location.name)
				self.opts.locationstr.innerHTML = data.location.name;
			self.opts.location2str.innerHTML = "";
			if (data.location.country)
				self.opts.location2str.innerHTML += data.location.country;
			if (data.location.lat)
				self.opts.location2str.innerHTML += ",&nbsp;Lat.&nbsp;" + data.location.lat + '&deg;';
			if (data.location.lon)
				self.opts.location2str.innerHTML += "/&nbsp;Lon.&nbsp;" + data.location.lon + '&deg;';
			if (data.current.condition)
				self.opts.conditionstr.innerHTML = data.current.condition.text;
			if (self.opts.USUnits)
				self.opts.tempstr.innerHTML = data.current.temp_f;
			else
				self.opts.tempstr.innerHTML = data.current.temp_c;
			
			if (data.current.humidity)
				self.opts.humstr.innerHTML = data.current.humidity;
			if (self.opts.USUnits)
				self.opts.visistr.innerHTML = data.current.vis_miles;
			else
				self.opts.visistr.innerHTML = data.current.vis_km;
			
			if (self.opts.USUnits)
				self.opts.windstr.innerHTML = data.current.wind_mph;
			else
				self.opts.windstr.innerHTML = data.current.wind_kph;
			
			self.opts.windirstr.innerHTML = "";
			if (data.current.wind_degree)
				self.opts.windirstr.innerHTML += data.current.wind_degree + '&deg;'
			if (data.current.wind_dir)
				self.opts.windirstr.innerHTML += data.current.wind_dir;
			
			show('ssForeplane', true);
			loading.hide();
			
		}).catch(function (data) {
			show('ssForeplane', false);
			self.opts.msgstr.innerHTML = data.statusText + " ( " + data.status + " ) ";
			
			show('ssFailure', true);
			loading.hide();
		});
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
		
        import('./style.scss').then(() => {
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the ones saved.
			self.opts = {};
	
			if (TEST === true) {
				self.hideOnMouse = false;
				// Get currently selected Locale.
				self.opts.dateTimeLocale = document.querySelector('.selectDateTimeLocale').value;
				// If set to 'auto' then use the language.
				if (self.opts.dateTimeLocale === "")
					self.opts.dateTimeLocale = document.querySelector('.selectLanguage').value;
				// If display language is also set to 'auto' then request the default value.
				if (self.opts.dateTimeLocale === "")
					self.opts.dateTimeLocale = globalize.getDefaultCulture();
				// Get an API key from the form.
				self.opts.apikey = document.querySelector('#inputApikey').value || "";
				self.opts.USUnits = document.querySelector('#chkuseUSUnits').checked;
				
			} else {
				self.hideOnMouse = true;
				// get the last saved API key.
				self.opts.apikey = userSettings.weatherApiKey() || "";
				self.opts.dateTimeLocale = globalize.getCurrentDateTimeLocale();
				self.opts.USUnits = userSettings.enableUSUnits() || false;
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
				/*
				+ '<span id="day" class="material-icons light_mode hide"></span><span id="night" class="material-icons dark_mode hide"></span>'
				+ '</div>'
				*/
				+ '<div class="ssForeplane hide">'
				+ '<span id="ssLoc" class="ssWeatherData"></span>'
				+ '</div>'
				+ '<div class="ssForeplane hide">'
				+ '<span id="ssLoc2" class="ssWeatherData ssWeatherDataSmall"></span>'
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
						
			weather(self);
			// Refresh every 5 minutes.
			self.interval = setInterval(function() { weather(self) }, 300000);
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
