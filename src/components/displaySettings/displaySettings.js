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
import * as ssmanager from '../../scripts/screensavermanager';
import { pauseBackdrop } from '../backdrop/backdrop';
import viewContainer from '../viewContainer';

/* eslint-disable indent */

    function fillThemes(select, selectedTheme) {
        skinManager.getThemes().then( themes => {
			
			let groups = {};
			const dflgroup = "Jellyfin-web";
			
			themes.forEach( x => {
				let grp = dflgroup;
				if (x.group)
					grp = x.group;
				if (!groups[grp]) 
					groups[grp] = [];
				groups[grp].push(x);
			});
			
			let ngroups = Object.keys(groups);
			ngroups.forEach( x => {
				
				if (layoutManager.tv) {
					let w = document.createElement("option");
					w.divider = x;
					select.options.add(w, undefined);
				} else {
					let w = document.createElement("option");
					w.text = "-------------\u00A0\u00A0\u00A0" + x;
					w.disabled = true;
					//w.style.fontWeight = "bold";
					w.style.fontSize = "120%";
					w.style.fontFamily = "quicksand";
					select.options.add(w, undefined);
				}
				
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
					
					select.options.add(z, undefined); 
				});
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
			key = sel[0]?.description;
		
		const txt = key? globalize.translate(key): '';
		
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
		const dflgroup = "Jellyfin-web";

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
			
			if (layoutManager.tv) {
				let w = document.createElement("option");
				w.divider = x;
				select.options.add(w, undefined);
			} else {
				let w = document.createElement("option");
				w.text = "-------------\u00A0\u00A0\u00A0" + x;
				w.disabled = true;
				//w.style.fontWeight = "bold";
				w.style.fontSize = "120%";
				w.style.fontFamily = "quicksand";
				select.options.add(w, undefined);
			}

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
			});
			
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
	}
	
	function displayFontSizeRset() { 		
		document.body.style.fontSize = "1rem";
	}
	
	function isSecure() {
	   return location.protocol == 'https:';
	}

	function findPosition() {
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition( (x) => {
				toast(globalize.translate('GeolocationFound', x.coords.latitude.toFixed(2), x.coords.longitude.toFixed(2)));
				document.querySelector('#inputLat').value = Number(x.coords.latitude.toFixed(2));
				document.querySelector('#inputLon').value = Number(x.coords.longitude.toFixed(2));
			}, (y) => {
				toast(globalize.translate('GeolocationFailed'));
				console.warn("Failed to find current geolocation: " + y);}, 
			{ 'enableHighAccuracy': true, 'timeout': 10000, 'maximumAge': 0 });
		} else{
			toast(globalize.translate('GeolocationUnsupported'));
			console.warn("Sorry but it appears your browser does not support HTML5 geolocation.");
		}
	}

	function loadForm(self) {
		let context = self.options.element;
		let user = self.currentUser;
		let userSettings = self.options.userSettings;;
		let apiClient = self.options.apiClient;
		let event_change = new Event('change');
		let allCultures = cultures.getDictionaries();
	
		if (appHost.supports('displaylanguage')) { 
			let selectLanguage = context.querySelector('#selectLanguage');
			let selectLanguageAlt = context.querySelector('#selectLanguageAlt');
			self._savedDisplayLang = userSettings.language();
			self._savedDisplayLangAlt = userSettings.languageAlt();
			settingsHelper.populateDictionaries(selectLanguage, allCultures, "displayNativeName", self._savedDisplayLang);
			settingsHelper.populateDictionaries(selectLanguageAlt, allCultures, "displayNativeName", self._savedDisplayLangAlt, self._savedDisplayLang);
			selectLanguage.addEventListener('change', function(x) {
				const lang = x.target;
				const langAlt = lang.parentElement.parentElement.querySelector('#selectLanguageAlt');
				let newLang = lang.value;
				// Auto mode
				if (newLang === '')
					newLang = globalize.getDefaultCulture().ccode;
				// Remove the latest selection from the list of selectable secondary languages.
				settingsHelper.populateDictionaries(selectLanguageAlt, allCultures, "displayNativeName", langAlt.value, newLang);
				settingsHelper.showLangProgress(lang);
				settingsHelper.showLangProgress(langAlt, true);
				settingsHelper.showAggregateInfo(lang); 
			});
			selectLanguageAlt.addEventListener('change', function(x) {
				const langAlt = x.target;
				settingsHelper.showLangProgress(langAlt, true);
				settingsHelper.showAggregateInfo(langAlt);
			});
			selectLanguage.dispatchEvent(event_change);
			selectLanguageAlt.dispatchEvent(event_change);
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
			var els = context.getElementsByClassName('hyperlink');
			Array.prototype.forEach.call(els, function(el) {
				el.classList.remove('hide');
			});
        }
		
		const dashboardthemeNodes = context.querySelectorAll(".selectDashboardThemeContainer");
		dashboardthemeNodes.forEach( function(userItem) {
			userItem.classList.toggle('hide', !user.localUser.Policy.IsAdministrator);});
		
		let btnFindIt =  context.querySelector('#btnFindIt');
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
		
		self._savedClock = context.querySelector('#selectClock').value = userSettings.enableClock();
		self._savedWBot = context.querySelector('#selectWeatherBot').value = userSettings.enableWeatherBot();
		
		let backdropToolbox = context.querySelector('#backdropToolsAll');
		let backdropToolsList = context.querySelector('#backdropToolsList');
		let toolbox = userSettings.enableBackdropWidget();
		
		backdropToolbox.checked = (toolbox == 7);
		context.querySelector('#backdropToolsDetails').checked = (toolbox & 1);
		context.querySelector('#backdropToolsControl').checked = (toolbox & 2);
		context.querySelector('#backdropToolsContrast').checked = (toolbox & 4);
		
		if (backdropToolbox.checked)
			backdropToolsList.classList.add('hide');
		else
			backdropToolsList.classList.remove('hide');
		
		backdropToolbox.addEventListener('change', (ev) => {
			if (ev.target.checked)
				backdropToolsList.classList.add('hide');
			else
				backdropToolsList.classList.remove('hide');
		});
		
		
		
		context.querySelector('#inputLat').value = userSettings.getlatitude();
		context.querySelector('#inputLon').value = userSettings.getlongitude();
		context.querySelector('#inputApikey').value = userSettings.weatherApiKey();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#sliderBlurhash').value = userSettings.enableBlurhash();
		context.querySelector('#sliderSwiperDelay').value = userSettings.swiperDelay();
		context.querySelector('#sliderAPIFrequency').value = userSettings.APIDelay();
		context.querySelector('#selectSwiperFX').value = userSettings.swiperFX();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
		context.querySelector('#srcBackdrops').value = userSettings.enableBackdrops() || "None";
		context.querySelector('#sliderBackdropDelay').value = userSettings.backdropDelay();
		context.querySelector('#sliderDisplayFontSize').value = userSettings.displayFontSize() || 0;
		self._savedLayout = context.querySelector('.selectLayout').value = layoutManager.getSavedLayout() || '';
			
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
		// Refresh the translation of the user settings main page.
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

    function saveForm(self) {
		const user = self.currentUser;
		const enableSaveConfirmation = self.options.enableSaveConfirmation;
		const userSettingsInstance = self.options.userSettings;
		const context = self.options.element;
		const apiClient = self.options.apiClient;
		let newDisplayLanguage = self._savedDisplayLang;
		let newDisplayLanguageAlt = self._savedDisplayLangAlt;
		let reload = false;
		
		let newLayout = context.querySelector('.selectLayout').value;
		if (newLayout !== self._savedLayout) {
			layoutManager.setLayout(newLayout, true);
			self._savedLayout = newLayout;
			reload = true;
		}
		
		if ((self._savedClock != context.querySelector('#selectClock').value) ||
			(self._savedWBot != context.querySelector('#selectWeatherBot').value)) {
			reload = true;
		}
		
        if (appHost.supports('displaylanguage')) {	
			newDisplayLanguage = context.querySelector('#selectLanguage').value;
			if (newDisplayLanguage !== self._savedDisplayLang) {
				userSettingsInstance.language(newDisplayLanguage);
				reload = true;
			}
			newDisplayLanguageAlt = context.querySelector('#selectLanguageAlt').value;
			if (newDisplayLanguageAlt !== self._savedDisplayLangAlt) {
				userSettingsInstance.languageAlt(newDisplayLanguageAlt);
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
		userSettingsInstance.enableBackdrops(context.querySelector('#srcBackdrops').value);
		userSettingsInstance.backdropDelay(context.querySelector('#sliderBackdropDelay').value);
		
		let toolbox = 0;
		if (context.querySelector('#backdropToolsAll').checked)
			toolbox = 7;
		else {
			if (context.querySelector('#backdropToolsDetails').checked)
				toolbox = toolbox | 1;
			if (context.querySelector('#backdropToolsControl').checked)
				toolbox = toolbox | 2;
			if (context.querySelector('#backdropToolsContrast').checked)
				toolbox = toolbox | 4;
		}
		userSettingsInstance.enableBackdropWidget(toolbox);
		
		// When controls are turned off, backdrops rotation must be resumed.
		if (toolbox & 2) {
			pauseBackdrop(false);
		}
		
        userSettingsInstance.enableFastFadein(context.querySelector('#chkFadein').checked);
        userSettingsInstance.enableBlurhash(context.querySelector('#sliderBlurhash').value);
		userSettingsInstance.swiperDelay(context.querySelector('#sliderSwiperDelay').value);
		userSettingsInstance.swiperFX(context.querySelector('#selectSwiperFX').value);
		userSettingsInstance.APIDelay(context.querySelector('#sliderAPIFrequency').value);
		userSettingsInstance.getlatitude(context.querySelector('#inputLat').value);
		userSettingsInstance.getlongitude(context.querySelector('#inputLon').value);
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
					embed(self, newDisplayLanguage).then( () => {
						LibraryMenu.setTitle(globalize.translate(self.title));
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

    function onSubmit(e) {
		loading.show();
		saveForm(this);
		Events.trigger(this, 'saved'); 
		
        // Disable default form submission
        if (e) 
            e.preventDefault();

        return false;
    }
	
    function embed(self, culture) {
		return globalize.getCoreDictionary(culture).then( () => {
			self.options.element.innerHTML = globalize.translateHtml(template, 'core', culture);
			self.options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
			if (self.options.enableSaveButton) {
				self.options.element.querySelector('.btnSave').classList.remove('hide');
			}
			self.loadData(self.options.autoFocus);
		});
	}

    class DisplaySettings {
        constructor(options) {
            this.options = options;
			this.title = 'Display';
			this._savedDisplayLang = '';
			this._savedDisplayLangAlt = '';
			this._savedLayout = '';
			this._savedWBot = '';
			this._savedClock = '';
            embed(this);
        }

        loadData(autoFocus) {
            const self = this;
           
            loading.show();
            
			return ServerConnections.user(this.options.apiClient).then((user) => {
				self.currentUser = user;               
				self.dataLoaded = true;
				loadForm(self);
				if (autoFocus) 
					focusManager.autoFocus(self.options.element);
				loading.hide();
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
