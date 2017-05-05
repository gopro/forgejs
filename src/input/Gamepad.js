/**
 * Gamepads manager that handles gamepads
 *
 * @constructor FORGE.Gamepad
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {Gamepad} ref - the reference to the Gamepad object.
 * @extends {FORGE.BaseObject}
 */
FORGE.Gamepad = function(viewer, ref)
{
    /**
     * The viewer reference.
     * @name FORGE.Gamepad#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The reference to the Gamepad object
     * @name FORGE.Gamepad#_gamepad
     * @type {Gamepad}
     * @private
     */
    this._gamepad = ref;

    /**
     * The timestamp saved the last time the gamepad was updated.
     * @name FORGE.Gamepad#_previousTimestamp
     * @type {number}
     * @private
     */
    this._previousTimestamp = 0;

    /**
     * Is the gamepad enabled?
     * @name FORGE.Gamepad#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * The array that handles the {@link FORGE.KeyBinding} objects.
     * @name FORGE.Gamepad#_buttonBindings
     * @type {?Array<FORGE.ButtonBinding>}
     * @private
     */
    this._buttonBindings = null;

    /**
     * The array that handles the {@link FORGE.AxesBinding} objects.
     * @name FORGE.Gamepad#_axesBindings
     * @type {?Array<FORGE.AxisBinding>}
     * @private
     */
    this._axesBindings = null;

    /**
     * The array that handles the button codes that are considered as pressed.
     * @name FORGE.Gamepad#_buttonPressed
     * @type {?Array<number>}
     * @private
     */
    this._buttonPressed = null;

    FORGE.BaseObject.call(this, "Gamepad");

    this._boot();
};

FORGE.Gamepad.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Gamepad.prototype.constructor = FORGE.Gamepad;

/**
 * Boot sequence.
 * @method FORGE.Gamepad#_boot
 * @private
 */
FORGE.Gamepad.prototype._boot = function()
{
    this._buttonBindings = [];
    this._axesBindings = [];

    this._buttonPressed = [];
};

/**
 * Get the index of a KeyBinding.
 * @method FORGE.Gamepad#_indexOfBinding
 * @param  {FORGE.KeyBinding|number} value - The ButtonBinding or a button code (number).
 * @return {number} Returns the searched index if found, if not, returns -1.
 * @private
 */
FORGE.Gamepad.prototype._indexOfBinding = function(value)
{
    if (this._buttonBindings === null || this._buttonBindings.length === 0)
    {
        return -1;
    }

    if (typeof value === "object" && value.type === "KeyBinding")
    {
        return this._buttonBindings.indexOf(value);
    }

    if (typeof value === "number")
    {
        for (var i = 0, ii = this._buttonBindings.length; i < ii; i++)
        {
            if (this._buttonBindings[i].hasButtonIn(value) === true)
            {
                return i;
            }
        }
    }

    return -1;
};

/**
 * Process all buttons in the gamepad.
 * @method FORGE.Gamepad#_processButtons
 * @param {Array<GamepadButton>} buttons - the array of GamepadButton
 * @private
 */
FORGE.Gamepad.prototype._processButtons = function(buttons)
{
    var button, index, binding;

    // First process buttons
    for (var i = 0, ii = buttons.length; i < ii; i++)
    {
        button = buttons[i];
        index = this._buttonPressed.indexOf(i);

        if (button.pressed === true && index === -1)
        {
            this.log("button pressed " + i);
            this._buttonPressed.push(i);

            this._applyButton(i, button.value, true);
        }
        else if (button.pressed === false && index !== -1)
        {
            this.log("button released " + i);
            this._buttonPressed.splice(index, 1);

            this._applyButton(i, button.value, false);
        }
    }

    // Then process bindings for hold actions
    for (i = 0, ii = buttonBindings.length; i < ii; i++)
    {
        binding = buttonBindings[i];

        if (binding.pressed === true)
        {
            if (binding.hasToWaitToHold === true && binding.downComplete === false)
            {
                continue;
            }

            binding.hold();
        }
    }
};

/**
 * Get an array of bindings associated to the button.
 * @method FORGE.Gamepad#_getButtonBindings
 * @param {number} index - the index of the button
 * @return {Array<FORGE.KeyBinding>} an array of bindings
 * */
FORGE.Gamepad.prototype._getButtonBindings = function(index)
{
    var bindings = [];

    for (var i = 0, ii = this._buttonBindings.length; i < ii; i++)
    {
        if (this._buttonBindings[i].hasButtonIn(index) === true)
        {
            bindings.push(this._buttonBindings[i]);
        }
    }

    return bindings;
};

