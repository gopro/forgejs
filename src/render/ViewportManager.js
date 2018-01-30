/**
 * Scene viewport manager
 * @constructor FORGE.ViewportManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ViewportManager = function(viewer, scene)
{
    /**
     * The viewer reference.
     * @name FORGE.ViewportManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene reference.
     * @name FORGE.ViewportManager#_scene
     * @type {FORGE.Scene}
     * @private
     */
    this._scene = scene;

    /**
     * The current Forge.Layout uid
     * @name FORGE.ViewportManager#_layoutUid
     * @type {string}
     * @private
     */
    this._layoutUid = "";

    /**
     * Array of scene viewports.
     * @name FORGE.ViewportManager#_viewports
     * @type {Array<FORGE.Viewport>}
     * @private
     */
    this._viewports = null;

    /**
     * Index of active viewport, where the controller is active.
     * @name FORGE.ViewportManager#_index
     * @type {number}
     * @private
     */
    this._index = 0;

    /**
     * Object renderer.
     * @name FORGE.ViewportManager#_objectRenderer
     * @type {FORGE.ObjectRenderer}
     * @private
     */
    this._objectRenderer = null;

    /**
     * Active viewport has changed event dispatcher
     * @name FORGE.ViewportManager#_onActiveViewportChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onActiveViewportChange = null;

    FORGE.BaseObject.call(this, "Viewport");

    this._boot();
};

FORGE.ViewportManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ViewportManager.prototype.constructor = FORGE.ViewportManager;

/**
 * Boot sequence.
 * @private
 */
FORGE.ViewportManager.prototype._boot = function()
{
    this._viewports = [];

    // Parse config for screen rendering
    this._setLayout(this._scene.layoutUid);

    // @todo enable this finally instead of all the canvas pointers
    // this._viewer.controllers.onActivate.add(this._renewActiveViewport, this)
    this._viewer.canvas.pointer.onTap.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onDoubleTap.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPanStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPinchStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPressStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onRotateStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onWheel.add(this._renewActiveViewport, this);

    this._viewer.canvas.onResize.add(this._canvasResizeHandler, this);

    this._scene.onLoadComplete.addOnce(this._onSceneLoadComplete, this);
};

/**
 * Set the current layout.
 * @name FORGE.ViewportManager#_setLayout
 * @param {string} layoutUid - The layout uid used to create viewports
 * @private
 */
FORGE.ViewportManager.prototype._setLayout = function(layoutUid)
{
    var layout = FORGE.UID.get(layoutUid);
    this._createViewports(layout.viewports);
};

/**
 * Create viewports
 * @name FORGE.ViewportManager#_createViewports
 * @param {string} layoutUid - The layout uid used to create viewports
 * @private
 */
FORGE.ViewportManager.prototype._createViewports = function(config)
{
    // Create the viewports
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            var viewport = new FORGE.Viewport(this._viewer, this._scene, config[i]);
            this._viewports.push(viewport);
        }
    }

    // Reset the active viewport index to 0
    this._index = 0;
};

/**
 * Destroy viewports
 * @name FORGE.ViewportManager#_destroyViewports
 * @private
 */
FORGE.ViewportManager.prototype._destroyViewports = function()
{
    for(var i = 0, ii = this._viewports.length; i < ii; i++)
    {
        this._viewports[i].destroy();
    }

    this._viewports = [];
};

/**
 * Scene load complete handler
 * @method FORGE.ViewportManager#_onSceneLoadComplete
 * @param {FORGE.Event} event - scene load complete event
 * @private
 */
FORGE.ViewportManager.prototype._onSceneLoadComplete = function(event)
{
    if (this._viewports.length === 0)
    {
        this.warn("Cannot setup hotspots, no viewport created.")
        return;
    }

    var hotspots = this._viewer.hotspots.getByType("Hotspot3D");
    this._objectRenderer = new FORGE.ObjectRenderer(this._viewer, hotspots);
};

/**
 * Canvas resize handler
 * @method FORGE.ViewportManager#_canvasResizeHandler
 * @private
 */
FORGE.ViewportManager.prototype._canvasResizeHandler = function()
{
    for(var i = 0, ii = this._viewports.length; i < ii; i++)
    {
        this._viewports[i].updateRectangle();
    }
};

