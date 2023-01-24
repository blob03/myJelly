import globalize from '../scripts/globalize';
import { appHost } from '../components/apphost';
import layoutManager from '../components/layoutManager';
import { ajax } from '../components/fetchhelper';
import loading from '../components/loading/loading';
import browser from '../scripts/browser';
import ServerConnections from '../components/ServerConnections';
import appSettings from '../scripts/settings/appSettings';
import appInfo from '../version.json';
import Dashboard from '../utils/dashboard';
import './about.scss';

function getHostVersion(browser) {
	if (browser.web0s) {
		let ver = 'WebOS';
		const x = browser.web0sVersion;
		if (x !== undefined)
			ver += ' ' + x;
		return ver;
	}
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
		
		let html = '<div class="abouttab" style="display: flex;align-items: center;justify-content: center;">';
		
		html += '<div class="paperList aboutframe">';
		html += '<div><center><span class="aboutTitle1 aboutContent">' + appInfo.name + '</span></center></div>';
		html += '<div><center><span class="aboutTitle2 aboutContent">' + globalize.translate(appInfo.description) + '</span></center></div>';
		html += '<br>';
		html += '<div style="display: flex">';
		html += '<div class="aboutLabel">' + globalize.translate('LabelAppHost') + '</div>';
		html += '<div class="aboutContent">';
		if (layoutManager.mobile)
			html += globalize.translate('Mobile') + ' / ';
		else if (layoutManager.tv) 
			html += globalize.translate('TV') + ' / ';
		else if (layoutManager.desktop) 
			html += globalize.translate('Desktop') + ' / ';
		html += appHost.deviceName() + ' - ' + getHostVersion(browser);
		html += '</div>';	
		html += '</div>';
		html += '<div style="display: flex">';
		html += '<div class="aboutLabel">' + globalize.translate('LabelAppVersion') + '</div>';
		html += '<div class="aboutContent">' + appInfo.version + '</div>';
		html += '</div>';
		
		html += '<div style="display: flex">';
		html += '<button type="button" is="emby-button" class="emby-button headerButton autosearchButton" style="padding: 0;margin: 0;background: none;">';
		html += '<span id="autosearch" class="aboutContent material-icons search" title="';
		html += globalize.translate('LabelUpdatesAutoCheck') + '"></span></button>';
		html += '<div id="labelUpdate" class="aboutLabel" style="opacity:100%">' + globalize.translate('LabelUpdate') + ' </div>'; 
		html += '<div id="aboutupdate" class="aboutContent"></div>';
		html += '</div>';
		
		html += '<div class="selectContainer" style="width: 100%;height: auto;margin-bottom: 0.5rem !important;">';
		html += '<label class="selectLabel" for="selectReleaseNotes">' + globalize.translate('LabelReleaseNotes') + '</label>';
		html += '<select is="emby-select" id="selectReleaseNotes" class="emby-select-withcolor emby-select">';
		html += '</select>';
		
		html += '<div class="selectArrowContainer">';
		html += '<div style="visibility:hidden;display:none;">0</div>';
		html += '<span class="selectArrow material-icons keyboard_arrow_down"></span>';
		html += '</div>';
		html += '</div>';
		html += '<div><textarea readonly dir="ltr" is="emby-textarea" id="txtRNotes" class="textarea-mono emby-textarea" style="box-sizing: border-box;width: 100%;padding: .3rem .5rem .3rem .5rem;resize: vertical;font-size: .75rem;font-family: Inconsolata-Light;"></textarea></div>';
		
		html += '<div style="display: flex">';
		html += '<div class="aboutLabel">' + globalize.translate('LabelAppRepositoryName') + '</div>';
		
		if (browser.tv || layoutManager.tv) {
			html += '<div class="aboutContent">' + appInfo.repository + '</div></div>';
			html += '<br>';
			html += '<div style="display: flex;align-items: center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="' + globalize.translate('LabelEmail') + '"></span><br><span class="aboutContent">' + appInfo.contact + '</span></div>';
		} else {
			html += '<div><a is="emby-linkbutton" rel="noopener noreferrer" class="aboutContent button-link emby-button" target="_blank" href="' + appInfo.repository + '">' + appInfo.repository + '</a></div></div>';
			html += '<br>';
			html += '<div style="display: flex;align-items: center;justify-content: center;font-size: 80%;"><span class="aboutContent material-icons email" title="' + globalize.translate('LabelEmail') + '"></span><br><span><a rel="noopener noreferrer" class="aboutContent button-link emby-button" href="mailto:' + appInfo.contact + '">' + appInfo.contact + '</a></span></div>';
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
			
			selectRnotes.addEventListener('change', function(e) { 
				let _version = e.target.value;
				let _txtarea = self.view.querySelector('#txtRNotes');
				if (_txtarea && typeof self.releaseNotes[_version] === 'string') {
					let _rows = self.releaseNotes[_version].split(/\r\n|\r|\n/).length + 1;
					_rows = Math.min(_rows, 6);
					_txtarea.rows = _rows;
					_txtarea.value = self.releaseNotes[_version];
				}
			});
			
			let headerAutosearchButton = self.sectionsContainer.querySelector('.autosearchButton');
			if (headerAutosearchButton) {
				self.refreshAutosearch();
				headerAutosearchButton.addEventListener('click', self.switchAutosearch.bind(self));
			}
			
			self.updateReleaseNotes(appInfo);
		});
    }

	switchAutosearch() {
		const autosearchIcon = document.querySelector('#autosearch');
		if (autosearchIcon) {
			if (appSettings.enableAutosearch() === false) {
				appSettings.enableAutosearch(true);
				this.refreshAutosearch();
				this.checkUpdates();
			} else {
				if (this._busy === true) {
					clearInterval(this._contimeout);
					loading.hide();
					this._busy = false;
				}
				appSettings.enableAutosearch(false);
				this.refreshAutosearch();
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
		const _changeEvt = new Event('change');
		this.vers.dispatchEvent(_changeEvt);
	}

	refreshAutosearch() {
		const autosearchIcon = document.getElementById("autosearch");
		if (autosearchIcon) {
			if (appSettings.enableAutosearch() === false) {
				this.au.innerHTML = '';
				document.querySelector('#labelUpdate').style.opacity = .5;
				autosearchIcon.classList.remove('search');
				autosearchIcon.classList.add('search_off');
			} else {
				document.querySelector('#labelUpdate').style.opacity = 1;
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
	
	cmp(x, y) {
		const remote = x.split('-');
		const local = y.split('-');
		
		if (remote[0] > local[0])
			return true;
		if (remote[0] === local[0]) {
			if (parseInt(remote[1] || '0', 10) > parseInt(local[1] || '0', 10))
				return true;
			return false;
		}
		return false;
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
				if (self.cmp(data.version, appInfo.version)) {
					self.au.style.fontWeight = "600";
					self.au.innerHTML = globalize.translate('LabelUpdateNOK', data.version);
					self.releaseNotes = data.releaseNotes;
					self.updateReleaseNotes(data);
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

