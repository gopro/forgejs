
/**
 * An image is a display object with an internationalizable image source.
 *
 * @constructor FORGE.Image
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {(ImageConfig|string)=} config - The image configuration to load.
 * @param {string=} className - The className of the object.
 * @extends {FORGE.DisplayObject}
 */
FORGE.Image = function(viewer, config, className)
{
    /**
     * Image configuration
     * @name  FORGE.Image#_config
     * @type {?Object|string}
     * @property {string} key - The cache key associated to this image.
     * @property {string} url - The URL of the image if not i18n
     * @property {string} i18n - The i18n key to find the URL of an i18n image.
     * @private
     */
    this._config = config || null;

    /**
     * The key associated to this image.
     * @name  FORGE.Image#_imageKey
     * @type {string}
     * @private
     */
    this._imageKey = "";

    /**
     * The url of this image.
     * @name  FORGE.Image#_imageUrl
     * @type {string}
     * @private
     */
    this._imageUrl = "";

    /**
     * Is this image is internationnalized?
     * @name  FORGE.Image#_i18n
     * @type {boolean}
     * @private
     */
    this._i18n = false;

    /**
     * The i18n key associated to the image ressource in cache.
     * @name  FORGE.Image#_i18nImageKey
     * @type {string}
     * @private
     */
    this._i18nImageKey = "";

    /**
     * The i18n key associated to the url.
     * @name  FORGE.Image#_i18nImageUrl
     * @type {string}
     * @private
     */
    this._i18nImageUrl = "";

    /**
     * The {@link FORGE.LocaleString} that handles the different url for different languages.
     * @name  FORGE.Image#_i18nImageUrlLocaleString
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._i18nImageUrlLocaleString = null;

    /**
     * The HTML Image object from the cache source.
     * @name FORGE.Image#_img
     * @type {?Element|HTMLImageElement}
     * @private
     */
    this._img = null;

    /**
     * Is the Image source is loaded?
     * @name  FORGE.Image#_imageLoaded
     * @type {boolean}
     * @private
     */
    this._imageLoaded = false;

    /**
     * The frame represent the portion of the image source that will be used as background for dom.<br>
     * A frame is described like this : {x: 0, y: 0, w: 0, h: 0}.
     * @name  FORGE.Image#_frame
     * @type {?ImageFrame}
     * @private
     */
    this._frame = null;

    /**
     * An image can have different frames.<br>
     * This array contains all available frames for this image.
     * @type {Array<ImageFrameConfig>}
     * @private
     */
    this._frames = null;

    /**
     * This is the url of the frames JSON file.
     * @name  FORGE.Image#_framesUrl
     * @type {string}
     * @private
     */
    this._framesUrl = "";

    /**
     * Flag to know if the frames are loaded.<br>
     * If there are no frames, they are considered as loaded.
     * @name FORGE.Image#_framesLoaded
     * @type {boolean}
     * @private
     */
    this._framesLoaded = false;

    /**
     * Is the current ressource is loaded.
     * @name FORGE.Image#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    /**
     * Auto width flag, default to true
     * @name  FORGE.Image#_autoWidth
     * @type {boolean}
     * @private
     */
    this._autoWidth = true;

    /**
     * Auto height flag, default to true
     * @name  FORGE.Image#_autoHeight
     * @type {boolean}
     * @private
     */
    this._autoHeight = true;

    /**
     * Which render mode is used for image rendering?.<br>
     * Available render modes are listed in a constant FORGE.Image.renderModes
     * and the default mode is stored in FORGE.Image.renderMode.
     * @name  FORGE.Image#_renderMode
     * @type {string}
     * @private
     */
    this._renderMode = FORGE.Image.renderMode;

    /**
     * If the renderMode is CANVAS, you'll need a canvas element, so this is the canvas reference.
     * @name  FORGE.Image#_canvas
     * @type {Element|HTMLCanvasElement}
     * @private
     */
    this._canvas = null;

    /**
     * On load start event dispatcher.
     * @name  FORGE.Image#_onLoadStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadStart = null;

    /**
     * On load complete event dispatcher.
     * @name  FORGE.Image#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    FORGE.DisplayObject.call(this, viewer, null, className || "Image");
};

FORGE.Image.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.Image.prototype.constructor = FORGE.Image;

/**
 * Render modes list.
 * @name FORGE.Image.renderModes
 * @type {Object}
 * @const
 */
FORGE.Image.renderModes = {};

/**
 * @name FORGE.Image.renderModes.CSS
 * @type {string}
 * @const
 */
FORGE.Image.renderModes.CSS = "css";

/**
 * @name FORGE.Image.renderModes.CANVAS
 * @type {string}
 * @const
 */
FORGE.Image.renderModes.CANVAS = "canvas";

/**
 * Default render mode.
 * @name FORGE.Image.renderModes
 * @type {string}
 */
FORGE.Image.renderMode = FORGE.Image.renderModes.CSS;

/**
 * Boot sequence.
 * @method FORGE.Image#_boot
 * @private
 */
FORGE.Image.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    //Images keeps ratio by default
    this._keepRatio = true;

    if(this._renderMode === FORGE.Image.renderModes.CSS)
    {
        this._dom.style.backgroundRepeat = "no-repeat";
    }
    else if(this._renderMode === FORGE.Image.renderModes.CANVAS)
    {
        this._canvas = document.createElement("canvas");
        this._canvas.style.position = "absolute";
        this._canvas.style.top = "0px";
        this._canvas.style.left = "0px";
        this._dom.appendChild(this._canvas);
    }

    if(this._config !== null)
    {
        this.load(this._config);
    }

    this._viewer.display.register(this);
    this._notifyReady();
};

