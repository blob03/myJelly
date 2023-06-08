import 'jquery';
import loading from '../../../components/loading/loading';
import '../../../elements/emby-button/emby-button';
import '../../../elements/emby-select/emby-select';
import settingsHelper from '../../../components/settingshelper';
import * as userSettings from '../../../scripts/settings/userSettings';
import * as webSettings from '../../../scripts/settings/webSettings';
import Dashboard from '../../../utils/dashboard';
import globalize from '../../../scripts/globalize';
import cultures from '../../../scripts/cultures';

//function load(page, lang, languageOptions) {
function load(page, lang) {
	const allCultures = cultures.getDictionaries();
	let selectLanguage = page.querySelector('#selectLocalizationLanguage');
	//let allCultures = languageOptions.map( x => {
	//	return {
	//		Name: x.Name,
	//		ISO6391: x.Value,
	//	};
	//});
	settingsHelper.populateDictionaries(selectLanguage, allCultures, "displayNativeName", lang);
	loading.hide();
}

function save(page) {
    loading.show();
    ApiClient.getJSON(ApiClient.getUrl('Startup/Configuration')).then(function (config) {
        config.UICulture = $('#selectLocalizationLanguage', page).val();
        ApiClient.ajax({
            type: 'POST',
            data: JSON.stringify(config),
            url: ApiClient.getUrl('Startup/Configuration'),
            contentType: 'application/json'
        }).then(function () {
            Dashboard.navigate('wizarduser.html');
        });
    });
}

function onSubmit() {
    save($(this).parents('.page'));
    return false;
}

export default function (view) {
    $('.wizardStartForm', view).on('submit', onSubmit);
	
	loading.show();
	
	if (webSettings.loginClock()) {
		userSettings.placeClock(webSettings.loginClockPos(), true);
		userSettings.setClockFormat(webSettings.loginClockFormat(), true);
	}
	
	const defaultLang = globalize.getDefaultCulture().ccode;
	const promise1 = ApiClient.getJSON(ApiClient.getUrl('Startup/Configuration'));
	//const promise2 = ApiClient.getJSON(ApiClient.getUrl('Localization/Options'));
	let config = [];
	//Promise.all([promise1, promise2]).then(function (responses) {
	Promise.all([promise1]).then(function (responses) {
		config = { ...responses[0] };
		if (!config.UICulture)
			config.UICulture = defaultLang;
		load(view, config.UICulture, responses[1]);
	});
	
	load(view, config.UICulture);
	let selectLanguage = view.querySelector('#selectLocalizationLanguage');
	selectLanguage.addEventListener('change', (x) => {
		const lang = x.target.value || defaultLang;
		userSettings.language(lang);
		config.UICulture = lang;
		globalize.getCoreDictionary(lang).then(() => {
			 ApiClient.ajax({
				type: 'POST',
				data: JSON.stringify(config),
				url: ApiClient.getUrl('Startup/Configuration'),
				contentType: 'application/json'
			}).then( () => {
				const serverId = ApiClient.serverId();
				const rnd = Math.floor(Math.random() * 1000000);
				Dashboard.navigate('wizardstart.html?serverid=' + serverId + '&_cb=' + rnd, false);
			});
		});
	});

    view.addEventListener('viewshow', function () {
        document.querySelector('.skinHeader').classList.add('noHomeButtonHeader');
    });
    view.addEventListener('viewhide', function () {
        document.querySelector('.skinHeader').classList.remove('noHomeButtonHeader');
    });
}
