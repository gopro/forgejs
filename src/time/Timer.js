
/**
 * Timer utility that work with {@link FORGE.Clock}.
 * @constructor FORGE.Timer
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {boolean} autoDestroy - Does the timer will autodestroy on time complete?
 * @extends {FORGE.BaseObject}
 */
FORGE.Timer = function(viewer, autoDestroy)
{
    /**
     * The viewer reference.
     * @name FORGE.Timer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Must be destoyed when time complete?
     * @name FORGE.Timer#_viewer
     * @type {boolean}
     * @private
     */
    this._autoDestroy = (typeof autoDestroy !== "undefined") ? autoDestroy : true;

    /**
     * The start time.
     * @name FORGE.Timer#_startTime
     * @type {number}
     * @private
     */
    this._startTime = 0;

    /**
     * Is timer running?
     * @name FORGE.Timer#_running
     * @type {boolean}
     * @private
     */
    this._running = false;

    /**
     * The time when paused.
     * @name FORGE.Timer#_pauseTime
     * @type {number}
     * @private
     */
    this._pauseTime = 0;

    /**
     * The number of pauses.
     * @name FORGE.Timer#_pauseTotal
     * @type {number}
     * @private
     */
    this._pauseTotal = 0;

    /**
     * Is timer paused?
     * @name FORGE.Timer#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    /**
     * The current time.
     * @name FORGE.Timer#_now
     * @type {number}
     * @private
     */
    this._now = 0;

    /**
     * The clock tick.
     * @name FORGE.Timer#_tick
     * @type {number}
     * @private
     */
    this._tick = 0;

    /**
     * Is timer expired?
     * @name FORGE.Timer#_expired
     * @type {boolean}
     * @private
     */
    this._expired = false;

    /**
     * The list of events.
     * @name FORGE.Timer#_events
     * @type {Array<FORGE.TimerEvent>}
     * @private
     */
    this._events = null;

     /**
     * Internal reference to the onStart {@link FORGE.EventDispatcher}.
     * @name FORGE.Timer#_onStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStart = null;

     /**
     * Internal reference to the onPause {@link FORGE.EventDispatcher}.
     * @name FORGE.Timer#_onPause
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * Internal reference to the onResume {@link FORGE.EventDispatcher}.
     * @name FORGE.Timer#_onResume
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

     /**
     * Internal reference to the onStop {@link FORGE.EventDispatcher}.
     * @name FORGE.Timer#_onStop
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * Internal reference to the onComplete {@link FORGE.EventDispatcher}.
     * @name FORGE.Timer#_onComplete
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    FORGE.BaseObject.call(this, "Timer");

    this._boot();
};

FORGE.Timer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Timer.prototype.constructor = FORGE.Timer;

/**
 * Boot sequence.
 * @method FORGE.Timer#_boot
 * @private
 */
FORGE.Timer.prototype._boot = function()
{
    this._events = [];
    this._now = Date.now();
};

/**
 * Update events.
 * @method FORGE.Timer#_updateEvents
 * @param  {number} baseTime - The reference time.
 * @private
 */
FORGE.Timer.prototype._updateEvents = function(baseTime)
{
    for(var i = 0; i < this._events.length; i++)
    {
        var event = this._events[i];

        if (event.pendingDelete === false)
        {
            // Work out how long there would have been from when the game paused until the events next tick
            var t = event.tick - baseTime;

            if (t < 0)
            {
                t = 0;
            }

            // Add the difference on to the time now
            event.tick = this._now + t;
        }
    }

    var d = this._nextTick - baseTime;

    if (d < 0)
    {
        this._nextTick = this._now;
    }
    else
    {
        this._nextTick = this._now + d;
    }
};

/**
 * Sort events list to get the next event.
 * @method FORGE.Timer#_sort
 * @private
 */
FORGE.Timer.prototype._sort = function()
{
    if (this._events.length > 0)
    {
        this._events.sort(this._sortCompare);
        this._nextTick = this._events[0].tick;
    }
};

/**
 * Sort comparison for events.
 * @param  {FORGE.TimerEvent} a - First event to compare.
 * @param  {FORGE.TimerEvent} b - Second event to compare.
 * @return {number} Returns 1 if bigger, -1 if lower, 0 if equal.
 * @private
 */
FORGE.Timer.prototype._sortCompare = function (a, b)
{
    if (a.tick < b.tick)
    {
        return -1;
    }
    else if (a.tick > b.tick)
    {
        return 1;
    }

    return 0;
};

/**
 * Clear pending events.
 * @method FORGE.Timer#_clearPendingEvents
 * @private
 */
FORGE.Timer.prototype._clearPendingEvents = function ()
{
    var count = this._events.length;

    while (count--)
    {
        if (this._events[count].pendingDelete === true)
        {
            this._events.splice(count, 1);
        }
    }
};

/**
 * Create an event in the timer.
 * @method FORGE.Timer#create
 * @param {number} delay - The delay to call the event.
 * @param {boolean} loop - Must be looped?
 * @param {number} repeatCount - Number of repetition.
 * @param {Function} callback - The callback function.
 * @param {Object} callbackContext - The context for the callback function.
 * @param {Array<*>} args - List of arguments.
 * @return {FORGE.TimerEvent} Returns the created event.
 */
FORGE.Timer.prototype.create = function(delay, loop, repeatCount, callback, callbackContext, args)
{

    delay = Math.round(delay);

    var tick = delay;

    if (this._now === 0)
    {
        tick += this._viewer.clock.time;
    }
    else
    {
        tick += this._now;
    }

    var event = new FORGE.TimerEvent(this, delay, tick, repeatCount, loop, callback, callbackContext, args);

    this._events.push(event);

    this._sort();

    this._expired = false;

    return event;
};

/**
 * Add an event in the timer
 * @method FORGE.Timer#add
 * @param {number} delay - The delay to call the event.
 * @param {Function} callback - The callback function.
 * @param {Object} callbackContext - The context for the callback function.
 * @param {...*} args - Arguments to pass to the timer event handler
 * @return {FORGE.TimerEvent} Returns the created event.
 */
//jscs:disable
FORGE.Timer.prototype.add = function(delay, callback, callbackContext, args)
{
    return this.create(delay, false, 0, callback, callbackContext, Array.prototype.splice.call(arguments, 3));
};
//jscs:enable

/**
 * Repeat an event in the timer.
 * @method FORGE.Timer#repeat
 * @param {number} delay - The delay to call the event.
 * @param {number} repeatCount - The number of repetition.
 * @param {Function} callback - The callback function.
 * @param {Object}   callbackContext - The context for the callback function.
 * @return {FORGE.TimerEvent} Returns the created event.
 */
FORGE.Timer.prototype.repeat = function(delay, repeatCount, callback, callbackContext)
{
    return this.create(delay, false, repeatCount, callback, callbackContext, Array.prototype.splice.call(arguments, 4));
};

/**
 * Loop an event in the timer.
 * @method FORGE.Timer#loop
 * @param {number} delay - The delay to call the event.
 * @param {Function} callback - The callback function.
 * @param {Object} callbackContext - The context for the callback function.
 * @return {FORGE.TimerEvent} Returns the created event.
 */
FORGE.Timer.prototype.loop = function(delay, callback, callbackContext)
{
    return this.create(delay, true, 0, callback, callbackContext, Array.prototype.splice.call(arguments, 3));
};

/**
 * Remove an event from the timer.
 * @method FORGE.Timer#remove
 * @param {FORGE.TimerEvent} event - The event to remove.
 * @return {boolean} Returns true if event has been removed, if not, returns false.
 */
FORGE.Timer.prototype.remove = function(event)
{
    for (var i = 0; i < this._events.length; i++)
    {
        if (this._events[i] === event)
        {
            this._events[i].pendingDelete = true;
            return true;
        }
    }

    return false;
};

/**
 * Start the timer.
 * @method FORGE.Timer#start
 */
FORGE.Timer.prototype.start = function()
{
    if(this._running === true)
    {
        return;
    }

    this._startTime = this._viewer.clock.time;
    this._running = true;

    var event;
    for (var i = 0; i < this._events.length; i++)
    {
        event = this._events[i];
        event.tick = event.delay + this._startTime;
    }

    if(this._onStart !== null)
    {
        this._onStart.dispatch();
    }
};

/**
 * Stop the timer.
 * @method FORGE.Timer#stop
 * @param {boolean} [clear=true] - Clear the events list.
 */
FORGE.Timer.prototype.stop = function(clear)
{
    this._running = false;

    if (clear !== false)
    {
        this._events.length = 0;
    }

    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};

/**
 * Pause the timer.
 * @method FORGE.Timer#pause
 */
FORGE.Timer.prototype.pause = function()
{
    if (this._running === false || this._paused === true)
    {
        return;
    }

    this._pauseTime = this._viewer.clock.time;
    this._paused = true;

    if(this._onPause !== null)
    {
        this._onPause.dispatch();
    }
};

/**
 * Resume the timer.
 * @method FORGE.Timer#resume
 */
FORGE.Timer.prototype.resume = function()
{
    if (this._paused === false)
    {
        return;
    }

    var now = this._viewer.clock.time;
    this._pauseTotal += now - this._now;

    this._now = now;
    this._updateEvents(this._pauseTime);
    this._paused = false;

    if(this._onResume !== null)
    {
        this._onResume.dispatch();
    }
};

/**
 * Update the timer from the main loop.
 * @method FORGE.Timer#update
 * @param {number} time - The current time.
 */
FORGE.Timer.prototype.update = function(time)
{
    if(this._paused === true)
    {
        return;
    }

    var elapsed = time - this._now;
    this._now = time;

    //If elapsed time is superior to 1000ms, we can consider that time has been paused by a brower tab change which makes the raf pause.
    if(elapsed > 1000)
    {
        this._updateEvents(time - elapsed);
    }

    this._clearPendingEvents();

    var count = this._events.length;
    var i = 0;
    var markedForDeletion = 0;

    if (this._running === true && this._now >= this._nextTick && count > 0)
    {
        var event;

        while (i < count && this._running === true)
        {
            event = this._events[i];

            if (this._now >= event.tick && event.pendingDelete === false)
            {
                //  (now + delay) - (time difference from last tick to now)
                var newTick = (this._now + event.delay) - (this._now - event.tick);

                if (newTick < 0)
                {
                    newTick = this._now + event.delay;
                }

                if (event.loop === true)
                {
                    event.tick = newTick;
                    event.execute();
                }
                else if (event.repeatCount > 0)
                {
                    event.repeatCount--;
                    event.tick = newTick;
                    event.execute();
                }
                else
                {
                    markedForDeletion++;
                    event.pendingDelete = true;
                    event.execute();
                }

                i++;
            }
            else
            {
                break;
            }
        }

        //  Are there any events left?
        if (this._events.length > markedForDeletion)
        {
            this._sort();
        }
        else
        {
            this._expired = true;
            this._running = false;

            if(this._onComplete !== null)
            {
                this._onComplete.dispatch();
            }
        }
    }

    if (this._expired && this._autoDestroy)
    {
        this.destroy();
    }

};

/**
 * Destroy method.
 * @method FORGE.Timer#destroy
 */
FORGE.Timer.prototype.destroy = function()
{
    this._running = false;
    this._events = [];

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the auto destroy value.
 * @name FORGE.Timer#autoDestroy
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Timer.prototype, "autoDestroy",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        return this._autoDestroy;
    }
});

