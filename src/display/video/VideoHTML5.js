/**
 * Display object that contains a html video tag.<br>
 * <br>
 * Mobile limitations :<br>
 * - Can't play a video without user touch interaction, so we can't do smooth multiquality.
 *
 * @constructor FORGE.VideoHTML5
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {string} key - The video file id reference.
 * @param {?(string|FORGE.VideoQuality|Array<(string|FORGE.VideoQuality)>)=} config - Either a {@link FORGE.VideoQuality} or a String URL, or an array of strings or {@link FORGE.VideoQuality} if multiquality.
 * @param {?string=} qualityMode - The default quality mode.
 * @param {?boolean=} ambisonic - Is the video sound ambisonic?
 * @extends {FORGE.VideoBase}
 *
 * @todo  Define a config object for videos, maybe a class like VideoConfig to describe this porperly.
 * @todo  Make it work with several sources if the user wants to pass a mp4 + webm + ogg for example.
 * @todo  Deal with playback speeds.
 * @todo  Add subtitles management with <track> and VTT/TTML(EBU-TT-D) files
 */
FORGE.VideoHTML5 = function(viewer, key, config, qualityMode, ambisonic)
{
    /**
     * The video identifier.
     * @name FORGE.VideoHTML5#_key
     * @type {string}
     * @private
     */
    this._key = key;

    /**
     * {@link FORGE.VideoQuality} for this video, it can be temporarily a string into the constructor.
     * @name FORGE.VideoHTML5#_config
     * @type {?(string|FORGE.VideoQuality|Array<(string|FORGE.VideoQuality)>)}
     * @private
     */
    this._config = config || null;

    /**
     * Array of {@link FORGE.VideoQuality}.
     * @name  FORGE.VideoHTML5#_qualities
     * @type {Array<FORGE.VideoQuality>}
     * @private
     */
    this._qualities = null;

    /**
     * Default quality mode, it can be either "auto" or "manual", modes are listed by FORGE.VideoQualityMode constant.
     * @name FORGE.VideoHTML5#_defaultQualityMode
     * @type {string}
     * @private
     */
    this._defaultQualityMode = qualityMode || FORGE.VideoQualityMode.AUTO;

    /**
     * Current Quality mode.
     * @name  FORGE.VideoHTML5#_qualityMode
     * @type {string}
     * @private
     */
    this._qualityMode = "";

    /**
     * Array of videos objects thaht handle the dom and some stats about each videos.
     * @name FORGE.VideoHTML5#_videos
     * @type {Array<VideoHTML5Object>}
     * @private
     */
    this._videos = null;

    /**
     * The index of the requested video (if -1 no video is requested).
     * @name  FORGE.VideoHTML5#_requestIndex
     * @type {number}
     * @private
     */
    this._requestIndex = -1;

    /**
     * The index of the current video (if -1 no video is selected as the current one).
     * @name  FORGE.VideoHTML5#_currentIndex
     * @type {number}
     * @private
     */
    this._currentIndex = -1;

    /**
     * Timer that handler all times event when a video quality request is done.
     * @name  FORGE.VideoHTML5#_requestTimer
     * @type {FORGE.Timer}
     * @private
     */
    this._requestTimer = null;

    /**
     * Do the video quality change should be forced ? This var keep a reference to forceRequest between the diffent functions of callbacks chain.
     * @name  FORGE.VideoHTML5#_forceRequest
     * @type {boolean}
     * @private
     */
    this._forceRequest = false;

    /**
     * The time is milliseconds the requested video is seeked above the current time and wait to be synched.<br>
     * This delay ensure that the requested video have a minimum time to load before being synched.
     * @name  FORGE.VideoHTML5#_syncTime
     * @type {number}
     * @private
     */
    this._syncTime = 6000;

    /**
     * The time is milliseconds the requested video is considered as a failure.
     * @name  FORGE.VideoHTML5#_timeoutTime
     * @type {number}
     * @private
     */
    this._timeoutTime = 20000;

    /**
     * Timer that handler all times loop that check if we have to change quality (up or down).
     * @name  FORGE.VideoHTML5#_autoQualityTimer
     * @type {FORGE.Timer}
     * @private
     */
    this._autoQualityTimer = null;

    /**
     * Does the video loop?
     * @name  FORGE.VideoHTML5#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * The volume of the video.
     * @name  FORGE.VideoHTML5#_volume
     * @type {number}
     * @private
     */
    this._volume = 1;

    /**
     * Is the video volume is muted?
     * @name  FORGE.VideoHTML5#_muted
     * @type {boolean}
     * @private
     */
    this._muted = false;

    /**
     * Private reference to the previous volume before mute.
     * @name  FORGE.VideoHTML5#_mutedVolume
     * @type {number}
     * @private
     */
    this._mutedVolume = 0;

    /**
     * Playback rate of the video
     * @name FORGE.VideoHTML5#_playbackRate
     * @type {number}
     * @private
     */
    this._playbackRate = 1;

    /**
     * FOARenderer is a ready-made FOA decoder and binaural renderer.
     * @name  FORGE.VideoHTML5#_foaRenderer
     * @type {?FOARenderer}
     * @private
     */
    this._foaRenderer = null;

    /**
     * Media Element Audio souce node element.
     * @name  FORGE.Sound#_soundElementSource
     * @type {?MediaElementAudioSourceNode}
     * @private
     */
    this._soundElementSource = null;

    /**
     * Is it an ambisonical video soundtrack?
     * @name  FORGE.VideoHTML5#_ambisonic
     * @type {boolean}
     * @private
     */
    this._ambisonic = ambisonic || false;

    /**
     * Default channel map for ambisonic sound.
     * @name  FORGE.VideoHTML5#_defaultChannelMap
     * @type {Array<number>}
     * @private
     */
    this._defaultChannelMap = [0, 1, 2, 3]; //AMBIX
    //this._defaultChannelMap = [0, 3, 1, 2]; //FUMA

    /**
     * Does the video have received its metaData?
     * @name  FORGE.VideoHTML5#_metaDataLoaded
     * @type {boolean}
     * @private
     */
    this._metaDataLoaded = false;

    /**
     * On load start event dispatcher.
     * @name  FORGE.VideoHTML5#_onLoadStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadStart = null;

    /**
     * On loaded metadata event dispatcher.
     * @name  FORGE.VideoHTML5#_onLoadedMetaData
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadedMetaData = null;

    /**
     * On loaded data event dispatcher.
     * @name  FORGE.VideoHTML5#_onLoadedData
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadedData = null;

    /**
     * On progress event dispatcher.
     * @name  FORGE.VideoHTML5#_onProgress
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onProgress = null;

    /**
     * On duration change event dispatcher.
     * @name  FORGE.VideoHTML5#_onDurationChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onDurationChange = null;

    /**
     * On can play event dispatcher.
     * @name  FORGE.VideoHTML5#_onCanPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onCanPlay = null;

    /**
     * On can play through event dispatcher.
     * @name  FORGE.VideoHTML5#_onCanPlayThrough
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onCanPlayThrough = null;

    /**
     * On play event dispatcher.
     * @name  FORGE.VideoHTML5#_onPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On pause event dispatcher.
     * @name  FORGE.VideoHTML5#_onPause
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * On time update event dispatcher.
     * @name  FORGE.VideoHTML5#_onTimeUpdate
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onTimeUpdate = null;

    /**
     * On current time change event dispatcher.
     * @name FORGE.VideoHTML5#_onCurrentTimeChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onCurrentTimeChange = null;

    /**
     * On volume change event dispatcher.
     * @name  FORGE.VideoHTML5#_onVolumeChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onVolumeChange = null;

    /**
     * On seeking event dispatcher.
     * @name  FORGE.VideoHTML5#_onSeeking
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onSeeking = null;

    /**
     * On seeked event dispatcher.
     * @name  FORGE.VideoHTML5#_onSeeked
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onSeeked = null;

    /**
     * On ended event dispatcher.
     * @name  FORGE.VideoHTML5#_onEnded
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnded = null;

    /**
     * On error event dispatcher.
     * @name  FORGE.VideoHTML5#_onError
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onError = null;

    /**
     * On waiting event dispatcher.
     * @name  FORGE.VideoHTML5#_onWaiting
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onWaiting = null;

    /**
     * On stalled event dispatcher.
     * @name  FORGE.VideoHTML5#_onStalled
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStalled = null;

    /**
     * On playing event dispatcher.
     * @name  FORGE.VideoHTML5#_onPlaying
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPlaying = null;

    /**
     * On rate change event dispatcher.
     * @name  FORGE.VideoHTML5#_onRateChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onRateChange = null;

    /**
     * On mute event dispatcher.
     * @name  FORGE.VideoHTML5#_onMute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMute = null;

    /**
     * On unmute event dispatcher.
     * @name  FORGE.VideoHTML5#_onUnmute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onUnmute = null;

    /**
     * On qualityRequest event dispatcher.
     * @name  FORGE.VideoHTML5#_onQualityRequest
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onQualityRequest = null;

    /**
     * On qualityChange event dispatcher.
     * @name  FORGE.VideoHTML5#_onQualityChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onQualityChange = null;

    /**
     * On qualityAbort event dispatcher.
     * @name  FORGE.VideoHTML5#_onQualityAbort
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onQualityAbort = null;

    /**
     * On qualties loaded event dispatcher.
     * @name  FORGE.VideoHTML5#_onQualitiesLoaded
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onQualitiesLoaded = null;

    /**
     * On qualityModeChange event dispatcher.
     * @name  FORGE.VideoHTML5#_onQualityModeChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onQualityModeChange = null;

    /**
     * Event handler for request error binded to this.
     * @name FORGE.VideoHTML5#_onRequestErrorBind
     * @type {Function}
     * @private
     */
    this._onRequestErrorBind = null;

    /**
     * Event handler for request load start binded to this.
     * @name FORGE.VideoHTML5#_onRequestLoadStartBind
     * @type {Function}
     * @private
     */
    this._onRequestLoadStartBind = null;

    /**
     * Event handler for request loaded metadata binded to this.
     * @name FORGE.VideoHTML5#_onRequestLoadedMetaDataBind
     * @type {Function}
     * @private
     */
    this._onRequestLoadedMetaDataBind = null;

    /**
     * Event handler for request loaded data binded to this.
     * @name FORGE.VideoHTML5#_onRequestLoadedDataBind
     * @type {Function}
     * @private
     */
    this._onRequestLoadedDataBind = null;

    /**
     * Event handler for request can play (before seek) binded to this.
     * @name FORGE.VideoHTML5#_onRequestCanPlayBeforeSeekBind
     * @type {Function}
     * @private
     */
    this._onRequestCanPlayBeforeSeekBind = null;

    /**
     * Event handler for request seeked binded to this.
     * @name FORGE.VideoHTML5#_onRequestSeekedBind
     * @type {Function}
     * @private
     */
    this._onRequestSeekedBind = null;

    /**
     * Event handler for request can play (after seek) binded to this.
     * @name FORGE.VideoHTML5#_onRequestCanPlayAfterSeekBind
     * @type {Function}
     * @private
     */
    this._onRequestCanPlayAfterSeekBind = null;

    /**
     * Event handler for request seeked (while synch) binded to this.
     * @name FORGE.VideoHTML5#_onRequestSeekedWhileSyncBind
     * @type {Function}
     * @private
     */
    this._onRequestSeekedWhileSyncBind = null;

    /**
     * Event handler for all events fired by the HTMLVideoElement. See https://developer.mozilla.org/en/docs/Web/Guide/Events/Media_events for a list of available events.
     * @name FORGE.VideoHTML5#_onEventBind
     * @type {Function}
     * @private
     */
    this._onEventBind = null;

    /**
     * Event handler for FOA renderer initialized binded to this.
     * @name FORGE.VideoHTML5#_foaRendererInitializedSuccessBind
     * @type {Function}
     * @private
     */
    this._foaRendererInitializedSuccessBind = null;

    /**
     * Event handler for FOA renderer initialization error binded to this.
     * @name FORGE.VideoHTML5#_foaRendererInitializedErrorBind
     * @type {Function}
     * @private
     */
    this._foaRendererInitializedErrorBind = null;

    FORGE.VideoBase.call(this, viewer, "VideoHTML5");
};

