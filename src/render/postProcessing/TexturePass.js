/**
 * @constructor FORGE.TexturePass
 * @param {THREE.Texture} map - map texture
 * @param {number=} opacity - opacity
 * @extends {THREE.TexturePass}
 */
FORGE.TexturePass = function( map, opacity )
{
    /**
     * Rendering position.
     * @name FORGE.TexturePass#_position
     * @type {string}
     * @private
     */
    this._position = "";

    THREE.TexturePass.call(this, map, opacity);
};

FORGE.TexturePass.prototype = Object.create(THREE.TexturePass.prototype);
FORGE.TexturePass.prototype.constructor = FORGE.TexturePass;

/**
 * Get TexturePass position
 * @name FORGE.TexturePass#position
 * @type {string}
 */
Object.defineProperty(FORGE.TexturePass.prototype, "position",
{
    /** @this {FORGE.TexturePass} */
    get: function()
    {
        return this._position;
    },

    /** @this {FORGE.TexturePass} */
    set: function(position)
    {
        this._position = position;
    }
});
