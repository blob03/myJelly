/* eslint-disable indent */

/**
 * Module for media library editor.
 * @module components/mediaLibraryEditor/mediaLibraryEditor
 */

import 'jquery';
import loading from '../loading/loading';
import dialogHelper from '../dialogHelper/dialogHelper';
import dom from '../../scripts/dom';
import libraryoptionseditor from '../libraryoptionseditor/libraryoptionseditor';
import globalize from '../../scripts/globalize';
import '../../elements/emby-button/emby-button';
import '../listview/listview.scss';
import '../../elements/emby-button/paper-icon-button-light';
import '../formdialog.scss';
import '../../elements/emby-toggle/emby-toggle';
import '../../assets/css/flexstyles.scss';
import toast from '../toast/toast';
import confirm from '../confirm/confirm';
import template from './mediaLibraryEditor.template.html';

    function onEditLibrary() {
        if (isCreating) {
            return false;
        }

        isCreating = true;
        loading.show();
        const dlg = dom.parentWithClass(this, 'dlg-libraryeditor');
        let libraryOptions = libraryoptionseditor.getLibraryOptions(dlg.querySelector('.libraryOptions'));
        libraryOptions = Object.assign(currentOptions.library.LibraryOptions || {}, libraryOptions);
        ApiClient.updateVirtualFolderOptions(currentOptions.library.ItemId, libraryOptions).then(() => {
            hasChanges = true;
            isCreating = false;
            loading.hide();
            dialogHelper.close(dlg);
        }, () => {
            isCreating = false;
            loading.hide();
        });
        return false;
    }

    function addMediaLocation(page, path, networkSharePath) {
        const virtualFolder = currentOptions.library;
        const refreshAfterChange = currentOptions.refresh;
        ApiClient.addMediaPath(virtualFolder.Name, path, networkSharePath, refreshAfterChange).then(() => {
            hasChanges = true;
            refreshLibraryFromServer(page);
        }, () => {
            toast(globalize.translate('ErrorAddingMediaPathToVirtualFolder'));
        });
    }

    function updateMediaLocation(page, path, networkSharePath) {
        const virtualFolder = currentOptions.library;
        ApiClient.updateMediaPath(virtualFolder.Name, {
            Path: path,
            NetworkPath: networkSharePath
        }).then(() => {
            hasChanges = true;
            refreshLibraryFromServer(page);
        }, () => {
            toast(globalize.translate('ErrorAddingMediaPathToVirtualFolder'));
        });
    }

    function onRemoveClick(btnRemovePath, location) {
        const button = btnRemovePath;
        const virtualFolder = currentOptions.library;

        confirm({
            title: globalize.translate('HeaderRemoveMediaLocation'),
            text: globalize.translate('MessageConfirmRemoveMediaLocation'),
            confirmText: globalize.translate('Delete'),
            primary: 'delete'
        }).then(() => {
            const refreshAfterChange = currentOptions.refresh;
            ApiClient.removeMediaPath(virtualFolder.Name, location, refreshAfterChange).then(() => {
                hasChanges = true;
                refreshLibraryFromServer(dom.parentWithClass(button, 'dlg-libraryeditor'));
            }, () => {
                toast(globalize.translate('ErrorDefault'));
            });
        });
    }

    function onListItemClick(e) {
        const listItem = dom.parentWithClass(e.target, 'listItem');

        if (listItem) {
            const index = parseInt(listItem.getAttribute('data-index'));
            const pathInfos = (currentOptions.library.LibraryOptions || {}).PathInfos || [];
            const pathInfo = index == null ? {} : pathInfos[index] || {};
            const originalPath = pathInfo.Path || (index == null ? null : currentOptions.library.Locations[index]);
            const btnRemovePath = dom.parentWithClass(e.target, 'btnRemovePath');

            if (btnRemovePath) {
                onRemoveClick(btnRemovePath, originalPath);
                return;
            }

            showDirectoryBrowser(dom.parentWithClass(listItem, 'dlg-libraryeditor'), originalPath, pathInfo.NetworkPath);
        }
    }

    function getFolderHtml(pathInfo, index) {
        let html = '';
        html += `<div class="listItem listItem-border lnkPath" data-index="${index}" style="padding-left:.5em;">`;
        html += `<div class="${pathInfo.NetworkPath ? 'listItemBody two-line' : 'listItemBody'}">`;
        html += '<h3 class="listItemBodyText">';
        html += pathInfo.Path;
        html += '</h3>';

        if (pathInfo.NetworkPath) {
            html += `<div class="listItemBodyText secondary">${pathInfo.NetworkPath}</div>`;
        }

        html += '</div>';
        html += `<button type="button" is="paper-icon-button-light" class="listItemButton btnRemovePath" data-index="${index}"><span class="material-icons remove_circle"></span></button>`;
        html += '</div>';
        return html;
    }

    function refreshLibraryFromServer(page) {
        ApiClient.getVirtualFolders().then(result => {
            const library = result.filter(f => {
                return f.Name === currentOptions.library.Name;
            })[0];

            if (library) {
                currentOptions.library = library;
                renderLibrary(page, currentOptions);
            }
        });
    }

    function renderLibrary(page, options) {
        let pathInfos = (options.library.LibraryOptions || {}).PathInfos || [];

        if (!pathInfos.length) {
            pathInfos = options.library.Locations.map(p => {
                return {
                    Path: p
                };
            });
        }

        if (options.library.CollectionType === 'boxsets') {
            page.querySelector('.folders').classList.add('hide');
        } else {
            page.querySelector('.folders').classList.remove('hide');
        }

        page.querySelector('.folderList').innerHTML = pathInfos.map(getFolderHtml).join('');
    }

    function onAddButtonClick() {
        showDirectoryBrowser(dom.parentWithClass(this, 'dlg-libraryeditor'));
    }

    function showDirectoryBrowser(context, originalPath, networkPath) {
        import('../directorybrowser/directorybrowser').then(({default: directoryBrowser}) => {
            const picker = new directoryBrowser();
            picker.show({
                enableNetworkSharePath: true,
                pathReadOnly: originalPath != null,
                path: originalPath,
                networkSharePath: networkPath,
                callback: function (path, networkSharePath) {
                    if (path) {
                        if (originalPath) {
                            updateMediaLocation(context, originalPath, networkSharePath);
                        } else {
                            addMediaLocation(context, path, networkSharePath);
                        }
                    }

                    picker.close();
                }
            });
        });
    }

    function initEditor(dlg, options) {
        renderLibrary(dlg, options);
        dlg.querySelector('.btnAddFolder').addEventListener('click', onAddButtonClick);
        dlg.querySelector('.folderList').addEventListener('click', onListItemClick);
        dlg.querySelector('.btnSubmit').addEventListener('click', onEditLibrary);
        libraryoptionseditor.embed(dlg.querySelector('.libraryOptions'), options.library.CollectionType, options.library.LibraryOptions);
    }

    function onDialogClosed() {
        currentDeferred.resolveWith(null, [hasChanges]);
    }

export class showEditor {
    constructor(options) {
        const deferred = jQuery.Deferred();
        currentOptions = options;
        currentDeferred = deferred;
        hasChanges = false;
        const dlg = dialogHelper.createDialog({
            size: 'small',
            modal: false,
            removeOnClose: true,
            scrollY: false
        });
        dlg.classList.add('dlg-libraryeditor');
        dlg.classList.add('ui-body-a');
        dlg.classList.add('background-theme-a');
        dlg.classList.add('formDialog');
        dlg.innerHTML = globalize.translateHtml(template);
        dlg.querySelector('.formDialogHeaderTitle').innerHTML = options.library.Name;
        initEditor(dlg, options);
        dlg.addEventListener('close', onDialogClosed);
        dialogHelper.open(dlg);
        dlg.querySelector('.btnCancel').addEventListener('click', () => {
            dialogHelper.close(dlg);
        });
        refreshLibraryFromServer(dlg);
        return deferred.promise();
    }
}

    let currentDeferred;
    let currentOptions;
    let hasChanges = false;
    let isCreating = false;

/* eslint-enable indent */
export default showEditor;
