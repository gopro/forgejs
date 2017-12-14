/**
 * SceneRenderer class.
 *
 * @constructor FORGE.SceneRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {FORGE.Scene} scene - scene object
 * @param {FORGE.SceneViewport} sceneViewport - sceneViewport parent object
 * @param {SceneViewConfig} viewConfig - view configuration
 * @param {SceneCameraConfig} cameraConfig - camera configuration
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.SceneRenderer = function(viewer, scene, sceneViewport, viewConfig, cameraConfig)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene object.
     * @name FORGE.SceneRenderer#_scene
     * @type {FORGE.Scene}
     * @private
     */
    this._scene = scene;

    /**
     * The scene viewport parent object.
     * @name FORGE.SceneRenderer#_sceneViewport
     * @type {FORGE.SceneViewport}
     * @private
     */
    this._sceneViewport = sceneViewport;

    /**
     * The view configuration.
     * @name FORGE.SceneRenderer#_viewConfig
     * @type {SceneViewConfig}
     * @private
     */
    this._viewConfig = viewConfig;

    /**
     * The camera configuration.
     * @name FORGE.SceneRenderer#_cameraConfig
     * @type {SceneCameraConfig}
     * @private
     */
    this._cameraConfig = cameraConfig;

    /**
     * Background renderer.
     * @name FORGE.SceneRenderer#_backgroundRenderer
     * @type {FORGE.BackgroundRenderer}
     * @private
     */
    this._backgroundRenderer = null;

    /**
     * Object renderer.
     * @name FORGE.SceneRenderer#_objectRenderer
     * @type {FORGE.ObjectRenderer}
     * @private
     */
    this._objectRenderer = null;
    
    /**
     * Camera.
     * @name FORGE.SceneRenderer#_camera
     * @type {FORGE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * View manager.
     * @name FORGE.SceneRenderer#_viewManager
     * @type {FORGE.ViewManager}
     * @private
     */
    this._viewManager = null;

    FORGE.BaseObject.call(this, "SceneRenderer");

    this._boot();
};

FORGE.SceneRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneRenderer.prototype.constructor = FORGE.SceneRenderer;


/**
 * Boot sequence.
 * @method FORGE.SceneRenderer#_boot
 * @private
 */
FORGE.SceneRenderer.prototype._boot = function()
{
    if (this._scene.media === null) {
        this.warn("Scene has no media. This should not happen.");
        return;
    }

    this._viewManager = new FORGE.ViewManager(this._viewer, this);
    this._viewManager.type = typeof this._viewConfig.type !== "undefined" ? this._viewConfig.type : "rectilinear";

    this._createCamera();

    this._createObjectRenderer();

    this._scene.media.onLoadComplete.addOnce(this._createBackgroundRenderer, this);
};

/**
 * Create and init a camera with info contained in the scene and story configurations
 * @method FORGE.SceneRenderer#_createCamera
 * @private
 */
FORGE.SceneRenderer.prototype._createCamera = function()
{
    this._camera = new FORGE.Camera(this._viewer, this);

    var sceneCameraConfig = /** @type {CameraConfig} */ (this._scene.config.camera);
    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
    var sceneOverStoryCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig));
    var cameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(sceneOverStoryCameraConfig, this._cameraConfig));

    this._camera.load(cameraConfig);
};

/**
 * Create object renderer.
 * @method FORGE.SceneRenderer#_createObjectRenderer
 * @private
 */
FORGE.SceneRenderer.prototype._createObjectRenderer = function()
{
    this._objectRenderer = new FORGE.ObjectRenderer(this._viewer);
};

/**
 * Create background renderer.
 *
 * Background renderer choice policy is based on media type and format
 *
 * - Media type grid: grid renderer
 * 
 * - Type is image and source has some defined levels: pyramid renderer (multiresolution)

 * - Source format is equirectangular: shader renderer
 *   we should also use a mesh renderer and map the equirectangular texture on a sphere geometry
 *   this could be a good fallback on devices with cheap GPU where fragment shader rendering is top heavy
 *
 * - Source format is flat: plane renderer
 * 
 * - Source format is cube: mesh renderer
 * 
 * @method FORGE.SceneRenderer#_createBackgroundRenderer
 * @private
 */
