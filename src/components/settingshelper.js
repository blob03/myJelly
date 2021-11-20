import globalize from '../scripts/globalize';

/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages, val) {
    let html = '';
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		if (val && val === ISOName) 
			html += "<option value='" + ISOName + "' selected>" + language.DisplayName + "</option>";
		else
			html += "<option value='" + ISOName + "'>" + language.DisplayName + "</option>";
	});
    select.innerHTML += html;
}

/**
 * Helper for creating a list of available subtitles languages.
 * @module components/settingsHelper
 */

export function populateSubsLanguages(select, languages, val) {
    let html = '';
	
	languages.forEach(language => {
		let ISOName3L = language.ThreeLetterISOLanguageName;
		let ISOName2L = language.TwoLetterISOLanguageName;
		if (val && val === ISOName3L) 
			html += "<option ISOName2L='" + ISOName2L + "' value='" + ISOName3L + "' selected>" + language.DisplayName + "</option>";
		else
			html += "<option ISOName2L='" + ISOName2L + "' value='" + ISOName3L + "'>" + language.DisplayName + "</option>";
	});
    select.innerHTML += html;
}

export function populateDictionaries(select, languages, val) {		
	
	let html = '';
	let activeLanguage = null;
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This seems to be the case for swiss German and a few others.
		if (!ISOName && language.ThreeLetterISOLanguageName)
			ISOName = language.ThreeLetterISOLanguageName;
		
		if (ISOName) {
			html += "<option";
			if (val && val === ISOName) {
				activeLanguage = language;
				activeLanguage.ISOName = ISOName;
				html += " value='" + ISOName + "' class='selected' selected>";
			} else 
				html += " value='" + ISOName + "'>";
			
			html += language.DisplayName + "</option>";
		}
	});
	select.innerHTML += html;
	
	globalize.getCoreDictionaryProgress(val).then( (items) => {
		
		let pnode = select.parentNode.parentNode;
		if (pnode) {	
			let nodeInfo = pnode.querySelector('.DisplayLanguageInfo');  
			nodeInfo.querySelector('.infoDisplayLanguage').innerHTML += ' ' + activeLanguage.DisplayName + ' [ ' + activeLanguage.ISOName + ' ]';
			nodeInfo.querySelector('.infoSourceLanguage').innerHTML += ' ' + items.sourceDisplayName + ' [ ' + items.sourceISOName + ' ]';
			nodeInfo.querySelector('.infoKeysTranslated').innerHTML += ' ' + items.progress + '% [ ' + items.keys + '/' + items.sourceKeys + ' ]';
			nodeInfo.querySelector('.infoJellyfinKeysTranslated').innerHTML += ' ' + items.origProgress + '% [ ' + items.origKeys + '/' + items.origSourceKeys + ' ]';
			nodeInfo.querySelector('.infoMyjellyKeysTranslated').innerHTML += ' ' + items.myProgress + '% [ ' + items.myKeys + '/' + items.mySourceKeys + ' ]';
			if (items.progress > 100 || items.origProgress > 100 || items.myProgress > 100)
				nodeInfo.querySelector('.warningIcon').classList.remove('hide');
		}		
	});
}
							
export default {
    populateLanguages: populateLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries
};
