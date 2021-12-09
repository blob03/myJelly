import * as userSettings from './settings/userSettings';
import cultures from './cultures';
import { Events } from 'jellyfin-apiclient';

/* eslint-disable indent */

	const fallbackCulture = 'en-US';
	const fallbackCultureName = 'English';
	const fallbackModule = 'core';
    const allTranslations = {};
    let currentCulture;
    let currentDateTimeCulture;
	let DicKeysNum = {};
	let origKeysNum = {};
	let myKeysNum = {};

    export function getCurrentLocale() {
        return currentCulture;
    }

    export function getCurrentDateTimeLocale() {
        return currentDateTimeCulture;
    }

	export function getSourceCulture() {
		return fallbackCulture;
	}
	
    export function getDefaultCulture() {
        let culture;
		let test = {};
		
		if (document.documentElement.getAttribute('data-culture')) 
			culture = document.documentElement.getAttribute('data-culture');
		else if (navigator.language) 
			culture = navigator.language;
        else if (navigator.userLanguage) 
            culture = navigator.userLanguage;
        else if (navigator.languages && navigator.languages.length) 
            culture = navigator.languages[0];
		
		if (culture) {
			test = cultures.matchCulture(culture);
			if (test.TwoLetterISOLanguageName)
				return test.TwoLetterISOLanguageName;
			if (test.ThreeLetterISOLanguageName)
				return test.ThreeLetterISOLanguageName;
		}
		
        return fallbackCulture;
    }

    export function updateCurrentCulture() {
        currentCulture = userSettings.language() || getDefaultCulture();
		currentDateTimeCulture = userSettings.dateTimeLocale() || currentCulture;
        ensureTranslations(currentCulture);
    }
	
	export function updateCulture(culture) {
        culture = culture || getDefaultCulture();
        ensureTranslations(culture);
    }

    function ensureTranslations(culture) {
		culture = culture || getDefaultCulture();
		let promises = [];
        for (const i in allTranslations) {
			promises.push(ensureTranslation(i, allTranslations[i], culture));
			if (fallbackCulture !== culture) 
				promises.push(ensureTranslation(i, allTranslations[i], fallbackCulture));
		}
		
        return Promise.all(promises);
    }

    function ensureTranslation(module, translationInfo, culture) {
		culture = culture || getDefaultCulture();
        if (translationInfo.dictionaries[culture]) 
            return Promise.resolve();
		
		return loadTranslation(module, culture);
    }
	
    function getDictionary(module, culture) {
        module = module || getDefaultModule();
		if (!culture)
			return {};
        const translations = allTranslations[module];
        if (!translations) 
            return {};

        return translations.dictionaries[culture];
    }

    export function register(options) {
        allTranslations[options.name] = {
            translations: options.strings || options.translations,
            dictionaries: {}
        };
    }

    export function loadStrings(options) {
        const locale = getCurrentLocale();
        const promises = [];
        let optionsName;
		if (!options)
			optionsName = getDefaultModule();
        else if (typeof options === 'string')
			optionsName = options;
        else 
			optionsName = options.name;
		
		if (!allTranslations[optionsName])
			register({name: optionsName, translations: ''});
		
		promises.push(ensureTranslation(optionsName, allTranslations[optionsName], locale));
		promises.push(ensureTranslation(optionsName, allTranslations[optionsName], fallbackCulture));
	
        return Promise.all(promises);
    }

    function loadTranslation(module, lang) {
		module = getDefaultModule(); // needs to be fixed.
		lang = lang || getDefaultCulture();
		
		// already loaded?
		if (allTranslations[module].dictionaries[lang])
			return new Promise((resolve) => {
				resolve(allTranslations[module].dictionaries[lang]);
			});

		Object.filter = (obj, predicate) => 
			Object.assign(...Object.keys(obj)
				.filter( key => predicate(obj[key]) )
				.map( key => ({ [key]: obj[key] }) ) );

		DicKeysNum[lang] = origKeysNum[lang] = myKeysNum[lang] = 0;
        return new Promise((resolve) => {
			// import jellyfin core translation file

            import(`../strings/${lang}.json`).then((content) => {	
				content = Object.filter(content, str => typeof str === "string" && str.length);
				DicKeysNum[lang] = origKeysNum[lang] = Object.keys(content).length;
			
				// import myJelly core translation file
				import(`../strings/myJelly/${lang}.json`).then((mjcontent) => {
					mjcontent = Object.filter(mjcontent, str => typeof str === "string" && str.length);
					myKeysNum[lang] = Object.keys(mjcontent).length;
					DicKeysNum[lang] = origKeysNum[lang] + myKeysNum[lang];
					
					let dic = {...content, ...mjcontent};
					allTranslations[module].dictionaries[lang] = dic;
					resolve(dic);
				}).catch(() => {
					allTranslations[module].dictionaries[lang] = content;
					resolve(content);
				});
			}).catch(() => {
				resolve({});
			});
        });
    }

    function translateKey(key) {
        const parts = key.split('#');
        let module;

        if (parts.length > 1) {
            module = parts[0];
            key = parts[1];
        }

        return translateKeyFromModule(key, module);
    }

    function translateKeyFromModule(key, module, culture) {
		if (!key) return '';
		module = module || getDefaultModule();
		
		// No parameter was passed.
		if (culture === undefined) 
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture();
		
        let dictionary = getDictionary(module, culture);				
		if (!dictionary || !dictionary[key]) 
			dictionary = getDictionary(module, fallbackCulture);			
		if (!dictionary || !dictionary[key]) {
			console.error(`Translation key is missing from dictionary: ${key}`);
			return key;
		}
		
        return dictionary[key];
    }
	
    function replaceAll(str, find, replace) {
        return str.split(find).join(replace);
    }

    export function translate(key) {
        let val = translateKey(key);
        for (let i = 1; i < arguments.length; i++) {
            val = replaceAll(val, '{' + (i - 1) + '}', arguments[i]);
        }
        return val;
    }
	
	// Function to load a specific language.
	export function getCoreDictionary(culture) {
		
		if (culture === undefined)
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture();
		
		return loadTranslation('core', culture);
	}

    export function translateHtml(html, module, culture) {
        html = html.default || html;
		module = module || getDefaultModule();
		
		// No parameter was passed.
		if (culture === undefined) 
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture();
			
		do {
			let startIndex = html.indexOf('${');
			if (startIndex === -1) 
				return html;
			
			startIndex += 2;
			const endIndex = html.indexOf('}', startIndex);
			if (endIndex === -1) 
				return html;
			
			const key = html.substring(startIndex, endIndex);
			const val = translateKeyFromModule(key, module, culture);

			html = html.replace('${' + key + '}', val);
		} while(1)
    }

    function getDefaultModule(val) {
        return fallbackModule;
    }

    updateCurrentCulture();

    Events.on(userSettings, 'change', function (e, name) {
        if (name === 'language' || name === 'datetimelocale') {
            updateCurrentCulture();
        }
    });

export default {
    translate,
	getCoreDictionary,
    translateHtml,
    loadStrings,
    getCurrentLocale,
    getCurrentDateTimeLocale,
	getDefaultCulture,
	getSourceCulture,
    register,
    updateCurrentCulture,
	updateCulture
};

/* eslint-enable indent */
