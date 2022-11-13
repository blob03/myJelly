import DisplaySettings from '../../../components/displaySettings/displaySettings';
import {currentSettings, UserSettings} from '../../../scripts/settings/userSettings';
import autoFocuser from '../../../components/autoFocuser';

/* eslint-disable indent */

    export default function (view, params) {
        let settingsInstance;
		let cSettings = currentSettings;
		const API_userId = ApiClient.getCurrentUserId();
		const userId = params.userId || API_userId;
		// this page can also be used by admins to edit users' preferences.
		const adminEdit = Boolean(userId && (userId !== API_userId));
		const options = {
			serverId: ApiClient.serverId(),
			adminEdit: adminEdit,
			apiClient: ApiClient,
			userId: userId,
			element: view.querySelector('.settingsContainer'),
			userSettings: cSettings,
			enableSaveButton: true,
			enableSaveConfirmation: true,
			autoFocus: autoFocuser.isEnabled()
		};
		
		view.addEventListener('viewshow', function () {
			if (settingsInstance) {
				settingsInstance.loadData();
			} else {
				ApiClient.getUser(userId).then( currentUser => {
					options.currentUser = currentUser;
					if (adminEdit) {
						cSettings = new UserSettings;
						cSettings.setUserInfo(userId, ApiClient).then(() => {
							console.debug("Admin is configuring display preferences for user \'" + currentUser.Name + "'");
							options.userSettings = cSettings;
							settingsInstance = new DisplaySettings(options);
						});
					} else
						settingsInstance = new DisplaySettings(options);
				});
			}
		});

		view.addEventListener('viewdestroy', function () {
			if (settingsInstance) {
				settingsInstance.destroy();
				settingsInstance = null;
			}
		});
	}

/* eslint-enable indent */
