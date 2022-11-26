import globalize from '../../scripts/globalize';
import { appHost } from '../apphost';
import appSettings from '../../scripts/settings/appSettings';
import browser from '../../scripts/browser';
import focusManager from '../focusManager';
import layoutManager from '../layoutManager';
import loading from '../loading/loading';
import subtitleAppearanceHelper from './subtitleappearancehelper';
import settingsHelper from '../settingshelper';
import cultures from '../../scripts/cultures';
import skinManager from '../../scripts/themeManager';
import dom from '../../scripts/dom';
import Events from '../../utils/events.ts';
import '../listview/listview.scss';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-slider/emby-slider';
import '../../elements/emby-input/emby-input';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../assets/css/flexstyles.scss';
import './subtitlesettings.scss';
import ServerConnections from '../ServerConnections';
import toast from '../toast/toast';
import template from './subtitlesettings.template.html';

/**
 * Subtitle settings.
 * @module components/subtitleSettings/subtitleSettings
 */

function getSubtitleAppearanceObject(context) {
    const appearanceSettings = {};
    appearanceSettings.textSize = context.querySelector('#sliderTextSize').value;
	appearanceSettings.strokeSize = context.querySelector('#sliderStrokeSize').value;
    appearanceSettings.dropShadow = context.querySelector('#selectDropShadow').value;
    appearanceSettings.font = context.querySelector('#selectFont').value;
    appearanceSettings.textBackground = context.querySelector('#inputTextBackground').value;
	appearanceSettings.textStroke = context.querySelector('#inputTextStroke').value;
    appearanceSettings.textColor = context.querySelector('#inputTextColor').value;
	appearanceSettings.textShadow = context.querySelector('#inputShadowColor').value;
    appearanceSettings.verticalPosition = context.querySelector('#sliderVerticalPosition').value;
	appearanceSettings.chkPreview = context.querySelector('#chkPreview').checked;
	appearanceSettings.oblique = context.querySelector('#sliderOblique').value;
	appearanceSettings.preset = context.querySelector('#selectSubtitlePreset').value;
    return appearanceSettings;
}

function onSliderChange(e) {
	const pnode = e.target?.parentNode?.parentNode?.querySelector('.fieldDescription');
	if (pnode) 
		pnode.innerHTML = e.target.value;
}

function cancelPreset(e) {
	// reset preset selection to nothing whenever a modification 
	// in the subs parameters is detected.
	document.getElementById("selectSubtitlePreset").value = '';
}

function onSubPresetChange(e) {
	if (e.target.value == "")
		return;
	skinManager.getPresets().then(presets => {
		presets.forEach( t => {
			if (e.target.value === t.id) {
				let event_change = new Event('change');
				
				// Update font.
				document.getElementById("selectFont").value = t.font;
				
				// Update oblique strength.
				let sliderOblique = document.getElementById("sliderOblique");
				sliderOblique.value = t.oblique;
				if (sliderOblique.parentNode.parentNode)
					sliderOblique.parentNode.parentNode.querySelector('.fieldDescription').innerHTML = t.oblique;
				
				// Update sizes.
				let sliderTextSize = document.getElementById("sliderTextSize");
				sliderTextSize.value = t.size;
				if (sliderTextSize.parentNode.parentNode)
					sliderTextSize.parentNode.parentNode.querySelector('.fieldDescription').innerHTML = t.size;
				
				let sliderStrokeSize = document.getElementById("sliderStrokeSize");
				sliderStrokeSize.value = t.osize;
				if (sliderStrokeSize.parentNode.parentNode)
					sliderStrokeSize.parentNode.parentNode.querySelector('.fieldDescription').innerHTML = t.osize;
				
				// Update color settings.
				document.getElementById("inputTextColor").value = t.fgcolor;
				document.getElementById("fcolor").style.backgroundColor = t.fgcolor;
				document.getElementById("inputTextStroke").value = t.ocolor;
				document.getElementById("strcolor").style.backgroundColor = t.ocolor;
				document.getElementById("inputTextBackground").value = t.bgcolor;
				document.getElementById("bgcolor").style.backgroundColor = t.bgcolor;
				document.getElementById("inputShadowColor").value = t.shcolor;
				document.getElementById("shadowcolor").style.backgroundColor = t.shcolor;
				document.getElementById("selectDropShadow").value = t.shadow;
				
				// Force a refresh of the preview.
				document.getElementById("selectDropShadow").dispatchEvent(event_change);
			}
		});
	});
}

