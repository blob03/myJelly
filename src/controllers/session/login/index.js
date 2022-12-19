import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { appHost } from '../../../components/apphost';
import appSettings from '../../../scripts/settings/appSettings';
import * as webSettings from '../../../scripts/settings/webSettings';
import dom from '../../../scripts/dom';
import loading from '../../../components/loading/loading';
import layoutManager from '../../../components/layoutManager';
import libraryMenu from '../../../scripts/libraryMenu';
import { appRouter } from '../../../components/appRouter';
import browser from '../../../scripts/browser';
import globalize from '../../../scripts/globalize';
import '../../../components/cardbuilder/card.scss';
import '../../../elements/emby-checkbox/emby-checkbox';
import Dashboard from '../../../utils/dashboard';
import ServerConnections from '../../../components/ServerConnections';
import toast from '../../../components/toast/toast';
import dialogHelper from '../../../components/dialogHelper/dialogHelper';
import baseAlert from '../../../components/alert';
import cardBuilder from '../../../components/cardbuilder/cardBuilder';
import settingsHelper from '../../../components/settingshelper';
import cultures from '../../../scripts/cultures';
import * as userSettings from '../../../scripts/settings/userSettings';
import { formatDistanceToNow } from 'date-fns';
import { getLocaleWithSuffix } from '../../../utils/dateFnsLocale';
import './login.scss';

