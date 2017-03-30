/**
 * Gyroscope manager that handles gyroscope events.
 *
 * @constructor FORGE.Gyroscope
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Gyroscope = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Gyroscope#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Is the keyboard is enabled?
     * @name FORGE.Gyroscope#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * On orientation event dispatcher
     * @name FORGE.Gyroscope#_onDeviceOrientationChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onDeviceOrientationChange = null;

    /**
     * On orientation event dispatcher
     * @name FORGE.Gyroscope#_onScreenOrientationChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onScreenOrientationChange = null;

    FORGE.BaseObject.call(this, "Gyroscope");

    this._boot();
};

FORGE.Gyroscope.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Gyroscope.prototype.constructor = FORGE.Gyroscope;

/**
 * Boot sequence
 * @method FORGE.Gyroscope#_boot
 * @suppress {checkTypes}
 * @private
 */
FORGE.Gyroscope.prototype._boot = function()
{
    if (FORGE.Device.deviceOrientation === false)
    {
        return;
    }

    window.addEventListener("deviceorientation", this._deviceOrientationHandler.bind(this), false);
    window.addEventListener("orientationchange", this._screenOrientationHandler.bind(this), false);
};

/**
 * Device orientation handler
 * @method FORGE.Gyroscope#_deviceOrientationHandler
 * @param {DeviceOrientationEvent} event - the event associated to the device orientation
 * @private
 */
FORGE.Gyroscope.prototype._deviceOrientationHandler = function(event)
{
    // Fire the event
    if (this._onDeviceOrientationChange !== null && this._enabled === true)
    {
        this._onDeviceOrientationChange.dispatch(event);
    }
};

/**
 * Screen orientation handler
 * @method FORGE.Gyroscope#_screenOrientationHandler
 * @private
 */
FORGE.Gyroscope.prototype._screenOrientationHandler = function()
{
    // Fire the event
    if (this._onScreenOrientationChange !== null && this._enabled === true)
    {
        this._onScreenOrientationChange.dispatch();
    }
};

/**
 * Destroy sequence.
 * @method FORGE.Gyroscope#destroy
 * @suppress {checkTypes}
 */
FORGE.Gyroscope.prototype.destroy = function()
{
    this._viewer = null;

    window.removeEventListener("deviceorientation", this._deviceOrientationHandler.bind(this), false);
    window.removeEventListener("orientationchange", this._screenOrientationHandler.bind(this), false);

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Gets or sets the enabled status of the gyroscope.
 * @name FORGE.Gyroscope#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.Gyroscope.prototype, "enabled",
{
    /** @this {FORGE.Gyroscope} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Gyroscope} */
    set: function(value)
    {
        this._enabled = Boolean(value);
    }
});

/**
 * Gets the onDeviceOrientationChange {@link FORGE.EventDispatcher}.
 * @name FORGE.Gyroscope#onDeviceOrientationChange
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Gyroscope.prototype, "onDeviceOrientationChange",
{
    /** @this {FORGE.Gyroscope} */
    get: function()
    {
        if (this._onDeviceOrientationChange === null)
        {
            this._onDeviceOrientationChange = new FORGE.EventDispatcher(this);
        }

        return this._onDeviceOrientationChange;
    }
});

/**
 * Gets the onScreenOrientationChange {@link FORGE.EventDispatcher}.
 * @name FORGE.Gyroscope#onScreenOrientationChange
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Gyroscope.prototype, "onScreenOrientationChange",
{
    /** @this {FORGE.Gyroscope} */
    get: function()
    {
        if (this._onScreenOrientationChange === null)
        {
            this._onScreenOrientationChange = new FORGE.EventDispatcher(this);
        }

        return this._onScreenOrientationChange;
    }
});
