import browser from '../../scripts/browser';
import layoutManager from '../layoutManager';
import { pluginManager } from '../pluginManager';
import { appHost } from '../apphost';
import focusManager from '../focusManager';
import datetime from '../../scripts/datetime';
import globalize from '../../scripts/globalize';
import settingsHelper from '../settingshelper';
import loading from '../loading/loading';
import skinManager from '../../scripts/themeManager';
import { Events } from 'jellyfin-apiclient';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../elements/emby-button/emby-button';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './displaySettings.template.html';
import * as LibraryMenu from '../../scripts/libraryMenu';
import viewManager from '../viewManager/viewManager';
import viewContainer from '../viewContainer';

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
	
	function onDisplayFontSizeChange(e) { 		
		document.body.style.fontSize = 1 + (e.target.value/100) + "rem"; 
		//document.body.style.lineHeight = 1 + (e.target.value/100) + "rem"; 
	}
	
	function displayFontSizeRset() { 		
		document.body.style.fontSize = "1rem";
		//document.body.style.lineHeight = "1rem";
	}

	var savedLayout = '';
	var savedDisplayLanguage = '';
	
    function loadForm(context, user, userSettings, apiClient) {	
		apiClient.getCultures().then(allCultures => {
			// *manually* add 'en-gb' to the list since the server only knows 'en' ('en-us' in reality)
			// AKA the source dictionary.
			allCultures.push({DisplayName: 'English (Great Britain)', TwoLetterISOLanguageName: 'en-gb'});
			allCultures.sort((a, b) => {
				let fa = a.DisplayName.toLowerCase(),
				fb = b.DisplayName.toLowerCase();
				if (fa < fb) 
					return -1;
				if (fa > fb) 
					return 1;
				return 0;
			});
			if (appHost.supports('displaylanguage')) { 
				let selectLanguage = context.querySelector('#selectLanguage');
				savedDisplayLanguage = userSettings.language() || '';
				settingsHelper.populateDictionaries(selectLanguage, allCultures, savedDisplayLanguage);
				context.querySelector('.languageSection').classList.remove('hide');
			} else 
				context.querySelector('.languageSection').classList.add('hide');
			
			if (datetime.supportsLocalization()) { 
				let selectDateTimeLocale = context.querySelector('.selectDateTimeLocale');
				settingsHelper.populateLanguages(selectDateTimeLocale, allCultures, userSettings.dateTimeLocale() || '');
				context.querySelector('.fldDateTimeLocale').classList.remove('hide');
			} else 
				context.querySelector('.fldDateTimeLocale').classList.add('hide');
		});
	
        if (appHost.supports('externallinks')) 
            context.querySelector('.learnHowToContributeContainer').classList.remove('hide');
        else 
            context.querySelector('.learnHowToContributeContainer').classList.add('hide');
		
		const dashboardthemeNodes = context.querySelectorAll(".selectDashboardThemeContainer");
		dashboardthemeNodes.forEach( function(userItem) {
			userItem.classList.toggle('hide', !user.localUser.Policy.IsAdministrator);});

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

        context.querySelector('.chkDisplayMissingEpisodes').checked = user.localUser.Configuration.DisplayMissingEpisodes || false;
        context.querySelector('#chkThemeSong').checked = userSettings.enableThemeSongs();
        context.querySelector('#chkThemeVideo').checked = userSettings.enableThemeVideos();
		context.querySelector('#chkClock').checked = userSettings.enableClock();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#chkBlurhash').checked = userSettings.enableBlurhash();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
		context.querySelector('#chkUseEpisodeImagesInNextUp').checked = userSettings.useEpisodeImagesInNextUpAndResume();
		context.querySelector('#srcBackdrops').value = userSettings.enableBackdrops() || "Auto";
		context.querySelector('#sliderDisplayFontSize').value = userSettings.displayFontSize() || 0;
		savedLayout = context.querySelector('.selectLayout').value = layoutManager.getSavedLayout() || '';
		
		if (browser.web0s || appHost.supports('displaymode')) 	
			context.querySelector('.fldDisplayMode').classList.remove('hide');
        else 
			context.querySelector('.fldDisplayMode').classList.add('hide');
	
		if (layoutManager.tv) {
			if (browser.web0s || appHost.supports('displaymode'))
				context.querySelector('.fldDisplaySeparator').classList.remove('hide');
			context.querySelector('.fldDisplayFontSize').classList.remove('hide');
			
			let event = new Event('change');
			let sliderDisplayFontSize = context.querySelector('#sliderDisplayFontSize');
			sliderDisplayFontSize.addEventListener('change', onDisplayFontSizeChange);
			sliderDisplayFontSize.dispatchEvent(event);
		} else {
			context.querySelector('.fldDisplaySeparator').classList.add('hide');
			context.querySelector('.fldDisplayFontSize').classList.add('hide');
        }
		
        context.querySelector('#sliderLibraryPageSize').value = userSettings.libraryPageSize() || 60;
		context.querySelector('#sliderMaxDaysForNextUp').value = userSettings.maxDaysForNextUp() || 30;
        showOrHideMissingEpisodesField(context);
    }

    function saveUser(instance, context, userSettingsInstance, apiClient, enableSaveConfirmation) {
		let VAL;
		let reload = false;
		const user = instance.currentUser;
		const z = '/mypreferencesdisplay.html?userId=' + user.localUser.Id;		
					
        if (appHost.supports('displaylanguage')) {	
			VAL = context.querySelector('#selectLanguage').value;
			if (VAL !== savedDisplayLanguage) {
				userSettingsInstance.language(VAL);
				reload = true;
			}
        }

		VAL = context.querySelector('.selectLayout').value;
		if (VAL !== savedLayout) {
			layoutManager.setLayout(VAL, true);		
			savedLayout = VAL;
			reload = true;
		}
					
		user.localUser.Configuration.DisplayMissingEpisodes = context.querySelector('.chkDisplayMissingEpisodes').checked;
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
		userSettingsInstance.enableBackdrops(context.querySelector('#srcBackdrops').value);
		
		if (layoutManager.tv) 
			userSettingsInstance.displayFontSize(context.querySelector('#sliderDisplayFontSize').value);
		else
			displayFontSizeRset();
		
        userSettingsInstance.detailsBanner(context.querySelector('#chkDetailsBanner').checked);
		userSettingsInstance.useEpisodeImagesInNextUpAndResume(context.querySelector('#chkUseEpisodeImagesInNextUp').checked);
     
		apiClient.updateUserConfiguration(user.localUser.Id, user.localUser.Configuration).then( () => { 
			userSettingsInstance.commit(); 
			setTimeout(() => { 
				if (reload !== false) {
					embed(instance.options, instance);
					LibraryMenu.setTitle(globalize.translate(instance.title));
					LibraryMenu.updateUserInHeader(user);
				}
				loading.hide();	
				if (enableSaveConfirmation) 
					toast(globalize.translate('SettingsSaved'));}, 2000); 
		});
    }

    function save(instance, context, userSettings, apiClient, enableSaveConfirmation) {
        loading.show();
		saveUser(instance, context, userSettings, apiClient, enableSaveConfirmation);
		Events.trigger(instance, 'saved'); 			
    }

    function onSubmit(e) {
        const self = this;
        const apiClient = ServerConnections.getApiClient(self.options.serverId);
        const userId = self.options.userId;
        const userSettings = self.options.userSettings;

        userSettings.setUserInfo(userId, apiClient).then(() => {
            const enableSaveConfirmation = self.options.enableSaveConfirmation;
            save(self, self.options.element, userSettings, apiClient, enableSaveConfirmation);
        });

        // Disable default form submission
        if (e) 
            e.preventDefault();

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
			this.currentUser = null;
			this.title = 'Display';
            embed(options, this);
        }

        loadData(autoFocus) {
            const self = this;
            const context = self.options.element;
			const userId = self.options.userId;
			const userSettings = self.options.userSettings;
			
            loading.show();

            const apiClient = ServerConnections.getApiClient(self.options.serverId);
            
			return ServerConnections.user(apiClient).then((user) => {
				self.currentUser = user;
                return userSettings.setUserInfo(userId, apiClient).then(() => {
                    self.dataLoaded = true;
                    loadForm(context, user, userSettings, apiClient);
                    if (autoFocus) 
                        focusManager.autoFocus(context);
					loading.hide();
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