/**
 * Get the index of the scene viewport containing some point
 * @method FORGE.ViewportManager#_getViewportIndexContainingPoint
 * @param {THREE.Vector2} point - point
 * @return {FORGE.Viewport} viewport containing the point (-1 if no viewport does)
 * @private
 */
FORGE.ViewportManager.prototype._getViewportIndexContainingPoint = function(point)
{
    return this._viewports.findIndex(function(viewport) {
        return viewport.rectangle.contains(point);
    });
};

/**
 * Renew active viewport if needed with pointer event.
 * @method FORGE.ViewportManager#_renewActiveViewport
 * @private
 */
FORGE.ViewportManager.prototype._renewActiveViewport = function(event)
{
    var px = event.data.clientX || event.data.center.x;
    var py = event.data.clientY || event.data.center.y;
    var point = new THREE.Vector2(px, this._viewer.height - py);
    var index = this._getViewportIndexContainingPoint(point);

    if (index === -1)
    {
        return;
    }

    this._index = index;

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.dispatch();
    }
};

/**
 * Render routine.
 * @method FORGE.ViewportManager#render
 */
FORGE.ViewportManager.prototype.render = function()
{
    for(var i = 0, ii = this._viewports.length; i < ii; i++)
    {
        this._viewports[i].render();
    }
};

/**
 * Get the relative mouse position inside the target element of a mouse event
 * @method FORGE.ViewportManager#getRelativeMousePosition
 * @param {THREE.Vector2} mouse - The mouse position in container space
 * @return {THREE.Vector2} relative mouse position in current viewport (null if out of bounds)
 */
FORGE.ViewportManager.prototype.getRelativeMousePosition = function(mouse)
{
    var index = this._getViewportIndexContainingPoint(mouse);

    if (index === -1)
    {
        return null;
    }

    var rectangle = this._viewports[index].rectangle;
    return new THREE.Vector2(mouse.x - rectangle.x, mouse.y - rectangle.y);
};

/**
 * Destroy sequence.
 * @method FORGE.ViewportManager#destroy
 */
FORGE.ViewportManager.prototype.destroy = function(webGLRenderer, target)
{
    this._viewer.canvas.pointer.onTap.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onDoubleTap.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPanStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPinchStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPressStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onRotateStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onWheel.remove(this._renewActiveViewport, this);

    this._viewer.canvas.onResize.remove(this._canvasResizeHandler, this);

    if (this._objectRenderer !== null)
    {
        this._objectRenderer.destroy();
        this._objectRenderer = null;
    }

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    this._destroyViewports();

    this._viewer = null;
    this._scene = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the viewport list
 * @name  FORGE.ViewportManager#all
 * @readonly
 * @type {Array<FORGE.Viewport>}
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "all",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._viewports;
    }
});

/**
 * Get and set the layout uid.
 * @name FORGE.ViewportManager#layoutUid
 * @type {FORGE.Viewport}
 * @readonly
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "layoutUid",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._layoutUid;
    },

    set: function(value)
    {
        if (FORGE.UID.isTypeOf(value, "Layout"))
        {
            this._destroyViewports();
            this._setLayout(value);
        }
    }
});

/**
 * Get the object renderer
 * @name  FORGE.ViewportManager#objectRenderer
 * @readonly
 * @type {FORGE.ObjectRenderer}
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "objectRenderer",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._objectRenderer;
    }
});

/**
 * Get the active viewport.
 * @name FORGE.ViewportManager#active
 * @type {FORGE.Viewport}
 * @readonly
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "active",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._viewports[this._index];
    }
});

/**
 * Get and set the active viewport index.
 * @name FORGE.ViewportManager#index
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "index",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._index;
    },

    /** @this {FORGE.ViewportManager} */
    set: function(value)
    {
        if (value < 0 || value >= this._viewports.length)
        {
            this.warn("Index "+value+" is out of bounds");
            return;
        }

        this._index = value;

        if (this._onActiveViewportChange == true)
        {
            this._onActiveViewportChange.dispatch();
        }
    }
});

/**
 * Get the onActiveViewportChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.ViewportManager#onActiveViewportChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.ViewportManager.prototype, "onActiveViewportChange",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        if (this._onActiveViewportChange === null)
        {
            this._onActiveViewportChange = new FORGE.EventDispatcher(this);
        }

        return this._onActiveViewportChange;
    }
});
