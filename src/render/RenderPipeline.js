/**
 * FXComposer class.
 *
 * @constructor FORGE.RenderPipeline
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.RenderPipeline = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.RenderPipeline#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Render composer
     * @name FORGE.RenderPipeline#_renderComposer
     * @type {FORGE.EffectComposer}
     * @private
     */
    this._renderComposer = null;

    /**
     * Sub composers array, created for each pass including texture/render + some shaders
     * @name FORGE.RenderPipeline#_subComposers
     * @type {Array<FORGE.EffectComposer>}
     * @private
     */
    this._subComposers = null;

    /**
     * Internal clock used to feed time to effect shaders
     * @name FORGE.RenderPipeline#_clock
     * @type {THREE.Clock}
     * @private
     */
    this._clock = null;

    /**
     * Enabled status flag
     * @name FORGE.RenderPipeline#_enabled
     * @type boolean
     * @private
     */
    this._enabled = true;

    FORGE.BaseObject.call(this, "RenderPipeline");

    this._boot();
};

FORGE.RenderPipeline.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.RenderPipeline.prototype.constructor = FORGE.RenderPipeline;

/**
 * Boot sequence
 * @method FORGE.RenderPipeline#_boot
 * @private
 */
FORGE.RenderPipeline.prototype._boot = function()
{
    this._clock = new THREE.Clock();
    this._subComposers = [];

    this._renderComposer = new FORGE.EffectComposer(FORGE.EffectComposerType.MAIN, this._viewer.renderer.webGLRenderer);
};

/**
 * Get pass type of a THREE.Pass
 * @method FORGE.RenderPipeline#_getPassType
 * @param {THREE.Pass} pass - THREE pass object
 * @private
 * @return {string} - Returns the pass type.
 */
FORGE.RenderPipeline.prototype._getPassType = function(pass)
{
    if (pass instanceof FORGE.TexturePass)
    {
        if (pass.hasOwnProperty("map"))
        {
            var uid = pass.map.uuid.split("-")[0].slice(0, 4);
            return "Texture(" + uid + ")";
        }
        return "Texture";
    }

    if (pass instanceof FORGE.RenderPass)
    {
        return "Render";
    }

    if (pass instanceof THREE.ClearMaskPass)
    {
        return "ClearMask";
    }

    if (pass instanceof THREE.MaskPass)
    {
        return "Mask";
    }

    if (pass instanceof FORGE.ShaderPass)
    {
        return "Shader(" + pass.type.replace("Shader", "") + ")";
    }

    return "Pass";
};

/**
 * Dump some effect composer to console output
 * @method FORGE.RenderPipeline#_dumpComposer
 * @param {FORGE.EffectComposer} composer - The effect composer to dump
 * @private
 */
FORGE.RenderPipeline.prototype._dumpComposer = function(composer)
{
    this.log("COMPOSER: " + composer.name);

    if (composer.passes.length === 0 )
    {
        return;
    }

    var types = [];
    var typesLength = 0;

    for (var i = 0, ii = composer.passes.length; i < ii; i++)
    {
        var typei = this._getPassType(composer.passes[i]);
        types.push(typei);
        typesLength += typei.length;
    }

    // Header/Footer
    var hdft = "";
    for (var j = 0, jj = types.length; j < jj; j++)
    {
        var type = types[j];

        hdft += "| ";
        for (var m=0; m<type.length; m++)
        {
            hdft += "-";
        }
        hdft += " |";

        if (j < jj - 1)
        {
            for (var l=0; l<5; l++)
            {
                hdft += " ";
            }
        }
    }

    // Header
    this.log(hdft);

    // Types
    var line = "";
    for (var k = 0, kk = types.length; k < kk; k++)
    {
        var typek = types[k];
        line += "| " + typek + " |";
        if (k < kk - 1)
        {
            line += " --- ";
        }
    }

    // Add composer output texture to the line if not render to screen
    if (composer.passes[composer.passes.length - 1].renderToScreen === false)
    {
        line += " --- tex";
        if (composer.readBuffer !== null && typeof composer.readBuffer.name !== "undefined")
        {
            line += "(" + composer.readBuffer.name + ")";
        };
        // line += " --- tex";
    }

    this.log(line);

    // Footer
    this.log(hdft);
};

