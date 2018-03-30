/**
 * viewport - part of a layout
 * @constructor FORGE.Viewport
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.SceneRenderer} sceneRenderer {@link FORGE.SceneRenderer} reference.
 * @param {!ViewportConfig} config scene layout config.
 * @extends {FORGE.BaseObject}
 */
FORGE.Viewport = function(viewer, sceneRenderer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Viewport#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene renderer reference.
     * @name FORGE.Viewport#_sceneRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._sceneRenderer = sceneRenderer;

    /**
     * Input layout configuration to setup the viewport.
     * @name FORGE.Viewport#_config
     * @type {!ViewportConfig}
     * @private
     */
    this._config = config;

    /**
     * Viewport for this part of the layout.
     * @name FORGE.Viewport#_rectangle
     * @type {FORGE.Rectangle}
     * @private
     */
    this._rectangle = null;

    /**
     * Viewport background color
     * @name FORGE.Viewport#_background
     * @type {THREE.Color}
     * @private
     */
    this._background = null;

    /**
     * Viewport camera
     * @name FORGE.Viewport#_camera
     * @type {FORGE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * Viewport view manager
     * @name FORGE.Viewport#_viewManager
     * @type {FORGE.ViewManager}
     * @private
     */
    this._viewManager = null;

    /**
     * FX Pipeline definition
     * @name FORGE.Viewport#_fx
     * @type {Array<string>}
     * @private
     */
    this._fx = null;

    /**
     * Is this viewport is used for VR?
     * @name  FORGE.Viewport#_vr
     * @type {boolean}
     * @private
     */
    this._vr = false;

    /**
     * The scene renderer.
     * @name FORGE.Viewport#_viewportRenderer
     * @type {FORGE.ViewportRenderer}
     * @private
     */
    this._viewportRenderer = null;

    /**
     * Viewport ready flag.
     * @name FORGE.Viewport#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * On ready {@link FORGE.EventDispatcher}
     * @name FORGE.Viewport#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    FORGE.BaseObject.call(this, "Viewport");

    this._boot();
};

FORGE.Viewport.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Viewport.prototype.constructor = FORGE.Viewport;

/**
 * @name FORGE.Viewport.DEFAULT_CONFIG
 * @type {ViewportConfig}
 * @const
 */
FORGE.Viewport.DEFAULT_CONFIG =
{
    rectangle: new FORGE.Rectangle(0, 0, 100, 100),
    background: null,
    camera: null,
    view: null,
    vr: false,
};

/**
 * Boot sequence.
 * @method FORGE.Viewport#_boot
 * @private
 */
FORGE.Viewport.prototype._boot = function()
{
    this._onReady = new FORGE.EventDispatcher(this, true);

    this._config = FORGE.Utils.extendSimpleObject(FORGE.Viewport.DEFAULT_CONFIG, this._config);
    this._parseConfig(this._config);

    this._camera = new FORGE.Camera(this._viewer, this);
    this._loadCameraConfig(this._config.camera);

    this._viewManager = new FORGE.ViewManager(this._viewer, this);
    this._loadViewConfig(this._config.view);

    this._viewportRenderer = new FORGE.ViewportRenderer(this._viewer, this);

    this._ready = true;
    this._onReady.dispatch();
};

/**
 * Parse viewport configuration.
 * @method FORGE.Viewport#_parseConfig
 * @private
 */
FORGE.Viewport.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._register();

    var w = (config.rectangle.width / 100) * this._viewer.width;
    var h = (config.rectangle.height / 100) * this._viewer.height;
    var x = (config.rectangle.x / 100) * this._viewer.width;
    var y = ((100 - config.rectangle.y) / 100) * this._viewer.height - h;

    this._rectangle = new FORGE.Rectangle(x, y, w, h);

    var viewerBG = this._viewer.background;
    var sceneBG = this._sceneRenderer.scene.background;
    var viewportBG = config.background;
    var background = typeof viewportBG === "string" ? viewportBG : typeof sceneBG === "string" ? sceneBG : viewerBG;
    this._background = new THREE.Color(background);

    //@ todo : find better for fx parse (An fx manager that deals with configs would be cool)
    this._fx = [];

    if (typeof config.fx !== "undefined")
    {
        this._fx = config.fx;
    }
    else if (typeof this._sceneRenderer.scene.config.fx !== "undefined")
    {
        this._fx = this._sceneRenderer.scene.config.fx;
    }
    else if (typeof this._viewer.story.config.fx !== "undefined")
    {
        this._fx = this._viewer.story.config.fx;
    }
};

/**
 * Compute and load the camera configuration.
 * @method FORGE.Viewport#_loadCameraConfig
 * @param {CameraConfig} config - The camera viewport configuration
 * @private
 */
