
/**
 * Keyboard Manager that handles keyboard events and manage {@link FORGE.KeyBinding}s.
 *
 * @constructor FORGE.Keyboard
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo  fix keyout for several keybinding on a same keycode but different keysout configuration ?
 */
FORGE.Keyboard = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Keyboard#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Is the keyboard is enabled?
     * @name FORGE.Keyboard#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * The array that handles the {@link FORGE.KeyBinding} objects.
     * @name FORGE.Keyboard#_keyBindings
     * @type {?Array<FORGE.KeyBinding>}
     * @private
     */
    this._keyBindings = null;

    /**
     * The array that handles the key codes that are considered as pressed.
     * @name FORGE.Keyboard#_keyPressed
     * @type {?Array<number>}
     * @private
     */
    this._keyPressed = null;

    /**
     * This is a copy of key down handler with this as this reference (bind).
     * @name  FORGE.Keyboard#_keyDownBind
     * @type {Function}
     * @private
     */
    this._keyDownBind = null;

    /**
     * This is a copy of key up handler with this as this reference (bind).
     * @name  FORGE.Keyboard#_keyUpBind
     * @type {Function}
     * @private
     */
    this._keyUpBind = null;

    FORGE.BaseObject.call(this, "Keyboard");

    this._boot();
};

FORGE.Keyboard.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Keyboard.prototype.constructor = FORGE.Keyboard;

/**
 * Boot sequence.
 * @method FORGE.Keyboard#_boot
 * @suppress {checkTypes}
 * @private
 */
FORGE.Keyboard.prototype._boot = function()
{
    this._keyBindings = [];
    this._keyPressed = [];

    this._keyDownBind = this._keyDownHandler.bind(this);
    this._keyUpBind = this._keyUpHandler.bind(this);

    window.addEventListener("keydown", this._keyDownBind, false);
    window.addEventListener("keyup", this._keyUpBind, false);
};

/**
 * Event handler for key down, listening on window.<br>
 * This handler is copied in _keyDownBind, for custom this reference.
 * @method FORGE.Keyboard#_keyDownHandler
 * @private
 * @param  {KeyboardEvent} event - the native HTML KeyboardEvent
 */
FORGE.Keyboard.prototype._keyDownHandler = function(event)
{
    this._processKeyDown(event);
};

/**
 * Event handler for key up, listening on window.<br>
 * This handler is copied in _keyUpBind, for custom this reference.
 * @method FORGE.Keyboard#_keyUpHandler
 * @private
 * @param  {KeyboardEvent} event - the native HTML KeyboardEvent
 */
FORGE.Keyboard.prototype._keyUpHandler = function(event)
{
    this._processKeyUp(event);
};

/**
 * Get the index of a KeyBinding.
 * @method FORGE.Keyboard#_indexOfBinding
 * @private
 * @param  {FORGE.KeyBinding|number} value - The KeyBinding or a keyCode (Number).
 * @return {number} Returns the searched index if found, if not, returns -1.
 */
FORGE.Keyboard.prototype._indexOfBinding = function(value)
{
    if(this._keyBindings === null || this._keyBindings.length === 0)
    {
        return -1;
    }

    if(typeof value === "object" && value.type === "KeyBinding")
    {
        return this._keyBindings.indexOf(value);
    }

    if(typeof value === "number")
    {
        for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
        {
            if(this._keyBindings[i].hasKeyIn(value) === true)
            {
                return i;
            }
        }
    }

    return -1;
};

/**
 * Add a keyCode to the keyPressed array if it's not already in.
 * @method FORGE.Keyboard#_addKeyPressed
 * @private
 * @param {number} keyCode - The keyCode you want to add.
 * @return {boolean} Returns true if it's correctly added, false if it's already in.
 */
FORGE.Keyboard.prototype._addKeyPressed = function(keyCode)
{
    if(this._keyPressed.indexOf(keyCode) === -1)
    {
        this._keyPressed.push(keyCode);
        return true;
    }

    return false;
};

/**
 * Remove a keyCode from the keyPressed array.
 * @method FORGE.Keyboard#_removeKeyPressed
 * @private
 * @param  {number} keyCode - The keyCode you want to remove.
 * @return {boolean} Return true if it's succesfuly removed, false if not found.
 */
