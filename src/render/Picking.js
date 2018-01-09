/**
 * FORGE.Picking
 * Picking class.
 *
 * @constructor FORGE.Picking
 * 
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {string} className - class name
 * @extends {FORGE.BaseObject}
 */
FORGE.Picking = function(viewer, className)
{   
    FORGE.BaseObject.call(this, className || "Picking");

    this._boot();
};

FORGE.Picking.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Picking.prototype.constructor = FORGE.Picking;

/**
 * Boot sequence.
 * @method FORGE.Picking#_boot
 * @private
 */
FORGE.Picking.prototype._boot = function()
{
};

/**
 * Destroy sequence.
 * @method FORGE.Picking#destroy
 */
FORGE.Picking.prototype.destroy = function()
{
    FORGE.BaseObject.prototype.destroy.call(this);
};

