import globalize from '../scripts/globalize';
import cultures from '../scripts/cultures';
import datetime from '../scripts/datetime';
 
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
		let ISOName = languages[item].ISO6391;
		let w = document.createElement("option");
		
		// Some cultures appear to have a three letters code (ISO 639-2) only.
		// This seems to be the case for swiss German and a few others.
		if (!ISOName)
			ISOName = languages[item].ISO6392;
		
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

export function populateServerLanguages(select, languages, view, val) {
   
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
		let ISO6392 = languages[item].ISO6392;
		let ISO6391 = languages[item].ISO6391;
		let w = document.createElement("option");
				
		w = document.createElement("option");
		w.value = ISO6392;
		w.asideText = `${ISO6392}`;
		w.setAttribute('ISO6391', ISO6391);
		if (val && val === ISO6392)
			w.selected = true;
	
		w.text = languages[item][view];
		select.options.add(w, undefined); 
	});
}

/**
 * Helper for creating a list of available dictionaries.
 * @module components/settingsHelper
 */
 
export function populateDictionaries(select, languages, view, val, ban) {
	let activeLang = { "DisplayName": "", "ISO6391": "" };
	let ccodeSrc = globalize.getSourceCulture();
	let lang = val? val: globalize.getDefaultCulture().ccode; 
	let order = Object.keys(languages);
	
	order.sort((a, b) => {
		let fa = languages[a][view].toLowerCase();
		let fb = languages[b][view].toLowerCase();
		if (fa < fb) 
			return -1;
		if (fa > fb) 
			return 1;
		return 0;
	});
	
	// Remove previous options but preserve special options such as 'none', 'auto', ...
	Array.from(select.options).forEach( function(opt) {
		if (opt.value !== '' && opt.value !== 'none' && !opt.disabled)
			opt.remove();
	});
	
	order.forEach(item => {
		// We do not list empty dictionaries.
		if (languages[item]['jellyfinWeb']['keys#']) {
			
			// Some cultures appear to have a three letters code (ISO 639-2) only.
			// This is the case for swiss German and a few others.
			let ISOName = languages[item].ISO6391;
			if (!ISOName) {
				if (languages[item].ISO6392)
					ISOName = languages[item].ISO6392;
				if (!ISOName)
					return;
			}
			
			if (ban && ban === ISOName)
				return;
			
			if (lang && lang === ISOName) {
				activeLang = languages[item];
				activeLang.ISO6391 = ISOName;
			}
			
			let w = document.createElement("option");
			w.value = ISOName;
			w.asideText = `${ISOName}`;
			if (ccodeSrc === w.value)
				w.icon = 'hub';
			
			if (val && val === ISOName)
				w.selected = true;
			
			w.text = languages[item][view];
			select.options.add(w, undefined); 
		
		}
	});	
}

// Refresh the window containing the metadata of whatever language is selected.
export function showDictionaryInfo(e) {		
	let ccodeSrc = globalize.getSourceCulture();
	let val = e.target.options[e.target.selectedIndex].value;
	let auto = '';
	let lang = val;
	if (lang === '') {
		let ret = globalize.getDefaultCulture();
		lang = ret.ccode;
		auto = ret.src;
	}
	let activeLang = cultures.getDictionary(lang);
	let srcLang = cultures.getDictionary(ccodeSrc);
				
	let nodeInfo = document.querySelector('.infoDetails');  
	if (nodeInfo) {
		nodeInfo.querySelector('.infoDisplayLanguage').innerHTML = ' ' + activeLang["displayNativeName"] + ' [ ' + activeLang["ISO6391"] + ' ]';
		/*
		if (auto !== '')
			nodeInfo.querySelector('.infoDisplayLanguage').innerHTML += ' [ ' + auto + ' ]';

		let x = new Date(1970, 0, 1); 
		x.setSeconds(activeLang["lastm"]);

		let datestr = datetime.toLocaleDateString(x, {
			weekday: 'short',
		});
		datestr += "  ";
		datestr += datetime.toLocaleDateString(x);
		datestr += "  ";
		datestr += datetime.toLocaleTimeString(x, {
			hour: 'numeric',
			minute: '2-digit'
		});
		nodeInfo.querySelector('.infoLastModified').innerHTML = ' ' + datestr;
		*/
		nodeInfo.querySelector('.infoKeysTranslated').innerHTML = ' ' 
			+ activeLang["keys#"]
			+ '/' + srcLang["keys#"]
			+ ' [ ' + activeLang["completed%"] + '% ] ';
		nodeInfo.querySelector('.infoJellyfinKeysTranslated').innerHTML = ' ' 
			+ activeLang["jellyfinWeb"]["keys#"] + '/' + srcLang["jellyfinWeb"]["keys#"]
			+ ' [ ' + activeLang["jellyfinWeb"]["completed%"] + '% ] ';
		nodeInfo.querySelector('.infoMyjellyKeysTranslated').innerHTML = ' ' 
			+ activeLang["myJelly"]["keys#"] + '/' + srcLang["myJelly"]["keys#"]
			+ ' [ ' + activeLang["myJelly"]["completed%"] + '% ] ';

		nodeInfo.querySelector('.warningIcon').classList.add('hide');
		nodeInfo.querySelector('.hubIcon').classList.add('hide'); 
		nodeInfo.querySelector('.doneIcon').classList.add('hide'); 

		if (activeLang["completed%"] > 100 || activeLang["jellyfinWeb"]["completed%"] > 100 || activeLang["myJelly"]["completed%"] > 100) {
			nodeInfo.querySelector('.warningIcon').classList.remove('hide');
		} else if (activeLang["ISO6391"] === ccodeSrc) {
			// lang is source.
			nodeInfo.querySelector('.hubIcon').classList.remove('hide'); 
		} else if (activeLang["completed%"] === 100) {
			nodeInfo.querySelector('.doneIcon').classList.remove('hide');
		}
	}		
}

export default {
    populateLanguages: populateLanguages,
	populateServerLanguages: populateServerLanguages,
	populateSubsLanguages: populateSubsLanguages,
	populateDictionaries: populateDictionaries,
	showDictionaryInfo: showDictionaryInfo
};
