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

            "float mixf = 1.0 - step(tMixRatio, xy.x);",
            "vec4 texelOne = texture2D(tTextureOne, vUv - vec2(tMixRatio, 0.0));",
            "vec4 texelTwo = texture2D(tTextureTwo, vUv + vec2(1.0 - tMixRatio, 0.0));",
            "gl_FragColor = mix(texelOne, texelTwo, mixf);",

        "}"

        // "void main() {",

        //     "vec2 xy = gl_FragCoord.xy / tResolution.xy;",

        //     "float mixf = 1.0 - step(1.0 - tMixRatio, xy.x);",
        //     "vec4 texelOne = texture2D(tTextureOne, vUv - vec2(1.0 - tMixRatio, 0.0));",
        //     "vec4 texelTwo = texture2D(tTextureTwo, vUv + vec2(tMixRatio, 0.0));",
        //     "gl_FragColor = mix(texelOne, texelTwo, mixf);",

        // "}"

        // "void main() {",

        //     "vec2 xy = gl_FragCoord.xy / tResolution.xy;",

        //     "float mixf = 1.0 - step(1.0 - tMixRatio, xy.x);",
        //     "vec4 texelOne = texture2D(tTextureOne, vUv + vec2(tMixRatio, 0.0));",
        //     "vec4 texelTwo = texture2D(tTextureTwo, vUv - vec2(1.0 - tMixRatio, 0.0));",
        //     "gl_FragColor = mix(texelOne, texelTwo, mixf);",

        // "}"

        // "void main() {",

        //     "vec2 xy = gl_FragCoord.xy / tResolution.xy;",

        //     "float mixf = 1.0 - step(1.0 - tMixRatio, xy.x);",
        //     "vec4 texelOne = vec4(1, 0, 0, 1);",
        //     "vec4 texelTwo = vec4(0, 1, 0, 1);",
        //     "gl_FragColor = mix(texelOne, texelTwo, mixf);",

        // "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};

/**
 * Update sequence.
 * @method FORGE.ScreenMaterialSlide#update
 */
FORGE.ScreenMaterialSlide.prototype.update = function()
{
    this._shaderMaterial.uniforms.tMixRatio.value = this._viewer.transitions.current.ratio;

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