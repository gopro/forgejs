/**
 * GoPro view class.
 *
 * @constructor FORGE.ViewGoPro
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {?ViewOptionsConfig} options - The view options.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewGoPro = function(viewer, options)
{
    /**
     * Projection distance.
     * @name FORGE.ViewGoPro#_projectionDistance
     * @type {number}
     * @private
     */
    this._projectionDistance = 0;

    FORGE.ViewBase.call(this, viewer, options, "ViewGoPro", FORGE.ViewType.GOPRO);

    this._boot();
};

FORGE.ViewGoPro.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewGoPro.prototype.constructor = FORGE.ViewGoPro;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewGoPro#_boot
 * @private
 */
FORGE.ViewGoPro.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._shaderSTW = /** @type {ScreenToWorldProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.screenToWorld.gopro));
    this._shaderWTS = /** @type {WorldToScreenProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.worldToScreen.gopro));

    this._fovMin = FORGE.Math.degToRad(30);
    this._fovMax = FORGE.Math.degToRad(330);
};

/**
 * Update view params.
 * @method FORGE.ViewGoPro#_updateViewParams
 * @private
 */
FORGE.ViewGoPro.prototype._updateViewParams = function()
{
    if (this._viewer !== null)
    {
        var projFovLow = 90;
        var projFovHigh = 180;
        var distance = 0;

        var fov = this._viewer.camera.fov;

        var fn = 0;

        if (fov < projFovLow)
        {
            distance = 0;
            fn = 0;
        }
        else if (fov > projFovHigh)
        {
            distance = 1;
            fn = 1;
        }
        else
        {
            // Apply sinus in out interpolation to smooth the transition
            fn = (fov - projFovLow) / (projFovHigh - projFovLow);
            distance = 0.5 * (1.0 + Math.sin(Math.PI / 2.0 * (2.0 * fn - 1)));
        }

        this._projectionDistance = distance;

        var fovRad = 0.5 * FORGE.Math.degToRad(fov);
        this._projectionScale = (distance + 1) * Math.sin(fovRad) / (distance + Math.cos(fovRad));
    }
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewGoPro#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewGoPro.prototype.updateUniforms = function(uniforms)
{
    this._updateViewParams();

    if (typeof uniforms === "undefined")
    {
        return;
    }

    if (uniforms.hasOwnProperty("tProjectionDistance"))
    {
        uniforms.tProjectionDistance.value = this._projectionDistance;
    }

    if (uniforms.hasOwnProperty("tProjectionScale"))
    {
        uniforms.tProjectionScale.value = this._projectionScale;
    }
};

/**
 * Convert a point from world space to screen space.
 *
 * @method FORGE.ViewGoPro#worldToScreen
 * @param {THREE.Vector3} worldPt - 3D point in world space
 * @param {number} parallaxFactor - parallax factor [0..1]
 * @return {?THREE.Vector2} point in screen coordinates
 */
FORGE.ViewGoPro.prototype.worldToScreen = function(worldPt, parallaxFactor)
{
    worldPt = worldPt || new THREE.Vector3();
    worldPt.normalize();
    parallaxFactor = parallaxFactor || 0;

    var worldPt4 = new THREE.Vector4(-worldPt.x, -worldPt.y, worldPt.z, 1.0);
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._viewer.camera.modelView);
    var rotation = FORGE.Math.eulerToRotationMatrix(camEuler.yaw, camEuler.pitch, -camEuler.roll, true);
    rotation = rotation.transpose();
    worldPt4.applyMatrix4(rotation);

    if (worldPt4.z > this._projectionDistance)
    {
        return null;
    }

    var alpha = (this._projectionDistance + 1) / (this._projectionDistance - worldPt4.z);
    var x = -worldPt4.x * alpha;
    var y = -worldPt4.y * alpha;

    x /= (1 + parallaxFactor) * this._projectionScale;
    y /= this._projectionScale;

    return this._fragmentToScreen(new THREE.Vector2(x, y));
};

/**
 * Convert a point from screen space to world space.
 *
 * @method FORGE.ViewGoPro#screenToWorld
 * @param {THREE.Vector2} screenPt - 2D point in screen space [0..w, 0..h]
 * @return {?THREE.Vector3} world point
 */
FORGE.ViewGoPro.prototype.screenToWorld = function(screenPt)
{
    var resolution = this._viewer.renderer.displayResolution;

    screenPt = screenPt || new THREE.Vector2(resolution.width / 2, resolution.height / 2);

    var widthMargin = FORGE.ViewRectilinear.OFF_SCREEN_MARGIN * resolution.width,
        heightMargin = FORGE.ViewRectilinear.OFF_SCREEN_MARGIN * resolution.height;
    if (screenPt.x < -widthMargin || screenPt.x > resolution.width + widthMargin
        || screenPt.y < -heightMargin || screenPt.y > resolution.height + heightMargin)
    {
        return null;
    }

    var fragment = this._screenToFragment(screenPt);
    fragment.multiplyScalar(this._projectionScale);

    var xy2 = fragment.dot(fragment);
    var zs12 = Math.pow(this._projectionDistance + 1, 2);
    var delta = 4 * (this._projectionDistance * this._projectionDistance * xy2 * xy2
                    - (xy2 + zs12) * (xy2 * this._projectionDistance * this._projectionDistance - zs12));

    if (delta < 0)
    {
        return null;
    }

    // world coordinates
    var worldPt = new THREE.Vector4();
    worldPt.z = (2 * this._projectionDistance * xy2 - Math.sqrt(delta)) / (2 * (zs12 + xy2));
    worldPt.x = fragment.x * ((this._projectionDistance - worldPt.z) / (this._projectionDistance + 1));
    worldPt.y = fragment.y * ((this._projectionDistance - worldPt.z) / (this._projectionDistance + 1));

    // move the point in the world system
    var camEuler = FORGE.Math.rotationMatrixToEuler(this._viewer.camera.modelView);
    var rotation = FORGE.Math.eulerToRotationMatrix(-camEuler.yaw, camEuler.pitch, -camEuler.roll, true);
    worldPt.applyMatrix4(rotation);

    return new THREE.Vector3(worldPt.x, -worldPt.y, worldPt.z).normalize();
};

/**
 * Get fov computed for projection.
 * @method FORGE.ViewGoPro#getProjectionFov
 */
FORGE.ViewGoPro.prototype.getProjectionFov = function()
{
    this._updateViewParams();

    var theta = 0.5 * FORGE.Math.degToRad(this._viewer.camera.fov);

    var radius = 1.0 - this._projectionDistance / 2.0;
    var offset = Math.abs(radius - 1);

    var fov = 2 * Math.atan2(radius * Math.sin(theta), offset + radius * Math.cos(theta));

    return fov;
};

/**
 * Destroy method.
 *
 * @method FORGE.ViewGoPro#destroy
 */
FORGE.ViewGoPro.prototype.destroy = function()
{
    FORGE.ViewBase.prototype.destroy.call(this);
};

