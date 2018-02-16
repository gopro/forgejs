/**
 * A Transition is a description of how to go from a scene to another
 * @constructor FORGE.Transition
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {TransitionConfig} config - The config of the Transition.
 * @extends {FORGE.BaseObject}
 */
FORGE.Transition = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Transition#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config of the Transition.
     * @name FORGE.Transition#_config
     * @type {TransitionConfig}
     * @private
     */
    this._config = config;

    /**
     * Type of the transition (screen | spherical)
     * @name FORGE.Transition#_type
     * @type {string}
     * @private
     */
    this._type = "";

    /**
     * Timer used for the transition
     * @name FORGE.Transition#_timer
     * @type {Forge.Timer}
     * @private
     */
    this._timer = null;

    /**
     * Duration of the transition in milliseconds.
     * @name FORGE.Transition#_duration
     * @type {number}
     * @private
     */
    this._duration = 15000;

    /**
     * {@link FORGE.EventDispatcher} for the start event.
     * @name FORGE.Transition#_onStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStart = null;

    /**
     * {@link FORGE.EventDispatcher} for the pause event.
     * @name FORGE.Transition#_onPause
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * {@link FORGE.EventDispatcher} for the resume event.
     * @name FORGE.Transition#_onResume
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * {@link FORGE.EventDispatcher} for the stop event.
     * @name FORGE.Transition#_onStop
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * {@link FORGE.EventDispatcher} for the compete event.
     * @name FORGE.Transition#_onComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    FORGE.BaseObject.call(this, "Transition");

    this._boot();
};

FORGE.Transition.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Transition.prototype.constructor = FORGE.Transition;

/**
 * Boot sequence.
 * @method FORGE.Transition#_boot
 * @private
 */
FORGE.Transition.prototype._boot = function()
{
    this._timer = this._viewer.clock.create(false);
    this._timer.onStart.add(this._timerStartHandler, this);
    this._timer.onPause.add(this._timerPauseHandler, this);
    this._timer.onResume.add(this._timerResumeHandler, this);
    this._timer.onStop.add(this._timerStopHandler, this);
    this._timer.onComplete.add(this._timerCompleteHandler, this);

    this._parseConfig(this._config);
    this._register();
};

/**
 * Parse the Transition configuration object from the json
 * @method FORGE.Transition#_parseConfig
 * @param  {TransitionConfig} config - Transition configuration to parse
 * @private
 */
FORGE.Transition.prototype._parseConfig = function(config)
{
    if(typeof config === "object" && config !== null)
    {
        if (typeof config.uid !== "undefined" && config.uid !== null)
        {
            this._uid = config.uid;
        }

       this._type = config.type || "screen";
    }
};

/**
 * Timer start handler
 * @method  FORGE.Transition#_timerStartHandler
 */
FORGE.Transition.prototype._timerStartHandler = function()
{
    this.log("on start");

    if(this._onStart !== null)
    {
        this._onStart.dispatch();
    }
};

/**
 * Timer pause handler
 * @method  FORGE.Transition#_timerPauseHandler
 */
FORGE.Transition.prototype._timerPauseHandler = function()
{
    this.log("on pause");

    if(this._onPause !== null)
    {
        this._onPause.dispatch();
    }
};

/**
 * Timer resume handler
 * @method  FORGE.Transition#_timerResumeHandler
 */
FORGE.Transition.prototype._timerResumeHandler = function()
{
    this.log("on resume");

    if(this._onResume !== null)
    {
        this._onResume.dispatch();
    }
};

/**
 * Timer stop handler
 * @method  FORGE.Transition#_timerStopHandler
 */
FORGE.Transition.prototype._timerStopHandler = function()
{
    this.log("on stop");

    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};


/**
 * Timer complete handler
 * @method  FORGE.Transition#_timerCompleteHandler
 */
FORGE.Transition.prototype._timerCompleteHandler = function()
{
    this.log("on complete");

    if(this._onComplete !== null)
    {
        this._onComplete.dispatch();
    }
};


/**
 * Start the transition.
 * @method  FORGE.Transition#start
 */
FORGE.Transition.prototype.start = function()
{
    this.log("start");

    this._timer.add(this._duration);
    this._timer.start();

    return this;
};

/**
 * Pause the transition.
 * @method  FORGE.Transition#pause
 */
FORGE.Transition.prototype.pause = function()
{
    this.log("pause");

    this._timer.pause();

    return this;
};

/**
 * Resume the transition.
 * @method  FORGE.Transition#resume
 */
FORGE.Transition.prototype.resume = function()
{
    this.log("resume");

    this._timer.resume();

    return this;
};

/**
 * Stop the transition.
 * @method  FORGE.Transition#stop
 */
FORGE.Transition.prototype.stop = function()
{
    this.log("stop");

    this._timer.stop(true);

    return this;
};

/**
 * Reset the transition.
 * @method  FORGE.Transition#reset
 */
FORGE.Transition.prototype.reset = function(restart)
{
    this._timer.stop(true);

    if (restart === true)
    {
        this.start();
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.Transition#destroy
 */
FORGE.Transition.prototype.destroy = function()
{
    this._timer.destroy();
    this._timer = null;

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the normalized time of the transition between 0 and 1.
 * @name FORGE.Transition#time
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Transition.prototype, "time",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        // Compute normalized time
        var n = this._timer.ms / this._duration;

        // Returns 1 if we are close to 0.99
        return n < 0.99 ? n : 1;
    }
});

/**
 * Get the running flag of the transition.
 * @name FORGE.Transition#running
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Transition.prototype, "running",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        return this._timer.running;
    }
});

/**
 * Get the "onStart" event {@link FORGE.EventDispatcher} of the Transition.
 * @name FORGE.Transition#onStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Transition.prototype, "onStart",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        if(this._onStart === null)
        {
            this._onStart = new FORGE.EventDispatcher(this);
        }

        return this._onStart;
    }
});

/**
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the Transition.
 * @name FORGE.Transition#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Transition.prototype, "onPause",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        if(this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
 * Get the "onResume" event {@link FORGE.EventDispatcher} of the Transition.
 * @name FORGE.Transition#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Transition.prototype, "onResume",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        if(this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});

/**
 * Get the "onStop" event {@link FORGE.EventDispatcher} of the Transition.
 * @name FORGE.Transition#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Transition.prototype, "onStop",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        if(this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});

/**
 * Get the "onComplete" event {@link FORGE.EventDispatcher} of the Transition.
 * @name FORGE.Transition#onComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Transition.prototype, "onComplete",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        if(this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});
