/**
 * Key Binding object that handles keyboard event handlers for a list of keycodes.
 * To use a Key Binding you have to add it to the {@link FORGE.Keyboard}.
 *
 * @constructor FORGE.KeyBinding
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {(Array<number>|number)} keysIn - The key code or array of key codes associated to this KeyBinding.
 * @param {?(Function|string|Array<string>)=} down - The callback function that will be called on a keydown event.
 * @param {?(Function|string|Array<string>)=} up - The callback function that will be called on a keyup event.
 * @param {?(Function|string|Array<string>)=} hold - The callback function that will be called if a key down is hold.
 * @param {?(Array<number>|number)=} keysOut - The key code or array of key codes that will be rejected if this KeyBinding is pressed.
 * @param {Object=} context - The context in which you want your "down", "hold" & up callbacks to execute
 * @param {string=} name - The name of the binding, can be use as an identifier.
 * @extends {FORGE.BaseBinding}
 */
FORGE.KeyBinding = function(viewer, keysIn, down, up, hold, keysOut, context, name)
{
    /**
     * The key code or array of key codes associated to this KeyBinding.
     * @name FORGE.KeyBinding#_keysIn
     * @type {?(Array<number>|number)}
     * @private
     */
    this._keysIn = keysIn || [];

    /**
     * The callback function that will be called on a keydown event.
     * @name FORGE.KeyBinding#_down
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._down = down || null;

    /**
     * The callback function that will be called on a keyup event.
     * @name FORGE.KeyBinding#_up
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._up = up || null;

    /**
     * The callback function that will be called if a key down is holded.
     * @name FORGE.KeyBinding#_hold
     * @type {?(Function|string|Array<string>)}
     * @private
     */
    this._hold = hold || null;

    /**
     * The key code or array of key codes that will be rejected if this KeyBinding is pressed.
     * @name FORGE.KeyBinding#_keysOut
     * @type {?(Array<number>|number)}
     * @private
     */
    this._keysOut = keysOut || null;

    /**
     * Flag to know if we have to wait to consider a down event as a holded one.
     * @name FORGE.KeyBinding#_waitToHold
     * @type {boolean}
     * @default
     * @private
     */
    this._waitToHold = false;

    /**
     * Flag to know if we have this key binding is considered as pressed.<br>
     * It should be pressed if any of keysIn are pressed.
     * @name FORGE.KeyBinding#_pressed
     * @type {boolean}
     * @default
     * @private
     */
    this._pressed = false;

    /**
     * When a key binding have to wait to be considered as holded this flag is check to know if down action is complete.
     * @name FORGE.KeyBinding#_downComplete
     * @type {boolean}
     * @default
     * @private
     */
    this._downComplete = false;

    /**
     * Count of down.
     * @name FORGE.KeyBinding#_downCount
     * @type {number}
     * @default
     * @private
     */
    this._downCount = 0;

    /**
     * Count of hold.
     * @name FORGE.KeyBinding#_holdCount
     * @type {number}
     * @default
     * @private
     */
    this._holdCount = 0;

    /**
     * Count of up.
     * @name FORGE.KeyBinding#_upCount
     * @type {number}
     * @default
     * @private
     */
    this._upCount = 0;

    /**
     * Action event dispatcher for down action
     * @name FORGE.KeyBinding#_downActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._downActionEventDispatcher = null;

    /**
     * Action event dispatcher for hold action
     * @name FORGE.KeyBinding#_holdActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._holdActionEventDispatcher = null;

    /**
     * Action event dispatcher for up action
     * @name FORGE.KeyBinding#_upActionEventDispatcher
     * @type {?FORGE.ActionEventDispatcher}
     * @private
     */
    this._upActionEventDispatcher = null;

    FORGE.BaseBinding.call(this, viewer, "KeyBinding", context, name);

    this._boot();
};

FORGE.KeyBinding.prototype = Object.create(FORGE.BaseBinding.prototype);
FORGE.KeyBinding.prototype.constructor = FORGE.KeyBinding;

/**
 * Boot sequence
 * @method FORGE.KeyBinding#_boot
 */
FORGE.KeyBinding.prototype._boot = function()
{
    if (FORGE.Utils.isTypeOf(this._down, "string") === true || FORGE.Utils.isArrayOf(this._down, "string"))
    {
        this._downActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onDown");
        this._downActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._down));
    }

    if (FORGE.Utils.isTypeOf(this._hold, "string") === true || FORGE.Utils.isArrayOf(this._hold, "string"))
    {
        this._holdActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onHold");
        this._holdActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._hold));
    }

    if (FORGE.Utils.isTypeOf(this._up, "string") === true || FORGE.Utils.isArrayOf(this._up, "string"))
    {
        this._upActionEventDispatcher = new FORGE.ActionEventDispatcher(this._viewer, "onUp");
        this._upActionEventDispatcher.addActions( /** @type {(string|Array<string>)} */ (this._up));
    }
};