function loadForm(self) {
	const context = self.options.element;
	const appearanceSettings = self.appearanceSettings;
	const user = self.currentUser;
	const event_change = new Event('change');
	
	context.querySelector('#selectDropShadow').value = appearanceSettings.dropShadow || 'none';
	context.querySelector('#inputShadowColor').value = appearanceSettings.textShadow || 'Transparent';
	context.querySelector('#shadowcolor').style.backgroundColor = context.querySelector('#inputShadowColor').value;
	context.querySelector('#inputTextBackground').value = appearanceSettings.textBackground || 'Transparent';
	context.querySelector('#bgcolor').style.backgroundColor = context.querySelector('#inputTextBackground').value;
	context.querySelector('#inputTextStroke').value = appearanceSettings.textStroke || 'Transparent';
	context.querySelector('#strcolor').style.backgroundColor = context.querySelector('#inputTextStroke').value;
	context.querySelector('#inputTextColor').value = appearanceSettings.textColor || 'White';
	context.querySelector('#fcolor').style.backgroundColor = context.querySelector('#inputTextColor').value;
	context.querySelector('#selectFont').value = appearanceSettings.font || '';
	context.querySelector('#selectSubtitleLanguage').value = user.Configuration.SubtitleLanguagePreference || '';
	context.querySelector('#selectSubtitlePlaybackMode').value = user.Configuration.SubtitleMode || '';
	context.querySelector('.chkRememberSubtitleSelections').checked = user.Configuration.RememberSubtitleSelections || false;
	context.querySelector('#sliderTextSize').value = appearanceSettings.textSize || 1.36;
	context.querySelector('#sliderStrokeSize').value = appearanceSettings.strokeSize || 1;
	context.querySelector('#sliderVerticalPosition').value = appearanceSettings.verticalPosition;
	context.querySelector('#selectSubtitleBurnIn').value = appSettings.get('subtitleburnin') || '';
	context.querySelector('#chkPreview').checked = appearanceSettings.chkPreview;
	
	context.querySelector('#sliderOblique').value = appearanceSettings.oblique || 0;
	if (browser.web0s) {
		context.querySelector('#sliderOblique').min = 0;
		context.querySelector('#sliderOblique').max = 4;
		context.querySelector('#sliderOblique').step = 4;
	}
	
	context.querySelector('#sliderOblique').dispatchEvent(event_change);
	context.querySelector('#selectSubtitleLanguage').dispatchEvent(event_change);
	context.querySelector('#selectSubtitlePreset').dispatchEvent(event_change);
	context.querySelector('#selectSubtitlePlaybackMode').dispatchEvent(event_change);
	context.querySelector('#chkPreview').dispatchEvent(event_change);
	context.querySelector('#sliderTextSize').dispatchEvent(event_change);
	context.querySelector('#sliderStrokeSize').dispatchEvent(event_change);
}

function save(self) {
	const user = self.currentUser;
	const userSettings = self.options.userSettings;
	const context = self.options.element;
	const apiClient = self.options.apiClient;
	const enableSaveConfirmation = self.options.enableSaveConfirmation;

	appSettings.set('subtitleburnin', context.querySelector('#selectSubtitleBurnIn').value);

	let old_appearanceSettings = userSettings.getSubtitlesAppearance();
	self.appearanceSettings = Object.assign(old_appearanceSettings, getSubtitleAppearanceObject(context));
	userSettings.setSubtitlesAppearance(self.appearanceSettings);

	user.Configuration.RememberSubtitleSelections = context.querySelector('.chkRememberSubtitleSelections').checked;
	user.Configuration.SubtitleLanguagePreference = context.querySelector('#selectSubtitleLanguage').value;
	user.Configuration.SubtitleMode = context.querySelector('#selectSubtitlePlaybackMode').value;

	apiClient.updateUserConfiguration(user.Id, user.Configuration).then( () => { 
		userSettings.commit().then( () => {
			loading.hide();
			if (enableSaveConfirmation) 
				toast(globalize.translate('SettingsSaved'));
			Events.trigger(self, 'saved');
		});
	});
}

