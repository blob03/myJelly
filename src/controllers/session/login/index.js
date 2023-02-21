import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { appHost } from '../../../components/apphost';
import appSettings from '../../../scripts/settings/appSettings';
import * as webSettings from '../../../scripts/settings/webSettings';
import dom from '../../../scripts/dom';
import loading from '../../../components/loading/loading';
import layoutManager from '../../../components/layoutManager';
import libraryMenu from '../../../scripts/libraryMenu';
import browser from '../../../scripts/browser';
import globalize from '../../../scripts/globalize';
import '../../../components/cardbuilder/card.scss';
import '../../../elements/emby-checkbox/emby-checkbox';
import Dashboard from '../../../utils/dashboard';
import ServerConnections from '../../../components/ServerConnections';
import { showNextBackdrop, setBackdropThemeImage, setBackdropTransparency, pauseBackdrop, setBackdrops, startRotation, setBackdropContrast } from '../../../components/backdrop/backdrop';
import toast from '../../../components/toast/toast';
import dialogHelper from '../../../components/dialogHelper/dialogHelper';
import baseAlert from '../../../components/alert';
import cardBuilder from '../../../components/cardbuilder/cardBuilder';
import settingsHelper from '../../../components/settingshelper';
import cultures from '../../../scripts/cultures';
import * as userSettings from '../../../scripts/settings/userSettings';
import { formatDistanceToNow } from 'date-fns';
import { getLocaleWithSuffix } from '../../../utils/dateFnsLocale';
import { showBackdrop } from '../../../scripts/autoBackdrops';
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
				// Refresh the login page to update accounts indicators, QC availability, etc...
				page.dispatchEvent(new CustomEvent('viewshow', {}));
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
			if (_QCinterval) {
				clearInterval(_QCinterval);
				_QCinterval = null;
			}
			// Close the QuickConnect dialog
			const dlg = document.getElementById('quickConnectAlert');
			if (dlg)
				dialogHelper.close(dlg);

			const result = await apiClient.quickConnect(data.Secret);
			onLoginSuccessful(result.User.Id, result.AccessToken, apiClient);
		}, function (e) {
			loading.hide();
			if (_QCinterval) {
				clearInterval(_QCinterval);
				_QCinterval = null;
			}
			// Close the QuickConnect dialog
			const dlg = document.getElementById('quickConnectAlert');
			if (dlg)
				dialogHelper.close(dlg);

			Dashboard.alert({
				dialogOptions: { enableHistory: false },
				message: globalize.translate('QuickConnectDeactivated'),
				title: globalize.translate('HeaderError'),
				callback: () => {
					// Refresh the login page to update accounts indicators, QC availability, etc...
					view.dispatchEvent(new CustomEvent('viewshow', {}));
					view.querySelector('#btnQuick').focus();
				}
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
				dialogOptions: { enableHistory: false, id: 'quickConnectAlert', size: 'fullscreen' },
				title: globalize.translate('QuickConnect'),
				message: globalize.translate('QuickConnectAuthorizeCode', json.Code),
				buttonTitle: 'ButtonCancel',
				buttonClass: 'btnCancel cancel', 
				callback: () => {
					if (_QCinterval) {
						clearInterval(_QCinterval);
						_QCinterval = null;
					}
					loading.hide();
					toast(globalize.translate('QuickConnectCancelCode', json.Code));
					// Refresh the login page to update accounts indicators, QC availability, etc...
					view.dispatchEvent(new CustomEvent('viewshow', {}));
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
		
		if (layoutManager.tv) {
			context.querySelector('#divUsers').classList.remove('itemsContainer');
			context.querySelector('#divUsers').classList.add('itemsContainer-tv');
		}
		
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			
			// If we are connecting from a remote network but
			// this user is only allowed logging from local networks 
			// just skip it.
			if (user?.Policy?.EnableRemoteAccess === false && !inLocalNet)
				continue;

			let haspw = false;
			if (user?.HasPassword === true) {
				if (user?.Configuration.EnableLocalPassword === true && inLocalNet === true) {
					if (user?.HasConfiguredEasyPassword === true)
						haspw = true;
				} else
					haspw = true;
			}
			
			// TODO move card creation code to Card component
			let cssClass = 'card squareCard scalableCard squareCard-scalable';

			if (layoutManager.tv) {
				cssClass += ' show-focus';
				if (enableFocusTransform) {
					cssClass += ' show-animation';
				}
			}

			let cardBoxCssClass = 'cardBox cardBox-bottompadded';
			if (webSettings.loginVisualCardBox() === true)
				cardBoxCssClass += ' visualCardBox';
			html += '<button type="button" class="' + cssClass + '">';
			html += '<div class="' + cardBoxCssClass + '">';
			html += '<div style="display: flex;flex-direction: row;justify-content: space-between;height: 1.3em;padding: .2em .6em;">';
			
			if (webSettings.loginAuth() === true) {
				if (haspw === true) {
					if (user?.Configuration.EnableLocalPassword === true && inLocalNet === true) {
						// If the 'EnableLocalPassword' option is set and no 'Easy' password has been configured,
						// then access is granted without a password, from a local network only.
						html += '<div class="countIndicator" style="border-radius: 0;background: none;box-shadow: none">';
						html += '<span class="material-icons cardImageIcon pin" title="' + globalize.translate('HeaderEasyPinCode') + '" style="color: #afb2bd;font-size: 2.5em;"></span>';
						html += '</div>';
					} else {
						html += '<div class="countIndicator" style="border-radius: 0;background: none;box-shadow: none">';
						html += '<span class="material-icons cardImageIcon password" title="' + globalize.translate('HeaderPassword') + '"style="color: #afb2bd;font-size: 1.7em;"></span>';
						html += '</div>';
					}
				}
			}
			if (webSettings.loginRole() === true) {
				if (user?.Policy?.IsAdministrator === true) {
					html += '<div class="countIndicator" style="background: none;box-shadow: none">';
					html += '<span class="material-icons cardImageIcon local_police" title="' + globalize.translate('HeaderAdmin') + '"style="color: #afb2bd;font-size: 2em;"></span>';
					html += '</div>';
				}
			}
			html += '</div>';
			html += '<div class="cardScalable">';
			html += '<div class="cardPadder cardPadder-square"></div>';
			
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

			if (webSettings.loginAttemptLeft() === true) {
				if (user?.Policy?.InvalidLoginAttemptCount > 0 && user?.Policy?.LoginAttemptsBeforeLockout > 0) {
					if (haspw === true && user?.Policy?.LoginAttemptsBeforeLockout > 0) {
						let attemptLeft = user.Policy.LoginAttemptsBeforeLockout - user.Policy.InvalidLoginAttemptCount;
						if (attemptLeft <= 0)
							attemptLeft = 1;
						html += '<div class="countIndicator" style="position: absolute;top: 5px;right: 5px;opacity: .6;background: #6d7075;font-size: 70%">';
						
						html += '<span class="material-icons cardImageIcon face" style="background: none;position: absolute;z-index: 99;font-size: 3.2em;color: #000;"></span>';
						html += '<span class="material-icons cardImageIcon block" style="color: #bebcbc;background: none;z-index: 99;"></span>';
						html += '<span style="color: #fff;font-weight: 600;font-size: 150%;position: absolute;z-index: 99;">';
						html += attemptLeft;
						html += '</span>';
						html += '</div>';
					}
				}
			}
			
			html += '</div>';
			html += '</div>';
			html += '<div class="cardFooter visualCardBox-cardFooter">';
			
			if (webSettings.loginShowName() === true) {
				html += '<div class="cardText singleCardText cardTextCentered">' + user.Name + '</div>';
			}
			
			if (webSettings.loginLastSeen() === true) {
				const lastSeen = getLastSeenText(user.LastActivityDate);
				html += '<div className="cardText cardText-secondary">'
				html += '<span style="font-size: .6em;overflow: hidden;white-space: nowrap;opacity: 70%">' + (lastSeen != '' ? lastSeen : '') + '</span>';
				html += '</div>';
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
		const apiClient = getApiClient();
		if (!apiClient) {
			loading.hide();
			return;
		}
		
		if (webSettings.loginClock() === true) {
			userSettings.placeClock(webSettings.loginClockPos(), true);
			userSettings.setClockFormat(webSettings.loginClockFormat(), true);
		}

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
		
		function setDisplayFontSize(val) {
			document.body.style.fontSize = 1 + (val/100) + "rem"; 
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
                } else if (haspw === 'false') {
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
		view.querySelector('#btnQuick').addEventListener('click', function () {
			if (apiClient)
				authenticateQuickConnect(view, apiClient);
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
				const serverId = apiClient.serverId();
				const rnd = Math.floor(Math.random() * 1000000);
				Dashboard.navigate('login.html?serverid=' + serverId + '&_cb=' + rnd, false)
			});
		});

		view.querySelector('#visualHeader').classList.toggle('hide', !webSettings.loginVisualHeader());
		view.querySelector('#manualHeader').classList.toggle('hide', !webSettings.loginManualHeader());
		view.querySelector('.btnSelectServer').classList.toggle('hide', !appHost.supports('multiserver'));
		view.querySelector('#btnSelectServer').classList.toggle('hide', !webSettings.serverSelection());

		apiClient.getJSON(apiClient.getUrl('Branding/Configuration')).then(function (options) {
			const loginDisclaimer = view.querySelector('.loginDisclaimer');
			loginDisclaimer.innerHTML = DOMPurify.sanitize(marked(options.LoginDisclaimer || ''));
			for (const elem of loginDisclaimer.querySelectorAll('a')) {
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
		
		const pinIcon = document.getElementById('pin');
		if (pinIcon)
			userSettings.togglePin(false, webSettings.pinStatus()); 
		
		const nightmode = webSettings.nightModeStatus();
		appSettings.enableNightMode(nightmode);
		userSettings.toggleNightMode({toggle: false, newval: nightmode});
				
		userSettings.enableBackdrops("Theme");
		userSettings.backdropDelay(webSettings.loginBackdropsRotationDelay());
		setBackdropContrast(webSettings.loginBackdropsContrast());
		
        view.addEventListener('viewshow', function () {
            libraryMenu.setTransparentMenu(true);
			
			if (webSettings.loginBackdrops() === true) {
				setTimeout(() => {
					setBackdropThemeImage(webSettings.loginBackdrop());
					if (webSettings.loginBackdropsRotation() === true)
						startRotation();
				}, 500);
			}
			if (layoutManager.tv) 
				setDisplayFontSize(webSettings.loginDisplayFontSize());
		
			view.querySelector('#manualServerName').innerHTML = apiClient._serverInfo.Name;
			view.querySelector('#visualServerName').innerHTML = apiClient._serverInfo.Name;
			
			// Check the availability of QuickConnect on the remote.
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
			// Try to get fresh Endpoint Info. This will work with a patched server.
			// If that fails, we simply assume that we are inside a local network.
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
				});
			});
        });
        view.addEventListener('viewhide', function () {
            libraryMenu.setTransparentMenu(false);
        });
    }

/* eslint-enable indent */
