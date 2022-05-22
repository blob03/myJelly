/**
 * Subtitle settings visual helper.
 * @module components/subtitleSettings/subtitleAppearanceHelper
 */

function getTextStyles(settings, preview) {
    const list = [];
	
	list.push({ name: 'font-size', value: settings.textSize ? (0.6 + (settings.textSize/10)) + 'em' : '1.36em'});

	let sColor = (settings.textShadow || '#000');
    switch (settings.dropShadow || '') {
        case 'raised':
            list.push({ name: 'text-shadow', value: '-1px -1px white, 0px -1px white, -1px 0px white, 1px 1px ' + sColor + ', 0px 1px ' + sColor + ', 1px 0px ' + sColor });
            break;
        case 'depressed':
            list.push({ name: 'text-shadow', value: '1px 1px white, 0px 1px white, 1px 0px white, -1px -1px ' + sColor + ', 0px -1px ' + sColor + ', -1px 0px ' + sColor });
            break;
        case 'uniform':
            list.push({ name: 'text-shadow', value: sColor + ' -1px 0px, ' + sColor + ' 0px 1px, ' + sColor + ' 1px 0px, ' + sColor + ' 0px -1px' });
            break;
        case 'none':
            list.push({ name: 'text-shadow', value: 'none' });
            break;
		case 'diffused':
			list.push({ name: 'text-shadow', value: sColor + ' 0px 0px 9px, ' + sColor + ' 0px 0px 20px' });
            break;
		case 'diffused2':
			list.push({ name: 'text-shadow', value: sColor + ' 0px 0px 9px, ' + sColor + ' 0px 0px 20px, ' + sColor + ' 0px 0px 30px'});
            break;
        default:
        case 'dropshadow':
			list.push({ name: 'text-shadow', value: sColor + ' 0px 0px 7px' });
            break;
    }
	if (settings.oblique)
		list.push({ name: 'font-style', value: 'oblique ' + (settings.oblique * 5) + 'deg'});
	list.push({ name: 'background-color', value: settings.textBackground || 'transparent' });
    list.push({ name: 'color', value: settings.textColor || 'White' });
    list.push({ name: '-webkit-text-stroke', value: (settings.strokeSize ? (settings.strokeSize + 'px ') : '1px ') + (settings.textStroke ? settings.textStroke : '#000')});
	list.push({ name: 'border-radius', value: settings.borderradius || '50%' });
	
    switch (settings.font || 'inherit') {
        case 'smallcaps':
            list.push({ name: 'font-family', value: 'Copperplate Gothic,Copperplate Gothic Bold,Copperplate,system-ui,-apple-system,BlinkMacSystemFont,sans-serif' });
            list.push({ name: 'font-variant', value: 'small-caps' });
            break;
        default:
			list.push({ name: 'font-family', value: settings.font });
            list.push({ name: 'font-variant', value: 'none' });
    }

    if (!preview) {
        const pos = parseInt(settings.verticalPosition, 10);
		const height = window.innerHeight || 1080;
		const inc = height / 17; // slider bar ranges from 0 to 16
        const line = Math.abs(pos * inc);
        if (pos < 0) {
            list.push({ name: 'margin-bottom', value: line + 'px' });
            list.push({ name: 'margin-top', value: '' });
        } else {
            list.push({ name: 'margin-bottom', value: '' });
            list.push({ name: 'margin-top', value: line + 'px' });
        }
    }

    return list;
}

function getWindowStyles(settings, preview) {
    const list = [];

    if (!preview) {
        const pos = parseInt(settings.verticalPosition, 10);
        if (pos < 0) {
            list.push({ name: 'top', value: '' });
            list.push({ name: 'bottom', value: '0' });
        } else {
            list.push({ name: 'top', value: '0' });
            list.push({ name: 'bottom', value: '' });
        }
    }

    return list;
}

export function getStyles(settings, preview) {
    return {
        text: getTextStyles(settings, preview),
        window: getWindowStyles(settings, preview)
    };
}

function applyStyleList(styles, elem) {
    for (let i = 0, length = styles.length; i < length; i++) {
        const style = styles[i];

        elem.style[style.name] = style.value;
    }
}

export function applyStyles(elements, appearanceSettings) {
    const styles = getStyles(appearanceSettings, !!elements.preview);

    if (elements.text) {
        applyStyleList(styles.text, elements.text);
    }
    if (elements.window) {
        applyStyleList(styles.window, elements.window);
    }
}
export default {
    getStyles: getStyles,
    applyStyles: applyStyles
};
