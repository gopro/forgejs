/**
 * FORGE.PickingRaycast
 * PickingRaycast class.
 *
 * @constructor FORGE.PickingRaycast
 * 
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingRaycast = function(viewer)
{   
    FORGE.Picking.call(this, viewer, "PickingRaycast");
};

FORGE.PickingRaycast.prototype = Object.create(FORGE.Picking.prototype);
FORGE.PickingRaycast.prototype.constructor = FORGE.PickingRaycast;

/**
 * Boot sequence.
 * @method FORGE.PickingRaycast#_boot
 * @private
 */
FORGE.PickingRaycast.prototype._boot = function()
{
    FORGE.Picking.prototype._boot.call(this);
};

/**
 * Destroy sequence.
 * @method FORGE.PickingRaycast#destroy
 */
FORGE.PickingRaycast.prototype.destroy = function()
{
    FORGE.Picking.prototype.destroy.call(this);
};