/**
 * Know if a key code is associated to this KeyBinding.
 * @method FORGE.KeyBinding#hasKeyIn
 * @param  {number}  keyCode The key code you want to know if it is associated to this KeyBinding.
 * @return {boolean} Returns true if the keycode is associated as a key in to this KeyBinding.
 */
FORGE.KeyBinding.prototype.hasKeyIn = function(keyCode)
{
    if (typeof this._keysIn === "number" && this._keysIn === keyCode)
    {
        return true;
    }
    else if (typeof this._keysIn.indexOf === "function")
    {
        return this._keysIn.indexOf(keyCode) !== -1;
    }

    return false;
};

/**
 * Know if a key code is considered as a key out for this KeyBinding.
 * @method FORGE.KeyBinding#hasKeyOut
 * @param  {number}  keyCode The key code you want to know if it is considered as a key out for this KeyBinding.
 * @return {boolean} Returns true if the key code is considered as a key out for this KeyBinding.
 */
FORGE.KeyBinding.prototype.hasKeyOut = function(keyCode)
{
    if (this._keysOut === null)
    {
        return false;
    }
    else if (typeof this._keysOut === "number" && this._keysOut === keyCode)
    {
        return true;
    }
    else if (typeof this._keysOut.indexOf === "function")
    {
        return this._keysOut.indexOf(keyCode) !== -1;
    }

    return false;
};

/**
 * This method is called by the {@link FORGE.Keyboard} when a key down event is applied.<br>
 * This triggers the down callback associated to this KeyBinding and increase the downCount value.
 * @param {KeyboardEvent} event - The keyboardEvent from the keydown user action.
 * @method FORGE.KeyBinding#down
 */
FORGE.KeyBinding.prototype.down = function(event)
{
    this.log("down");

    this._downCount++;
    this._pressed = true;

    if (typeof this._down === "function")
    {
        //Call the callback with a reference to this binding + the original event.
        this._down.call(this._context, this, event);
    }
    else if (this._downActionEventDispatcher !== null)
    {
        this._downActionEventDispatcher.dispatch();
    }
};

/**
 * This method has to be called by the user down callback to specify that the key down have to wait to be considered as holded.<br>
 * This gives in return a callback to set the down as complete.
 * @method FORGE.KeyBinding#waitToHold
 * @return {Function} Returns a callback function that the user have to call to set the down as complete to allow hold.
 */
FORGE.KeyBinding.prototype.waitToHold = function()
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
 * This method is called by the {@link FORGE.Keyboard} when a key up event is applied.<br>
 * This triggers the up callback associated to this KeyBinding and increase the upCount value.
 * @param {KeyboardEvent} event - The keyboardEvent from the keyup user action.
 * @method FORGE.KeyBinding#up
 */
FORGE.KeyBinding.prototype.up = function(event)
{
    this.log("up");

    this._upCount++;
    this._pressed = false;
    this._downComplete = false;

    if (typeof this._up === "function")
    {
        //Call the callback with a reference to this binding + the original event.
        this._up.call(this._context, this, event);
    }
    else if (this._upActionEventDispatcher !== null)
    {
        this._upActionEventDispatcher.dispatch();
    }
};

/**
 * This method is called by the {@link FORGE.Keyboard} when a key hold event is applied.<br>
 * This triggers the hold callback associated to this KeyBinding and increase the holdCount value.
 * @method FORGE.KeyBinding#hold
 */
FORGE.KeyBinding.prototype.hold = function()
{
    this.log("hold");

    this._holdCount++;

    if (typeof this._hold === "function")
    {
        this._hold.call(this._context, this);
    }
    else if (this._holdActionEventDispatcher !== null)
    {
        this._holdActionEventDispatcher.dispatch();
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.KeyBinding#destroy
 */
FORGE.KeyBinding.prototype.destroy = function()
{
    this._keysIn = null;
    this._down = null;
    this._up = null;
    this._hold = null;
    this._keysOut = null;

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
 * Gets the pressed status of this KeyBinding.
 * @name FORGE.KeyBinding#pressed
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "pressed",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._pressed;
    }
});

/**
 * Gets the down count value.
 * @name FORGE.KeyBinding#downCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "downCount",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._downCount;
    }
});

/**
 * Gets the up count value.
 * @name FORGE.KeyBinding#upCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "upCount",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._upCount;
    }
});

/**
 * Gets the hold count value.
 * @name FORGE.KeyBinding#holdCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "holdCount",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._holdCount;
    }
});

/**
 * Gets the hasToWaitToHold value.
 * @name FORGE.KeyBinding#hasToWaitToHold
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "hasToWaitToHold",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._waitToHold;
    }
});

/**
 * Gets the downComplete value.
 * @name FORGE.KeyBinding#downComplete
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.KeyBinding.prototype, "downComplete",
{
    /** @this {FORGE.KeyBinding} */
    get: function()
    {
        return this._downComplete;
    }
});
