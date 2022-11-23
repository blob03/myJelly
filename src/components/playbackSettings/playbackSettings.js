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
import Events from '../../utils/events.ts';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-slider/emby-slider';
import '../../elements/emby-checkbox/emby-checkbox';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './playbackSettings.template.html';

/* eslint-disable indent */
	
    function onSkipLengthChange(e) {
		const pnode = e.target?.parentNode?.parentNode?.querySelector('.fieldDescription');
		if (pnode) 
			pnode.innerHTML = globalize.translate('ValueSeconds', e.target.value);
    }

    function fillQuality(select, isInNetwork, mediatype, maxVideoWidth) {
        const options = mediatype === 'Audio' ? qualityoptions.getAudioQualityOptions({

            currentMaxBitrate: appSettings.maxStreamingBitrate(isInNetwork, mediatype),
            isAutomaticBitrateEnabled: appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype),
            enableAuto: true

        }) : qualityoptions.getVideoQualityOptions({

            currentMaxBitrate: appSettings.maxStreamingBitrate(isInNetwork, mediatype),
            isAutomaticBitrateEnabled: appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype),
			enableAuto: true,
            maxVideoWidth

        });
		
		// Remove previous options but preserve special options such as 'none', 'Auto', ...
		Array.from(select.options).forEach( (opt) => {
			if (opt.value !== '' && !opt.value !== 'none' && !opt.disabled)
				opt.remove();
		});
		
        select.innerHTML += options.map(i => {
            // render empty string instead of 0 for the auto option
            return (i.bitrate?`<option value="${i.bitrate}">${i.name}</option>`:'');
        }).join('');
		
	}

	function setMaxBitrateIntoField(select, isInNetwork, mediatype) {
        fillQuality(select, isInNetwork, mediatype);

        if (appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype)) {
            select.value = '';
        } else {
            select.value = appSettings.maxStreamingBitrate(isInNetwork, mediatype);
        }
    }

    function fillChromecastQuality(select, maxVideoWidth) {
        const options = qualityoptions.getVideoQualityOptions({
            currentMaxBitrate: appSettings.maxChromecastBitrate(),
            isAutomaticBitrateEnabled: !appSettings.maxChromecastBitrate(),
            enableAuto: true,
            maxVideoWidth
        });

		// Remove previous options but preserve special options such as 'none', 'Auto', ...
		Array.from(select.options).forEach( (opt) => {
			if (opt.value !== '' && !opt.value !== 'none' && opt.value !== 'any')
				opt.remove();
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
	
	function setSelectValue(select, value, defaultValue) {
        select.value = value;

        if (select.selectedIndex < 0) {
            select.value = defaultValue;
        }
    }

    function onMaxVideoWidthChange(e) {
        const context = this.options.element;
        const selectVideoInNetworkQuality = context.querySelector('.selectVideoInNetworkQuality');
        const selectVideoInternetQuality = context.querySelector('.selectVideoInternetQuality');
        const selectChromecastVideoQuality = context.querySelector('.selectChromecastVideoQuality');
        const selectVideoInNetworkQualityValue = selectVideoInNetworkQuality.value;
        const selectVideoInternetQualityValue = selectVideoInternetQuality.value;
        const selectChromecastVideoQualityValue = selectChromecastVideoQuality.value;
        const maxVideoWidth = parseInt(e.target.value || '0', 10) || 0;

        fillQuality(selectVideoInNetworkQuality, true, 'Video', maxVideoWidth);
        fillQuality(selectVideoInternetQuality, false, 'Video', maxVideoWidth);
        fillChromecastQuality(selectChromecastVideoQuality, maxVideoWidth);

        setSelectValue(selectVideoInNetworkQuality, selectVideoInNetworkQualityValue, '');
        setSelectValue(selectVideoInternetQuality, selectVideoInternetQualityValue, '');
        setSelectValue(selectChromecastVideoQuality, selectChromecastVideoQualityValue, '');
    }

	function loadForm(self) {
        const userSettings = self.options.userSettings;
		const context = self.options.element;
		const user = self.options.currentUser;
		const event_change = new Event('change');

        context.querySelector('#selectAllowedAudioChannels').value = userSettings.allowedAudioChannels();
		context.querySelector('#selectAudioLanguage').value = user.Configuration.AudioLanguagePreference || '';
         
		context.querySelector('.chkPreferFmp4HlsContainer').checked = userSettings.preferFmp4HlsContainer();
		context.querySelector('.chkExternalVideoPlayer').checked = appSettings.enableSystemExternalPlayers();
		context.querySelector('.chkRememberAudioSelections').checked = user.Configuration.RememberAudioSelections || false;
		context.querySelector('.selectChromecastVersion').value = userSettings.chromecastVersion();
		context.querySelector('.chkMuteButton').checked = userSettings.muteButton();
		context.querySelector('.selectLabelMaxVideoWidth').value = appSettings.maxVideoWidth();
		
		// Following two options (checkboxes) are mutually exclusive.
		// chkEnableNextVideoOverlay has precedence if both happen to be set in the configuration.
		context.querySelector('.chkEnableNextVideoOverlay').checked = userSettings.enableNextVideoInfoOverlay();
		context.querySelector('.chkEpisodeAutoPlay').checked = user.Configuration.EnableNextEpisodeAutoPlay 
			&& !context.querySelector('.chkEnableNextVideoOverlay').checked;

		context.querySelector('#sliderSkipForwardLength').value = userSettings.skipForwardLength();
		context.querySelector('#sliderSkipBackLength').value = userSettings.skipBackLength();
		context.querySelector('#sliderSkipForwardLength').dispatchEvent(event_change);
		context.querySelector('#sliderSkipBackLength').dispatchEvent(event_change);
    }

	function save(self) {
		const user = self.options.currentUser;
		const apiClient = self.options.apiClient;
        const userSettings = self.options.userSettings;
		const context = self.options.element;
		const enableSaveConfirmation = self.options.enableSaveConfirmation;
		
        appSettings.enableSystemExternalPlayers(context.querySelector('.chkExternalVideoPlayer').checked);
        appSettings.maxChromecastBitrate(context.querySelector('.selectChromecastVideoQuality').value);
		appSettings.maxVideoWidth(context.querySelector('.selectLabelMaxVideoWidth').value);

        setMaxBitrateFromField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');

		userSettings.enableNextVideoInfoOverlay(context.querySelector('.chkEnableNextVideoOverlay').checked);
		userSettings.allowedAudioChannels(context.querySelector('#selectAllowedAudioChannels').value);
        userSettings.preferFmp4HlsContainer(context.querySelector('.chkPreferFmp4HlsContainer').checked);
        userSettings.chromecastVersion(context.querySelector('.selectChromecastVersion').value);
		userSettings.muteButton(context.querySelector('.chkMuteButton').checked);
        userSettings.skipForwardLength(context.querySelector('#sliderSkipForwardLength').value);
        userSettings.skipBackLength(context.querySelector('#sliderSkipBackLength').value);
		
		user.Configuration.RememberAudioSelections = context.querySelector('.chkRememberAudioSelections').checked;
		user.Configuration.AudioLanguagePreference = context.querySelector('#selectAudioLanguage').value;
		user.Configuration.EnableNextEpisodeAutoPlay = context.querySelector('.chkEpisodeAutoPlay').checked 
													|| context.querySelector('.chkEnableNextVideoOverlay').checked;
		apiClient.updateUserConfiguration(user.Id, user.Configuration).then( () => { 
			userSettings.commit(); 
			setTimeout(() => { 
				loading.hide();
				if (enableSaveConfirmation) 
					toast(globalize.translate('SettingsSaved'));}, 1000);
				Events.trigger(self, 'saved');
		});
    }

    function onSubmit(e) {
        const self = this;
        const apiClient = this.options.apiClient;
        const userId = this.options.userId;
        const userSettings = this.options.userSettings;

		loading.show();
		save(self);

        // Disable default form submission
        if (e)
            e.preventDefault();
        return false;
    }

    function embed(self) {
		const context = self.options.element;
		const apiClient = self.options.apiClient;
		const user = self.options.currentUser;
		const allCultures = cultures.getCultures();
		
		self.options.element.innerHTML = globalize.translateHtml(template, 'core');
		self.options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
		
		if (self.options.enableSaveButton)
			self.options.element.querySelector('.btnSave').classList.remove('hide');
		
		self.options.element.querySelector('.selectLabelMaxVideoWidth').addEventListener('change', onMaxVideoWidthChange.bind(self));

		let selectAudioLanguage = context.querySelector('#selectAudioLanguage');
		settingsHelper.populateLanguages(selectAudioLanguage, allCultures, "displayNativeName", user.Configuration.AudioLanguagePreference || '');

		context.querySelector('.chkEpisodeAutoPlay').addEventListener('change', 
			(e) => { if (e.target.checked) context.querySelector('.chkEnableNextVideoOverlay').checked = false });
		context.querySelector('.chkEnableNextVideoOverlay').addEventListener('change', 
			(e) => { if (e.target.checked) context.querySelector('.chkEpisodeAutoPlay').checked = false });
		
		context.querySelector('#sliderSkipForwardLength').addEventListener('change', onSkipLengthChange);
		context.querySelector('#sliderSkipBackLength').addEventListener('change', onSkipLengthChange);
		
		setMaxBitrateIntoField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
		setMaxBitrateIntoField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
		setMaxBitrateIntoField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');
		
		showHideQualityFields(context, user, apiClient);
		fillChromecastQuality(context.querySelector('.selectChromecastVideoQuality'));
		
		context.querySelector('.fldExternalPlayer').classList.toggle('hide', !appHost.supports('externalplayerintent'));
		
		if (user.Policy.EnableVideoPlaybackTranscoding || user.Policy.EnableAudioPlaybackTranscoding) {
            context.querySelector('.qualitySections').classList.remove('hide');
            if (appHost.supports('chromecast'))
				context.querySelector('.fldChromecastQuality').classList.toggle('hide', !user.Policy.EnableVideoPlaybackTranscoding);
		} else {
			context.querySelector('.qualitySections').classList.add('hide');
			context.querySelector('.fldChromecastQuality').classList.add('hide');
		}
		
		context.querySelector('.fldEpisodeAutoPlay').classList.toggle('hide', browser.tizen);
		context.querySelector('.fldEnableNextVideoOverlay').classList.toggle('hide', browser.tizen);
		
		setTimeout(() => {self.loadData();}, 100);
		
		if (self.options.autoFocus) 
			focusManager.autoFocus(self.options.element);
	}

    class PlaybackSettings {
        constructor(options) {
            this.options = options;
			this.adminEdit = options.adminEdit;
            embed(this);
        }

        loadData() {
			loading.show();
			loadForm(this);
			if (this.options.autoFocus)
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
export default PlaybackSettings;
