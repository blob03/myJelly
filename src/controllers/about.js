import globalize from '../scripts/globalize';
import { appHost } from '../components/apphost';
import layoutManager from '../components/layoutManager';
import { ajax } from '../components/fetchhelper';
import loading from '../components/loading/loading';
import browser from '../scripts/browser';
import ServerConnections from '../components/ServerConnections';
import appSettings from '../scripts/settings/appSettings';
import appInfo from '../version.json';

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
		this.currentUser = '';
		const self = this;
		
		let html = '<div class="abouttab" style="display: flex !important;width: 100%;height: 10em;flex-direction: column;align-items: center;justify-content: space-around;margin: 6rem 0 0 0 !important;">';
		html += '<div class="paperList aboutframe" style="padding: 1em;background: rgba(0, 0, 0, 0.15);position: fixed;top: 20%;left: 0%;right: 0px;width: 30rem;">';
		html += '<div><center><span style="font-weight: 400;font-size: 200%;font-family: Quicksand-Regular;" class="aboutcontent">' + appInfo.name + '</span></center></div>';
		html += '<div><center><span style="font-weight: 400;font-style: italic;font-family: Quicksand-Regular;" class="aboutcontent">' + globalize.translate(appInfo.description) + '</span></center></div>';
		html += '<br>';
		html += '<div> ' + globalize.translate('LabelAppHost') + ' <span style="font-weight:400;" class="aboutcontent">' + appHost.deviceName() + ' - ' + getHostVersion(browser)  + '</span></div>';
		html += '<div> ' + globalize.translate('LabelAppVersion') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.version + '</span></div>';
		
		html += '<div> ';
		html += '<button type="button" is="emby-button" class="emby-button headerButton autosearchButton" style="padding: 0;margin: 0;background: none;">';
		html += '<span id="autosearch" class="aboutContent material-icons search" title="';
		html += globalize.translate('LabelUpdatesAutoCheck') + '" style="color: #c1dede;font-size: 1.5rem;margin: 0 .5rem 0 0;"></span></button>';
		html += globalize.translate('LabelUpdate') + ' <span style="font-weight:400;" id="aboutupdate" class="aboutcontent"></span>';
		html += '</div> ';
		
		html += '<div class="selectContainer" style="width: 100%;height: auto;margin-bottom: 0.5rem !important;">';
		html += '<label class="selectLabel" for="selectReleaseNotes">' + globalize.translate('LabelReleaseNotes') + '</label>';
		html += '<select is="emby-select" id="selectReleaseNotes" class="emby-select-withcolor emby-select">';
		html += '</select>';
		
		html += '<div class="selectArrowContainer">';
		html += '<div style="visibility:hidden;display:none;">0</div>';
		html += '<span class="selectArrow material-icons keyboard_arrow_down"></span>';
		html += '</div>';
		html += '</div>';
		html += '<div><textarea readonly is="emby-textarea" id="txtRNotes" class="textarea-mono emby-textarea" style="box-sizing: border-box;width: 100%;padding: .3rem .5rem .3rem .5rem;resize: vertical;font-size: .85rem;font-family: Inconsolata-Light;"></textarea></div>';			
		
		if (browser.tv || layoutManager.tv) {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span style="font-weight:400;" class="aboutcontent">' + appInfo.repository + '</span></div>';
			html += '<br>';
			html += '<div style="display:flex;align-items:center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="' + globalize.translate('LabelEmail') + '" style="color: #c1dede;font-size: 1.5rem;margin: 0 .5rem 0 0;"></span><br><span style="font-weight:400;" class="aboutcontent">' + appInfo.contact + '</span></div>';
		} else {
			html += '<div> ' + globalize.translate('LabelAppRepositoryName') + ' <span><a is="emby-linkbutton" style="font-weight:400;" rel="noopener noreferrer" class="aboutcontent button-link emby-button" target="_blank" href="' + appInfo.repository + '">' + appInfo.repository + '</a></span></div>';
			html += '<br>';
			html += '<div style="display:flex;align-items:center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="' + globalize.translate('LabelEmail') + '" style="color: #c1dede;font-size: 1.5rem;margin: 0 .5rem 0 0;"></span><br><span><a rel="noopener noreferrer" style="font-weight:400;" class="aboutcontent button-link emby-button" href="mailto:' + appInfo.contact + '">' + appInfo.contact + '</a></span></div>';
		}
		html += '</div>';
		html += '</div>';
		this.sectionsContainer.innerHTML = html;
		
		const currentApiClient = ServerConnections.getLocalApiClient();
		ServerConnections.user(currentApiClient).then(function (user) {
            self.currentUser = user;
			self.au = self.sectionsContainer.querySelector('#aboutupdate');
			self.releaseNotes = appInfo.releaseNotes;
			const selectRnotes = self.sectionsContainer.querySelector('#selectReleaseNotes');
			self.vers = selectRnotes;
			
			self.updateReleaseNotes(appInfo);
			
			let headerAutosearchButton = self.sectionsContainer.querySelector('.autosearchButton');
			if (headerAutosearchButton) {
				self.refreshAutosearch();
				headerAutosearchButton.addEventListener('click', self.switchAutosearch.bind(self));
			}
			
			selectRnotes.addEventListener('change', function(e) { 
				let _version = e.target.value;
				let _txtarea = self.view.querySelector('#txtRNotes');
				if (_txtarea && self.releaseNotes[_version]) {
					let _rows = self.releaseNotes[_version].split(/\r\n|\r|\n/).length + 1;
					_rows = _rows < 10 ? _rows : 10;
					_txtarea.rows = _rows;
					_txtarea.value = self.releaseNotes[_version];
				}
			});
			
			let event_change = new Event('change');
			selectRnotes.dispatchEvent(event_change);
		});
    }

	switchAutosearch() {
		const autosearchIcon = document.getElementById("autosearch");
		if (autosearchIcon) {
			if (appSettings.enableAutosearch() === false) {
				autosearchIcon.classList.remove('search_off');
				autosearchIcon.classList.add('search');
				appSettings.enableAutosearch(true);
				this.checkUpdates();
			} else {
				if (this._contimeout)
					clearInterval(this._contimeout);
				this.au.innerHTML = '';
				autosearchIcon.classList.remove('search');
				autosearchIcon.classList.add('search_off');
				appSettings.enableAutosearch(false);
				this.updateReleaseNotes(appInfo);
			}
		}					
	}
	
	updateReleaseNotes(src) {
		let _html = '';
		let _releases = Object.keys(src.releaseNotes);
		_releases.reverse().forEach(_version => {
			_html += '<option';
			_html += (_version === src.version)? ' selected ': ' ';
			_html += 'value="' + _version + '">' + _version + '</option>';
		});
		this.vers.innerHTML = _html;
	}

	refreshAutosearch() {
		const autosearchIcon = document.getElementById("autosearch");
		if (autosearchIcon) {
			if (appSettings.enableAutosearch() === false) {
				autosearchIcon.classList.remove('search');
				autosearchIcon.classList.add('search_off');
			} else {
				autosearchIcon.classList.remove('search_off');
				autosearchIcon.classList.add('search');
			}
		}
	}
	
	onResume(options) {
		const currentApiClient = ServerConnections.getLocalApiClient();
		const self = this;
		ServerConnections.user(currentApiClient).then(function (user) {
			self.currentUser = user;			
			if (appSettings.enableAutosearch() === false)
				self.au.innerHTML = '';
			else
				self.checkUpdates();
		});
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
		const url_base = 'blob03.github.io/myJelly/src/version.json';	
		//const url_cacheBuster = '?_=' + Date.now().toString();
		const url_cacheBuster = '';
		req.url = url_proto_SSL + url_base + url_cacheBuster; 
		if (!this.au || !this.vers)
			return;
		
		loading.show();	
		if (this._busy === true)
			return;
		this._busy = true;
		const self = this;
		this._contimeout = setTimeout(() => {
			self.au.innerHTML = globalize.translate('LabelUpdateSearching');}, 3000);
		
		ajax(req).then(function (data) {
			clearInterval(self._contimeout);
			if (appSettings.enableAutosearch() !== false) {
				if (data.version > appInfo.version) {
					self.au.style.fontWeight = "600";
					self.au.innerHTML = globalize.translate('LabelUpdateNOK', data.version);
					self.releaseNotes = data.releaseNotes;
					self.updateReleaseNotes(data);
					let echange = new Event('change');
					self.vers.dispatchEvent(echange);
				} else {
					self.au.style.fontWeight = "400";
					self.au.innerHTML = globalize.translate('LabelUpdateOK');
				}
			}
		}).catch(function (data) {
			clearInterval(self._contimeout);
			if (appSettings.enableAutosearch() !== false) {
				console.warn(data);
				self.au.style.fontWeight = "600";
				self.au.innerHTML = globalize.translate('LabelUpdateERR');
			}
		}).finally(() => {
			self._busy = false;
			loading.hide();
		});
	}
}

export default AboutTab;

