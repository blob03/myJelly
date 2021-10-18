import browser from '../../scripts/browser';
import appSettings from '../../scripts/settings/appSettings';
import { appHost } from '../apphost';
import focusManager from '../focusManager';
import qualityoptions from '../qualityOptions';
import layoutManager from '../layoutManager';
import globalize from '../../scripts/globalize';
import loading from '../loading/loading';
import settingsHelper from '../settingshelper';
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
        } else {
            appSettings.enableAutomaticBitrateDetection(isInNetwork, mediatype, true);
        }
    }

    function showHideQualityFields(context, user, apiClient) {
        if (user.Policy.EnableVideoPlaybackTranscoding) {
            context.querySelector('.videoQualitySection').classList.remove('hide');
        } else {
            context.querySelector('.videoQualitySection').classList.add('hide');
        }

        if (appHost.supports('multiserver')) {
            context.querySelector('.fldVideoInNetworkQuality').classList.remove('hide');
            context.querySelector('.fldVideoInternetQuality').classList.remove('hide');

            if (user.Policy.EnableAudioPlaybackTranscoding) {
                context.querySelector('.musicQualitySection').classList.remove('hide');
            } else {
                context.querySelector('.musicQualitySection').classList.add('hide');
            }

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

                if (user.Policy.EnableAudioPlaybackTranscoding) {
                    context.querySelector('.musicQualitySection').classList.remove('hide');
                } else {
                    context.querySelector('.musicQualitySection').classList.add('hide');
                }
            }
        });
    }

    function loadForm(context, user, userSettings, apiClient) {
        const loggedInUserId = apiClient.getCurrentUserId();
        const userId = user.Id;

        showHideQualityFields(context, user, apiClient);

        context.querySelector('#selectAllowedAudioChannels').value = userSettings.allowedAudioChannels();
		
		let selectAudioLanguage = context.querySelector('#selectAudioLanguage');
		apiClient.getCultures().then(allCultures => {
			allCultures.sort((a, b) => {
				let fa = a.DisplayName.toLowerCase(),
					fb = b.DisplayName.toLowerCase();
				if (fa < fb) 
					return -1;
				if (fa > fb) 
					return 1;
				return 0;
			});
			settingsHelper.populateLanguages(selectAudioLanguage, allCultures);
			selectAudioLanguage.value = user.Configuration.AudioLanguagePreference || '';
        });

        // hide cinema mode options if disabled at server level
        apiClient.getNamedConfiguration('cinemamode').then(cinemaConfig => {
            if (cinemaConfig.EnableIntrosForMovies || cinemaConfig.EnableIntrosForEpisodes) {
                context.querySelector('.cinemaModeOptions').classList.remove('hide');
            } else {
                context.querySelector('.cinemaModeOptions').classList.add('hide');
            }
        });

        if (appHost.supports('externalplayerintent') && userId === loggedInUserId) {
            context.querySelector('.fldExternalPlayer').classList.remove('hide');
        } else {
            context.querySelector('.fldExternalPlayer').classList.add('hide');
        }

        if (userId === loggedInUserId && (user.Policy.EnableVideoPlaybackTranscoding || user.Policy.EnableAudioPlaybackTranscoding)) {
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

        context.querySelector('.chkPlayDefaultAudioTrack').checked = user.Configuration.PlayDefaultAudioTrack;
        context.querySelector('.chkPreferFmp4HlsContainer').checked = userSettings.preferFmp4HlsContainer();
        context.querySelector('.chkEnableCinemaMode').checked = userSettings.enableCinemaMode();
       
        context.querySelector('.chkExternalVideoPlayer').checked = appSettings.enableSystemExternalPlayers();

        setMaxBitrateIntoField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
        setMaxBitrateIntoField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
        setMaxBitrateIntoField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');

        fillChromecastQuality(context.querySelector('.selectChromecastVideoQuality'));
        context.querySelector('.selectChromecastVersion').value = userSettings.chromecastVersion();

		// Following two options (checkboxes) are mutually exclusive.
		// chkEnableNextVideoOverlay has precedence if somehow both are checked in configuration.
		let chkEpisodeAutoPlay = context.querySelector('.chkEpisodeAutoPlay');
		let chkEnableNextVideoOverlay = context.querySelector('.chkEnableNextVideoOverlay');
		chkEnableNextVideoOverlay.checked = userSettings.enableNextVideoInfoOverlay();
		chkEpisodeAutoPlay.checked = user.Configuration.EnableNextEpisodeAutoPlay && !chkEnableNextVideoOverlay.checked;
		chkEpisodeAutoPlay.addEventListener('change', function() {  if (this.checked) chkEnableNextVideoOverlay.checked = false });
		chkEnableNextVideoOverlay.addEventListener('change', function() {  if (this.checked) chkEpisodeAutoPlay.checked = false });
		 
		/* if (browser.tizen || browser.web0s) { */
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

        loading.hide();
    }

    function saveUser(context, user, userSettingsInstance, apiClient) {
        appSettings.enableSystemExternalPlayers(context.querySelector('.chkExternalVideoPlayer').checked);
        appSettings.maxChromecastBitrate(context.querySelector('.selectChromecastVideoQuality').value);

        setMaxBitrateFromField(context.querySelector('.selectVideoInNetworkQuality'), true, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectVideoInternetQuality'), false, 'Video');
        setMaxBitrateFromField(context.querySelector('.selectMusicInternetQuality'), false, 'Audio');

        user.Configuration.AudioLanguagePreference = context.querySelector('#selectAudioLanguage').value;
        user.Configuration.PlayDefaultAudioTrack = context.querySelector('.chkPlayDefaultAudioTrack').checked;
        user.Configuration.EnableNextEpisodeAutoPlay = context.querySelector('.chkEpisodeAutoPlay').checked;
		
		userSettingsInstance.allowedAudioChannels(context.querySelector('#selectAllowedAudioChannels').value);
        userSettingsInstance.preferFmp4HlsContainer(context.querySelector('.chkPreferFmp4HlsContainer').checked);
        userSettingsInstance.enableCinemaMode(context.querySelector('.chkEnableCinemaMode').checked);
        userSettingsInstance.enableNextVideoInfoOverlay(context.querySelector('.chkEnableNextVideoOverlay').checked);
        userSettingsInstance.chromecastVersion(context.querySelector('.selectChromecastVersion').value);
        userSettingsInstance.skipForwardLength(context.querySelector('#sliderSkipForwardLength').value * 1000);
        userSettingsInstance.skipBackLength(context.querySelector('#sliderSkipBackLength').value * 1000);

        return apiClient.updateUserConfiguration(user.Id, user.Configuration);
    }

    function save(instance, context, userId, userSettings, apiClient, enableSaveConfirmation) {
        loading.show();

        apiClient.getUser(userId).then(user => {
            saveUser(context, user, userSettings, apiClient).then(() => {
                loading.hide();
                if (enableSaveConfirmation) {
                    toast(globalize.translate('SettingsSaved'));
                }

                Events.trigger(instance, 'saved');
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

        self.loadData();

        if (options.autoFocus) {
            focusManager.autoFocus(options.element);
        }
    }

    class PlaybackSettings {
        constructor(options) {
            this.options = options;
            embed(options, this);
        }

        loadData() {
            const self = this;
            const context = self.options.element;

            loading.show();

            const userId = self.options.userId;
            const apiClient = ServerConnections.getApiClient(self.options.serverId);
            const userSettings = self.options.userSettings;

            apiClient.getUser(userId).then(user => {
                userSettings.setUserInfo(userId, apiClient).then(() => {
                    self.dataLoaded = true;

                    loadForm(context, user, userSettings, apiClient);
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
export default PlaybackSettings;
