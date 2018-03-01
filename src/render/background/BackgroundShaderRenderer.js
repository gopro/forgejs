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
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundShaderRenderer#render
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 */
FORGE.BackgroundShaderRenderer.prototype.render = function(target)
{
    // var periodMS = 15 * 1000;

    // var tn = (this._viewer.clock.elapsedTime % periodMS) / periodMS;
    // var ramp = tn < 0.5 ? 2 * tn : 2 - 2 * tn;

    // this._mesh.material.uniforms.tMixRatio.value = ramp;
    // this._mesh.material.uniforms.tTime.value = tn;

    FORGE.BackgroundTextureRenderer.prototype.render.call(this, target);
};

