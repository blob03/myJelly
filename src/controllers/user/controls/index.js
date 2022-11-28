import toast from '../../../components/toast/toast';
import globalize from '../../../scripts/globalize';
import appSettings from '../../../scripts/settings/appSettings';
import Events from '../../../utils/events.ts';
import loading from '../../../components/loading/loading';

export default function (view) {
	
	view.querySelector('form').addEventListener('submit', submit);
	view.querySelector('.btnSave').classList.remove('hide');
	
    function submit(e) {
		loading.show();
        appSettings.enableGamepad(view.querySelector('.chkEnableGamepad').checked);
		setTimeout(() => { 
			loading.hide();
			toast(globalize.translate('SettingsSaved'));}, 500);
        Events.trigger(view, 'saved');
        e?.preventDefault();
        return false;
    }

    view.addEventListener('viewshow', function () {
        view.querySelector('.chkEnableGamepad').checked = appSettings.enableGamepad();
        
        import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(view);
        });
    });
}
