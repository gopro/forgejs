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
     * Scene Renderer pool
     * @name FORGE.Renderer#_sceneRendererPool
     * @type {FORGE.SceneRendererPool}
     * @private
     */
    this._sceneRendererPool = null;

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
     * 3D scenes array
     * @name FORGE.Renderer#_scenes3D
     * @type {Array<FORGE.Scene3D>}
     * @private
     */
    this._scenes3D = null;

    /**
     * Scene hosting the camera gaze for VR pointing
     * @name FORGE.Renderer#_gazeScene
     * @type {FORGE.HUD}
     * @private
     */
    this._gazeScene = null;

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
    this._sceneRendererPool = new FORGE.SceneRendererPool(this._viewer);

    this._materialPool = new FORGE.ObjectMaterialPool();

    this._screenRenderer = new FORGE.ScreenRenderer(this._viewer);

    this._scenes3D = [];

    this._gazeScene = new FORGE.HUD(this._viewer);

    this._viewer.onConfigLoadComplete.add(this._onViewerConfigLoadComplete, this, 1000);

    this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);
};

/**
 * Scene load complete event handler
 * @method FORGE.Renderer#_sceneLoadCompleteHandler
 * @param {FORGE.Event} event - event
 * @private
 */
FORGE.Renderer.prototype._sceneLoadCompleteHandler = function(event)
{
    this._viewer.story.scene.onUnloadStart.add(this._sceneUnloadStartHandler, this);
    this._gazeScene.add(this._viewer.camera.gaze.object);
};

/**
 * Scene unload start event handler
 * @method FORGE.Renderer#_sceneUnloadStartHandler
 * @param {FORGE.Event} event - event
 * @private
 */
FORGE.Renderer.prototype._sceneUnloadStartHandler = function(event)
{
    this._viewer.scene.onUnloadStart.remove(this._sceneUnloadStartHandler, this);
    this._gazeScene.clear();
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

    // VR display mirroring (headset replicated on screen) is enabled when preserveDrawingBuffer is true
    // This means WebGL cannot swap its buffers but will always copy them, with a performance cost
    // This subject has been discussed, here is a link to prepare discussion about this setting
    // https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-the-effort
    // It may be the responsibility of the user to set in WebGL config in JSON definition
    options.preserveDrawingBuffer = false;

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
    this._viewer.raf.start(this._webGLRenderer);
};

/**
 * Render routine
 *
 * @method FORGE.Renderer#render
 */
FORGE.Renderer.prototype.render = function()
{
    this._sceneRendererPool.render();

    for (var i = 0; i<this._scenes3D.length; i++)
    {
        this._scenes3D[i].render();
    }

    if (this._viewer.vr)
    {
        this._gazeScene.render();
    }

    this._screenRenderer.render();
};

/**
 * Create and get a 3D scene
 * @method FORGE.Renderer#createScene3D
 * @param {Scene3DConfig} config - scene3D class name (Scene3D by default)
 * @return {FORGE.Scene3D} new scene
 */
FORGE.Renderer.prototype.createScene3D = function(config)
{
    var type = "Scene3D";
    if (typeof config !== "undefined")
    {
        type = typeof config.type === "string" && typeof FORGE[config.type] === "function" ? config.type : type;
    }

    var scene = new FORGE[type](this._viewer, config);
    this._scenes3D.push(scene);

    return scene;
};

/**
 * Remove and destroy a 3D scene
 * @method FORGE.Renderer#destroyScene3D
 * @param {FORGE.Scene} scene - scene
 * @return {boolean} true if scene has been found and destroyed, false otherwise
 */
FORGE.Renderer.prototype.destroyScene3D = function(scene)
{
    var idx = this._scenes3D.findIndex(function(element)
    {
        return scene.uid === element.uid;
    });

    if (idx === -1)
    {
        return false;
    }

    this._scenes3D.slice(idx, 1);
    scene.destroy();

    return true;
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
    this._viewer.story.onSceneLoadComplete.remove(this._sceneLoadCompleteHandler, this);
    this._viewer.story.scene.onUnloadStart.remove(this._sceneUnloadStartHandler, this);

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    while (this._scenes3D.length > 0)
    {
        this._scenes3D.pop().destroy();
    }
    this._scenes3D = null;

    this._gazeScene.destroy();
    this._gazeScene = null;

    this._webGLRenderer.dispose();
    this._webGLRenderer = null;

    this._screenRenderer.destroy();
    this._screenRenderer = null;

    this._sceneRendererPool.destroy();
    this._sceneRendererPool = null;

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
 * Get the 3D scene.
 * @name FORGE.Renderer#scene3D
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.Renderer.prototype, "scene3D",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._scene3D;
    }
});

/**
 * Get the HUD scene.
 * @name FORGE.Renderer#hud
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.Renderer.prototype, "hud",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._hud;
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
