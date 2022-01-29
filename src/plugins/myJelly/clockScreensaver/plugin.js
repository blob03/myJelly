/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
import globalize from '../../../scripts/globalize';
import datetime from '../../../scripts/datetime';

export default function () {
    const self = this;

	self.name = 'Digital Clock';
	self.group = 'myJelly';
	self.version = '0.1';
	self.description = 'ClockScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'clockscreensaver';
	self.supportsAnonymous = false;

    let interval;
	
	function clock() {
		var _datestr_ = document.getElementById("ssClockDate");
		var _timestr_ = document.getElementById("ssClockTime");
		
		const x = new Date();
		const _day_ = datetime.toLocaleDateString(x, {
				weekday: 'short',
		});
		const _date_ = datetime.toLocaleDateString(x);
		const _time_ = datetime.toLocaleTimeString(x, {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		_datestr_.innerHTML = _day_ + " " + _date_;
		_timestr_.innerHTML = _time_;

		if (!self.interval)
			self.interval = setInterval(function() { clock() }, 1000);
		return;
	}

    function stopInterval() {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
    }

    self.show = function () {
        import('./style.scss').then(() => {
            let elem = document.querySelector('.clockScreenSaver');

            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('clockScreenSaver');
                document.body.appendChild(elem);

                elem.innerHTML = '<div id="ssClockDate" class="ssClockDate"></div>'
				+ '<div id="ssClockTime" class="ssClockTime"></div>';
            }

			globalize.updateCurrentCulture();
            stopInterval();
            clock();
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
