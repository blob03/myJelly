import { activate, authorize, isNewVersion, isActive } from './helper';
import globalize from '../../../scripts/globalize';
import toast from '../../../components/toast/toast';

export default function (view) {
    view.addEventListener('viewshow', function () {
        const codeElement = view.querySelector('#txtQuickConnectCode');

        view.querySelector('#btnQuickConnectAuthorize').addEventListener('click', () => {
            if (!codeElement.validity.valid) {
                toast(globalize.translate('QuickConnectInvalidCode'));
                return;
            }

            const code = codeElement.value;
            authorize(code);
        });

        view.querySelector('.quickConnectSettingsContainer').addEventListener('submit', (e) => {
            e.preventDefault();
        });
		
		// Check if we are running the 10.8.0beta+ code before the call to renderPage().
		isNewVersion().then( (ret) => { renderPage(ret, view); });
    });

	function doActivation() {
		activate().then(() => { renderPage(false, view); });
	}

    function renderPage(newCode, view) {
		const btn = view.querySelector('#btnQuickConnectActivate');
		const container = view.querySelector('.quickConnectSettingsContainer');
		
		if (newCode) {
			// New code does not require activation.
			btn.classList.add('hide');
			container.classList.remove('hide');
		} else {
			btn.removeEventListener("click", doActivation);
			btn.addEventListener('click', doActivation);
			btn.classList.remove('hide');
			
			ApiClient.getQuickConnect('Status').then((status) => {
				// The authorization container is only usable when quick connect is active, so it should be hidden otherwise.
				container.style.display = 'none';
				
				// With legacy code, check whether or not we are in active state.
				if (status === 'Unavailable') {
					btn.textContent = globalize.translate('QuickConnectNotAvailable');
					btn.disabled = true;
					btn.classList.remove('button-submit');
					btn.classList.add('button');
				} else if (status === 'Active') {
					container.classList.remove('hide');
					container.style.display = '';
					btn.style.display = 'none';
				}

				return true;
			}).catch((e) => {
				throw e;
			});
		}
    }
}