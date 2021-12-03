import { appHost } from '../../../components/apphost';
import '../../../components/listview/listview.scss';
import '../../../elements/emby-button/emby-button';
import layoutManager from '../../../components/layoutManager';
import globalize from '../../../scripts/globalize';
import * as LibraryMenu from '../../../scripts/libraryMenu';
import Dashboard from '../../../scripts/clientUtils';
import template from './index.html';

export default function (view, params) {
	
    view.querySelector('.btnLogout').addEventListener('click', function () {
        Dashboard.logout();
    });

    view.querySelector('.selectServer').addEventListener('click', function () {
        Dashboard.selectServer();
    });

    view.querySelector('.clientSettings').addEventListener('click', function () {
        window.NativeShell.openClientSettings();
    });

    view.addEventListener('viewshow', function () {
        // this page can also be used by admins to change user preferences from the user edit page
        const userId = params.userId || Dashboard.getCurrentUserId();
        const page = this;
		
        document.querySelector('.lnkMyProfile').setAttribute('href', '#!/myprofile.html?userId=' + userId);
        document.querySelector('.lnkDisplayPreferences').setAttribute('href', '#!/mypreferencesdisplay.html?userId=' + userId);
        document.querySelector('.lnkHomePreferences').setAttribute('href', '#!/mypreferenceshome.html?userId=' + userId);
        document.querySelector('.lnkPlaybackPreferences').setAttribute('href', '#!/mypreferencesplayback.html?userId=' + userId);
        document.querySelector('.lnkSubtitlePreferences').setAttribute('href', '#!/mypreferencessubtitles.html?userId=' + userId);
        document.querySelector('.lnkQuickConnectPreferences').setAttribute('href', '#!/mypreferencesquickconnect.html');
        document.querySelector('.lnkControlsPreferences').setAttribute('href', '#!/mypreferencescontrols.html?userId=' + userId);

        const supportsClientSettings = appHost.supports('clientsettings');
        document.querySelector('.clientSettings').classList.toggle('hide', !supportsClientSettings);

        const supportsMultiServer = appHost.supports('multiserver');
        document.querySelector('.selectServer').classList.toggle('hide', !supportsMultiServer);

        document.querySelector('.lnkControlsPreferences').classList.toggle('hide', layoutManager.mobile);

        ApiClient.getQuickConnect('Enabled')
            .then(enabled => {
                if (enabled === true) {
                    page.querySelector('.lnkQuickConnectPreferences').classList.remove('hide');
                }
            })
            .catch(() => {
                console.debug('Failed to get QuickConnect status');
            });

        ApiClient.getUser(userId).then( (user) => {
			LibraryMenu.updateUserInHeader();
			LibraryMenu.setTitle(globalize.translate('Settings'));
            document.querySelector('.headerUsername').innerHTML = user.Name;
            if (user.Policy.IsAdministrator && !layoutManager.tv) {
                document.querySelector('.adminSection').classList.remove('hide');
            }
        });

        // Hide the actions if user preferences are being edited for a different user
        if (params.userId && params.userId !== Dashboard.getCurrentUserId) {
            document.querySelector('.userSection').classList.add('hide');
            document.querySelector('.adminSection').classList.add('hide');
            document.querySelector('.lnkControlsPreferences').classList.add('hide');
        }

        import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(view);
        });
    });
}
