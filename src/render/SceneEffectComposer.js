/**
 * SceneEffectComposer class.
 *
 * @constructor FORGE.SceneEffectComposer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.WebGLRenderTarget} texture - composer texture pass input texture
 * @param {THREE.WebGLRenderTarget} target - composer output texture target
 * @param {Array<string>=} fx - fx array configuration
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.SceneEffectComposer = function(viewer, texture, target, fx)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneEffectComposer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Input texture.
     * @name FORGE.SceneEffectComposer#_texture
     * @type {THREE.Texture}
     * @private
     */
    this._texture = texture;

    /**
     * The render target.
     * @name FORGE.SceneEffectComposer#_target
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._target = target;

    /**
     * FX configuration (list of UIDs).
     * @name FORGE.SceneEffectComposer#
     * @type {Array<string>}
     * @private
     */
    this._fx = fx;

    /**
     * Effect composer rendering into viewport textures.
     * @name FORGE.SceneEffectComposer#_viewportComposer
     * @type {THREE.EffectComposer}
     * @private
     */
    this._viewportComposer = null;

    /**
     * Effect composer rendering viewport into the target.
     * @name FORGE.SceneEffectComposer#_mainComposer
     * @type {THREE.EffectComposer}
     * @private
     */
    this._mainComposer = null;

    FORGE.BaseObject.call(this, "SceneEffectComposer");

    this._boot();
};

FORGE.SceneEffectComposer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneEffectComposer.prototype.constructor = FORGE.SceneEffectComposer;

FORGE.SceneEffectComposer.prototype._boot = function()
{
    if (typeof this._fx === "undefined")
    {
        this._fx = [];
    }

    var outTexture = this._texture.clone();
    outTexture.name += "-output";

    this._viewportComposer = new THREE.EffectComposer(this._viewer.renderer.webGLRenderer, outTexture);
    this._viewportComposer.addPass(new THREE.TexturePass(this._texture));

    for (var i=0, ii=this._fx.length; i<ii; i++)
    {
        var pass = this._viewer.fxs.getFXPassByUID(this._fx[i]);
        this._viewportComposer.addPass(pass);
    }

    // Add a final copy pass to ensure composer always ends up rendering in its write buffer
    this._viewportComposer.addPass(new THREE.ShaderPass(THREE.CopyShader));

    this._mainComposer = new THREE.EffectComposer(this._viewer.renderer.webGLRenderer, this._target);
    this._mainComposer.addPass(new THREE.TexturePass(outTexture));
    this._mainComposer.addPass(new THREE.ShaderPass(THREE.CopyShader));
};

FORGE.SceneEffectComposer.prototype.render = function()
{
    this._viewportComposer.render(this._viewer.clock.deltaTime);
    this._mainComposer.render();
};

FORGE.SceneEffectComposer.prototype.destroy = function()
{
    this._viewportComposer.renderer = null;
    this._viewportComposer.writeBuffer.dispose();
    this._viewportComposer.readBuffer.dispose();
    this._viewportComposer.renderTarget1 = null;
    this._viewportComposer.renderTarget2 = null;
    this._viewportComposer.passes.length = 0;
    this._viewportComposer.copyPass = null;
    this._viewportComposer = null;

    this._mainComposer.renderer = null;
    this._mainComposer.writeBuffer.dispose();
    this._mainComposer.readBuffer.dispose();
    this._mainComposer.renderTarget1 = null;
    this._mainComposer.renderTarget2 = null;
    this._mainComposer.passes.length = 0;
    this._mainComposer.copyPass = null;
    this._mainComposer = null;
};