FORGE.VideoHTML5.prototype = Object.create(FORGE.VideoBase.prototype);
FORGE.VideoHTML5.prototype.constructor = FORGE.VideoHTML5;

/**
 * Boot sequence.
 * @method FORGE.VideoHTML5#_boot
 * @private
 */
FORGE.VideoHTML5.prototype._boot = function()
{
    FORGE.VideoBase.prototype._boot.call(this);

    if (this._ambisonic === true && this._isAmbisonic() === false)
    {
        this.log("FORGE.VideoHTML5: can't manage ambisonic sound without Google Chrome Omnitone library and WebAudio API.");
        this._ambisonic = false;
    }

    //register the uid
    this._uid = this._key;
    this._register();

    this._onRequestErrorBind = this._onRequestError.bind(this);
    this._onRequestLoadStartBind = this._onRequestLoadStart.bind(this);
    this._onRequestLoadedMetaDataBind = this._onRequestLoadedMetaData.bind(this);
    this._onRequestLoadedDataBind = this._onRequestLoadedData.bind(this);
    this._onRequestCanPlayBeforeSeekBind = this._onRequestCanPlayBeforeSeek.bind(this);
    this._onRequestSeekedBind = this._onRequestSeeked.bind(this);
    this._onRequestCanPlayAfterSeekBind = this._onRequestCanPlayAfterSeek.bind(this);
    this._onRequestSeekedWhileSyncBind = this._onRequestSeekedWhileSync.bind(this);

    this._onEventBind = this._onEventHandler.bind(this);

    this._requestTimer = this._viewer.clock.create(false);

    this._autoQualityTimer = this._viewer.clock.create(false);
    this._autoQualityTimer.loop(500, this._autoQualityTimerLoop, this);

    //Listen to the main volume change to adapt the video volume accordingly.
    this._viewer.audio.onVolumeChange.add(this._mainVolumeChangeHandler, this);

    //Listen to the enabled state of the sound manager.
    this._viewer.audio.onDisable.add(this._disableSoundHandler, this);

    //force the creation of "onQualitiesLoaded" event dispatcher and memorize it's data
    this._onQualitiesLoaded = new FORGE.EventDispatcher(this, true);

    if (this._config !== null)
    {
        this.load(this._config);
    }

    this._viewer.display.register(this, this._isAmbisonic());
    this._notifyReady();
    this._applyPending(false);
};

/**
 * Parse the video configuration object.
 * @method FORGE.VideoHTML5#_parseConfig
 * @private
 * @param  {?(string|FORGE.VideoQuality|Array<(string|FORGE.VideoQuality)>)} config - The config object to parse.
 * @return {Array<FORGE.VideoQuality>} Returns the array of {@link FORGE.VideoQuality}.
 */
FORGE.VideoHTML5.prototype._parseConfig = function(config)
{
    if (config !== null)
    {
        if (FORGE.Utils.isTypeOf(config, "string") === true)
        {
            config = [config];
        }
        else if (FORGE.Utils.isTypeOf(config, "VideoQuality") === true)
        {
            config = [config];
        }

        if (FORGE.Utils.isArrayOf(config, "string") === true)
        {
            this._qualities = this._createQualitiesFromURLs( /** @type {Array<string>} */ (config));
        }
        else if (FORGE.Utils.isArrayOf(config, "VideoQuality") === true)
        {
            this._qualities = /** @type {Array<FORGE.VideoQuality>} */ (config);
        }
    }

    if (this._onQualitiesLoaded !== null)
    {
        this._onQualitiesLoaded.dispatch(this._qualities);
    }

    return this._qualities;
};

/**
 * Notify that the dispay object has been resized.<br>
 * This method ovverrides the {@link FORGE.DisplayObject} method.
 * @method  FORGE.VideoHTML5#_notifyResize
 * @private
 * @param  {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.VideoHTML5.prototype._notifyResize = function(data)
{
    var currentVideo = this._getCurrentVideo();

    if (currentVideo !== null && currentVideo.element !== null)
    {
        currentVideo.element.setAttribute("width", this.pixelWidth);
        currentVideo.element.setAttribute("height", this.pixelHeight);
    }

    FORGE.DisplayObject.prototype._notifyResize.call(this, data);
};

/**
 * Create the array of {@link FORGE.VideoQuality} from an array of URLs (strings).
 * @method FORGE.VideoHTML5#_createQualitiesFromURLs
 * @private
 * @param  {Array<string>} urls - Array of URLS (strings) to convert to array of {@link FORGE.VideoQuality}.
 * @param {boolean=} checkURL - Does the function have to check url validity?
 * @return {Array<FORGE.VideoQuality>} Returns the array of {@link FORGE.VideoQuality}.
 */
FORGE.VideoHTML5.prototype._createQualitiesFromURLs = function(urls, checkURL)
{
    var qualities = [];
    var quality;

    for (var i = 0, ii = urls.length; i < ii; i++)
    {
        if (checkURL === true && FORGE.URL.isValid(urls[i]) === false)
        {
            throw "FORGE.VideoHTML5: URL " + urls[i] + " is invalid";
        }

        quality = new FORGE.VideoQuality(urls[i]);
        qualities.push(quality);
    }

    return qualities;
};

/**
 * Get the index of a {@link FORGE.VideoQuality} that is in the _videoQualities array.
 * @method  FORGE.VideoHTML5#_indexOfQuality
 * @private
 * @param  {FORGE.VideoQuality} quality - The quality you need to get its index.
 * @return {number} Returns the index of the quality if found, -1 if not found.
 */