/* eslint-disable indent */

    const enableFocusTransform = !browser.slow && !browser.edge;

    function authenticateUserByName(page, apiClient, username, password) {
        loading.show();
        apiClient.authenticateUserByName(username, password).then(function (result) {
            const user = result.User;
            loading.hide();
            onLoginSuccessful(user.Id, result.AccessToken, apiClient);
        }, function (response) {
            page.querySelector('#txtManualPassword').value = '';
            loading.hide();

            const UnauthorizedOrForbidden = [401, 403];
            if (UnauthorizedOrForbidden.includes(response.status)) {
                const messageKey = response.status === 401 ? 'MessageInvalidUser' : 'MessageUnauthorizedUser';
                toast(globalize.translate(messageKey));
            } else {
                Dashboard.alert({
                    message: globalize.translate('MessageUnableToConnectToServer'),
                    title: globalize.translate('HeaderConnectionFailure')
                });
            }
        });
    }
	
	let _QCinterval = null;
	
	function QCAuth(apiClient, view, url) {
		apiClient.getJSON(url).then(async function(data) {
			if (!data.Authenticated) {
				return;
			}
			loading.hide();
			clearInterval(_QCinterval);

			// Close the QuickConnect dialog
			const dlg = document.getElementById('quickConnectAlert');
			if (dlg)
				dialogHelper.close(dlg);

			const result = await apiClient.quickConnect(data.Secret);
			onLoginSuccessful(result.User.Id, result.AccessToken, apiClient);
		}, function (e) {
			loading.hide();
			clearInterval(_QCinterval);

			// Close the QuickConnect dialog
			const dlg = document.getElementById('quickConnectAlert');
			if (dlg)
				dialogHelper.close(dlg);

			Dashboard.alert({
				dialogOptions: { enableHistory: false },
				message: globalize.translate('QuickConnectDeactivated'),
				title: globalize.translate('HeaderError'),
				callback: () => { view.querySelector('#btnQuick').focus(); }
			});

			console.error('Unable to login with quick connect', e);
		});
	}

    function authenticateQuickConnect(view, apiClient) {
        const URL_QC_INITIATE = apiClient.getUrl('/QuickConnect/Initiate');
		
        apiClient.getJSON(URL_QC_INITIATE).then(function (json) {
            if (!json.Secret || !json.Code) {
                console.error('Malformed quick connect response', json);
                return false;
            }
			
			const URL_QC_CONNECT = apiClient.getUrl('/QuickConnect/Connect?Secret=' + json.Secret);
			QCAuth(apiClient, view, URL_QC_CONNECT);
            _QCinterval = setInterval( QCAuth , 5000, apiClient, view, URL_QC_CONNECT);
			
			Dashboard.alert({
				dialogOptions: { enableHistory: false, id: 'quickConnectAlert' },
				title: globalize.translate('QuickConnect'),
				message: globalize.translate('QuickConnectAuthorizeCode', json.Code),
				buttonTitle: 'ButtonCancel',
				buttonClass: 'btnCancel cancel', 
				callback: () => {
					if (_QCinterval)
						clearInterval(_QCinterval);
					loading.hide();
					toast(globalize.translate('QuickConnectCancelCode', json.Code));
					view.querySelector('#btnQuick').focus();
				}
			});
			
			loading.show();
            return false;
        }).catch((e) => {
            Dashboard.alert({
				dialogOptions: { enableHistory: false },
                message: globalize.translate('QuickConnectNotActive'),
                title: globalize.translate('HeaderError'),
				callback: () => { view.querySelector('#btnQuick').focus(); }
            });
			
            console.error('Quick connect error: ', e);
            return false;
        });
    }

    function onLoginSuccessful(id, accessToken, apiClient) {
        Dashboard.onServerChanged(id, accessToken, apiClient);
		Dashboard.navigate('home.html');
    }

    function showManualForm(context, showCancel, focusPassword) {
        context.querySelector('.chkRememberLogin').checked = appSettings.enableAutoLogin();
        context.querySelector('.manualLoginForm').classList.remove('hide');
        context.querySelector('.visualLoginForm').classList.add('hide');
        context.querySelector('.btnManual').classList.add('hide');

		if (focusPassword)
			context.querySelector('#txtManualPassword').focus();
		else
			context.querySelector('#txtManualName').focus();

		if (showCancel)
			context.querySelector('.btnCancel').classList.remove('hide');
		else
			context.querySelector('.btnCancel').classList.add('hide');
    }

	function getLastSeenText(lastActivityDate) {
		if (lastActivityDate) {
			return formatDistanceToNow(Date.parse(lastActivityDate), getLocaleWithSuffix());
		}
		return '';
	};

    function loadUserList(context, apiClient, users, inLocalNet) {
		let html = '';
		
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			
			// If we are connecting from a remote network but
			// this user is only allowed logging from local networks 
			// just skip it.
			if (user?.Policy?.EnableRemoteAccess === false && !inLocalNet)
				continue;
			
			// TODO move card creation code to Card component
			let cssClass = 'card squareCard scalableCard squareCard-scalable';

			if (layoutManager.tv) {
				cssClass += ' show-focus';
				if (enableFocusTransform) {
					cssClass += ' show-animation';
				}
			}

			const cardBoxCssClass = 'cardBox cardBox-bottompadded';
			html += '<button type="button" class="' + cssClass + '">';
			html += '<div class="' + cardBoxCssClass + '">';
			html += '<div class="cardScalable">';
			html += '<div class="cardPadder cardPadder-square"></div>';
			let haspw = false;
			if (user?.HasPassword === true) {
				if (user?.Configuration.EnableLocalPassword === true && inLocalNet === true) {
					if (user?.HasConfiguredEasyPassword === true)
						haspw = true;
				} else
					haspw = true;
			}

			html += `<div class="cardContent" data-haspw="${haspw}" data-username="${user.Name}" data-userid="${user.Id}">`;
			let imgUrl;

			if (user.PrimaryImageTag && user.Id) {
				imgUrl = apiClient.getUserImageUrl(user.Id, {
					width: 300,
					tag: user.PrimaryImageTag,
					type: 'Primary'
				});

				html += '<div class="cardImageContainer coveredImage" style="background-image:url(\'' + imgUrl + "');\"></div>";
			} else {
				html += `<div class="cardImage flex align-items-center justify-content-center ${cardBuilder.getDefaultBackgroundClass()}">`;
				html += '<span class="material-icons cardImageIcon person"></span>';
				html += '</div>';
			}

			html += '</div>';
			html += '<div class="cardIndicators" style="top: .125em !important;">';
			
			if (webSettings.loginAuth()) {
				if (user?.HasPassword === true) {
					if (user?.Configuration.EnableLocalPassword === true && inLocalNet === true) {
						// If the 'EnableLocalPassword' option is set and no 'Easy' password has been configured,
						// access is granted without a password, from the local network.
						if (user?.HasConfiguredEasyPassword === true) {
							html += '<div class="countIndicator indicator" style="height: 1.5em;width: 1.5em">';
							html += '<span class="material-icons cardImageIcon pin" style="font-size: 1em;color: #202020;text-shadow: none;"></span>';
							html += '</div>';
						}
					} else {
						html += '<div class="countIndicator indicator" style="height: 1.5em;width: 1.5em">';
						html += '<span class="material-icons cardImageIcon password" style="font-size: 1em;color: #202020;text-shadow: none;"></span>';
						html += '</div>';
					}
				}
			}
			
			if (webSettings.loginRole()) {
				if (user?.Policy?.IsAdministrator === true) {
					html += '<div class="countIndicator indicator" style="height: 1.5em;width: 1.5em">';
					html += '<span class="material-icons cardImageIcon local_police" style="font-size: 1em;color: #202020;text-shadow: none;">';
					html += '</span>';
					html += '</div>';
				}
			}
			
			html += '</div>';
			html += '</div>';
			html += '<div class="cardFooter visualCardBox-cardFooter">';
			html += '<div class="cardText singleCardText cardTextCentered">' + user.Name + '</div>';
			
			if (webSettings.loginLastSeen() === true) {
				const lastSeen = getLastSeenText(user.LastActivityDate);
				html += '<div className="cardText cardText-secondary"><span style="font-size: .5em;overflow: hidden;white-space: nowrap;opacity: 70%">' + (lastSeen != '' ? lastSeen : '') + '</span></div>';
			}
			
			html += '</div>';
			html += '</div>';
			html += '</button>';
		}

		context.querySelector('#divUsers').innerHTML = html;
    }

    export default function (view, params) {
		// If we are connecting an unpatched server, it's best to assume we are inside a local Net.
		let inLocalNet = true;
		
        function getApiClient() {
            const serverId = params? params.serverid: null;
            if (serverId) {
                return ServerConnections.getOrCreateApiClient(serverId);
            }
            return ServerConnections.currentApiClient();
        }

        function showVisualForm() {
            view.querySelector('.visualLoginForm').classList.remove('hide');
            view.querySelector('.manualLoginForm').classList.add('hide');
            view.querySelector('.btnManual').classList.remove('hide');

            import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
                autoFocuser.autoFocus(view);
            });
        }

        view.querySelector('#divUsers').addEventListener('click', function (e) {
            const card = dom.parentWithClass(e.target, 'card');
            const cardContent = card ? card.querySelector('.cardContent') : null;
            if (cardContent) {
                const id = cardContent.getAttribute('data-userid');
                const name = cardContent.getAttribute('data-username');
                const haspw = cardContent.getAttribute('data-haspw');

                if (id === 'manual') {
                    view.querySelector('#txtManualName').value = '';
                    showManualForm(view, true);
                } else if (haspw == 'false') {
					const apiClient = getApiClient();
					if (apiClient)
						authenticateUserByName(view, apiClient, name, '');
                } else {
                    view.querySelector('#txtManualName').value = name;
                    view.querySelector('#txtManualPassword').value = '';
                    showManualForm(view, true, true);
                }
            }
        });
        view.querySelector('.manualLoginForm').addEventListener('submit', function (e) {
			appSettings.enableAutoLogin(view.querySelector('.chkRememberLogin').checked);
			const apiClient = getApiClient();
			if (apiClient)
				authenticateUserByName(view, apiClient, view.querySelector('#txtManualName').value, view.querySelector('#txtManualPassword').value);
			e.preventDefault();
			return false;
        });
        view.querySelector('.btnCancel').addEventListener('click', showVisualForm);

        view.querySelector('.btnManual').addEventListener('click', function () {
            view.querySelector('#txtManualName').value = '';
            showManualForm(view, true);
        });
        view.querySelector('.btnSelectServer').addEventListener('click', function () {
            Dashboard.selectServer();
        });
		view.querySelector('.btnForgotPassword').addEventListener('click', function () {
			Dashboard.navigate('forgotpassword.html', true);
		});
		
		const defaultLang = globalize.getDefaultCulture().ccode;
		const lang = globalize.getCurrentLocale();
		const allCultures = cultures.getDictionaries();
		const selectLanguage = view.querySelector('#selectLanguage');
		
		settingsHelper.populateDictionaries(selectLanguage, allCultures, "displayNativeName", lang);
		selectLanguage.addEventListener('change', (x) => {
			const lang = x.target.value || defaultLang;
			globalize.getCoreDictionary(lang).then(() => {
				userSettings.language(lang);
				appRouter.reload();
			});
		});

		view.querySelector('#visualHeader').classList.toggle('hide', !webSettings.loginVisualHeader());
		view.querySelector('#manualHeader').classList.toggle('hide', !webSettings.loginManualHeader());
		view.querySelector('.btnSelectServer').classList.toggle('hide', !appHost.supports('multiserver'));
		
		const apiClient = getApiClient();
		if (!apiClient) {
			loading.hide();
			return;
		}
		
		if (webSettings.quickConnect() === true) {
			apiClient.getQuickConnect('Enabled').then(enabled => {
				view.querySelector('#btnQuick').classList.toggle('hide', !enabled);
			}).catch(() => {
				view.querySelector('#btnQuick').classList.add('hide');
				console.debug('Failed to get QuickConnect status');
			});
		}

		// Flush the last EndpointInfo.
		apiClient.onNetworkChange();
		
		apiClient.getEndpointInfo().then((endpoint) => {
			inLocalNet = endpoint?.IsInNetwork === true || endpoint?.IsLocal === true;
		}).catch(() => {inLocalNet = true;}).finally(() => {
			// Initiating a password recovery from a remote location is forbidden per server policy.
			// In this case, we have no valid reason to show the link.
			view.querySelector('.btnForgotPassword').classList.toggle('hide', webSettings.passRecovery() !== true || !inLocalNet);
		
			apiClient.getPublicUsers().then(function (users) {
				if (webSettings.view() === "visual" && users && users.length) {
					showVisualForm();
					loadUserList(view, apiClient, users, inLocalNet);
				} else {
					view.querySelector('#txtManualName').value = '';
					showManualForm(view, false, false);
				}
			}).catch().finally( () => {
				apiClient.getJSON(apiClient.getUrl('Branding/Configuration')).then(function (options) {
					const disclaimer = view.querySelector('.disclaimer');
					disclaimer.innerHTML = DOMPurify.sanitize(marked(options.LoginDisclaimer || ''));
					for (const elem of disclaimer.querySelectorAll('a')) {
						elem.rel = 'noopener noreferrer';
						elem.target = '_blank';
						elem.classList.add('button-link');
						elem.setAttribute('is', 'emby-linkbutton');

						if (layoutManager.tv) {
							// Disable links navigation on TV
							elem.tabIndex = -1;
						}
					}
				});
			});
		});
        view.addEventListener('viewshow', function () {
            libraryMenu.setTransparentMenu(true);
        });
        view.addEventListener('viewhide', function () {
            libraryMenu.setTransparentMenu(false);
        });
	
		view.querySelector('#btnQuick').addEventListener('click', function () {
			const apiClient = getApiClient();
			if (apiClient)
				authenticateQuickConnect(view, apiClient);
		});
    }

/* eslint-enable indent */
