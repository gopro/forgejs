/**
 * Axis binding object that handles axis event for a list of axes.
 * To use an axis binding, you have to add ti to a {@link FORGE.Gamepad}.
 *
 * @constructor FORGE.AxisBinding
 * @param {FORGE.Viewer} viewer - the viewer reference
 * @param {number} axis - the axis code associated to this binding
 * @param {?(Function|string|Array<string>)} move - the callback function that will be called on an axis movement
 * @param {Object=} context - the context in which you want the callbacks to be executed
 * @param {string=} name - the name of the binding
 * @extends {FORGE.BaseBinding}
 */
FORGE.AxisBinding = function(viewer, axis, move, context, name)
{
    /**
     * The axis code associated to this AxisBinding
     * @name FORGE.AxisBinding#_axis
     * @type {number}
     * @private
     */
    this._axis = axis;

    /**
     * The callback function that will be called on an axis movement
     * @name FORGE.AxisBinding#_move
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._move = move || null;

    /**
     * Action event dispatcher for move action
     * @name FORGE.AxisBinding#_moveActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._moveActionEventDispatcher = null;

    FORGE.BaseBinding.call(this, viewer, "AxisBinding", context, name);

    this._boot();
};

FORGE.AxisBinding.prototype = Object.create(FORGE.BaseBinding.prototype);
FORGE.AxisBinding.prototype.constructor = FORGE.AxisBinding;

/**
 * Boot sequence
 * @method FORGE.AxisBinding#_boot
 */
FORGE.AxisBinding.prototype._boot = function()
{
    if (FORGE.Utils.isTypeOf(this._up, "string") === true || FORGE.Utils.isArrayOf(this._up, "string"))
    {
        this._moveActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onMove");
        this._moveActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._up));
    }
};

/**
 * This method is called by the input associated when an axis is moved. This triggers the move
 * callbacks associated to this binding.
 * @method FORGE.AxisBinding#move
 * @param {number} value - the value of the button
 */
FORGE.AxisBinding.prototype.move = function(value)
{
    this.log("move");

    this._pressed = true;
    this._moveCount++;

    if (typeof this._move === "function")
    {
        // Call the callback with a reference to this binding + the original event.
        this._move.call(this._context, this, value);
    }
    else if (this._moveActionEventDispatcher !== null)
    {
        this._moveActionEventDispatcher.dispatch();
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.AxisBinding#destroy
 */
FORGE.AxisBinding.prototype.destroy = function()
{
    this._move = null;

    if (this._moveActionEventDispatcher !== null)
    {
        this._moveActionEventDispatcher.destroy();
        this._moveActionEventDispatcher = null;
    }

    FORGE.BaseBinding.prototype.destroy.call(this);
};


/**
 * Gets the axis associated to this binding.
 * @name FORGE.AxisBinding#axis
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.AxisBinding.prototype, "axis",
{
    /** @this {FORGE.AxisBinding} **/
    get: function()
    {
        return this._axis;
    }
});
