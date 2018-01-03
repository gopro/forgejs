/**
 * FORGE.BackgroundShaderRenderer
 * BackgroundShaderRenderer class.
 *
 * @constructor FORGE.BackgroundShaderRenderer
 * @extends {FORGE.BackgroundMeshRenderer}
 *
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 */
FORGE.BackgroundShaderRenderer = function(viewer, sceneRenderer)
{
    FORGE.BackgroundMeshRenderer.call(this, viewer, sceneRenderer, "BackgroundShaderRenderer");
};

FORGE.BackgroundShaderRenderer.prototype = Object.create(FORGE.BackgroundMeshRenderer.prototype);
FORGE.BackgroundShaderRenderer.prototype.constructor = FORGE.BackgroundShaderRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundShaderRenderer#_boot
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._boot = function()
{
    FORGE.BackgroundMeshRenderer.prototype._boot.call(this);

    // Override camera with some orthographic for quad rendering
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

/**
 * Create material for fragment shader rendering
 * @method FORGE.BackgroundShaderRenderer#_createMaterial
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._createMaterial = function()
{
    var shaderSTW = this._sceneRenderer.view.current.shaderSTW;

    var vertexShader = FORGE.ShaderLib.parseIncludes(shaderSTW.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shaderSTW.fragmentShader);

    var material = new THREE.ShaderMaterial({
        uniforms: /** @type {FORGEUniform} */ (shaderSTW.uniforms),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.FrontSide
    });

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
 * @param {THREE.WebGLRenderer} webGLRenderer WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 */
FORGE.BackgroundShaderRenderer.prototype.render = function(webGLRenderer, target)
{
    // var periodMS = 15 * 1000;

    // var tn = (this._viewer.clock.elapsedTime % periodMS) / periodMS;
    // var ramp = tn < 0.5 ? 2 * tn : 2 - 2 * tn;

    // this._mesh.material.uniforms.tMixRatio.value = ramp;
    // this._mesh.material.uniforms.tTime.value = tn;

    FORGE.BackgroundMeshRenderer.prototype.render.call(this, webGLRenderer, target);
};

