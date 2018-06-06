/**
 * The HUD (head up display) class.
 *
 * @constructor FORGE.HUD
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @extends {FORGE.Scene3D}
 */
FORGE.HUD = function(viewer)
{
    FORGE.Scene3D.call(this, viewer, "HUD");
};

FORGE.HUD.prototype = Object.create(FORGE.Scene3D.prototype);
FORGE.HUD.prototype.constructor = FORGE.HUD;

/**
 * Boot routine
 * @method FORGE.HUD#_boot
 * @private
 */
FORGE.HUD.prototype._boot = function()
{
    FORGE.Scene3D.prototype._boot.call(this);

    this._scene.name = "HUD-" + this._scene.id;

    var geometry = new THREE.SphereBufferGeometry(1, 4, 4);
    var material = new THREE.MeshBasicMaterial({transparent:true, opacity:0.0, side: THREE.DoubleSide, depthTest:false});
    this._object = new THREE.Mesh(geometry, material);
    this._object.matrixAutoUpdate = false;
    this._object.frustumCulled = false;
    this._object.renderOrder = 1;

    this._scene.add(this._object);
};

/**
 * Scene before render callback
 * The right place to get the camera (in VR, we will receive the cameraVR from WebVRManager)
 * @method FORGE.HUD#_sceneBeforeRender
 * @private
 */
FORGE.HUD.prototype._sceneBeforeRender = function(renderer, scene, camera)
{
};

/**
 * Raycast routine
 * @method FORGE.HUD#_raycast
 * @param {THREE.Vector2} position - raycast screen position (coords in -1 .. +1)
 */
FORGE.HUD.prototype._raycast = function(position, action)
{
    FORGE.Scene3D.prototype._raycast.call(this, position, action, this._object.children);
};

/**
 * Set mesh material properties
 * @method FORGE.HUD#_setMeshMaterial
 * @param {THREE.Mesh} mesh
 */
FORGE.HUD.prototype._hotspotReadyHandler = function(event)
{
    var object = event.emitter;
    object.onReady.remove(this._hotspotReadyHandler, this);
    object.material.material.depthTest = false;
};

/**
 * Clear the scene
 * @method FORGE.HUD#clear
 */
FORGE.HUD.prototype.clear = function()
{
    this._object.children = [];
};

/**
 * Add a new object to the scene
 * @method FORGE.HUD#add
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.HUD.prototype.add = function(object)
{
    object.traverse(function(mesh)
    {
        if (typeof mesh.userData.hotspotUID !== "undefined")
        {
            var hotspot = FORGE.UID.get(mesh.userData.hotspotUID);
            hotspot.onReady.add(this._hotspotReadyHandler, this);
        }

        mesh.frustumCulled = false;
        mesh.renderOrder = this._object.renderOrder;
        mesh.material.depthTest = false;

    }.bind(this));

    this._object.add(object);
};

/**
 * Render routine
 * @method FORGE.HUD#render
 */
FORGE.HUD.prototype.render = function()
{
    if (this._cameraRef === null)
    {
        return;
    }

    this._object.matrix.copy(this._cameraRef.matrixWorld);
    this._object.updateMatrixWorld();

    FORGE.Scene3D.prototype.render.call(this);
};

