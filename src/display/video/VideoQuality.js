
/**
 * This object describe a video quality preset.
 * @constructor FORGE.VideoQuality
 * @param {string} url - The url of the video source for this video quality preset.
 * @extends {FORGE.BaseObject}
 */
FORGE.VideoQuality = function(url)
{
     /**
     * The name of the quality.
     * @name  FORGE.VideoQuality#_id
     * @type {string|number}
     * @private
     */
    this._id = "";

    /**
     * The url of the video.
     * @name  FORGE.VideoQuality#_url
     * @type {string}
     * @private
     */
    this._url = url || "";

    /**
     * The type of the video quality.
     * @name  FORGE.VideoQuality#_mimeType
     * @type {string}
     * @private
     */
    this._mimeType = "";

    /**
     * The name of the video quality.
     * @name  FORGE.VideoQuality#_name
     * @type {string}
     * @private
     */
    this._name = "";

    /**
     * The framerate of the video quality.
     * @name  FORGE.VideoQuality#_framerate
     * @type {number}
     * @private
     */
    this._framerate = 0;

    /**
     * The bitrate of the video quality.
     * @name  FORGE.VideoQuality#_bitrate
     * @type {number}
     * @private
     */
    this._bitrate = 0;

    /**
     * The width of the video quality.
     * @name  FORGE.VideoQuality#_width
     * @type {number}
     * @private
     */
    this._width = 0;

    /**
     * The height of the video quality.
     * @name  FORGE.VideoQuality#_height
     * @type {number}
     * @private
     */
    this._height = 0;

    /**
     * The speed of the video quality.<br>
     * (1 is foward, -1 is backward, 2 is two times faster, ...).
     * @name  FORGE.VideoQuality#_speed
     * @type {number}
     * @private
     */
    this._speed = 1;


    FORGE.BaseObject.call(this, "VideoQuality");
};

FORGE.VideoQuality.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.VideoQuality.prototype.constructor = FORGE.VideoQuality;

/**
 * Get the MIME type of a video quality preset from it's url.
 * @name  FORGE.VideoQuality#mimeTypeFromURL
 * @param  {string} url - The video preset url.
 * @return {string} The MIME type of the video preset.
 */
FORGE.VideoQuality.mimeTypeFromURL = function(url)
{
    var types = ["mp4", "webm", "ogg"];
    var parsedURL = FORGE.URL.parse(url);
    
    if(parsedURL.extension !== "" && types.indexOf(parsedURL.extension) !== -1)
    {
        return "video/" + parsedURL.extension;
    }

    var streamingTypes = ["mpd"];
    if(parsedURL.extension !== "" && streamingTypes.indexOf(parsedURL.extension) !== -1)
    {
        return "application/dash+xml";
    }

    return "";
};

/**
 * Get and set the video quality preset ID.
 * @name FORGE.VideoQuality#id
 * @type {string|number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "id", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._id;
    }, 

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "number" || typeof value === "string")
        {
            this._id = value;
        }
    }
});

/**
 * Get the video quality preset url.
 * @name FORGE.VideoQuality#url
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "url", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._url;
    }, 

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "string")
        {
            this._url = value;
        }
    }
});

/**
 * Get the video quality preset MIME type.
 * @name FORGE.VideoQuality#mimeType
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "mimeType", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        if(this._mimeType !== "")
        {
            return this._mimeType;
        }
        else if(this._url !== "")
        {
            this._mimeType = FORGE.VideoQuality.mimeTypeFromURL(this._url);
        }

        return this._mimeType;
    }
});

/**
 * Get the video quality preset name.
 * @name FORGE.VideoQuality#name
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "name", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._name;
    },

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "string")
        {
            this._name = value;
        }
    }
});

/**
 * Get the video quality preset framerate.
 * @name FORGE.VideoQuality#framerate
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "framerate", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._framerate;
    }
});

/**
 * Get and set the video quality preset bitrate.
 * @name FORGE.VideoQuality#bitrate
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "bitrate", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._bitrate;
    },

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._bitrate = value;
        }
    }
});

/**
 * Get and set the video quality preset width.
 * @name FORGE.VideoQuality#width
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "width", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._width;
    },

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._width = value;
        }
    }
});

/**
 * Get and set the video quality preset height.
 * @name FORGE.VideoQuality#height
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "height", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._height;
    },

    /** @this {FORGE.VideoQuality} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._height = value;
        }
    }
});

/**
 * Get the video quality preset speed.
 * @name FORGE.VideoQuality#speed
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.VideoQuality.prototype, "speed", 
{
    /** @this {FORGE.VideoQuality} */
    get: function()
    {
        return this._speed;
    }
});
