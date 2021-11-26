
/* eslint-disable indent */

// Try to match a given culture with one in the list.
// return the closest match or nothing.
export function matchCulture(culture) {
	if (!culture) 
		return {};
	const ctrlLst = getCultures();
	
	// First, find an exact match.
	if (ctrlLst[culture]) 
		return ctrlLst[culture];
	
	// If culture is a child
	if (culture.indexOf('-') > 1) {
		let parentCulture = culture.split('-')[0];
		// find an exact match ot the parent.
		if (ctrlLst[parentCulture]) 
			return ctrlLst[parentCulture];
		// find a sister culture, pick the first found.
		for (var item in ctrlLst) {
			if (ctrlLst[item].TwoLetterISOLanguageName.split('-')[0] === parentCulture 
			|| ctrlLst[item].ThreeLetterISOLanguageName.split('-')[0] === parentCulture)
				return ctrlLst[item];
		}
	} else {
		// otherwise try and find a child culture.
		// pick the first found.
		for (var item in ctrlLst) {
			if (ctrlLst[item].TwoLetterISOLanguageName.split('-')[0] === culture 
			|| ctrlLst[item].ThreeLetterISOLanguageName.split('-')[0] === culture)
				return ctrlLst[item];
		}
	}
	
	return {};
}

// List of native names taken from 
// https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code

