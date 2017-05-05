/**
 * The main viewer class.
 *
 * @constructor FORGE.Viewer
 * @param {HTMLElement|string} parent - The parent element.
 * @param {(MainConfig|string)} config - Object that represents the project configuration, it can be an object or a json configuration url.
 * @param {?ViewerCallbacks} callbacks - On boot callbacks
 * @extends {FORGE.BaseObject}
 *
 * @todo Create a FORGE.Config Object to define default values, that can be overrided by the config param.
 */
FORGE.Viewer = function(parent, config, callbacks)
{
    FORGE.BaseObject.call(this, "Viewer");

    /**
     * Either the parent id or the parent DOM Element of the viewer.
     * @name FORGE.Viewer#_parent
     * @type {Element|HTMLElement|string}
     * @private
     */
    this._parent = parent;

    /**
     * The main config of the FORGE project
     * @name  FORGE.Viewer#_mainConfig
     * @type {(MainConfig|string)}
     * @private
     */
    this._mainConfig = config;

    /**
     * The viewer configuration or its URL.
     * After the config loading it will be a MainConfig in all cases.
     * @name FORGE.Viewer#_config
     * @type {?ViewerConfig}
     * @private
     */
    this._config = null;

    /**
     * Reference to the DisplayList manager
     * @name FORGE.DispalyList
     * @type {FORGE.DisplayList}
     * @private
     */
    this._display = null;

    /**
     * This is a relative div between the parent and the viewer container.
     * @name  FORGE.Viewer#_relative
     * @type {?Element}
     * @private
     */
    this._relative = null;

    /**
     * The viewer container reference.
     * @name FORGE.Viewer#_container
     * @type {FORGE.DisplayObjectContainer}
     * @private
     */
    this._container = null;

    /**
     * The canvas container reference.
     * @name FORGE.Viewer#_canvasContainer
     * @type {FORGE.DisplayObjectContainer}
     * @private
     */
    this._canvasContainer = null;

    /**
     * The DOM hotspot container reference.
     * @name FORGE.Viewer#_domHotspotContainer
     * @type {FORGE.DisplayObjectContainer}
     * @private
     */
    this._domHotspotContainer = null;

    /**
     * The plugins container reference.
     * @name FORGE.Viewer#_pluginContainer
     * @type {FORGE.DisplayObjectContainer}
     * @private
     */
    this._pluginContainer = null;

    /**
     * The canvas reference.
     * @name FORGE.Viewer#_canvas
     * @type {FORGE.Canvas}
     * @private
     */
    this._canvas = null;

    /**
     * Audio / mixer interface reference.
     * @name FORGE.Viewer#_audio
     * @type {FORGE.SoundManager}
     * @private
     */
    this._audio = null;

    /**
     * Playlists interface reference.
     * @name FORGE.Viewer#_playlists
     * @type {FORGE.PlaylistManager}
     * @private
     */
    this._playlists = null;

    /**
     * Hotspots interface reference.
     * @name  FORGE.Viewer#_hotspots
     * @type {FORGE.HotspotManager}
     * @private
     */
    this._hotspots = null;

    /**
     * Action manager reference.
     * @name FORGE.Viewer#_actions
     * @type {FORGE.ActionManager}
     * @private
     */
    this._actions = null;

    /**
     * Dependencies interface reference.
     * @name  FORGE.Viewer#_dependencies
     * @type {FORGE.DependencyManager}
     * @private
     */
    this._dependencies = null;

    /**
     * Director's cut track manager
     * @name  FORGE.Viewer#_director
     * @type {FORGE.Director}
     * @private
     */
    this._director = null;

    /**
     * Controller manager.
     * @name FORGE.Viewer#_controllers
     * @type {FORGE.ControllerManager}
     * @private
     */
    this._controllers = null;

    /**
     * Post processing.
     * @name  FORGE.Viewer#_postProcessing
     * @type {FORGE.PostProcessing}
     * @private
     */
    this._postProcessing = null;

    /**
     * Story reference.
     * @name FORGE.Viewer#_story
     * @type {FORGE.Story}
     * @private
     */
    this._story = null;

    /**
     * History manager reference.
     * @name FORGE.Viewer#_history
     * @type {FORGE.History}
     * @private
     */
    this._history = null;

    /**
     * Loader reference.
     * @name FORGE.Viewer#_load
     * @type {FORGE.Loader}
     * @private
     */
    this._load = null;

    /**
     * Cache reference.
     * @name FORGE.Viewer#_cache
     * @type {FORGE.Cache}
     * @private
     */
    this._cache = null;

    /**
     * Keyboard interface.
     * @name FORGE.Viewer#_keyboard
     * @type {FORGE.Keyboard}
     * @private
     */
    this._keyboard = null;

    /**
     * Gyroscope interface.
     * @name FORGE.Viewer#_gyroscope
     * @type {FORGE.Gyroscope}
     * @private
     */
    this._gyroscope = null;

    /**
     * Gamepads manager.
     * @name FORGE.Viewer#_gamepad
     * @type {FORGE.GamepadsManager}
     * @private
     */
    this._gamepad = null;

    /**
     * Plugins interface reference.
     * @name FORGE.Viewer#_plugins
     * @type {FORGE.PluginManager}
     * @private
     */
    this._plugins = null;

    /**
     * Main loop reference.
     * @name FORGE.Viewer#_raf
     * @type {FORGE.RequestAnimationFrame}
     * @private
     */
    this._raf = null;

    /**
     * Handle viewer clock reference.
     * @name FORGE.Viewer#_clock
     * @type {FORGE.Clock}
     * @private
     */
    this._clock = null;

    /**
     * Tween Manager reference.
     * @name FORGE.Viewer#_tween
     * @type {FORGE.TweenManager}
     * @private
     */
    this._tween = null;

    /**
     * i18n and locales interface reference.
     * @name FORGE.Viewer#_i18n
     * @type {FORGE.LocaleManager}
     * @private
     */
    this._i18n = null;

    /**
     * Renderer reference.
     * @name FORGE.Viewer#_renderManager
     * @type {FORGE.RenderManager}
     * @private
     */
    this._renderManager = null;

    /**
     * Paused state of the main loop.
     * @name FORGE.Viewer#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    /**
     * Flag to know if the viewer is ready
     * @name  FORGE.Viewer#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * Event dispatcher for the viewer on ready event. Dispatched after the boot sequence.
     * @name  FORGE.Viewer#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * Event dispatcher for the on pause event.
     * @name  FORGE.Viewer#_onPause
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * Event dispatcher for the on resume event.
     * @name  FORGE.Viewer#_onResume
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * Callback function for the viewer.
     * @name FORGE.Viewer#_callbacks
     * @type {?ViewerCallbacks}
     * @private
     */
    this._callbacks = callbacks || null;

    var bootBind = this._boot.bind(this);
    window.setTimeout(bootBind, 0);
};

