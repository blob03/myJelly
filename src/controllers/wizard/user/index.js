import loading from '../../../components/loading/loading';
import globalize from '../../../scripts/globalize';
import '../../../styles/dashboard.scss';
import '../../../elements/emby-input/emby-input';
import '../../../elements/emby-button/emby-button';
import Dashboard from '../../../utils/dashboard';
import toast from '../../../components/toast/toast';

function getApiClient() {
    return ApiClient;
}

function nextWizardPage() {
    Dashboard.navigate('wizardlibrary.html')
        .catch(err => {
            console.error('[Wizard > User] error navigating to library setup', err);
        });
}

function onUpdateUserComplete(result) {
    console.debug('[Wizard > User] user update complete:', result);
    loading.hide();
    nextWizardPage();
}

async function onUpdateUserError(result) {
    const message = await result.text();
    console.warn('[Wizard > User] user update failed:', message);
    toast(globalize.translate('ErrorDefault'));
    loading.hide();
}

function submit(form) {
    loading.show();
    const apiClient = getApiClient();
	let data = { Name: form.querySelector('#txtUsername').value };
	if (form.querySelector('#txtManualPassword').value != '********')
		data = { ...data, Password: form.querySelector('#txtManualPassword').value };

    apiClient.ajax({
		type: 'POST',
		data: JSON.stringify({
			Name: form.querySelector('#txtUsername').value,
			Password: form.querySelector('#txtManualPassword').value
		}),
		url: apiClient.getUrl('Startup/User'),
		contentType: 'application/json'
	})
    .then(onUpdateUserComplete)
    .catch(onUpdateUserError);
}

function onSubmit(e) {
    const form = this;

    if (form.querySelector('#txtManualPassword').value != form.querySelector('#txtPasswordConfirm').value) {
        toast(globalize.translate('PasswordMatchError'));
    } else {
        submit(form);
    }

    e.preventDefault();
    return false;
}

function onViewShow(page) {
    loading.show();
	const SALTED_HASH = '$PBKDF2-SHA512$';
    const apiClient = getApiClient();
	page.querySelector('#txtUsername').value = '';
	page.querySelector('#txtManualPassword').value = '';
	page.querySelector('#txtPasswordConfirm').value = '';
    apiClient.getJSON(apiClient.getUrl('Startup/User')).then( (user) => {
		if (user.Name)
			page.querySelector('#txtUsername').value = user.Name;
		
		if (user.Password && user.Password.startsWith(SALTED_HASH)) {
			page.querySelector('#txtManualPassword').value = "********";
			page.querySelector('#txtPasswordConfirm').value = "********";
		}
		
	}).finally( () => {
		loading.hide();
	});
}

export default function (view) {
    view.querySelector('.wizardUserForm').addEventListener('submit', onSubmit);
	
    view.addEventListener('viewshow', function () {
        document.querySelector('.skinHeader').classList.add('noHomeButtonHeader');
		onViewShow(view);
    });
    view.addEventListener('viewhide', function () {
        document.querySelector('.skinHeader').classList.remove('noHomeButtonHeader');
    });
}
