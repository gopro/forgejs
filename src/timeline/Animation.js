/**
 * Abstract class allowing the animation of an element, given instructions about it.
 *
 * @constructor FORGE.Animation
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {*} target - The element to animate
 * @extends {FORGE.BaseObject}
 */
FORGE.Animation = function(viewer, target)
{
    /**
     * Viewer reference.
     * @name FORGE.Animation#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The target of the animation
     * @name FORGE.Animation#_target
     * @type {*}
     * @private
     */
    this._target = target || null;

    /**
     * The instruction to apply on the target.
     * @name FORGE.Animation#_instruction
     * @type {?AnimationInstruction}
     * @private
     */
    this._instruction = null;

    /**
     * Timeline reference.
     * @name FORGE.Animation#_timeline
     * @type {FORGE.Timeline}
     * @private
     */
    this._timeline = null;

    /**
     * The index of the previous keyframe in the timeline.
     * @name FORGE.Animation#_kfp
     * @type {?FORGE.Keyframe}
     * @private
     */
    this._kfp = null;

    /**
     * The index of the next keyframe in the timeline.
     * @name FORGE.Animation#_kfn
     * @type {?FORGE.Keyframe}
     * @private
     */
    this._kfn = null;

    /**
     * Current animation time.
     * @name FORGE.Animation#_time
     * @type {number}
     * @private
     */
    this._time = 0;

    /**
     * Duration of the animation
     * @name FORGE.Animation#_duration
     * @type {number}
     * @private
     */
    this._duration = 0;

    /**
     * Running flag.
     * @name FORGE.Animation#_running
     * @type {boolean}
     * @private
     */
    this._running = false;

    /**
     * Tween object.
     * @name FORGE.Animation#_tween
     * @type {FORGE.Tween}
     * @private
     */
    this._tween = null;

    /**
     * Tween time reference.
     * @name FORGE.Animation#_tweenTime
     * @type {number}
     * @private
     */
    this._tweenTime = 0;

    /**
     * Smooth interpolation flag.
     * @name FORGE.Animation#_smooth
     * @type {boolean}
     * @private
     */
    this._smooth = false;

    /**
     * Left spline for SQUAD algo.
     * @name FORGE.Animation#_sp
     * @type {THREE.Quaternion}
     * @private
     */
    this._sp = null;

    /**
     * Righ spline for SQUAD algo.
     * @name FORGE.Animation#_sn
     * @type {THREE.Quaternion}
     * @private
     */
    this._sn = null;

    /**
     * On animation play event dispatcher.
     * @name FORGE.Animation#_onPlay
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On animation stop event dispatcher.
     * @name FORGE.Animation#_onStop
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * On animation progress event dispatcher.
     * @name FORGE.Animation#_onProgress
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onProgress = null;

    /**
     * On animation complete event dispatcher.
     * @name FORGE.Animation#_onComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    FORGE.BaseObject.call(this, "Animation");

    this._boot();
};

FORGE.Animation.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Animation.prototype.constructor = FORGE.Animation;

/**
 * Boot sequence
 *
 * @method FORGE.Animation#_boot
 * @private
 */
FORGE.Animation.prototype._boot = function()
{
    this._register();

    // Create the tween object
    this._tween = new FORGE.Tween(this._viewer, this);
    this._tween.onStart.add(this._onTweenStartHandler, this);
    this._tween.onStop.add(this._onTweenStopHandler, this);
    this._tween.onProgress.add(this._onTweenProgressHandler, this);
    this._tween.onComplete.add(this._onTweenCompleteHandler, this);
    this._viewer.tween.add(this._tween);

    this._timeline = new FORGE.Timeline();
};

/**
 * Get the property from a target and the associated instructions
 *
 * @method FORGE.Animation#_getProp
 * @param  {string} prop - The instruction describing the access of the property
 * @param  {*} target - The target
 * @return {Array} An array composed of the property without the last accessor + the last accessor
 * @private
 */
FORGE.Animation.prototype._getProp = function(prop, target)
{
    var acc = prop.split(".");
    var res = target;

    for (var i = 0, ii = acc.length; i < ii - 1; i++)
    {
        res = res[acc[i]];
    }

    return [res, acc[i]];
};

/**
 * Interpolation evaluation function
 *
 * @method FORGE.Animation#_at
 * @param  {number} t - Current time [0...1]
 * @private
 */
FORGE.Animation.prototype._at = function(t)
{
    // If there is no next keyframe, abort
    if (this._kfn === null)
    {
        return;
    }

    // Update the time, given the current keyframes
    this._time = (t * this._duration) + this._kfp.time;

    var props = [],
        prop, i, ii;

    if (!Array.isArray(this._instruction.prop))
    {
        this._instruction.prop = [this._instruction.prop];
    }

    ii = this._instruction.prop.length;

    // Get all properties to update
    for (i = 0; i < ii; i++)
    {
        props.push(this._getProp(this._instruction.prop[i], this._target));
    }

    // If smooth, interpolate all properties together
    if (this._instruction.smooth === true && this._instruction.prop[0] === "quaternion")
    {
        // SQUAD interpolation
        prop = props[0];
        prop[0].quaternion = FORGE.Quaternion.squadNoInvert(this._kfp.data.quaternion, this._sp, this._sn, this._kfn.data.quaternion, t);
    }
    // Else no smooth interpolation, interpolate properties one by one
    else if (this._instruction.prop[0] === "quaternion")
    {
        prop = props[0];
        prop[0].quaternion = FORGE.Quaternion.slerp(this._kfp.data.quaternion, this._kfn.data.quaternion, t);
    }
    else
    {
        var alpha = this._tween.easing(t);
        var pp, pn, offset = 0;

        // For each property of the instruction
        for (i = 0; i < ii; i++)
        {
            // Get the previous and the next properties related to the current one
            pp = this._getProp(this._instruction.prop[i], this._kfp.data);
            pn = this._getProp(this._instruction.prop[i], this._kfn.data);

            prop = props[i];

            pp = pp[0][pp[1]];
            pn = pn[0][pn[1]];

            // Wrap it if necessary
            if (this._instruction.wrap && this._instruction.wrap[i])
            {
                var ilow = this._instruction.wrap[i][0];
                var ihigh = this._instruction.wrap[i][1];

                offset = Math.abs(ilow - ihigh) / 2;

                // Change the direction
                if (Math.abs(pp - pn) > offset)
                {
                    pp = FORGE.Math.wrap(pp + offset, ilow, ihigh);
                    pn = FORGE.Math.wrap(pn + offset, ilow, ihigh);
                }
                else
                {
                    offset = 0;
                }
            }

            // Update it using a classic alpha
            prop[0][prop[1]] = (1 - alpha) * pp + alpha * pn - offset;
        }
    }

    if (typeof this._instruction.fun === "function")
    {
        this._instruction.fun.call(this, t);
    }
};

/**
 * Go from the current keyframe to the next one. If no time is specified, it
 * takes the two next keyframes if there are one, given the current time.
 *
 * @method FORGE.Animation#_goTo
 * @param {number=} time - Time to start the animation at
 * @private
 */
FORGE.Animation.prototype._goTo = function(time)
{
    time = time || this._time;

    this.log("going to the next keyframes at " + time);

    // By default, increase keyframes by 1
    var kfs = this._timeline.getKeyframesIndexes(time || this._time);
    this._kfn = this._timeline.keyframes[kfs.next];
    this._kfp = this._timeline.keyframes[kfs.previous];

    if (this._kfn === null || kfs.next === -1)
    {
        return false;
    };

    // If smooth, prepare SQUAD interpolation
    if (this._smooth)
    {
        this._prepareSQUAD(time);
    }

    // Configure the tween
    this._duration = this._kfn.time - this._kfp.time;

    this._tween.to(
    {
        "tweenTime": 1
    }, this._duration);

    this._tweenTime = 0;

    // Start the tween
    this._tween.start();

    return true;
};

/**
 * Prepare the SQUAD interpolation if wanted.
 * From Shoemake 85 at SIGGRAPH
 * http://run.usc.edu/cs520-s12/assign2/p245-shoemake.pdf
 *
 * @method FORGE.Animation#_prepareSQUAD
 * @param {number} time - Time to start the animation at
 * @private
 */
FORGE.Animation.prototype._prepareSQUAD = function(time)
{
    var sideKfs = this._timeline.getSideKeyframes(time);

    if (sideKfs.previous === null || sideKfs.next === null)
    {
        return;
    }

    // Quaternions to join with a path
    var qp = new THREE.Quaternion().copy(this._kfp.data.quaternion).normalize();
    var qn = new THREE.Quaternion().copy(this._kfn.data.quaternion).normalize();

    // Quaternions before and after the previous ones, used for interpolation
    var qpp = new THREE.Quaternion().copy(sideKfs.previous.data.quaternion).normalize();
    var qnn = new THREE.Quaternion().copy(sideKfs.next.data.quaternion).normalize();

    // Compute the splines used for describing the path of the camera
    this._sp = FORGE.Quaternion.spline(qpp, qp, qn);
    this._sn = FORGE.Quaternion.spline(qp, qn, qnn);
};

/**
 * On tween start event handler
 *
 * @method FORGE.Animation#_onTweenStartHandler
 * @private
 */
FORGE.Animation.prototype._onTweenStartHandler = function()
{
    // Don't dispatch the event if the animation is already running
    if (this._running !== true)
    {
        if (this._onPlay !== null)
        {
            this._onPlay.dispatch();
        }

        this._running = true;
    }
};

/**
 * On tween stop event handler
 *
 * @method FORGE.Animation#_onTweenStopHandler
 * @private
 */
FORGE.Animation.prototype._onTweenStopHandler = function()
{
    this._running = false;

    if (this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};

/**
 * On tween progress event handler
 *
 * @method FORGE.Animation#_onTweenProgressHandler
 * @private
 */
FORGE.Animation.prototype._onTweenProgressHandler = function()
{
    // Interpolate
    this._at(this._tweenTime);

    if (this._onProgress !== null)
    {
        this._onProgress.dispatch(
        {
            progress: this._time / this._duration
        });
    }
};

/**
 * On tween complete event handler
 *
 * @method FORGE.Animation#_onTweenCompleteHandler
 * @private
 */
FORGE.Animation.prototype._onTweenCompleteHandler = function()
{
    // Don't dispatch the event until the whole animation is stopped
    if (!this._goTo())
    {
        if (this._onComplete !== null)
        {
            this._onComplete.dispatch();
        }
    }
};

/**
 * Play the animation.
 *
 * @method  FORGE.Animation#play
 * @param {number=} time - Time to start the animation at
 */
FORGE.Animation.prototype.play = function(time)
{
    // Reset the time
    this._time = time || 0;

    // Start the animation
    this._goTo(0);
};

/**
 * Stop the animation.
 *
 * @method  FORGE.Animation#stop
 */
FORGE.Animation.prototype.stop = function()
{
    this._tween.stop();
};

/**
 * Resume the animation.
 *
 * @method  FORGE.Animation#resume
 */
FORGE.Animation.prototype.resume = function()
{
    this._goTo();
};

/**
 * Destroy sequence.
 *
 * @method FORGE.Animation#destroy
 */
FORGE.Animation.prototype.destroy = function()
{
    if (this._timeline !== null)
    {
        this._timeline.destroy();
        this._timeline = null;
    }

    if (this._tween !== null)
    {
        this._tween.destroy();
        this._tween = null;
    }

    if (this._onPlay !== null)
    {
        this._onPlay.destroy();
        this._onPlay = null;
    }

    if (this._onStop !== null)
    {
        this._onStop.destroy();
        this._onStop = null;
    }

    if (this._onProgress !== null)
    {
        this._onProgress.destroy();
        this._onProgress = null;
    }

    if (this._onComplete !== null)
    {
        this._onComplete.destroy();
        this._onComplete = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Accessors to timeline
 * @name FORGE.Animation#timeline
 * @readonly
 * @type {FORGE.Timeline}
 */
Object.defineProperty(FORGE.Animation.prototype, "timeline",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        return this._timeline;
    }
});

/**
 * Accessors to instruction.
 * @name FORGE.Animation#instruction
 * @type {AnimationInstruction}
 */
Object.defineProperty(FORGE.Animation.prototype, "instruction",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        return this._instruction;
    },

    /** @this {FORGE.Animation} */
    set: function(value)
    {
        this._instruction = value;
    }
});

