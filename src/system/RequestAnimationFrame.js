
/**
 * Handle the main loop, choose between a requestAnimationFrame (RAF) or a setTimeout method.
 * @constructor FORGE.RequestAnimationFrame
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 */
FORGE.RequestAnimationFrame = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.RequestAnimationFrame#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The timer reference.
     * @name FORGE.RequestAnimationFrame#_timeOutId
     * @type {Object}
     * @private
     */
    this._timeOutId = null;

    /**
     * Is the current timer out?
     * @name FORGE.RequestAnimationFrame#_isSetTimeOut
     * @type {boolean}
     * @private
     */
    this._isSetTimeOut = false;

    /**
     * The function to call on each loop.
     * @name FORGE.RequestAnimationFrame#_onLoop
     * @type {?function(?number)}
     * @private
     */
    this._onLoop = null;

    /**
     * Is RAF running?
     * @name FORGE.RequestAnimationFrame#_running
     * @type {boolean}
     * @private
     */
    this._running = false;

    /**
     * The number of loops.
     * @name FORGE.RequestAnimationFrame#_called
     * @type {number}
     * @private
     */
    this._called = 0;

    /**
     * Request animation frame owner
     * @type {Object}
     * @private
     */
    this._owner = null;

    this._boot();
};

FORGE.RequestAnimationFrame.prototype.constructor = FORGE.RequestAnimationFrame;

/**
 * Boot sequence.
 * @method FORGE.RequestAnimationFrame#_boot
 */
FORGE.RequestAnimationFrame.prototype._boot = function()
{
    var vendors =
    [
        "ms",
        "moz",
        "webkit",
        "o"
    ];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; x++)
    {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"];
    }

    this._owner = window;
};

/**
 * Start the RAF.
 * @method FORGE.RequestAnimationFrame#start
 * @param {(Window|VRDisplay)=} owner request animation frame owner: window (default) or VRDisplay instance
 * @suppress {checkTypes}
 */
FORGE.RequestAnimationFrame.prototype.start = function(owner)
{
    this._owner = (typeof owner !== "undefined" && (owner === window || owner instanceof VRDisplay || owner instanceof THREE.WebGLRenderer)) ? owner : window;

    this._running = true;

    if (this._owner instanceof THREE.WebGLRenderer)
    {
        this._isSetTimeOut = false;

        this._onLoop = function (time)
        {
            if(this._running === true)
            {
                this._viewer.update(time);
            }
            return;
        };

        this._owner.setAnimationLoop(this._onLoop.bind(this));
    }
    else if (this._viewer.config.update === "timeout")
    {
        this._isSetTimeOut = true;

        this._onLoop = function ()
        {
            if(this._running === true)
            {
                return this._updateSetTimeout();
            }
            return;
        };

        this._timeOutID = window.setTimeout(this._onLoop.bind(this), 0);
    }
    else
    {
        this._isSetTimeOut = false;

        this._onLoop = function (time)
        {
            if(this._running === true)
            {
                return this._updateRAF(time);
            }
            return;
        };

        this._timeOutID = this._owner.requestAnimationFrame(this._onLoop.bind(this));
    }
};

/**
 * Stop the RAF.
 * @method FORGE.RequestAnimationFrame#stop
 */
FORGE.RequestAnimationFrame.prototype.stop = function()
{
    if (this._owner instanceof THREE.WebGLRenderer)
    {
        this._owner.setAnimationLoop(null);
    }
    else if (this._isSetTimeOut)
    {
        clearTimeout(this._timeOutID);
    }
    else
    {
        this._owner.cancelAnimationFrame(this._timeOutID);
        this._timeOutID = null;
    }

    this._running = false;
};

/**
 * Update the RAF.
 * @method FORGE.RequestAnimationFrame#_updateRAF
 * @param {number} time - The current time.
 * @suppress {checkTypes}
 * @private
 */
FORGE.RequestAnimationFrame.prototype._updateRAF = function(time)
{
    this._called++;
    this._viewer.update(Math.floor(time));
    this._timeOutID = this._owner.requestAnimationFrame(this._onLoop.bind(this));
};

/**
 * Update the timer.<br>
 * Timer is based on 30ms.
 * @method FORGE.RequestAnimationFrame#_updateSetTimeout
 * @private
 */
FORGE.RequestAnimationFrame.prototype._updateSetTimeout = function()
{
    this._called++;
    this._viewer.update(0); //fake time
    this._timeOutID = window.setTimeout(this._onLoop.bind(this), 1000/30);
};

/**
 * Destroy sequence.
 * @method FORGE.RequestAnimationFrame#destroy
 * @suppress {checkTypes}
 */
FORGE.RequestAnimationFrame.prototype.destroy = function()
{
    this.stop();
    this._viewer = null;
    this._timeOutId = null;
    this._onLoop = null;
    this._owner = null;
};

/**
 * Get the running flag of the request animation frame module.
 * @name  FORGE.RequestAnimationFrame#running
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.RequestAnimationFrame.prototype, "running",
{
    /** @this {FORGE.RequestAnimationFrame} */
    get: function ()
    {
        return this._running;
    }
});

