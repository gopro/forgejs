/**
 * @typedef {{r:(number|undefined), g:(number|undefined), b:(number|undefined), a:(number|undefined)}}
 * @name RGBColor
 * @property {number} r - red
 * @property {number} g - green
 * @property {number} b - blue
 * @property {number=} a - alpha
 */
var RGBaColor;

/**
 * @typedef {{h:(number|undefined), s:(number|undefined), l:(number|undefined)}}
 * @name HSLColor
 * @property {number} h - hue
 * @property {number} s - saturation
 * @property {number} l - lightness
 */
var HSLColor;

/**
 * @typedef {{h:(number|undefined), s:(number|undefined), v:(number|undefined)}}
 * @name HSVColor
 * @property {number} h - hue
 * @property {number} s - saturation
 * @property {number} v - value
 */
var HSVColor;

/**
 * @typedef {{Y:(number|undefined), Cb:(number|undefined), Cr:(number|undefined)}}
 * @name YCbCrColor
 * @property {number} Y - red
 * @property {number} Cb - green
 * @property {number} Cr - blue
 */
var YCbCrColor;