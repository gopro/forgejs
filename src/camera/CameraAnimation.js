/**
 * A FORGE.CameraAnimation is used by the camera to animate along keyframes.
 *
 * @constructor FORGE.CameraAnimation
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Camera} camera - {@link FORGE.Camera} reference.
 * @extends {FORGE.MetaAnimation}
 *
 */
FORGE.CameraAnimation = function(viewer, camera)
{
    FORGE.MetaAnimation.call(this, viewer, camera, "CameraAnimation");

    this._boot();
};

FORGE.CameraAnimation.prototype = Object.create(FORGE.MetaAnimation.prototype);
FORGE.CameraAnimation.prototype.constructor = FORGE.CameraAnimation;

/**
 * Init sequence
 * @method FORGE.CameraAnimation#_boot
 * @private
 */
FORGE.CameraAnimation.prototype._boot = function()
{
    // Add the cancel roll effect
    var cameraAt = function()
    {
        if (this._instruction.cancelRoll === true)
        {
            this._target.quaternion = FORGE.Quaternion.cancelRoll(this._target.quaternion);
        }
    };

    this._instructions =
    [
        {
            prop: "quaternion",
            smooth: true,
            fun: cameraAt,
            cancelRoll: true
        },

        {
            prop: "fov",
            smooth: false
        }
    ];
};

/**
 * Load a camera animation keyframes configuration.<br>
 * Convert keyframe into timeline keyframes.
 *
 * @method FORGE.CameraAnimation#_prepareKeyframes
 * @param {Array<FORGE.Keyframe>} tracks - the array containing the keyframes
 * @param {number} offset - the time to take between the current position of the camera to the first keyframe.
 * @param {Function} easing - The easing function for this animation
 * @private
 */
FORGE.CameraAnimation.prototype._prepareKeyframes = function(tracks, offset, easing)
{
    offset = offset || 0;

    var kf, data, yaw, pitch, roll, fov, quat;

    // Add a keyframe for each one in the configuration
    for (var i = 0, ii = tracks.length; i < ii; i++)
    {
        data = tracks[i].data;

        // Quaternion
        yaw = (typeof data.yaw !== "undefined" && data.yaw !== null) ? data.yaw : this._computeIntermediateValue(tracks[i].time + offset, tracks, "yaw", easing);
        pitch = (typeof data.pitch !== "undefined" && data.pitch !== null) ? data.pitch : this._computeIntermediateValue(tracks[i].time + offset, tracks, "pitch", easing);
        roll = (typeof data.roll !== "undefined" && data.roll !== null) ? data.roll : this._computeIntermediateValue(tracks[i].time + offset, tracks, "roll", easing);

        yaw = FORGE.Math.degToRad(yaw);
        pitch = FORGE.Math.degToRad(pitch);
        roll = FORGE.Math.degToRad(roll);

        if (typeof yaw !== "undefined" && yaw !== null && typeof pitch !== "undefined" && pitch !== null && typeof roll !== "undefined" && roll !== null)
        {
            quat = FORGE.Quaternion.fromEuler(yaw, pitch, roll);

            kf = new FORGE.Keyframe(tracks[i].time + offset, { quaternion: quat });
            this._animations[0].timeline.addKeyframe(kf);
        }

        // FOV
        if (typeof data.fov !== "undefined" && data.fov !== null)
        {
            fov = data.fov;
            kf = new FORGE.Keyframe(tracks[i].time + offset, { fov: fov });
            this._animations[1].timeline.addKeyframe(kf);
        }
    }

    // If the first keyframe is not at time 0 or there is an offset, add a
    // virtual keyframe
    if (tracks[0].time > 0 || offset > 0)
    {
        kf = new FORGE.Keyframe(0, { quaternion: FORGE.Utils.clone(this._target.quaternion) });
        this._animations[0].timeline.addKeyframe(kf);

        kf = new FORGE.Keyframe(0, { fov: this._target.fov });
        this._animations[1].timeline.addKeyframe(kf);
    }
};

/**
 * Start to move along the keyframes.
 *
 * @method FORGE.CameraAnimation#play
 * @param {string|FORGE.DirectorTrack} track - Track to play
 */
FORGE.CameraAnimation.prototype.play = function(track)
{
    if (typeof track === "string")
    {
        track = FORGE.UID.get(track);
    }

    this._emptyAnimations();

    // First instruction - quaternion
    var quatAnimation = new FORGE.Animation(this._viewer, this._target);
    quatAnimation.tween.easing = track.easing;
    quatAnimation.instruction = this._instructions[0];
    quatAnimation.instruction.smooth = track.smooth;
    quatAnimation.smooth = track.smooth;
    quatAnimation.instruction.cancelRoll = track.cancelRoll;
    quatAnimation.onComplete.add(this._onTrackPartialCompleteHandler, this);
    this._animations.push(quatAnimation);

    // Second instruction - fov
    var fovAnimation = new FORGE.Animation(this._viewer, this._target);
    fovAnimation.tween.easing = track.easing;
    fovAnimation.instruction = this._instructions[1];
    fovAnimation.instruction.smooth = track.smooth;
    fovAnimation.onComplete.add(this._onTrackPartialCompleteHandler, this);
    this._animations.push(fovAnimation);

    // Prepare the keyframes
    this._prepareKeyframes(track.keyframes, track.offset, quatAnimation.tween.easing);

    // Play !
    quatAnimation.play();
    fovAnimation.play();
};

/**
 * Destroy sequence.
 * @method FORGE.CameraAnimation#destroy
 */
FORGE.CameraAnimation.prototype.destroy = function()
{
    FORGE.MetaAnimation.prototype.destroy.call(this);
};