/**
 * Notify that the dispay object has been resized.<br>
 * This method ovverrides the {@link FORGE.DisplayObject} method.
 * @method  FORGE.Image#_notifyResize
 * @private
 * @param  {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.Image.prototype._notifyResize = function(data)
{
    var property = data.property;

    //If property is related to width except autoWidth
    if(property.toLowerCase().indexOf("width") !== -1 && property !== "autoWidth")
    {
        this._autoWidth = false;
    }

    //If property is related to height except autoHeight
    if(property.toLowerCase().indexOf("height") !== -1 && property !== "autoHeight")
    {
        this._autoHeight = false;
    }

    if(this._img === null)
    {
        return;
    }

    if(this._renderMode === FORGE.Image.renderModes.CSS)
    {
        this._updateBackgroundSize();
        this._updateBackgroundPosition();
    }
    else if(this._renderMode === FORGE.Image.renderModes.CANVAS)
    {
        if(this._frame !== null)
        {
            this._drawFrame(this._frame);
        }
    }

    if(this._keepRatio === true)
    {
        if(property.toLowerCase().indexOf("width") !== -1)
        {
            this._updateScaleWidth();
        }
        else if(property.toLowerCase().indexOf("height") !== -1)
        {
            this._updateScaleHeight();
        }
    }

    FORGE.DisplayObject.prototype._notifyResize.call(this, data);
};

/**
 * Internal method that updates image position to be centered in this borders.<br>
 * this is an override of the DisplayObject method
 * @method FORGE.Image#_notifyBorderResize
 * @private
 */
FORGE.Image.prototype._notifyBorderResize = function()
{
    if(this._renderMode === FORGE.Image.renderModes.CSS)
    {
        this._dom.style.backgroundPosition = (- this._borderWidth)+"px "+(- this._borderWidth)+"px";
    }
    else if(this._renderMode === FORGE.Image.renderModes.CANVAS)
    {
        this._canvas.style.top = - this._borderWidth+"px";
        this._canvas.style.left = - this._borderWidth+"px";
    }

    FORGE.DisplayObject.prototype._notifyBorderResize.call(this);
};

/**
 * Internal method that notify the load complete.<br>
 * this method can be overrided by a class that extends Image.
 * @method FORGE.Image#_notifyLoadComplete
 * @private
 */
FORGE.Image.prototype._notifyLoadComplete = function()
{
    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }
};

/**
 * Get the cache key for a specific locale.
 * @method FORGE.Image#_getLocalizedCacheKey
 * @private
 * @param  {string} locale - The locale of the cache key you ask for.
 * @return {string} The cache key for the locale you asked.
 */
FORGE.Image.prototype._getLocalizedCacheKey = function(locale)
{
    return this._imageKey + "_" + locale;
};

/**
 * Handler for locale change.
 * @method FORGE.Image#_localeChangeComplete
 * @private
 */
