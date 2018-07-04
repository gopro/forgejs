/**
 * Shader class.
 *
 * @constructor FORGE.Shader
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {string} className - The name of the class for child classes.
 * @extends {FORGE.BaseObject}
 */
FORGE.Shader = function(viewer, className)
{
    /**
     * The viewer reference.
     * @name FORGE.Shader#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The raw shader material.
     * @name FORGE.Shader#_material
     * @type {THREE.RawShader}
     * @private
     */
    this._material = null;

    /**
     * On ready event dispatcher
     * @name FORGE.Shader#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    FORGE.BaseObject.call(this, className || "Shader");

    this._boot();
};

FORGE.Shader.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Shader.prototype.constructor = FORGE.Shader;

/**
 * Boot sequence.
 * @method FORGE.Shader#_boot
 * @private
 */
FORGE.Shader.prototype._boot = function()
{
    this._onReady = new FORGE.EventDispatcher(this, true);

    this._load();
};

/**
 * Method used to load assets for the material if any.
 * builds the material once load complete and dispatch ready.
 * @method FORGE.Shader#_load
 * @private
 */
FORGE.Shader.prototype._load = function()
{
    this._material = this._build();

    this._onReady.dispatch();
};

/**
 * Build material object.
 * @method FORGE.Shader#_build
 * @return {THREE.RawShader} shader material
 * @private
 */
FORGE.Shader.prototype._build = function()
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

        "varying vec2 vUVCoord;",

        "uniform sampler2D tTextureOne;",
        "uniform vec2 tResolution;",

        "void main()",
        "{",
            "gl_FragColor = texture2D(tTextureOne, gl_FragCoord.xy / tResolution);",
        "}"

    ].join("\n");

    return new THREE.RawShader({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
};

/**
 * Update sequence.
 * @method FORGE.Shader#update
 */
FORGE.Shader.prototype.update = function()
{
    // Update the uniforms here
};

/**
 * Destroy sequence.
 * @method FORGE.Shader#destroy
 */
FORGE.Shader.prototype.destroy = function()
{
    this._viewer = null;

    this._material.dispose();
    this._material = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the raw shader material.
 * @name FORGE.Shader#material
 * @type {THREE.RawShaderMaterial}
 * @readonly
 */
Object.defineProperty(FORGE.Shader.prototype, "material",
{
    /** @this {FORGE.Shader} */
    get: function()
    {
        return this._material;
    }
});

/**
 * Get the onReady {@link FORGE.EventDispatcher}.
 * @name FORGE.Shader#onReady
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.Shader.prototype, "onReady",
{
    /** @this {FORGE.Shader} */
    get: function()
    {
        return this._onReady;
    }
});