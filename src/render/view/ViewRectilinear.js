/**
 * Rectilinear view class.
 *
 * @constructor FORGE.ViewRectilinear
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Viewport} viewport - {@link FORGE.Viewport} reference.
 * @param {?ViewOptionsConfig} options - The view options.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewRectilinear = function(viewer, viewport, options)
{
    FORGE.ViewBase.call(this, viewer, viewport, options, "ViewRectilinear", FORGE.ViewType.RECTILINEAR);

    this._boot();
};

FORGE.ViewRectilinear.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewRectilinear.prototype.constructor = FORGE.ViewRectilinear;

/**
 * Screen margin allowed for semi off screen elements (percentage)
 * @type {number}
 */
FORGE.ViewRectilinear.OFF_SCREEN_MARGIN = 0.5;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewRectilinear#_boot
 * @private
 */
FORGE.ViewRectilinear.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._shaderSTW = /** @type {ScreenToWorldProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.screenToWorld.rectilinear));
    this._shaderWTS = /** @type {WorldToScreenProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.worldToScreen.rectilinear));

    this._pitchMin = -FORGE.Math.degToRad(90);
    this._pitchMax = FORGE.Math.degToRad(90);

    this._fovMin = FORGE.Math.degToRad(40);
    this._fovMax = FORGE.Math.degToRad(140);
};

/**
 * Update view params.
 * @method FORGE.ViewRectilinear#_updateViewParams
 * @private
 */
FORGE.ViewRectilinear.prototype._updateViewParams = function()
{
    if (this._viewer !== null)
    {
        this._projectionScale = Math.tan(FORGE.Math.degToRad(this._viewport.camera.fov / 2));
    }
};

/**
 * Get uniforms definition to inject in shader.
 *
 * @method FORGE.ViewRectilinear#getUniformsDef
 * @return {string} glsl uniforms definition
 */
FORGE.ViewRectilinear.prototype.getUniformsDef = function()
{
    var uList = FORGE.ViewBase.prototype.getUniformsDef.call(this).split("\n");

    return uList.concat([
        "uniform float tProjectionScale;"
    ]).join("\n");
};

/**
 * Get uniforms default values.
 *
 * @method FORGE.ViewRectilinear#getUniformsDefaults
 * @return {array} glsl uniforms default values
 */
FORGE.ViewRectilinear.prototype.getUniformsDefaults = function()
{
    return {
        "tProjectionScale": 1
    };
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

    if ("tProjectionScale" in uniforms)
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
 * @return {?THREE.Vector2} point in screen coordinates
 */
FORGE.ViewRectilinear.prototype.worldToScreen = function(worldPt, parallaxFactor)
{
    worldPt = worldPt || new THREE.Vector3();
    worldPt.normalize();
    parallaxFactor = parallaxFactor || 0;

    // Get point projected on unit sphere and apply camera rotation
    var worldPt4 = new THREE.Vector4(worldPt.x, worldPt.y, -worldPt.z, 1.0);
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._viewport.camera.modelView);
    var rotation = FORGE.Math.eulerToRotationMatrix(camEuler.yaw, camEuler.pitch, -camEuler.roll, true);
    rotation = rotation.transpose();
    worldPt4.applyMatrix4(rotation);

    if (worldPt4.z < 0)
    {
        return null;
    }

    // Project on zn plane by dividing x,y components by z
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
 * @return {?THREE.Vector3} world point
 */
FORGE.ViewRectilinear.prototype.screenToWorld = function(screenPt)
{
    var resolution = this._viewport.rectangle.size;

    screenPt = screenPt || new THREE.Vector2(resolution.width / 2, resolution.height / 2);

    var widthMargin = FORGE.ViewRectilinear.OFF_SCREEN_MARGIN * resolution.width,
        heightMargin = FORGE.ViewRectilinear.OFF_SCREEN_MARGIN * resolution.height;
    if (screenPt.x < -widthMargin || screenPt.x > resolution.width + widthMargin
        || screenPt.y < -heightMargin || screenPt.y > resolution.height + heightMargin)
    {
        return null;
    }

    // move the point in a -1..1 square
    var fragment = this._screenToFragment(screenPt);

    // scale it (see _updateViewParams above)
    fragment.multiplyScalar(this._projectionScale);

    var worldPt = new THREE.Vector4(fragment.x, fragment.y, -1, 0);

    // move the point in the world system
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._viewport.camera.modelView);
    var rotation = FORGE.Math.eulerToRotationMatrix(-camEuler.yaw, camEuler.pitch, -camEuler.roll, true);
    worldPt.applyMatrix4(rotation);

    return new THREE.Vector3(worldPt.x, -worldPt.y, worldPt.z).normalize();
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

