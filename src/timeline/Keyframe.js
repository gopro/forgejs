/**
 * A keyframe is a data associated to a time.
 * @constructor FORGE.Keyframe
 * @param {number} time - Time of the keyframe.
 * @param {Object} data - Data bound to the keyframe.
 * @extends {FORGE.BaseObject}
 */
FORGE.Keyframe = function(time, data)
{
    FORGE.BaseObject.call(this, "Keyframe");

    /**
     * The time associated to this keyframe.
     * @name  FORGE.Keyframe#_time
     * @type {number}
     * @private
     */
    this._time = time;

    /**
     * The data associated to this keyframe.
     * @name FORGE.Keyframe#_data
     * @type {Object}
     * @private
     */
    this._data = data;
};

FORGE.Keyframe.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Keyframe.prototype.constructor = FORGE.Keyframe;

/**
 * Get and set the time of keyframe.
 * @name FORGE.Keyframe#time
 * @type {number}
 */
Object.defineProperty(FORGE.Keyframe.prototype, "time",
{
    /** @this {FORGE.Keyframe} */
    get: function()
    {
        return this._time;
    },

    /** @this {FORGE.Keyframe} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._time = value;
        }
    }
});

/**
 * Get and set the data of keyframe.
 * @name FORGE.Keyframe#data
 * @type {Object}
 */
Object.defineProperty(FORGE.Keyframe.prototype, "data",
{
    /** @this {FORGE.Keyframe} */
    get: function()
    {
        return this._data;
    },

    /** @this {FORGE.Keyframe} */
    set: function(value)
    {
        this._data = value;
    }
});