
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
     * This is a copy of visibility change handler with this as this reference (bind).
     * @name  FORGE.System#_visibilityChangeBind
     * @type {Function}
     * @default  null
     * @private
     */
    this._visibilityChangeBind = null;
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
    this._setPageVisibilityEvent();
};

/**
 * Define the window focus and visible change event to use for the tab.
 * @method  FORGE.System#_setPageVisibilityEvent
 * @private
 */
FORGE.System.prototype._setPageVisibilityEvent = function()
{
    // add event listener for visible change event
    document.addEventListener(FORGE.Device.visibilityChange, this._visibilityChangeBind, false);

    // force current tab state
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
        this._viewer.resume(true);
    }
    else
    {
        this._viewer.pause(true);
    }
};

/**
 * Destroy sequence.
 * @method FORGE.System#destroy
 */
FORGE.System.prototype.destroy = function()
{
    document.removeEventListener(FORGE.Device.visibilityChange, this._visibilityChangeBind, false);
    this._visibilityChangeBind = null;

    this._viewer = null;
};
