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
		isNewVersion().then( (ret) => {
			if (ret === false) {
				view.querySelector('#btnQuickConnectActivate').addEventListener('click', () => {
					activate().then(() => {
						renderPage(false, view);
					});
				});
				renderPage(false, view);
			} else {
				renderPage(true, view);
			}
		});
    });

    function renderPage(newCode, view) {
		if (newCode) {
			// New code comes pre-activated.
			view.querySelector('.quickConnectSettingsContainer').classList.remove('hide');
		} else {
			ApiClient.getQuickConnect('Status').then((status) => {
				const btn = view.querySelector('#btnQuickConnectActivate');
				const container = view.querySelector('.quickConnectSettingsContainer');

				// The activation button should only be visible when quick connect is unavailable (with the text replaced with an error) or when it is available (so it can be activated)
				// The authorization container is only usable when quick connect is active, so it should be hidden otherwise
				container.style.display = 'none';
				
				// With legacy code, check whether or not we are in active state.
				if (status === 'Unavailable') {
					btn.textContent = globalize.translate('QuickConnectNotAvailable');
					btn.disabled = true;
					btn.classList.remove('button-submit');
					btn.classList.add('button');
				} else if (status === 'Active') {
					view.querySelector('.quickConnectSettingsContainer').classList.remove('hide');
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