import globalize from '../../../scripts/globalize';
import toast from '../../../components/toast/toast';
import Dashboard from '../../../utils/dashboard';
import loading from '../../../components/loading/loading';

export function isActive() {
	loading.show();
	return new Promise((resolve) => {
		ApiClient.getQuickConnect('Enabled')
			.then(status => { resolve(status); })
			.catch(() => {
				console.debug('Failed to get Quick Connect status');
				resolve(false);
			})
			.finally(() => { loading.hide(); });
	})
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
