
/**
 * Locale.
 * @constructor FORGE.Locale
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo If you duplicate a plugin, locale file loaded count is superior than file count
 */
FORGE.Locale = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.Locale#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Name of the locale.
     * @name FORGE.Locale#_name
     * @type {string}
     * @private
     */
    this._name = "";

    /**
     * List of the files.
     * @name FORGE.Locale#_files
     * @type {FORGE.Collection}
     * @private
     */
    this._files = null;

    /**
     * On file loaded event dispatcher.
     * @name  FORGE.Locale#onLocaleFileLoaded
     * @type {FORGE.EventDispatcher}
     */
    this.onLocaleFileLoaded = null;

    /**
     * On all files loaded event dispatcher.
     * @name  FORGE.Locale#onLocaleAllFilesLoaded
     * @type {FORGE.EventDispatcher}
     */
    this.onLocaleAllFilesLoaded = null;

    FORGE.BaseObject.call(this, "Locale");

    this._boot();
};

FORGE.Locale.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Locale.prototype.constructor = FORGE.Locale;

/**
 * Boot sequence.
 * @method FORGE.Locale#_boot
 * @private
 */
FORGE.Locale.prototype._boot = function()
{
    this._files = new FORGE.Collection();

    this.onLocaleFileLoaded = new FORGE.EventDispatcher(this);

    this.onLocaleAllFilesLoaded = new FORGE.EventDispatcher(this);
};

/**
 * Add configuration files.
 * @method FORGE.Locale#addConfig
 * @param {I18nLocaleConfig} config - The configuration data.
 */
FORGE.Locale.prototype.addConfig = function(config)
{
    if(typeof config.uid === "string")
    {
        this._uid = config.uid;
    }

    if(this._name === "" && typeof config.name === "string")
    {
        this._name = config.name;
    }

    if(typeof config.files !== "undefined")
    {
        var file;

        for(var i = 0, ii = config.files.length; i < ii; i++)
        {
            file = /** @type I18nLocaleFileConfig */ (config.files[i]);
            if(this._getFileByKey(file.key) === null)
            {
                file.loading = false;
                file.loaded = false;
                this._files.add(file);
            }
        }
    }

    this.log("Locale.addConfig(); number of files : "+this._files.size);
};

/**
 * Load configuration files.
 * @method FORGE.Locale#loadFiles
 */
FORGE.Locale.prototype.loadFiles = function()
{
    if(this._isAllFilesLoaded() === true)
    {
        this.onLocaleAllFilesLoaded.dispatch();
        return true;
    }

    var file;
    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = /** @type {FORGE.File} */ (this._files.get(i));

        if(file.loading === false && file.loaded === false)
        {
            this._loadFile(file);
        }
    }
};

/**
 * Get a file by key.
 * @method FORGE.Locale#_getFileByKey
 * @param {string} key - The key to search for a file.
 * @private
 */
FORGE.Locale.prototype._getFileByKey = function(key)
{
    var file;

    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = this._files.get(i);

        if(file.key === key)
        {
            return file;
        }
    }

    return null;
};

/**
 * Load a file.
 * @method FORGE.Locale#_loadFile
 * @param {FORGE.File} file - The file to load.
 * @private
 */
FORGE.Locale.prototype._loadFile = function(file)
{
    if(file.loading === false && file.loaded === false)
    {
        file.loading = true;
        this._viewer.load.json(file.key, file.url, this._loadFileComplete, this);
    }
};

/**
 * Load of a file is completed.
 * @method FORGE.Locale#_loadFileComplete
 * @param {FORGE.File} file - The file loaded.
 * @private
 */
FORGE.Locale.prototype._loadFileComplete = function(file)
{
    var _file = this._getFileByKey(file.key);
    _file.loading = false; //Loading is ended
    _file.loaded = true; //Load is complete

    this.log("loadFileComplete(); "+_file.key);

    this.onLocaleFileLoaded.dispatch();

    if(this._isAllFilesLoaded() === true)
    {
        this.onLocaleAllFilesLoaded.dispatch();
    }
};

