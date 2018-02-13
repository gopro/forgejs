/**
 * Layout manager
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
     * Transition array
     * @name FORGE.TransitionManager#_transitions
     * @type {Array<FORGE.Transition>}
     * @private
     */
    this._transitions = null;

    /**
     * Default transition UID
     * @name  FORGE.TransitionManager#_default
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
   this._transitions = [];

    // var preset, layout;
    // for (i in FORGE.LayoutPresets)
    // {
    //     preset = FORGE.LayoutPresets[i];
    //     layout = new FORGE.Layout(this._viewer, preset);
    //     this._layouts.push(layout);
    // }

    // // Set the preset single as the default layout
    // this._defaultUid = FORGE.LayoutPresets.SINGLE.uid;
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
            this._layouts.push(transition);
        }
    }
    // If it is a single transition
    else
    {
        transition = new FORGE.Transition(this._viewer, /** @type {TransitionConfig} */ (config));
        this._transitions.push(transition);
    }

    return layout;
};

/**
 * Update routine of the transition manager, called by the viewer update.
 * @method FORGE.TransitionManager#update
 */
FORGE.TransitionManager.prototype.update = function()
{
    // do update stuff
};

/**
 * Get a transition by its UID.
 * @method FORGE.TransitionManager#get
 * @param {string} uid - The UID of the transition you want to get.
 */
FORGE.TransitionManager.prototype.get = function(uid)
{
    return FORGE.UID.get(uid, "Layout");
};

/**
 * Destroy routine
 * @method FORGE.TransitionManager#destroy
 */
FORGE.TransitionManager.prototype.destroy = function()
{
    if (FORGE.Utils.isArrayOf(this._transitions, "Transition"))
    {
        while (this._transitions.length > 0)
        {
            var transition = this._transitions.pop();
            transition.destroy();
            transition = null;
        }
    }

    this._transitions = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

// /**
//  * Get the default layout Uid.
//  * @name FORGE.TransitionManager#defaultUid
//  * @type {FORGE.Layout}
//  */
// Object.defineProperty(FORGE.TransitionManager.prototype, "defaultUid",
// {
//     /** @this {FORGE.Viewport} */
//     get: function()
//     {
//         return this._defaultUid;
//     }
// });

// *
//  * Get the default layout.
//  * @name FORGE.TransitionManager#default
//  * @type {FORGE.Layout}
 
// Object.defineProperty(FORGE.TransitionManager.prototype, "default",
// {
//     /** @this {FORGE.Viewport} */
//     get: function()
//     {
//         return FORGE.UID.get(this._defaultUid);
//     }
// });