FORGE.Image.prototype._localeChangeComplete = function()
{
    var key = this._getLocalizedCacheKey(this._viewer.i18n.locale);

    if(key === this._i18nImageKey)
    {
        return;
    }

    this._i18nImageKey = key;

    if(this._viewer.i18n.hasValue(this._i18nImageUrl) === true)
    {
        var url = this._i18nImageUrlLocaleString.value;
        this._loadImage(key, url);
    }
};

/**
 * Set the image frame.<br>
 * The frame is the source rctangle that is used as background image.
 * @method  FORGE.Image#_setFrame
 * @private
 * @param {ImageFrame} frame - A frame is described like this : {x: 0, y: 0, w: 0, h: 0}.
 */
FORGE.Image.prototype._setFrame = function(frame)
{
    this._frame = frame;

    if(this._autoWidth === true)
    {
        this._width = this._frame.w;
        this._unitWidth = "px";
        this._dom.style.width = this.pixelWidth+"px";
    }

    if(this._autoHeight === true)
    {
        this._height = this._frame.h;
        this._unitHeight = "px";
        this._dom.style.height = this.pixelHeight+"px";
    }

    if(this._renderMode === FORGE.Image.renderModes.CSS)
    {
        this._updateBackgroundSize();
        this._updateBackgroundPosition();
    }
    else if(this._renderMode === FORGE.Image.renderModes.CANVAS)
    {
        this._drawFrame(this._frame);
    }
};

/**
 * Method to draw the frame if render mode is CANVAS.
 * @method FORGE.Image#_drawFrame
 * @private
 * @param  {Object} frame - The frame to draw
 */
FORGE.Image.prototype._drawFrame = function(frame)
{
    if(this._img === null || this._imageLoaded === false)
    {
        return;
    }

    this._canvas.width = this.innerWidth;
    this._canvas.height = this.innerHeight;

    var ctx = this._canvas.getContext("2d");
    ctx.clearRect(0, 0, this.innerWidth, this.innerHeight);
    ctx.drawImage(this._img, frame.x, frame.y, frame.w, frame.h, 0, 0, this.innerWidth, this.innerHeight);
};

/**
 * Internal method to update the background image size.
 * @method FORGE.Image#_updateBackgroundSize
 * @private
 */
FORGE.Image.prototype._updateBackgroundSize = function()
{
    var backgroundWidth = (this.pixelWidth / this._frame.w) * this._img.naturalWidth;
    var backgroundHeight = (this.pixelHeight / this._frame.h) * this._img.naturalHeight;
    this._dom.style.backgroundSize = backgroundWidth+"px "+backgroundHeight+"px";
};

/**
 * Internal method to update the background image position.
 * @method FORGE.Image#_updateBackgroundPosition
 * @private
 */
FORGE.Image.prototype._updateBackgroundPosition = function()
{
    var posX = (- this._frame.x - this._borderWidth) * (this.pixelWidth / this._frame.w);
    var posY = (- this._frame.y - this._borderWidth) * (this.pixelHeight / this._frame.h);
    this._dom.style.backgroundPosition = posX+"px "+posY+"px";
};

/**
 * Update the size of the image based on scale width.
 * @method  FORGE.Image#_updateScaleWidth
 * @private
 */
FORGE.Image.prototype._updateScaleWidth = function()
{
    var scaleWidth = this.pixelWidth / this._frame.w;

    if(scaleWidth === this._scaleWidth)
    {
        return;
    }

    this._scaleWidth = scaleWidth;

    if(this._keepRatio === true)
    {
        this._scaleHeight = scaleWidth;
        this.height = this._frame.h * this._scaleHeight;
    }
};

/**
 * Update the size of the image based on scale height.
 * @method  FORGE.Image#_updateScaleHeight
 * @private
 */
FORGE.Image.prototype._updateScaleHeight = function()
{
    var scaleHeight = this.pixelHeight / this._frame.h;

    if(scaleHeight === this._scaleHeight)
    {
        return;
    }

    this._scaleHeight = scaleHeight;

    if(this._keepRatio === true)
    {
        this._scaleWidth = scaleHeight;
        this.width = this._frame.w * this._scaleWidth;
    }
};

/**
 * Internal method to load an image asset.
 * @method FORGE.Image#_load
 * @private
 * @param {string} key - The key associated to the asset for cache.
 * @param {string} url - The URL of the asset.
 */
FORGE.Image.prototype._loadImage = function(key, url)
{
    this._loaded = false;
    this._viewer.load.image(key, url, this._loadImageComplete, this);
};

