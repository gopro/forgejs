/**
 * GoPro view class.
 *
 * @constructor FORGE.ViewGoPro
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewGoPro = function(viewer)
{
    /**
     * Projection distance.
     * @name FORGE.ViewGoPro#_projectionDistance
     * @type {number}
     * @private
     */
    this._projectionDistance = 0;

    FORGE.ViewBase.call(this, viewer, "ViewGoPro", FORGE.ViewType.GOPRO);

    this._boot();
};

FORGE.ViewGoPro.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewGoPro.prototype.constructor = FORGE.ViewGoPro;

/**
 * Background shader screen to world
 * @type {ScreenToWorldProgram}
 */
FORGE.ViewGoPro.prototype.shaderSTW = FORGE.ShaderLib.screenToWorld.gopro;

/**
 * Background shader world to screen
 * @type {WorldToScreenProgram}
 */
FORGE.ViewGoPro.prototype.shaderWTS = FORGE.ShaderLib.worldToScreen.gopro;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewGoPro#_boot
 * @private
 */
FORGE.ViewGoPro.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._fovMin = 30;
    this._fovMax = 330;
};

/**
 * Update view params.
 * @method FORGE.ViewGoPro#_updateViewParams
 * @private
 */
FORGE.ViewGoPro.prototype._updateViewParams = function()
{
    var projFovLow = 90;
    var projFovHigh = 180;
    var distance = 0;

    var fov = FORGE.Math.clamp(this._viewer.camera.fov, this._viewer.camera.fovMin, this._viewer.camera.fovMax);

    var fn = 0;

    if (fov < projFovLow)
    {
        distance = 0;
    }
    else if (fov > projFovHigh)
    {
        distance = 1;
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

