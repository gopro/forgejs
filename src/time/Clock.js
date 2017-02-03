
/**
 * Handle the time.
 * @constructor FORGE.Clock
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Clock = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Clock#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The current time.
     * @name FORGE.Timer#_time
     * @type {number}
     * @private
     */
    this._time = 0;

    /**
     * Time from raf
     * @name FORGE.Clock#_rafTime
     * @type {number}
     * @private
     */
    this._rafTime = 0;

    /**
     * Started time.
     * @name FORGE.Timer#_started
     * @type {number}
     * @private
     */
    this._started = 0;

    /**
     * The {FORGE.Timer} list.
     * @name FORGE.Timer#_timers
     * @type {Array<FORGE.Timer>}
     * @private
     */
    this._timers = null;

    FORGE.BaseObject.call(this, "Clock");

    this._boot();
};

FORGE.Clock.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Clock.prototype.constructor = FORGE.Clock;

/**
 * Boot sequence.
 * @method FORGE.Clock#_boot
 * @private
 */
FORGE.Clock.prototype._boot = function()
{
    this._started = Date.now();
    this._time = Date.now();
    this._timers = [];
};

/**
 * Returns the timer identifier.
 * @method FORGE.Clock#_indexOfTimer
 * @param  {FORGE.Timer} timer - The timer to search for.
 * @return {number} Returns the {FORGE.Timer} identifier into the list of timers, if not, returns -1.
 * @private
 */
FORGE.Clock.prototype._indexOfTimer = function(timer)
{
    if(this._timers === null)
    {
        return -1;
    }

    var t;
    for ( var i = 0, ii = this._timers.length; i < ii; i++ )
    {
        t = this._timers[i];

        if(t === timer)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Internal handler for timer destroy.
 * @method FORGE.Clock#_onTimerDestroy
 * @param  {FORGE.Event} event - The event.
 * @private
 */
FORGE.Clock.prototype._onTimerDestroy = function(event)
{
    var timer = /** @type {FORGE.Timer} */ (event.emitter);
    var index = this._indexOfTimer(timer);

    if(index !== -1)
    {
        this._timers.splice(index, 1);
    }
};

/**
 * Create a {FORGE.Timer} for the clock.
 * @method FORGE.Clock#create
 * @param  {boolean} autoDestroy - The timer must be destroyed once completed?
 * @return {FORGE.Timer} The created {@link FORGE.Timer}.
 */
FORGE.Clock.prototype.create = function(autoDestroy)
{
    var timer = new FORGE.Timer(this._viewer, autoDestroy);
    return this.add(timer);
};

/**
 * Add a {@link FORGE.Timer} to the clock.
 * @method FORGE.Clock#add
 * @param {FORGE.Timer} timer - The {FORGE.Timer} to add.
 * @return {FORGE.Timer} The added {@link FORGE.Timer}.
 */
FORGE.Clock.prototype.add = function(timer)
{
    this._timers.push(timer);
    timer.onDestroy.add(this._onTimerDestroy, this);
    return timer;
};

/**
 * Update clock on the main loop.
 * @method FORGE.Clock#update
 * @param  {number} time - Time in ms
 */
FORGE.Clock.prototype.update = function(time)
{
    this._rafTime = time;

    //Current TimeStamp
    this._time = Date.now();

    for(var i = 0, ii = this._timers.length; i < ii; i++)
    {
        this._timers[i].update(this._time);
    }
};

/**
 * Destroy method.
 * @method FORGE.Clock#destroy
 */
FORGE.Clock.prototype.destroy = function()
{
    this._viewer = null;

    var i = this._timers.length;
    while(i--)
    {
        this._timers[i].destroy();
    }

    this._timers = null;
};

/**
 * Get the time value.
 * @name FORGE.Clock#time
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Clock.prototype, "time",
{
    /** @this {FORGE.Clock} */
    get: function()
    {
        return this._time;
    }
});
