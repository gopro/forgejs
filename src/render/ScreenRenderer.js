/**
 * ScreenRenderer class.
 *
 * @constructor FORGE.ScreenRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenRenderer = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.ScreenRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * THREE Scene to render the final screen result
     * @name  FORGE.ScreenRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * THREE OrthographicCamera used to render the final screen result
     * @name  FORGE.ScreenRenderer#_camera
     * @type {THREE.OrthographicCamera}
     * @private
     */
    this._camera = null;

    /**
     * THREE Mesh used to render the final screen result
     * @name  FORGE.ScreenRenderer#_quad
     * @type {THREE.Mesh}
     * @private
     */
    this._quad = null;

    /**
     * The screen material reference
     * @name  FORGE.ScreenRenderer#_material
     * @type {FORGE.ScreenMaterial}
     * @private
     */
    this._material = null;

    FORGE.BaseObject.call(this, "ScreenRenderer");

    this._boot();
};

FORGE.ScreenRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ScreenRenderer.prototype.constructor = FORGE.ScreenRenderer;

/**
 * Boot sequence.
 * @method FORGE.ScreenRenderer#_boot
 * @private
 */
FORGE.ScreenRenderer.prototype._boot = function()
{
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this._scene = new THREE.Scene();

    this._material = new FORGE.ScreenMaterial();

    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    var material = this._material.shaderMaterial;
    this._quad = new THREE.Mesh(geometry, material);

    this._scene.add(this._quad);
};

/**
 * Render routine.
 * @method FORGE.ScreenRenderer#render
 */
FORGE.ScreenRenderer.prototype.render = function()
{
    // pouet
};

/**
 * Destroy sequence.
 * @method FORGE.ScreenRenderer#destroy
 */
FORGE.ScreenRenderer.prototype.destroy = function()
{
    if (this._quad !== null)
    {
        if (this._quad.geometry !== null)
        {
            this._quad.geometry.dispose();
            this._quad.geometry = null;
        }
    }

    if (this._scene !== null)
    {
        this._scene.children = 0;
        this._scene = null;
    }

    if (this._camera !== null)
    {
        this._camera = null;
    }

    if (this._material !== null)
    {
        this._material.destroy();
        this._material = null;
    }

    this._viewer = null;
};

/**
 * Get the 3D scene reference.
 * @name FORGE.ScreenRenderer#scene
 * @type {THREE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenRenderer.prototype, "scene",
{
    /** @this {FORGE.ScreenRenderer} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get the orthographic camera reference.
 * @name FORGE.ScreenRenderer#camera
 * @type {THREE.OrthographicCamera}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenRenderer.prototype, "camera",
{
    /** @this {FORGE.ScreenRenderer} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get the screen material reference.
 * @name FORGE.ScreenRenderer#material
 * @type {FORGE.ScreenMaterial}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenRenderer.prototype, "material",
{
    /** @this {FORGE.ScreenRenderer} */
    get: function()
    {
        return this._material;
    }
});

