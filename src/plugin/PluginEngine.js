
/**
 * A plugin Engine handle the javascript files to load, and the constructor.
 *
 * @constructor FORGE.PluginEngine
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo  In the sources list (in plugin manifest), add possibility to specify type (script or css) for special cases.
 */
FORGE.PluginEngine = function(viewer)
{
    FORGE.BaseObject.call(this, "PluginEngine");

    /**
     * The viewer reference.
     * @name FORGE.PluginEngine#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config of the plugin engine.
     * @name  FORGE.PluginEngine#_config
     * @type {?PluginEngineConfig}
     * @private
     */
    this._config = null;

    /**
     * The URL prefix for the engine, if not specified, will be the global URL prefix.
     * @name FORGE.PluginEngine#_prefix
     * @type {string}
     * @private
     */
    this._prefix = "";

    /**
     * The url of the plugin engine relative to the prefix location.
     * @name  FORGE.PluginEngine#_url
     * @type {?string}
     * @private
     */
    this._url = "";

    /**
     * The manifest json file name.
     * @name  FORGE.PluginEngine#_manifest
     * @type {string}
     * @private
     */
    this._manifest = "";

    /**
     * The full url of the plugin folder (prefix + url)
     * @name FORGE.PluginEngine#_fullUrl
     * @type {string}
     * @private
     */
    this._fullUrl = "";

    /**
     * The manifest is a json data that describes the plugin engine.
     * @name FORGE.PluginEngine#_manifestData
     * @type {?PluginManifest}
     * @private
     */
    this._manifestData = null;

    /**
     * The name of the plugin engine.
     * @name FORGE.PluginEngine#_name
     * @type {?string}
     * @private
     */
    this._name = "";

    /**
     * The version of the plugin engine.
     * @name FORGE.PluginEngine#_version
     * @type {?string}
     * @private
     */
    this._version = "";

    /**
     * The sources of the plugin engine.
     * @name FORGE.PluginEngine#_sources
     * @type {Array<string>}
     * @private
     */
    this._sources = null;

    /**
     * The name of the constructor of the plugin engine.
     * @name FORGE.PluginEngine#_constructorName
     * @type {string}
     * @private
     */
    this._constructorName = "";

    /**
     * The constructor function reference of the plugin engine.
     * @name  FORGE.PluginEngine#_constructorFunction
     * @type {Function}
     * @private
     */
    this._constructorFunction = null;

    /**
     * i18n configuration.
     * @name FORGE.PluginEngine#_i18n
     * @type {Object}
     * @private
     */
    this._i18n = null;

    /**
     * Object that handles customization options.
     * @name FORGE.PluginEngine#_options
     * @type {Object}
     * @private
     */
    this._options = null;

    /**
     * The events of the engine on which you can bind an action.
     * @name FORGE.PluginEngine#_events
     * @type {Object}
     * @private
     */
    this._events = null;

    /**
     * On a plugin engine, actions is an array of exposed method names.
     * @name FORGE.PluginEngine#_actions
     * @type {Array<Object>}
     * @private
     */
    this._actions = null;

    /**
     * Internal counter for loaded source files.
     * @name FORGE.PluginEngine#_sourcesLoadedCount
     * @type {number}
     * @private
     */
    this._sourcesLoadedCount = 0;

    /**
     * Number of instances that are created from this engine.
     * @name FORGE.PluginEngine#_instanceCount
     * @type {number}
     * @private
     */
    this._instancesCount = 0;

    /**
     * Is this plugin engine is considered as loaded.
     * @name FORGE.PluginEngine#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    /**
     * Event dipatcher for load complete.
     * @name FORGE.PluginEngine#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;
};

FORGE.PluginEngine.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PluginEngine.prototype.constructor = FORGE.PluginEngine;

/**
 * List of required method on a plugn engine.
 * @name FORGE.PluginEngine._REQUIRED
 * @type {Array<string>}
 * @const
 * @private
 */
FORGE.PluginEngine._REQUIRED = ["boot", "destroy"];

/**
 * List of reserved keyword on a plugn engine.
 * @name FORGE.PluginEngine._RESERVED
 * @type {Array<string>}
 * @const
 * @private
 */
FORGE.PluginEngine._RESERVED = ["viewer", "plugin"];

/**
 * Load a configuration for the plugin engine,<br>
 * the config describes the manifest url and the engine identification.
 * @method FORGE.PluginEngine#load
 * @param {PluginEngineConfig} config - The config of the plugin engine.
 * @return {boolean} Returns true if the engine is loaded.
 */
FORGE.PluginEngine.prototype.load = function(config)
{
    if(typeof config !== "undefined")
    {
        this._config = config;

        this._parseConfig(this._config);

        var manifestUrl = this._fullUrl + this._manifest;

        this._loadManifest(manifestUrl);

        return true;
    }

    return false;
};

/**
 * Get a new instance of the engine and associate it to a {@link FORGE.Plugin} Object.
 * @method FORGE.PluginEngine#getNewInstance
 * @param  {FORGE.Viewer} viewer - The viewer attached to this instance.
 * @param  {FORGE.Plugin} plugin - The plugin who will represent this instance.
 * @return {?PluginStructure} Returns the instance of the engine.
 */
FORGE.PluginEngine.prototype.getNewInstance = function(viewer, plugin)
{
    var instance = /** @type {PluginStructure} */ (new this._constructorFunction());

    if(this._validateInstance(instance))
    {
        instance._viewer = viewer;
        instance._plugin = plugin;

        this._instancesCount++;

        return instance;
    }

    return null;
};

/**
 * Parse a plugin engine configuration.
 * @method FORGE.PluginEngine#_parseConfig
 * @param  {PluginEngineConfig} config - The configuration to parse.
 * @private
 */
FORGE.PluginEngine.prototype._parseConfig = function(config)
{
    if(typeof config.uid === "undefined")
    {
        throw "Can't load a plugin engine, missing id in config";
    }

    this._uid = config.uid;
    this._register();

    this._prefix = (typeof config.prefix === "string") ? config.prefix : this._viewer.plugins.prefix;

    if(typeof config.url === "undefined")
    {
        throw "Can't load a plugin engine, missing url in config";
    }
    this._url = config.url;

    this._fullUrl = this._prefix + this._url;

    this._manifest = (typeof config.manifest === "string") ? config.manifest : "manifest.json";
};

/**
 * Internal method to load the engine manifest.
 * @method FORGE.PluginEngine#_loadManifest
 * @param  {string} url - The url of the manifest to load.
 * @private
 */
FORGE.PluginEngine.prototype._loadManifest = function(url)
{
    this._viewer.load.json(this._uid, url, this._manifestLoadComplete, this);
};

/**
 * Handler for the manifest load complete.
 * @method FORGE.PluginEngine#_manifestLoadComplete
 * @private
 * @param  {FORGE.File} file - The  manifest {@link FORGE.File}.
 */
FORGE.PluginEngine.prototype._manifestLoadComplete = function(file)
{
    var json = this._viewer.cache.get(FORGE.Cache.types.JSON, file.key);

    this._manifestData = /** @type {PluginManifest} */ (json.data);
    this._parseManifest(this._manifestData);

    this.log("FORGE.Plugin._manifestLoadComplete();");
};

/**
 * Handler for the manifest load error.
 * @method FORGE.PluginEngine#_manifestLoadError
 * @private
 * @param  {FORGE.File} file - The  manifest {@link FORGE.File}.
 */
FORGE.PluginEngine.prototype._manifestLoadError = function(file)
{
    throw "Can't load the plugin engine manifest "+file.url;
};

/**
 * Internal method to parse the loaded manifest file.
 * @method FORGE.PluginEngine#_parseManifest
 * @private
 * @param  {PluginManifest} manifest - Manifest object to parse.
 * @suppress {checkTypes}
 * @todo  need to change manifest.constructor to another keyword (not reserved)
 */
FORGE.PluginEngine.prototype._parseManifest = function(manifest)
{
    if(this._uid !== manifest.uid)
    {
        throw "Plugin Engine UID doesn't match with manifest UID";
    }

    if(this._versionCheck(manifest.viewer) === false)
    {
        this.warn("Version compatibility check for plugin "+manifest.uid+" failed!");
        this.warn(manifest.viewer);
        return;
    }

    if(FORGE.Device.check(manifest.device) === false)
    {
        this.warn("Device compatibility check for plugin "+manifest.uid+" failed!");
        this.warn(manifest.device);
        return;
    }

    if(typeof manifest.options !== "undefined")
    {
        this._options = manifest.options;
    }

    if(typeof manifest.data !== "undefined")
    {
        this._data = manifest.data;
    }

    if(typeof manifest.actions !== "undefined")
    {
        this._actions = manifest.actions;
    }

    if(typeof manifest.events !== "undefined")
    {
        this._events = manifest.events;
    }

    this._name = manifest.name;
    this._version = manifest.version;
    this._sources = manifest.sources;
    this._constructorName = manifest.constructor;
    this._i18n = this._parseLocales(manifest);

    this._loadSources(this._sources);
};

/**
 * Compare FORGE.VERSION with a minimal and maximal compatibility version.
 * @method FORGE.PluginEngine#_versionCheck
 * @private
 * @param  {Object} config - The viewer version configuration object that contain min and max compatible version of the viewer for the plugin.
 * @return {boolean} Returns true if the plugin is compatible with the current FORGE.VERSION, false if not.
 */
FORGE.PluginEngine.prototype._versionCheck = function(config)
{
    var min = "0.0.0";
    var max = "9.9.9";

    if(typeof config !== "undefined")
    {
        if(typeof config.min !== "undefined")
        {
            min = config.min;
        }

        if(typeof config.max !== "undefined")
        {
            max = config.max;
        }
    }

    var viewerVersion = FORGE.VERSION.split(".");
    var minVersion = min.split(".");
    var maxVersion = max.split(".");
    var maxLength = Math.max(viewerVersion.length, minVersion.length, maxVersion.length);

    var viewerN = 0;
    var minN = 0;
    var maxN = 0;
    var inc = 1;
    for(var i = maxLength - 1; i >= 0; i--)
    {
        if(typeof viewerVersion[i] !== "undefined")
        {
            viewerN += parseInt(viewerVersion[i], 10) * inc;
        }
        if(typeof minVersion[i] !== "undefined")
        {
            minN += parseInt(minVersion[i], 10) * inc;
        }
        if(typeof maxVersion[i] !== "undefined")
        {
            maxN += parseInt(maxVersion[i], 10) * inc;
        }

        inc *= 10;
    }

    if(viewerN < minN || viewerN > maxN)
    {
        return false;
    }

    return true;
};

/**
 * Internal method to load a list of sources files of the engine.
 * @method FORGE.PluginEngine#_loadSources
 * @private
 * @param  {Array<string>} sources - Array of urls of files to load relative sto the base url of the engine.
 */
FORGE.PluginEngine.prototype._loadSources = function(sources)
{
    var sourceUrl;
    for(var i = 0, ii = sources.length; i < ii; i++)
    {
        //If source is an absolute URL
        if(String(sources[i]).substring(0, 7) === "http://" || String(sources[i]).substring(0, 8) === "https://")
        {
            sourceUrl = sources[i];
        }
        // Else it is relative to the plugin folder
        else
        {
            sourceUrl = this._fullUrl + sources[i];
        }

        this._loadSource(sourceUrl);
    }
};

/**
 * Load a single source file file.
 * @method  FORGE.PluginEngine#_loadSource
 * @private
 * @param {string} url - Url of the file to load.
 */
FORGE.PluginEngine.prototype._loadSource = function(url)
{
    var parsedURL = FORGE.URL.parse(url);

    if( parsedURL.extension === "css")
    {
        this._viewer.load.css(url, this._loadSourceComplete, this);
    }
    else
    {
        this._viewer.load.script(url, this._loadSourceComplete, this);
    }
};

/**
 * Handler for the load source complete.
 * @method FORGE.PluginEngine#_loadSourceComplete
 * @private
 */
FORGE.PluginEngine.prototype._loadSourceComplete = function()
{
    this._sourcesLoadedCount++;

    if(this._sourcesLoadedCount === this._sources.length)
    {
        this._constructorFunction = this._parseConstructor(this._constructorName);

        if(this._validateEngine() === true)
        {
            this._addLocales(this._i18n);

            this._loaded = true;

            if(this._onLoadComplete !== null)
            {
                this._onLoadComplete.dispatch();
            }
        }
    }
};

/**
 * Add the locale configuration to the i18n global manager.
 * @method FORGE.PluginEngine#_addlocales
 * @private
 * @param {Object} i18n - The i18n config to add.
 */
FORGE.PluginEngine.prototype._addLocales = function(i18n)
{
    if(i18n !== null)
    {
        this._viewer.i18n.addConfig(i18n);
    }
};

/**
 * For i18n, we check nodes for files and redefine the url for the loading of files<br>
 * with a path relative to the root of the project.
 * @method  FORGE.PluginEngine#_parseLocales
 * @private
 * @param  {Object} manifest - The manifest passed by the main parser.
 * @return {Object} The updated i18n object with paths relative to the project.
 */
FORGE.PluginEngine.prototype._parseLocales = function(manifest)
{
    var i18n = null;

    if(typeof manifest.i18n !== "undefined")
    {
        i18n = manifest.i18n;
        if(typeof i18n.locales !== "undefined")
        {
            var locale;
            for(var i = 0, ii = i18n.locales.length; i < ii; i++)
            {
                locale = i18n.locales[i];
                if(typeof locale.files !== "undefined")
                {
                    var file;
                    for(var j = 0, jj = locale.files.length; j < jj; j++)
                    {
                        file = locale.files[j];
                        file.key = this._uid + "-" + file.key;
                        file.url = this._fullUrl + file.url;
                    }
                }
            }
        }
    }

    return i18n;
};

/**
 * Parse the constructor string.
 * @method FORGE.PluginEngine#_parseConstructor
 * @param {string} constructorName - The constructor name to parse. (ex: "Namespace.PluginConstructor")
 * @return {Function} Return the found constructor function, null if not found
 * @private
 */
FORGE.PluginEngine.prototype._parseConstructor = function(constructorName)
{
    if(typeof constructorName === "string" && constructorName !== "")
    {
        var pathArray = constructorName.split(".");
        var currentObject = window;
        for(var i = 0, ii = pathArray.length; i < ii; i++)
        {
            if(i === pathArray.length - 1 && typeof currentObject[pathArray[i]] === "function")
            {
                return currentObject[pathArray[i]];
            }
            else if(typeof currentObject[pathArray[i]] === "object")
            {
                currentObject = currentObject[pathArray[i]];
            }
            else
            {
                return null;
            }
        }
    }

    return null;
};

/**
 * Internal method to validate the instance.
 * @method FORGE.PluginEngine#_validateEngine
 * @private
 * @return {boolean} Returns true if the engine instance is valid.
 */
FORGE.PluginEngine.prototype._validateEngine = function()
{
    if(this._constructorFunction === null || typeof this._constructorFunction !== "function")
    {
        throw "Plugin engine "+this._uid+" can't find it's constructor";
    }

    for(var i = 0, ii = FORGE.PluginEngine._REQUIRED.length; i < ii; i++)
    {
        if(typeof this._constructorFunction.prototype[FORGE.PluginEngine._REQUIRED[i]] !== "function")
        {
            throw "FORGE.PluginEngine engine validation failed, missing required method "+FORGE.PluginEngine._REQUIRED[i]+" on plugin engine "+this._name;
        }
    }

    //Add a readonly reference of the viewer to the plugin engine instance.
    Object.defineProperty(this._constructorFunction.prototype, "viewer",
    {
        /** @this {FORGE.PluginEngine} */
        get: function()
        {
            return this._viewer;
        }
    });

    //Add a readonly reference of the plugin to the plugin engine instance.
    Object.defineProperty(this._constructorFunction.prototype, "plugin",
    {
        // This annotation is not really true
        /** @this {FORGE.PluginObjectFactory} */
        get: function()
        {
            return this._plugin;
        }
    });

    return true;
};

/**
 * Internal method to validate that the instance do not use one of the reserved keywords.
 * @method FORGE.PluginEngine#_validateReserved
 * @private
 * @param  {Object} instance - The instance to validate.
 * @return {boolean} Returns true if no reserved keywords are in use on the instance.
 */
FORGE.PluginEngine.prototype._validateReserved = function(instance)
{
    for(var i = 0, ii = FORGE.PluginEngine._RESERVED.length; i < ii; i++)
    {
        if(typeof instance[FORGE.PluginEngine._RESERVED[i]] !== "undefined")
        {
            throw "FORGE.PluginEngine instance validation failed, "+FORGE.PluginEngine._RESERVED[i]+" is reserved";
        }
    }

    return true;
};

/**
 * Internal method to validate that the actions listed on the manifest are part of the instance.
 * @method FORGE.PluginEngine#_validateActions
 * @private
 * @param  {Object} instance - The instance to validate.
 * @return {boolean} Returns true if actions are valid on the instance.
 */
FORGE.PluginEngine.prototype._validateActions = function(instance)
{
    if(this._actions === null)
    {
        return true;
    }

    for(var i = 0, ii = this._actions.length; i < ii; i++)
    {
        if(typeof instance[this._actions[i]] !== "function")
        {
            throw "FORGE.PluginEngine instance validation failed, action "+this._actions[i]+" is undefined on plugin "+this._constructorName;
        }
    }

    return true;
};

/**
 * This method validate the instace by testing both reserved keywords and actions.
 * @method FORGE.PluginEngine#_validateEngine
 * @private
 * @param  {Object} instance - The instance to validate.
 * @return {boolean} Returns true if the instance is valid.
 */
FORGE.PluginEngine.prototype._validateInstance = function(instance)
{
    return (this._validateReserved(instance) === true && this._validateActions(instance) === true);
};

/**
 * Destroy method.
 * @method FORGE.PluginEngine#destroy
 */
FORGE.PluginEngine.prototype.destroy = function()
{
    this._viewer = null;
    this._config = null;
    this._manifestData = null;
    this._name = null;
    this._version = null;
    this._sources = null;
    this._constructorFunction = null;
    this._i18n = null;

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the name of this plugin engine.
 * @name FORGE.PluginEngine#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "name",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._name;
    }
});

