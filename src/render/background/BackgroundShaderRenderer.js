/**
 * FORGE.BackgroundShaderRenderer
 * BackgroundShaderRenderer class.
 *
 * @constructor FORGE.BackgroundShaderRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.WebGLRenderTarget} target - render target
 * @param {SceneMediaOptionsConfig} options - the options for the cubemap
 * @extends {FORGE.BackgroundRenderer}
 */
FORGE.BackgroundShaderRenderer = function(viewer, target, options)
{
    /**
     * Display object (image, canvas or video)
     * @name FORGE.BackgroundShaderRenderer#_displayObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._displayObject = null;

    /**
     * Texture used for video rendering
     * @name FORGE.BackgroundShaderRenderer#_texture
     * @type {THREE.Texture}
     * @private
     */
    this._texture = null;

    /**
     * Texture canvas used for video rendering
     * @name FORGE.BackgroundShaderRenderer#_textureCanvas
     * @type {Element|HTMLCanvasElement}
     * @private
     */
    this._textureCanvas = null;

    /**
     * Texture context associated with texture canvas
     * @name FORGE.BackgroundShaderRenderer#_textureContext
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._textureContext = null;

    /**
     * When source is a video, a reduction factor can be set to improve perf by lowering quality
     * @name FORGE.BackgroundShaderRenderer#_videoReductionFactor
     * @type {number}
     * @private
     */
    this._videoReductionFactor = 1;

    FORGE.BackgroundRenderer.call(this, viewer, target, options, "BackgroundShaderRenderer");
};

FORGE.BackgroundShaderRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundShaderRenderer.prototype.constructor = FORGE.BackgroundShaderRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundShaderRenderer#_boot
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    // Finalize now
    this._updateInternals();

    // Set orthographic camera
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    // Debug: attach scene to window context to expose it into Three.js Inspector
    // window.scene = this._scene;
};

/**
 * Set display object.
 * @method FORGE.BackgroundShaderRenderer#_setDisplayObject
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._setDisplayObject = function(displayObject)
{
    this._displayObject = displayObject;

    if (FORGE.Utils.isTypeOf(displayObject, "Image") || FORGE.Utils.isTypeOf(displayObject, "Canvas"))
    {
        this._texture = new THREE.Texture();
        this._texture.image = displayObject.element;
    }
    else if (FORGE.Utils.isTypeOf(displayObject, ["VideoHTML5", "VideoDash"]))
    {
        // Evil hack from Hell
        // Reduce texture size for big videos on safari
        if (FORGE.Device.browser.toLowerCase() === "safari" && displayObject.originalHeight > 1440)
        {
            this._videoReductionFactor = 2;
        }

        if (this._displayObject.onQualityChange.has(this._mediaQualityChangeHandler, this))
        {
            this._displayObject.onQualityChange.remove(this._mediaQualityChangeHandler, this);
        }

        this._displayObject.onQualityChange.add(this._mediaQualityChangeHandler, this);

        this._textureCanvas = document.createElement("canvas");
        this._textureCanvas.width = displayObject.originalWidth / this._videoReductionFactor;
        this._textureCanvas.height = displayObject.originalHeight / this._videoReductionFactor;
        this._textureContext = this._textureCanvas.getContext("2d");
        this._texture = new THREE.Texture(this._textureCanvas);
    }
    else
    {
        throw "Wrong type of display object " + displayObject.className;
    }

    this._texture.format = THREE.RGBFormat;
    this._texture.mapping = THREE.Texture.DEFAULT_MAPPING;
    this._texture.magFilter = THREE.LinearFilter;
    this._texture.wrapS = THREE.ClampToEdgeWrapping;
    this._texture.wrapT = THREE.ClampToEdgeWrapping;

    this._texture.generateMipmaps = false;
    this._texture.minFilter = THREE.LinearFilter;

    if (this._mediaFormat === FORGE.MediaFormat.FLAT &&
        FORGE.Math.isPowerOfTwo(displayObject.width) && FORGE.Math.isPowerOfTwo(displayObject.height))
    {
        // Enable mipmaps for flat rendering to avoid aliasing
        this._texture.generateMipmaps = true;
        this._texture.minFilter = THREE.LinearMipMapLinearFilter;
    }

    this._texture.needsUpdate = true;

    this._mesh.material.uniforms.tTexture.value = this._texture;

    if (this._mesh.material.uniforms.hasOwnProperty("tTextureRatio"))
    {
        this._mesh.material.uniforms.tTextureRatio.value = this._texture.image.width / this._texture.image.height;
    }

    if (this._mesh.material.uniforms.hasOwnProperty("tTextureSize"))
    {
        this._mesh.material.uniforms.tTextureSize.value = new THREE.Vector2(this._texture.image.width, this._texture.image.height);
    }
};

/**
 * Handler of media quality change event
 * @method FORGE.BackgroundShaderRenderer#_mediaQualityChangeHandler
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._mediaQualityChangeHandler = function(event)
{
    this.log("Media quality has changed");

    var displayObject = event.emitter;
    this._textureCanvas.width = displayObject.originalWidth / this._videoReductionFactor;
    this._textureCanvas.height = displayObject.originalHeight / this._videoReductionFactor;
};

/**
 * Update internals
 * @method FORGE.BackgroundShaderRenderer#_updateInternals
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._updateInternals = function()
{
    var shaderSTW = this._viewer.renderer.view.current.shaderSTW;

    var vertexShader = FORGE.ShaderLib.parseIncludes(shaderSTW.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shaderSTW.fragmentShader);

    var material = new THREE.ShaderMaterial({
        uniforms: /** @type {FORGEUniform} */ (shaderSTW.uniforms),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.FrontSide
    });

    if (this._texture !== null)
    {
        material.uniforms.tTexture.value = this._texture;
    }

    if (this._scene.children.length === 0)
    {
        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        this._mesh = new THREE.Mesh(geometry, material);
        this._scene.add(this._mesh);
    }
    else
    {
        this._mesh = /** @type {THREE.Mesh} */ (this._scene.children[0]);
        this._mesh.material = null;
    }

    this._mesh.material = material;
    material.needsUpdate = true;
};