/**
 * Get the running value.
 * @name FORGE.Timer#running
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Timer.prototype, "running",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        return this._running;
    }
});

/**
 * Get the paused value.
 * @name FORGE.Timer#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Timer.prototype, "paused",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        return this._paused;
    }
});

/**
 * Get the time tick at which the next event will occur.
 * @name FORGE.Timer#next
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Timer.prototype, "next",
{
    /** @this {FORGE.Timer} */
    get: function ()
    {
        return this._nextTick;
    }
});

/**
 * The duration in ms remaining until the next event will occur.
 * @name FORGE.Timer#duration
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Timer.prototype, "duration",
{
    /** @this {FORGE.Timer} */
    get: function ()
    {
        if (this._running && this._nextTick > this._now)
        {
            return this._nextTick - this._now;
        }
        else
        {
            return 0;
        }
    }
});

/**
 * The number of pending events in the queue.
 * @name FORGE.Timer#length
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Timer.prototype, "length",
{
    /** @this {FORGE.Timer} */
    get: function ()
    {
        return this._events.length;
    }
});

/**
 * The duration in milliseconds that this Timer has been running for.
 * @name FORGE.Timer#ms
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Timer.prototype, "ms",
{
    /** @this {FORGE.Timer} */
    get: function ()
    {
        if (this._running)
        {
            return this._now - this._startTime - this._pauseTotal;
        }
        else
        {
            return 0;
        }
    }
});

