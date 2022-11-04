import { currentSettings as userSettings } from './settings/userSettings';
import cultures from './cultures';
import Events from '../utils/events.ts';
import { updateLocale } from '../utils/dateFnsLocale.ts';

const Direction = {
    rtl: 'rtl',
    ltr: 'ltr'
};

/* eslint-disable indent */

	const fallbackCulture = 'en-US';
	const fallbackCultureName = 'English';
	const fallbackModule = 'core';
	const RTL_LANGS = ['ar', 'fa', 'ur', 'he'];
    const allTranslations = {};
    let _currentCulture;
	let _currentCultureAlt;
    let _currentDateTimeCulture;
	let isRTL = false;

    export function getCurrentLocale() {
        return _currentCulture;
    }
	
	export function getIsRTL(culture) {
		if (culture !== undefined) {
			for (const lang of RTL_LANGS) {
				if (culture.includes(lang))
					return true;
			}
			return false;
		} else
			return isRTL;
    }

    function checkAndProcessDir(culture) {
        //console.log(culture);
        isRTL = getIsRTL(culture);
        setDocumentDirection(isRTL ? Direction.rtl : Direction.ltr);
    }

    function setDocumentDirection(direction) {
        document.getElementsByTagName('body')[0].setAttribute('dir', direction);
        document.getElementsByTagName('html')[0].setAttribute('dir', direction);
        if (direction === Direction.rtl)
            import('../styles/rtl.scss');
    }

    export function getIsElementRTL(element) {
        if (window.getComputedStyle) { // all browsers
            return window.getComputedStyle(element, null).getPropertyValue('direction') == 'rtl';
        }
        return element.currentStyle.direction == 'rtl';
    }

    export function getCurrentDateTimeLocale() {
        return _currentDateTimeCulture;
    }

	export function getSourceCulture() {
		return fallbackCulture;
	}
	
    export function getDefaultCulture() {
        let culture;
		let match = {};
		let ret = {'src':'fallback', 'ccode':fallbackCulture};
		
		if (document.documentElement.getAttribute('data-culture')) {
			ret.ccode = document.documentElement.getAttribute('data-culture');
			ret.src = 'application';
		} else if (navigator.language) {
			ret.ccode = navigator.language;
			ret.src = 'browser/lang';
        } else if (navigator.userLanguage) {
            ret.ccode = navigator.userLanguage;
			ret.src = 'browser/user';
		} else if (navigator.languages && navigator.languages.length) {
            ret.ccode = navigator.languages[0];
			ret.src = 'browser/lang';
		}
		
		if (ret.ccode != fallbackCulture) {
			match = cultures.matchCulture(ret.ccode);
			if (match.ISO6391)
				ret.ccode = match.ISO6391;
			else if (match.ISO6392)
				ret.ccode = match.ISO6392;
			else 
				ret = {'src':'fallback', 'ccode':fallbackCulture};
		}
		
        return ret;
    }

    export function updateCurrentCulture() {
		_currentCulture = userSettings.language() || getDefaultCulture().ccode;
		_currentCultureAlt = userSettings.languageAlt() || getDefaultCulture().ccode;
		_currentDateTimeCulture = userSettings.dateTimeLocale() || _currentCulture;
		updateLocale(_currentDateTimeCulture);
		checkAndProcessDir(_currentCulture);
        ensureTranslations(_currentCulture);
		ensureTranslations(_currentCultureAlt);
    }
	
	export function updateCulture(culture) {
        culture = culture || getDefaultCulture().ccode;
        ensureTranslations(culture);
    }

    function ensureTranslations(culture) {
		culture = culture || getDefaultCulture().ccode;
		let promises = [];
        for (const i in allTranslations) {
			promises.push(ensureTranslation(i, allTranslations[i], culture));
			if (fallbackCulture !== culture) 
				promises.push(ensureTranslation(i, allTranslations[i], fallbackCulture));
		}
		
        return Promise.all(promises);
    }

    function ensureTranslation(module, translationInfo, culture) {
		culture = culture || getDefaultCulture().ccode;
        if (translationInfo.dictionaries[culture]) 
            return Promise.resolve();
		
		return loadTranslation(module, culture);
    }
	
    function getDictionary(module, culture) {
        module = module || defaultModule();
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
			optionsName = defaultModule();
        else if (typeof options === 'string')
			optionsName = options;
        else 
			optionsName = options.name;
		
		if (!allTranslations[optionsName])
			register({name: optionsName, translations: ''});
		
		promises.push(ensureTranslation(optionsName, allTranslations[optionsName], locale));
		promises.push(ensureTranslation(optionsName, allTranslations[optionsName], _currentCultureAlt));
		promises.push(ensureTranslation(optionsName, allTranslations[optionsName], fallbackCulture));
	
        return Promise.all(promises);
    }

    function loadTranslation(module, lang) {
		module = defaultModule(); // needs to be fixed.
		lang = lang || getDefaultCulture().ccode;
		
		// already loaded?
		if (allTranslations[module].dictionaries[lang])
			return new Promise((resolve) => {
				resolve(allTranslations[module].dictionaries[lang]);
			});

		Object.filter = (obj, predicate) => 
			Object.assign(...Object.keys(obj)
				.filter( key => predicate(obj[key]) )
				.map( key => ({ [key]: obj[key] }) ) );

        return new Promise((resolve) => {
			// import jellyfin core translation file
            import(/* webpackChunkName: "[request]" */`../strings/${lang}.json`).then((content) => {
				// import myJelly core translation file
				import(/* webpackChunkName: "[request]" */`../strings/myJelly/${lang}.json`).then((mjcontent) => {
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
		module = module || defaultModule();
		
		// No parameter was passed.
		if (culture === undefined) 
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture().ccode;
		
        let dictionary = getDictionary(module, culture);				
		if (!dictionary || !dictionary[key]) 
			dictionary = getDictionary(module, _currentCultureAlt);
		if (!dictionary || !dictionary[key]) 
			dictionary = getDictionary(module, fallbackCulture);			
		if (!dictionary || !dictionary[key]) {
			console.warn(`Translation key is missing from dictionary: ${key}`);
			return key;
		}
		
        return dictionary[key];
    }

    export function translate(key) {
        let val = translateKey(key);
        for (let i = 1; i < arguments.length; i++) {
             val = val.replaceAll('{' + (i - 1) + '}', arguments[i].toLocaleString(_currentCulture));
        }
        return val;
    }
	
	// Function to load a specific language.
	export function getCoreDictionary(culture) {
		if (culture === undefined)
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture().ccode;
		
		return loadTranslation('core', culture);
	}

    export function translateHtml(html, module, culture) {
        html = html.default || html;
		module = module || defaultModule();
		
		// No parameter was passed.
		if (culture === undefined) 
			culture = getCurrentLocale();
			
		// Is culture set to Auto?
		if (culture === '')
			culture = getDefaultCulture().ccode;
			
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

    let _defaultModule;
    export function defaultModule(val) {
        if (val) {
            _defaultModule = val;
        }
        return _defaultModule;
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
	defaultModule,
    getCurrentLocale,
    getCurrentDateTimeLocale,
	getDefaultCulture,
	getSourceCulture,
    register,
    updateCurrentCulture,
	updateCulture,
	getIsRTL,
    getIsElementRTL
};

/* eslint-enable indent */
