/**
 * A director track, that defines a camera animation.
 *
 * @constructor FORGE.HotspotAnimationTrack
 * @param {HotspotTrackConfig} config - Configuration of the track from the JSON file.
 * @extends {FORGE.Track}
 */
FORGE.HotspotAnimationTrack = function(config)
{
    /**
     * Does the track has a smooth interpolation between keyframes ?
     * @name FORGE.HotspotAnimationTrack#_smooth
     * @type {boolean}
     * @private
     */
    this._smooth = false;

    FORGE.Track.call(this, "HotspotAnimationTrack");

    this._boot(config);
};

FORGE.HotspotAnimationTrack.prototype = Object.create(FORGE.Track.prototype);
FORGE.HotspotAnimationTrack.prototype.constructor = FORGE.HotspotAnimationTrack;

/**
 * Boot sequence
 *
 * @method FORGE.HotspotAnimationTrack#_boot
 * @param  {Object} config - The information on the track
 * @private
 */
FORGE.HotspotAnimationTrack.prototype._boot = function(config)
{
    this._smooth = config.smooth;

    FORGE.Track.prototype._boot.call(this, config);
};