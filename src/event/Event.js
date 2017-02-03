
/**
 * FORGE.Event reference an emitter and eventually some data.
 *
 * @constructor FORGE.Event
 * @param {Object} emitter - The object that will be considered as the emitter of the event.
 * @param {Object} data - Any data associated to this event.
 */
FORGE.Event = function(emitter, data)
{
    /**
     * The object that will be considered as the emitter of the event.
     * @name FORGE.Event#_emitter
     * @type {Object}
     * @private
     */
    this._emitter = emitter;

    /**
     * Any data associated to this event.
     * @name FORGE.Event#_data
     * @type {?Object}
     * @private
     */
    this._data = data || null;
};


FORGE.Event.prototype.constructor = FORGE.Event;

/**
 * Get the event emitter.
 * @name  FORGE.Event#emitter
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Event.prototype, "emitter",
{
    /** @this {FORGE.Event} */
    get: function ()
    {
        return this._emitter;
    }
});

/**
 * Get the data associated to the event.
 * @name  FORGE.Event#data
 * @readonly
 * @type {?Object}
 */
Object.defineProperty(FORGE.Event.prototype, "data",
{
    /** @this {FORGE.Event} */
    get: function ()
    {
        return this._data;
    }
});
