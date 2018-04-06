/**
 * A FORGE.Director is used to animate a hotspot.
 *
 * @constructor FORGE.Director
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @extends {FORGE.Animation}
 */
FORGE.Director = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.Director#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The UID of the selected track.
     * @name FORGE.Director#_track
     * @type {?string}
     * @private
     */
    this._track = null;

    /**
     * The list of the tracks composing the director's cut
     * @name FORGE.Director#_track
     * @type {?Array<string>}
     * @private
     */
    this._tracks = null;

    /**
     * Does the director's cut loop ?
     * @name FORGE.Director#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * Does the director's cut randomized ?
     * @name FORGE.Director#_random
     * @type {boolean}
     * @private
     */
    this._random = false;

    /**
     * Can the director's cut be stopped ?
     * @name FORGE.Director#_stoppable
     * @type {boolean}
     * @private
     */
    this._stoppable = false;

    /**
     * The idle time to resume the animation after it was stopped by the user.
     * @name FORGE.Director#_idleTime
     * @type {number}
     * @private
     */
    this._idleTime = -1;

    /**
     * Timer reference used to trigger an animation after idle time
     * @name FORGE.Director#_idleTimer
     * @type {FORGE.Timer}
     * @private
     */
    this._idleTimer = null;

    /**
     * Timer idle event reference
     * @name FORGE.Director#_idleEvent
     * @type {FORGE.TimerEvent}
     * @private
     */
    this._idleEvent = null;

    /**
     * Event handler for the synchronization of the video. Needed for the visibilitychange event.
     * See https://www.w3.org/TR/page-visibility/#sec-visibilitychange-event
     * @name FORGE.Director#_onVisibilityChangeBind
     * @type {Function}
     * @private
     */
    this._onVisibilityChangeBind = null;

    FORGE.BaseObject.call(this, "Director");
    this._boot();
};

FORGE.Director.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Director.prototype.constructor = FORGE.Director;

/**
 * Boot sequence
 *
 * @method FORGE.Director#_boot
 * @private
 */
FORGE.Director.prototype._boot = function()
{
    // Idle timer
    this._idleTimer = this._viewer.clock.create(false);

    // Start the cut once the scene is loaded
    this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);

    // Listen to controllers
    this._viewer.controllers.onControlStart.add(this._controlStartHandler, this);
    this._viewer.controllers.onControlEnd.add(this._controlEndHandler, this);

    // Bind onVisibilityChange handler
    this._onVisibilityChangeBind = this._onVisibilityChange.bind(this);
};

/**
 * Load director's cut configuration.
 *
 * @method FORGE.Director#load
 * @param {HotspotTrackConfig} config - The animation config to load.
 */
FORGE.Director.prototype.load = function(config)
{
    // Register tracks, no need to store them here
    if (config.tracks !== null && Array.isArray(config.tracks))
    {
        for (var i = 0, ii = config.tracks.length; i < ii; i++)
        {
            new FORGE.DirectorTrack(config.tracks[i]);
        }
    }
};

/**
 * Event handler for scene load complete.
 * @method  FORGE.Director#_sceneLoadCompleteHandler
 * @private
 */
FORGE.Director.prototype._sceneLoadCompleteHandler = function()
{
    var scene = this._viewer.story.scene;

    // Stop all
    this.stop();
    this._clearEvents();

    // Empty tracks
    this._track = null;
    this._tracks = [];

    if (typeof scene.config.director !== "undefined")
    {
        var animation = scene.config.director.animation;

        if (typeof animation === "undefined" || animation === null || animation.enabled === false)
        {
            return;
        }

        // General properties
        this._loop = (typeof animation.loop === "boolean") ? animation.loop : false;
        this._random = (typeof animation.random === "boolean") ? animation.random : false;
        this._stoppable = (typeof animation.stoppable === "boolean") ? animation.stoppable : false;
        this._idleTime = (typeof animation.idleTime === "number") ? animation.idleTime : 0;

        // Load tracks
        if (animation.tracks !== null && FORGE.Utils.isArrayOf(animation.tracks, "string"))
        {
            this._tracks = (this._random === true) ? FORGE.Utils.randomize(animation.tracks) : animation.tracks;
        }

        // Add on complete handler
        this._viewer.camera.animation.onComplete.add(this._onTrackCompleteHandler, this);

        // Add specific behavior if the current media is a video
        if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
        {
            this._viewer.story.scene.media.displayObject.onPause.add(this._pauseHandler, this);

            // React on loading/buffering event
            this._viewer.story.scene.media.displayObject.onWaiting.add(this._waitingHandler, this);
            this._viewer.story.scene.media.displayObject.onStalled.add(this._waitingHandler, this);
            this._viewer.story.scene.media.displayObject.onSeeking.add(this._waitingHandler, this);

            // The director's cut begin again if video is looping
            this._viewer.story.scene.media.displayObject.onEnded.add(this._endedHandler, this);

            // Synchronization !
            this._viewer.story.scene.media.displayObject.onCurrentTimeChange.add(this._synchronizeWithVideo, this);

            // Double synchronization when the window lose visibility
            // Needed because we rely on RAF which is only working on visibility
            document.addEventListener(FORGE.Device.visibilityChange, this._onVisibilityChangeBind);
        }

        // Start given the idle time
        if (typeof animation.delay === "number")
        {
            this._idleEvent = this._idleTimer.add(animation.delay, this._idleTimerCompleteHandler, this);
            this._idleTimer.start();
        }
    }
};

