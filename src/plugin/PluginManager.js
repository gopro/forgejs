
/**
 * The FORGE.PluginManager manages {@link FORGE.PluginEngine} and {@link FORGE.Plugin}.
 *
 * @constructor FORGE.PluginManager
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.PluginManager = function(viewer)
{
    FORGE.BaseObject.call(this, "PluginManager");

    /**
     * The viewer reference.
     * @name FORGE.PluginManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Config of the plugins
     * @name  FORGE.PluginManager#_config
     * @type {PluginsConfig}
     * @private
     */
    this._config;

    /**
     * Does the plugin manager is enabled ?
     * @name  FORGE.PluginManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Prefix url for the global plugins folder.
     * @name FORGE.PluginManager#_prefix
     * @type {string}
     * @private
     */
    this._prefix = "";

    /**
     * The engines list.
     * @name FORGE.PluginManager#_engines
     * @type {FORGE.Collection<FORGE.PluginEngine>}
     * @private
     */
    this._engines = null;

    /**
     * The plugins list.
     * @name FORGE.PluginManager#_plugins
     * @type {FORGE.Collection<FORGE.Plugin>}
     * @private
     */
    this._plugins = null;

    /**
     * Event dispatcher for instance creation
     * @name  FORGE.PluginManager#_onInstanceCreate
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onInstanceCreate = null;
};

FORGE.PluginManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PluginManager.prototype.constructor = FORGE.PluginManager;

/**
 * Boot sequence. Called by the viewer by the exposed boot method.
 * @method FORGE.PluginManager#_boot
 * @private
 */
FORGE.PluginManager.prototype._boot = function(config)
{
    this._engines = new FORGE.Collection();
    this._plugins = new FORGE.Collection();

    this._viewer.story.onSceneLoadStart.add(this._sceneLoadStartHandler, this);
    this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);
};

/**
 * Parse the main plugin config.
 * @method FORGE.PluginManager#_parseMainConfig
 * @param {PluginsConfig} config - The configuration of the main plugins node to parse.
 * @private
 */
FORGE.PluginManager.prototype._parseMainConfig = function(config)
{
    this._config = config;

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;
    this._prefix = (typeof config.prefix === "string") ? config.prefix : "./plugins/";

    this._parseConfig(this._config);
};

/**
 * Parse a plugin config.
 * @method FORGE.PluginManager#_parseConfig
 * @param {PluginsConfig} config - The configuration of the main plugins node to parse.
 * @private
 */
FORGE.PluginManager.prototype._parseConfig = function(config)
{
    this._parseEngines(config.engines);
    this._parseInstances(config.instances);
    this._parseConfigurations(config.configurations);
};


/**
 * Event handler for scene load start.
 * @method FORGE.PluginManager#_sceneLoadStartHandler
 * @private
 */
FORGE.PluginManager.prototype._sceneLoadStartHandler = function(event)
{
    //Remove plugin that have keep = false and plugin that have scene restrictions.
    this._removeUnkeptPlugins(this._viewer.story.loadingSceneUid);
};

/**
 * Event handler for scene load complete.
 * @method FORGE.PluginManager#_sceneLoadCompleteHandler
 * @private
 */
FORGE.PluginManager.prototype._sceneLoadCompleteHandler = function(event)
{
    //Add plugins
    if(this._enabled === true && typeof this._config !== "undefined")
    {
        this._parseConfig(this._config);
    }

    if(this._enabled === true && typeof this._viewer.story.scene.config.plugins !== "undefined")
    {
        this._parseConfig(this._viewer.story.scene.config.plugins);
    }

    //Reset plugins
    this._resetPlugins();
};

/**
 * Remove plugins that have a keep value @ false OR if the plugin have a scene restriction.
 * @method FORGE.PluginManager#_removeUnkeptPlugins
 * @param {string} [sceneUid] The scene uid received on scene load start.
 * @private
 */
FORGE.PluginManager.prototype._removeUnkeptPlugins = function(sceneUid)
{
    var plugin;
    var count = this._plugins.size;

    while(count--)
    {
        plugin = this._plugins.get(count);

        if(plugin.keep === false || (plugin.scenes !== null && plugin.scenes.indexOf(sceneUid) === -1))
        {
            this.remove(plugin.uid);
        }
    }
};

/**
 * This method will reset plugins that have a reset value @ true between each scene.
 * @method  FORGE.PluginManager#_resetPlugins
 * @private
 */
FORGE.PluginManager.prototype._resetPlugins = function()
{
    var plugin;
    var count = this._plugins.size;

    while(count--)
    {
        plugin = this._plugins.get(count);

        if(plugin.reset === true)
        {
            plugin.resetInstance();
        }
    }
};

/**
 * Parse plugins engines in main config.
 * @method FORGE.PluginManager#_parseEngines
 * @param  {Array<PluginEngineConfig>} engines - The engines object to parse.
 * @private
 */
