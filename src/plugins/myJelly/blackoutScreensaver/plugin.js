/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';
	
export default function () {
    const self = this;

	self.name = 'Blackout';
	self.group = 'myJelly';
	self.version = '0.1';
	self.description = 'BlackoutScreensaverHelp';
	self.type = 'screensaver';
	self.id = 'blackoutscreensaver';
	self.supportsAnonymous = false;

    self.show = function () {
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
