
/**
 * Object that handle listener function and its context.
 *
 * @constructor FORGE.Listener
 * @param {Function} listener - The handler function
 * @param {boolean} isOnce - If this listener will trigger only once, then delete itself from its dispatcher.
 * @param {Object} context - The context for listener execution.
 * @param {number=} priority - The priority of the listener.
 */
FORGE.Listener = function(dispatcher, listener, isOnce, context, priority)
{
    /**
     * Reference to the {@link FORGE.EvenDispatcher} this listener is attached to.
     * @name FORGE.Listener#_dispatcher
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._dispatcher = dispatcher;

    /**
     * The callback function that will be triggered when event occurs.
     * @name FORGE.Listener#_listener
     * @type {Function}
     * @private
     */
    this._listener = listener;

    /**
     * The context for listener execution.
     * @name FORGE.Listener#_context
     * @type {?Object}
     * @private
     */
    this._context = context || null;

    /**
     * If this listener will trigger only once, then delete itself from its dispatcher.
     * @name FORGE.Listener#_isOnce
     * @type {boolean}
     * @default false
     * @private
     */
    this._isOnce = isOnce || false;

    /**
     * The priority level of the event listener.<br>
     * Listeners with higher priority will be executed before listeners with lower priority.<br>
     * Listeners with same priority level will be executed at the same order as they were added. (default = 0).
     * @name FORGE.Listener#_priority
     * @type {number}
     * @private
     */
    this._priority = priority || 0;

    /**
     * The number of times the listener has been called.
     * @name  FORGE.Listener#_callCount
     * @type {number}
     * @private
     */
    this._callCount = 0;

    /**
     * The active state of the listener. Will be executed only if active.
     * @name  FORGE.Listener#_active
     * @type {boolean}
     * @private
     */
    this._active = true;

    /**
     * Is the async process is busy?
     * @name  FORGE.Listener#_asyncBusy
     * @type {boolean}
     * @private
     */
    this._asyncBusy = false;
};

FORGE.Listener.prototype.constructor = FORGE.Listener;

FORGE.Listener.prototype._execute = function(data)
{
    var event = new FORGE.Event(this._dispatcher.emitter, data);
    this._listener.call(this._context, event);

    this._callCount++;

    if(this._isOnce === true)
    {
        this.detach();
    }

    this._asyncBusy = false; //reset the async busy flag to false in all cases
};

/**
* Call listener passing a data object.<br>
* If listener was added using EventDispatcher.addOnce() it will be automatically removed.
*
* @method FORGE.Listener#execute
* @param {*=} data - Data that should be passed to the listener.
* @param {boolean=} async - Execute the listener in async mode (with a setTimeout at 0).
*/
FORGE.Listener.prototype.execute = function(data, async)
{
    if(this._active === true && this._listener !== null)
    {
        if(async === true && this._asyncBusy === false)
        {
            this._asyncBusy = true;
            var executeBind = this._execute.bind(this, data);
            window.setTimeout(executeBind, 0);
        }
        else if(async !== true)
        {
            this._execute(data);
        }
    }
};

/**
 * Detach the listener from its event dispatcher.
 * @method FORGE.Listener#detach
 */
FORGE.Listener.prototype.detach = function()
{
    return this._dispatcher.remove(this._listener, this._context);
};

/**
 * Destroy method.
 * @method FORGE.Listener#destroy
 */
FORGE.Listener.prototype.destroy = function()
{
    this._dispatcher = null;
    this._listener = null;
    this._context = null;
};

/**
 * Get the listener function.
 * @name FORGE.Listener#listener
 * @readonly
 * @type {Function}
 */
Object.defineProperty(FORGE.Listener.prototype, "listener", {

    /** @this {FORGE.Listener} */
    get: function ()
    {
        return this._listener;
    }
});

/**
 * Get the context object.
 * @name FORGE.Listener#context
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Listener.prototype, "context", {

    /** @this {FORGE.Listener} */
    get: function ()
    {
        return this._context;
    }
});

/**
 * Get the isOnce flag.
 * @name FORGE.Listener#isOnce
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Listener.prototype, "isOnce", {

    /** @this {FORGE.Listener} */
    get: function ()
    {
        return this._isOnce;
    }
});

/**
 * Get the priority number.
 * @name FORGE.Listener#priority
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Listener.prototype, "priority", {

    /** @this {FORGE.Listener} */
    get: function ()
    {
        return this._priority;
    }
});

/**
 * Get the call count property value.
 * @name FORGE.Listener#callCount
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Listener.prototype, "callCount", {

    /** @this {FORGE.Listener} */
    get: function ()
    {
        return this._callCount;
    }
});