FORGE.PluginManager.prototype._parseEngines = function(engines)
{
    if(typeof engines !== "undefined")
    {
        for(var i = 0, ii = engines.length; i < ii; i++)
        {
            this._addEngine(engines[i]);
        }
    }
};

/**
 * Parse plugins instances in main config.
 * @method FORGE.PluginManager#_parseInstances
 * @param  {Array<PluginInstanceConfig>} instances - The instances object to parse.
 * @private
 */
FORGE.PluginManager.prototype._parseInstances = function(instances)
{
    if(typeof instances !== "undefined")
    {
        for(var i = 0, ii = instances.length; i < ii; i++)
        {
            var instanceUid = instances[i].uid;
            var enabled = (instances[i].enabled !== false) ? true : false;
            var plugin = this.getById(instanceUid);

            var sceneUid = this._viewer.story.sceneUid;
            var scenes = (FORGE.Utils.isArrayOf(instances[i].scenes, "string")) ? instances[i].scenes : [];

            //Scene valid is true if there is no current scene AND there are no scene restriction for the instance,
            //OR if there is a scene restriction and the current scene UID is in the restriction array!
            var sceneValid = Boolean( scenes.length === 0 || (sceneUid === "" && scenes.length === 0) || scenes.indexOf(sceneUid) !== -1 );

            if(enabled === true && plugin === null && sceneValid === true)
            {
                this._addInstance(instances[i]);
            }
        }
    }
};

/**
 * Parse plugins configurations in main config.
 * @method FORGE.PluginManager#_parseConfigurations
 * @param  {Array<PluginConfigurationConfig>} configurations - The configurations object to parse.
 * @private
 */
FORGE.PluginManager.prototype._parseConfigurations = function(configurations)
{
    if(typeof configurations !== "undefined")
    {
        for(var i = 0, ii = configurations.length; i < ii; i++)
        {
            var uid = configurations[i].instance;
            var enabled = (configurations[i].enabled !== false) ? true : false;
            var plugin = this.getById(uid);
            var config = null;

            if(enabled === true)
            {
                config = configurations[i];
            }

            if(plugin !== null)
            {
                plugin.contextualConfig = config;
            }
        }
    }
};

/**
 * Add an engine.
 * @method FORGE.PluginManager#_addEngine
 * @param {PluginEngineConfig} config - The config to parse.
 * @private
 */
FORGE.PluginManager.prototype._addEngine = function(config)
{
    if(typeof config.uid === "string")
    {
        if(this._getEngine(config.uid) !== null)
        {
            return;
        }

        if(FORGE.UID.exists(config.uid) === false)
        {
            var engine = new FORGE.PluginEngine(this._viewer);
            this._engines.add(engine);

            engine.load(config);
        }
        else
        {
            // In some multiple viewer instance case the engine already exists, just get it from the UID
            this._engines.add(FORGE.UID.get(config.uid));
        }
    }
};

/**
 * Get an engine.
 * @method FORGE.PluginManager#_getEngine
 * @param {string} uid - The uid to search for.
 * @return {?FORGE.PluginEngine} Returns the engine.
 * @private
 */
FORGE.PluginManager.prototype._getEngine = function(uid)
{
    var engine = null;
    for(var i = 0, ii = this._engines.size; i < ii; i++)
    {
        engine = /** @type {FORGE.PluginEngine} */ (this._engines.get(i));

        if(engine.uid === uid)
        {
            return engine;
        }
    }

    return null;
};

/**
 * Add a plugin instance.
 * @method FORGE.PluginManager#_addInstance
 * @param {PluginInstanceConfig} config - The config to parse.
 * @private
 * @return {FORGE.Plugin} The created plugin object.
 */
FORGE.PluginManager.prototype._addInstance = function(config)
{
    if(typeof config.engine === "undefined")
    {
        throw "Can't create plugin instance, engineUid is undefined";
    }

    var engine = this._getEngine(config.engine);

    if(engine === null)
    {
        throw "Plugin Engine "+config.engine+" doesn't exist";
    }

    var index = typeof config.index === "number" ? config.index : this._plugins.size;

    var plugin = new FORGE.Plugin(this._viewer, engine, config, index);
    plugin.onInstanceCreate.addOnce(this._onInstanceCreateHandler, this);
    this._plugins.add(plugin);

    plugin.instantiate();

    return plugin;
};

/**
 * Instance create handler, wil lredispatch from the plugin manager
 * @method FORGE.PluginManager#_onInstanceCreateHandler
 * @param {FORGE.Event} event
 * @private
 */
FORGE.PluginManager.prototype._onInstanceCreateHandler = function(event)
{
    var plugin = event.emitter;

    if(this._onInstanceCreate !== null)
    {
        this._onInstanceCreate.dispatch(plugin);
    }
};

/**
 * Boot sequence.
 * @method FORGE.PluginManager#_boot
 * @private
 */
