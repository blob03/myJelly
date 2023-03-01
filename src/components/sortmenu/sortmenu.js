import dialogHelper from '../dialogHelper/dialogHelper';
import layoutManager from '../layoutManager';
import globalize from '../../scripts/globalize';
import * as userSettings from '../../scripts/settings/userSettings';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-button/paper-icon-button-light';
import 'material-design-icons-iconfont';
import '../formdialog.scss';
import '../../elements/emby-button/emby-button';
import '../../styles/flexstyles.scss';
import template from './sortmenu.template.html';

function onSubmit(e) {
    e.preventDefault();
    return false;
}

function initEditor(context, settings, settingsKey, setSortValues) {
	if (!context || !settings)
		return;
	if (setSortValues) {
		context.querySelector('form').addEventListener('submit', onSubmit);
		context.querySelector('.selectSortOrder').value = settings.SortOrder;
		context.querySelector('.selectSortBy').value = settings.SortBy;
    } else {
        context.querySelector('.selectSortOrder').value = userSettings.getFilter(settingsKey + '-sortorder');
        context.querySelector('.selectSortBy').value = userSettings.getFilter(settingsKey + '-sortby');
    }
}

function centerFocus(elem, horiz, on) {
    import('../../scripts/scrollHelper').then((scrollHelper) => {
        const fn = on ? 'on' : 'off';
        scrollHelper.centerFocus[fn](elem, horiz);
    });
}

function fillSortBy(context, options) {
    const selectSortBy = context.querySelector('.selectSortBy');

    selectSortBy.innerHTML = options.map(function (o) {
        return '<option value="' + o.value + '">' + o.name + '</option>';
    }).join('');
}

function resetValues(context, options) {
	if (!context || !(options?.sortOptions?.length))
		return;
	
	context.querySelector('.selectSortBy').value = options.sortOptions[0].value;
	context.querySelector('.selectSortOrder').value = 'Ascending';
}

function checkValues(options) {
	if (!(options?.sortOptions?.length))
		return false;
	
	if (options.settings.SortBy !== options.sortOptions[0].value || options.settings.SortOrder !== 'Ascending')
		return true;
	
	return false;
}

function saveValues(context, settingsKey, setSortValues) {
    if (setSortValues) {
        setSortValues((prevState) => ({
            ...prevState,
            StartIndex: 0,
            SortBy: context.querySelector('.selectSortBy').value,
            SortOrder: context.querySelector('.selectSortOrder').value
        }));
    } else {
        userSettings.setFilter(settingsKey + '-sortorder', context.querySelector('.selectSortOrder').value);
        userSettings.setFilter(settingsKey + '-sortby', context.querySelector('.selectSortBy').value);
    }
}

class SortMenu {
	inUse(options) {
		return checkValues(options);
	}
    show(options) {
        return new Promise(function (resolve, reject) {
            const dialogOptions = {
                removeOnClose: true,
                scrollY: false
            };

            if (layoutManager.tv) {
                dialogOptions.size = 'fullscreen';
            } else {
                dialogOptions.size = 'small';
            }

            const dlg = dialogHelper.createDialog(dialogOptions);

            dlg.classList.add('formDialog');

            let html = '';
            html += '<div class="formDialogHeader">';
			html += `<button is="paper-icon-button-light" class="btnReset hide-mouse-idle-tv" tabindex="-1" title="${globalize.translate('ButtonReset')}"><span class="material-icons restart_alt" aria-hidden="true"></span></button>`;
            html += `<button is="paper-icon-button-light" class="btnCancel hide-mouse-idle-tv" tabindex="-1" title="${globalize.translate('ButtonBack')}"><span class="material-icons arrow_back" aria-hidden="true"></span></button>`;
            html += '<h3 class="formDialogHeaderTitle">${Sort}</h3>';
            html += '</div>';
            html += template;

            dlg.innerHTML = globalize.translateHtml(html, 'core');

            fillSortBy(dlg, options.sortOptions);
            initEditor(dlg, options.settings, options.settingsKey, options.setSortValues);

            dlg.querySelector('.btnCancel').addEventListener('click', function () {
                dialogHelper.close(dlg);
            });
			dlg.querySelector('.btnReset').addEventListener('click', function () {
                resetValues(dlg, options);
				submitted = true;
            });

            if (layoutManager.tv) {
                centerFocus(dlg.querySelector('.formDialogContent'), false, true);
            }

            let submitted;

            dlg.querySelector('form').addEventListener('change', function () {
                submitted = true;
            }, true);

            dialogHelper.open(dlg).then(function () {
                if (layoutManager.tv) {
                    centerFocus(dlg.querySelector('.formDialogContent'), false, false);
                }

                if (submitted) {
                    saveValues(dlg, options.settingsKey, options.setSortValues);
                    resolve();
                    return;
                }

                reject();
            });
        });
    }
}

export default SortMenu;
