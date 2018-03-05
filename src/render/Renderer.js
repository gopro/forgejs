/**
 * Renderer class.
 *
 * @constructor FORGE.Renderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.Renderer = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Renderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * WebGL renderer reference
     * @name FORGE.Renderer#_webGLRenderer
     * @type {THREE.WebGLRenderer}
     * @private
     */
    this._webGLRenderer = null;

    /**
     * Screen renderer
     * @name FORGE.Renderer#_screenRenderer
     * @type {FORGE.ScreenRenderer}
     * @private
     */
    this._screenRenderer = null;

    /**
     * Material pool
     * @name FORGE.Renderer#_materialPool
     * @type {FORGE.ObjectMaterialPool}
     * @private
     */
    this._materialPool = null;

    /**
     * Scene Loader.
     * @name FORGE.Renderer#_sceneLoader
     * @type {FORGE.SceneLoader}
     * @private
     */
    this._sceneLoader = null;

    /**
     * Scene Renderer pool
     * @name FORGE.Renderer#_sceneRendererPool
     * @type {FORGE.SceneRendererPool}
     * @private
     */
    this._sceneRendererPool = null;

    /**
     * Active viewport has changed
     * @name FORGE.Renderer#_onActiveViewportChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onActiveViewportChange = null;

    FORGE.BaseObject.call(this, "Renderer");

    this._boot();
};

FORGE.Renderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Renderer.prototype.constructor = FORGE.Renderer;

/**
 * Renderer constant near depth
 * @type {number}
 */
FORGE.Renderer.DEPTH_NEAR = 0.01;

/**
 * Renderer constant far depth
 * @type {number}
 */
FORGE.Renderer.DEPTH_FAR = 10000;

/**
 * Boot sequence.
 * @method FORGE.Renderer#_boot
 * @private
 */
FORGE.Renderer.prototype._boot = function()
{
    this._sceneLoader = new FORGE.SceneLoader(this._viewer);

    this._sceneRendererPool = new FORGE.SceneRendererPool(this._viewer);

    this._materialPool = new FORGE.ObjectMaterialPool();

    this._screenRenderer = new FORGE.ScreenRenderer(this._viewer);

    this._viewer.onConfigLoadComplete.add(this._onViewerConfigLoadComplete, this, 1000);
};

/**
 * Viewer ready handler
 * @method FORGE.Renderer#_onViewerConfigLoadComplete
 * @private
 */
FORGE.Renderer.prototype._onViewerConfigLoadComplete = function()
{
    var canvas = this._viewer.canvas.dom;

    var options = this._viewer.config.webgl;
    options.canvas = canvas;
    options.antialias = true;

    // WebGLRenderer will draw any component supported by WebGL
    try
    {
        this._webGLRenderer = new THREE.WebGLRenderer(options);
    }
    catch (error)
    {
        this.destroy();
        return;
    }

    this._webGLRenderer.autoClear = false;
};

/**
 * Render routine
 *
 * @method FORGE.Renderer#render
 */
FORGE.Renderer.prototype.render = function()
{
    this._sceneRendererPool.render();

    var ratio = this._sceneLoader.transition.time;
    this._screenRenderer.material.mixRatio = ratio;

    if(this._viewer.story.sceneUid !== "")
    {
        var renderer = this._sceneRendererPool.get(this._viewer.story.sceneUid);

        if(typeof renderer !== "undefined")
        {
            this._screenRenderer.material.textureOne = renderer.texture;
        }
    }

    if(this._viewer.story.loadingSceneUid !== "")
    {
        var loadingRenderer = this._sceneRendererPool.get(this._viewer.story.loadingSceneUid);

        if(typeof loadingRenderer !== "undefined")
        {
            this._screenRenderer.material.textureTwo = loadingRenderer.texture;
        }
    }

    this._screenRenderer.material.resolution.x = this._viewer.width;
    this._screenRenderer.material.resolution.y = this._viewer.height;

    this._webGLRenderer.setViewport(0, 0, this._viewer.width, this._viewer.height);

    this._webGLRenderer.render(this._screenRenderer.scene, this._screenRenderer.camera);
};

/**
 * Notify the active viewport has changed
 * @method FORGE.Renderer#notifyActiveViewportChange
 */
FORGE.Renderer.prototype.notifyActiveViewportChange = function()
{
    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.dispatch();
    }
};

/**
 * Renderer destroy sequence
 * @method FORGE.Renderer#destroy
 */
FORGE.Renderer.prototype.destroy = function()
{
    this._viewer.onConfigLoadComplete.remove(this._onViewerConfigLoadComplete, this);

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    this._webGLRenderer.dispose();
    this._webGLRenderer = null;

    this._screenRenderer.destroy();
    this._screenRenderer = null;

    this._sceneRendererPool.destroy();
    this._sceneRendererPool = null;

    this._sceneLoader.destroy();
    this._sceneLoader = null;

    this._materialPool.detroy();
    this._materialPool = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the WebGL renderer.
 * @name FORGE.Renderer#webGLRenderer
 * @type {THREE.WebGLRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "webGLRenderer",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._webGLRenderer;
    }
});

/**
 * Get the screen renderer.
 * @name FORGE.Renderer#screen
 * @type {FORGE.ScreenRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "screen",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._screenRenderer;
    }
});

/**
 * Get the scene renderer pool
 * @name FORGE.Renderer#scenes
 * @type {FORGE.SceneRendererPool}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "scenes",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._sceneRendererPool;
    }
});

/**
 * Get the material pool reference.
 * @name FORGE.Renderer#materials
 * @type {FORGE.ObjectMaterialPool}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "materials",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._materialPool;
    }
});

/**
 * Get the scene loader reference.
 * @name FORGE.Renderer#loader
 * @type {FORGE.SceneLoader}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "loader",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._sceneLoader;
    }
});

/**
 * Get the loading flag.
 * @name FORGE.Renderer#loading
 * @type {FORGE.SceneLoader}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "loading",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._sceneLoader.loading;
    }
});

/**
 * Get and set VR status.
 * @name FORGE.Renderer#vr
 * @type {boolean}
 */
Object.defineProperty(FORGE.Renderer.prototype, "vr",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._webGLRenderer.vr.enabled;
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        this._webGLRenderer.vr.enabled = value;
    }
});

/**
 * Get the active viewport
 * @name FORGE.Renderer#activeViewport
 * @type {FORGE.Viewport}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "activeViewport",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._sceneRendererPool.activeViewport;
    }
});

/**
 * Get the onActiveViewportChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.Renderer#onActiveViewportChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Renderer.prototype, "onActiveViewportChange",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        if (this._onActiveViewportChange === null)
        {
            this._onActiveViewportChange = new FORGE.EventDispatcher(this);
        }

        return this._onActiveViewportChange;
    }
});