/**
 * Dump whole composing pipeline to console output
 * @method FORGE.RenderPipeline#_dumpPipeline
 * @private
 */
FORGE.RenderPipeline.prototype._dumpPipeline = function()
{
    for (var i = 0, ii = this._subComposers.length; i < ii; i++)
    {
        var composer = this._subComposers[i];
        this._dumpComposer(composer);
    }

    this._dumpComposer(this._renderComposer);
};

/**
 * Add a subcomposer to compositing pipeline
 * Add subcomposer to inner list and add a texture pass drawing subcomposer output
 * @method FORGE.RenderPipeline#_addSubComposer
 * @param {FORGE.EffectComposer} subComposer - new effect composer
 * @param {boolean} renderToTarget - subcomposer should render to target
 * @private
 */
FORGE.RenderPipeline.prototype._addSubComposer = function(subComposer, renderToTarget)
{
    // Add a ForgeJS object into subcomposer to set some private properties
    this._subComposers.push(subComposer);

    if (renderToTarget === false)
    {
        var additionPass = new FORGE.AdditionPass(subComposer);
        this._renderComposer.addPass(additionPass);
    }

    this._updateRenderPipeline();
};

/**
 * Add shader passes to an effect composer
 * @method FORGE.RenderPipeline#_addShaderPasses
 * @param {FORGE.EffectComposer} composer - effect composer
 * @param {Array<THREE.Pass>|THREE.Pass} passes - pass or array of passes to be added to the composer
 * @param {number=} index - index where passes should be inserted
 * @private
 */
FORGE.RenderPipeline.prototype._addShaderPasses = function(composer, passes, index)
{
    index = typeof index !== "undefined" ? index : composer.passes.length;

    if (Array.isArray(passes))
    {
        for (var i = passes.length - 1; i >= 0; i--)
        {
            var shaderPass = passes[i];
            composer.insertPass(shaderPass, index);
        }
    }
    else if (passes instanceof THREE.Pass)
    {
        var shaderThreePass = passes;
        composer.insertPass(shaderThreePass, index);
    }
};

/**
 * Change status of all shader passes in a composer
 * @method FORGE.RenderPipeline#_setComposerShaderPassesStatus
 * @param {FORGE.EffectComposer} composer - effect composer.
 * @param {boolean} status - The status you want to set.
 * @private
 */
FORGE.RenderPipeline.prototype._setComposerShaderPassesStatus = function(composer, status)
{
    if (status === false)
    {
        this._enabled = false;
    }

    for (var i = composer.passes.length - 1; i >= 0; i--)
    {
        var pass = composer.passes[i];

        // Enable/disable shader passes except for Addition passes
        if (pass instanceof THREE.ShaderPass)
        {
            if (pass instanceof FORGE.AdditionPass)
            {
                continue;
            }

            pass.enabled = status;
        }
    }

    if (composer.hasOwnProperty("enabled"))
    {
        composer.enabled = status;
    }

    this._updateRenderPipeline();
};

/**
 * Set all shader passes status
 * @method FORGE.RenderPipeline#_setAllShaderPassesStatus
 * @param {boolean} status - new shader passes status.
 * @private
 */
FORGE.RenderPipeline.prototype._setAllShaderPassesStatus = function(status)
{
    var composers = this._subComposers.concat(this._renderComposer);

    for (var i = 0, ii = composers.length; i < ii; i++)
    {
        var composer = composers[i];
        this._setComposerShaderPassesStatus(composer, status);
    }

    this._enabled = status;
};

/**
 * Update rendering pipeline
 * Called whenever pipeline has changed to optimize the render stream.
 * @method FORGE.RenderPipeline#_updateRenderPipeline
 * @private
 */
