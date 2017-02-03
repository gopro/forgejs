/**
 * @constructor FORGE.AdditionPass
 * @param {FORGE.EffectComposer} composer - effect composer reference
 * @extends {FORGE.ShaderPass}
 */
FORGE.AdditionPass = function(composer)
{
    /**
     * Reference on composer rendering texture to be added by the pass
     * @name FORGE.AdditionPass#_enabled
     * @type {FORGE.EffectComposer}
     * @private
     */
    this._composer = composer;

    /**
     * Shader material
     * @name FORGE.AdditionPass#_material
     * @type {THREE.Material}
     * @private
     */
    this._material = null;

    var vertexShader = FORGE.ShaderLib.parseIncludes( FORGE.ShaderChunk.wts_vert_rectilinear );
    var fragmentShader = FORGE.ShaderLib.parseIncludes( FORGE.ShaderChunk.wts_frag_addition );

    /** @type (FORGEUniform) */
    var uniforms =
    {
        tTexture: { type: "t", value: null },
        tAdd: { type: "t", value: null }
    };

    this._material = new THREE.RawShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: uniforms,
        side: THREE.FrontSide,
        name: "FORGE.AdditionPassMaterial"
    });

    FORGE.ShaderPass.call(this, "", "Addition", this._material, "tTexture");
};

FORGE.AdditionPass.prototype = Object.create(FORGE.ShaderPass.prototype);
FORGE.AdditionPass.prototype.constructor = FORGE.AdditionPass;

/**
 * Boot sequence
 * @method FORGE.AdditionPass#_boot
 * @private
 */
FORGE.AdditionPass.prototype._boot = function()
{

};

/**
 * Destroy sequence
 * @method FORGE.AdditionPass#destroy
 */
FORGE.AdditionPass.prototype.destroy = function()
{
    if (this._material === null)
    {
        this._material.dispose();
        this._material = null;
    }

    this._composer = null;
};

/**
 * Get linked AdditionPass
 * @name FORGE.AdditionPass#composer
 * @type {FORGE.EffectComposer}
 */
Object.defineProperty(FORGE.AdditionPass.prototype, "composer",
{
    /** @this {FORGE.AdditionPass} */
    get: function()
    {
        return this._composer;
    }
});
