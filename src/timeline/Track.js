/**
 * Abstract class for Track used in animations. Contains three basic elements: name, description and keyframe. Useful for i18n. It also contains the number of time the track has been played.
 *
 * @constructor FORGE.Track
 * @param {string} name - The name of the class
 * @extends {FORGE.BaseObject}
 */
FORGE.Track = function(name)
{
    /**
     * Name of the track
     * @name FORGE.Track#_name
     * @type {?string}
     * @private
     */
    this._name = null;

    /**
     * Description of the track
     * @name FORGE.Track#_description
     * @type {?string}
     * @private
     */
    this._description = null;

    /**
     * List of keyframes composing the track
     * @name FORGE.Track#_keyframes
     * @type {Array}
     * @private
     */
    this._keyframes = null;

    /**
     * This is the number of times this track has been played.
     * @name  FORGE.Track#_count
     * @type {number}
     * @private
     */
    this._count = 0;

    /**
     * Easing curve for the tween between each keyframe.
     * @name FORGE.Track#_easing
     * @type {?string}
     * @private
     */
    this._easing = null;

    /**
     * Time to take to reach the current position to the first one.
     * @name  FORGE.Track#_offset
     * @type {number}
     * @private
     */
    this._offset = 0;

    FORGE.BaseObject.call(this, name);
};

FORGE.Track.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Track.prototype.constructor = FORGE.Track;

/**
 * Boot sequence
 *
 * @method FORGE.Track#_boot
 * @param  {Object} config - The information on the track
 * @private
 */
FORGE.Track.prototype._boot = function(config)
{
    this._uid = config.uid;
    this._name = config.name;
    this._description = config.description;
    this._keyframes = config.keyframes;

    this._easing = "linear";
    this._offset = 0;

    if (typeof config.easing === "object" && config.easing !== null)
    {
        this._easing = config.easing.default || this._easing;
        this._offset = config.easing.offset || this._offset;
    }

    this._register();
};

FORGE.Track.prototype.destroy = function()
{
    this._unregister();
};

/**
 * Get the name of the track.
 * @name FORGE.Track#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Track.prototype, "name",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        return this._name;
    }
});

/**
 * Get the description of the track.
 * @name FORGE.Track#description
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Track.prototype, "description",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        return this._description;
    }
});

/**
 * Get the keyframes of the track.
 * @name FORGE.Track#keyframes
 * @readonly
 * @type {Array}
 */
Object.defineProperty(FORGE.Track.prototype, "keyframes",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        return this._keyframes;
    }
});

/**
 * Get the number of times this director track has been played.
 * @name FORGE.Track#count
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Track.prototype, "count",
{
    /** @this {FORGE.Track} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._count = value;
        }
    },

    /** @this {FORGE.Track} */
    get: function()
    {
        return this._count;
    }
});

/**
 * Get the easing of the track.
 * @name FORGE.Track#easing
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Track.prototype, "easing",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        return this._easing;
    }
});

/**
 * Get the starting time of the track.
 * @name FORGE.Track#offset
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Track.prototype, "offset",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        return this._offset;
    }
});

/**
 * Get the total duration of the track.
 * @name FORGE.Track#duration
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Track.prototype, "duration",
{
    /** @this {FORGE.Track} */
    get: function()
    {
        var res = this._keyframes[0].time;

        for (var i = 1, ii = this._keyframes.length; i < ii; i++)
        {
            if (this._keyframes[i].time > res)
            {
                res = this._keyframes[i].time;
            }
        }

        return res;
    }
});
