/**
 * Addional scene to be rendered class.
 *
 * @constructor FORGE.Scene3D
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {string=} className - Class name for objects that extends Object3D
 * @extends {FORGE.BaseObject}
 */
FORGE.Scene3D = function(viewer, className)
{
    /**
     * The viewer reference.
     * @name FORGE.Scene3D#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * 3D scene
     * @name FORGE.Scene3D#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * Reference on render target to draw the HUD
     * @name FORGE.Scene3D#renderTargetRef
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTargetRef = null;

    /**
     * Reference on camera to draw the HUD
     * @name FORGE.Scene3D#_cameraRef
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._cameraRef = null;

    /**
     * Raycaster.
     * @name FORGE.Scene3D#_raycaster
     * @type {THREE.Matrix4}
     * @private
     */
    this._raycaster = null;

    /**
     * Object intersected by raycast.
     * @name FORGE.Scene3D#_intersected
     * @type {THREE.Object3D}
     * @private
     */
    this._intersected = null;

    this._gaze = null;

    FORGE.BaseObject.call(this, className);

    this._boot();
};

FORGE.Scene3D.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Scene3D.prototype.constructor = FORGE.Scene3D;

/**
 * Boot routine
 * @method FORGE.Scene3D#_boot
 * @private
 */
FORGE.Scene3D.prototype._boot = function()
{
    this._register();

    this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);

    this._scene = new THREE.Scene();
    this._scene.frustumCulled = false;
    this._scene.name = "Scene3D-" + this.id;
    this._scene.onBeforeRender = this._sceneBeforeRender.bind(this);
    this._scene.onAfterRender = this._sceneAfterRender.bind(this);

    this._raycaster = new THREE.Raycaster();
    this._viewer.canvas.pointer.onTap.add(this._tapHandler, this);
    this._viewer.canvas.pointer.onMove.add(this._moveHandler, this);
};

/**
 * Tap event handler
 * @method FORGE.Scene3D#_tapHandler
 * @param {FORGE.Event} event - tap event
 * @private
 */
FORGE.Scene3D.prototype._tapHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);
    var xn = 2 * screenPosition.x / this._viewer.canvas.pixelWidth - 1;
    var yn = 2 * screenPosition.y / this._viewer.canvas.pixelHeight - 1;
    this._raycast(new THREE.Vector2(xn, -yn), "click");
};

/**
 * Move event handler
 * @method FORGE.Scene3D#_moveHandler
 * @param {FORGE.Event} event - move event
 * @private
 */
FORGE.Scene3D.prototype._moveHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);
    var xn = 2 * screenPosition.x / this._viewer.canvas.pixelWidth - 1;
    var yn = 2 * screenPosition.y / this._viewer.canvas.pixelHeight - 1;
    this._raycast(new THREE.Vector2(xn, -yn), "over");
};

/**
 * Scene before render callback
 * @method FORGE.Scene3D#_sceneBeforeRender
 * @private
 */
FORGE.Scene3D.prototype._sceneBeforeRender = function()
{
};

/**
 * Scene after render callback
 * @method FORGE.Scene3D#_sceneAfterRender
 * @private
 */
FORGE.Scene3D.prototype._sceneAfterRender = function(renderer, scene, camera)
{
    renderer.vr.enabled = false;
};

/**
 * Scene load complete event handler
 * @method FORGE.Scene3D#_sceneLoadCompleteHandler
 * @param {FORGE.Event} event - scene load complete event
 * @private
 */
FORGE.Scene3D.prototype._sceneLoadCompleteHandler = function(event)
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.add(this._sceneUnloadStartHandler, this);

    var sceneRenderer = this._viewer.renderer.scenes.get(sceneUid);

    this._renderTargetRef = sceneRenderer.target;
    this._cameraRef = this._viewer.camera.main;
    this._gaze = this._viewer.camera.gaze;
};

/**
 * Scene unload event handler
 * @method FORGE.Scene3D#_sceneUnloadStartHandler
 * @private
 */
FORGE.Scene3D.prototype._sceneUnloadStartHandler = function()
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.remove(this._sceneUnloadStartHandler, this);

    this._renderTargetRef = null;
    this._cameraRef = null;
    this._gaze = null;
};

