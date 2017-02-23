
/**
 * System management.
 *
 * @constructor FORGE.System
 * @param {FORGE.Viewer} viewer - The viewer reference.
 *
 * @todo  Rework wakelock with FORGE.Timer and find another place to code it.
 * @todo Update the wakelock to be sure that the window.stop() doesn't stop the load of current elements when invoked otherwise it can result issues.
 * In this case the elements must known the wakelock status to be able to resume/restart the load.
 *
 * @todo  activate/deactivate the "focus" (commented) and "Pagevisibility API"
 *
 */
FORGE.System = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Loader#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Wakelock status for tablet/mobile devices.
     * @name  FORGE.System#_wakelock
     * @type {boolean}
     * @private
     */
    this._wakelock = false;

    /**
     * Interval value for the wakelock.
     * @name  FORGE.System#_wakelockInterval
     * @type {?number}
     * @private
     */
    this._wakelockInterval = null;

    /**
     * This is a copy of on focus handler with this as this reference (bind).
     * @name  FORGE.System#_onFocusBind
     * @type {Function}
     * @default  null
     * @private
     */
    //this._onFocusBind = null;

    /**
     * This is a copy of on blur handler with this as this reference (bind).
     * @name  FORGE.System#_onBlurBind
     * @type {Function}
     * @default  null
     * @private
     */
    //this._onBlurBind = null;

    /**
     * This is a copy of visibility change handler with this as this reference (bind).
     * @name  FORGE.System#_visibilityChangeBind
     * @type {Function}
     * @default  null
     * @private
     */
    this._visibilityChangeBind = null;

    /**
     * Ability to lock screen in landscape when using the fullscreen.
     * Note: recent Android devices only !
     * @name  FORGE.System#_lockScreen
     * @type {boolean}
     * @private
     */
    this._lockScreen = false;

    /**
     * Ability use the pointer lock API.
     * @name  FORGE.System#_pointerLock
     * @type {boolean}
     * @private
     */
    this._pointerLock = false;
};

FORGE.System.prototype.constructor = FORGE.System;

/**
 * Boot sequence.
 * @method FORGE.System#boot
 */
FORGE.System.prototype.boot = function()
{
    // bind visibility change event
    this._visibilityChangeBind = this._visibilityChangeHandler.bind(this);

    /*
    // bind focus event
    this._onFocusBind = this._onFocusHandler.bind(this);
    // bind blur event
    this._onBlurBind = this._onBlurHandler.bind(this);
    */

    this._setLockScreenOrientationEvent();

    this._setPageVisibilityEvent();
};

/**
 * Update the wakelock status for mobile/tablet devices.
 * @method  FORGE.System#_updateWakelock
 * @private
 */
FORGE.System.prototype._updateWakelock = function()
{
    //@todo only iOS ???
    //WindowsPhone ???
    if(this._wakelock === true && (FORGE.Device.tablet || FORGE.Device.mobile))
    {
        this._wakelockInterval = setInterval(function()
        {
            // request a page reload
            window.location = window.location;
            setTimeout(window.stop, 0);
        }, 15000);
    }
    else
    {
        clearInterval(this._wakelockInterval);
    }
    /*
    @todo Android Wakelock

      var noSleep = 'data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4ECQoWBAhhTgGcBAAAAAAACWxFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEuTbuMU6uEHFO7a1OsggI+7AEAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmAQAAAAAAAEMq17GDD0JATYCMTGF2ZjU2LjQuMTAxV0GMTGF2ZjU2LjQuMTAxc6SQ20Yv/Elws73A/+KfEjM11ESJiEBkwAAAAAAAFlSuawEAAAAAAABHrgEAAAAAAAA+14EBc8WBAZyBACK1nIN1bmSGhVZfVlA4g4EBI+ODhAT3kNXgAQAAAAAAABKwgRC6gRBTwIEBVLCBEFS6gRAfQ7Z1AQAAAAAAALHngQCgAQAAAAAAAFyho4EAAIAQAgCdASoQABAAAEcIhYWIhYSIAgIADA1gAP7/q1CAdaEBAAAAAAAALaYBAAAAAAAAJO6BAaWfEAIAnQEqEAAQAABHCIWFiIWEiAICAAwNYAD+/7r/QKABAAAAAAAAQKGVgQBTALEBAAEQEAAYABhYL/QACAAAdaEBAAAAAAAAH6YBAAAAAAAAFu6BAaWRsQEAARAQABgAGFgv9AAIAAAcU7trAQAAAAAAABG7j7OBALeK94EB8YIBgfCBAw==';

      function AndroidWakeLock() {
        var video = document.createElement('video');
        video.addEventListener('ended', function() {
          video.play();
        });
        this.request = function() {
          if (video.paused) {
            video.src = noSleep;
            video.play();
          }
        };
        this.release = function() {
          video.pause();
          video.src = '';
        };
      }
    */
};

