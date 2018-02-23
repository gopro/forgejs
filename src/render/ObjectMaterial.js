/**
 * ObjectMaterial class.
 *
 * @constructor FORGE.ObjectMaterial
 * @param {string} view - The view type of the material.
 * @param {string} type - The shader type of the material. (map, color, pick, wireframe)
 * @param {boolean} transparent - Is the material is transparent?
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectMaterial = function(view, type, transparent)
{
    /**
     * The raw shader material.
     * @name FORGE.ObjectMaterial#_shaderMaterial
     * @type {THREE.RawShaderMaterial}
     * @private
     */
    this._shaderMaterial = null;

    /**
     * The view type of the material.
     * @name FORGE.ObjectMaterial#_view
     * @type {string}
     * @private
     */
    this._view = view;

    /**
     * The type of the material.
     * Must be in {@link FORGE.ObjectMaterialType}
     * @name FORGE.ObjectMaterial#_type
     * @type {string}
     * @private
     */
    this._type = type;

    /**
     * is this material is transparent?
     * @name FORGE.ObjectMaterial#_transparent
     * @type {boolean}
     * @private
     */
    this._transparent = typeof transparent === "boolean" ? transparent : false;

    FORGE.BaseObject.call(this, "ObjectMaterial");

    this._boot();
};

FORGE.ObjectMaterial.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ObjectMaterial.prototype.constructor = FORGE.ObjectMaterial;

/**
 * Boot sequence.
 * @method FORGE.ObjectMaterial#_boot
 * @private
 */
FORGE.ObjectMaterial.prototype._boot = function()
{
    this._shaderMaterial = this._build();
};

/**
 * Build material object.
 * @method FORGE.ObjectMaterial#_build
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.ObjectMaterial.prototype._build = function()
{
    var shader = FORGE.Utils.clone(FORGE.ShaderLib.worldToScreen[this._view][this._type]);
    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    var material = new THREE.RawShaderMaterial(
    {
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        side: THREE.FrontSide,
        needsUpdate: true,
        transparent: this._transparent
    });

    return material;
};

/**
 * Destroy sequence.
 * @method FORGE.ObjectMaterial#destroy
 */
FORGE.ObjectMaterial.prototype.destroy = function()
{
    this._shaderMaterial.dispose();
    this._shaderMaterial = null;
};

/**
 * Generate a name for an object material based on its view, type and transparency.
 * This will compute view + type + transparent (output example: rectilinear-map-opaque)
 * @method FORGE.ObjectMaterial.getName
 * @param {string} view - The view type of the material.
 * @param {string} type - The shader type of the material. (map, color, pick, wireframe)
 * @param {boolean} transparent - Is the material is transparent?
 * @static
 * @return {string} - Returns the computed name
 */
FORGE.ObjectMaterial.getName = function(view, type, transparent)
{
    return view + "-" + type + "-" + (transparent === true ? "transparent" : "opaque");
};

/**
 * Get the raw shader material.
 * @name FORGE.ObjectMaterial#shaderMaterial
 * @type {THREE.RawShaderMaterial}
 * @readonly
 */
Object.defineProperty(FORGE.ObjectMaterial.prototype, "shaderMaterial",
{
    /** @this {FORGE.ObjectMaterial} */
    get: function()
    {
        return this._shaderMaterial;
    }
});

/**
 * Get the type of this material.
 * @name FORGE.ObjectMaterial#type
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ObjectMaterial.prototype, "type",
{
    /** @this {FORGE.ObjectMaterial} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get the view type of this material.
 * @name FORGE.ObjectMaterial#view
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ObjectMaterial.prototype, "view",
{
    /** @this {FORGE.ObjectMaterial} */
    get: function()
    {
        return this._view;
    }
});

/**
 * Get the transparent flag of this material.
 * @name FORGE.ObjectMaterial#transparent
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ObjectMaterial.prototype, "transparent",
{
    /** @this {FORGE.ObjectMaterial} */
    get: function()
    {
        return this._transparent;
    }
});

/**
 * Get the name of this material.
 * @name FORGE.ObjectMaterial#name
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ObjectMaterial.prototype, "name",
{
    /** @this {FORGE.ObjectMaterial} */
    get: function()
    {
        return FORGE.ObjectMaterial.getName(this._view, this._type, this._transparent);
    }
});

