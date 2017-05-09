/**
 * A gamepad controller (type xbox or ps4 for example).
 *
 * @constructor FORGE.ControllerGamepad
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {ControllerInstanceConfig} config - the configuration of the controller
 * @extends {FORGE.ControllerBase}
 */
FORGE.ControllerGamepad = function(viewer, config)
{
    /**
     * A list of associated gamepad
     * @name FORGE.ControllerGamepad#_gamepads
     * @type {?Array<FORGE.Gamepad>}
     * @private
     */
    this._gamepads = null;

    /**
     * Configuration
     * @name FORGE.ControllerGamepad#_config
     * @type {ControllerInstanceConfig}
     * @private
     */
    this._config = config;

    /**
     * Orientation controller configuration.
     * @name FORGE.ControllerGamepad#_orientation
     * @type {ControllerOrientationConfig}
     * @private
     */
    this._orientation;

    /**
     * Zoom controller configuration.
     * @name FORGE.ControllerGamepad#_zoom
     * @type {ControllerZoomConfig}
     * @private
     */
    this._zoom;

    /**
     * Previous position vector.
     * @name FORGE.ControllerGamepad#_positionCurrent
     * @type {THREE.Vector2}
     * @private
     */
    this._positionCurrent = null;

    /**
     * Current velocity vector.
     * @name FORGE.ControllerGamepad#_velocity
     * @type {THREE.Vector2}
     * @private
     */
    this._velocity = null;

    /**
     * Previous velocity vector.
     * @name FORGE.ControllerGamepad#_inertia
     * @type {THREE.Vector2}
     * @private
     */
    this._inertia = null;

    /**
     * Array of all button bindings
     * @name FORGE.ControllerGamepad#_buttonBindings
     * @type {Array<FORGE.ButtonBinding>}
     * @private
     */
    this._buttonBindings = null;

    /**
     * Array of all axis bindings
     * @name FORGE.ControllerGamepad#_axisBindings
     * @type {Array<FORGE.AxisBinding>}
     * @private
     */
    this._axisBindings = null;

    FORGE.ControllerBase.call(this, viewer, "ControllerGamepad");
};

FORGE.ControllerGamepad.prototype = Object.create(FORGE.ControllerBase.prototype);
FORGE.ControllerGamepad.prototype.constructor = FORGE.ControllerGamepad;

/**
 * Default configuration
 * @name {FORGE.ControllerGamepad.DEFAULT_OPTIONS}
 * @type {ControllerKeyboardConfig}
 */
FORGE.ControllerGamepad.DEFAULT_OPTIONS = {
    orientation:
    {
        hardness: 0.6, //Hardness factor impatcing controller response to some instant force.
        damping: 0.15, //Damping factor controlling inertia.
        velocityMax: 300,
        invert: false
    },

    zoom:
    {
        hardness: 5,
        invert: false
    }
};

/**
 * Boot sequence.
 * @method FORGE.ControllerGamepad#_boot
 * @private
 */
FORGE.ControllerGamepad.prototype._boot = function()
{
    FORGE.ControllerBase.prototype._boot.call(this);

    this._type = FORGE.ControllerType.GAMEPAD;

    this._gamepads = [];

    this._buttonBindings = [];
    this._axisBindings = [];

    this._inertia = new THREE.Vector2();
    this._velocity = new THREE.Vector2();
    this._positionStart = new THREE.Vector2();
    this._positionCurrent = new THREE.Vector2();

    this._parseConfig(this._config);

    if (this._enabled === true)
    {
        this.enable();
    }

    this._viewer.gamepad.onGamepadConnected.add(this._onGamepadConnectedHandler, this);
    this._viewer.gamepad.onGamepadDisconnected.add(this._onGamepadDisconnectedHandler, this);
};

/**
 * Parse the configuration.
 * @method FORGE.ControllerGamepad#_parseConfig
 * @param {ControllerInstanceConfig} config - configuration object to parse.
 */
