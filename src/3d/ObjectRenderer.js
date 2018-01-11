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

    /**
     * Picking manager.
     * @name FORGE.SceneRenderer#_picking
     * @type {FORGE.Picking}
     * @private
     */
    this._picking = null;

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

    this._picking = new FORGE.PickingDrawpass(this._viewer, this._sceneRenderer);
};

/**
 * Load objects
 * @method FORGE.ObjectRenderer#loadObjects
 * @param {Array<FORGE.Hotspot3D>} objects - objects array
 */
FORGE.ObjectRenderer.prototype.loadObjects = function(objects)
{
    if (objects === null || objects.length === 0)
    {
        return;
    }

    var scene = this._scene;
    
    // Clone every
    objects.forEach(function(object)
    {
        var mesh = object.mesh;

        mesh.material = new THREE.MeshBasicMaterial({color:new THREE.Color(1,0,0)})
        // mesh.material = this._sceneRenderer.view.current.materials[Math.floor(this._viewer.clock.time % 6)];

        scene.add(mesh);


        // // var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry().copy(object.geometry.geometry), new THREE.MeshBasicMaterial({color: new THREE.Color("#0f6")}));
        // var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry().copy(object.geometry.geometry), new THREE.RawShaderMaterial());
        // mesh.position.set(object.transform.position.x, object.transform.position.y, object.transform.position.z);
        // mesh.rotation.set(object.transform.rotation.x, object.transform.rotation.y, object.transform.rotation.z);

        // object.material.onReady.addOnce(function(event) {
        //     mesh.material.copy(object.material.material);
        //     mesh.material.uniforms.tTexture.value = object.material.texture;
        //     mesh.material.uniforms.tOpacity.value = object.material.opacity;

        //     mesh.onBeforeRender = function(renderer, scene, camera, geometry, material, group) {

        //         // if (material.name === "PickingMaterial") {
        //         //     if (material.program)
        //         //     {
        //         //         var gl = this._viewer.renderer.webGLRenderer.getContext();
        //         //         gl.useProgram(material.program.program);
        //         //         material.program.getUniforms().map.tColor.setValue(gl, this._pickingColor);
        //         //         material.uniforms.tColor.value = this._pickingColor;
        //         //     }
        //         // }
        //         // else if (material.name === "HotspotMaterial")
        //         // {
        //         // }


        //     }.bind(this);

        //     scene.add(mesh);
        // }.bind(this));
    }.bind(this));
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

    var camera = this._sceneRenderer.camera.main;
    this._viewer.renderer.webGLRenderer.render(this._scene, camera, target);
    this._picking.render(this._scene, camera, target);
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

