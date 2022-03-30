import { appRouter } from '../components/appRouter';
import cardBuilder from '../components/cardbuilder/cardBuilder';
import dom from '../scripts/dom';
import globalize from '../scripts/globalize';
import { appHost } from '../components/apphost';
import layoutManager from '../components/layoutManager';
import { ajax } from '../components/fetchhelper';
import loading from '../components/loading/loading';
import browser from '../scripts/browser';
import focusManager from '../components/focusManager';
import '../elements/emby-itemscontainer/emby-itemscontainer';
import '../elements/emby-scroller/emby-scroller';
import ServerConnections from '../components/ServerConnections';
import { pageClassOn } from '../scripts/clientUtils';
import appInfo from '../config.json';

function isSecure() {
	return location.protocol == 'https:';
}

function checkUpdates() {
	let req = {};
	req.dataType = 'json';
	const url_proto_SSL = 'https://';
	const url_base = 'blob03.github.io/myJelly/src/config.json';	
	req.url = url_proto_SSL + url_base; 
	const au = document.querySelector('#aboutupdate');
	if (!au)
		return;
	au.innerHTML = globalize.translate('LabelUpdateSearching');
	
	loading.show();	
	
	ajax(req).then(function (data) {
		if (appInfo.version >= data.version) {
			au.style.fontWeight = "400";
			au.innerHTML = globalize.translate('LabelUpdateOK');
		} else {
			au.style.fontWeight = "600";
			au.innerHTML = globalize.translate('LabelUpdateNOK', data.version);
		}
		loading.hide();
	}).catch(function (data) {
		au.style.fontWeight = "600";
		au.innerHTML = globalize.translate('LabelUpdateERR');
		loading.hide();
	});
}

function getHostVersion(browser) {
	if (browser.web0s) 
		return 'WebOS ' + browser.web0sVersion;
	if (browser.iOS) {
		let version = browser.iOSVersion;
		if (browser.ipad)
			return 'ipad iOS ' + version;
		if (browser.iphone)
			return 'iphone iOS ' + version;
		if (browser.ipod)
			return 'ipod iOS ' + version;
		return 'iOS ' + version;
	}
	if (browser.tizen) 
		return 'Tizen ' + browser.tizenVersion;

	return browser.version;
}

class AboutTab {
    constructor(view, params) {
        this.view = view;
        this.params = params;
        this.sectionsContainer = view.querySelector('.sections');
		let html = '<div class="abouttab" style="display: flex !important;width: 100%;height: 10em;flex-direction: column;align-items: center;justify-content: space-around;margin: 3em 0 0 0 !important;">';
		html += '<div class="paperList aboutframe" style="padding: 1em;background: rgba(0, 0, 0, 0.15);">';
		html += '<div> ' + globalize.translate('LabelName') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.name + '</span></div>';
		html += '<div> ' + globalize.translate('LabelAppDesc') + ' <span style="font-weight:400;font-style: italic;" class="aboutcontent">' + globalize.translate(appInfo.description) + '</span></div>';
		html += '<div> ' + globalize.translate('LabelAppHost') + ' <span style="font-weight:400;" class="aboutcontent">' + appHost.deviceName() + ' - ' + getHostVersion(browser)  + '</span></div>';
		html += '<div> ' + globalize.translate('LabelVersion') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.version + '</span></div>';
		html += '<div> ' + globalize.translate('LabelUpdate') + ' <span style="font-weight:400;" id="aboutupdate" class="aboutcontent">' + '</span></div>';
		if (browser.tv || layoutManager.tv) {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.repository + '</span></div>';
			html += '<div> ' + globalize.translate('LabelAppContact') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.contact + '</span></div>';
		} else {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span><a is="emby-linkbutton" style="font-weight:400;" rel="noopener noreferrer" class="aboutcontent button-link emby-button" target="_blank" href="' + appInfo.repository + '">' + appInfo.repository + '</a></span></div>';
			html += '<div> ' + globalize.translate('LabelAppContact') + ' <span><a rel="noopener noreferrer" style="font-weight:400;" class="aboutcontent button-link emby-button" href="mailto:' + appInfo.contact + '">' + appInfo.contact + '</a></span></div>';
		}
		html += '</div>';
		html += '</div>';
		this.sectionsContainer.innerHTML = html;
    }
	
	onResume(options) {
		checkUpdates();
	}
	
	onPause() {
    }
		
    destroy() {
        this.view = null;
        this.params = null;
        this.sectionsContainer = null;
    }
}

export default AboutTab;