/**
 * Update the pointer lock status.
 * @method  FORGE.System#_updatePointerLock
 * @private
 */
FORGE.System.prototype._updatePointerLock = function()
{
    if(FORGE.Device.pointerLock === true)
    {
        if(this._pointerLock === true)
        {
            this._requestPointerLock();
        }
        else
        {
            this._releasePointerLock();
        }
    }
};

/**
 * Request pointer lock.
 * @method  FORGE.System#_requestPointerLock
 * @private
 */
FORGE.System.prototype._requestPointerLock = function()
{
    var requestPointerLock =
    [
        "requestPointerLock",
        "mozRequestPointerLock",
        "webkitRequestPointerLock"
    ];
    for(var i = 0, ii = requestPointerLock.length; i < ii; i++)
    {
        if(typeof this._viewer.canvas._dom[requestPointerLock[i]] === "function")
        {
            this._viewer.canvas._dom[requestPointerLock[i]]();
            break;
        }
    }
};

/**
 * Release pointer lock.
 * @method  FORGE.System#_releasePointerLock
 * @private
 */
FORGE.System.prototype._releasePointerLock = function()
{
    var exitPointerLock =
    [
        "exitPointerLock",
        "mozExitPointerLock",
        "webkitExitPointerLock"
    ];
    for(var i = 0, ii = exitPointerLock.length; i < ii; i++)
    {
        if(typeof this._viewer.canvas._dom[exitPointerLock[i]] === "function")
        {
            this._viewer.canvas._dom[exitPointerLock[i]]();
            break;
        }
    }

};

/**
 * Define the window focus and visible change event to use for the tab.
 * @method  FORGE.System#_setPageVisibilityEvent
 * @private
 */
FORGE.System.prototype._setPageVisibilityEvent = function()
{
    /*
    // bind focus event
    window.addEventListener((FORGE.Device.iOS === true?"pageshow":"focus"), this._onFocusBind, false);

    // bind blur event
    window.addEventListener((FORGE.Device.iOS === true?"pagehide":"blur"), this._onBlurBind, false);
    */

    //add event listener for visible change event
    document.addEventListener(FORGE.Device.visibilityChange, this._visibilityChangeBind, false);

    //force current tab state
    this._visibilityChangeHandler();
};

/**
 * Check if the current tab is visible or not.
 * @method  FORGE.System#_visibilityChangeHandler
 * @private
 */
FORGE.System.prototype._visibilityChangeHandler = function()
{
    var state = document[FORGE.Device.visibilityState];

    if (typeof state === "string" && state === "visible")
    {
        this._onFocusHandler();
    }
    else
    {
        this._onBlurHandler();
    }
};

/**
 * Action when the browser window has the focus.
 * @method  FORGE.System#_onFocusHandler
 * @private
 */
FORGE.System.prototype._onFocusHandler = function()
{
    // the setTimeout() is used due to a delay
    // before the tab gains focus again in some browsers
    this._viewer.resume(); //setTimeout(this._viewer.resume(),300);
};

/**
 * Action when the browser window loses the focus.
 * @method  FORGE.System#_onBlurHandler
 * @private
 */
FORGE.System.prototype._onBlurHandler = function()
{
    // the setTimeout() is used due to a delay
    // before the tab gains focus again in some browsers
    this._viewer.pause(); //setTimeout(this._viewer.pause(),300);
};

/**
 * Update the lock screen orientation status for recent Android devices.
 * @method  FORGE.System#_setLockScreenOrientationEvent
 * @private
 */
FORGE.System.prototype._setLockScreenOrientationEvent = function()
{
    if(FORGE.Device.isAndroidStockBrowser === true && (FORGE.Device.screenOrientation === true || typeof FORGE.Device.orientation === "string"))
    {
        //add lock screen activation/deactivation on fullscreen enter/exit
        this._viewer.container.onFullscreenEnter.add(this._activateLockScreenOrientation, this);
        this._viewer.container.onFullscreenExit.add(this._deactivateLockScreenOrientation, this);
    }
};

