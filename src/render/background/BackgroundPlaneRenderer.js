/**
 * FORGE.BackgroundPlaneRenderer
 * BackgroundPlaneRenderer class.
 *
 * @constructor FORGE.BackgroundPlaneRenderer
 * @extends {FORGE.BackgroundMeshRenderer}
 *
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 */
FORGE.BackgroundPlaneRenderer = function(viewer, sceneRenderer)
{
    /**
     * The size of the mesh.
     * @name FORGE.BackgroundPlaneRenderer#_size
     * @type {number}
     * @private
     */
    this._size = 1;

    /**
     * Media vertical fov (radians)
     * @name FORGE.BackgroundPlaneRenderer#_mediaVFov
     * @type {number}
     * @private
     */
    this._mediaVFov = 90;

    FORGE.BackgroundMeshRenderer.call(this, viewer, sceneRenderer, "BackgroundPlaneRenderer");
};

FORGE.BackgroundPlaneRenderer.prototype = Object.create(FORGE.BackgroundMeshRenderer.prototype);
FORGE.BackgroundPlaneRenderer.prototype.constructor = FORGE.BackgroundPlaneRenderer;

/**
 * Boot routine.
 * @method FORGE.BackgroundPlaneRenderer#_boot
 * @private
 */
FORGE.BackgroundPlaneRenderer.prototype._boot = function()
{
    if (typeof this._config.verticalFov !== "undefined")
    {
        this._mediaVFov = this._config.verticalFov;
    }

    FORGE.BackgroundMeshRenderer.prototype._boot.call(this);
};

/**
 * Compute plane size
 * @method FORGE.BackgroundPlaneRenderer#_computePlaneSize
 * @return {THREE.Vector3} 3D size of the plane
 * @private
 */
FORGE.BackgroundPlaneRenderer.prototype._computePlaneSize = function()
{
    var texHeight = this._media.displayObject.originalHeight;
    var texRatio = this._media.displayObject.originalWidth / this._media.displayObject.originalHeight;

    var width = this._size;
    var height = Math.round(width / texRatio);
    var depth = height / (2 * Math.tan(0.5 * this._mediaVFov));

    return new THREE.Vector3(width, height, depth);
};

/**
 * Create geometry
 * @method FORGE.BackgroundPlaneRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundPlaneRenderer.prototype._createGeometry = function()
{
    var size = this._computePlaneSize();
    return new THREE.PlaneBufferGeometry(size.x, size.y);
};

/**
 * Placeholder function to be implemented by subclass specific needs
 * It will be called if it exists, once the mesh is created
 * @method FORGE.BackgroundPlaneRenderer#_onMeshCreated
 * @private
 */
FORGE.BackgroundPlaneRenderer.prototype._onMeshCreated = function()
{
    var size = this._computePlaneSize();

    this._mesh.position.set(0, 0, -size.z);
    this._mesh.material.side = THREE.FrontSide;

    if (this.DEBUG === true)
    {
        var fovMax = FORGE.Math.radToDeg(2 * Math.atan(0.5 * size.y / size.z));
        var fovMin = FORGE.Math.radToDeg(2 * Math.atan((0.5 * size.y / size.z) * (this._getViewport().size.height / this._media.displayObject.height)));

        this.log("Flat rendering boundaries [" + fovMin.toFixed() + ", " + fovMax.toFixed() + "]");
    }

    FORGE.BackgroundMeshRenderer.prototype._onMeshCreated.call(this);
};


