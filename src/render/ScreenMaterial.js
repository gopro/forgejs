/**
 * ScreenMaterial class.
 *
 * @constructor FORGE.ScreenMaterial
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {string} className - The name of the class for child classes.
 * @extends {FORGE.BaseObject}
 */
FORGE.ScreenMaterial = function(viewer, className)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneRendererPool#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The raw shader material.
     * @name FORGE.ScreenMaterial#_shaderMaterial
     * @type {THREE.RawShaderMaterial}
     * @private
     */
    this._shaderMaterial = null;

    /**
     * On ready event dispatcher
     * @name FORGE.ScreenMaterial#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    FORGE.BaseObject.call(this, className || "ScreenMaterial");

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
    this._onReady = new FORGE.EventDispatcher(this, true);

    this._load();
};

/**
 * Method used to load assets for the material if any.
 * builds the material once load complete and dispatch ready.
 * @method FORGE.ScreenMaterial#_load
 * @private
 */
FORGE.ScreenMaterial.prototype._load = function()
{
    this._shaderMaterial = this._build();

    this._onReady.dispatch();
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
        tTextureOne: { value: null },
        tResolution: { value: new THREE.Vector2() }
    };

    var vertexShader = FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_vert_rectilinear);

    var fragmentShader =
    [
        "precision highp float;",

        "varying vec2 vUv;",

        "uniform sampler2D tTextureOne;",
        "uniform vec2 tResolution;",

        "void main() {",

            "gl_FragColor = texture2D(tTextureOne, gl_FragCoord.xy / tResolution);",

        "}"

    ].join("\n");

    return new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};

/**
 * Update sequence.
 * @method FORGE.ScreenMaterial#update
 */
FORGE.ScreenMaterial.prototype.update = function()
{
    if(this._viewer.story.sceneUid !== "")
    {
        var renderer = this._viewer.renderer.scenes.get(this._viewer.story.sceneUid);
        this._shaderMaterial.uniforms.tTextureOne.value = renderer.texture;
    }

    this._shaderMaterial.uniforms.tResolution.value.x = this._viewer.width;
    this._shaderMaterial.uniforms.tResolution.value.y = this._viewer.height;
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
 * Get the onReady {@link FORGE.EventDispatcher}.
 * @name FORGE.ScreenMaterial#onReady
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.ScreenMaterial.prototype, "onReady",
{
    /** @this {FORGE.ScreenMaterial} */
    get: function()
    {
        return this._onReady;
    }
});