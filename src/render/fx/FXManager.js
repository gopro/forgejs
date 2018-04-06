/**
 * FORGE.FXManager
 * Post processing FX Manager class.
 *
 * @constructor FORGE.FXManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.FXManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.FXManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;


    /**
     * Initial configuration of the fx manager.
     * @name FORGE.FXManager#_config
     * @type {FXsConfig}
     * @private
     */
    this._config = null;

    /**
     * Enabled flag of the fx manager.
     * @name FORGE.FXManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    FORGE.BaseObject.call(this, "FXManager");
};

FORGE.FXManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.FXManager.prototype.constructor = FORGE.FXManager;

/**
 * Parse a main configuration.
 * @method FORGE.FXManager#_parseConfig
 * @param {FXsConfig} config - The main fxs configuration.
 * @private
 */
FORGE.FXManager.prototype._parseConfig = function(config)
{
    this._config = config;

    // Set the enabled flag, default is true
    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;

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
 * Load the main fxs configuration
 * @method FORGE.FXManager#loadConfig
 * @param {FXsConfig} config - The main fx module configuration.
 */
FORGE.FXManager.prototype.loadConfig = function(config)
{
    if (typeof config === "object" && config !== null)
    {
        this._parseConfig(config);
    }
};

/**
 * Add a FX configuration
 * @method FORGE.FXManager#addItem
 * @param {FXConfig} FX configuration
 */
FORGE.FXManager.prototype.addItem = function(config)
{
    if (typeof config === "undefined" || config === null)
    {
        return;
    }

    var fx = null;

    // If it is an array of fx
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            fx = new FORGE.FX(/** @type {TransitionConfig} */ (config[i]));
        }
    }
    // If it is a single fx
    else
    {
        fx = new FORGE.FX(/** @type {TransitionConfig} */ (config));
    }

    return fx;
};

/**
 * Get a FX shader pass with given UID
 * @method FORGE.FXManager#getFXPassByUID
 */
FORGE.FXManager.prototype.getFXPassByUID = function(uid)
{
    var fx = FORGE.UID.get(uid);
    var pass = null;

    if (typeof fx !== "undefined")
    {
        pass =  fx.createPass();
    }

    return pass;
};

/**
 * Destroy sequence
 * @method FORGE.FXManager#destroy
 */
FORGE.FXManager.prototype.destroy = function()
{
    var fxs = FORGE.UID.get(null, "FX²");
    var fx;

    while (fxs.length > 0)
    {
        fx = fxs.pop();
        fx.destroy();
        fx = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the enabled flag.
 * @name FORGE.FXManager#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.FXManager.prototype, "enabled",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        this._enabled = Boolean(value);
    }
});