/**
 * Get the loaded status of this plugin engine.
 * True if the plugin is considered as loaded.
 * @name FORGE.PluginEngine#loaded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "loaded",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._loaded;
    }
});

/**
 * Get the base url of the plugin engine.
 * @name FORGE.PluginEngine#url
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "url",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._url;
    }
});

/**
 * Get the base url of the plugin engine.
 * @name FORGE.PluginEngine#fullUrl
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "fullUrl",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._fullUrl;
    }
});

/**
 * Get the options of the plugin engine.
 * @name FORGE.PluginEngine#options
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "options",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._options;
    }
});

/**
 * Get the available actions of the plugin engine.
 * @name FORGE.PluginEngine#actions
 * @readonly
 * @type {Array<String>}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "actions",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._actions;
    }
});

/**
 * Get the available events of the plugin engine.
 * @name FORGE.PluginEngine#events
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "events",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        return this._events;
    }
});

/**
 * Get the default plugin configuration that contains (data + options + actions + events).
 * @name FORGE.PluginEngine#defaultConfig
 * @readonly
 * @type {PluginConfiguration}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "defaultConfig",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        /** @type {PluginConfiguration} */
        var config =
        {
            data: /** @type {Object} */ (this._data),
            options: this._options,
            actions: this._actions,
            events: this._events
        };

        return config;
    }
});

/**
 * Get the on load complete {@link FORGE.EventDispatcher} of the plugin engine.
 * @name FORGE.PluginEngine#onLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PluginEngine.prototype, "onLoadComplete",
{
    /** @this {FORGE.PluginEngine} */
    get: function()
    {
        if(this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});