/**
 * Define the lock screen orientation event to use on fullscreen.
 * @method  FORGE.System#_lockScreenOrientation
 * @private
 */
FORGE.System.prototype._lockScreenOrientation = function()
{
    if(FORGE.Device.isAndroidStockBrowser === true && (FORGE.Device.screenOrientation === true || typeof FORGE.Device.orientation === "string"))
    {
        if(this._lockScreen === true)
        {
            //lock
            this._activateLockScreenOrientation();
        }
        else
        {
            //unlock
            this._deactivateLockScreenOrientation();
        }
    }
};

/**
 * Activate the lock screen orientation.
 * Note: force the landscape modes when locked.
 * @method  FORGE.System#_activateLockScreenOrientation
 * @private
 */
FORGE.System.prototype._activateLockScreenOrientation = function()
{
    if (document[FORGE.Device.fullscreenElement] !== null)
    {
        var currentOrientation = "" + ( FORGE.Device.screenOrientation === true ? window.screen.orientation.type : window.screen[FORGE.Device.orientation] );
        //force landscape
        var targetOrientation = (currentOrientation.indexOf("landscape") >= 0 ? currentOrientation : "landscape");
        if(typeof window.screen[FORGE.Device.lockOrientation] === "function")
        {
            window.screen[FORGE.Device.lockOrientation](targetOrientation);
        }
        else if(FORGE.Device.screenOrientation === true)
        {
            window.screen.orientation.lock(targetOrientation);
        }
    }
};

/**
 * Deactivate the lock screen orientation.
 * @method  FORGE.System#_deactivateLockScreenOrientation
 * @private
 */
FORGE.System.prototype._deactivateLockScreenOrientation = function()
{
    if(typeof window.screen[FORGE.Device.unlockOrientation] === "function")
    {
        window.screen[FORGE.Device.unlockOrientation]();
    }
    else if(FORGE.Device.screenOrientation === true)
    {
        window.screen.orientation.unlock();
    }
};

/**
 * Destroy sequence.
 * @method FORGE.System#destroy
 */
FORGE.System.prototype.destroy = function()
{
    if(FORGE.Device.isAndroidStockBrowser === true && (FORGE.Device.screenOrientation === true || typeof FORGE.Device.orientation === "string"))
    {
        this._viewer.container.onFullscreenEnter.remove(this._activateLockScreenOrientation, this);
        this._viewer.container.onFullscreenExit.remove(this._deactivateLockScreenOrientation, this);
    }

    /*
    window.removeEventListener((FORGE.Device.iOS === true?"pageshow":"focus"), this._onFocusBind, false);
    window.removeEventListener((FORGE.Device.iOS === true?"pagehide":"blur"), this._onBlurBind, false);
    */
    document.removeEventListener(FORGE.Device.visibilityChange, this._visibilityChangeBind, false);
    /*
    this._onFocusBind = null;
    this._onBlurBind = null;
    */
    this._visibilityChangeBind = null;

    this._viewer = null;
};

/**
 * Get and set the wakelock status.
 * @name FORGE.System#wakelock
 * @type {boolean}
 */
Object.defineProperty(FORGE.System.prototype, "wakelock",
{
    /** @this {FORGE.System} */
    get: function()
    {
        return this._wakelock;
    },

    /** @this {FORGE.System} */
    set: function(value)
    {
        if(typeof value !== "boolean" || this._wakelock === value)
        {
            return;
        }

        this._wakelock = value;

        this._updateWakelock();
    }
});

/**
 * Get and set the lock screen orientation status.
 * @name FORGE.System#lockScreenOrientation
 * @type {boolean}
 */
Object.defineProperty(FORGE.System.prototype, "lockScreenOrientation",
{
    /** @this {FORGE.System} */
    get: function()
    {
        return this._lockScreen;
    },

    /** @this {FORGE.System} */
    set: function(value)
    {
        if(typeof value !== "boolean" || this._lockScreen === value)
        {
            return;
        }

        this._lockScreen = value;

        this._lockScreenOrientation();
    }
});

/**
 * Get and set the pointer lock status.
 * @name FORGE.System#pointerLock
 * @type {boolean}
 */
Object.defineProperty(FORGE.System.prototype, "pointerLock",
{
    /** @this {FORGE.System} */
    get: function()
    {
        return this._pointerLock;
    },

    /** @this {FORGE.System} */
    set: function(value)
    {
        if(typeof value !== "boolean" || this._pointerLock === value)
        {
            return;
        }

        this._pointerLock = value;

        this._updatePointerLock();
    }
});
