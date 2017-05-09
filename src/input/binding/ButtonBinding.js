/**
 * Button binding object that handles buttons event for a list of buttons.
 * To use a button binding, you have to add it to a {@link FORGE.Gamepad}.
 *
 * @constructor FORGE.ButtonBinding
 * @param {FORGE.Viewer} viewer - the viewer referemce.
 * @param {(Array<number>|number)} buttonsIn - The button code (or array) associated to this binding.
 * @param {?(Function|string|Array<string>)=} down - The callback function that will be called on a button down event.
 * @param {?(Function|string|Array<string>)=} up - The callback function that will be called on a button release event.
 * @param {?(Function|string|Array<string>)=} hold - The callback function that will be called if a button is hold.
 * @param {?(Array<number>|number)=} buttonsOut - The button code (or array) that will be rejected if the button is down.
 * @param {Object=} context - The context in which you want your "down", "hold" & up callbacks to execute.
 * @param {string=} name - The name of the binding, can be use as an identifier.
 * @extends {FORGE.BaseBinding}
 */
FORGE.ButtonBinding = function(viewer, buttonsIn, down, up, hold, buttonsOut, context, name)
{
    /**
     * The button code or array of button codes associated to this ButtonBinding.
     * @name FORGE.ButtonBinding#_buttonsIn
     * @type {?(Array<number>|number)}
     * @private
     */
    this._buttonsIn = buttonsIn || [];

    /**
     * The callback function that will be called on a button down event.
     * @name FORGE.ButtonBinding#_down
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._down = down || null;

    /**
     * The callback function that will be called on a button up event.
     * @name FORGE.ButtonBinding#_up
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._up = up || null;

    /**
     * The callback function that will be called if a button is hold.
     * @name FORGE.ButtonBinding#_hold
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._hold = hold || null;

    /**
     * The button code or array of button codes that will be rejected if this ButtonBinding is down.
     * @name FORGE.ButtonBinding#_buttonsOut
     * @type {?(Array<number>|number)}
     * @private
     */
    this._buttonsOut = buttonsOut || null;

    /**
     * Flag to know if we have to wait to consider a down event as a hold one.
     * @name FORGE.ButtonBinding#_waitToHold
     * @type {boolean}
     * @private
     */
    this._waitToHold = false;

    /**
     * Flag to know if we have this button binding is considered as pressed.<br>
     * It should be pressed if any of buttonsIn are pressed.
     * @name FORGE.ButtonBinding#_pressed
     * @type {boolean}
     * @private
     */
    this._pressed = false;

    /**
     * When a button binding have to wait to be considered as holded this flag is check to know if down action is complete.
     * @name FORGE.ButtonBinding#_downComplete
     * @type {boolean}
     * @private
     */
    this._downComplete = false;

    /**
     * Count of down.
     * @name FORGE.ButtonBinding#_downCount
     * @type {number}
     * @private
     */
    this._downCount = 0;

    /**
     * Count of hold.
     * @name FORGE.ButtonBinding#_holdCount
     * @type {number}
     * @private
     */
    this._holdCount = 0;

    /**
     * Count of up.
     * @name FORGE.ButtonBinding#_upCount
     * @type {number}
     * @private
     */
    this._upCount = 0;

    /**
     * Action event dispatcher for down action
     * @name FORGE.ButtonBinding#_downActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._downActionEventDispatcher = null;

    /**
     * Action event dispatcher for hold action
     * @name FORGE.ButtonBinding#_holdActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._holdActionEventDispatcher = null;

    /**
     * Action event dispatcher for up action
     * @name FORGE.ButtonBinding#_upActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._upActionEventDispatcher = null;

    FORGE.BaseBinding.call(this, viewer, "ButtonBinding", context, name);

    this._boot();
};

FORGE.ButtonBinding.prototype = Object.create(FORGE.BaseBinding.prototype);
FORGE.ButtonBinding.prototype.constructor = FORGE.ButtonBinding;

/**
 * Boot sequence
 * @method FORGE.ButtonBinding#_boot
 */
FORGE.ButtonBinding.prototype._boot = function()
{
    if (FORGE.Utils.isTypeOf(this._down, "string") === true || FORGE.Utils.isArrayOf(this._down, "string"))
    {
        this._downActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onPressed");
        this._downActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._down));
    }

    if (FORGE.Utils.isTypeOf(this._hold, "string") === true || FORGE.Utils.isArrayOf(this._hold, "string"))
    {
        this._holdActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onHold");
        this._holdActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._hold));
    }

    if (FORGE.Utils.isTypeOf(this._up, "string") === true || FORGE.Utils.isArrayOf(this._up, "string"))
    {
        this._upActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onReleased");
        this._upActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._up));
    }
};

/**
 * Know if a button is associated to this binding by being in.
 * @method FORGE.ButtonBinding#hasButtonIn
 * @param {number} button - the code of the button to check
 * @return {boolean} true if associated, else false
 */
