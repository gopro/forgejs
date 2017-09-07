/**
 * Used to feed time to shader when uniform is declared
 *
 * @constructor FORGE.ShaderPass
 * @param {string} uid unique identifier
 * @param {string} type shader type
 * @param {Object} shader shader object
 * @param {string=} textureID uniform texture string identifier
 * @extends {THREE.ShaderPass}
 */
FORGE.ShaderPass = function(uid, type, shader, textureID)
{
    /**
     * Unique id
     * @name FORGE.ShaderPass#_uid
     * @type {string}
     * @private
     */
    this._uid = uid;

    /**
     * Shader pass type.
     * @name FORGE.ShaderPass#_type
     * @type {string}
     * @private
     */
    this._type = type || "shader";

    /**
     * Rendering position.
     * @name FORGE.ShaderPass#_position
     * @type {string}
     * @private
     */
    this._position = FORGE.PassPosition.UNKNOWN;

    /**
     * Sum of clock deltas.
     * @name FORGE.ShaderPass#_deltaSum
     * @type {number}
     * @private
     */
    this._deltaSum = 0;

    THREE.ShaderPass.call(this, shader, textureID || "tDiffuse");
};

FORGE.ShaderPass.prototype = Object.create(THREE.ShaderPass.prototype);
FORGE.ShaderPass.prototype.constructor = FORGE.ShaderPass;

/**
 * @method  FORGE.ShaderPass#render
 * @param  {THREE.WebGLRenderer} renderer
 * @param  {THREE.WebGLRenderTarget} writeBuffer
 * @param  {THREE.WebGLRenderTarget} readBuffer
 * @param  {number=} delta
 * @param  {boolean=} maskActive
 */
FORGE.ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive)
{
    this._deltaSum += delta;

    if (this.uniforms.hasOwnProperty("time"))
    {
        this.uniforms["time"].value = this._deltaSum;
    }

    THREE.ShaderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta, maskActive);
};

/**
 * Get ShaderPass uid
 * @name FORGE.ShaderPass#uid
 * @type {string}
 */
Object.defineProperty(FORGE.ShaderPass.prototype, "uid",
{
    /** @this {FORGE.ShaderPass} */
    get: function()
    {
        return this._uid;
    }
});

/**
 * Get ShaderPass type
 * @name FORGE.ShaderPass#type
 * @type {string}
 */
Object.defineProperty(FORGE.ShaderPass.prototype, "type",
{
    /** @this {FORGE.ShaderPass} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get ShaderPass position
 * @name FORGE.ShaderPass#position
 * @type {string}
 */
Object.defineProperty(FORGE.ShaderPass.prototype, "position",
{
    /** @this {FORGE.ShaderPass} */
    get: function()
    {
        return this._position;
    },

    /** @this {FORGE.ShaderPass} */
    set: function(position)
    {
        this._position = position;
    }
});
