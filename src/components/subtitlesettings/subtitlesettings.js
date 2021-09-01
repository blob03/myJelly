import globalize from '../../scripts/globalize';
import { appHost } from '../apphost';
import appSettings from '../../scripts/settings/appSettings';
import focusManager from '../focusManager';
import layoutManager from '../layoutManager';
import loading from '../loading/loading';
import subtitleAppearanceHelper from './subtitleappearancehelper';
import settingsHelper from '../settingshelper';
import dom from '../../scripts/dom';
import { Events } from 'jellyfin-apiclient';
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

const CSS_COLOR_NAMES = [
"Transparent",
"Black",
"White",

false,
// red color names

"IndianRed",
"LightCoral",
"Salmon",
"DarkSalmon",
"LightSalmon",
"Crimson",
"Red",
"FireBrick",
"DarkRed",

false,
// orange color names

"Coral",
"Tomato",
"OrangeRed",
"DarkOrange",
"Orange",

false,
// pink color names

"Pink",
"LightPink",
"HotPink",
"DeepPink",
"MediumVioletRed",
"PaleVioletRed",

false,
// purple color names

"Lavender",
"Thistle",
"Plum",
"Violet",
"Orchid",
"Fuchsia",
"Magenta",
"MediumOrchid",
"MediumPurple",
"BlueViolet",
"DarkViolet",
"DarkOrchid",
"DarkMagenta",
"Purple",
"Indigo",
"SlateBlue",
"DarkSlateBlue",

false,
// gray color names

"Gainsboro",
"LightGray",
"Silver",
"DarkGray",
"Gray",
"DimGray",
"LightSlateGray",
"SlateGray",
"DarkSlateGray",

false,
// green color names

"GreenYellow",
"Chartreuse",
"LawnGreen",
"Lime",
"LimeGreen",
"PaleGreen",
"LightGreen",
"MediumSpringGreen",
"SpringGreen",
"MediumSeaGreen",
"seaGreen",
"ForestGreen",
"Green",
"DarkGreen",
"YellowGreen",
"OliveDrab",
"Olive",
"DarkOliveGreen",
"MediumAquaMarine",
"DarkSeaGreen",
"LightSeaGreen",
"DarkCyan",
"Teal",

false,
// brown color names

"CornSilk",
"BlanchedAlmond",
"Bisque",
"NavajoWhite",
"Wheat",
"BurlyWood",
"Tan",
"RosyBrown",
"SandyBrown",
"GoldenRod",
"DarkGoldenRod",
"Peru",
"Chocolate",
"SaddleBrown",
"Sienna",
"Brown",
"Maroon",

false,
// blue color names

"Aqua",
"Cyan",
"LightCyan",
"PaleTurquoise",
"Aquamarine",
"Turquoise",
"MediumTurquoise",
"DarkTurquoise",
"CadetBlue",
"SteelBlue",
"LightSteelBlue",
"PowderBlue",
"LightBlue",
"SkyBlue",
"LightSkyBlue",
"DeepSkyBlue",
"DodgerBlue",
"CornflowerBlue",
"MediumSlateBlue",
"RoyalBlue",
"Blue",
"MediumBlue",
"DarkBlue",
"Navy",
"MidnightBlue",

false,
// yellow color names

"Gold",
"Yellow",
"LightYellow",
"LemonChiffon",
"LightGoldenRodYellow",
"PapayaWhip",
"Moccasin",
"PeachPuff",
"PaleGoldenRod",
"Khaki",
"DarkKhaki",

false,
// white color names

"Snow",
"HoneyDew",
"MintCream",
"Azure",
"AliceBlue",
"GhostWhite",
"WhiteSmoke",
"SeaShell",
"Beige",
"OldLace",
"FloralWhite",
"Ivory",
"AntiqueWhite",
"Linen",
"LavenderBlush",
"MistyRose"

];

