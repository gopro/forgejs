/**
 * FORGE.ClickInterface
 * Picking Interface class.
 *
 * @constructor FORGE.ClickInterface
 * @param {function} fnClick - fnObjectWithId
 *
 * @extends {FORGE.BaseObject}
 */
FORGE.ClickInterface = function(fnClick)
{
    FORGE.BaseObject.call(this, "ClickInterface");

    this._fnClick = fnClick;
};

FORGE.ClickInterface.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ClickInterface.prototype.constructor = FORGE.ClickInterface;

/**
 * Destroy sequence.
 * @method FORGE.ClickInterface#destroy
 */
FORGE.ClickInterface.prototype.destroy = function()
{
    this._fnClick = null;
};

/**
 * Get the fnClick.
 * @name FORGE.ClickInterface#fnClick
 * @type {function}
 * @readonly
 */
Object.defineProperty(FORGE.ClickInterface.prototype, "fnClick",
{
    /** @this {FORGE.ClickInterface} */
    get: function()
    {
        return this._fnClick;
    }
});