function onSubtitleModeChange(e) {
    const view = dom.parentWithClass(e.target, 'subtitlesettings');
    const subtitlesHelp = view.querySelectorAll('.subtitlesHelp');
	
    for (let i = 0, length = subtitlesHelp.length; i < length; i++)
        subtitlesHelp[i].classList.add('hide');
    view.querySelector('.subtitles' + this.value + 'Help').classList.remove('hide');
}

function onAppearanceFieldChange(e) {
    const view = dom.parentWithClass(e.target, 'subtitlesettings');
    const appearanceSettings = getSubtitleAppearanceObject(view);

    subtitleAppearanceHelper.applyStyles({
        window: view.querySelector('.subtitleappearance-fullpreview-window'),
        text: view.querySelector('.subtitleappearance-fullpreview-text')
    }, appearanceSettings);	
}

function onLanguageFieldChange(e) {
	let Lang = e.target.value;
	// "" for 'Auto-detect'
	if (Lang === "")
		Lang = globalize.getCurrentLocale();
	else
		// get the two letters name (ISO 639-1) correspondence needed to obtain a dictionary.
		Lang = e.target.options[e.target.selectedIndex].getAttribute("ISO6391");
		
	if (!Lang)
		return;
    const view = dom.parentWithClass(e.target, 'subtitlesettings');
	let preview = view.querySelector('.subtitleappearance-fullpreview-text');
	if (!preview)  
		return;
	loading.show();
	globalize.getCoreDictionary(Lang).then((dictionary) => {
		let html;
		if (dictionary) {
			html = dictionary['HeaderSubtitleAppearance'] || '';
			if (html) html += '<br>';
			html += dictionary['TheseSettingsAffectSubtitlesOnThisDevice'] || '';
			// Case when both keys are missing, first try an alternate key
			if (!html) 
				html = dictionary['LabelPreferredSubtitleLanguage'] || '';
		}
		// If it's not available, use the language's native name.
		if (!html) {
			let match = cultures.matchCulture(Lang);
			if (match)
				html = match.displayNativeName || '';
		}
		// As a last resort, use the current display language 
		// and the source (fallback) language (en-US) if it too fails.
		if (!html)
			html = globalize.translate('HeaderSubtitleAppearance') 
					+ '<br>' 
					+ globalize.translate('TheseSettingsAffectSubtitlesOnThisDevice');
		preview.innerHTML = html;

		loading.hide();
	});
}

function showSubtitlePreview(persistent) {
    clearTimeout(this.subtitlePreviewTimer);

    this._fullPreview.classList.remove('subtitleappearance-fullpreview-hide');

    if (persistent) {
        this._refFullPreview++;
    }

    if (this._refFullPreview === 0) {
        this.subtitlePreviewTimer = setTimeout(hideSubtitlePreview.bind(this), this.subtitlePreviewDelay);
    }
}

function hideSubtitlePreview(persistent) {
    clearTimeout(this.subtitlePreviewTimer);

    if (persistent && this._refFullPreview > 0) {
        this._refFullPreview--;
    }

    if (this._refFullPreview === 0) {
        this._fullPreview.classList.add('subtitleappearance-fullpreview-hide');
    }
}

