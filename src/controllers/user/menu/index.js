import { appHost } from '../../../components/apphost';
import layoutManager from '../../../components/layoutManager';
import * as LibraryMenu from '../../../scripts/libraryMenu';
import {isActive} from '../quickConnect/helper';

export default function (view, params) {
	const userId = params.userId || ApiClient.getCurrentUserId();
	
	view.querySelector('.exitApp').addEventListener('click', appHost.exit);
	view.querySelector('.selectServer').addEventListener('click', Dashboard.selectServer);
	view.querySelector('.btnLogout').addEventListener('click', LibraryMenu.onLogoutClick);
	view.querySelector('.clientSettings').addEventListener('click', function () {window.NativeShell.openClientSettings();});
	
	view.addEventListener('viewshow', function () {
		ApiClient.getUser(userId).then( _currentUser => {
			view.querySelector('.headerUsername').innerHTML = _currentUser.Name;
			
			view.querySelector('.lnkUserProfile').setAttribute('href', '#/userprofile.html?userId=' + userId);
			view.querySelector('.lnkDisplayPreferences').setAttribute('href', '#/mypreferencesdisplay.html?userId=' + userId);
			view.querySelector('.lnkHomePreferences').setAttribute('href', '#/mypreferenceshome.html?userId=' + userId);
			view.querySelector('.lnkPlaybackPreferences').setAttribute('href', '#/mypreferencesplayback.html?userId=' + userId);
			view.querySelector('.lnkSubtitlePreferences').setAttribute('href', '#/mypreferencessubtitles.html?userId=' + userId);
			view.querySelector('.lnkQuickConnectPreferences').setAttribute('href', '#/mypreferencesquickconnect.html');
			view.querySelector('.lnkControlsPreferences').setAttribute('href', '#/mypreferencescontrols.html?userId=' + userId);
			
			const supportsClientSettings = appHost.supports('clientsettings');
			const supportsExitMenu = appHost.supports('exitmenu');
			const supportsMultiServer = appHost.supports('multiserver');
			view.querySelector('.clientSettings').classList.toggle('hide', !supportsClientSettings);
			view.querySelector('.exitApp').classList.toggle('hide', !supportsExitMenu);
			view.querySelector('.selectServer').classList.toggle('hide', !supportsMultiServer);

			// this page can also be used by admins to change users' preferences from the user edit page
			let adminEdit = Boolean(params.userId && params.userId !== ApiClient.getCurrentUserId());
			if (!adminEdit) {
				// Check whether QuickConnect is active or not.
				isActive().then( (ret) => {
						view.querySelector('.lnkQuickConnectPreferences').classList.toggle('hide', !ret);
				});
			} else
				// As it seems there is a lack of support for doing QC requests on behalf of a user.
				// This needs further investigation, in the meantime we disable it.
				view.querySelector('.lnkQuickConnectPreferences').classList.add('hide');

			// Hide the actions if user preferences are being edited for a different user
			view.querySelector('.userSection').classList.toggle('hide', adminEdit);
			view.querySelector('.adminSection').classList.toggle('hide', adminEdit || !_currentUser.Policy.IsAdministrator || layoutManager.tv);
			view.querySelector('.lnkControlsPreferences').classList.toggle('hide', adminEdit || layoutManager.mobile);
		});
	 
		import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
			autoFocuser.autoFocus(view);
		});
	});
}
