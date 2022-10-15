/**
 * Module that displays an editor for changing SyncPlay settings.
 * @module components/syncPlay/settings/SettingsEditor
 */

import SyncPlay from '../../core';
import { getSetting, setSetting } from '../../core/Settings';
import dialogHelper from '../../../../components/dialogHelper/dialogHelper';
import layoutManager from '../../../../components/layoutManager';
import loading from '../../../../components/loading/loading';
import toast from '../../../../components/toast/toast';
import globalize from '../../../../scripts/globalize';
import Events from '../../../../utils/events.ts';

import { toBoolean, toFloat } from '../../../../utils/string.ts';

import 'material-design-icons-iconfont';
import '../../../../elements/emby-input/emby-input';
import '../../../../elements/emby-select/emby-select';
import '../../../../elements/emby-button/emby-button';
import '../../../../elements/emby-button/paper-icon-button-light';
import '../../../../elements/emby-checkbox/emby-checkbox';
import '../../../../components/listview/listview.scss';
import '../../../../components/formdialog.scss';

function centerFocus(elem, horiz, on) {
    import('../../../../scripts/scrollHelper').then((scrollHelper) => {
        const fn = on ? 'on' : 'off';
        scrollHelper.centerFocus[fn](elem, horiz);
    });
}

/**
 * Class that displays an editor for changing SyncPlay settings.
 */
class SettingsEditor {
    constructor(apiClient, timeSyncCore, options = {}) {
        this.apiClient = apiClient;
        this.timeSyncCore = timeSyncCore;
        this.options = options;
    }

    async embed() {
        const dialogOptions = {
            removeOnClose: true,
            scrollY: true
        };

        if (layoutManager.tv) {
            dialogOptions.size = 'fullscreen';
        } else {
            dialogOptions.size = 'small';
        }

        this.context = dialogHelper.createDialog(dialogOptions);
        this.context.classList.add('formDialog');

        const { default: editorTemplate } = await import('./editor.html');
        this.context.innerHTML = globalize.translateHtml(editorTemplate, 'core');
 
        this.context.querySelector('.btnCancel').addEventListener('click', () => {
            dialogHelper.close(this.context);
        });

		loading.show();
        await this.initEditor();
		loading.hide();
		
        return dialogHelper.open(this.context).then(() => {
            if (layoutManager.tv) {
                centerFocus(this.context.querySelector('.formDialogContent'), false, false);
            }

            if (this.context.submitted) {
                return Promise.resolve();
            }

            return Promise.reject();
        });
    }

    async initEditor() {
        const { context } = this;

        context.querySelector('#txtExtraTimeOffset').value = toFloat(getSetting('extraTimeOffset'), 0.0);
        context.querySelector('#chkSyncCorrection').checked = toBoolean(getSetting('enableSyncCorrection'), true);
        context.querySelector('#txtMinDelaySpeedToSync').value = toFloat(getSetting('minDelaySpeedToSync'), 60.0);
        context.querySelector('#txtMaxDelaySpeedToSync').value = toFloat(getSetting('maxDelaySpeedToSync'), 3000.0);
        context.querySelector('#txtSpeedToSyncDuration').value = toFloat(getSetting('speedToSyncDuration'), 1000.0);
        context.querySelector('#txtMinDelaySkipToSync').value = toFloat(getSetting('minDelaySkipToSync'), 400.0);
        context.querySelector('#chkSpeedToSync').checked = toBoolean(getSetting('useSpeedToSync'), true);
        context.querySelector('#chkSkipToSync').checked = toBoolean(getSetting('useSkipToSync'), true);
		
		// Set callbacks for form submission
        this.context.querySelector('form').addEventListener('submit', (event) => {
            // Disable default form submission
            if (event) {
                event.preventDefault();
            }
            return false;
        });

		this.context.querySelector('.btnSave').addEventListener('click', () => {
            this.onSubmit();
        });

		this.context.querySelector('#chkSyncCorrection').addEventListener('change', (ev) => {
			let me = ev.target;
             if (me.checked) {
				this.context.querySelector('#chkSpeedToSync').parentNode.parentNode.classList.remove('hide');
				this.context.querySelector('#chkSkipToSync').parentNode.parentNode.classList.remove('hide');
				let event = new Event('change');
				this.context.querySelector('#chkSpeedToSync').dispatchEvent(event);
			 } else {
				this.context.querySelector('#chkSpeedToSync').parentNode.parentNode.classList.add('hide');
				this.context.querySelector('#chkSkipToSync').parentNode.parentNode.classList.add('hide');
				this.context.querySelector('#txtMinDelaySpeedToSync').parentNode.classList.add('hide');
				this.context.querySelector('#txtMaxDelaySpeedToSync').parentNode.classList.add('hide');
				this.context.querySelector('#txtSpeedToSyncDuration').parentNode.classList.add('hide');
			 }
        });

		this.context.querySelector('#chkSpeedToSync').addEventListener('change', (ev) => {
			let me = ev.target;
             if (me.checked) {
				this.context.querySelector('#txtMinDelaySpeedToSync').parentNode.classList.remove('hide');
				this.context.querySelector('#txtMaxDelaySpeedToSync').parentNode.classList.remove('hide');
				this.context.querySelector('#txtSpeedToSyncDuration').parentNode.classList.remove('hide');
			 } else {
				this.context.querySelector('#txtMinDelaySpeedToSync').parentNode.classList.add('hide');
				this.context.querySelector('#txtMaxDelaySpeedToSync').parentNode.classList.add('hide');
				this.context.querySelector('#txtSpeedToSyncDuration').parentNode.classList.add('hide');
			 }
        });
		
		let event = new Event('change');
		this.context.querySelector('#chkSpeedToSync').dispatchEvent(event);
		this.context.querySelector('#chkSyncCorrection').dispatchEvent(event);
		
        if (layoutManager.tv) {
            centerFocus(this.context.querySelector('.formDialogContent'), false, true);
        }
    }

    onSubmit() {
        this.save();
        dialogHelper.close(this.context);
    }

    async save() {
        loading.show();
        await this.saveToAppSettings();
        loading.hide();
        toast(globalize.translate('SettingsSaved'));
        Events.trigger(this, 'saved');
    }

    async saveToAppSettings() {
        const { context } = this;

        const extraTimeOffset = context.querySelector('#txtExtraTimeOffset').value;
        const syncCorrection = context.querySelector('#chkSyncCorrection').checked;
        const minDelaySpeedToSync = context.querySelector('#txtMinDelaySpeedToSync').value;
        const maxDelaySpeedToSync = context.querySelector('#txtMaxDelaySpeedToSync').value;
        const speedToSyncDuration = context.querySelector('#txtSpeedToSyncDuration').value;
        const minDelaySkipToSync = context.querySelector('#txtMinDelaySkipToSync').value;
        const useSpeedToSync = context.querySelector('#chkSpeedToSync').checked;
        const useSkipToSync = context.querySelector('#chkSkipToSync').checked;

        setSetting('extraTimeOffset', extraTimeOffset);
        setSetting('enableSyncCorrection', syncCorrection);
        setSetting('minDelaySpeedToSync', minDelaySpeedToSync);
        setSetting('maxDelaySpeedToSync', maxDelaySpeedToSync);
        setSetting('speedToSyncDuration', speedToSyncDuration);
        setSetting('minDelaySkipToSync', minDelaySkipToSync);
        setSetting('useSpeedToSync', useSpeedToSync);
        setSetting('useSkipToSync', useSkipToSync);

        Events.trigger(SyncPlay.Manager, 'settings-update');
    }
}

export default SettingsEditor;