FORGE.Viewer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Viewer.prototype.constructor = FORGE.Viewer;

/**
 * Viewer default configuration
 * @name  FORGE.Viewer.DEFAULT_CONFIG
 * @type {MainConfig}
 * @const
 */
FORGE.Viewer.DEFAULT_CONFIG =
{
    background: "#000",
    autoResume: true,
    autoPause: true
};

/**
 * Boot sequence.
 * @method FORGE.Viewer#_boot
 * @param {Function} callback - Callback function.
 * @private
 */
FORGE.Viewer.prototype._boot = function(callback)
{
    /**
     * WARNING THE ORDER OF THE BOOT SEQUENCE MATTERS A LOT!
     * DO NOT CHANGE ANYTHING UNLESS YOU ARE SURE OF WHAT YOURE DOING
     */

    this._uid = "FORGE-instance-" + String(FORGE.VIEWERS.length);
    FORGE.VIEWERS.push(this._uid);
    this._register();

    this.log("FORGE.Viewer.boot();");

    this._display = new FORGE.DisplayList(this);

    this._createContainers();
    this._createCanvas();

    this._system = new FORGE.System(this);
    this._dependencies = new FORGE.DependencyManager(this);
    this._clock = new FORGE.Clock(this);
    this._audio = new FORGE.SoundManager(this);
    this._raf = new FORGE.RequestAnimationFrame(this);
    this._i18n = new FORGE.LocaleManager(this);
    this._story = new FORGE.Story(this);
    this._history = new FORGE.History(this);
    this._renderManager = new FORGE.RenderManager(this);
    this._controllers = new FORGE.ControllerManager(this);
    this._playlists = new FORGE.PlaylistManager(this);
    this._plugins = new FORGE.PluginManager(this);
    this._hotspots = new FORGE.HotspotManager(this);
    this._actions = new FORGE.ActionManager(this);
    this._director = new FORGE.Director(this);
    this._postProcessing = new FORGE.PostProcessing(this);

    this._keyboard = new FORGE.Keyboard(this);
    this._gyroscope = new FORGE.Gyroscope(this);
    this._gamepad = new FORGE.GamepadsManager(this);
    this._cache = new FORGE.Cache(this);
    this._load = new FORGE.Loader(this);
    this._tween = new FORGE.TweenManager(this);

    this._system.boot();
    this._audio.boot();
    this._raf.boot();
    this._story.boot();
    this._playlists.boot();
    this._plugins.boot();
    this._hotspots.boot();

    this.log("ForgeJS " + FORGE.VERSION);

    //Call the boot method argument callback
    if (typeof callback === "function")
    {
        callback.call();
    }

    //Call the viewer constructor callback
    if (this._callbacks !== null && typeof this._callbacks.boot === "function")
    {
        this._callbacks.boot.call();
    }

    this._ready = true;

    if (this._onReady !== null)
    {
        this._onReady.dispatch();
    }

    this._loadConfig(this._mainConfig);
};

