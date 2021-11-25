
/* eslint-disable indent */

// Try to match a given culture with one in the list.
// return the closest match or nothing.
export function matchCulture(culture) {
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

// List of native names taken from 
// https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code

export function getCultures() {
	return [
	  {
		"Name": "Abkhazian",
		"DisplayName": "Abkhazian",
		"DisplayNativeName": "Аҧсуа",
		"TwoLetterISOLanguageName": "ab",
		"ThreeLetterISOLanguageName": "abk",
		"ThreeLetterISOLanguageNames": [
		  "abk"
		]
	  },
	  {
		"Name": "Afar",
		"DisplayName": "Afar",
		"DisplayNativeName": "Afar",
		"TwoLetterISOLanguageName": "aa",
		"ThreeLetterISOLanguageName": "aar",
		"ThreeLetterISOLanguageNames": [
		  "aar"
		]
	  },
	  {
		"Name": "Afrikaans",
		"DisplayName": "Afrikaans",
		"DisplayNativeName": "Afrikaans",
		"TwoLetterISOLanguageName": "af",
		"ThreeLetterISOLanguageName": "afr",
		"ThreeLetterISOLanguageNames": [
		  "afr"
		]
	  },
	  {
		"Name": "Akan",
		"DisplayName": "Akan",
		"DisplayNativeName": "Akana",
		"TwoLetterISOLanguageName": "ak",
		"ThreeLetterISOLanguageName": "aka",
		"ThreeLetterISOLanguageNames": [
		  "aka"
		]
	  },
	  {
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
	  {
		"Name": "Amharic",
		"DisplayName": "Amharic",
		"DisplayNativeName": "አማርኛ",
		"TwoLetterISOLanguageName": "am",
		"ThreeLetterISOLanguageName": "amh",
		"ThreeLetterISOLanguageNames": [
		  "amh"
		]
	  },
	  {
		"Name": "Arabic",
		"DisplayName": "Arabic",
		"DisplayNativeName": "العربية",
		"TwoLetterISOLanguageName": "ar",
		"ThreeLetterISOLanguageName": "ara",
		"ThreeLetterISOLanguageNames": [
		  "ara"
		]
	  },
	  {
		"Name": "Aragonese",
		"DisplayName": "Aragonese",
		"DisplayNativeName": "Aragonés",
		"TwoLetterISOLanguageName": "an",
		"ThreeLetterISOLanguageName": "arg",
		"ThreeLetterISOLanguageNames": [
		  "arg"
		]
	  },
	  {
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
	  {
		"Name": "Assamese",
		"DisplayName": "Assamese",
		"DisplayNativeName": "অসমীয়া",
		"TwoLetterISOLanguageName": "as",
		"ThreeLetterISOLanguageName": "asm",
		"ThreeLetterISOLanguageNames": [
		  "asm"
		]
	  },
	  {
		"Name": "Avaric",
		"DisplayName": "Avaric",
		"DisplayNativeName": "Авар",
		"TwoLetterISOLanguageName": "av",
		"ThreeLetterISOLanguageName": "ava",
		"ThreeLetterISOLanguageNames": [
		  "ava"
		]
	  },
	  {
		"Name": "Avestan",
		"DisplayName": "Avestan",
		"DisplayNativeName": "Avestan",
		"TwoLetterISOLanguageName": "ae",
		"ThreeLetterISOLanguageName": "ave",
		"ThreeLetterISOLanguageNames": [
		  "ave"
		]
	  },
	  {
		"Name": "Aymara",
		"DisplayName": "Aymara",
		"DisplayNativeName": "Aymar",
		"TwoLetterISOLanguageName": "ay",
		"ThreeLetterISOLanguageName": "aym",
		"ThreeLetterISOLanguageNames": [
		  "aym"
		]
	  },
	  {
		"Name": "Azerbaijani",
		"DisplayName": "Azerbaijani",
		"DisplayNativeName": "Azərbaycanca",
		"TwoLetterISOLanguageName": "az",
		"ThreeLetterISOLanguageName": "aze",
		"ThreeLetterISOLanguageNames": [
		  "aze"
		]
	  },
	  {
		"Name": "Bambara",
		"DisplayName": "Bambara",
		"DisplayNativeName": "Bamanankan",
		"TwoLetterISOLanguageName": "bm",
		"ThreeLetterISOLanguageName": "bam",
		"ThreeLetterISOLanguageNames": [
		  "bam"
		]
	  },
	  {
		"Name": "Bashkir",
		"DisplayName": "Bashkir",
		"DisplayNativeName": "Башҡорт",
		"TwoLetterISOLanguageName": "ba",
		"ThreeLetterISOLanguageName": "bak",
		"ThreeLetterISOLanguageNames": [
		  "bak"
		]
	  },
	  {
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
	  {
		"Name": "Belarusian",
		"DisplayName": "Belarusian",
		"DisplayNativeName": "Беларуская",
		"TwoLetterISOLanguageName": "be-BY",
		"ThreeLetterISOLanguageName": "bel",
		"ThreeLetterISOLanguageNames": [
		  "bel"
		]
	  },
	  {
		"Name": "Bengali",
		"DisplayName": "Bengali",
		"DisplayNativeName": "বাংলা",
		"TwoLetterISOLanguageName": "bn-BD",
		"ThreeLetterISOLanguageName": "ben",
		"ThreeLetterISOLanguageNames": [
		  "ben"
		]
	  },
	  {
		"Name": "Bihari languages",
		"DisplayName": "Bihari languages",
		"DisplayNativeName": "भोजपुरी",
		"TwoLetterISOLanguageName": "bh",
		"ThreeLetterISOLanguageName": "bih",
		"ThreeLetterISOLanguageNames": [
		  "bih"
		]
	  },
	  {
		"Name": "Bislama",
		"DisplayName": "Bislama",
		"DisplayNativeName": "Bislama",
		"TwoLetterISOLanguageName": "bi",
		"ThreeLetterISOLanguageName": "bis",
		"ThreeLetterISOLanguageNames": [
		  "bis"
		]
	  },
	  {
		"Name": "Bosnian",
		"DisplayName": "Bosnian",
		"DisplayNativeName": "Bosanski",
		"TwoLetterISOLanguageName": "bs",
		"ThreeLetterISOLanguageName": "bos",
		"ThreeLetterISOLanguageNames": [
		  "bos"
		]
	  },
	  {
		"Name": "Breton",
		"DisplayName": "Breton",
		"DisplayNativeName": "Brezhoneg",
		"TwoLetterISOLanguageName": "br",
		"ThreeLetterISOLanguageName": "bre",
		"ThreeLetterISOLanguageNames": [
		  "bre"
		]
	  },
	  {
		"Name": "Bulgarian",
		"DisplayName": "Bulgarian",
		"DisplayNativeName": "Български",
		"TwoLetterISOLanguageName": "bg-BG",
		"ThreeLetterISOLanguageName": "bul",
		"ThreeLetterISOLanguageNames": [
		  "bul"
		]
	  },
	  {
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
	  {
		"Name": "Catalan; Valencian",
		"DisplayName": "Catalan; Valencian",
		"DisplayNativeName": "Català",
		"TwoLetterISOLanguageName": "ca",
		"ThreeLetterISOLanguageName": "cat",
		"ThreeLetterISOLanguageNames": [
		  "cat"
		]
	  },
	  {
		"Name": "Central Khmer",
		"DisplayName": "Central Khmer",
		"DisplayNativeName": "ភាសាខ្មែរ",
		"TwoLetterISOLanguageName": "km",
		"ThreeLetterISOLanguageName": "khm",
		"ThreeLetterISOLanguageNames": [
		  "khm"
		]
	  },
	  {
		"Name": "Chamorro",
		"DisplayName": "Chamorro",
		"DisplayNativeName": "Chamoru",
		"TwoLetterISOLanguageName": "ch",
		"ThreeLetterISOLanguageName": "cha",
		"ThreeLetterISOLanguageNames": [
		  "cha"
		]
	  },
	  {
		"Name": "Chechen",
		"DisplayName": "Chechen",
		"DisplayNativeName": "Нохчийн",
		"TwoLetterISOLanguageName": "ce",
		"ThreeLetterISOLanguageName": "che",
		"ThreeLetterISOLanguageNames": [
		  "che"
		]
	  },
	  {
		"Name": "Chichewa; Chewa; Nyanja",
		"DisplayName": "Chichewa; Chewa; Nyanja",
		"DisplayNativeName": "Chi-Chewa",
		"TwoLetterISOLanguageName": "ny",
		"ThreeLetterISOLanguageName": "nya",
		"ThreeLetterISOLanguageNames": [
		  "nya"
		]
	  },
	  {
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
	  {
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
	  {
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
	  {
		"Name": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"DisplayName": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
		"DisplayNativeName": "словѣньскъ",
		"TwoLetterISOLanguageName": "cu",
		"ThreeLetterISOLanguageName": "chu",
		"ThreeLetterISOLanguageNames": [
		  "chu"
		]
	  },
	  {
		"Name": "Chuvash",
		"DisplayName": "Chuvash",
		"DisplayNativeName": "Чăваш",
		"TwoLetterISOLanguageName": "cv",
		"ThreeLetterISOLanguageName": "chv",
		"ThreeLetterISOLanguageNames": [
		  "chv"
		]
	  },
	  {
		"Name": "Cornish",
		"DisplayName": "Cornish",
		"DisplayNativeName": "Kernewek",
		"TwoLetterISOLanguageName": "kw",
		"ThreeLetterISOLanguageName": "cor",
		"ThreeLetterISOLanguageNames": [
		  "cor"
		]
	  },
	  {
		"Name": "Corsican",
		"DisplayName": "Corsican",
		"DisplayNativeName": "Corsu",
		"TwoLetterISOLanguageName": "co",
		"ThreeLetterISOLanguageName": "cos",
		"ThreeLetterISOLanguageNames": [
		  "cos"
		]
	  },
	  {
		"Name": "Cree",
		"DisplayName": "Cree",
		"DisplayNativeName": "Nehiyaw",
		"TwoLetterISOLanguageName": "cr",
		"ThreeLetterISOLanguageName": "cre",
		"ThreeLetterISOLanguageNames": [
		  "cre"
		]
	  },
	  {
		"Name": "Croatian",
		"DisplayName": "Croatian",
		"DisplayNativeName": "Hrvatski",
		"TwoLetterISOLanguageName": "hr",
		"ThreeLetterISOLanguageName": "hrv",
		"ThreeLetterISOLanguageNames": [
		  "hrv"
		]
	  },
	  {
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
	  {
		"Name": "Danish",
		"DisplayName": "Danish",
		"DisplayNativeName": "Dansk",
		"TwoLetterISOLanguageName": "da",
		"ThreeLetterISOLanguageName": "dan",
		"ThreeLetterISOLanguageNames": [
		  "dan"
		]
	  },
	  {
		"Name": "Divehi; Dhivehi; Maldivian",
		"DisplayName": "Divehi; Dhivehi; Maldivian",
		"DisplayNativeName": "Divehi",
		"TwoLetterISOLanguageName": "dv",
		"ThreeLetterISOLanguageName": "div",
		"ThreeLetterISOLanguageNames": [
		  "div"
		]
	  },
	  {
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
	  {
		"Name": "Dzongkha",
		"DisplayName": "Dzongkha",
		"DisplayNativeName": "Dzongkha",
		"TwoLetterISOLanguageName": "dz",
		"ThreeLetterISOLanguageName": "dzo",
		"ThreeLetterISOLanguageNames": [
		  "dzo"
		]
	  },
	  {
		"Name": "English",
		"DisplayName": "English",
		"DisplayNativeName": "English",
		"TwoLetterISOLanguageName": "en-US",
		"ThreeLetterISOLanguageName": "eng",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  {
		"DisplayName": "English, Great Britain",
		"DisplayNativeName": "English, Great Britain",
		"TwoLetterISOLanguageName": "en-GB",
		"ThreeLetterISOLanguageName": "eng",
		"ThreeLetterISOLanguageNames": [
		  "eng"
		]
	  },
	  {
		"Name": "Esperanto",
		"DisplayName": "Esperanto",
		"DisplayNativeName": "Esperanto",
		"TwoLetterISOLanguageName": "eo",
		"ThreeLetterISOLanguageName": "epo",
		"ThreeLetterISOLanguageNames": [
		  "epo"
		]
	  },
	  {
		"Name": "Estonian",
		"DisplayName": "Estonian",
		"DisplayNativeName": "Eesti",
		"TwoLetterISOLanguageName": "et",
		"ThreeLetterISOLanguageName": "est",
		"ThreeLetterISOLanguageNames": [
		  "est"
		]
	  },
	  {
		"Name": "Ewe",
		"DisplayName": "Ewe",
		"DisplayNativeName": "Ɛʋɛ",
		"TwoLetterISOLanguageName": "ee",
		"ThreeLetterISOLanguageName": "ewe",
		"ThreeLetterISOLanguageNames": [
		  "ewe"
		]
	  },
	  {
		"Name": "Faroese",
		"DisplayName": "Faroese",
		"DisplayNativeName": "Føroyskt",
		"TwoLetterISOLanguageName": "fo",
		"ThreeLetterISOLanguageName": "fao",
		"ThreeLetterISOLanguageNames": [
		  "fao"
		]
	  },
	  {
		"Name": "Fijian",
		"DisplayName": "Fijian",
		"DisplayNativeName": "Na Vosa Vakaviti",
		"TwoLetterISOLanguageName": "fj",
		"ThreeLetterISOLanguageName": "fij",
		"ThreeLetterISOLanguageNames": [
		  "fij"
		]
	  },
	  {
		"Name": "Filipino",
		"DisplayName": "Filipino",
		"DisplayNativeName": "Filipino",
		"TwoLetterISOLanguageName": "",
		"ThreeLetterISOLanguageName": "fil",
		"ThreeLetterISOLanguageNames": [
		  "fil"
		]
	  },
	  {
		"Name": "Finnish",
		"DisplayName": "Finnish",
		"DisplayNativeName": "Suomi",
		"TwoLetterISOLanguageName": "fi",
		"ThreeLetterISOLanguageName": "fin",
		"ThreeLetterISOLanguageNames": [
		  "fin"
		]
	  },
	  {
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
	  {
		"Name": "French, Canada",
		"DisplayName": "French, Canada",
		"DisplayNativeName": "Français, Canada",
		"TwoLetterISOLanguageName": "fr-CA",
		"ThreeLetterISOLanguageName": "frc",
		"ThreeLetterISOLanguageNames": [
		  "frc"
		]
	  },
	  {
		"Name": "Fulah",
		"DisplayName": "Fulah",
		"DisplayNativeName": "Fulfulde",
		"TwoLetterISOLanguageName": "ff",
		"ThreeLetterISOLanguageName": "ful",
		"ThreeLetterISOLanguageNames": [
		  "ful"
		]
	  },
	  {
		"Name": "Gaelic; Scottish Gaelic",
		"DisplayName": "Gaelic; Scottish Gaelic",
		"DisplayNativeName": "Gàidhlig",
		"TwoLetterISOLanguageName": "gd",
		"ThreeLetterISOLanguageName": "gla",
		"ThreeLetterISOLanguageNames": [
		  "gla"
		]
	  },
	  {
		"Name": "Galician",
		"DisplayName": "Galician",
		"DisplayNativeName": "Galego",
		"TwoLetterISOLanguageName": "gl",
		"ThreeLetterISOLanguageName": "glg",
		"ThreeLetterISOLanguageNames": [
		  "glg"
		]
	  },
	  {
		"Name": "Ganda",
		"DisplayName": "Ganda",
		"DisplayNativeName": "Luganda",
		"TwoLetterISOLanguageName": "lg",
		"ThreeLetterISOLanguageName": "lug",
		"ThreeLetterISOLanguageNames": [
		  "lug"
		]
	  },
	  {
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
	  {
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
	  {
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
	  {
		"Name": "Guarani",
		"DisplayName": "Guarani",
		"DisplayNativeName": "Avañe'ẽ",
		"TwoLetterISOLanguageName": "gn",
		"ThreeLetterISOLanguageName": "grn",
		"ThreeLetterISOLanguageNames": [
		  "grn"
		]
	  },
	  {
		"Name": "Gujarati",
		"DisplayName": "Gujarati",
		"DisplayNativeName": "ગુજરાતી",
		"TwoLetterISOLanguageName": "gu",
		"ThreeLetterISOLanguageName": "guj",
		"ThreeLetterISOLanguageNames": [
		  "guj"
		]
	  },
	  {
		"Name": "Haitian; Haitian Creole",
		"DisplayName": "Haitian; Haitian Creole",
		"DisplayNativeName": "Krèyol ayisyen",
		"TwoLetterISOLanguageName": "ht",
		"ThreeLetterISOLanguageName": "hat",
		"ThreeLetterISOLanguageNames": [
		  "hat"
		]
	  },
	  {
		"Name": "Hausa",
		"DisplayName": "Hausa",
		"DisplayNativeName": "هَوُسَ",
		"TwoLetterISOLanguageName": "ha",
		"ThreeLetterISOLanguageName": "hau",
		"ThreeLetterISOLanguageNames": [
		  "hau"
		]
	  },
	  {
		"Name": "Hebrew",
		"DisplayName": "Hebrew",
		"DisplayNativeName": "עברית",
		"TwoLetterISOLanguageName": "he",
		"ThreeLetterISOLanguageName": "heb",
		"ThreeLetterISOLanguageNames": [
		  "heb"
		]
	  },
	  {
		"Name": "Herero",
		"DisplayName": "Herero",
		"DisplayNativeName": "Otsiherero",
		"TwoLetterISOLanguageName": "hz",
		"ThreeLetterISOLanguageName": "her",
		"ThreeLetterISOLanguageNames": [
		  "her"
		]
	  },
	  {
		"Name": "Hindi",
		"DisplayName": "Hindi",
		"DisplayNativeName": "हिन्दी",
		"TwoLetterISOLanguageName": "hi-IN",
		"ThreeLetterISOLanguageName": "hin",
		"ThreeLetterISOLanguageNames": [
		  "hin"
		]
	  },
	  {
		"Name": "Hiri Motu",
		"DisplayName": "Hiri Motu",
		"DisplayNativeName": "Hiri Motu",
		"TwoLetterISOLanguageName": "ho",
		"ThreeLetterISOLanguageName": "hmo",
		"ThreeLetterISOLanguageNames": [
		  "hmo"
		]
	  },
	  {
		"Name": "Hungarian",
		"DisplayName": "Hungarian",
		"DisplayNativeName": "Magyar",
		"TwoLetterISOLanguageName": "hu",
		"ThreeLetterISOLanguageName": "hun",
		"ThreeLetterISOLanguageNames": [
		  "hun"
		]
	  },
	  {
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
	  {
		"Name": "Ido",
		"DisplayName": "Ido",
		"DisplayNativeName": "Ido",
		"TwoLetterISOLanguageName": "io",
		"ThreeLetterISOLanguageName": "ido",
		"ThreeLetterISOLanguageNames": [
		  "ido"
		]
	  },
	  {
		"Name": "Igbo",
		"DisplayName": "Igbo",
		"DisplayNativeName": "Igbo",
		"TwoLetterISOLanguageName": "ig",
		"ThreeLetterISOLanguageName": "ibo",
		"ThreeLetterISOLanguageNames": [
		  "ibo"
		]
	  },
	  {
		"Name": "Indonesian",
		"DisplayName": "Indonesian",
		"DisplayNativeName": "Bahasa Indonesia",
		"TwoLetterISOLanguageName": "id",
		"ThreeLetterISOLanguageName": "ind",
		"ThreeLetterISOLanguageNames": [
		  "ind"
		]
	  },
	  {
		"Name": "Interlingua (International Auxiliary Language Association)",
		"DisplayName": "Interlingua (International Auxiliary Language Association)",
		"DisplayNativeName": "Interlingua",
		"TwoLetterISOLanguageName": "ia",
		"ThreeLetterISOLanguageName": "ina",
		"ThreeLetterISOLanguageNames": [
		  "ina"
		]
	  },
	  {
		"Name": "Interlingue; Occidental",
		"DisplayName": "Interlingue; Occidental",
		"DisplayNativeName": "Interlingue",
		"TwoLetterISOLanguageName": "ie",
		"ThreeLetterISOLanguageName": "ile",
		"ThreeLetterISOLanguageNames": [
		  "ile"
		]
	  },
	  {
		"Name": "Inuktitut",
		"DisplayName": "Inuktitut",
		"DisplayNativeName": "Inuktitut",
		"TwoLetterISOLanguageName": "iu",
		"ThreeLetterISOLanguageName": "iku",
		"ThreeLetterISOLanguageNames": [
		  "iku"
		]
	  },
	  {
		"Name": "Inupiaq",
		"DisplayName": "Inupiaq",
		"DisplayNativeName": "Iñupiak",
		"TwoLetterISOLanguageName": "ik",
		"ThreeLetterISOLanguageName": "ipk",
		"ThreeLetterISOLanguageNames": [
		  "ipk"
		]
	  },
	  {
		"Name": "Irish",
		"DisplayName": "Irish",
		"DisplayNativeName": "Gaeilge",
		"TwoLetterISOLanguageName": "ga",
		"ThreeLetterISOLanguageName": "gle",
		"ThreeLetterISOLanguageNames": [
		  "gle"
		]
	  },
	  {
		"Name": "Italian",
		"DisplayName": "Italian",
		"DisplayNativeName": "Italiano",
		"TwoLetterISOLanguageName": "it",
		"ThreeLetterISOLanguageName": "ita",
		"ThreeLetterISOLanguageNames": [
		  "ita"
		]
	  },
	  {
		"Name": "Japanese",
		"DisplayName": "Japanese",
		"DisplayNativeName": "日本語",
		"TwoLetterISOLanguageName": "ja",
		"ThreeLetterISOLanguageName": "jpn",
		"ThreeLetterISOLanguageNames": [
		  "jpn"
		]
	  },
	  {
		"Name": "Javanese",
		"DisplayName": "Javanese",
		"DisplayNativeName": "Basa Jawa",
		"TwoLetterISOLanguageName": "jv",
		"ThreeLetterISOLanguageName": "jav",
		"ThreeLetterISOLanguageNames": [
		  "jav"
		]
	  },
	  {
		"Name": "Kalaallisut; Greenlandic",
		"DisplayName": "Kalaallisut; Greenlandic",
		"DisplayNativeName": "Kalaallisut",
		"TwoLetterISOLanguageName": "kl",
		"ThreeLetterISOLanguageName": "kal",
		"ThreeLetterISOLanguageNames": [
		  "kal"
		]
	  },
	  {
		"Name": "Kannada",
		"DisplayName": "Kannada",
		"DisplayNativeName": "ಕನ್ನಡ",
		"TwoLetterISOLanguageName": "kn",
		"ThreeLetterISOLanguageName": "kan",
		"ThreeLetterISOLanguageNames": [
		  "kan"
		]
	  },
	  {
		"Name": "Kanuri",
		"DisplayName": "Kanuri",
		"DisplayNativeName": "Kanuri",
		"TwoLetterISOLanguageName": "kr",
		"ThreeLetterISOLanguageName": "kau",
		"ThreeLetterISOLanguageNames": [
		  "kau"
		]
	  },
	  {
		"Name": "Kashmiri",
		"DisplayName": "Kashmiri",
		"DisplayNativeName": "कॉशुर",
		"TwoLetterISOLanguageName": "ks",
		"ThreeLetterISOLanguageName": "kas",
		"ThreeLetterISOLanguageNames": [
		  "kas"
		]
	  },
	  {
		"Name": "Kazakh",
		"DisplayName": "Kazakh",
		"DisplayNativeName": "Қазақша",
		"TwoLetterISOLanguageName": "kk",
		"ThreeLetterISOLanguageName": "kaz",
		"ThreeLetterISOLanguageNames": [
		  "kaz"
		]
	  },
	  {
		"Name": "Kikuyu; Gikuyu",
		"DisplayName": "Kikuyu; Gikuyu",
		"DisplayNativeName": "Gĩkũyũ",
		"TwoLetterISOLanguageName": "ki",
		"ThreeLetterISOLanguageName": "kik",
		"ThreeLetterISOLanguageNames": [
		  "kik"
		]
	  },
	  {
		"Name": "Kinyarwanda",
		"DisplayName": "Kinyarwanda",
		"DisplayNativeName": "Kinyarwandi",
		"TwoLetterISOLanguageName": "rw",
		"ThreeLetterISOLanguageName": "kin",
		"ThreeLetterISOLanguageNames": [
		  "kin"
		]
	  },
	  {
		"Name": "Kirghiz; Kyrgyz",
		"DisplayName": "Kirghiz; Kyrgyz",
		"DisplayNativeName": "Кыргызча",
		"TwoLetterISOLanguageName": "ky",
		"ThreeLetterISOLanguageName": "kir",
		"ThreeLetterISOLanguageNames": [
		  "kir"
		]
	  },
	  {
		"Name": "Komi",
		"DisplayName": "Komi",
		"DisplayNativeName": "Коми",
		"TwoLetterISOLanguageName": "kv",
		"ThreeLetterISOLanguageName": "kom",
		"ThreeLetterISOLanguageNames": [
		  "kom"
		]
	  },
	  {
		"Name": "Kongo",
		"DisplayName": "Kongo",
		"DisplayNativeName": "KiKongo",
		"TwoLetterISOLanguageName": "kg",
		"ThreeLetterISOLanguageName": "kon",
		"ThreeLetterISOLanguageNames": [
		  "kon"
		]
	  },
	  {
		"Name": "Korean",
		"DisplayName": "Korean",
		"DisplayNativeName": "한국어",
		"TwoLetterISOLanguageName": "ko",
		"ThreeLetterISOLanguageName": "kor",
		"ThreeLetterISOLanguageNames": [
		  "kor"
		]
	  },
	  {
		"Name": "Kuanyama; Kwanyama",
		"DisplayName": "Kuanyama; Kwanyama",
		"DisplayNativeName": "Kuanyama",
		"TwoLetterISOLanguageName": "kj",
		"ThreeLetterISOLanguageName": "kua",
		"ThreeLetterISOLanguageNames": [
		  "kua"
		]
	  },
	  {
		"Name": "Kurdish",
		"DisplayName": "Kurdish",
		"DisplayNativeName": "Kurdî",
		"TwoLetterISOLanguageName": "ku",
		"ThreeLetterISOLanguageName": "kur",
		"ThreeLetterISOLanguageNames": [
		  "kur"
		]
	  },
	  {
		"Name": "Lao",
		"DisplayName": "Lao",
		"DisplayNativeName": "Pha xa lao",
		"TwoLetterISOLanguageName": "lo",
		"ThreeLetterISOLanguageName": "lao",
		"ThreeLetterISOLanguageNames": [
		  "lao"
		]
	  },
	  {
		"Name": "Latin",
		"DisplayName": "Latin",
		"DisplayNativeName": "Latina",
		"TwoLetterISOLanguageName": "la",
		"ThreeLetterISOLanguageName": "lat",
		"ThreeLetterISOLanguageNames": [
		  "lat"
		]
	  },
	  {
		"Name": "Latvian",
		"DisplayName": "Latvian",
		"DisplayNativeName": "Latviešu",
		"TwoLetterISOLanguageName": "lv",
		"ThreeLetterISOLanguageName": "lav",
		"ThreeLetterISOLanguageNames": [
		  "lav"
		]
	  },
	  {
		"Name": "Limburgan; Limburger; Limburgish",
		"DisplayName": "Limburgan; Limburger; Limburgish",
		"DisplayNativeName": "Limburgs",
		"TwoLetterISOLanguageName": "li",
		"ThreeLetterISOLanguageName": "lim",
		"ThreeLetterISOLanguageNames": [
		  "lim"
		]
	  },
	  {
		"Name": "Lingala",
		"DisplayName": "Lingala",
		"DisplayNativeName": "Lingála",
		"TwoLetterISOLanguageName": "ln",
		"ThreeLetterISOLanguageName": "lin",
		"ThreeLetterISOLanguageNames": [
		  "lin"
		]
	  },
	  {
		"Name": "Lithuanian",
		"DisplayName": "Lithuanian",
		"DisplayNativeName": "Lietuvių",
		"TwoLetterISOLanguageName": "lt-LT",
		"ThreeLetterISOLanguageName": "lit",
		"ThreeLetterISOLanguageNames": [
		  "lit"
		]
	  },
	  {
		"Name": "Luba-Katanga",
		"DisplayName": "Luba-Katanga",
		"DisplayNativeName": "Luba-Katanga",
		"TwoLetterISOLanguageName": "lu",
		"ThreeLetterISOLanguageName": "lub",
		"ThreeLetterISOLanguageNames": [
		  "lub"
		]
	  },
	  {
		"Name": "Luxembourgish; Letzeburgesch",
		"DisplayName": "Luxembourgish; Letzeburgesch",
		"DisplayNativeName": "Lëtzebuergesch",
		"TwoLetterISOLanguageName": "lb",
		"ThreeLetterISOLanguageName": "ltz",
		"ThreeLetterISOLanguageNames": [
		  "ltz"
		]
	  },
	  {
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
	  {
		"Name": "Malagasy",
		"DisplayName": "Malagasy",
		"DisplayNativeName": "Malagasy",
		"TwoLetterISOLanguageName": "mg",
		"ThreeLetterISOLanguageName": "mlg",
		"ThreeLetterISOLanguageNames": [
		  "mlg"
		]
	  },
	  {
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
	  {
		"Name": "Malayalam",
		"DisplayName": "Malayalam",
		"DisplayNativeName": "മലയാളം",
		"TwoLetterISOLanguageName": "ml",
		"ThreeLetterISOLanguageName": "mal",
		"ThreeLetterISOLanguageNames": [
		  "mal"
		]
	  },
	  {
		"Name": "Maltese",
		"DisplayName": "Maltese",
		"DisplayNativeName": "bil-Malti ",
		"TwoLetterISOLanguageName": "mt",
		"ThreeLetterISOLanguageName": "mlt",
		"ThreeLetterISOLanguageNames": [
		  "mlt"
		]
	  },
	  {
		"Name": "Manx",
		"DisplayName": "Manx",
		"DisplayNativeName": "Gaelg",
		"TwoLetterISOLanguageName": "gv",
		"ThreeLetterISOLanguageName": "glv",
		"ThreeLetterISOLanguageNames": [
		  "glv"
		]
	  },
	  {
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
	  {
		"Name": "Marathi",
		"DisplayName": "Marathi",
		"DisplayNativeName": "मराठी",
		"TwoLetterISOLanguageName": "mr",
		"ThreeLetterISOLanguageName": "mar",
		"ThreeLetterISOLanguageNames": [
		  "mar"
		]
	  },
	  {
		"Name": "Marshallese",
		"DisplayName": "Marshallese",
		"DisplayNativeName": "Kajin Majel",
		"TwoLetterISOLanguageName": "mh",
		"ThreeLetterISOLanguageName": "mah",
		"ThreeLetterISOLanguageNames": [
		  "mah"
		]
	  },
	  {
		"Name": "Mongolian",
		"DisplayName": "Mongolian",
		"DisplayNativeName": "Монгол",
		"TwoLetterISOLanguageName": "mn",
		"ThreeLetterISOLanguageName": "mon",
		"ThreeLetterISOLanguageNames": [
		  "mon"
		]
	  },
	  {
		"Name": "Nauru",
		"DisplayName": "Nauru",
		"DisplayNativeName": "Dorerin Naoero",
		"TwoLetterISOLanguageName": "na",
		"ThreeLetterISOLanguageName": "nau",
		"ThreeLetterISOLanguageNames": [
		  "nau"
		]
	  },
	  {
		"Name": "Navajo; Navaho",
		"DisplayName": "Navajo; Navaho",
		"DisplayNativeName": "Diné bizaad",
		"TwoLetterISOLanguageName": "nv",
		"ThreeLetterISOLanguageName": "nav",
		"ThreeLetterISOLanguageNames": [
		  "nav"
		]
	  },
	  {
		"Name": "Ndebele, North; North Ndebele",
		"DisplayName": "Ndebele, North; North Ndebele",
		"DisplayNativeName": "Sindebele",
		"TwoLetterISOLanguageName": "nd",
		"ThreeLetterISOLanguageName": "nde",
		"ThreeLetterISOLanguageNames": [
		  "nde"
		]
	  },
	  {
		"Name": "Ndebele, South; South Ndebele",
		"DisplayName": "Ndebele, South; South Ndebele",
		"DisplayNativeName": "isiNdebele",
		"TwoLetterISOLanguageName": "nr",
		"ThreeLetterISOLanguageName": "nbl",
		"ThreeLetterISOLanguageNames": [
		  "nbl"
		]
	  },
	  {
		"Name": "Ndonga",
		"DisplayName": "Ndonga",
		"DisplayNativeName": "Oshiwambo",
		"TwoLetterISOLanguageName": "ng",
		"ThreeLetterISOLanguageName": "ndo",
		"ThreeLetterISOLanguageNames": [
		  "ndo"
		]
	  },
	  {
		"Name": "Nepali",
		"DisplayName": "Nepali",
		"DisplayNativeName": "नेपाली",
		"TwoLetterISOLanguageName": "ne",
		"ThreeLetterISOLanguageName": "nep",
		"ThreeLetterISOLanguageNames": [
		  "nep"
		]
	  },
	  {
		"Name": "Northern Sami",
		"DisplayName": "Northern Sami",
		"DisplayNativeName": "Davvisámegiella",
		"TwoLetterISOLanguageName": "se",
		"ThreeLetterISOLanguageName": "sme",
		"ThreeLetterISOLanguageNames": [
		  "sme"
		]
	  },
	  {
		"Name": "Norwegian",
		"DisplayName": "Norwegian",
		"DisplayNativeName": "Norsk",
		"TwoLetterISOLanguageName": "no",
		"ThreeLetterISOLanguageName": "nor",
		"ThreeLetterISOLanguageNames": [
		  "nor"
		]
	  },
	  {
		"Name": "Norwegian, Nynorsk",
		"DisplayName": "Norwegian, Nynorsk",
		"DisplayNativeName": "Norsk, Nynorsk ",
		"TwoLetterISOLanguageName": "nn",
		"ThreeLetterISOLanguageName": "nno",
		"ThreeLetterISOLanguageNames": [
		  "nno"
		]
	  },
	  {
		"Name": "Norwegian, Bokmål",
		"DisplayName": "Norwegian, Bokmål",
		"DisplayNativeName": "Norsk, Bokmål",
		"TwoLetterISOLanguageName": "nb",
		"ThreeLetterISOLanguageName": "nob",
		"ThreeLetterISOLanguageNames": [
		  "nob"
		]
	  },
	  {
		"Name": "Occitan (post 1500); Provençal",
		"DisplayName": "Occitan (post 1500); Provençal",
		"DisplayNativeName": "Occitan",
		"TwoLetterISOLanguageName": "oc",
		"ThreeLetterISOLanguageName": "oci",
		"ThreeLetterISOLanguageNames": [
		  "oci"
		]
	  },
	  {
		"Name": "Ojibwa",
		"DisplayName": "Ojibwa",
		"DisplayNativeName": "Ojibwa",
		"TwoLetterISOLanguageName": "oj",
		"ThreeLetterISOLanguageName": "oji",
		"ThreeLetterISOLanguageNames": [
		  "oji"
		]
	  },
	  {
		"Name": "Oriya",
		"DisplayName": "Oriya",
		"DisplayNativeName": "ଓଡ଼ିଆ",
		"TwoLetterISOLanguageName": "or",
		"ThreeLetterISOLanguageName": "ori",
		"ThreeLetterISOLanguageNames": [
		  "ori"
		]
	  },
	  {
		"Name": "Oromo",
		"DisplayName": "Oromo",
		"DisplayNativeName": "Oromoo",
		"TwoLetterISOLanguageName": "om",
		"ThreeLetterISOLanguageName": "orm",
		"ThreeLetterISOLanguageNames": [
		  "orm"
		]
	  },
	  {
		"Name": "Ossetian; Ossetic",
		"DisplayName": "Ossetian; Ossetic",
		"DisplayNativeName": "Иронау",
		"TwoLetterISOLanguageName": "os",
		"ThreeLetterISOLanguageName": "oss",
		"ThreeLetterISOLanguageNames": [
		  "oss"
		]
	  },
	  {
		"Name": "Pali",
		"DisplayName": "Pali",
		"DisplayNativeName": "Pāli",
		"TwoLetterISOLanguageName": "pi",
		"ThreeLetterISOLanguageName": "pli",
		"ThreeLetterISOLanguageNames": [
		  "pli"
		]
	  },
	  {
		"Name": "Panjabi; Punjabi",
		"DisplayName": "Panjabi; Punjabi",
		"DisplayNativeName": "ਪੰਜਾਬੀ",
		"TwoLetterISOLanguageName": "pa",
		"ThreeLetterISOLanguageName": "pan",
		"ThreeLetterISOLanguageNames": [
		  "pan"
		]
	  },
	  {
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
	  {
		"Name": "Polish",
		"DisplayName": "Polish",
		"DisplayNativeName": "Polski",
		"TwoLetterISOLanguageName": "pl",
		"ThreeLetterISOLanguageName": "pol",
		"ThreeLetterISOLanguageNames": [
		  "pol"
		]
	  },
	  {
		"Name": "Portuguese",
		"DisplayName": "Portuguese",
		"DisplayNativeName": "Português",
		"TwoLetterISOLanguageName": "pt-PT",
		"ThreeLetterISOLanguageName": "por",
		"ThreeLetterISOLanguageNames": [
		  "por"
		]
	  },
	  {
		"Name": "Portuguese, Brazil",
		"DisplayName": "Portuguese, Brazil",
		"DisplayNativeName": "Português, Brazil",
		"TwoLetterISOLanguageName": "pt-BR",
		"ThreeLetterISOLanguageName": "pob",
		"ThreeLetterISOLanguageNames": [
		  "pob"
		]
	  },
	  {
		"Name": "Pushto; Pashto",
		"DisplayName": "Pushto; Pashto",
		"DisplayNativeName": "پښتو",
		"TwoLetterISOLanguageName": "ps",
		"ThreeLetterISOLanguageName": "pus",
		"ThreeLetterISOLanguageNames": [
		  "pus"
		]
	  },
	  {
		"Name": "Quechua",
		"DisplayName": "Quechua",
		"DisplayNativeName": "Runa Simi",
		"TwoLetterISOLanguageName": "qu",
		"ThreeLetterISOLanguageName": "que",
		"ThreeLetterISOLanguageNames": [
		  "que"
		]
	  },
	  {
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
	  {
		"Name": "Romansh",
		"DisplayName": "Romansh",
		"DisplayNativeName": "rumantsch",
		"TwoLetterISOLanguageName": "rm",
		"ThreeLetterISOLanguageName": "roh",
		"ThreeLetterISOLanguageNames": [
		  "roh"
		]
	  },
	  {
		"Name": "Rundi",
		"DisplayName": "Rundi",
		"DisplayNativeName": "kirundi",
		"TwoLetterISOLanguageName": "rn",
		"ThreeLetterISOLanguageName": "run",
		"ThreeLetterISOLanguageNames": [
		  "run"
		]
	  },
	  {
		"Name": "Russian",
		"DisplayName": "Russian",
		"DisplayNativeName": "Русский",
		"TwoLetterISOLanguageName": "ru",
		"ThreeLetterISOLanguageName": "rus",
		"ThreeLetterISOLanguageNames": [
		  "rus"
		]
	  },
	  {
		"Name": "Samoan",
		"DisplayName": "Samoan",
		"DisplayNativeName": "Gagana Samoa",
		"TwoLetterISOLanguageName": "sm",
		"ThreeLetterISOLanguageName": "smo",
		"ThreeLetterISOLanguageNames": [
		  "smo"
		]
	  },
	  {
		"Name": "Sango",
		"DisplayName": "Sango",
		"DisplayNativeName": "Sängö",
		"TwoLetterISOLanguageName": "sg",
		"ThreeLetterISOLanguageName": "sag",
		"ThreeLetterISOLanguageNames": [
		  "sag"
		]
	  },
	  {
		"Name": "Sanskrit",
		"DisplayName": "Sanskrit",
		"DisplayNativeName": "संस्कृतम्",
		"TwoLetterISOLanguageName": "sa",
		"ThreeLetterISOLanguageName": "san",
		"ThreeLetterISOLanguageNames": [
		  "san"
		]
	  },
	  {
		"Name": "Sardinian",
		"DisplayName": "Sardinian",
		"DisplayNativeName": "Sardu",
		"TwoLetterISOLanguageName": "sc",
		"ThreeLetterISOLanguageName": "srd",
		"ThreeLetterISOLanguageNames": [
		  "srd"
		]
	  },
	  {
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
	  {
		"Name": "Shona",
		"DisplayName": "Shona",
		"DisplayNativeName": "chiShona",
		"TwoLetterISOLanguageName": "sn",
		"ThreeLetterISOLanguageName": "sna",
		"ThreeLetterISOLanguageNames": [
		  "sna"
		]
	  },
	  {
		"Name": "Sichuan Yi; Nuosu",
		"DisplayName": "Sichuan Yi; Nuosu",
		"DisplayNativeName": "Sichuan Yi",
		"TwoLetterISOLanguageName": "ii",
		"ThreeLetterISOLanguageName": "iii",
		"ThreeLetterISOLanguageNames": [
		  "iii"
		]
	  },
	  {
		"Name": "Sindhi",
		"DisplayName": "Sindhi",
		"DisplayNativeName": "سنڌي",
		"TwoLetterISOLanguageName": "sd",
		"ThreeLetterISOLanguageName": "snd",
		"ThreeLetterISOLanguageNames": [
		  "snd"
		]
	  },
	  {
		"Name": "Sinhala, Sinhalese",
		"DisplayName": "Sinhala; Sinhalese",
		"DisplayNativeName": "සිංහල",
		"TwoLetterISOLanguageName": "si",
		"ThreeLetterISOLanguageName": "sin",
		"ThreeLetterISOLanguageNames": [
		  "sin"
		]
	  },
	  {
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
	  {
		"Name": "Slovenian",
		"DisplayName": "Slovenian",
		"DisplayNativeName": "Slovenščina",
		"TwoLetterISOLanguageName": "sl-SI",
		"ThreeLetterISOLanguageName": "slv",
		"ThreeLetterISOLanguageNames": [
		  "slv"
		]
	  },
	  {
		"Name": "Somali",
		"DisplayName": "Somali",
		"DisplayNativeName": "Soomaaliga",
		"TwoLetterISOLanguageName": "so",
		"ThreeLetterISOLanguageName": "som",
		"ThreeLetterISOLanguageNames": [
		  "som"
		]
	  },
	  {
		"Name": "Sotho, Southern",
		"DisplayName": "Sotho, Southern",
		"DisplayNativeName": "Sesotho",
		"TwoLetterISOLanguageName": "st",
		"ThreeLetterISOLanguageName": "sot",
		"ThreeLetterISOLanguageNames": [
		  "sot"
		]
	  },
	  {
		"DisplayName": "Spanish, Argentina",
		"DisplayNativeName": "Español, República Argentina",
		"TwoLetterISOLanguageName": "es-AR",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"DisplayName": "Spanish, Dominican Republic",
		"DisplayNativeName": "Español, República Dominicana",
		"TwoLetterISOLanguageName": "es-DO",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"DisplayName": "Spanish, Latin America",
		"DisplayNativeName": "Español, América Latina",
		"TwoLetterISOLanguageName": "es-419",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Spanish; Castilian",
		"DisplayName": "Spanish, Castilian",
		"DisplayNativeName": "Español, Castilian",
		"TwoLetterISOLanguageName": "es-ES",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Spanish; Latin",
		"DisplayName": "Spanish, Mexico",
		"DisplayNativeName": "Español, Mexico",
		"TwoLetterISOLanguageName": "es-MX",
		"ThreeLetterISOLanguageName": "spa",
		"ThreeLetterISOLanguageNames": [
		  "spa"
		]
	  },
	  {
		"Name": "Sundanese",
		"DisplayName": "Sundanese",
		"DisplayNativeName": "Basa Sunda",
		"TwoLetterISOLanguageName": "su",
		"ThreeLetterISOLanguageName": "sun",
		"ThreeLetterISOLanguageNames": [
		  "sun"
		]
	  },
	  {
		"Name": "Swahili",
		"DisplayName": "Swahili",
		"DisplayNativeName": "Kiswahili",
		"TwoLetterISOLanguageName": "sw",
		"ThreeLetterISOLanguageName": "swa",
		"ThreeLetterISOLanguageNames": [
		  "swa"
		]
	  },
	  {
		"Name": "Swati",
		"DisplayName": "Swati",
		"DisplayNativeName": "SiSwati",
		"TwoLetterISOLanguageName": "ss",
		"ThreeLetterISOLanguageName": "ssw",
		"ThreeLetterISOLanguageNames": [
		  "ssw"
		]
	  },
	  {
		"Name": "Swedish",
		"DisplayName": "Swedish",
		"DisplayNativeName": "Svenska",
		"TwoLetterISOLanguageName": "sv",
		"ThreeLetterISOLanguageName": "swe",
		"ThreeLetterISOLanguageNames": [
		  "swe"
		]
	  },
	  {
		"Name": "Swiss German; Alemannic; Alsatian",
		"DisplayName": "Swiss German; Alemannic; Alsatian",
		"DisplayNativeName": "Alemannisch",
		"TwoLetterISOLanguageName": "",
		"ThreeLetterISOLanguageName": "gsw",
		"ThreeLetterISOLanguageNames": [
		  "gsw"
		]
	  },
	  {
		"Name": "Tagalog",
		"DisplayName": "Tagalog",
		"DisplayNativeName": "Tagalog",
		"TwoLetterISOLanguageName": "tl",
		"ThreeLetterISOLanguageName": "tgl",
		"ThreeLetterISOLanguageNames": [
		  "tgl"
		]
	  },
	  {
		"Name": "Tahitian",
		"DisplayName": "Tahitian",
		"DisplayNativeName": "Reo Mā`ohi",
		"TwoLetterISOLanguageName": "ty",
		"ThreeLetterISOLanguageName": "tah",
		"ThreeLetterISOLanguageNames": [
		  "tah"
		]
	  },
	  {
		"Name": "Tajik",
		"DisplayName": "Tajik",
		"DisplayNativeName": "Тоҷикӣ",
		"TwoLetterISOLanguageName": "tg",
		"ThreeLetterISOLanguageName": "tgk",
		"ThreeLetterISOLanguageNames": [
		  "tgk"
		]
	  },
	  {
		"Name": "Tamil",
		"DisplayName": "Tamil",
		"DisplayNativeName": "தமிழ்",
		"TwoLetterISOLanguageName": "ta",
		"ThreeLetterISOLanguageName": "tam",
		"ThreeLetterISOLanguageNames": [
		  "tam"
		]
	  },
	  {
		"Name": "Tatar",
		"DisplayName": "Tatar",
		"DisplayNativeName": "Tatarça",
		"TwoLetterISOLanguageName": "tt",
		"ThreeLetterISOLanguageName": "tat",
		"ThreeLetterISOLanguageNames": [
		  "tat"
		]
	  },
	  {
		"Name": "Telugu",
		"DisplayName": "Telugu",
		"DisplayNativeName": "తెలుగు",
		"TwoLetterISOLanguageName": "te",
		"ThreeLetterISOLanguageName": "tel",
		"ThreeLetterISOLanguageNames": [
		  "tel"
		]
	  },
	  {
		"Name": "Thai",
		"DisplayName": "Thai",
		"DisplayNativeName": "ไทย",
		"TwoLetterISOLanguageName": "th",
		"ThreeLetterISOLanguageName": "tha",
		"ThreeLetterISOLanguageNames": [
		  "tha"
		]
	  },
	  {
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
	  {
		"Name": "Tigrinya",
		"DisplayName": "Tigrinya",
		"DisplayNativeName": "ትግርኛ",
		"TwoLetterISOLanguageName": "ti",
		"ThreeLetterISOLanguageName": "tir",
		"ThreeLetterISOLanguageNames": [
		  "tir"
		]
	  },
	  {
		"Name": "Tonga (Tonga Islands)",
		"DisplayName": "Tonga (Tonga Islands)",
		"DisplayNativeName": "Lea Faka-Tonga",
		"TwoLetterISOLanguageName": "to",
		"ThreeLetterISOLanguageName": "ton",
		"ThreeLetterISOLanguageNames": [
		  "ton"
		]
	  },
	  {
		"Name": "Tsonga",
		"DisplayName": "Tsonga",
		"DisplayNativeName": "Xitsonga",
		"TwoLetterISOLanguageName": "ts",
		"ThreeLetterISOLanguageName": "tso",
		"ThreeLetterISOLanguageNames": [
		  "tso"
		]
	  },
	  {
		"Name": "Tswana",
		"DisplayName": "Tswana",
		"DisplayNativeName": "Setswana",
		"TwoLetterISOLanguageName": "tn",
		"ThreeLetterISOLanguageName": "tsn",
		"ThreeLetterISOLanguageNames": [
		  "tsn"
		]
	  },
	  {
		"Name": "Turkish",
		"DisplayName": "Turkish",
		"DisplayNativeName": "Türkçe",
		"TwoLetterISOLanguageName": "tr",
		"ThreeLetterISOLanguageName": "tur",
		"ThreeLetterISOLanguageNames": [
		  "tur"
		]
	  },
	  {
		"Name": "Turkmen",
		"DisplayName": "Turkmen",
		"DisplayNativeName": "Туркмен",
		"TwoLetterISOLanguageName": "tk",
		"ThreeLetterISOLanguageName": "tuk",
		"ThreeLetterISOLanguageNames": [
		  "tuk"
		]
	  },
	  {
		"Name": "Twi",
		"DisplayName": "Twi",
		"DisplayNativeName": "Twi",
		"TwoLetterISOLanguageName": "tw",
		"ThreeLetterISOLanguageName": "twi",
		"ThreeLetterISOLanguageNames": [
		  "twi"
		]
	  },
	  {
		"Name": "Uighur; Uyghur",
		"DisplayName": "Uighur; Uyghur",
		"DisplayNativeName": "Uyƣurqə",
		"TwoLetterISOLanguageName": "ug",
		"ThreeLetterISOLanguageName": "uig",
		"ThreeLetterISOLanguageNames": [
		  "uig"
		]
	  },
	  {
		"Name": "Ukrainian",
		"DisplayName": "Ukrainian",
		"DisplayNativeName": "Українська",
		"TwoLetterISOLanguageName": "uk",
		"ThreeLetterISOLanguageName": "ukr",
		"ThreeLetterISOLanguageNames": [
		  "ukr"
		]
	  },
	  {
		"Name": "Urdu",
		"DisplayName": "Urdu",
		"DisplayNativeName": "اردو",
		"TwoLetterISOLanguageName": "ur-PK",
		"ThreeLetterISOLanguageName": "urd",
		"ThreeLetterISOLanguageNames": [
		  "urd"
		]
	  },
	  {
		"Name": "Uzbek",
		"DisplayName": "Uzbek",
		"DisplayNativeName": "Ўзбек",
		"TwoLetterISOLanguageName": "uz",
		"ThreeLetterISOLanguageName": "uzb",
		"ThreeLetterISOLanguageNames": [
		  "uzb"
		]
	  },
	  {
		"Name": "Venda",
		"DisplayName": "Venda",
		"DisplayNativeName": "Tshivenḓa",
		"TwoLetterISOLanguageName": "ve",
		"ThreeLetterISOLanguageName": "ven",
		"ThreeLetterISOLanguageNames": [
		  "ven"
		]
	  },
	  {
		"Name": "Vietnamese",
		"DisplayName": "Vietnamese",
		"DisplayNativeName": "Việtnam",
		"TwoLetterISOLanguageName": "vi",
		"ThreeLetterISOLanguageName": "vie",
		"ThreeLetterISOLanguageNames": [
		  "vie"
		]
	  },
	  {
		"Name": "Volapük",
		"DisplayName": "Volapük",
		"DisplayNativeName": "Volapük",
		"TwoLetterISOLanguageName": "vo",
		"ThreeLetterISOLanguageName": "vol",
		"ThreeLetterISOLanguageNames": [
		  "vol"
		]
	  },
	  {
		"Name": "Walloon",
		"DisplayName": "Walloon",
		"DisplayNativeName": "Walon",
		"TwoLetterISOLanguageName": "wa",
		"ThreeLetterISOLanguageName": "wln",
		"ThreeLetterISOLanguageNames": [
		  "wln"
		]
	  },
	  {
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
	  {
		"Name": "Western Frisian",
		"DisplayName": "Western Frisian",
		"DisplayNativeName": "Frysk",
		"TwoLetterISOLanguageName": "fy",
		"ThreeLetterISOLanguageName": "fry",
		"ThreeLetterISOLanguageNames": [
		  "fry"
		]
	  },
	  {
		"Name": "Wolof",
		"DisplayName": "Wolof",
		"DisplayNativeName": "Wollof",
		"TwoLetterISOLanguageName": "wo",
		"ThreeLetterISOLanguageName": "wol",
		"ThreeLetterISOLanguageNames": [
		  "wol"
		]
	  },
	  {
		"Name": "Xhosa",
		"DisplayName": "Xhosa",
		"DisplayNativeName": "isiXhosa",
		"TwoLetterISOLanguageName": "xh",
		"ThreeLetterISOLanguageName": "xho",
		"ThreeLetterISOLanguageNames": [
		  "xho"
		]
	  },
	  {
		"Name": "Yiddish",
		"DisplayName": "Yiddish",
		"DisplayNativeName": "ייִדיש",
		"TwoLetterISOLanguageName": "yi",
		"ThreeLetterISOLanguageName": "yid",
		"ThreeLetterISOLanguageNames": [
		  "yid"
		]
	  },
	  {
		"Name": "Yoruba",
		"DisplayName": "Yoruba",
		"DisplayNativeName": "Yorùbá",
		"TwoLetterISOLanguageName": "yo",
		"ThreeLetterISOLanguageName": "yor",
		"ThreeLetterISOLanguageNames": [
		  "yor"
		]
	  },
	  {
		"Name": "Zhuang; Chuang",
		"DisplayName": "Zhuang; Chuang",
		"DisplayNativeName": "壮语",
		"TwoLetterISOLanguageName": "za",
		"ThreeLetterISOLanguageName": "zha",
		"ThreeLetterISOLanguageNames": [
		  "zha"
		]
	  },
	  {
		"Name": "Zulu",
		"DisplayName": "Zulu",
		"DisplayNativeName": "isiZulu",
		"TwoLetterISOLanguageName": "zu",
		"ThreeLetterISOLanguageName": "zul",
		"ThreeLetterISOLanguageNames": [
		  "zul"
		]
	  }
	];
}

export default {
	matchCulture: matchCulture,
	getCultures: getCultures
};


/* eslint-enable indent */