/**
 * Raycast routine
 * @method FORGE.Scene3D#_raycast
 * @param {THREE.Vector2} position - raycast screen position (coords in -1 .. +1)
 * @param {string} action - requested action (click, move)
 * @param {Array<THREE.Object3D>} objects - objects with possible ray intersection (scene children if undefined)
 */
FORGE.Scene3D.prototype._raycast = function(position, action, objects)
{
    objects = Array.isArray(objects) ? objects : this._scene.children;

    if (this._cameraRef === null || objects.length === 0)
    {
        return;
    }

    this._raycaster.setFromCamera(position, this._cameraRef);
    var intersects = this._raycaster.intersectObjects(objects, true);

    var currentIntersectedHotspot = null;
    if (this._intersected !== null)
    {
        currentIntersectedHotspot = FORGE.UID.get(this._intersected.userData.hotspotUID, "FORGE.Hotspot3D");
        if (typeof currentIntersectedHotspot === "undefined" || Array.isArray(currentIntersectedHotspot))
        {
            currentIntersectedHotspot = null;
        }
    }

    if (intersects.length > 0)
    {
        var object = intersects[0].object;

        var hotspot = FORGE.UID.get(object.userData.hotspotUID, "FORGE.Hotspot3D");
        if (hotspot !== undefined && Array.isArray(hotspot) === false)
        {
           hotspot[action].call(hotspot);
        }

        if (this._intersected !== object)
        {
            if (currentIntersectedHotspot !== null)
            {
               currentIntersectedHotspot.out();
            }

            this._intersected = object;

            if (this._viewer.vr === true)
            {
                this._gaze.start(this);
            }
        }

        // this.log("Raycast intersection : " + object.id);
    }
    else
    {
        if (this._intersected !== null)
        {
            if (currentIntersectedHotspot !== null)
            {
               currentIntersectedHotspot.out();
            }

            this._intersected = null;
        }

        if (this._viewer.vr === true)
        {
            this._gaze.stop();
        }
    }
};

FORGE.Scene3D.prototype.click = function()
{
    var hotspot = FORGE.UID.get(this._intersected.userData.hotspotUID);
    if (hotspot !== undefined && typeof hotspot.click === "function")
    {
        hotspot.click();
    }
};

/**
 * Clear the scene
 * @method FORGE.Scene3D#clear
 */
FORGE.Scene3D.prototype.clear = function()
{
    this._scene.children = [];
};

/**
 * Add a new object to the scene
 * @method FORGE.Scene3D#add
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.Scene3D.prototype.add = function(object)
{
    var mesh = object;
    if (object instanceof FORGE.Object3D)
    {
        mesh = object.mesh;
    }

    this._scene.add(mesh);
};

/**
 * Render routine
 * @method FORGE.Scene3D#render
 */
FORGE.Scene3D.prototype.render = function()
{
    if (this._cameraRef === null)
    {
        return;
    }

    this._viewer.renderer.webGLRenderer.vr.enabled = this._viewer.vr;
    this._viewer.renderer.webGLRenderer.render(this._scene, this._cameraRef, this._renderTargetRef);
};

/**
 * Destroy routine
 * @method FORGE.Scene3D#destroy
 * @private
 */
FORGE.Scene3D.prototype.destroy = function()
{
    this._viewer.story.onSceneLoadComplete.remove(this._sceneLoadCompleteHandler, this);
    this._viewer.canvas.pointer.onMove.remove(this._moveHandler, this);
    this._viewer.canvas.pointer.onTap.remove(this._tapHandler, this);

    while (this._scene.children.length > 0)
    {
        var mesh = this._scene.children.pop();
        FORGE.Utils.destroyMesh(mesh);
    }

    this._raycaster = null;
    this._intersected = null;

    this._renderTargetRef = null;
    this._cameraRef = null;
    this._scene = null;

    this._viewer = null;
};

/**
 * Get the scene
 * @name FORGE.Scene3D#scene
 * @type {THREE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.Scene3D.prototype, "scene",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get the children
 * @name FORGE.Scene3D#children
 * @type {Array<THREE.Mesh>}
 * @readonly
 */
Object.defineProperty(FORGE.Scene3D.prototype, "children",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._scene.children;
    }
});