FORGE.Viewport.prototype._loadCameraConfig = function(config)
{
    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
    var sceneCameraConfig = /** @type {CameraConfig} */ (this._sceneRenderer.scene.config.camera);
    var viewportCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig, config));

    this._camera.load(viewportCameraConfig);
};

/**
 * Compute and load view configuration.
 * @method FORGE.Viewport#_createViewManager
 * @param {ViewConfig} config - The view config
 * @private
 */
FORGE.Viewport.prototype._loadViewConfig = function(config)
{
    var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.mainConfig.view);
    var sceneViewConfig = /** @type {ViewConfig} */ (this._sceneRenderer.scene.config.view);
    var viewportViewConfig = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(storyViewConfig, sceneViewConfig, config));

    this._viewManager.load(viewportViewConfig);
};

/**
 * @method FORGE.Viewport#updateRectangle
 */
FORGE.Viewport.prototype.updateRectangle = function()
{
    this._rectangle.w = (this._config.rectangle.width / 100) * this._viewer.width;
    this._rectangle.h = (this._config.rectangle.height / 100) * this._viewer.height;
    this._rectangle.x = (this._config.rectangle.x / 100) * this._viewer.width;
    this._rectangle.y = ((100 - this._config.rectangle.y) / 100) * this._viewer.height - this._rectangle.h;
};

/**
 * Render routine.
 * @method FORGE.Viewport#render
 * @param {FORGE.ObjectRenderer} objectRenderer - object renderer
 * @param {THREE.WebGLRenderTarget} target - render target
 */
FORGE.Viewport.prototype.render = function(objectRenderer, target)
{
    this._camera.update();

    target.viewport.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissor.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissorTest = true ;

    this._viewer.renderer.webGLRenderer.setClearColor(this._background);
    this._viewer.renderer.webGLRenderer.clearTarget(target, true, false, false);
    this._viewportRenderer.render(objectRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.Viewport#destroy
 */
FORGE.Viewport.prototype.destroy = function()
{
    if (this._viewportRenderer !== null)
    {
        this._viewportRenderer.destroy();
        this._viewportRenderer = null;
    }

    if (this._camera !== null)
    {
        this._camera.destroy();
        // Do not nullify the camera here!
    }

    if (this._viewManager !== null)
    {
        this._viewManager.destroy();
    }

    this._camera = null;
    this._viewManager = null;
    this._sceneRenderer = null;

    this._fx = null;
    this._rectangle = null;
    this._background = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the FX pipeline definition
 * @name  FORGE.Viewport#fx
 * @readonly
 * @type {Array<string>}
 */
Object.defineProperty(FORGE.Viewport.prototype, "fx",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._fx;
    }
});

/**
 * Get and set the viewport rectangle.
 * @name FORGE.Viewport#rectangle
 * @type {FORGE.Rectangle}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "rectangle",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._rectangle;
    },

    /** @this {FORGE.Viewport} */
    set: function(value)
    {
        this._rectangle = value;
    }
});

/**
 * @todo  remove this accessor !!!
 * Get the sceneRenderer
 * @name  FORGE.Viewport#sceneRenderer
 * @type {FORGE.SceneRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "sceneRenderer",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._sceneRenderer;
    }
});

/**
 * @todo  remove this accessor !!!
 * Get the viewport manager
 * @name  FORGE.Viewport#viewportManager
 * @type {FORGE.ViewportManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "viewportManager",
{
    /** @this {FORGE.ViewportManager} */
    get: function()
    {
        return this._sceneRenderer.viewports;
    }
});

/**
 * Get the viewport background color.
 * @name FORGE.Viewport#background
 * @type {THREE.Color}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "background",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._background;
    }
});

/**
 * Get the viewport camera.
 * @name FORGE.Viewport#camera
 * @type {FORGE.Camera}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "camera",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get the viewport view manager.
 * @name FORGE.Viewport#view
 * @type {FORGE.ViewManager}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "view",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._viewManager;
    }
});

/**
 * Get the viewport vr property. is this viewport is used for VR?
 * @name FORGE.Viewport#vr
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "vr",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._vr;
    }
});

/**
 * Get sceneRenderer.
 * @name FORGE.Viewport#renderer
 * @type {FORGE.ViewportRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "renderer",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._viewportRenderer;
    }
});

/**
 * Get size of the viewport.
 * @name FORGE.Viewport#size
 * @type {FORGE.Size}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "size",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return new FORGE.Size(this._rectangle.width, this._rectangle.height);
    }
});

/**
 * Get scene.
 * @name FORGE.Viewport#scene
 * @type {FORGE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.Viewport.prototype, "scene",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        return this._sceneRenderer.scene;
    }
});

/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of this viewport.
 * @name FORGE.Viewport#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Viewport.prototype, "onReady",
{
    /** @this {FORGE.Viewport} */
    get: function()
    {
        // No lazy here
        return this._onReady;
    }
});
