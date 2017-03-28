
/**
 * Animation for Sprites.
 * @constructor FORGE.SpriteAnimation
 * @param {FORGE.Sprite} sprite - The Sprite that is animated.
 * @param {string} name - Name of the animation.
 * @param {Array} frames - The frames taht compose this animation.
 * @param {number=} [frameRate=30] - Frame rate of this animation (default: 30)
 * @param {boolean=} [loop=true] - The loop flag
 * @extends {FORGE.BaseObject}
 *
 * @todo Work on trimmed textures
 */
FORGE.SpriteAnimation = function(sprite, name, frames, frameRate, loop)
{
    /**
     * The sprite attached to this animation.
     * @name  FORGE.SpriteAnimation#_sprite
     * @type {FORGE.Sprite}
     * @private
     */
    this._sprite = sprite;

    /**
     * Name of the animation.
     * @name  FORGE.SpriteAnimation#_name
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * Array of frames that compose this animation
     * @name  FORGE.SpriteAnimation#_frames
     * @type {Array<Object>}
     * @private
     */
    this._frames = frames || [];

    /**
     * The index of the current frame.
     * @name  FORGE.SpriteAnimation#_frameIndex
     * @type {number}
     * @private
     */
    this._frameIndex = 0;

    /**
     * Frame rate of this animation, this is the number of frames per second.
     * @name  FORGE.SpriteAnimation#_frameRate
     * @type {number}
     * @private
     */
    this._frameRate = frameRate || 30;

    /**
     * Does this animation loop?
     * @name  FORGE.SpriteAnimation#_loop
     * @type {boolean}
     * @private
     */
    this._loop = loop || false;

    /**
     * The number of times this animation has looped.
     * @name  FORGE.SpriteAnimation#_loopCount
     * @type {number}
     * @private
     */
    this._loopCount = 0;

    /**
     * The delay in milliseconds between two frames.
     * @name  FORGE.SpriteAnimation#_delay
     * @type {number}
     * @private
     */
    this._delay = 1000 / frameRate;

    /**
     * The time of the last frame.
     * @name  FORGE.SpriteAnimation#_timeLastFrame
     * @type {number}
     * @private
     */
    this._timeLastFrame = 0;

    /**
     * The time of the next frame.
     * @name  FORGE.SpriteAnimation#_timeNextFrame
     * @type {number}
     * @private
     */
    this._timeNextFrame = 0;

    /**
     * The time between the current time and the next frame.
     * @name  FORGE.SpriteAnimation#_frameDiff
     * @type {number}
     * @private
     */
    this._frameDiff = 0;

    /**
     * The number of frames to skip when laag occurs.
     * @name  FORGE.SpriteAnimation#_frameSkip
     * @type {number}
     * @private
     */
    this._frameSkip = 1;

    /**
     * Is this animation is currently playing?
     * @name  FORGE.SpriteAnimation#_playing
     * @type {boolean}
     * @private
     */
    this._playing = false;

    /**
     * Is this animation is currently paused?
     * @name  FORGE.SpriteAnimation#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    /**
     * Is this animation is complete?
     * @name  FORGE.SpriteAnimation#_complete
     * @type {boolean}
     * @private
     */
    this._complete = false;

    /**
     * On play event dispatcher.
     * @name  FORGE.SpriteAnimation#_onPlay
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On pause event dispatcher.
     * @name  FORGE.SpriteAnimation#_onPause
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * On resume event dispatcher.
     * @name  FORGE.SpriteAnimation#_onResume
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * On loop event dispatcher.
     * @name  FORGE.SpriteAnimation#_onLoop
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoop = null;

    /**
     * On stop event dispatcher.
     * @name  FORGE.SpriteAnimation#_onStop
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * On complete event dispatcher.
     * @name  FORGE.SpriteAnimation#_onComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    FORGE.BaseObject.call(this, "SpriteAnimation");
};

FORGE.SpriteAnimation.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SpriteAnimation.prototype.constructor = FORGE.SpriteAnimation;

/**
 * Internal method to notify when animation is complete.
 * @method  FORGE.SpriteAnimation#_notifyComplete
 * @private
 */
FORGE.SpriteAnimation.prototype._notifyComplete = function()
{
    this._setFrameIndex(this._frames.length - 1);

    this._playing = false;
    this._complete = true;
    this._paused = false;

    if(this._onComplete !== null)
    {
        this._onComplete.dispatch();
    }
};

/**
 * Internal method to set the frame index of the animation and update the sprite display.
 * @method  FORGE.SpriteAnimation#_setFrameIndex
 * @private
 * @param {number=} [index=0] - The frame index to set.
 */
FORGE.SpriteAnimation.prototype._setFrameIndex = function(index)
{
    this._frameIndex = (typeof index === "number" && index >= 0 && index < this._frames.length) ? index : 0;
    this._sprite.frame = this._frames[this._frameIndex].frame;
};

/**
 * Play this animation.
 * @method  FORGE.SpriteAnimation#play
 * @param {boolean=} loop - Does the animation have to loop on complete?
 * @param {number=} index - the index to play at
 */
FORGE.SpriteAnimation.prototype.play = function(loop, index)
{
    if(typeof loop === "boolean")
    {
        this._loop = loop;
    }

    this._playing = true;
    this._complete = false;
    this._paused = false;
    this._loopCount = 0;

    var time = this._sprite.viewer.clock.time;
    this._timeLastFrame = time;
    this._timeNextFrame = time + this._delay;

    this._setFrameIndex(index); //Default will be 0 :)

    this._sprite.animations.current = this;

    if(this._onPlay !== null)
    {
        this._onPlay.dispatch();
    }
};

/**
 * Pause the animation.
 * @method  FORGE.SpriteAnimation#pause
 * @param  {number} [index] - The frame index on which to pause the animation. Default will be the current frame.
 */
FORGE.SpriteAnimation.prototype.pause = function(index)
{
    if(this._paused === true)
    {
        return;
    }

    this._paused = true;

    if(typeof index === "number")
    {
        this._setFrameIndex(index);
    }

    if(this._onPause !== null)
    {
        this._onPause.dispatch();
    }
};

/**
 * Resume the animation
 * @method FORGE.SpriteAnimation#resume
 * @param  {number} [index] - The frame index on which to resume the animation. Default will be the current frame.
 */
FORGE.SpriteAnimation.prototype.resume = function(index)
{
    if(this._paused === false)
    {
        return;
    }

    this._paused = false;

    if(typeof index === "number")
    {
        this._setFrameIndex(index);
    }

    if(this._playing)
    {
        this._timeNextFrame = this._sprite.viewer.clock.time + this._delay;
    }

    if(this._onResume !== null)
    {
        this._onResume.dispatch();
    }
};

/**
 * Stops the animation, reset it to the first frame.
 * @method  FORGE.SpriteAnimation#stop
 */
FORGE.SpriteAnimation.prototype.stop = function()
{
    this._playing = false;
    this._complete = true;
    this._paused = false;

    this._setFrameIndex(0);

    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};

/**
 * Update loop that will be called by the DisplayList through Sprite & SpriteAnimationManager update
 * @method FORGE.SpriteAnimation#update
 */
FORGE.SpriteAnimation.prototype.update = function()
{
    if (this._paused === true)
    {
        return;
    }

    var time = this._sprite.viewer.clock.time;

    if (this._playing === true && time >= this._timeNextFrame)
    {
        this._frameSkip = 1;
        this._frameDiff = time - this._timeNextFrame;
        this._timeLastFrame = time;

        if (this._frameDiff > this._delay)
        {
            this._frameSkip = Math.floor(this._frameDiff / this._delay);
            this._frameDiff -= (this._frameSkip * this._delay);
        }

        this._timeNextFrame = time + (this._delay - this._frameDiff);

        var frameIndex = this._frameIndex + this._frameSkip;

        if (frameIndex >= this._frames.length)
        {
            if (this._loop === true)
            {
                frameIndex %= this._frames.length;
                this._loopCount++;

                if(this._onLoop !== null)
                {
                    this._onLoop.dispatch();
                }

                this._setFrameIndex(frameIndex);
            }
            else
            {
                this._notifyComplete();
            }
        }
        else
        {
            this._setFrameIndex(frameIndex);
        }
    }
};

/**
 * Destroy method
 * @method FORGE.SpriteAnimation#destroy
 */
FORGE.SpriteAnimation.prototype.destroy = function()
{
    this._sprite = null;
    this._frames = null;

    if(this._onPlay !== null)
    {
        this._onPlay.destroy();
        this._onPlay = null;
    }

    if(this._onPause !== null)
    {
        this._onPause.destroy();
        this._onPause = null;
    }

    if(this._onResume !== null)
    {
        this._onResume.destroy();
        this._onResume = null;
    }

    if(this._onComplete !== null)
    {
        this._onComplete.destroy();
        this._onComplete = null;
    }

    if(this._onLoop !== null)
    {
        this._onLoop.destroy();
        this._onLoop = null;
    }

    if(this._onStop !== null)
    {
        this._onStop.destroy();
        this._onStop = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the name of the SpriteAnimation.
* @name FORGE.SpriteAnimation#name
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "name",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._name;
    }
});

