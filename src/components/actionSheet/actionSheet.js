import dialogHelper from '../dialogHelper/dialogHelper';
import layoutManager from '../layoutManager';
import globalize from '../../scripts/globalize';
import dom from '../../scripts/dom';
import '../../elements/emby-button/emby-button';
import './actionSheet.scss';
import 'material-design-icons-iconfont';
import '../../styles/scrollstyles.scss';
import '../../components/listview/listview.scss';

function getOffsets(elems) {
    const results = [];

    if (!document) {
        return results;
    }

    for (const elem of elems) {
        const box = elem.getBoundingClientRect();

        results.push({
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height
        });
    }

    return results;
}

function getPosition(options, dlg) {
    const windowSize = dom.getWindowSize();
    const windowHeight = windowSize.innerHeight;
    const windowWidth = windowSize.innerWidth;

    const pos = getOffsets([options.positionTo])[0];

    if (options.positionY !== 'top') {
        pos.top += (pos.height || 0) / 2;
    }

    pos.left += (pos.width || 0) / 2;

    const height = dlg.offsetHeight || 300;
    const width = dlg.offsetWidth || 160;

    // Account for popup size
    pos.top -= height / 2;
    pos.left -= width / 2;

    // Avoid showing too close to the bottom
    const overflowX = pos.left + width - windowWidth;
    const overflowY = pos.top + height - windowHeight;

    if (overflowX > 0) {
        pos.left -= (overflowX + 20);
    }
    if (overflowY > 0) {
        pos.top -= (overflowY + 20);
    }

    pos.top += (options.offsetTop || 0);
    pos.left += (options.offsetLeft || 0);

    // Do some boundary checking
    pos.top = Math.max(pos.top, 10);
    pos.left = Math.max(pos.left, 10);

    return pos;
}

function centerFocus(elem, horiz, on) {
    import('../../scripts/scrollHelper').then((scrollHelper) => {
        const fn = on ? 'on' : 'off';
        scrollHelper.centerFocus[fn](elem, horiz);
    });
}

