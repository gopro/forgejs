/**
 * Camera manager
 * @constructor FORGE.CameraManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.CameraManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.CameraManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    this._cameraUids = [];

    /**
     * On camera change event dispatcher.
     * @name FORGE.CameraManager#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;

    /**
     * On camera orientation change event dispatcher.
     * @name FORGE.CameraManager#_onOrientationChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onOrientationChange = null;

    /**
     * On camera fov change event dispatcher.
     * @name FORGE.CameraManager#_onFovChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onFovChange = null;

    FORGE.BaseObject.call(this, "CameraManager");

    this._boot();
};

FORGE.CameraManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.CameraManager.prototype.constructor = FORGE.CameraManager;

/**
 * Boot sequence.
 * @method FORGE.CameraManager#_boot
 * @private
 */
FORGE.CameraManager.prototype._boot = function()
{
    FORGE.UID.onRegister.add(this._registerHandler, this);
    FORGE.UID.onUnegister.add(this._unregisterHandler, this);
};

/**
 * Register handler to watch camera addition to the UID
 * @method FORGE.CameraManager#_registerHandler
 * @param {FORGE.Event} event - The event dispatched by FORGE.UID
 */
FORGE.CameraManager.prototype._registerHandler = function(event)
{
    if (event.data.className === "Camera")
    {
        var camera = FORGE.UID.get(event.data.uid);

        this._bind(camera, this._onChange, "onChange");
        this._bind(camera, this._onOrientationChange, "onOrientationChange");
        this._bind(camera, this._onFovChange, "onFovChange");
    }
};

/**
 * Unregister handler to watch camera deletion from the UID
 * @method FORGE.CameraManager#_registerHandler
 * @param {FORGE.Event} event - The event dispatched by FORGE.UID
 */
FORGE.CameraManager.prototype._registerHandler = function(event)
{
    if (event.data.className === "Camera")
    {
        var camera = FORGE.UID.get(event.data.uid);

        this._unbind(camera, this._onChange, "onChange");
        this._unbind(camera, this._onOrientationChange, "onOrientationChange");
        this._unbind(camera, this._onFovChange, "onFovChange");
    }
};

/**
 * Bind the CameraManager listeners to a camera event
 * @method FORGE.CameraManager#_registerHandler
 * @param {FORGE.Camera} camera - The Camera to bind the event to.
 * @param {FORGE.EventDispatcher} dispacher - The CameraManager event dispatcher to replicate on the Camera.
 * @param {string} name - The public name of the event of the camera.
 */
FORGE.CameraManager.prototype._bind = function(camera, dispacher, name)
{
    var listener;

    if (dispacher !== null && dispacher.has() === true)
    {
        for (var i = 0, ii = dispacher.listeners.length; i < ii; i++)
        {
            listener = dispacher.listeners[i]
            camera[name].addListener(listener.listener, listener.isOnce, listener.context, listener.priority);
        }
    }
};

/**
 * Get the onChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.CameraManager#onChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.CameraManager.prototype, "onChange",
{
    /** @this {FORGE.CameraManager} */
    get: function()
    {
        if (this._onChange === null)
        {
            this._onChange = new FORGE.EventDispatcher(this);
        }

        return this._onChange;
    }
});

/**
 * Get the onOrientationChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.CameraManager#onOrientationChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.CameraManager.prototype, "onOrientationChange",
{
    /** @this {FORGE.CameraManager} */
    get: function()
    {
        if (this._onOrientationChange === null)
        {
            this._onOrientationChange = new FORGE.EventDispatcher(this);
        }

        return this._onOrientationChange;
    }
});

/**
 * Get the onFovChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.CameraManager#onFovChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.CameraManager.prototype, "onFovChange",
{
    /** @this {FORGE.CameraManager} */
    get: function()
    {
        if (this._onFovChange === null)
        {
            this._onFovChange = new FORGE.EventDispatcher(this);
        }

        return this._onFovChange;
    }
});
