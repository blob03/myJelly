import browser from '../../scripts/browser';
import layoutManager from '../layoutManager';
import { pluginManager } from '../pluginManager';
import { appHost } from '../apphost';
import focusManager from '../focusManager';
import datetime from '../../scripts/datetime';
import globalize from '../../scripts/globalize';
import loading from '../loading/loading';
import skinManager from '../../scripts/themeManager';
import { Events } from 'jellyfin-apiclient';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../elements/emby-button/emby-button';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './displaySettings.template.html';

/* eslint-disable indent */

    function fillThemes(select, selectedTheme) {
        skinManager.getThemes().then(themes => {
            select.innerHTML = themes.map(t => {
                return `<option value="${t.id}">${t.name}</option>`;
            }).join('');

            // get default theme
            const defaultTheme = themes.find(theme => theme.default);

            // set the current theme
            select.value = selectedTheme || defaultTheme.id;
        });
    }

    function loadScreensavers(context, userSettings) {
        const selectScreensaver = context.querySelector('.selectScreensaver');
        const options = pluginManager.ofType('screensaver').map(plugin => {
            return {
                name: plugin.name,
                value: plugin.id
            };
        });

        options.unshift({
            name: globalize.translate('None'),
            value: 'none'
        });

        selectScreensaver.innerHTML = options.map(o => {
            return `<option value="${o.value}">${o.name}</option>`;
        }).join('');

        selectScreensaver.value = userSettings.screensaver();

        if (!selectScreensaver.value) {
            // TODO: set the default instead of none
            selectScreensaver.value = 'none';
        }
    }

    function showOrHideMissingEpisodesField(context) {
        //if (browser.tizen || browser.web0s) {
		if (browser.tizen) {
            context.querySelector('.fldDisplayMissingEpisodes').classList.add('hide');
            return;
        }
        context.querySelector('.fldDisplayMissingEpisodes').classList.remove('hide');
    }

    function loadForm(context, user, userSettings) {
        if (appHost.supports('displaylanguage')) {
            context.querySelector('.languageSection').classList.remove('hide');
        } else {
            context.querySelector('.languageSection').classList.add('hide');
        }

        if (appHost.supports('displaymode')) {
            context.querySelector('.fldDisplayMode').classList.remove('hide');
        } else {
            context.querySelector('.fldDisplayMode').classList.add('hide');
        }

        if (appHost.supports('externallinks')) {
            context.querySelector('.learnHowToContributeContainer').classList.remove('hide');
        } else {
            context.querySelector('.learnHowToContributeContainer').classList.add('hide');
        }

        context.querySelector('.selectDashboardThemeContainer').classList.toggle('hide', !user.Policy.IsAdministrator);

        if (appHost.supports('screensaver')) {
            context.querySelector('.selectScreensaverContainer').classList.remove('hide');
        } else {
            context.querySelector('.selectScreensaverContainer').classList.add('hide');
        }

        if (datetime.supportsLocalization()) {
            context.querySelector('.fldDateTimeLocale').classList.remove('hide');
        } else {
            context.querySelector('.fldDateTimeLocale').classList.add('hide');
        }

        if (!browser.tizen && !browser.web0s) {
			//others
			context.querySelector('.fldThemeVideo').classList.remove('hide');
		} else if (!browser.tizen) {
			//webos
            context.querySelector('.fldBackdrops').classList.remove('hide');
            context.querySelector('.fldThemeSong').classList.remove('hide');
        } else {
			//tizen
            context.querySelector('.fldBackdrops').classList.add('hide');
            context.querySelector('.fldThemeSong').classList.add('hide');
            context.querySelector('.fldThemeVideo').classList.add('hide');
        }

        fillThemes(context.querySelector('#selectTheme'), userSettings.theme());
        fillThemes(context.querySelector('#selectDashboardTheme'), userSettings.dashboardTheme());

        loadScreensavers(context, userSettings);

        context.querySelector('.chkDisplayMissingEpisodes').checked = user.Configuration.DisplayMissingEpisodes || false;
        context.querySelector('#chkThemeSong').checked = userSettings.enableThemeSongs();
        context.querySelector('#chkThemeVideo').checked = userSettings.enableThemeVideos();
		context.querySelector('#chkClock').checked = userSettings.enableClock();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#chkBlurhash').checked = userSettings.enableBlurhash();
        context.querySelector('#chkBackdrops').checked = userSettings.enableBackdrops();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
        context.querySelector('.selectDateTimeLocale').value = userSettings.dateTimeLocale() || '';
		if (appHost.supports('displaylanguage')) 
			context.querySelector('#selectLanguage').value = userSettings.language() || '';
		if (appHost.supports('displaymode')) 
			context.querySelector('.selectLayout').value = layoutManager.getSavedLayout() || '';
		
        let sliderLibraryPageSize = context.querySelector('#sliderLibraryPageSize');
        sliderLibraryPageSize.value = userSettings.libraryPageSize() || 32;
		
        showOrHideMissingEpisodesField(context);

        loading.hide();
    }

    function saveUser(instance, context, user, userSettingsInstance, apiClient) {
        user.Configuration.DisplayMissingEpisodes = context.querySelector('.chkDisplayMissingEpisodes').checked;
		
        if (appHost.supports('displaylanguage')) {	
			const VAL = context.querySelector('#selectLanguage').value;
			if (userSettingsInstance.language() !== VAL) {
				userSettingsInstance.language(VAL);
				instance.needreload = true;
			}
        }

		if (appHost.supports('displaymode')) {
			const VAL = context.querySelector('.selectLayout').value;
			if (layoutManager.getSavedLayout() !== VAL) {
				layoutManager.setLayout(VAL);
				instance.needreload = true;
			}
		}
		
        userSettingsInstance.dateTimeLocale(context.querySelector('.selectDateTimeLocale').value);
        userSettingsInstance.enableThemeSongs(context.querySelector('#chkThemeSong').checked);
        userSettingsInstance.enableThemeVideos(context.querySelector('#chkThemeVideo').checked);
        userSettingsInstance.theme(context.querySelector('#selectTheme').value);
        userSettingsInstance.dashboardTheme(context.querySelector('#selectDashboardTheme').value);
        userSettingsInstance.screensaver(context.querySelector('.selectScreensaver').value);
        userSettingsInstance.libraryPageSize(context.querySelector('#sliderLibraryPageSize').value);
		userSettingsInstance.enableClock(context.querySelector('#chkClock').checked);
        userSettingsInstance.enableFastFadein(context.querySelector('#chkFadein').checked);
        userSettingsInstance.enableBlurhash(context.querySelector('#chkBlurhash').checked);
        userSettingsInstance.enableBackdrops(context.querySelector('#chkBackdrops').checked);
        userSettingsInstance.detailsBanner(context.querySelector('#chkDetailsBanner').checked);

        if (user.Id === apiClient.getCurrentUserId()) 
            skinManager.setTheme(userSettingsInstance.theme());
        
        return apiClient.updateUserConfiguration(user.Id, user.Configuration);
    }

    function save(instance, context, userId, userSettings, apiClient, enableSaveConfirmation) {
        loading.show();

        apiClient.getUser(userId).then(user => {
            saveUser(instance, context, user, userSettings, apiClient).then(() => {
                loading.hide();
                if (enableSaveConfirmation) {
                    toast(globalize.translate('SettingsSaved'));
                }
				Events.trigger(instance, 'saved');
				// Allow enough time to save the parameters before reloading the page.
				if (instance.needreload === true)
					setTimeout(() => { window.location.reload(false) }, 1000);
            }, () => {
                loading.hide();
            });
        });
    }

    function onSubmit(e) {
        const self = this;
        const apiClient = ServerConnections.getApiClient(self.options.serverId);
        const userId = self.options.userId;
        const userSettings = self.options.userSettings;

        userSettings.setUserInfo(userId, apiClient).then(() => {
            const enableSaveConfirmation = self.options.enableSaveConfirmation;
            save(self, self.options.element, userId, userSettings, apiClient, enableSaveConfirmation);
        });

        // Disable default form submission
        if (e) {
            e.preventDefault();
        }
        return false;
    }

    function embed(options, self) {
        options.element.innerHTML = globalize.translateHtml(template, 'core');
        options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
        if (options.enableSaveButton) {
            options.element.querySelector('.btnSave').classList.remove('hide');
        }
        self.loadData(options.autoFocus);
    }

    class DisplaySettings {
        constructor(options) {
            this.options = options;
			this.needreload = false;
            embed(options, this);
        }

        loadData(autoFocus) {
            const self = this;
            const context = self.options.element;

            loading.show();

            const userId = self.options.userId;
            const apiClient = ServerConnections.getApiClient(self.options.serverId);
            const userSettings = self.options.userSettings;

            return apiClient.getUser(userId).then(user => {
                return userSettings.setUserInfo(userId, apiClient).then(() => {
                    self.dataLoaded = true;
                    loadForm(context, user, userSettings);
                    if (autoFocus) {
                        focusManager.autoFocus(context);
                    }
                });
            });
        }

        submit() {
            onSubmit.call(this);
        }

        destroy() {
            this.options = null;
        }
    }

/* eslint-enable indent */
export default DisplaySettings;
