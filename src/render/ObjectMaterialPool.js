/**
 * ObjectMaterialPool class.
 *
 * @constructor FORGE.ObjectMaterialPool
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectMaterialPool = function()
{
    /**
     * The materials pool object.
     * @name FORGE.ObjectMaterialPool#_pool
     * @type {Object}
     * @private
     */
    this._pool = {};

    FORGE.BaseObject.call(this, "ObjectMaterialPool");
};

FORGE.ObjectMaterialPool.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ObjectMaterialPool.prototype.constructor = FORGE.ObjectMaterialPool;

/**
 * Get material for a given view, a given type of shader and a transparency (true or false).
 * Populate a pool of materials with lazy instantiation.
 * @method FORGE.ObjectMaterialPool#get
 * @param {string} view - The view type
 * @param {string} type - The type of the shader listed in {@link FORGE.ObjectMaterialType}
 * @param {boolean} transparent - true if transparent material, false if opaque
 * @return {THREE.RawShaderMaterial} world to screen raw shader material.
 */
FORGE.ObjectMaterialPool.prototype.get = function(view, type, transparent)
{
    view = (typeof view === "string") ? view : FORGE.ViewType.RECTILINEAR;
    type = (typeof type === "string") ? type : FORGE.ObjectMaterialType.MAP;

    // Compute the name of the material based on the view, the type and the transparency
    var name = FORGE.ObjectMaterial.getName(view, type, transparent);

    // If the material exists in the pool, return it
    if(name in this._pool)
    {
        return this._pool[name];
    }
    // Else, create it, add it to the pool and return it
    else
    {
        var material = new FORGE.ObjectMaterial(view, type, transparent);

        this._pool[name] = material;

        return material;
    }
};

/**
 * Destroy sequence.
 * @method FORGE.ObjectMaterialPool#destroy
 */
FORGE.ObjectMaterialPool.prototype.destroy = function()
{
    for (name in this._pool)
    {
        this._pool[name].dispose();
        this._pool[name] = null;
    }

    this._pool = null;
};