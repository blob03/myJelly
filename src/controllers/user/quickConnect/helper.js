import globalize from '../../../scripts/globalize';
import toast from '../../../components/toast/toast';
import Dashboard from '../../../utils/dashboard';
import loading from '../../../components/loading/loading';

export function isNewVersion() {
	loading.show();
	return new Promise((resolve) => {
		ApiClient.getQuickConnect('Status')
			.then(avail => {
				loading.hide();
				resolve(false);
			})
			.catch(() => {
				ApiClient.getQuickConnect('Enabled')
					.then(status => {
						loading.hide();
						resolve(true);
					})
					.catch(() => {
						loading.hide();
						resolve(false);
					});
			});
	});
}

export function isActive() {
	loading.show();
	return new Promise((resolve) => {
		ApiClient.getQuickConnect('Status')
			.then(status => {
				loading.hide();
				if (status === "Available" || status === "Active")
					resolve(true);
				resolve(false);
			})
			.catch(() => {
				ApiClient.getQuickConnect('Enabled')
					.then(status => {
						loading.hide();
						resolve(status);
					})
					.catch(() => {
						console.debug('Failed to get Quick Connect status');
						loading.hide();
						resolve(false);
					});
			});
	});
}

export const authorize = (code) => {
    const url = ApiClient.getUrl('/QuickConnect/Authorize?Code=' + code);
    ApiClient.ajax({
        type: 'POST',
        url: url
    }, true).then(() => {
        toast(globalize.translate('QuickConnectAuthorizeSuccess'));
    }).catch(() => {
        toast(globalize.translate('QuickConnectAuthorizeFail'));
    });

    // prevent bubbling
    return false;
};

export const activate = () => {
    const url = ApiClient.getUrl('/QuickConnect/Activate');
    return ApiClient.ajax({
        type: 'POST',
        url: url
    }).then(() => {
        toast(globalize.translate('QuickConnectActivationSuccessful'));
        return true;
    }).catch((e) => {
        console.error('Error activating Quick Connect. Error:', e);
        Dashboard.alert({
            title: globalize.translate('HeaderError'),
            message: globalize.translate('DefaultErrorMessage')
        });

        throw e;
    });
};