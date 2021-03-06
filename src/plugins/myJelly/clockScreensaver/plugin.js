/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
import globalize from '../../../scripts/globalize';
import datetime from '../../../scripts/datetime';

export default function () {
    const self = this;

	self.name = 'Digital Clock';
	self.group = 'myJelly';
	self.version = '0.9';
	self.description = 'ClockScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'clockscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;
    self.interval = null;
	self._datestr_;
	self._timestr_;
		
	function clock(LOCALE) {	
		const x = new Date();
		const _date_ = x.toLocaleDateString(LOCALE, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: '2-digit'	
		});
		const _time_ = x.toLocaleTimeString(LOCALE, {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		self._datestr_.innerHTML = _date_;
		self._timestr_.innerHTML = _time_;
	}

    function stopInterval() {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
    }

    self.show = function (TEST) {
		
		// If another instance is running, return.
		if (self.interval !== null) 
			return;
		
        import('./style.scss').then(() => {
            let elem = document.querySelector('.clockScreenSaver');

            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('clockScreenSaver');
                document.body.appendChild(elem);
				elem.innerHTML = '<div id="ssBackplane" class="ssBackplane">'
                + '<div id="ssClockDate" class="ssForeplane ssClockDate"></div>'
				+ '<div id="ssClockTime" class="ssForeplane ssClockTime"></div>'
				+ '</div>';
            }
			
			self._datestr_ = document.getElementById("ssClockDate");
			self._timestr_ = document.getElementById("ssClockTime");

			stopInterval();
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the saved ones.
			let dateTimeLocale = null;
			if (TEST === true) {
				self.hideOnMouse = false;
				// Get currently selected Locale.
				dateTimeLocale = document.querySelector('.selectDateTimeLocale').value;
				// If set to 'auto' then use the language.
				if (dateTimeLocale === "")
					dateTimeLocale = document.querySelector('.selectLanguage').value;
				// If display language is also set to 'auto' then request the default value.
				if (dateTimeLocale === "")
					dateTimeLocale = globalize.getDefaultCulture();
			} else {
				self.hideOnMouse = true;
				dateTimeLocale = globalize.getCurrentDateTimeLocale();
			}
			
			if (dateTimeLocale != null) {
				clock(dateTimeLocale);
				self.interval = setInterval(function() { clock(dateTimeLocale) }, 1000);
			}
        });
    };

    self.hide = function () {
        stopInterval();
		const elem = document.querySelector('.clockScreenSaver');
 
		if (elem) {
            return new Promise((resolve) => {
                
				elem.parentNode.removeChild(elem);
				resolve();
            });
        }

        return Promise.resolve();
    };
}
