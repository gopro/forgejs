/**
 * Size object.
 *
 * @constructor FORGE.Size
 * @param {number} width width property
 * @param {number} height height property
 */
FORGE.Size = function(width, height)
{
    /**
     * Width.
     * @name FORGE.Size#_width
     * @type {number}
     * @private
     */
    this._width = width || 0;

    /**
     * Height.
     * @name FORGE.Size#_height
     * @type {number}
     * @private
     */
    this._height = height || 0;
};

FORGE.Size.prototype.constructor = FORGE.Size;


/**
 * Get width.
 * @name FORGE.Size#width
 * @type {number}
 */
Object.defineProperty(FORGE.Size.prototype, "width",
{
    /** @this {FORGE.Size} */
    get: function()
    {
        return this._width;
    }
});

/**
 * Get height.
 * @name FORGE.Size#height
 * @type {number}
 */
Object.defineProperty(FORGE.Size.prototype, "height",
{
    /** @this {FORGE.Size} */
    get: function()
    {
        return this._height;
    }
});

/**
 * Get ratio.
 * @name FORGE.Size#ratio
 * @type {number}
 */
Object.defineProperty(FORGE.Size.prototype, "ratio",
{
    /** @this {FORGE.Size} */
    get: function()
    {
        return this._width / this._height;
    }
});

/**
 * Get size as THREE.Vector2.
 * @name FORGE.Size#vector
 * @type {THREE.Vector2}
 */
Object.defineProperty(FORGE.Size.prototype, "vector2",
{
    /** @this {FORGE.Size} */
    get: function()
    {
        return new THREE.Vector2(this._width, this._height);
    }
});
