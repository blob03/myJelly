import escapeHtml from 'escape-html';
import dom from '../../scripts/dom';
import focusManager from '../focusManager';
import dialogHelper from '../dialogHelper/dialogHelper';
import inputManager from '../../scripts/inputManager';
import layoutManager from '../layoutManager';
import globalize from '../../scripts/globalize';
import * as userSettings from '../../scripts/settings/userSettings';
import '../../elements/emby-checkbox/emby-checkbox';
import '../../elements/emby-input/emby-input';
import '../../elements/emby-button/emby-button';
import '../../elements/emby-button/paper-icon-button-light';
import '../../elements/emby-select/emby-select';
import 'material-design-icons-iconfont';
import '../formdialog.scss';
import '../../styles/flexstyles.scss';
import ServerConnections from '../ServerConnections';
import template from './filtermenu.template.html';
import { toBoolean } from '../../utils/string.ts';

function onSubmit(e) {
    e.preventDefault();
    return false;
}
function renderOptions(context, selector, cssClass, items, isCheckedFn) {
    const elem = context.querySelector(selector);

    if (items.length) {
        elem.classList.remove('hide');
    } else {
        elem.classList.add('hide');
    }

    let html = '';

    html += items.map(function (filter) {
        let itemHtml = '';

        const checkedHtml = isCheckedFn(filter) ? ' checked' : '';
        itemHtml += '<label>';
        itemHtml += '<input is="emby-checkbox" type="checkbox"' + checkedHtml + ' data-filter="' + filter.Id + '" class="' + cssClass + '"/>';
        itemHtml += '<span>' + escapeHtml(filter.Name) + '</span>';
        itemHtml += '</label>';

        return itemHtml;
    }).join('');

    elem.querySelector('.filterOptions').innerHTML = html;
}

function renderDynamicFilters(context, result, options) {
    renderOptions(context, '.genreFilters', 'chkGenreFilter', result.Genres, function (i) {
        // Switching from | to ,
        const delimeter = (options.settings.GenreIds || '').indexOf('|') === -1 ? ',' : '|';
        return (delimeter + (options.settings.GenreIds || '') + delimeter).indexOf(delimeter + i.Id + delimeter) !== -1;
    });
}