function embed(self) {
	let options = self.options;
	const context = self.options.element;
	const appearanceSettings = self.appearanceSettings;
	const user = self.currentUser;
	const allCultures = cultures.getCultures();
	
	context.classList.add('subtitlesettings');
	context.innerHTML = globalize.translateHtml(template, 'core');
	
	settingsHelper.populateSubsPresets(context.querySelector('#selectSubtitlePreset'), appearanceSettings.preset);
	settingsHelper.populateSubsLanguages(context.querySelector('#selectSubtitleLanguage'), allCultures, "displayNativeName", 
		user.Configuration.SubtitleLanguagePreference || '');
	settingsHelper.populateColors(context.querySelector('#inputTextColor'));
	settingsHelper.populateColors(context.querySelector('#inputTextBackground'));
	settingsHelper.populateColors(context.querySelector('#inputTextStroke'));
	settingsHelper.populateColors(context.querySelector('#inputShadowColor'));
	
	context.querySelector('form').addEventListener('submit', self.onSubmit.bind(self));
	context.querySelector('#selectSubtitlePreset').addEventListener('change', onSubPresetChange);
    context.querySelector('#selectSubtitlePlaybackMode').addEventListener('change', onSubtitleModeChange);
	context.querySelector('#selectSubtitleLanguage').addEventListener('change', onLanguageFieldChange);
    context.querySelector('#selectDropShadow').addEventListener('change', onAppearanceFieldChange);
    context.querySelector('#selectFont').addEventListener('change', onAppearanceFieldChange);
    context.querySelector('#inputTextColor').addEventListener('change', onAppearanceFieldChange);
    context.querySelector('#inputTextBackground').addEventListener('change', onAppearanceFieldChange);
	context.querySelector('#inputTextStroke').addEventListener('change', onAppearanceFieldChange);
	context.querySelector('#inputShadowColor').addEventListener('change', onAppearanceFieldChange);
	context.querySelector('#inputShadowColor').addEventListener('change', cancelPreset);
	context.querySelector('#inputTextBackground').addEventListener('change', cancelPreset);
	context.querySelector('#inputTextStroke').addEventListener('change', cancelPreset);
	context.querySelector('#inputTextColor').addEventListener('change', cancelPreset);
	context.querySelector('#selectFont').addEventListener('change', cancelPreset);
	context.querySelector('#sliderOblique').addEventListener('change', onSliderChange);
	context.querySelector('#sliderOblique').addEventListener('change', cancelPreset);
	context.querySelector('#sliderTextSize').addEventListener('change', onSliderChange);
	context.querySelector('#sliderTextSize').addEventListener('change', cancelPreset);
	context.querySelector('#sliderStrokeSize').addEventListener('change', onSliderChange);
	context.querySelector('#sliderStrokeSize').addEventListener('change', cancelPreset);
	context.querySelector('#sliderOblique').addEventListener('input', onAppearanceFieldChange);
	context.querySelector('#sliderTextSize').addEventListener('input', onAppearanceFieldChange);
	context.querySelector('#sliderStrokeSize').addEventListener('input', onAppearanceFieldChange);
	
	if (appHost.supports('subtitleburnsettings') && user.Policy.EnableVideoPlaybackTranscoding) 
		context.querySelector('.fldBurnIn').classList.remove('hide');
	
	context.querySelector('.btnSave').classList.toggle('hide', !options.enableSaveButton);

	if (appHost.supports('subtitleappearancesettings')) {
		context.querySelector('.subtitleAppearanceSection').classList.remove('hide');

		self._fullPreview = context.querySelector('.subtitleappearance-fullpreview');
		context.querySelector('#sliderVerticalPosition').addEventListener('input', onAppearanceFieldChange);
		context.querySelector('#sliderVerticalPosition').addEventListener('input', () => showSubtitlePreview.call(self));

		const eventPrefix = window.PointerEvent ? 'pointer' : 'mouse';
		context.querySelector('#sliderVerticalPosition').addEventListener(`${eventPrefix}enter`, () => showSubtitlePreview.call(self, true));
		context.querySelector('#sliderVerticalPosition').addEventListener(`${eventPrefix}leave`, () => hideSubtitlePreview.call(self, true));
		if (layoutManager.tv) {
			context.querySelector('#sliderVerticalPosition').addEventListener('focus', () => showSubtitlePreview.call(self, true));
			context.querySelector('#sliderVerticalPosition').addEventListener('blur', () => hideSubtitlePreview.call(self, true));
		}

		context.querySelector('.chkPreview').addEventListener('change', (e) => {
			onAppearanceFieldChange(e);
			if (e.target.checked)
				showSubtitlePreview.call(self, true);
			else
				hideSubtitlePreview.call(self, true);
		});
	}

	setTimeout(() => {self.loadData();}, 100);

	if (options.autoFocus)
		focusManager.autoFocus(context);
}

export class SubtitleSettings {
    constructor(options) {
        this.options = options;
		this.subtitlePreviewDelay = 1000;
		this.subtitlePreviewTimer = undefined;
		this.currentUser = options.currentUser;
		this.adminEdit = options.adminEdit;
		this.appearanceSettings = options.userSettings.getSubtitlesAppearance();
        embed(this);
    }

	loadData(autoFocus) {
		loading.show();
		
		this._refFullPreview = 0;
		loadForm(this);
		if (autoFocus)
			focusManager.autoFocus(this.options.element);
		loading.hide();
	}
	
    submit() {
        this.onSubmit(null);
    }

    destroy() {
        this.options = null;
    }

    onSubmit(e) {
		loading.show();	
		save(this);

        // Disable default form submission
        if (e)
            e.preventDefault();
		
        return false;
    }
}

export default SubtitleSettings;