function loadColors(context) {
	const subColor = context.querySelector('#inputTextColor');
	const subBGcolor = context.querySelector('#inputTextBackground');
	const subSTRcolor = context.querySelector('#inputTextStroke');
	
	var i = 0;
	
	for (const COLOR of CSS_COLOR_NAMES) {
		let x = document.createElement("option");
		let y = document.createElement("option");
		let z = document.createElement("option");
		
		if (COLOR === false) {
			x.text = globalize.translate('OptionDivider');
			x.disabled = true;
			subColor.options.add(x, undefined); 
		
			y.text = globalize.translate('OptionDivider');
			y.disabled = true;
			subBGcolor.options.add(y, undefined); 
			
			z.text = globalize.translate('OptionDivider');
			z.disabled = true;
			subSTRcolor.options.add(z, undefined); 
			
			continue;
		}
		
		y.text = COLOR;
		y.value = COLOR;
		y.asideText =  `<div style="width: 2.8em;height: 1.6em;border-radius: 5px 5px 5px;border: 1px solid LightSkyBlue;background-color: ${COLOR}"></div>`;
		subBGcolor.options.add(y, undefined); 
		
		z.text = COLOR;
		z.value = COLOR;
		z.asideText =  `<div style="width: 2.8em;height: 1.6em;border-radius: 5px 5px 5px;border: 1px solid LightSkyBlue;background-color: ${COLOR}"></div>`;
		subSTRcolor.options.add(z, undefined);
		
		if (!i) {
			++i;
			continue;
		}
		
		x.text = COLOR;
		x.value = COLOR;
		x.asideText =  `<div style="width: 2.8em;height: 1.6em;border-radius: 5px 5px 5px;border: 1px solid LightSkyBlue;background-color: ${COLOR}"></div>`;
		subColor.options.add(x, undefined); 
	}
}
	
function getSubtitleAppearanceObject(context) {
    const appearanceSettings = {};

    appearanceSettings.textSize = context.querySelector('#sliderTextSize').value;
	appearanceSettings.strokeSize = context.querySelector('#sliderStrokeSize').value;
    appearanceSettings.dropShadow = context.querySelector('#selectDropShadow').value;
    appearanceSettings.font = context.querySelector('#selectFont').value;
    appearanceSettings.textBackground = context.querySelector('#inputTextBackground').value;
	appearanceSettings.textStroke = context.querySelector('#inputTextStroke').value;
    appearanceSettings.textColor = context.querySelector('#inputTextColor').value;
    appearanceSettings.verticalPosition = context.querySelector('#sliderVerticalPosition').value;
	appearanceSettings.chkPreview = context.querySelector('#chkPreview').checked;
	appearanceSettings.chkTextStyle = context.querySelector('#chkTextStyle').checked;
	
    return appearanceSettings;
}

function onTextSizeChange(e) {
	const pnode = e.target.parentNode.parentNode;
	if (pnode) 
		pnode.querySelector('.fieldDescription').innerHTML = e.target.value;
}

function loadForm(context, user, userSettings, appearanceSettings, apiClient) {
  
	var event = new Event('change');
		
	apiClient.getCultures().then(function (allCultures) {
			if (appHost.supports('subtitleburnsettings') && user.Policy.EnableVideoPlaybackTranscoding) {
				context.querySelector('.fldBurnIn').classList.remove('hide');
        }

        context.querySelector('#selectDropShadow').value = appearanceSettings.dropShadow || '';
		
		loadColors(context);
        context.querySelector('#inputTextBackground').value = appearanceSettings.textBackground || 'Transparent';
		context.querySelector('#inputTextStroke').value = appearanceSettings.textStroke || 'Transparent';
        context.querySelector('#inputTextColor').value = appearanceSettings.textColor || 'White';
		context.querySelector('#bgcolor').style.backgroundColor = context.querySelector('#inputTextBackground').value;
		context.querySelector('#strcolor').style.backgroundColor = context.querySelector('#inputTextStroke').value;
		context.querySelector('#fcolor').style.backgroundColor = context.querySelector('#inputTextColor').value;
        context.querySelector('#selectFont').value = appearanceSettings.font || '';
        context.querySelector('#sliderVerticalPosition').value = appearanceSettings.verticalPosition;
		context.querySelector('#chkTextStyle').checked = appearanceSettings.chkTextStyle;
        context.querySelector('#selectSubtitleBurnIn').value = appSettings.get('subtitleburnin') || '';
		context.querySelector('#chkPreview').checked = appearanceSettings.chkPreview;
		context.querySelector('#chkPreview').dispatchEvent(event);
		
		let event_input = new Event('input');
		let event_change = new Event('change');
		let sliderTextSize =  context.querySelector('#sliderTextSize');
		sliderTextSize.addEventListener('input', onTextSizeChange);
		sliderTextSize.value = appearanceSettings.textSize || 1.36;
		sliderTextSize.dispatchEvent(event_input);
		sliderTextSize.dispatchEvent(event_change);
		
		let sliderStrokeSize =  context.querySelector('#sliderStrokeSize');
		sliderStrokeSize.addEventListener('input', onTextSizeChange);
		sliderStrokeSize.value = appearanceSettings.strokeSize || 1;
		sliderStrokeSize.dispatchEvent(event_input);
		sliderStrokeSize.dispatchEvent(event_change);
	
		let selectSubtitlePlaybackMode = context.querySelector('#selectSubtitlePlaybackMode');
		selectSubtitlePlaybackMode.value = user.Configuration.SubtitleMode || '';
		selectSubtitlePlaybackMode.dispatchEvent(event);
	
		let selectSubtitleLanguage = context.querySelector('#selectSubtitleLanguage');
        settingsHelper.populateLanguages(selectSubtitleLanguage, allCultures);
		selectSubtitleLanguage.value = user.Configuration.SubtitleLanguagePreference || '';		
		selectSubtitleLanguage.dispatchEvent(event);

        loading.hide();
    });
}

