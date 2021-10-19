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
			themes.sort((a, b) => {
				let fa = a.name.toLowerCase(),
					fb = b.name.toLowerCase();
				if (fa < fb) 
					return -1;
				if (fa > fb) 
					return 1;
				return 0;
			});
            select.innerHTML += themes.map(t => {
                return `<option value="${t.id}">${t.name}</option>`;
            }).join('');

			select.value = selectedTheme;
			if (selectedTheme === 'Auto' || selectedTheme === 'None')
				return;
			
			// If for some reasons selectedTheme doesn't exist anymore (eg. a recent upgrade)
			// selected value will be set to default theme id as defined by 'config.json'.
		
			skinManager.getThemeStylesheetInfo(selectedTheme).then(function (info) {
				select.value = info.themeId});
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

        selectScreensaver.innerHTML += options.map(o => {
            return `<option value="${o.value}">${o.name}</option>`;
        }).join('');

        selectScreensaver.value = userSettings.screensaver() || 'none';
    }

    function showOrHideMissingEpisodesField(context) {
		if (browser.tizen) {
            context.querySelector('.fldDisplayMissingEpisodes').classList.add('hide');
            return;
        }
        context.querySelector('.fldDisplayMissingEpisodes').classList.remove('hide');
    }
	
	function onScreensaverTimeChange(e) {
		const pnode = e.target.parentNode.parentNode;
		if (pnode) 
			pnode.querySelector('.fieldDescription').innerHTML = e.target.value + " min.";
	}

    function loadForm(context, user, userSettings) {
		if (appHost.supports('displaymode')) {
			context.querySelector('.selectLayout').value = layoutManager.getSavedLayout() || '';
            context.querySelector('.fldDisplayMode').classList.remove('hide');
        } else {
            context.querySelector('.fldDisplayMode').classList.add('hide');
        }
		
        if (appHost.supports('displaylanguage')) {
			context.querySelector('#selectLanguage').value = userSettings.language() || '';
            context.querySelector('.languageSection').classList.remove('hide');
        } else {
            context.querySelector('.languageSection').classList.add('hide');
        }

        if (appHost.supports('externallinks')) 
            context.querySelector('.learnHowToContributeContainer').classList.remove('hide');
        else 
            context.querySelector('.learnHowToContributeContainer').classList.add('hide');
		
		const dashboardthemeNodes = context.querySelectorAll(".selectDashboardThemeContainer");
		dashboardthemeNodes.forEach( function(userItem) {
			userItem.classList.toggle('hide', !user.Policy.IsAdministrator);});

        if (appHost.supports('screensaver')) {
			loadScreensavers(context, userSettings);
			context.querySelector('.ScreensaverArea').classList.remove('hide');
			
			let sliderScreensaverTime =  context.querySelector('#sliderScreensaverTime');
			sliderScreensaverTime.value = (userSettings.screensaverTime()/60000) || 3;
			sliderScreensaverTime.addEventListener('input', onScreensaverTimeChange);
			sliderScreensaverTime.addEventListener('change', onScreensaverTimeChange);
			let event_change = new Event('change');
			sliderScreensaverTime.dispatchEvent(event_change);
        } else 
            context.querySelector('.ScreensaverArea').classList.add('hide');

        if (datetime.supportsLocalization()) {
			context.querySelector('.selectDateTimeLocale').value = userSettings.dateTimeLocale() || '';
            context.querySelector('.fldDateTimeLocale').classList.remove('hide');
        } else {
            context.querySelector('.fldDateTimeLocale').classList.add('hide');
        }
		
		if (browser.web0s) {
            context.querySelector('.fldThemeSong').classList.remove('hide');
        } else if (browser.tizen) {
            context.querySelector('.fldThemeSong').classList.add('hide');
            context.querySelector('.fldThemeVideo').classList.add('hide');
        } else {
			context.querySelector('.fldThemeVideo').classList.remove('hide');
		}
		
        fillThemes(context.querySelector('#selectTheme'), userSettings.theme());
		context.querySelector('#selectTheme').addEventListener('change', function() {  skinManager.setTheme(this.value); });
		
        fillThemes(context.querySelector('#selectDashboardTheme'), userSettings.dashboardTheme());

        context.querySelector('.chkDisplayMissingEpisodes').checked = user.Configuration.DisplayMissingEpisodes || false;
        context.querySelector('#chkThemeSong').checked = userSettings.enableThemeSongs();
        context.querySelector('#chkThemeVideo').checked = userSettings.enableThemeVideos();
		context.querySelector('#chkClock').checked = userSettings.enableClock();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#chkBlurhash').checked = userSettings.enableBlurhash();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
		context.querySelector('#chkUseEpisodeImagesInNextUp').checked = userSettings.useEpisodeImagesInNextUpAndResume();
		context.querySelector('#srcBackdrops').value = userSettings.enableBackdrops() || "Auto";
        context.querySelector('#sliderLibraryPageSize').value = userSettings.libraryPageSize() || 60;
		context.querySelector('#sliderMaxDaysForNextUp').value = userSettings.maxDaysForNextUp() || 30;
		
        showOrHideMissingEpisodesField(context);

        loading.hide();
    }

    function saveUser(instance, context, user, userSettingsInstance, apiClient) {
		let VAL;
        if (appHost.supports('displaylanguage')) {	
			VAL = context.querySelector('#selectLanguage').value;
			const savedLanguage = userSettingsInstance.language();
			if (!savedLanguage || VAL !== savedLanguage) {
				userSettingsInstance.language(VAL);
				instance.needreload = true;
			}
        }

		if (appHost.supports('displaymode')) {
			VAL = context.querySelector('.selectLayout').value;
			if (VAL !== (layoutManager.getSavedLayout() || '')) {
				layoutManager.setLayout(VAL, true);
				instance.needreload = true;
			}
		}
		
		user.Configuration.DisplayMissingEpisodes = context.querySelector('.chkDisplayMissingEpisodes').checked;
		
        userSettingsInstance.dateTimeLocale(context.querySelector('.selectDateTimeLocale').value);
        userSettingsInstance.enableThemeSongs(context.querySelector('#chkThemeSong').checked);
        userSettingsInstance.enableThemeVideos(context.querySelector('#chkThemeVideo').checked);
        userSettingsInstance.theme(context.querySelector('#selectTheme').value);
		userSettingsInstance.dashboardTheme(context.querySelector('#selectDashboardTheme').value);
        userSettingsInstance.screensaver(context.querySelector('.selectScreensaver').value);
		userSettingsInstance.screensaverTime(context.querySelector('#sliderScreensaverTime').value * 60000);
        userSettingsInstance.libraryPageSize(context.querySelector('#sliderLibraryPageSize').value);
		userSettingsInstance.maxDaysForNextUp(context.querySelector('#sliderMaxDaysForNextUp').value);
		userSettingsInstance.enableClock(context.querySelector('#chkClock').checked);
        userSettingsInstance.enableFastFadein(context.querySelector('#chkFadein').checked);
        userSettingsInstance.enableBlurhash(context.querySelector('#chkBlurhash').checked);
		
		VAL = context.querySelector('#srcBackdrops').value;
		if (VAL !== userSettingsInstance.enableBackdrops()) {
			userSettingsInstance.enableBackdrops(VAL);
			if (VAL === "Libraries" || VAL === "Movie" || VAL === "Series") 
				instance.needreload = true;
		}
		
        userSettingsInstance.detailsBanner(context.querySelector('#chkDetailsBanner').checked);
		userSettingsInstance.useEpisodeImagesInNextUpAndResume(context.querySelector('#chkUseEpisodeImagesInNextUp').checked);
     
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
