/**
 * Render parameters
 *
 * @constructor FORGE.RenderParams
 * @param {FORGE.Rectangle} rectangle render rectangle
 * @param {THREE.PerspectiveCamera} camera render camera
 */
FORGE.RenderParams = function(rectangle, camera)
{
    /**
     * Render rectangle.
     * @name FORGE.RenderParams#_rectangle
     * @type {FORGE.Rectangle}
     * @private
     */
    this._rectangle = rectangle || null;

    /**
     * Render camera.
     * @name FORGE.RenderParams#_camera
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._camera = camera || null;
};

FORGE.RenderParams.prototype.constructor = FORGE.RenderParams;

/**
 * Get rectangle.
 * @name FORGE.RenderParams#rectangle
 * @type {FORGE.Rectangle}
 */
Object.defineProperty(FORGE.RenderParams.prototype, "rectangle",
{
    /** @this {FORGE.RenderParams} */
    get: function()
    {
        return this._rectangle;
    }
});

/**
 * Get camera.
 * @name FORGE.RenderParams#camera
 * @type {THREE.PerspectiveCamera}
 */
Object.defineProperty(FORGE.RenderParams.prototype, "camera",
{
    /** @this {FORGE.RenderParams} */
    get: function()
    {
        return this._camera;
    }
});
