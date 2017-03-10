/**
 * Flat view class.
 *
 * @constructor FORGE.ViewFlat
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewFlat = function(viewer)
{
    FORGE.ViewBase.call(this, viewer, "ViewFlat", FORGE.ViewType.FLAT);

    /**
     * Repeat texture horizontally
     * @type {boolean}
     * @private
     */
    this._repeatX = false;

    /**
     * Repeat texture vertically
     * @type {boolean}
     * @private
     */
    this._repeatY = false;
    
    this._boot();
};

FORGE.ViewFlat.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewFlat.prototype.constructor = FORGE.ViewFlat;

/**
 * Background shader screen to world
 * @type {Object}
 */
FORGE.ViewFlat.prototype.shaderSTW = FORGE.ShaderLib.screenToWorld.flat;

/**
 * Background shader world to screen
 * @type {Object}
 */
FORGE.ViewFlat.prototype.shaderWTS = FORGE.ShaderLib.worldToScreen.rectilinear;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewFlat#_boot
 * @private
 */
FORGE.ViewFlat.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._yawMin = FORGE.Math.degToRad(-360);
    this._yawMax = FORGE.Math.degToRad(360);

    this._pitchMin = FORGE.Math.degToRad(-180);
    this._pitchMax = FORGE.Math.degToRad(180);

    this._fovMin = FORGE.Math.degToRad(20);
    this._fovMax = FORGE.Math.degToRad(180);
};

/**
 * Update view params.
 * @method FORGE.ViewFlat#_updateViewParams
 * @private
 */
FORGE.ViewFlat.prototype._updateViewParams = function()
{
    var vfov = FORGE.Math.degToRad(this._viewer.camera.fov);

    // When repeat is ON, set yaw and pitch min and max depending on
    // texture and screen ratios

    if (this._repeatX === false) {
        var hfov = vfov * this._viewer.renderer.displayResolution.ratio;
        var texRatio = this._viewer.renderer.backgroundRenderer.textureSize.ratio;
        this._yawMax = Math.max(0, (Math.PI / texRatio) - hfov * 0.5);
        this._yawMin = -this._yawMax;
    }

    if (this._repeatY === false) {
        this._pitchMax = 0.5 * Math.max(0, Math.PI - vfov);
        this._pitchMin = -this._pitchMax;
    }
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewFlat#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewFlat.prototype.updateUniforms = function(uniforms)
{
    this._updateViewParams();

    uniforms.tRepeatX.value = this._repeatX ? 1 : 0;
    uniforms.tRepeatY.value = this._repeatY ? 1 : 0;

    uniforms.tYaw.value = FORGE.Math.degToRad(this._viewer.camera.yaw);
    uniforms.tPitch.value = FORGE.Math.degToRad(this._viewer.camera.pitch);
    uniforms.tFov.value = FORGE.Math.degToRad(this._viewer.renderer.camera.fov);
};

/**
 * Convert a point from world space to screen space.
 *
 * @method FORGE.ViewFlat#worldToScreen
 * @param {THREE.Vector3} worldPt - 3D point in world space
 * @param {number} parallaxFactor - parallax factor [0..1]
 * @return {THREE.Vector2} point in screen coordinates
 */
FORGE.ViewFlat.prototype.worldToScreen = function(worldPt, parallaxFactor)
{
    return new THREE.Vector2();
};

/**
 * Convert a point from screen space to world space.
 *
 * @method FORGE.ViewFlat#screenToWorld
 * @param {THREE.Vector2} screenPt - 2D point in screen space [0..w, 0..h]
 * @return {THREE.Vector3} world point
 */
FORGE.ViewFlat.prototype.screenToWorld = function(screenPt)
{
    return new THREE.Vector3();
};

/**
 * Destroy method.
 *
 * @method FORGE.ViewFlat#destroy
 */
FORGE.ViewFlat.prototype.destroy = function()
{
    FORGE.ViewBase.prototype.destroy.call(this);
};