FORGE.PluginManager.prototype.boot = function()
{
    this._boot();
};

/**
 * Add plugins configuration.
 * @method FORGE.PluginManager#addConfig
 * @param {PluginsConfig} config - The config to add
 */
FORGE.PluginManager.prototype.addConfig = function(config)
{
    this._parseMainConfig(config);
};

/**
 * Get a plugin instance by uid.
 * @method FORGE.PluginManager#getById
 * @param {string} uid - The uid to search for.
 * @return {FORGE.Plugin} Returns the plugin.
 */
FORGE.PluginManager.prototype.getById = function(uid)
{
    var plugin;
    for(var i = 0, ii = this._plugins.size; i < ii; i++)
    {
        plugin = /** @type {FORGE.Plugin} */ (this._plugins.get(i));

        if(plugin.uid === uid)
        {
            return plugin;
        }
    }

    return null;
};

/**
 * Get a plugin instance by index.
 * @method FORGE.PluginManager#getByIndex
 * @param {number} index - The index to search for.
 * @return {FORGE.Plugin} Returns the plugin.
 */
FORGE.PluginManager.prototype.getByIndex = function(index)
{
    var plugin = /** @type {FORGE.Plugin} */ (this._plugins.get(index));

    if(typeof plugin !== "undefined")
    {
        return plugin;
    }
    else
    {
        return null;
    }
};

/**
 * Get a plugin instance by value.
 * @method FORGE.PluginManager#get
 * @param {number|string} value - The index or uid to search for.
 * @return {FORGE.Plugin} Returns the plugin.
 */
FORGE.PluginManager.prototype.get = function(value)
{
    var plugin = null;

    if(typeof value === "string")
    {
        plugin = this.getById(value);
    }
    else if(typeof value === "number")
    {
        plugin = this.getByIndex(value);
    }

    return plugin;
};

/**
 * Remove a plugin instance.
 * @method FORGE.PluginManager#remove
 * @param {string} uid - The uid to search for.
 */
FORGE.PluginManager.prototype.remove = function(uid)
{
    var plugin = this.get(uid);

    plugin.destroy();

    this._plugins.remove(plugin);
};

/**
 * Update main loop for plugins.
 * @method FORGE.PluginManager#update
 */
FORGE.PluginManager.prototype.update = function()
{
    var plugin;
    for(var i = 0, ii = this._plugins.size; i < ii; i++)
    {
        plugin = this._plugins.get(i);
        plugin.update();
    }
};

/**
 * Render main loop for plugins.
 * @method FORGE.PluginManager#render
 */
FORGE.PluginManager.prototype.render = function()
{

};

/**
 * Destroy method.
 * @method FORGE.PluginManager#destroy
 */
FORGE.PluginManager.prototype.destroy = function()
{
    this._viewer.story.onSceneLoadStart.remove(this._sceneLoadStartHandler, this);
    this._viewer.story.onSceneLoadComplete.remove(this._sceneLoadCompleteHandler, this);
    this._viewer = null;

    if(this._onInstanceCreate !== null)
    {
        this._onInstanceCreate.destroy();
        this._onInstanceCreate = null;
    }

    for(var i = 0, ii = this._engines.size; i < ii; i++)
    {
        this._engines.get(i).destroy();
    }
    this._engines = null;

    for(var j = 0, jj = this._plugins.size; j < jj; j++)
    {
        this._plugins.get(j).destroy();
    }
    this._plugins = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the all plugins.
* @name FORGE.PluginManager#all
* @type {Array<FORGE.Plugin>}
* @readonly
*/
Object.defineProperty(FORGE.PluginManager.prototype, "all",
{
    /** @this {FORGE.PluginManager} */
    get: function()
    {
        return this._plugins;
    }
});

/**
* Get the enabled flag of plugins.
* @name FORGE.PluginManager#enabled
* @type {boolean}
* @readonly
*/
Object.defineProperty(FORGE.PluginManager.prototype, "enabled",
{
    /** @this {FORGE.PluginManager} */
    get: function()
    {
        return this._enabled;
    }
});

/**
* Get the global prefix of plugins engines.
* @name FORGE.PluginManager#prefix
* @type {string}
* @readonly
*/
Object.defineProperty(FORGE.PluginManager.prototype, "prefix",
{
    /** @this {FORGE.PluginManager} */
    get: function()
    {
        return this._prefix;
    }
});

/**
 * Get the "onInstanceCreate" {@link FORGE.EventDispatcher} of the PluginManager.
 * @name FORGE.PluginManager#onInstanceCreate
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PluginManager.prototype, "onInstanceCreate",
{
    /** @this {FORGE.PluginManager} */
    get: function()
    {
        if(this._onInstanceCreate === null)
        {
            this._onInstanceCreate = new FORGE.EventDispatcher(this, true);
        }

        return this._onInstanceCreate;
    }
});