FORGE.ControllerGamepad.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._register();

    var options = config.options ||
    {};

    this._orientation = /** @type {ControllerOrientationConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerGamepad.DEFAULT_OPTIONS.orientation, options.orientation));
    this._zoom = /** @type {ControllerZoomConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerGamepad.DEFAULT_OPTIONS.zoom, options.zoom));

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;

    if (options.default !== false)
    {
        this._addDefaultBindings();
    }

    if (typeof options.bindings !== "undefined")
    {
        if (typeof options.bindings.buttons !== "undefined" && Array.isArray(options.bindings.buttons) === true)
        {
            for (var i = 0, ii = options.bindings.buttons.length; i < ii; i++)
            {
                this._addButtonBinding(options.bindings.buttons[i]);
            }
        }

        if (typeof options.bindings.axes !== "undefined" && Array.isArray(options.bindings.axes) === true)
        {
            for (var i = 0, ii = options.bindings.axes.length; i < ii; i++)
            {
                this._addAxisBinding(options.bindings.axes[i]);
            }
        }
    }
};

/**
 * Add the default bindings ot the controller gamepad : direction with left stick, zoom with LT and
 * RT buttons (6 and 7 according to standard mapping).
 * @method FORGE.ControllerGamepad#_addDefaultBindings
 * @private
 */
FORGE.ControllerGamepad.prototype._addDefaultBindings = function()
{
    var bindingPlus = new FORGE.ButtonBinding(this._viewer,
        6,
        this._zoomDownHandler,
        this._zoomUpHandler,
        this._zoomHoldHandler,
        7,
        this,
        "plus"
    );
    this._buttonBindings.push(bindingPlus);

    var bindingMinus = new FORGE.ButtonBinding(this._viewer,
        7,
        this._zoomDownHandler,
        this._zoomUpHandler,
        this._zoomHoldHandler,
        6,
        this,
        "minus"
    );
    this._buttonBindings.push(bindingMinus);

    var bindingYaw = new FORGE.AxisBinding(this._viewer,
        2,
        this._yawMoveHandler,
        this,
        "yaw"
    );
    this._axisBindings.push(bindingYaw);

    var bindingPitch = new FORGE.AxisBinding(this._viewer,
        3,
        this._pitchMoveHandler,
        this,
        "pitch"
    );
    this._axisBindings.push(bindingPitch);
};

/**
 * Add a gamepad binding config to this controller.
 * @method FORGE.ControllerGamepad#_addButtonBinding
 * @param {ControllerGamepadButtonBindingConfig} binding - The binding config to add.
 * @private
 */
FORGE.ControllerGamepad.prototype._addButtonBinding = function(binding)
{
    var buttonsIn = binding.in;
    var buttonsOut = binding.out;
    var name = binding.name;
    var events = binding.events;

    if (FORGE.Utils.isTypeOf(buttonsIn, "number") === false && FORGE.Utils.isArrayOf(buttonsIn, "number") === false)
    {
        this.warn("Can't add custom gamepad binding, buttons in are invalid!");
        return;
    }

    if (typeof events !== "object" && events === null)
    {
        this.warn("Can't add custom gamepad binding, events are invalid!");
        return;
    }

    var binding = new FORGE.ButtonBinding(this._viewer, buttonsIn, events.onDown, events.onUp, events.onHold, buttonsOut, this, name);

    this._buttonBindings.push(binding);
};

/**
 * Add a gamepad axis binding config to this controller.
 * @method FORGE.ControllerGamepad#_addAxisBinding
 * @param {ControllerGamepadAxisBindingConfig} binding - the binding config to add
 * @private
 */
FORGE.ControllerGamepad.prototype._addAxisBinding = function(binding)
{
    var axes = binding.axes;
    var name = binding.name;
    var events = binding.events;

    if (FORGE.Utils.isTypeOf(axes, "number") === false && FORGE.Utils.isArrayOf(axes, "number") === false)
    {
        this.warn("Can't add custom gamepad binding, axes in are invalid!");
        return;
    }

    if (typeof events !== "object" && events === null)
    {
        this.warn("Can't add custom gamepad binding, events are invalid!");
        return;
    }

    var binding = new FORGE.AxisBinding(this._viewer, axes, events.move, this, name);

    this._axisBindings.push(binding);
};