function setBasicFilter(key, elem) {
    let value = elem.checked;
    value = value ? value : null;
    userSettings.setFilter(key, value);
}
function getBasicFilter(key, elem) {
    elem.checked = userSettings.getFilter(key);
}
function moveCheckboxFocus(elem, offset) {
    const parent = dom.parentWithClass(elem, 'checkboxList-verticalwrap');
    const elems = focusManager.getFocusableElements(parent);

    let index = -1;
    for (let i = 0, length = elems.length; i < length; i++) {
        if (elems[i] === elem) {
            index = i;
            break;
        }
    }

    index += offset;

    index = Math.min(elems.length - 1, index);
    index = Math.max(0, index);

    const newElem = elems[index];
    if (newElem) {
        focusManager.focus(newElem);
    }
}
function centerFocus(elem, horiz, on) {
    import('../../scripts/scrollHelper').then((scrollHelper) => {
        const fn = on ? 'on' : 'off';
        scrollHelper.centerFocus[fn](elem, horiz);
    });
}
function onInputCommand(e) {
    switch (e.detail.command) {
        case 'left':
            moveCheckboxFocus(e.target, -1);
            e.preventDefault();
            break;
        case 'right':
            moveCheckboxFocus(e.target, 1);
            e.preventDefault();
            break;
        default:
            break;
    }
}
function resetValues(context) {
	if (!context)
		return;
	let idx;
	let length;
	
	// Series status
    elems = context.querySelectorAll('.chkSeriesStatus');
    for (idx = 0, length = elems.length; idx < length; idx++) {
        elems[idx].checked = false;
    }
    // Genres
	elems = context.querySelectorAll('.chkGenreFilter');
    for (idx = 0, length = elems.length; idx < length; idx++) {
        elems[idx].checked = false;
    }
	
	elems = context.querySelectorAll('.simpleFilter');
    for (let i = 0, length = elems.length; i < length; i++)
		elems[i].querySelector('input').checked = false;
	
	// Video types
    let elems = context.querySelectorAll('.chkVideoTypeFilter');
    for (idx = 0, length = elems.length; idx < length; idx++) {
        elems[idx].checked = false;
    }
}
function checkValues(settings) {
	if (!settings)
		return false;
    // Video types
	if (settings.VideoTypes?.length > 0)
		return true;
    // Series status
	if (settings.SeriesStatus?.length > 0)
		return true;
    // Genres
	if (settings.GenreIds?.length > 0)
		return true;
	
	return settings.IsPlayed || settings.IsUnplayed || settings.IsFavorite || settings.IsResumable
		|| settings.HasSubtitles || settings.HasTrailer || settings.HasSpecialFeature
		|| settings.HasThemeSong || settings.HasThemeVideo;
}
function saveValues(context, settingsKey, setfilters) {
    let elems;
	
    // Video types
    const videoTypes = [];
    elems = context.querySelectorAll('.chkVideoTypeFilter');
    for (let i = 0, length = elems.length; i < length; i++) {
        if (elems[i].checked) {
            videoTypes.push(elems[i].getAttribute('data-filter'));
        }
    }
    // Series status
    const seriesStatuses = [];
    elems = context.querySelectorAll('.chkSeriesStatus');
    for (let i = 0, length = elems.length; i < length; i++) {
        if (elems[i].checked) {
            seriesStatuses.push(elems[i].getAttribute('data-filter'));
        }
    }
    // Genres
    const genres = [];
    elems = context.querySelectorAll('.chkGenreFilter');
    for (let i = 0, length = elems.length; i < length; i++) {
        if (elems[i].checked) {
            genres.push(elems[i].getAttribute('data-filter'));
        }
    }

    if (setfilters) {
        setfilters((prevState) => ({
            ...prevState,
            StartIndex: 0,
            IsPlayed: context.querySelector('.chkPlayed').checked,
            IsUnplayed: context.querySelector('.chkUnplayed').checked,
            IsFavorite: context.querySelector('.chkFavorite').checked,
            IsResumable: context.querySelector('.chkResumable').checked,
            VideoTypes: videoTypes.join(','),
            SeriesStatus: seriesStatuses.join(','),
            HasSubtitles: context.querySelector('.chkSubtitle').checked,
            HasTrailer: context.querySelector('.chkTrailer').checked,
            HasSpecialFeature: context.querySelector('.chkSpecialFeature').checked,
            HasThemeSong: context.querySelector('.chkThemeSong').checked,
            HasThemeVideo: context.querySelector('.chkThemeVideo').checked,
            GenreIds: genres.join(',')
        }));
    } else {
		elems = context.querySelectorAll('.simpleFilter');
        for (let i = 0, length = elems.length; i < length; i++) {
            if (elems[i].tagName === 'INPUT') {
                setBasicFilter(context, settingsKey + '-filter-' + elems[i].getAttribute('data-filter'), elems[i]);
            } else {
				if (setfilters) {
					setBasicFilter(context, settingsKey + '-filter-' + elems[i].getAttribute('data-filter'), elems[i].querySelector('input'));
				} else {
					const filterName = elems[i].getAttribute('data-filter');
					userSettings.setFilter(settingsKey + '-filter-' + filterName, elems[i].querySelector('input').checked);
				}
            }
        }
        userSettings.setFilter(settingsKey + '-filter-GenreIds', genres.join(','));
		userSettings.setFilter(settingsKey + '-filter-VideoTypes', videoTypes.join(','));
		userSettings.setFilter(settingsKey + '-filter-SeriesStatus', seriesStatuses.join(','));
    }
}
function bindCheckboxInput(context, on) {
    const elems = context.querySelectorAll('.checkboxList-verticalwrap');
    for (let i = 0, length = elems.length; i < length; i++) {
        if (on) {
            inputManager.on(elems[i], onInputCommand);
        } else {
            inputManager.off(elems[i], onInputCommand);
        }
    }
}
function initEditor(context, settings, settingsKey, setfilters) {
    let i;
    let length;
	
	let elems = context.querySelectorAll('.simpleFilter');
    for (i = 0, length = elems.length; i < length; i++) {
        if (elems[i].tagName === 'INPUT') {
            elems[i].checked = settings[elems[i].getAttribute('data-filter')] || false;
        } else {
			if (setfilters) {
				elems[i].querySelector('input').checked = settings[elems[i].getAttribute('data-filter')] || false;
			} else {
				const filterName = elems[i].getAttribute('data-filter');
				const _state = toBoolean(userSettings.getFilter(settingsKey + '-filter-' + filterName), false);
				elems[i].querySelector('input').checked = _state;
			}
        }
    }

	// Video types
    let videoTypes = [];
	if (setfilters) {
		videoTypes = settings.VideoTypes ? settings.VideoTypes.split(',') : [];
	} else {
		videoTypes = userSettings.getFilter(settingsKey + '-filter-VideoTypes') || [];
	}
    elems = context.querySelectorAll('.chkVideoTypeFilter');
    for (i = 0, length = elems.length; i < length; i++) {
        elems[i].checked = videoTypes.indexOf(elems[i].getAttribute('data-filter')) !== -1;
    }

	// Series status
    let seriesStatuses = [];
	if (setfilters) {
		seriesStatuses = settings.SeriesStatus ? settings.SeriesStatus.split(',') : [];
	} else {
		seriesStatuses = userSettings.getFilter(settingsKey + '-filter-SeriesStatus') || [];
	}
    elems = context.querySelectorAll('.chkSeriesStatus');
    for (i = 0, length = elems.length; i < length; i++) {
        elems[i].checked = seriesStatuses.indexOf(elems[i].getAttribute('data-filter')) !== -1;
    }

    if (context.querySelector('.basicFilterSection .viewSetting:not(.hide)'))
        context.querySelector('.basicFilterSection').classList.remove('hide');
    else
        context.querySelector('.basicFilterSection').classList.add('hide');

    if (context.querySelector('.featureSection .viewSetting:not(.hide)'))
        context.querySelector('.featureSection').classList.remove('hide');
    else
        context.querySelector('.featureSection').classList.add('hide');
	
	context.querySelector('form').addEventListener('submit', onSubmit);
}
function loadDynamicFilters(context, options) {
    const apiClient = ServerConnections.getApiClient(options.serverId);

    const filterMenuOptions = Object.assign(options.filterMenuOptions, {

        UserId: apiClient.getCurrentUserId(),
        ParentId: options.parentId,
        IncludeItemTypes: options.itemTypes.join(',')
    });

    apiClient.getFilters(filterMenuOptions).then((result) => {
        renderDynamicFilters(context, result, options);
    });
}
class FilterMenu {
	inUse(options) {
		return checkValues(options.settings);
	}
    show(options) {
        return new Promise( (resolve) => {
			
			let submitted = false;
			
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
			html += `<button is="paper-icon-button-light" class="btnReset hide-mouse-idle-tv" title="${globalize.translate('ButtonReset')}"><span class="material-icons restart_alt" aria-hidden="true"></span></button>`;
            html += `<button is="paper-icon-button-light" class="btnCancel hide-mouse-idle-tv" tabindex="-1" title="${globalize.translate('ButtonBack')}"><span class="material-icons arrow_back" aria-hidden="true"></span></button>`;
            html += '<h3 class="formDialogHeaderTitle">${Filters}</h3>';
            html += '</div>';
            html += template;
            dlg.innerHTML = globalize.translateHtml(html, 'core');

            const settingElements = dlg.querySelectorAll('.viewSetting');
            for (let i = 0, length = settingElements.length; i < length; i++) {
                if (options.visibleSettings.indexOf(settingElements[i].getAttribute('data-filter')) === -1) {
                    settingElements[i].classList.add('hide');
                } else {
                    settingElements[i].classList.remove('hide');
                }
            }

            initEditor(dlg, options.settings, options.settingsKey, options.setfilters);
            loadDynamicFilters(dlg, options);

            bindCheckboxInput(dlg, true);
            dlg.querySelector('.btnCancel').addEventListener('click', function () {
                dialogHelper.close(dlg);
            });
			dlg.querySelector('.btnReset').addEventListener('click', function () {
                resetValues(dlg);
				submitted = true;
            });

            if (layoutManager.tv) {
                centerFocus(dlg.querySelector('.formDialogContent'), false, true);
            }

            dlg.querySelector('form').addEventListener('change', function () {
                submitted = true;
            }, true);

            dialogHelper.open(dlg).then( function() {
                bindCheckboxInput(dlg, false);

                if (layoutManager.tv) {
                    centerFocus(dlg.querySelector('.formDialogContent'), false, false);
                }

                if (submitted) {
                    //if (!options.onChange) {
                    saveValues(dlg, options.settingsKey, options.setfilters);
                    return resolve();
                    //}
                }
                return resolve();
            });
        });
    }
}

export default FilterMenu;
