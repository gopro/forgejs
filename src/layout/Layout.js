/**
 * A layout is a description of a group of viewports or a single viewport
 * @constructor FORGE.Layout
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {LayoutConfig} config - The config of the layout.
 * @extends {FORGE.BaseObject}
 */
FORGE.Layout = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Layout#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config of the layout.
     * @name FORGE.Layout#_config
     * @type {LayoutConfig}
     * @private
     */
    this._config = config;

    /**
     * Layout viewports configuration
     * @type {Array<ViewportConfig>}
     */
    this._viewports = null;

    FORGE.BaseObject.call(this, "Layout");

    this._boot();
};

FORGE.Layout.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Layout.prototype.constructor = FORGE.Layout;

/**
 * Boot sequence.
 * @method FORGE.Layout#_boot
 * @private
 */
FORGE.Layout.prototype._boot = function()
{
    this._viewports = [];

    this._parseConfig(this._config);
    this._register();
};

/**
 * Parse the layout configuration object from the json
 * @method FORGE.Layout#_parseConfig
 * @param  {LayoutConfig} config - Layout configuration to parse
 * @private
 */
FORGE.Layout.prototype._parseConfig = function(config)
{
    var viewports = [ FORGE.SceneViewport.DEFAULT_CONFIG ];

    if(typeof config === "object" && config !== null)
    {
        if (typeof config.uid !== "undefined" && config.uid !== null)
        {
            this._uid = config.uid;
        }

        if (Array.isArray(config.viewports) === true)
        {
            viewports = config.viewports;
        }
    }

    this._viewports = viewports;
};

/**
 * Destroy sequence.
 * @method  FORGE.Layout#destroy
 */
FORGE.Layout.prototype.destroy = function()
{
    this._viewer = null;

    this._viewports = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};


/**
 * Get the viewports configurations.
 * @name FORGE.Layout#viewports
 * @readonly
 * @type {*}
 */
Object.defineProperty(FORGE.Layout.prototype, "viewports",
{
    /** @this {FORGE.Layout} */
    get: function()
    {
        return this._viewports;
    }
});