FORGE.ButtonBinding.prototype.hasButtonIn = function(button)
{
    return this._buttonsIn === button ||
        (typeof this._buttonsIn.indexOf === "function" && this._buttonsIn.indexOf(button) !== -1);
};

/**
 * Know if a button is associated to this binding by being out.
 * @method FORGE.ButtonBinding#hasButtonOut
 * @param {number} button - the code of the button to check
 * @return {boolean} true if associated, else false
 */
FORGE.ButtonBinding.prototype.hasButtonOut = function(button)
{
    return this._buttonsOut !== null &&
        (this._buttonsOut === button ||
            (typeof this._buttonsOut.indexOf === "function" && this._buttonsOut.indexOf(button) !== -1));
};

/**
 * This method is called by the input associated when a button is down. This triggers the
 * down callback associated to this binding and increases the downCount value.
 * @method FORGE.ButtonBinding#down
 * @param {number} value - the value of the button
 */
FORGE.ButtonBinding.prototype.down = function(value)
{
    this.log("down");

    this._pressed = true;
    this._downCount++;

    if (typeof this._down === "function")
    {
        // Call the callback with a reference to this binding + the original event.
        this._down.call(this._context, this, value);
    }
    else if (this._downActionEventDispatcher !== null)
    {
        this._downActionEventDispatcher.dispatch();
    }
};

/**
 * This method is called by the input associated when a button is hold. This triggers the
 * hold callback associated to this binding and increases the holdCount value.
 * @method FORGE.ButtonBinding#hold
 */
FORGE.ButtonBinding.prototype.hold = function()
{
    this.log("hold");

    this._holdCount++;

    if (typeof this._hold === "function")
    {
        // Call the callback with a reference to this binding + the original event.
        this._hold.call(this._context, this);
    }
    else if (this._holdActionEventDispatcher !== null)
    {
        this._holdActionEventDispatcher.dispatch();
    }
};

/**
 * This method is called by the input associated when a button is up. This triggers the
 * up callback associated to this binding and increases the upCount value.
 * @method FORGE.ButtonBinding#up
 * @param {number} value - the value of the button
 */
FORGE.ButtonBinding.prototype.up = function(value)
{
    this.log("up");

    this._pressed = false;
    this._downComplete = false;
    this._upCount++;

    if (typeof this._up === "function")
    {
        // Call the callback with a reference to this binding + the original event.
        this._up.call(this._context, this, value);
    }
    else if (this._upActionEventDispatcher !== null)
    {
        this._upActionEventDispatcher.dispatch();
    }
};

/**
 * This method has to be called by the user down callback to specify that the button down have to
 * wait to be considered as holded.<br>
 * This gives in return a callback to set the down as complete.
 * @method FORGE.ButtonBinding#waitToHold
 * @return {Function} Returns a callback function that the user have to call to set the down as complete to allow hold.
 */
FORGE.ButtonBinding.prototype.waitToHold = function()
{
    this._waitToHold = true;

    var _downCount = this._downCount;

    var downCompleteCallback = function()
    {
        this.log("downCompleteCallback " + _downCount + " " + this._downCount);

        if (_downCount === this._downCount)
        {
            this._downComplete = true;
        }
    };

    return downCompleteCallback.bind(this);
};

/**
 * Destroy sequence.
 * @method  FORGE.ButtonBinding#destroy
 */
FORGE.ButtonBinding.prototype.destroy = function()
{
    this._buttonsIn = null;
    this._down = null;
    this._up = null;
    this._hold = null;
    this._buttonsOut = null;

    if (this._downActionEventDispatcher !== null)
    {
        this._downActionEventDispatcher.destroy();
        this._downActionEventDispatcher = null;
    }

    if (this._holdActionEventDispatcher !== null)
    {
        this._holdActionEventDispatcher.destroy();
        this._holdActionEventDispatcher = null;
    }

    if (this._upActionEventDispatcher !== null)
    {
        this._upActionEventDispatcher.destroy();
        this._upActionEventDispatcher = null;
    }

    FORGE.BaseBinding.prototype.destroy.call(this);
};

/**
 * Gets the pressed status of this ButtonBinding.
 * @name FORGE.ButtonBinding#pressed
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "pressed",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._pressed;
    }
});

/**
 * Gets the down count value.
 * @name FORGE.ButtonBinding#downCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "downCount",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._downCount;
    }
});

/**
 * Gets the up count value.
 * @name FORGE.ButtonBinding#upCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "upCount",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._upCount;
    }
});

/**
 * Gets the hold count value.
 * @name FORGE.ButtonBinding#holdCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "holdCount",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._holdCount;
    }
});

/**
 * Gets the hasToWaitToHold value.
 * @name FORGE.ButtonBinding#hasToWaitToHold
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "hasToWaitToHold",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._waitToHold;
    }
});

/**
 * Gets the downComplete value.
 * @name FORGE.ButtonBinding#downComplete
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.ButtonBinding.prototype, "downComplete",
{
    /** @this {FORGE.ButtonBinding} */
    get: function()
    {
        return this._downComplete;
    }
});
