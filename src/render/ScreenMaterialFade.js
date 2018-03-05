/**
 * ScreenMaterialFade class.
 *
 * @constructor FORGE.ScreenMaterialFade
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenMaterialFade = function(viewer)
{
    /**
     * Image used for the mix.
     * @name FORGE.ScreenMaterialFade#_mixMediaUid
     * @type {FORGE.MediaImage}
     * @private
     */
    this._mixMediaUid = null;

    FORGE.ScreenMaterial.call(this, viewer, "ScreenMaterialFade");
};

FORGE.ScreenMaterialFade.prototype = Object.create(FORGE.ScreenMaterial.prototype);
FORGE.ScreenMaterialFade.prototype.constructor = FORGE.ScreenMaterialFade;

/**
 * Load sequence.
 * @method FORGE.ScreenMaterialFade#_load
 * @private
 */
FORGE.ScreenMaterialFade.prototype._load = function()
{
    var media = this._viewer.media.add({ type: "image", "source": { "url": "transition/transition3.png" }});
    this._mixMediaUid = media.uid;
    media.onLoadComplete.addOnce(this._mediaLoadCompleteHandler, this);
    media.load();
};

/**
 * Media load complete handler.
 * @method FORGE.ScreenMaterialFade#_mediaLoadCompleteHandler
 * @private
 */
FORGE.ScreenMaterialFade.prototype._mediaLoadCompleteHandler = function(event)
{
    this._shaderMaterial = this._build();

    this._shaderMaterial.uniforms.tTextureMix.value = event.emitter.texture.texture;

    this._onReady.dispatch();
};

/**
 * Build material object.
 * @method FORGE.ScreenMaterialFade#_build
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.ScreenMaterialFade.prototype._build = function()
{
    var uniforms =
    {
        tMixRatio: { value: 1.0 },
        tTextureOne: { value: null },
        tTextureTwo: { value: null },
        tTextureMix: { value: null },
        tThreshold: { value: 0.5 },
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
        "uniform sampler2D tTextureMix;",
        "uniform float tThreshold;",
        "uniform vec2 tResolution;",

        "void main() {",

            "vec4 texelOne = texture2D(tTextureOne, vUv);",
            "vec4 texelTwo = texture2D(tTextureTwo, vUv);",
            "vec4 transitionTexel = texture2D(tTextureMix, vUv);",
            "float r = tMixRatio * (1.0 + tThreshold * 2.0) - tThreshold;",
            "float mixf = clamp((transitionTexel.r - r) * (1.0 / tThreshold), 0.0, 1.0);",
            "gl_FragColor = mix(texelTwo, texelOne, mixf );",

        "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};


/**
 * Destroy sequence.
 * @method FORGE.ScreenMaterialFade#destroy
 */
FORGE.ScreenMaterialFade.prototype.destroy = function()
{
    this._shaderMaterial.dispose();
    this._shaderMaterial = null;
};

/**
 * Get and set the mix ratio uniform.
 * @name FORGE.ScreenMaterialFade#mixRatio
 * @type {number}
 */
Object.defineProperty(FORGE.ScreenMaterialFade.prototype, "mixRatio",
{
    /** @this {FORGE.ScreenMaterialFade} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tMixRatio.value;
    },

    /** @this {FORGE.ScreenMaterialFade} */
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
 * @name FORGE.ScreenMaterialFade#textureTwo
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.ScreenMaterialFade.prototype, "textureTwo",
{
    /** @this {FORGE.ScreenMaterialFade} */
    get: function()
    {
        return this._shaderMaterial.uniforms.tTextureTwo.value;
    },

    /** @this {FORGE.ScreenMaterialFade} */
    set: function(value)
    {
        this._shaderMaterial.uniforms.tTextureTwo.value = value;
    }
});
