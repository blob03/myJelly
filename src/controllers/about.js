import { appRouter } from '../components/appRouter';
import cardBuilder from '../components/cardbuilder/cardBuilder';
import dom from '../scripts/dom';
import globalize from '../scripts/globalize';
import { appHost } from '../components/apphost';
import layoutManager from '../components/layoutManager';
import browser from '../scripts/browser';
import focusManager from '../components/focusManager';
import '../elements/emby-itemscontainer/emby-itemscontainer';
import '../elements/emby-scroller/emby-scroller';
import ServerConnections from '../components/ServerConnections';
import packageInfo from '../../package.json';

class AboutTab {
    constructor(view, params) {
        this.view = view;
        this.params = params;
        this.sectionsContainer = view.querySelector('.sections');
		let html = '<div class="abouttab" style="display: flex !important;width: 100%;height: 10em;flex-direction: column;align-items: center;justify-content: space-around;font-weight: 600;margin: 3em 0 0 0 !important;">';
		html += '<div> ' + globalize.translate('LabelName') + ' <span style="font-weight:400;" class="aboutcontent">' + packageInfo.name + '</span></div>';
		html += '<div> ' + globalize.translate('AppDesc') + ' <span style="font-weight:400;font-style: italic;" class="aboutcontent">' + packageInfo.description + '</span></div>';
		html += '<div> ' + globalize.translate('LabelVersion') + ' <span style="font-weight:400;" class="aboutcontent">' + packageInfo.version + '</span></div>';
		if (browser.tv || layoutManager.tv) {
			html += '<div> ' + globalize.translate('AppRepositoryName') + ' <span style="font-weight:400;" class="aboutcontent">' + packageInfo.repository + '</span></div>';
			html += '<div> ' + globalize.translate('AppContact') + ' <span style="font-weight:400;" class="aboutcontent">' + packageInfo.contact + '</span></div>';
		} else {
			html += '<div> ' + globalize.translate('AppRepositoryName') + ' <span><a is="emby-linkbutton" style="font-weight:400;" rel="noopener noreferrer" class="aboutcontent button-link emby-button" target="_blank" href="' + packageInfo.repository + '">' + packageInfo.repository + '</a></span></div>';
			html += '<div> ' + globalize.translate('AppContact') + ' <span><a rel="noopener noreferrer" style="font-weight:400;" class="aboutcontent button-link emby-button" href="mailto:' + packageInfo.contact + '">' + packageInfo.contact + '</a></span></div>';
		}
		html += '</div>';
		this.sectionsContainer.innerHTML += html;
    }
	
	onResume(options) {
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

