import { appRouter } from './appRouter';
import browser from '../scripts/browser';
import dialog from './dialog/dialog';
import globalize from '../scripts/globalize';

/* eslint-disable indent */

    function useNativeAlert() {
        // webOS seems to block modals
        // Tizen 2.x seems to block modals
        return !browser.web0s
            && !(browser.tizenVersion && browser.tizenVersion < 3)
            && browser.tv
            && window.alert;
    }

    export default async function (text, title) {
        let options;
        if (typeof text === 'string') {
            options = {
                title: title,
				buttonTitle: buttonTitle,
                text: text
            };
        } else {
            options = text;
        }

		await appRouter.ready();

        if (useNativeAlert()) {
            alert((options.text || '').replaceAll('<br/>', '\n'));
            return Promise.resolve();
        } else {
            const items = [];

            items.push({
                name: globalize.translate(options.buttonTitle || 'ButtonGotIt'),
                id: 'ok',
                type: 'submit'
            });

            options.buttons = items;
            return dialog.show(options);
        }
    }

/* eslint-enable indent */