/**
 * Event handler for image load complete.
 * @method FORGE.Image#_loadImageComplete
 * @private
 */
FORGE.Image.prototype._loadImageComplete = function(file)
{
    //If image is destroy during loading time, don't execute the callback
    if(this._alive === false)
    {
        return;
    }

    this._img = file.data;

    if(this._renderMode === FORGE.Image.renderModes.CSS)
    {
        this._dom.style.backgroundImage = "url('"+file.url+"')";
    }

    this._imageLoaded = true;

    this._loadComplete();
};

/**
 * Method to load frames data.
 * @method  FORGE.Image#_loadFrames
 * @param  {string} url - Url of the JSON file taht handles frame data.
 * @private
 */
FORGE.Image.prototype._loadFrames = function(url)
{
    this._loaded = false;

    var key = this._imageKey+"-frames";
    this._viewer.load.json(key, url, this._loadFramesComplete, this);
};

/**
 * Event handler for frame data load complete.
 * @method  FORGE.Image#_loadFramesComplete
 * @param  {FORGE.File} file - The file that is loaded
 * @private
 */
FORGE.Image.prototype._loadFramesComplete = function(file)
{
    if(typeof file.data.frames !== "undefined")
    {
        this._frames = file.data.frames;
        //this._setFrame(this._frames[0].frame);
    }
    else
    {
        this.warn("No frames found in file!");
    }

    this._framesLoaded = true;

    this._loadComplete();
};

/**
 * This method validate the complete loading of all the assets (image + frames)
 * @method FORGE.Image#_loadComplete
 * @private
 */
FORGE.Image.prototype._loadComplete = function()
{
    if(this._loaded === true)
    {
        return;
    }

    if(this._imageLoaded === true && this._framesLoaded === true)
    {
        this._loaded = true;

        var frame;

        if(this._frame !== null)
        {
            frame = this._frame;
        }
        else
        {
            if(this._frames !== null)
            {
                frame = this._frames[0].frame;
            }
            else
            {
                frame =
                {
                    x: 0,
                    y: 0,
                    w: this._img.naturalWidth,
                    h: this._img.naturalHeight
                };
            }
        }

        this._setFrame(frame);

        this._updateAnchors();

        this._applyPending(false);

        this._notifyLoadComplete();
    }
};

/**
 * Inner method that parse an image configuration.
 * @method FORGE.Image#_parseConfig
 * @param  {ImageConfig|string} config - Image configuration object
 * @private
 */
FORGE.Image.prototype._parseConfig = function(config)
{
    if(typeof config === "object" && config !== null)
    {
        this._imageKey = config.key || "";

        this._i18n = config.i18n || false;

        if(this._i18n === true)
        {
            this._imageUrl = "";
            this._i18nImageUrl = config.url;
        }
        else
        {
            this._imageUrl = config.url;
        }

        this._frame = config.frame || null;

        if(typeof config.frames === "string")
        {
            this._framesUrl = config.frames;
        }
        else if(typeof config.frames === "object" && config.frames !== null)
        {
            this._frames = config.frames;
        }

        //Applying style in config
        this.alpha = config.alpha;
        this.keepRatio = config.keepRatio;
        this.maximized = config.maximized;
        this.width = config.width;
        this.height = config.height;
    }
    else
    {
        this._imageKey = "";
        this._imageUrl = "";
        this._i18n = false;

        if(typeof config === "string")
        {
            this._imageUrl = config;
        }
    }
};

/**
 * Internal method to load an image asset.
 * @method FORGE.Image#load
 * @param {string|ImageConfig} config - The config to load, can be an url or a configuration object.
 */
FORGE.Image.prototype.load = function(config)
{
    this._loaded = false;
    this._imageLoaded = false;
    this._framesLoaded = false;

    this._parseConfig(config);

    var imageKey = this._imageKey;
    var imageUrl = this._imageUrl;

    if(this._i18n === true && typeof this._i18nImageUrl === "string")
    {
        this._i18nImageUrlLocaleString = new FORGE.LocaleString(this._viewer, this._i18nImageUrl);

        if(this._viewer.i18n.onLocaleChangeComplete.has(this._localeChangeComplete, this) === false)
        {
            this._viewer.i18n.onLocaleChangeComplete.add(this._localeChangeComplete, this);
        }

        var locale = this._viewer.i18n.locale;
        if(locale !== "")
        {
            imageKey = this._getLocalizedCacheKey(locale);
        }

        if(this._viewer.i18n.hasValue(this._i18nImageUrl) === true)
        {
            imageUrl = this._i18nImageUrlLocaleString.value;
        }
    }

    if(imageUrl !== "")// && typeof imageUrl !== "undefined")
    {
        this._loadImage(imageKey, imageUrl);
    }
    else
    {
        this._imageLoaded = true;
    }

    if(typeof this._framesUrl === "string" && this._framesUrl !== "")
    {
        this._loadFrames(this._framesUrl);
    }
    else
    {
        this._framesLoaded = true; //Consider frames as loaded if there are no frames
    }
};

