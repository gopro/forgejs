/**
 * The HUD (head up display) class.
 *
 * @constructor FORGE.HUD
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {Scene3DConfig} config - scene configuration.
 * @extends {FORGE.Scene3D}
 */
FORGE.HUD = function(viewer, config)
{
    FORGE.Scene3D.call(this, viewer, config, "HUD");
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

    this._object = new THREE.Object3D();
    this._object.name = "HUD container";

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
    if (this._viewer.vr === true && camera.isArrayCamera)
    {
        var position = new THREE.Vector3();
        var scale = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();

        camera.cameras[0].matrixWorld.decompose( position, quaternion, scale );
        var rotation = new THREE.Matrix4().makeRotationFromQuaternion( quaternion );
        this._object.matrix.copy(rotation);
        this._object.updateMatrixWorld();
    }

    FORGE.Scene3D.prototype._sceneBeforeRender.call(this, renderer, scene, camera);
};

/**
 * Raycast routine
 * @method FORGE.HUD#_raycast
 * @param {THREE.Vector2} position - raycast screen position (coords in -1 .. +1)
 */
FORGE.HUD.prototype._raycast = function(position, action)
{
    if (this._object.children.length > 0)
    {
        FORGE.Scene3D.prototype._raycast.call(this, position, action, this._object.children);
    }
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
    if (arguments.length > 1)
    {
        for (var i=0; i<arguments.length; i++)
        {
            this.add(arguments[i]);
        }

        return
    }

    object.traverse(function(mesh)
    {
        if (typeof mesh.userData.hotspotUID !== "undefined")
        {
            var hotspot = FORGE.UID.get(mesh.userData.hotspotUID);
            hotspot.onReady.add(this._hotspotReadyHandler, this);
        }

        mesh.frustumCulled = false;
        mesh.renderOrder = this._object.renderOrder;

        if (mesh.isMesh)
        {
            mesh.material.depthTest = false;
        }

    }.bind(this));

    this._object.add(object)
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

    // In VR camera is not updated with VR Pose object. Only internal
    // WebVRManager cameras are up to date
    if (this._viewer.vr === false)
    {
        this._object.matrix.copy(this._cameraRef.matrixWorld);
        this._object.updateMatrixWorld();
    }

    FORGE.Scene3D.prototype.render.call(this);
};

/**
 * Destroy routine
 * @method FORGE.HUD#destroy
 */
FORGE.HUD.prototype.destroy = function()
{
    this._object = null;

    FORGE.Scene3D.prototype.destoy.call(this);
};

