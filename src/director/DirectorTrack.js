/**
 * A director track, that defines a camera animation.
 *
 * @constructor FORGE.DirectorTrack
 * @param {DirectorTrackConfig} config - Configuration of the track from the JSON file.
 * @extends {FORGE.Track}
 */
FORGE.DirectorTrack = function(config)
{
    /**
     * Does the track has a smooth interpolation between keyframes ?
     * @name FORGE.DirectorTrack#_smooth
     * @type {boolean}
     * @private
     */
    this._smooth = false;

    /**
     * Is the roll cancelled ?
     * @name FORGE.DirectorTrack#_cancelRoll
     * @type {boolean}
     * @private
     */
    this._cancelRoll = false;

    FORGE.Track.call(this, "DirectorTrack");

    this._boot(config);
};

FORGE.DirectorTrack.prototype = Object.create(FORGE.Track.prototype);
FORGE.DirectorTrack.prototype.constructor = FORGE.DirectorTrack;

/**
 * Boot sequence
 *
 * @method FORGE.DirectorTrack#_boot
 * @param  {Object} config - The information on the track
 * @private
 */
FORGE.DirectorTrack.prototype._boot = function(config)
{
    this._smooth = config.smooth;
    this._cancelRoll = config.cancelRoll;

    FORGE.Track.prototype._boot.call(this, config);
};

/**
 * Accessors to smooth
 * @name FORGE.DirectorTrack#smooth
 * @readonly
 * @type {FORGE.DirectorTrack}
 */
Object.defineProperty(FORGE.DirectorTrack.prototype, "smooth",
{
    /** @this {FORGE.DirectorTrack} */
    get: function()
    {
        return this._smooth;
    }
});

/**
 * Accessors to cancelRoll
 * @name FORGE.DirectorTrack#cancelRoll
 * @readonly
 * @type {FORGE.DirectorTrack}
 */
Object.defineProperty(FORGE.DirectorTrack.prototype, "cancelRoll",
{
    /** @this {FORGE.DirectorTrack} */
    get: function()
    {
        return this._cancelRoll;
    }
});