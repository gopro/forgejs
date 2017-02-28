/**
 * Hotspot states
 *
 * @constructor FORGE.HotspotStates
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {string} hotspotUid - The hotspot uid
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotStates = function(viewer, hotspotUid)
{
    /**
     * Viewer reference.
     * @name  FORGE.HotspotStates#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The hotspot uid
     * @name FORGE.HotspotStates#_hotspotUid
     * @type {string}
     * @private
     */
    this._hotspotUid = hotspotUid;

    /**
     * Hotspot material config
     * @name FORGE.HotspotStates#_config
     * @type {?HotspotStatesConfig}
     * @private
     */
    this._config = null;

    /**
     * The current state name
     * @name FORGE.HotspotStates#_state
     * @type {string}
     * @private
     */
    this._state = "default";

    /**
     * Default state
     * @name FORGE.HotspotStates#_default
     * @type {string}
     * @private
     */
    this._default = "default";

    /**
     * Does the states change automatically on interactive 3d objects?
     * @name FORGE.HotspotStates#_auto
     * @type {boolean}
     * @private
     */
    this._auto = true;

    /**
     * Load complete event dispatcher for state change.
     * @name  FORGE.HotspotStates#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    FORGE.BaseObject.call(this, "HotspotStates");

    this._boot();
};

FORGE.HotspotStates.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotStates.prototype.constructor = FORGE.HotspotStates;

/**
 * List of reserved keyword for states names.
 * @name FORGE.HotspotStates._RESERVED
 * @type {Array<string>}
 * @const
 * @private
 */
FORGE.HotspotStates._RESERVED = ["default", "auto"];

/**
 * Boot method.
 * @method FORGE.HotspotStates#_boot
 * @private
 */
FORGE.HotspotStates.prototype._boot = function()
{
    var hotspot = FORGE.UID.get(this._hotspotUid);

    // If no match, return
    if(typeof hotspot === "undefined")
    {
        throw("No hotspot match with uid: "+this._hotspotUid);
    }

    // Set the default config as the base hotspot config
    this._config =
    {
        default: hotspot.config
    };
};

/**
 * Parse the states configuration
 * @method FORGE.HotspotStates#_parseConfig
 * @param {HotspotStatesConfig} config - The configuration to parse
 * @private
 */
FORGE.HotspotStates.prototype._parseConfig = function(config)
{
    this._default = (typeof config.default === "string") ? config.default : "default";
    this._auto = (typeof config.auto === "boolean") ? config.auto : true;

    this._config.default = FORGE.Utils.extendSimpleObject(this._config.default, config[this._default]);
};

/**
 * Get the state names (states config keys without reserved keys that are not states)
 * @method FORGE.HotspotStates#_getStatesNames
 * @private
 */
FORGE.HotspotStates.prototype._getStatesNames = function()
{
    var keys = Object.keys(this._config);

    for(var i = 0, ii = FORGE.HotspotStates._RESERVED.length; i < ii; i++)
    {
        var index = keys.indexOf(FORGE.HotspotStates._RESERVED[i]);

        if(index !== -1)
        {
            keys.splice(index, 1);
        }
    }

    return keys;
};

/**
 * Update the material for the current state
 * @method FORGE.HotspotStates#_updateMaterial
 * @private
 */
FORGE.HotspotStates.prototype._updateMaterial = function(config)
{
    var hotspot = FORGE.UID.get(this._hotspotUid);
    var materialConfig = hotspot.config.material;

    hotspot.material.load(config);
};

/**
 * Add a states configuration object.
 * @method FORGE.HotspotStates#addConfig
 * @param  {HotspotStatesConfig} config - Configuration object with hotspots states.
 */
FORGE.HotspotStates.prototype.addConfig = function(config)
{
    this._config = FORGE.Utils.extendSimpleObject(this._config, config);
    this._parseConfig(this._config);
};

/**
 * Load a state.
 * @method FORGE.HotspotStates#load
 * @param  {string} name - the name of the state to load.
 */
FORGE.HotspotStates.prototype.load = function(name)
{
    name = (typeof name === "string") ? name : this._default;

    var hotspot = FORGE.UID.get(this._hotspotUid);

    // If no match, return
    if(typeof hotspot === "undefined" || typeof this._config[name] !== "object")
    {
        return;
    }

    // Set the state name
    this._state = name;

    if(typeof this._config[name].material === "object")
    {
        this._updateMaterial(FORGE.Utils.extendSimpleObject(hotspot.config.material, this._config[name].material));
    }

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }
};

/**
 * Toggle from a state to another.
 * @method FORGE.HotspotStates#load
 * @param  {string} names - the name of the states to toggle to.
 */
FORGE.HotspotStates.prototype.toggle = function(names)
{
    if(names === null || typeof names === "undefined" || names.length < 2)
    {
        names = this._getStatesNames();
    }

    var current = names.indexOf(this._state);
    var next

    if(current === -1 || current === names.length - 1)
    {
        next = 0;
    }
    else
    {
        next = current + 1;
    }

    this.load(names[next]);
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotStates#destroy
 */
FORGE.HotspotStates.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the current state
 * @name FORGE.HotspotStates#state
 * @type {string}
 */
Object.defineProperty(FORGE.HotspotStates.prototype, "state",
{
    /** @this {FORGE.HotspotStates} */
    get: function()
    {
        return this._state;
    },

    /** @this {FORGE.HotspotStates} */
    set: function(value)
    {
        this.load(value);
    }
});

/**
 * Get the auto flag.
 * @name FORGE.HotspotStates#auto
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.HotspotStates.prototype, "auto",
{
    /** @this {FORGE.HotspotStates} */
    get: function()
    {
        return this._auto;
    }
});

/**
 * Get the onConfigLoadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.HotspotStates#onLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotStates.prototype, "onLoadComplete",
{
    /** @this {FORGE.HotspotStates} */
    get: function()
    {
        if (this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});








