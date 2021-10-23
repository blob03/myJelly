import globalize from '../scripts/globalize';

/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages) {
    let html = '';
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		html += "<option value='" + ISOName + "'>" + language.DisplayName + "</option>";
	});
	
    select.innerHTML += html;
}

export function populateDictionaries(select, languages) {
    let html = '';
	const locale = globalize.getCurrentLocale();
	
	languages.forEach(language => {
		let ISOName = language.TwoLetterISOLanguageName;
		let progress;
		if (ISOName === locale) {
			progress = globalize.getCoreDictionaryProgress(ISOName);
			html += "<option value='" + ISOName + "'>" + language.DisplayName + " - " + progress + "%</option>";
		} else 
			html += "<option value='" + ISOName + "'>" + language.DisplayName + "</option>";
	});
	
    select.innerHTML += html;
}

export default {
    populateLanguages: populateLanguages,
	populateDictionaries: populateDictionaries
};
