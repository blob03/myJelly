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
		let ISOName3L = languages[item].ThreeLetterISOLanguageName;
		let ISOName2L = languages[item].TwoLetterISOLanguageName;
		let w = document.createElement("option");
				
		w = document.createElement("option");
		w.value = ISOName3L;
		w.asideText = `${ISOName3L}`;
		w.setAttribute('ISOName2L', ISOName2L);
		if (val && val === ISOName3L)
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
	let activeLanguage = { "DisplayName": "", "ISOName": "" };
	let lang = val? val: globalize.getDefaultCulture(); 
	
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
		// This is the case for swiss German and a few others.
		if (!ISOName && languages[item].ThreeLetterISOLanguageName)
			ISOName = languages[item].ThreeLetterISOLanguageName;
		
		if (ISOName) {
			if (lang && lang === ISOName) {
				activeLanguage = languages[item];
				activeLanguage.ISOName = ISOName;
			}
			
			w.value = ISOName;
			w.asideText = `${ISOName}`;

			if (val && val === ISOName)
				w.selected = true;
			
			w.text = languages[item][view];
			select.options.add(w, undefined); 
		}
	});
		
	globalize.getCoreDictionaryProgress(lang).then( (items) => {
		
		let pnode = select.parentNode.parentNode;
		if (pnode) {	
			let nodeInfo = pnode.querySelector('.infoDetails');  
			nodeInfo.querySelector('.infoDisplayLanguage').innerHTML = ' ' + activeLanguage[view] + ' [ ' + activeLanguage.ISOName + ' ]';
			nodeInfo.querySelector('.infoKeysTranslated').innerHTML = ' ' + items.progress + '% [ ' + items.keys + '/' + items.sourceKeys + ' ]';
			nodeInfo.querySelector('.infoJellyfinKeysTranslated').innerHTML = ' ' + items.origProgress + '% [ ' + items.origKeys + '/' + items.origSourceKeys + ' ]';
			nodeInfo.querySelector('.infoMyjellyKeysTranslated').innerHTML = ' ' + items.myProgress + '% [ ' + items.myKeys + '/' + items.mySourceKeys + ' ]';
			
			if (items.progress > 100 || items.origProgress > 100 || items.myProgress > 100) {
				nodeInfo.querySelector('.warningIcon').classList.remove('hide');
			} else if (items.sourceISOName === lang) {
				// lang is source.
				nodeInfo.querySelector('.hubIcon').classList.remove('hide'); 
			} else if (items.progress === 100) {
				nodeInfo.querySelector('.doneIcon').classList.remove('hide');
			}
		}		
	});
}

export default {
    populateLanguages: populateLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries
};
