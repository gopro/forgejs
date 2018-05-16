/**
 * @constructor FORGE.ObjectRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.SceneRenderer} sceneRenderer {@link FORGE.SceneRenderer} reference.
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
    this._objects = null;

    /**
     * Reference on last renderer viewport
     * @name FORGE.ObjectRenderer#_lastViewport
     * @type {FORGE.Viewport}
     * @private
     */
    this._lastViewport = null;

    /**
     * Track of last view type
     * Uniforms should be set of it has changed
     * @name FORGE.ObjectRenderer#_lastViewType
     * @type {FORGE.ViewType}
     * @private
     */
    this._lastViewType = FORGE.ViewType.UNDEFINED;

    /**
     * Picking manager
     * @name FORGE.ObjectRenderer#_picking
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
 * Add meshes to the scene and ensure they have a picking color set
 * @method FORGE.ObjectRenderer#_boot
 * @private
 */
FORGE.ObjectRenderer.prototype._boot = function()
{
    this._scene = new THREE.Scene();
    this._scene.name = "ObjectRenderer";
    this._scene.onAfterRender = this._SceneAfterRender.bind(this);

    // Take only hotspot 3d type > to refactor
    this._objects = this._sceneRenderer.scene.objects.filter(function(o)
    {
        return o.className === "Hotspot3D";
    });

    for (var i = 0; i < this._objects.length; i++)
    {
        var mesh = this._objects[i].mesh;
        mesh.userData.pickingColor = FORGE.Picking.colorFromObjectID(mesh.id);
        this._scene.add(mesh);
    }

    this._picking = new FORGE.Picking(this._viewer, this);

    this._sceneRenderer.scene.onUnloadComplete.addOnce(this._sceneUnloadCompleteHandler, this);
};

/**
 * Function called by WebGL Renderer once the scene ghas been renderer.
 * @method FORGE.ObjectRenderer#_SceneAfterRender
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Scene} scene - rendered scene
 * @param {THREE.Camera} camera - camera used to render the scene
 * @private
 */
FORGE.ObjectRenderer.prototype._SceneAfterRender = function(renderer, scene, camera)
{
    // Renderer has not submitted the frame to the VR headset yet
    // Turn off the vr flag to as we are rendering to a texture.
    // The screen renderer will be in charge of submitting the frame
    renderer.vr.enabled = false;
};

/**
 * SceneUnLoadCompleteHandler
 * @method FORGE.ObjectRenderer#_sceneUnloadCompleteHandler
 * @private
 */
FORGE.ObjectRenderer.prototype._sceneUnloadCompleteHandler = function()
{
    if (this._picking !== null)
    {
        this._picking.destroy();
        this._picking = null;
    }

    this._objects = null;
};

/**
 * Retrieve the list of all pickable objects
 * That means ready and interactive
 * @method FORGE.ObjectRenderer#_getPickableObjects
 * @private
 * @return {Array<FORGE.Object3D>} list of all pickable objects
 */
FORGE.ObjectRenderer.prototype._getPickableObjects = function()
{
    return this._objects.filter(function(object)
    {
        return object.ready === true && object.interactive === true;
    });
};

/**
 * Retrieve object3D matching the given id
 * It should be pickable, that means ready and interactive
 * @method FORGE.ObjectRenderer#getInteractiveObjectWithId
 * @param {number} id - object id
 * @return {FORGE.Object3D} object3D or undefined if not found
 */
FORGE.ObjectRenderer.prototype.getPickableObjectWithId = function(id)
{
    return this._getPickableObjects().find(function(object)
    {
        return object.mesh.id === id;
    });
};

/**
 * Render routine
 *
 * If viewport has changed since last render
 * Iterate over each object to setup its material and projection uniforms
 *
 * Render the scene for the viewport passed as argument
 * Call the picking to draw its pass if current viewport is active and there
 * are pickable objects
 *
 * @method FORGE.ObjectRenderer#render
 * @param {FORGE.Viewport} viewport - current rendering viewport
 * @param {FORGE.WebGLRenderTarget} target - render target
 */
FORGE.ObjectRenderer.prototype.render = function(viewport, target)
{
    var view = viewport.view.current;
    var camera = viewport.camera.main;
    var compilationNeeded = false;

    // Update projection uniforms
    for (var j = 0; j < this._objects.length; j++)
    {
        var object = this._objects[j];
        var material = object.material;
        var mesh = object.mesh;

        if(object.alive === false)
        {
            return;
        }

        if (typeof mesh.material.program === "undefined" ||
            undefined !== Object.values(mesh.material.uniforms).filter(function(u) { return u.value === undefined; }))
        {
            compilationNeeded = true;
        }

        // Renew material if needed
        if (this._lastViewport === null ||
            this._lastViewport.uid !== viewport.uid ||
            this._lastViewType === FORGE.ViewType.UNDEFINED ||
            this._lastViewType !== view.type ||
            mesh.material.transparent !== material.transparent)
        {
            // Update culling strategy depending on the projection
            mesh.frustumCulled = view.type === FORGE.ViewType.RECTILINEAR;

            // Assign the right material reference
            var shaderType = material.type === FORGE.HotspotMaterial.types.GRAPHICS ? FORGE.ObjectMaterialType.COLOR : FORGE.ObjectMaterialType.MAP;
            var objectMaterial = this._viewer.renderer.materials.get(view.type, shaderType, material.transparent);
            mesh.material = objectMaterial.shaderMaterial;
        }

        // Update material attributes and projection uniforms
        mesh.material.side = material.getThreeSide();
        mesh.material.transparent = material.transparent;
        mesh.material.opacity = material.opacity;

        view.updateUniforms(mesh.material.uniforms);
    }

    if (compilationNeeded === true)
    {
        this._viewer.renderer.webGLRenderer.compile(this._scene, camera);
    }

    this._viewer.renderer.webGLRenderer.render(this._scene, camera, target);

    // If current viewport is active and there are some pickable objects, render the picking pass
    var pickable = this._getPickableObjects();

    // If scene is active and viewport is active and there are pickable objects
    // @todo add a test for scene active (this._viewer.activeScene === this._scene)
    if (this._viewer.renderer.activeViewport === viewport &&
        pickable.length > 0)
    // if (this._viewer.story.scene.activeViewport === viewport && pickable.length > 0)
    {
        this._picking.render(viewport);
    }

    // Update viewport and view references for checks in the next call
    this._lastViewport = viewport;
    this._lastViewType = view.type;
};

/**
 * Destroy sequence
 * @method FORGE.ObjectRenderer#destroy
 */
FORGE.ObjectRenderer.prototype.destroy = function()
{
    if (this._picking !== null)
    {
        this._picking.destroy();
        this._picking = null;
    }

    this._objects = null;

    while(this._scene.children.length > 0)
    {
        this._scene.remove(this._scene.children[0]);
    }

    this._scene = null;

    this._lastViewport = null;

    this._sceneRenderer = null;
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

