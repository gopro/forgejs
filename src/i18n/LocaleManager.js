/**
 * Manager for the locales.
 *
 * @constructor  FORGE.LocaleManager
 * @param {FORGE.Viewer} viewer - Reference to the FORGE.Viewer.
 * @extends {FORGE.BaseObject}
 *
 * @todo Take into account that several configs could be loaded over time
 * @todo Find a behavior for default btw viewer config & story config & plugins config ... into parse config method
 * @todo Separate load events from request and complete
 * @todo Test to embed HTML with special characters like "" and ''
 */
FORGE.LocaleManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.LocaleManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The configuration data for locales.
     * @name FORGE.LocaleManager#_config
     * @type {?I18nConfig}
     * @private
     */
    this._config = null;

    /**
     * List of locales.
     * @name FORGE.LocaleManager#_locales
     * @type {FORGE.Collection}
     * @private
     */
    this._locales = null;

    /**
     * The current locale index.
     * @name FORGE.LocaleManager#_localeIndex
     * @type {number}
     * @private
     */
    this._localeIndex = -1;

    /**
     * The default locale index.
     * Set once for all viewer data.
     * @name FORGE.LocaleManager#_defaultLocale
     * @type {string}
     * @private
     */
    this._defaultLocale = "";

    /**
     * Is i18n enabled?
     * Set once for all viewer data.
     * @name FORGE.LocaleManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * On local change event dispatcher.
     * @name  FORGE.LocaleManager#_onLocaleChangeRequest
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLocaleChangeRequest = null;

    /**
     * On local change completed event dispatcher.
     * @name  FORGE.LocaleManager#_onLocaleChangeComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLocaleChangeComplete = null;

    FORGE.BaseObject.call(this, "LocaleManager");

    this._boot();
};

FORGE.LocaleManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.LocaleManager.prototype.constructor = FORGE.LocaleManager;

/**
 * Boot sequence for viewer only.
 * @method FORGE.LocaleManager#_boot
 * @private
 */
FORGE.LocaleManager.prototype._boot = function()
{
    this.log("FORGE.LocaleManager._boot();");

    this._locales = new FORGE.Collection();
};

/**
 * Add i18n configuration data.
 * @method FORGE.LocaleManager#addConfig
 * @param {I18nConfig} config - The configuration data.
 */
FORGE.LocaleManager.prototype.addConfig = function(config)
{
    this._parseConfig(config);
};

/**
 * Parse the configuration data of a i18n node.
 * @method FORGE.LocaleManager#_parseConfig
 * @param {I18nConfig} config - The configuration data.
 * @private
 */
FORGE.LocaleManager.prototype._parseConfig = function(config)
{
    this._config = config;

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;

    if (typeof config.auto !== "undefined" && config.auto === true && FORGE.Device.language !== "")
    {
        this._defaultLocale = FORGE.Device.language; //change the default config option
    }
    else if (typeof config.default === "string")
    {
        this._defaultLocale = config.default;
    }

    if (this._enabled === false)
    {
        this.warn("FORGE.LocaleManager: locale management is deactivated");
        return;
    }

    if (typeof config.locales !== "undefined")
    {
        var configLength = config.locales.length;
        var currentLocaleLoaded = false;

        for (var i = 0, ii = configLength; i < ii; i++)
        {
            if (this._addLocale(config.locales[i]) === true)
            {
                currentLocaleLoaded = true;
            }
        }

        // if nothing is loaded, load the first locale found
        if (currentLocaleLoaded === false)
        {
            // set the default locale for the manager only once
            if (this._indexOfLocale(this._defaultLocale) === -1)
            {
                this._defaultLocale = config.locales[0].uid;
            }
            this._setLocaleIndex(this._indexOfLocale(config.locales[0].uid));
        }
    }
};

/**
 * Search index position for a locale.
 * @method FORGE.LocaleManager#_indexOfLocale
 * @param {string} uid - The locale UID.
 * @private
 */
FORGE.LocaleManager.prototype._indexOfLocale = function(uid)
{
    var locale;

    for (var i = 0, ii = this._locales.size; i < ii; i++)
    {
        locale = this._locales.get(i);

        if (locale.uid.toLowerCase() === uid.toLowerCase())
        {
            return i;
        }
    }

    return -1;
};

/**
 * Set the index position for the locale.
 * @method FORGE.LocaleManager#_setLocaleIndex
 * @param {number} index - The locale index.
 * @private
 */
FORGE.LocaleManager.prototype._setLocaleIndex = function(index)
{
    if (index < 0 || index >= this._locales.size)
    {
        throw "The locale you are trying to set doesn't exist";
    }

    if (this._localeIndex === index)
    {
        this.warn("FORGE.LocaleManager: You're trying to set a locale that is already the actual locale");
        return;
    }

    this._localeIndex = index;

    if (this._onLocaleChangeRequest !== null)
    {
        this._onLocaleChangeRequest.dispatch();
    }

    this._locales.get(this._localeIndex).loadFiles();
};

/**
 * Add a locale.
 * @method FORGE.LocaleManager#_addLocale
 * @param {I18nLocaleConfig} config - The configuration data.
 * @return {boolean} The current locale files have been loaded?
 * @private
 */
FORGE.LocaleManager.prototype._addLocale = function(config)
{
    var locale;
    var i = this._indexOfLocale(config.uid);

    if (i === -1)
    {
        locale = new FORGE.Locale(this._viewer);
        locale.onLocaleAllFilesLoaded.add(this._localeAllFilesLoaded, this);

        i = this._locales.add(locale) - 1;
    }
    else
    {
        locale = this._locales.get(i);
    }

    locale.addConfig(config);

    // If this is the current locale in use, load the files
    if (i === this._localeIndex || this._defaultLocale.toLowerCase() === config.uid.toLowerCase())
    {
        locale.loadFiles();

        if (this._localeIndex === -1)
        {
            this._setLocaleIndex(i);
        }

        return true;
    }

    return false;
};