FORGE.RenderPipeline.prototype._updateRenderPipeline = function()
{
    // First check render composer order
    // background passes --> render passes --> global passes
    var passes = this._renderComposer.passes;

    // Collect background passes in reverse order and reinsert them at zero index
    var backgrounds = [];

    passes.filter(function(element, index) //array
    {
        if (element.position === FORGE.PassPosition.BACKGROUND)
        {
            backgrounds.push(index);
        }
    });

    if (backgrounds.length > 0 && backgrounds[0] > 0)
    {
        var bgdPasses = [];

        for (var i = backgrounds.length - 1; i >= 0; i--)
        {
            var index = backgrounds[i];
            var passi = passes.splice(index, 1)[0];
            bgdPasses.push(passi);
        }

        for (var j = 0, jj = bgdPasses.length; j < jj; j++)
        {
            this._renderComposer.insertPass(bgdPasses[j], 0);
        }
    }

    // Collect global passes in normal order and reinsert them at the end
    var globals = [];
    passes.filter(function(element, index) //array
    {
        if (element.position === FORGE.PassPosition.GLOBAL)
        {
            globals.push(index);
        }
    });

    // Check if last global pass is at the end of passes array
    if (globals.length > 0 && globals[globals.length - 1] < passes.length - 1)
    {
        var globalPasses = [];

        for (var k = 0, kk = globals.length; k < kk; k++)
        {
            var indexk = globals[k];
            var passk = passes.splice(indexk, 1)[0];
            globalPasses.push(passk);
        }

        for (var l = 0, ll = globalPasses.length; l < ll; l++)
        {
            var passl = globalPasses[l];
            this._renderComposer.addPass(passl);
        }
    }

    // Only first pass of each composer should clear the target
    for (var m = 0, mm = this._subComposers.length; m < mm; m++)
    {
        var composer = this._subComposers[m];

        // First check if a composer share a target with another one
        // Then only the first should clear the target
        var sharingTarget = false;
        var s, ss = this._subComposers.length;
        for (s = 0; s < ss; s++)
        {
            if (s === m)
            {
                continue;
            }

            var anotherComposer = this._subComposers[s];
            if (composer.readBuffer === anotherComposer.readBuffer)
            {
                sharingTarget = true;
                break;
            }
        }
        sharingTarget = sharingTarget && (m > s);

        for (var n = 0, nn = composer.passes.length; n < nn; n++)
        {
            var passn = composer.passes[n];

            // If sharing target with a previous subcomposer, force clear to false
            if (sharingTarget === true)
            {
                passn.clear = false;
            }
            else
            {
                passn.clear = (n === 0);
            }
        }

    }

    // Only last enabled pass of render composer should render to screen
    var rts = false;
    for (var p = passes.length - 1; p >= 0; p--)
    {
        var passp = passes[p];

        if (rts === true)
        {
            passp.renderToScreen = false;
        }
        else if (passp.enabled === true)
        {
            passp.renderToScreen = true;
            rts = true;
        }
    }

    this._dumpPipeline();
};

/**
 * Setup default background texture pass.
 * @method FORGE.RenderPipeline#_setupDefaultBackground.
 * @private
 */
FORGE.RenderPipeline.prototype._setupDefaultBackground = function()
{
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var defaultTexture = new THREE.TextureLoader().load(canvas.toDataURL());
    defaultTexture.name = "forge-default-texture";

    this.addBackground(defaultTexture, null, 0);
};

/**
 * Set all render passes camera.
 * @method FORGE.RenderPipeline#_setAllRenderPassCamera.
 * @param {THREE.Camera} camera render pass camera.
 * @private
 */
FORGE.RenderPipeline.prototype._setAllRenderPassCamera = function(camera)
{
    var composers = this._subComposers.concat(this._renderComposer);

    for (var i = 0, ii = composers.length; i < ii; i++)
    {
        var composer = composers[i];

        for (var j=0, jj=composer.passes.length; j<jj; j++)
        {
            var pass = composer.passes[j];

            if (pass instanceof FORGE.RenderPass)
            {
                pass.camera = camera;
            }
        }
    }
};

/**
 * Enable/Disable picking.
 * @method FORGE.RenderPipeline#enablePicking
 * @param {boolean} status new picking state
 * @param {THREE.Material=} material picking material
 * @param {THREE.WebGLRenderTarget=} renderTarget picking render target
 */
