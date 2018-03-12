/**
 * A Transition is a description of how to go from a scene to another.
 *
 * Always starts with a background transition, then a screen transition.
 * Most of the time there will be only one of these with a duration.
 *
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
     * Tween used for the transition
     * @name FORGE.Transition#_tween
     * @type {Forge.Tween}
     * @private
     */
    this._tween = null;

    /**
     * The normalized ratio of the transition [0 ... 1]
     * @name FORGE.Transition#_ratio
     * @type {number}
     * @private
     */
    this._ratio = 0;

    /**
     * Screen material configuration for this transition.
     * @name FORGE.Transition#_screen
     * @type {ScreenMaterialConfig}
     * @private
     */
    this._background = null;

    /**
     * Screen material configuration for this transition.
     * @name FORGE.Transition#_screen
     * @type {ScreenMaterialConfig}
     * @private
     */
    this._screen = null;

    /**
     * The scene uid to transition from.
     * @name FORGE.Transition#_from
     * @type {string}
     * @private
     */
    this._from = "";

    /**
     * The scene uid to transition to.
     * @name FORGE.Transition#_to
     * @type {string}
     * @private
     */
    this._to = "";

    /**
     * The current transition phase we are in.
     * Can be "background" or "screen".
     * Listed on {@link FORGE.TransitionType}
     * @name FORGE.Transition#_phase
     * @type {string}
     * @private
     */
    this._phase = "";

    /**
     * Flag to know if this transition is running.
     * @name FORGE.Transition#_running
     * @type {boolean}
     * @private
     */
    this._running = false;

    /**
     * {@link FORGE.EventDispatcher} for the start event.
     * @name FORGE.Transition#_onStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStart = null;

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
    this._onComplete = new FORGE.EventDispatcher(this, true);

    this._parseConfig(this._config);
    this._register();

    this._createTween();
};

/**
 * Parse the Transition configuration object from the json
 * @method FORGE.Transition#_parseConfig
 * @param  {TransitionConfig} config - Transition configuration to parse
 * @private
 */
FORGE.Transition.prototype._parseConfig = function(config)
{
    if (typeof config.uid !== "undefined" && config.uid !== null)
    {
        this._uid = config.uid;
    }

    // Configuration of a transition made in the background renderer.
    this._background = typeof config.background === "object" ? config.background : null;

    // Configuration of a transition made in the screen renderer.
    this._screen = typeof config.screen === "object" ? config.screen : null;
};

/**
 * Create the tween
 * @method  FORGE.Transition#_createTween
 */
FORGE.Transition.prototype._createTween = function()
{
    this._tween = new FORGE.Tween(this._viewer, this);
    this._tween.onStart.add(this._tweenStartHandler, this);
    this._tween.onStop.add(this._tweenStopHandler, this);
    this._tween.onComplete.add(this._tweenCompleteHandler, this);

    this._viewer.tween.add(this._tween);
};

/**
 * Tween start handler
 * @method  FORGE.Transition#_tweenStartHandler
 */
FORGE.Transition.prototype._tweenStartHandler = function()
{
    this.log("tween start");

    if(this._onStart !== null)
    {
        this._onStart.dispatch();
    }
};

/**
 * Tween stop handler
 * @method  FORGE.Transition#_tweenStopHandler
 */
FORGE.Transition.prototype._tweenStopHandler = function()
{
    this.log("tween stop");

    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};

/**
 * Tween complete handler
 * @method  FORGE.Transition#_tweenCompleteHandler
 */
FORGE.Transition.prototype._tweenCompleteHandler = function()
{
    this.log("tween complete");

    if (this._phase === FORGE.TransitionType.BACKGROUND)
    {
        this._backgroundComplete();
    }
    else if (this._phase === FORGE.TransitionType.SCREEN)
    {
        this._screenComplete();
    }
    else
    {
        this.warn("Lost in transition time corridor");
    }
};

/**
 * Starts the background transition.
 * @method  FORGE.Transition#_backgroundStart
 */
FORGE.Transition.prototype._backgroundStart = function()
{
    this.log("background start");

    this._phase = FORGE.TransitionType.BACKGROUND;

    if (this._background === null || this._background.duration === 0)
    {
        this._backgroundComplete();
        return;
    }

    // STUB METHOD TO BE COMPLETED WITH YG
};

/**
 * Complete the background transition.
 * @method  FORGE.Transition#_backgroundComplete
 */
FORGE.Transition.prototype._backgroundComplete = function()
{
    this.log("background complete");

    // Create the renderer for scene "to".
    this._viewer.renderer.scenes.add(this._to);

    // Starts the screen transition.
    this._screenStart();
};

/**
 * Starts the screen transition.
 * @method  FORGE.Transition#_screenStart
 */
FORGE.Transition.prototype._screenStart = function()
{
    this.log("screen start");

    this._phase = FORGE.TransitionType.SCREEN;

    // If there is no screen transition config or its duration equal 0 then skip to screen complete
    if (this._screen === null || this._screen.duration === 0)
    {
        this._screenComplete();
    }
    else
    {
        this._viewer.renderer.screen.load(this._screen.material);
        this._tween.to({ ratio: 1 }, this._screen.duration, FORGE.Easing.LINEAR).start();
    }
};

/**
 * Complete the screen transition.
 * @method  FORGE.Transition#_screenComplete
 */
FORGE.Transition.prototype._screenComplete = function()
{
    this.log("screen complete");

    // Load the default screen material
    this._viewer.renderer.screen.load();

    this._complete();
};

/**
 * Complete global transition.
 * @method  FORGE.Transition#_complete
 */
FORGE.Transition.prototype._complete = function()
{
    this.log("global complete");

    // Unload the from scene
    // ....

    // Transition is complete
    this._running = false;

    if (this._onComplete !== null)
    {
        this._onComplete.dispatch();
    }
};

/**
 * Start the transition.
 * @method  FORGE.Transition#start
 */
FORGE.Transition.prototype.start = function(sceneToUid)
{
    this.log("start");

    this._onComplete.reset();

    this._running = true;

    this._from = this._viewer.story.sceneUid;
    this._to = sceneToUid;

    this._ratio = 0;

    this._backgroundStart();
};

/**
 * Stop the transition.
 * @method  FORGE.Transition#stop
 */
FORGE.Transition.prototype.stop = function()
{
    this.log("stop");

    this._tween.stop(true);
};

/**
 * Reset the transition.
 * @method  FORGE.Transition#reset
 */
FORGE.Transition.prototype.reset = function(restart)
{
    this._tween.stop();

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
    this._tween.destroy();
    this._tween = null;

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the running flag.
 * @name FORGE.Transition#running
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Transition.prototype, "running",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        return this._running;
    }
});

/**
 * Get the normalized ratio of the transition between 0 and 1.
 * @name FORGE.Transition#ratio
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Transition.prototype, "ratio",
{
    /** @this {FORGE.Transition} */
    get: function()
    {
        return this._ratio;
    },

    set: function(value)
    {
        this._ratio = FORGE.Math.clamp(value, 0, 1);
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
        return this._onComplete;
    }
});
