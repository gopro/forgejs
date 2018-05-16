/**
 * FORGE.BackgroundRenderer
 * BackgroundRenderer class.
 *
 * @constructor FORGE.BackgroundRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.Viewport} viewport - {@link FORGE.Viewport} reference.
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
     * @type {FORGE.Viewport}
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
     * Is the background is ready for render, this mean is the media is loaded ?
     * @name FORGE.BackgroundRenderer#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

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
    this._scene.onAfterRender = this._SceneAfterRender.bind(this);

    // Debug for the three.js inspector browser extension.
    if (FORGE.BackgroundRenderer.DEBUG === true)
    {
        window.scene = this._scene;
    }

    this._media = this._viewport.scene.media;

    this._camera = this._viewport.camera.main;
};

/**
 * Function called by WebGL Renderer once the scene ghas been renderer.
 * @method FORGE.BackgroundRenderer#_SceneAfterRender
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Scene} scene - rendered scene
 * @param {THREE.Camera} camera - camera used to render the scene
 * @private
 */
FORGE.BackgroundRenderer.prototype._SceneAfterRender = function(renderer, scene, camera)
{
    // Renderer has not submitted the frame to the VR headset yet
    // Turn off the vr flag to as we are rendering to a texture.
    // The screen renderer will be in charge of submitting the frame
    renderer.vr.enabled = false;
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundRenderer#render
 */
FORGE.BackgroundRenderer.prototype.render = function(target)
{
    if (this._ready === false)
    {
        return;
    }

    this._viewer.renderer.webGLRenderer.render(this._scene, this._camera, target, false);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundRenderer#destroy
 */
FORGE.BackgroundRenderer.prototype.destroy = function()
{
    this._ready = false;

    this._scene = null;
    this._media = null;
    this._camera = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get ready status.
 * @name FORGE.BackgroundRenderer#ready
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "ready",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._ready;
    }
});

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
 * Get background threejs camera.
 * @name FORGE.BackgroundRenderer#camera
 * @type {THREE.Camera}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "camera",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._camera;
    }
});