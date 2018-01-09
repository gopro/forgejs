/**
 * @constructor FORGE.ObjectRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectRenderer = function(viewer, sceneRenderer)
{
    /**
     * Viewer reference
     * @name FORGE.ObjectRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene renderer reference.
     * @name FORGE.ObjectRenderer#_sceneRenderer
     * @type {FORGE.SceneRenderer}
     * @private
     */
    this._sceneRenderer = sceneRenderer;

    /**
     * @name FORGE.ObjectRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    FORGE.BaseObject.call(this, "ObjectRenderer");

    this._boot();
};

FORGE.ObjectRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ObjectRenderer.prototype.constructor = FORGE.ObjectRenderer;

/**
 * Init routine
 * @method FORGE.ObjectRenderer#_boot
 * @private
 */
FORGE.ObjectRenderer.prototype._boot = function()
{
    this._scene = new THREE.Scene();
};

/**
 * Load hotspots
 * @method FORGE.ObjectRenderer#loadHotspots
 * @param {Array<FORGE.Hotspot3D>} hotspots - hotspots array
 */
FORGE.ObjectRenderer.prototype.loadHotspots = function(hotspots)
{
    if (hotspots === null || hotspots.length === 0)
    {
        return;
    }

    var scene = this._scene;
    
    // Clone every
    hotspots.forEach(function(hotspot)
    {
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry().copy(hotspot.geometry.geometry), new THREE.RawShaderMaterial());
        mesh.position.set(hotspot.transform.position.x, hotspot.transform.position.y, hotspot.transform.position.z);
        mesh.rotation.set(hotspot.transform.rotation.x, hotspot.transform.rotation.y, hotspot.transform.rotation.z);

        hotspot.material.onReady.addOnce(function(event) {
            mesh.material.copy(hotspot.material.material);
            mesh.material.uniforms.tTexture.value = hotspot.material.texture;
            mesh.material.uniforms.tOpacity.value = hotspot.material.opacity;
        });

        scene.add(mesh);
    });
};

/**
 * Get 3d objects that are eligible to raycast (interactive)
 * @method  FORGE.ObjectRenderer#getRaycastable
 * @return {Array<FORGE.Object3D>}
 */
FORGE.ObjectRenderer.prototype.getRaycastable = function()
{
    return this._objects.filter(function(object)
    {
        return (object.ready === true && object.interactive === true);
    });
};


/**
 * Render routine
 * @method FORGE.ObjectRenderer#render
 */
FORGE.ObjectRenderer.prototype.render = function(target)
{
    if (this._scene.children.length === 0)
    {
        return;
    }

    this._viewer.renderer.webGLRenderer.render(this._scene, this._sceneRenderer.camera.main, target);
};

/**
 * Destroy sequence
 * @method FORGE.ObjectRenderer#destroy
 */
FORGE.ObjectRenderer.prototype.destroy = function()
{
    this._scene.children.length = 0;
    this._scene = null;

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get all the objects
 * @name FORGE.ObjectRenderer#all
 * @type {Array<FORGE.Object3D>}
 */
Object.defineProperty(FORGE.ObjectRenderer.prototype, "all",
{
    /** @this {FORGE.ObjectRenderer} */
    get: function()
    {
        return this._objects;
    }
});


/**
 * Get background scene.
 * @name FORGE.ObjectRenderer#scene
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.ObjectRenderer.prototype, "scene",
{
    /** @this {FORGE.ObjectRenderer} */
    get: function()
    {
        return this._scene;
    }
});

