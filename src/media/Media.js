/**
 * Media base class.
 * The default Media have type equal to FORGE.MediaType.UNDEFINED
 *
 * @constructor FORGE.Media
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input media configuration from json
 * @param {string} className - The className of the object as long as many other object inherits from this one.
 * @extends {FORGE.BaseObject}
 */
FORGE.Media = function(viewer, config, className)
{
    /**
     * The viewer reference.
     * @name FORGE.Media#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Input scene and media config
     * @name FORGE.Media#_config
     * @type {SceneMediaConfig}
     * @private
     */
    this._config = config;

    /**
     * Type of the media
     * @name FORGE.Media#_type
     * @type {string}
     * @private
     */
    this._type = "";

    /**
     * Source description of the media
     * @name FORGE.Media#_source
     * @type {SceneMediaSourceConfig}
     * @private
     */
    this._source = null;

    /**
     * Media options
     * @name  FORGE.Media#_options
     * @type {Object}
     * @private
     */
    this._options = null;

    /**
     * A preview of the media: it is always an image, never a video (so, a
     * preview for a video would be an image).
     * @name FORGE.Media#_preview
     * @type {(FORGE.Image|SceneMediaPreviewConfig)}
     * @private
     */
    this._preview = null;

    /**
     * Loaded flag
     * @name FORGE.Media#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    /**
     * Events object that will keep references of the ActionEventDispatcher
     * @name FORGE.Media#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = null;

    /**
     * On load complete event dispatcher.
     * @name  FORGE.Media#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    FORGE.BaseObject.call(this, className || "Media");

    this._boot();
};

FORGE.Media.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Media.prototype.constructor = FORGE.Media;

/**
 * @name FORGE.Media.DEFAULT_CONFIG
 * @type {SceneMediaConfig}
 * @const
 */
FORGE.Media.DEFAULT_CONFIG =
{
    type: FORGE.MediaType.UNDEFINED,
    preview: null,
    source: null,
    options: null
};

/**
 * Init routine
 * @method FORGE.Media#_boot
 * @private
 */
FORGE.Media.prototype._boot = function()
{
    this._events = {};

    // This event can no be a lazzy one (memorize is true)
    this._onLoadComplete = new FORGE.EventDispatcher(this, true);

    this._parseConfig(this._config);
};

/**
 * Configuration parsing.
 * @method FORGE.Media#_parseConfig
 * @param {SceneMediaConfig} config input media configuration
 * @private
 */
FORGE.Media.prototype._parseConfig = function(config)
{
    this._config = /** @type {SceneMediaConfig} */ (FORGE.Utils.extendSimpleObject(FORGE.Media.DEFAULT_CONFIG, config));

    // Warning : UID is not registered and applied to the FORGE.Image|FORGE.VideoHTML5|FORGE.VideoDash objects for registration
    this._uid = this._config.uid;
    this._type = this._config.type;
    this._preview = (typeof this._config.preview !== "undefined") ? this._config.preview : null;
    this._source = (typeof this._config.source !== "undefined") ? this._config.source : null;
    this._options = (typeof this._config.options !== "undefined") ? this._config.options : null;

    this._register();

    if (typeof config.events === "object" && config.events !== null)
    {
        this._createEvents(config.events);
    }
};

/**
 * Create action events dispatchers.
 * @method FORGE.Media#_createEvents
 * @private
 * @param {SceneMediaEventsConfig} events - The events config of the media.
 */
FORGE.Media.prototype._createEvents = function(events)
{
    var event;
    for(var e in events)
    {
        event = new FORGE.ActionEventDispatcher(this._viewer, e);
        event.addActions(events[e]);
        this._events[e] = event;
    }
};

/**
 * Clear all object events.
 * @method Media.Object3D#_clearEvents
 * @private
 */
FORGE.Media.prototype._clearEvents = function()
{
    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Method to dispatch the load complete event and set the Media as loaded.
 * @method FORGE.Media#_notifyLoadComplete
 */
FORGE.Media.prototype._notifyLoadComplete = function()
{
    // The default Media type is undefined.
    // We mimic here a normal loading process.
    this._loaded = true;
    this._onLoadComplete.dispatch();
};

/**
 * Media load
 * @method FORGE.Media#load
 */
FORGE.Media.prototype.load = function()
{
    this._notifyLoadComplete();
};

/**
 * Media unload
 * @method FORGE.Media#load
 */
FORGE.Media.prototype.unload = function()
{
    this._loaded = false;
    this._onLoadComplete.reset();
};

/**
 * Media destroy sequence
 *
 * @method FORGE.Media#destroy
 */
FORGE.Media.prototype.destroy = function()
{
    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    this._clearEvents();
    this._events = null;

    this._viewer = null;
};

/**
 * Get the media config.
 * @name  FORGE.Media#config
 * @type {SceneMediaConfig}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "config",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Get the media type.
 * @name  FORGE.Media#type
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "type",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get the media source.
 * @name  FORGE.Media#source
 * @type {SceneMediaSourceConfig}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "source",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._source;
    }
});

/**
 * Get the media options.
 * @name  FORGE.Media#options
 * @type {SceneMediaOptionsConfig}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "options",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._options;
    }
});

/**
 * Get the loaded flag
 * @name FORGE.Media#loaded
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "loaded",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._loaded;
    }
});

/**
 * Get the onLoadComplete {@link FORGE.EventDispatcher}.
 * @name FORGE.Media#onLoadComplete
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "onLoadComplete",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._onLoadComplete;
    }
});