/**
 * Clear background.
 * @method FORGE.BackgroundShaderRenderer#clear
 * @private
 */
FORGE.BackgroundShaderRenderer.prototype._clear = function()
{
    // Draw to clear screen, then clear display object / texture
    this._viewer.renderer.webGLRenderer.clearColor();
};

/**
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundShaderRenderer#render
 * @param {?THREE.PerspectiveCamera} camera perspective camera
 */
FORGE.BackgroundShaderRenderer.prototype.render = function(camera)
{
    if (this._viewer.renderer === null)
    {
        return;
    }

    camera = null; //@closure

    FORGE.BackgroundRenderer.prototype.render.call(this, camera);
};

/**
 * Update after view change
 * @method FORGE.BackgroundShaderRenderer#updateAfterViewChange
 */
FORGE.BackgroundShaderRenderer.prototype.updateAfterViewChange = function()
{
    this._updateInternals();

    if (this._texture !== null && typeof this._texture.image !== "undefined")
    {
        if (this._mesh.material.uniforms.hasOwnProperty("tTextureRatio"))
        {
            this._mesh.material.uniforms.tTextureRatio.value = this._texture.image.width / this._texture.image.height;
        }

        if (this._mesh.material.uniforms.hasOwnProperty("tTextureSize"))
        {
            this._mesh.material.uniforms.tTextureSize.value = new THREE.Vector2(this._texture.image.width, this._texture.image.height);
        }
    }
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundShaderRenderer#destroy
 */
FORGE.BackgroundShaderRenderer.prototype.destroy = function()
{
    this._clear();

    if (typeof this._displayObject.onQualityChange !== "undefined" &&
        this._displayObject.onQualityChange.has(this._mediaQualityChangeHandler, this))
    {
        this._displayObject.onQualityChange.remove(this._mediaQualityChangeHandler, this);
    }

    this._displayObject = null;
    this._textureCanvas = null;
    this._textureContext = null;

    if (this._texture !== null)
    {
        this._texture.dispose();
        this._texture = null;
    }

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get background renderer texture.
 * @name FORGE.BackgroundShaderRenderer#texture
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundShaderRenderer.prototype, "texture",
{
    /** @this {FORGE.BackgroundShaderRenderer} */
    get: function()
    {
        return this._texture;
    }
});