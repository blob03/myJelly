import escapeHtml from 'escape-html';
import Headroom from 'headroom.js';
import dom from './dom';
import layoutManager from '../components/layoutManager';
import inputManager from './inputManager';
import viewManager from '../components/viewManager/viewManager';
import viewContainer from '../components/viewContainer';
import { appRouter } from '../components/appRouter';
import { appHost } from '../components/apphost';
import { playbackManager } from '../components/playback/playbackmanager';
import { pluginManager } from '../components/pluginManager';
import loading from '../components/loading/loading';
import groupSelectionMenu from '../plugins/syncPlay/ui/groupSelectionMenu';
import { showPrevBackdrop, showNextBackdrop, pauseBackdrop, setBackdropContrast } from '../components/backdrop/backdrop';
import browser from './browser';
import globalize from './globalize';
import toast from '../components/toast/toast';
import imageHelper from './imagehelper';
import { getMenuLinks, pinButton, reloadButton, loginClock, nightModeButton, loginClockPos, loginClockFormat } from '../scripts/settings/webSettings';
import Dashboard, { pageClassOn } from '../utils/dashboard';
import { getParameterByName } from '../utils/url';
import ServerConnections from '../components/ServerConnections';
import Events from '../utils/events.ts';
import '../elements/emby-button/paper-icon-button-light';
import '../elements/emby-slider/emby-slider';
import 'material-design-icons-iconfont';
import '../styles/scrollstyles.scss';
import '../styles/flexstyles.scss';
import '../styles/weatherBot.scss';
import '../styles/backdropControl.scss';
import '../styles/digitalClock.scss';

import appSettings from './settings/appSettings';
import { currentSettings, enableNightModeSwitch, enableMenuPin, toggleNightMode, enableClock, enableWeatherBot, showWeatherBot, showClock, togglePin, placeClock, setClockFormat, WB_init, initClockPlaces } from '../scripts/settings/userSettings';

