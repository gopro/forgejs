/**
 * Flat view class.
 *
 * @constructor FORGE.ViewFlat
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Camera} camera - {@link FORGE.Camera} reference
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewFlat = function(viewer, camera)
{
    FORGE.ViewBase.call(this, viewer, camera, "ViewFlat", FORGE.ViewType.FLAT);

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
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewFlat#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewFlat.prototype.updateUniforms = function(uniforms)
{
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

