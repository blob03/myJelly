import * as userSettings from './settings/userSettings';
import { Events } from 'jellyfin-apiclient';

/* eslint-disable indent */

	const fallbackCulture = 'en';
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

    export function getDefaultLanguage() {
        const culture = document.documentElement.getAttribute('data-culture');
        if (culture) {
            return culture;
        }
        if (navigator.language) {
            return navigator.language;
        }
        if (navigator.userLanguage) {
            return navigator.userLanguage;
        }
        if (navigator.languages && navigator.languages.length) {
            return navigator.languages[0];
        }
        return fallbackCulture;
    }

    export function updateCurrentCulture() {
        currentCulture = userSettings.language() || getDefaultLanguage();
		currentDateTimeCulture = userSettings.dateTimeLocale() || currentCulture;
        ensureTranslations(currentCulture);
    }
	
	export function updateCulture(culture) {
        culture = culture || getDefaultLanguage();
        ensureTranslations(culture);
    }

    function ensureTranslations(culture) {
		let promises = [];
        for (const i in allTranslations) {
			promises.push(ensureTranslation(i, allTranslations[i], culture));
			if (fallbackCulture !== culture) 
				promises.push(ensureTranslation(i, allTranslations[i], fallbackCulture));
		}
		
        return Promise.all(promises);
    }

    function ensureTranslation(module, translationInfo, culture) {
        if (translationInfo.dictionaries[culture]) 
            return Promise.resolve();
		return loadTranslation(module, culture).then( (dictionary) => {
            translationInfo.dictionaries[culture] = dictionary;
        });
    }
	
    function getDictionary(module, locale) {
        module = module || defaultModule();
        const translations = allTranslations[module];
        if (!translations) 
            return {};

        return translations.dictionaries[locale];
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
			optionsName = defaultModule();
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
		if (module !== 'core')
			return new Promise((resolve) => {});
		
		lang = lang || fallbackCulture;
		
		// already loaded?
		if (DicKeysNum[lang] && origKeysNum[lang])
			if (allTranslations['core'].dictionaries[lang])
				return new Promise((resolve) => {
					resolve(allTranslations['core'].dictionaries[lang]);});

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
					resolve(dic);
				}).catch(() => {
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

    function translateKeyFromModule(key, module) {
        let dictionary = getDictionary(module, getCurrentLocale());
        if (!dictionary || !dictionary[key]) {
            dictionary = getDictionary(module, fallbackCulture);
        }
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
	
	export function getCoreDictionaryProgress(lang) {
		return new Promise((resolve) => {
			if (!lang)
				resolve(0);
			let ISOlang = lang;
			let ISOfallback = fallbackCulture;
			if (!DicKeysNum[ISOfallback]) {
				let fallbackDic = getDictionary('core', ISOfallback);
				if (!fallbackDic)
					resolve(0);
				DicKeysNum[ISOfallback] = Object.keys(fallbackDic).length;
				if (!DicKeysNum[ISOfallback])
					resolve(0);
			}			
			if (!DicKeysNum[ISOlang]) {
					
				loadTranslation('core', ISOlang).then( (dic) => {
					resolve( { 
						'sourceDisplayName' : fallbackCultureName,
						'sourceISOName': ISOfallback,
						'keys' : DicKeysNum[ISOlang],
						'origKeys' : origKeysNum[ISOlang],
						'myKeys' : myKeysNum[ISOlang],
						'sourceKeys' : DicKeysNum[ISOfallback],
						'origSourceKeys' : origKeysNum[ISOfallback],
						'mySourceKeys' : myKeysNum[ISOfallback],
						'progress' : DicKeysNum[ISOfallback]? Math.round(10 * DicKeysNum[ISOlang] / DicKeysNum[ISOfallback] * 100) / 10 : 0,
						'origProgress' : origKeysNum[ISOfallback]? Math.round(10 * origKeysNum[ISOlang] / origKeysNum[ISOfallback] * 100) / 10 : 0,
						'myProgress' : myKeysNum[ISOfallback]? Math.round(10 * myKeysNum[ISOlang] / myKeysNum[ISOfallback] * 100) / 10 : 0 
					} );
				} );
			} else {
				
				resolve( { 
					'sourceDisplayName' : fallbackCultureName,
					'sourceISOName': ISOfallback,
					'keys' : DicKeysNum[ISOlang],
					'origKeys' : origKeysNum[ISOlang],
					'myKeys' : myKeysNum[ISOlang],
					'sourceKeys' : DicKeysNum[ISOfallback],
					'origSourceKeys' : origKeysNum[ISOfallback],
					'mySourceKeys' : myKeysNum[ISOfallback],
					'progress' : DicKeysNum[ISOfallback]? Math.round(10 * DicKeysNum[ISOlang] / DicKeysNum[ISOfallback] * 100) / 10 : 0,
					'origProgress' : origKeysNum[ISOfallback]? Math.round(10 * origKeysNum[ISOlang] / origKeysNum[ISOfallback] * 100) / 10 : 0,
					'myProgress' : myKeysNum[ISOfallback]? Math.round(10 * myKeysNum[ISOlang] / myKeysNum[ISOfallback] * 100) / 10 : 0 
				} );
			}
		});
	}

	export function getCoreDictionary(lang) {
		return loadTranslation('core', lang);
	}

    export function translateHtml(html, module) {
        html = html.default || html;

        if (!module) {
            module = defaultModule();
        }
        if (!module) {
            throw new Error('module cannot be null or empty');
        }

        let startIndex = html.indexOf('${');
        if (startIndex === -1) {
            return html;
        }

        startIndex += 2;
        const endIndex = html.indexOf('}', startIndex);
        if (endIndex === -1) {
            return html;
        }

        const key = html.substring(startIndex, endIndex);
        const val = translateKeyFromModule(key, module);

        html = html.replace('${' + key + '}', val);
        return translateHtml(html, module);
    }

    export function defaultModule(val) {
        if (val) {
            fallbackModule = val;
        }
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
	getCoreDictionaryProgress,
    translateHtml,
    loadStrings,
    defaultModule,
    getCurrentLocale,
    getCurrentDateTimeLocale,
	getDefaultLanguage,
    register,
    updateCurrentCulture,
	updateCulture
};

/* eslint-enable indent */
