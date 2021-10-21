import globalize from '../scripts/globalize';

/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages) {
    let html = '';
	languages.forEach(language => {
		html += "<option value='" + language.TwoLetterISOLanguageName + "'>" + language.DisplayName + '</option>';
	});
    select.innerHTML += html;
}

export default {
    populateLanguages: populateLanguages
};
