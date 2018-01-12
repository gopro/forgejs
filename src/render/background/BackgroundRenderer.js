/**
 * FORGE.BackgroundRenderer
 * BackgroundRenderer class.
 *
 * @constructor FORGE.BackgroundRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneViewport} viewport - {@link FORGE.SceneViewport} reference.
 * @param {string=} className - The className of the object as long as many other object inherits from this one.
 * @extends {FORGE.BaseObject}
 */
FORGE.BackgroundRenderer = function(viewer, viewport, className)
{
    /**
     * The viewer reference.
     * @name FORGE.BackgroundRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The viewport reference.
     * @name FORGE.BackgroundRenderer#_viewport
     * @type {FORGE.SceneViewport}
     * @private
     */
    this._viewport = viewport;

    /**
     * @name FORGE.BackgroundRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

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

    FORGE.BaseObject.call(this, className || "BackgroundRenderer");

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
    this._scene.name = "BackgroundRenderer";

    // Debug for the three.js inspector browser extension.
    if (FORGE.BackgroundRenderer.DEBUG === true)
    {
        window.scene = this._scene;
    }

    this._media = this._viewport.scene.media;

    this._camera = this._viewport.camera.main;

    this._frustum = new THREE.Frustum();
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
    return typeof this._scene.getObjectByName(object.name) !== "undefined";
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundRenderer#render
 */
FORGE.BackgroundRenderer.prototype.render = function(target)
{
    this._frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this._camera.projectionMatrix, this._camera.matrixWorldInverse ) );

    this._viewer.renderer.webGLRenderer.render(this._scene, this._camera, target, false);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundRenderer#destroy
 */
FORGE.BackgroundRenderer.prototype.destroy = function()
{
    this._scene = null;
    this._media = null;
    this._camera = null;
    this._frustum = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get background threejs scene.
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
 * Get camera threejs frustum.
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
