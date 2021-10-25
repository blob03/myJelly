import { appRouter } from '../appRouter';
import browser from '../../scripts/browser';
import dialog from '../dialog/dialog';
import globalize from '../../scripts/globalize';

function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}

function useNativeConfirm() {
    // webOS seems to block modals
    // Tizen 2.x seems to block modals
    return !browser.web0s
        && !(browser.tizenVersion && browser.tizenVersion < 3)
        && browser.tv
        && window.confirm;
}

async function nativeConfirm(options) {
    if (typeof options === 'string') {
        options = {
            title: '',
            text: options
        };
    }

    const text = replaceAll(options.text || '', '<br/>', '\n');
    await appRouter.ready();
    const result = window.confirm(text);

    if (result) {
        return Promise.resolve();
    } else {
        return Promise.reject();
    }
}

function customConfirm(text, title) {
    let options;
    if (typeof text === 'string') {
        options = {
            title: title,
            text: text
        };
    } else {
        options = text;
    }

    const items = [];

    items.push({
        name: options.cancelText || globalize.translate('ButtonCancel'),
        id: 'cancel',
        type: 'cancel'
    });

    items.push({
        name: options.confirmText || globalize.translate('ButtonOk'),
        id: 'ok',
        type: options.primary === 'delete' ? 'delete' : 'submit'
    });

    options.buttons = items;

    return dialog.show(options).then(result => {
        if (result === 'ok') {
            return Promise.resolve();
        }

        return Promise.reject();
    });
}

const confirm = useNativeConfirm() ? nativeConfirm : customConfirm;

export default confirm;