export function show(options) {
    // items
    // positionTo
    // showCancel
    // title
    const dialogOptions = {
        removeOnClose: true,
        enableHistory: options.enableHistory,
        scrollY: false
    };

    let isFullscreen;

    if (layoutManager.tv) {
        dialogOptions.size = 'fullscreen';
        isFullscreen = true;
        dialogOptions.autoFocus = true;
    } else {
        dialogOptions.modal = false;
        dialogOptions.entryAnimation = options.entryAnimation;
        dialogOptions.exitAnimation = options.exitAnimation;
        dialogOptions.entryAnimationDuration = options.entryAnimationDuration || 140;
        dialogOptions.exitAnimationDuration = options.exitAnimationDuration || 100;
        dialogOptions.autoFocus = false;
    }

    const dlg = dialogHelper.createDialog(dialogOptions);

    if (isFullscreen) {
        dlg.classList.add('actionsheet-fullscreen');
    } else {
        dlg.classList.add('actionsheet-not-fullscreen');
    }

    dlg.classList.add('actionSheet');

    if (options.dialogClass) {
        dlg.classList.add(options.dialogClass);
    }

    let html = '';

    const scrollClassName = layoutManager.tv ? 'scrollY smoothScrollY hiddenScrollY' : 'scrollY';
    let style = '';

    // Admittedly a hack but right now the scrollbar is being factored into the width which is causing truncation
    if (options.items.length > 20) {
        const minWidth = dom.getWindowSize().innerWidth >= 300 ? 240 : 200;
        style += 'min-width:' + minWidth + 'px;';
    }

    let renderIcon = false;
    const icons = [];
    let itemIcon;

    for (const item of options.items) {
		
        itemIcon = item.icon || (item.selected ? 'check' : null);

        if (itemIcon) {
            renderIcon = true;
        }

        icons.push(itemIcon || '');
    }

    if (layoutManager.tv) {
                html += `<button is="paper-icon-button-light" class="btnCloseActionSheet hide-mouse-idle-tv" tabindex="-1" title="${globalize.translate('ButtonBack')}">
                     <span class="material-icons arrow_back"></span>
                 </button>`;
    }

    // If any items have an icon, give them all an icon just to make sure they're all lined up evenly
    const center = options.title && (!renderIcon /*|| itemsWithIcons.length != options.items.length*/);

    if (center || layoutManager.tv) {
        html += '<div class="actionSheetContent actionSheetContent-centered">';
    } else {
        html += '<div class="actionSheetContent">';
    }

    if (options.title) {
        html += '<h1 class="actionSheetTitle">' + options.title + '</h1>';
    }
    if (options.text) {
        html += '<p class="actionSheetText">' + options.text + '</p>';
    }

    let scrollerClassName = 'actionSheetScroller';
    if (layoutManager.tv) {
        scrollerClassName += ' actionSheetScroller-tv focuscontainer-x focuscontainer-y';
    }
    html += '<div class="' + scrollerClassName + ' ' + scrollClassName + '" style="' + style + '">';

    let menuItemClass = 'listItem listItem-button actionSheetMenuItem';

    if (options.border || options.shaded) {
        menuItemClass += ' listItem-border';
    }

    if (options.menuItemClass) {
        menuItemClass += ' ' + options.menuItemClass;
    }

    if (layoutManager.tv) {
        menuItemClass += ' listItem-focusscale';
    }

    if (layoutManager.mobile) {
        menuItemClass += ' actionsheet-xlargeFont';
    }

    // 'options.items' is HTMLOptionsCollection, so no fancy loops
    for (let i = 0; i < options.items.length; i++) {
        const item = options.items[i];

        if (item.divider || item.disabled) {
			if (i < options.items.length - 1) {
				if (item.divider && item.divider.length)
					html += '<div class="actionsheetDivider" style="margin: .25em 0;font-size: .6rem;font-style:italic;text-align: right;padding: 1px 20px 1px 20px;height: auto;">' + item.divider + '</div>';
				else
					html += '<div class="actionsheetDivider"></div>';
			}
			
            continue;
        }

        const autoFocus = item.selected && layoutManager.tv ? ' autoFocus' : '';

        // Check for null in case int 0 was passed in
        const optionId = item.id == null || item.id === '' ? item.value : item.id;
        html += '<button' + autoFocus + ' is="emby-button" type="button" class="' + menuItemClass + '" data-id="' + optionId + '">';

        itemIcon = icons[i];

        if (itemIcon) {
            html += `<span class="actionsheetMenuItemIcon listItemIcon listItemIcon-transparent material-icons ${itemIcon}"></span>`;
        } else if (renderIcon && !center) {
            html += '<span class="actionsheetMenuItemIcon listItemIcon listItemIcon-transparent material-icons check" style="visibility:hidden;"></span>';
        }

        html += '<div class="listItemBody actionsheetListItemBody">';

        html += '<div class="listItemBodyText actionSheetItemText">';
        html += (item.name || item.textContent || item.innerText);
        html += '</div>';

        if (item.secondaryText) {
            html += `<div class="listItemBodyText secondary">${item.secondaryText}</div>`;
        }

        html += '</div>';

        if (item.asideText) {
            html += `<div class="listItemAside actionSheetItemAsideText">${item.asideText}</div>`;
        }

        html += '</button>';
    }

    if (options.showCancel) {
        html += '<div class="buttons">';
        html += `<button is="emby-button" type="button" class="btnCloseActionSheet">${globalize.translate('ButtonCancel')}</button>`;
        html += '</div>';
    }
    html += '</div>';

    dlg.innerHTML = html;

    //if (layoutManager.tv) {
        //centerFocus(dlg.querySelector('.actionSheetScroller'), false, true);  
    //}

    const btnCloseActionSheet = dlg.querySelector('.btnCloseActionSheet');
    if (btnCloseActionSheet) {
        btnCloseActionSheet.addEventListener('click', function () {
            dialogHelper.close(dlg);
        });
    }

    let selectedId;

    let timeout;
    if (options.timeout) {
        timeout = setTimeout(function () {
            dialogHelper.close(dlg);
        }, options.timeout);
    }

    return new Promise(function (resolve, reject) {
        let isResolved;

        dlg.addEventListener('click', function (e) {
            const actionSheetMenuItem = dom.parentWithClass(e.target, 'actionSheetMenuItem');

            if (actionSheetMenuItem) {
                selectedId = actionSheetMenuItem.getAttribute('data-id');

                if (options.resolveOnClick) {
                    if (options.resolveOnClick.indexOf) {
                        if (options.resolveOnClick.indexOf(selectedId) !== -1) {
                            resolve(selectedId);
                            isResolved = true;
                        }
                    } else {
                        resolve(selectedId);
                        isResolved = true;
                    }
                }

                dialogHelper.close(dlg);
            }
        });

        dlg.addEventListener('close', function () {
            // if (layoutManager.tv) {
            //    centerFocus(dlg.querySelector('.actionSheetScroller'), false, false);
            //  }

            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            if (!isResolved) {
                if (selectedId != null) {
                    if (options.callback) {
                        options.callback(selectedId);
                    }

                    resolve(selectedId);
                } else {
                    reject('ActionSheet closed without resolving');
                }
            }
        });

        dialogHelper.open(dlg);

        const pos = options.positionTo && dialogOptions.size !== 'fullscreen' ? getPosition(options, dlg) : null;

        if (pos) {
            dlg.style.position = 'fixed';
            dlg.style.margin = 0;
            dlg.style.left = pos.left + 'px';
            dlg.style.top = pos.top + 'px';
        }
    });
}

export default {
    show: show
};
