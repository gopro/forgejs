/**
 * This object describe the video time ranges.
 *
 * @constructor FORGE.VideoTimeRanges
 * @param {Element|HTMLVideoElement} element - The HTMLVideoElement that handle the ranges.
 * @param {string} property - The property of the video element that handles ranges (can be "buffered" or "played").
 * @extends {FORGE.BaseObject}
 */
FORGE.VideoTimeRanges = function(element, property)
{
    /**
     * The HTMLVideoElement associated to this buffer object.
     * @name FORGE.VideoTimeRanges#_element
     * @type {Element|HTMLVideoElement}
     * @private
     */
    this._element = element;

    /**
     * The property that handles the time ranges on the video element.
     * @name  FORGE.VideoTimeRanges#_property
     * @type {string}
     * @private
     */
    this._property = property;

    FORGE.BaseObject.call(this, "VideoTimeRanges");
};

FORGE.VideoTimeRanges.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.VideoTimeRanges.prototype.constructor = FORGE.VideoTimeRanges;

/**
 * Get a time range from it's index.
 * @method FORGE.VideoTimeRanges#getTimeRange
 * @param  {number} index - The index of the asked range.
 * @return {?VideoTimeRangeObject} Returns an object that contains the start and the end value of the asked range.
 */
FORGE.VideoTimeRanges.prototype.getTimeRange = function(index)
{
    var ranges = this._element[this._property];

    if (this.length === 0)
    {
        this.warn("No available range for now");
        return null;
    }

    if (index > this.length - 1)
    {
        this.warn("Time range out of bounds, returning the last available range");
        return this.getTimeRange(this.length - 1);
    }
    else if (index < 0)
    {
        this.warn("Time range out of bounds, returning the first available range");
        return this.getTimeRange(0);
    }

    var _start = ranges.start(index);
    var _end = ranges.end(index);

    return {
        start: _start,
        end: _end
    };
};

/**
 * Know if a given point in time is in any ranges.
 * @method FORGE.VideoTimeRanges#isInRanges
 * @param  {number} time - The time of your request.
 * @param {number} duration - The duration of your requested range.
 * @return {boolean} Returns true if you requested range exists.
 */
FORGE.VideoTimeRanges.prototype.isInRanges = function(time, duration)
{
    if (typeof duration !== "number")
    {
        duration = 0;
    }

    var ranges = this._element[this._property];
    var start, end;
    var i = this.length;

    while (i--)
    {
        start = ranges.start(i);
        end = ranges.end(i);

        if (time >= start && (time + duration) <= end)
        {
            return true;
        }
    }

    return false;
};

/**
 * Get the length of time ranges.
 * @name FORGE.VideoTimeRanges#length
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.VideoTimeRanges.prototype, "length",
{
    /** @this {FORGE.VideoTimeRanges} */
    get: function()
    {
        return this._element[this._property].length;
    }
});

/**
 * Get the complete status of ranges, return true if there is a unique range that covers the entire media.
 * @name FORGE.VideoTimeRanges#complete
 * @readonly
 * @type {boolean}
 */
// Object.defineProperty(FORGE.VideoTimeRanges.prototype, "complete",
// {
//     get: function()
//     {
//         var range = this.getTimeRange(0);
//         return (range.start === 0 && range.end === this._video.duration);
//     }
// });