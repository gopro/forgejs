/**
 * FORGE.BackgroundShaderRenderer
 * BackgroundShaderRenderer class.
 *
 * @constructor FORGE.BackgroundShaderRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.Viewport} viewport - {@link FORGE.Viewport} reference.
 * @extends {FORGE.BackgroundTextureRenderer}
 */
FORGE.BackgroundShaderRenderer = function(viewer, viewport)
{
    /**
     * Render target for antialiasing
     * @type {THREE.WebGLRenderTarget}
     */
    this._aaRenderTarget = null;

    FORGE.BackgroundTextureRenderer.call(this, viewer, viewport, "BackgroundShaderRenderer");
};

FORGE.BackgroundShaderRenderer.prototype = Object.create(FORGE.BackgroundTextureRenderer.prototype);
FORGE.BackgroundShaderRenderer.prototype.constructor = FORGE.BackgroundShaderRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundShaderRenderer#_boot
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._boot = function()
{
    FORGE.BackgroundTextureRenderer.prototype._boot.call(this);

    // Override camera with some orthographic for quad rendering
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    this._aaRenderTarget = new THREE.WebGLRenderTarget(this._viewport.size.width, this._viewport.size.height, {format: THREE.RGBFormat});

    this._bootComplete();
};

/**
 * Create material for fragment shader rendering
 * @method FORGE.BackgroundShaderRenderer#_createMaterial
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._createMaterial = function()
{
    var shaderSTW = this._viewport.view.current.shaderSTW;

    var vertexShader = FORGE.ShaderLib.parseIncludes(shaderSTW.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shaderSTW.fragmentShader);

    var material = new THREE.RawShaderMaterial({
        uniforms: /** @type {FORGEUniform} */ (shaderSTW.uniforms),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthTest: false,
        depthWrite: false,
        side: THREE.FrontSide
    });

    switch (this._media.source.format)
    {
        case FORGE.MediaFormat.EQUIRECTANGULAR:
        default:
            material.uniforms.tMediaFormat.value = 0;
        break;

        case FORGE.MediaFormat.CUBE:
            material.uniforms.tMediaFormat.value = 1;
        break;

        case FORGE.MediaFormat.FLAT:
            material.uniforms.tMediaFormat.value = 2;
        break;
    }

    material.uniforms.tTransition.value = 0;
    material.uniforms.tTextureResolution.value = new THREE.Vector2(this._media.displayObject.originalWidth, this._media.displayObject.originalHeight);

    material.needsUpdate = true;

    return material;
};

/**
 * Create geometry
 * @method FORGE.BackgroundShaderRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._createGeometry = function()
{
    return new THREE.PlaneBufferGeometry(2, 2);
};

/**
 * Set the media for the transition
 * @method FORGE.BackgroundShaderRenderer#setMediaTransition
 * @param {FORGE.Media} media - transition media
 * @param {number} transitionType - transition type @todo: create an enum mapped on GLSL definition
 */
FORGE.BackgroundShaderRenderer.prototype.setMediaTransition = function(media, transitionType)
{
    // Stop the transition
    if (media === null)
    {
        if ("tTextureTransition" in this._mesh.material.uniforms)
        {
            this._mesh.material.uniforms.tTextureTransition.value = null;
        }

        if ("tTransition" in this._mesh.material.uniforms)
        {
            this._mesh.material.uniforms.tTransition.value = 0;
        }
    }

    // Start the transition
    else
    {
        if ("tTextureTransition" in this._mesh.material.uniforms)
        {
            this._mesh.material.uniforms.tTextureTransition.value = media.texture.texture;
        }

        if ("tTransition" in this._mesh.material.uniforms)
        {
            this._mesh.material.uniforms.tTransition.value = transitionType;
        }

        switch (media.source.format)
        {
            case FORGE.MediaFormat.EQUIRECTANGULAR:
            default:
                this._mesh.material.uniforms.tMediaFormatTransition.value = 0;
            break;

            case FORGE.MediaFormat.CUBE:
                this._mesh.material.uniforms.tMediaFormatTransition.value = 1;
            break;

            case FORGE.MediaFormat.FLAT:
                this._mesh.material.uniforms.tMediaFormatTransition.value = 2;
            break;
        }
    }
};

/**
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundShaderRenderer#render
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 */
FORGE.BackgroundShaderRenderer.prototype.render = function(target)
{
    if (this._mesh.material.uniforms.tTransition !== 0)
    {
        if ("tMixRatio" in this._mesh.material.uniforms)
        {
            this._mesh.material.uniforms.tMixRatio.value = this._viewer.renderer.loader.transition.time;
        }
    }

    // First pass
    this._mesh.material.uniforms.tAAPass.value = 1;
    this._mesh.material.uniforms.tAATexture.value = null;
    this._mesh.material.uniforms.tAAOffset.value = new THREE.Vector2(0.5, 0.5);

    FORGE.BackgroundTextureRenderer.prototype.render.call(this, this._aaRenderTarget);

    this._mesh.material.uniforms.tAAPass.value = 2;
    this._mesh.material.uniforms.tAATexture.value = this._aaRenderTarget.texture;
    this._mesh.material.uniforms.tAAOffset.value = new THREE.Vector2();

    FORGE.BackgroundTextureRenderer.prototype.render.call(this, target);
};

/**
 * Destroy routine
 * @method FORGE.BackgroundShaderRenderer#destroy
 */
FORGE.BackgroundShaderRenderer.prototype.destroy = function()
{
    this._aaRenderTarget.dispose();
    this._aaRenderTarget = null;

    FORGE.BackgroundTextureRenderer.prototype.destroy.call(this);
}

