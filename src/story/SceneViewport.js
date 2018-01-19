/**
 * viewport - part of a layout
 * @constructor FORGE.SceneViewport
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @param {!ViewportConfig} config scene layout config.
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneViewport = function(viewer, scene, config)
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
     * Input layout configuration to setup the viewport.
     * @name FORGE.SceneViewport#_config
     * @type {!SceneViewportConfig}
     * @private
     */
    this._config = config;

    /**
     * Viewport for this part of the layout.
     * @name FORGE.SceneViewport#_rectangle
     * @type {FORGE.Rectangle}
     * @private
     */
    this._rectangle = null;

    /**
     * Viewport background color
     * @name FORGE.SceneViewport#_background
     * @type {string}
     */
    this._background = "";

    /**
     * Viewport camera
     * @name FORGE.SceneViewport#_camera
     * @type {FORGE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * Viewport view manager
     * @name FORGE.SceneViewport#_viewManager
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
     * @name  FORGE.SceneViewport#_vr
     * @type {boolean}
     * @private
     */
    this._vr = false;

    /**
     * The scene renderer.
     * @name FORGE.SceneViewport#_viewportRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._viewportRenderer = null;

    FORGE.BaseObject.call(this, "SceneViewport");

    this._boot();
};

FORGE.SceneViewport.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneViewport.prototype.constructor = FORGE.SceneViewport;

/**
 * @name FORGE.SceneViewport.DEFAULT_CONFIG
 * @type {ViewportConfig}
 * @const
 */
FORGE.SceneViewport.DEFAULT_CONFIG =
{
    rectangle: new FORGE.Rectangle(0, 0, 100, 100),
    background: null,
    camera: null,
    view: null,
    vr: false,
};

/**
 * Boot sequence.
 * @method FORGE.SceneViewport#_boot
 * @private
 */
FORGE.SceneViewport.prototype._boot = function()
{
    var config = FORGE.Utils.extendMultipleObjects(FORGE.SceneViewport.DEFAULT_CONFIG, this._config);
    this._parseConfig(config);

    this._viewportRenderer = new FORGE.SceneRenderer(this._viewer, this);
};

/**
 * Parse viewport configuration.
 * @method FORGE.SceneViewport#_parseConfig
 * @private
 */
FORGE.SceneViewport.prototype._parseConfig = function(config)
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
    this._background = typeof viewportBG === "string" ? viewportBG : typeof sceneBG === "string" ? sceneBG : viewerBG;
    this._viewer.renderer.webGLRenderer.setClearColor(new THREE.Color(this._background));

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
 * @method FORGE.SceneViewport#_createCamera
 * @param {CameraConfig} config - The camera viewport configuration
 * @private
 */
FORGE.SceneViewport.prototype._createCamera = function(config)
{
    this._camera = new FORGE.Camera(this._viewer, this);

    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
    var sceneCameraConfig = /** @type {CameraConfig} */ (this._scene.config.camera);
    var viewportCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig, config));

    this._camera.load(viewportCameraConfig);
};

/**
 * Create view manager
 * @method FORGE.SceneViewport#_createViewManager
 * @param {ViewConfig} config - The view config
 * @private
 */
FORGE.SceneViewport.prototype._createViewManager = function(config)
{
    this._viewManager = new FORGE.ViewManager(this._viewer, this);

    var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.mainConfig.view);
    var sceneViewConfig = /** @type {ViewConfig} */ (this._scene.config.view);
    var viewportViewConfig = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(storyViewConfig, sceneViewConfig, config));

    this._viewManager.load(viewportViewConfig);
};

/**
 * @method FORGE.SceneViewport#updateRectangle
 */
FORGE.SceneViewport.prototype.updateRectangle = function()
{
    this._rectangle.w = (this._config.rectangle.width / 100) * this._viewer.width;
    this._rectangle.h = (this._config.rectangle.height / 100) * this._viewer.height;
    this._rectangle.x = (this._config.rectangle.x / 100) * this._viewer.width;
    this._rectangle.y = ((100 - this._config.rectangle.y) / 100) * this._viewer.height - this._rectangle.h;
};

/**
 * @method FORGE.SceneViewport#notifyMediaLoadComplete
 */
FORGE.SceneViewport.prototype.notifyMediaLoadComplete = function()
{
    this._viewportRenderer.notifyMediaLoadComplete();
};

/**
 * Render routine.
 * @method FORGE.SceneViewport#render
 * @param {THREE.WebGLRenderer} webGLRenderer
 */
FORGE.SceneViewport.prototype.render = function()
{
    this._camera.update();

    var target = this._scene.renderTarget;
    target.viewport.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissor.set(this._rectangle.x, this._rectangle.y, this._rectangle.width, this._rectangle.height);
    target.scissorTest = true ;

    this._viewportRenderer.render(target);
};

/**
 * Destroy sequence.
 * @method FORGE.SceneViewport#destroy
 */
FORGE.SceneViewport.prototype.destroy = function()
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
    this._scene = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the FX pipeline definition
 * @name  FORGE.SceneViewport#fx
 * @readonly
 * @type {Array<string>}
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "fx",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._fx;
    }
});

/**
 * Get and set the viewport rectangle.
 * @name FORGE.SceneViewport#rectangle
 * @type {FORGE.Rectangle}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "rectangle",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._rectangle;
    },

    /** @this {FORGE.SceneViewport} */
    set: function(value)
    {
        this._rectangle = value;
    }
});

/**
 * Get the viewport background color.
 * @name FORGE.SceneViewport#background
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "background",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._background;
    }
});

/**
 * Get the viewport camera.
 * @name FORGE.SceneViewport#camera
 * @type {FORGE.Camera}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "camera",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get the viewport view manager.
 * @name FORGE.SceneViewport#view
 * @type {FORGE.ViewManager}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "view",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._viewManager;
    }
});

/**
 * Get the viewport vr property. is this viewport is used for VR?
 * @name FORGE.SceneViewport#vr
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "vr",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._vr;
    }
});

/**
 * Get sceneRenderer.
 * @name FORGE.SceneViewport#renderer
 * @type {FORGE.SceneRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "renderer",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._viewportRenderer;
    }
});

/**
 * Get size of the viewport.
 * @name FORGE.SceneViewport#size
 * @type {FORGE.Size}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "size",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return new FORGE.Size(this._rectangle.width, this._rectangle.height);
    }
});

/**
 * Get scene.
 * @name FORGE.SceneViewport#scene
 * @type {FORGE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "scene",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._scene;
    }
});