FORGE.VideoHTML5.prototype._indexOfQuality = function(quality)
{
    var q;
    for (var i = 0, ii = this._qualities.length; i < ii; i++)
    {
        q = this._qualities[i];

        if (q === quality)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Get the index of a video object that is in the _videos array.
 * @method  FORGE.VideoHTML5#_indexOfVideo
 * @private
 * @param  {VideoHTML5Object} video - The video object you need to get its index.
 * @return {number} Returns the index of the video object if found, -1 if not found.
 */
FORGE.VideoHTML5.prototype._indexOfVideo = function(video)
{
    var v;
    for (var i = 0, ii = this._videos.length; i < ii; i++)
    {
        v = this._videos[i];

        if (v === video)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Get a video object at a specified index.
 * @method  FORGE.VideoHTML5#_getVideoAt
 * @private
 * @param  {number} index - The index of the video you want to get.
 * @return {?VideoHTML5Object} Returns the video object or null if not found.
 */
FORGE.VideoHTML5.prototype._getVideoAt = function(index)
{
    if (this._videos === null)
    {
        return null;
    }

    var video = this._videos[index];

    if (video !== null && typeof video !== "undefined")
    {
        return video;
    }

    return null;
};

/**
 * Get the video object for the requested video.
 * @method FORGE.VideoHTML5#_getRequestedVideo
 * @private
 * @return {?VideoHTML5Object} Video object for the requested video.
 */
FORGE.VideoHTML5.prototype._getRequestedVideo = function()
{
    return this._getVideoAt(this._requestIndex);
};

/**
 * Get the video object for the current video.
 * @method FORGE.VideoHTML5#_getCurrentVideo
 * @private
 * @return {?VideoHTML5Object} Video object for the current video.
 */
FORGE.VideoHTML5.prototype._getCurrentVideo = function()
{
    return this._getVideoAt(this._currentIndex);
};

/**
 * Get a property of the video element of the current video object.
 * @method  FORGE.VideoHTML5#_getCurrentVideoElementProperty
 * @param  {string} property - The property you want to get from the current video element.
 * @param  {*} defaultReturnValue - The default return value if the video object or its element is null.
 * @return {*} Return the requested property value or the default one if necessary.
 * @private
 */
FORGE.VideoHTML5.prototype._getCurrentVideoElementProperty = function(property, defaultReturnValue)
{
    var video = this._getCurrentVideo();

    if (video !== null && video.element !== null)
    {
        return video.element[property];
    }

    return defaultReturnValue;
};

/**
 * Create placeholders objects for videos and theirs attributes.
 * @method FORGE.VideoHTML5#_createVideoObjects
 * @private
 * @param  {number} count - Number of video objects to create.
 * @return {Array<VideoHTML5Object>} Returns the populated videos array.
 */
FORGE.VideoHTML5.prototype._createVideoObjects = function(count)
{
    var videos = [];
    var video;

    for (var i = 0, ii = count; i < ii; i++)
    {
        video = {
            index: i,
            element: null,
            buffer: null,
            played: null,

            requestCount: 0,
            currentCount: 0,
            abortCount: 0, //Number of times this video has been requested and aborted (accepted: 1 attemp)
            leaveCount: 0, //Number of times this video has been leaved for bandwidth issues (accepted: 2 attemps)
            downCount: 0, //Number of times this video has been requested for downgrade (need 3 attemps)

            lastTimeStamp: 0
        };

        videos[i] = video;
    }

    this._videos = videos;

    return videos;
};

/**
 * Populate a video object at a specified index with an element <video> and a buffer/played {@link FORGE.VideoTimeRanges} managers.
 * @method  FORGE.VideoHTML5#_createVideoAt
 * @private
 * @param  {number} index - The index to create the video in the _videos array.
 * @return {VideoHTML5Object} Returns the populated video object.
 */
FORGE.VideoHTML5.prototype._createVideoAt = function(index)
{
    //Create a video tag and get the quality
    var element = document.createElement("video");
    element.setAttribute("webkit-playsinline", "true");
    element.setAttribute("playsinline", "true");
    element.setAttribute("width", this.pixelWidth);
    element.setAttribute("height", this.pixelHeight);
    element.volume = 0;
    element.playbackRate = this._playbackRate;
    element.crossOrigin = "anonymous";
    element.id = "FORGE-VideoHTML5-" + this._uid + "-" + index;

    var buffer = new FORGE.VideoTimeRanges(element, "buffered");
    var played = new FORGE.VideoTimeRanges(element, "played");

    //Update the video object with the element and fresh buffer and played
    var video = this._videos[index];
    video.element = element;
    video.buffer = buffer;
    video.played = played;

    return video;
};

/**
 * Create the source tag into the video tag.
 * @method FORGE.VideoHTML5#_createSourceTags
 * @private
 * @param {VideoHTML5Object} video - Video object to add the quality to.
 * @param {FORGE.VideoQuality} quality - The quality video source to attach to the video element.
 * @return {VideoHTML5Object} The video object that contains the HTML5 Video Element in which the source is append to.
 */
FORGE.VideoHTML5.prototype._createSourceTags = function(video, quality)
{
    if (FORGE.Device.edge === true)
    {
        // EDGE is not able to restore the currentTime with source tag
        video.element.src = quality.url;
    }
    else
    {
        var source = document.createElement("source");
        source.addEventListener("error", this._onRequestErrorBind, false);
        source.src = quality.url;
        source.type = quality.mimeType;

        video.element.appendChild(source);
    }

    return video;
};

/**
 * Destroy a video object.
 * @method FORGE.VideoHTML5#_destroyVideo
 * @private
 * @param {VideoHTML5Object} video - The video object to destroy.
 */
FORGE.VideoHTML5.prototype._destroyVideo = function(video)
{
    var index = this._indexOfVideo(video);

    if (index !== -1)
    {
        this._destroyVideoAt(index);
    }
};

/**
 * Destroy a video object at a specified index, wiil look at the video object into _videos array then detoy it.
 * @method FORGE.VideoHTML5#_destroyVideoAt
 * @private
 * @param {number} index - The index of the video object to destroy.
 */
FORGE.VideoHTML5.prototype._destroyVideoAt = function(index)
{
    if (index !== -1)
    {
        this.log("_destroyVideoAt " + index);

        var video = this._videos[index];
        var element = video.element;

        if (typeof element !== "undefined" && element !== null)
        {
            this._uninstallEvents(element);
            element.pause();
            element.src = "";

            if (FORGE.Device.edge !== true)
            {
                var source;
                for (var i = 0, ii = element.children.length; i < ii; i++)
                {
                    source = element.children[i];
                    source.removeEventListener("error", this._onRequestErrorBind, false);
                    source.src = "";

                    element.removeChild(source);
                    source = null;
                }
            }

            element.load();

            if (element.parentNode === this._dom)
            {
                this._dom.removeChild(element);
            }
        }

        element = null;
        video.element = null;

        if (video.buffer !== null)
        {
            video.buffer.destroy();
            video.buffer = null;
        }

        if (video.played !== null)
        {
            video.played.destroy();
            video.played = null;
        }
    }
};

/**
 * Set the request index.<br>
 * A video quality change request starts here!
 * @method FORGE.VideoHTML5#_setRequestIndex
 * @private
 * @param {number} index - The index of the video quality that is requested.
 * @param {boolean=} force - Do we have to force the request? Used in downgrade quality, we skip the synch delay to have a minimal interruption of playback.
 */
FORGE.VideoHTML5.prototype._setRequestIndex = function(index, force)
{
    this._forceRequest = force || false;
    this.log("Requesting index: " + index + ", force: " + this._forceRequest);

    //If a request is already being proccessed clear it
    if (this._requestIndex !== -1 && this._requestIndex !== index)
    {
        this._clearRequestedVideo();
    }

    var alreadyRequested = index === this._requestIndex ? true : false;

    //Assign the new request index
    this._requestIndex = index;

    if (this._onQualityRequest !== null)
    {
        this._onQualityRequest.dispatch(index);
    }

    //If this request is alredy being processed or it matches the current video, return!
    if (index === this._currentIndex || alreadyRequested === true)
    {
        return;
    }

    //Create a video tag and get the quality
    var requestedVideo = this._createVideoAt(this._requestIndex);
    this._getRequestedVideo().requestCount++;

    //Get the requested quality
    var quality = this._qualities[this._requestIndex];

    //If there is a current video
    if (this._currentIndex > -1)
    {
        //Add listener to begins transition between qualities
        this._getRequestedVideo().element.addEventListener("loadstart", this._onRequestLoadStartBind, false);
        this._getRequestedVideo().element.addEventListener("error", this._onRequestErrorBind, false);
    }

    //Create source tags according to quality
    this._createSourceTags(this._getRequestedVideo(), quality);

    if (this._isAmbisonic() === true)
    {
        //get the global audio context
        this._context = this._viewer.audio.context;

        // create source element
        this._soundElementSource = this._context.createMediaElementSource(this._getRequestedVideo().element);

        //FOA decoder and binaural renderer
        this._foaRenderer = Omnitone.createFOARenderer(this._context, {
            channelMap: this._defaultChannelMap
        });

        this._foaRendererInitializedSuccessBind = this._foaRendererInitializedSuccess.bind(this);
        this._foaRendererInitializedErrorBind = this._foaRendererInitializedError.bind(this);

        //Initialize the renderer
        this._foaRenderer.initialize().then(this._foaRendererInitializedSuccessBind, this._foaRendererInitializedErrorBind);

        this._decoderInitializedSuccess();
    }
    else
    {
        //Load!
        this._decoderInitializedSuccess();
    }

    //If there's no current video, this is the first request, assign the current video directly
    if (this._currentIndex === -1)
    {
        this.log("No current video, set directly the current index");
        this._setCurrentIndex(index);
    }
    else
    {
        //Start a timer to estimate if it is a failure ...
        this._requestTimer.add(this._timeoutTime, this._requestTimeOutHandler, this);
        this._requestTimer.start();
    }
};

/**
 * The FOA decoder has been initialized.
 * @method FORGE.VideoHTML5#_decoderInitializedSuccess
 * @private
 */
FORGE.VideoHTML5.prototype._decoderInitializedSuccess = function()
{
    if (this._requestIndex === -1)
    {
        //get the current video if requested index is set
        this._getCurrentVideo().element.load();
    }
    else
    {
        this._getRequestedVideo().element.load();
    }
};

/**
 * The FOA Renderer is initialized.
 * @method FORGE.VideoHTML5#_foaRendererInitializedSuccess
 * @private
 */
FORGE.VideoHTML5.prototype._foaRendererInitializedSuccess = function()
{
    this.log("FOA Renderer is initialized");
    if (this._foaRenderer !== null)
    {
        this._soundElementSource.connect(this._foaRenderer.input);
        this._foaRenderer.output.connect(this._context.destination);
    }
};

/**
 * The FOA Renderer can't be initialized.
 * @method FORGE.VideoHTML5#_foaRendererInitializedError
 * @private
 */
FORGE.VideoHTML5.prototype._foaRendererInitializedError = function()
{
    this.log("FOA Renderer could not be initialized");
};

/**
 * Event handler for loadstart, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestLoadStart
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestLoadStart = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestLoadStart [readyState: " + element.readyState + "]");
    element.removeEventListener("loadstart", this._onRequestLoadStartBind, false);
    element.addEventListener("loadedmetadata", this._onRequestLoadedMetaDataBind, false);
};

/**
 * Event handler for loadedmetadata, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestLoadedMetaData
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestLoadedMetaData = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestLoadedMetaData [readyState: " + element.readyState + "]");
    element.removeEventListener("loadedmetadata", this._onRequestLoadedMetaDataBind, false);
    element.addEventListener("loadeddata", this._onRequestLoadedDataBind, false);
};

/**
 * Event handler for loadeddata, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestLoadedData
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestLoadedData = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestLoadedData [readyState: " + element.readyState + "]");
    element.removeEventListener("loadeddata", this._onRequestLoadedDataBind, false);

    if (FORGE.Device.desktop === true)
    {
        element.addEventListener("play", this._onRequestCanPlayBeforeSeekBind, false);
        element.play();
    }
    else
    {
        //For mobile no sync, we are not able to play without user interaction
        this._setCurrentIndex(this._requestIndex, true);
    }
};

/**
 * Event handler for canplay, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestCanPlayBeforeSeek
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestCanPlayBeforeSeek = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestCanPlayBeforeSeek [readyState: " + element.readyState + "]");
    element.pause();
    element.removeEventListener("play", this._onRequestCanPlayBeforeSeekBind, false);
    element.addEventListener("seeked", this._onRequestSeekedBind, false);

    var currentTime = this.currentTime;

    //If the video is already playing, start buffering the next video quality some seconds after the current time.
    if (this._playing === true && this._forceRequest === false)
    {
        element.currentTime = currentTime + (this._syncTime / 1000);
    }
    else
    {
        element.currentTime = currentTime;
    }
};

/**
 * Event handler for seeked, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestSeeked
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestSeeked = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestSeeked [readyState: " + element.readyState + "]");
    element.removeEventListener("seeked", this._onRequestSeekedBind, false);

    if (element.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
    {
        element.removeEventListener("error", this._onRequestErrorBind, false);
        this._requestWaitSync();
    }
    else
    {
        if (FORGE.Device.edge === true || FORGE.Device.ie === true)
        {
            element.addEventListener("canplaythrough", this._onRequestCanPlayAfterSeekBind, false);
        }
        else
        {
            element.addEventListener("canplay", this._onRequestCanPlayAfterSeekBind, false);
        }
    }
};

/**
 * Event handler for canplay (after a seek), binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestCanPlayAfterSeek
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestCanPlayAfterSeek = function()
{
    var element = this._getRequestedVideo().element;

    this.log("_onRequestCanPlayAfterSeek [readyState: " + element.readyState + "]");

    //Force the current time of the requested video to the current video time value. Usefull for long duration chunks downloads.
    element.currentTime = this.currentTime;

    //Clean events listeners on element
    if (FORGE.Device.edge === true || FORGE.Device.ie === true)
    {
        element.removeEventListener("canplaythrough", this._onRequestCanPlayAfterSeekBind, false);
    }
    else
    {
        element.removeEventListener("canplay", this._onRequestCanPlayAfterSeekBind, false);
    }
    element.removeEventListener("error", this._onRequestErrorBind, false);

    this._requestWaitSync();
};

/**
 * Triggers the waiting process of two videos to be synched.
 * @method FORGE.VideoHTML5#_requestWaitSync
 * @private
 */
FORGE.VideoHTML5.prototype._requestWaitSync = function()
{
    //If the current video is seeked, re init the request (abort then retry)
    var currentVideo = this._getCurrentVideo();
    if (currentVideo !== null && currentVideo.element !== null && this._forceRequest === false)
    {
        this.log("Current video listen to seek, wait both video to sync");
        currentVideo.element.addEventListener("seeked", this._onRequestSeekedWhileSyncBind, false);
        this._requestTimer.loop(10, this._videoSyncTimerLoop, this);
    }

    //Clean error event listener on requested source
    if (FORGE.Device.edge !== true)
    {
        var element = this._getRequestedVideo().element;
        var source;
        for (var i = 0, ii = element.children.length; i < ii; i++)
        {
            source = element.children[i];
            source.removeEventListener("error", this._onRequestErrorBind, false);
        }
    }

    if (this._forceRequest === true)
    {
        this._setCurrentIndex(this._requestIndex);
    }
};

/**
 * Event handler for seeked on video while its being synched, binded on a requested video element.<br>
 * if a seeked event occurs while sync, this abort the request and retry with the new current time of the video.
 * @method  FORGE.VideoHTML5#_onRequestSeekedWhileSync
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestSeekedWhileSync = function()
{
    this.log("_onRequestSeekedWhileSync " + this.currentTime);

    var requestIndex = this._requestIndex;
    this._abortRequest(false);
    this._setRequestIndex(requestIndex);
};

/**
 * This is the timer loop handler that check if two videos are synched each other.<br>
 * If sync is ok, sets the requested video as the current one.
 * @method FORGE.VideoHTML5#_videoSyncTimerLoop
 * @private
 */
FORGE.VideoHTML5.prototype._videoSyncTimerLoop = function()
{
    this.log("_videoSyncTimerLoop " + this._requestIndex);

    var video = this._getRequestedVideo();

    if (video !== null && this.currentTime >= video.element.currentTime && this.currentTime < (video.element.currentTime + 0.05))
    {
        this._setCurrentIndex(this._requestIndex);
    }
};

/**
 * Event handler for the timeout timer. Abort the video raquest if the timeout contdown is reached.
 * @method FORGE.VideoHTML5#_requestTimeOutHandler
 * @private
 */
FORGE.VideoHTML5.prototype._requestTimeOutHandler = function()
{
    this.log("_requestTimeOutHandler "+this._requestIndex);
    this._abortRequest(true);
};

/**
 * Event handler for error, binded on a requested video element.
 * @method FORGE.VideoHTML5#_onRequestError
 * @private
 */
FORGE.VideoHTML5.prototype._onRequestError = function(event)
{
    this.log("_onRequestError");
    this.log(event);
    this._abortRequest(true);
};

/**
 * Sets the current video index.<br>
 * This is the end of the video quality request process! Congratulations!
 * @method  FORGE.VideoHTML5#_setCurrentIndex
 * @private
 * @param {number} index - The index of the video to be consider as the current one.
 * @param {boolean=} sync - Does the new video have to be time synched with the previous video time?
 */
FORGE.VideoHTML5.prototype._setCurrentIndex = function(index, sync)
{
    if (index === this._currentIndex)
    {
        return;
    }

    //Remove all video tags from our container div
    this._dom.innerHTML = "";

    //Get the requested video
    var requestedVideo = this._getRequestedVideo();

    //Resume playback if it was already playing
    if (this._playing === true)
    {
        requestedVideo.element.play();
    }

    //Update the volume of the requested video
    this._updateVolume(requestedVideo);

    //Apply the current playback rate
    requestedVideo.element.playbackRate = this._playbackRate;

    //Get the current video and clean some events listener (seek while sync), and destroy video tag.
    var videoToBeRemoved = this._getCurrentVideo();

    //Index switch
    this._requestIndex = -1;
    this._currentIndex = index;

    //Update current video reference
    var currentVideo = this._getCurrentVideo();
    currentVideo.currentCount++;

    //Restore current time on mobile
    if (sync === true && videoToBeRemoved !== null)
    {
        currentVideo.element.currentTime = videoToBeRemoved.element.currentTime;
    }

    //Install the current video events
    this._installEvents(currentVideo.element);

    //Add video to the DOM
    this._dom.appendChild(currentVideo.element);


    if (videoToBeRemoved !== null && videoToBeRemoved.element !== null)
    {
        videoToBeRemoved.element.removeEventListener("seeked", this._onRequestSeekedWhileSyncBind, false);
        this._destroyVideo(videoToBeRemoved);
    }

    //Clear the request timer
    this._requestTimer.stop(true);

    if (this._onQualityChange !== null)
    {
        this._onQualityChange.dispatch(this._currentIndex);
    }

    if (this._qualityMode === "")
    {
        this._setQualityMode(this._defaultQualityMode);
    }
};

/**
 * Event handler for the auto quality timer loop that checks if we have to upgrade or downgrade the quality.
 * @method FORGE.VideoHTML5#_autoQualityTimerLoop
 * @private
 */
FORGE.VideoHTML5.prototype._autoQualityTimerLoop = function()
{
    //If there is a pending request, return
    if (this._playing === false || this._requestIndex !== -1)
    {
        return;
    }

    if (this._shouldAutoQualityDowngrade() === true)
    {
        this._downgradeAutoQuality();
        return;
    }

    if (this._shouldAutoQualityUpgrade() === true)
    {
        this._upgradeAutoQuality();
        return;
    }
};

/**
 * Algo that check if we should upgrade the video quality.
 * @method  FORGE.VideoHTML5#_shouldAutoQualityUpgrade
 * @private
 * @return {boolean} Returns true if we should upgrade the video quality, false if not.
 */
FORGE.VideoHTML5.prototype._shouldAutoQualityUpgrade = function()
{
    var currentVideo = this._getCurrentVideo();

    if (currentVideo !== null && currentVideo.buffer !== null)
    {
        if (currentVideo.buffer.isInRanges(currentVideo.element.currentTime, this._syncTime / 1000))
        {
            return true;
        }
    }

    return false;
};

/**
 * Algo that check if we should downgrade the video quality.
 * @method  FORGE.VideoHTML5#_shouldAutoQualityDowngrade
 * @private
 * @return {boolean} Returns true if we should downgrade the video quality, false if not.
 */
FORGE.VideoHTML5.prototype._shouldAutoQualityDowngrade = function()
{
    var currentVideo = this._getCurrentVideo();
    var time = currentVideo.element.currentTime;

    if (currentVideo.element.playing === false)
    {
        return false;
    }

    if (time === currentVideo.lastTimeStamp)
    {
        currentVideo.downCount++;
        if (currentVideo.downCount >= 3)
        {
            currentVideo.lastTimeStamp = 0;
            return true;
        }
    }
    else
    {
        currentVideo.lastTimeStamp = time;
        currentVideo.downCount = 0;
    }

    return false;
};

/**
 * Upgrade the video quality, triggered by the _autoQualityTimerLoop Timer handler.<br>
 * This part of code decide what is the next quality index to request for a quality upgrade.
 * @method FORGE.VideoHTML5#_upgradeAutoQuality
 * @private
 */
FORGE.VideoHTML5.prototype._upgradeAutoQuality = function()
{
    //If we are not already to the max quality
    if (this._currentIndex !== this._qualities.length - 1)
    {
        var nextIndex = this._currentIndex + 1;

        if (this._videos[nextIndex].abortCount === 0 && this._videos[nextIndex].leaveCount <= 1)
        {
            this.log("AutoQuality upgrade quality");
            this._setRequestIndex(nextIndex);
        }
        else
        {
            this.log("AutoQuality do not attempt to load an already aborted video");
        }
    }
};

/**
 * Downgrade the video quality, triggered by the _autoQualityTimerLoop Timer handler.<br>
 * This part of code decide what is the next quality index to request for a quality downgrade.
 * @method FORGE.VideoHTML5#_downgradeAutoQuality
 * @private
 */
FORGE.VideoHTML5.prototype._downgradeAutoQuality = function()
{
    var currentVideo = this._getCurrentVideo();
    currentVideo.leaveCount++;

    if (this._currentIndex - 1 >= 0)
    {
        this.log("AutoQuality downgrade quality");
        this._setRequestIndex(this._currentIndex - 1, true);
    }
    else
    {
        this.log("Can't downgrade video quality anymore!");
    }

};

/**
 * Sets the quality mode.
 * @method  FORGE.VideoHTML5#_setQualityMode
 * @private
 * @param {string} mode - Quality mode to be set.
 */
FORGE.VideoHTML5.prototype._setQualityMode = function(mode)
{
    if (FORGE.Device.desktop === false)
    {
        mode = FORGE.VideoQualityMode.MANUAL;
        this.warn("Quality mode force to manual, you are not on desktop");
    }

    if (this._qualityMode === mode)
    {
        return;
    }

    if (mode === FORGE.VideoQualityMode.AUTO || mode === FORGE.VideoQualityMode.MANUAL)
    {
        this._qualityMode = mode;

        //Stop quality related timer anyway
        this._autoQualityTimer.stop(false);

        //If mode auto add and start a fresh timer
        if (this._qualityMode === FORGE.VideoQualityMode.AUTO)
        {
            this._autoQualityTimer.start();
        }

        if (this._onQualityModeChange !== null)
        {
            this._onQualityModeChange.dispatch(this._qualityMode);
        }
    }
};

/**
 * Abort a requested video for any reason.
 * @method  FORGE.VideoHTML5#_abortRequest
 * @private
 * @param  {boolean} count - Does the aborted property of the video object have to be increased?
 */
FORGE.VideoHTML5.prototype._abortRequest = function(count)
{
    var requestedVideo = this._getRequestedVideo();

    if (requestedVideo === null)
    {
        return;
    }

    //Increase the aborted count for this video
    if (count === true)
    {
        requestedVideo.abortCount++;
    }

    //Clear the requested video
    this._clearRequestedVideo();

    //Stop the timer, clear all its events
    this._requestTimer.stop(true);

    if (this._onQualityAbort !== null)
    {
        this._onQualityAbort.dispatch();
    }
};

/**
 * Clear the virequested video from its event, detroy the video element etc ...
 * @method FORGE.VideoHTML5#_clearRequestedVideo
 * @private
 */
FORGE.VideoHTML5.prototype._clearRequestedVideo = function()
{
    var video = this._getRequestedVideo();

    if (video !== null)
    {
        //Remove all listeners used for the requested video
        var element = video.element;
        element.removeEventListener("loadstart", this._onRequestLoadStartBind, false);
        element.removeEventListener("loadedmetadata", this._onRequestLoadedMetaDataBind, false);
        element.removeEventListener("loadeddata", this._onRequestLoadedDataBind, false);
        element.removeEventListener("play", this._onRequestCanPlayBeforeSeekBind, false);
        element.removeEventListener("seeked", this._onRequestSeekedBind, false);
        if (FORGE.Device.edge === true || FORGE.Device.ie === true)
        {
            element.removeEventListener("canplaythrough", this._onRequestCanPlayAfterSeekBind, false);
        }
        else
        {
            element.removeEventListener("canplay", this._onRequestCanPlayAfterSeekBind, false);
        }
        element.removeEventListener("error", this._onRequestErrorBind, false);

        //Destroy the requested video
        this._destroyVideo(video);

        //Set the request index to -1, so no video is considered as requested
        this._requestIndex = -1;
    }
};

/**
 * Handles the main volume change, update the volume factor to the video volume.
 * @method FORGE.VideoHTML5#_mainVolumeChangeHandler
 * @private
 */
FORGE.VideoHTML5.prototype._mainVolumeChangeHandler = function()
{
    this._updateVolume();
};

/**
 * Apply the main volume factor to the video volume.
 * @method FORGE.VideoHTML5#_updateVolume
 * @param {Object=} video - The video you want to update the volume, if undefined it will update the currentVideo
 * @private
 */
FORGE.VideoHTML5.prototype._updateVolume = function(video)
{
    var v = video || this._getCurrentVideo();

    if (v !== null && v.element !== null && this._viewer.audio.enabled === true)
    {
        v.element.volume = this._volume * this._viewer.audio.volume;
    }
};

/**
 * Handles the disable status of the sound manager.
 * @method FORGE.VideoHTML5#_disableSoundHandler
 * @private
 */
FORGE.VideoHTML5.prototype._disableSoundHandler = function()
{
    var v = this._getCurrentVideo();

    if (v !== null && v.element !== null && this._viewer.audio.enabled === false)
    {
        v.element.volume = 0;
    }
};

/**
 * Bind native events handler for the current video.
 * @method FORGE.VideoHTML5#_installEvents
 * @private
 * @param {HTMLVideoElement} element - The video element to bind events on.
 */
FORGE.VideoHTML5.prototype._installEvents = function(element)
{
    element.addEventListener("loadstart", this._onEventBind, false);
    element.addEventListener("durationchange", this._onEventBind, false);
    element.addEventListener("loadedmetadata", this._onEventBind, false);
    element.addEventListener("loadeddata", this._onEventBind, false);
    element.addEventListener("progress", this._onEventBind, false);
    element.addEventListener("canplay", this._onEventBind, false);
    element.addEventListener("canplaythrough", this._onEventBind, false);
    element.addEventListener("play", this._onEventBind, false);
    element.addEventListener("pause", this._onEventBind, false);
    element.addEventListener("timeupdate", this._onEventBind, false);
    element.addEventListener("volumechange", this._onEventBind, false);
    element.addEventListener("seeking", this._onEventBind, false);
    element.addEventListener("seeked", this._onEventBind, false);
    element.addEventListener("ended", this._onEventBind, false);
    element.addEventListener("error", this._onEventBind, false);
    element.addEventListener("waiting", this._onEventBind, false);
    element.addEventListener("stalled", this._onEventBind, false);
    element.addEventListener("playing", this._onEventBind, false);
    element.addEventListener("ratechange", this._onEventBind, false);
};

/**
 * Unbind events handler for video.
 * @method FORGE.VideoHTML5#_uninstallEvents
 * @private
 * @param {HTMLVideoElement} element - The video element to unbind events on.
 */
FORGE.VideoHTML5.prototype._uninstallEvents = function(element)
{
    element.removeEventListener("loadstart", this._onEventBind, false);
    element.removeEventListener("durationchange", this._onEventBind, false);
    element.removeEventListener("loadedmetadata", this._onEventBind, false);
    element.removeEventListener("loadeddata", this._onEventBind, false);
    element.removeEventListener("progress", this._onEventBind, false);
    element.removeEventListener("canplay", this._onEventBind, false);
    element.removeEventListener("canplaythrough", this._onEventBind, false);
    element.removeEventListener("play", this._onEventBind, false);
    element.removeEventListener("pause", this._onEventBind, false);
    element.removeEventListener("timeupdate", this._onEventBind, false);
    element.removeEventListener("volumechange", this._onEventBind, false);
    element.removeEventListener("seeking", this._onEventBind, false);
    element.removeEventListener("seeked", this._onEventBind, false);
    element.removeEventListener("ended", this._onEventBind, false);
    element.removeEventListener("error", this._onEventBind, false);
    element.removeEventListener("waiting", this._onEventBind, false);
    element.removeEventListener("stalled", this._onEventBind, false);
    element.removeEventListener("playing", this._onEventBind, false);
    element.removeEventListener("ratechange", this._onEventBind, false);

    //Request specific
    element.removeEventListener("error", this._onRequestErrorBind, false);
};

/**
 * Global handler for all events fired by an HTMLVideoElement.
 * @method FORGE.VideoHTML5#_onEventHandler
 * @param  {Event} event - the fired event
 * @private
 */
FORGE.VideoHTML5.prototype._onEventHandler = function(event)
{
    var element = this._getCurrentVideo().element;
    this.log(event.type + " [readyState: " + element.readyState + "]");

    switch (event.type)
    {
        case "loadstart":
            if (this._onLoadStart !== null)
            {
                this._onLoadStart.dispatch(event);
            }

            break;

        case "durationchange":
            //@firefox - FF dispatch durationchange twice on readystate HAVE_METADATA (1) & HAVE_ENOUGH_DATA (4)
            //I will not dispatch this event if readystate is 4 !
            if (this._onDurationChange !== null && element.readyState === HTMLMediaElement.HAVE_METADATA)
            {
                this._onDurationChange.dispatch(event);
            }

            break;

        case "loadedmetadata":
            this._metaDataLoaded = true;

            if (this._onLoadedMetaData !== null)
            {
                this._onLoadedMetaData.dispatch(event);
            }

            break;

        case "loadeddata":
            if (this._onLoadedData !== null)
            {
                this._onLoadedData.dispatch(event);
            }

            break;

        case "progress":
            if (this._onProgress !== null)
            {
                this._onProgress.dispatch(event);
            }

            break;

        case "canplay":
            this._canPlay = true;

            if (this._onCanPlay !== null)
            {
                this._onCanPlay.dispatch(event);
            }

            break;

        case "canplaythrough":
            this._canPlay = true;

            if (this._onCanPlayThrough !== null)
            {
                this._onCanPlayThrough.dispatch(event);
            }

            break;

        case "play":
            if (this._onPlay !== null)
            {
                this._onPlay.dispatch(event);
            }

            break;

        case "pause":
            this._playing = false;

            if (this._onPause !== null)
            {
                this._onPause.dispatch(event);
            }

            break;

        case "timeupdate":
            if (this._onTimeUpdate !== null)
            {
                this._onTimeUpdate.dispatch(event);
            }

            break;

        case "volumechange":
            //I do not dispatch the volume change if readyState is HAVE_NOTHING (0). Because
            //I set the volume at 0 when I create the video element, it is
            //not usefull to dispatch this internal volume change ?
            if (this._onVolumeChange !== null && element.readyState !== HTMLMediaElement.HAVE_NOTHING)
            {
                this._onVolumeChange.dispatch(event);
            }

            break;

        case "seeking":
            this._canPlay = false;

            if (this._onSeeking !== null)
            {
                this._onSeeking.dispatch(event);
            }

            break;

        case "seeked":
            this._canPlay = false;

            if (this._onSeeked !== null)
            {
                this._onSeeked.dispatch(event);
            }

            break;

        case "ended":
            this._playing = false;
            this.currentTime = 0;
            this._endCount++;

            if (this._loop === true)
            {
                this.play(0);
            }

            if (this._onEnded !== null)
            {
                this._onEnded.dispatch(event);
            }

            break;

        case "error":
            if (this._onError !== null)
            {
                this._onError.dispatch(event);
            }

            break;

        case "waiting":
            if (this._onWaiting !== null)
            {
                this._onWaiting.dispatch(event);
            }

            break;

        case "stalled":
            if (this._onStalled !== null)
            {
                this._onStalled.dispatch(event);
            }

            break;

        case "playing":
            if (this._onPlaying !== null)
            {
                this._onPlaying.dispatch(event);
            }

            break;

        case "ratechange":
            if (this._onRateChange !== null)
            {
                this._onRateChange.dispatch(event);
            }

            break;

        default:
            this.warn("The event \"" + event.type + "\" is not handled.");

            break;
    }
};

/**
 * Does the video sound must be considered as ambisonic?
 * @method FORGE.VideoHTML5#_isAmbisonic
 * @return {boolean} Is ambisonic?
 * @private
 */
FORGE.VideoHTML5.prototype._isAmbisonic = function()
{
    return (this._ambisonic === true && this._viewer.audio.useWebAudio === true && typeof Omnitone !== "undefined");
};

/**
 * Update method called by the viewer main loop.
 * @method FORGE.VideoHTML5#update
 */
FORGE.VideoHTML5.prototype.update = function()
{
    if(this._foaRenderer !== null && this._playing === true)
    {
        //Rotate the binaural renderer based on a Three.js camera object.
        var m4 = this._viewer.renderer.camera.modelViewInverse;
        this._foaRenderer.setRotationMatrixFromCamera(m4);
    }
};

/**
 * Load a config or a video url to the source.
 * @method FORGE.VideoHTML5#load
 * @param {?(string|FORGE.VideoQuality|Array<(string|FORGE.VideoQuality)>)} config - An url to load, or an array of urls or an array ok {@link FORGE.VideoQuality}.
 */
FORGE.VideoHTML5.prototype.load = function(config)
{
    //parse the config in parameters
    this._parseConfig(config);

    if (this._qualities === null || this._qualities.length === 0)
    {
        throw "FORGE.VideoHTML5.load: Can't create video with no qualities set!";
    }

    //Create place holders for videos
    this._createVideoObjects(this._qualities.length);

    //Request the first quality of the quality array
    this._setRequestIndex(0);
};

/**
 * Plays the video.
 * @method  FORGE.VideoHTML5#play
 * @param {number=} time - Time you want to start the playback.
 * @param {boolean=} loop - Does the video have to loop at the end of the duration?
 */
FORGE.VideoHTML5.prototype.play = function(time, loop)
{
    FORGE.VideoBase.prototype.play.call(this, time, loop);

    var currentVideo = this._getCurrentVideo();

    if (currentVideo !== null && currentVideo.element !== null)
    {
        var p = currentVideo.element.play();
        if (typeof p !== "undefined" && typeof Promise !== "undefined" && p instanceof Promise)
        {
            p.then(function()
            {
                this._playing = true;
                this._paused = false;
                this._playCount++;
            }.bind(this))
            .catch(function(error)
            {
                this.log("error while playing the video : " + error);
            }.bind(this));
        }
        else
        {
            this._playing = true;
            this._paused = true;
            this._playCount++;
        }
    }
};

/**
 * Pauses the video.
 * @method  FORGE.VideoHTML5#pause
 */
FORGE.VideoHTML5.prototype.pause = function()
{
    var currentVideo = this._getCurrentVideo();

    if (currentVideo !== null && currentVideo.element !== null)
    {
        currentVideo.element.pause();
        this._playing = false;
        this._paused = true;
    }
};

/**
 * Stop the video the video (pause it and set time to 0).
 * @method  FORGE.VideoHTML5#stop
 */
FORGE.VideoHTML5.prototype.stop = function()
{
    var currentVideo = this._getCurrentVideo();

    if (currentVideo !== null && currentVideo.element !== null)
    {
        currentVideo.element.pause();
        currentVideo.element.currentTime = 0;
        this._playing = false;
        this._paused = true;
    }
};

/**
 * Toggles the playback status, if play toggle to pause and vice versa.
 * @method  FORGE.VideoHTML5#togglePlayback
 */
FORGE.VideoHTML5.prototype.togglePlayback = function()
{
    if (this._playing === true || this._viewer.audio.enabled === false)
    {
        this.pause();
    }
    else
    {
        this.play();
    }
};

/**
 * Mute the video sound.
 * @method  FORGE.VideoHTML5#mute
 */
FORGE.VideoHTML5.prototype.mute = function()
{
    if (this._muted === true || this._viewer.audio.enabled === false)
    {
        return;
    }

    this._muted = true;
    this._mutedVolume = this._volume;

    this._volume = 0;
    this._updateVolume();

    if (this._onMute !== null)
    {
        this._onMute.dispatch();
    }
};

/**
 * Unute the video sound.
 * @method  FORGE.VideoHTML5#unmute
 * @param {number=} volume - The volume to be restored on unmute.
 */
FORGE.VideoHTML5.prototype.unmute = function(volume)
{
    if (this._muted === false)
    {
        return;
    }

    var v = (typeof volume === "number") ? volume : this._mutedVolume;

    this._muted = false;
    this._volume = FORGE.Math.clamp(v, 0, 1);
    this._updateVolume();

    if (this._onUnmute !== null)
    {
        this._onUnmute.dispatch();
    }
};


/**
 * Destroy method.
 * @method FORGE.VideoHTML5#destroy
 */
FORGE.VideoHTML5.prototype.destroy = function()
{
    this._clearRequestedVideo();

    if (this._isAmbisonic() === true)
    {
        this._soundElementSource.disconnect();
        this._foaRenderer.output.disconnect();
        this._foaRendererInitializedSuccessBind = null;
        this._foaRendererInitializedErrorBind = null;
        this._foaRenderer = null;
        this._soundElementSource = null;
    }

    this._requestTimer.destroy();
    this._requestTimer = null;

    this._autoQualityTimer.destroy();
    this._autoQualityTimer = null;

    if (this._onLoadStart !== null)
    {
        this._onLoadStart.destroy();
        this._onLoadStart = null;
    }

    if (this._onLoadedMetaData !== null)
    {
        this._onLoadedMetaData.destroy();
        this._onLoadedMetaData = null;
    }

    if (this._onLoadedData !== null)
    {
        this._onLoadedData.destroy();
        this._onLoadedData = null;
    }

    if (this._onProgress !== null)
    {
        this._onProgress.destroy();
        this._onProgress = null;
    }

    if (this._onDurationChange !== null)
    {
        this._onDurationChange.destroy();
        this._onDurationChange = null;
    }

    if (this._onCanPlay !== null)
    {
        this._onCanPlay.destroy();
        this._onCanPlay = null;
    }

    if (this._onCanPlayThrough !== null)
    {
        this._onCanPlayThrough.destroy();
        this._onCanPlayThrough = null;
    }

    if (this._onPlay !== null)
    {
        this._onPlay.destroy();
        this._onPlay = null;
    }

    if (this._onPause !== null)
    {
        this._onPause.destroy();
        this._onPause = null;
    }

    if (this._onTimeUpdate !== null)
    {
        this._onTimeUpdate.destroy();
        this._onTimeUpdate = null;
    }

    if (this._onCurrentTimeChange !== null)
    {
        this._onCurrentTimeChange.destroy();
        this._onCurrentTimeChange = null;
    }

    if (this._onVolumeChange !== null)
    {
        this._onVolumeChange.destroy();
        this._onVolumeChange = null;
    }

    if (this._onSeeking !== null)
    {
        this._onSeeking.destroy();
        this._onSeeking = null;
    }

    if (this._onSeeked !== null)
    {
        this._onSeeked.destroy();
        this._onSeeked = null;
    }

    if (this._onEnded !== null)
    {
        this._onEnded.destroy();
        this._onEnded = null;
    }

    if (this._onError !== null)
    {
        this._onError.destroy();
        this._onError = null;
    }

    if (this._onWaiting !== null)
    {
        this._onWaiting.destroy();
        this._onWaiting = null;
    }

    if (this._onStalled !== null)
    {
        this._onStalled.destroy();
        this._onStalled = null;
    }

    if (this._onPlaying !== null)
    {
        this._onPlaying.destroy();
        this._onPlaying = null;
    }

    if (this._onRateChange !== null)
    {
        this._onRateChange.destroy();
        this._onRateChange = null;
    }

    if (this._onMute !== null)
    {
        this._onMute.destroy();
        this._onMute = null;
    }

    if (this._onUnmute !== null)
    {
        this._onUnmute.destroy();
        this._onUnmute = null;
    }

    if (this._onQualityRequest !== null)
    {
        this._onQualityRequest.destroy();
        this._onQualityRequest = null;
    }

    if (this._onQualityChange !== null)
    {
        this._onQualityChange.destroy();
        this._onQualityChange = null;
    }

    if (this._onQualityAbort !== null)
    {
        this._onQualityAbort.destroy();
        this._onQualityAbort = null;
    }

    if (this._onQualityModeChange !== null)
    {
        this._onQualityModeChange.destroy();
        this._onQualityModeChange = null;
    }

    if (this._onQualitiesLoaded !== null)
    {
        this._onQualitiesLoaded.destroy();
        this._onQualitiesLoaded = null;
    }

    //destroy all videos
    for (var i = 0, ii = this._videos.length; i < ii; i++)
    {
        this._destroyVideoAt(i);
    }

    //Nullify event listeners binded to this!
    this._onRequestErrorBind = null;
    this._onRequestLoadStartBind = null;
    this._onRequestLoadedMetaDataBind = null;
    this._onRequestLoadedDataBind = null;
    this._onRequestCanPlayBeforeSeekBind = null;
    this._onRequestSeekedBind = null;
    this._onRequestCanPlayAfterSeekBind = null;
    this._onRequestSeekedWhileSyncBind = null;

    this._onEventBind = null;

    //Unbind main volume event
    this._viewer.audio.onVolumeChange.remove(this._mainVolumeChangeHandler, this);

    this._viewer.audio.onDisable.remove(this._disableSoundHandler, this);

    this._config = null;

    this._qualities = null;

    this._videos = null;

    FORGE.VideoBase.prototype.destroy.call(this);
};


/**
 * Get and set the quality index of the video.
 * @name FORGE.VideoHTML5#quality
 * @type {(number|FORGE.VideoQuality)}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "quality",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._qualities[this._currentIndex];
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (typeof value === "number" && value >= 0 && value < this._qualities.length)
        {
            this._setQualityMode(FORGE.VideoQualityMode.MANUAL);
            this._setRequestIndex(value);
        }
        else if (FORGE.Utils.isTypeOf(value, "VideoQuality") === true)
        {
            var i = this._indexOfQuality(value);

            if (i !== -1)
            {
                this._setQualityMode(FORGE.VideoQualityMode.MANUAL);
                this._setRequestIndex(i);
            }
            else
            {
                throw "Unknown quality";
            }
        }
        else
        {
            throw "Video quality " + value + " out of bounds";
        }
    }
});

/**
 * Get and set the quality mode.<br>
 * Available quality mode are listed in FORGE.VideoQualityMode const.
 * @name  FORGE.VideoHTML5#qualityMode
 * @type {string}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "qualityMode",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._qualityMode;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (value === FORGE.VideoQualityMode.AUTO || value === FORGE.VideoQualityMode.MANUAL)
        {
            this._setQualityMode(value);
        }
    }
});

/**
 * Get the quality array.
 * @name  FORGE.VideoHTML5#qualities
 * @readonly
 * @type {Array<FORGE.VideoQuality>}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "qualities",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._qualities;
    }
});

/**
 * Get the requested quality index, returns -1 if no request is being processed.
 * @name  FORGE.VideoHTML5#requestIndex
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "requestIndex",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._requestIndex;
    }
});

/**
 * Get the current quality index, returns -1 if no current is playing.
 * @name  FORGE.VideoHTML5#currentIndex
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "currentIndex",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._currentIndex;
    }
});

/**
 * Get the video object array.
 * @name  FORGE.VideoHTML5#videos
 * @readonly
 * @type {Array<Object>}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "videos",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._videos;
    }
});

/**
 * Get the html element of the current video.
 * @name FORGE.VideoHTML5#element
 * @readonly
 * @type {?HTMLVideoElement}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "element",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        var currentVideo = this._getCurrentVideo();

        if (currentVideo !== null && currentVideo.element !== null)
        {
            return currentVideo.element;
        }

        return null;
    }
});

/**
 * Get the {@link FORGE.VideoTimeRanges} of the video for buffered ranges.
 * @name FORGE.VideoHTML5#buffer
 * @readonly
 * @type {?FORGE.VideoTimeRanges}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "buffer",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        var currentVideo = this._getCurrentVideo();

        if (currentVideo !== null && currentVideo.buffer !== null)
        {
            return currentVideo.buffer;
        }

        return null;
    }
});

/**
 * Get the {@link FORGE.VideoTimeRanges} of the video for played ranges.
 * @name FORGE.VideoHTML5#played
 * @readonly
 * @type {?FORGE.VideoTimeRanges}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "played",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        var currentVideo = this._getCurrentVideo();

        if (currentVideo !== null && currentVideo.played !== null)
        {
            return currentVideo.played;
        }

        return null;
    }
});

/**
 * Get the original width of the video source.
 * @name FORGE.VideoHTML5#originalWidth
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "originalWidth",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._getCurrentVideoElementProperty("videoWidth", 0);
    }
});

/**
 * Get the original height of the video source.
 * @name FORGE.VideoHTML5#originalHeight
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "originalHeight",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._getCurrentVideoElementProperty("videoHeight", 0);
    }
});

/**
 * Get and set the currentTime  of the video.
 * @name FORGE.VideoHTML5#currentTime
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "currentTime",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._getCurrentVideoElementProperty("currentTime", 0);
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (typeof value === "number") //@todo see if we can put video currentTime in pending if no metadata received ? (typeof value === "number" && value < this.duration)
        {
            var currentVideo = this._getCurrentVideo();

            if (currentVideo !== null && currentVideo.element !== null)
            {
                currentVideo.element.currentTime = value;

                if (this._onCurrentTimeChange !== null)
                {
                    this._onCurrentTimeChange.dispatch(value);
                }
            }
        }
    }
});

/**
 * Get and set the currentTime  of the video in milliseconds.
 * @name FORGE.VideoHTML5#currentTimeMS
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "currentTimeMS",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this.currentTime * 1000;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        this.currentTime = value / 1000;
    }
});

/**
 * Get the remainingTime of the video.
 * @name FORGE.VideoHTML5#remainingTime
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "remainingTime",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this.duration - this.currentTime;
    }
});

/**
 * Get the duration of the video in seconds.
 * @name FORGE.VideoHTML5#duration
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "duration",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._getCurrentVideoElementProperty("duration", 0);
    }
});

/**
 * Get the duration of the video in milli seconds.
 * @name FORGE.VideoHTML5#durationMS
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "durationMS",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return Math.round(this.duration * 1000);
    }
});

/**
 * Get the metaDataLoaded status of the video.
 * @name FORGE.VideoHTML5#metaDataLoaded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "metaDataLoaded",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._metaDataLoaded;
    }
});

/**
 * Get and set the loop status of the video.
 * @name FORGE.VideoHTML5#loop
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "loop",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._loop;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (typeof value === "boolean")
        {
            this._loop = value;
        }
    }
});

/**
 * Get and set the volume of the video.
 * Set a volume unmute the video
 * @name FORGE.VideoHTML5#volume
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "volume",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._volume;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._volume = FORGE.Math.clamp(value, 0, 1);
            this._muted = false;
            this._updateVolume();
        }
    }
});

/**
 * Get and set the mute status of the video.
 * @name FORGE.VideoHTML5#muted
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "muted",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._muted;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if (Boolean(value) === true)
        {
            this.mute();
        }
        else
        {
            this.unmute();
        }
    }
});

/**
 * Get and set the playback rate of the video.
 * @name FORGE.VideoHTML5#playbackRate
 * @type {number}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "playbackRate",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        return this._playbackRate;
    },

    /** @this {FORGE.VideoHTML5} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._playbackRate = Math.abs(value);

            var video = this._getCurrentVideo();

            if (video !== null && video.element !== null)
            {
                video.element.playbackRate = this._playbackRate;
            }
        }
    }
});

/**
 * Get the ambisonic state of the video sound.
 * @name FORGE.VideoHTML5#ambisonic
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "ambisonic",
{
    /** @this {FORGE.VideoHTML5} */
    get: function ()
    {
        return this._ambisonic;
    }
});

/**
 * Get the "onLoadStart" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onLoadStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onLoadStart",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onLoadStart === null)
        {
            this._onLoadStart = new FORGE.EventDispatcher(this);
        }

        return this._onLoadStart;
    }
});

/**
 * Get the "onLoadedMetaData" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onLoadedMetaData
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onLoadedMetaData",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onLoadedMetaData === null)
        {
            this._onLoadedMetaData = new FORGE.EventDispatcher(this);
        }

        return this._onLoadedMetaData;
    }
});

/**
 * Get the "onLoadedData" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onLoadedData
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onLoadedData",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onLoadedData === null)
        {
            this._onLoadedData = new FORGE.EventDispatcher(this);
        }

        return this._onLoadedData;
    }
});

/**
 * Get the "onProgress" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onProgress
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onProgress",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onProgress === null)
        {
            this._onProgress = new FORGE.EventDispatcher(this);
        }

        return this._onProgress;
    }
});

/**
 * Get the "onDurationChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onDurationChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onDurationChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onDurationChange === null)
        {
            this._onDurationChange = new FORGE.EventDispatcher(this);
        }

        return this._onDurationChange;
    }
});

/**
 * Get the "onCanPlay" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onCanPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onCanPlay",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onCanPlay === null)
        {
            this._onCanPlay = new FORGE.EventDispatcher(this);
        }

        return this._onCanPlay;
    }
});

/**
 * Get the "onCanPlayThrough" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onCanPlayThrough
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onCanPlayThrough",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onCanPlayThrough === null)
        {
            this._onCanPlayThrough = new FORGE.EventDispatcher(this);
        }

        return this._onCanPlayThrough;
    }
});

/**
 * Get the "onPlay" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onPlay",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onPlay === null)
        {
            this._onPlay = new FORGE.EventDispatcher(this);
        }

        return this._onPlay;
    }
});

/**
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onPause",
{
    /** @this {FORGE.VideoHTML5} */
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
 * Get the "onTimeUpdate" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onTimeUpdate
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onTimeUpdate",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onTimeUpdate === null)
        {
            this._onTimeUpdate = new FORGE.EventDispatcher(this);
        }

        return this._onTimeUpdate;
    }
});

