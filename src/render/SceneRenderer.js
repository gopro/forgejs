/**
 * SceneRenderer class.
 *
 * The scene renderer object collects objects needed to a render a scene
 *
 * @constructor FORGE.SceneRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {FORGE.UID} sceneUID - scene unique identifier
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneRenderer = function(viewer, sceneUID)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene UID.
     * @name FORGE.SceneRenderer#_sceneUID
     * @type {string}
     * @private
     */
    this._sceneUID = sceneUID;

    /**
     * The viewport manager reference.
     * @name FORGE.SceneRenderer#_viewportManager
     * @type {FORGE.ViewportManager}
     * @private
     */
    this._viewportManager = null;

    /**
     * The object renderer reference.
     * @name FORGE.SceneRenderer#_objectRenderer
     * @type {FORGE.ObjectRenderer}
     * @private
     */
    this._objectRenderer = null;

    /**
     * The render target.
     * @name FORGE.SceneRenderer#_renderTarget
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTarget = null;

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
    if (FORGE.UID.isTypeOf(this._sceneUID, "Scene") === false)
    {
        this.warn("Cannot get scene reference.");
        return;
    }

    var rtParams =
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true,
        stencilBuffer: false
    };

    this._renderTarget = new THREE.WebGLRenderTarget(this._viewer.width, this._viewer.height, rtParams);
    this._renderTarget.name = "SceneRenderer-" + this.scene.name;

    this._viewportManager = new FORGE.ViewportManager(this._viewer, this);

    this._objectRenderer = new FORGE.ObjectRenderer(this._viewer, this);
};

/**
 * Render routine.
 * @method FORGE.SceneRenderer#render
 */
FORGE.SceneRenderer.prototype.render = function()
{
    this._viewportManager.render(this._objectRenderer, this._renderTarget);
};

/**
 * Destroy sequence.
 * @method FORGE.SceneRenderer#destroy
 */
FORGE.SceneRenderer.prototype.destroy = function()
{
    if (this._renderTarget !== null)
    {
        this._renderTarget.dispose();
        this._renderTarget = null;
    }

    this._viewportManager.destroy();
    this._viewportManager = null;

    this._objectRenderer.destroy();
    this._objectRenderer = null;

    this._viewer = null;
};

/**
 * Get the scene reference.
 * @name FORGE.SceneRenderer#scene
 * @type {FORGE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "scene",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return FORGE.UID.get(this._sceneUID);
    }
});

/**
 * Get the render target.
 * @name FORGE.SceneRenderer#target
 * @type {THREE.WebGLRenderTarget}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "target",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._renderTarget;
    }
});

/**
 * Get the render target's texture.
 * @name FORGE.SceneRenderer#texture
 * @type {THREE.Texture}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "texture",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._renderTarget.texture;
    }
});

/**
 * Get the viewport manager.
 * @name FORGE.SceneRenderer#viewports
 * @type {FORGE.ViewportManager}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "viewports",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._viewportManager;
    }
});

/**
 * Get the object renderer.
 * @name FORGE.SceneRenderer#objectRenderer
 * @type {FORGE.ObjectRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "objectRenderer",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._objectRenderer;
    }
});

