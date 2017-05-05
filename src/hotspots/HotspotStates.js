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
    this._state = "";

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
     * Ready flag
     * @name FORGE.HotspotStates#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * Loading flags
     * @name FORGE.HotspotStates#_loading
     * @type {Object}
     * @private
     */
    this._loading =
    {
        transform: false,
        material: false
    };

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
FORGE.HotspotStates._RESERVED = ["options"];

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

    // Set the default config
    this._config =
    {
        options: {},

        default: hotspot.config
    };
};

/**
 * Parse the states configuration
 * @method FORGE.HotspotStates#_parseConfig
 * @param {?HotspotStatesConfig} config - The configuration to parse
 * @private
 */
FORGE.HotspotStates.prototype._parseConfig = function(config)
{
    this._default = (typeof config.options.default === "string") ? config.options.default : "default";
    this._auto = (typeof config.options.auto === "boolean") ? config.options.auto : true;

    this._config.default = FORGE.Utils.extendSimpleObject(this._config.default, config[this._default]);
};

/**
 * Get the state names (states config keys without reserved keys that are not states)
 * @method FORGE.HotspotStates#_getStatesNames
 * @return {Array<string>} Returns the names of the available states.
 * @private
 */
FORGE.HotspotStates.prototype._getStatesNames = function()
{
    if(this._config === null)
    {
        return [];
    }

    var config = /** @type {!Object} */ (this._config);
    var keys = Object.keys(config);

    // Remove the reserved keywords from state names
    for(var i = 0, ii = FORGE.HotspotStates._RESERVED.length; i < ii; i++)
    {
        var index = keys.indexOf(FORGE.HotspotStates._RESERVED[i]);

        if(index !== -1)
        {
            keys.splice(index, 1);
        }
    }

    // Remove the state named "default" if there is a default state in the options
    if(this._default !== "default" && typeof this._config[this._default] !== "undefined")
    {
        index = keys.indexOf("default");

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
 * @param  {HotspotMaterialConfig} config - The hotspot material configuration object.
 * @private
 */
FORGE.HotspotStates.prototype._updateMaterial = function(config)
{
    this.log("update material");

    var hotspot = FORGE.UID.get(this._hotspotUid);
    hotspot.material.onReady.addOnce(this._materialReadyHandler, this);
    hotspot.material.load(config);
};

/**
 * Material ready event handler
 * @method FORGE.HotspotStates#_materialReadyHandler
 * @private
 */
FORGE.HotspotStates.prototype._materialReadyHandler = function()
{
    this._loading.material = false;
    this._checkLoading();
};

/**
 * Update the transform for the current state
 * @method FORGE.HotspotStates#_updateTransform
 * @param  {HotspotMaterialConfig} config - The hotspot transform configuration object.
 * @private
 */
FORGE.HotspotStates.prototype._updateTransform = function(config)
{
    this.log("update transform");

    var hotspot = FORGE.UID.get(this._hotspotUid);
    hotspot.transform.load(config, false);

    this._loading.transform = false;
    this._checkLoading();
};

/**
 * Check the loading status of the current state.
 * Dispatch the laod complete event if all check are ok.
 * @method FORGE.HotspotStates#_checkLoading
 * @private
 */
FORGE.HotspotStates.prototype._checkLoading = function()
{
    for(var prop in this._loading)
    {
        if(this._loading[prop] === true)
        {
            return true;
        }
    }

    this._ready = true;

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }

    return false;
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
 * @param  {string=} name - the name of the state to load.
 */
FORGE.HotspotStates.prototype.load = function(name)
{
    name = (typeof name === "string") ? name : this._default;

    this.log("Hotspot load state: "+name);

    var hotspot = FORGE.UID.get(this._hotspotUid);

    // If no hotspot match OR no state name match OR already on this state THEN return
    if(typeof hotspot === "undefined" || typeof this._config[name] !== "object" || name === this._state)
    {
        return;
    }

    this._ready = false;

    // Set the state name
    this._state = name;

    if(typeof this._config[name].material === "object")
    {
        this._loading.material = true;

        var materialConfig = /** @type {!HotspotMaterialConfig} */ (FORGE.Utils.extendSimpleObject(hotspot.config.material, this._config[name].material));
        this._updateMaterial(materialConfig);
    }

    if(typeof this._config[name].transform === "object")
    {
        this._loading.transform = true;

        var transformConfig = /** @type {!HotspotTransformConfig} */ (FORGE.Utils.extendSimpleObject(hotspot.config.transform, this._config[name].transform));
        this._updateTransform(transformConfig);
    }
};

/**
 * Toggle from a state to another.
 * @method FORGE.HotspotStates#toggle
 * @param  {Array<string>} names - the names of the states to loop through.
 */
FORGE.HotspotStates.prototype.toggle = function(names)
{
    if(names === null || typeof names === "undefined" || names.length < 2)
    {
        names = this._getStatesNames();
    }

    var current = names.indexOf(this._state);
    var next = 0;

    if(current < names.length - 1)
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

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

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
 * Get the states names.
 * @name FORGE.HotspotStates#names
 * @type {Array<string>}
 * @readonly
 */
Object.defineProperty(FORGE.HotspotStates.prototype, "names",
{
    /** @this {FORGE.HotspotStates} */
    get: function()
    {
        return this._getStatesNames();
    }
});

/**
 * Get the ready flag.
 * @name FORGE.HotspotStates#ready
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.HotspotStates.prototype, "ready",
{
    /** @this {FORGE.HotspotStates} */
    get: function()
    {
        return this._ready;
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
