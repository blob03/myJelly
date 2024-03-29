import type { UserDto } from '@jellyfin/sdk/lib/generated-client';
import React, { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import Dashboard from '../../../utils/dashboard';
import globalize from '../../../scripts/globalize';
import LibraryMenu from '../../../scripts/libraryMenu';
import confirm from '../../confirm/confirm';
import loading from '../../loading/loading';
import toast from '../../toast/toast';
import ButtonElement from '../../../elements/ButtonElement';
import CheckBoxElement from '../../../elements/CheckBoxElement';
import SelectElement from '../../../elements/SelectElement';
import InputElement from '../../../elements/InputElement';
import * as userSettings from '../../../scripts/settings/userSettings';
import { loadUserPresets, listUserPresets } from '../../../scripts/settings/webSettings';
import viewContainer from '../../viewContainer';

type IProps = {
    userId: string;
}

const UserPasswordForm: FunctionComponent<IProps> = ({userId}: IProps) => {
    const element = useRef<HTMLDivElement>(null);
	const PASS_PLACEHOLDER = '********';
	
    const loadUser = useCallback(() => {
        const page = element.current;

        if (!page) {
            console.error('Unexpected null reference');
            return;
        }

        window.ApiClient.getUser(userId).then(function (user) {
            Dashboard.getCurrentUser().then(function (loggedInUser: UserDto) {
                if (!user.Policy) {
                    throw new Error('Unexpected null user.Policy');
                }

                if (!user.Configuration) {
                    throw new Error('Unexpected null user.Configuration');
                }

				const txtNewPassword = page.querySelector('#txtNewPassword') as HTMLInputElement;
				const txtNewPasswordConfirm = page.querySelector('#txtNewPasswordConfirm') as HTMLInputElement;
				txtNewPassword.value = '';
				txtNewPasswordConfirm.value = '';
				
                if (user.HasConfiguredPassword) {
					txtNewPassword.placeholder = PASS_PLACEHOLDER;
					txtNewPasswordConfirm.placeholder = PASS_PLACEHOLDER;
                    (page.querySelector('#btnResetPassword') as HTMLDivElement).classList.remove('hide');
                } else {
					txtNewPassword.removeAttribute('placeholder');
					txtNewPasswordConfirm.removeAttribute('placeholder');
                    (page.querySelector('#btnResetPassword') as HTMLDivElement).classList.add('hide');
                }

                if (loggedInUser?.Policy?.IsAdministrator || user.Policy.EnableUserPreferenceAccess) {
                    (page.querySelector('.passwordSection') as HTMLDivElement).classList.remove('hide');
                } else {
                    (page.querySelector('.passwordSection') as HTMLDivElement).classList.add('hide');
                }

            });
        });
    }, [userId]);

    useEffect(() => {
        const page = element.current;

        if (!page) {
            console.error('Unexpected null reference');
            return;
        }

        loadUser();

		const onPresetChange = (e: Event) => {
			const target = (e.target as HTMLInputElement);
			const x = loadUserPresets(target.value);
			const pnode = target?.parentNode?.parentNode?.querySelector('.fieldDescription');
			if (pnode)
				pnode.innerHTML = globalize.translate(x?.description || "");
		};
		
        const onSubmit = (e: Event) => {
            if ((page.querySelector('#txtNewPassword') as HTMLInputElement).value != (page.querySelector('#txtNewPasswordConfirm') as HTMLInputElement).value) {
                toast(globalize.translate('PasswordMatchError'));
            } else {
                loading.show();
                savePassword();
            }

            e.preventDefault();
            return false;
        };

        const savePassword = () => {
            const newPassword = (page.querySelector('#txtNewPassword') as HTMLInputElement).value;
			
			// In previous versions, saving a password required knowledge of the one currently set
			// yet resetting it didn't.
			// Since to get there a user has to be authenticated and the server allows it,
			// we don't have to ask a password, we reset and save the new one.
			window.ApiClient.resetUserPassword(userId).then(function () {
				loading.hide();
				window.ApiClient.updateUserPassword(userId, '', newPassword).then(
					function () {
						loading.hide();
						toast(globalize.translate('PasswordSaved'));
						loadUser();
					}, function () {
						loading.hide();
						Dashboard.alert({
							title: globalize.translate('HeaderLoginFailure'),
							message: globalize.translate('MessageInvalidUser')
						});
					}
				);
			});
        };

        const resetPassword = () => {
            const msg = globalize.translate('PasswordResetConfirmation');
            confirm(msg, globalize.translate('ResetPassword')).then(function () {
                loading.show();
                window.ApiClient.resetUserPassword(userId).then(function () {
                    loading.hide();
					toast(globalize.translate('PasswordResetComplete'));
                    loadUser();
                });
            });
        };
		
	    const resetSettings = () => {
            const msg = globalize.translate('SettingsResetConfirmation');
            confirm(msg, globalize.translate('HeaderResetSettings')).then(function () {
                loading.show();
				const userPresets = (page.querySelector('#selectPresets') as HTMLSelectElement).value;
				const resetLocalization = (page.querySelector('.chkResetLocalisation') as HTMLInputElement).checked;
				let _uSettings = userSettings.currentSettings;
				let _uid = _uSettings.getCurrentUserId();
				if (_uid !== userId) {
					// In case an admin is editing this user, 
					// we use a new instance that we bind to the targeted userId.
					_uSettings = new userSettings.UserSettings;
					if (_uSettings) {
						_uid = userId;
						const _ac = window.ApiClient;
						_uSettings.setUserInfo(_uid, _ac).then(() => {
							_uSettings.resetUserInfo(_uid, userPresets, resetLocalization).then(() => {
								loading.hide();
								toast(globalize.translate('SettingsResetComplete'));
								//loadUser();
							});
						});
					}
				} else {
					_uSettings.resetUserInfo(_uid, userPresets, resetLocalization).then(() => {
						if (resetLocalization) {
							globalize.updateCurrentCulture();
							let x = document.querySelector('#myPreferencesMenuPage');
							if (x)
								x.dispatchEvent(new CustomEvent('viewreload', undefined));
							LibraryMenu.updateUserInHeader();
						}
						_uSettings.enableClock(_uSettings.enableClock(undefined, false), false);
						_uSettings.enableWeatherBot(_uSettings.enableWeatherBot(undefined, false), false);
						loading.hide();
						toast(globalize.translate('SettingsResetComplete'));
						//loadUser();
					});
					viewContainer.reset();
				}
				loading.hide();
            });
        };

		(page.querySelector('#selectPresets') as HTMLSelectElement).addEventListener('change', onPresetChange);
		(page.querySelector('#selectPresets') as HTMLSelectElement).dispatchEvent(new CustomEvent('change', undefined));
        (page.querySelector('.updatePasswordForm') as HTMLFormElement).addEventListener('submit', onSubmit);
       
        (page.querySelector('#btnResetPassword') as HTMLButtonElement).addEventListener('click', resetPassword);
		(page.querySelector('#btnResetSettings') as HTMLButtonElement).addEventListener('click', resetSettings);
    }, [loadUser, userId]);

	const optionConfigPresets = () => {
		let content = '';
		const list = listUserPresets();
		if (list) {
			list.sort((a, b) => {
				let fa = a.toLowerCase(),
				fb = b.toLowerCase();
				if (fa < fb) 
					return -1;
				if (fa > fb) 
					return 1;
				return 0;
			});
			for (const x of list) {
				content += `<option value='${x}'>${x}</option>`;
			}
		}
		return content;
	};

    return (
        <div ref={element}>
            <form
                className='updatePasswordForm passwordSection hide'
                style={{margin: '0 auto'}}
            >
				<div className='verticalSection'>
                    <h2 className='sectionTitle'>
                        {globalize.translate('HeaderPassword')}
                    </h2>
                    <div className='inputContainer'>
                        <InputElement
                            type='password'
                            id='txtNewPassword'
                            label='LabelNewPassword'
                            options={'autoComplete="off"'}
                        />
                    </div>
                    <div className='inputContainer'>
                        <InputElement
                            type='password'
                            id='txtNewPasswordConfirm'
                            label='LabelNewPasswordConfirm'
                            options={'autoComplete="off"'}
                        />
                    </div>
                    <br />
                    <div>
                        <ButtonElement
                            type='submit'
                            className='raised button-submit block'
                            title='Save'
                        />
                        <ButtonElement
                            type='button'
                            id='btnResetPassword'
                            className='raised button-cancel block hide'
                            title='ResetPassword'
                        />
                    </div>
                </div>
            </form>
			<br />
            <form
                className='localAccessForm localAccessSection'
                style={{margin: '0 auto'}}
            >
				<div className='verticalSection'>
                    <h2 className='sectionTitle'>
                        {globalize.translate('HeaderResetSettings')}
                    </h2>
                    <div>
						<span className='fieldDescription'>
							{globalize.translate('ResetSettingsHelp')}
						</span>
						&nbsp;
						<u>
							<span className='fieldDescription'>
								{globalize.translate('ResetSettingsHelp2')}
							</span>
						</u>
                    </div>
                    <br />
					<div className='selectContainer'>
						<SelectElement
							id='selectPresets'
							label='LabelUserPresets'
						>
                            {optionConfigPresets()}
                        </SelectElement>
                        <div className='fieldDescription'>
                            {globalize.translate('LabelUserPresetsHelp')}
                        </div>
                    </div>
					<br />
                    <div className='checkboxContainer checkboxContainer-withDescription'>
                        <CheckBoxElement
							className='chkResetLocalisation'
                            title='LabelResetLocalisation'
                        />
                        <div className='fieldDescription checkboxFieldDescription'>
                            {globalize.translate('LabelResetLocalisationHelp')}
                        </div>
                    </div>
					<br />
                    <div>
                        <ButtonElement
                            type='button'
                            id='btnResetSettings'
                            className='raised button-cancel block'
                            title='ButtonResetSettings'
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserPasswordForm;
