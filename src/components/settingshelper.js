import globalize from '../scripts/globalize';
import cultures from '../scripts/cultures';
import datetime from '../scripts/datetime';
import indicators from './indicators/indicators';
import skinManager from '../scripts/themeManager';
import layoutManager from './layoutManager';
import { pluginManager } from './pluginManager';

/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages, view, val) {
	let order = Object.keys(languages);
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase(),
			fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	// Remove previous options but preserve special options such as 'none', 'Auto', ...
	Array.from(select.options).forEach( function(opt) {
		if (opt.value !== '' && opt.value !== 'none' && !opt.disabled)
			opt.remove();
	});
	
	order.forEach(item => {
		let ISOName = languages[item].ISO6391;
		let w = document.createElement("option");
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This seems to be the case for swiss German and a few others.
		if (!ISOName)
			ISOName = languages[item].ISO6392;
		
		if (ISOName) {
			
			w.value = ISOName;
			w.asideText = `${ISOName}`;
			
			if (val && val === ISOName) 
				w.selected = true;
			
			w.text = languages[item][view];
			select.options.add(w, undefined); 
		}
	});
}

export function populateServerLanguages(select, languages, view, val) {
   
	let order = Object.keys(languages);
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase(),
			fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	// Remove previous options but preserve special options such as 'none', 'Auto', ...
	Array.from(select.options).forEach( function(opt) {
		if (opt.value !== '' && opt.value !== 'none' && !opt.disabled)
			opt.remove();
	});
	
	order.forEach(item => {
		let ISOName = languages[item].TwoLetterISOLanguageName;
		let w = document.createElement("option");
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This seems to be the case for swiss German and a few others.
		if (!ISOName)
			ISOName = languages[item].ThreeLetterISOLanguageName;
		
		if (ISOName) {
			w.value = ISOName;
			w.asideText = `${ISOName}`;
			
			if (val && val === ISOName) 
				w.selected = true;
			
			w.text = languages[item][view];
			select.options.add(w, undefined); 
		}
	});
}

/**
 * Helper for creating a list of available themes.
 * @module components/settingsHelper
 */
 
export function populateThemes(select, selectedTheme) {
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
			
			let w = document.createElement("option");
			if (layoutManager.tv) {
				w.divider = x;
				select.options.add(w, undefined);
			} else {
				w.text = "-------------\u00A0\u00A0\u00A0" + x;
				w.disabled = true;
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
		if (selectedTheme === 'Auto' || selectedTheme === 'none')
			return;
		
		// If for some reasons selectedTheme doesn't exist anymore (eg. theme was renamed/deleted),
		// the value field of the selection will be set to the id of the default theme defined in 'config.json'.
	
		skinManager.getThemeStylesheetInfo(selectedTheme).then(function (info) {
			select.value = info.themeId}); 
	});
}

/**
 * Helper for creating a list of available screensavers.
 * @module components/settingsHelper
 */
 