/**
 * Load the main configuration of the viewer.
 * @method FORGE.Viewer#_loadConfig
 * @param  {?(MainConfig|string)} config - The config object or its URL
 * @private
 */
FORGE.Viewer.prototype._loadConfig = function(config)
{
    if (typeof config === "string")
    {
        this._load.json(this._uid + "-configuration", config, this._mainConfigLoadComplete, this);
    }
    else if (config !== null && typeof config === "object")
    {
        this._parseMainConfig(config);
    }
};

/**
 * Event handler for the configuration JSON load complete.
 * @method FORGE.Story#_mainConfigLoadComplete
 * @param  {FORGE.File} file - The {@link FORGE.File} that describes the loaded JSON file.
 * @private
 */
FORGE.Viewer.prototype._mainConfigLoadComplete = function(file)
{
    this.log("FORGE.Viewer._mainConfigLoadComplete();");

    var json = this._cache.get(FORGE.Cache.types.JSON, file.key);
    var config = /** @type {MainConfig} */ (json.data);

    this._parseMainConfig(config);
};

/**
 * Parse the Global Main Configuration
 * @param  {MainConfig} config - Main configuration to parse.
 * @private
 */
FORGE.Viewer.prototype._parseMainConfig = function(config)
{
    // Final assignement of the config
    this._mainConfig = config;

    this._parseConfig(config.viewer);

    if (typeof config.i18n !== "undefined")
    {
        this._i18n.addConfig(config.i18n); //force the parse of the main config
    }

    this._history.addConfig(config.history);

    if (typeof config.audio !== "undefined")
    {
        this._audio.addConfig(config.audio);
    }

    if (typeof config.playlists !== "undefined")
    {
        this._playlists.addConfig(config.playlists);
    }

    if (typeof config.actions !== "undefined")
    {
        this._actions.addConfig(config.actions);
    }

    if (typeof config.director !== "undefined")
    {
        this._director.load(config.director);
    }

    if (typeof config.hotspots !== "undefined")
    {
        this._hotspots.addTracks(config.hotspots);
    }

    if (typeof config.postProcessing !== "undefined")
    {
        this._postProcessing.addConfig(config.postProcessing);
    }

    if (typeof config.plugins !== "undefined")
    {
        this._plugins.addConfig(config.plugins);
    }

    this._controllers.addConfig(config.controllers);

    if (typeof config.story !== "undefined")
    {
        this._story.load(config.story);
    }

    this._raf.start();
};

/**
 * Parse the Viewer config.
 * @method FORGE.Viewer#_parseConfig
 * @param {ViewerConfig} config - The viewer configuration to parse
 * @private
 */
FORGE.Viewer.prototype._parseConfig = function(config)
{
    this._config = /** @type {ViewerConfig} */ (FORGE.Utils.extendSimpleObject(FORGE.Viewer.DEFAULT_CONFIG, config));
};

/**
 * Create all containers into the DOM.
 * @method FORGE.Viewer#_createContainers
 * @private
 */
