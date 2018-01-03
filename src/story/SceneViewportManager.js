/**
 * Scene viewport manager
 * @constructor FORGE.SceneViewportManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneViewportManager = function(viewer, scene)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneViewport#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene reference.
     * @name FORGE.SceneViewport#_scene
     * @type {FORGE.Scene}
     * @private
     */
    this._scene = scene;

    /**
     * Array of scene viewports.
     * @name FORGE.Scene#_viewports
     * @type {Array<FORGE.SceneViewport>}
     * @private
     */
    this._viewports = null;

    /**
     * Array of scene viewports for VR rendering.
     * @name FORGE.Scene#_vrViewports
     * @type {Array<FORGE.SceneViewport>}
     * @private
     */
    this._vrViewports = null;

    /**
     * Index of active viewport, where the controller is active.
     * @name FORGE.Scene#_active
     * @type {number}
     * @private
     */
    this._active = 0;

    /**
     * .
     * @name FORGE.Scene#_onActiveViewportChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onActiveViewportChange = null;

    FORGE.BaseObject.call(this, "SceneViewport");

    this._boot();
};

FORGE.SceneViewportManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneViewportManager.prototype.constructor = FORGE.SceneViewportManager;

/**
 * Boot sequence.
 * @private
 */
FORGE.SceneViewportManager.prototype._boot = function()
{
    // Parse config for screen rendering
    this._parseConfig(this._scene.config);

    // Prepare VR rendering
    this._setupVRViewports();

    // @todo enable this finally
//    this._viewer.controllers.onActivate.add(this._renewActiveViewport, this)
    this._viewer.canvas.pointer.onTap.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onDoubleTap.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPanStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPinchStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPressStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onRotateStart.add(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onWheel.add(this._renewActiveViewport, this);
};

/**
 * Parse config.
 * @private
 */
FORGE.SceneViewportManager.prototype._parseConfig = function(config)
{
    this._viewports = [];
    this._vrViewports = [];

    if (typeof config.layout === "undefined" || config.layout.length === 0)
    {
        var layoutConfig = {};

        layoutConfig.background = this._scene.background;
        layoutConfig.viewport = new FORGE.Rectangle(0, 0, 100, 100);

        var sceneCameraConfig = /** @type {CameraConfig} */ (this._scene.config.camera);
        var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
        layoutConfig.camera = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig));

        var sceneViewConfig = /** @type {ViewConfig} */ (this._scene.config.view);
        var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.mainConfig.view);
        layoutConfig.view = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(storyViewConfig, sceneViewConfig));

        layoutConfig.vr = false;

        // only on renderer with full viewport
        var viewport = new FORGE.SceneViewport(this._viewer, this._scene, layoutConfig);
        this._viewports.push(viewport);
    }
    else
    {
        for (var i=0, ii=config.layout.length; i<ii; i++)
        {
            var viewportConfig = config.layout[i];
            viewportConfig.vr = false;
            var viewport = new FORGE.SceneViewport(this._viewer, this._scene, viewportConfig);
            this._viewports.push(viewport);
        }        
    }
};

/**
 * Get the index of the scene viewport containing some point
 * @method FORGE.SceneViewportManager#_getSceneViewportIndexContainingPoint
 * @param {THREE.Vector2} point - point
 * @return {FORGE.SceneViewport} viewport containing the point (-1 if no viewport does)
 * @private
 */
FORGE.SceneViewportManager.prototype._getSceneViewportIndexContainingPoint = function(point)
{
    return this._viewports.findIndex(function(sceneViewport) {
        return sceneViewport.viewport.contains(point);
    });
};

/**
 * Renew active viewport if needed with pointer event.
 * @method FORGE.SceneViewportManager#_renewActiveViewport
 * @private
 */
FORGE.SceneViewportManager.prototype._renewActiveViewport = function(event)
{
    var px = event.data.clientX || event.data.center.x;
    var py = event.data.clientY || event.data.center.y;
    var point = new THREE.Vector2(px, this._viewer.height - py);
    var index = this._getSceneViewportIndexContainingPoint(point);
    if (index === -1)
    {
        return;
    }

    this._active = index;

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.dispatch();   
    }
};

