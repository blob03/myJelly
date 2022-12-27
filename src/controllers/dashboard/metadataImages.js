import 'jquery';
import loading from '../../components/loading/loading';
import libraryMenu from '../../scripts/libraryMenu';
import globalize from '../../scripts/globalize';
import '../../components/listview/listview.scss';
import Dashboard from '../../utils/dashboard';
import settingsHelper from '../../components/settingshelper';

/* eslint-disable indent */

    function populateLanguages(selectLanguage) {
		return ApiClient.getCultures().then(allCultures => {
			settingsHelper.populateServerLanguages(selectLanguage, allCultures, "DisplayName");
		});
    }

    function populateCountries(selectCountry) {
        return ApiClient.getCountries().then(function(allCountries) {
            let html = '';
			html += "<option value=''>" + globalize.translate('none') + "</option>";
            for (let i = 0, length = allCountries.length; i < length; i++) {
                const culture = allCountries[i];
                html += "<option value='" + culture.TwoLetterISORegionName + "'>" + culture.DisplayName + '</option>';
            }
            selectCountry.innerHTML = html;
        });
    }

    function loadPage(page) {
        const promises = [ApiClient.getServerConfiguration(), populateLanguages(page.querySelector('#selectLanguage')), populateCountries(page.querySelector('#selectCountry'))];
        Promise.all(promises).then(function(responses) {
            const config = responses[0];
            page.querySelector('#selectLanguage').value = config.PreferredMetadataLanguage || '';
            page.querySelector('#selectCountry').value = config.MetadataCountryCode || '';
            loading.hide();
        });
    }

    function onSubmit() {
        const form = this;
        loading.show();
        ApiClient.getServerConfiguration().then(function(config) {
            config.PreferredMetadataLanguage = form.querySelector('#selectLanguage').value;
            config.MetadataCountryCode = form.querySelector('#selectCountry').value;
            ApiClient.updateServerConfiguration(config).then(Dashboard.processServerConfigurationUpdateResult);
        });
        return false;
    }

    function getTabs() {
        return [{
            href: '#/library.html',
            name: globalize.translate('HeaderLibraries')
        }, {
            href: '#/librarydisplay.html',
            name: globalize.translate('Display')
        }, {
            href: '#/metadataimages.html',
            name: globalize.translate('Metadata')
        }, {
            href: '#/metadatanfo.html',
            name: globalize.translate('TabNfoSettings')
        }];
    }

    $(document).on('pageinit', '#metadataImagesConfigurationPage', function() {
        $('.metadataImagesConfigurationForm').off('submit', onSubmit).on('submit', onSubmit);
    }).on('pageshow', '#metadataImagesConfigurationPage', function() {
        libraryMenu.setTabs('metadata', 2, getTabs);
        loading.show();
        loadPage(this);
    });

/* eslint-enable indent */