/**
 * Apply the callbacks associated to the button.
 * @method FORGE.Gamepad#_applyButton
 * @param {number} index - the index of the button
 * @param {number} value - the value of the button
 * @param {boolean} pressed - is the button pressed ?
 * @private
 */
FORGE.Gamepad.prototype._applyButton = function(index, value, pressed)
{
    var binding, bindings = this._getButtonBindings(index);

    for (var i = 0, ii = bindings.length; i < ii; i++)
    {
        binding = bindings[i];

        // Button down
        if (pressed === true && binding.pressed === false)
        {
            binding.down(value);
        }
        // Button up
        else if (pressed === false && binding.pressed === true)
        {
            binding.up(value);
        }
    }
};

/**
 * Process all buttons in the gamepad.
 * @method FORGE.Gamepad#_processAxes
 * @param {Array<number>} axes - the value of each axis
 * @private
 */
FORGE.Gamepad.prototype._processAxes = function(axes)
{
};

/**
 * Process the pose of the gamepad.
 * @method FORGE.Gamepad#_processPose
 * @param {GamepadPose} pose - the pose object
 * @private
 */
FORGE.Gamepad.prototype._processPose = function(pose)
{
};

/**
 * Update routine.
 * @method FORGE.Gamepad#update
 */
FORGE.Gamepad.prototype.update = function()
{
    if (this._enabled === true && this._gamepad.timestamp > this._previousTimestamp)
    {
        this._previousTimestamp = this._gamepad.timestamp;

        // Process buttons
        if (typeof this._gamepad.buttons !== "undefined")
        {
            this._processButtons(this._gamepad.buttons);
        }

        // Process axis
        if (typeof this._gamepad.axes !== "undefined")
        {
            this._processAxes(this._gamepad.axes);
        }

        // Process pose
        if (typeof this._gamepad.pose !== "undefined")
        {
            this._processPose(this._gamepad.pose);
        }
    }
};

/**
 * Add a ButtonBinding to the Gamepad's buttonBindings array.
 * @method FORGE.Gamepad#addBinding
 * @param {FORGE.KeyBinding} buttonBinding - The FORGE.KeyBinding you want to add.
 * @return {boolean} Returns true if it's correctly added, false if it's already in or if wrong type.
 */
FORGE.Gamepad.prototype.addBinding = function(buttonBinding)
{
    if (typeof buttonBinding !== "object" && buttonBinding.type !== "KeyBinding")
    {
        return false;
    }

    var index = this._indexOfBinding(buttonBinding);

    if (index === -1)
    {
        this._buttonBindings.push(buttonBinding);
        return true;
    }
    else
    {
        this.warn("Trying to add a duplicate button binding on the gamepad !");
    }

    return false;
};

/**
 * Remove a {@link FORGE.KeyBinding} from the {@link FORGE.Gamepad} object.
 * @method FORGE.Gamepad#removeBinding
 * @param  {FORGE.KeyBinding|number} buttonBinding - A {@link FORGE.KeyBinding} or a number that represent a button code.
 * @return {boolean} Returns true if it's removed, false if not found.
 */
FORGE.Gamepad.prototype.removeBinding = function(buttonBinding)
{
    var index = this._indexOfBinding(buttonBinding);

    if (index !== -1)
    {
        this._buttonBindings[index].destroy();
        this._buttonBindings.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Destroy sequence.
 * @method FORGE.Gamepad#destroy
 */
FORGE.Gamepad.prototype.destroy = function()
{
    this._viewer = null;

    var buttonBinding;

    while (this._buttonBindings !== null && this._buttonBindings.length > 0)
    {
        buttonBinding = this._buttonBindings.pop();
        buttonBinding.destroy();
    }
    this._buttonBindings = null;

    var axisBinding;

    while (this._axesBindings !== null && this._axesBindings.length > 0)
    {
        axisBinding = this._axesBindings.pop();
        axisBinding.destroy();
    }
    this._axesBindings = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Gets the name of the gamepad.
 * @name FORGE.Gamepad#name
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.Gamepad.prototype, "name",
{
    /** @this {FORGE.Gamepad} */
    get: function()
    {
        return this._gamepad.id;
    }
});

/**
 * Gets or sets the enabled status of the gamepad.
 * @name FORGE.Gamepad#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.Gamepad.prototype, "enabled",
{
    /** @this {FORGE.Gamepad} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Gamepad} */
    set: function(value)
    {
        this._enabled = Boolean(value);
    }
});