/**
 * Setup VR viewports.
 * @private
 */
FORGE.SceneViewportManager.prototype._setupVRViewports = function(config)
{
    var vrLeftConfig = {
        viewport: new FORGE.Rectangle(0, 0, 50, 100),
        backround: this._scene.background,
        camera: undefined,
        view: undefined,
        vr: true
    };

    var viewportL = new FORGE.SceneViewport(this._viewer, this._scene, vrLeftConfig);
    this._vrViewports.push(viewportL);

    var vrRightConfig = {
        viewport: new FORGE.Rectangle(50, 0, 50, 100),
        backround: this._scene.background,
        camera: undefined,
        view: undefined,
        vr: true
    };

    var viewportR = new FORGE.SceneViewport(this._viewer, this._scene, vrRightConfig);
    this._vrViewports.push(viewportR);
};

/**
 * Render routine.
 * @method FORGE.SceneViewportManager#render
 */
FORGE.SceneViewportManager.prototype.render = function()
{
    var viewports = this._viewer.vr === true ? this._vrViewports : this._viewports;
    viewports.forEach(function(viewport) {
        viewport.render();
    });
};

/**
 * Get the relative mouse position inside the target element of a mouse event
 * @method FORGE.SceneViewportManager#getRelativeMousePosition
 * @param {THREE.Vector2} mouse - The mouse position in container space
 * @return {THREE.Vector2} relative mouse position in current viewport (null if out of bounds)
 */
FORGE.SceneViewportManager.prototype.getRelativeMousePosition = function(mouse)
{
    var index = this._getSceneViewportIndexContainingPoint(mouse);
    if (index === -1)
    {
        return null;
    }

    var viewport = this._viewports[index].viewport;
    return new THREE.Vector2(mouse.x - viewport.x, mouse.y - viewport.y);
};

/**
 * Destroy sequence.
 * @method FORGE.SceneViewportManager#destroy
 */
FORGE.SceneViewportManager.prototype.destroy = function(webGLRenderer, target)
{
    this._viewer.canvas.pointer.onTap.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onDoubleTap.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPanStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPinchStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onPressStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onRotateStart.remove(this._renewActiveViewport, this);
    this._viewer.canvas.pointer.onWheel.remove(this._renewActiveViewport, this);

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;        
    }

    this._viewports.forEach(function(viewport) {
        viewport.destroy();
    });
    this._viewports.length = 0;
    this._viewports = null;

    this._vrViewports.forEach(function(viewport) {
        viewport.destroy();
    });
    this._vrViewports.length = 0;
    this._vrViewports = null;

    this._viewer = null;
    this._scene = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the viewport list
 * @name  FORGE.SceneViewportManager#all
 * @readonly
 * @type {Array<FORGE.SceneViewport>}
 */
Object.defineProperty(FORGE.SceneViewportManager.prototype, "all",
{
    /** @this {FORGE.SceneViewportManager} */
    get: function()
    {
        return this._viewer.vr === true ? this._vrViewports : this._viewports;
    }
});

/**
 * Get the current active.
 * @name FORGE.SceneViewportManager#active
 * @type {FORGE.SceneViewport}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewportManager.prototype, "active",
{
    /** @this {FORGE.SceneViewportManager} */
    get: function()
    {
        return this._viewports[this._active];
    },

    /** @this {FORGE.SceneViewportManager} */
    set: function(value)
    {
        if (value < 0 || value >= this._viewports.length)
        {
            return;
        }

        this._active = value;

        if (this._onActiveViewportChange == true)
        {
            this._onActiveViewportChange.dispatch();
        }
    }
});

/**
 * Get the onActiveViewportChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.SceneViewportManager#onActiveViewportChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SceneViewportManager.prototype, "onActiveViewportChange",
{
    /** @this {FORGE.SceneViewportManager} */
    get: function()
    {
        if (this._onActiveViewportChange === null)
        {
            this._onActiveViewportChange = new FORGE.EventDispatcher(this);
        }

        return this._onActiveViewportChange;
    }
});

