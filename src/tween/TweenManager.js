
/**
 * Manages the {@link FORGE.Tween}.
 * @constructor FORGE.TweenManager
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.TweenManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.TweenManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The list of {FORGE.Tween}.
     * @name FORGE.TweenManager#_tweens
     * @type {Array<FORGE.Tween>}
     * @private
     */
    this._tweens = [];

    FORGE.BaseObject.call(this, "TweenManager");
};

FORGE.TweenManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.TweenManager.prototype.constructor = FORGE.TweenManager;

/**
 * Internal handler to destroy a tween.
 * @method FORGE.TweenManager#_indexOfTween
 * @param {FORGE.Tween} tween - The {FORGE.Tween} to look for.
 * @return {number} Returns the tween identifier, if not, returns -1.
 * @private
 */
FORGE.TweenManager.prototype._indexOfTween = function(tween)
{
    for ( var i = 0, ii = this._tweens.length; i < ii; i++ )
    {
        if(tween === this._tweens[i])
        {
            return i;
        }
    }

    return -1;
};

/**
 * Internal handler to destroy a tween.
 * @method FORGE.TweenManager#_tweenDestroyHandler
 * @param {FORGE.Event} event - The event.
 * @private
 */
FORGE.TweenManager.prototype._tweenDestroyHandler = function(event)
{
    var tween = /** @type {FORGE.Tween} */ (event.emitter);
    this.remove(tween);
};

/**
 * Add a tween.
 * @method FORGE.TweenManager#add
 * @param {FORGE.Tween} tween - The {FORGE.Tween} to add.
 */
FORGE.TweenManager.prototype.add = function(tween)
{
    this._tweens.push(tween);
    tween.onDestroy.addOnce(this._tweenDestroyHandler, this);
};

/**
 * Remove a tween.
 * @method FORGE.TweenManager#remove
 * @param {FORGE.Tween} tween - The {FORGE.Tween} to remove.
 */
FORGE.TweenManager.prototype.remove = function(tween)
{
    var index = this._indexOfTween(tween);

    if(index !== -1)
    {
        this._tweens.splice(index, 1);
    }
};

/**
 * Update loop.
 * @method FORGE.TweenManager#update
 */
FORGE.TweenManager.prototype.update = function()
{
    for(var i = 0, ii = this._tweens.length; i < ii; i++)
    {
        this._tweens[i].update();
    }
};

/**
 * Destroy method.
 * @method FORGE.TweenManager#destroy
 */
FORGE.TweenManager.prototype.destroy = function()
{
    var count = this._tweens.length;
    while(count--)
    {
        this._tweens[count].destroy();
    }

    this._tweens = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
