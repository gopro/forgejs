/**
 * ViewportComposer class.
 *
 * This class is responsible of adding FX passes once background and objects
 * have been rendered. FX definition is passed at construction time and comes
 * from the scene configuration. FX passes are created by the FX Manager object.
 *
 *
 * Viewport composer relies on the THREE.EffectComposer object
 *
 * THREE.EffectComposer is a collection of passes (render, texture, shader)
 * and 2 WebGLRenderTarget objects for the render to texture. They are called
 * the readBuffer and the writeBuffer.
 *
 * If a render target object is passed at creation time, it becomes the writeBuffer
 * and a clone is created to become the readBuffer.
 *
 * Thus if the goal is to get a texture out of the EffectComposer, it must
 * be passed at construction time. Once render is done, the caller should lookup
 * the content of the writeBuffer.
 *
 * Passes have types depending on their goal and write their output into different buffers
 *
 * - Texture Pass renders an input texture into the readBuffer
 *
 * - Shader Pass apply shader code, using optional input texture from the
 *   readBuffer and draws to the writeBuffer. Once draw is done, buffers are swapped.
 *
 *
 * Viewport Composer requires two instances of Effect Composer to deal with different sizes of
 * render targets for viewport and final scene composing.
 *
 * The first (viewportComposer) creates its internal render target itself, sizing them with the
 * viewport size. We ensure the render() call ends up with a writeBuffer ready to be used as
 * the input texture for the second composer (sceneComposer).
 *
 * The second (sceneComposer) in only consisting only in a TexturePass and a ShaderPass set up
 * with a CopyShader. Its goal is to simply copy the rendered texture into the scene target. The
 * TexturePass is getting its content from the viewportComposer writeBuffer directly.
 *
 *
 * The assumption is made that render() method is called once background and object rendering has
 * been done. Caller should have use the texture property to draw these parts into the right
 * render target.
 *
 * Also prior to render(), caller should ensure the texture is well sized (as the viewport size
 * could have changed) by calling setSize() method. Internally setting renderTarget size will only
 * have effect if it has changed so calling every frame has no real cost.
 *
 *
 * @constructor FORGE.ViewportComposer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {FORGE.Viewport} viewport - viewport reference
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.ViewportComposer = function(viewer, viewport)
{
    /**
     * The viewer reference.
     * @name FORGE.ViewportComposer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The viewport reference.
     * @name FORGE.ViewportComposer#_viewport
     * @type {FORGE.Viewport}
     * @private
     */
    this._viewport = viewport;

    /**
     * Effect composer rendering into viewport sized targets.
     * @name FORGE.ViewportComposer#_viewportComposer
     * @type {THREE.EffectComposer}
     * @private
     */
    this._viewportComposer = null;

    /**
     * Effect composer copying rendered textures into the scene target.
     * @name FORGE.ViewportComposer#_sceneComposer
     * @type {THREE.EffectComposer}
     * @private
     */
    this._sceneComposer = null;

    FORGE.BaseObject.call(this, "ViewportComposer");

    this._boot();
};

FORGE.ViewportComposer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ViewportComposer.prototype.constructor = FORGE.ViewportComposer;

/**
 * Boot sequence.
 * @method FORGE.ViewportManager#_boot
 * @private
 */
FORGE.ViewportComposer.prototype._boot = function()
{
    this._viewportComposer = new THREE.EffectComposer(this._viewer.renderer.webGLRenderer);

    for (var i=0, ii=this._viewport.fx.length; i<ii; i++)
    {
        var pass = this._viewer.fxs.getFXPassByUID(this._viewport.fx[i]);

        if (pass !== null)
        {
            this._viewportComposer.addPass(pass);
        }
    }

    // Add a final copy pass to ensure composer always ends up rendering in its write buffer
    // This is necessary if there is only a texture pass for example and only readBuffer would be filled up
    this._viewportComposer.addPass(new THREE.ShaderPass(THREE.CopyShader));

    // Create the main composer writing the rendered texture into the render target specified by the caller
    this._sceneComposer = new THREE.EffectComposer(this._viewer.renderer.webGLRenderer, this._viewport.sceneRenderer.target);
    this._sceneComposer.addPass(new THREE.TexturePass(this._viewportComposer.writeBuffer.texture));
    this._sceneComposer.addPass(new THREE.ShaderPass(THREE.CopyShader));
};

/**
 * Set size.
 * @method FORGE.ViewportComposer#setSize
 * @param {FORGE.Size} size - viewport size object
 */
FORGE.ViewportComposer.prototype.setSize = function(size)
{
    this._viewportComposer.setSize(size.width, size.height);
};

/**
 * Render routine.
 * @method FORGE.ViewportComposer#render
 */
FORGE.ViewportComposer.prototype.render = function()
{
    this._viewportComposer.render(this._viewer.clock.deltaTime);
    this._sceneComposer.render();
};

/**
 * Destroy sequence.
 * Release references, effect composers and dispose their render targets
 * paying an attention to ownership: sceneComposer should not dispose its
 * writeBuffer at it is owned by the scene object. Any other render target
 * is released.
 *
 * @method FORGE.ViewportComposer#destroy
 */
FORGE.ViewportComposer.prototype.destroy = function()
{
    this._viewportComposer.renderer = null;
    this._viewportComposer.writeBuffer.dispose();
    this._viewportComposer.writeBuffer = null;
    this._viewportComposer.readBuffer.dispose();
    this._viewportComposer.readBuffer = null;
    this._viewportComposer.renderTarget1 = null;
    this._viewportComposer.renderTarget2 = null;
    this._viewportComposer.passes = null;
    this._viewportComposer.copyPass = null;
    this._viewportComposer = null;

    this._sceneComposer.renderer = null;
    this._sceneComposer.readBuffer.dispose();
    this._sceneComposer.readBuffer = null;
    this._sceneComposer.renderTarget1 = null;
    this._sceneComposer.renderTarget2 = null;
    this._sceneComposer.passes = null;
    this._sceneComposer.copyPass = null;
    this._sceneComposer = null;

    this._viewer = null;
    this._viewport = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the input texture.
 * @name FORGE.ViewportComposer#texture
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.ViewportComposer.prototype, "texture",
{
    /** @this {FORGE.ViewportComposer} */
    get: function()
    {
        return this._viewportComposer.readBuffer;
    }
});

