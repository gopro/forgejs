/**
 * File object description.<br>
 * Used in {@link FORGE.Loader}
 *
 * @constructor FORGE.File
 */
FORGE.File = function()
{

};

/**
 * The key of the file.
 * @name FORGE.File#key
 * @type {string}
 */
FORGE.File.prototype.key = "";

/**
 * The url of the file.
 * @name FORGE.File#url
 * @type {string}
 */
FORGE.File.prototype.url = "";

/**
 * The type of the file.
 * @name FORGE.File#type
 * @type {string}
 */
FORGE.File.prototype.type = "";

/**
 * The file data.
 * @name FORGE.File#data
 * @type {Object|string}
 */
FORGE.File.prototype.data = null;

/**
 * The XMLHttpRequest response.
 * @name FORGE.File#xhr
 * @type {Object}
 */
FORGE.File.prototype.xhr = null;

/**
 * The loading satatus of the file.
 * @name FORGE.File#loading
 * @type {boolean}
 */
FORGE.File.prototype.loading = false;

/**
 * File is loaded?
 * @name FORGE.File#loaded
 * @type {boolean}
 */
FORGE.File.prototype.loaded = false;

/**
 * The error text of the file.
 * @name FORGE.File#error
 * @type {string}
 */
FORGE.File.prototype.error = "";

FORGE.File.prototype.constructor = FORGE.File;