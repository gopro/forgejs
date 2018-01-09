/**
 * FORGE.PickingDrawpass
 * PickingDrawpass class.
 *
 * @constructor FORGE.PickingDrawpass
 * 
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingDrawpass = function(viewer)
{   
    FORGE.Picking.call(this, viewer, "PickingDrawpass");
};

FORGE.PickingDrawpass.prototype = Object.create(FORGE.Picking.prototype);
FORGE.PickingDrawpass.prototype.constructor = FORGE.PickingDrawpass;

/**
 * Boot sequence.
 * @method FORGE.PickingDrawpass#_boot
 * @private
 */
FORGE.PickingDrawpass.prototype._boot = function()
{
};

/**
 * Destroy sequence.
 * @method FORGE.PickingDrawpass#destroy
 */
FORGE.PickingDrawpass.prototype.destroy = function()
{
    FORGE.Picking.prototype.destroy.call(this);
};

