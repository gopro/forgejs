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
     * Initial configuration of the transition manager.
     * @name FORGE.TransitionManager#_config
     * @type {TransitionsConfig}
     * @private
     */
    this._config = null;

    /**
     * The available default transition oredered by preference.
     * @name FORGE.TransitionManager#_default
     * @type {Array<string>}
     * @private
     */
    this._default = [];

    /**
     * Current transition UID
     * @name  FORGE.TransitionManager#_runningUid
     * @type {string}
     * @private
     */
    this._currentUid = "";

    /**
     * Ultimate default transition UID
     * @name  FORGE.TransitionManager#_defaultUid
     * @type {string}
     * @private
     */
    this._defaultUid = FORGE.TransitionPresets.NONE.uid;

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
    // Add presets items
    for (i in FORGE.TransitionPresets)
    {
        new FORGE.Transition(this._viewer, FORGE.TransitionPresets[i]);
    }
};

/**
 * Parse a main configuration.
 * @method FORGE.TransitionManager#_parseConfig
 * @param {TransitionsConfig} config - The main transitions configuration.
 * @private
 */
FORGE.TransitionManager.prototype._parseConfig = function(config)
{
    this._config = config;

    // If default is a string then push it into the default array
    if (typeof config.default === "string")
    {
        this._default.push(config.default);
    }
    // Else if default is an an array then add it to the existing default array
    else if (Array.isArray(config.default) === true)
    {
        this._default = this._default.concat(config.default);
    }

    // If there are items then add them
    if (Array.isArray(config.items) === true)
    {
        for (var i = 0, ii = config.items.length; i < ii; i++)
        {
            this.addItem(config.items[i]);
        }
    }
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
 * Select the right transition uid to go FROM a scene TO another.
 * @method FORGE.TransitionManager#_resolve
 * @param {string} fromUid - The scene uid where we come from.
 * @param {string} toUid - The scene uid where we want to transition to.
 * @param {string} transitionUid - The prefered transition uid.
 * @return {string} Returns the transition uid to use
 * @private
 */
FORGE.TransitionManager.prototype._resolve = function(fromUid, toUid, transitionUid)
{
    // if the provided transition uid is legel then go for it
    if (this._isLegal(fromUid, toUid, transitionUid) === true)
    {
        return transitionUid;
    }
    // Else we try to resolve the transitions graph of the scene
    else
    {
        var sceneTo = FORGE.UID.get(toUid);

        // If a legal transition is set in the transitions graph of the scene then go
        if (this._isLegal(fromUid, toUid, sceneTo.transitions[fromUid]) === true)
        {
            return sceneTo.transitions[fromUid];
        }
    }

    // in any other case return the default
    return this._getDefault(fromUid, toUid);
};

/**
 * Get the default transiton uid to go FROM a scene TO another.
 * @method FORGE.TransitionManager#_getDefault
 * @param {string} fromUid - The scene uid where we come from.
 * @param {string} toUid - The scene uid where we want to transition to.
 * @param {string} transitionUid - The prefered transition uid.
 * @return {string} Returns the default transition uid for a given FROM > TO scenario
 * @private
 */
FORGE.TransitionManager.prototype._getDefault = function(fromUid, toUid)
{
    var transitionUid;

    for (var i = 0, ii = this._default.length; i < ii; i++)
    {
        transitionUid = this._default[i];

        if (this._isLegal(fromUid, toUid, transitionUid) === true)
        {
            return transitionUid;
        }
    }

    // If no legal transition in the user default array, return the ultimate default uid.
    return this._defaultUid;
};

/**
 * Is a transiton uid to go FROM a scene TO another is legal?
 * @method FORGE.TransitionManager#_isLegal
 * @param {string} fromUid - The scene uid where we come from.
 * @param {string} toUid - The scene uid where we want to transition to.
 * @param {string} transitionUid - The prefered transition uid.
 * @return {boolean} Returns true  if the transition is legal
 * @private
 */
FORGE.TransitionManager.prototype._isLegal = function(fromUid, toUid, transitionUid)
{
    if (FORGE.UID.isTypeOf(transitionUid, "Transition") === true)
    {
        var transition = FORGE.UID.get(transitionUid);
        var background = transition.has(FORGE.TransitionType.BACKGROUND);

        if(background === true)
        {
             // If it is the first scene loaded, we can't do a background transition
            if (fromUid === "")
            {
                // Return the opposite value of background
                return false;
            }

            var mediaFrom = FORGE.UID.get(fromUid).media;
            var mediaTo = FORGE.UID.get(toUid).media;
            var types = [FORGE.MediaType.UNDEFINED, FORGE.MediaType.GRID, FORGE.MediaType.TILED];

            // If the media type of one of the two scene is forbidden then we can't do a background transition!
            // If the media source format is flat, we can't do a background transition!
            if (types.indexOf(mediaFrom.type) > -1 || types.indexOf(mediaTo.type) > -1
                || mediaFrom.source !== null && mediaFrom.source.format === FORGE.MediaFormat.FLAT)
            {
                return false;
            }

            // In other cases it is ok :)
            return true;
        }

        return true;
    }

    return false;
};

/**
 * Load the main transitions configuration
 * @method FORGE.TransitionManager#loadConfig
 * @param {TransitionsConfig} config - The main transitions module configuration.
 */
FORGE.TransitionManager.prototype.loadConfig = function(config)
{
    if (typeof config === "object" && config !== null)
    {
        this._parseConfig(config);
    }
};

/**
 * Add a transition configuration
 * @method FORGE.TransitionManager#addConfig
 * @param {(Array<TransitionConfig>|TransitionConfig)} config - Array of transition configurations or a single transition configuration.
 * @return {FORGE.Transition} Returns the last created {@link FORGE.Transition} object.
 */
FORGE.TransitionManager.prototype.addItem = function(config)
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
    if (this._currentUid !== "")
    {
        return this.current;
    }

    this._currentUid = this._resolve(this._viewer.story.sceneUid, sceneUid, transitionUid);

    // Get the transition object to use
    var transition = this.get(this._currentUid);
    transition.reset();
    transition.onComplete.addOnce(this._transitionCompleteHandler, this);
    transition.start(sceneUid);

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
    var transition;

    while (transitions.length > 0)
    {
        transition = transitions.pop();
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