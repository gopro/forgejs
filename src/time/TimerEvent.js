
/**
 * Describe a timer event.
 *
 * @constructor FORGE.TimerEvent
 * @param {FORGE.Timer} timer - The {@link FORGE.Timer} that handle this event.
 * @param {number} delay - Delay in millisenconds.
 * @param {number} tick - The current clock tick.
 * @param {number} repeatCount - The number of time the timer should repeat itself.
 * @param {boolean} loop - Does the timer have to loop?
 * @param {Function} callback - The callback function for this timer event complete.
 * @param {Object} callbackContext - The context in which the callback have to be executed.
 * @param {Array<*>} args - The arguments to pass to the callback.
 */
FORGE.TimerEvent = function(timer, delay, tick, repeatCount, loop, callback, callbackContext, args)
{

    /**
     * The timer object.
     * @name FORGE.TimerEvent#timer
     * @type {FORGE.Timer}
     */
    this.timer = timer;

    /**
     * Delay in millisenconds.
     * @name FORGE.TimerEvent#delay
     * @type {number}
     */
    this.delay = delay;

    /**
     * The current clock tick.
     * @name FORGE.TimerEvent#tick
     * @type {number}
     */
    this.tick = tick;

    /**
     * The number of time the timer should repeat itself.
     * @name FORGE.TimerEvent#repeatCount
     * @type {number}
     */
    this.repeatCount = repeatCount - 1;

    /**
     * Does the timer have to loop?
     * @name FORGE.TimerEvent#loop
     * @type {boolean}
     */
    this.loop = loop;

    /**
     * The callback function for this timer event complete.
     * @name FORGE.TimerEvent#_callback
     * @type {Function}
     * @private
     */
    this._callback = callback;

    /**
     * The context in which the callback have to be executed.
     * @name FORGE.TimerEvent#_callbackContext
     * @type {Object}
     * @private
     */
    this._callbackContext = callbackContext;

    /**
     * List of arguments.
     * @name FORGE.TimerEvent#_args
     * @type {Array<*>}
     * @private
     */
    this._args = args;

    /**
     * Must be deleted?
     * @name FORGE.TimerEvent#pendingDelete
     * @type {boolean}
     */
    this.pendingDelete = false;
};

FORGE.TimerEvent.prototype.constructor = FORGE.TimerEvent;

/**
 * Execute the callback with arguments.
 * @method FORGE.TimerEvent#execute
 */
FORGE.TimerEvent.prototype.execute = function()
{
    if (typeof this._callback === "function")
    {
        this._callback.apply(this._callbackContext, this._args);
    }
};