/**
 * Event handler for yaw movement.
 * @method FORGE.ControllerGamepad#_yawMoveHandler
 * @param {FORGE.AxisBinding} binding - the reference to the binding
 * @param {number} value - the value of the move of the yaw
 * @private
 */
FORGE.ControllerGamepad.prototype._yawMoveHandler = function(binding, value)
{
    // Check the delta, as the value isn't exactly 0 at rest
    if (Math.abs(value) < 0.1)
    {
        this._velocity.setX(0);
        this._positionCurrent.setX(0);
        return;
    }

    this._positionCurrent.setX(180 * value);
};

/**
 * Event handler for pitch movement.
 * @method FORGE.ControllerGamepad#_pitchMoveHandler
 * @param {FORGE.AxisBinding} binding - the reference to the binding
 * @param {number} value - the value of the move of the pitch
 * @private
 */
FORGE.ControllerGamepad.prototype._pitchMoveHandler = function(binding, value)
{
    // Check the delta, as the value isn't exactly 0 at rest
    if (Math.abs(value) < 0.1)
    {
        this._velocity.setY(0);
        this._positionCurrent.setY(0);
        return;
    }

    this._positionCurrent.setY(180 * value);
};

/**
 * Event handler for zoom (+ / -) down handler.
 * @method FORGE.ControllerGamepad#_zoomDownHandler
 * @param  {FORGE.ButtonBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerGamepad.prototype._zoomDownHandler = function(binding)
{
    if (this._viewer.controllers.enabled === false)
    {
        return;
    }

    this._active = true;

    this._zoomProcessBinding(binding);

    if (this._onControlStart !== null)
    {
        this._onControlStart.dispatch();
    }

    this._viewer.controllers.notifyControlStart(this);
};

/**
 * Event handler for zoom (+ / -) hold handler.
 * @method FORGE.ControllerGamepad#_zoomHoldHandler
 * @param  {FORGE.ButtonBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerGamepad.prototype._zoomHoldHandler = function(binding)
{
    this._zoomProcessBinding(binding);
};

/**
 * Event handler for zoom (+ / -) up handler.
 * @method FORGE.ControllerGamepad#_zoomUpHandler
 * @private
 */
FORGE.ControllerGamepad.prototype._zoomUpHandler = function()
{
    this._active = false;

    if (this._onControlEnd !== null)
    {
        this._onControlEnd.dispatch();
    }

    this._viewer.controllers.notifyControlEnd(this);
};

/**
 * Process a key binding related to zoom for down and hold zoom handlers.
 * @method FORGE.ControllerGamepad#_zoomProcessBinding
 * @param  {FORGE.ButtonBinding} binding - The key binding related to zoom
 * @private
 */
FORGE.ControllerGamepad.prototype._zoomProcessBinding = function(binding)
{
    var invert = this._zoom.invert ? 1 : -1;
    var delta = invert / this._zoom.hardness;

    switch (binding.name)
    {
        case "minus":
            delta *= 5;
            break;

        case "plus":
            delta *= -5;
            break;
    }

    this._camera.fov = this._camera.fov - delta;
};

/**
 * Add a gamepad to this controller.
 * @method FORGE.ControllerGamepad#addGamepad
 * @param {FORGE.Gamepad} gamepad - the gamepad to add
 */
FORGE.ControllerGamepad.prototype._onGamepadConnectedHandler = function(gamepad)
{
    gamepad = gamepad.data;

    if (this._gamepads.indexOf(gamepad) === -1)
    {
        this._gamepads.push(gamepad);
    }

    var binding;

    for (var i = 0, ii = this._buttonBindings.length; i < ii; i++)
    {
        binding = this._buttonBindings[i];
        gamepad.addBinding(binding);
    }

    for (var i = 0, ii = this._axisBindings.length; i < ii; i++)
    {
        binding = this._axisBindings[i];
        gamepad.addBinding(binding);
    }
};