export function getCultures() {
	return {
	  "ab": {
		"Name": "Abkhazian",
		"DisplayName": "Abkhazian",
		"DisplayNativeName": "Аҧсуа",
		"TwoLetterISOLanguageName": "ab",
		"ThreeLetterISOLanguageName": "abk",
		"ThreeLetterISOLanguageNames": [
		  "abk"
		]
	  },
	  "aa": {
		"Name": "Afar",
		"DisplayName": "Afar",
		"DisplayNativeName": "Afar",
		"TwoLetterISOLanguageName": "aa",
		"ThreeLetterISOLanguageName": "aar",
		"ThreeLetterISOLanguageNames": [
		  "aar"
		]
	  },
	  "af": {
		"Name": "Afrikaans",
		"DisplayName": "Afrikaans",
		"DisplayNativeName": "Afrikaans",
		"TwoLetterISOLanguageName": "af",
		"ThreeLetterISOLanguageName": "afr",
		"ThreeLetterISOLanguageNames": [
		  "afr"
		]
	  },
	  "ak": {
		"Name": "Akan",
		"DisplayName": "Akan",
		"DisplayNativeName": "Akana",
		"TwoLetterISOLanguageName": "ak",
		"ThreeLetterISOLanguageName": "aka",
		"ThreeLetterISOLanguageNames": [
		  "aka"
		]
	  },
	  "sq": {
		"Name": "Albanian",
		"DisplayName": "Albanian",
		"DisplayNativeName": "Shqip",
		"TwoLetterISOLanguageName": "sq",
		"ThreeLetterISOLanguageName": "alb",
		"ThreeLetterISOLanguageNames": [
		  "alb",
		  "sqi"
		]
	  },
	  "am": {
		"Name": "Amharic",
		"DisplayName": "Amharic",
		"DisplayNativeName": "አማርኛ",
		"TwoLetterISOLanguageName": "am",
		"ThreeLetterISOLanguageName": "amh",
		"ThreeLetterISOLanguageNames": [
		  "amh"
		]
	  },
	  "ar": {
		"Name": "Arabic",
		"DisplayName": "Arabic",
		"DisplayNativeName": "العربية",
		"TwoLetterISOLanguageName": "ar",
		"ThreeLetterISOLanguageName": "ara",
		"ThreeLetterISOLanguageNames": [
		  "ara"
		]
	  },
	  "an": {
		"Name": "Aragonese",
		"DisplayName": "Aragonese",
		"DisplayNativeName": "Aragonés",
		"TwoLetterISOLanguageName": "an",
		"ThreeLetterISOLanguageName": "arg",
		"ThreeLetterISOLanguageNames": [
		  "arg"
		]
	  },
	  "hy": {
		"Name": "Armenian",
		"DisplayName": "Armenian",
		"DisplayNativeName": "Հայերեն",
		"TwoLetterISOLanguageName": "hy",
		"ThreeLetterISOLanguageName": "arm",
		"ThreeLetterISOLanguageNames": [
		  "arm",
		  "hye"
		]
	  },
	  "as": {
		"Name": "Assamese",
		"DisplayName": "Assamese",
		"DisplayNativeName": "অসমীয়া",
		"TwoLetterISOLanguageName": "as",
		"ThreeLetterISOLanguageName": "asm",
		"ThreeLetterISOLanguageNames": [
		  "asm"
		]
	  },
	  "av": {
		"Name": "Avaric",
		"DisplayName": "Avaric",
		"DisplayNativeName": "Авар",
		"TwoLetterISOLanguageName": "av",
		"ThreeLetterISOLanguageName": "ava",
		"ThreeLetterISOLanguageNames": [
		  "ava"
		]
	  },
	  "ae": {
		"Name": "Avestan",
		"DisplayName": "Avestan",
		"DisplayNativeName": "Avestan",
		"TwoLetterISOLanguageName": "ae",
		"ThreeLetterISOLanguageName": "ave",
		"ThreeLetterISOLanguageNames": [
		  "ave"
		]
	  },
	  "ay": {
		"Name": "Aymara",
		"DisplayName": "Aymara",
		"DisplayNativeName": "Aymar",
		"TwoLetterISOLanguageName": "ay",
		"ThreeLetterISOLanguageName": "aym",
		"ThreeLetterISOLanguageNames": [
		  "aym"
		]
	  },
	  "az": {
		"Name": "Azerbaijani",
		"DisplayName": "Azerbaijani",
		"DisplayNativeName": "Azərbaycanca",
		"TwoLetterISOLanguageName": "az",
		"ThreeLetterISOLanguageName": "aze",
		"ThreeLetterISOLanguageNames": [
		  "aze"
		]
	  },
	  "bm": {
		"Name": "Bambara",
		"DisplayName": "Bambara",
		"DisplayNativeName": "Bamanankan",
		"TwoLetterISOLanguageName": "bm",
		"ThreeLetterISOLanguageName": "bam",
		"ThreeLetterISOLanguageNames": [
		  "bam"
		]
	  },
	  "ba": {
		"Name": "Bashkir",
		"DisplayName": "Bashkir",
		"DisplayNativeName": "Башҡорт",
		"TwoLetterISOLanguageName": "ba",
		"ThreeLetterISOLanguageName": "bak",
		"ThreeLetterISOLanguageNames": [
		  "bak"
		]
	  },
	  "eu": {
		"Name": "Basque",
		"DisplayName": "Basque",
		"DisplayNativeName": "Euskara",
		"TwoLetterISOLanguageName": "eu",
		"ThreeLetterISOLanguageName": "baq",
		"ThreeLetterISOLanguageNames": [
		  "baq",
		  "eus"
		]
	  },
	  "be-BY": {
		"Name": "Belarusian",
		"DisplayName": "Belarusian",
		"DisplayNativeName": "Беларуская",
		"TwoLetterISOLanguageName": "be-BY",
		"ThreeLetterISOLanguageName": "bel",
		"ThreeLetterISOLanguageNames": [
		  "bel"
		]
	  },
	  "bn-BD": {
		"Name": "Bengali",
		"DisplayName": "Bengali",
		"DisplayNativeName": "বাংলা",
		"TwoLetterISOLanguageName": "bn-BD",
		"ThreeLetterISOLanguageName": "ben",
		"ThreeLetterISOLanguageNames": [
		  "ben"
		]
	  },
	  "bh": {
		"Name": "Bihari languages",
		"DisplayName": "Bihari languages",
		"DisplayNativeName": "भोजपुरी",
		"TwoLetterISOLanguageName": "bh",
		"ThreeLetterISOLanguageName": "bih",
		"ThreeLetterISOLanguageNames": [
		  "bih"
		]
	  },
	  "bi": {
		"Name": "Bislama",
		"DisplayName": "Bislama",
		"DisplayNativeName": "Bislama",
		"TwoLetterISOLanguageName": "bi",
		"ThreeLetterISOLanguageName": "bis",
		"ThreeLetterISOLanguageNames": [
		  "bis"
		]
	  },
	  "bs": {
		"Name": "Bosnian",
		"DisplayName": "Bosnian",
		"DisplayNativeName": "Bosanski",
		"TwoLetterISOLanguageName": "bs",
		"ThreeLetterISOLanguageName": "bos",
		"ThreeLetterISOLanguageNames": [
		  "bos"
		]
	  },
	  "br": {
		"Name": "Breton",
		"DisplayName": "Breton",
		"DisplayNativeName": "Brezhoneg",
		"TwoLetterISOLanguageName": "br",
		"ThreeLetterISOLanguageName": "bre",
		"ThreeLetterISOLanguageNames": [
		  "bre"
		]
	  },
	  "bg-BG": {
		"Name": "Bulgarian",
		"DisplayName": "Bulgarian",
		"DisplayNativeName": "Български",
		"TwoLetterISOLanguageName": "bg-BG",
		"ThreeLetterISOLanguageName": "bul",
		"ThreeLetterISOLanguageNames": [
		  "bul"
		]
	  },
	  "my": {
		"Name": "Burmese",
		"DisplayName": "Burmese",
		"DisplayNativeName": "Myanmasa",
		"TwoLetterISOLanguageName": "my",
		"ThreeLetterISOLanguageName": "bur",
		"ThreeLetterISOLanguageNames": [
		  "bur",
		  "mya"
		]
	  },
	  "ca": {
		"Name": "Catalan; Valencian",
		"DisplayName": "Catalan; Valencian",
		"DisplayNativeName": "Català",
		"TwoLetterISOLanguageName": "ca",
		"ThreeLetterISOLanguageName": "cat",
		"ThreeLetterISOLanguageNames": [
		  "cat"
		]
	  },
	  "km": {
		"Name": "Central Khmer",
		"DisplayName": "Central Khmer",
		"DisplayNativeName": "ភាសាខ្មែរ",
		"TwoLetterISOLanguageName": "km",
		"ThreeLetterISOLanguageName": "khm",
		"ThreeLetterISOLanguageNames": [
		  "khm"
		]
	  },
	  "ch": {
		"Name": "Chamorro",
		"DisplayName": "Chamorro",
		"DisplayNativeName": "Chamoru",
		"TwoLetterISOLanguageName": "ch",
		"ThreeLetterISOLanguageName": "cha",
		"ThreeLetterISOLanguageNames": [
		  "cha"
		]
	  },
	  "ce": {
		"Name": "Chechen",
		"DisplayName": "Chechen",
		"DisplayNativeName": "Нохчийн",
		"TwoLetterISOLanguageName": "ce",
		"ThreeLetterISOLanguageName": "che",
		"ThreeLetterISOLanguageNames": [
		  "che"
		]
	  },
	  "ny": {
		"Name": "Chichewa; Chewa; Nyanja",
		"DisplayName": "Chichewa; Chewa; Nyanja",
		"DisplayNativeName": "Chi-Chewa",
		"TwoLetterISOLanguageName": "ny",
		"ThreeLetterISOLanguageName": "nya",
		"ThreeLetterISOLanguageNames": [
		  "nya"
		]
	  },
	  "zh-CN": {
		"Name": "Chinese",
		"DisplayName": "Chinese",
		"DisplayNativeName": "中文",
		"TwoLetterISOLanguageName": "zh-CN",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  "zh-HK": {
		"Name": "Chinese; Hong Kong",
		"DisplayName": "Chinese; Hong Kong",
		"DisplayNativeName": "廣東話 (香港)",
		"TwoLetterISOLanguageName": "zh-HK",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  "zh-TW": {
		"Name": "Chinese; Traditional",
		"DisplayName": "Chinese; Traditional",
		"DisplayNativeName": "中文(台灣)‬",
		"TwoLetterISOLanguageName": "zh-TW",
		"ThreeLetterISOLanguageName": "chi",
		"ThreeLetterISOLanguageNames": [
		  "chi",
		  "zho"
		]
	  },
	  "cu": {
		"Name": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"DisplayName": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"DisplayNativeName": "словѣньскъ",
		"TwoLetterISOLanguageName": "cu",
		"ThreeLetterISOLanguageName": "chu",
		"ThreeLetterISOLanguageNames": [
		  "chu"
		]
	  },
	  "cv": {
		"Name": "Chuvash",
		"DisplayName": "Chuvash",
		"DisplayNativeName": "Чăваш",
		"TwoLetterISOLanguageName": "cv",
		"ThreeLetterISOLanguageName": "chv",
		"ThreeLetterISOLanguageNames": [
		  "chv"
		]
	  },
	  "kw": {
		"Name": "Cornish",
		"DisplayName": "Cornish",
		"DisplayNativeName": "Kernewek",
		"TwoLetterISOLanguageName": "kw",
		"ThreeLetterISOLanguageName": "cor",
		"ThreeLetterISOLanguageNames": [
		  "cor"
		]
	  },
	  "co": {
		"Name": "Corsican",
		"DisplayName": "Corsican",
		"DisplayNativeName": "Corsu",
		"TwoLetterISOLanguageName": "co",
		"ThreeLetterISOLanguageName": "cos",
		"ThreeLetterISOLanguageNames": [
		  "cos"
		]
	  },
	  "cr": {
		"Name": "Cree",
		"DisplayName": "Cree",
		"DisplayNativeName": "Nehiyaw",
		"TwoLetterISOLanguageName": "cr",
		"ThreeLetterISOLanguageName": "cre",
		"ThreeLetterISOLanguageNames": [
		  "cre"
		]
	  },
	  "hr": {
		"Name": "Croatian",
		"DisplayName": "Croatian",
		"DisplayNativeName": "Hrvatski",
		"TwoLetterISOLanguageName": "hr",
		"ThreeLetterISOLanguageName": "hrv",
		"ThreeLetterISOLanguageNames": [
		  "hrv"
		]
	  },
	  "cs": {
		"Name": "Czech",
		"DisplayName": "Czech",
		"DisplayNativeName": "Česky",
		"TwoLetterISOLanguageName": "cs",
		"ThreeLetterISOLanguageName": "cze",
		"ThreeLetterISOLanguageNames": [
		  "cze",
		  "ces"
		]
	  },
	  "da": {
		"Name": "Danish",
		"DisplayName": "Danish",
		"DisplayNativeName": "Dansk",
		"TwoLetterISOLanguageName": "da",
		"ThreeLetterISOLanguageName": "dan",
		"ThreeLetterISOLanguageNames": [
		  "dan"
		]
	  },
	  "dv": {
		"Name": "Divehi; Dhivehi; Maldivian",
		"DisplayName": "Divehi; Dhivehi; Maldivian",
		"DisplayNativeName": "Divehi",
		"TwoLetterISOLanguageName": "dv",
		"ThreeLetterISOLanguageName": "div",
		"ThreeLetterISOLanguageNames": [
		  "div"
		]
	  },
	  "nl": {
		"Name": "Dutch; Flemish",
		"DisplayName": "Dutch; Flemish",
		"DisplayNativeName": "Nederlands",
		"TwoLetterISOLanguageName": "nl",
		"ThreeLetterISOLanguageName": "dut",
		"ThreeLetterISOLanguageNames": [
		  "dut",
		  "nld"
		]
	  },
	  "dz": {
		"Name": "Dzongkha",
		"DisplayName": "Dzongkha",
		"DisplayNativeName": "Dzongkha",
		"TwoLetterISOLanguageName": "dz",
		"ThreeLetterISOLanguageName": "dzo",
		"ThreeLetterISOLanguageNames": [
		  "dzo"
		]
	  },
	  "en-US": {
		"Name": "English",
		"DisplayName": "English",
		"DisplayNativeName": "English",
		"TwoLetterISOLanguageName": "en-US",
		"ThreeLetterISOLanguageName": "eng",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  "en-GB": {
		"DisplayName": "English, Great Britain",
		"DisplayNativeName": "English, Great Britain",
		"TwoLetterISOLanguageName": "en-GB",
		"ThreeLetterISOLanguageName": "en-GB",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  "eo": {
		"Name": "Esperanto",
		"DisplayName": "Esperanto",
		"DisplayNativeName": "Esperanto",
		"TwoLetterISOLanguageName": "eo",
		"ThreeLetterISOLanguageName": "epo",
		"ThreeLetterISOLanguageNames": [
		  "epo"
		]
	  },
	  "et": {
		"Name": "Estonian",
		"DisplayName": "Estonian",
		"DisplayNativeName": "Eesti",
		"TwoLetterISOLanguageName": "et",
		"ThreeLetterISOLanguageName": "est",
		"ThreeLetterISOLanguageNames": [
		  "est"
		]
	  },
	  "ee": {
		"Name": "Ewe",
		"DisplayName": "Ewe",
		"DisplayNativeName": "Ɛʋɛ",
		"TwoLetterISOLanguageName": "ee",
		"ThreeLetterISOLanguageName": "ewe",
		"ThreeLetterISOLanguageNames": [
		  "ewe"
		]
	  },
	  "fo": {
		"Name": "Faroese",
		"DisplayName": "Faroese",
		"DisplayNativeName": "Føroyskt",
		"TwoLetterISOLanguageName": "fo",
		"ThreeLetterISOLanguageName": "fao",
		"ThreeLetterISOLanguageNames": [
		  "fao"
		]
	  },
	  "fj": {
		"Name": "Fijian",
		"DisplayName": "Fijian",
		"DisplayNativeName": "Na Vosa Vakaviti",
		"TwoLetterISOLanguageName": "fj",
		"ThreeLetterISOLanguageName": "fij",
		"ThreeLetterISOLanguageNames": [
		  "fij"
		]
	  },
	  "fil": {
		"Name": "Filipino",
		"DisplayName": "Filipino",
		"DisplayNativeName": "Filipino",
		"TwoLetterISOLanguageName": "fil",
		"ThreeLetterISOLanguageName": "fil",
		"ThreeLetterISOLanguageNames": [
		  "fil"
		]
	  },
	  "fi": {
		"Name": "Finnish",
		"DisplayName": "Finnish",
		"DisplayNativeName": "Suomi",
		"TwoLetterISOLanguageName": "fi",
		"ThreeLetterISOLanguageName": "fin",
		"ThreeLetterISOLanguageNames": [
		  "fin"
		]
	  },
	  "fr": {
		"Name": "French",
		"DisplayName": "French",
		"DisplayNativeName": "Français",
		"TwoLetterISOLanguageName": "fr",
		"ThreeLetterISOLanguageName": "fre",
		"ThreeLetterISOLanguageNames": [
		  "fre",
		  "fra"
		],
	  },
	  "fr-CA": {
		"Name": "French, Canada",
		"DisplayName": "French, Canada",
		"DisplayNativeName": "Français, Canada",
		"TwoLetterISOLanguageName": "fr-CA",
		"ThreeLetterISOLanguageName": "frc",
		"ThreeLetterISOLanguageNames": [
		  "frc"
		]
	  },
	  "ff": {
		"Name": "Fulah",
		"DisplayName": "Fulah",
		"DisplayNativeName": "Fulfulde",
		"TwoLetterISOLanguageName": "ff",
		"ThreeLetterISOLanguageName": "ful",
		"ThreeLetterISOLanguageNames": [
		  "ful"
		]
	  },
	  "gd": {
		"Name": "Gaelic; Scottish Gaelic",
		"DisplayName": "Gaelic; Scottish Gaelic",
		"DisplayNativeName": "Gàidhlig",
		"TwoLetterISOLanguageName": "gd",
		"ThreeLetterISOLanguageName": "gla",
		"ThreeLetterISOLanguageNames": [
		  "gla"
		]
	  },
	  "gl": {
		"Name": "Galician",
		"DisplayName": "Galician",
		"DisplayNativeName": "Galego",
		"TwoLetterISOLanguageName": "gl",
		"ThreeLetterISOLanguageName": "glg",
		"ThreeLetterISOLanguageNames": [
		  "glg"
		]
	  },
	  "lg": {
		"Name": "Ganda",
		"DisplayName": "Ganda",
		"DisplayNativeName": "Luganda",
		"TwoLetterISOLanguageName": "lg",
		"ThreeLetterISOLanguageName": "lug",
		"ThreeLetterISOLanguageNames": [
		  "lug"
		]
	  },
	  "ka": {
		"Name": "Georgian",
		"DisplayName": "Georgian",
		"DisplayNativeName": "ქართული",
		"TwoLetterISOLanguageName": "ka",
		"ThreeLetterISOLanguageName": "geo",
		"ThreeLetterISOLanguageNames": [
		  "geo",
		  "kat"
		]
	  },
	  "de": {
		"Name": "German",
		"DisplayName": "German",
		"DisplayNativeName": "Deutsch",
		"TwoLetterISOLanguageName": "de",
		"ThreeLetterISOLanguageName": "ger",
		"ThreeLetterISOLanguageNames": [
		  "ger",
		  "deu"
		]
	  },
	  "el": {
		"Name": "Greek, Modern (1453-)",
		"DisplayName": "Greek, Modern (1453-)",
		"DisplayNativeName": "Ελληνικά",
		"TwoLetterISOLanguageName": "el",
		"ThreeLetterISOLanguageName": "gre",
		"ThreeLetterISOLanguageNames": [
		  "gre",
		  "ell"
		]
	  },
	  "gn": {
		"Name": "Guarani",
		"DisplayName": "Guarani",
		"DisplayNativeName": "Avañe'ẽ",
		"TwoLetterISOLanguageName": "gn",
		"ThreeLetterISOLanguageName": "grn",
		"ThreeLetterISOLanguageNames": [
		  "grn"
		]
	  },
	  "gu": {
		"Name": "Gujarati",
		"DisplayName": "Gujarati",
		"DisplayNativeName": "ગુજરાતી",
		"TwoLetterISOLanguageName": "gu",
		"ThreeLetterISOLanguageName": "guj",
		"ThreeLetterISOLanguageNames": [
		  "guj"
		]
	  },
	  "ht": {
		"Name": "Haitian; Haitian Creole",
		"DisplayName": "Haitian; Haitian Creole",
		"DisplayNativeName": "Krèyol ayisyen",
		"TwoLetterISOLanguageName": "ht",
		"ThreeLetterISOLanguageName": "hat",
		"ThreeLetterISOLanguageNames": [
		  "hat"
		]
	  },
	  "ha": {
		"Name": "Hausa",
		"DisplayName": "Hausa",
		"DisplayNativeName": "هَوُسَ",
		"TwoLetterISOLanguageName": "ha",
		"ThreeLetterISOLanguageName": "hau",
		"ThreeLetterISOLanguageNames": [
		  "hau"
		]
	  },
	  "he": {
		"Name": "Hebrew",
		"DisplayName": "Hebrew",
		"DisplayNativeName": "עברית",
		"TwoLetterISOLanguageName": "he",
		"ThreeLetterISOLanguageName": "heb",
		"ThreeLetterISOLanguageNames": [
		  "heb"
		]
	  },
	  "hz": {
		"Name": "Herero",
		"DisplayName": "Herero",
		"DisplayNativeName": "Otsiherero",
		"TwoLetterISOLanguageName": "hz",
		"ThreeLetterISOLanguageName": "her",
		"ThreeLetterISOLanguageNames": [
		  "her"
		]
	  },
	  "hi-IN": {
		"Name": "Hindi",
		"DisplayName": "Hindi",
		"DisplayNativeName": "हिन्दी",
		"TwoLetterISOLanguageName": "hi-IN",
		"ThreeLetterISOLanguageName": "hin",
		"ThreeLetterISOLanguageNames": [
		  "hin"
		]
	  },
	  "ho": {
		"Name": "Hiri Motu",
		"DisplayName": "Hiri Motu",
		"DisplayNativeName": "Hiri Motu",
		"TwoLetterISOLanguageName": "ho",
		"ThreeLetterISOLanguageName": "hmo",
		"ThreeLetterISOLanguageNames": [
		  "hmo"
		]
	  },
	  "hu": {
		"Name": "Hungarian",
		"DisplayName": "Hungarian",
		"DisplayNativeName": "Magyar",
		"TwoLetterISOLanguageName": "hu",
		"ThreeLetterISOLanguageName": "hun",
		"ThreeLetterISOLanguageNames": [
		  "hun"
		]
	  },
	  "is-IS": {
		"Name": "Icelandic",
		"DisplayName": "Icelandic",
		"DisplayNativeName": "Íslenska",
		"TwoLetterISOLanguageName": "is-IS",
		"ThreeLetterISOLanguageName": "ice",
		"ThreeLetterISOLanguageNames": [
		  "ice",
		  "isl"
		]
	  },
	  "io": {
		"Name": "Ido",
		"DisplayName": "Ido",
		"DisplayNativeName": "Ido",
		"TwoLetterISOLanguageName": "io",
		"ThreeLetterISOLanguageName": "ido",
		"ThreeLetterISOLanguageNames": [
		  "ido"
		]
	  },
	  "ig": {
		"Name": "Igbo",
		"DisplayName": "Igbo",
		"DisplayNativeName": "Igbo",
		"TwoLetterISOLanguageName": "ig",
		"ThreeLetterISOLanguageName": "ibo",
		"ThreeLetterISOLanguageNames": [
		  "ibo"
		]
	  },
	  "id": {
		"Name": "Indonesian",
		"DisplayName": "Indonesian",
		"DisplayNativeName": "Bahasa Indonesia",
		"TwoLetterISOLanguageName": "id",
		"ThreeLetterISOLanguageName": "ind",
		"ThreeLetterISOLanguageNames": [
		  "ind"
		]
	  },
	  "ia": {
		"Name": "Interlingua (International Auxiliary Language Association)",
		"DisplayName": "Interlingua (International Auxiliary Language Association)",
		"DisplayNativeName": "Interlingua",
		"TwoLetterISOLanguageName": "ia",
		"ThreeLetterISOLanguageName": "ina",
		"ThreeLetterISOLanguageNames": [
		  "ina"
		]
	  },
	  "ie": {
		"Name": "Interlingue; Occidental",
		"DisplayName": "Interlingue; Occidental",
		"DisplayNativeName": "Interlingue",
		"TwoLetterISOLanguageName": "ie",
		"ThreeLetterISOLanguageName": "ile",
		"ThreeLetterISOLanguageNames": [
		  "ile"
		]
	  },
	  "iu": {
		"Name": "Inuktitut",
		"DisplayName": "Inuktitut",
		"DisplayNativeName": "Inuktitut",
		"TwoLetterISOLanguageName": "iu",
		"ThreeLetterISOLanguageName": "iku",
		"ThreeLetterISOLanguageNames": [
		  "iku"
		]
	  },
	  "ik": {
		"Name": "Inupiaq",
		"DisplayName": "Inupiaq",
		"DisplayNativeName": "Iñupiak",
		"TwoLetterISOLanguageName": "ik",
		"ThreeLetterISOLanguageName": "ipk",
		"ThreeLetterISOLanguageNames": [
		  "ipk"
		]
	  },
	  "ga": {
		"Name": "Irish",
		"DisplayName": "Irish",
		"DisplayNativeName": "Gaeilge",
		"TwoLetterISOLanguageName": "ga",
		"ThreeLetterISOLanguageName": "gle",
		"ThreeLetterISOLanguageNames": [
		  "gle"
		]
	  },
	  "it": {
		"Name": "Italian",
		"DisplayName": "Italian",
		"DisplayNativeName": "Italiano",
		"TwoLetterISOLanguageName": "it",
		"ThreeLetterISOLanguageName": "ita",
		"ThreeLetterISOLanguageNames": [
		  "ita"
		]
	  },
	  "ja": {
		"Name": "Japanese",
		"DisplayName": "Japanese",
		"DisplayNativeName": "日本語",
		"TwoLetterISOLanguageName": "ja",
		"ThreeLetterISOLanguageName": "jpn",
		"ThreeLetterISOLanguageNames": [
		  "jpn"
		]
	  },
	  "jv": {
		"Name": "Javanese",
		"DisplayName": "Javanese",
		"DisplayNativeName": "Basa Jawa",
		"TwoLetterISOLanguageName": "jv",
		"ThreeLetterISOLanguageName": "jav",
		"ThreeLetterISOLanguageNames": [
		  "jav"
		]
	  },
	  "kl": {
		"Name": "Kalaallisut; Greenlandic",
		"DisplayName": "Kalaallisut; Greenlandic",
		"DisplayNativeName": "Kalaallisut",
		"TwoLetterISOLanguageName": "kl",
		"ThreeLetterISOLanguageName": "kal",
		"ThreeLetterISOLanguageNames": [
		  "kal"
		]
	  },
	  "kn": {
		"Name": "Kannada",
		"DisplayName": "Kannada",
		"DisplayNativeName": "ಕನ್ನಡ",
		"TwoLetterISOLanguageName": "kn",
		"ThreeLetterISOLanguageName": "kan",
		"ThreeLetterISOLanguageNames": [
		  "kan"
		]
	  },
	  "kr": {
		"Name": "Kanuri",
		"DisplayName": "Kanuri",
		"DisplayNativeName": "Kanuri",
		"TwoLetterISOLanguageName": "kr",
		"ThreeLetterISOLanguageName": "kau",
		"ThreeLetterISOLanguageNames": [
		  "kau"
		]
	  },
	  "ks": {
		"Name": "Kashmiri",
		"DisplayName": "Kashmiri",
		"DisplayNativeName": "कॉशुर",
		"TwoLetterISOLanguageName": "ks",
		"ThreeLetterISOLanguageName": "kas",
		"ThreeLetterISOLanguageNames": [
		  "kas"
		]
	  },
	  "kk": {
		"Name": "Kazakh",
		"DisplayName": "Kazakh",
		"DisplayNativeName": "Қазақша",
		"TwoLetterISOLanguageName": "kk",
		"ThreeLetterISOLanguageName": "kaz",
		"ThreeLetterISOLanguageNames": [
		  "kaz"
		]
	  },
	  "ki": {
		"Name": "Kikuyu; Gikuyu",
		"DisplayName": "Kikuyu; Gikuyu",
		"DisplayNativeName": "Gĩkũyũ",
		"TwoLetterISOLanguageName": "ki",
		"ThreeLetterISOLanguageName": "kik",
		"ThreeLetterISOLanguageNames": [
		  "kik"
		]
	  },
	  "rw": {
		"Name": "Kinyarwanda",
		"DisplayName": "Kinyarwanda",
		"DisplayNativeName": "Kinyarwandi",
		"TwoLetterISOLanguageName": "rw",
		"ThreeLetterISOLanguageName": "kin",
		"ThreeLetterISOLanguageNames": [
		  "kin"
		]
	  },
	  "ky": {
		"Name": "Kirghiz; Kyrgyz",
		"DisplayName": "Kirghiz; Kyrgyz",
		"DisplayNativeName": "Кыргызча",
		"TwoLetterISOLanguageName": "ky",
		"ThreeLetterISOLanguageName": "kir",
		"ThreeLetterISOLanguageNames": [
		  "kir"
		]
	  },
	  "kv": {
		"Name": "Komi",
		"DisplayName": "Komi",
		"DisplayNativeName": "Коми",
		"TwoLetterISOLanguageName": "kv",
		"ThreeLetterISOLanguageName": "kom",
		"ThreeLetterISOLanguageNames": [
		  "kom"
		]
	  },
	  "kg": {
		"Name": "Kongo",
		"DisplayName": "Kongo",
		"DisplayNativeName": "KiKongo",
		"TwoLetterISOLanguageName": "kg",
		"ThreeLetterISOLanguageName": "kon",
		"ThreeLetterISOLanguageNames": [
		  "kon"
		]
	  },
	  "ko": {
		"Name": "Korean",
		"DisplayName": "Korean",
		"DisplayNativeName": "한국어",
		"TwoLetterISOLanguageName": "ko",
		"ThreeLetterISOLanguageName": "kor",
		"ThreeLetterISOLanguageNames": [
		  "kor"
		]
	  },
	  "kj": {
		"Name": "Kuanyama; Kwanyama",
		"DisplayName": "Kuanyama; Kwanyama",
		"DisplayNativeName": "Kuanyama",
		"TwoLetterISOLanguageName": "kj",
		"ThreeLetterISOLanguageName": "kua",
		"ThreeLetterISOLanguageNames": [
		  "kua"
		]
	  },
	  "ku": {
		"Name": "Kurdish",
		"DisplayName": "Kurdish",
		"DisplayNativeName": "Kurdî",
		"TwoLetterISOLanguageName": "ku",
		"ThreeLetterISOLanguageName": "kur",
		"ThreeLetterISOLanguageNames": [
		  "kur"
		]
	  },
	  "lo": {
		"Name": "Lao",
		"DisplayName": "Lao",
		"DisplayNativeName": "Pha xa lao",
		"TwoLetterISOLanguageName": "lo",
		"ThreeLetterISOLanguageName": "lao",
		"ThreeLetterISOLanguageNames": [
		  "lao"
		]
	  },
	  "la": {
		"Name": "Latin",
		"DisplayName": "Latin",
		"DisplayNativeName": "Latina",
		"TwoLetterISOLanguageName": "la",
		"ThreeLetterISOLanguageName": "lat",
		"ThreeLetterISOLanguageNames": [
		  "lat"
		]
	  },
	  "lv": {
		"Name": "Latvian",
		"DisplayName": "Latvian",
		"DisplayNativeName": "Latviešu",
		"TwoLetterISOLanguageName": "lv",
		"ThreeLetterISOLanguageName": "lav",
		"ThreeLetterISOLanguageNames": [
		  "lav"
		]
	  },
	  "li": {
		"Name": "Limburgan; Limburger; Limburgish",
		"DisplayName": "Limburgan; Limburger; Limburgish",
		"DisplayNativeName": "Limburgs",
		"TwoLetterISOLanguageName": "li",
		"ThreeLetterISOLanguageName": "lim",
		"ThreeLetterISOLanguageNames": [
		  "lim"
		]
	  },
	  "ln": {
		"Name": "Lingala",
		"DisplayName": "Lingala",
		"DisplayNativeName": "Lingála",
		"TwoLetterISOLanguageName": "ln",
		"ThreeLetterISOLanguageName": "lin",
		"ThreeLetterISOLanguageNames": [
		  "lin"
		]
	  },
	  "lt-LT": {
		"Name": "Lithuanian",
		"DisplayName": "Lithuanian",
		"DisplayNativeName": "Lietuvių",
		"TwoLetterISOLanguageName": "lt-LT",
		"ThreeLetterISOLanguageName": "lit",
		"ThreeLetterISOLanguageNames": [
		  "lit"
		]
	  },
	  "lu": {
		"Name": "Luba-Katanga",
		"DisplayName": "Luba-Katanga",
		"DisplayNativeName": "Luba-Katanga",
		"TwoLetterISOLanguageName": "lu",
		"ThreeLetterISOLanguageName": "lub",
		"ThreeLetterISOLanguageNames": [
		  "lub"
		]
	  },
	  "lb": {
		"Name": "Luxembourgish; Letzeburgesch",
		"DisplayName": "Luxembourgish; Letzeburgesch",
		"DisplayNativeName": "Lëtzebuergesch",
		"TwoLetterISOLanguageName": "lb",
		"ThreeLetterISOLanguageName": "ltz",
		"ThreeLetterISOLanguageNames": [
		  "ltz"
		]
	  },
	  "mk": {
		"Name": "Macedonian",
		"DisplayName": "Macedonian",
		"DisplayNativeName": "Македонски",
		"TwoLetterISOLanguageName": "mk",
		"ThreeLetterISOLanguageName": "mac",
		"ThreeLetterISOLanguageNames": [
		  "mac",
		  "mkd"
		]
	  },
	  "mg": {
		"Name": "Malagasy",
		"DisplayName": "Malagasy",
		"DisplayNativeName": "Malagasy",
		"TwoLetterISOLanguageName": "mg",
		"ThreeLetterISOLanguageName": "mlg",
		"ThreeLetterISOLanguageNames": [
		  "mlg"
		]
	  },
	  "ms": {
		"Name": "Malay",
		"DisplayName": "Malay",
		"DisplayNativeName": "Bahasa Melayu",
		"TwoLetterISOLanguageName": "ms",
		"ThreeLetterISOLanguageName": "may",
		"ThreeLetterISOLanguageNames": [
		  "may",
		  "msa"
		]
	  },
	  "ml": {
		"Name": "Malayalam",
		"DisplayName": "Malayalam",
		"DisplayNativeName": "മലയാളം",
		"TwoLetterISOLanguageName": "ml",
		"ThreeLetterISOLanguageName": "mal",
		"ThreeLetterISOLanguageNames": [
		  "mal"
		]
	  },
	  "mt": {
		"Name": "Maltese",
		"DisplayName": "Maltese",
		"DisplayNativeName": "bil-Malti ",
		"TwoLetterISOLanguageName": "mt",
		"ThreeLetterISOLanguageName": "mlt",
		"ThreeLetterISOLanguageNames": [
		  "mlt"
		]
	  },
	  "gv": {
		"Name": "Manx",
		"DisplayName": "Manx",
		"DisplayNativeName": "Gaelg",
		"TwoLetterISOLanguageName": "gv",
		"ThreeLetterISOLanguageName": "glv",
		"ThreeLetterISOLanguageNames": [
		  "glv"
		]
	  },
	  "mi": {
		"Name": "Maori",
		"DisplayName": "Maori",
		"DisplayNativeName": "Māori",
		"TwoLetterISOLanguageName": "mi",
		"ThreeLetterISOLanguageName": "mao",
		"ThreeLetterISOLanguageNames": [
		  "mao",
		  "mri"
		]
	  },
	  "mr": {
		"Name": "Marathi",
		"DisplayName": "Marathi",
		"DisplayNativeName": "मराठी",
		"TwoLetterISOLanguageName": "mr",
		"ThreeLetterISOLanguageName": "mar",
		"ThreeLetterISOLanguageNames": [
		  "mar"
		]
	  },
	  "mh": {
		"Name": "Marshallese",
		"DisplayName": "Marshallese",
		"DisplayNativeName": "Kajin Majel",
		"TwoLetterISOLanguageName": "mh",
		"ThreeLetterISOLanguageName": "mah",
		"ThreeLetterISOLanguageNames": [
		  "mah"
		]
	  },
	  "mn": {
		"Name": "Mongolian",
		"DisplayName": "Mongolian",
		"DisplayNativeName": "Монгол",
		"TwoLetterISOLanguageName": "mn",
		"ThreeLetterISOLanguageName": "mon",
		"ThreeLetterISOLanguageNames": [
		  "mon"
		]
	  },
	  "na": {
		"Name": "Nauru",
		"DisplayName": "Nauru",
		"DisplayNativeName": "Dorerin Naoero",
		"TwoLetterISOLanguageName": "na",
		"ThreeLetterISOLanguageName": "nau",
		"ThreeLetterISOLanguageNames": [
		  "nau"
		]
	  },
	  "nv": {
		"Name": "Navajo; Navaho",
		"DisplayName": "Navajo; Navaho",
		"DisplayNativeName": "Diné bizaad",
		"TwoLetterISOLanguageName": "nv",
		"ThreeLetterISOLanguageName": "nav",
		"ThreeLetterISOLanguageNames": [
		  "nav"
		]
	  },
	  "nd": {
		"Name": "Ndebele, North; North Ndebele",
		"DisplayName": "Ndebele, North; North Ndebele",
		"DisplayNativeName": "Sindebele",
		"TwoLetterISOLanguageName": "nd",
		"ThreeLetterISOLanguageName": "nde",
		"ThreeLetterISOLanguageNames": [
		  "nde"
		]
	  },
	  "nr": {
		"Name": "Ndebele, South; South Ndebele",
		"DisplayName": "Ndebele, South; South Ndebele",
		"DisplayNativeName": "isiNdebele",
		"TwoLetterISOLanguageName": "nr",
		"ThreeLetterISOLanguageName": "nbl",
		"ThreeLetterISOLanguageNames": [
		  "nbl"
		]
	  },
	  "ng": {
		"Name": "Ndonga",
		"DisplayName": "Ndonga",
		"DisplayNativeName": "Oshiwambo",
		"TwoLetterISOLanguageName": "ng",
		"ThreeLetterISOLanguageName": "ndo",
		"ThreeLetterISOLanguageNames": [
		  "ndo"
		]
	  },
	  "ne": {
		"Name": "Nepali",
		"DisplayName": "Nepali",
		"DisplayNativeName": "नेपाली",
		"TwoLetterISOLanguageName": "ne",
		"ThreeLetterISOLanguageName": "nep",
		"ThreeLetterISOLanguageNames": [
		  "nep"
		]
	  },
	  "se": {
		"Name": "Northern Sami",
		"DisplayName": "Northern Sami",
		"DisplayNativeName": "Davvisámegiella",
		"TwoLetterISOLanguageName": "se",
		"ThreeLetterISOLanguageName": "sme",
		"ThreeLetterISOLanguageNames": [
		  "sme"
		]
	  },
	  "no": {
		"Name": "Norwegian",
		"DisplayName": "Norwegian",
		"DisplayNativeName": "Norsk",
		"TwoLetterISOLanguageName": "no",
		"ThreeLetterISOLanguageName": "nor",
		"ThreeLetterISOLanguageNames": [
		  "nor"
		]
	  },
	  "nn": {
		"Name": "Norwegian, Nynorsk",
		"DisplayName": "Norwegian, Nynorsk",
		"DisplayNativeName": "Norsk, Nynorsk ",
		"TwoLetterISOLanguageName": "nn",
		"ThreeLetterISOLanguageName": "nno",
		"ThreeLetterISOLanguageNames": [
		  "nno"
		]
	  },
	  "nb": {
		"Name": "Norwegian, Bokmål",
		"DisplayName": "Norwegian, Bokmål",
		"DisplayNativeName": "Norsk, Bokmål",
		"TwoLetterISOLanguageName": "nb",
		"ThreeLetterISOLanguageName": "nob",
		"ThreeLetterISOLanguageNames": [
		  "nob"
		]
	  },
	  "oc": {
		"Name": "Occitan (post 1500); Provençal",
		"DisplayName": "Occitan (post 1500); Provençal",
		"DisplayNativeName": "Occitan",
		"TwoLetterISOLanguageName": "oc",
		"ThreeLetterISOLanguageName": "oci",
		"ThreeLetterISOLanguageNames": [
		  "oci"
		]
	  },
	  "oj": {
		"Name": "Ojibwa",
		"DisplayName": "Ojibwa",
		"DisplayNativeName": "Ojibwa",
		"TwoLetterISOLanguageName": "oj",
		"ThreeLetterISOLanguageName": "oji",
		"ThreeLetterISOLanguageNames": [
		  "oji"
		]
	  },
	  "or": {
		"Name": "Oriya",
		"DisplayName": "Oriya",
		"DisplayNativeName": "ଓଡ଼ିଆ",
		"TwoLetterISOLanguageName": "or",
		"ThreeLetterISOLanguageName": "ori",
		"ThreeLetterISOLanguageNames": [
		  "ori"
		]
	  },
	  "om": {
		"Name": "Oromo",
		"DisplayName": "Oromo",
		"DisplayNativeName": "Oromoo",
		"TwoLetterISOLanguageName": "om",
		"ThreeLetterISOLanguageName": "orm",
		"ThreeLetterISOLanguageNames": [
		  "orm"
		]
	  },
	  "os": {
		"Name": "Ossetian; Ossetic",
		"DisplayName": "Ossetian; Ossetic",
		"DisplayNativeName": "Иронау",
		"TwoLetterISOLanguageName": "os",
		"ThreeLetterISOLanguageName": "oss",
		"ThreeLetterISOLanguageNames": [
		  "oss"
		]
	  },
	  "pi": {
		"Name": "Pali",
		"DisplayName": "Pali",
		"DisplayNativeName": "Pāli",
		"TwoLetterISOLanguageName": "pi",
		"ThreeLetterISOLanguageName": "pli",
		"ThreeLetterISOLanguageNames": [
		  "pli"
		]
	  },
	  "pa": {
		"Name": "Panjabi; Punjabi",
		"DisplayName": "Panjabi; Punjabi",
		"DisplayNativeName": "ਪੰਜਾਬੀ",
		"TwoLetterISOLanguageName": "pa",
		"ThreeLetterISOLanguageName": "pan",
		"ThreeLetterISOLanguageNames": [
		  "pan"
		]
	  },
	  "fa": {
		"Name": "Persian",
		"DisplayName": "Persian",
		"DisplayNativeName": "فارسی",
		"TwoLetterISOLanguageName": "fa",
		"ThreeLetterISOLanguageName": "per",
		"ThreeLetterISOLanguageNames": [
		  "per",
		  "fas"
		]
	  },
	  "pl": {
		"Name": "Polish",
		"DisplayName": "Polish",
		"DisplayNativeName": "Polski",
		"TwoLetterISOLanguageName": "pl",
		"ThreeLetterISOLanguageName": "pol",
		"ThreeLetterISOLanguageNames": [
		  "pol"
		]
	  },
	  "pt-PT": {
		"Name": "Portuguese",
		"DisplayName": "Portuguese",
		"DisplayNativeName": "Português",
		"TwoLetterISOLanguageName": "pt-PT",
		"ThreeLetterISOLanguageName": "por",
		"ThreeLetterISOLanguageNames": [
		  "por"
		]
	  },
	  "pt-BR": {
		"Name": "Portuguese, Brazil",
		"DisplayName": "Portuguese, Brazil",
		"DisplayNativeName": "Português, Brazil",
		"TwoLetterISOLanguageName": "pt-BR",
		"ThreeLetterISOLanguageName": "pob",
		"ThreeLetterISOLanguageNames": [
		  "pob"
		]
	  },
	  "ps": {
		"Name": "Pushto; Pashto",
		"DisplayName": "Pushto; Pashto",
		"DisplayNativeName": "پښتو",
		"TwoLetterISOLanguageName": "ps",
		"ThreeLetterISOLanguageName": "pus",
		"ThreeLetterISOLanguageNames": [
		  "pus"
		]
	  },
	  "qu": {
		"Name": "Quechua",
		"DisplayName": "Quechua",
		"DisplayNativeName": "Runa Simi",
		"TwoLetterISOLanguageName": "qu",
		"ThreeLetterISOLanguageName": "que",
		"ThreeLetterISOLanguageNames": [
		  "que"
		]
	  },
	  "ro": {
		"Name": "Romanian; Moldavian; Moldovan",
		"DisplayName": "Romanian; Moldavian; Moldovan",
		"DisplayNativeName": "Română",
		"TwoLetterISOLanguageName": "ro",
		"ThreeLetterISOLanguageName": "rum",
		"ThreeLetterISOLanguageNames": [
		  "rum",
		  "ron"
		]
	  },
	  "rm": {
		"Name": "Romansh",
		"DisplayName": "Romansh",
		"DisplayNativeName": "rumantsch",
		"TwoLetterISOLanguageName": "rm",
		"ThreeLetterISOLanguageName": "roh",
		"ThreeLetterISOLanguageNames": [
		  "roh"
		]
	  },
	  "rn": {
		"Name": "Rundi",
		"DisplayName": "Rundi",
		"DisplayNativeName": "kirundi",
		"TwoLetterISOLanguageName": "rn",
		"ThreeLetterISOLanguageName": "run",
		"ThreeLetterISOLanguageNames": [
		  "run"
		]
	  },
	  "ru": {
		"Name": "Russian",
		"DisplayName": "Russian",
		"DisplayNativeName": "Русский",
		"TwoLetterISOLanguageName": "ru",
		"ThreeLetterISOLanguageName": "rus",
		"ThreeLetterISOLanguageNames": [
		  "rus"
		]
	  },
	  "sm": {
		"Name": "Samoan",
		"DisplayName": "Samoan",
		"DisplayNativeName": "Gagana Samoa",
		"TwoLetterISOLanguageName": "sm",
		"ThreeLetterISOLanguageName": "smo",
		"ThreeLetterISOLanguageNames": [
		  "smo"
		]
	  },
	  "sg": {
		"Name": "Sango",
		"DisplayName": "Sango",
		"DisplayNativeName": "Sängö",
		"TwoLetterISOLanguageName": "sg",
		"ThreeLetterISOLanguageName": "sag",
		"ThreeLetterISOLanguageNames": [
		  "sag"
		]
	  },
	  "sa": {
		"Name": "Sanskrit",
		"DisplayName": "Sanskrit",
		"DisplayNativeName": "संस्कृतम्",
		"TwoLetterISOLanguageName": "sa",
		"ThreeLetterISOLanguageName": "san",
		"ThreeLetterISOLanguageNames": [
		  "san"
		]
	  },
	  "sc": {
		"Name": "Sardinian",
		"DisplayName": "Sardinian",
		"DisplayNativeName": "Sardu",
		"TwoLetterISOLanguageName": "sc",
		"ThreeLetterISOLanguageName": "srd",
		"ThreeLetterISOLanguageNames": [
		  "srd"
		]
	  },
	  "sr": {
		"Name": "Serbian",
		"DisplayName": "Serbian",
		"DisplayNativeName": "Српски",
		"TwoLetterISOLanguageName": "sr",
		"ThreeLetterISOLanguageName": "srp",
		"ThreeLetterISOLanguageNames": [
		  "srp",
		  "scc"
		]
	  },
	  "sn": {
		"Name": "Shona",
		"DisplayName": "Shona",
		"DisplayNativeName": "chiShona",
		"TwoLetterISOLanguageName": "sn",
		"ThreeLetterISOLanguageName": "sna",
		"ThreeLetterISOLanguageNames": [
		  "sna"
		]
	  },
	  "ii": {
		"Name": "Sichuan Yi; Nuosu",
		"DisplayName": "Sichuan Yi; Nuosu",
		"DisplayNativeName": "Sichuan Yi",
		"TwoLetterISOLanguageName": "ii",
		"ThreeLetterISOLanguageName": "iii",
		"ThreeLetterISOLanguageNames": [
		  "iii"
		]
	  },
	  "sd": {
		"Name": "Sindhi",
		"DisplayName": "Sindhi",
		"DisplayNativeName": "سنڌي",
		"TwoLetterISOLanguageName": "sd",
		"ThreeLetterISOLanguageName": "snd",
		"ThreeLetterISOLanguageNames": [
		  "snd"
		]
	  },
	  "si": {
		"Name": "Sinhala, Sinhalese",
		"DisplayName": "Sinhala; Sinhalese",
		"DisplayNativeName": "සිංහල",
		"TwoLetterISOLanguageName": "si",
		"ThreeLetterISOLanguageName": "sin",
		"ThreeLetterISOLanguageNames": [
		  "sin"
		]
	  },
	  "sk": {
		"Name": "Slovak",
		"DisplayName": "Slovak",
		"DisplayNativeName": "Slovenčina",
		"TwoLetterISOLanguageName": "sk",
		"ThreeLetterISOLanguageName": "slo",
		"ThreeLetterISOLanguageNames": [
		  "slo",
		  "slk"
		]
	  },
	  "sl-SI": {
		"Name": "Slovenian",
		"DisplayName": "Slovenian",
		"DisplayNativeName": "Slovenščina",
		"TwoLetterISOLanguageName": "sl-SI",
		"ThreeLetterISOLanguageName": "slv",
		"ThreeLetterISOLanguageNames": [
		  "slv"
		]
	  },
	  "so": {
		"Name": "Somali",
		"DisplayName": "Somali",
		"DisplayNativeName": "Soomaaliga",
		"TwoLetterISOLanguageName": "so",
		"ThreeLetterISOLanguageName": "som",
		"ThreeLetterISOLanguageNames": [
		  "som"
		]
	  },
	  "st": {
		"Name": "Sotho, Southern",
		"DisplayName": "Sotho, Southern",
		"DisplayNativeName": "Sesotho",
		"TwoLetterISOLanguageName": "st",
		"ThreeLetterISOLanguageName": "sot",
		"ThreeLetterISOLanguageNames": [
		  "sot"
		]
	  },
	  "es-AR": {
		"DisplayName": "Spanish, Argentina",
		"DisplayNativeName": "Español, República Argentina",
		"TwoLetterISOLanguageName": "es-AR",
		"ThreeLetterISOLanguageName": "es-AR",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  "es-DO": {
		"DisplayName": "Spanish, Dominican Republic",
		"DisplayNativeName": "Español, República Dominicana",
		"TwoLetterISOLanguageName": "es-DO",
		"ThreeLetterISOLanguageName": "es-DO",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  "es-419": {
		"DisplayName": "Spanish, Latin America",
		"DisplayNativeName": "Español, América Latina",
		"TwoLetterISOLanguageName": "es-419",
		"ThreeLetterISOLanguageName": "es-419",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  "es": {
		"Name": "Spanish; castellano",
		"DisplayName": "Spanish, castellano",
		"DisplayNativeName": "Español, castellano",
		"TwoLetterISOLanguageName": "es",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  "es-MX": {
		"Name": "Spanish; Latin",
		"DisplayName": "Spanish, Mexico",
		"DisplayNativeName": "Español, Mexico",
		"TwoLetterISOLanguageName": "es-MX",
		"ThreeLetterISOLanguageName": "es-MX",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  "su": {
		"Name": "Sundanese",
		"DisplayName": "Sundanese",
		"DisplayNativeName": "Basa Sunda",
		"TwoLetterISOLanguageName": "su",
		"ThreeLetterISOLanguageName": "sun",
		"ThreeLetterISOLanguageNames": [
		  "sun"
		]
	  },
	  "sw": {
		"Name": "Swahili",
		"DisplayName": "Swahili",
		"DisplayNativeName": "Kiswahili",
		"TwoLetterISOLanguageName": "sw",
		"ThreeLetterISOLanguageName": "swa",
		"ThreeLetterISOLanguageNames": [
		  "swa"
		]
	  },
	  "ss": {
		"Name": "Swati",
		"DisplayName": "Swati",
		"DisplayNativeName": "SiSwati",
		"TwoLetterISOLanguageName": "ss",
		"ThreeLetterISOLanguageName": "ssw",
		"ThreeLetterISOLanguageNames": [
		  "ssw"
		]
	  },
	  "sv": {
		"Name": "Swedish",
		"DisplayName": "Swedish",
		"DisplayNativeName": "Svenska",
		"TwoLetterISOLanguageName": "sv",
		"ThreeLetterISOLanguageName": "swe",
		"ThreeLetterISOLanguageNames": [
		  "swe"
		]
	  },
	  "gsw": {
		"Name": "Swiss German; Alemannic; Alsatian",
		"DisplayName": "Swiss German; Alemannic; Alsatian",
		"DisplayNativeName": "Alemannisch",
		"TwoLetterISOLanguageName": "gsw",
		"ThreeLetterISOLanguageName": "gsw",
		"ThreeLetterISOLanguageNames": [
		  "gsw"
		]
	  },
	  "tl": {
		"Name": "Tagalog",
		"DisplayName": "Tagalog",
		"DisplayNativeName": "Tagalog",
		"TwoLetterISOLanguageName": "tl",
		"ThreeLetterISOLanguageName": "tgl",
		"ThreeLetterISOLanguageNames": [
		  "tgl"
		]
	  },
	  "ty": {
		"Name": "Tahitian",
		"DisplayName": "Tahitian",
		"DisplayNativeName": "Reo Mā`ohi",
		"TwoLetterISOLanguageName": "ty",
		"ThreeLetterISOLanguageName": "tah",
		"ThreeLetterISOLanguageNames": [
		  "tah"
		]
	  },
	  "tg": {
		"Name": "Tajik",
		"DisplayName": "Tajik",
		"DisplayNativeName": "Тоҷикӣ",
		"TwoLetterISOLanguageName": "tg",
		"ThreeLetterISOLanguageName": "tgk",
		"ThreeLetterISOLanguageNames": [
		  "tgk"
		]
	  },
	  "ta": {
		"Name": "Tamil",
		"DisplayName": "Tamil",
		"DisplayNativeName": "தமிழ்",
		"TwoLetterISOLanguageName": "ta",
		"ThreeLetterISOLanguageName": "tam",
		"ThreeLetterISOLanguageNames": [
		  "tam"
		]
	  },
	  "tt": {
		"Name": "Tatar",
		"DisplayName": "Tatar",
		"DisplayNativeName": "Tatarça",
		"TwoLetterISOLanguageName": "tt",
		"ThreeLetterISOLanguageName": "tat",
		"ThreeLetterISOLanguageNames": [
		  "tat"
		]
	  },
	  "te": {
		"Name": "Telugu",
		"DisplayName": "Telugu",
		"DisplayNativeName": "తెలుగు",
		"TwoLetterISOLanguageName": "te",
		"ThreeLetterISOLanguageName": "tel",
		"ThreeLetterISOLanguageNames": [
		  "tel"
		]
	  },
	  "th": {
		"Name": "Thai",
		"DisplayName": "Thai",
		"DisplayNativeName": "ไทย",
		"TwoLetterISOLanguageName": "th",
		"ThreeLetterISOLanguageName": "tha",
		"ThreeLetterISOLanguageNames": [
		  "tha"
		]
	  },
	  "bo": {
		"Name": "Tibetan",
		"DisplayName": "Tibetan",
		"DisplayNativeName": "Tibetan",
		"TwoLetterISOLanguageName": "bo",
		"ThreeLetterISOLanguageName": "tib",
		"ThreeLetterISOLanguageNames": [
		  "tib",
		  "bod"
		]
	  },
	  "ti": {
		"Name": "Tigrinya",
		"DisplayName": "Tigrinya",
		"DisplayNativeName": "ትግርኛ",
		"TwoLetterISOLanguageName": "ti",
		"ThreeLetterISOLanguageName": "tir",
		"ThreeLetterISOLanguageNames": [
		  "tir"
		]
	  },
	  "to": {
		"Name": "Tonga (Tonga Islands)",
		"DisplayName": "Tonga (Tonga Islands)",
		"DisplayNativeName": "Lea Faka-Tonga",
		"TwoLetterISOLanguageName": "to",
		"ThreeLetterISOLanguageName": "ton",
		"ThreeLetterISOLanguageNames": [
		  "ton"
		]
	  },
	  "ts": {
		"Name": "Tsonga",
		"DisplayName": "Tsonga",
		"DisplayNativeName": "Xitsonga",
		"TwoLetterISOLanguageName": "ts",
		"ThreeLetterISOLanguageName": "tso",
		"ThreeLetterISOLanguageNames": [
		  "tso"
		]
	  },
	  "tn": {
		"Name": "Tswana",
		"DisplayName": "Tswana",
		"DisplayNativeName": "Setswana",
		"TwoLetterISOLanguageName": "tn",
		"ThreeLetterISOLanguageName": "tsn",
		"ThreeLetterISOLanguageNames": [
		  "tsn"
		]
	  },
	  "tr": {
		"Name": "Turkish",
		"DisplayName": "Turkish",
		"DisplayNativeName": "Türkçe",
		"TwoLetterISOLanguageName": "tr",
		"ThreeLetterISOLanguageName": "tur",
		"ThreeLetterISOLanguageNames": [
		  "tur"
		]
	  },
	  "tk": {
		"Name": "Turkmen",
		"DisplayName": "Turkmen",
		"DisplayNativeName": "Туркмен",
		"TwoLetterISOLanguageName": "tk",
		"ThreeLetterISOLanguageName": "tuk",
		"ThreeLetterISOLanguageNames": [
		  "tuk"
		]
	  },
	  "tw": {
		"Name": "Twi",
		"DisplayName": "Twi",
		"DisplayNativeName": "Twi",
		"TwoLetterISOLanguageName": "tw",
		"ThreeLetterISOLanguageName": "twi",
		"ThreeLetterISOLanguageNames": [
		  "twi"
		]
	  },
	  "ug": {
		"Name": "Uighur; Uyghur",
		"DisplayName": "Uighur; Uyghur",
		"DisplayNativeName": "Uyƣurqə",
		"TwoLetterISOLanguageName": "ug",
		"ThreeLetterISOLanguageName": "uig",
		"ThreeLetterISOLanguageNames": [
		  "uig"
		]
	  },
	  "uk": {
		"Name": "Ukrainian",
		"DisplayName": "Ukrainian",
		"DisplayNativeName": "Українська",
		"TwoLetterISOLanguageName": "uk",
		"ThreeLetterISOLanguageName": "ukr",
		"ThreeLetterISOLanguageNames": [
		  "ukr"
		]
	  },
	  "ur-PK": {
		"Name": "Urdu",
		"DisplayName": "Urdu",
		"DisplayNativeName": "اردو",
		"TwoLetterISOLanguageName": "ur-PK",
		"ThreeLetterISOLanguageName": "urd",
		"ThreeLetterISOLanguageNames": [
		  "urd"
		]
	  },
	  "uz": {
		"Name": "Uzbek",
		"DisplayName": "Uzbek",
		"DisplayNativeName": "Ўзбек",
		"TwoLetterISOLanguageName": "uz",
		"ThreeLetterISOLanguageName": "uzb",
		"ThreeLetterISOLanguageNames": [
		  "uzb"
		]
	  },
	  "ve": {
		"Name": "Venda",
		"DisplayName": "Venda",
		"DisplayNativeName": "Tshivenḓa",
		"TwoLetterISOLanguageName": "ve",
		"ThreeLetterISOLanguageName": "ven",
		"ThreeLetterISOLanguageNames": [
		  "ven"
		]
	  },
	  "vi": {
		"Name": "Vietnamese",
		"DisplayName": "Vietnamese",
		"DisplayNativeName": "Việtnam",
		"TwoLetterISOLanguageName": "vi",
		"ThreeLetterISOLanguageName": "vie",
		"ThreeLetterISOLanguageNames": [
		  "vie"
		]
	  },
	  "vo": {
		"Name": "Volapük",
		"DisplayName": "Volapük",
		"DisplayNativeName": "Volapük",
		"TwoLetterISOLanguageName": "vo",
		"ThreeLetterISOLanguageName": "vol",
		"ThreeLetterISOLanguageNames": [
		  "vol"
		]
	  },
	  "wa": {
		"Name": "Walloon",
		"DisplayName": "Walloon",
		"DisplayNativeName": "Walon",
		"TwoLetterISOLanguageName": "wa",
		"ThreeLetterISOLanguageName": "wln",
		"ThreeLetterISOLanguageNames": [
		  "wln"
		]
	  },
	  "cy": {
		"Name": "Welsh",
		"DisplayName": "Welsh",
		"DisplayNativeName": "Cymraeg",
		"TwoLetterISOLanguageName": "cy",
		"ThreeLetterISOLanguageName": "wel",
		"ThreeLetterISOLanguageNames": [
		  "wel",
		  "cym"
		]
	  },
	  "fy": {
		"Name": "Western Frisian",
		"DisplayName": "Western Frisian",
		"DisplayNativeName": "Frysk",
		"TwoLetterISOLanguageName": "fy",
		"ThreeLetterISOLanguageName": "fry",
		"ThreeLetterISOLanguageNames": [
		  "fry"
		]
	  },
	  "wo": {
		"Name": "Wolof",
		"DisplayName": "Wolof",
		"DisplayNativeName": "Wollof",
		"TwoLetterISOLanguageName": "wo",
		"ThreeLetterISOLanguageName": "wol",
		"ThreeLetterISOLanguageNames": [
		  "wol"
		]
	  },
	  "xh": {
		"Name": "Xhosa",
		"DisplayName": "Xhosa",
		"DisplayNativeName": "isiXhosa",
		"TwoLetterISOLanguageName": "xh",
		"ThreeLetterISOLanguageName": "xho",
		"ThreeLetterISOLanguageNames": [
		  "xho"
		]
	  },
	  "yi": {
		"Name": "Yiddish",
		"DisplayName": "Yiddish",
		"DisplayNativeName": "ייִדיש",
		"TwoLetterISOLanguageName": "yi",
		"ThreeLetterISOLanguageName": "yid",
		"ThreeLetterISOLanguageNames": [
		  "yid"
		]
	  },
	  "yo": {
		"Name": "Yoruba",
		"DisplayName": "Yoruba",
		"DisplayNativeName": "Yorùbá",
		"TwoLetterISOLanguageName": "yo",
		"ThreeLetterISOLanguageName": "yor",
		"ThreeLetterISOLanguageNames": [
		  "yor"
		]
	  },
	  "za": {
		"Name": "Zhuang; Chuang",
		"DisplayName": "Zhuang; Chuang",
		"DisplayNativeName": "壮语",
		"TwoLetterISOLanguageName": "za",
		"ThreeLetterISOLanguageName": "zha",
		"ThreeLetterISOLanguageNames": [
		  "zha"
		]
	  },
	  "zu": {
		"Name": "Zulu",
		"DisplayName": "Zulu",
		"DisplayNativeName": "isiZulu",
		"TwoLetterISOLanguageName": "zu",
		"ThreeLetterISOLanguageName": "zul",
		"ThreeLetterISOLanguageNames": [
		  "zul"
		]
	  }
	};
}

export default {
	matchCulture: matchCulture,
	getCultures: getCultures
};


/* eslint-enable indent */
