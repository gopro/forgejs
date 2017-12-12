/**
 * Media class.
 *
 * @constructor FORGE.Media
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input media configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.Media = function(viewer, config)
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
     * Image reference.
     * @name FORGE.Media#_displayObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._displayObject = null;

    /**
     * Media store reference, if it is a multi resolution image.
     * @name FORGE.Media#_store
     * @type {FORGE.MediaStore}
     * @private
     */
    this._store = null;

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

    FORGE.BaseObject.call(this, "Media");

    this._boot();
};

FORGE.Media.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Media.prototype.constructor = FORGE.Media;

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
    // If no configuration set the media type to undefined then return
    if (typeof config === "undefined" || config === null)
    {
        this._type = FORGE.MediaType.UNDEFINED;
        this._notifyLoadComplete();

        return;
    }

    // Warning : UID is not registered and applied to the FORGE.Image|FORGE.VideoHTML5|FORGE.VideoDash objects for registration
    this._uid = config.uid;
    this._type = config.type;
    this._source = (typeof config.source !== "undefined") ? config.source : null;
    this._preview = (typeof config.preview !== "undefined") ? config.preview : null;
    this._options = (typeof config.options !== "undefined") ? config.options : null;

    if (typeof config.events === "object" && config.events !== null)
    {
        this._createEvents(config.events);
    }

    switch(this._type)
    {
        case FORGE.MediaType.GRID:
            this._parseGrid();
            break;

        case FORGE.MediaType.IMAGE:
            this._parseImage();
            break;

        case FORGE.MediaType.VIDEO:
            this._parseVideo();
            break;
    }
};

/**
 * Parse the media grid.
 * @method FORGE.Media#_parseGrid
 * @private
 */
FORGE.Media.prototype._parseGrid = function()
{
    // Parse grid do nothing at the moment.
    this._notifyLoadComplete();
};

/**
 * Parse the media image.
 * @method FORGE.Media#_parseGrid
 * @private
 */
FORGE.Media.prototype._parseImage = function()
{
    if (this._source === null)
    {
        return;
    }

    // If no format is specified, set default format as flat
    if (this._source.format === "undefined")
    {
        this._source.format = FORGE.MediaFormat.FLAT;
    }

    var preview = this._preview;

    // Load the preview
    if (preview !== null)
    {
        if (typeof preview === "string")
        {
            preview = { url: preview };
        }

        var re = /\{[lfxy].*\}/;
        if (preview.url.match(re) !== null)
        {
            this._preview = /** @type {SceneMediaPreviewConfig} */ (preview);
        }
        else if (this._source.format === FORGE.MediaFormat.EQUIRECTANGULAR ||
            this._source.format === FORGE.MediaFormat.CUBE ||
            this._source.format === FORGE.MediaFormat.FLAT)
        {
            var previewConfig =
            {
                key: this._uid + "-preview",
                url: preview.url
            };

            this._preview = new FORGE.Image(this._viewer, previewConfig);
            this._preview.onLoadComplete.addOnce(this._onImageLoadComplete, this);
        }
    }

    var imageConfig;

    // If there isn't an URL set, it means that this is a multi resolution image.
    if (!this._source.url)
    {
        this._store = new FORGE.MediaStore(this._viewer, this._source, this._preview);
        this._notifyLoadComplete();
    }
    else if (this._source.format === FORGE.MediaFormat.EQUIRECTANGULAR ||
        this._source.format === FORGE.MediaFormat.CUBE ||
        this._source.format === FORGE.MediaFormat.FLAT)
    {
        imageConfig =
        {
            key: this._uid,
            url: this._source.url
        };

        this._displayObject = new FORGE.Image(this._viewer, imageConfig);
        this._displayObject.onLoadComplete.addOnce(this._onImageLoadComplete, this);
    }
    else
    {
        throw "Media format not supported";
    }
};

/**
 * Parse the media video.
 * @method FORGE.Media#_parseVideo
 * @private
 */
