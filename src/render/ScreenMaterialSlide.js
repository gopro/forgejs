/**
 * ScreenMaterialSlide class.
 *
 * @constructor FORGE.ScreenMaterialSlide
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenMaterialSlide = function(viewer)
{
    FORGE.ScreenMaterial.call(this, viewer, "ScreenMaterialSlide");
};

FORGE.ScreenMaterialSlide.prototype = Object.create(FORGE.ScreenMaterial.prototype);
FORGE.ScreenMaterialSlide.prototype.constructor = FORGE.ScreenMaterialSlide;

/**
 * Build material object.
 * @method FORGE.ScreenMaterialSlide#_build
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.ScreenMaterialSlide.prototype._build = function()
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

            "float mixf = step(tMixRatio, xy.x);",
            "vec4 texelOne = texture2D(tTextureOne, vUv - vec2(tMixRatio, 0.0));",
            "vec4 texelTwo = texture2D(tTextureTwo, clamp(vUv + vec2(1.0 - tMixRatio, 0.0), vec2(0.0), vec2(1.0)));",
            "gl_FragColor = mix(texelTwo, texelOne, mixf);",

        "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};

/**
 * Get and set the mix ratio uniform.
 * @name FORGE.ScreenMaterialSlide#mixRatio
 * @type {number}
 */
Object.defineProperty(FORGE.ScreenMaterialSlide.prototype, "mixRatio",
{
    /** @this {FORGE.ScreenMaterialSlide} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tMixRatio.value;
    },

    /** @this {FORGE.ScreenMaterialSlide} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._shaderMaterial.uniforms.tMixRatio.value = FORGE.Math.clamp(value, 0, 1);
        }
    }
});

/**
 * Get and set the texture two uniform.
 * @name FORGE.ScreenMaterialSlide#textureTwo
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.ScreenMaterialSlide.prototype, "textureTwo",
{
    /** @this {FORGE.ScreenMaterialSlide} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tTextureTwo.value;
    },

    /** @this {FORGE.ScreenMaterialSlide} */
    set: function(value)
    {
        this._shaderMaterial.uniforms.tTextureTwo.value = value;
    }
});