/**
 * The duration in seconds that this Timer has been running for.
 * @name FORGE.Timer#seconds
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Timer.prototype, "seconds",
{
    /** @this {FORGE.Timer} */
    get: function ()
    {
        if (this._running)
        {
            return this.ms * 0.001;
        }
        else
        {
            return 0;
        }
    }

});

/**
 * Get the "onStart" event {@link FORGE.EventDispatcher} of the timer.
 * @name FORGE.Timer#onStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Timer.prototype, "onStart",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        if(this._onStart === null)
        {
            this._onStart = new FORGE.EventDispatcher(this);
        }

        return this._onStart;
    }
});

/**
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the timer.
 * @name FORGE.Timer#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Timer.prototype, "onPause",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        if(this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
 * Get the "onResume" event {@link FORGE.EventDispatcher} of the timer.
 * @name FORGE.Timer#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Timer.prototype, "onResume",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        if(this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});

/**
 * Get the "onStop" event {@link FORGE.EventDispatcher} of the timer.
 * @name FORGE.Timer#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Timer.prototype, "onStop",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        if(this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});

/**
 * Get the "onComplete" event {@link FORGE.EventDispatcher} of the timer.
 * @name FORGE.Timer#onComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Timer.prototype, "onComplete",
{
    /** @this {FORGE.Timer} */
    get: function()
    {
        if(this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});