FORGE.Viewer.prototype._createContainers = function()
{
    if (typeof this._parent === "string" && this._parent !== "")
    {
        this._parent = document.getElementById(this._parent);
    }

    if (typeof this._parent === "undefined" || this._parent === null || FORGE.Dom.isHtmlElement(this._parent) === false)
    {
        throw "FORGE.Viewer.boot : Viewer parent is invalid";
    }

    this._relative = document.createElement("div");
    this._relative.style.width = "100%";
    this._relative.style.height = "100%";
    this._relative.style.position = "relative";
    this._parent.appendChild(this._relative);

    this._container = new FORGE.DisplayObjectContainer(this, null, null, /** @type {Element} */ (this._relative));
    this._container.id = "FORGE-main-container-" + this._uid;

    this._canvasContainer = new FORGE.DisplayObjectContainer(this);
    this._canvasContainer.id = "FORGE-canvas-container-" + this._uid;
    this._container.index = 0;
    this._canvasContainer.maximize(true);
    this._container.addChild(this._canvasContainer);

    this._domHotspotContainer = new FORGE.DisplayObjectContainer(this);
    this._domHotspotContainer.id = "FORGE-dom-hotspot-container-" + this._uid;
    this._container.index = 0;
    this._domHotspotContainer.maximize(true);
    this._container.addChild(this._domHotspotContainer);

    this._pluginContainer = new FORGE.DisplayObjectContainer(this);
    this._pluginContainer.id = "FORGE-plugin-container-" + this._uid;
    this._container.index = 0;
    this._pluginContainer.maximize(true);
    this._container.addChild(this._pluginContainer);
};

/**
 * Create the canvas into the DOM.
 * @method FORGE.Viewer#_createCanvas
 * @private
 */
FORGE.Viewer.prototype._createCanvas = function()
{
    this._canvas = new FORGE.Canvas(this);
    this._canvas.maximize(true);
    this._canvasContainer.addChild(this._canvas);
};

/**
 * Update class informations on main loop.
 * @method FORGE.Viewer#_updateLogic
 * @private
 */
FORGE.Viewer.prototype._updateLogic = function()
{
    this._display.update();
    this._keyboard.update();
    this._gamepad.update();
    this._audio.update();
    this._plugins.update();
    this._tween.update();
    this._hotspots.update();
    this._controllers.update();
    this._renderManager.update();

    if (this._callbacks !== null && typeof this._callbacks.update === "function")
    {
        this._callbacks.update.call();
    }
};

/**
 * Update scene rendering on main loop.
 * @method FORGE.Viewer#_updateRendering
 * @private
 */
FORGE.Viewer.prototype._updateRendering = function()
{
    if (this._callbacks !== null && typeof this._callbacks.beforeRender === "function")
    {
        this._callbacks.beforeRender.call();
    }

    if (this._renderManager !== null)
    {
        this._renderManager.render();
    }

    if (this._callbacks !== null && typeof this._callbacks.afterRender === "function")
    {
        this._callbacks.afterRender.call();
    }
};

/**
 * Update method called by the viewer main loop.
 * @method FORGE.Viewer#update
 * @param  {number} time - Time in ms
 */
FORGE.Viewer.prototype.update = function(time)
{
    if (this._paused === true)
    {
        return;
    }

    //Update the global clock
    this._clock.update(time);

    this._updateLogic();
    this._updateRendering();
};

/**
 * Pause the refresh on the main loop.
 * @method FORGE.Viewer#pause
 * @param {boolean} internal - Internal lib usage
 */
FORGE.Viewer.prototype.pause = function(internal)
{
    if(this._paused === true)
    {
        return;
    }

    this._paused = true;

    // Pause all media if autoPause is true
    if (internal !== true || this._config.autoPause === true)
    {
        this._audio.pauseAll();
    }

    if (this._onPause !== null)
    {
        this._onPause.dispatch({
            "internal": internal
        });
    }
};

/**
 * Resume the refresh on the main loop.
 * @method FORGE.Viewer#resume
 * @param {boolean} internal - Internal lib usage
 */
FORGE.Viewer.prototype.resume = function(internal)
{
    if(this._paused === false)
    {
        return;
    }

    this._paused = false;

    // Resume all media if autoResume is true
    if (internal !== true || this._config.autoResume === true)
    {
        this._audio.resumeAll();
    }

    if (this._onResume !== null)
    {
        this._onResume.dispatch({
            "internal": internal
        });
    }
};

/**
 * Destroy method.
 * @method FORGE.Viewer#destroy
 */
