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
     * @name FORGE.ControllerGamepad#_positionStart
     * @type {THREE.Vector2}
     * @private
     */
    this._positionStart = null;

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

    if (Array.isArray(options.bindings) === true)
    {
        for (var i = 0, ii = options.bindings.length; i < ii; i++)
        {
            this._addBinding(options.bindings[i]);
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
};

/**
 * Add a gamepad binding config to this controller.
 * @method FORGE.ControllerGamepad#_addBinding
 * @param {ControllerKeyboardBindingConfig} binding - The binding config to add.
 * @private
 */
FORGE.ControllerGamepad.prototype._addBinding = function(binding)
{
    var buttonsIn = binding.in;
    var buttonsOut = binding.out;
    var name = binding.name;
    var events = binding.events;

    if (FORGE.Utils.isTypeOf(buttonsIn, "number") === false && FORGE.Utils.isArrayOf(buttonsIn, "number") === false)
    {
        this.warn("Can't add custom gamepad binding, keys in are invalid!");
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
            delta *= 10;
            break;

        case "plus":
            delta *= -10;
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
