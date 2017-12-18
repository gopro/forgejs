/**
 * FORGE.ControllerBase
 * CameraBaseController class.
 *
 * Base controller class
 *
 * @constructor FORGE.ControllerBase
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @param {string=} className - subclass className
 * @extends {FORGE.BaseObject}
 */
FORGE.ControllerBase = function(viewer, className)
{
    /**
     * Viewer reference
     * @type {FORGE.Viewer}
     * @name FORGE.ControllerBase#_viewer
     * @private
     */
    this._viewer = viewer;

    /**
     * Type of the controller
     * @name FORGE.ControllerBase#_type
     * @type {string}
     * @private
     */
    this._type = FORGE.ControllerType.BASE;

    /**
     * Main camera reference.
     * @type {FORGE.Camera}
     * @name FORGE.ControllerBase#_camera
     * @private
     */
    this._camera = null;

    /**
     * Enabled state flag.
     * @type {boolean}
     * @name FORGE.ControllerBase#_enabled
     * @private
     */
    this._enabled = false;

    /**
     * Active state flag.
     * @type {boolean}
     * @name FORGE.ControllerBase#_active
     * @private
     */
    this._active = false;

    /**
     * Control start event handler.
     * @type {FORGE.EventDispatcher}
     * @name FORGE.ControllerBase#_onControlStart
     * @private
     */
    this._onControlStart = null;

    /**
     * Control end event handler.
     * @type {FORGE.EventDispatcher}
     * @name FORGE.ControllerBase#_onControlEnd
     * @private
     */
    this._onControlEnd = null;

    FORGE.BaseObject.call(this, className || "ControllerBase");

    this._boot();
};

FORGE.ControllerBase.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ControllerBase.prototype.constructor = FORGE.ControllerBase;

/**
 * Boot sequence.
 * @method FORGE.ControllerBase#_boot
 * @private
 */
FORGE.ControllerBase.prototype._boot = function()
{
    this._viewer.canvas.pointer.enabled = true;
    
    this._viewer.story.onSceneLoadComplete.add(this._onSceneLoadComplete, this);
};

/**
 * Scene load complete handler
 * @method FORGE.ControllerBase#_onSceneLoadComplete
 * @param {FORGE.Event} event - new scene active viewport
 * @private
 */
FORGE.ControllerBase.prototype._onSceneLoadComplete = function(event)
{
    this._viewer.story.scene.onActiveViewportChange.add(this._onSceneActiveViewportChange, this);
    this._camera = this._viewer.camera;
};

/**
 * Active viewport change handler.
 * @method FORGE.ControllerBase#_onSceneActiveViewportChange
 * @param {FORGE.Event} event - new scene active viewport
 * @private
 */
FORGE.ControllerBase.prototype._onSceneActiveViewportChange = function(event)
{
    this._camera = this._viewer.camera;
};

/**
 * Enable control.
 * @method FORGE.ControllerBase#enable
 */
FORGE.ControllerBase.prototype.enable = function()
{
    if(this._enabled === true)
    {
        return;
    }

    this._enabled = true;
};

/**
 * Disable control.
 * @method FORGE.ControllerBase#disable
 */
FORGE.ControllerBase.prototype.disable = function()
{
    if(this._enabled === false)
    {
        return;
    }

    this._enabled = false;
};

/**
 * Destroy sequence.
 * @method FORGE.ControllerBase#destroy
 * @private
 */
FORGE.ControllerBase.prototype.destroy = function()
{
    this._viewer.story.onSceneLoadComplete.remove(this._onSceneLoadComplete, this);
    this._viewer.story.scene.onActiveViewportChange.remove(this._onSceneActiveViewportChange, this);

    this._camera = null;
    this._viewer = null;

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
 * Get or set the enabled flag.
 * @name FORGE.ControllerBase#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.ControllerBase.prototype, "enabled",
{
    /** @this {FORGE.ControllerBase} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.ControllerBase} */
    set: function(value)
    {
        if(Boolean(value) === true)
        {
            this.enable();
        }
        else
        {
            this.disable();
        }
    }
});

/**
 * Get type of the controller.
 * @name FORGE.ControllerBase#type
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ControllerBase.prototype, "type",
{
    /** @this {FORGE.ControllerBase} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get the "active" flag of the camera controller. A controller is active when it is currently in use.
 * @name FORGE.ControllerBase#active
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.ControllerBase.prototype, "active",
{
    /** @this {FORGE.ControllerBase} */
    get: function()
    {
        return this._active;
    }
});

/**
 * Get the "onControlStart" {@link FORGE.EventDispatcher} of the camera controller.
 * @name FORGE.ControllerBase#onControlStart
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.ControllerBase.prototype, "onControlStart",
{
    /** @this {FORGE.ControllerBase} */
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
 * @name FORGE.ControllerBase#onControlEnd
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.ControllerBase.prototype, "onControlEnd",
{
    /** @this {FORGE.ControllerBase} */
    get: function()
    {
        if(this._onControlEnd === null)
        {
            this._onControlEnd = new FORGE.EventDispatcher(this);
        }

        return this._onControlEnd;
    }
});