/**
 * Verify if all local files are loaded.
 * @method FORGE.LocaleManager#_localeAllFilesLoaded
 * @private
 */
FORGE.LocaleManager.prototype._localeAllFilesLoaded = function()
{
    this.log("FORGE.LocaleManager._localeAllFilesLoaded();");

    if (this._onLocaleChangeComplete !== null)
    {
        this._onLocaleChangeComplete.dispatch();
    }
};

/**
 * Get value of for a selected locale.
 * @method FORGE.LocaleManager#getValue
 * @param {string} key - The key to get locale data.
 * @param {?string=} jsonKey - The json key to search into a specific file.
 * @return {string} Returns the locale value.
 */
FORGE.LocaleManager.prototype.getValue = function(key, jsonKey)
{
    if (this._localeIndex === -1)
    {
        this.warn("FORGE.LocaleManager: You trying to get a value with no locale selected!");
        return key;
    }

    var value = this._locales.get(this._localeIndex).getValue(key, jsonKey);
    var defaultLocalIndex = this._indexOfLocale(this._defaultLocale);
    if (this._localeIndex !== defaultLocalIndex && defaultLocalIndex !== -1 && value === key)
    {
        //if not found, get the default locale value
        value = this._locales.get(defaultLocalIndex).getValue(key, jsonKey);
    }
    return value;
};

/**
 * Is the selected locale has a value?
 * @method FORGE.LocaleManager#hasValue
 * @param {string} key - The key to get locale data.
 * @param {?string=} jsonKey - The json key to search into a specific file.
 * @return {boolean} Returns true if the locale has a value.
 */
FORGE.LocaleManager.prototype.hasValue = function(key, jsonKey)
{
    if (this._localeIndex === -1)
    {
        return false;
    }

    var available = this._locales.get(this._localeIndex).hasValue(key, jsonKey);
    var defaultLocalIndex = this._indexOfLocale(this._defaultLocale);
    if (this._localeIndex !== defaultLocalIndex && defaultLocalIndex !== -1 && available === false)
    {
        //if not found, return result from the default locale
        available = this._locales.get(defaultLocalIndex).hasValue(key, jsonKey);
    }
    return available;
};

/**
 * Destroy method.
 * @method FORGE.LocaleManager#destroy
 */
FORGE.LocaleManager.prototype.destroy = function()
{
    this._viewer = null;

    if (this._locales !== null)
    {
        for (var i = 0, ii = this._locales.size; i < ii; i++)
        {
            this._locales.get(i).destroy();
        }
        this._locales = null;
    }

    if (this._onLocaleChangeRequest !== null)
    {
        this._onLocaleChangeRequest.destroy();
        this._onLocaleChangeRequest = null;
    }

    if (this._onLocaleChangeComplete !== null)
    {
        this._onLocaleChangeComplete.destroy();
        this._onLocaleChangeComplete = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the locale UID.
 * @name FORGE.LocaleManager#locale
 * @type {string}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "locale",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        if (this._localeIndex !== -1)
        {
            return this._locales.get(this._localeIndex).uid;
        }
        else
        {
            return "";
        }
    },

    /** @this {FORGE.LocaleManager} */
    set: function(value)
    {
        var index;

        if (typeof value === "number" && value < this._locales.size)
        {
            index = value;
        }
        else if (typeof value === "string")
        {
            index = this._indexOfLocale(value);
        }

        this._setLocaleIndex(index);
    }

});

/**
 * Get and set the locale index.
 * @name FORGE.LocaleManager#localeIndex
 * @type {number}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "localeIndex",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        return this._localeIndex;
    },

    /** @this {FORGE.LocaleManager} */
    set: function(value)
    {
        if (typeof value === "number" && value < this._locales.size)
        {
            this._setLocaleIndex(value);
        }

    }

});

/**
 * Get the current locale object.
 * @name FORGE.LocaleManager#localeObject
 * @readonly
 * @type {FORGE.Locale}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "localeObject",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        if (this._localeIndex !== -1)
        {
            return this._locales.get(this._localeIndex);
        }
        else
        {
            return null;
        }
    }
});

/**
 * Get and set the locales UID list.
 * @name FORGE.LocaleManager#locales
 * @type {Array}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "locales",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        var locales = [];

        for (var i = 0, ii = this._locales.size; i < ii; i++)
        {
            locales.push(this._locales.get(i).uid);
        }

        return locales;
    }

});

/**
 * Get the "onLocaleChangeRequest" {@link FORGE.EventDispatcher} of the LocaleManager.
 * @name FORGE.LocaleManager#onLocaleChangeRequest
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "onLocaleChangeRequest",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        if (this._onLocaleChangeRequest === null)
        {
            this._onLocaleChangeRequest = new FORGE.EventDispatcher(this);
        }

        return this._onLocaleChangeRequest;
    }
});

/**
 * Get the "onLocaleChangeComplete" {@link FORGE.EventDispatcher} of the LocaleManager.
 * @name FORGE.LocaleManager#onLocaleChangeComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.LocaleManager.prototype, "onLocaleChangeComplete",
{
    /** @this {FORGE.LocaleManager} */
    get: function()
    {
        if (this._onLocaleChangeComplete === null)
        {
            this._onLocaleChangeComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLocaleChangeComplete;
    }
});