/**
* Get the frames array of the SpriteAnimation.
* @name FORGE.SpriteAnimation#frames
* @readonly
* @type {Array<Object>}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "frames",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._frames;
    }
});

/**
* Get the current frame index of the SpriteAnimation.
* @name FORGE.SpriteAnimation#frameIndex
* @readonly
* @type {number}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "frameIndex",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._frameIndex;
    }
});

/**
* Get the frame rate of the SpriteAnimation.
* @name FORGE.SpriteAnimation#frameRate
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "frameRate",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._frameRate;
    },

    /** @this {FORGE.SpriteAnimation} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        this._frameRate = value;
        this._delay = 1000 / this._frameRate;
    }
});

/**
* Get and set the loop flag of the SpriteAnimation.
* @name FORGE.SpriteAnimation#loop
* @type {boolean}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "loop",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._loop;
    },

    /** @this {FORGE.SpriteAnimation} */
    set: function(value)
    {
        this._loop = Boolean(value);
    }
});

/**
* Get the loop count of the SpriteAnimation.
* @name FORGE.SpriteAnimation#loopCount
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "loopCount",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._loopCount;
    }
});


/**
* Get the playing status of the SpriteAnimation.
* @name FORGE.SpriteAnimation#playing
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "playing",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._playing;
    }
});

/**
* Get the paused status of the SpriteAnimation.
* @name FORGE.SpriteAnimation#paused
* @type {boolean}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "paused",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._paused;
    },

    /** @this {FORGE.SpriteAnimation} */
    set: function(value)
    {
        if(Boolean(value) === true)
        {
            this.pause();
        }
        else
        {
            this.resume();
        }
    }
});

/**
* Get the complete status of the SpriteAnimation.
* @name FORGE.SpriteAnimation#complete
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "complete",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        return this._complete;
    }
});

/**
* Get the onPlay {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onPlay
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onPlay",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onPlay === null)
        {
            this._onPlay = new FORGE.EventDispatcher(this);
        }

        return this._onPlay;
    }
});

/**
* Get the onPause {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onPause
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onPause",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
* Get the onResume {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onResume
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onResume",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});

/**
* Get the onLoop {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onLoop
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onLoop",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onLoop === null)
        {
            this._onLoop = new FORGE.EventDispatcher(this);
        }

        return this._onLoop;
    }
});

/**
* Get the onComplete {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onComplete
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onComplete",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});

/**
* Get the onStop {@link FORGE.EventDispatcher}.
* @name FORGE.SpriteAnimation#onStop
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.SpriteAnimation.prototype, "onStop",
{
    /** @this {FORGE.SpriteAnimation} */
    get: function()
    {
        if(this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});