FORGE.RenderPipeline.prototype.enablePicking = function(status, material, renderTarget)
{
    for (var i = 0, ii = this._subComposers.length; i < ii; i++)
    {
        var composer = this._subComposers[i];
        if (composer.type === FORGE.EffectComposerType.PICKING)
        {
            composer.enabled = status;

            if (typeof material !== "undefined")
            {
                composer.passes[0].overrideMaterial = material;
            }

            if (typeof renderTarget !== "undefined")
            {
                composer.renderTarget = renderTarget;
            }
        }
    }
};

/**
 * Add background to the rendering pipeline.
 * @method FORGE.RenderPipeline#addBackground
 * @param {THREE.Texture} texture texture object used as background.
 * @param {Array<FX>} fxSet image fx set to apply to background only.
 * @param {number=} opacity texture pass opacity
 */
FORGE.RenderPipeline.prototype.addBackground = function(texture, fxSet, opacity)
{
    // Background addition will be an insertion of all passes at index 0
    // First we add all shaders passes in reverse order at index 0
    // Then we insert the texture pass so everything ends up in the right order

    if (typeof fxSet !== "undefined" && fxSet !== null && fxSet.length > 0)
    {
        var shaderPasses = this._viewer.postProcessing.parseShaderPasses(fxSet);

        for (var i = 0, ii = shaderPasses.length; i < ii; i++)
        {
            var pass = shaderPasses[i];
            pass.position = FORGE.PassPosition.BACKGROUND;
        }

        this._addShaderPasses(this._renderComposer, shaderPasses, 0);
    }

    var texturePass = new FORGE.TexturePass(texture, opacity);
    texturePass.position = FORGE.PassPosition.BACKGROUND;

    this._renderComposer.insertPass(texturePass, 0);

    this._updateRenderPipeline();
};

/**
 * Add render scenes to the rendering pipeline
 * @method FORGE.RenderPipeline#addRenderScenes
 * @param {Array<FORGE.RenderScene>} renderScenes array of render scenes
 */
FORGE.RenderPipeline.prototype.addRenderScenes = function(renderScenes)
{
    for (var i = 0, ii = renderScenes.length; i < ii; i++)
    {
        this._addSubComposer(renderScenes[i].sceneComposer, false);
        this._addSubComposer(renderScenes[i].pickingComposer, true);
    }

    this._updateRenderPipeline();
};

/**
 * Add fx at the end of the whole rendering pipeline
 * @method FORGE.RenderPipeline#addGlobalFx
 * @param {Array<FX>} fxSet set of effects
 */
FORGE.RenderPipeline.prototype.addGlobalFx = function(fxSet)
{
    var shaderPasses = this._viewer.postProcessing.parseShaderPasses(fxSet);

    for (var i = 0, ii = shaderPasses.length; i < ii; i++)
    {
        var pass = shaderPasses[i];
        pass.position = FORGE.PassPosition.GLOBAL;
    }

    this._addShaderPasses(this._renderComposer, shaderPasses);
    this._updateRenderPipeline();
};

/**
 * Get a shader pass with an UID
 * @method FORGE.RenderPipeline#getShaderPassByUID
 * @param {string} uid - the uid of the ShaderPass
 * @return {THREE.Pass} shader pass
 */
FORGE.RenderPipeline.prototype.getShaderPassByUID = function(uid)
{
    if (this._renderComposer !== null)
    {
        for (var i = 0, ii = this._renderComposer.passes.length; i < ii; i++)
        {
            var pass = this._renderComposer.passes[i];

            if (pass.uid === uid)
            {
                return pass;
            }
        }
    }

    if (this._subComposers !== null)
    {
        for (var k = 0, kk = this._subComposers.length; k < kk; k++)
        {
            var composer = this._subComposers[k];

            for (var j = 0, jj = composer.passes.length; j < jj; j++)
            {
                var subPass = composer.passes[j];

                if (subPass.uid === uid)
                {
                    return subPass;
                }
            }
        }
    }

    return null;
};

/**
 * Set size of each composers
 * @method FORGE.RenderPipeline#setSize
 * @param {FORGE.Size} size new composer size
 */
