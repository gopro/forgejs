/**
 * @constructor FORGE.RenderPass
 * @param {THREE.Scene} scene - scene to be rendered
 * @param {THREE.Camera} camera - rendering camera
 * @param {THREE.Material=} overrideMaterial - optional override material
 * @param {THREE.Color=} clearColor - optional clear color
 * @param {boolean=} clearAlpha - optional clear alpha
 * @extends {THREE.RenderPass}
 */
FORGE.RenderPass = function( scene, camera, overrideMaterial, clearColor, clearAlpha )
{
    /**
     * Rendering position.
     * @name FORGE.RenderPass#_position
     * @type {string}
     * @private
     */
    this._position = "";

    THREE.RenderPass.call(this, scene, camera, overrideMaterial, clearColor, clearAlpha);
};

FORGE.RenderPass.prototype = Object.create(THREE.RenderPass.prototype);
FORGE.RenderPass.prototype.constructor = FORGE.RenderPass;

/**
 * Get RenderPass position
 * @name FORGE.RenderPass#position
 * @type {string}
 */
Object.defineProperty(FORGE.RenderPass.prototype, "position",
{
    /** @this {FORGE.RenderPass} */
    get: function()
    {
        return this._position;
    },

    /** @this {FORGE.RenderPass} */
    set: function(position)
    {
        this._position = position;
    }
});
