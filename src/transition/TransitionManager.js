/**
 * Transition manager
 * @constructor FORGE.TransitionManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.TransitionManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.TransitionManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Current transition UID
     * @name  FORGE.TransitionManager#_runningUid
     * @type {string}
     * @private
     */
    this._currentUid = "";

    /**
     * Default transition UID
     * @name  FORGE.TransitionManager#_defaultUid
     * @type {string}
     * @private
     */
    this._defaultUid = "";

    FORGE.BaseObject.call(this, "TransitionManager");

    this._boot();
};

FORGE.TransitionManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.TransitionManager.prototype.constructor = FORGE.TransitionManager;

/**
 * Boot sequence
 * @method FORGE.TransitionManager#_boot
 * @private
 */
FORGE.TransitionManager.prototype._boot = function()
{
    var preset, transition;
    for (i in FORGE.TransitionPresets)
    {
        preset = FORGE.TransitionPresets[i];
        transition = new FORGE.Transition(this._viewer, preset);
    }

    // Set the preset single as the default layout
    this._defaultUid = FORGE.TransitionPresets.SPHERICAL.uid;
};

/**
 * Transition complete handler
 * @method FORGE.TransitionManager#_transitionCompleteHandler
 * @private
 */
FORGE.TransitionManager.prototype._transitionCompleteHandler = function()
{
    this._currentUid = "";
};

/**
 * Add a transition configuration
 * @method FORGE.TransitionManager#addConfig
 * @param {(Array<TransitionConfig>|TransitionConfig)} config - Array of transition configurations or a single transition configuration.
 * @return {FORGE.Transition} Returns the last created {@link FORGE.Transition} object.
 */
FORGE.TransitionManager.prototype.addConfig = function(config)
{
    var transition = null;

    // If it is an array of transitions
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            transition = new FORGE.Transition(this._viewer, /** @type {TransitionConfig} */ (config[i]));
        }
    }
    // If it is a single transition
    else
    {
        transition = new FORGE.Transition(this._viewer, /** @type {TransitionConfig} */ (config));
    }

    return transition;
};

/**
 * Engage a transition to a scene.
 * @method FORGE.TransitionManager#to
 * @return {FORGE.Transition}
 */
FORGE.TransitionManager.prototype.to = function(sceneUid, transitionUid)
{
    // If transition uid is undefined or is not a transition, choose the default one.
    if(FORGE.UID.isTypeOf(transitionUid, "Transition") === false)
    {
        // If there is no current scene then choose a none transition.
        if (this._viewer.story.scene === null)
        {
            transitionUid = FORGE.TransitionPresets.NONE.uid;
        }
        // Else pick the default transition
        else
        {
            transitionUid = this._defaultUid;
        }
    }

    // Get the transition object
    var transition = this.get(transitionUid);

    transition.start(sceneUid);
    transition.onComplete.addOnce(this._transitionCompleteHandler, this);

    this._currentUid = transition.uid;

    return transition;
};

/**
 * Get a transition by its UID.
 * @method FORGE.TransitionManager#get
 * @param {string} uid - The UID of the transition you want to get.
 */
FORGE.TransitionManager.prototype.get = function(uid)
{
    return FORGE.UID.get(uid, "Transition");
};

/**
 * Destroy routine
 * @method FORGE.TransitionManager#destroy
 */
FORGE.TransitionManager.prototype.destroy = function()
{
    var transitions = FORGE.UID.get(null, "Transition");

    while (transitions.length > 0)
    {
        var transition = transitions.pop();
        transition.destroy();
        transition = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the default transition Uid.
 * @name FORGE.TransitionManager#defaultUid
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.TransitionManager.prototype, "defaultUid",
{
    /** @this {FORGE.TransitionManager} */
    get: function()
    {
        return this._defaultUid;
    }
});

/**
 * Get the default tansition.
 * @name FORGE.TransitionManager#default
 * @type {FORGE.Transition}
 * @readonly
 */
Object.defineProperty(FORGE.TransitionManager.prototype, "default",
{
    /** @this {FORGE.TransitionManager} */
    get: function()
    {
        return FORGE.UID.get(this._defaultUid);
    }
});

/**
 * Get the current transition uid
 * @name FORGE.TransitionManager#currentUid
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.TransitionManager.prototype, "currentUid",
{
    /** @this {FORGE.TransitionManager} */
    get: function()
    {
        return this._currentUid;
    }
});

/**
 * Get the current transition.
 * @name FORGE.TransitionManager#current
 * @type {FORGE.Transition}
 * @readonly
 */
Object.defineProperty(FORGE.TransitionManager.prototype, "current",
{
    /** @this {FORGE.TransitionManager} */
    get: function()
    {
        return FORGE.UID.get(this._currentUid);
    }
});

/**
 * Is a transition running?
 * @name FORGE.TransitionManager#running
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.TransitionManager.prototype, "running",
{
    /** @this {FORGE.TransitionManager} */
    get: function()
    {
        return (this._currentUid !== "" && this.current.running == true);
    }
});