/*
 * Remove a gamepad to this controller.
 * @method FORGE.ControllerGamepad#removeGamepad
 * @param {string} name - the name of the gamepad to remove
 */
FORGE.ControllerGamepad.prototype._onGamepadDisconnectedHandler = function(name)
{
    name = name.data;

    var index;

    for (var i = 0, ii = this._gamepads.length; i < ii; i++)
    {
        if (this._gamepads[i].name === name)
        {
            index = i;
            break;
        }
    }

    if (index !== -1)
    {
        this._gamepads.splice(index, 1);
    }
};

/**
 * Enable controller
 * @method FORGE.ControllerGamepad#enable
 */
FORGE.ControllerGamepad.prototype.enable = function()
{
    FORGE.ControllerBase.prototype.enable.call(this);

    var binding;

    for (var i = 0, ii = this._buttonBindings.length; i < ii; i++)
    {
        binding = this._buttonBindings[i];

        for (var j = 0, jj = this._gamepads.length; j < jj; j++)
        {
            this._gamepads[j].addBinding(binding);
        }
    }

    for (var i = 0, ii = this._axisBindings.length; i < ii; i++)
    {
        binding = this._axisBindings[i];

        for (var j = 0, jj = this._gamepads.length; j < jj; j++)
        {
            this._gamepads[j].addBinding(binding);
        }
    }
};

/**
 * Disable controller
 * @method FORGE.ControllerGamepad#disable
 */
FORGE.ControllerGamepad.prototype.disable = function()
{
    FORGE.ControllerBase.prototype.disable.call(this);

    var binding;

    for (var i = 0, ii = this._buttonBindings.length; i < ii; i++)
    {
        binding = this._buttonBindings[i];

        for (var j = 0, jj = this._gamepads.length; j < jj; j++)
        {
            this._gamepads[j].removeBinding(binding);
        }
    }

    for (var i = 0, ii = this._axisBindings.length; i < ii; i++)
    {
        binding = this._axisBindings[i];

        for (var j = 0, jj = this._gamepads.length; j < jj; j++)
        {
            this._gamepads[j].removeBinding(binding);
        }
    }
};

/**
 * Update routine.
 * @method FORGE.ControllerGamepad#update
 */
FORGE.ControllerGamepad.prototype.update = function()
{
    var size = this._viewer.renderer.displayResolution;
    var hardness = 1 / (this._orientation.hardness * Math.min(size.width, size.height));

    this._velocity = this._positionCurrent.clone();

    if (this._velocity.length() > this._orientation.velocityMax)
    {
        this._velocity.setLength(this._orientation.velocityMax);
    }

    this._velocity.multiplyScalar(hardness);

    var dx = this._velocity.x + this._inertia.x;
    var dy = this._velocity.y + this._inertia.y;

    if (dx === 0 && dy === 0)
    {
        return;
    }

    var invert = this._orientation.invert ? -1 : 1;
    this._camera.yaw += invert * dx;
    this._camera.pitch -= invert * dy;

    // Damping 1 -> stops instantly, 0 infinite rebounds
    this._inertia.add(this._velocity).multiplyScalar(FORGE.Math.clamp(1 - this._orientation.damping, 0, 1));
};

/**
 * Destroy routine
 * @method FORGE.ControllerGamepad#destroy
 */
FORGE.ControllerGamepad.prototype.destroy = function()
{
    this._viewer.gamepad.onGamepadConnected.remove(this._onGamepadConnectedHandler, this);
    this._viewer.gamepad.onGamepadDisconnected.remove(this._onGamepadDisconnectedHandler, this);

    FORGE.ControllerBase.prototype.destroy.call(this);
};
