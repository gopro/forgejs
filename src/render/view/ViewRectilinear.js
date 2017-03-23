/**
 * Rectilinear view class.
 *
 * @constructor FORGE.ViewRectilinear
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewRectilinear = function(viewer)
{
    FORGE.ViewBase.call(this, viewer, "ViewRectilinear", FORGE.ViewType.RECTILINEAR);

    this._boot();
};

FORGE.ViewRectilinear.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewRectilinear.prototype.constructor = FORGE.ViewRectilinear;

/**
 * Background shader screen to world
 * @type {ScreenToWorldProgram}
 */
FORGE.ViewRectilinear.prototype.shaderSTW = FORGE.ShaderLib.screenToWorld.rectilinear;

/**
 * Background shader world to screen
 * @type {WorldToScreenProgram}
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

    this._fovMin = 40;
    this._fovMax = 140;
};

/**
 * Update view params.
 * @method FORGE.ViewRectilinear#_updateViewParams
 * @private
 */
FORGE.ViewRectilinear.prototype._updateViewParams = function()
{
    var fov = FORGE.Math.clamp(this._viewer.camera.fov, this._viewer.camera.fovMin, this._viewer.camera.fovMax);

    this._projectionScale = Math.tan(FORGE.Math.degToRad(fov / 2));
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewRectilinear#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewRectilinear.prototype.updateUniforms = function(uniforms)
{
    this._updateViewParams();

    if (typeof uniforms === "undefined")
    {
        return;
    }    

    if (uniforms.hasOwnProperty("tProjectionScale"))
    {
        uniforms.tProjectionScale.value = this._projectionScale;
    }
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
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._viewer.camera.modelView);
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

    var worldPt = cameraPt.applyMatrix4(this._viewer.camera.modelViewInverse).normalize();

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

