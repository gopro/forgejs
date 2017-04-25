
/**
 * A plugin object is an instance of a {@link FORGE.PluginEngine} on top of the viewer.<br>
 * It can be visual (display a logo) or not (gyroscope, stats ...).
 *
 * @constructor FORGE.Plugin
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.PluginEngine} engine - The engine used to instantiate tis plugin.
 * @param {PluginInstanceConfig} config - The config of the plugin instance.
 * @param {number} index - The index of the plugin, use for display order.
 * @extends {FORGE.BaseObject}
 *
 * @todo  Scene array upgrade : Have a scene array with inclusive and exclusive uids
 * @todo  Same filter array for groups ?
 */
FORGE.Plugin = function(viewer, engine, config, index)
{
    /**
     * The viewer reference.
     * @name FORGE.Plugin#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The engine this plugin is based on.
     * @name  FORGE.Plugin#_engine
     * @type {FORGE.PluginEngine}
     * @private
     */
    this._engine = engine;

    /**
     * The instance config of the plugin.
     * @name  FORGE.Plugin#_instanceConfig
     * @type {?PluginInstanceConfig}
     * @private
     */
    this._instanceConfig = config;

    /**
     * The contextual config is the plugin configuration specific to a scene or a group.<br/>
     * It doesn't last at scene change.
     * @name FORGE.Plugin#_contextualConfig
     * @type {?PluginConfigurationConfig}
     * @private
     */
    this._contextualConfig = null;

    /**
     * This config will be the final config object that merges the default engine config, the instance config and the contextual config.
     * @name  FORGE.Plugin#_config
     * @type {?PluginInstanceConfig}
     * @private
     */
    this._config = null;

    /**
     * The index of the plugin, used if the plugin is a visual one.
     * @name FORGE.Plugin#_index
     * @type {number}
     * @private
     */
    this._index = index;

    /**
     * The options of this Plugin.
     * @name FORGE.Plugin#_options
     * @type {Object}
     * @private
     */
    this._options = null;

    /**
     * The actions of this Plugin.
     * @name FORGE.Plugin#_actions
     * @type {Object}
     * @private
     */
    this._actions = null;

    /**
     * Object that stores {@link FORGE.ActionEventDispatcher}.
     * @name FORGE.Plugin#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = null;

    /**
     * Instance of the plugin engine constructor.
     * @name  FORGE.Plugin#_instance
     * @type {?PluginStructure}
     * @private
     */
    this._instance = null;

    /**
     * Flag to tell if the instance is ready.<br>
     * It is the plugin developper that set the ready flag by calling the notifyInstanceReady method from its instance.
     * @name  FORGE.Plugin#_instanceReady
     * @type {boolean}
     * @private
     */
    this._instanceReady = false;

    /**
     * A DOM id or a DOM element.<br>
     * Used to inject graphical plugins anywhere in the document (outside the viewer container).
     * @name  FORGE.Plugin#_parent
     * @type {Element|HTMLElement|string}
     * @private
     */
    this._parent = null;

    /**
     * The display object container for this plugin if it is a graphical one.
     * @name FORGE.Plugin#_container
     * @type {?FORGE.DisplayObjectContainer}
     * @private
     */
    this._container = null;

    /**
     * Reference to the plugin object factory, every plugin have its own factory.
     * @name FORGE.Plugin#_create
     * @type {FORGE.PluginObjectFactory}
     * @private
     */
    this._create = null;

    /**
     * Scenes UID array, this plugin is allow to instantiate only on these scene if not null.
     * @name  FORGE.Plugin#_scenes
     * @type {Array<string>}
     * @private
     */
    this._scenes = null;

    /**
     * Object to handle persistent data.
     * @name  FORGE.Plugin#_persistentData
     * @type {Object}
     * @private
     */
    this._persistentData = null;

    /**
     * Is this plugin stay at the scene change event?
     * @name  FORGE.Plugin#_keep
     * @type {boolean}
     * @private
     */
    this._keep = true;

    /**
     * Is this plugin have to reset between each scene?
     * @name  FORGE.Plugin#_reset
     * @type {boolean}
     * @private
     */
    this._reset = true;

    /**
     * Event dispatcher for instance creation
     * @name  FORGE.Plugin#_onInstanceCreate
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onInstanceCreate = null;

     /**
     * Event dispatcher for instance ready
     * @name  FORGE.Plugin#_onInstanceReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onInstanceReady = null;

    FORGE.BaseObject.call(this, "Plugin");

    this._boot();
};

FORGE.Plugin.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Plugin.prototype.constructor = FORGE.Plugin;

/**
 * Boot sequence
 * @method  FORGE.Plugin#_boot
 * @private
 */
FORGE.Plugin.prototype._boot = function()
{
    //First thing, very important is to register the plugin object!
    //We can't parse the rest of the config here, maybe the engine is not loaded yet.
    this._uid = this._instanceConfig.uid;
    this._tags = this._instanceConfig.tags;
    this._register();

    this._persistentData = {};
};

/**
 * Internal method to parse the config.
 * @method FORGE.Plugin#_parseConfig
 * @private
 * @param {Object} config - The config object to parse.
 */
FORGE.Plugin.prototype._parseConfig = function(config)
{
    //If there is a parent string in config, this should be an dom element id where to inject the plugin.
    if(typeof config.parent === "string")
    {
        this._parent = config.parent;
    }

    this._keep = (typeof config.keep === "boolean") ? config.keep : true;
    this._reset = (typeof config.reset === "boolean") ? config.reset : true;

    //If there is no scenes array alerady set and if there is a scene array in the instance config.
    if(this._scenes === null && FORGE.Utils.isArrayOf(config.scenes, "string") === true)
    {
        this._scenes = config.scenes;
    }

    this._mergeConfigurations();
};

/**
 * Merge the plugin configurations
 * @method FORGE.Plugin#_mergeConfigurations
 * @private
 */
FORGE.Plugin.prototype._mergeConfigurations = function()
{
    this._config = /** @type {PluginInstanceConfig} */ (FORGE.Utils.extendMultipleObjects(this._engine.defaultConfig, this._instanceConfig, this._contextualConfig));
    this._options = this._config.options || {};
    this._data = this._config.data || {};
    this._actions = this._config.actions || {};

    this._clearEvents();
    this._createEvents(this._config.events);
};

/**
 * Create events dispatchers that the engine needs.
 * @method FORGE.Plugin#_createEvents
 * @private
 * @param {Object=} events - The events config of the plugin engine.
 */
FORGE.Plugin.prototype._createEvents = function(events)
{
    this._events = {};

    var event;
    for(var e in events)
    {
        event = new FORGE.ActionEventDispatcher(this._viewer, e);
        event.addActions(events[e]);
        this._events[e] = event;
    }
};

/**
 * Clear all plugin events.
 * @method FORGE.Plugin#_clearEvents
 * @private
 */
FORGE.Plugin.prototype._clearEvents = function()
{
    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Instantiate the plugin engine if it is loaded, if not listen to the engine load complete to retry to instantiate.
 * @method FORGE.Plugin#instantiate
 */
FORGE.Plugin.prototype.instantiate = function()
{
    if(this._engine.loaded === true)
    {
        this._instantiatePlugin();
    }
    else
    {
        this._engine.onLoadComplete.addOnce(this._engineLoadComplete, this);
    }
};

/**
 * Handler for engine load complete.
 * @method FORGE.Plugin#_engineLoadComplete
 * @private
 */
FORGE.Plugin.prototype._engineLoadComplete = function()
{
    this._instantiatePlugin();
};

/**
 * Parse the config then instantiate the plugin.
 * @method FORGE.Plugin#_instantiatePlugin
 * @private
 */
FORGE.Plugin.prototype._instantiatePlugin = function()
{
    this.log("Plugin._instantiatePlugin(); "+this._uid);

    this._parseConfig(this._instanceConfig);

    this._instance = this._engine.getNewInstance(this._viewer, this);

    this._instance.boot.call(this._instance);

    if(this._onInstanceCreate !== null)
    {
        this._onInstanceCreate.dispatch();
    }
};

/**
 * Instance can notify with this method that the instance is ready
 * @method FORGE.Plugin.notifyInstanceReady
 */
FORGE.Plugin.prototype.notifyInstanceReady = function()
{
    this._instanceReady = true;

    if(this._onInstanceReady !== null)
    {
        this._onInstanceReady.dispatch();
    }
};

/**
 * Update method called by the plugin manager.
 * @method FORGE.Plugin#update
 */
FORGE.Plugin.prototype.update = function()
{
    if(this._instance !== null && typeof this._instance.update === "function")
    {
        this._instance.update.call(this._instance);
    }
};

/**
 * Reset the plugin to a specified configuration.
 * @method FORGE.Plugin#reset
 */
FORGE.Plugin.prototype.resetInstance = function()
{
    this._mergeConfigurations();

    if(this._instance !== null)
    {
        if(typeof this._instance.reset === "function")
        {
            this._instance.reset.call(this._instance);
        }
        else
        {
            this.log("There is no reset function on plugin "+this._engine.uid);
        }
    }
};

/**
 * Destroy method.
 * @method FORGE.Plugin#destroy
 */
FORGE.Plugin.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    if(this._instance !== null)
    {
        this._instance.viewer = null;
        this._instance.plugin = null;

        this._instance.destroy();
        this._instance = null;
    }

    if(this._create !== null)
    {
        this._create.destroy();
        this._create = null;
    }

    if(this._container !== null)
    {
        this._container.destroy();
        this._container = null;
    }

    if(this._onInstanceCreate !== null)
    {
        this._onInstanceCreate.destroy();
        this._onInstanceCreate = null;
    }

    if(this._onInstanceReady !== null)
    {
        this._onInstanceReady.destroy();
        this._onInstanceReady = null;
    }

    this._clearEvents();
    this._events = null;

    this._viewer = null;

    this._persistentData = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the plugin full url.
 * @name FORGE.Plugin#fullUrl
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Plugin.prototype, "fullUrl",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._engine.fullUrl;
    }
});

