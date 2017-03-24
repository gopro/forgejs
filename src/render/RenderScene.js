/**
 * A render scene is an object responsible of preparing the draw of a scene
 * with a camera, applying a set of image effect.
 *
 * It creates an effect composer that will be called by render loop.
 * It writes the resulting image into a texture used in main render pipeline.
 *
 * @constructor FORGE.RenderScene
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.Scene} scene scene to render
 * @param {THREE.Camera} camera camera used to render the scene
 * @param {Array<FX>} fxConfig image fx configuration object
 * @extends {FORGE.BaseObject}
 */
FORGE.RenderScene = function(viewer, scene, camera, fxConfig)
{
    /**
     * The viewer reference.
     * @name FORGE.RenderScene#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Scene to be rendered
     * @name FORGE.RenderScene#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = scene;

    /**
     * Camera used to render the scene
     * @name FORGE.RenderScene#_camera
     * @type {THREE.Camera}
     * @private
     */
    this._camera = camera;

    /**
     * Set of image effect configuration
     * @name FORGE.RenderScene#_fxConfig
     * @type {Array<FX>}
     * @private
     */
    this._fxConfig = fxConfig;

    /**
     * Effect composer rendering the scene into a texture
     * @name FORGE.RenderScene#_sceneComposer
     * @type {FORGE.EffectComposer}
     * @private
     */
    this._sceneComposer = null;

    /**
     * Effect composer dedicated to object picking
     * @name FORGE.RenderScene#_pickingComposer
     * @type {FORGE.EffectComposer}
     * @private
     */
    this._pickingComposer = null;

    FORGE.BaseObject.call(this, "RenderScene");

    this._boot();
};

FORGE.RenderScene.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.RenderScene.prototype.constructor = FORGE.RenderScene;

/**
 * Boot sequence
 * @method FORGE.RenderScene#_boot
 * @private
 */
FORGE.RenderScene.prototype._boot = function()
{
    // Create main effect composer, add render pass and shader passes
    this._sceneComposer = new FORGE.EffectComposer(FORGE.EffectComposerType.RENDER,
                                                 this._viewer.renderer.webGLRenderer);

    var renderPass = new FORGE.RenderPass(this._scene, this._camera);
    renderPass.position = FORGE.PassPosition.RENDER;
    this._sceneComposer.addPass(renderPass);

    var shaderPasses = this._parseShaderPasses(this._fxConfig);
    for (var j = 0, jj = shaderPasses.length; j < jj; j++)
    {
        var shaderPass = shaderPasses[j];
        shaderPass.renderToScreen = false;
        shaderPass.position = FORGE.PassPosition.RENDER;
        this._sceneComposer.addPass(shaderPass);
    }

    // Create picking effect composer and add render pass
    this._pickingComposer = new FORGE.EffectComposer(FORGE.EffectComposerType.PICKING,
                                                   this._viewer.renderer.webGLRenderer);

    var pickingPass = new FORGE.RenderPass(this._scene, this._camera);
    pickingPass.position = FORGE.PassPosition.RENDER;
    this._pickingComposer.addPass(pickingPass);
};

/**
 * Parse shader passes
 * @method FORGE.RenderScene#_parseShaderPasses
 * @param {Array<FX>} config shader passes configuration
 * @return {Array<THREE.ShaderPass>} array of shader passes
 * @private
 */
FORGE.RenderScene.prototype._parseShaderPasses = function(config)
{
    return this._viewer.postProcessing.parseShaderPasses(config);
};

/**
 * Set size of each pass of the render scene
 * @method FORGE.RenderScene#setSize
 * @param {number} width composer width
 * @param {number} height composer height
 */
FORGE.RenderScene.prototype.setSize = function(width, height)
{
    this._sceneComposer.setSize(width, height);
    this._pickingComposer.setSize(width, height);
};

/**
 * Destroy sequence
 * @method FORGE.RenderScene#destroy
 */
FORGE.RenderScene.prototype.destroy = function()
{
    this._sceneComposer.readBuffer.dispose();
    this._sceneComposer.writeBuffer.dispose();

    while (this._sceneComposer.passes.length > 0)
    {
        var pass = this._sceneComposer.passes.pop();

        if (pass instanceof FORGE.TexturePass && pass.hasOwnProperty("tDiffuse"))
        {
            pass.uniforms["tDiffuse"].value.texture.dispose();
            pass.uniforms["tDiffuse"].value = null;
        }
    }

    this._sceneComposer = null;

    this._pickingComposer.passes.length = 0;
    this._pickingComposer = null;

    this._viewer = null;
    this._scene = null;
    this._camera = null;
    this._fxConfig = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get scene.
 * @name FORGE.RenderScene#scene
 * @type {THREE.Scene}
 */
Object.defineProperty(FORGE.RenderScene.prototype, "scene",
{
    /** @this {FORGE.RenderScene} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get camera.
 * @name FORGE.RenderScene#camera
 * @type {THREE.Camera}
 */
Object.defineProperty(FORGE.RenderScene.prototype, "camera",
{
    /** @this {FORGE.RenderScene} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get scene composer.
 * @name FORGE.RenderScene#sceneComposer
 * @type {FORGE.EffectComposer}
 */
Object.defineProperty(FORGE.RenderScene.prototype, "sceneComposer",
{
    /** @this {FORGE.RenderScene} */
    get: function()
    {
        return this._sceneComposer;
    }
});

/**
 * Get scene composer.
 * @name FORGE.RenderScene#pickingComposer
 * @type {FORGE.EffectComposer}
 */
Object.defineProperty(FORGE.RenderScene.prototype, "pickingComposer",
{
    /** @this {FORGE.RenderScene} */
    get: function()
    {
        return this._pickingComposer;
    }
});
