import globalize from '../scripts/globalize';

/**
 * Helper for handling settings.
 * @module components/settingsHelper
 */

export function populateLanguages(select, languages) {
    let html = '';

    html += "<option value=''>" + globalize.translate('AnyLanguage') + "</option>";
	html += "<option disabled>" + globalize.translate('OptionDivider') + "</option>";
    for (let i = 0, length = languages.length; i < length; i++) {
        const culture = languages[i];
        html += "<option value='" + culture.TwoLetterISOLanguageName + "'>" + culture.DisplayName + '</option>';
    }

    select.innerHTML = html;
}

export default {
    populateLanguages: populateLanguages
};
