/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
	
export default function () {
    const self = this;

	self.name = 'Blackout';
	self.group = 'myJelly';
	self.version = '0.5';
	self.description = 'BlackoutScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'blackoutscreensaver';
	self.supportsAnonymous = false;
	self.hideOnClick = true;
	self.hideOnMouse = true;
	self.hideOnKey = true;
	self.running = false;

    self.show = function (TEST) {
		
		// If another instance is running, return.
		if (self.running === true) 
			return;
		self.running = true;
		
		// When being tested, do not exit on mouse motion.
		if (TEST === true)
			this.hideOnMouse = false;
		else
			this.hideOnMouse = true;
		
        import('./style.scss').then(() => {
            let elem = document.querySelector('.blackoutScreenSaver');

            if (!elem) {
                elem = document.createElement('div');
                elem.classList.add('blackoutScreenSaver');
                document.body.appendChild(elem);
            }
        });
    };

    self.hide = function () {

		self.running = false;
        const elem = document.querySelector('.blackoutScreenSaver');

        if (elem) {
            return new Promise((resolve) => {
                
				elem.parentNode.removeChild(elem);
				resolve();
            });
        }

        return Promise.resolve();
    };
}
