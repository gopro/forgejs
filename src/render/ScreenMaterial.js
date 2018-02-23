/**
 * ScreenMaterial class.
 *
 * @constructor FORGE.ScreenMaterial
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenMaterial = function()
{
    /**
     * The raw shader material.
     * @name FORGE.ScreenMaterial#_shaderMaterial
     * @type {THREE.RawShaderMaterial}
     * @private
     */
    this._shaderMaterial = null;

    FORGE.BaseObject.call(this, "ScreenMaterial");

    this._boot();
};

FORGE.ScreenMaterial.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ScreenMaterial.prototype.constructor = FORGE.ScreenMaterial;

/**
 * Boot sequence.
 * @method FORGE.ScreenMaterial#_boot
 * @private
 */
FORGE.ScreenMaterial.prototype._boot = function()
{
    this._shaderMaterial = this._build();
};

/**
 * Build material object.
 * @method FORGE.ScreenMaterial#_build
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.ScreenMaterial.prototype._build = function()
{
    var uniforms =
    {
        tMixRatio: { value: 1.0 },
        tTextureOne: { value: null },
        tTextureTwo: { value: null },
        tResolution: { value: new THREE.Vector2() }
    };

    var vertexShader = FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_vert_rectilinear);

    var fragmentShader =
    [
        "precision highp float;",

        "varying vec2 vUv;",

        "uniform float tMixRatio;",
        "uniform sampler2D tTextureOne;",
        "uniform sampler2D tTextureTwo;",
        "uniform vec2 tResolution;",

        "void main() {",

            "vec2 xy = gl_FragCoord.xy / tResolution.xy;",

            "float edgeMix = step(tMixRatio, xy.x);",
            "vec4 texelR = texture2D( tTextureOne, vUv - vec2(tMixRatio, 0.0));",
            "vec4 texelL = texture2D( tTextureTwo, clamp(vUv + vec2(1.0 - tMixRatio, 0.0), vec2(0.0), vec2(1.0)));",
            "gl_FragColor = mix( texelL, texelR, edgeMix );",

        "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};


/**
 * Destroy sequence.
 * @method FORGE.ScreenMaterial#destroy
 */
FORGE.ScreenMaterial.prototype.destroy = function()
{
    this._shaderMaterial.dispose();
    this._shaderMaterial = null;
};

/**
 * Get the raw shader material.
 * @name FORGE.ScreenMaterial#shaderMaterial
 * @type {THREE.RawShaderMaterial}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "shaderMaterial",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._shaderMaterial;
    }
});

/**
 * Get and set the mix ratio uniform.
 * @name FORGE.ScreenMaterial#mixRatio
 * @type {number}
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "mixRatio",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tMixRatio.value;
    },

    /** @this {FORGE.ScreenMaterial} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._shaderMaterial.uniforms.tMixRatio.value = FORGE.Math.clamp(value, 0, 1);
        }
    }
});

/**
 * Get and set the texture one uniform.
 * @name FORGE.ScreenMaterial#textureOne
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "textureOne",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tTextureOne.value;
    },

    /** @this {FORGE.ScreenMaterial} */
    set: function(value)
    {
        this._shaderMaterial.uniforms.tTextureOne.value = value;
    }
});

/**
 * Get and set the texture two uniform.
 * @name FORGE.ScreenMaterial#textureTwo
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "textureTwo",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tTextureTwo.value;
    },

    /** @this {FORGE.ScreenMaterial} */
    set: function(value)
    {
        this._shaderMaterial.uniforms.tTextureTwo.value = value;
    }
});

/**
 * Get and set the resolution uniform.
 * @name FORGE.ScreenMaterial#resolution
 * @type {THREE.Vector2}
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "resolution",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tResolution.value;
    },

    /** @this {FORGE.ScreenMaterial} */
    set: function(value)
    {
        this._shaderMaterial.uniforms.tResolution.value = value;
    }
});