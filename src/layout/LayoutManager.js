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
     * layouts config array.
     * @name FORGE.LayoutManager#_layouts
     * @type {Array<FORGE.Layout>}
     * @private
     */
    this._layouts = null;

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
   this._layouts = [];

    var preset, layout;
    for (i in FORGE.LayoutPresets)
    {
        preset = FORGE.LayoutPresets[i];
        layout = new FORGE.Layout(this._viewer, preset);
        this._layouts.push(layout);
    }

    // Set the preset single as the default layout
    this._defaultUid = FORGE.LayoutPresets.SINGLE.uid;
};


/**
 * Add layouts configuration
 * @method FORGE.LayoutManager#addConfig
 * @param {(Array<LayoutConfig>|LayoutConfig)} config - Array of layout configurations or a single layout configuration.
 * @return {FORGE.Layout} Returns the last created layout object.
 */
FORGE.LayoutManager.prototype.addConfig = function(config)
{
    var layout = null;

    // If it is an array of layouts
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            layout = new FORGE.Layout(this._viewer, config[i]);
            this._layouts.push(layout);
        }
    }
    // If it is a single layout
    else
    {
        layout = new FORGE.Layout(this._viewer, /** @type {LayoutConfig} */ (config));
        this._layouts.push(layout);
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
    if (FORGE.Utils.isArrayOf(this._layouts, "Layout"))
    {
        while (this._layouts.length > 0)
        {
            var layout = this._layouts.pop();
            layout.destroy();
            layout = null;
        }
    }

    this._layouts = null;
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