/**
 * Get the "onCurrentTimeChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onCurrentTimeChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onCurrentTimeChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onCurrentTimeChange === null)
        {
            this._onCurrentTimeChange = new FORGE.EventDispatcher(this);
        }

        return this._onCurrentTimeChange;
    }
});

/**
 * Get the "onVolumeChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onVolumeChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onVolumeChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onVolumeChange === null)
        {
            this._onVolumeChange = new FORGE.EventDispatcher(this);
        }

        return this._onVolumeChange;
    }
});

/**
 * Get the "onSeeking" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onSeeking
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onSeeking",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onSeeking === null)
        {
            this._onSeeking = new FORGE.EventDispatcher(this);
        }

        return this._onSeeking;
    }
});

/**
 * Get the "onSeeked" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onSeeked
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onSeeked",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onSeeked === null)
        {
            this._onSeeked = new FORGE.EventDispatcher(this);
        }

        return this._onSeeked;
    }
});

/**
 * Get the "onEnded" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onEnded
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onEnded",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onEnded === null)
        {
            this._onEnded = new FORGE.EventDispatcher(this);
        }

        return this._onEnded;
    }
});

/**
 * Get the "onError" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onError
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onError",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onError === null)
        {
            this._onError = new FORGE.EventDispatcher(this);
        }

        return this._onError;
    }
});

/**
 * Get the "onWaiting" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onWaiting
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onWaiting",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onWaiting === null)
        {
            this._onWaiting = new FORGE.EventDispatcher(this);
        }

        return this._onWaiting;
    }
});

/**
 * Get the "onStalled" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onStalled
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onStalled",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onStalled === null)
        {
            this._onStalled = new FORGE.EventDispatcher(this);
        }

        return this._onStalled;
    }
});

/**
 * Get the "onPlaying" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onPlaying
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onPlaying",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onPlaying === null)
        {
            this._onPlaying = new FORGE.EventDispatcher(this);
        }

        return this._onPlaying;
    }
});

/**
 * Get the "onRateChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onRateChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onRateChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onRateChange === null)
        {
            this._onRateChange = new FORGE.EventDispatcher(this);
        }

        return this._onRateChange;
    }
});

/**
 * Get the "onMute" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onMute
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onMute",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onMute === null)
        {
            this._onMute = new FORGE.EventDispatcher(this);
        }

        return this._onMute;
    }
});

/**
 * Get the "onUnmute" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onUnmute
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onUnmute",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onUnmute === null)
        {
            this._onUnmute = new FORGE.EventDispatcher(this);
        }

        return this._onUnmute;
    }
});

/**
 * Get the "onQualityRequest" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onQualityRequest
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onQualityRequest",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onQualityRequest === null)
        {
            this._onQualityRequest = new FORGE.EventDispatcher(this);
        }

        return this._onQualityRequest;
    }
});

/**
 * Get the "onQualityChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onQualityChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onQualityChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onQualityChange === null)
        {
            this._onQualityChange = new FORGE.EventDispatcher(this);
        }

        return this._onQualityChange;
    }
});

/**
 * Get the "onQualityAbort" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onQualityAbort
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onQualityAbort",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onQualityAbort === null)
        {
            this._onQualityAbort = new FORGE.EventDispatcher(this);
        }

        return this._onQualityAbort;
    }
});

/**
 * Get the "onQualityModeChange" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onQualityModeChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onQualityModeChange",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onQualityModeChange === null)
        {
            this._onQualityModeChange = new FORGE.EventDispatcher(this);
        }

        return this._onQualityModeChange;
    }
});

/**
 * Get the "onQualitiesLoaded" event {@link FORGE.EventDispatcher} of the video.
 * @name FORGE.VideoHTML5#onQualitiesLoaded
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.VideoHTML5.prototype, "onQualitiesLoaded",
{
    /** @this {FORGE.VideoHTML5} */
    get: function()
    {
        if (this._onQualitiesLoaded === null)
        {
            this._onQualitiesLoaded = new FORGE.EventDispatcher(this, true);
        }

        return this._onQualitiesLoaded;
    }
});
