/**
 * Axis binding object that handles axis event for a list of axes.
 * To use an axis binding, you have to add ti to a {@link FORGE.Gamepad}.
 *
 * @constructor FORGE.AxisBinding
 * @param {FORGE.Viewer} viewer - the viewer reference
 * @param {number} axis - the axis code associated to this binding
 * @param {?(Function|string|Array<string>)=} change - the callback function that will be called on an axis changement
 * @param {Object=} context - the context in which you want the callbacks to be executed
 * @param {string=} name - the name of the binding
 * @extends {FORGE.BaseBinding}
 */
FORGE.AxisBinding = function(viewer, axis, change, context, name)
{
    /**
     * The axis code associated to this AxisBinding
     * @name FORGE.AxisBinding#_axis
     * @type {number}
     * @private
     */
    this._axis = axis;

    /**
     * The callback function that will be called on an axis changement
     * @name FORGE.AxisBinding#_change
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._change = change || null;

    /**
     * Action event dispatcher for change action
     * @name FORGE.AxisBinding#_changeActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._changeActionEventDispatcher = null;

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
    if (FORGE.Utils.isTypeOf(this._change, "string") === true || FORGE.Utils.isArrayOf(this._change, "string"))
    {
        this._changeActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onChange");
        this._changeActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._change));
    }
};

/**
 * This method is called by the input associated when an axis is changed. This triggers the change
 * callbacks associated to this binding.
 * @method FORGE.AxisBinding#change
 * @param {number} value - the value of the axis
 */
FORGE.AxisBinding.prototype.change = function(value)
{
    this.log("change");

    this._pressed = true;

    if (typeof this._change === "function")
    {
        // Call the callback with a reference to this binding + the original event.
        this._change.call(this._context, this, value);
    }
    else if (this._changeActionEventDispatcher !== null)
    {
        this._changeActionEventDispatcher.dispatch();
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.AxisBinding#destroy
 */
FORGE.AxisBinding.prototype.destroy = function()
{
    this._change = null;

    if (this._changeActionEventDispatcher !== null)
    {
        this._changeActionEventDispatcher.destroy();
        this._changeActionEventDispatcher = null;
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