FORGE.Viewer.prototype.destroy = function()
{

    /**
     * WARNING THE ORDER OF THE DESTROY SEQUENCE MATTERS A LOT!
     * DO NOT CHANGE ANYTHING UNLESS YOU ARE SURE OF WHAT YOURE DOING
     */

    this._raf.stop();

    this._parent = null;

    this._system.destroy();
    this._system = null;

    this._plugins.destroy();
    this._plugins = null;

    this._raf.destroy();
    this._raf = null;

    this._load.destroy();
    this._load = null;

    this._history.destroy();
    this._history = null;

    this._clock.destroy();
    this._clock = null;

    this._keyboard.destroy();
    this._keyboard = null;

    this._gyroscope.destroy();
    this._gyroscope = null;

    this._gamepad.destroy();
    this._gamepad = null;

    this._hotspots.destroy();
    this._hotspots = null;

    this._director.destroy();
    this._director = null;

    this._renderManager.destroy();
    this._renderManager = null;

    this._canvas.destroy();
    this._canvas = null;

    this._canvasContainer.destroy();
    this._canvasContainer = null;

    this._domHotspotContainer.destroy();
    this._domHotspotContainer = null;

    this._postProcessing.destroy();
    this._postProcessing = null;

    this._pluginContainer.destroy();
    this._pluginContainer = null;

    this._actions.destroy();
    this._actions = null;

    this._container.destroy();
    this._container = null;

    this._display.destroy();
    this._display = null;

    this._playlists.destroy();
    this._playlists = null;

    this._audio.destroy();
    this._audio = null;

    this._story.destroy();
    this._story = null;

    this._cache.destroy();
    this._cache = null;

    this._tween.destroy();
    this._tween = null;

    this._i18n.destroy();
    this._i18n = null;

    this._controllers.destroy();
    this._controllers = null;

    this._callbacks = null;

    if (this._onReady !== null)
    {
        this._onReady.destroy();
        this._onReady = null;
    }

    if (this._onPause !== null)
    {
        this._onPause.destroy();
        this._onPause = null;
    }

    if (this._onResume !== null)
    {
        this._onResume.destroy();
        this._onResume = null;
    }

    FORGE.VIEWERS.splice(this._uid, 1);

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the viewer ready status.
 * @name FORGE.Viewer#ready
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "ready",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get the main configuration.
 * @name FORGE.Viewer#mainConfig
 * @type {MainConfig}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "mainConfig",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._mainConfig;
    }
});

/**
 * Get the viewer configuration.
 * @name FORGE.Viewer#config
 * @type {ViewerConfig}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "config",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Get the viewer parent element.
 * @name FORGE.Viewer#parent
 * @type {HTMLElement|String}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "parent",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._parent;
    }
});

/**
 * Get the viewer display list manager.
 * @name FORGE.Viewer#display
 * @type {FORGE.DisplayList}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "display",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._display;
    }
});

/**
 * Get and set the fullscreen property of the viewer main container.
 * @name FORGE.Viewer#fullscreen
 * @type {boolean}
 */
Object.defineProperty(FORGE.Viewer.prototype, "fullscreen",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._container.isFullscreen();
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        if (typeof value !== "boolean" || this._container.isFullscreen() === value)
        {
            return;
        }

        this._container.fullscreen = value;
    }
});

