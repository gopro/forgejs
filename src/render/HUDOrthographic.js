/**
 * The HUDOrthographic (head up display) class.
 *
 * @constructor FORGE.HUDOrthographic
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {Scene3DConfig} config - scene configuration.
 * @extends {FORGE.Scene3D}
 */
FORGE.HUDOrthographic = function(viewer, config)
{
    FORGE.HUD.call(this, viewer, config, "HUDOrthographic");
};

FORGE.HUDOrthographic.prototype = Object.create(FORGE.HUD.prototype);
FORGE.HUDOrthographic.prototype.constructor = FORGE.HUDOrthographic;

/**
 * Boot routine
 * @method FORGE.HUDOrthographic#_boot
 * @private
 */
FORGE.HUDOrthographic.prototype._boot = function()
{
    FORGE.HUD.prototype._boot.call(this);

    this._scene.name = "HUDOrthographic-" + this._scene.id;

    var h = 100;
    var w = h * this._viewer.canvas.width / this._viewer.canvas.height;

    var camera = new THREE.OrthographicCamera();

    camera.left = -w;
    camera.right = w;
    camera.top = h;
    camera.bottom = -h;

    camera.near = -FORGE.Renderer.DEPTH_FAR;
    camera.far = FORGE.Renderer.DEPTH_FAR;

    camera.updateProjectionMatrix();

    this._cameraRef = camera;
};

/**
 * Scene unload event handler
 * @method FORGE.HUDOrthographic#_sceneUnloadStartHandler
 * @private
 */
FORGE.HUDOrthographic.prototype._sceneUnloadStartHandler = function()
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.remove(this._sceneUnloadStartHandler, this);

    this._renderTargetRef = null;
    this._gaze = null;
};

/**
 * Scene load complete event handler
 * @method FORGE.HUDOrthographic#_sceneLoadCompleteHandler
 * @param {FORGE.Event} event - scene load complete event
 * @private
 */
FORGE.HUDOrthographic.prototype._sceneLoadCompleteHandler = function(event)
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.add(this._sceneUnloadStartHandler, this);

    var sceneRenderer = this._viewer.renderer.scenes.get(sceneUid);

    this._renderTargetRef = sceneRenderer.target;
    this._gaze = this._viewer.camera.gaze;
};

/**
 * Get the camera frustum size
 * @method FORGE.HUDOrthographic#getFrustumSize
 * @return {FORGE.Size} camera frustum size or null if there is no camera
 */
FORGE.HUDOrthographic.prototype.getFrustumSize = function()
{
    if (this._cameraRef === null)
    {
        return null;
    }

    var w = this._cameraRef.right - this._cameraRef.left;
    var h = this._cameraRef.top - this._cameraRef.bottom;

    return new FORGE.Size(w, h);
};

/**
 * Anchor a mesh
 * @method FORGE.HUDOrthographic#anchorMesh
 * @param {THREE.Mesh} mesh - mesh object
 */
FORGE.HUDOrthographic.prototype.anchorMesh = function(mesh, anchor)
{
    if (mesh.geometry.boundingBox === null)
    {
        mesh.geometry.computeBoundingBox();
    }

    var meshSize = mesh.geometry.boundingBox.getSize();

    var camWidth = this._cameraRef.right - this._cameraRef.left;
    var camHeight = this._cameraRef.top - this._cameraRef.bottom;

    var anchors = Array.from(arguments).slice(1);

    var x = mesh.position.x,
        y = mesh.position.y;

    if (anchors.indexOf("right") !== -1)
    {
        x = 0.5 * (camWidth - meshSize.x);
    }
    else
    if (anchors.indexOf("left") !== -1)
    {
        x = -0.5 * (camWidth - meshSize.x);
    }

    if (anchors.indexOf("top") !== -1)
    {
        y = 0.5 * (camHeight - meshSize.y);
    }
    else
    if (anchors.indexOf("bottom") !== -1)
    {
        y = -0.5 * (camHeight - meshSize.y);
    }

    mesh.position.set(x, y, mesh.position.z);
};

