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
	self.group = 'myJelly dev';
	self.version = '0.2';
	self.description = 'WeatherbotScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'weatherbotscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;

    let interval;
	let _tempstr_;
	let _humstr_;
	let _visistr_;
	let _windstr_;
	let _windirstr_;
	let _apikey_ = "";
	let _msgstr_;
		
	function weather(LOCALE) {	
	
		loading.show();
		
		// Note that API keys are obtained free of charge by registering at the address below
		// https://www.weatherapi.com/signup.aspx
		// Remember to copy any new key into its dedicated field in the display settings.
		const url_base = 'http://api.weatherapi.com/v1/';
		const url_apiMethod = 'current.json';
		const url_params = '?key=' + _apikey_ + '&q=auto:ip&aqi=no';
		const url = url_base + url_apiMethod + url_params; 
		
		let req = {};
		req.url = url;
		req.dataType = 'json';
		
		ajax(req).then(function (data) {
			show('ssFailure', false);
			show('ssForeplane', true);
			
			/*
			let day = document.getElementById("day");
			let night = document.getElementById("night");
			if (data.current.is_day) {
				day.classList.remove('hide');
				night.classList.add('hide');
			} else {
				night.classList.remove('hide');
				day.classList.add('hide');
			}*/
			
			if (data.current.temp_c)
				_tempstr_.innerHTML = data.current.temp_c;
			/*
			if (data.current.humidity)
				_humstr_.innerHTML = data.current.humidity + '%';
			if (data.current.vis_km)
				_visistr_.innerHTML = data.current.vis_km + 'km';
			*/
			if (data.current.wind_kph)
				_windstr_.innerHTML = data.current.wind_kph;
			if (data.current.wind_dir)
				_windirstr_.innerHTML = data.current.wind_dir;
			loading.hide();
			
		}).catch(function (data) {
			show('ssForeplane', false);
			_msgstr_.innerHTML = data.statusText + " ( " + data.status + " ) ";
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
            let elem = document.querySelector('.weatherbotScreenSaver');

            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('weatherbotScreenSaver');
                document.body.appendChild(elem);
				elem.innerHTML = '<div class="ssBackplane">'
				+ '<div class="ssFailure">'
				+ '<span id="ssMsg" class="ssWeatherData"></span>'
				+ '</div>'
				/*
				+ '<span id="day" class="material-icons light_mode hide"></span><span id="night" class="material-icons dark_mode hide"></span>'
				+ '</div>'
				*/
				+ '<div class="ssForeplane">'
				+ '<span class="material-icons thermostat"></span>'
				+ '<span id="ssTemp" class="ssWeatherData"></span>'
				+ '<span class="ssWeatherDataUnit">&#8451;</span>'
				+ '</div>'
				/*
                + '<div class="ssForeplane"><span class="material-icons water_drop"></span><span id="ssHum" class="ssWeatherData"></span>'
				+ '</div>'
				+ '<div class="ssForeplane"><span class="material-icons visibility"></span><span id="ssVisi" class="ssWeatherData"></span>'
				+ '</div>'
				*/
				+ '<div class="ssForeplane">'
				+ '<span class="material-icons air"></span>'
				+ '<span id="ssWind" class="ssWeatherData"></span>'
				+ '<span class="ssWeatherDataUnit">km/h</span>'
				+ '<span id="ssWindir" class="ssWeatherData ssWeatherDataWindir"></span>'
				+ '</div>'
				
				+ '</div>';
            }

			_tempstr_ = document.getElementById("ssTemp");
			_humstr_ = document.getElementById("ssHum");
			_visistr_ = document.getElementById("ssVisi");
			_windstr_ = document.getElementById("ssWind");
			_windirstr_ = document.getElementById("ssWindir");
			_msgstr_ = document.getElementById("ssMsg");
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the ones saved.
			let dateTimeLocale = null;
			let apikey = null;
		
			if (TEST) {
				self.hideOnMouse = false;
				// Get currently selected Locale.
				dateTimeLocale = document.querySelector('.selectDateTimeLocale').value;
				// If set to 'auto' then use the language.
				if (dateTimeLocale === "")
					dateTimeLocale = document.querySelector('.selectLanguage').value;
				// If display language is also set to 'auto' then request the default value.
				if (dateTimeLocale === "")
					dateTimeLocale = globalize.getDefaultCulture();
				// Get an API key from the form.
				apikey = document.querySelector('#inputApikey').value;
			} else {
				// get the last saved API key.
				apikey = userSettings.weatherApiKey();
				dateTimeLocale = globalize.getCurrentDateTimeLocale();
			}
			
			if (apikey && apikey.length >= 31)
				_apikey_ = apikey;
				
			stopInterval();
			
			if (dateTimeLocale != null) {
				weather(dateTimeLocale);
				// Refresh every 5 minutes.
				self.interval = setInterval(function() { weather(dateTimeLocale) }, 300000);
			}
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
