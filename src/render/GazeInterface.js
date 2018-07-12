/**
 * FORGE.GazeInterface
 * Picking Interface class.
 *
 * @constructor FORGE.GazeInterface
 * @param {function} fnClick - fnObjectWithId
 *
 * @extends {FORGE.BaseObject}
 */
FORGE.GazeInterface = function(fnClick)
{
    FORGE.BaseObject.call(this, "GazeInterface");

    /**
     * Click function reference.
     * @name FORGE.Scene3D#_fnClick
     * @type {function}
     * @private
     */
    this._fnClick = fnClick;
};

FORGE.GazeInterface.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.GazeInterface.prototype.constructor = FORGE.GazeInterface;

/**
 * Destroy sequence.
 * @method FORGE.GazeInterface#destroy
 */
FORGE.GazeInterface.prototype.destroy = function()
{
    this._fnClick = null;
};

/**
 * Get the fnClick.
 * @name FORGE.GazeInterface#fnClick
 * @type {function}
 * @readonly
 */
Object.defineProperty(FORGE.GazeInterface.prototype, "fnClick",
{
    /** @this {FORGE.GazeInterface} */
    get: function()
    {
        return this._fnClick;
    }
});
