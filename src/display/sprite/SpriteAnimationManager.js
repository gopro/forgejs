
/**
 * Animation manager, handles animations for the {@link FORGE.Sprite} display class.
 * @constructor FORGE.SpriteAnimationManager
 * @param {FORGE.Sprite} sprite - The Sprite attached to this animation manager.
 * @extends {FORGE.BaseObject}
 */
FORGE.SpriteAnimationManager = function(sprite)
{
    /**
     * The Sprite attached to this SpriteAnimationManager.
     * @name  FORGE.SpriteAnimationManager#_sprite
     * @type {FORGE.Sprite}
     * @private
     */
    this._sprite = sprite;

    /**
     * The Object that handles all animation declarations.
     * @name  FORGE.SpriteAnimationManager#_anims
     * @type {Object<string,FORGE.SpriteAnimation>}
     * @private
     */
    this._anims = {};

    /**
     * Reference to the current animation name.
     * @name  FORGE.SpriteAnimationManager#_animation
     * @type {string}
     * @private
     */
    this._animation = "default";

    /**
     * The default frame rate used by the animations.
     * @name  FORGE.SpriteAnimationManager#_frameRate
     * @type {number}
     * @private
     */
    this._frameRate = 30;

    /**
     * List of pending actions.<br>
     * some action are placed here if the Sprite is not loaded.
     * @name  FORGE.SpriteAnimationManager#_pending
     * @type {Array<AnimationConfiguration>}
     * @private
     */
    this._pending = [];

    FORGE.BaseObject.call(this, "SpriteAnimationManager");

    this._boot();
};

FORGE.SpriteAnimationManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SpriteAnimationManager.prototype.constructor = FORGE.SpriteAnimationManager;

/**
 * Boot sequence.
 * @method FORGE.SpriteAnimationManager#_boot
 * @private
 */
FORGE.SpriteAnimationManager.prototype._boot = function()
{
    // Add the default animation that includes all frames @60fps
    this.add("default");

    if(this._sprite.loaded === false)
    {
        this._sprite.onLoadComplete.addOnce(this._spriteLoadComplete, this);
    }
};

/**
 * Apply pending animation declaration on sprite load complete.
 * @method FORGE.SpriteAnimationManager#_spriteLoadComplete
 * @private
 */
FORGE.SpriteAnimationManager.prototype._spriteLoadComplete = function()
{
    this.log("_spriteLoadComplete");

    var method, args;
    for(var i = 0, ii = this._pending.length; i < ii; i++)
    {
        method = this._pending[i].method;
        args = this._pending[i].args;
        FORGE.SpriteAnimationManager.prototype[method].apply(this, args);
    }

    this._pending = [];
};

/**
 * Add a configuration for animations
 * @method FORGE.SpriteAnimationManager#addConfig
 * @param {Array<SpriteAnimationConfig>} config - The configuration to add
 */
FORGE.SpriteAnimationManager.prototype.addConfig = function(config)
{
    if(Array.isArray(config) === true)
    {
        var anim;

        for(var i = 0, ii = config.length; i < ii; i++)
        {
            anim = config[i];
            this.add(anim.name, anim.start, anim.end, anim.frameRate, anim.loop);
        }
    }
};

/**
 * Add an animation sequence to this sprite.
 * @method FORGE.SpriteAnimationManager#add
 * @param {string=} name - The name of your animation sequence.
 * @param {number=} start - The starting frame index of the full frames array.
 * @param {number=} end - The end frame index of the full frame array.
 * @param {number=} frameRate - The frame rate of this animation (default: 60)
 * @param {boolean=} loop - Does the animation have to loop? (default: false)
 */
FORGE.SpriteAnimationManager.prototype.add = function(name, start, end, frameRate, loop)
{
    if(this._sprite.loaded === false)
    {
        this._pending.push({
            method: "add",
            args: arguments
        });

        return;
    }

    this.log("add");

    name = (typeof name === "string") ? name : "default";
    start = parseInt(start, 10);
    end = parseInt(end, 10);
    frameRate = (typeof frameRate === "number") ? frameRate : this._frameRate;
    loop = (typeof loop === "boolean") ? loop : true;

    var frames = this._sprite.frames;

    if(typeof start !== "number" || isNaN(start) === true || start < 0 || start >= frames.length)
    {
        start = 0;
    }

    if(typeof end !== "number" || isNaN(end) === true || end < 0 || end >= frames.length)
    {
        end = frames.length - 1;
    }

    var selectedFrames = frames.slice(start, end + 1);

    this._anims[name] = new FORGE.SpriteAnimation(this._sprite, name, selectedFrames, frameRate, loop);
};

