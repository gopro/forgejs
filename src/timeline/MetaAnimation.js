/**
 * A meta-animation, used to provide basic functionnality for the interface
 * between an ObjectAnimation and FORGE.Animation.
 * 
 * @constructor FORGE.MetaAnimation
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {*} target - Target reference.
 * @param {string} name - Name of the ObjectAnimation.
 * @extends {FORGE.BaseObject}
 */
FORGE.MetaAnimation = function(viewer, target, name)
{
    /**
     * Viewer reference.
     * @name FORGE.MetaAnimation#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The target of the animation
     * @name FORGE.MetaAnimation#_target
     * @type {*}
     * @private
     */
    this._target = target || null;

    /**
     * The array of animations related to the camera.
     * @name FORGE.MetaAnimation#_animations
     * @type {Array<FORGE.Animation>}
     * @private
     */
    this._animations = null;

    /**
     * The number of finished animations.
     * @name FORGE.MetaAnimation#_finished
     * @type {number}
     * @private
     */
    this._finished = 0;

    /**
     * The instructions to apply on the target.
     * @name FORGE.MetaAnimation#_instructions
     * @type {Array<AnimationInstruction>}
     * @private
     */
    this._instructions = null;

    /**
     * On animation complete event dispatcher.
     * @name FORGE.MetaAnimation#_onComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    FORGE.BaseObject.call(this, name);
};

FORGE.MetaAnimation.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.MetaAnimation.prototype.constructor = FORGE.MetaAnimation;

/**
 * Stop the animations.
 *
 * @method FORGE.MetaAnimation#stop
 */
FORGE.MetaAnimation.prototype.stop = function()
{
    for (var i = 0, ii = this._animations; i < ii; i++)
    {
        this._animations[i].stop();
    }
};

/**
 * Resume the animations.
 *
 * @method FORGE.MetaAnimation#resume
 */
FORGE.MetaAnimation.prototype.resume = function()
{
    for (var i = 0, ii = this._animations; i < ii; i++)
    {
        this._animations[i].resume();
    }
};

/**
 * On animation complete event handler.
 *
 * @method FORGE.Animation#_onTrackPartialCompleteHandler
 * @private
 */
FORGE.MetaAnimation.prototype._onTrackPartialCompleteHandler = function()
{
    this._finished++;

    if (this._finished === this._animations.length && this._onComplete !== null)
    {
        this._onComplete.dispatch();
    }
};

/**
 * Compute the intermediate value of a property, approximatly.
 *
 * @method FORGE.MetaAnimation#_computeIntermediateValue
 * @param  {number} time - the time when to interpolate
 * @param  {Array<FORGE.Keyframe>} kfs - The list of keyframes
 * @param  {string} prop - The name of the property
 * @param  {Function} easing - The name of the easing property
 * @param  {string=} ns - The namespace to add before the property
 * @return {number} the interpolated property
 * @private
 */
FORGE.MetaAnimation.prototype._computeIntermediateValue = function(time, kfs, prop, easing, ns)
{
    var kp = null,
        kn = null,
        res;

    // Sort by time
    kfs = FORGE.Utils.sortArrayByProperty(kfs, "time");

    // Search for the two nearest keyframes
    for (var i = 0; i < kfs.length; i++)
    {
        var p = (typeof ns === "string") ? kfs[i].data[ns][prop] : kfs[i].data[prop];

        if (typeof p !== "undefined" && p !== null)
        {
            // Update previous key if time is still inferior
            if (kfs[i].time < time)
            {
                kp = kfs[i];
            }

            // Update next key on first one and break the loop
            if (kfs[i].time > time)
            {
                kn = kfs[i];
                break;
            }
        }
    }

    // If no kp, let's consider it is the data of the current target
    if (kp === null)
    {
        kp = {
            time: 0,
            data: {}
        };

        if (typeof ns === "string")
        {
            kp.data[ns] = this._target[ns];
        }
        else
        {
            kp.data[prop] = this._target[prop];
        }
    }

    // If no kn, then nothing needs to be done
    if (kn === null)
    {
        return (typeof ns === "string") ? kp.data[ns][prop] : kp.data[prop];
    }

    // Now that we have the two, we can compute the proportion of the time
    var ratio = (time - kp.time) / (kn.time - kp.time);
    var alpha = easing(ratio);

    // Return the interpolated property
    var kpp = (typeof ns === "string") ? kp.data[ns][prop] : kp.data[prop];
    var knp = (typeof ns === "string") ? kn.data[ns][prop] : kn.data[prop];
    return (1 - alpha) * kpp + alpha * knp;
};

/**
 * Empty the array of animations.
 *
 * @method FORGE.MetaAnimation#_emptyAnimations
 * @private
 */
FORGE.MetaAnimation.prototype._emptyAnimations = function()
{
    var animation;

    while (this._animations && this._animations.length > 0)
    {
        animation = this._animations.pop();
        animation.onComplete.remove(this._onTrackPartialCompleteHandler, this);
        animation.destroy();
    }

    this._animations = [];
    this._finished = 0;
};

/**
 * Destroy sequence.
 * @method FORGE.MetaAnimation#destroy
 */
FORGE.MetaAnimation.prototype.destroy = function()
{
    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the "onComplete" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.MetaAnimation#onComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.MetaAnimation.prototype, "onComplete",
{
    /** @this {FORGE.MetaAnimation} */
    get: function()
    {
        if (this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});