/**
 * FORGE.BackgroundRenderer
 * BackgroundRenderer class.
 *
 * @constructor FORGE.BackgroundRenderer
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 * @param {string=} type - The type of the object as long as many other object inherits from this one.
 * @extends {FORGE.BaseObject}
 */
FORGE.BackgroundRenderer = function(sceneRenderer, type)
{
    /**
     * The scene renderer reference.
     * @name FORGE.BackgroundRenderer#_sceneRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._sceneRenderer = sceneRenderer;

    /**
     * Scene media config
     * @name FORGE.BackgroundRenderer#_config
     * @type {?SceneMediaConfig}
     * @private
     */
    this._config = this._sceneRenderer.media.config;

    /**
     * Background rendering media object
     * @name FORGE.BackgroundRenderer#_media
     * @type {FORGE.Media}
     * @private
     */
    this._media = null;

    /**
     * THREE camera object
     * It can be some perspective or orthographic camera depending on the renderer type
     * @name FORGE.BackgroundRenderer#_camera
     * @type {THREE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * @name FORGE.BackgroundRenderer#_frustum
     * @type {THREE.Frustum}
     * @private
     */
    this._frustum = null;

    /**
     * @name FORGE.BackgroundRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * Media type (image, video, grid)
     * Default: grid
     * @type {string}
     * @private
     */
    this._mediaType = FORGE.MediaType.GRID;

    /**
     * Media format (cubemap, equirectangular, flat)
     * Default: equirectangular
     * @type {string}
     * @private
     */
    this._mediaFormat = FORGE.MediaFormat.EQUIRECTANGULAR;

    FORGE.BaseObject.call(this, type || "BackgroundRenderer");

    this._boot();
};

FORGE.BackgroundRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.BackgroundRenderer.prototype.constructor = FORGE.BackgroundRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundRenderer#_boot
 * @private
 */
FORGE.BackgroundRenderer.prototype._boot = function()
{
    this._scene = new THREE.Scene();
    this._scene.name = "Background scene";

    if (FORGE.BackgroundRenderer.DEBUG === true)
    {
        window.scene = this._scene;
    }

    this._camera = this._sceneRenderer.camera.main;

    this._frustum = new THREE.Frustum();

    this._media = this._sceneRenderer.media;

    if (typeof this._config !== "undefined")
    {
        // Override default value with config
        if (typeof this._config.type !== "undefined")
        {
            this._mediaType = this._config.type;
        }

        if (typeof this._config.source !== "undefined" && typeof this._config.source.format !== "undefined")
        {
            this._mediaFormat = this._config.source.format;
        }
    }
};

/**
 * Get the scene renderer resolution.
 * @method FORGE.BackgroundRenderer#_getResolution
 * @private
 */
FORGE.BackgroundRenderer.prototype._getViewport = function()
{
    return this._sceneRenderer.viewport;
};

/**
 * Check if some 3D object is interesecting the rendering frustum.
 * @method FORGE.BackgroundRenderer#isObjectInFrustum
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.BackgroundRenderer.prototype.isObjectInFrustum = function(object)
{
    return this._frustum.intersectsObject(object);
};

/**
 * Check if some 3D object is in the scene
 * @method FORGE.BackgroundRenderer#isObjectInScene
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.BackgroundRenderer.prototype.isObjectInScene = function(object)
{
    return this._scene.getObjectByName(object.name) !== undefined;
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderer} webGLRenderer THREE WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundRenderer#render
 */
FORGE.BackgroundRenderer.prototype.render = function(webGLRenderer, target)
{
    if (typeof this._mesh !== "undefined")
    {
        // Update common shader material parameters
        var uniforms = this._mesh.material.uniforms;

        if ("tViewport" in uniforms)
        {
            uniforms.tViewport.value = this._getViewport().asVector;
        }

        if ("tViewportRatio" in uniforms)
        {
            uniforms.tViewportRatio.value = this._getViewport().size.ratio;
        }

        if ("tModelViewMatrixInverse" in uniforms)
        {
            uniforms.tModelViewMatrixInverse.value = this._sceneRenderer.camera.modelViewInverse;
        }

        this._sceneRenderer.view.current.updateUniforms(uniforms);
    }

    this._frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this._camera.projectionMatrix, this._camera.matrixWorldInverse ) );

    webGLRenderer.render(this._scene, this._camera, target, false);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundRenderer#destroy
 */
FORGE.BackgroundRenderer.prototype.destroy = function()
{
    if (this._renderTarget !== null)
    {
        this._renderTarget.dispose();
        this._renderTarget = null;
    }

    this._scene = null;
    this._camera = null;
    this._frustum = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get background scene.
 * @name FORGE.BackgroundRenderer#scene
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "scene",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get camera frustum.
 * @name FORGE.BackgroundRenderer#frustum
 * @type {THREE.Frustum}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "frustum",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._frustum;
    }
});
