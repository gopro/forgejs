/**
 * Media class.
 *
 * @constructor FORGE.Media
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.SceneParser} config input media configuration from json
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
     * @type {FORGE.SceneParser}
     * @private
     */
    this._config = config;

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
     * Ready flag
     * @name FORGE.Media#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

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
    this._parseConfig(this._config);
};

/**
 * Configuration parsing.
 * @method FORGE.Media#_parseConfig
 * @param {FORGE.SceneParser} config input media configuration
 * @private
 */
FORGE.Media.prototype._parseConfig = function(config)
{
    this.warn("FORGE.Media config validator not implemented");

    // media configuration
    var mediaConfig = config.media;

    if (typeof mediaConfig === "undefined" || mediaConfig === null)
    {
        return;
    }

    // Warning : UID is not registered and will be applied to the FORGE.ImageScalable|FORGE.Image|FORGE.VideoHTML5|FORGE.VideoDash objects for registration
    this._uid = mediaConfig.uid;

    this._options = (typeof mediaConfig.options !== "undefined") ? mediaConfig.options : null;

    if (typeof mediaConfig.source === "undefined" || mediaConfig.source === null)
    {
        return;
    }

    var source = mediaConfig.source;

    if (mediaConfig.type === FORGE.MediaType.GRID)
    {
        this._ready = true;
    }
    else if (mediaConfig.type === FORGE.MediaType.IMAGE)
    {
        var imageConfig;

        // If there isn't an URL set, it means that this is a multi resolution image.
        if (!source.url)
        {
            throw "Multi resolution not implemented yet !";
        }

        if (source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
        {
            imageConfig = {
                key: this._uid,
                url: source.url
            };

            this._displayObject = new FORGE.Image(this._viewer, imageConfig);
        }
        else if (source.format === FORGE.MediaFormat.CUBE)
        {
            imageConfig = {
                key: this._uid,
                url: source.url
            };

            this._displayObject = new FORGE.Image(this._viewer, imageConfig);
        }
        else if (source.format === FORGE.MediaFormat.FLAT)
        {
            throw "Flat media not supported yet !";
        }

        this._displayObject.onLoadComplete.addOnce(this._onImageLoadComplete, this);
    }
    else if (mediaConfig.type === FORGE.MediaType.VIDEO)
    {
        // If the levels property is present, we get all urls from it and put it
        // inside source.url: it means that there is multi-quality. It is way
        // easier to handle for video than for image, as it can never be video
        // tiles to display.
        if (Array.isArray(source.levels))
        {
            source.url = [];
            for (var i = 0, ii = source.levels.length; i < ii; i++)
            {
                if(FORGE.Device.check(source.levels[i].device) === false)
                {
                    continue;
                }

                source.url.push(source.levels[i].url);
            }
        }

        if (typeof source.url !== "string" && source.url.length === 0)
        {
            return;
        }

        if (typeof source.streaming !== "undefined" && source.streaming.toLowerCase() === FORGE.VideoFormat.DASH)
        {
            this._displayObject = new FORGE.VideoDash(this._viewer, this._uid);
        }
        else
        {
            // check of the ambisonic state of the video sound prior to the video instanciation
            this._displayObject = new FORGE.VideoHTML5(this._viewer, this._uid, null, null, (this._config.hasSoundTarget(this._uid) === true && this._config.isAmbisonic() === true ? true : false));
        }

        // At this point, source.url is either a streaming address, a simple
        // url, or an array of url
        this._displayObject.load(source.url);

        this._displayObject.onLoadedMetaData.addOnce(this._onLoadedMetaDataHandler, this);
    }
};

/**
 * Internal handler on image ready.
 * @method FORGE.Media#_onImageLoadComplete
 * @private
 */
FORGE.Media.prototype._onImageLoadComplete = function()
{
    this._ready = true;
    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }
};

/**
 * Internal handler on video metadata loaded.
 * @method FORGE.Media#_onLoadedMetaDataHandler
 * @private
 */
FORGE.Media.prototype._onLoadedMetaDataHandler = function()
{
    this._ready = true;
    if (this._options !== null)
    {
        this._displayObject.volume = (typeof this._options.volume === "number") ? this._options.volume : 1;
        this._displayObject.loop = (typeof this._options.loop === "boolean") ? this._options.loop : true;
        this._displayObject.currentTime = (typeof this._options.startTime === "number") ? this._options.startTime : 0;

        if (this._options.autoPlay === true)
        {
            this._displayObject.play();
        }
    }

    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
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

    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    this._viewer = null;
    this._config = null;
};


/**
 * Get the displayObject.
 * @name  FORGE.Media#displayObject
 * @readonly
 * @type {FORGE.DisplayObject}
 *
 * @todo  This is temporary
 */
Object.defineProperty(FORGE.Media.prototype, "displayObject",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._displayObject;
    }
});

/**
 * Get the ready flag
 * @name FORGE.Media#ready
 * @readonly
 * @type boolean
 */
Object.defineProperty(FORGE.Media.prototype, "ready",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get the onLoadComplete {@link FORGE.EventDispatcher}.
 * @name FORGE.Media#onLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Media.prototype, "onLoadComplete",
{
    /** @this {FORGE.Media} */
    get: function()
    {
        if (this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});