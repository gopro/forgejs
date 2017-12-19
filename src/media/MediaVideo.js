/**
 * MediaVideo class.
 *
 * @constructor FORGE.MediaVideo
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input MediaVideo configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.MediaVideo = function(viewer, config)
{
    /**
     * The Video reference
     * @name FORGE.MediaImage#_video
     * @type {FORGE.VideoBase}
     * @private
     */
    this._video = null;

    /**
     * The Media texture associated to this video.
     * @name FORGE.MediaImage#_texture
     * @type {FORGE.MediaTexture}
     * @private
     */
    this._texture = null;

    FORGE.Media.call(this, viewer, config, "MediaVideo");
};

FORGE.MediaVideo.prototype = Object.create(FORGE.Media.prototype);
FORGE.MediaVideo.prototype.constructor = FORGE.MediaVideo;

/**
 * Configuration parsing.
 * @method FORGE.MediaVideo#_parseConfig
 * @param {SceneMediaConfig} config input MediaVideo configuration
 * @private
 */
FORGE.MediaVideo.prototype._parseConfig = function(config)
{
    FORGE.Media.prototype._parseConfig.call(this, config);

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
};

/**
 * Internal handler on video metadata loaded.
 * @method FORGE.MediaVideo#_onLoadedMetaDataHandler
 * @private
 */
FORGE.MediaVideo.prototype._onLoadedMetaDataHandler = function()
{
    if (this._options !== null)
    {
        this._video.volume = (typeof this._options.volume === "number") ? this._options.volume : 1;
        this._video.loop = (typeof this._options.loop === "boolean") ? this._options.loop : true;
        this._video.currentTime = (typeof this._options.startTime === "number") ? this._options.startTime : 0;

        if (this._options.autoPlay === true && document[FORGE.Device.visibilityState] === "visible")
        {
            this._video.play();
        }

        this._video.autoPause = this._options.autoPause;
        this._video.autoResume = this._options.autoResume;
    }

    this._texture = new FORGE.MediaTexture(this._video);

    this._notifyLoadComplete();
};

/**
 * Internal handler on video play.
 * @method FORGE.MediaVideo#_onPlayHandler
 * @private
 */
FORGE.MediaVideo.prototype._onPlayHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onPlay, "ActionEventDispatcher") === true)
    {
        this._events.onPlay.dispatch();
    }
};

/**
 * Internal handler on video pause.
 * @method FORGE.MediaVideo#_onPauseHandler
 * @private
 */
FORGE.MediaVideo.prototype._onPauseHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onPause, "ActionEventDispatcher") === true)
    {
        this._events.onPause.dispatch();
    }
};

/**
 * Internal handler on video seeked.
 * @method FORGE.MediaVideo#_onSeekedHandler
 * @private
 */
FORGE.MediaVideo.prototype._onSeekedHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onSeeked, "ActionEventDispatcher") === true)
    {
        this._events.onSeeked.dispatch();
    }
};

/**
 * Internal handler on video ended.
 * @method FORGE.MediaVideo#_onEndedHandler
 * @private
 */
FORGE.MediaVideo.prototype._onEndedHandler = function()
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onEnded, "ActionEventDispatcher") === true)
    {
        this._events.onEnded.dispatch();
    }
};

FORGE.MediaVideo.prototype.update = function()
{
    if(this._texture !== null)
    {
        this._texture.update();
    }
};

/**
 * MediaVideo load
 * @method FORGE.MediaVideo#load
 */
FORGE.MediaVideo.prototype.load = function()
{
    if (typeof this._source.streaming !== "undefined" && this._source.streaming.toLowerCase() === FORGE.VideoFormat.DASH)
    {
        this._video = new FORGE.VideoDash(this._viewer, this._uid);
    }
    else
    {
        var scene = this._viewer.story.scene;

        // check of the ambisonic state of the video sound prior to the video instanciation
        this._video = new FORGE.VideoHTML5(this._viewer, this._uid, null, null, (scene.hasSoundTarget(this._uid) === true && scene.isAmbisonic() === true ? true : false));
    }

    // At this point, source.url is either a streaming address, a simple
    // url, or an array of url
    this._video.load(this._source.url);

    this._video.onLoadedMetaData.addOnce(this._onLoadedMetaDataHandler, this);
    this._video.onPlay.add(this._onPlayHandler, this);
    this._video.onPause.add(this._onPauseHandler, this);
    this._video.onSeeked.add(this._onSeekedHandler, this);
    this._video.onEnded.add(this._onEndedHandler, this);
};

/**
 * MediaVideo unload
 * @method FORGE.MediaVideo#unload
 */
FORGE.MediaVideo.prototype.unload = function()
{
    if(this._video !== null)
    {
        this._video.destroy();
        this._video = null;
    }

    if(this._texture !== null)
    {
        this._texture.destroy();
        this._texture = null;
    }

    FORGE.Media.prototype.unload.call(this);
};

/**
 * MediaVideo destroy sequence
 *
 * @method FORGE.MediaVideo#destroy
 */
FORGE.MediaVideo.prototype.destroy = function()
{
    this.unload();

    FORGE.Media.prototype.destroy.call(this);
};

/**
 * Get the video
 * @name FORGE.MediaVideo#video
 * @type {FORGE.Image}
 * @readonly
 */
Object.defineProperty(FORGE.MediaVideo.prototype, "video",
{
    /** @this {FORGE.MediaImage} */
    get: function()
    {
        return this._video;
    }
});

/**
 * Get the displayObject
 * @name FORGE.MediaVideo#displayObject
 * @type {FORGE.VideoBase}
 * @readonly
 */
Object.defineProperty(FORGE.MediaVideo.prototype, "displayObject",
{
    /** @this {FORGE.MediaImage} */
    get: function()
    {
        return this._video;
    }
});

/**
 * Get the texture
 * @name FORGE.MediaVideo#texture
 * @type {FORGE.MediaTexture}
 * @readonly
 */
Object.defineProperty(FORGE.MediaVideo.prototype, "texture",
{
    /** @this {FORGE.MediaVideo} */
    get: function()
    {
        return this._texture;
    }
});