/* eslint-disable indent */
	
    function renderHeader() {
        let html = '';
        html += '<div class="headerTop flex align-items-center" style="justify-content: center;">';
        html += '<div class="headerLeft" style="overflow: visible;">';
	
		// Extra feature thought for the TV layout.
		// That one pin the top bar and will be useful for owners of an LG's "magic remote" or any other pointing device.
		html += '<button type="button" is="paper-icon-button-light" class="headerButton headerPinButton headerButtonLeft hide"><span id="pin" class="material-icons lock_open"></span></button>';
		
		html += '<button is="paper-icon-button-light" class="headerNightmodeButton nightmodeButton headerButton headerButtonLeft hide" style="overflow: visible;"><span class="material-icons wb_sunny"></span></button>';
		html += '<button type="button" is="paper-icon-button-light" class="headerButton headerButtonLeft headerReloadButton hide"><span class="material-icons refresh"></span></button>';
		
		/* Added: Left casing for the clock widget*/
		html += '<div class="headerClockButton hide" id="headerClockLeft">';
		html += '<button type="button" is="paper-icon-button-light" class="headerClock headerButton moveLeftButton"><span class="material-icons arrow_left"></span></button>';
		html += '<button class="headerClock headerClockMain">';
		html += '<div id="headerClockDateLeft" class="headerClockDate"></div>';
		html += '<div id="headerClockTimeLeft" class="headerClockTime"></div>';
		html += '</button>';
		html += '<button type="button" is="paper-icon-button-light" class="headerClock headerButton moveRightButton"><span class="material-icons arrow_right"></span></button>';
		html += '</div>';
		/* ********************************** */
		
		html += '<button type="button" is="paper-icon-button-light" class="headerButton mainDrawerButton barsMenuButton headerButtonLeft hide"><span class="material-icons menu"></span></button>';	
		
		html += '<button type="button" is="paper-icon-button-light" class="headerButton headerSearchButton headerButtonLeft hide"><span class="material-icons search"></span></button>';
		
		html += '<button type="button" is="paper-icon-button-light" class="headerButton headerHomeButton barsMenuButton headerButtonLeft hide"><span class="material-icons home"></span></button>';
		
		html += '<button type="button" is="paper-icon-button-light" class="headerButton headerButtonLeft headerBackButton hide"><span class="material-icons ' + (browser.safari ? 'chevron_left' : 'arrow_back') + '"></span></button>';
		
		//html += '<h3 class="pageTitle" style="color: rgba(255,255,255,0.4);" aria-hidden="true"></h3>';
		
		html += '<div style="overflow: visible !important;max-width: 43vw;min-width: 2vw;width: 2vw;flex-grow: 2;">';
		html += '<span aria-hidden="true" class="pageTitle" style="color: rgba(255,255,255,0.4);"></span>';
		html += '</div>';
		
		html += '</div>';
		
		html += '<div class="headerRight" style="overflow: visible;">';
		html += '<span class="headerSelectedPlayer"></span>';
		html += '<button is="paper-icon-button-light" class="headerSyncButton syncButton headerButton headerButtonRight hide"><span class="material-icons groups"></span></button>';
		html += '<button is="paper-icon-button-light" class="headerAudioPlayerButton audioPlayerButton headerButton headerButtonRight hide"><span class="material-icons music_note"></span></button>';
		html += '<button is="paper-icon-button-light" class="headerCastButton castButton headerButton headerButtonRight hide"><span class="material-icons cast"></span></button>';
		
		html += '<div id="backdropWidget" class="hide" style="height: 2.85em;margin: 0 .29em !important;display: flex;flex-direction: row;justify-content: center;align-items: center;padding: .2em .4em .2em .4em;border: 1px groove #99a5ad;">';
		html += '<button href="#" type="button" id="backdropInfoButton" is="paper-icon-button-light" class="hide headerButton headerBackdropInfoButton headerButtonRight paper-icon-button-light" style="margin: 0"><span class="material-icons image_search"></span></button>';
		html += '<div id="backdropControlButton" class="hide" style="display: flex;flex-direction: row;margin: 0;font-size: 90%;">';
		html += '<button href="#" type="button" id="backdropPrevButton" is="paper-icon-button-light" class="headerButton headerBackdropPrevButton headerButtonRight paper-icon-button-light" style="padding: 0;margin: 0;width: auto;"><span class="material-icons skip_previous"></span></button>';
		html += '<button href="#" type="button" id="backdropPlayPauseButton" is="paper-icon-button-light" class="headerButton headerBackdropPlayPauseButton headerButtonRight paper-icon-button-light" style="padding: 0;margin: 0;width: 33%;font-size: 120%;">';
		html += '<span id="backdropRotationPause" class="material-icons pause"></span><span id="backdropRotationPlay" class="hide material-icons play_arrow"></span>';
		html += '</button>';
		html += '<button href="#" type="button" id="backdropNextButton" is="paper-icon-button-light" class="headerButton headerBackdropNextButton headerButtonRight paper-icon-button-light" style="padding: 0;margin: 0;width: auto;"><span class="material-icons skip_next"></span></button>';
		html += '</div>';
		html += '<div id="backdropContrast" class="hide">';
		html += '<div class="sliderContainer">';
		html += '<input is="emby-slider" id="backdropContrastSlider" label="" nobubble="" type="range" min="0" max="10" />';
		html += '</div>';
		html += '</div>';
		html += '</div>';
			
		/* Added: Right most casing for the clock widget */
		html += '<div class="headerClockButton hide" id="headerClockRight">';
		html += '<button type="button" is="paper-icon-button-light" class="headerClock headerButton moveLeftButton"><span class="material-icons arrow_left"></span></button>';
		html += '<button class="headerClock headerClockMain">';
		html += '<div id="headerClockDateRight" class="headerClockDate"></div>';
		html += '<div id="headerClockTimeRight" class="headerClockTime"></div>';
		html += '</button>';
		html += '<button type="button" is="paper-icon-button-light" class="headerClock headerButton moveRightButton"><span class="material-icons arrow_right"></span></button>';
		html += '</div>';
		/* ********************************** */
		/* Added: topbar casing for the weatherbot */
		html += '<div class="headerWthButton hide" id="headerWthRight" style="height: 3.2em;margin: 0 .4em !important;border: 1px groove #99a5ad;">';	
		html += '<button class="headerWth headerWthMain">';
		html += '<div class="WBScreen WBScreen0">';
		html += '<span id="headerWthMsg"></span>';
		html += '</div>';
		html += '<div class="hide WBScreen WBScreen1">';
		html += '<div style="display: flex;outline: none;height: auto;width: 100%;align-items: center;justify-content: space-evenly;">';
		html += '<div id="headerWthIconBg" class="headerWthIconBg" style="background: rgba(198, 216, 218, 0.6);border-radius: 100%;height: 2.1em;width: 2.1em;">';
		html += '<img id="headerWthIcon" class="headerWthIcon" style="width: 2.1em;">';
		html += '</div>';
		html += '<div id="headerWthTemp" dir="ltr" class="headerWthTemp" style="display: flex;align-items: center;font-size: 140%;"></div>';
		html += '</div>';
		html += '<div id="headerWthCity" class="headerWthCity" style="font-size: 60%;"></div>';
		html += '</div>';
		
		html += '<div class="hide WBScreen WBScreen2">';
		
		html += '<div style="display: flex;flex-direction: row;height: 1em;width: 7em;justify-content: space-evenly;">';
		html += '<div id="headerWthHum" dir="ltr" class="headerWthHum" style="display: flex;align-items: center;margin: 0 .4em;"></div>';
		html += '<div id="headerWthPressure" dir="ltr" class="headerWthPressure" style="display: flex;align-items: center;margin: 0 .4em;"></div>';
		html += '</div>';
		html += '<div style="display: flex;flex-direction: row;height: 1em;width: 7em;justify-content: space-evenly;">';
		html += '<div id="headerWthWind" dir="ltr" class="headerWthWind" style="display: flex;align-items: center;margin: 0 .4em;"></div>';
		html += '<div id="headerWthWindDir" dir="ltr" class="headerWthWindDir" style="display: flex;align-items: center;margin: 0 .4em;"></div>';
		html += '<span id="headerWthWindDirCode" dir="ltr" style="font-size: 50%"></span>';
		html += '</div>';
		
		html += '</div>';
		
		html += '<div class="hide WBScreen WBScreen3">';
		
		html += '<div id="WBdayTime" style="display: flex;outline: none;width: 5.5em;justify-content: space-evenly;">';
		html += '<span class="material-icons wb_sunny" style="color: white;font-size: 120%;"></span>';
		html += '<div id="headerWthSunrise" class="headerWthSunrise"></div>';
		html += '</div>';
		html += '<div id="WBnightTime" style="display: flex;outline: none;width: 5.5em;justify-content: space-evenly;">';
		html += '<span class="material-icons bedtime" style="color: white;font-size: 120%;"></span>';
		html += '<div id="headerWthSunset" class="headerWthSunset"></div>';
		html += '</div>';
		
		html += '</div>';
		
		html += '</button>';
		html += '</div>';
		/* ********************************** */
        html += '<button is="paper-icon-button-light" class="headerButton headerButtonRight headerUserButton hide"><span class="material-icons person"></span></button>';			
        html += '</div>';
        html += '</div>';
		if (browser.tv) {
			html += '<div class="headerTabs sectionTabs hide flex-grow" style="position: relative;top: 2.5em;padding-bottom:2.5em;font-size: 80%;">';
		} else {
			html += '<div class="headerTabs sectionTabs hide flex-grow">';
		}
        html += '</div>';

        skinHeader.classList.add('skinHeader-withBackground');
        skinHeader.classList.add('skinHeader-blurred');
        skinHeader.innerHTML = html;

        headerBackButton = skinHeader.querySelector('.headerBackButton');
        headerHomeButton = skinHeader.querySelector('.headerHomeButton');
        mainDrawerButton = skinHeader.querySelector('.mainDrawerButton');
        headerUserButton = skinHeader.querySelector('.headerUserButton');
        headerCastButton = skinHeader.querySelector('.headerCastButton');
		headerNightmodeButton = skinHeader.querySelector('.headerNightmodeButton');
        headerAudioPlayerButton = skinHeader.querySelector('.headerAudioPlayerButton');
        headerSearchButton = skinHeader.querySelector('.headerSearchButton');
		backdropInfoButton = skinHeader.querySelector('#backdropInfoButton');
		backdropPrevButton = skinHeader.querySelector('#backdropPrevButton');
		backdropNextButton = skinHeader.querySelector('#backdropNextButton');
		backdropContrastSlider = skinHeader.querySelector('#backdropContrastSlider');
		backdropPlayPauseButton = skinHeader.querySelector('#backdropPlayPauseButton');
		headerReloadButton = skinHeader.querySelector('.headerReloadButton');
		headerPinButton = skinHeader.querySelector('.headerPinButton');
        headerSyncButton = skinHeader.querySelector('.headerSyncButton');
 
        //retranslateUi();
        lazyLoadViewMenuBarImages();
        bindMenuEvents();
        updateCastIcon();
    }
		
    function getCurrentApiClient() {
        if (currentUser && currentUser.localUser) {
            return ServerConnections.getApiClient(currentUser.localUser.ServerId);
        }

        return ServerConnections.currentApiClient();
    }

    function lazyLoadViewMenuBarImages() {
        import('../components/images/imageLoader').then((imageLoader) => {
            imageLoader.lazyChildren(skinHeader);
        });
    }

    function onBackClick() {
        appRouter.back();
    }

    function retranslateUi() {
		if (headerBackButton)
            headerBackButton.title = globalize.translate('ButtonBack');
        if (headerHomeButton) 
            headerHomeButton.title = globalize.translate('Home');
        if (mainDrawerButton) 
            mainDrawerButton.title = globalize.translate('Menu');
        if (headerSyncButton) 
            headerSyncButton.title = globalize.translate('ButtonSyncPlay');
        if (headerAudioPlayerButton) 
            headerAudioPlayerButton.title = globalize.translate('ButtonPlayer');
        if (headerCastButton) 
            headerCastButton.title = globalize.translate('ButtonCast');
		if (headerNightmodeButton) 
            headerNightmodeButton.title = globalize.translate('ButtonNightmode');
        if (headerSearchButton)
            headerSearchButton.title = globalize.translate('Search');
		if (backdropInfoButton)
            backdropInfoButton.title = globalize.translate('BackdropInfo');
		if (backdropPrevButton)
            backdropPrevButton.title = globalize.translate('BackdropPrevious');
		if (backdropContrastSlider)
            backdropContrastSlider.title = globalize.translate('BackdropContrastTool');
		if (backdropNextButton)
            backdropNextButton.title = globalize.translate('BackdropNext');
		if (backdropPlayPauseButton)
            backdropPlayPauseButton.title = globalize.translate('BackdropPause');
		if (headerReloadButton) 
			headerReloadButton.title = globalize.translate('Reload');
		if (headerPinButton)
			headerPinButton.title = globalize.translate('LockHeader');
    }

    export function updateUserInHeader(user) {
		requiresUserRefresh = false;
		retranslateUi();
		
		if (!user)
			user = currentUser;
		
		if (headerUserButton) {
			let url = null;
			if (user && user.name) {
				if (user.imageUrl)
					url = user.imageUrl;
				headerUserButton.title = user.name;
				headerUserButton.classList.remove('hide');
			} else 
				headerUserButton.classList.add('hide');
			updateHeaderUserButton(url); 
		}

		if (user && user.localUser) {
			if (headerReloadButton)
				headerReloadButton.classList.add('hide');
			if (headerHomeButton) 
				headerHomeButton.classList.remove('hide');
			if (headerNightmodeButton)
				headerNightmodeButton.classList.toggle('hide', enableNightModeSwitch() != 3);
			if (headerPinButton) 
				headerPinButton.classList.toggle('hide', enableMenuPin() != 2);
			if (headerSearchButton)
				headerSearchButton.classList.remove('hide');
			if (mainDrawerButton)
				mainDrawerButton.classList.toggle('hide', layoutManager.tv);
			if (headerCastButton)
				headerCastButton.classList.toggle('hide', layoutManager.tv);

			enableWeatherBot(enableWeatherBot());
			
			const policy = user.Policy ? user.Policy : user.localUser.Policy;

			if (
				// Button is present
				headerSyncButton
				// SyncPlay plugin is loaded
				&& pluginManager.plugins.filter(plugin => plugin.id === 'syncplay').length > 0
				// SyncPlay enabled for user
				&& policy?.SyncPlayAccess !== 'none'
			) {
				headerSyncButton.classList.remove('hide');
			}
		} else {
			if (mainDrawerButton)
				mainDrawerButton.classList.add('hide');
			if (headerHomeButton)
				headerHomeButton.classList.add('hide');
			if (headerCastButton)
				headerCastButton.classList.add('hide');
			if (headerSyncButton)
				headerSyncButton.classList.add('hide');
			if (headerSearchButton) 
				headerSearchButton.classList.add('hide');
			if (backdropInfoButton) 
				backdropInfoButton.classList.add('hide');
			
			showClock(loginClock());
			
			// We keep a reload button mostly for dev purposes.
			// it is settable at login.header.buttons.reload in config.json.
			if (headerReloadButton)
				headerReloadButton.classList.toggle('hide', reloadButton() !== true);
			if (headerPinButton)
				headerPinButton.classList.toggle('hide', pinButton() !== true);
			if (headerNightmodeButton)
				headerNightmodeButton.classList.toggle('hide', nightModeButton() !== true);
		}
	}
	
    function updateHeaderUserButton(src) {
		if (!headerUserButton)
			return;
        if (src) {
            headerUserButton.classList.add('headerUserButtonRound');
            headerUserButton.innerHTML = '<div class="headerButton headerButtonRight paper-icon-button-light headerUserButtonRound userProfileAvatar" style="background-image:url(\'' + src + "');border: 1px solid;\"></div>";
        } else {
            headerUserButton.classList.remove('headerUserButtonRound');
            headerUserButton.innerHTML = '<span class="material-icons person"></span>';
        }
    }

	function gotoBackdropInfo() {
		appRouter.show(backdropInfoButton.href);
	}
	
	function onPrevBackdropClick() {
		showPrevBackdrop();
	}
	
	function onBackdropContrast(e) {
		setBackdropContrast(e.target.value);
	}
	
	function onNextBackdropClick() {
		showNextBackdrop();
	}
	
	function onBackdropPlayPauseClick() {
		pauseBackdrop();
	}
	
    function showSearch() {
        inputManager.handleCommand('search');
    }

    function onHeaderUserButtonClick() {
        Dashboard.navigate('mypreferencesmenu.html');
    }

    function onHeaderHomeButtonClick() {
        Dashboard.navigate('home.html');
    }

    function showAudioPlayer() {
        return appRouter.showNowPlaying();
    }

    function bindMenuEvents() {
        if (mainDrawerButton) {
            mainDrawerButton.addEventListener('click', toggleMainDrawer);
        }

        if (headerBackButton) {
            headerBackButton.addEventListener('click', onBackClick);
        }

        if (headerSearchButton) {
            headerSearchButton.addEventListener('click', showSearch);
        }
		
		if (backdropInfoButton) {
			backdropInfoButton.addEventListener('click', gotoBackdropInfo);
		}
		
		if (backdropPrevButton) {
			backdropPrevButton.addEventListener('click', onPrevBackdropClick);
		}

		if (backdropContrastSlider) {
			backdropContrastSlider.addEventListener('input', onBackdropContrast);
		}
		
		if (backdropNextButton) {
			backdropNextButton.addEventListener('click', onNextBackdropClick);
		}
		
		if (backdropPlayPauseButton) {
			backdropPlayPauseButton.addEventListener('click', onBackdropPlayPauseClick);
		}
		
		if (headerReloadButton) {
			headerReloadButton.addEventListener('click', () => {appRouter.reload()});
		}
		
		if (headerPinButton) {
			headerPinButton.addEventListener('click', () => {togglePin(true);} );
		}
		
        headerUserButton.addEventListener('click', onHeaderUserButtonClick);
        headerHomeButton.addEventListener('click', onHeaderHomeButtonClick);

        if (headerCastButton) {
            headerCastButton.addEventListener('click', onCastButtonClicked);
        }
		
		if (headerNightmodeButton) {
            headerNightmodeButton.addEventListener('click', onNightmodeButtonClicked);
        }

        headerAudioPlayerButton.addEventListener('click', showAudioPlayer);
        headerSyncButton.addEventListener('click', onSyncButtonClicked);
 
        if (layoutManager.mobile) {
            initHeadRoom(skinHeader);
        }
        Events.on(playbackManager, 'playbackstart', onPlaybackStart);
        Events.on(playbackManager, 'playbackstop', onPlaybackStop);
    }

    function onPlaybackStart() {
        if (playbackManager.isPlayingAudio() && layoutManager.tv) {
            headerAudioPlayerButton.classList.remove('hide');
        } else {
            headerAudioPlayerButton.classList.add('hide');
        }
		
		if (headerNightmodeButton && playbackManager.isPlayingVideo() && (enableClock() == 3 || enableWeatherBot() == 3))
			headerNightmodeButton.classList.remove('hide');
    }

    function onPlaybackStop(e, stopInfo) {
        if (stopInfo.nextMediaType != 'Audio') {
            headerAudioPlayerButton.classList.add('hide');
        }
		
		if (headerNightmodeButton && playbackManager.isPlayingVideo() && (enableClock() == 3 || enableWeatherBot() == 3))
			headerNightmodeButton.classList.add('hide');
    }

    function onCastButtonClicked() {
        const btn = this;

        import('../components/playback/playerSelectionMenu').then((playerSelectionMenu) => {
            playerSelectionMenu.show(btn);
        });
    }
	
	function onNightmodeButtonClicked() {
		toggleNightMode({toggle: true, osd: true});
    }

    function onSyncButtonClicked() {
        const btn = this;
        groupSelectionMenu.show(btn); 
    }

    function getItemHref(item, context) {
        return appRouter.getRouteUrl(item, {
            context: context
        });
    }

    function toggleMainDrawer() {
        if (navDrawerInstance.isVisible) {
            closeMainDrawer();
        } else {
            openMainDrawer();
        }
    }

    function openMainDrawer() {
        navDrawerInstance.open();
    }

    function onMainDrawerOpened() {
        if (layoutManager.mobile) {
            document.body.classList.add('bodyWithPopupOpen');
        }
    }

    function closeMainDrawer() {
        navDrawerInstance.close();
    }

    function onMainDrawerSelect() {
        if (navDrawerInstance.isVisible) {
            onMainDrawerOpened();
        } else {
            document.body.classList.remove('bodyWithPopupOpen');
        }
    }

    function refreshLibraryInfoInDrawer(user) {
        let html = '';
        html += '<div style="height:.5em;"></div>';
        html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder" href="#/home.html"><span class="material-icons navMenuOptionIcon home"></span><span class="navMenuOptionText">' + globalize.translate('Home') + '</span></a>';

        // placeholder for custom menu links
        html += '<div class="customMenuOptions"></div>';

        // libraries are added here
        html += '<div class="libraryMenuOptions"></div>';

        if (user.localUser && user.localUser.Policy.IsAdministrator) {
            html += '<div class="adminMenuOptions">';
            html += '<h3 class="sidebarHeader">';
            html += globalize.translate('HeaderAdmin');
            html += '</h3>';
            html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder lnkManageServer" data-itemid="dashboard" href="#/dashboard.html"><span class="material-icons navMenuOptionIcon dashboard"></span><span class="navMenuOptionText">' + globalize.translate('TabDashboard') + '</span></a>';
            html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder editorViewMenu" data-itemid="editor" href="#/edititemmetadata.html"><span class="material-icons navMenuOptionIcon mode_edit"></span><span class="navMenuOptionText">' + globalize.translate('Metadata') + '</span></a>';
            html += '</div>';
        }

        if (user.localUser) {
            html += '<div class="userMenuOptions">';
            html += '<h3 class="sidebarHeader">';
            html += globalize.translate('HeaderUser');
            html += '</h3>';

            if (appHost.supports('multiserver')) {
                html += `<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder btnChangeServer" data-itemid="selectserver" href="#"><span class="material-icons navMenuOptionIcon storage" aria-hidden="true"></span><span class="navMenuOptionText">${globalize.translate('SelectServer')}</span></a>`;
            }

            html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder btnSettings" data-itemid="settings" href="#"><span class="material-icons navMenuOptionIcon settings"></span><span class="navMenuOptionText">' + globalize.translate('Settings') + '</span></a>';
            html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder btnLogout" data-itemid="logout" href="#"><span class="material-icons navMenuOptionIcon logout"></span><span class="navMenuOptionText">' + globalize.translate('ButtonSignOut') + '</span></a>';
			
			if (appHost.supports('exitmenu')) {
				html += '<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder exitApp" data-itemid="exitapp" href="#"><span class="material-icons navMenuOptionIcon close"></span><span class="navMenuOptionText">' + globalize.translate('ButtonExitApp') + '</span></a>';
			}

            html += '</div>';
        }

        // add buttons to navigation drawer
        navDrawerScrollContainer.innerHTML = html;

        const btnChangeServer = navDrawerScrollContainer.querySelector('.btnChangeServer');
		const btnSettings = navDrawerScrollContainer.querySelector('.btnSettings');
		const btnExit = navDrawerScrollContainer.querySelector('.exitApp');
		const btnLogout = navDrawerScrollContainer.querySelector('.btnLogout');
        if (btnChangeServer)
            btnChangeServer.addEventListener('click', onChangeServerClick);
        if (btnSettings)
            btnSettings.addEventListener('click', onSettingsClick);
        if (btnExit)
            btnExit.addEventListener('click', onExitAppClick);
        if (btnLogout)
            btnLogout.addEventListener('click', onLogoutClick);
    }

    function refreshDashboardInfoInDrawer(page, apiClient) {
        currentDrawerType = 'admin';
        loadNavDrawer();

        if (navDrawerScrollContainer.querySelector('.adminDrawerLogo')) {
            updateDashboardMenuSelectedItem(page);
        } else {
            createDashboardMenu(page, apiClient);
        }
    }

    function isUrlInCurrentView(url) {
        return window.location.href.toString().toLowerCase().indexOf(url.toLowerCase()) !== -1;
    }

    function updateDashboardMenuSelectedItem(page) {
        const links = navDrawerScrollContainer.querySelectorAll('.navMenuOption');
        const currentViewId = page.id;

        for (let i = 0, length = links.length; i < length; i++) {
            let link = links[i];
            let selected = false;
            let pageIds = link.getAttribute('data-pageids');

            if (pageIds) {
                pageIds = pageIds.split('|');
                selected = pageIds.indexOf(currentViewId) != -1;
            }

            let pageUrls = link.getAttribute('data-pageurls');

            if (pageUrls) {
                pageUrls = pageUrls.split('|');
                selected = pageUrls.filter(isUrlInCurrentView).length > 0;
            }

            if (selected) {
                link.classList.add('navMenuOption-selected');
                let title = '';
                link = link.querySelector('.navMenuOptionText') || link;
                title += (link.innerText || link.textContent).trim();
                LibraryMenu.setTitle(title);
            } else {
                link.classList.remove('navMenuOption-selected');
            }
        }
    }

    function createToolsMenuList(pluginItems) {
        const links = [{
            name: globalize.translate('TabServer')
        }, {
            name: globalize.translate('TabDashboard'),
            href: '#/dashboard.html',
            pageIds: ['dashboardPage'],
            icon: 'dashboard'
        }, {
            name: globalize.translate('General'),
            href: '#/dashboardgeneral.html',
            pageIds: ['dashboardGeneralPage'],
            icon: 'settings'
        }, {
            name: globalize.translate('HeaderUsers'),
            href: '#/userprofiles.html',
            pageIds: ['userProfilesPage', 'newUserPage', 'editUserPage', 'userLibraryAccessPage', 'userParentalControlPage', 'userPasswordPage'],
            icon: 'people'
        }, {
            name: globalize.translate('HeaderLibraries'),
            href: '#/library.html',
            pageIds: ['mediaLibraryPage', 'librarySettingsPage', 'libraryDisplayPage', 'metadataImagesConfigurationPage', 'metadataNfoPage'],
            icon: 'folder'
        }, {
            name: globalize.translate('TitlePlayback'),
            icon: 'play_arrow',
            href: '#/encodingsettings.html',
            pageIds: ['encodingSettingsPage', 'playbackConfigurationPage', 'streamingSettingsPage']
        }];
        addPluginPagesToMainMenu(links, pluginItems, 'server');
        links.push({
            divider: true,
            name: globalize.translate('HeaderDevices')
        });
        links.push({
            name: globalize.translate('HeaderDevices'),
            href: '#/devices.html',
            pageIds: ['devicesPage', 'devicePage'],
            icon: 'devices'
        });
        links.push({
            name: globalize.translate('HeaderActivity'),
            href: '#/serveractivity.html',
            pageIds: ['serverActivityPage'],
            icon: 'assessment'
        });
        links.push({
            name: globalize.translate('DLNA'),
            href: '#/dlnasettings.html',
            pageIds: ['dlnaSettingsPage', 'dlnaProfilesPage', 'dlnaProfilePage'],
            icon: 'input'
        });
        links.push({
            divider: true,
            name: globalize.translate('LiveTV')
        });
        links.push({
            name: globalize.translate('LiveTV'),
            href: '#/livetvstatus.html',
            pageIds: ['liveTvStatusPage', 'liveTvTunerPage'],
            icon: 'live_tv'
        });
        links.push({
            name: globalize.translate('HeaderDVR'),
            href: '#/livetvsettings.html',
            pageIds: ['liveTvSettingsPage'],
            icon: 'dvr'
        });
        addPluginPagesToMainMenu(links, pluginItems, 'livetv');
        links.push({
            divider: true,
            name: globalize.translate('TabAdvanced')
        });
        links.push({
            name: globalize.translate('TabNetworking'),
            icon: 'cloud',
            href: '#/networking.html',
            pageIds: ['networkingPage']
        });
        links.push({
            name: globalize.translate('HeaderApiKeys'),
            icon: 'vpn_key',
            href: '#/apikeys.html',
            pageIds: ['apiKeysPage']
        });
        links.push({
            name: globalize.translate('TabLogs'),
            href: '#/log.html',
            pageIds: ['logPage'],
            icon: 'bug_report'
        });
        links.push({
            name: globalize.translate('TabNotifications'),
            icon: 'notifications',
            href: '#/notificationsettings.html',
            pageIds: ['notificationSettingsPage', 'notificationSettingPage']
        });
        links.push({
            name: globalize.translate('TabPlugins'),
            icon: 'shopping_cart',
            href: '#/installedplugins.html',
            pageIds: ['pluginsPage', 'pluginCatalogPage']
        });
        links.push({
            name: globalize.translate('TabScheduledTasks'),
            href: '#/scheduledtasks.html',
            pageIds: ['scheduledTasksPage', 'scheduledTaskPage'],
            icon: 'schedule'
        });
        if (hasUnsortedPlugins(pluginItems)) {
            links.push({
                divider: true,
                name: globalize.translate('TabPlugins')
            });
            addPluginPagesToMainMenu(links, pluginItems);
        }
        return links;
    }

    function hasUnsortedPlugins(pluginItems) {
        for (const pluginItem of pluginItems) {
            if (pluginItem.EnableInMainMenu && pluginItem.MenuSection === undefined) {
                return true;
            }
        }
        return false;
    }

    function addPluginPagesToMainMenu(links, pluginItems, section) {
        for (const pluginItem of pluginItems) {
            if (pluginItem.EnableInMainMenu && pluginItem.MenuSection === section) {
                links.push({
                    name: pluginItem.DisplayName,
                    icon: pluginItem.MenuIcon || 'folder',
                    href: Dashboard.getPluginUrl(pluginItem.Name),
                    pageUrls: [Dashboard.getPluginUrl(pluginItem.Name)]
                });
            }
        }
    }

    function getToolsMenuLinks(apiClient) {
        return apiClient.getJSON(apiClient.getUrl('web/configurationpages') + '?pageType=PluginConfiguration&EnableInMainMenu=true').then(createToolsMenuList, function () {
            return createToolsMenuList([]);
        });
    }

    function getToolsLinkHtml(item) {
        let menuHtml = '';
        let pageIds = item.pageIds ? item.pageIds.join('|') : '';
        pageIds = pageIds ? ' data-pageids="' + pageIds + '"' : '';
        let pageUrls = item.pageUrls ? item.pageUrls.join('|') : '';
        pageUrls = pageUrls ? ' data-pageurls="' + pageUrls + '"' : '';
        menuHtml += '<a is="emby-linkbutton" class="navMenuOption" href="' + item.href + '"' + pageIds + pageUrls + '>';

        if (item.icon) {
            menuHtml += '<span class="material-icons navMenuOptionIcon ' + item.icon + '"></span>';
        }

        menuHtml += '<span class="navMenuOptionText">';
        menuHtml += item.name;
        menuHtml += '</span>';
        return menuHtml + '</a>';
    }

    function getToolsMenuHtml(apiClient) {
        return getToolsMenuLinks(apiClient).then(function (items) {
            let item;
            let menuHtml = '';
            menuHtml += '<div class="drawerContent">';

            for (let i = 0; i < items.length; i++) {
                item = items[i];

                if (item.href) {
                    menuHtml += getToolsLinkHtml(item);
                } else if (item.name) {
                    menuHtml += '<h3 class="sidebarHeader">';
                    menuHtml += item.name;
                    menuHtml += '</h3>';
                }
            }

            return menuHtml + '</div>';
        });
    }

    function createDashboardMenu(page, apiClient) {
        return getToolsMenuHtml(apiClient).then(function (toolsMenuHtml) {
            let html = '';
            html += '<a class="adminDrawerLogo clearLink" is="emby-linkbutton" href="#/home.html">';
            html += '<img src="assets/img/icon-transparent.png" />';
            html += '</a>';
            html += toolsMenuHtml;
            navDrawerScrollContainer.innerHTML = html;
            updateDashboardMenuSelectedItem(page);
        });
    }

    function onSidebarLinkClick() {
        const section = this.getElementsByClassName('sectionName')[0];
        const text = section ? section.innerHTML : this.innerHTML;
        LibraryMenu.setTitle(text);
    }

    function getUserViews(apiClient, userId) {
        return apiClient.getUserViews({}, userId).then(function (result) {
            const items = result.Items;
            const list = [];

            for (let i = 0, length = items.length; i < length; i++) {
                const view = items[i];
                list.push(view);

                if (view.CollectionType == 'livetv') {
                    view.ImageTags = {};
                    view.icon = 'live_tv';
                    const guideView = Object.assign({}, view);
                    guideView.Name = globalize.translate('Guide');
                    guideView.ImageTags = {};
                    guideView.icon = 'dvr';
                    guideView.url = '#/livetv.html?tab=1';
                    list.push(guideView);
                }
            }

            return list;
        });
    }

    function showBySelector(selector, show) {
        const elem = document.querySelector(selector);

        if (elem) {
            if (show) {
                elem.classList.remove('hide');
            } else {
                elem.classList.add('hide');
            }
        }
    }

    function updateLibraryMenu(user) {
        if (!user) {
            showBySelector('.libraryMenuDownloads', false);
            showBySelector('.lnkSyncToOtherDevices', false);
            showBySelector('.userMenuOptions', false);
            return;
        }

        if (user.Policy.EnableContentDownloading) {
            showBySelector('.lnkSyncToOtherDevices', true);
        } else {
            showBySelector('.lnkSyncToOtherDevices', false);
        }

        if (user.Policy.EnableContentDownloading && appHost.supports('sync')) {
            showBySelector('.libraryMenuDownloads', true);
        } else {
            showBySelector('.libraryMenuDownloads', false);
        }

        const customMenuOptions = document.querySelector('.customMenuOptions');
        if (customMenuOptions) {
            getMenuLinks().then(links => {
                links.forEach(link => {
                    const option = document.createElement('a', 'emby-linkbutton');
                    option.classList.add('navMenuOption', 'lnkMediaFolder');
                    option.rel = 'noopener noreferrer';
                    option.target = '_blank';
                    option.href = link.url;

                    const icon = document.createElement('span');
                    icon.className = `material-icons navMenuOptionIcon ${link.icon || 'link'}`;
                    option.appendChild(icon);

                    const label = document.createElement('span');
                    label.className = 'navMenuOptionText';
                    label.textContent = link.name;
                    option.appendChild(label);

                    customMenuOptions.appendChild(option);
                });
            });
        }

        const userId = Dashboard.getCurrentUserId();
        const apiClient = getCurrentApiClient();
        const libraryMenuOptions = document.querySelector('.libraryMenuOptions');

        if (libraryMenuOptions) {
            getUserViews(apiClient, userId).then(function (result) {
                const items = result;
                let html = `<h3 class="sidebarHeader">${globalize.translate('HeaderMedia')}</h3>`;
                html += items.map(function (i) {
                    const icon = i.icon || imageHelper.getLibraryIcon(i.CollectionType);
                    const itemId = i.Id;

                    return `<a is="emby-linkbutton" data-itemid="${itemId}" class="lnkMediaFolder navMenuOption" href="${getItemHref(i, i.CollectionType)}">
                                    <span class="material-icons navMenuOptionIcon ${icon}"></span>
                                    <span class="sectionName navMenuOptionText">${i.Name}</span>
                                  </a>`;
                }).join('');
                libraryMenuOptions.innerHTML = html;
                const elem = libraryMenuOptions;
                const sidebarLinks = elem.querySelectorAll('.navMenuOption');

                for (const sidebarLink of sidebarLinks) {
                    sidebarLink.removeEventListener('click', onSidebarLinkClick);
                    sidebarLink.addEventListener('click', onSidebarLinkClick);
                }
            });
        }
    }

    function getTopParentId() {
        return getParameterByName('topParentId') || null;
    }

    function onMainDrawerClick(e) {
        if (dom.parentWithTag(e.target, 'A')) {
            setTimeout(closeMainDrawer, 30);
        }
    }

    function onChangeServerClick() {
        Dashboard.selectServer();
    }

    function onSettingsClick() {
        Dashboard.navigate('mypreferencesmenu.html');
    }

    function onExitAppClick() {
        appHost.exit();
    }
	
	// This is also the routine used by the user menu.
    export function onLogoutClick() {
		showClock(false);
		showWeatherBot(false);
		
		viewContainer.reset();
		
		if (playbackManager.isPlayingAudio()) {
			toast(globalize.translate('PlaybackStopped'));
			playbackManager.stop().then( () => {
				Dashboard.logout();
			});
		} else
			Dashboard.logout();
    }

    function updateCastIcon() {
        const context = document;
        const info = playbackManager.getPlayerInfo();
        const icon = headerCastButton.querySelector('.material-icons');

        icon.classList.remove('cast_connected', 'cast');

        if (info && !info.isLocalPlayer) {
            icon.classList.add('cast_connected');
            headerCastButton.classList.add('castButton-active');
            context.querySelector('.headerSelectedPlayer').innerHTML = info.deviceName || info.name;
        } else {
            icon.classList.add('cast');
            headerCastButton.classList.remove('castButton-active');
            context.querySelector('.headerSelectedPlayer').innerHTML = '';
        }
    }

    function updateLibraryNavLinks(page) {
        const isLiveTvPage = page.classList.contains('liveTvPage');
        const isChannelsPage = page.classList.contains('channelsPage');
        const isEditorPage = page.classList.contains('metadataEditorPage');
        const isMySyncPage = page.classList.contains('mySyncPage');
        const id = isLiveTvPage || isChannelsPage || isEditorPage || isMySyncPage || page.classList.contains('allLibraryPage') ? '' : getTopParentId() || '';
        const elems = document.getElementsByClassName('lnkMediaFolder');

        for (let i = 0, length = elems.length; i < length; i++) {
            const lnkMediaFolder = elems[i];
            const itemId = lnkMediaFolder.getAttribute('data-itemid');

            if (isChannelsPage && itemId === 'channels') {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else if (isLiveTvPage && itemId === 'livetv') {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else if (isEditorPage && itemId === 'editor') {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else if (isMySyncPage && itemId === 'manageoffline' && window.location.href.toString().indexOf('mode=download') != -1) {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else if (isMySyncPage && itemId === 'syncotherdevices' && window.location.href.toString().indexOf('mode=download') == -1) {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else if (id && itemId == id) {
                lnkMediaFolder.classList.add('navMenuOption-selected');
            } else {
                lnkMediaFolder.classList.remove('navMenuOption-selected');
            }
        }
    }

    function updateMenuForPageType(isDashboardPage, isLibraryPage) {
        let newPageType = 3;
        if (isDashboardPage) {
            newPageType = 2;
        } else if (isLibraryPage) {
            newPageType = 1;
        }

        if (currentPageType !== newPageType) {
            currentPageType = newPageType;

            if (isDashboardPage && !layoutManager.mobile) {
                skinHeader.classList.add('headroomDisabled');
            } else {
                skinHeader.classList.remove('headroomDisabled');
            }

            const bodyClassList = document.body.classList;

            if (isLibraryPage) {
                bodyClassList.add('libraryDocument');
                bodyClassList.remove('dashboardDocument');
                bodyClassList.remove('hideMainDrawer');

                if (navDrawerInstance) {
                    navDrawerInstance.setEdgeSwipeEnabled(true);
                }
            } else {
                if (isDashboardPage) {
                    bodyClassList.remove('libraryDocument');
                    bodyClassList.add('dashboardDocument');
                    bodyClassList.remove('hideMainDrawer');

                    if (navDrawerInstance) {
                        navDrawerInstance.setEdgeSwipeEnabled(true);
                    }
                } else {
                    bodyClassList.remove('libraryDocument');
                    bodyClassList.remove('dashboardDocument');
                    bodyClassList.add('hideMainDrawer');

                    if (navDrawerInstance) {
                        navDrawerInstance.setEdgeSwipeEnabled(false);
                    }
                }
            }
        }

        if (requiresUserRefresh) {
            ServerConnections.user(getCurrentApiClient()).then(updateUserInHeader);
        }
    }

    function updateTitle(page) {
        const title = page.getAttribute('data-title');

        if (title) {
            LibraryMenu.setTitle(title);
        } else if (page.classList.contains('standalonePage')) {
            LibraryMenu.setDefaultTitle();
        }
    }

    function updateBackButton(page) {
        if (headerBackButton)
			headerBackButton.classList.toggle('hide', 
				page.getAttribute('data-backbutton') === 'false' || !appRouter.canGoBack());
    }

    function initHeadRoom(elem) {
        const headroom = new Headroom(elem);
        headroom.init();
    }

    function refreshLibraryDrawer(user) {
        loadNavDrawer();
        currentDrawerType = 'library';

        if (user) {
            Promise.resolve(user);
        } else {
            ServerConnections.user(getCurrentApiClient()).then(function (userResult) {
                refreshLibraryInfoInDrawer(userResult);
                updateLibraryMenu(userResult.localUser);
            });
        }
    }

    function getNavDrawerOptions() {
        let drawerWidth = window.screen.availWidth - 50;
        drawerWidth = Math.max(drawerWidth, 240);
        drawerWidth = Math.min(drawerWidth, 320);
        return {
            target: navDrawerElement,
            onChange: onMainDrawerSelect,
            width: drawerWidth
        };
    }

    function loadNavDrawer() {
        if (navDrawerInstance) {
            return Promise.resolve(navDrawerInstance);
        }

        navDrawerElement = document.querySelector('.mainDrawer');
        navDrawerScrollContainer = navDrawerElement.querySelector('.scrollContainer');
        navDrawerScrollContainer.addEventListener('click', onMainDrawerClick);
        return new Promise(function (resolve) {
            import('../libraries/navdrawer/navdrawer').then(({ default: NavDrawer }) => {
                navDrawerInstance = new NavDrawer(getNavDrawerOptions());
				
                if (!layoutManager.tv) {
                    navDrawerElement.classList.remove('hide');
                }

                resolve(navDrawerInstance);
            });
        });
    }

    let navDrawerElement;
    let navDrawerScrollContainer;
    let navDrawerInstance;
    let mainDrawerButton;
    let headerHomeButton;
    let currentDrawerType;
    let pageTitleElement;
    let headerBackButton;
	let headerClockButton;
    let headerUserButton;
    let currentUser;
    let headerCastButton;
	let headerNightmodeButton;
    let headerSearchButton;
	let backdropInfoButton;
	let backdropPrevButton;
	let backdropContrastSlider;
	let backdropNextButton;
	let backdropPlayPauseButton;
	let headerReloadButton;
	let headerPinButton;
    let headerAudioPlayerButton;
    let headerSyncButton;
    const enableLibraryNavDrawer = layoutManager.desktop;
    const enableLibraryNavDrawerHome = !layoutManager.tv;
    const skinHeader = document.querySelector('.skinHeader');
    let requiresUserRefresh = true;

    function setTabs (type, selectedIndex, builder) {
        import('../components/maintabsmanager').then((mainTabsManager) => {
            if (type) {
                mainTabsManager.setTabs(viewManager.currentView(), selectedIndex, builder, function () {
                    return [];
                });
            } else {
                mainTabsManager.setTabs(null);
            }
        });
    }

    function setDefaultTitle () {
        if (!pageTitleElement)
            pageTitleElement = document.querySelector('.pageTitle');

        if (pageTitleElement) {
            pageTitleElement.classList.add('pageTitleWithLogo');
            pageTitleElement.classList.add('pageTitleWithDefaultLogo');
            pageTitleElement.style.backgroundImage = null;
            pageTitleElement.innerHTML = '';
        }

        document.title = 'Jellyfin';
    }

    export function setTitle (title) {
		if (title !== null) {
			if (title === '-')
				title = '';

			if (!pageTitleElement)
				pageTitleElement = document.querySelector('.pageTitle');

			if (pageTitleElement) {
				pageTitleElement.classList.remove('pageTitleWithLogo');
				pageTitleElement.classList.remove('pageTitleWithDefaultLogo');
				pageTitleElement.style.backgroundImage = null;
				pageTitleElement.innerHTML = title;
			}
		} else
			LibraryMenu.setDefaultTitle();
		document.title = title || 'Jellyfin';
	}

	function displayFontSizeModifier(apiClient) { 
		const userId = Dashboard.getCurrentUserId();
		currentSettings.setUserInfo(userId, apiClient).then(function () {
			const currentResizeRatio = currentSettings.displayFontSize() || 0;
			document.body.style.fontSize = 1 + (currentResizeRatio/100) + "rem"; 
			//document.body.style.lineHeight = 1 + (currentResizeRatio/100) + "rem";
		});
	}
	
    function setTransparentMenu (transparent) {
		// Temporary, to work around an apparent lack of support of semitransparent header from base themes
        //if (transparent) {
        //    skinHeader.classList.add('semiTransparent');
        //} else {
            skinHeader.classList.remove('semiTransparent');
       // }
    }

    let currentPageType;
    pageClassOn('pagebeforeshow', 'page', function () {
        if (!this.classList.contains('withTabs')) {
            LibraryMenu.setTabs(null);
        }
    });

    pageClassOn('pageshow', 'page', function (e) {
        const page = this;
        const isDashboardPage = page.classList.contains('type-interior');
        const isHomePage = page.classList.contains('homePage');
        const isLibraryPage = !isDashboardPage && page.classList.contains('libraryPage');
        const apiClient = getCurrentApiClient();

		if (layoutManager.tv)
			displayFontSizeModifier(apiClient);

		if (!layoutManager.tv) {
			if (isDashboardPage) {
				if (mainDrawerButton) {
					mainDrawerButton.classList.remove('hide');
				}
				refreshDashboardInfoInDrawer(page, apiClient);
			} else {
				if (mainDrawerButton) {
					if (enableLibraryNavDrawer || (isHomePage && enableLibraryNavDrawerHome)) {
						mainDrawerButton.classList.remove('hide');
					} else {
						mainDrawerButton.classList.add('hide');
					}
				}

				if (currentDrawerType !== 'library') {
					refreshLibraryDrawer();
				}
			}
		}
		
        updateMenuForPageType(isDashboardPage, isLibraryPage);

        // TODO: Seems to do nothing? Check if needed (also in other views).
        if (!e.detail.isRestored) {
            window.scrollTo(0, 0);
        }

        updateTitle(page);
        updateBackButton(page);
        updateLibraryNavLinks(page);
		
		updateUserInHeader();
    });

    Events.on(ServerConnections, 'localusersignedin', function (e, user) {
        const currentApiClient = ServerConnections.getApiClient(user.ServerId);
        currentDrawerType = null;
        currentUser = {
            localUser: user
        };

        loadNavDrawer();

        ServerConnections.user(currentApiClient).then(function (user) {
			currentUser = user;
			globalize.updateCurrentCulture();
			let x = enableMenuPin();
			switch(x) {
				case 0:
					togglePin(false, false);
					break;
				case 1:
					togglePin(false, true);
					break;
				case 2:
					togglePin(false);
					break;
			}
			x = enableNightModeSwitch();
			switch(x) {
				case 0:
				case 2:
				case 3:
					toggleNightMode({toggle: false, newval: false});
					break;
				case 1:
					toggleNightMode({toggle: false, newval: true});
					break;
			}
			updateUserInHeader(user);
			enableClock(enableClock());
			WB_init();
			enableWeatherBot(enableWeatherBot());
			const bcs = document.querySelector('#backdropContrastSlider');
			if (bcs) {
				const event_input = new Event('input');
				bcs.dispatchEvent(event_input);
			}
        });
    });

    Events.on(ServerConnections, 'localusersignedout', function () {
		currentUser = {};
		updateUserInHeader(null);
    });

    Events.on(playbackManager, 'playerchange', updateCastIcon);

    loadNavDrawer();

    const LibraryMenu = {
        getTopParentId: getTopParentId,
        onHardwareMenuButtonClick: function () {
            toggleMainDrawer();
        },
        setTabs: setTabs,
        setDefaultTitle: setDefaultTitle,
        setTitle: setTitle,
        setTransparentMenu: setTransparentMenu,
		updateUserInHeader: updateUserInHeader
    };

    window.LibraryMenu = LibraryMenu;
    renderHeader();
	
export default LibraryMenu;


/* eslint-enable indent */
