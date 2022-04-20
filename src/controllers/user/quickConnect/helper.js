import globalize from '../../../scripts/globalize';
import toast from '../../../components/toast/toast';
import Dashboard from '../../../utils/dashboard';
import loading from '../../../components/loading/loading';

export function isActive() {
	loading.show();
	return new Promise((resolve) => {
		ApiClient.getQuickConnect('Status')
			.then(status => {
				if (status === "Available" || status === "Active")
					resolve(1);
				resolve(0);
			})
			.catch(() => {
				ApiClient.getQuickConnect('Enabled')
					.then(status => {
						resolve(2);
					})
					.catch(() => {
						console.debug('Failed to get Quick Connect status');
						resolve(0);
					});
			})
			.finally(() => {
				loading.hide();
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
            message: globalize.translate('QuickConnectActivationFail')
        });

        throw e;
    });
};