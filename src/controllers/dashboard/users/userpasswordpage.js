import loading from '../../../components/loading/loading';
import libraryMenu from '../../../scripts/libraryMenu';
import globalize from '../../../scripts/globalize';
import '../../../elements/emby-button/emby-button';
import Dashboard from '../../../utils/dashboard';
import toast from '../../../components/toast/toast';
import confirm from '../../../components/confirm/confirm';

function loadUser(page, params) {
    const userid = params.userId;
    ApiClient.getUser(userid).then(function (user) {
        Dashboard.getCurrentUser().then(function (loggedInUser) {
            libraryMenu.setTitle(user.Name);
            page.querySelector('.username').innerText = user.Name;
            let showPasswordSection = true;

            if (user.ConnectLinkType == 'Guest') {
                showPasswordSection = false;
            } else if (user.HasConfiguredPassword) {
                page.querySelector('#btnResetPassword').classList.remove('hide');
                page.querySelector('#fldCurrentPassword').classList.remove('hide');
            } else {
                page.querySelector('#btnResetPassword').classList.add('hide');
                page.querySelector('#fldCurrentPassword').classList.add('hide');
            }

            if (showPasswordSection && (loggedInUser.Policy.IsAdministrator || user.Policy.EnableUserPreferenceAccess)) {
                page.querySelector('.passwordSection').classList.remove('hide');
            } else {
                page.querySelector('.passwordSection').classList.add('hide');
            }

            import('../../../components/autoFocuser').then(({ default: autoFocuser }) => {
                autoFocuser.autoFocus(page);
            });
        });
    });
    page.querySelector('#txtCurrentPassword').value = '';
    page.querySelector('#txtNewPassword').value = '';
    page.querySelector('#txtNewPasswordConfirm').value = '';
}

export default function (view, params) {

    function savePassword() {
        const userId = params.userId;
        let currentPassword = view.querySelector('#txtCurrentPassword').value;
        const newPassword = view.querySelector('#txtNewPassword').value;

        if (view.querySelector('#fldCurrentPassword').classList.contains('hide')) {
            // Firefox does not respect autocomplete=off, so clear it if the field is supposed to be hidden (and blank)
            // This should only happen when user.HasConfiguredPassword is false, but this information is not passed on
            currentPassword = '';
        }

        ApiClient.updateUserPassword(userId, currentPassword, newPassword).then(function () {
            loading.hide();
            toast(globalize.translate('PasswordSaved'));

            loadUser(view, params);
        }, function () {
            loading.hide();
            Dashboard.alert({
                title: globalize.translate('HeaderLoginFailure'),
                message: globalize.translate('MessageInvalidUser')
            });
        });
    }

    function onSubmit(e) {
        const form = this;

        if (form.querySelector('#txtNewPassword').value != form.querySelector('#txtNewPasswordConfirm').value) {
            toast(globalize.translate('PasswordMatchError'));
        } else {
            loading.show();
            savePassword();
        }

        e.preventDefault();
        return false;
    }

    function resetPassword() {
        const msg = globalize.translate('PasswordResetConfirmation');
        confirm(msg, globalize.translate('ResetPassword')).then(function () {
            const userId = params.userId;
            loading.show();
            ApiClient.resetUserPassword(userId).then(function () {
                loading.hide();
                Dashboard.alert({
                    message: globalize.translate('PasswordResetComplete'),
                    title: globalize.translate('ResetPassword')
                });
                loadUser(view, params);
            });
        });
    }

    view.querySelector('.updatePasswordForm').addEventListener('submit', onSubmit);
    view.querySelector('#btnResetPassword').addEventListener('click', resetPassword);
    view.addEventListener('viewshow', function () {
        loadUser(view, params);
    });
}

