/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
import { onLogoutClick } from '../../../scripts/libraryMenu';
import globalize from '../../../scripts/globalize';
import { PluginType } from '../../../types/plugin.ts';
import { ssmanager } from '../../../scripts/screensavermanager';
import { randomInt } from '../../../utils/number.ts';

// Count every second down from 10 to 0 then terminate the session.

export default function () {
    const self = this;
	self.name = 'AutoLogout';
	self.group = 'myJelly';
	self.version = '0.33';
	self.description = 'AutoLogoutScreensaverHelp';
	self.type = PluginType.Screensaver;
	self.id = 'autologoutscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;
	self.interval = null;
	self._display_;
	self._counter_ = 10;
	
	self.countdown = function () {
		self._counter_ --;
		switch(self._counter_) {
			case -1:
				self._display_.classList.add('ssAutoLogoutLogoutMesg');
				self._display_.innerHTML = globalize.translate('LoggingOut');
				break;
				
			case -2:
				self.stopInterval();
				const elem = document.querySelector('.screenSaver');
				if (elem)
					elem.classList.remove('themeBackdrop');
					self._display_.innerHTML = '';
				if (self.test !== true)
					onLogoutClick();
				setTimeout(() => {
					if (elem)
						elem.parentNode.removeChild(elem);
					document.body.classList.remove('screensaver-noScroll');
					ssmanager.activeScreenSaver = null;
				}, 2000);
				break;
				
			default:
				self._display_.innerHTML = self._counter_;
		}
	}

    self.stopInterval = function () {
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
    }
	
    self.show = function (TEST) {
		// Stop any instance that could be running.
		self.stopInterval();
		self._counter_ = 10;
		self.test = TEST;
		self.hideOnMouse = self.test !== true;
		
		import('./style.scss').then(() => {
            let elem = document.querySelector('.screenSaver');
			if (elem)
				elem.remove();
			elem = document.createElement('div');
			elem.classList.add('screenSaver');
			elem.classList.add('ssAutoLogoutBackdrop');
			elem.classList.add('backdropImage');
			elem.classList.add('ssbackdropImage');
			elem.classList.add('themeBackdrop');
			const idx = randomInt(1, 4);
			if (idx)
				elem.classList.add('alt' + idx);
			elem.innerHTML = '<div class="ssBackplane ssAutoLogoutBackplane">'
				+'<div class="ssForeplane ssAutoLogoutCountdown"><span id="ssAutoLogoutDisplay"></span></div>'
				+ '</div>';
			document.body.appendChild(elem);
			
			self._display_ = document.getElementById("ssAutoLogoutDisplay");
			self.countdown();
			self.interval = setInterval(self.countdown, 1000);
        });
    };

    self.hide = function () {
        self.stopInterval();
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
