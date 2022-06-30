import { authorize, isActive } from './helper';
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
		
		renderPage(view);
    });

    function renderPage(view) {
		const btn = view.querySelector('#btnQuickConnectActivate');
		const container = view.querySelector('.quickConnectSettingsContainer');
		
		// We only support Quick Connect v10.8.0+ which does not require an activation.
		btn.classList.add('hide');
		container.classList.remove('hide');
    }
}