/**
 * Event handler when the video is paused. Not trigger only after the "pause" event.
 * @method FORGE.Director#_pauseHandler
 * @private
 */
FORGE.Director.prototype._pauseHandler = function()
{
    // Stopping the animation
    this.stop();

    // Event handling
    // for animation
    if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onPause.remove(this._pauseHandler, this);
        this._viewer.story.scene.media.displayObject.onPlay.add(this._playHandler, this);
    }

    // for controllers
    this._viewer.controllers.onControlStart.remove(this._controlStartHandler, this);
    this._viewer.controllers.onControlEnd.remove(this._controlEndHandler, this);
};

/**
 * Event handler when the video start playing again. Not trigger only after the "play" event.
 * @method FORGE.Director#_playHandler
 * @private
 */
FORGE.Director.prototype._playHandler = function()
{
    // Starting the animation
    if (this._track !== null)
    {
        this.play(this._track);

        if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
        {
            this._synchronizeWithVideo();
        }
    }

    // Event handling
    // for animation
    if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onPause.add(this._pauseHandler, this);
        this._viewer.story.scene.media.displayObject.onPlay.remove(this._playHandler, this);
    }
    // for controllers
    this._viewer.controllers.onControlStart.add(this._controlStartHandler, this);
    this._viewer.controllers.onControlEnd.add(this._controlEndHandler, this);
};

/**
 * Waiting and stalled handler
 * @method FORGE.Director#_waitingHandler
 * @private
 */
