/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
import { onLogoutClick } from '../../../scripts/libraryMenu';
import globalize from '../../../scripts/globalize';
import { ssmanager } from '../../../scripts/screensavermanager';

// Count every second down from 10 to 0 then terminate the session.

export default function () {
    const self = this;

	self.name = 'AutoLogout';
	self.group = 'myJelly';
	self.version = '0.1';
	self.description = 'AutoLogoutScreensaverHelp';
	self.type = 'screensaver';
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
				self.stopInterval();
				self._display_.innerHTML = globalize.translate('LogingOut');
				self.interval = setTimeout(self.countdown, 2000);
				break;
				
			case -2:
				const elem = document.querySelector('.screenSaver');
				if (elem)
					elem.parentNode.removeChild(elem);
				document.body.classList.remove('screensaver-noScroll');
				ssmanager.activeScreenSaver = null;
				onLogoutClick();
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
		self.hideOnMouse = TEST !== true;
		
		import('./style.scss').then(() => {
            let elem = document.querySelector('.screenSaver');
			if (elem)
				elem.remove();
			elem = document.createElement('div');
			elem.classList.add('screenSaver');
			elem.classList.add('ssAutoLogoutBackdrop');
			elem.classList.add('backdropImage');
			elem.classList.add('themeBackdrop');
			const idx = Math.ceil(Math.random() * 4);
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
