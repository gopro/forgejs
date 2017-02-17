/**
 * Rectilinear view class.
 *
 * @constructor FORGE.ViewRectilinear
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Camera} camera - {@link FORGE.Camera} reference
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewRectilinear = function(viewer, camera)
{
    FORGE.ViewBase.call(this, viewer, camera, "ViewRectilinear", FORGE.ViewType.RECTILINEAR);

    this._boot();
};

FORGE.ViewRectilinear.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewRectilinear.prototype.constructor = FORGE.ViewRectilinear;

/**
 * Background shader screen to world
 * @type {Object}
 */
FORGE.ViewRectilinear.prototype.shaderSTW = FORGE.ShaderLib.screenToWorld.rectilinear;

/**
 * Background shader world to screen
 * @type {Object}
 */
FORGE.ViewRectilinear.prototype.shaderWTS = FORGE.ShaderLib.worldToScreen.rectilinear;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewRectilinear#_boot
 * @private
 */
FORGE.ViewRectilinear.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._camera.fovMin = 40;
    this._camera.fovMax = 140;
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewRectilinear#updateUniforms
 * @param {Object} uniforms
 */
FORGE.ViewRectilinear.prototype.updateUniforms = function(uniforms)
{
    // this.log("ViewRectilinear _getUpdatedParamsScreenToWorld");
    var fov = FORGE.Math.clamp(this._camera.fov, this._camera.fovMin, this._camera.fovMax);

    this._projectionScale = Math.tan(FORGE.Math.degToRad(fov / 2));
    uniforms.tProjectionScale.value = this._projectionScale;
};

/**
 * Convert a point from world space to screen space.
 *
 * @method FORGE.ViewRectilinear#worldToScreen
 * @param {THREE.Vector3} worldPt - 3D point in world space
 * @param {number} parallaxFactor - parallax factor [0..1]
 * @return {THREE.Vector2} point in screen coordinates
 */
FORGE.ViewRectilinear.prototype.worldToScreen = function(worldPt, parallaxFactor)
{
    parallaxFactor = parallaxFactor || 0;

    // Get point projected on unit sphere and apply camera rotation
    var worldPt4 = new THREE.Vector4(worldPt.x, worldPt.y, worldPt.z, 1.0);

    // Apply reversed rotation
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._camera.modelView);
    var rotation = FORGE.Math.eulerToRotationMatrix(camEuler.yaw, camEuler.pitch, camEuler.roll, true);
    rotation = rotation.transpose();
    worldPt4.applyMatrix4(rotation);

    if (worldPt4.z < 0)
    {
        return new THREE.Vector2(Infinity, Infinity);
    }

    // Project on zn plane by dividing x,y components by -z
    var projScale = Math.max(Number.EPSILON, worldPt4.z);
    var znPt = new THREE.Vector2(worldPt4.x, worldPt4.y).divideScalar(projScale);

    // Apply fov scaling
    znPt.x /= (1 + parallaxFactor) * this._projectionScale;
    znPt.y /= this._projectionScale;

    // Return fragment
    return this._fragmentToScreen(znPt);
};

/**
 * Convert a point from screen space to world space.
 *
 * @method FORGE.ViewRectilinear#screenToWorld
 * @param {THREE.Vector2} screenPt - 2D point in screen space [0..w, 0..h]
 * @return {THREE.Vector3} world point
 */
FORGE.ViewRectilinear.prototype.screenToWorld = function(screenPt)
{
    var fragment = this._screenToFragment(screenPt);
    fragment.multiplyScalar(this._projectionScale);

    var cameraPt = new THREE.Vector4(fragment.x, fragment.y, -1, 0);

    var worldPt = cameraPt.applyMatrix4(this._camera.modelViewInverse).normalize();

    return new THREE.Vector3(worldPt.x, worldPt.y, worldPt.z);
};

/**
 * Destroy method.
 *
 * @method FORGE.ViewRectilinear#destroy
 */
FORGE.ViewRectilinear.prototype.destroy = function()
{
    FORGE.ViewBase.prototype.destroy.call(this);
};

