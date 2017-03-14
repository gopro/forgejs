
/**
 * Abstract video class.
 *
 * @constructor FORGE.VideoBase
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {string} name - the name of the video class
 * @extends {FORGE.DisplayObject}
 */
FORGE.VideoBase = function(viewer, name)
{
    /**
     * Playing status of the video.
     * @name  FORGE.VideoBase#_playing
     * @type {boolean}
     * @private
     */
    this._playing = false;

    /**
     * Boolean flag to know if can play is already received.
     * @name FORGE.VideoBase#_canPlay
     * @type {boolean}
     * @private
     */
    this._canPlay = false;

    /**
     * Number of play action on this video.
     * @name  FORGE.VideoBase#_playCount
     * @type {number}
     * @private
     */
    this._playCount = 0;

    /**
     * Number of the video ended.
     * @name  FORGE.VideoBase#_endCount
     * @type {number}
     * @private
     */
    this._endCount = 0;

    /**
     * The paused state of the video.
     * @name FORGE.VideoBase#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    FORGE.DisplayObject.call(this, viewer, null, name);
};

FORGE.VideoBase.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.VideoBase.prototype.constructor = FORGE.VideoBase;

/**
 * Boot sequence.
 * @method FORGE.VideoBase#_boot
 * @private
 */
FORGE.VideoBase.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    // Listen to the Page Visibility event
    this._viewer.onPause.add(this._onVisibilityChange, this);
    this._viewer.onResume.add(this._onVisibilityChange, this);
};

/**
 * Handles the change of the visibility of the page.
 * @method FORGE.VideoBase#_onVisibilityChange
 * @param {FORGE.Event} event - the received event
 * @private
 */
FORGE.VideoBase.prototype._onVisibilityChange = function(event)
{
    var status = document[FORGE.Device.visibilityState];
    var external = (event.data.internal === undefined);

    // Pause if playing, leaving and authorized to pause
    if (this._viewer.config.autoPause === true && (status === "hidden" || external === true) && this._playing === true)
    {
        this.pause();
        this._paused = false; // can safely be set at false, as the playing state is checked
        return;
    }

    // Resume if paused, entering and authorized to resume
    if (this._viewer.config.autoResume === true && (status === "visible" || external === true) && this._playing === false && this._paused === false)
    {
        this.play();
        return;
    }
};

/**
 * Plays the video.
 * @method FORGE.VideoBase#play
 * @param {number=} time - Current video time to start playback.
 * @param {boolean=} loop - Media must be looped?
 */
FORGE.VideoBase.prototype.play = function(time, loop)
{
    this.currentTime = time;
    this.loop = loop;
};

/**
 * Pauses the video.
 * @method  FORGE.VideoBase#pause
 */
FORGE.VideoBase.prototype.pause = function()
{
};

/**
 * Destroy sequence.
 * @method FORGE.VideoBase#destroy
 */
FORGE.VideoBase.prototype.destroy = function()
{
    this._viewer.onPause.remove(this._onVisibilityChange, this);
    this._viewer.onResume.remove(this._onVisibilityChange, this);

    FORGE.DisplayObject.prototype.destroy.call(this);
};

/**
 * Get the playing status of the video.
 * @name FORGE.VideoBase#playing
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoBase.prototype, "playing",
{
    /** @this {FORGE.VideoBase} */
    get: function()
    {
        return this._playing;
    }
});

/**
 * Get the number of play action of the video.
 * @name FORGE.VideoBase#playCount
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoBase.prototype, "playCount",
{
    /** @this {FORGE.VideoBase} */
    get: function()
    {
        return this._playCount;
    }
});

/**
 * Get the canPlay status of the video.
 * @name FORGE.VideoBase#canPlay
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoBase.prototype, "canPlay",
{
    /** @this {FORGE.VideoBase} */
    get: function()
    {
        return this._canPlay;
    }
});

/**
 * Get the paused status of the video.
 * @name FORGE.VideoBase#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoBase.prototype, "paused",
{
    /** @this {FORGE.VideoBase} */
    get: function()
    {
        return this._paused;
    }
});

/**
 * Get the number of the video ends.
 * @name FORGE.VideoBase#endCount
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.VideoBase.prototype, "endCount",
{
    /** @this {FORGE.VideoBase} */
    get: function()
    {
        return this._endCount;
    }
});