FORGE.Keyboard.prototype._removeKeyPressed = function(keyCode)
{
    var index = this._keyPressed.indexOf(keyCode);

    if(index !== -1)
    {
        this._keyPressed.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Event handler for keydown event.
 * @method FORGE.Keyboard#_processKeyDown
 * @param  {KeyboardEvent} event - The native KeyboardEvent from the down action.
 * @private
 */
FORGE.Keyboard.prototype._processKeyDown = function(event)
{
    if(this._enabled === false)
    {
        return;
    }

    var keyCode = event.keyCode;

    this.log("keyDown "+keyCode);

    if(this._addKeyPressed(keyCode) === true)
    {
        this._applyKeyDown(event);
    }
};

/**
 * If the processed keydown event is valid it's applied by this method.
 * @method FORGE.Keyboard#_applyKeyDown
 * @param  {KeyboardEvent} event - The keyboard event code that has been validated as a pressed key.
 * @private
 */
FORGE.Keyboard.prototype._applyKeyDown = function(event)
{
    var keyCode = event.keyCode;

    if(this.isKeyOut(keyCode) === true)
    {
        return;
    }

    var keyBindings = this.getBindings(keyCode);
    var keyBinding;

    for(var i = 0, ii = keyBindings.length; i < ii; i++)
    {
        keyBinding = keyBindings[i];

        if(keyBinding.pressed === false)
        {
            keyBinding.down(event);
        }
    }
};

/**
 * Event handler for keyup event.
 * @method FORGE.Keyboard#_processKeyUp
 * @param  {KeyboardEvent} event - The native KeyboardEvent from the up action.
 * @private
 */
FORGE.Keyboard.prototype._processKeyUp = function(event)
{
    if(this._enabled === false)
    {
        return;
    }

    var keyCode = event.keyCode;

    this.log("keyUp "+keyCode);

    if(this._removeKeyPressed(keyCode) === true)
    {
        this._applyKeyUp(event);
    }
};

/**
 * If the processed keyup event is valid it's applied by this method.
 * @method FORGE.Keyboard#_applyKeyUp
 * @param  {KeyboardEvent} event - The keyboard event code that has been validated as a released key.
 * @private
 */
FORGE.Keyboard.prototype._applyKeyUp = function(event)
{
    var keyCode = event.keyCode;

    if(this.isKeyOut(keyCode) === true)
    {
        return;
    }

    var keyBindings = this.getBindings(keyCode);
    var keyBinding;

    for(var i = 0, ii = keyBindings.length; i < ii; i++)
    {
        keyBinding = keyBindings[i];

        //Is there any valid keycode down for this keyBinding ?
        //If so, just return and consider this binding still down
        for(var j = 0, jj = this._keyPressed.length; j < jj; j++)
        {
            if(keyBinding.hasKeyIn(this._keyPressed[j]))
            {
                return;
            }
        }

        //If not, execute the up callback for the keybinding
        keyBinding.up(event);

        //When a key is up, activate the down effect for keycodes
        //that were considered as "out" before the key up.
        for(var k = 0, kk = this._keyPressed.length; k < kk; k++)
        {
            if(keyBinding.hasKeyOut(this._keyPressed[k]))
            {
                var keyboardEventInit = {keycode: this._keyPressed[k], ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey};
                var keyboardEvent = new KeyboardEvent("keydown", keyboardEventInit);
                this._applyKeyDown(keyboardEvent);
            }
        }
    }
};

/**
 * Update method called by the viewer main loop.
 * @method FORGE.Keyboard#update
 */
FORGE.Keyboard.prototype.update = function()
{
    var keyBinding;

    for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
    {
        keyBinding = this._keyBindings[i];

        if(keyBinding.pressed === true)
        {
            if(keyBinding.hasToWaitToHold === true && keyBinding.downComplete === false)
            {
                continue;
            }

            keyBinding.hold();
        }
    }
};

/**
 * Ask if a keyCode is in the keyPressed array.
 * @method FORGE.Keyboard#isKeyPressed
 * @param  {number} keyCode - The keyCode you want to know if it's in the keyPressed array.
 * @return {boolean} Returns true if the keyCode is considered as a keyPressed, false if not.
 */
FORGE.Keyboard.prototype.isKeyPressed = function(keyCode)
{
    return this._keyPressed.indexOf(keyCode) !== -1;
};

/**
 * Ask if a keyCode is considered as a keyOut at this time.
 * @method FORGE.Keyboard#isKeyOut
 * @param  {number}  keyCode - The keyCode you want to know if it's a key out.
 * @return {boolean} Returns true if keyCode is considered as a keyOut, false if not.
 */
FORGE.Keyboard.prototype.isKeyOut = function(keyCode)
{
    var keyBinding;

    for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
    {
        keyBinding = this._keyBindings[i];

        if(keyBinding.pressed === true && keyBinding.hasKeyOut(keyCode) === true)
        {
            return true;
        }
    }

    return false;
};

/**
 * Add a KeyBinding to the Keyboard's keyBinding array.
 * @method FORGE.Keyboard#addBinding
 * @param {FORGE.KeyBinding} keyBinding - The FORGE.KeyBinding you want to add.
 * @return {boolean} Returns true if it's correctly added, false if it's already in or if wrong type.
 */
FORGE.Keyboard.prototype.addBinding = function(keyBinding)
{
    if(typeof keyBinding !== "object" && keyBinding.type !== "KeyBinding")
    {
        return false;
    }

    var index = this._indexOfBinding(keyBinding);

    if(index === -1)
    {
        this._keyBindings.push(keyBinding);
        return true;
    }
    else
    {
        this.warn("Trying to add a duplicate key binding on keyboard!");
    }

    return false;
};

/**
 * Remove a {@link FORGE.KeyBinding} from the {@link FORGE.Keyboard} object.
 * @method FORGE.Keyboard#removeBinding
 * @param  {FORGE.KeyBinding|number} keyBinding - A {@link FORGE.KeyBinding} or a Number that represent a key code.
 * @return {boolean} Returns true if it's removed, false if not found.
 */
FORGE.Keyboard.prototype.removeBinding = function(keyBinding)
{
    var index = this._indexOfBinding(keyBinding);

    if(index !== -1)
    {
        this._keyBindings[index].destroy();
        this._keyBindings.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Know if the keyboard has a KeyBinding Object or if there already one for a key code.
 * @method FORGE.KeyBoard#hasBinding
 * @param  {FORGE.KeyBinding}  value - A FORGE.KeyBinding Object or a key code.
 * @return {boolean} Returns true if a KeyBinding is found, false if not.
 */
FORGE.Keyboard.prototype.hasBinding = function(value)
{
    return this._indexOfBinding(value) !== -1;
};

/**
 * Get a {@link FORGE.KeyBinding} associated to a key code.
 * @method  FORGE.Keyboard#getBindings
 * @param  {number} keyCode - The key code for which you search a {@link FORGE.KeyBinding}.
 * @return {Array<FORGE.KeyBinding>} Returns a {@link FORGE.KeyBinding} object if found, null if not.
 */
FORGE.Keyboard.prototype.getBindings = function(keyCode)
{
    var bindings = [];

    for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
    {
        if(this._keyBindings[i].hasKeyIn(keyCode) === true)
        {
            bindings.push(this._keyBindings[i]);
        }
    }

    return bindings;
};

/**
 * Destroy sequence.
 * @method FORGE.Keyboard#destroy
 */
FORGE.Keyboard.prototype.destroy = function()
{
    this._viewer = null;

    window.removeEventListener("keydown", this._keyDownBind, false);
    window.removeEventListener("keyup", this._keyUpBind, false);

    var i = this._keyBindings.length;
    while(i--)
    {
        this.removeBinding(this._keyBindings[i]);
    }
    this._keyBindings = null;

    this._keyDownBind = null;
    this._keyUpBind = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Gets or sets the enabled status of the keyboard.
 * @name FORGE.Keyboard#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.Keyboard.prototype, "enabled",
{
    /** @this {FORGE.Keyboard} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Keyboard} */
    set: function(value)
    {
        this._enabled = Boolean(value);
    }
});