FORGE.SceneRenderer.prototype._createBackgroundRenderer = function(event)
{
    var media = event.emitter;
    var mediaConfig = this._scene.config.media;

    var backgroundRendererRef;

    if (typeof mediaConfig === "undefined")
    {
        backgroundRendererRef = FORGE.BackgroundRenderer;
    }
    else 
    {
        var sourceConfig = mediaConfig.source;
        
        if (mediaConfig.type === FORGE.MediaType.GRID)
        {
            backgroundRendererRef = FORGE.BackgroundGridRenderer;
        }

        // Multi resolution is checked before other meshes as it is a special case of cube format
        else if (typeof sourceConfig.levels !== "undefined" && mediaConfig.type === FORGE.MediaType.IMAGE)
        {
            backgroundRendererRef = FORGE.BackgroundPyramidRenderer;
        }

        else if (sourceConfig.format === FORGE.MediaFormat.EQUIRECTANGULAR)
        {
            // Background shader or mesh with sphere geometry
            // Default choice: using a shader renderer allows spherical transitions between scenes
            // Performance fallback: mesh renderer
            backgroundRendererRef = FORGE.BackgroundShaderRenderer;
        }

        // Flat media format (beware: flat view is another thing)
        else if (sourceConfig.format === FORGE.MediaFormat.FLAT)
        {
            backgroundRendererRef = FORGE.BackgroundPlaneRenderer;
        }

        // Cube: mesh with cube geometry
        // Todo: add cube texel picking in shader to allow shader renderer usage and support spherical transitions
        else if (sourceConfig.format === FORGE.MediaFormat.CUBE)
        {
            backgroundRendererRef = FORGE.BackgroundCubeRenderer;
        }

        // No media
        else
        {
            backgroundRendererRef = FORGE.BackgroundRenderer;
        }
    }

    this._backgroundRenderer = new backgroundRendererRef(this, mediaConfig);
};

/**
 * Set view.
 * @method FORGE.SceneRenderer#setView
 * @param {string|SceneViewConfig} config - new view configuration
 */
FORGE.SceneRenderer.prototype.setView = function(config)
{
    if (typeof config === "string")
    {
        this._viewManager.type = config;
    }

    else if (typeof config === "object")
    {
        this._viewManager.load(config);
    }

    else
    {
        this.warning("Set view with unknown configuration type (" + typeof config + ")");
        return;
    }
};

/**
 * Render routine.
 * @method FORGE.SceneRenderer#render
 * @param {THREE.WebGLRenderer} webGLRenderer
 * @param {THREE.WebGLRenderTarget} target
 */
FORGE.SceneRenderer.prototype.render = function(webGLRenderer, target)
{
    if (this._backgroundRenderer === null)
    {
        return;
    }

    this._backgroundRenderer.render(webGLRenderer, target);
    
    // This is pure nonsense !! RenderPipeline renders all render passes...
    // The object renderer should have done its job before to prepare the textures
    // this._objectRenderer.render();
    
    // Get background and foreground textures and call pipeline render routine
    // this._pipeline.render();
};


/**
 * Destroy sequence.
 * @method FORGE.SceneRenderer#destroy
 */
FORGE.SceneRenderer.prototype.destroy = function()
{
    this._config = null;
    this._viewer = null;

    if (this._viewManager !== null)
    {
        this._viewManager.destroy();
        this._viewManager = null;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.destroy();
        this._backgroundRenderer = null;
    }

    if (this._objectRenderer !== null)
    {
        this._objectRenderer.destroy();
        this._objectRenderer = null;
    }
};

/**
 * Get the background renderer.
 * @name FORGE.SceneRenderer#backgroundRenderer
 * @type {FORGE.BackgroundRenderer}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "backgroundRenderer",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._backgroundRenderer;
    }
});

/**
 * Get the camera.
 * @name FORGE.SceneRenderer#camera
 * @type {FORGE.cameraManager}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "camera",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get the view manager.
 * @name FORGE.SceneRenderer#view
 * @type {FORGE.ViewManager}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "view",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._viewManager;
    }
});

/**
 * Get the scene media.
 * @name FORGE.SceneRenderer#media
 * @type {FORGE.Media}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "media",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._sceneViewport.scene.media;
    }
});

/**
 * Get the background color of the scene (null if not defined).
 * @name FORGE.SceneRenderer#background
 * @type {string}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "background",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._sceneViewport.scene.background;
    }
});

/**
 * Get the display viewport.
 * @name FORGE.SceneRenderer#viewport
 * @type {FORGE.Rectangle}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "viewport",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._sceneViewport.viewport;
    }
});
