/**
 * Shader Pass for FX rendering
 *
 * @constructor FORGE.ShaderPass
 * @param {Object} shader shader object
 * @param {string=} textureID uniform texture string identifier
 * @extends {THREE.ShaderPass}
 */
FORGE.ShaderPass = function(shader, textureID)
{
    /**
     * Bypass flag
     * @name FORGE.ShaderPass#_bypass
     * @type {boolean}
     * @private
     */
    this._bypass = false;

    /**
     * Copy pass
     * @name FORGE.ShaderPass#_copyPass
     * @type {THREE.Pass}
     * @private
     */
    this._copyPass = new THREE.ShaderPass(THREE.CopyShader);

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
    if (this._bypass === true)
    {
        this._copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
    }
    else
    {
        THREE.ShaderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta, maskActive);
    }
};

/**
 * Destroy sequence
 * @method FORGE.ShaderPass#destroy
 */
FORGE.ShaderPass.prototype.destroy = function()
{
    this.textureID = null;

    this._copyPass = null;

    this.scene.remove(this.quad);
    this.scene = null;

    FORGE.Utils.destroyMesh(this.quad);

    this.material = null;
    this.uniforms = null;
    this.camera = null;
};

/**
 * Get/Set the bypass flag.
 * @name FORGE.FX#bypass
 * @type {boolean}
 */
Object.defineProperty(FORGE.ShaderPass.prototype, "bypass",
{
    /** @this {FORGE.FX} */
    get: function()
    {
        return this._bypass;
    },

    /** @this {FORGE.FX} */
    set: function(value)
    {
        this._bypass = value;
    }
});
