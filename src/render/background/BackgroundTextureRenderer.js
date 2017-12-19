/**
 * FORGE.BackgroundTextureRenderer
 * BackgroundTextureRenderer class.
 *
 * @constructor FORGE.BackgroundTextureRenderer
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 * @param {string=} type - The type of the object as long as many other object inherits from this one.
 * @extends {FORGE.BackgroundRenderer}
 */
FORGE.BackgroundTextureRenderer = function(sceneRenderer, type)
{
    /**
     * Texture used for video rendering
     * @type {THREE.Texture}
     * @private
     */
    this._texture = null;


    FORGE.BackgroundRenderer.call(this, sceneRenderer, type || "BackgroundTextureRenderer");
};

FORGE.BackgroundTextureRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundTextureRenderer.prototype.constructor = FORGE.BackgroundTextureRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundTextureRenderer#_boot
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    this._texture = this._media.texture.texture;
};

/**
 * Create texture
 * @method FORGE.BackgroundTextureRenderer#_createTexture
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._createTexture = function()
{

};

/**
 * Render routine.
 * @param {THREE.WebGLRenderer} webGLRenderer THREE WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundTextureRenderer#render
 */
FORGE.BackgroundTextureRenderer.prototype.render = function(webGLRenderer, target)
{
    FORGE.BackgroundRenderer.prototype.render.call(this, webGLRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundTextureRenderer#destroy
 */
FORGE.BackgroundTextureRenderer.prototype.destroy = function()
{
    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};
