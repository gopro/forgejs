/**
 * FORGE.PickingInterface
 * Picking Interface class.
 *
 * @constructor FORGE.PickingInterface
 * @param {THREE.Scene} scene - scene
 * @param {function} fnObjectWithId - function retrieving a pickagble object with its id
 * @param {boolean} enabled - picking enabled
 *
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingInterface = function(scene, fnObjectWithId, enabled)
{
    FORGE.BaseObject.call(this, "PickingInterface");

    this._scene = scene;

    this._fnObjectWithId = fnObjectWithId;

    this._enabled = enabled;
};

FORGE.PickingInterface.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PickingInterface.prototype.constructor = FORGE.PickingInterface;

/**
 * Destroy sequence.
 * @method FORGE.PickingInterface#destroy
 */
FORGE.PickingInterface.prototype.destroy = function()
{
    this._scene = null;

    this._fnObjectWithId = null;
};

/**
 * Get the scene.
 * @name FORGE.PickingInterface#scene
 * @type {THREE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.PickingInterface.prototype, "scene",
{
    /** @this {FORGE.PickingInterface} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get the fnObjectWithId.
 * @name FORGE.PickingInterface#fnObjectWithId
 * @type {function}
 * @readonly
 */
Object.defineProperty(FORGE.PickingInterface.prototype, "fnObjectWithId",
{
    /** @this {FORGE.PickingInterface} */
    get: function()
    {
        return this._fnObjectWithId;
    }
});

/**
 * Get/set the picking enabling.
 * @name FORGE.PickingInterface#enabled
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.PickingInterface.prototype, "enabled",
{
    /** @this {FORGE.PickingInterface} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.PickingInterface} */
    set: function(value)
    {
        this._enabled = value;
    }
});
