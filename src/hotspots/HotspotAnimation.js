/**
 * A FORGE.HotspotAnimation is used to animate a hotspot.
 *
 * @constructor FORGE.HotspotAnimation
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.Hotspot3D} hotspot - {@link FORGE.Hotspot3D} reference
 * @extends {FORGE.MetaAnimation}
 */
FORGE.HotspotAnimation = function(viewer, hotspot)
{
    /**
     * The UID of the selected track.
     * @name FORGE.HotspotAnimation#_track
     * @type {?string}
     * @private
     */
    this._track = null;

    /**
     * The list of the tracks composing the animation
     * @name FORGE.HotspotAnimation#_track
     * @type {?Array<string>}
     * @private
     */
    this._tracks = null;

    /**
     * Does the animation loop ?
     * @name FORGE.HotspotAnimation#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * Does the animation randomized ?
     * @name FORGE.HotspotAnimation#_random
     * @type {boolean}
     * @private
     */
    this._random = false;

    /**
     * Does the animation auto play ?
     * @name FORGE.HotspotAnimation#_autoPlay
     * @type {boolean}
     * @private
     */
    this._autoPlay = false;

    /**
     * On animation progress event dispatcher.
     * @name FORGE.HotspotAnimation#_onProgress
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onProgress = null;

    FORGE.MetaAnimation.call(this, viewer, hotspot, "HotspotAnimation");
    this._boot();
};

FORGE.HotspotAnimation.prototype = Object.create(FORGE.MetaAnimation.prototype);
FORGE.HotspotAnimation.prototype.constructor = FORGE.HotspotAnimation;

/**
 * Boot sequence
 *
 * @method FORGE.HotspotAnimation#_boot
 * @private
 */
FORGE.HotspotAnimation.prototype._boot = function()
{
    this._instructions = [
    {
        prop: [ "rotation.x", "rotation.y", "rotation.z" ],
        wrap: [ [-180, 180], [-180, 180], [-180, 180] ],
        smooth: false
    },
    {
        prop: [ "position.x", "position.y", "position.z" ],
        smooth: false
    },
    {
        prop: [ "scale.x", "scale.y", "scale.z" ],
        smooth: false
    }];
};

/**
 * Load an animation configuration.
 *
 * @method FORGE.HotspotAnimation#load
 * @param {HotspotTrackConfig} config - The animation config to load.
 */
FORGE.HotspotAnimation.prototype.load = function(config)
{
    if (config.enabled !== true)
    {
        return;
    }

    this._loop = (typeof config.loop === "boolean") ? config.loop : false;
    this._random = (typeof config.random === "boolean") ? config.random : false;
    this._autoPlay = (typeof config.autoPlay === "boolean") ? config.autoPlay : false;

    if (config.tracks !== null && FORGE.Utils.isArrayOf(config.tracks, "string"))
    {
        // If it is random, mix it here
        this._tracks = (this._random === true) ? FORGE.Utils.randomize(config.tracks) : config.tracks;
    }
};

/**
 * On track complete event handler
 *
 * @method FORGE.HotspotAnimation#_onTrackPartialCompleteHandler
 * @private
 */
FORGE.HotspotAnimation.prototype._onTrackPartialCompleteHandler = function()
{
    if (this._tracks.length > 1)
    {
        // Go to the next track if any
        var idx = this._tracks.indexOf( /** @type {string} */ (this._track)) + 1;

        // If the index is too high, play the track
        if (idx < this._tracks.length)
        {
            this.play(idx);
            return;
        }
    }

    // Loop only if it is the end of the last track
    if (this._loop === true)
    {
        // If it is random, change the entire order
        if (this._random === true)
        {
            this._tracks = FORGE.Utils.randomize(this._tracks);
        }

        this.play(0);
        return;
    }

    FORGE.MetaAnimation.prototype._onTrackPartialCompleteHandler.call(this);
};

/**
 * On tween progress event handler.
 *
 * @method FORGE.HotspotAnimation#_onTweenProgressHandler
 * @private
 */
FORGE.HotspotAnimation.prototype._onTweenProgressHandler = function()
{
    if (this._onProgress !== null)
    {
        this._onProgress.dispatch();
    }
};

/**
 * Play a set of tracks if specified, else the current one, from the start.
 *
 * @method FORGE.HotspotAnimation#play
 * @param {(string|number)=} track - A track
 */
FORGE.HotspotAnimation.prototype.play = function(track)
{
    if (typeof track === "number")
    {
        this._track = this._tracks[track];
    }
    else if (typeof track === "string")
    {
        this._track = track;
    }
    else
    {
        this._track = this._tracks[0];
    }

    track = FORGE.UID.get(this._track);

    this._emptyAnimations();

    var kf;
    var offset = track.offset;

    // First instruction - rotation
    var rotAnimation = new FORGE.Animation(this._viewer, this._target);
    rotAnimation.tween.easing = track.easing;
    rotAnimation.instruction = this._instructions[0];
    rotAnimation.instruction.smooth = track.smooth;
    rotAnimation.onComplete.add(this._onTrackPartialCompleteHandler, this);
    rotAnimation.onProgress.add(this._onTweenProgressHandler, this);

    var rot, x, y, z, time;

    for (var i = 0, ii = track.keyframes.length; i < ii; i++)
    {
        time = track.keyframes[i].time + offset;
        rot = track.keyframes[i].data.rotation;

        if (typeof rot !== "undefined" && rot !== null)
        {
            x = (typeof rot.x !== "undefined" && rot.x !== null) ? rot.x : this._computeIntermediateValue(time, track.keyframes, "x", rotAnimation.tween.easing, "rotation");
            y = (typeof rot.y !== "undefined" && rot.y !== null) ? rot.y : this._computeIntermediateValue(time, track.keyframes, "y", rotAnimation.tween.easing, "rotation");
            z = (typeof rot.z !== "undefined" && rot.z !== null) ? rot.z : this._computeIntermediateValue(time, track.keyframes, "z", rotAnimation.tween.easing, "rotation");

            kf = new FORGE.Keyframe(time + offset,
            {
                rotation:
                {
                    x: x,
                    y: y,
                    z: z
                }
            });

            rotAnimation.timeline.addKeyframe(kf);
        }
    }

    // If the first keyframe is not at time 0 or there is an offset, add a
    // virtual keyframe
    if (rotAnimation.timeline.keyframes.length > 0 && rotAnimation.timeline.keyframes[0].time > 0 || offset > 0)
    {
        var data = { rotation: FORGE.Utils.clone(this._target.rotation) };
        kf = new FORGE.Keyframe(0, data);
        rotAnimation.timeline.addKeyframe(kf);
    }

    this._animations.push(rotAnimation);

    // Second instruction - position
    var posAnimation = new FORGE.Animation(this._viewer, this._target);
    posAnimation.tween.easing = track.easing;
    posAnimation.instruction = this._instructions[1];
    posAnimation.instruction.smooth = track.smooth;
    posAnimation.onComplete.add(this._onTrackPartialCompleteHandler, this);
    posAnimation.onProgress.add(this._onTweenProgressHandler, this);

    var pos;

    for (var i = 0, ii = track.keyframes.length; i < ii; i++)
    {
        time = track.keyframes[i].time + offset;
        pos = track.keyframes[i].data.position;

        if (typeof pos !== "undefined" && pos !== null)
        {
            // If no x/y/z are defined, AND there is at least one radius/theta/phi, convert it to x/y/z
            if (typeof pos.x !== "number" && typeof pos.y !== "number" && typeof pos.z !== "number" && (typeof pos.radius === "number" || typeof pos.theta === "number" || typeof pos.phi === "number"))
            {
                var radius = (typeof pos.radius === "number") ? pos.radius : this._computeIntermediateValue(time, track.keyframes, "radius", posAnimation.tween.easing, "position");
                var theta = (typeof pos.theta === "number") ? FORGE.Math.degToRad(pos.theta) : FORGE.Math.degToRad(this._computeIntermediateValue(time, track.keyframes, "theta", posAnimation.tween.easing, "position"));
                var phi = (typeof pos.phi === "number") ? FORGE.Math.degToRad(pos.phi) : FORGE.Math.degToRad(this._computeIntermediateValue(time, track.keyframes, "phi", posAnimation.tween.easing, "position"));

                theta = FORGE.Math.wrap(Math.PI - theta, -Math.PI, Math.PI);

                var cartesian = new THREE.Vector3().setFromSpherical(FORGE.Utils.toTHREESpherical(radius, theta, phi));

                x = cartesian.x;
                y = cartesian.y;
                z = cartesian.z;
            }
            else
            {

                x = (typeof pos.x !== "undefined" && pos.x !== null) ? pos.x : this._computeIntermediateValue(time, track.keyframes, "x", posAnimation.tween.easing, "position");
                y = (typeof pos.y !== "undefined" && pos.y !== null) ? pos.y : this._computeIntermediateValue(time, track.keyframes, "y", posAnimation.tween.easing, "position");
                z = (typeof pos.z !== "undefined" && pos.z !== null) ? pos.z : this._computeIntermediateValue(time, track.keyframes, "z", posAnimation.tween.easing, "position");
            }

            kf = new FORGE.Keyframe(time + offset,
            {
                position:
                {
                    x: x,
                    y: y,
                    z: z
                }
            });

            posAnimation.timeline.addKeyframe(kf);
        }
    }

    // If the first keyframe is not at time 0 or there is an offset, add a
    // virtual keyframe
    if (posAnimation.timeline.keyframes.length > 0 && posAnimation.timeline.keyframes[0].time > 0 || offset > 0)
    {
        var data = { position: FORGE.Utils.clone(this._target.position) };
        kf = new FORGE.Keyframe(0, data);
        posAnimation.timeline.addKeyframe(kf);
    }

    this._animations.push(posAnimation);

    // Third animation - scale
    var scaleAnimation = new FORGE.Animation(this._viewer, this._target);
    scaleAnimation.tween.easing = track.easing;
    scaleAnimation.instruction = this._instructions[2];
    scaleAnimation.instruction.smooth = track.smooth;
    scaleAnimation.onComplete.add(this._onTrackPartialCompleteHandler, this);
    scaleAnimation.onProgress.add(this._onTweenProgressHandler, this);

    var scale;

    for (var i = 0, ii = track.keyframes.length; i < ii; i++)
    {
        time = track.keyframes[i].time + offset;
        scale = track.keyframes[i].data.scale;

        if (typeof scale !== "undefined" && scale !== null)
        {
            x = (typeof scale.x !== "undefined" && scale.x !== null) ? scale.x : this._computeIntermediateValue(time, track.keyframes, "x", scaleAnimation.tween.easing, "scale");
            y = (typeof scale.y !== "undefined" && scale.y !== null) ? scale.y : this._computeIntermediateValue(time, track.keyframes, "y", scaleAnimation.tween.easing, "scale");
            z = (typeof scale.z !== "undefined" && scale.z !== null) ? scale.z : this._computeIntermediateValue(time, track.keyframes, "z", scaleAnimation.tween.easing, "scale");

            kf = new FORGE.Keyframe(time + offset,
            {
                scale:
                {
                    x: x,
                    y: y,
                    z: z
                }
            });

            scaleAnimation.timeline.addKeyframe(kf);
        }
    }

    // If the first keyframe is not at time 0 or there is an offset, add a
    // virtual keyframe
    if (scaleAnimation.timeline.keyframes.length > 0 && scaleAnimation.timeline.keyframes[0].time > 0 || offset > 0)
    {
        var data = { scale: FORGE.Utils.clone(this._target.scale) };
        kf = new FORGE.Keyframe(0, data);
        scaleAnimation.timeline.addKeyframe(kf);
    }

    this._animations.push(scaleAnimation);

    // Play it !
    this._animations[0].play();
    this._animations[1].play();
    this._animations[2].play();
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotAnimation#destroy
 */
FORGE.HotspotAnimation.prototype.destroy = function()
{
    this._tracks = null;

    if (this._onProgress !== null)
    {
        this._onProgress.destroy();
        this._onProgress = null;
    }

    FORGE.MetaAnimation.prototype.destroy.call(this);
};

/**
 * Does the animation auto play.
 * @name FORGE.HotspotAnimation#autoPlay
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.HotspotAnimation.prototype, "autoPlay",
{
    /** @this {FORGE.HotspotAnimation} */
    get: function()
    {
        return this._autoPlay;
    }
});

/**
 * Get the "onProgress" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.HotspotAnimation#onProgress
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotAnimation.prototype, "onProgress",
{
    /** @this {FORGE.HotspotAnimation} */
    get: function()
    {
        if (this._onProgress === null)
        {
            this._onProgress = new FORGE.EventDispatcher(this);
        }

        return this._onProgress;
    }
});