/**
 * Get the plugin options.
 * @name FORGE.Plugin#options
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "options",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._options;
    }
});

/**
 * Get the plugin actions.
 * @name FORGE.Plugin#actions
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "actions",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._actions;
    }
});

/**
 * Get the plugin events.
 * @name FORGE.Plugin#events
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "events",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._events;
    }
});

/**
 * Get the scenes array. This plugin will be alive only on these scenes.
 * @name FORGE.Plugin#scenes
 * @readonly
 * @type {Array}
 */
Object.defineProperty(FORGE.Plugin.prototype, "scenes",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._scenes;
    }
});

/**
 * Get and set pesistent data.
 * @name FORGE.Plugin#persistentData
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "persistentData",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._persistentData;
    },

    /** @this {FORGE.Plugin} */
    set: function(value)
    {
        this._persistentData = value;
    }
});

/**
 * Get the plugin instance.
 * @name FORGE.Plugin#instance
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "instance",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._instance;
    }
});

/**
 * Get the plugin instance ready flag.
 * @name FORGE.Plugin#instanceReady
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Plugin.prototype, "instanceReady",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._instanceReady;
    }
});

/**
 * Get the plugin container.
 * @name FORGE.Plugin#container
 * @readonly
 * @type {FORGE.DisplayObjectContainer}
 */
