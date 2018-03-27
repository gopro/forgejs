
/**
 * FORGE.EventDispatcher can dispatch and reference listeners.
 *
 * @constructor FORGE.EventDispatcher
 * @param {Object} emitter - The object that wiil be considered as the emitter of the event.
 * @param {boolean=} memorize - Does the dispatcher should memorize the previous dispatcher ?
 * @extends {FORGE.BaseObject}
 */
FORGE.EventDispatcher = function(emitter, memorize)
{
    /**
     * The emitter reference.
     * @name  FORGE.EventDispatcher#_emitter
     * @type {Object}
     * @private
     */
    this._emitter = emitter;

    /**
     * Does the dispatcher should memorize the previous dispatch?<br>
     * If true, will redispatch with the previous data when you add a listener to it.
     * @name  FORGE.EventDispatcher#_memorize
     * @type {boolean}
     * @private
     */
    this._memorize = memorize || false;

    /**
     * A backup of previous dispatched data for memorized dispatcher.
     * @name FORGE.EventDispatcher#_previousData
     * @type {*}
     * @private
     */
    this._previousData = null;

    /**
     * Array of {@link FORGE.Listener}.
     * @name FORGE.EventDispatcher#_listeners
     * @type {?Array<FORGE.Listener>}
     * @private
     */
    this._listeners = null;

    /**
     * Is this event dipatcher is active?<br>
     * If not, it will ignore all dispatch calls.
     * @name FORGE.EventDispatcher#_active
     * @type {boolean}
     * @private
     */
    this._active = true;

    /**
     * Dispatched flag, set to true at the first dispatch
     * @name  FORGE.EventDispatcher#_dispatched
     * @type {boolean}
     * @private
     */
    this._dispatched = false;

    FORGE.BaseObject.call(this, "EventDispatcher");
};

FORGE.EventDispatcher.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.EventDispatcher.prototype.constructor = FORGE.EventDispatcher;

/**
 * Internal method to insert the listener into the array according to its priority.
 *
 * @method FORGE.EventDispatcher#_registerListener
 * @private
 * @param  {FORGE.Listener} listener - The object which handle the listener and it's context.
 */
FORGE.EventDispatcher.prototype._registerListener = function(listener)
{
    if(this._listeners === null)
    {
        this._listeners = [];
    }

    if (this._listeners.length === 0)
    {
        this._listeners.push(listener);
        return;
    }

    var n = this._listeners.length;
    do
    {
        n--;
    }
    while(this._listeners[n] && listener._priority <= this._listeners[n]._priority);

    this._listeners.splice(n + 1, 0, listener);
};

/**
 * Internal method to get the index of a couple listener + context.
 *
 * @method FORGE.EventDispatcher#_indexOfListener
 * @private
 * @param  {Function} listener - The listener function you need to find its index.
 * @param {Object} context - The context associated to the listener function.
 * @return {number} - The index of the couple listener + context if found, -1 if not.
 */
