import globalize from '../scripts/globalize';
import cultures from '../scripts/cultures';
import datetime from '../scripts/datetime';
import indicators from './indicators/indicators';

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
 
export function populateDictionaries(select, languages, view, val, ban) {
	let activeLang = { "DisplayName": "", "ISO6391": "" };
	let ccodeSrc = globalize.getSourceCulture();
	let lang = val? val: globalize.getDefaultCulture().ccode; 
	let order = Object.keys(languages);
	
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase();
		let fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	// Remove previous options but preserve special options such as 'none', 'auto', ...
	Array.from(select.options).forEach( function(opt) {
		if (opt.value !== '' && opt.value !== 'none' && !opt.disabled)
			opt.remove();
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
			
			if (ban && ban === ISOName)
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

// Refresh the recap window containing the progress bar for the aggregate language.
export function showAggregateInfo(x) {
	const node = x.parentElement?.parentElement?.parentElement;
	if (!node)
		return;
	const lang_info = node.querySelector('#langInfoArea');
	let lang = node.querySelector('.selectLanguage')?.value;
	let lang_alt = node.querySelector('.selectLanguageAlt')?.value;
	if (!lang || !lang_alt)
		return;
	const srcCode = globalize.getSourceCulture();
	
	// Auto mode
	if (lang === '')
		lang = globalize.getDefaultCulture().ccode;
	
	globalize.getCoreDictionary(srcCode).then((srcLangKeys) => {
		globalize.getCoreDictionary(lang).then((eLangKeys) => {
			globalize.getCoreDictionary(lang_alt).then((dic) => {
				let completeness = 0;
				let completeness_alt = 0;
				let completeness_agg = 0;
				
				if (lang_alt !== 'none') {
					const srcKeys = Object.keys(srcLangKeys);
					const srcKeys_total = srcKeys.length;
					//const srcKeys_done = srcKeys.filter(k => k in dic || k in eLangKeys).length;
					let srcKeys_done = srcKeys.filter(k => k in eLangKeys).length;
					completeness = (srcKeys_done / srcKeys_total) * 100;
					
					let srcKeys_done_alt = srcKeys.filter(k => !(k in eLangKeys) && (k in dic)).length;
					completeness_alt = (srcKeys_done_alt / srcKeys_total) * 100;
					
					let srcKeys_done_agg = srcKeys.filter(k => (k in dic) || (k in eLangKeys)).length;
					completeness_agg = ((srcKeys_done_alt + srcKeys_done) / srcKeys_total) * 100;
					
					lang_info.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtmlEx(completeness, completeness_alt);
					lang_info.querySelector('.langProgressValue').innerHTML = completeness_agg.toFixed(2) + '% ';
				} else {
					const eLang = cultures.getDictionary(lang);
					completeness = eLang["completed%"];
					lang_info.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtml(completeness);
					lang_info.querySelector('.langProgressValue').innerHTML = completeness.toFixed(2) + '% ';
				}
				
				if (completeness === 100 || completeness_agg === 100)
					lang_info.querySelector('.doneIcon').classList.remove('hide');
				else
					lang_info.querySelector('.doneIcon').classList.add('hide'); 
			});
		});
	});
}

// Refresh the progress bar lying underneath the language widgets.
export function showLangProgress(x, alt) {
	if (!x)
		return;
	const node = x.parentNode;
	let lang = x.value;
	
	// No language.
	if (lang === 'none') {
		node.querySelector('.langProgressCode').innerHTML = '';
		node.querySelector('.langProgressBar').innerHTML = '';
		node.querySelector('.langProgressValue').innerHTML = '';
		return;
	}
	// Auto mode
	if (lang === '')
		lang = globalize.getDefaultCulture().ccode;

	let eLang = cultures.getDictionary(lang);
	node.querySelector('.langProgressCode').innerHTML = eLang["ISO6391"];
	node.querySelector('.langProgressBar').innerHTML = indicators.getProgressHtml(eLang["completed%"], alt? {'alt': true}: {});
	node.querySelector('.langProgressValue').innerHTML = eLang["completed%"] + '% ';
}

export default {
    populateLanguages: populateLanguages,
	populateServerLanguages: populateServerLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries,
	showAggregateInfo: showAggregateInfo,
	showLangProgress: showLangProgress
};
