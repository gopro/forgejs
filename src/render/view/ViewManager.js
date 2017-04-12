/**
 * View manager class
 *
 * @constructor FORGE.ViewManager
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ViewManager = function(viewer)
{
    /**
     * The Viewer reference.
     * @name FORGE.ViewManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The current view reference
     * @name FORGE.ViewManager#_view
     * @type {FORGE.ViewBase}
     * @private
     */
    this._view = null;

    /**
     * Ready flag
     * @name FORGE.ViewManager#_ready
     * @type {boolean}
     */
    this._ready = false;

    /**
     * The view type to restore when the user quit VR mode
     * @name  FORGE.ViewManager#_viewTypeBackup
     * @type {string}
     * @private
     */
    this._viewTypeBackup = "";

    /**
     * Event dispatcher for view change.
     * @name FORGE.ViewManager#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;


    FORGE.BaseObject.call(this, "ViewManager");
};

FORGE.ViewManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ViewManager.prototype.constructor = FORGE.ViewManager;

/**
 * Set the view type
 * @method FORGE.ViewManager#_setView
 * @param {string} type - The type of the view to set
 * @private
 */
FORGE.ViewManager.prototype._setView = function(type)
{
    if (this._view !== null && this._view.type === type)
    {
        return;
    }

    this._clearView();

    this.log("set view "+type);

    switch (type)
    {
        case FORGE.ViewType.GOPRO:
            this._view = new FORGE.ViewGoPro(this._viewer);
            break;

        case FORGE.ViewType.FLAT:
            this._view = new FORGE.ViewFlat(this._viewer);
            break;

        case FORGE.ViewType.RECTILINEAR:
        default:
            this._viewer.controllers.gyroscope = true;
            this._view = new FORGE.ViewRectilinear(this._viewer);
            break;
    }

    this._ready = true;

    this.notifyChange();
};

/**
 * Clear the view
 * @method FORGE.ViewManager#_clearView
 * @private
 */
FORGE.ViewManager.prototype._clearView = function()
{
    this._ready = false;
    this._viewer.controllers.gyroscope = false;

    if (this._view !== null)
    {
        this.log("clear view");

        this._view.destroy();
        this._view = null;
    }
};

/**
 * Used by views to notify a change to the manager.
 * @method FORGE.ViewManager#notifyChange
 * @private
 */
FORGE.ViewManager.prototype.notifyChange = function()
{
    if(this._onChange !== null)
    {
        this._onChange.dispatch();
    }
};

/**
 * Load a view configuration
 * @method FORGE.ViewManager#load
 * @param  {ViewConfig} config - The configuration of the view to load
 * @private
 */
FORGE.ViewManager.prototype.load = function(config)
{
    var sceneViewConfig = /** @type {ViewConfig} */ (config);
    var globalViewConfig = /** @type {ViewConfig} */ (this._viewer.config.view);
    var extendedViewConfig = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(globalViewConfig, sceneViewConfig));

    var type = (typeof extendedViewConfig.type === "string") ? extendedViewConfig.type.toLowerCase() : FORGE.ViewType.RECTILINEAR;

    this._setView(type);
};

/**
 * Enable VR backup the view type then force to rectilinear
 * @method FORGE.ViewManager#enableVR
 */
FORGE.ViewManager.prototype.enableVR = function()
{
    this._viewTypeBackup = this._view.type;
    this._setView(FORGE.ViewType.RECTILINEAR);
};

/**
 * Disable VR restore the view type.
 * @method FORGE.ViewManager#disableVR
 */
FORGE.ViewManager.prototype.disableVR = function()
{
    if(this._viewTypeBackup !== "")
    {
        this._setView(this._viewTypeBackup); // Restore the view as before the VR mode
        this._viewer.camera.roll = 0; // Reset the roll to 0
    }
};

/**
 * Get the current view object.
 * @name  FORGE.ViewManager#current
 * @type {FORGE.ViewBase}
 * @readonly
 */
Object.defineProperty(FORGE.ViewManager.prototype, "current",
{
    /** @this {FORGE.ViewManager} */
    get: function()
    {
        return this._view;
    }
});

/**
 * Get the view ready flag.
 * @name  FORGE.ViewManager#ready
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.ViewManager.prototype, "ready",
{
    /** @this {FORGE.ViewManager} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get and set the current view type.
 * @name  FORGE.ViewManager#type
 * @type {string}
 */
Object.defineProperty(FORGE.ViewManager.prototype, "type",
{
    /** @this {FORGE.ViewManager} */
    get: function()
    {
        return (this._view !== null) ? this._view.type : null;
    },

    /** @this {FORGE.ViewManager} */
    set: function(value)
    {
        this._setView(value);
    }
});

/**
 * Get the onChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.ViewManager#onChange
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.ViewManager.prototype, "onChange",
{
    /** @this {FORGE.ViewManager} */
    get: function()
    {
        if (this._onChange === null)
        {
            this._onChange = new FORGE.EventDispatcher(this);
        }

        return this._onChange;
    }
});
