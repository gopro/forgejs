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

    this._ready = false;

    /**
     * The view type to restore when the user quit VR mode
     * @name  FORGE.ViewManager#_viewTypeBackup
     * @type {String}
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
 * Init view with info contained in configuration
 * @method FORGE.RenderManager#_initView
 * @param {FORGE.SceneParser} sceneConfig - scene configuration
 * @private
 */
FORGE.ViewManager.prototype._setView = function(type)
{
    this.log("set View");

    if (this._view !== null && this._view.type === type)
    {
        return;
    }

    this._clearView();

    switch (type)
    {
        case FORGE.ViewType.GOPRO:
            this._view = new FORGE.ViewGoPro(this._viewer, this._viewer.camera);
            break;

        case FORGE.ViewType.RECTILINEAR:
        default:
            this._view = new FORGE.ViewRectilinear(this._viewer, this._viewer.camera);
            break;
    }

    this._ready = true;

    if(this._onChange !== null)
    {
        this._onChange.dispatch();
    }
};

FORGE.ViewManager.prototype._clearView = function()
{
    this.log("clear View");

    this._ready = false;

    if (this._view !== null)
    {
        this._view.destroy();
        this._view = null;
    }
};

FORGE.ViewManager.prototype.load = function(config)
{
    var sceneViewConfig = /** @type {ViewConfig} */ (config);
    var globalViewConfig = /** @type {ViewConfig} */ (this._viewer.config.view);
    var extendedViewConfig = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(globalViewConfig, sceneViewConfig));

    var type = (typeof extendedViewConfig.type === "string") ? extendedViewConfig.type.toLowerCase() : FORGE.ViewType.RECTILINEAR;

    this._setView(type);
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