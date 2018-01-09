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
     * The FX list.
     * @name FORGE.FXManager#_fxs
     * @type {Array<string>}
     * @private
     */
    this._fxs = null;

    FORGE.BaseObject.call(this, "FXManager");

    this._boot();
};

FORGE.FXManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.FXManager.prototype.constructor = FORGE.FXManager;

/**
 * Boot sequence
 * @method FORGE.FXManager#_boot
 * @private
 */
FORGE.FXManager.prototype._boot = function()
{
    this._fxs = [];
};

/**
 * FX configuration parsing
 * @method FORGE.FXManager#addConfig
 * @param {FXManagerConfig} config FX configuration
 */
FORGE.FXManager.prototype.addConfig = function(config)
{
    if (typeof config === "undefined")
    {
        return;
    }

    if (typeof config === 'object' && !Array.isArray(config))
    {
        config = [config];
    }

    for (var i=0, ii=config.length; i<ii; i++)
    {
        var fx = new FORGE.FX(config[i]);
        if (fx.pass === null)
        {
            this.warn("Impossible to create fx pass of type " + config.type);
            continue;
        }

        this._fxs.push(fx);
    }
};

/**
 * Get a FX shader pass with given UID
 * @method FORGE.FXManager#getFXPassByUID
 */
FORGE.FXManager.prototype.getFXPassByUID = function(uid)
{
    var fx = FORGE.UID.get(uid);
    return fx.createPass();
};

/**
 * Destroy sequence
 * @method FORGE.FXManager#destroy
 */
FORGE.FXManager.prototype.destroy = function()
{
    this._config = null;

    while (this._fxs.length > 0)
    {
        var fx = this._fxs.pop();
        fx.destroy();
    }

    this._fxs = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the fx list.
 * @name FORGE.FXManager#all
 * @type {Array<THREE.Pass>}
 */
Object.defineProperty(FORGE.FXManager.prototype, "all",
{
    /** @this {FORGE.FXManager} */
    get: function()
    {
        return this._fxs;
    }
});
