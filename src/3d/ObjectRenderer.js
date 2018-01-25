/**
 * @constructor FORGE.ObjectRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectRenderer = function(viewer, objects)
{
    /**
     * Viewer reference
     * @name FORGE.ObjectRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Scene where all objects are renderered (whatever the viewport)
     * @name FORGE.ObjectRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * List of objects to render
     * @name FORGE.ObjectRenderer#_objects
     * @type {Array<FORGE.Object3D>}
     * @private
     */
    this._objects = objects;

    /**
     * Picking manager
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

    for (var i=0; i<this._objects.length; i++)
    {
        this._scene.add(this._objects[i].mesh);
    }

    this._picking = new FORGE.Picking(this._viewer, this);
};

/**
 * Retrieve the list of all pickable objects
 * @method FORGE.ObjectRenderer#_getPickableObjects
 * @private
 * @return {Array<FORGE.Object3D>} list of all pickable objects
 */
FORGE.ObjectRenderer.prototype._getPickableObjects = function(id)
{
    return this._objects.filter(function(object) {
        return object.ready === true && object.interactive === true;
    })
};

/**
 * Retrieve object3D matching the given id
 * It should be pickable, i.e. ready and interactive
 * @method FORGE.ObjectRenderer#getInteractiveObjectWithId
 * @param {number} id - object id
 * @return {FORGE.Object3D} object3D or undefined if not found
 */
FORGE.ObjectRenderer.prototype.getPickableObjectWithId = function(id)
{
    return this._getPickableObjects().find(function(object) {
        return object.mesh.id === id;
    })
};

/**
 * Render routine
 * @method FORGE.ObjectRenderer#render
 * @param {FORGE.Viewport} viewport - current rendering viewport
 * @param {FORGE.WebGLRenderTarget} target - render target
 */
FORGE.ObjectRenderer.prototype.render = function(viewport, target)
{
    if (this._scene.children.length === 0)
    {
        return;
    }

    var view = viewport.view.current;
    var camera = viewport.camera.main;

    for (var i=0; i<this._objects.length; i++)
    {
        var object = this._objects[i];
        var material = object.material;
        var mesh = object.mesh;

        mesh.frustumCulled = view.type === FORGE.ViewType.RECTILINEAR;

        if (object.material.type === FORGE.HotspotMaterial.types.GRAPHICS)
        {
            mesh.material = this._viewer.renderer.getMaterialForView(view.type, "coloring");
        }
        else
        {
            mesh.material = this._viewer.renderer.getMaterialForView(view.type, "mapping");
        }

        mesh.material.side = THREE.FrontSide;
        mesh.material.transparent = material.transparent;
        mesh.material.needsUpdate = true;

        if ("tTexture" in mesh.material.uniforms && object.material.texture !== null)
        {
            mesh.material.uniforms.tTexture.value = object.material.texture;
        }

        if ("tColor" in mesh.material.uniforms && object.material.color !== null)
        {
            mesh.material.uniforms.tColor.value = object.material.color;
        }

        if ("tOpacity" in mesh.material.uniforms && object.material.opacity !== null)
        {
            mesh.material.uniforms.tOpacity.value = object.material.opacity;
        }

        view.updateUniforms(mesh.material.uniforms);
    }

    this._viewer.renderer.webGLRenderer.render(this._scene, camera, target);
    
    // If current viewport is active and there are some pickable objects, render the picking pass
    var pickable = this._getPickableObjects();
    if (this._viewer.story.scene.activeViewport === viewport && pickable.length > 0)
    {
        this._picking.render(viewport);
    }
};

/**
 * Destroy sequence
 * @method FORGE.ObjectRenderer#destroy
 */
FORGE.ObjectRenderer.prototype.destroy = function()
{
    if (this._picking !== null) {
        this._picking.destroy();
        this._picking = null;
    }

    this._objects = null;

    this._scene.children = null;
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

