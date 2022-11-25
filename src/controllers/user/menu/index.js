import { appHost } from '../../../components/apphost';
import layoutManager from '../../../components/layoutManager';
import * as LibraryMenu from '../../../scripts/libraryMenu';
import {isActive} from '../quickConnect/helper';

export default function (view, params) {
	const userId = params.userId || ApiClient.getCurrentUserId();
	// this page can also be called by admins to edit users' preferences.
	const adminEdit = Boolean(userId !== ApiClient.getCurrentUserId());
	
	view.querySelector('.userSection').classList.toggle('hide', adminEdit);
	view.querySelector('.lnkControlsPreferences').classList.toggle('hide', adminEdit || layoutManager.mobile);
	
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
	
	view.querySelector('.exitApp').addEventListener('click', appHost.exit);
	view.querySelector('.selectServer').addEventListener('click', Dashboard.selectServer);
	view.querySelector('.btnLogout').addEventListener('click', LibraryMenu.onLogoutClick);
	view.querySelector('.clientSettings').addEventListener('click', function () {window.NativeShell.openClientSettings();});
	
	ApiClient.getUser(userId).then( _user => {
		view.querySelector('.headerUsername').innerHTML = _user.Name;
		// Sections to hide when editing on behalf of a user.
		view.querySelector('.adminSection').classList.toggle('hide', adminEdit || !_user.Policy.IsAdministrator || layoutManager.tv);
		
		view.addEventListener('viewshow', function () {
				// As it seems there is a lack of support for doing QC requests on behalf of a user.
				// This needs further investigation, in the meantime just keep it disabled.
				if (!adminEdit) {
					// Check whether QuickConnect is active or not.
					isActive().then((ret) => {
						view.querySelector('.lnkQuickConnectPreferences').classList.toggle('hide', !ret);
					});
				} else
					view.querySelector('.lnkQuickConnectPreferences').classList.add('hide');
		 
			import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
				autoFocuser.autoFocus(view);
			});
		});
	});	
}
