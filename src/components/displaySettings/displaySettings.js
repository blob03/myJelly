import browser from '../../scripts/browser';
import layoutManager from '../layoutManager';
import { pluginManager } from '../pluginManager';
import { appHost } from '../apphost';
import focusManager from '../focusManager';
import datetime from '../../scripts/datetime';
import globalize from '../../scripts/globalize';
import settingsHelper from '../settingshelper';
import cultures from '../../scripts/cultures';
import loading from '../loading/loading';
import skinManager from '../../scripts/themeManager';
import { Events } from 'jellyfin-apiclient';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../elements/emby-button/emby-button';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './displaySettings.template.html';
import templateUserMenu from '../../controllers/user/menu/index.html';
import * as LibraryMenu from '../../scripts/libraryMenu';
import viewManager from '../viewManager/viewManager';
import * as ssmanager from '../../libraries/screensavermanager';
import viewContainer from '../viewContainer';

/* eslint-disable indent */

    function fillThemes(select, selectedTheme) {
        skinManager.getThemes().then( themes => {
			
			let groups = {};
			const dflgroup = "Jellyfin";
			
			themes.forEach( x => {
				let grp = dflgroup;
				if (x.group)
					grp = x.group;
				if (!groups[grp]) 
					groups[grp] = [];
				groups[grp].push(x);
			});
			
			if (!layoutManager.tv) 
				select.innerHTML += '<option disabled>' + globalize.translate('OptionDivider') + '</option>';
			
			let ngroups = Object.keys(groups);
			ngroups.forEach( x => {
				
				let y = document.createElement("optgroup");
				
				if (layoutManager.tv) {
					let w = document.createElement("option");
					w.divider = x;
					select.options.add(w, undefined);
				} else 
					y.label = x;
				
				groups[x].sort((a, b) => {
					let fa = a.name.toLowerCase(),
						fb = b.name.toLowerCase();
					if (fa < fb) 
						return -1;
					if (fa > fb) 
						return 1;
					return 0;
				});
				
				groups[x].forEach( t => {
					let z = document.createElement("option");
					if (t.default)
						z.icon = 'star';
					z.value = t.id;
					z.text = t.name;
					
					if (t.version) {
						if (layoutManager.tv) 		
							z.asideText = "v" + t.version;
						else 
							z.text += "  " + t.version;
					}
					
					if (!layoutManager.tv)
						y.appendChild(z);
					else
						select.options.add(z, undefined); 
				});

				if (!layoutManager.tv)
					select.appendChild(y);
			});
            
			select.value = selectedTheme;
			if (selectedTheme === 'Auto' || selectedTheme === 'None')
				return;
			
			// If for some reasons selectedTheme doesn't exist anymore (eg. theme was renamed/deleted),
			// the value field of the selection will be set to the id of the default theme defined in 'config.json'.
		
			skinManager.getThemeStylesheetInfo(selectedTheme).then(function (info) {
				select.value = info.themeId}); 
        });
    }

	function onClockChange(e) {
		const val = e.target.value;
		
		let clockSettings = document.querySelector('.clockSettings');
		if (clockSettings) {
			if (val != 0)
				clockSettings.classList.remove('hide');
			else
				clockSettings.classList.add('hide');
		}
	}
	
	function onScreenSaverChange(e) {
		const val = e.target.value;
	    const options = pluginManager.ofType('screensaver').map( plugin => {
            return {
                value: plugin.id,
				description: plugin.description || ''
            };
        });
		let key;
		let sel = options.filter(option => option.value === val);
		
		if (val == 'any')
			key = 'RandomScreensaverHelp';
		else 
			key = sel[0]? sel[0].description || '' : '';
		
		const txt = key? globalize.translate(key) || '&nbsp;' : '&nbsp;';
		
		let pnode = e.target.parentNode;
		if (pnode)	
			pnode.querySelector('.fieldDescription').innerHTML = txt;
		
		pnode = e.target.parentNode.parentNode;
		if (!pnode) return;
		let sliderContainerSettings =  pnode.querySelector('.sliderContainer-settings');
		if (sliderContainerSettings) {
			if (e.target.value === 'none') 
				sliderContainerSettings.classList.add('hide');
			else 
				sliderContainerSettings.classList.remove('hide');
		}
		
		let btnTryIt =  pnode.querySelector('#btnTryIt');
		if (btnTryIt) {
			if (e.target.value === 'none') 
				btnTryIt.classList.add('hide');
			else 
				btnTryIt.classList.remove('hide');
		}
	}
	
	function onScreenSaverTry(e) {
		let pnode = document.querySelector('#selectScreensaver');
		if (!pnode || !pnode.value)
			return;
	
		let currentSS = ssmanager.getScreensaverPluginByName(pnode.value);
		if (currentSS) 
			ssmanager.showScreenSaver(currentSS, true);
	}
	
    function loadScreensavers(select, val) {
        const options = pluginManager.ofType('screensaver').map( plugin => {
            return {
                name: plugin.name,
                value: plugin.id,
				version: plugin.version || '',
				description: plugin.description || '',
				group: plugin.group
            };
        });
		
		let groups = {};
		const dflgroup = "Jellyfin";

		options.forEach( x => {
			let grp = dflgroup;
			if (x.group)
				grp = x.group;
			if (!groups[grp])
				groups[grp] = [];
			groups[grp].push(x);
		});

		let ngroups = Object.keys(groups);
		ngroups.forEach( x => {
			
			let y = document.createElement("optgroup");
			
			if (layoutManager.tv) {
				let w = document.createElement("option");
				w.divider = x;
				select.options.add(w, undefined);
			} else 
				y.label = x;

			groups[x].sort((a, b) => {
				let fa = a.name.toLowerCase(),
				fb = b.name.toLowerCase();
				if (fa < fb) 
					return -1;
				if (fa > fb) 
					return 1;
				return 0;
			});

			groups[x].forEach( t => {
				let z = document.createElement("option");
				z.value = t.value;
				z.text = t.name;

				if (t.version) {
					if (layoutManager.tv) 		
						z.asideText = "v" + t.version;
					else 
						z.text += "  " + t.version;
				}

				select.options.add(z, undefined); 
				if (!layoutManager.tv)
					y.appendChild(z);
				else
					select.options.add(z, undefined); 
			});
			
			if (!layoutManager.tv)
				select.appendChild(y);
		});		
		select.value = val;
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
	
	function isSecure() {
	   return location.protocol == 'https:';
	}

	function findPosition() {
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				document.querySelector('#inputLat').value = Number(position.coords.latitude.toFixed(2));
				document.querySelector('#inputLon').value = Number(position.coords.longitude.toFixed(2));
			});
		} else{
			//alert("Sorry, your browser does not support HTML5 geolocation.");
		}
	}

    function loadForm(context, user, userSettings, apiClient) {	
		let event_change = new Event('change');
		
		let allCultures = cultures.getDictionaries();
	
		if (appHost.supports('displaylanguage')) { 
			let selectLanguage = context.querySelector('#selectLanguage');
			savedDisplayLanguage = userSettings.language() || '';
			settingsHelper.populateDictionaries(selectLanguage, allCultures, "displayNativeName", savedDisplayLanguage);
			selectLanguage.addEventListener('change', function(e) { settingsHelper.showDictionaryInfo(e); });
			selectLanguage.dispatchEvent(event_change);
			context.querySelector('.DisplayLanguageArea').classList.remove('hide');
		} else 
			context.querySelector('.DisplayLanguageArea').classList.add('hide');
		
		if (datetime.supportsLocalization()) { 
			let selectDateTimeLocale = context.querySelector('.selectDateTimeLocale');
			settingsHelper.populateLanguages(selectDateTimeLocale, allCultures, "displayNativeName", userSettings.dateTimeLocale() || '');
			context.querySelector('.fldDateTimeLocale').classList.remove('hide');
		} else 
			context.querySelector('.fldDateTimeLocale').classList.add('hide');
	
        if (appHost.supports('externallinks')) {	
			var els = document.getElementsByClassName('hyperlink');
			Array.prototype.forEach.call(els, function(el) {
				el.classList.remove('hide');
			});
        }
		
		const dashboardthemeNodes = context.querySelectorAll(".selectDashboardThemeContainer");
		dashboardthemeNodes.forEach( function(userItem) {
			userItem.classList.toggle('hide', !user.localUser.Policy.IsAdministrator);});
		
		let btnFindIt =  document.querySelector('#btnFindIt');
		if (btnFindIt) {
			if (isSecure()) {
				btnFindIt.classList.remove('hide');
				btnFindIt.addEventListener('click', findPosition);
			} else 
				btnFindIt.classList.add('hide');
		}
		
        if (appHost.supports('screensaver')) {
			let btnTryIt = context.querySelector('#btnTryIt');
			btnTryIt.addEventListener('click', onScreenSaverTry);
			
			let selectScreensaver = context.querySelector('.selectScreensaver');
			loadScreensavers(selectScreensaver, userSettings.screensaver() || 'none');
			selectScreensaver.addEventListener('change', onScreenSaverChange);
			
			context.querySelector('.ScreensaverArea').classList.remove('hide');
			
			let sliderScreensaverTime =  context.querySelector('#sliderScreensaverTime');
			sliderScreensaverTime.value = (userSettings.screensaverTime()/60000) || 3;
			sliderScreensaverTime.addEventListener('input', onScreensaverTimeChange);
			sliderScreensaverTime.addEventListener('change', onScreensaverTimeChange);
			
			sliderScreensaverTime.dispatchEvent(event_change);
			selectScreensaver.dispatchEvent(event_change);
        } else 
            context.querySelector('.ScreensaverArea').classList.add('hide');

		if (browser.tizen) {
            context.querySelector('.fldThemeSong').classList.add('hide');
            context.querySelector('.fldThemeVideo').classList.add('hide');
        } else {
			context.querySelector('.fldThemeSong').classList.remove('hide');
			context.querySelector('.fldThemeVideo').classList.remove('hide');
		}
		
		if (!layoutManager.tv && !layoutManager.mobile) 
			context.querySelector('.fldDetailsBanner').classList.remove('hide');
		else
			context.querySelector('.fldDetailsBanner').classList.add('hide');
		
        fillThemes(context.querySelector('#selectTheme'), userSettings.theme());
		context.querySelector('#selectTheme').addEventListener('change', function() {  skinManager.setTheme(this.value); });
		
        fillThemes(context.querySelector('#selectDashboardTheme'), userSettings.dashboardTheme());

        context.querySelector('.chkDisplayMissingEpisodes').checked = user.localUser.Configuration.DisplayMissingEpisodes || false;
        context.querySelector('#chkThemeSong').checked = userSettings.enableThemeSongs();
        context.querySelector('#chkThemeVideo').checked = userSettings.enableThemeVideos();
		
		context.querySelector('#selectClock').value = userSettings.enableClock();
		context.querySelector('#selectWeatherBot').value = userSettings.enableWeatherBot();
		
		context.querySelector('#inputLat').value = userSettings.getlatitude();
		context.querySelector('#inputLon').value = userSettings.getlongitude();
		context.querySelector('#inputApikey').value = userSettings.weatherApiKey();
		context.querySelector('#chkuseUSUnits').checked = userSettings.enableUSUnits();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#sliderBlurhash').value = userSettings.enableBlurhash();
		context.querySelector('#sliderSwiperDelay').value = userSettings.swiperDelay();
		context.querySelector('#sliderAPIFrequency').value = userSettings.APIDelay();
		context.querySelector('#selectSwiperFX').value = userSettings.swiperFX();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
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
			
			let sliderDisplayFontSize = context.querySelector('#sliderDisplayFontSize');
			sliderDisplayFontSize.addEventListener('change', onDisplayFontSizeChange);
			sliderDisplayFontSize.dispatchEvent(event_change);
		} else {
			context.querySelector('.fldDisplaySeparator').classList.add('hide');
			context.querySelector('.fldDisplayFontSize').classList.add('hide');
        }
		
        context.querySelector('#sliderLibraryPageSize').value = userSettings.libraryPageSize() || 60;
        showOrHideMissingEpisodesField(context);
    }

	function translateUserMenu() {
		// Force a retranslation of the user menu with the latest display language.
		let old = document.querySelector('.readOnlyContent');
		if (old) {
			let patch = document.createElement('div');
			patch.innerHTML = globalize.translateHtml(templateUserMenu, 'core');
			old.innerHTML = patch.querySelector('.readOnlyContent').innerHTML;
		}
			
		let prefs = document.querySelector('#myPreferencesMenuPage');
		if (prefs)
			prefs.setAttribute('data-title', globalize.translate('Settings'));
		prefs = document.querySelector('#displayPreferencesPage');
		if (prefs)
			prefs.setAttribute('data-title', globalize.translate('Display'));
	}

    function saveUser(instance, context, userSettingsInstance, apiClient, enableSaveConfirmation) {
		let newLayout;
		let newDisplayLanguage = savedDisplayLanguage;
		let reload = false;
		const user = instance.currentUser;
		
		newLayout = context.querySelector('.selectLayout').value;
		if (newLayout !== savedLayout) {
			layoutManager.setLayout(newLayout, true);		
			savedLayout = newLayout;
			reload = true;
		}
		
        if (appHost.supports('displaylanguage')) {	
			newDisplayLanguage = context.querySelector('#selectLanguage').value;
			if (newDisplayLanguage !== savedDisplayLanguage) {
				userSettingsInstance.language(newDisplayLanguage);
				reload = true;
			}
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
		userSettingsInstance.enableClock(context.querySelector('#selectClock').value);
		
        userSettingsInstance.enableFastFadein(context.querySelector('#chkFadein').checked);
        userSettingsInstance.enableBlurhash(context.querySelector('#sliderBlurhash').value);
		
		userSettingsInstance.swiperDelay(context.querySelector('#sliderSwiperDelay').value);
		userSettingsInstance.swiperFX(context.querySelector('#selectSwiperFX').value);
		userSettingsInstance.enableBackdrops(context.querySelector('#srcBackdrops').value);
		
		userSettingsInstance.APIDelay(context.querySelector('#sliderAPIFrequency').value);
		userSettingsInstance.getlatitude(context.querySelector('#inputLat').value);
		userSettingsInstance.getlongitude(context.querySelector('#inputLon').value);
		userSettingsInstance.enableUSUnits(context.querySelector('#chkuseUSUnits').checked);
		userSettingsInstance.weatherApiKey(context.querySelector('#inputApikey').value);
		userSettingsInstance.enableWeatherBot(context.querySelector('#selectWeatherBot').value);
		
		if (layoutManager.tv) 
			userSettingsInstance.displayFontSize(context.querySelector('#sliderDisplayFontSize').value);
		else
			displayFontSizeRset();
		
        userSettingsInstance.detailsBanner(context.querySelector('#chkDetailsBanner').checked);
     
		apiClient.updateUserConfiguration(user.localUser.Id, user.localUser.Configuration).then( () => { 
			userSettingsInstance.commit(); 
			setTimeout(() => { 
				if (reload !== false) {
					embed(instance.options, instance, newDisplayLanguage).then( () => {
						LibraryMenu.setTitle(globalize.translate(instance.title));
						LibraryMenu.updateUserInHeader(user);
						translateUserMenu();
						loading.hide();	
						if (enableSaveConfirmation) 
							toast(globalize.translate('SettingsSaved'));
					});
				} else {
					loading.hide();	
					if (enableSaveConfirmation) 
						toast(globalize.translate('SettingsSaved'));
				}}, 2000); 
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
	
    function embed(options, self, culture) {
		return globalize.getCoreDictionary(culture).then( () => {
			options.element.innerHTML = globalize.translateHtml(template, 'core', culture);
			options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
			if (options.enableSaveButton) {
				options.element.querySelector('.btnSave').classList.remove('hide');
			}
			self.loadData(options.autoFocus);
		});
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
			const apiClient = self.options.apiClient;
            const context = self.options.element;
			const userId = self.options.userId;
			const userSettings = self.options.userSettings;
			
            loading.show();
            
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