FORGE.EventDispatcher.prototype._indexOfListener = function(listener, context)
{
    if(this._listeners === null)
    {
        return -1;
    }

    if ( typeof context === "undefined" )
    {
        context = null;
    }

    var _listener;

    for ( var i = 0, ii = this._listeners.length; i < ii; i++ )
    {
        _listener = this._listeners[i];

        if(_listener.listener === listener && _listener.context === context)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Create the listeners array an push a new listener into it.
 *
 * @method FORGE.EventDispatcher#addListener
 * @param {Function} listener - The listener to add.
 * @param {boolean} isOnce - Is the dispatcher should trigger this listener only one time?
 * @param {Object} context - The context in which the listener will be executed.
 * @param {number=} priority - The priority of the event.
 */
FORGE.EventDispatcher.prototype.addListener = function(listener, isOnce, context, priority)
{
    if(typeof listener !== "function")
    {
        this.warn("You're trying to add an undefined listener");
        return;
    }

    if(this.has(listener, context) === true)
    {
        this.warn("You're trying to add a duplicate listener for this context");
        return;
    }

    var lis = new FORGE.Listener(this, listener, isOnce, context, priority);

    //register the listener with priority
    this._registerListener(lis);

    if(this._memorize === true && this._active === true && this._dispatched === true)
    {
        lis.execute(this._previousData);
    }

    return listener;
};

/**
 * Add an event listener function.
 *
 * @method FORGE.EventDispatcher#add
 * @param {Function} listener - Event handler callback function.
 * @param {Object} context - The context for the listener call.
 * @param {number=} priority - Priority level for the event to be execute.
 */
FORGE.EventDispatcher.prototype.add = function(listener, context, priority)
{
    this.addListener(listener, false, context, priority);
};

/**
 * Add an event listener function that will be triggered only once.
 *
 * @method FORGE.EventDispatcher#addOnce
 * @param {Function} listener - Event handler callback function.
 * @param {Object} context - The context for the listener call.
 * @param {number=} priority - Priority level for the event to be execute.
 */
FORGE.EventDispatcher.prototype.addOnce = function(listener, context, priority)
{
    this.addListener(listener, true, context, priority);
};

/**
 * Remove a {@link FORGE.Listener} from this event dispatcher.
 *
 * @method FORGE.EventDispatcher#remove
 * @param  {Function} listener - The listener handler to be removed.
 * @param  {Object} context - The context of the handler to be removed.
 */
FORGE.EventDispatcher.prototype.remove = function(listener, context)
{
    var i = this._indexOfListener(listener, context);

    if(i !== -1)
    {
        this._listeners[i].destroy();
        this._listeners.splice(i, 1);
    }
};

/**
 * Check if this event dispatcher has a specific listener.
 * If called with no arguments just tell if there are any listeners.
 * @method FORGE.EventDispatcher#has
 * @param  {Function} listener - listener function to check.
 * @param  {Object} context - listener context to check.
 * @return {boolean} Returns true if the dispatcher has the/any listener, false if not.
 */
FORGE.EventDispatcher.prototype.has = function(listener, context)
{
    result = false;

    if (typeof listener === "function")
    {
        result = this._indexOfListener(listener, context) !== -1;
    }
    else
    {
        result = this._listeners.length > 0;
    }

    return result;
};

/**
 * Dispatch the event, will trigger all the listeners methods.
 *
 * @method FORGE.EventDispatcher#dispatch
 * @param {*=} data - Any object or data you want to associate with the dispatched event.
 * @param {boolean=} async - Does the dispatch need to be async ?
 */
FORGE.EventDispatcher.prototype.dispatch = function(data, async)
{
    this._dispatched = true;

    if(this._memorize === true)
    {
        this._previousData = data === undefined ? null : data;
    }

    if(this._active === false || this._listeners === null)
    {
        return;
    }

    var n = this._listeners.length;

    while(n--)
    {
        this._listeners[n].execute(data, async);
    }

};

/**
 * Reset method.
 * @method FORGE.EventDispatcher#reset
 */
FORGE.EventDispatcher.prototype.reset = function()
{
    if(this._listeners !== null)
    {
        var n = this._listeners.length;
        while(n--)
        {
            this._listeners[n].destroy();
        }

        this._listeners = null;
    }

    this._dispatched = false;
    this._previousData = null;
};

/**
 * Destroy method.
 * @method FORGE.EventDispatcher#destroy
 */
FORGE.EventDispatcher.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    this.reset();

    this._emitter = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the emitter object associated to this event dispatcher.
* @name FORGE.EventDispatcher#emitter
* @readonly
* @type {Object}
*/
Object.defineProperty(FORGE.EventDispatcher.prototype, "emitter",
{
    /** @this {FORGE.EventDispatcher} */
    get: function()
    {
        return this._emitter;
    }
});

/**
* Get and set the memorize flag associated to this event dispatcher.
* @name FORGE.EventDispatcher#memorized
* @type {boolean}
*/
Object.defineProperty(FORGE.EventDispatcher.prototype, "memorize",
{
    /** @this {FORGE.EventDispatcher} */
    get: function()
    {
        return this._memorize;
    },

    /** @this {FORGE.EventDispatcher} */
    set: function(value)
    {
        this._memorize = Boolean(value);
    }
});

/**
* Get and set the active flag associated to this event dispatcher.<br>
* If active is false, this dispatcher will not dispatch any event.
* @name FORGE.EventDispatcher#active
* @type {boolean}
*/
Object.defineProperty(FORGE.EventDispatcher.prototype, "active",
{
    /** @this {FORGE.EventDispatcher} */
    get: function()
    {
        return this._active;
    },

    /** @this {FORGE.EventDispatcher} */
    set: function(value)
    {
        this._active = Boolean(value);
    }
});