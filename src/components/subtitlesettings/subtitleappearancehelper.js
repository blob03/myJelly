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
        default:
        case 'dropshadow':
			list.push({ name: 'text-shadow', value: sColor + ' 0px 0px 7px' });
            break;
    }
	
	list.push({ name: 'font-style', value: 'oblique ' + (settings.oblique * 5 || '0' ) + 'deg'});
	list.push({ name: 'background-color', value: settings.textBackground || 'transparent' });
    list.push({ name: 'color', value: settings.textColor || 'White' });
    list.push({ name: '-webkit-text-stroke', value: (settings.strokeSize ? (settings.strokeSize + 'px ') : '1px ') + (settings.textStroke ? settings.textStroke : '#000000')});
	
    switch (settings.font || '') {
        case 'VTypewriter':
            list.push({ name: 'font-family', value: 'VTypewriter' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'DSWeiss':
            list.push({ name: 'font-family', value: 'DSWeiss' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'MGothisch':
            list.push({ name: 'font-family', value: 'MGothisch' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'Monserga':
            list.push({ name: 'font-family', value: 'Monserga' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Ubuntu-M':
            list.push({ name: 'font-family', value: 'Ubuntu-M' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Ubuntu-C':
            list.push({ name: 'font-family', value: 'Ubuntu-C' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Ubuntu-R':
            list.push({ name: 'font-family', value: 'Ubuntu-R' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Ubuntu-L':
            list.push({ name: 'font-family', value: 'Ubuntu-L' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'JECasual':
            list.push({ name: 'font-family', value: 'JECasual' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'JACobbler':
            list.push({ name: 'font-family', value: 'JACobbler' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'JRosalie':
            list.push({ name: 'font-family', value: 'JRosalie' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'AText':
            list.push({ name: 'font-family', value: 'AText' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'smallcaps':
            list.push({ name: 'font-family', value: 'Copperplate Gothic,Copperplate Gothic Bold,Copperplate,system-ui,-apple-system,BlinkMacSystemFont,sans-serif' });
            list.push({ name: 'font-variant', value: 'small-caps' });
            break;
        case 'OogieBoogie':
            list.push({ name: 'font-family', value: 'OogieBoogie' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Impact':
            list.push({ name: 'font-family', value: 'Impact' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Orange':
            list.push({ name: 'font-family', value: 'Orange' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'Chewy':
            list.push({ name: 'font-family', value: 'Chewy' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
		case 'YouAreLoved':
            list.push({ name: 'font-family', value: 'YouAreLoved' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        default:
            list.push({ name: 'font-family', value: 'inherit' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
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
