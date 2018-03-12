/**
 * ScreenMaterialBlend class.
 *
 * @constructor FORGE.ScreenMaterialBlend
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenMaterialBlend = function(viewer)
{
    /**
     * Image used for the mix.
     * @name FORGE.ScreenMaterialBlend#_mixMediaUid
     * @type {FORGE.MediaImage}
     * @private
     */
    this._mixMediaUid = null;

    FORGE.ScreenMaterial.call(this, viewer, "ScreenMaterialBlend");
};

FORGE.ScreenMaterialBlend.prototype = Object.create(FORGE.ScreenMaterial.prototype);
FORGE.ScreenMaterialBlend.prototype.constructor = FORGE.ScreenMaterialBlend;

/**
 * Load sequence.
 * @method FORGE.ScreenMaterialBlend#_load
 * @private
 */
FORGE.ScreenMaterialBlend.prototype._load = function()
{
    var media = this._viewer.media.add({ type: "image", "source": { "url": "transition/transition1.png" }});
    this._mixMediaUid = media.uid;
    media.onLoadComplete.addOnce(this._mediaLoadCompleteHandler, this);
    media.load();
};

/**
 * Media load complete handler.
 * @method FORGE.ScreenMaterialBlend#_mediaLoadCompleteHandler
 * @private
 */
FORGE.ScreenMaterialBlend.prototype._mediaLoadCompleteHandler = function(event)
{
    this._shaderMaterial = this._build();

    this._shaderMaterial.uniforms.tTextureMix.value = event.emitter.texture.texture;

    this._onReady.dispatch();
};

/**
 * Build material object.
 * @method FORGE.ScreenMaterialBlend#_build
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.ScreenMaterialBlend.prototype._build = function()
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
            "float mixf = 1.0 - clamp((transitionTexel.r - r) * (1.0 / tThreshold), 0.0, 1.0);",
            "gl_FragColor = mix(texelOne, texelTwo, mixf );",

            // "gl_FragColor = mix(texelOne, texelTwo, tMixRatio );",

        "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};

/**
 * Update sequence.
 * @method FORGE.ScreenMaterialBlend#update
 */
FORGE.ScreenMaterialBlend.prototype.update = function()
{
    this._shaderMaterial.uniforms.tMixRatio.value = this._viewer.renderer.loader.transition.ratio;

    if(this._viewer.story.sceneUid !== "")
    {
        var rendererOne = this._viewer.renderer.scenes.get(this._viewer.story.sceneUid);
        this._shaderMaterial.uniforms.tTextureOne.value = rendererOne.texture;
    }

    if(this._viewer.story.loadingSceneUid !== "")
    {
        var rendererTwo = this._viewer.renderer.scenes.get(this._viewer.story.loadingSceneUid);

        if (typeof rendererTwo !== "undefined")
        {
            this._shaderMaterial.uniforms.tTextureTwo.value = rendererTwo.texture;
        }
    }

    this._shaderMaterial.uniforms.tResolution.value.x = this._viewer.width;
    this._shaderMaterial.uniforms.tResolution.value.y = this._viewer.height;
};