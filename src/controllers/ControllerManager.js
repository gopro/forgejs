
/**
 * @constructor FORGE.ControllerManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ControllerManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.ControllerManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Array of controllers.
     * @name FORGE.ControllerManager#_controllers
     * @type {Array<FORGE.ControllerBase>}
     * @private
     */
    this._controllers = [];

    /**
     * Enabled flag.
     * @name  FORGE.ControllerManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Event dispatcher for control start.
     * @name FORGE.ControllerManager#_onControlStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onControlStart = null;

    /**
     * Event dispatcher for control end.
     * @name FORGE.ControllerManager#_onControlEnd
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onControlEnd = null;

    FORGE.BaseObject.call(this, "ControllerManager");
};

FORGE.ControllerManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ControllerManager.prototype.constructor = FORGE.ControllerManager;

/**
 * Controllers default configuration
 * @name  FORGE.ControllerManager.DEFAULT_CONFIG
 * @const
 */
FORGE.ControllerManager.DEFAULT_CONFIG =
{
    enabled: true,

    instances:
    [
        {
            type: FORGE.ControllerType.POINTER,
            enabled: true
        },

        {
            type: FORGE.ControllerType.KEYBOARD,
            enabled: true
        },

        {
            type: FORGE.ControllerType.GYROSCOPE,
            enabled: true
        },

        {
            type: FORGE.ControllerType.GAMEPAD,
            enabled: true
        }
    ]
};

/**
 * Parse configuration object
 * @method FORGE.ControllerManager#_parseConfig
 * @param {ControllersConfig} config - The config you want to add.
 * @private
 */
FORGE.ControllerManager.prototype._parseConfig = function(config)
{
    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;

    if(typeof config.instances !== "undefined")
    {
        var controllerConfig;
        var controller;

        for(var i = 0, ii = config.instances.length; i < ii; i++)
        {
            controllerConfig = config.instances[i];

            switch(controllerConfig.type)
            {
                case FORGE.ControllerType.POINTER:
                    controller = new FORGE.ControllerPointer(this._viewer, controllerConfig);
                    break;

                case FORGE.ControllerType.KEYBOARD:
                    controller = new FORGE.ControllerKeyboard(this._viewer, controllerConfig);
                    break;

                case FORGE.ControllerType.GYROSCOPE:
                    controller = new FORGE.ControllerGyroscope(this._viewer, controllerConfig);
                    break;

                case FORGE.ControllerType.GAMEPAD:
                    controller = new FORGE.ControllerGamepad(this._viewer, controllerConfig);
                    break;

                default:
                    controller = null;
                    break;
            }

            if(controller !== null)
            {
                this._controllers.push(controller);
            }
        }
    }
};

/**
 * Controllers will call this method to notify the manager that a control start.
 * @method FORGE.ControllerManager#notifyControlStart
 * @param  {FORGE.ControllerBase} controller - The controller that notifies the manager.
 */
FORGE.ControllerManager.prototype.notifyControlStart = function(controller)
{
    if(this._onControlStart !== null)
    {
        this._onControlStart.dispatch({"controller": controller});
    }
};

/**
 * Controllers will call this method to notify the manager that a controller ends.
 * @method FORGE.ControllerManager#notifyControlEnd
 * @param  {FORGE.ControllerBase} controller - The controller that notifies the manager.
 */
FORGE.ControllerManager.prototype.notifyControlEnd = function(controller)
{
    if(this._onControlEnd !== null)
    {
        this._onControlEnd.dispatch({"controller": controller});
    }
};

/**
 * Controllers update routine
 * @method FORGE.ControllerManager#update
 */
FORGE.ControllerManager.prototype.update = function()
{
    if (this._controllers === null)
    {
        return;
    }

    for(var i = 0, ii = this._controllers.length; i < ii; i++)
    {
        if (typeof this._controllers[i].update === "function")
        {
            this._controllers[i].update();
        }
    }
};

/**
 * Add a config to the manager.
 * @method FORGE.ControllerManager#addConfig
 * @param {ControllersConfig} config - The config you want to add.
 */
FORGE.ControllerManager.prototype.addConfig = function(config)
{
    config = (typeof config !== "undefined") ? config : FORGE.ControllerManager.DEFAULT_CONFIG;

    this._parseConfig(config);
};

/**
 * Get a controller by its type.
 * @method FORGE.ControllerManager#getByType
 * @param {string} type - The type of the controller you want to get.
 * @return {?FORGE.ControllerBase} return the desired type controller, null if not found
 */
FORGE.ControllerManager.prototype.getByType = function(type)
{
    var controller;

    for(var i = 0, ii = this._controllers.length; i < ii; i++)
    {
        controller = this._controllers[i];

        if(controller.type === type)
        {
            return controller;
        }
    }

    return null;
};

/**
 * Destroy method.
 */
FORGE.ControllerManager.prototype.destroy = function()
{
    var count = this._controllers.length - 1;
    while(count--)
    {
        this._controllers[count].destroy();
        this._controllers[count] = null;
    }
    this._controllers = null;

    if(this._onControlStart !== null)
    {
        this._onControlStart.destroy();
        this._onControlStart = null;
    }

    if(this._onControlEnd !== null)
    {
        this._onControlEnd.destroy();
        this._onControlEnd = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get all controllers.
 * @name FORGE.ControllerManager#all
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.ControllerManager.prototype, "all",
{
    /** @this {FORGE.ControllerManager} */
    get: function()
    {
        return this._controllers;
    }
});

/**
 * Get or set the global enabled flag.
 * @name FORGE.ControllerManager#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.ControllerManager.prototype, "enabled",
{
    /** @this {FORGE.ControllerManager} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.ControllerManager} */
    set: function(value)
    {
        this._enabled = Boolean(value);
    }
});

/**
 * know if any of the controllers is currently in use
 * @name FORGE.ControllerManager#active
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.ControllerManager.prototype, "active",
{
    /** @this {FORGE.ControllerManager} */
    get: function()
    {
        for(var i = 0, ii = this._controllers.length; i < ii; i++)
        {
            if(this._controllers[i].active === true)
            {
                return true;
            }
        }

        return false;
    }
});

/**
 * Get the "onControlStart" {@link FORGE.EventDispatcher} of the camera controller.
 * @name FORGE.ControllerManager#onControlStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.ControllerManager.prototype, "onControlStart",
{
    /** @this {FORGE.ControllerManager} */
    get: function()
    {
        if(this._onControlStart === null)
        {
            this._onControlStart = new FORGE.EventDispatcher(this);
        }

        return this._onControlStart;
    }
});

/**
 * Get the "onControlEnd" {@link FORGE.EventDispatcher} of the camera controller.
 * @name FORGE.ControllerManager#onControlEnd
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.ControllerManager.prototype, "onControlEnd",
{
    /** @this {FORGE.ControllerManager} */
    get: function()
    {
        if(this._onControlEnd === null)
        {
            this._onControlEnd = new FORGE.EventDispatcher(this);
        }

        return this._onControlEnd;
    }
});
