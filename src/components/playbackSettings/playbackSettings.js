import browser from '../../scripts/browser';
import appSettings from '../../scripts/settings/appSettings';
import { appHost } from '../apphost';
import focusManager from '../focusManager';
import qualityoptions from '../qualityOptions';
import layoutManager from '../layoutManager';
import globalize from '../../scripts/globalize';
import loading from '../loading/loading';
import settingsHelper from '../settingshelper';
import cultures from '../../scripts/cultures';
import { Events } from 'jellyfin-apiclient';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-slider/emby-slider';
import '../../elements/emby-checkbox/emby-checkbox';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './playbackSettings.template.html';

/* eslint-disable indent */
	
    function onSkipLengthChange(e) {
		const pnode = e.target.parentNode.parentNode;
		if (pnode) 
			pnode.querySelector('.fieldDescription').innerHTML = globalize.translate('ValueSeconds', e.target.value);
    }

    function setMaxBitrateIntoField(select, isInNetwork, mediatype) {
        const options = mediatype === 'Audio' ? qualityoptions.getAudioQualityOptions({

            currentMaxBitrate: appSettings.maxStreamingBitrate(isInNetwork, mediatype),
            isAutomaticBitrateEnabled: appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype),
            enableAuto: true

        }) : qualityoptions.getVideoQualityOptions({

            currentMaxBitrate: appSettings.maxStreamingBitrate(isInNetwork, mediatype),
            isAutomaticBitrateEnabled: appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype),
            enableAuto: true

        });

        select.innerHTML += options.map(i => {
            // render empty string instead of 0 for the auto option
            return (i.bitrate?`<option value="${i.bitrate}">${i.name}</option>`:'');
        }).join('');

        if (appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype)) {
            select.value = '';
        } else {
            select.value = appSettings.maxStreamingBitrate(isInNetwork, mediatype);
        }
    }

    function fillChromecastQuality(select) {
        const options = qualityoptions.getVideoQualityOptions({
            currentMaxBitrate: appSettings.maxChromecastBitrate(),
            isAutomaticBitrateEnabled: !appSettings.maxChromecastBitrate(),
            enableAuto: true
        });

        select.innerHTML += options.map(i => {
            // render empty string instead of 0 for the auto option
            return (i.bitrate?`<option value="${i.bitrate || ''}">${i.name}</option>`:'');
        }).join('');

        select.value = appSettings.maxChromecastBitrate() || '';
    }

    function setMaxBitrateFromField(select, isInNetwork, mediatype) {
        if (select.value) {
            appSettings.maxStreamingBitrate(isInNetwork, mediatype, select.value);
            appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype, false);
        } else
            appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype, true);
    }

    function showHideQualityFields(context, user, apiClient) {
        if (user.Policy.EnableVideoPlaybackTranscoding)
            context.querySelector('.videoQualitySection').classList.remove('hide');
        else
            context.querySelector('.videoQualitySection').classList.add('hide');

        if (appHost.supports('multiserver')) {
            context.querySelector('.fldVideoInNetworkQuality').classList.remove('hide');
            context.querySelector('.fldVideoInternetQuality').classList.remove('hide');

            if (user.Policy.EnableAudioPlaybackTranscoding) 
                context.querySelector('.musicQualitySection').classList.remove('hide');
            else 
                context.querySelector('.musicQualitySection').classList.add('hide');

            return;
        }

        apiClient.getEndpointInfo().then(endpointInfo => {
            if (endpointInfo.IsInNetwork) {
                context.querySelector('.fldVideoInNetworkQuality').classList.remove('hide');
                context.querySelector('.fldVideoInternetQuality').classList.add('hide');
                context.querySelector('.musicQualitySection').classList.add('hide');
            } else {
                context.querySelector('.fldVideoInNetworkQuality').classList.add('hide');

                context.querySelector('.fldVideoInternetQuality').classList.remove('hide');

                if (user.Policy.EnableAudioPlaybackTranscoding)
                    context.querySelector('.musicQualitySection').classList.remove('hide');
                else 
                    context.querySelector('.musicQualitySection').classList.add('hide');
            }
        });
    }

	function loadForm(self) {
		const apiClient = self.options.apiClient;
        const userSettings = self.options.userSettings;
		const context = self.options.element;
		const user = self.currentUser;

        showHideQualityFields(context, user, apiClient);

        context.querySelector('#selectAllowedAudioChannels').value = userSettings.allowedAudioChannels();
		
		let selectAudioLanguage = context.querySelector('#selectAudioLanguage');

		let allCultures = cultures.getCultures();		
		settingsHelper.populateLanguages(selectAudioLanguage, allCultures, "displayNativeName", userSettings.AudioLanguagePreference() || '');

        if (appHost.supports('externalplayerintent')) {
            context.querySelector('.fldExternalPlayer').classList.remove('hide');
        } else {
            context.querySelector('.fldExternalPlayer').classList.add('hide');
        }

        if (user.Policy.EnableVideoPlaybackTranscoding || user.Policy.EnableAudioPlaybackTranscoding) {
            context.querySelector('.qualitySections').classList.remove('hide');

            if (appHost.supports('chromecast') && user.Policy.EnableVideoPlaybackTranscoding) {
                context.querySelector('.fldChromecastQuality').classList.remove('hide');
            } else {
                context.querySelector('.fldChromecastQuality').classList.add('hide');
            }
        } else {
            context.querySelector('.qualitySections').classList.add('hide');
            context.querySelector('.fldChromecastQuality').classList.add('hide');
        }

        context.querySelector('.chkPreferFmp4HlsContainer').checked = userSettings.preferFmp4HlsContainer();
        context.querySelector('.chkExternalVideoPlayer').checked = appSettings.enableSystemExternalPlayers();
		context.querySelector('.chkSetUsingLastTracks').checked = userSettings.enableSetUsingLastTracks();
		
        setMaxBitrateIntoField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
        setMaxBitrateIntoField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
        setMaxBitrateIntoField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');

        fillChromecastQuality(context.querySelector('.selectChromecastVideoQuality'));
        context.querySelector('.selectChromecastVersion').value = userSettings.chromecastVersion();

		// Following two options (checkboxes) are mutually exclusive.
		// chkEnableNextVideoOverlay has precedence if both happen to be set in the configuration.
		let chkEpisodeAutoPlay = context.querySelector('.chkEpisodeAutoPlay');
		let chkEnableNextVideoOverlay = context.querySelector('.chkEnableNextVideoOverlay');
		
		chkEnableNextVideoOverlay.checked = userSettings.enableNextVideoInfoOverlay();
		chkEpisodeAutoPlay.checked = userSettings.enableNextEpisodeAutoPlay() && !chkEnableNextVideoOverlay.checked;
		chkEpisodeAutoPlay.addEventListener('change', function(ev) {  if (ev.target.checked) chkEnableNextVideoOverlay.checked = false });
		chkEnableNextVideoOverlay.addEventListener('change', function(ev) {  if (ev.target.checked) chkEpisodeAutoPlay.checked = false });
		
		if (browser.tizen) {
            context.querySelector('.fldEpisodeAutoPlay').classList.add('hide');	
			context.querySelector('.fldEnableNextVideoOverlay').classList.add('hide');
        } else {
			context.querySelector('.fldEpisodeAutoPlay').classList.remove('hide');
			context.querySelector('.fldEnableNextVideoOverlay').classList.remove('hide');
		}
		
		let event = new Event('change');
        let sliderSkipForward = context.querySelector('#sliderSkipForwardLength');
		sliderSkipForward.addEventListener('input', onSkipLengthChange);
		sliderSkipForward.addEventListener('change', onSkipLengthChange);
        sliderSkipForward.value = userSettings.skipForwardLength()/1000 || 30;
		sliderSkipForward.dispatchEvent(event);
        let sliderSkipBack = context.querySelector('#sliderSkipBackLength');
		sliderSkipBack.addEventListener('input', onSkipLengthChange);
		sliderSkipBack.addEventListener('change', onSkipLengthChange);
        sliderSkipBack.value = userSettings.skipBackLength()/1000 || 30;
		sliderSkipBack.dispatchEvent(event);
    }

	function saveUser(self) {
		let user = self.currentUser;
		const apiClient = self.options.apiClient;
        let userSettings = self.options.userSettings;
		const context = self.options.element;
		const enableSaveConfirmation = self.options.enableSaveConfirmation;
		
        appSettings.enableSystemExternalPlayers(context.querySelector('.chkExternalVideoPlayer').checked);
        appSettings.maxChromecastBitrate(context.querySelector('.selectChromecastVideoQuality').value);

        setMaxBitrateFromField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');

		userSettings.enableNextVideoInfoOverlay(context.querySelector('.chkEnableNextVideoOverlay').checked);
        userSettings.enableNextEpisodeAutoPlay(context.querySelector('.chkEpisodeAutoPlay').checked);
		userSettings.enableSetUsingLastTracks(context.querySelector('.chkSetUsingLastTracks').checked);
		userSettings.allowedAudioChannels(context.querySelector('#selectAllowedAudioChannels').value);
        userSettings.preferFmp4HlsContainer(context.querySelector('.chkPreferFmp4HlsContainer').checked);
        userSettings.chromecastVersion(context.querySelector('.selectChromecastVersion').value);
        userSettings.skipForwardLength(context.querySelector('#sliderSkipForwardLength').value * 1000);
        userSettings.skipBackLength(context.querySelector('#sliderSkipBackLength').value * 1000);
		userSettings.AudioLanguagePreference(context.querySelector('#selectAudioLanguage').value);
		
		apiClient.updateUserConfiguration(user.Id, user.Configuration).then( () => { 
			userSettings.commit(); 
			setTimeout(() => { 
				loading.hide();
				if (enableSaveConfirmation) 
					toast(globalize.translate('SettingsSaved'));}, 1000);
		});
		
		Events.trigger(self, 'saved');
    }

    function onSubmit(e) {
        const self = this;
        const apiClient = this.options.apiClient;
        const userId = this.options.userId;
        const userSettings = this.options.userSettings;

		loading.show();
		saveUser(self);

        // Disable default form submission
        if (e)
            e.preventDefault();
        return false;
    }

    function embed(self) {
        self.options.element.innerHTML = globalize.translateHtml(template, 'core');
        self.options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
		
        if (self.options.enableSaveButton)
            self.options.element.querySelector('.btnSave').classList.remove('hide');

        self.loadData();

        if (self.options.autoFocus) 
            focusManager.autoFocus(self.options.element);
    }

    class PlaybackSettings {
        constructor(options) {
            this.options = options;
			this.currentUser = null;
            embed(this);
        }

        loadData() {
            const self = this;

            loading.show();

            const userId = this.options.userId;
            const apiClient = this.options.apiClient;
            const userSettings = this.options.userSettings;

            apiClient.getUser(userId).then(user => {
				self.currentUser = user;				
				self.dataLoaded = true;
				loadForm(self);
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
export default PlaybackSettings;