function saveUser(context, user, userSettingsInstance, appearanceKey, apiClient) {
    let appearanceSettings = userSettingsInstance.getSubtitleAppearanceSettings(appearanceKey);
    appearanceSettings = Object.assign(appearanceSettings, getSubtitleAppearanceObject(context));

    userSettingsInstance.setSubtitleAppearanceSettings(appearanceSettings, appearanceKey);

    user.Configuration.SubtitleLanguagePreference = context.querySelector('#selectSubtitleLanguage').value;
    user.Configuration.SubtitleMode = context.querySelector('#selectSubtitlePlaybackMode').value;
		
    return apiClient.updateUserConfiguration(user.Id, user.Configuration);
}

function save(instance, context, userId, userSettings, apiClient, enableSaveConfirmation) {
    loading.show();

    appSettings.set('subtitleburnin', context.querySelector('#selectSubtitleBurnIn').value);

    apiClient.getUser(userId).then(function (user) {
        saveUser(context, user, userSettings, instance.appearanceKey, apiClient).then(function () {
            loading.hide();
            if (enableSaveConfirmation) {
                toast(globalize.translate('SettingsSaved'));
            }

            Events.trigger(instance, 'saved');
        }, function () {
            loading.hide();
        });
    });
}

function onSubtitleModeChange(e) {
    const view = dom.parentWithClass(e.target, 'subtitlesettings');

    const subtitlesHelp = view.querySelectorAll('.subtitlesHelp');
    for (let i = 0, length = subtitlesHelp.length; i < length; i++) {
        subtitlesHelp[i].classList.add('hide');
    }
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
	const Lang = document.getElementById('selectSubtitleLanguage').value;
	if (!Lang)
		return;
    const view = dom.parentWithClass(e.target, 'subtitlesettings');
	let preview = view.querySelector('.subtitleappearance-fullpreview-text');
	if (!preview)  
		return;
	
	loading.show();
	
	globalize.getCoreDictionary(Lang).then(
	(dictionary) => {
		if (!dictionary) {
			loading.hide();
			return;
		}
		let html;
		let key = dictionary['HeaderSubtitleAppearance'];
		if (key)
			html = key;
		key = dictionary['TheseSettingsAffectSubtitlesOnThisDevice'];
		if (key) {
			if (html)
				html += '<br>';
			html += key;
		}
		// Case when both translations are missing
		// We try a key of last resort.
		if (!html) {
			key = dictionary['LabelPreferredSubtitleLanguage'];
			if (key)
				html = key;
		}
		if (html)
			preview.innerHTML = html;
		loading.hide();
	}, () => {
		loading.hide();
    });
}

const subtitlePreviewDelay = 1000;
let subtitlePreviewTimer;

function showSubtitlePreview(persistent) {
    clearTimeout(subtitlePreviewTimer);

    this._fullPreview.classList.remove('subtitleappearance-fullpreview-hide');

    if (persistent) 
		++this._refFullPreview;
    if (this._refFullPreview === 0) 
        subtitlePreviewTimer = setTimeout(hideSubtitlePreview.bind(this), subtitlePreviewDelay);
}