FORGE.Media.prototype._parseVideo = function()
{
    if (this._source === null)
    {
        return;
    }

    // If no format is specified, set default format as flat
    if (this._source.format === "undefined")
    {
        this._source.format = FORGE.MediaFormat.FLAT;
    }

    // If the levels property is present, we get all urls from it and put it
    // inside source.url: it means that there is multi-quality. It is way
    // easier to handle for video than for image, as it can never be video
    // tiles to display.
    if (Array.isArray(this._source.levels))
    {
        this._source.url = [];
        for (var i = 0, ii = this._source.levels.length; i < ii; i++)
        {
            if(FORGE.Device.check(this._source.levels[i].device) === false)
            {
                continue;
            }

            this._source.url.push(this._source.levels[i].url);
        }
    }

    if (typeof this._source.url !== "string" && this._source.url.length === 0)
    {
        return;
    }

    if (typeof this._source.streaming !== "undefined" && this._source.streaming.toLowerCase() === FORGE.VideoFormat.DASH)
    {
        this._displayObject = new FORGE.VideoDash(this._viewer, this._uid);
    }
    else
    {
        var scene = this._viewer.story.scene;

        // check of the ambisonic state of the video sound prior to the video instanciation
        this._displayObject = new FORGE.VideoHTML5(this._viewer, this._uid, null, null, (scene.hasSoundTarget(this._uid) === true && scene.isAmbisonic() === true ? true : false));
    }

    // At this point, source.url is either a streaming address, a simple
    // url, or an array of url
    this._displayObject.load(this._source.url);

    this._displayObject.onLoadedMetaData.addOnce(this._onLoadedMetaDataHandler, this);
    this._displayObject.onPlay.add(this._onPlayHandler, this);
    this._displayObject.onPause.add(this._onPauseHandler, this);
    this._displayObject.onSeeked.add(this._onSeekedHandler, this);
    this._displayObject.onEnded.add(this._onEndedHandler, this);
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
 * Internal handler on image ready.
 * @method FORGE.Media#_onImageLoadComplete
 * @private
 */
FORGE.Media.prototype._onImageLoadComplete = function()
{
    this._notifyLoadComplete();
};

/**
 * Internal handler on video metadata loaded.
 * @method FORGE.Media#_onLoadedMetaDataHandler
 * @private
 */
FORGE.Media.prototype._onLoadedMetaDataHandler = function()
{
    if (this._options !== null)
    {
        this._displayObject.volume = (typeof this._options.volume === "number") ? this._options.volume : 1;
        this._displayObject.loop = (typeof this._options.loop === "boolean") ? this._options.loop : true;
        this._displayObject.currentTime = (typeof this._options.startTime === "number") ? this._options.startTime : 0;

        if (this._options.autoPlay === true && document[FORGE.Device.visibilityState] === "visible")
        {
            this._displayObject.play();
        }

        this._displayObject.autoPause = this._options.autoPause;
        this._displayObject.autoResume = this._options.autoResume;
    }

    this._notifyLoadComplete();
};

/**
 * Method to dispatch the load complete event and set the media ready.
 * @method FORGE.Media#_onLoadedMetaDataHandler
 */
FORGE.Media.prototype._notifyLoadComplete = function()
{
    if (this._type === FORGE.MediaType.IMAGE)
    {
        if (this._store !== null)
        {
            this._loaded = true;
            this._onLoadComplete.dispatch();
        }
        else
        {
            this._loaded = this._displayObject !== null && this._displayObject.loaded && this._preview !== null && this._preview.loaded;

            if (this._preview === null || (this._displayObject !== null && this._displayObject.loaded === false) || this._preview.loaded === false)
            {
                this._onLoadComplete.dispatch();
            }
            else if (this._viewer.renderer.backgroundRenderer !== null)
            {
                this._viewer.renderer.backgroundRenderer.displayObject = this._displayObject;
            }

        }
    }
    else
    {
        this._loaded = true;
        this._onLoadComplete.dispatch();
    }
};

/**
 * Internal handler on video play.
 * @method FORGE.Media#_onPlayHandler
 * @private
 */
FORGE.Media.prototype._onPlayHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onPlay, "ActionEventDispatcher") === true)
    {
        this._events.onPlay.dispatch();
    }
};

/**
 * Internal handler on video pause.
 * @method FORGE.Media#_onPauseHandler
 * @private
 */
FORGE.Media.prototype._onPauseHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onPause, "ActionEventDispatcher") === true)
    {
        this._events.onPause.dispatch();
    }
};

/**
 * Internal handler on video seeked.
 * @method FORGE.Media#_onSeekedHandler
 * @private
 */
FORGE.Media.prototype._onSeekedHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onSeeked, "ActionEventDispatcher") === true)
    {
        this._events.onSeeked.dispatch();
    }
};

/**
 * Internal handler on video ended.
 * @method FORGE.Media#_onEndedHandler
 * @private
 */
FORGE.Media.prototype._onEndedHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onEnded, "ActionEventDispatcher") === true)
    {
        this._events.onEnded.dispatch();
    }
};

/**
 * Media destroy sequence
 *
 * @method FORGE.Media#destroy
 */
FORGE.Media.prototype.destroy = function()
{
    if (this._displayObject !== null)
    {
        this._displayObject.destroy();
        this._displayObject = null;
    }

    if (this._store !== null)
    {
        this._store.destroy();
        this._store = null;
    }

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
 * Get the displayObject.
 * @name  FORGE.Media#displayObject
 * @type {FORGE.DisplayObject}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "displayObject",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        if (this._type === FORGE.MediaType.IMAGE && this._store === null)
        {
            if (this._displayObject !== null && this._displayObject.loaded === true)
            {
                return this._displayObject;
            }

            return this._preview;
        }

        return this._displayObject;
    }
});

/**
 * Get the media store, if this is a multi resolution media.
 * @name FORGE.Media#store
 * @type {FORGE.MediaStore}
 * @readonly
 */
Object.defineProperty(FORGE.Media.prototype, "store",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._store;
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
