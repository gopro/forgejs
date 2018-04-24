/**
 * Scene viewport manager
 * @constructor FORGE.ViewportManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.SceneRenderer} sceneRenderer {@link FORGE.SceneRenderer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ViewportManager = function(viewer, sceneRenderer)
{
    /**
     * The viewer reference.
     * @name FORGE.ViewportManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene renderer reference.
     * @name FORGE.ViewportManager#_sceneRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._sceneRenderer = sceneRenderer;

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
     * Flag to know if the pointer is down
     * @name FORGE.ViewportManager#_pointerDown
     * @type {boolean}
     * @private
     */
    this._pointerDown = false;

    /**
     * Index of active viewport, where the controller is active.
     * @name FORGE.ViewportManager#_index
     * @type {number}
     * @private
     */
    this._index = 0;

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

    // Parse config for the rendering
    this._setLayout(this._sceneRenderer.scene.layoutUid);

    this._startWatchPointer();

    this._viewer.canvas.onResize.add(this._canvasResizeHandler, this);
};

/**
 * Start pointer watch for active viewport
 * @name FORGE.ViewportManager#_startWatchPointer
 * @private
 */
FORGE.ViewportManager.prototype._startWatchPointer = function()
{
    this._viewer.canvas.pointer.onMove.add(this._pointerMoveHandler, this);
    this._viewer.canvas.pointer.onPanStart.add(this._pointerPanStartHandler, this);
    this._viewer.canvas.pointer.onPanEnd.add(this._pointerPanEndHandler, this);
};

/**
 * Stop pointer watch for active viewport
 * @name FORGE.ViewportManager#_stopWatchPointer
 * @private
 */
FORGE.ViewportManager.prototype._stopWatchPointer = function()
{
    this._viewer.canvas.pointer.onMove.remove(this._pointerMoveHandler, this);
    this._viewer.canvas.pointer.onPanStart.remove(this._pointerPanStartHandler, this);
    this._viewer.canvas.pointer.onPanEnd.remove(this._pointerPanEndHandler, this);
};

/**
 * Pointer move handler
 * @name FORGE.ViewportManager#_pointerMoveHandler
 * @param {FORGE.Event} event
 * @private
 */
FORGE.ViewportManager.prototype._pointerMoveHandler = function(event)
{
    if (this._pointerDown == true)
    {
        return false;
    }

    var point = FORGE.Pointer.getRelativeMousePosition(event.data);
    var index = this._getViewportIndexContainingPoint(point);

    if (index === -1)
    {
        return false;
    }

    this._index = index;

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.dispatch();
    }
};

/**
 * Pointer pan start handler
 * @name FORGE.ViewportManager#_pointerPanStartHandler
 * @private
 */
FORGE.ViewportManager.prototype._pointerPanStartHandler = function()
{
    this._pointerDown = true;
};

/**
 * Pointer pan end handler
 * @name FORGE.ViewportManager#_pointerPanEndHandler
 * @private
 */
FORGE.ViewportManager.prototype._pointerPanEndHandler = function()
{
    this._pointerDown = false;
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
            var viewport = new FORGE.Viewport(this._viewer, this._sceneRenderer, config[i]);
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
 * Render routine.
 * @method FORGE.ViewportManager#render
 * @param {FORGE.ObjectRenderer} objectRenderer - object renderer
 * @param {THREE.WebGLRenderTarget} target - render target
 */
FORGE.ViewportManager.prototype.render = function(objectRenderer, target)
{
    for(var i = 0, ii = this._viewports.length; i < ii; i++)
    {
        this._viewports[i].render(objectRenderer, target);
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
    this._stopWatchPointer();

    this._viewer.canvas.onResize.remove(this._canvasResizeHandler, this);

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    this._destroyViewports();

    this._sceneRenderer = null;
    this._viewer = null;

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
