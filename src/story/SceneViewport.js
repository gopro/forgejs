/**
 * Scene viewport - part of a layout
 * @constructor FORGE.SceneViewport
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @param {!SceneViewportConfig} config scene layout config.
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
     * @name FORGE.SceneViewport#_viewport
     * @type {FORGE.Rectangle}
     * @private
     */
    this._viewport = null;

    /**
     * The scene renderer.
     * @name FORGE.SceneViewport#_sceneRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._sceneRenderer = null;

    FORGE.BaseObject.call(this, "SceneViewport");

    this._boot();
};

FORGE.SceneViewport.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneViewport.prototype.constructor = FORGE.SceneViewport;

/**
 * Boot sequence.
 * @method FORGE.SceneRenderer#_boot
 * @private
 */
FORGE.SceneViewport.prototype._boot = function()
{   
    var w = (this._config.viewport.width / 100) * this._viewer.width;
    var h = (this._config.viewport.height / 100) * this._viewer.height;
    var x = (this._config.viewport.x / 100) * this._viewer.width;
    var y = ((100 - this._config.viewport.y) / 100) * this._viewer.height - h;

    this._viewport = new FORGE.Rectangle(x, y, w, h);
    this._sceneRenderer = new FORGE.SceneRenderer(this._viewer, this._scene, this);
};

/**
 * Update viewport.
 * @method FORGE.SceneRenderer#updateWithRect
 * @param {FORGE.Rectangle} viewport - new viewport
 */
FORGE.SceneViewport.prototype.updateWithRect = function(viewport)
{
    this._viewport = viewport;
};

/**
 * Render routine.
 * @method FORGE.SceneRenderer#render
 * @param {THREE.WebGLRenderer} webGLRenderer
 * @param {THREE.WebGLRenderTarget} target
 */
FORGE.SceneViewport.prototype.render = function(webGLRenderer, target)
{   
    if (typeof target !== "undefined" && target !== null)
    {
        target.viewport.set(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height);
        target.scissor.set( this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height);
        target.scissorTest = true ;
    }

    if (typeof this._config.background !== undefined)
    {
        webGLRenderer.setClearColor(new THREE.Color(this._config.background));
    }

    this._sceneRenderer.render(webGLRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.SceneRenderer#destroy
 */
FORGE.SceneViewport.prototype.destroy = function()
{
    if (this._sceneRenderer !== null)
    {
        this._sceneRenderer.destroy();
        this._sceneRenderer = null;        
    }

    this._viewport = null;
    this._scene = null;
    this._viewer = null;
};

/**
 * Get config.
 * @name FORGE.SceneViewport#config
 * @type {SceneViewportConfig}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "config",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Get camera.
 * @name FORGE.SceneViewport#camera
 * @type {FORGE.Camera}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "camera",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._sceneRenderer.camera;
    }
});

/**
 * Get viewport.
 * @name FORGE.SceneViewport#viewport
 * @type {FORGE.Rectangle}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewport.prototype, "viewport",
{
    /** @this {FORGE.SceneViewport} */
    get: function()
    {
        return this._viewport;
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