/**
 * Play the curretn animation or a specified animation.<br>
 * If the Sprite is not loaded, kepp this method call in pending.
 * @method  FORGE.SpriteAnimationManager#play
 * @param  {string=} animation - The animation name you want to play.
 * @param  {boolean=} loop - Does the animation should loop?
 * @param  {number=} index - The index of the animation to play
 */
FORGE.SpriteAnimationManager.prototype.play = function(animation, loop, index)
{
    if(this._sprite.loaded === false)
    {
        this._pending.push(
        {
            method: "play",
            args: [animation, loop, index]
        });

        return;
    }

    // if there is an animation name use it, if not play the current animation, if no current animation, play the default one.
    animation = (typeof animation === "string") ? animation : (this.current !== null) ? this.current.name : "default";
    loop = (typeof loop === "boolean") ? loop : true;
    index = (typeof index === "number" && isNaN(index) === false) ? index : 0;

    var anim = this.get(animation);

    if(anim !== null)
    {
        anim.play(loop, index);
    }
};

/**
 * Pause the animation.
 * @method  FORGE.SpriteAnimationManager#pause
 * @param  {number=} index - The frame index on which to pause to animation. Default will be the current frame.
 */
FORGE.SpriteAnimationManager.prototype.pause = function(index)
{
    if(this._sprite.loaded === false)
    {
        this._pending.push({
            method: "pause",
            args: [index]
        });

        return;
    }

    if(this.current !== null)
    {
        this.current.pause(index);
    }
};

/**
 * Resume the animation.
 * @method  FORGE.SpriteAnimationManager#resume
 * @param  {number=} index - The frame index on which to pause to animation. Default will be the current frame.
 */
FORGE.SpriteAnimationManager.prototype.resume = function(index)
{
    if(this._sprite.loaded === false)
    {
        this._pending.push({
            method: "resume",
            args: [index]
        });

        return;
    }

    if(this.current !== null)
    {
        this.current.resume(index);
    }
};

/**
 * Stops the current animation, reset it to its first frame.
 * @method  FORGE.SpriteAnimationManager#stop
 */
FORGE.SpriteAnimationManager.prototype.stop = function()
{
    if(this._sprite.loaded === false)
    {
        this._pending.push({
            method: "stop",
            args: []
        });

        return;
    }

    if(this.current !== null)
    {
        this.current.stop();
    }
};


/**
 * Get an animation by its name.
 * @method  FORGE.SpriteAnimationManager#get
 * @param  {string} name - The name of the animation you want to get.
 * @return {FORGE.SpriteAnimation} Returns the asked animation if exists, null if not.
 */
FORGE.SpriteAnimationManager.prototype.get = function(name)
{
    if(FORGE.Utils.isTypeOf(this._anims[name], "SpriteAnimation") === true)
    {
        return this._anims[name];
    }

    return null;
};

/**
 * Internal update method.<br>
 * Main purpose is to update the current animation.
 * @method FORGE.SpriteAnimationManager#update
 */
FORGE.SpriteAnimationManager.prototype.update = function()
{
    if(this.current !== null)
    {
        this.current.update();
    }
};

/**
 * Destroy method
 * @method FORGE.SpriteAnimationManager#destroy
 */
FORGE.SpriteAnimationManager.prototype.destroy = function()
{
    for(var name in this._anims)
    {
        this._anims[name].destroy();
        this._anims[name] = null;
    }

    this._sprite = null;
    this._anims = null;
    this._pending = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the default frame raet.
 * @name FORGE.SpriteAnimationManager#frameRate
 * @type {number}
 */
Object.defineProperty(FORGE.SpriteAnimationManager.prototype, "frameRate",
{
    /** @this {FORGE.SpriteAnimationManager} */
    get: function()
    {
        return this._frameRate;
    },

    /** @this {FORGE.SpriteAnimationManager} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._frameRate = value;
        }
    }
});

/**
 * Get and set the current animation.
 * @name FORGE.SpriteAnimationManager#current
 * @type {FORGE.SpriteAnimation}
 */
Object.defineProperty(FORGE.SpriteAnimationManager.prototype, "current",
{
    /** @this {FORGE.SpriteAnimationManager} */
    get: function()
    {
        return this.get(this._animation);
    },

    /** @this {FORGE.SpriteAnimationManager} */
    set: function(animation)
    {
        if(FORGE.Utils.isTypeOf(animation, "SpriteAnimation") === true)
        {
            this._animation = animation.name;
        }
    }
});

/**
 * Get all the animations.
 * @name FORGE.SpriteAnimationManager#all
 * @type {FORGE.SpriteAnimation}
 */
Object.defineProperty(FORGE.SpriteAnimationManager.prototype, "all",
{
    /** @this {FORGE.SpriteAnimationManager} */
    get: function()
    {
        return this._anims;
    }
});


