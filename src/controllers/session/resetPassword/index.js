import globalize from '../../../scripts/globalize';
import Dashboard from '../../../utils/dashboard';
import { appRouter } from '../../../components/appRouter';

/* eslint-disable indent */

    function processForgotPasswordResult(result) {
        if (result.Success) {
            let msg = globalize.translate('MessagePasswordResetForUsers');
            msg += '<br/>';
            msg += '<br/>';
            msg += result.UsersReset.join('<br/>');
            Dashboard.alert({
                message: msg,
                title: globalize.translate('HeaderPasswordReset'),
                callback: function () {
                    window.location.href = 'index.html';
                }
            });
			return;
        }

        Dashboard.alert({
            message: globalize.translate('MessageInvalidForgotPasswordPin'),
            title: globalize.translate('HeaderPasswordReset')
        });
    }

    export default function (view) {
        function onSubmit(e) {
            ApiClient.ajax({
                type: 'POST',
                url: ApiClient.getUrl('Users/ForgotPassword/Pin'),
                dataType: 'json',
                data: JSON.stringify({
                    Pin: view.querySelector('#txtPin').value
                }),
                contentType: 'application/json'
            }).then(processForgotPasswordResult);
            e.preventDefault();
            return false;
        }
		
		function onCancel(e) {
			 const serverId = ApiClient.serverId();
			 if (serverId)
				appRouter.showLocalLogin(serverId);
			else 
				appRouter.back();
		}

        view.querySelector('form').addEventListener('submit', onSubmit);
		view.querySelector('.btnCancel').addEventListener('click', onCancel);
    }

/* eslint-enable indent */
