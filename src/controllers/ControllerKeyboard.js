/**
 * @constructor FORGE.ControllerKeyboard
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @param {ControllerInstanceConfig} config - the configuration of the controller
 * @extends {FORGE.ControllerBase}
 */
FORGE.ControllerKeyboard = function(viewer, config)
{
    /**
     * Configuration
     * @name FORGE.ControllerKeyboard#_config
     * @type {ControllerInstanceConfig}
     * @private
     */
    this._config = config;

    /**
     * Orientation controller configuration.
     * @name FORGE.ControllerKeyboard#_orientation
     * @type {ControllerOrientationConfig}
     * @private
     */
    this._orientation;

    /**
     * Zoom controller configuration.
     * @name FORGE.ControllerKeyboard#_zoom
     * @type {ControllerZoomConfig}
     * @private
     */
    this._zoom;

    /**
     * Previous position vector.
     * @name FORGE.ControllerKeyboard#_positionStart
     * @type {THREE.Vector2}
     * @private
     */
    this._positionStart = null;

    /**
     * Previous position vector.
     * @name FORGE.ControllerKeyboard#_positionCurrent
     * @type {THREE.Vector2}
     * @private
     */
    this._positionCurrent = null;

    /**
     * Current velocity vector.
     * @name FORGE.ControllerKeyboard#_velocity
     * @type {THREE.Vector2}
     * @private
     */
    this._velocity = null;

    /**
     * Previous velocity vector.
     * @name FORGE.ControllerKeyboard#_inertia
     * @type {THREE.Vector2}
     * @private
     */
    this._inertia = null;

    /**
     * Array of all key bindings
     * @name FORGE.ControllerKeyboard#_keyBindings
     * @type {Array<FORGE.KeyBinding>}
     * @private
     */
    this._keyBindings = null;

    FORGE.ControllerBase.call(this, viewer, "ControllerKeyboard");
};

FORGE.ControllerKeyboard.prototype = Object.create(FORGE.ControllerBase.prototype);
FORGE.ControllerKeyboard.prototype.constructor = FORGE.ControllerKeyboard;

/**
 * Default configuration
 * @name {FORGE.ControllerKeyboard.DEFAULT_OPTIONS}
 * @type {ControllerKeyboardConfig}
 */
