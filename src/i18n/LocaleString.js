
/**
 * Locale string class.
 *
 * @constructor FORGE.LocaleString
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {string=} key the i18n key of the locale.
 * @param {string=} jsonKey - The JSON key to search for.
 * @param {string=} defaultStr - The default text to use.
 * @extends {FORGE.BaseObject}
 *
 * @todo Try to make strings that works with a specific key for the cache
 * @todo For example a plugin can declare an exclusive key to work with
 */
FORGE.LocaleString = function(viewer, key, jsonKey, defaultStr)
{
    /**
     * Viewer reference.
     * @name FORGE.LocaleString#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Key of the locale.
     * @name FORGE.LocaleString#_key
     * @type {(string|undefined)}
     * @private
     */
    this._key = key;

    /**
     * JSON file key where to look for the locale.
     * @name FORGE.LocaleString#_jsonKey
     * @type {(string|undefined)}
     * @private
     */
    this._jsonKey = jsonKey;

    /**
     * Default value for the locale string.
     * @name FORGE.LocaleString#_defaultValue
     * @type {(string|undefined)}
     * @private
     */
    this._defaultValue = defaultStr;

    /**
     * Value of the locale.
     * @name FORGE.LocaleString#_value
     * @type {?string}
     * @private
     */
    this._value = null;

    // The current locale
    //this._locale = 0;

    FORGE.BaseObject.call(this, "LocaleString");
};

FORGE.LocaleString.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.LocaleString.prototype.constructor = FORGE.LocaleString;

/**
 * Destroy method.
 * @method FORGE.LocaleString#destroy
 */
FORGE.LocaleString.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get and set the key of the locale.
* @name FORGE.LocaleString#key
* @type {string}
*/
Object.defineProperty(FORGE.LocaleString.prototype, "key", {

    /** @this {FORGE.LocaleString} */
    get: function ()
    {
        return this._key;
    },

    /** @this {FORGE.LocaleString} */
    set: function (value)
    {
        this._key = value;
    }

});

/**
* Get and set the JSON key of the locale.
* @name FORGE.LocaleString#jsonKey
* @type {string}
*/
Object.defineProperty(FORGE.LocaleString.prototype, "jsonKey", {

    /** @this {FORGE.LocaleString} */
    get: function ()
    {
        return this._jsonKey;
    },

    /** @this {FORGE.LocaleString} */
    set: function (value)
    {
        this._jsonKey = value;
    }

});

/**
* Get the value of the locale.
* @name FORGE.LocaleString#value
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.LocaleString.prototype, "value", {

    /** @this {FORGE.LocaleString} */
    get: function ()
    {
        // Check if the string is already populated.
        // Check if the locale is ok
        // Populate the string value
        // Return the string value
        // If the string is not found return the key or an empty string ?

        // Is the current locale value is the same than the manager one ?
        /*
        if(this._locale == this._viewer.i18n.locale)
        {

        }
        */

        var locale = this._viewer.i18n.locale;

        // if no locale is selected in the locale manager then return the default value or return the key!
        if(locale === "")
        {
            if(typeof this._defaultValue !== "undefined")
            {
                return this._defaultValue;
            }
            return this._key;
        }

        this._value = this._viewer.i18n.getValue(/** @type {string} */ (this._key), this._jsonKey);

        // if no value are found for the key and a default value exists, return it.
        if (this._value === this._key && typeof this._defaultValue !== "undefined")
        {
            this._value = this._defaultValue;
        }

        return this._value;
    }

});

/**
* Get the loaded status of this locale string for the current locale.
* @name FORGE.LocaleString#loaded
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.LocaleString.prototype, "loaded",
{
    /** @this {FORGE.LocaleString} */
    get: function()
    {
        var value = this._viewer.i18n.getValue(/** @type {string} */ (this._key), this._jsonKey);
        return (typeof value !== "undefined" && value !== this._key);
    }
});