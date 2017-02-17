
/**
 * A Sprite is like an Image, except it can have animations.
 *
 * @constructor FORGE.Sprite
 * @param {FORGE.Viewer} viewer - The Viewer reference.
 * @param {(string|ImageConfig)} config - Configuration object.
 * @extends {FORGE.Image}
 */
FORGE.Sprite = function(viewer, config)
{
    /**
     * Animation manager
     * @name  FORGE.Sprite#_animations
     * @type {FORGE.SpriteAnimationManager}
     * @private
     */
    this._animations = null;

    FORGE.Image.call(this, viewer, config, "Sprite");
};

FORGE.Sprite.prototype = Object.create(FORGE.Image.prototype);
FORGE.Sprite.prototype.constructor = FORGE.Sprite;

/**
 * Boot Sequence
 * @method FORGE.Sprite#_boot
 * @private
 */
FORGE.Sprite.prototype._boot = function()
{
    this._renderMode = FORGE.Image.renderModes.CANVAS;

    FORGE.Image.prototype._boot.call(this);

    this._animations = new FORGE.SpriteAnimationManager(this);
    this._viewer.display.register(this, true);
};

/**
 * Play an animation.<br>
 * This is a proxy to the {@link FORGE.SpriteAnimationManager} play method.
 * @method  FORGE.Sprite#play
 * @param  {string=} [animation] - The animation name you want to play. Default is the current animation.
 * @param  {boolean=} [loop=false] - Does the animation should loop?
 * @param  {number=} [index=0] - The frame index on which to start playing the animation.
 */
FORGE.Sprite.prototype.play = function(animation, loop, index)
{
    this._animations.play(animation, loop, index);
};

/**
 * Pauses the current animation.<br>
 * This is a proxy to the {@link FORGE.SpriteAnimationManager} pause method.
 * @method FORGE.Sprite#pause
 * @param  {number=} index - The frame index on which to pause the animation. Default will be the current frame.
 */
FORGE.Sprite.prototype.pause = function(index)
{
    this._animations.pause(index);
};

/**
 * Resume the current animation.<br>
 * This is a proxy to the {@link FORGE.SpriteAnimationManager} resume method.
 * @method FORGE.Sprite.resume
 * @param  {number=} index - The frame index on which to resume the animation. Default will be the current frame.
 */
FORGE.Sprite.prototype.resume = function(index)
{
    this._animations.resume(index);
};

/**
 * Stops the current animation.<br>
 * This is a proxy to the {@link FORGE.SpriteAnimationManager} stop method.
 * @method FORGE.Sprite.stop
 */
FORGE.Sprite.prototype.stop = function()
{
    this._animations.stop();
};

/**
 * Update method called by the display list.
 * @method FORGE.Sprite#update
 */
FORGE.Sprite.prototype.update = function()
{
    this._animations.update();
};

/**
 * Destroy method
 * @method  FORGE.Sprite#destroy
 */
FORGE.Sprite.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    this._animations.destroy();
    this._animations = null;
    
    FORGE.Image.prototype.destroy.call(this);
};

/**
 * Get the animation manager of this Sprite.
 * @name  FORGE.Sprite#animations
 * @readonly
 * @type {FORGE.SpriteAnimationManager}
 */
Object.defineProperty(FORGE.Sprite.prototype, "animations",
{
    /** @this {FORGE.Sprite} */
    get: function()
    {
        return this._animations;
    }
});

/**
 * Get the curretn animation of this Sprite.
 * @name  FORGE.Sprite#animation
 * @readonly
 * @type {FORGE.Animation}
 */
Object.defineProperty(FORGE.Sprite.prototype, "animation",
{
    /** @this {FORGE.Sprite} */
    get: function()
    {
        return this._animations.currentAnimation;
    }
});
