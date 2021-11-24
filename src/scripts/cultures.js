
/* eslint-disable indent */

export function getNativeName(cultureCode) {
	let dic = { 
		"af": "Afrikaans", 
		"ar": "العربية",
		"be-BY": "Беларуская",
		"bg-BG": "Български",
		"bn-BD": "বাংলা (বাংলাদেশ)",
		"ca": "Català",
		"cs": "Čeština",
		"cy": "Cymraeg",
		"da": "Dansk",
		"de": "Deutsch",
		"el": "Ελληνικά",
		"en-GB": "English (United Kingdom)",
		"en-US": "English",
		"eo": "Esperanto",
		"es": "Español",
		"es-419": "Español americano",
		"es-AR": "Español (Argentina)",
		"es-DO": "Español (Dominicana)",
		"es-MX": "Español (México)",
		"et": "Eesti",
		"fa": "فارسی",
		"fi": "Suomi",
		"fil": "Filipino",
		"fr": "Français",
		"fr-CA": "Français (Canada)",
		"gl": "Galego",
		"gsw": "Schwiizerdütsch",
		"he": "עִבְרִית",
		"hi-IN": "हिन्दी",
		"hr": "Hrvatski",
		"hu": "Magyar",
		"id": "Bahasa Indonesia",
		"is-IS": "Íslenska",
		"it": "Italiano",
		"ja": "日本語",
		"kk": "Qazaqşa",
		"ko": "한국어",
		"lt-LT": "Lietuvių",
		"lv": "Latviešu",
		"mk": "Македонски",
		"ml": "മലയാളം",
		"mr": "मराठी",
		"ms": "Bahasa Melayu",
		"nb": "Norsk bokmål",
		"ne": "नेपाली",
		"nl": "Nederlands",
		"nn": "Norsk nynorsk",
		"pa": "ਪੰਜਾਬੀ",
		"pl": "Polski",
		"pr": "Pirate",
		"pt": "Português",
		"pt-BR": "Português (Brasil)",
		"pt-PT": "Português (Portugal)",
		"ro": "Românește",
		"ru": "Русский",
		"sk": "Slovenčina",
		"sl-SI": "Slovenščina",
		"sq": "Shqip",
		"sr": "Српски",
		"sv": "Svenska",
		"ta": "தமிழ்",
		"te": "తెలుగు",
		"th": "ภาษาไทย",
		"tr": "Türkçe",
		"uk": "Українська",
		"ur-PK": "اُردُو",
		"vi": "Tiếng Việt",
		"zh-CN": "汉语 (简化字)",
		"zh-TW": "漢語 (繁体字)",
		"zh-HK": "廣東話 (香港)"
	};
		
	if (cultureCode && dic[cultureCode])
		return dic[cultureCode];

	return '';
}

// Try to match a given culture with one in the list.
// return the closest match or nothing.
export function validateCulture(culture) {
	if (!culture) 
		return {};
	let ctrlLst = getCultures();
	
	// find an exact match.
	let lang = ctrlLst.filter( item => 
		item.TwoLetterISOLanguageName === culture || item.ThreeLetterISOLanguageName === culture );
	if (lang[0])
		return lang[0];
	
	let parentCulture = culture.split('-')[0];
	if (parentCulture) {
		// find an exact match ot the parent.
		lang = ctrlLst.filter((item) => 
			item.TwoLetterISOLanguageName === parentCulture || item.ThreeLetterISOLanguageName === parentCulture );
		if (lang[0]) 
			return lang[0];
		// find a sister culture.
		lang = ctrlLst.filter((item) => 
			item.TwoLetterISOLanguageName.split('-')[0] === parentCulture || item.ThreeLetterISOLanguageName.split('-')[0] === parentCulture );
		if (lang[0]) 
			return lang[0];
	} else {
		// find an child culture.
		lang = ctrlLst.filter((item) => 
			item.TwoLetterISOLanguageName.split('-')[0] === culture || item.ThreeLetterISOLanguageName.split('-')[0] === culture );
		if (lang[0]) 
			return lang[0];
	}
	
	return {};
}

