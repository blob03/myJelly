import DefaultConfig from '../../config.json';

let _config_data;
const urlResolver = document.createElement('a');

// `fetch` with `file:` support
// Recent browsers seem to support `file` protocol under some conditions.
// Based on https://github.com/github/fetch/pull/92#issuecomment-174730593
//          https://github.com/github/fetch/pull/92#issuecomment-512187452
async function fetchLocal(url, options) {
    urlResolver.href = url;

    const requestURL = urlResolver.href;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest;

        xhr.onload = () => {
            // `file` protocol has invalid OK status
            let status = xhr.status;
            if (requestURL.startsWith('file:') && status === 0) {
                status = 200;
            }

            /* eslint-disable-next-line compat/compat */
            resolve(new Response(xhr.responseText, {status: status}));
        };

        xhr.onerror = () => {
            reject(new TypeError('Local request failed'));
        };

        xhr.open('GET', url);

        if (options && options.cache) {
            xhr.setRequestHeader('Cache-Control', options.cache);
        }

        xhr.send(null);
    });
}

async function getConfig() {
    if (_config_data) return Promise.resolve(_config_data);
    try {
        const response = await fetchLocal('config.json', {
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('network response was not ok');
        }

        _config_data = await response.json();

        return _config_data;
    } catch (error) {
        console.warn('failed to fetch the web config file:', error);
        _config_data = DefaultConfig;
        return _config_data;
    }
}

export function getIncludeCorsCredentials() {
    return getConfig()
        .then(config => !!config.includeCorsCredentials)
        .catch(error => {
            console.log('cannot get web config:', error);
            return false;
        });
}

export function getMultiServer() {
    return getConfig().then(config => {
        return !!config.multiserver;
    }).catch(error => {
        console.log('cannot get web config:', error);
        return false;
    });
}

export function getServers() {
    return getConfig().then(config => {
        return config.servers || [];
    }).catch(error => {
        console.log('cannot get web config:', error);
        return [];
    });
}

const baseDefaultTheme = {
    'name': 'Dark',
    'id': 'dark',
    'default': true
};

const baseDefaultPreset = {
    'name': 'Neon pink',
    'id': 'Neonpink',
    'default': true
};

let internalDefaultTheme = baseDefaultTheme;
let internalDefaultPreset = baseDefaultPreset;

const checkDefaultTheme = (themes) => {
    if (themes) {
        const defaultTheme = themes.find((theme) => theme.default);

        if (defaultTheme) {
            internalDefaultTheme = defaultTheme;
            return;
        }
    }

    internalDefaultTheme = baseDefaultTheme;
};

const checkDefaultPreset = (presets) => {
    if (presets) {
        const defaultPreset = presets.find((preset) => preset.default);

        if (defaultPreset) {
            internalDefaultPreset = defaultPreset;
            return;
        }
    }

    internalDefaultPreset = baseDefaultPreset;
};

export function getThemes() {
    return getConfig().then(config => {
        if (!Array.isArray(config.themes)) {
            console.error('web config is invalid, missing themes:', config);
        }
        const themes = Array.isArray(config.themes) ? config.themes : DefaultConfig.themes;
        checkDefaultTheme(themes);
        return themes;
    }).catch(error => {
        console.log('cannot get web config:', error);
        checkDefaultTheme();
        return DefaultConfig.themes;
    });
}

export function getPresets() {
    return getConfig().then(config => {
        if (!Array.isArray(config.presets)) {
            console.error('web config is invalid, missing presets:', config);
        }
        const presets = Array.isArray(config.presets) ? config.presets : DefaultConfig.presets;
        checkDefaultPreset(presets);
        return presets;
    }).catch(error => {
        console.log('cannot get web config:', error);
        checkDefaultPreset();
        return DefaultConfig.presets;
    });
}

export function loadUserPresets(templateName) {
	if (!templateName)
		return undefined;
	
	if (DefaultConfig?.userPresets)
		return DefaultConfig.userPresets[templateName];
	else {
		console.error('Web config file is invalid, missing user configuration:', config);
		return undefined;
	}
}

export function listUserPresets() {
	let list = [];
	Object.keys(DefaultConfig.userPresets).forEach( x => {list.push(x)} );
	return list;
}

export const getDefaultTheme = () => internalDefaultTheme;

export const getDefaultPreset = () => internalDefaultPreset;

export function getMenuLinks() {
    return getConfig().then(config => {
        if (!config.menuLinks) {
            console.error('web config is invalid, missing menuLinks:', config);
        }
        return config.menuLinks || [];
    }).catch(error => {
        console.log('cannot get web config:', error);
        return [];
    });
}

// Boolean to set (or not) a 'Last seen...' line underneath the user avatars in the login screen.
export function loginLastSeen() {
	return Boolean(_config_data?.login?.accountLastSeen);
}

// Boolean to display (or not) a username underneath avatars in the login screen.
export function loginShowName() {
	return Boolean(_config_data?.login?.accountName);
}

// Boolean to display (or not) the account role (user or admin).
export function loginRole() {
	return Boolean(_config_data?.login?.accountRole);
}

// Boolean to use (or not) theme backdrops if any.
export function loginBackdrops() {
	return Boolean(_config_data?.login?.enableBackdrops);
}

// Boolean to set (or not) the night mode.
export function loginNightMode() {
	return Boolean(_config_data?.login?.nightMode);
}

// Boolean to set (or not) the night mode.
export function loginServerLastSeen() {
	return Boolean(_config_data?.login?.serverLastSeen);
}

// Boolean to rotate (or not) between available theme backdrops if any.
export function loginBackdropsRotation() {
	return Boolean(_config_data?.login?.enableBackdropsRotation);
}

// Integer to set the base font size for the TV layout only.
// This value can be further adjusted by users in the display settings screen.
// val ranges from -20 to 20.
export function loginDisplayFontSize() {
	let val = parseInt(_config_data?.login?.displayFontSize, 10);
	if (val === isNaN || val < -20 || val > 20)
		val = 0;
	return (val);
}

// Integer to set the delay in seconds between each backdrop rotation.
export function loginBackdropsRotationDelay() {
	let val = parseInt(_config_data?.login?.setBackdropsRotationDelay, 10);
	if (val === isNaN || val < 10 || val > 300)
		val = 30;
	return (val);
}

// Integer to set the delay in seconds between each backdrop rotation.
export function loginBackdropsContrast() {
	let val = parseInt(_config_data?.login?.setBackdropsContrast, 10);
	if (val === isNaN || val < 0 || val > 10)
		val = 5;
	return (val);
}

// String to set a default backdrop image.
export function loginBackdrop() {
	let val = _config_data?.login?.defaultBackdrop.toString();
	if (!val) {
		// returning null will randomly pick a backdrop from the theme pool.
		val = null;
	}
	return (val);
}

// Boolean to display (or not) the remaining failed attempts before the account lockdown.
export function loginAttemptLeft() {
	return Boolean(_config_data?.login?.attemptLeft);
}

// Boolean to display (or not) account cards in visual cardBox format.
export function loginVisualCardBox() {
	return Boolean(_config_data?.login?.visualCardBox);
}

// Boolean to display (or not) the account auth methods (password/PIN/open).
export function loginAuth() {
	return Boolean(_config_data?.login?.accountAuthMethods);
}

// Boolean to show or hide the clock in the menu bar of the login screen.
export function loginClock() {
	return Boolean(_config_data?.login?.clock);
}

// Set the position of the clock, 0/left or 1/right.
export function loginClockPos() {
	switch(_config_data?.login?.clockPos) {
		case "right":
			return 1;
		case "left":
		default:
			return 0;
	}
}

// Set the format index used by the clock, from 0 up to 7.
export function loginClockFormat() {
	let x = parseInt(_config_data?.login?.clockFormat, 10);
	if (isNaN(x) || x < 0 || x > 7)
		x = 0;
	return x;
}

// Boolean to show or hide the pin button in the header of the login screen.
export function pinButton() {
	return Boolean(_config_data?.login?.header?.pin);
}

// Boolean to show or hide the reload button in the header of the login screen.
export function reloadButton() {
	return Boolean(_config_data?.login?.header?.reload);
}

// Boolean to show or hide the quickConnect authentication button in the login menu.
export function quickConnect() {
	return Boolean(_config_data?.login?.auth?.quickConnect);
}

// Boolean to use a fadein/out animation when popping in/out alert windows.
export function enableFastFadein() {
	return Boolean(_config_data?.login?.enableFastFadein, false);
}

// Boolean to show or hide the server selection button in the login menu.
export function serverSelection() {
	return Boolean(_config_data?.login?.serverSelection);
}

// Boolean to show or hide the password recovery button in the login menu.
export function passRecovery() {
	return Boolean(_config_data?.login?.auth?.passwordRecovery);
}

// Boolean to show or hide the header above the user list.
export function loginVisualHeader() {
	return Boolean(_config_data?.login?.auth?.visualHeader);
}

// Boolean to show or hide the header above the manual authentication form.
export function loginManualHeader() {
	return Boolean(_config_data?.login?.auth?.manualHeader);
}

// value to set which view to show when loading up.
export function view() {
	let view = _config_data?.login?.auth?.view;
	if (view !== "manual")
		view = "visual";
	return view;
}

export function getPlugins() {
    return getConfig().then(config => {
        if (!config.plugins) {
            console.error('web config is invalid, missing plugins:', config);
        }
        return config.plugins || DefaultConfig.plugins;
    }).catch(error => {
        console.log('cannot get web config:', error);
        return DefaultConfig.plugins;
    });
}
