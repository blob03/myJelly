/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
import globalize from '../../../scripts/globalize';
import datetime from '../../../scripts/datetime';

export default function () {
    const self = this;

	self.name = 'Digital Clock';
	self.group = 'myJelly';
	self.version = '0.3';
	self.description = 'ClockScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'clockscreensaver';
	self.supportsAnonymous = false;

    let interval;
	
	function clock(LOCALE) {
		var _datestr_ = document.getElementById("ssClockDate");
		var _timestr_ = document.getElementById("ssClockTime");
		
		const x = new Date();
		const _day_ = x.toLocaleDateString(LOCALE, {
				weekday: 'short',
		});
		const _date_ = x.toLocaleDateString(LOCALE);
		const _time_ = x.toLocaleTimeString(LOCALE, {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		_datestr_.innerHTML = _day_ + " " + _date_;
		_timestr_.innerHTML = _time_;

		if (!self.interval)
			self.interval = setInterval(function() { clock(LOCALE) }, 1000);
		return;
	}

    function stopInterval() {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
    }

    self.show = function (TEST) {
        import('./style.scss').then(() => {
            let elem = document.querySelector('.clockScreenSaver');

            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('clockScreenSaver');
                document.body.appendChild(elem);

                elem.innerHTML = '<div id="ssClockDate" class="ssClockDate"></div>'
				+ '<div id="ssClockTime" class="ssClockTime"></div>';
            }

			stopInterval();
			
			// When tested, use the relevant parameters as they are currently set in the settings page
			// rather than the saved ones.
			let dateTimeLocale = null;
			if (TEST) {
				// Get currently selected Locale.
				dateTimeLocale = document.querySelector('.selectDateTimeLocale').value;
				// If set to 'auto' then use the language.
				if (dateTimeLocale === "")
					dateTimeLocale = document.querySelector('.selectLanguage').value;
				// If display language is also set to 'auto' then request the default value.
				if (dateTimeLocale === "")
					dateTimeLocale = globalize.getDefaultCulture();
			} else 
				dateTimeLocale = globalize.getCurrentDateTimeLocale();
			
			if (dateTimeLocale != null)
				clock(dateTimeLocale);
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
