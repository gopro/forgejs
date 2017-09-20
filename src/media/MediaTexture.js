/**
 * This object stores a THREE.Texture used for multi resolutions scene. It is
 * simplier (in terms of memory to store this object as it is tinier than a
 * FORGE.Image. It also remove the fact that we need to create a THREE.Texture
 * in the renderer.
 *
 * @constructor FORGE.MediaTexture
 * @param {THREE.Texture} texture - the THREE.Texture to store
 * @param {boolean} locked - is the texture locked (i.e. it isn't deletable)
 * @param {number} size - the size of the texture
 */
FORGE.MediaTexture = function(texture, locked, size)
{
    /**
     * The texture
     * @name FORGE.MediaTexture#_texture
     * @type {THREE.Texture}
     * @private
     */
    this._texture = texture;

    /**
     * Can the texture be deleted ? Otherwise it is locked, e.g. it is a level 0
     * @name FORGE.MediaTexture#_locked
     * @type {boolean}
     * @private
     */
    this._locked = locked;

    /**
     * The size of the texture
     * @name FORGE.MediaTexture#_size
     * @type {number}
     * @private
     */
    this._size = size;

    /**
     * The time the texture was last used
     * @name FORGE.MediaTexture#_lastTime
     * @type {number}
     * @private
     */
    this._lastTime = window.performance.now();

    /**
     * The number of times the texture was used
     * @name FORGE.MediaTexture#_count
     * @type {number}
     * @private
     */
    this._count = 0;
};

FORGE.MediaTexture.prototype.constructor = FORGE.MediaTexture;

/**
 * Destroy routine
 * @method FORGE.MediaTexture#destroy
 */
FORGE.MediaTexture.prototype.destroy = function()
{
    if (this._texture !== null)
    {
        this._texture.dispose();
    }

    this._texture = null;
};

/**
 * Get the texture.
 * @name  FORGE.MediaTexture#texture
 * @type {THREE.Texture}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTexture.prototype, "texture",
{
    /** @this {FORGE.MediaTexture} */
    get: function()
    {
        this._count++;
        this._lastTime = window.performance.now();

        return this._texture;
    }
});

/**
 * Is the texture locked ?
 * @name  FORGE.MediaTexture#locked
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTexture.prototype, "locked",
{
    /** @this {FORGE.MediaTexture} */
    get: function()
    {
        return this._locked;
    }
});

/**
 * Get the size of the texture
 * @name  FORGE.MediaTexture#size
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTexture.prototype, "size",
{
    /** @this {FORGE.MediaTexture} */
    get: function()
    {
        return this._size;
    }
});

/**
 * Get the last time when it was called.
 * @name  FORGE.MediaTexture#lastTime
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTexture.prototype, "lastTime",
{
    /** @this {FORGE.MediaTexture} */
    get: function()
    {
        return this._lastTime;
    }
});

/**
 * Get the number of times it was called.
 * @name  FORGE.MediaTexture#count
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTexture.prototype, "count",
{
    /** @this {FORGE.MediaTexture} */
    get: function()
    {
        return this._count;
    }
});