/**
 * Accessors to tween.
 * @name FORGE.Animation#tween
 * @type {number}
 */
Object.defineProperty(FORGE.Animation.prototype, "tween",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        return this._tween;
    },

    /** @this {FORGE.Animation} */
    set: function(value)
    {
        this._tween = value;
    }
});

/**
 * Accessors to normalized tween time.
 * @name FORGE.Animation#tweenTime
 * @type {number}
 */
Object.defineProperty(FORGE.Animation.prototype, "tweenTime",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        return this._tweenTime;
    },

    /** @this {FORGE.Animation} */
    set: function(value)
    {
        this._tweenTime = value;
    }
});

/**
 * Accessors to smooth.
 * @name FORGE.Animation#smooth
 * @type {number}
 */
Object.defineProperty(FORGE.Animation.prototype, "smooth",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        return this._smooth;
    },

    /** @this {FORGE.Animation} */
    set: function(value)
    {
        this._smooth = value;
    }
});

/**
 * Get the "onPlay" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.Animation#onPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Animation.prototype, "onPlay",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        if (this._onPlay === null)
        {
            this._onPlay = new FORGE.EventDispatcher(this);
        }

        return this._onPlay;
    }
});

/**
 * Get the "onStop" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.Animation#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Animation.prototype, "onStop",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        if (this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});

/**
 * Get the "onProgress" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.Animation#onProgress
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Animation.prototype, "onProgress",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        if (this._onProgress === null)
        {
            this._onProgress = new FORGE.EventDispatcher(this);
        }

        return this._onProgress;
    }
});

/**
 * Get the "onComplete" {@link FORGE.EventDispatcher} of the target.
 * @name FORGE.Animation#onComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Animation.prototype, "onComplete",
{
    /** @this {FORGE.Animation} */
    get: function()
    {
        if (this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});