/**
 * Unload the image background from the DOM object.
 * @method  FORGE.Image#unload
 */
FORGE.Image.prototype.unload = function()
{
    this._dom.style.backgroundImage = "";
    this._img = null;
};

/**
 * Destroy method.
 * @method FORGE.Image#destroy
 * @param {boolean=} clearCache - Does the destroy sequence have to clear the image cache?
 */
FORGE.Image.prototype.destroy = function(clearCache)
{
    if(this._alive === false)
    {
        return;
    }

    if(this._i18nImageUrlLocaleString !== null)
    {
        this._i18nImageUrlLocaleString.destroy();
        this._i18nImageUrlLocaleString = null;
        this._viewer.i18n.onLocaleChangeComplete.remove(this._localeChangeComplete, this);
    }

    if(this._onLoadStart !== null)
    {
        this._onLoadStart.destroy();
        this._onLoadStart = null;
    }

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    this._img = null;

    if(typeof clearCache === "undefined" || clearCache === true)
    {
        if(this._i18n === true)
        {
            var locales = this._viewer.i18n.locales;
            var cacheKey;
            for(var i = 0, ii = locales.length; i < ii; i++)
            {
                cacheKey = this._getLocalizedCacheKey(locales[i]);
                this._viewer.cache.remove(FORGE.Cache.types.IMAGE, cacheKey);
            }
        }
        else
        {
            this._viewer.cache.remove(FORGE.Cache.types.IMAGE, this._imageKey);
        }
    }

    FORGE.DisplayObject.prototype.destroy.call(this);
};

/**
* Get the loaded status of the image.
* @name FORGE.Image#loaded
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.Image.prototype, "loaded",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        return this._loaded;
    }
});

/**
* Get the current image element.
* @name FORGE.Image#element
* @readonly
* @type {?Element|HTMLImageElement}
*/
Object.defineProperty(FORGE.Image.prototype, "element",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        return this._img;
    }
});

/**
* Get and set the current frame {x: 0, y: 0, w: 0, h: 0}.
* @name FORGE.Image#frame
* @type {Object}
*/
Object.defineProperty(FORGE.Image.prototype, "frame",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        return this._frame;
    },

    /** @this {FORGE.Image} */
    set: function(frame)
    {
        this._setFrame(frame);
    }
});

/**
* Get the frames array.
* @name FORGE.Image#frames
* @readonly
* @type {Array<ImageFrameConfig>}
*/
Object.defineProperty(FORGE.Image.prototype, "frames",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        return this._frames;
    }
});

/**
* Get the original width of the image.
* @name FORGE.Image#originalWidth
* @readonly
* @type {number}
*/
Object.defineProperty(FORGE.Image.prototype, "originalWidth",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        if(this._img !== null)
        {
            return this._img.naturalWidth;
        }
    }
});

/**
* Get the original height of the image.
* @name FORGE.Image#originalHeight
* @readonly
* @type {number}
*/
Object.defineProperty(FORGE.Image.prototype, "originalHeight",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        if(this._img !== null)
        {
            return this._img.naturalHeight;
        }
    }
});

/**
* Get the onLoadStart {@link FORGE.EventDispatcher}.
* @name FORGE.Image#onLoadStart
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Image.prototype, "onLoadStart",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        if(this._onLoadStart === null)
        {
            this._onLoadStart = new FORGE.EventDispatcher(this);
        }

        return this._onLoadStart;
    }
});

/**
* Get the onLoadComplete {@link FORGE.EventDispatcher}.
* @name FORGE.Image#onLoadComplete
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Image.prototype, "onLoadComplete",
{
    /** @this {FORGE.Image} */
    get: function()
    {
        if(this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});