/**
 * Verify if all files are loaded.
 * @method FORGE.Locale#_isAllFilesLoaded
 * @return {boolean} Returns true if all files are loaded.
 * @private
 */
FORGE.Locale.prototype._isAllFilesLoaded = function()
{
    var file;

    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = this._files.get(i);

        if(file.loaded === false)
        {
            return false;
        }
    }

    return true;
};

/**
 * Get the locale value.
 * @method FORGE.Locale#getValue
 * @param {string} key - The key to search for a locale.
 * @param {?string=} jsonKey - The json key to search into a specific file.
 * @return {string} The key to search for a locale.
 */
FORGE.Locale.prototype.getValue = function(key, jsonKey)
{
    var file, json;
    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = this._files.get(i);

        if(this._viewer.cache.has(FORGE.Cache.types.JSON, file.key) === true && (typeof jsonKey === "undefined" || jsonKey === file.key))
        {
            json = this._viewer.cache.get(FORGE.Cache.types.JSON, file.key);

            if(typeof json.data[key] !== "undefined")
            {
                return json.data[key];
            }
        }
    }

    if (typeof jsonKey !== "undefined")
    {
        this.warn("FORGE.Locale: value not found into the specified JSON file, try to find it in all files.");
        this.getValue(key);
    }

    return key;
};

/**
 * Locale has a value?
 * @method FORGE.Locale#hasValue
 * @param {string} key - The key to search for a locale.
 * @param {?string=} jsonKey - The json key to search into a specific file.
 * @return {boolean} Returns true if the locale has a value stored.
 */
FORGE.Locale.prototype.hasValue = function(key, jsonKey)
{
    var file, json;
    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = this._files.get(i);

        if(this._viewer.cache.has(FORGE.Cache.types.JSON, file.key) === true && (typeof jsonKey === "undefined" || jsonKey === file.key))
        {
            json = this._viewer.cache.get(FORGE.Cache.types.JSON, file.key);

            if(typeof json.data[key] !== "undefined")
            {
                return true;
            }
        }
    }

    if (typeof jsonKey !== "undefined")
    {
        this.warn("FORGE.Locale: key not found into the specified JSON file, try to find it in all files.");
        this.hasValue(key);
    }

    return false;
};

/**
 * Get the key of an i18n value.
 * @method  FORGE.Locale#getKey
 * @param  {string} value - The value associated to the key you want.
 * @param  {?string=} jsonKey - The json key to search into a specific file.
 * @return {string|undefined} Returns the key associated to the value if found, undefined if not.
 */
FORGE.Locale.prototype.getKey = function(value, jsonKey)
{
    var file, json;
    for(var i = 0, ii = this._files.size; i < ii; i++)
    {
        file = /** @type {FORGE.File} */ (this._files.get(i));

        if(this._viewer.cache.has(FORGE.Cache.types.JSON, file.key) === true && (typeof jsonKey === "undefined" || jsonKey === file.key))
        {
            json = this._viewer.cache.get(FORGE.Cache.types.JSON, file.key);

            for(var key in json.data)
            {
                if(json.data[key] === value)
                {
                    return key;
                }
            }
        }
    }

    if (typeof jsonKey !== "undefined")
    {
        this.warn("FORGE.Locale: value not found into the specified JSON file, try to find it in all files.");
        this.getKey(value);
    }

    return undefined;
};

/**
 * Destroy method.
 * @method FORGE.Locale#destroy
 */
FORGE.Locale.prototype.destroy = function()
{
    this._viewer = null;
    this._files = null;

    this.onLocaleFileLoaded.destroy();
    this.onLocaleFileLoaded = null;

    this.onLocaleAllFilesLoaded.destroy();
    this.onLocaleAllFilesLoaded = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the name of the locale.
* @name FORGE.Local#name
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.Locale.prototype, "name",
{
    /** @this {FORGE.Locale} */
    get: function()
    {
        return this._name;
    }
});
