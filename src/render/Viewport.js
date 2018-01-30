/**
 * viewport - part of a layout
 * @constructor FORGE.Viewport
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @param {!ViewportConfig} config scene layout config.
 * @extends {FORGE.BaseObject}
 */
FORGE.Viewport = function(viewer, scene, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Viewport#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene reference.
     * @name FORGE.Viewport#_scene
     * @type {FORGE.Scene}
     * @private
     */
    this._scene = scene;

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
     * @type {Array<string>}
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
    this._config = FORGE.Utils.extendSimpleObject(FORGE.Viewport.DEFAULT_CONFIG, this._config);
    this._parseConfig(this._config);

    this._viewportRenderer = new FORGE.ViewportRenderer(this._viewer, this);
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
    var sceneBG = this._scene.background;
    var viewportBG = config.background;
    var background = typeof viewportBG === "string" ? viewportBG : typeof sceneBG === "string" ? sceneBG : viewerBG;
    this._background = new THREE.Color(background);

    this._createViewManager(config.view);

    this._createCamera(config.camera);

    //@ todo : find better for fx parse
    this._fx = [];

    if (typeof config.fx !== "undefined")
    {
        this._fx = config.fx;
    }
    else if (typeof this._scene.config.fx !== "undefined")
    {
        this._fx = this._scene.config.fx;
    }
    else if (typeof this._viewer.story.config.fx !== "undefined")
    {
        this._fx = this._viewer.story.config.fx;
    }
};

/**
 * Create and init a camera with info contained in the scene and story configurations
 * @method FORGE.Viewport#_createCamera
 * @param {CameraConfig} config - The camera viewport configuration
 * @private
 */
FORGE.Viewport.prototype._createCamera = function(config)
{
    this._camera = new FORGE.Camera(this._viewer, this);

    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
    var sceneCameraConfig = /** @type {CameraConfig} */ (this._scene.config.camera);
    var viewportCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig, config));

    this._camera.load(viewportCameraConfig);
};

/**
 * Create view manager
 * @method FORGE.Viewport#_createViewManager
 * @param {ViewConfig} config - The view config
 * @private
 */
FORGE.Viewport.prototype._createViewManager = function(config)
{
    this._viewManager = new FORGE.ViewManager(this._viewer, this);

    var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.mainConfig.view);
    var sceneViewConfig = /** @type {ViewConfig} */ (this._scene.config.view);
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
 * @param {THREE.WebGLRenderer} webGLRenderer
 */
FORGE.Viewport.prototype.render = function()
{
    this._camera.update();

    var target = this._scene.renderTarget;
    target.viewport.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissor.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissorTest = true ;

    this._viewer.renderer.webGLRenderer.setClearColor(this._background);
    this._viewer.renderer.webGLRenderer.clearTarget(target, true, false, false);
    this._viewportRenderer.render(target);
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
        this._camera = null;
    }

    if (this._viewManager !== null)
    {
        this._viewManager.destroy();
        this._viewManager = null;
    }

    this._fx = null;
    this._rectangle = null;
    this._background = null;
    this._scene = null;
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
        return this._scene;
    }
});
