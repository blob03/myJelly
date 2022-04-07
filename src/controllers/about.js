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
		this._check = false;
        this.view = view;
        this.params = params;
        this.sectionsContainer = view.querySelector('.sections');
		let html = '<div class="abouttab" style="display: flex !important;width: 100%;height: 10em;flex-direction: column;align-items: center;justify-content: space-around;margin: 6rem 0 0 0 !important;">';
		html += '<div class="paperList aboutframe" style="padding: 1em;background: rgba(0, 0, 0, 0.15);">';
		html += '<div><center><span style="font-weight: 400;font-size: 200%;font-family: quicksand;" class="aboutcontent">' + appInfo.name + '</span></center></div>';
		html += '<div><center><span style="font-weight: 400;font-style: italic;font-family: quicksand;" class="aboutcontent">' + globalize.translate(appInfo.description) + '</span></center></div>';
		html += '<br>';
		html += '<div> ' + globalize.translate('LabelAppHost') + ' <span style="font-weight:400;" class="aboutcontent">' + appHost.deviceName() + ' - ' + getHostVersion(browser)  + '</span></div>';
		html += '<div> ' + globalize.translate('LabelAppVersion') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.version + '</span></div>';
		html += '<div> ' + globalize.translate('LabelUpdate') + ' <span style="font-weight:400;" id="aboutupdate" class="aboutcontent">' + '</span></div>';
		if (browser.tv || layoutManager.tv) {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.repository + '</span></div>';
			html += '<br>';
			html += '<div style="display:flex;align-items:center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="Favoris" style="color: #c1dede;font-size: 1.5rem;margin: 0 .5rem 0 0;"></span><br><span style="font-weight:400;" class="aboutcontent">' + appInfo.contact + '</span></div>';
		} else {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span><a is="emby-linkbutton" style="font-weight:400;" rel="noopener noreferrer" class="aboutcontent button-link emby-button" target="_blank" href="' + appInfo.repository + '">' + appInfo.repository + '</a></span></div>';
			html += '<br>';
			html += '<div style="display:flex;align-items:center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="Favoris" style="color: #c1dede;font-size: 1.5rem;margin: 0 .5rem 0 0;"></span><br><span><a rel="noopener noreferrer" style="font-weight:400;" class="aboutcontent button-link emby-button" href="mailto:' + appInfo.contact + '">' + appInfo.contact + '</a></span></div>';
		}
		html += '</div>';
		html += '</div>';
		this.sectionsContainer.innerHTML = html;
    }
	
	onResume(options) {
		if (this._busy === true)
			loading.show();	
		else
			this.checkUpdates();
	}
	
	onPause() {
		loading.hide();
    }
		
    destroy() {
        this.view = null;
        this.params = null;
        this.sectionsContainer = null;
    }
	
	checkUpdates() {
		let req = {};
		req.dataType = 'json';
		const url_proto_SSL = 'https://';
		const url_base = 'blob03.github.io/myJelly/src/config.json';	
		//const url_cacheBuster = '?_=' + Date.now().toString();
		const url_cacheBuster = '';
		req.url = url_proto_SSL + url_base + url_cacheBuster; 
		const au = document.querySelector('#aboutupdate');
		if (!au)
			return;
		au.innerHTML = globalize.translate('LabelUpdateSearching');
		
		this._busy = true;
		const self = this;
		loading.show();	
		
		ajax(req).then(function (data) {
			if (appInfo.version >= data.version) {
				au.style.fontWeight = "400";
				au.innerHTML = globalize.translate('LabelUpdateOK');
			} else {
				au.style.fontWeight = "600";
				au.innerHTML = globalize.translate('LabelUpdateNOK', data.version);
			}
		}).catch(function (data) {
			au.style.fontWeight = "600";
			au.innerHTML = globalize.translate('LabelUpdateERR');
		}).finally(() => {
			self._busy = false;
			loading.hide();
		});
	}
}

export default AboutTab;

