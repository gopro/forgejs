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
};

/**
 * Load a state.
 * @method FORGE.HotspotStates#load
 * @param  {string} name - the name of the state to load.
 */
FORGE.HotspotStates.prototype.load = function(name)
{
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