/**
 * Get the viewer container.
 * @name FORGE.Viewer#container
 * @type {FORGE.DisplayObjectContainer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "container",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._container;
    }
});

/**
 * Get the viewer canvas container.
 * @name FORGE.Viewer#canvasContainer
 * @type {FORGE.DisplayObjectContainer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "canvasContainer",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._canvasContainer;
    }
});

/**
 * Get the viewer canvas.
 * @name FORGE.Viewer#canvas
 * @type {FORGE.Canvas}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "canvas",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._canvas;
    }
});

/**
 * Get the viewer DOM hotspot container.
 * @name FORGE.Viewer#domHotspotContainer
 * @type {FORGE.DisplayObjectContainer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "domHotspotContainer",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._domHotspotContainer;
    }
});

/**
 * Get the viewer plugin container.
 * @name FORGE.Viewer#pluginContainer
 * @type {FORGE.DisplayObjectContainer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "pluginContainer",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._pluginContainer;
    }
});

/**
 * Get the viewer request animation frame interface.
 * @name FORGE.Viewer#raf
 * @type {FORGE.RequestAnimationFrame}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "raf",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._raf;
    }
});

/**
 * Get the viewer audio/sound interface.
 * @name FORGE.Viewer#audio
 * @type {FORGE.SoundManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "audio",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._audio;
    }
});

/**
 * Get the viewer playlists for sounds.
 * @name FORGE.Viewer#playlists
 * @type {FORGE.PlaylistManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "playlists",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._playlists;
    }
});

/**
 * Get the viewer hotspots module.
 * @name FORGE.Viewer#hotspots
 * @type {FORGE.HotspotManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "hotspots",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._hotspots;
    }
});

/**
 * Get the viewer action manager.
 * @name FORGE.Viewer#actions
 * @type {FORGE.ActionManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "actions",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._actions;
    }
});

/**
 * Get the viewer dependencies module.
 * @name  FORGE.Viewer#dependencies
 * @type {FORGE.DependencyManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "dependencies",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._dependencies;
    }
});

/**
 * Get the director's cut track manager.
 * @name FORGE.Viewer#director
 * @type {FORGE.Director}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "director",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._director;
    }
});

/**
 * Get the story module.
 * @name FORGE.Viewer#story
 * @type {FORGE.Story}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "story",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._story;
    }
});

/**
 * Get the history module.
 * @name FORGE.Viewer#history
 * @type {FORGE.History}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "history",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._history;
    }
});

/**
 * Get the viewer loader.
 * @name FORGE.Viewer#load
 * @type {FORGE.Loader}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "load",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._load;
    }
});

/**
 * Get the viewer cache.
 * @name FORGE.Viewer#cache
 * @type {FORGE.Cache}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "cache",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._cache;
    }
});

/**
 * Get the viewer plugins interface.
 * @name FORGE.Viewer#plugins
 * @type {FORGE.PluginManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "plugins",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._plugins;
    }
});

/**
 * Get the viewer clock interface.
 * @name FORGE.Viewer#clock
 * @type {FORGE.Clock}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "clock",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._clock;
    }
});

/**
 * Get the viewer tween interface.
 * @name FORGE.Viewer#tween
 * @type {FORGE.TweenManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "tween",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._tween;
    }
});

/**
 * Get the viewer i18n and locales interface.
 * @name FORGE.Viewer#i18n
 * @type {FORGE.LocaleManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "i18n",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._i18n;
    }
});

/**
 * Get the viewer render manager.
 * @name FORGE.Viewer#renderer
 * @type {FORGE.RenderManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "renderer",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._renderManager;
    }
});

/**
 * Get the view.
 * @name FORGE.Viewer#view
 * @type {FORGE.ViewManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "view",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._renderManager.view;
    }
});

/**
 * Get the camera.
 * @name FORGE.Viewer#camera
 * @type {FORGE.Camera}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "camera",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._renderManager.camera;
    }
});

/**
 * Get controller manager.
 * @name FORGE.Viewer#controllers
 * @readonly
 * @type {FORGE.ControllerManager}
 */
Object.defineProperty(FORGE.Viewer.prototype, "controllers",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._controllers;
    }
});

/**
 * Get the postProcessing object.
 * @name FORGE.Viewer#postProcessing
 * @type {FORGE.PostProcessing}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "postProcessing",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._postProcessing;
    }
});

/**
 * Get the viewer keyboard interface.
 * @name FORGE.Viewer#keyboard
 * @type {FORGE.Keyboard}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "keyboard",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._keyboard;
    }
});

/**
 * Get the viewer gyroscope interface.
 * @name FORGE.Viewer#gyroscope
 * @type {FORGE.Gyroscope}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "gyroscope",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._gyroscope;
    }
});

/**
 * Get the viewer gamepad interface.
 * @name FORGE.Viewer#gamepad
 * @type {FORGE.GamepadsManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewer.prototype, "gamepad",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._gamepad;
    }
});

/**
 * Get and set the viewer width.
 * @name FORGE.Viewer#width
 * @type {number}
 */
Object.defineProperty(FORGE.Viewer.prototype, "width",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._container.width;
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        this._container.width = value;
    }
});

/**
 * Get and set the viewer height.
 * @name FORGE.Viewer#height
 * @type {number}
 */
Object.defineProperty(FORGE.Viewer.prototype, "height",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._container.height;
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        this._container.height = value;
    }
});


/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of the viewer.
 * @name FORGE.Viewer#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Viewer.prototype, "onReady",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        if (this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});

/**
 * Get the "onPause" {@link FORGE.EventDispatcher} of the viewer.
 * @name FORGE.Viewer#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Viewer.prototype, "onPause",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        if (this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
 * Get the "onResume" {@link FORGE.EventDispatcher} of the viewer.
 * @name FORGE.Viewer#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Viewer.prototype, "onResume",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        if (this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});