FORGE.ControllerKeyboard.DEFAULT_OPTIONS =
{
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
 * @method FORGE.ControllerKeyboard#_boot
 * @private
 */
FORGE.ControllerKeyboard.prototype._boot = function()
{
    FORGE.ControllerBase.prototype._boot.call(this);

    this._type = FORGE.ControllerType.KEYBOARD;

    this._keyBindings = [];

    this._inertia = new THREE.Vector2();
    this._velocity = new THREE.Vector2();
    this._positionStart = new THREE.Vector2();
    this._positionCurrent = new THREE.Vector2();

    this._parseConfig(this._config);

    if(this._enabled === true)
    {
        this.enable();
    }
};

/**
 * Parse the configuration.
 * @method FORGE.ControllerKeyboard#_parseConfig
 * @param {ControllerInstanceConfig} config - configuration object to parse.
 */
FORGE.ControllerKeyboard.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._register();

    var options = config.options || {};

    this._orientation = /** @type {ControllerOrientationConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerKeyboard.DEFAULT_OPTIONS.orientation, options.orientation));
    this._zoom = /** @type {ControllerZoomConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerKeyboard.DEFAULT_OPTIONS.zoom, options.zoom));

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;

    if(options.default !== false)
    {
        this._addDefaultBindings();
    }

    if(Array.isArray(options.bindings) === true)
    {
        for(var i = 0, ii = options.bindings.length; i < ii; i++)
        {
            this._addBinding(options.bindings[i]);
        }
    }
};

/**
 * Add the default bindings to the controller keyboard : orientation with arrows and zoom with plus (+) and minus (-).
 * @method FORGE.ControllerKeyboard#_addDefaultBinding.
 * @private
 */
FORGE.ControllerKeyboard.prototype._addDefaultBindings = function()
{
    var bindingLeft = new FORGE.KeyBinding(this._viewer,
        [81, 37],
        this._orientationDownHandler,
        this._orientationUpHandler,
        this._orientationHoldHandler,
        [68, 39],
        this,
        "left"
    );
    this._keyBindings.push(bindingLeft);

    var bindingRight = new FORGE.KeyBinding(this._viewer,
        [68, 39],
        this._orientationDownHandler,
        this._orientationUpHandler,
        this._orientationHoldHandler,
        [81, 37],
        this,
        "right"
    );
    this._keyBindings.push(bindingRight);

    var bindingUp = new FORGE.KeyBinding(this._viewer,
        [90, 38],
        this._orientationDownHandler,
        this._orientationUpHandler,
        this._orientationHoldHandler,
        [83, 40],
        this,
        "up"
    );
    this._keyBindings.push(bindingUp);

    var bindingDown = new FORGE.KeyBinding(this._viewer,
        [83, 40],
        this._orientationDownHandler,
        this._orientationUpHandler,
        this._orientationHoldHandler,
        [90, 38],
        this,
        "down"
    );
    this._keyBindings.push(bindingDown);

    var bindingPlus = new FORGE.KeyBinding(this._viewer,
        107,
        this._zoomDownHandler,
        this._zoomUpHandler,
        this._zoomHoldHandler,
        109,
        this,
        "plus"
    );
    this._keyBindings.push(bindingPlus);

    var bindingMinus = new FORGE.KeyBinding(this._viewer,
        109,
        this._zoomDownHandler,
        this._zoomUpHandler,
        this._zoomHoldHandler,
        107,
        this,
        "minus"
    );
    this._keyBindings.push(bindingMinus);
};

/**
 * Add a keyboard binding config to this controller.
 * @method FORGE.ControllerKeyboard#_addBinding
 * @param {ControllerKeyboardBindingConfig} binding - The binding config to add.
 * @private
 */
FORGE.ControllerKeyboard.prototype._addBinding = function(binding)
{
    var keysIn = binding.in;
    var keysOut = binding.out;
    var name = binding.name;
    var events = binding.events;

    if(FORGE.Utils.isTypeOf(keysIn, "number") === false && FORGE.Utils.isArrayOf(keysIn, "number") === false)
    {
        this.warn("Can't add custom keyboard binding, keys in are invalid!");
        return;
    }

    if(typeof events !== "object" && events === null)
    {
        this.warn("Can't add custom keyboard binding, events are invalid!");
        return;
    }

    var keyBinding = new FORGE.KeyBinding(this._viewer, keysIn, events.onDown, events.onUp, events.onHold, keysOut, this, name);

    this._keyBindings.push(keyBinding);
};

/**
 * Event handler for orientation (arrows) down handler.
 * @method FORGE.ControllerKeyboard#_orientationDownHandler
 * @param  {FORGE.KeyBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerKeyboard.prototype._orientationDownHandler = function(binding)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    this._active = true;

    switch(binding.name)
    {
        case "left":
        case "right":
            this._velocity.setX(0);
            break;

        case "up":
        case "down":
            this._velocity.setY(0);
            break;
    }

    if (this._onControlStart !== null)
    {
        this._onControlStart.dispatch();
    }

    this._viewer.controllers.notifyControlStart(this);
};

/**
 * Event handler for orientation (arrows) hold handler.
 * @method FORGE.ControllerKeyboard#_orientationHoldHandler
 * @param  {FORGE.KeyBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerKeyboard.prototype._orientationHoldHandler = function(binding)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    switch(binding.name)
    {
        case "left":
            this._positionCurrent.setX(this._positionCurrent.x - 5);
            break;

        case "right":
            this._positionCurrent.setX(this._positionCurrent.x + 5);
            break;

        case "up":
            this._positionCurrent.setY(this._positionCurrent.y - 5);
            break;

        case "down":
            this._positionCurrent.setY(this._positionCurrent.y + 5);
            break;
    }
};

/**
 * Event handler for orientation (arrows) up handler.
 * @method FORGE.ControllerKeyboard#_orientationUpHandler
 * @param  {FORGE.KeyBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerKeyboard.prototype._orientationUpHandler = function(binding)
{
    this._active = false;

    switch(binding.name)
    {
        case "left":
        case "right":
            this._velocity.setX(0);
            this._positionCurrent.setX(0);
            break;

        case "up":
        case "down":
            this._velocity.setY(0);
            this._positionCurrent.setY(0);
            break;
    }

    if (this._onControlEnd !== null)
    {
        this._onControlEnd.dispatch();
    }

    this._viewer.controllers.notifyControlEnd(this);
};

/**
 * Event handler for zoom (+ / -) down handler.
 * @method FORGE.ControllerKeyboard#_zoomDownHandler
 * @param  {FORGE.KeyBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerKeyboard.prototype._zoomDownHandler = function(binding)
{
    if(this._viewer.controllers.enabled === false)
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
 * @method FORGE.ControllerKeyboard#_zoomHoldHandler
 * @param  {FORGE.KeyBinding} binding - The binding associated to the event.
 * @private
 */
FORGE.ControllerKeyboard.prototype._zoomHoldHandler = function(binding)
{
    this._zoomProcessBinding(binding);
};

/**
 * Event handler for zoom (+ / -) up handler.
 * @method FORGE.ControllerKeyboard#_zoomUpHandler
 * @private
 */
FORGE.ControllerKeyboard.prototype._zoomUpHandler = function()
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
 * @method FORGE.ControllerKeyboard#_zoomProcessBinding
 * @param  {FORGE.KeyBinding} binding - The key binding related to zoom
 * @private
 */
FORGE.ControllerKeyboard.prototype._zoomProcessBinding = function(binding)
{
    var invert = this._zoom.invert ? 1 : -1;
    var delta = invert / this._zoom.hardness;

    switch(binding.name)
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
 * Enable controller
 * @method FORGE.ControllerKeyboard#enable
 */
FORGE.ControllerKeyboard.prototype.enable = function()
{
    FORGE.ControllerBase.prototype.enable.call(this);

    var binding;

    for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
    {
        binding = this._keyBindings[i];
        this._viewer.keyboard.addBinding(binding);
    }
};

/**
 * Disable controller
 * @method FORGE.ControllerKeyboard#disable
 */
FORGE.ControllerKeyboard.prototype.disable = function()
{
    FORGE.ControllerBase.prototype.disable.call(this);

    var binding;

    for(var i = 0, ii = this._keyBindings.length; i < ii; i++)
    {
        binding = this._keyBindings[i];
        this._viewer.keyboard.removeBinding(binding);
    }
};

/**
 * Update routine.
 * @method FORGE.ControllerKeyboard#update
 */
FORGE.ControllerKeyboard.prototype.update = function()
{
    var size = this._viewer.renderer.displayResolution;
    var hardness = 1 / (this._orientation.hardness * Math.min(size.width, size.height));

    this._velocity.subVectors(this._positionCurrent, this._positionStart);

    if (this._velocity.length() > this._orientation.velocityMax)
    {
        this._velocity.setLength(this._orientation.velocityMax);
    }

    this._velocity.multiplyScalar(hardness);

    // this.log("Current velocity: " + this._velocity.x + ", " + this._velocity.y);

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
 * @method FORGE.ControllerKeyboard#destroy
 */
FORGE.ControllerKeyboard.prototype.destroy = function()
{
    FORGE.ControllerBase.prototype.destroy.call(this);
};
