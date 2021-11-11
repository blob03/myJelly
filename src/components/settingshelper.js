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

export function populateDictionaries(select, languages, val) {
    let html = '';
	const source = 'en';
	globalize.getCoreDictionaryProgress(val).then( (progress) => {
		languages.forEach(language => {
			let ISOName = language.TwoLetterISOLanguageName;
			html += "<option";
			if (ISOName === source) 
				html += " class='sourceDictionaryOption'";
			
			if (val && val === ISOName) {
				html += " value='" + ISOName + "' selected>" + language.DisplayName 
						+ (ISOName === source ? " [ S ]" : (progress >= 0 ? (" [ " + progress + "% ]") : "")) 
						+ "</option>";
			} else 
				html += " value='" + ISOName + "'>" + language.DisplayName + "</option>";
		});
		select.innerHTML += html;
	});
}

export default {
    populateLanguages: populateLanguages,
	populateDictionaries: populateDictionaries
};