export function getCultures() {
	return [
	  {
		"Name": "Abkhazian",
		"DisplayName": "Abkhazian",
		"TwoLetterISOLanguageName": "ab",
		"ThreeLetterISOLanguageName": "abk",
		"ThreeLetterISOLanguageNames": [
		  "abk"
		]
	  },
	  {
		"Name": "Afar",
		"DisplayName": "Afar",
		"TwoLetterISOLanguageName": "aa",
		"ThreeLetterISOLanguageName": "aar",
		"ThreeLetterISOLanguageNames": [
		  "aar"
		]
	  },
	  {
		"Name": "Afrikaans",
		"DisplayName": "Afrikaans",
		"TwoLetterISOLanguageName": "af",
		"ThreeLetterISOLanguageName": "afr",
		"ThreeLetterISOLanguageNames": [
		  "afr"
		]
	  },
	  {
		"Name": "Akan",
		"DisplayName": "Akan",
		"TwoLetterISOLanguageName": "ak",
		"ThreeLetterISOLanguageName": "aka",
		"ThreeLetterISOLanguageNames": [
		  "aka"
		]
	  },
	  {
		"Name": "Albanian",
		"DisplayName": "Albanian",
		"TwoLetterISOLanguageName": "sq",
		"ThreeLetterISOLanguageName": "alb",
		"ThreeLetterISOLanguageNames": [
		  "alb",
		  "sqi"
		]
	  },
	  {
		"Name": "Amharic",
		"DisplayName": "Amharic",
		"TwoLetterISOLanguageName": "am",
		"ThreeLetterISOLanguageName": "amh",
		"ThreeLetterISOLanguageNames": [
		  "amh"
		]
	  },
	  {
		"Name": "Arabic",
		"DisplayName": "Arabic",
		"TwoLetterISOLanguageName": "ar",
		"ThreeLetterISOLanguageName": "ara",
		"ThreeLetterISOLanguageNames": [
		  "ara"
		]
	  },
	  {
		"Name": "Aragonese",
		"DisplayName": "Aragonese",
		"TwoLetterISOLanguageName": "an",
		"ThreeLetterISOLanguageName": "arg",
		"ThreeLetterISOLanguageNames": [
		  "arg"
		]
	  },
	  {
		"Name": "Armenian",
		"DisplayName": "Armenian",
		"TwoLetterISOLanguageName": "hy",
		"ThreeLetterISOLanguageName": "arm",
		"ThreeLetterISOLanguageNames": [
		  "arm",
		  "hye"
		]
	  },
	  {
		"Name": "Assamese",
		"DisplayName": "Assamese",
		"TwoLetterISOLanguageName": "as",
		"ThreeLetterISOLanguageName": "asm",
		"ThreeLetterISOLanguageNames": [
		  "asm"
		]
	  },
	  {
		"Name": "Avaric",
		"DisplayName": "Avaric",
		"TwoLetterISOLanguageName": "av",
		"ThreeLetterISOLanguageName": "ava",
		"ThreeLetterISOLanguageNames": [
		  "ava"
		]
	  },
	  {
		"Name": "Avestan",
		"DisplayName": "Avestan",
		"TwoLetterISOLanguageName": "ae",
		"ThreeLetterISOLanguageName": "ave",
		"ThreeLetterISOLanguageNames": [
		  "ave"
		]
	  },
	  {
		"Name": "Aymara",
		"DisplayName": "Aymara",
		"TwoLetterISOLanguageName": "ay",
		"ThreeLetterISOLanguageName": "aym",
		"ThreeLetterISOLanguageNames": [
		  "aym"
		]
	  },
	  {
		"Name": "Azerbaijani",
		"DisplayName": "Azerbaijani",
		"TwoLetterISOLanguageName": "az",
		"ThreeLetterISOLanguageName": "aze",
		"ThreeLetterISOLanguageNames": [
		  "aze"
		]
	  },
	  {
		"Name": "Bambara",
		"DisplayName": "Bambara",
		"TwoLetterISOLanguageName": "bm",
		"ThreeLetterISOLanguageName": "bam",
		"ThreeLetterISOLanguageNames": [
		  "bam"
		]
	  },
	  {
		"Name": "Bashkir",
		"DisplayName": "Bashkir",
		"TwoLetterISOLanguageName": "ba",
		"ThreeLetterISOLanguageName": "bak",
		"ThreeLetterISOLanguageNames": [
		  "bak"
		]
	  },
	  {
		"Name": "Basque",
		"DisplayName": "Basque",
		"TwoLetterISOLanguageName": "eu",
		"ThreeLetterISOLanguageName": "baq",
		"ThreeLetterISOLanguageNames": [
		  "baq",
		  "eus"
		]
	  },
	  {
		"Name": "Belarusian",
		"DisplayName": "Belarusian",
		"TwoLetterISOLanguageName": "be-BY",
		"ThreeLetterISOLanguageName": "bel",
		"ThreeLetterISOLanguageNames": [
		  "bel"
		]
	  },
	  {
		"Name": "Bengali",
		"DisplayName": "Bengali",
		"TwoLetterISOLanguageName": "bn-BD",
		"ThreeLetterISOLanguageName": "ben",
		"ThreeLetterISOLanguageNames": [
		  "ben"
		]
	  },
	  {
		"Name": "Bihari languages",
		"DisplayName": "Bihari languages",
		"TwoLetterISOLanguageName": "bh",
		"ThreeLetterISOLanguageName": "bih",
		"ThreeLetterISOLanguageNames": [
		  "bih"
		]
	  },
	  {
		"Name": "Bislama",
		"DisplayName": "Bislama",
		"TwoLetterISOLanguageName": "bi",
		"ThreeLetterISOLanguageName": "bis",
		"ThreeLetterISOLanguageNames": [
		  "bis"
		]
	  },
	  {
		"Name": "Bosnian",
		"DisplayName": "Bosnian",
		"TwoLetterISOLanguageName": "bs",
		"ThreeLetterISOLanguageName": "bos",
		"ThreeLetterISOLanguageNames": [
		  "bos"
		]
	  },
	  {
		"Name": "Breton",
		"DisplayName": "Breton",
		"TwoLetterISOLanguageName": "br",
		"ThreeLetterISOLanguageName": "bre",
		"ThreeLetterISOLanguageNames": [
		  "bre"
		]
	  },
	  {
		"Name": "Bulgarian",
		"DisplayName": "Bulgarian",
		"TwoLetterISOLanguageName": "bg-BG",
		"ThreeLetterISOLanguageName": "bul",
		"ThreeLetterISOLanguageNames": [
		  "bul"
		]
	  },
	  {
		"Name": "Burmese",
		"DisplayName": "Burmese",
		"TwoLetterISOLanguageName": "my",
		"ThreeLetterISOLanguageName": "bur",
		"ThreeLetterISOLanguageNames": [
		  "bur",
		  "mya"
		]
	  },
	  {
		"Name": "Catalan; Valencian",
		"DisplayName": "Catalan; Valencian",
		"TwoLetterISOLanguageName": "ca",
		"ThreeLetterISOLanguageName": "cat",
		"ThreeLetterISOLanguageNames": [
		  "cat"
		]
	  },
	  {
		"Name": "Central Khmer",
		"DisplayName": "Central Khmer",
		"TwoLetterISOLanguageName": "km",
		"ThreeLetterISOLanguageName": "khm",
		"ThreeLetterISOLanguageNames": [
		  "khm"
		]
	  },
	  {
		"Name": "Chamorro",
		"DisplayName": "Chamorro",
		"TwoLetterISOLanguageName": "ch",
		"ThreeLetterISOLanguageName": "cha",
		"ThreeLetterISOLanguageNames": [
		  "cha"
		]
	  },
	  {
		"Name": "Chechen",
		"DisplayName": "Chechen",
		"TwoLetterISOLanguageName": "ce",
		"ThreeLetterISOLanguageName": "che",
		"ThreeLetterISOLanguageNames": [
		  "che"
		]
	  },
	  {
		"Name": "Chichewa; Chewa; Nyanja",
		"DisplayName": "Chichewa; Chewa; Nyanja",
		"TwoLetterISOLanguageName": "ny",
		"ThreeLetterISOLanguageName": "nya",
		"ThreeLetterISOLanguageNames": [
		  "nya"
		]
	  },
	  {
		"Name": "Chinese",
		"DisplayName": "Chinese",
		"TwoLetterISOLanguageName": "zh-CN",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  {
		"Name": "Chinese; Hong Kong",
		"DisplayName": "Chinese; Hong Kong",
		"TwoLetterISOLanguageName": "zh-HK",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  {
		"Name": "Chinese; Traditional",
		"DisplayName": "Chinese; Traditional",
		"TwoLetterISOLanguageName": "zh-TW",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  {
		"Name": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"DisplayName": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"TwoLetterISOLanguageName": "cu",
		"ThreeLetterISOLanguageName": "chu",
		"ThreeLetterISOLanguageNames": [
		  "chu"
		]
	  },
	  {
		"Name": "Chuvash",
		"DisplayName": "Chuvash",
		"TwoLetterISOLanguageName": "cv",
		"ThreeLetterISOLanguageName": "chv",
		"ThreeLetterISOLanguageNames": [
		  "chv"
		]
	  },
	  {
		"Name": "Cornish",
		"DisplayName": "Cornish",
		"TwoLetterISOLanguageName": "kw",
		"ThreeLetterISOLanguageName": "cor",
		"ThreeLetterISOLanguageNames": [
		  "cor"
		]
	  },
	  {
		"Name": "Corsican",
		"DisplayName": "Corsican",
		"TwoLetterISOLanguageName": "co",
		"ThreeLetterISOLanguageName": "cos",
		"ThreeLetterISOLanguageNames": [
		  "cos"
		]
	  },
	  {
		"Name": "Cree",
		"DisplayName": "Cree",
		"TwoLetterISOLanguageName": "cr",
		"ThreeLetterISOLanguageName": "cre",
		"ThreeLetterISOLanguageNames": [
		  "cre"
		]
	  },
	  {
		"Name": "Croatian",
		"DisplayName": "Croatian",
		"TwoLetterISOLanguageName": "hr",
		"ThreeLetterISOLanguageName": "hrv",
		"ThreeLetterISOLanguageNames": [
		  "hrv"
		]
	  },
	  {
		"Name": "Czech",
		"DisplayName": "Czech",
		"TwoLetterISOLanguageName": "cs",
		"ThreeLetterISOLanguageName": "cze",
		"ThreeLetterISOLanguageNames": [
		  "cze",
		  "ces"
		]
	  },
	  {
		"Name": "Danish",
		"DisplayName": "Danish",
		"TwoLetterISOLanguageName": "da",
		"ThreeLetterISOLanguageName": "dan",
		"ThreeLetterISOLanguageNames": [
		  "dan"
		]
	  },
	  {
		"Name": "Divehi; Dhivehi; Maldivian",
		"DisplayName": "Divehi; Dhivehi; Maldivian",
		"TwoLetterISOLanguageName": "dv",
		"ThreeLetterISOLanguageName": "div",
		"ThreeLetterISOLanguageNames": [
		  "div"
		]
	  },
	  {
		"Name": "Dutch; Flemish",
		"DisplayName": "Dutch; Flemish",
		"TwoLetterISOLanguageName": "nl",
		"ThreeLetterISOLanguageName": "dut",
		"ThreeLetterISOLanguageNames": [
		  "dut",
		  "nld"
		]
	  },
	  {
		"Name": "Dzongkha",
		"DisplayName": "Dzongkha",
		"TwoLetterISOLanguageName": "dz",
		"ThreeLetterISOLanguageName": "dzo",
		"ThreeLetterISOLanguageNames": [
		  "dzo"
		]
	  },
	  {
		"Name": "English",
		"DisplayName": "English",
		"TwoLetterISOLanguageName": "en-US",
		"ThreeLetterISOLanguageName": "eng",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  {
		"DisplayName": "English, Great Britain",
		"TwoLetterISOLanguageName": "en-GB",
		"ThreeLetterISOLanguageName": "eng",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  {
		"Name": "Esperanto",
		"DisplayName": "Esperanto",
		"TwoLetterISOLanguageName": "eo",
		"ThreeLetterISOLanguageName": "epo",
		"ThreeLetterISOLanguageNames": [
		  "epo"
		]
	  },
	  {
		"Name": "Estonian",
		"DisplayName": "Estonian",
		"TwoLetterISOLanguageName": "et",
		"ThreeLetterISOLanguageName": "est",
		"ThreeLetterISOLanguageNames": [
		  "est"
		]
	  },
	  {
		"Name": "Ewe",
		"DisplayName": "Ewe",
		"TwoLetterISOLanguageName": "ee",
		"ThreeLetterISOLanguageName": "ewe",
		"ThreeLetterISOLanguageNames": [
		  "ewe"
		]
	  },
	  {
		"Name": "Faroese",
		"DisplayName": "Faroese",
		"TwoLetterISOLanguageName": "fo",
		"ThreeLetterISOLanguageName": "fao",
		"ThreeLetterISOLanguageNames": [
		  "fao"
		]
	  },
	  {
		"Name": "Fijian",
		"DisplayName": "Fijian",
		"TwoLetterISOLanguageName": "fj",
		"ThreeLetterISOLanguageName": "fij",
		"ThreeLetterISOLanguageNames": [
		  "fij"
		]
	  },
	  {
		"DisplayName": "Filipino",
		"ThreeLetterISOLanguageName": "fil"
	  },
	  {
		"Name": "Finnish",
		"DisplayName": "Finnish",
		"TwoLetterISOLanguageName": "fi",
		"ThreeLetterISOLanguageName": "fin",
		"ThreeLetterISOLanguageNames": [
		  "fin"
		]
	  },
	  {
		"Name": "French",
		"DisplayName": "French",
		"TwoLetterISOLanguageName": "fr",
		"ThreeLetterISOLanguageName": "fre",
		"ThreeLetterISOLanguageNames": [
		  "fre",
		  "fra"
		],
		"ISOName": "fr"
	  },
	  {
		"Name": "French, Canada",
		"DisplayName": "French, Canada",
		"TwoLetterISOLanguageName": "fr-CA",
		"ThreeLetterISOLanguageName": "frc",
		"ThreeLetterISOLanguageNames": [
		  "frc"
		]
	  },
	  {
		"Name": "Fulah",
		"DisplayName": "Fulah",
		"TwoLetterISOLanguageName": "ff",
		"ThreeLetterISOLanguageName": "ful",
		"ThreeLetterISOLanguageNames": [
		  "ful"
		]
	  },
	  {
		"Name": "Gaelic; Scottish Gaelic",
		"DisplayName": "Gaelic; Scottish Gaelic",
		"TwoLetterISOLanguageName": "gd",
		"ThreeLetterISOLanguageName": "gla",
		"ThreeLetterISOLanguageNames": [
		  "gla"
		]
	  },
	  {
		"Name": "Galician",
		"DisplayName": "Galician",
		"TwoLetterISOLanguageName": "gl",
		"ThreeLetterISOLanguageName": "glg",
		"ThreeLetterISOLanguageNames": [
		  "glg"
		]
	  },
	  {
		"Name": "Ganda",
		"DisplayName": "Ganda",
		"TwoLetterISOLanguageName": "lg",
		"ThreeLetterISOLanguageName": "lug",
		"ThreeLetterISOLanguageNames": [
		  "lug"
		]
	  },
	  {
		"Name": "Georgian",
		"DisplayName": "Georgian",
		"TwoLetterISOLanguageName": "ka",
		"ThreeLetterISOLanguageName": "geo",
		"ThreeLetterISOLanguageNames": [
		  "geo",
		  "kat"
		]
	  },
	  {
		"Name": "German",
		"DisplayName": "German",
		"TwoLetterISOLanguageName": "de",
		"ThreeLetterISOLanguageName": "ger",
		"ThreeLetterISOLanguageNames": [
		  "ger",
		  "deu"
		]
	  },
	  {
		"Name": "Greek, Modern (1453-)",
		"DisplayName": "Greek, Modern (1453-)",
		"TwoLetterISOLanguageName": "el",
		"ThreeLetterISOLanguageName": "gre",
		"ThreeLetterISOLanguageNames": [
		  "gre",
		  "ell"
		]
	  },
	  {
		"Name": "Guarani",
		"DisplayName": "Guarani",
		"TwoLetterISOLanguageName": "gn",
		"ThreeLetterISOLanguageName": "grn",
		"ThreeLetterISOLanguageNames": [
		  "grn"
		]
	  },
	  {
		"Name": "Gujarati",
		"DisplayName": "Gujarati",
		"TwoLetterISOLanguageName": "gu",
		"ThreeLetterISOLanguageName": "guj",
		"ThreeLetterISOLanguageNames": [
		  "guj"
		]
	  },
	  {
		"Name": "Haitian; Haitian Creole",
		"DisplayName": "Haitian; Haitian Creole",
		"TwoLetterISOLanguageName": "ht",
		"ThreeLetterISOLanguageName": "hat",
		"ThreeLetterISOLanguageNames": [
		  "hat"
		]
	  },
	  {
		"Name": "Hausa",
		"DisplayName": "Hausa",
		"TwoLetterISOLanguageName": "ha",
		"ThreeLetterISOLanguageName": "hau",
		"ThreeLetterISOLanguageNames": [
		  "hau"
		]
	  },
	  {
		"Name": "Hebrew",
		"DisplayName": "Hebrew",
		"TwoLetterISOLanguageName": "he",
		"ThreeLetterISOLanguageName": "heb",
		"ThreeLetterISOLanguageNames": [
		  "heb"
		]
	  },
	  {
		"Name": "Herero",
		"DisplayName": "Herero",
		"TwoLetterISOLanguageName": "hz",
		"ThreeLetterISOLanguageName": "her",
		"ThreeLetterISOLanguageNames": [
		  "her"
		]
	  },
	  {
		"Name": "Hindi",
		"DisplayName": "Hindi",
		"TwoLetterISOLanguageName": "hi-IN",
		"ThreeLetterISOLanguageName": "hin",
		"ThreeLetterISOLanguageNames": [
		  "hin"
		]
	  },
	  {
		"Name": "Hiri Motu",
		"DisplayName": "Hiri Motu",
		"TwoLetterISOLanguageName": "ho",
		"ThreeLetterISOLanguageName": "hmo",
		"ThreeLetterISOLanguageNames": [
		  "hmo"
		]
	  },
	  {
		"Name": "Hungarian",
		"DisplayName": "Hungarian",
		"TwoLetterISOLanguageName": "hu",
		"ThreeLetterISOLanguageName": "hun",
		"ThreeLetterISOLanguageNames": [
		  "hun"
		]
	  },
	  {
		"Name": "Icelandic",
		"DisplayName": "Icelandic",
		"TwoLetterISOLanguageName": "is-IS",
		"ThreeLetterISOLanguageName": "ice",
		"ThreeLetterISOLanguageNames": [
		  "ice",
		  "isl"
		]
	  },
	  {
		"Name": "Ido",
		"DisplayName": "Ido",
		"TwoLetterISOLanguageName": "io",
		"ThreeLetterISOLanguageName": "ido",
		"ThreeLetterISOLanguageNames": [
		  "ido"
		]
	  },
	  {
		"Name": "Igbo",
		"DisplayName": "Igbo",
		"TwoLetterISOLanguageName": "ig",
		"ThreeLetterISOLanguageName": "ibo",
		"ThreeLetterISOLanguageNames": [
		  "ibo"
		]
	  },
	  {
		"Name": "Indonesian",
		"DisplayName": "Indonesian",
		"TwoLetterISOLanguageName": "id",
		"ThreeLetterISOLanguageName": "ind",
		"ThreeLetterISOLanguageNames": [
		  "ind"
		]
	  },
	  {
		"Name": "Interlingua (International Auxiliary Language Association)",
		"DisplayName": "Interlingua (International Auxiliary Language Association)",
		"TwoLetterISOLanguageName": "ia",
		"ThreeLetterISOLanguageName": "ina",
		"ThreeLetterISOLanguageNames": [
		  "ina"
		]
	  },
	  {
		"Name": "Interlingue; Occidental",
		"DisplayName": "Interlingue; Occidental",
		"TwoLetterISOLanguageName": "ie",
		"ThreeLetterISOLanguageName": "ile",
		"ThreeLetterISOLanguageNames": [
		  "ile"
		]
	  },
	  {
		"Name": "Inuktitut",
		"DisplayName": "Inuktitut",
		"TwoLetterISOLanguageName": "iu",
		"ThreeLetterISOLanguageName": "iku",
		"ThreeLetterISOLanguageNames": [
		  "iku"
		]
	  },
	  {
		"Name": "Inupiaq",
		"DisplayName": "Inupiaq",
		"TwoLetterISOLanguageName": "ik",
		"ThreeLetterISOLanguageName": "ipk",
		"ThreeLetterISOLanguageNames": [
		  "ipk"
		]
	  },
	  {
		"Name": "Irish",
		"DisplayName": "Irish",
		"TwoLetterISOLanguageName": "ga",
		"ThreeLetterISOLanguageName": "gle",
		"ThreeLetterISOLanguageNames": [
		  "gle"
		]
	  },
	  {
		"Name": "Italian",
		"DisplayName": "Italian",
		"TwoLetterISOLanguageName": "it",
		"ThreeLetterISOLanguageName": "ita",
		"ThreeLetterISOLanguageNames": [
		  "ita"
		]
	  },
	  {
		"Name": "Japanese",
		"DisplayName": "Japanese",
		"TwoLetterISOLanguageName": "ja",
		"ThreeLetterISOLanguageName": "jpn",
		"ThreeLetterISOLanguageNames": [
		  "jpn"
		]
	  },
	  {
		"Name": "Javanese",
		"DisplayName": "Javanese",
		"TwoLetterISOLanguageName": "jv",
		"ThreeLetterISOLanguageName": "jav",
		"ThreeLetterISOLanguageNames": [
		  "jav"
		]
	  },
	  {
		"Name": "Kalaallisut; Greenlandic",
		"DisplayName": "Kalaallisut; Greenlandic",
		"TwoLetterISOLanguageName": "kl",
		"ThreeLetterISOLanguageName": "kal",
		"ThreeLetterISOLanguageNames": [
		  "kal"
		]
	  },
	  {
		"Name": "Kannada",
		"DisplayName": "Kannada",
		"TwoLetterISOLanguageName": "kn",
		"ThreeLetterISOLanguageName": "kan",
		"ThreeLetterISOLanguageNames": [
		  "kan"
		]
	  },
	  {
		"Name": "Kanuri",
		"DisplayName": "Kanuri",
		"TwoLetterISOLanguageName": "kr",
		"ThreeLetterISOLanguageName": "kau",
		"ThreeLetterISOLanguageNames": [
		  "kau"
		]
	  },
	  {
		"Name": "Kashmiri",
		"DisplayName": "Kashmiri",
		"TwoLetterISOLanguageName": "ks",
		"ThreeLetterISOLanguageName": "kas",
		"ThreeLetterISOLanguageNames": [
		  "kas"
		]
	  },
	  {
		"Name": "Kazakh",
		"DisplayName": "Kazakh",
		"TwoLetterISOLanguageName": "kk",
		"ThreeLetterISOLanguageName": "kaz",
		"ThreeLetterISOLanguageNames": [
		  "kaz"
		]
	  },
	  {
		"Name": "Kikuyu; Gikuyu",
		"DisplayName": "Kikuyu; Gikuyu",
		"TwoLetterISOLanguageName": "ki",
		"ThreeLetterISOLanguageName": "kik",
		"ThreeLetterISOLanguageNames": [
		  "kik"
		]
	  },
	  {
		"Name": "Kinyarwanda",
		"DisplayName": "Kinyarwanda",
		"TwoLetterISOLanguageName": "rw",
		"ThreeLetterISOLanguageName": "kin",
		"ThreeLetterISOLanguageNames": [
		  "kin"
		]
	  },
	  {
		"Name": "Kirghiz; Kyrgyz",
		"DisplayName": "Kirghiz; Kyrgyz",
		"TwoLetterISOLanguageName": "ky",
		"ThreeLetterISOLanguageName": "kir",
		"ThreeLetterISOLanguageNames": [
		  "kir"
		]
	  },
	  {
		"Name": "Komi",
		"DisplayName": "Komi",
		"TwoLetterISOLanguageName": "kv",
		"ThreeLetterISOLanguageName": "kom",
		"ThreeLetterISOLanguageNames": [
		  "kom"
		]
	  },
	  {
		"Name": "Kongo",
		"DisplayName": "Kongo",
		"TwoLetterISOLanguageName": "kg",
		"ThreeLetterISOLanguageName": "kon",
		"ThreeLetterISOLanguageNames": [
		  "kon"
		]
	  },
	  {
		"Name": "Korean",
		"DisplayName": "Korean",
		"TwoLetterISOLanguageName": "ko",
		"ThreeLetterISOLanguageName": "kor",
		"ThreeLetterISOLanguageNames": [
		  "kor"
		]
	  },
	  {
		"Name": "Kuanyama; Kwanyama",
		"DisplayName": "Kuanyama; Kwanyama",
		"TwoLetterISOLanguageName": "kj",
		"ThreeLetterISOLanguageName": "kua",
		"ThreeLetterISOLanguageNames": [
		  "kua"
		]
	  },
	  {
		"Name": "Kurdish",
		"DisplayName": "Kurdish",
		"TwoLetterISOLanguageName": "ku",
		"ThreeLetterISOLanguageName": "kur",
		"ThreeLetterISOLanguageNames": [
		  "kur"
		]
	  },
	  {
		"Name": "Lao",
		"DisplayName": "Lao",
		"TwoLetterISOLanguageName": "lo",
		"ThreeLetterISOLanguageName": "lao",
		"ThreeLetterISOLanguageNames": [
		  "lao"
		]
	  },
	  {
		"Name": "Latin",
		"DisplayName": "Latin",
		"TwoLetterISOLanguageName": "la",
		"ThreeLetterISOLanguageName": "lat",
		"ThreeLetterISOLanguageNames": [
		  "lat"
		]
	  },
	  {
		"Name": "Latvian",
		"DisplayName": "Latvian",
		"TwoLetterISOLanguageName": "lv",
		"ThreeLetterISOLanguageName": "lav",
		"ThreeLetterISOLanguageNames": [
		  "lav"
		]
	  },
	  {
		"Name": "Limburgan; Limburger; Limburgish",
		"DisplayName": "Limburgan; Limburger; Limburgish",
		"TwoLetterISOLanguageName": "li",
		"ThreeLetterISOLanguageName": "lim",
		"ThreeLetterISOLanguageNames": [
		  "lim"
		]
	  },
	  {
		"Name": "Lingala",
		"DisplayName": "Lingala",
		"TwoLetterISOLanguageName": "ln",
		"ThreeLetterISOLanguageName": "lin",
		"ThreeLetterISOLanguageNames": [
		  "lin"
		]
	  },
	  {
		"Name": "Lithuanian",
		"DisplayName": "Lithuanian",
		"TwoLetterISOLanguageName": "lt-LT",
		"ThreeLetterISOLanguageName": "lit",
		"ThreeLetterISOLanguageNames": [
		  "lit"
		]
	  },
	  {
		"Name": "Luba-Katanga",
		"DisplayName": "Luba-Katanga",
		"TwoLetterISOLanguageName": "lu",
		"ThreeLetterISOLanguageName": "lub",
		"ThreeLetterISOLanguageNames": [
		  "lub"
		]
	  },
	  {
		"Name": "Luxembourgish; Letzeburgesch",
		"DisplayName": "Luxembourgish; Letzeburgesch",
		"TwoLetterISOLanguageName": "lb",
		"ThreeLetterISOLanguageName": "ltz",
		"ThreeLetterISOLanguageNames": [
		  "ltz"
		]
	  },
	  {
		"Name": "Macedonian",
		"DisplayName": "Macedonian",
		"TwoLetterISOLanguageName": "mk",
		"ThreeLetterISOLanguageName": "mac",
		"ThreeLetterISOLanguageNames": [
		  "mac",
		  "mkd"
		]
	  },
	  {
		"Name": "Malagasy",
		"DisplayName": "Malagasy",
		"TwoLetterISOLanguageName": "mg",
		"ThreeLetterISOLanguageName": "mlg",
		"ThreeLetterISOLanguageNames": [
		  "mlg"
		]
	  },
	  {
		"Name": "Malay",
		"DisplayName": "Malay",
		"TwoLetterISOLanguageName": "ms",
		"ThreeLetterISOLanguageName": "may",
		"ThreeLetterISOLanguageNames": [
		  "may",
		  "msa"
		]
	  },
	  {
		"Name": "Malayalam",
		"DisplayName": "Malayalam",
		"TwoLetterISOLanguageName": "ml",
		"ThreeLetterISOLanguageName": "mal",
		"ThreeLetterISOLanguageNames": [
		  "mal"
		]
	  },
	  {
		"Name": "Maltese",
		"DisplayName": "Maltese",
		"TwoLetterISOLanguageName": "mt",
		"ThreeLetterISOLanguageName": "mlt",
		"ThreeLetterISOLanguageNames": [
		  "mlt"
		]
	  },
	  {
		"Name": "Manx",
		"DisplayName": "Manx",
		"TwoLetterISOLanguageName": "gv",
		"ThreeLetterISOLanguageName": "glv",
		"ThreeLetterISOLanguageNames": [
		  "glv"
		]
	  },
	  {
		"Name": "Maori",
		"DisplayName": "Maori",
		"TwoLetterISOLanguageName": "mi",
		"ThreeLetterISOLanguageName": "mao",
		"ThreeLetterISOLanguageNames": [
		  "mao",
		  "mri"
		]
	  },
	  {
		"Name": "Marathi",
		"DisplayName": "Marathi",
		"TwoLetterISOLanguageName": "mr",
		"ThreeLetterISOLanguageName": "mar",
		"ThreeLetterISOLanguageNames": [
		  "mar"
		]
	  },
	  {
		"Name": "Marshallese",
		"DisplayName": "Marshallese",
		"TwoLetterISOLanguageName": "mh",
		"ThreeLetterISOLanguageName": "mah",
		"ThreeLetterISOLanguageNames": [
		  "mah"
		]
	  },
	  {
		"Name": "Mongolian",
		"DisplayName": "Mongolian",
		"TwoLetterISOLanguageName": "mn",
		"ThreeLetterISOLanguageName": "mon",
		"ThreeLetterISOLanguageNames": [
		  "mon"
		]
	  },
	  {
		"Name": "Nauru",
		"DisplayName": "Nauru",
		"TwoLetterISOLanguageName": "na",
		"ThreeLetterISOLanguageName": "nau",
		"ThreeLetterISOLanguageNames": [
		  "nau"
		]
	  },
	  {
		"Name": "Navajo; Navaho",
		"DisplayName": "Navajo; Navaho",
		"TwoLetterISOLanguageName": "nv",
		"ThreeLetterISOLanguageName": "nav",
		"ThreeLetterISOLanguageNames": [
		  "nav"
		]
	  },
	  {
		"Name": "Ndebele, North; North Ndebele",
		"DisplayName": "Ndebele, North; North Ndebele",
		"TwoLetterISOLanguageName": "nd",
		"ThreeLetterISOLanguageName": "nde",
		"ThreeLetterISOLanguageNames": [
		  "nde"
		]
	  },
	  {
		"Name": "Ndebele, South; South Ndebele",
		"DisplayName": "Ndebele, South; South Ndebele",
		"TwoLetterISOLanguageName": "nr",
		"ThreeLetterISOLanguageName": "nbl",
		"ThreeLetterISOLanguageNames": [
		  "nbl"
		]
	  },
	  {
		"Name": "Ndonga",
		"DisplayName": "Ndonga",
		"TwoLetterISOLanguageName": "ng",
		"ThreeLetterISOLanguageName": "ndo",
		"ThreeLetterISOLanguageNames": [
		  "ndo"
		]
	  },
	  {
		"Name": "Nepali",
		"DisplayName": "Nepali",
		"TwoLetterISOLanguageName": "ne",
		"ThreeLetterISOLanguageName": "nep",
		"ThreeLetterISOLanguageNames": [
		  "nep"
		]
	  },
	  {
		"Name": "Northern Sami",
		"DisplayName": "Northern Sami",
		"TwoLetterISOLanguageName": "se",
		"ThreeLetterISOLanguageName": "sme",
		"ThreeLetterISOLanguageNames": [
		  "sme"
		]
	  },
	  {
		"Name": "Norwegian",
		"DisplayName": "Norwegian",
		"TwoLetterISOLanguageName": "no",
		"ThreeLetterISOLanguageName": "nor",
		"ThreeLetterISOLanguageNames": [
		  "nor"
		]
	  },
	  {
		"Name": "Norwegian, Nynorsk",
		"DisplayName": "Norwegian, Nynorsk",
		"TwoLetterISOLanguageName": "nn",
		"ThreeLetterISOLanguageName": "nno",
		"ThreeLetterISOLanguageNames": [
		  "nno"
		]
	  },
	  {
		"Name": "Norwegian, Bokmål",
		"DisplayName": "Norwegian, Bokmål",
		"TwoLetterISOLanguageName": "nb",
		"ThreeLetterISOLanguageName": "nob",
		"ThreeLetterISOLanguageNames": [
		  "nob"
		]
	  },
	  {
		"Name": "Occitan (post 1500); Provençal",
		"DisplayName": "Occitan (post 1500); Provençal",
		"TwoLetterISOLanguageName": "oc",
		"ThreeLetterISOLanguageName": "oci",
		"ThreeLetterISOLanguageNames": [
		  "oci"
		]
	  },
	  {
		"Name": "Ojibwa",
		"DisplayName": "Ojibwa",
		"TwoLetterISOLanguageName": "oj",
		"ThreeLetterISOLanguageName": "oji",
		"ThreeLetterISOLanguageNames": [
		  "oji"
		]
	  },
	  {
		"Name": "Oriya",
		"DisplayName": "Oriya",
		"TwoLetterISOLanguageName": "or",
		"ThreeLetterISOLanguageName": "ori",
		"ThreeLetterISOLanguageNames": [
		  "ori"
		]
	  },
	  {
		"Name": "Oromo",
		"DisplayName": "Oromo",
		"TwoLetterISOLanguageName": "om",
		"ThreeLetterISOLanguageName": "orm",
		"ThreeLetterISOLanguageNames": [
		  "orm"
		]
	  },
	  {
		"Name": "Ossetian; Ossetic",
		"DisplayName": "Ossetian; Ossetic",
		"TwoLetterISOLanguageName": "os",
		"ThreeLetterISOLanguageName": "oss",
		"ThreeLetterISOLanguageNames": [
		  "oss"
		]
	  },
	  {
		"Name": "Pali",
		"DisplayName": "Pali",
		"TwoLetterISOLanguageName": "pi",
		"ThreeLetterISOLanguageName": "pli",
		"ThreeLetterISOLanguageNames": [
		  "pli"
		]
	  },
	  {
		"Name": "Panjabi; Punjabi",
		"DisplayName": "Panjabi; Punjabi",
		"TwoLetterISOLanguageName": "pa",
		"ThreeLetterISOLanguageName": "pan",
		"ThreeLetterISOLanguageNames": [
		  "pan"
		]
	  },
	  {
		"Name": "Persian",
		"DisplayName": "Persian",
		"TwoLetterISOLanguageName": "fa",
		"ThreeLetterISOLanguageName": "per",
		"ThreeLetterISOLanguageNames": [
		  "per",
		  "fas"
		]
	  },
	  {
		"Name": "Polish",
		"DisplayName": "Polish",
		"TwoLetterISOLanguageName": "pl",
		"ThreeLetterISOLanguageName": "pol",
		"ThreeLetterISOLanguageNames": [
		  "pol"
		]
	  },
	  {
		"Name": "Portuguese",
		"DisplayName": "Portuguese",
		"TwoLetterISOLanguageName": "pt-PT",
		"ThreeLetterISOLanguageName": "por",
		"ThreeLetterISOLanguageNames": [
		  "por"
		]
	  },
	  {
		"Name": "Portuguese (Brazil)",
		"DisplayName": "Portuguese (Brazil)",
		"TwoLetterISOLanguageName": "pt-BR",
		"ThreeLetterISOLanguageName": "pob",
		"ThreeLetterISOLanguageNames": [
		  "pob"
		]
	  },
	  {
		"Name": "Pushto; Pashto",
		"DisplayName": "Pushto; Pashto",
		"TwoLetterISOLanguageName": "ps",
		"ThreeLetterISOLanguageName": "pus",
		"ThreeLetterISOLanguageNames": [
		  "pus"
		]
	  },
	  {
		"Name": "Quechua",
		"DisplayName": "Quechua",
		"TwoLetterISOLanguageName": "qu",
		"ThreeLetterISOLanguageName": "que",
		"ThreeLetterISOLanguageNames": [
		  "que"
		]
	  },
	  {
		"Name": "Romanian; Moldavian; Moldovan",
		"DisplayName": "Romanian; Moldavian; Moldovan",
		"TwoLetterISOLanguageName": "ro",
		"ThreeLetterISOLanguageName": "rum",
		"ThreeLetterISOLanguageNames": [
		  "rum",
		  "ron"
		]
	  },
	  {
		"Name": "Romansh",
		"DisplayName": "Romansh",
		"TwoLetterISOLanguageName": "rm",
		"ThreeLetterISOLanguageName": "roh",
		"ThreeLetterISOLanguageNames": [
		  "roh"
		]
	  },
	  {
		"Name": "Rundi",
		"DisplayName": "Rundi",
		"TwoLetterISOLanguageName": "rn",
		"ThreeLetterISOLanguageName": "run",
		"ThreeLetterISOLanguageNames": [
		  "run"
		]
	  },
	  {
		"Name": "Russian",
		"DisplayName": "Russian",
		"TwoLetterISOLanguageName": "ru",
		"ThreeLetterISOLanguageName": "rus",
		"ThreeLetterISOLanguageNames": [
		  "rus"
		]
	  },
	  {
		"Name": "Samoan",
		"DisplayName": "Samoan",
		"TwoLetterISOLanguageName": "sm",
		"ThreeLetterISOLanguageName": "smo",
		"ThreeLetterISOLanguageNames": [
		  "smo"
		]
	  },
	  {
		"Name": "Sango",
		"DisplayName": "Sango",
		"TwoLetterISOLanguageName": "sg",
		"ThreeLetterISOLanguageName": "sag",
		"ThreeLetterISOLanguageNames": [
		  "sag"
		]
	  },
	  {
		"Name": "Sanskrit",
		"DisplayName": "Sanskrit",
		"TwoLetterISOLanguageName": "sa",
		"ThreeLetterISOLanguageName": "san",
		"ThreeLetterISOLanguageNames": [
		  "san"
		]
	  },
	  {
		"Name": "Sardinian",
		"DisplayName": "Sardinian",
		"TwoLetterISOLanguageName": "sc",
		"ThreeLetterISOLanguageName": "srd",
		"ThreeLetterISOLanguageNames": [
		  "srd"
		]
	  },
	  {
		"Name": "Serbian",
		"DisplayName": "Serbian",
		"TwoLetterISOLanguageName": "sr",
		"ThreeLetterISOLanguageName": "srp",
		"ThreeLetterISOLanguageNames": [
		  "srp",
		  "scc"
		]
	  },
	  {
		"Name": "Shona",
		"DisplayName": "Shona",
		"TwoLetterISOLanguageName": "sn",
		"ThreeLetterISOLanguageName": "sna",
		"ThreeLetterISOLanguageNames": [
		  "sna"
		]
	  },
	  {
		"Name": "Sichuan Yi; Nuosu",
		"DisplayName": "Sichuan Yi; Nuosu",
		"TwoLetterISOLanguageName": "ii",
		"ThreeLetterISOLanguageName": "iii",
		"ThreeLetterISOLanguageNames": [
		  "iii"
		]
	  },
	  {
		"Name": "Sindhi",
		"DisplayName": "Sindhi",
		"TwoLetterISOLanguageName": "sd",
		"ThreeLetterISOLanguageName": "snd",
		"ThreeLetterISOLanguageNames": [
		  "snd"
		]
	  },
	  {
		"Name": "Sinhala, Sinhalese",
		"DisplayName": "Sinhala; Sinhalese",
		"TwoLetterISOLanguageName": "si",
		"ThreeLetterISOLanguageName": "sin",
		"ThreeLetterISOLanguageNames": [
		  "sin"
		]
	  },
	  {
		"Name": "Slovak",
		"DisplayName": "Slovak",
		"TwoLetterISOLanguageName": "sk",
		"ThreeLetterISOLanguageName": "slo",
		"ThreeLetterISOLanguageNames": [
		  "slo",
		  "slk"
		]
	  },
	  {
		"Name": "Slovenian",
		"DisplayName": "Slovenian",
		"TwoLetterISOLanguageName": "sl-SI",
		"ThreeLetterISOLanguageName": "slv",
		"ThreeLetterISOLanguageNames": [
		  "slv"
		]
	  },
	  {
		"Name": "Somali",
		"DisplayName": "Somali",
		"TwoLetterISOLanguageName": "so",
		"ThreeLetterISOLanguageName": "som",
		"ThreeLetterISOLanguageNames": [
		  "som"
		]
	  },
	  {
		"Name": "Sotho, Southern",
		"DisplayName": "Sotho, Southern",
		"TwoLetterISOLanguageName": "st",
		"ThreeLetterISOLanguageName": "sot",
		"ThreeLetterISOLanguageNames": [
		  "sot"
		]
	  },
	  {
		"DisplayName": "Spanish, Argentina",
		"TwoLetterISOLanguageName": "es-AR",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"DisplayName": "Spanish, Dominican Republic",
		"TwoLetterISOLanguageName": "es-DO",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"DisplayName": "Spanish, Latin America",
		"TwoLetterISOLanguageName": "es-419",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Spanish; Castilian",
		"DisplayName": "Spanish, Castilian",
		"TwoLetterISOLanguageName": "es-ES",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Spanish; Latin",
		"DisplayName": "Spanish, Mexico",
		"TwoLetterISOLanguageName": "es-MX",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Sundanese",
		"DisplayName": "Sundanese",
		"TwoLetterISOLanguageName": "su",
		"ThreeLetterISOLanguageName": "sun",
		"ThreeLetterISOLanguageNames": [
		  "sun"
		]
	  },
	  {
		"Name": "Swahili",
		"DisplayName": "Swahili",
		"TwoLetterISOLanguageName": "sw",
		"ThreeLetterISOLanguageName": "swa",
		"ThreeLetterISOLanguageNames": [
		  "swa"
		]
	  },
	  {
		"Name": "Swati",
		"DisplayName": "Swati",
		"TwoLetterISOLanguageName": "ss",
		"ThreeLetterISOLanguageName": "ssw",
		"ThreeLetterISOLanguageNames": [
		  "ssw"
		]
	  },
	  {
		"Name": "Swedish",
		"DisplayName": "Swedish",
		"TwoLetterISOLanguageName": "sv",
		"ThreeLetterISOLanguageName": "swe",
		"ThreeLetterISOLanguageNames": [
		  "swe"
		]
	  },
	  {
		"Name": "Swiss German; Alemannic; Alsatian",
		"DisplayName": "Swiss German; Alemannic; Alsatian",
		"ThreeLetterISOLanguageName": "gsw",
		"ThreeLetterISOLanguageNames": [
		  "gsw"
		]
	  },
	  {
		"Name": "Tagalog",
		"DisplayName": "Tagalog",
		"TwoLetterISOLanguageName": "tl",
		"ThreeLetterISOLanguageName": "tgl",
		"ThreeLetterISOLanguageNames": [
		  "tgl"
		]
	  },
	  {
		"Name": "Tahitian",
		"DisplayName": "Tahitian",
		"TwoLetterISOLanguageName": "ty",
		"ThreeLetterISOLanguageName": "tah",
		"ThreeLetterISOLanguageNames": [
		  "tah"
		]
	  },
	  {
		"Name": "Tajik",
		"DisplayName": "Tajik",
		"TwoLetterISOLanguageName": "tg",
		"ThreeLetterISOLanguageName": "tgk",
		"ThreeLetterISOLanguageNames": [
		  "tgk"
		]
	  },
	  {
		"Name": "Tamil",
		"DisplayName": "Tamil",
		"TwoLetterISOLanguageName": "ta",
		"ThreeLetterISOLanguageName": "tam",
		"ThreeLetterISOLanguageNames": [
		  "tam"
		]
	  },
	  {
		"Name": "Tatar",
		"DisplayName": "Tatar",
		"TwoLetterISOLanguageName": "tt",
		"ThreeLetterISOLanguageName": "tat",
		"ThreeLetterISOLanguageNames": [
		  "tat"
		]
	  },
	  {
		"Name": "Telugu",
		"DisplayName": "Telugu",
		"TwoLetterISOLanguageName": "te",
		"ThreeLetterISOLanguageName": "tel",
		"ThreeLetterISOLanguageNames": [
		  "tel"
		]
	  },
	  {
		"Name": "Thai",
		"DisplayName": "Thai",
		"TwoLetterISOLanguageName": "th",
		"ThreeLetterISOLanguageName": "tha",
		"ThreeLetterISOLanguageNames": [
		  "tha"
		]
	  },
	  {
		"Name": "Tibetan",
		"DisplayName": "Tibetan",
		"TwoLetterISOLanguageName": "bo",
		"ThreeLetterISOLanguageName": "tib",
		"ThreeLetterISOLanguageNames": [
		  "tib",
		  "bod"
		]
	  },
	  {
		"Name": "Tigrinya",
		"DisplayName": "Tigrinya",
		"TwoLetterISOLanguageName": "ti",
		"ThreeLetterISOLanguageName": "tir",
		"ThreeLetterISOLanguageNames": [
		  "tir"
		]
	  },
	  {
		"Name": "Tonga (Tonga Islands)",
		"DisplayName": "Tonga (Tonga Islands)",
		"TwoLetterISOLanguageName": "to",
		"ThreeLetterISOLanguageName": "ton",
		"ThreeLetterISOLanguageNames": [
		  "ton"
		]
	  },
	  {
		"Name": "Tsonga",
		"DisplayName": "Tsonga",
		"TwoLetterISOLanguageName": "ts",
		"ThreeLetterISOLanguageName": "tso",
		"ThreeLetterISOLanguageNames": [
		  "tso"
		]
	  },
	  {
		"Name": "Tswana",
		"DisplayName": "Tswana",
		"TwoLetterISOLanguageName": "tn",
		"ThreeLetterISOLanguageName": "tsn",
		"ThreeLetterISOLanguageNames": [
		  "tsn"
		]
	  },
	  {
		"Name": "Turkish",
		"DisplayName": "Turkish",
		"TwoLetterISOLanguageName": "tr",
		"ThreeLetterISOLanguageName": "tur",
		"ThreeLetterISOLanguageNames": [
		  "tur"
		]
	  },
	  {
		"Name": "Turkmen",
		"DisplayName": "Turkmen",
		"TwoLetterISOLanguageName": "tk",
		"ThreeLetterISOLanguageName": "tuk",
		"ThreeLetterISOLanguageNames": [
		  "tuk"
		]
	  },
	  {
		"Name": "Twi",
		"DisplayName": "Twi",
		"TwoLetterISOLanguageName": "tw",
		"ThreeLetterISOLanguageName": "twi",
		"ThreeLetterISOLanguageNames": [
		  "twi"
		]
	  },
	  {
		"Name": "Uighur; Uyghur",
		"DisplayName": "Uighur; Uyghur",
		"TwoLetterISOLanguageName": "ug",
		"ThreeLetterISOLanguageName": "uig",
		"ThreeLetterISOLanguageNames": [
		  "uig"
		]
	  },
	  {
		"Name": "Ukrainian",
		"DisplayName": "Ukrainian",
		"TwoLetterISOLanguageName": "uk",
		"ThreeLetterISOLanguageName": "ukr",
		"ThreeLetterISOLanguageNames": [
		  "ukr"
		]
	  },
	  {
		"Name": "Urdu",
		"DisplayName": "Urdu",
		"TwoLetterISOLanguageName": "ur-PK",
		"ThreeLetterISOLanguageName": "urd",
		"ThreeLetterISOLanguageNames": [
		  "urd"
		]
	  },
	  {
		"Name": "Uzbek",
		"DisplayName": "Uzbek",
		"TwoLetterISOLanguageName": "uz",
		"ThreeLetterISOLanguageName": "uzb",
		"ThreeLetterISOLanguageNames": [
		  "uzb"
		]
	  },
	  {
		"Name": "Venda",
		"DisplayName": "Venda",
		"TwoLetterISOLanguageName": "ve",
		"ThreeLetterISOLanguageName": "ven",
		"ThreeLetterISOLanguageNames": [
		  "ven"
		]
	  },
	  {
		"Name": "Vietnamese",
		"DisplayName": "Vietnamese",
		"TwoLetterISOLanguageName": "vi",
		"ThreeLetterISOLanguageName": "vie",
		"ThreeLetterISOLanguageNames": [
		  "vie"
		]
	  },
	  {
		"Name": "Volapük",
		"DisplayName": "Volapük",
		"TwoLetterISOLanguageName": "vo",
		"ThreeLetterISOLanguageName": "vol",
		"ThreeLetterISOLanguageNames": [
		  "vol"
		]
	  },
	  {
		"Name": "Walloon",
		"DisplayName": "Walloon",
		"TwoLetterISOLanguageName": "wa",
		"ThreeLetterISOLanguageName": "wln",
		"ThreeLetterISOLanguageNames": [
		  "wln"
		]
	  },
	  {
		"Name": "Welsh",
		"DisplayName": "Welsh",
		"TwoLetterISOLanguageName": "cy",
		"ThreeLetterISOLanguageName": "wel",
		"ThreeLetterISOLanguageNames": [
		  "wel",
		  "cym"
		]
	  },
	  {
		"Name": "Western Frisian",
		"DisplayName": "Western Frisian",
		"TwoLetterISOLanguageName": "fy",
		"ThreeLetterISOLanguageName": "fry",
		"ThreeLetterISOLanguageNames": [
		  "fry"
		]
	  },
	  {
		"Name": "Wolof",
		"DisplayName": "Wolof",
		"TwoLetterISOLanguageName": "wo",
		"ThreeLetterISOLanguageName": "wol",
		"ThreeLetterISOLanguageNames": [
		  "wol"
		]
	  },
	  {
		"Name": "Xhosa",
		"DisplayName": "Xhosa",
		"TwoLetterISOLanguageName": "xh",
		"ThreeLetterISOLanguageName": "xho",
		"ThreeLetterISOLanguageNames": [
		  "xho"
		]
	  },
	  {
		"Name": "Yiddish",
		"DisplayName": "Yiddish",
		"TwoLetterISOLanguageName": "yi",
		"ThreeLetterISOLanguageName": "yid",
		"ThreeLetterISOLanguageNames": [
		  "yid"
		]
	  },
	  {
		"Name": "Yoruba",
		"DisplayName": "Yoruba",
		"TwoLetterISOLanguageName": "yo",
		"ThreeLetterISOLanguageName": "yor",
		"ThreeLetterISOLanguageNames": [
		  "yor"
		]
	  },
	  {
		"Name": "Zhuang; Chuang",
		"DisplayName": "Zhuang; Chuang",
		"TwoLetterISOLanguageName": "za",
		"ThreeLetterISOLanguageName": "zha",
		"ThreeLetterISOLanguageNames": [
		  "zha"
		]
	  },
	  {
		"Name": "Zulu",
		"DisplayName": "Zulu",
		"TwoLetterISOLanguageName": "zu",
		"ThreeLetterISOLanguageName": "zul",
		"ThreeLetterISOLanguageNames": [
		  "zul"
		]
	  }
	];
}

export default {
	validateCulture: validateCulture,
	getCultures: getCultures,
	getNativeName: getNativeName
};


/* eslint-enable indent */
