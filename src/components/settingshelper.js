import globalize from '../scripts/globalize';
import cultures from '../scripts/cultures';
 
/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages, val) {
    let html = '';
	
	languages.sort((a, b) => {
		let fa = a.DisplayNativeName.toLowerCase(),
			fb = b.DisplayNativeName.toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This seems to be the case for swiss German and a few others.
		if (!ISOName && language.ThreeLetterISOLanguageName)
			ISOName = language.ThreeLetterISOLanguageName;
		
		if (ISOName) {
			if (val && val === ISOName) 
				html += "<option value='" + ISOName + "' selected>";
			else
				html += "<option value='" + ISOName + "'>";
			
			html += language.DisplayNativeName + "</option>";
		}
	});
    select.innerHTML += html;
}

/**
 * Helper for creating a list of available subtitles languages.
 * @module components/settingsHelper
 */

export function populateSubsLanguages(select, languages, val) {
    let html = '';
	
	languages.sort((a, b) => {
		let fa = a.DisplayNativeName.toLowerCase(),
			fb = b.DisplayNativeName.toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});

	languages.forEach(language => {
		let ISOName3L = language.ThreeLetterISOLanguageName;
		let ISOName2L = language.TwoLetterISOLanguageName;
		
		if (val && val === ISOName3L) 
			html += "<option ISOName2L='" + ISOName2L + "' value='" + ISOName3L + "' selected>";
		else
			html += "<option ISOName2L='" + ISOName2L + "' value='" + ISOName3L + "'>";
		
		html += language.DisplayNativeName + "</option>";
	});
    select.innerHTML += html;
}

/**
 * Helper for creating a list of available dictionaries.
 * @module components/settingsHelper
 */
 
export function populateDictionaries(select, languages, val) {		
	let html = '';
	let activeLanguage = { "DisplayName": "", "ISOName": "" };
	let lang = (val === '')? globalize.getDefaultCulture(): val; 
	
	languages.sort((a, b) => {
		let fa = a.DisplayNativeName.toLowerCase(),
			fb = b.DisplayNativeName.toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This is the case for swiss German and a few others.
		if (!ISOName && language.ThreeLetterISOLanguageName)
			ISOName = language.ThreeLetterISOLanguageName;
		
		if (ISOName) {
			html += "<option";
			if (lang && lang === ISOName) {
				activeLanguage = language;
				activeLanguage.ISOName = ISOName;
			}
			
			if (val && val === ISOName)
				html += " value='" + ISOName + "' class='selected' selected>";
			else
				html += " value='" + ISOName + "'>";
			
			html += language.DisplayNativeName + "</option>";
		}
	});
	select.innerHTML += html;
		
	globalize.getCoreDictionaryProgress(lang).then( (items) => {
		
		let pnode = select.parentNode.parentNode;
		if (pnode) {	
			let nodeInfo = pnode.querySelector('.infoDetails');  
			nodeInfo.querySelector('.infoDisplayLanguage').innerHTML = ' ' + activeLanguage.DisplayNativeName + ' [ ' + activeLanguage.ISOName + ' ]';
			nodeInfo.querySelector('.infoSourceLanguage').innerHTML = ' ' + items.sourceDisplayName + ' [ ' + items.sourceISOName + ' ]';
			nodeInfo.querySelector('.infoKeysTranslated').innerHTML = ' ' + items.progress + '% [ ' + items.keys + '/' + items.sourceKeys + ' ]';
			nodeInfo.querySelector('.infoJellyfinKeysTranslated').innerHTML = ' ' + items.origProgress + '% [ ' + items.origKeys + '/' + items.origSourceKeys + ' ]';
			nodeInfo.querySelector('.infoMyjellyKeysTranslated').innerHTML = ' ' + items.myProgress + '% [ ' + items.myKeys + '/' + items.mySourceKeys + ' ]';
			
			if (items.progress > 100 || items.origProgress > 100 || items.myProgress > 100) {
				nodeInfo.querySelector('.warningIcon').classList.remove('hide');
				nodeInfo.querySelector('.infoDetailsLegend').classList.remove('hide');
			} else if (items.progress === 100) {
				nodeInfo.querySelector('.doneIcon').classList.remove('hide');
				nodeInfo.querySelector('.infoDetailsLegend').classList.remove('hide');
			}
		}		
	});
}

export default {
    populateLanguages: populateLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries
};