export function populateScreensavers(select, val) {
	const options = pluginManager.ofType('screensaver').map( ss => {
		return {
			name: ss.name,
			value: ss.id,
			version: ss.version || '',
			description: ss.description || '',
			group: ss.group
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

/**
 * Helper for creating a list of available colors.
 * @module components/settingsHelper
 */
 
 const HTML_COLOR_NAMES = [
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

export function populateColors(x) {
	const divider = globalize.translate('OptionDivider');
	for (const COLOR of HTML_COLOR_NAMES) {
		let w = document.createElement("option");

		if (COLOR === false) {
			w.text = divider;
			w.disabled = true;
			x.options.add(w, undefined); 
			continue;
		}

		w.text = COLOR;
		w.value = COLOR;
		w.asideText =  `<div style="width: 2.8em;height: 1.6em;border-radius: 5px 5px 5px;border: 1px solid LightSkyBlue;background-color: ${COLOR}"></div>`;
		x.options.add(w, undefined); 
	}
}

/**
 * Helper for creating a list of available subtitles presets.
 * @module components/settingsHelper
 */
 
export function populateSubsPresets(select, val) {
	skinManager.getPresets().then(presets => {
		presets.sort((a, b) => {
			let fa = a.name.toLowerCase(),
				fb = b.name.toLowerCase();
			if (fa < fb) 
				return -1;
			if (fa > fb) 
				return 1;
			return 0;
		});

		presets.forEach(t => {
			let z = document.createElement("option");
			if (t.default)
				z.icon = 'star';
			z.value = t.id;
			z.text = t.name;
			select.options.add(z, undefined);
		});
		select.value = val || '';
	});
}

/**
 * Helper for creating a list of available subtitles languages.
 * @module components/settingsHelper
 */

export function populateSubsLanguages(select, languages, view, val) {
   
	let order = Object.keys(languages);
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase(),
			fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});

	order.forEach(item => {
		let ISO6392 = languages[item].ISO6392;
		let ISO6391 = languages[item].ISO6391;
		let w = document.createElement("option");
				
		w = document.createElement("option");
		w.value = ISO6392;
		w.asideText = `${ISO6392}`;
		w.setAttribute('ISO6391', ISO6391);
		if (val && val === ISO6392)
			w.selected = true;

		w.text = languages[item][view];
		select.options.add(w, undefined); 
	});
}

/**
 * Helper for creating a list of available dictionaries.
 * @module components/settingsHelper
 */
 
export function populateDictionaries(select, languages, view, val, exclude) {
	let activeLang = { "DisplayName": "", "ISO6391": "" };
	let ccodeSrc = globalize.getSourceCulture();
	let lang = val? val: globalize.getDefaultCulture().ccode; 
	let order = Object.keys(languages);
	
	// This function can be called multiple times so we need
	// to remove previous content with the exception of static options such as 'none', 'Auto', ...
	Array.from(select.options).forEach( (opt) => {
		if (opt.value !== '' && opt.value !== 'none' && !opt.disabled)
			opt.remove();
	});
	
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase();
		let fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	order.forEach(item => {
		// We do not list empty dictionaries.
		if (languages[item]['jellyfinWeb']['keys#']) {
			
			// Some cultures appear to have a three letters code (ISO 639-2) only.
			// This is the case for swiss German and a few others.
			let ISOName = languages[item].ISO6391;
			if (!ISOName) {
				if (languages[item].ISO6392)
					ISOName = languages[item].ISO6392;
				if (!ISOName)
					return;
			}
			
			if (exclude && exclude === ISOName)
				return;
			
			if (lang && lang === ISOName) {
				activeLang = languages[item];
				activeLang.ISO6391 = ISOName;
			}
			
			let w = document.createElement("option");
			w.value = ISOName;
			w.asideText = `${ISOName}`;
			if (ccodeSrc === w.value)
				w.icon = 'hub';
			
			if (val && val === ISOName)
				w.selected = true;
			
			w.text = languages[item][view];
			select.options.add(w, undefined); 
		
		}
	});	
}

// Refresh the lang area window containing some statistics for the languages selected.
export function showAggregateInfo(x) {
	const node = x.parentElement?.parentElement?.parentElement;
	if (node === undefined)
		return;
	let lang = node.querySelector('.selectLanguage')?.value;
	let lang_alt = node.querySelector('.selectLanguageAlt')?.value;
	if (lang === undefined || lang_alt === undefined)
		return;
	
	// Auto mode
	if (lang === '')
		lang = globalize.getDefaultCulture().ccode;
	
	const srcCode = globalize.getSourceCulture();
	const usrMeta = cultures.getDictionary(lang);
	const srcMeta = cultures.getDictionary(srcCode);
	
	globalize.getCoreDictionary(srcCode).then((srcDic) => {
		globalize.getCoreDictionary(lang).then((usrDic) => {
			globalize.getCoreDictionary(lang_alt).then((usrAltDic) => {
				let usrDone = 0;
				let usrDoneAlt = 0;
				let usrDoneAgg = 0;
				
				if (lang_alt !== 'none') {
					const agg_info = node.querySelector('#aggregateInfo');
					const srcKeys = Object.keys(srcDic);
					const srcKeysCnt = srcMeta["keys#"];
					
					const usrKeysCnt = srcKeys.filter(k => k in usrDic).length;
					usrDone = (usrKeysCnt / srcKeysCnt) * 100;
					const usrKeysAltCnt = srcKeys.filter(k => !(k in usrDic) && (k in usrAltDic)).length;
					usrDoneAlt = (usrKeysAltCnt / srcKeysCnt) * 100;
					const usrKeysAggCnt = Math.min(usrKeysAltCnt + usrKeysCnt, srcKeysCnt);
					usrDoneAgg = (usrKeysAggCnt / srcKeysCnt) * 100;
					
					agg_info.querySelector('.langProgressStats').innerHTML = usrKeysAggCnt + '/' + srcKeysCnt;
					agg_info.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtmlEx(usrDone, usrDoneAlt);
					if (usrDoneAgg === 100) {
						agg_info.querySelector('.langProgressValue').querySelector('.number').classList.add('hide');
						agg_info.querySelector('.langProgressValue').querySelector('.doneIcon').classList.remove('hide');
					} else {
						agg_info.querySelector('.langProgressValue').querySelector('.number').innerHTML = parseFloat(usrDoneAgg.toFixed(2)) + '% ';
						agg_info.querySelector('.langProgressValue').querySelector('.doneIcon').classList.add('hide');
						agg_info.querySelector('.langProgressValue').querySelector('.number').classList.remove('hide');
					}
					
					node.querySelector('#langInfo').classList.add('hide');
					node.querySelector('#aggregateInfo').classList.remove('hide');
				} else {
					const lang_info = node.querySelector('#langInfo');
					
					usrDone = usrMeta["jellyfinWeb"]["completed%"];
					lang_info.querySelector('.langProgressStats').innerHTML = usrMeta["jellyfinWeb"]["keys#"] + '/' + srcMeta["jellyfinWeb"]["keys#"];
					lang_info.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtml(usrDone);
					const jf = lang_info.querySelector('.langProgressValue');
					if (usrDone === 100) {
						jf.querySelector('.number').classList.add('hide');
						jf.querySelector('.doneIcon').classList.remove('hide');
					} else {
						jf.querySelector('.doneIcon').classList.add('hide');
						jf.querySelector('.number').innerHTML = parseFloat(usrDone.toFixed(2)) + '% ';
						jf.querySelector('.number').classList.remove('hide');
					}
					
					usrDone = usrMeta["myJelly"]["completed%"];
					lang_info.querySelector('.mj_langProgressStats').innerHTML = usrMeta["myJelly"]["keys#"] + '/' + srcMeta["myJelly"]["keys#"];
					lang_info.querySelector('.mj_langProgressBar').innerHTML = indicators.getProgressHtml(usrDone);
					const mj = lang_info.querySelector('.mj_langProgressValue');
					if (usrDone === 100) {
						mj.querySelector('.number').classList.add('hide');
						mj.querySelector('.doneIcon').classList.remove('hide');
					} else {
						mj.querySelector('.doneIcon').classList.add('hide');
						mj.querySelector('.number').innerHTML = parseFloat(usrDone.toFixed(2)) + '% ';
						mj.querySelector('.number').classList.remove('hide');
					}
					
					node.querySelector('#aggregateInfo').classList.add('hide');
					lang_info.classList.remove('hide');
				}
			});
		});
	});
}

// Refresh the progress bar underneath the language widgets.
export function showLangProgress(x, alt) {
	if (!x)
		return;
	const node = x.parentNode;
	let usrCode = x.value;
	const srcCode = globalize.getSourceCulture();
	
	// No selection.
	if (usrCode === 'none') {
		node.querySelector('.langProgressCode').innerHTML = '';
		node.querySelector('.langProgressStats').innerHTML = '';
		node.querySelector('.langProgressBar').innerHTML = '';
		node.querySelector('.langProgressValue').innerHTML = '';
		return;
	}
	// Auto mode
	if (usrCode === '')
		usrCode = globalize.getDefaultCulture().ccode;

	const usrMeta = cultures.getDictionary(usrCode);
	const srcMeta = cultures.getDictionary(srcCode);
	node.querySelector('.langProgressCode').innerHTML = usrMeta["ISO6391"];
	node.querySelector('.langProgressStats').innerHTML = usrMeta["keys#"] + '/' + srcMeta["keys#"];
	node.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtml(usrMeta["completed%"], alt? {'alt': true}: {});
	node.querySelector('.langProgressValue').innerHTML = usrMeta["completed%"] + '% ';
}

export default {
	populateLanguages: populateLanguages,
	populateThemes: populateThemes,
	populateScreensavers: populateScreensavers,
	populateServerLanguages: populateServerLanguages,
	populateColors: populateColors,
	populateSubsPresets: populateSubsPresets,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries,
	showAggregateInfo: showAggregateInfo,
	showLangProgress: showLangProgress
};
