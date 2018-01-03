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
     * Effect composer
     * @name FORGE.SceneEffectComposer#_composer
     * @type {THREE.EffectComposer}
     * @private
     */
    this._composer = null;

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

    this._composer = new THREE.EffectComposer(this._viewer.renderer.webGLRenderer, this._target);
    this._composer.addPass(new THREE.TexturePass(this._texture));

    for (var i=0, ii=this._fx.length; i<ii; i++)
    {
        var pass = this._viewer.fxs.getFXPassByUID(this._fx[i]);
        this._composer.addPass(pass);
    }

    // Add a final copy pass to ensure composer always ends up rendering in its write buffer
    this._composer.addPass(new THREE.ShaderPass(THREE.CopyShader));
};

FORGE.SceneEffectComposer.prototype.render = function()
{
    this._composer.render(this._viewer.clock.deltaTime);
};

FORGE.SceneEffectComposer.prototype.destroy = function()
{
    this._composer.renderer = null;
    this._composer.writeBuffer.dispose();
    this._composer.readBuffer.dispose();
    this._composer.renderTarget1 = null;
    this._composer.renderTarget2 = null;
    this._composer.passes.length = 0;
    this._composer.copyPass = null;
    this._composer = null;
};