FORGE.Director.prototype._waitingHandler = function()
{
    // Stopping the animation
    this.stop();

    // Event handling
    // for waiting
    if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onWaiting.remove(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onStalled.remove(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onSeeking.remove(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onPlaying.add(this._playingHandler, this);
        this._viewer.story.scene.media.displayObject.onSeeked.add(this._playingHandler, this);
    }
    // for controllers
    this._viewer.controllers.onControlStart.remove(this._controlStartHandler, this);
    this._viewer.controllers.onControlEnd.remove(this._controlEndHandler, this);
};

/**
 * Playing handler
 * @method FORGE.Director#_playingHandler
 * @private
 */
FORGE.Director.prototype._playingHandler = function()
{
    // Starting the animation
    if (this._track !== null)
    {
        this.play(this._track);

        if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
        {
            this._synchronizeWithVideo();
        }
    }

    // Event handling
    // for waiting
    if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onPlaying.remove(this._playingHandler, this);
        this._viewer.story.scene.media.displayObject.onSeeked.remove(this._playingHandler, this);
        this._viewer.story.scene.media.displayObject.onWaiting.add(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onStalled.add(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onSeeking.add(this._waitingHandler, this);
    }
    // for controllers
    this._viewer.controllers.onControlStart.add(this._controlStartHandler, this);
    this._viewer.controllers.onControlEnd.add(this._controlEndHandler, this);
};

/**
 * If the video is looping, this handler will start the director's cut all over again.
 * @method FORGE.Director#_endedHandler
 * @private
 */
FORGE.Director.prototype._endedHandler = function()
{
    if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO && this._viewer.story.scene.media.displayObject.loop === true)
    {
        // Starting the animation by considering it is a new scene
        this._sceneLoadCompleteHandler();
    }
};

/**
 * Event handler for control start.
 * @method FORGE.Director#_controlStartHandler
 * @private
 */
FORGE.Director.prototype._controlStartHandler = function()
{
    if (this._track !== null && this._stoppable === true)
    {
        this.stop();
    }

    this._idleTimer.stop(true);
};

/**
 * Event handler for control end.
 * @method FORGE.Director#_controlEndHandler
 * @private
 */
FORGE.Director.prototype._controlEndHandler = function()
{
    if (this._idleEvent !== null)
    {
        this._idleTimer.remove(this._idleEvent);
    }

    if (this._track !== null && this._stoppable === true)
    {
        // If the track is null, we haven't began yet the director's cut
        if (this._track === null && typeof this._viewer.story.scene.config.director.animation.delay === "number")
        {
            this._idleEvent = this._idleTimer.add(this._viewer.story.scene.config.director.animation.delay, this._idleTimerCompleteHandler, this);
            this._idleTimer.start();
        }
        else if (typeof this._idleTime === "number" && this._idleTime > -1)
        {
            this._idleEvent = this._idleTimer.add(this._idleTime, this._idleTimerCompleteHandler, this);
            this._idleTimer.start();
        }
    }
};

/**
 * Event handler when a track is completed. Play the next track in the list if
 * any, or a random one.
 * @method FORGE.Director#_onTrackCompleteHandler
 * @private
 */
FORGE.Director.prototype._onTrackCompleteHandler = function()
{
    if (this._tracks.length > 1)
    {
        // Go to the next track if any
        var idx = this._tracks.indexOf( /** @type {string} */ (this._track)) + 1;

        // If the index is too high, play the track
        if (idx < this._tracks.length)
        {
            this.play(idx);
            return;
        }
    }

    // Loop only if it is the end of the last track
    if (this._loop === true)
    {
        // If it is random, change the entire order
        if (this._random === true)
        {
            this._tracks = FORGE.Utils.randomize(this._tracks);
        }

        this.play(0);
        return;
    }
};

/**
 * Event handler for idle timer complete.
 *
 * @method FORGE.Director#_idleTimerCompleteHandler
 * @private
 */
FORGE.Director.prototype._idleTimerCompleteHandler = function()
{
    // Resume the current track
    this.play(this._track);

    this._idleTimer.stop(true);
};

/**
 * Event handler for visibility change on the window.
 * @method FORGE.Director#_onVisibilityChange
 * @private
 */
FORGE.Director.prototype._onVisibilityChange = function()
{
    if (document[FORGE.Device.visibilityState] !== "hidden" && this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onCurrentTimeChange.dispatch(this._viewer.story.scene.media.displayObject.currentTime);
    }
};

/**
 * When the currentTime property of the video change, synchronize the director's cut on it.
 * @method FORGE.Director#_synchronizeWithVideo
 * @param  {(number|FORGE.Event)=} time - the emitted event, containing the time to synchronize to, or the time to synchronize to (in seconds).
 * @private
 */
FORGE.Director.prototype._synchronizeWithVideo = function(time)
{
    this.stop();

    // Remove the current track
    this._track = null;

    // Get the correct time to sync
    if (typeof time === "number")
    {
        time = time * 1000;
    }
    else if (typeof time === "object" && typeof time.data === "number")
    {
        time = time.data * 1000;
    }
    else if (this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        time = this._viewer.story.scene.media.displayObject.currentTimeMS;
    }
    else
    {
        time = 0;
    }

    var offset = 0;
    var trackA, trackB;
    trackB = FORGE.UID.get(this._tracks[0]);

    // If the time is lower than the duration of the first track, it is this one
    if (trackB.duration > time)
    {
        this._track = trackB.uid;
    }
    else
    {
        // Else check for each track and its following one if the time is between this two.
        for (var i = 1, ii = this._tracks.length - 1; i < ii; i++)
        {
            trackA = trackB;
            trackB = FORGE.UID.get(this._tracks[i]);

            if (trackA.duration + offset < time && trackB.duration + trackA.duration + offset > time)
            {
                this._track = trackB.uid;
                offset += trackA.duration;
                break;
            }

            offset += trackA.duration;
        }
    }

    // If no track found, it is after the last track, so change the camera
    if (this._track === null)
    {
        // Look the same as the last point of our last track
        var point = trackB.keyframes[trackB.keyframes.length - 1].data;
        this._viewer.camera.lookAt(point.yaw, point.pitch, point.roll, point.fov);
    }
    else
    {
        this._viewer.camera.animation.play(this._track, time);
    }
};

/**
 * Play a set of tracks if specified, else the current one, from the start.
 *
 * @method FORGE.Director#play
 * @param {?(string|number)=} track - A track
 */
FORGE.Director.prototype.play = function(track)
{
    this.stop();
    this._track = null;

    if (typeof track === "number")
    {
        this._track = this._tracks[track];
    }
    else if (typeof track === "string")
    {
        this._track = track;
    }
    else
    {
        this._track = this._tracks[0];
    }

    this._viewer.camera.animation.play(this._track);
};

/**
 * Stops the current animation.
 * @method FORGE.Director#stop
 */
FORGE.Director.prototype.stop = function()
{
    this.log("stopping");
    this._viewer.camera.animation.stop();
};

FORGE.Director.prototype._clearEvents = function()
{
    this._viewer.camera.animation.onComplete.remove(this._onTrackCompleteHandler, this);

    if (this._viewer.story.scene !== null && this._viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
    {
        this._viewer.story.scene.media.displayObject.onPlay.remove(this._playHandler, this);
        this._viewer.story.scene.media.displayObject.onPause.remove(this._pauseHandler, this);
        this._viewer.story.scene.media.displayObject.onWaiting.remove(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onStalled.remove(this._waitingHandler, this);
        this._viewer.story.scene.media.displayObject.onPlaying.remove(this._playingHandler, this);
        this._viewer.story.scene.media.displayObject.onEnded.remove(this._endedHandler, this);
        this._viewer.story.scene.media.displayObject.onCurrentTimeChange.remove(this._synchronizeWithVideo, this);

        document.removeEventListener(FORGE.Device.visibilityChange, this._onVisibilityChangeBind);
    }
};

/**
 * Destroy method.
 * @method  FORGE.Director#destroy
 */
FORGE.Director.prototype.destroy = function()
{
    this._clearEvents();

    this._viewer = null;

    this._tracks = null;

    this._track = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
