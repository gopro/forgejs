/**
 * FORGE.BackgroundTextureRenderer
 * BackgroundTextureRenderer class.
 *
 * @constructor FORGE.BackgroundTextureRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneViewport} viewport - {@link FORGE.SceneViewport} reference.
 * @param {string=} className - The class name of the object as long as many other object inherits from this one.
 * @extends {FORGE.BackgroundMeshRenderer}
 */
FORGE.BackgroundTextureRenderer = function(viewer, viewport, className)
{
    /**
     * Texture used for video rendering
     * @name FORGE.BackgroundTextureRenderer#_texture
     * @type {THREE.Texture}
     * @private
     */
    this._texture = null;

    FORGE.BackgroundMeshRenderer.call(this, viewer, viewport, className || "BackgroundTextureRenderer");

};

FORGE.BackgroundTextureRenderer.prototype = Object.create(FORGE.BackgroundMeshRenderer.prototype);
FORGE.BackgroundTextureRenderer.prototype.constructor = FORGE.BackgroundTextureRenderer;


/**
 * Init routine.
 * @method FORGE.BackgroundTextureRenderer#_boot
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._boot = function()
{
    FORGE.BackgroundMeshRenderer.prototype._boot.call(this);

    this._texture = this._media.texture.texture;
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderer} webGLRenderer THREE WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundTextureRenderer#render
 */
FORGE.BackgroundTextureRenderer.prototype.render = function(webGLRenderer, target)
{
    var uniforms = this._mesh.material.uniforms;

    if (typeof uniforms === "undefined")
    {
        return;
    }

    if ("tTexture" in uniforms)
    {
        uniforms.tTexture.value = this._texture;
    }

    if ("tTextureRatio" in uniforms)
    {
        uniforms.tTextureRatio.value = this._texture.image.width / this._texture.image.height;
    }

    FORGE.BackgroundMeshRenderer.prototype.render.call(this, webGLRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundTextureRenderer#destroy
 */
FORGE.BackgroundTextureRenderer.prototype.destroy = function()
{
    this._texture = null;

    FORGE.BackgroundMeshRenderer.prototype.destroy.call(this);
};