FORGE.RenderPipeline.prototype.setSize = function(size)
{
    for (var i = 0, ii = this._subComposers.length; i < ii; i++)
    {
        var composer = this._subComposers[i];
        composer.setSize(size.width, size.height);

        for (var c = 0, cc = composer.passes.length; c < cc; c++)
        {
            var pass = composer.passes[c];

            if (pass instanceof THREE.ShaderPass)
            {
                if (typeof pass.uniforms.resolution !== "undefined")
                {
                    pass.uniforms.resolution.value = new THREE.Vector2(1 / size.width, 1 / size.height);
                }
            }
        }
    }

    this._renderComposer.setSize(size.width, size.height);

    for (var c = 0, cc = this._renderComposer.passes.length; c < cc; c++)
    {
        var pass = this._renderComposer.passes[c];

        if (pass instanceof THREE.ShaderPass)
        {
            if (typeof pass.uniforms.resolution !== "undefined")
            {
                pass.uniforms.resolution.value = new THREE.Vector2(1 / size.width, 1 / size.height);
            }
        }
    }
};

/**
 * Render routine
 *
 * @method FORGE.RenderPipeline#render
 * @param {THREE.PerspectiveCamera} camera - The camera to use for render.
 */
FORGE.RenderPipeline.prototype.render = function(camera)
{
    if (this._renderComposer === null)
    {
        return;
    }

    // Create default texture and use it if there is no texture in background
    if (!(this._renderComposer.passes[0] instanceof FORGE.TexturePass))
    {
        this._setupDefaultBackground();
    }

    for (var i = 0, ii = this._renderComposer.passes.length; i < ii; i++)
    {
        var pass = this._renderComposer.passes[i];
        if (pass instanceof FORGE.AdditionPass)
        {
            // Pick right buffer as texture provider for addition pass
            var composer = pass.composer;
            var lastPass = composer.passes[composer.passes.length - 1];

            // Addition pass will blend readbuffer content unless last pass needs swap (ShaderPass for example)
            var texture = composer.readBuffer.texture;

            if (typeof lastPass !== "undefined" && lastPass.needsSwap === true)
            {
                texture = composer.writeBuffer.texture;
            }

            pass.uniforms["tAdd"].value = texture;
        }
    }

    var delta = this._clock.getDelta();

    this._setAllRenderPassCamera(camera);

    for (var j = 0, jj = this._subComposers.length; j < jj; j++)
    {
        if (this._subComposers[j].enabled)
        {
            this._subComposers[j].render(delta);
        }
    }

    this._renderComposer.render(delta);
};

/**
 * Clear composer components
 * @method FORGE.RenderPipeline#clear
 */
FORGE.RenderPipeline.prototype.clear = function()
{
    if (this._renderComposer !== null)
    {
        this._renderComposer.readBuffer.dispose();
        this._renderComposer.writeBuffer.dispose();

        for (var i = 0, ii = this._renderComposer.passes.length; i < ii; i++)
        {
            var pass = this._renderComposer.passes[i];
            if (pass instanceof FORGE.ShaderPass && pass.uniforms.hasOwnProperty("tAdd"))
            {
                pass.uniforms["tAdd"].value = null;
            }
        }

        this._renderComposer.passes = [];
    }

    this._subComposers = [];
};

/**
 * Destroy sequence
 * @method FORGE.RenderPipeline#destroy
 */
FORGE.RenderPipeline.prototype.destroy = function()
{
    this.clear();
    this._clock = null;

    for (var i = this._subComposers.length - 1; i > 0; i--)
    {
        var composer = this._subComposers[i];

        for (var j=0, jj=composer.passes.length; j<jj; j++)
        {
            var pass = composer.passes[j];

            if (typeof pass.destroy === "function")
            {
                pass.destroy();
            }
        }
        composer.passes.length = 0;
    }
    this._subComposers = null;

    for (var j=0, jj=this._renderComposer.passes.length; j<jj; j++)
    {
        var pass = this._renderComposer.passes[j];

        if (typeof pass.destroy === "function")
        {
            pass.destroy();
        }
    }
    this._renderComposer.passes.length = 0;
    this._renderComposer = null;

    this._viewer = null;
};

/**
 * FX pipeline status.
 * @name FORGE.RenderPipeline#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.RenderPipeline.prototype, "enabled",
{
    /** @this {FORGE.RenderPipeline} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.RenderPipeline} */
    set: function(status)
    {
        this._setAllShaderPassesStatus(status);
    }
});
