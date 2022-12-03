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
import Events from '../../utils/events.ts';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../elements/emby-button/emby-button';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './displaySettings.template.html';
import * as LibraryMenu from '../../scripts/libraryMenu';
import * as ssmanager from '../../scripts/screensavermanager';
import { pauseBackdrop } from '../backdrop/backdrop';
import './displaysettings.scss';

/* eslint-disable indent */

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
		const _newss = e.target.value;
		let key;

		if (_newss !== 'any') {
			const options = pluginManager.ofType('screensaver').map( ss => {
				return {
					value: ss.id,
					description: ss.description || ''
				};
			});	
			const sel = options.filter(ss => ss.value === _newss);
			key = sel[0]?.description;
		} else
			key = 'RandomScreensaverHelp';
		
		const _desc = key? globalize.translate(key): '';
		
		let pnode = e.target.parentNode;
		if (!pnode)
			return;
		pnode.querySelector('.fieldDescription').innerHTML = _desc;
		pnode = e.target.parentNode.parentNode;
		if (!pnode) 
			return;
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
		const newval =  e.target?.parentNode?.parentNode?.querySelector('#selectScreensaver');
		if (!newval?.value)
			return;
		
		const ss = ssmanager.getScreensaverPluginByName(newval.value);
		if (ss) 
			ssmanager.showScreenSaver(ss, true);
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
		const context = self.options.element;
		const user = self.currentUser;
		const userSettings = self.options.userSettings;
		const event_change = new Event('change');
		
		if (appHost.supports('displaylanguage')) {
			context.querySelector('#selectLanguage').value = userSettings.language();
			context.querySelector('#selectLanguageAlt').value = userSettings.languageAlt();
			context.querySelector('#selectLanguage').dispatchEvent(event_change);
			context.querySelector('#selectLanguageAlt').dispatchEvent(event_change);
		} 
		
		if (datetime.supportsLocalization()) {
			context.querySelector('.selectDateTimeLocale').value = userSettings.dateTimeLocale() || '';
		}
		
		context.querySelector('#selectTheme').value = userSettings.theme();
		context.querySelector('#selectDashboardTheme').value = userSettings.dashboardTheme();
		
        if (appHost.supports('screensaver')) {
			context.querySelector('.selectScreensaver').value = userSettings.screensaver();
			context.querySelector('#sliderScreensaverTime').value = userSettings.screensaverTime();
			context.querySelector('#sliderScreensaverTime').dispatchEvent(event_change);
			context.querySelector('.selectScreensaver').dispatchEvent(event_change);
        }
		
		context.querySelector('.fldDetailsBanner').classList.toggle('hide', layoutManager.tv || layoutManager.mobile);
		
        context.querySelector('.chkDisplayMissingEpisodes').checked = user.Configuration.DisplayMissingEpisodes || false;
        context.querySelector('#chkThemeSong').checked = userSettings.enableThemeSongs();
        context.querySelector('#chkThemeVideo').checked = userSettings.enableThemeVideos();
		
		self._savedClock = context.querySelector('#selectClock').value = userSettings.enableClock();
		self._savedWBot = context.querySelector('#selectWeatherBot').value = userSettings.enableWeatherBot();
		
		const bWidget = userSettings.enableBackdropWidget();
		context.querySelector('#backdropToolsAll').checked = (bWidget == 7);
		context.querySelector('#backdropToolsDetails').checked = (bWidget & 1);
		context.querySelector('#backdropToolsControl').checked = (bWidget & 2);
		context.querySelector('#backdropToolsContrast').checked = (bWidget & 4);
		context.querySelector('#backdropToolsList').classList.toggle('hide', 
			context.querySelector('#backdropToolsAll').checked);
	
		context.querySelector('#inputLat').value = userSettings.getlatitude();
		context.querySelector('#inputLon').value = userSettings.getlongitude();
		context.querySelector('#inputApikey').value = userSettings.weatherApiKey();
        context.querySelector('#chkFadein').checked = userSettings.enableFastFadein();
        context.querySelector('#sliderBlurhash').value = userSettings.enableBlurhash();
		context.querySelector('#sliderSwiperDelay').value = userSettings.swiperDelay();
		context.querySelector('#sliderAPIFrequency').value = userSettings.APIDelay();
		context.querySelector('#selectSwiperFX').value = userSettings.swiperFX();
        context.querySelector('#chkDetailsBanner').checked = userSettings.detailsBanner();
		context.querySelector('#srcBackdrops').value = userSettings.enableBackdrops();
		context.querySelector('#sliderBackdropDelay').value = userSettings.backdropDelay();
		context.querySelector('#sliderDisplayFontSize').value = userSettings.displayFontSize();
		context.querySelector('#sliderLibraryPageSize').value = userSettings.libraryPageSize();
		self._savedLayout = context.querySelector('.selectLayout').value = layoutManager.getSavedLayout() || '';
			
		/* If an admin is actually impersonating a user,
			there is no point exposing the layout settings. */
		context.querySelector('.fldDisplayMode').classList.toggle('hide', 
			self.adminEdit || !(browser.web0s || appHost.supports('displaymode')));
        
		if (layoutManager.tv) {
			context.querySelector('.fldDisplaySeparator').classList.toggle('hide', 
				self.adminEdit || !(browser.web0s || appHost.supports('displaymode')));
			context.querySelector('.fldDisplayFontSize').classList.toggle('hide',
				self.adminEdit || !(browser.web0s || appHost.supports('displaymode')));
			context.querySelector('#sliderDisplayFontSize').dispatchEvent(event_change);
		}
		
		context.querySelector('.fldDisplayMissingEpisodes').classList.toggle('hide', browser.tizen);
	}

    function saveForm(self) {
		const user = self.currentUser;
		const enableSaveConfirmation = self.options.enableSaveConfirmation;
		const userSettingsInstance = self.options.userSettings;
		const context = self.options.element;
		const apiClient = self.options.apiClient;
		let reload = false;
		
		if (!self.adminEdit) {
			const newLayout = context.querySelector('.selectLayout').value;
			if (newLayout !== self._savedLayout) {
				layoutManager.setLayout(newLayout, true);
				self._savedLayout = newLayout;
				reload = true;
			}
		
			if (self._savedClock != context.querySelector('#selectClock').value ||
				self._savedWBot != context.querySelector('#selectWeatherBot').value) {
				reload = true;
			}
		}
		
		if (appHost.supports('displaylanguage')) {
			if (context.querySelector('#selectLanguage').value != userSettingsInstance.language()) {
				userSettingsInstance.language(context.querySelector('#selectLanguage').value);
				reload = true;
			}
			if (context.querySelector('#selectLanguageAlt').value != userSettingsInstance.languageAlt()) {
				userSettingsInstance.languageAlt(context.querySelector('#selectLanguageAlt').value);
				reload = true;
			}
		}

		user.Configuration.DisplayMissingEpisodes = context.querySelector('.chkDisplayMissingEpisodes').checked;
        userSettingsInstance.dateTimeLocale(context.querySelector('.selectDateTimeLocale').value);
        userSettingsInstance.enableThemeSongs(context.querySelector('#chkThemeSong').checked);
        userSettingsInstance.enableThemeVideos(context.querySelector('#chkThemeVideo').checked);
        userSettingsInstance.theme(context.querySelector('#selectTheme').value);
		userSettingsInstance.dashboardTheme(context.querySelector('#selectDashboardTheme').value);
        userSettingsInstance.screensaver(context.querySelector('.selectScreensaver').value);
		userSettingsInstance.screensaverTime(context.querySelector('#sliderScreensaverTime').value);
        userSettingsInstance.libraryPageSize(context.querySelector('#sliderLibraryPageSize').value);
		userSettingsInstance.enableClock(context.querySelector('#selectClock').value, self.adminEdit);
		userSettingsInstance.enableBackdrops(context.querySelector('#srcBackdrops').value);
		userSettingsInstance.backdropDelay(context.querySelector('#sliderBackdropDelay').value);
		userSettingsInstance.enableFastFadein(context.querySelector('#chkFadein').checked);
		userSettingsInstance.detailsBanner(context.querySelector('#chkDetailsBanner').checked);
        userSettingsInstance.enableBlurhash(context.querySelector('#sliderBlurhash').value);
		userSettingsInstance.swiperDelay(context.querySelector('#sliderSwiperDelay').value);
		userSettingsInstance.swiperFX(context.querySelector('#selectSwiperFX').value);
		userSettingsInstance.APIDelay(context.querySelector('#sliderAPIFrequency').value);
		userSettingsInstance.getlatitude(context.querySelector('#inputLat').value);
		userSettingsInstance.getlongitude(context.querySelector('#inputLon').value);
		userSettingsInstance.weatherApiKey(context.querySelector('#inputApikey').value);
		userSettingsInstance.enableWeatherBot(context.querySelector('#selectWeatherBot').value, self.adminEdit);
		
		let bWidget = 0;
		if (context.querySelector('#backdropToolsAll').checked)
			bWidget = 7;
		else {
			if (context.querySelector('#backdropToolsDetails').checked)
				bWidget = bWidget | 1;
			if (context.querySelector('#backdropToolsControl').checked)
				bWidget = bWidget | 2;
			if (context.querySelector('#backdropToolsContrast').checked)
				bWidget = bWidget | 4;
		}
		userSettingsInstance.enableBackdropWidget(bWidget);
		
		// When controls are turned off, backdrops rotation must be resumed.
		if (bWidget & 2) {
			pauseBackdrop(false);
		}
		
		if (layoutManager.tv) 
			userSettingsInstance.displayFontSize(context.querySelector('#sliderDisplayFontSize').value);
		else
			displayFontSizeRset();

		apiClient.updateUserConfiguration(user.Id, user.Configuration).then( () => { 
			userSettingsInstance.commit().then( () => {
				if (!self.adminEdit && reload === true) {
					if (document.querySelector('#myPreferencesMenuPage'))
						document.querySelector('#myPreferencesMenuPage').dispatchEvent(new CustomEvent('viewreload', null));
					embed(self, context.querySelector('#selectLanguage').value).then( () => {
						LibraryMenu.setTitle(globalize.translate(self.title));
						LibraryMenu.updateUserInHeader();
						loading.hide();
						if (enableSaveConfirmation)
							toast(globalize.translate('SettingsSaved'));
					});
				} else {
					loading.hide();
					if (enableSaveConfirmation) 
						toast(globalize.translate('SettingsSaved'));
				}
			});
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
		const context = self.options.element;
		const user = self.currentUser;
		const userSettings = self.options.userSettings;
		const allCultures = cultures.getDictionaries();
		
		return globalize.getCoreDictionary(culture).then( () => {
			self.options.element.innerHTML = globalize.translateHtml(template, 'core', culture);
			self.options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
			if (self.options.enableSaveButton) {
				self.options.element.querySelector('.btnSave').classList.remove('hide');
			}
			
			if (appHost.supports('displaylanguage')) {
				let selectLanguage = context.querySelector('#selectLanguage');
				let selectLanguageAlt = context.querySelector('#selectLanguageAlt');
				settingsHelper.populateDictionaries(selectLanguage, allCultures, "displayNativeName", userSettings.language());
				settingsHelper.populateDictionaries(selectLanguageAlt, allCultures, "displayNativeName", userSettings.languageAlt(), userSettings.language());
				selectLanguage.addEventListener('change', (e) => {
					let newLang = e.target.value;
					// Auto mode
					if (newLang === '')
						newLang = globalize.getDefaultCulture().ccode;
					// Remove the latest selection from the list of selectable secondary languages.
					settingsHelper.populateDictionaries(selectLanguageAlt, allCultures, "displayNativeName", selectLanguageAlt.value, newLang);
					settingsHelper.showLangProgress(e.target);
					settingsHelper.showLangProgress(selectLanguageAlt, true);
					settingsHelper.showAggregateInfo(e.target); 
				});
				selectLanguageAlt.addEventListener('change', (e) => {
					const selectLanguageAlt = e.target;
					settingsHelper.showLangProgress(selectLanguageAlt, true);
					settingsHelper.showAggregateInfo(selectLanguageAlt);
				});
				
				context.querySelector('.DisplayLanguageArea').classList.remove('hide');
			} else 
				context.querySelector('.DisplayLanguageArea').classList.add('hide');
			
			if (datetime.supportsLocalization()) {
				settingsHelper.populateLanguages(context.querySelector('.selectDateTimeLocale'), allCultures, "displayNativeName", userSettings.dateTimeLocale() || '');
				context.querySelector('.fldDateTimeLocale').classList.remove('hide');
			}	else
				context.querySelector('.fldDateTimeLocale').classList.add('hide'); 
			
			if (appHost.supports('externallinks')) {
				var els = context.getElementsByClassName('hyperlink');
				Array.prototype.forEach.call(els, function(el) {
					el.classList.remove('hide');
				});
			}
			
			context.querySelectorAll(".selectDashboardThemeContainer").forEach( (elem) => {
				elem.classList.toggle('hide', !user.Policy.IsAdministrator);});

			if (appHost.supports('screensaver')) {
				let btnTryIt = context.querySelector('#btnTryIt');
				btnTryIt.addEventListener('click', onScreenSaverTry);
				
				settingsHelper.populateScreensavers(context.querySelector('.selectScreensaver'), userSettings.screensaver() || 'none');
				context.querySelector('.selectScreensaver').addEventListener('change', onScreenSaverChange);
				context.querySelector('#sliderScreensaverTime').addEventListener('input', onScreensaverTimeChange);
				context.querySelector('#sliderScreensaverTime').addEventListener('change', onScreensaverTimeChange);
				context.querySelector('.ScreensaverArea').classList.remove('hide');
			} else 
				context.querySelector('.ScreensaverArea').classList.add('hide');
			
			context.querySelector('.fldThemeSong').classList.toggle('hide', browser.tizen);
			context.querySelector('.fldThemeVideo').classList.toggle('hide', browser.tizen);
			context.querySelector('#btnFindIt').classList.toggle('hide', !isSecure());
		
			settingsHelper.populateThemes(context.querySelector('#selectTheme'), userSettings.theme());
			// If the theme isn't changed by an admin, load it up.
			if (!self.adminEdit)
				context.querySelector('#selectTheme').addEventListener('change', (e) => { skinManager.setTheme(e.target.value); });
			settingsHelper.populateThemes(context.querySelector('#selectDashboardTheme'), userSettings.dashboardTheme());
			
			context.querySelector('#btnFindIt').addEventListener('click', findPosition);
			context.querySelector('#backdropToolsAll').addEventListener('change', (e) => {
				context.querySelector('#backdropToolsList').classList.toggle('hide', e.target.checked); });
			
			context.querySelector('#sliderDisplayFontSize').addEventListener('change', onDisplayFontSizeChange);
			
			setTimeout(() => {self.loadData(self.options.autoFocus);}, 100);
		});
	}

    class DisplaySettings {
        constructor(options) {
            this.options = options;
			this.title = 'Display';
			this._savedLayout = '';
			this._savedWBot = '';
			this._savedClock = '';
			this.currentUser = options.currentUser;
			this.adminEdit = options.adminEdit;
            embed(this);
        }

        loadData(autoFocus) {
			loading.show();
			loadForm(this);
			if (autoFocus)
				focusManager.autoFocus(this.options.element);
			loading.hide();
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