function hideSubtitlePreview(persistent) {
    clearTimeout(subtitlePreviewTimer);

    if (persistent) {
		if (--this._refFullPreview < 0)
			this._refFullPreview = 0;
    }
    if (this._refFullPreview === 0) 
        this._fullPreview.classList.add('subtitleappearance-fullpreview-hide');
}

function embed(options, self) {
    options.element.classList.add('subtitlesettings');
    options.element.innerHTML = globalize.translateHtml(template, 'core');

    options.element.querySelector('form').addEventListener('submit', self.onSubmit.bind(self));

    options.element.querySelector('#selectSubtitlePlaybackMode').addEventListener('change', onSubtitleModeChange);
	options.element.querySelector('#selectSubtitleLanguage').addEventListener('change', onLanguageFieldChange);
    options.element.querySelector('#selectDropShadow').addEventListener('change', onAppearanceFieldChange);
    options.element.querySelector('#selectFont').addEventListener('change', onAppearanceFieldChange);
    options.element.querySelector('#inputTextColor').addEventListener('change', onAppearanceFieldChange);
    options.element.querySelector('#inputTextBackground').addEventListener('change', onAppearanceFieldChange);
	options.element.querySelector('#inputTextStroke').addEventListener('change', onAppearanceFieldChange);
	options.element.querySelector('#chkTextStyle').addEventListener('change', onAppearanceFieldChange);
	options.element.querySelector('#sliderTextSize').addEventListener('input', onAppearanceFieldChange);
	options.element.querySelector('#sliderTextSize').addEventListener('change', onAppearanceFieldChange);
	options.element.querySelector('#sliderStrokeSize').addEventListener('input', onAppearanceFieldChange);
	options.element.querySelector('#sliderStrokeSize').addEventListener('change', onAppearanceFieldChange);
	
    if (options.enableSaveButton) {
        options.element.querySelector('.btnSave').classList.remove('hide');
    }

    if (appHost.supports('subtitleappearancesettings')) {
        options.element.querySelector('.subtitleAppearanceSection').classList.remove('hide');

        self._fullPreview = options.element.querySelector('.subtitleappearance-fullpreview');
        self._refFullPreview = 0;

        const sliderVerticalPosition = options.element.querySelector('#sliderVerticalPosition');
        sliderVerticalPosition.addEventListener('input', onAppearanceFieldChange);
        sliderVerticalPosition.addEventListener('input', () => showSubtitlePreview.call(self));

        const eventPrefix = window.PointerEvent ? 'pointer' : 'mouse';
        sliderVerticalPosition.addEventListener(`${eventPrefix}enter`, () => showSubtitlePreview.call(self, true));
        sliderVerticalPosition.addEventListener(`${eventPrefix}leave`, () => hideSubtitlePreview.call(self, true));

        if (layoutManager.tv) {
            sliderVerticalPosition.addEventListener('focus', () => showSubtitlePreview.call(self, true));
            sliderVerticalPosition.addEventListener('blur', () => hideSubtitlePreview.call(self, true));
        }

        options.element.querySelector('.chkPreview').addEventListener('change', (e) => {
            if (e.target.checked) {
                showSubtitlePreview.call(self, true);
            } else {
                hideSubtitlePreview.call(self, true);
            }
        });
    }

    self.loadData();

    if (options.autoFocus) {
        focusManager.autoFocus(options.element);
    }
}

export class SubtitleSettings {
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

        apiClient.getUser(userId).then(function (user) {
            userSettings.setUserInfo(userId, apiClient).then(function () {
                self.dataLoaded = true;

                const appearanceSettings = userSettings.getSubtitleAppearanceSettings(self.options.appearanceKey);

                loadForm(context, user, userSettings, appearanceSettings, apiClient);
            });
        });
    }

    submit() {
        this.onSubmit(null);
    }

    destroy() {
        this.options = null;
    }

    onSubmit(e) {
        const self = this;
        const apiClient = ServerConnections.getApiClient(self.options.serverId);
        const userId = self.options.userId;
        const userSettings = self.options.userSettings;

        userSettings.setUserInfo(userId, apiClient).then(function () {
            const enableSaveConfirmation = self.options.enableSaveConfirmation;
            save(self, self.options.element, userId, userSettings, apiClient, enableSaveConfirmation);
        });

        // Disable default form submission
        if (e) {
            e.preventDefault();
        }
        return false;
    }
}

export default SubtitleSettings;
