/**
 * Timeline
 *
 * @constructor FORGE.Timeline
 * @param {?Array<FORGE.Keyframe>=} keyframes - Array of keyframes for this timeline.
 *
 * @extends {FORGE.BaseObject}
 */
FORGE.Timeline = function(keyframes)
{
    /**
     * Array of {@link FORGE.Keyframe} for this timeline
     * @name  FORGE.Timeline#_keyframes
     * @type {Array<FORGE.Keyframe>}
     * @private
     */
    this._keyframes = keyframes || [];

    FORGE.BaseObject.call(this, "Timeline");

    this._boot();
};

FORGE.Timeline.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Timeline.prototype.constructor = FORGE.Timeline;

/**
 * Boot routine, sort keyframes if any
 *
 * @method FORGE.Timeline#_boot
 * @private
 */
FORGE.Timeline.prototype._boot = function()
{
    if (FORGE.Utils.isArrayOf(this._keyframes, "Keyframe"))
    {
        this._keyframes = FORGE.Utils.sortArrayByProperty(this._keyframes, "time");
    }
    else
    {
        this._keyframes = [];
    }
};

/**
 * Check if this Timeline object has keyframes.
 *
 * @method  FORGE.Timeline#hasKeyframes
 * @return {boolean}
 */
FORGE.Timeline.prototype.hasKeyframes = function()
{
    return (this._keyframes !== null && this._keyframes.length > 0);
};

/**
 * Add a keyframe to the timeline.
 *
 * @method FORGE.Timeline#addKeyframe
 * @param {FORGE.Keyframe} keyframe - Keyframe to add.
 */
FORGE.Timeline.prototype.addKeyframe = function(keyframe)
{
    if (FORGE.Utils.isTypeOf(keyframe, "Keyframe"))
    {
        this._keyframes.push(keyframe);
        this._keyframes = FORGE.Utils.sortArrayByProperty(this._keyframes, "time");
    }
};

/**
 * Get an object containing the previous and next keyframes given a specific time.
 *
 * @method FORGE.Timeline#getKeyframes
 * @param  {number} time - Time to get the keyframes at
 * @return {TimelinePrevNext} The two keyframes
 */
FORGE.Timeline.prototype.getKeyframes = function(time)
{
    var indexes = this.getKeyframesIndexes(time);

    return {
        previous: this._keyframes[indexes.previous],
        next: this._keyframes[indexes.next] || null
    };
};

/**
 * Get an object containing the indexes of the previous and next keyframes given
 * a specific time.
 *
 * @method FORGE.Timeline#getKeyframesIndexes
 * @param  {number} time - Time to get the keyframes at
 * @return {TimelinePrevNextIndexes} The two indexes
 */
FORGE.Timeline.prototype.getKeyframesIndexes = function(time)
{
    var previous = -1,
        next = -1;

    // Check on each keyframe if there is one with a time shorter than
    // this one. If it exists, it is the previous keyframe
    for (var i = this._keyframes.length - 1; i >= 0; i--)
    {
        if (time >= this._keyframes[i].time)
        {
            previous = i;
            break; // Break allowed as keyframes should be sorted by time
        }
    }

    // If the previous is the last keyframes, consider that there is no more next keyframe. So only allow the set of next if there is a next keyframe.
    if (previous !== this._keyframes.length - 1)
    {
        next = previous + 1;
    }

    return {
        previous: previous,
        next: next
    };
};

/**
 * Get the side keyframes of the two keyframes associated to the given time.
 *
 * @method FORGE.Timeline#getSideKeyframes
 * @param  {number} time - Time to get the keyframes at
 * @return {TimelinePrevNext} The two keyframes
 */
FORGE.Timeline.prototype.getSideKeyframes = function(time)
{
    var indexes = this.getSideKeyframesIndexes(time);

    return {
        previous: this._keyframes[indexes.previous] || null,
        next: this._keyframes[indexes.next] || null
    };
};

/**
 * Get the indexes of the side keyframes of the two keyframes associated to the given time.
 *
 * @method FORGE.Timeline#getSideKeyframesIndexes
 * @param  {number} time - Time to get the keyframes at
 * @return {TimelinePrevNextIndexes} The two keyframes
 */
FORGE.Timeline.prototype.getSideKeyframesIndexes = function(time)
{
    var indexes = this.getKeyframesIndexes(time);

    var previous = 0,
        next = indexes.next;

    if (indexes.previous > 0)
    {
        previous = indexes.previous - 1;
    }

    if (indexes.next < this._keyframes.length - 2)
    {
        next = indexes.next + 1;
    }

    return {
        previous: previous,
        next: next
    };
};

/**
 * Clear all keyframes.
 *
 * @method FORGE.Timeline#emptyKeyframes
 */
FORGE.Timeline.prototype.emptyKeyframes = function()
{

    while (this._keyframes.length > 0)
    {
        var kf = this._keyframes.pop();
        kf.data = null;
        kf = null;
    }

    this._keyframes = [];
};

/**
 * Destroy this object.
 */
FORGE.Timeline.prototype.destroy = function()
{
    while (this._keyframes.length > 0)
    {
        var kf = this._keyframes.pop();
        kf.data = null;
        kf = null;
    }

    this._keyframes = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the keyframes array.
 * @name FORGE.Timeline#keyframes
 * @readonly
 * @type {Array<FORGE.Keyframe>}
 */
Object.defineProperty(FORGE.Timeline.prototype, "keyframes",
{
    /** @this {FORGE.Timeline} */
    get: function()
    {
        return this._keyframes;
    },

    /** @this {FORGE.Timeline} */
    set: function(value)
    {
        if (FORGE.Utils.isArrayOf(value, "Keyframe"))
        {
            this._keyframes = FORGE.Utils.sortArrayByProperty(value, "time");
        }
    }
});