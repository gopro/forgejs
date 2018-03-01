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

    /**
     * Ready flag.
     * @name  FORGE.ScreenRenderer#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

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
    this._quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2));

    this._scene.add(this._quad);

    this.material = new FORGE.ScreenMaterial(this._viewer);
};

/**
 * Material ready handler.
 * When material is ready, create the quad and add it to the scene.
 * @method FORGE.ScreenRenderer#_materialReadyHandler
 */
FORGE.ScreenRenderer.prototype._materialReadyHandler = function()
{
    this._quad.material = this._material.shaderMaterial;
    this._ready = true;
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

    if (this._material !== null)
    {
        this._material.destroy();
        this._material = null;
    }

    this._scene = null;
    this._camera = null;

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
    },

    /** @this {FORGE.ScreenRenderer} */
    set: function(value)
    {
        this._material = value;
        this._material.onReady.addOnce(this._materialReadyHandler, this);
    },
});

/**
 * Get the ready flag.
 * @name FORGE.ScreenRenderer#ready
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenRenderer.prototype, "ready",
{
    /** @this {FORGE.ScreenRenderer} */
    get: function()
    {
        return this._ready;
    }
});
