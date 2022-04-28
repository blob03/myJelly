import { activate, authorize, isActive } from './helper';
import globalize from '../../../scripts/globalize';
import toast from '../../../components/toast/toast';
import loading from '../../../components/loading/loading';

export default function (view) {
    view.addEventListener('viewshow', function () {
        const codeElement = view.querySelector('#txtQuickConnectCode');

        view.querySelector('#btnQuickConnectAuthorize').addEventListener('click', () => {
            if (!codeElement.validity.valid) {
                toast(globalize.translate('QuickConnectInvalidCode'));
                return;
            }

            // Remove spaces from code
            const normalizedCode = codeElement.value.replace(/\s/g, '');
            authorize(normalizedCode);
        });

        view.querySelector('.quickConnectSettingsContainer').addEventListener('submit', (e) => {
            e.preventDefault();
        });
		
		// Check if server is running the 10.8.0beta+ code before doing the call to renderPage().
		isActive().then( (ret) => { 
			if (ret > 0)
				renderPage(ret == 2? true: false, view); 
		});
    });

	function doActivation() {
		activate().then(() => { renderPage(false, document); });
	}

    function renderPage(newCode, view) {
		const btn = view.querySelector('#btnQuickConnectActivate');
		const container = view.querySelector('.quickConnectSettingsContainer');
		
		if (newCode) {
			// New code does not require an activation.
			btn.classList.add('hide');
			container.classList.remove('hide');
		} else {
			btn.removeEventListener("click", doActivation);
			btn.addEventListener('click', doActivation);
			btn.classList.remove('hide');
			
			loading.show();
			ApiClient.getQuickConnect('Status').then((status) => {
				// The authorization container is only usable once Quick Connect has been activated
				// and should be kept hidden until then.
				container.classList.add('hide');
				
				// With legacy code, check whether or not QC has been activated.
				if (status === 'Unavailable') {
					btn.textContent = globalize.translate('QuickConnectNotAvailable');
					btn.disabled = true;
					btn.classList.remove('button-submit');
					btn.classList.add('button');
				} else if (status === 'Active') {
					btn.classList.add('hide');
					container.classList.remove('hide');
				}

				return true;
			}).catch((e) => {
				throw e;
			}).finally(() => {
				loading.hide();
			});
		}
    }
}