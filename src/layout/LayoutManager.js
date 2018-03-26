/**
 * Layout manager
 * @constructor FORGE.LayoutManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.LayoutManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.LayoutManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Default layout UID
     * @name  FORGE.LayoutManager#_defaultUid
     * @type {string}
     * @private
     */
    this._defaultUid = "";

    FORGE.BaseObject.call(this, "LayoutManager");

    this._boot();
};

FORGE.LayoutManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.LayoutManager.prototype.constructor = FORGE.LayoutManager;

/**
 * Boot sequence
 * @method FORGE.LayoutManager#_boot
 * @private
 */
FORGE.LayoutManager.prototype._boot = function()
{
   // Add presets items
    for (i in FORGE.LayoutPresets)
    {
        new FORGE.Layout(this._viewer, FORGE.LayoutPresets[i]);
    }
};

/**
 * Parse a main configuration.
 * @method FORGE.LayoutManager#_parseConfig
 * @param {LayoutsConfig} config - The main layouts configuration.
 * @private
 */
FORGE.LayoutManager.prototype._parseConfig = function(config)
{
    if (typeof config === "undefined" || config === null)
    {
        return;
    }

    // If there are items then add them
    if (Array.isArray(config.items) === true)
    {
        for (var i = 0, ii = config.items.length; i < ii; i++)
        {
            this.addItem(config.items[i]);
        }
    }

    this._defaultUid = (FORGE.UID.isTypeOf(config.default, "Layout") === true) ? config.default : FORGE.LayoutPresets.SINGLE.uid;
};


/**
 * Load the main layouts configuration
 * @method FORGE.LayoutManager#loadConfig
 * @param {LayoutsConfig} config - The main layouts module configuration.
 */
FORGE.LayoutManager.prototype.loadConfig = function(config)
{
    this._config = config;

    this._parseConfig(config);
};


/**
 * Add layout item configuration
 * @method FORGE.LayoutManager#addItem
 * @param {(Array<LayoutConfig>|LayoutConfig)} config - Array of layout configurations or a single layout configuration.
 * @return {FORGE.Layout} Returns the last created layout object.
 */
FORGE.LayoutManager.prototype.addItem = function(config)
{
    var layout = null;

    // If it is an array of layouts
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            layout = new FORGE.Layout(this._viewer, config[i]);
        }
    }
    // If it is a single layout
    else
    {
        layout = new FORGE.Layout(this._viewer, /** @type {LayoutConfig} */ (config));
    }

    return layout;
};

/**
 * Get a layout by its UID.
 * @method FORGE.LayoutManager#get
 * @param {string} uid - The UID of the layout you want to get.
 */
FORGE.LayoutManager.prototype.get = function(uid)
{
    return FORGE.UID.get(uid, "Layout");
};

/**
 * Destroy routine
 * @method FORGE.LayoutManager#destroy
 */
FORGE.LayoutManager.prototype.destroy = function()
{
    var layouts = FORGE.UID.get(null, "Layout");
    var layout;

    while (layouts.length > 0)
    {
        layout = layouts.pop();
        layout.destroy();
        layout = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the default layout Uid.
 * @name FORGE.LayoutManager#defaultUid
 * @type {string}
 */
Object.defineProperty(FORGE.LayoutManager.prototype, "defaultUid",
{
    /** @this {FORGE.LayoutManager} */
    get: function()
    {
        return this._defaultUid;
    }
});

/**
 * Get the default layout.
 * @name FORGE.LayoutManager#default
 * @type {FORGE.Layout}
 */
Object.defineProperty(FORGE.LayoutManager.prototype, "default",
{
    /** @this {FORGE.LayoutManager} */
    get: function()
    {
        return FORGE.UID.get(this._defaultUid);
    }
});