Object.defineProperty(FORGE.Plugin.prototype, "container",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        if(this._container === null)
        {
            if(typeof this._parent === "string" && this._parent !== "")
            {
                this._parent = document.getElementById(this._parent);

                if(typeof this._parent === "undefined" || this._parent === null || FORGE.Dom.isHtmlElement(this._parent) === false)
                {
                    throw "FORGE.Plugin.boot : Plugin parent is invalid";
                }

                this._container = new FORGE.DisplayObjectContainer(this._viewer, null, null, this._parent);
            }
            else
            {
                this._container = new FORGE.DisplayObjectContainer(this._viewer);
                this._viewer.pluginContainer.addChild(this._container);
                this._container.maximize(true);
            }

            this._container.id = this._uid;
            this._container.index = this._index;
        }

        return this._container;
    }
});

/**
 * Get the plugin object factory.
 * @name FORGE.Plugin#create
 * @readonly
 * @type {FORGE.PluginObjectFactory}
 */
Object.defineProperty(FORGE.Plugin.prototype, "create",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        if(this._create === null)
        {
            this._create = new FORGE.PluginObjectFactory(this._viewer, this);
        }

        return this._create;
    }
});

/**
 * Get the plugin keep flag.
 * @name FORGE.Plugin#keep
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Plugin.prototype, "keep",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._keep;
    }
});

/**
 * Get the plugin reset flag.
 * @name FORGE.Plugin#reset
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Plugin.prototype, "reset",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._reset;
    }
});

/**
 * Get the contextual config.
 * @name FORGE.Plugin#contextualConfig
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "contextualConfig",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._contextualConfig;
    },

    /** @this {FORGE.Plugin} */
    set: function(value)
    {
        this._contextualConfig = value;
    }
});

/**
 * Get the instance config.
 * @name FORGE.Plugin#instanceConfig.
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "instanceConfig",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._instanceConfig;
    }
});

/**
 * Get the final merged config.
 * @name FORGE.Plugin#config
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Plugin.prototype, "config",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        return this._config;
    }
});


/**
 * Get the "onInstanceCreate" {@link FORGE.EventDispatcher} of the Plugin.
 * @name FORGE.Plugin#onInstanceCreate
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Plugin.prototype, "onInstanceCreate",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        if(this._onInstanceCreate === null)
        {
            this._onInstanceCreate = new FORGE.EventDispatcher(this, true);
        }

        return this._onInstanceCreate;
    }
});

/**
 * Get the "onInstanceReady" {@link FORGE.EventDispatcher} of the Plugin.
 * @name FORGE.Plugin#onInstanceReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Plugin.prototype, "onInstanceReady",
{
    /** @this {FORGE.Plugin} */
    get: function()
    {
        if(this._onInstanceReady === null)
        {
            this._onInstanceReady = new FORGE.EventDispatcher(this, true);
        }

        return this._onInstanceReady;
    }
});