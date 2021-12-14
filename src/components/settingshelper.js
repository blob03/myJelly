import globalize from '../scripts/globalize';
import cultures from '../scripts/cultures';
 
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
 
export function populateDictionaries(select, languages, view, val) {		
	let activeLang = { "DisplayName": "", "ISO6391": "" };
	let ccodeSrc = globalize.getSourceCulture();
	let lang = val? val: globalize.getDefaultCulture(); 
	
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
	
	order.forEach(item => {
		// We do not offer empty dictionaries.
		if (languages[item]['jellyfinWeb']['keys#']) {
			
			let ISOName = languages[item].ISO6391;
			let w = document.createElement("option");
			
			// Some cultures appear to have a three letters code (ISO 639-2) only.
			// This is the case for swiss German and a few others.
			if (!ISOName && languages[item].ISO6392)
				ISOName = languages[item].ISO6392;
			
			if (ISOName) {
				if (lang && lang === ISOName) {
					activeLang = languages[item];
					activeLang.ISO6391 = ISOName;
				}
				
				w.value = ISOName;
				w.asideText = `${ISOName}`;
				if (ccodeSrc === w.value)
					w.icon = 'hub';
				
				if (val && val === ISOName)
					w.selected = true;
				
				w.text = languages[item][view];
				select.options.add(w, undefined); 
			}
		}
	});	
}
// Refresh the window containing the metadata of whatever language is selected.
export function showDictionaryInfo(e) {		
	let ccodeSrc = globalize.getSourceCulture();
	let val = e.target.options[e.target.selectedIndex].value;
	let lang = val? val: globalize.getDefaultCulture(); 
	let activeLang = cultures.getDictionary(lang);
	let srcLang = cultures.getDictionary(ccodeSrc);
				
	let pnode = e.target.parentNode.parentNode;
	if (pnode) {	
		let nodeInfo = pnode.querySelector('.infoDetails');  
		nodeInfo.querySelector('.infoDisplayLanguage').innerHTML = ' ' + activeLang["displayNativeName"] + ' [ ' + activeLang["ISO6391"] + ' ]';
		nodeInfo.querySelector('.infoKeysTranslated').innerHTML = ' ' 
			+ activeLang["completed%"] + '% [ ' 
			+ activeLang["keys#"]
			+ '/' + srcLang["keys#"] + ' ]';
		nodeInfo.querySelector('.infoJellyfinKeysTranslated').innerHTML = ' ' 
			+ activeLang["jellyfinWeb"]["completed%"] + '% [ ' 
			+ activeLang["jellyfinWeb"]["keys#"] + '/' + srcLang["jellyfinWeb"]["keys#"] + ' ]';
		nodeInfo.querySelector('.infoMyjellyKeysTranslated').innerHTML = ' ' 
			+ activeLang["myJelly"]["completed%"] + '% [ ' 
			+ activeLang["myJelly"]["keys#"] + '/' + srcLang["myJelly"]["keys#"] + ' ]';
		
		nodeInfo.querySelector('.warningIcon').classList.add('hide');
		nodeInfo.querySelector('.hubIcon').classList.add('hide'); 
		nodeInfo.querySelector('.doneIcon').classList.add('hide'); 
		
		if (activeLang["completed%"] > 100 || activeLang["jellyfinWeb"]["completed%"] > 100 || activeLang["myJelly"]["completed%"] > 100) {
			nodeInfo.querySelector('.warningIcon').classList.remove('hide');
		} else if (activeLang["ISO6391"] === ccodeSrc) {
			// lang is source.
			nodeInfo.querySelector('.hubIcon').classList.remove('hide'); 
		} else if (activeLang["completed%"] === 100) {
			nodeInfo.querySelector('.doneIcon').classList.remove('hide');
		}
	}		
}

export default {
    populateLanguages: populateLanguages,
	populateServerLanguages: populateServerLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries,
	showDictionaryInfo: showDictionaryInfo
};
