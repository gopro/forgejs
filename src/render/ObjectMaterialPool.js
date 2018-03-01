/**
 * ObjectMaterialPool class.
 *
 * @constructor FORGE.ObjectMaterialPool
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectMaterialPool = function()
{
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
 * @return {FORGE.ObjectMaterial} Returns the ObjectMaterial.
 */
FORGE.ObjectMaterialPool.prototype.get = function(view, type, transparent)
{
    view = (typeof view === "string") ? view : FORGE.ViewType.RECTILINEAR;
    type = (typeof type === "string") ? type : FORGE.ObjectMaterialType.MAP;

    // Compute the name of the material based on the view, the type and the transparency
    var uid = FORGE.ObjectMaterial.generateUid(view, type, transparent);

     // If the material exists in the pool, return it
    if (FORGE.UID.isTypeOf(uid, "ObjectMaterial") === true)
    {
        return FORGE.UID.get(uid);
    }
    // Else, create it, add it to the pool and return it
    else
    {
        return new FORGE.ObjectMaterial(view, type, transparent);
    }
};

/**
 * Destroy sequence.
 * @method FORGE.ObjectMaterialPool#destroy
 */
FORGE.ObjectMaterialPool.prototype.destroy = function()
{
    var materials = FORGE.UID.get(null, "ObjectMaterial");

    for (var i = 0, ii = materials.length; i < ii; i++)
    {
        materials[i].destroy();
    }
};