import { Events } from 'jellyfin-apiclient';
import toast from '../../../components/toast/toast';
import globalize from '../../../scripts/globalize';
import appSettings from '../../../scripts/settings/appSettings';
import loading from '../../../components/loading/loading';

export default function (view) {
    function submit(e) {
		loading.show();
        appSettings.enableGamepad(view.querySelector('.chkEnableGamepad').checked);
		setTimeout(() => { 
			loading.hide();
			toast(globalize.translate('SettingsSaved'));}, 1000);

        Events.trigger(view, 'saved');

        e?.preventDefault();

        return false;
    }

    view.addEventListener('viewshow', function () {
        view.querySelector('.chkEnableGamepad').checked = appSettings.enableGamepad();
        view.querySelector('form').addEventListener('submit', submit);
        view.querySelector('.btnSave').classList.remove('hide');

        import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(view);
        });
    });
}
