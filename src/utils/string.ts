/**
 * Gets the value of a string as boolean.
 * @param {string} name The value as a string.
 * @param {boolean} defaultValue The default value if the string is invalid.
 * @returns {boolean} The value.
 */
export function toBoolean(value: string | undefined | null, defaultValue = false) {
	if (value)
		value = value.toLowerCase();
    if (value !== 'true' && value !== 'false') {
        return defaultValue;
    } else {
        return value !== 'false';
    }
}

/**
 * Gets the value of a string as float number.
 * @param {string} value The value as a string.
 * @param {number} defaultValue The default value if the string is invalid.
 * @returns {number} The value.
 */
export function toFloat(value: string | null | undefined, defaultValue = 0) {
    if (!value || isNaN(value as never)) {
        return defaultValue;
    } else {
        return parseFloat(value);
    }
}

/**
 * Gets the value of a string as float number with a precision specified by the caller.
 * @param {string} value The value as a string.
 * @param {number} defaultValue The default value if the string is invalid.
 * @returns {number} The value.
 */
export function toPrecision(value: string | null | undefined, x: number | null | undefined, defaultValue = 0) {
	if (!value || Number.isNaN(value))
		return defaultValue;
	return Number(Number(value).toFixed(x?x:0));
}

