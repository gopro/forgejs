/**
 * FORGE.BackgroundTextureRenderer
 * BackgroundTextureRenderer class.
 *
 * @constructor FORGE.BackgroundTextureRenderer
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 * @param {string=} type - The type of the object as long as many other object inherits from this one.
 * @extends {FORGE.BackgroundRenderer}
 */
FORGE.BackgroundTextureRenderer = function(sceneRenderer, type)
{
    /**
     * Texture used for video rendering
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

    /**
     * Background rendering media source
     * Can be either a media element (image, video, canvas) or a MediaStore if the media is tiled for example
     * @name FORGE.BackgroundRenderer#_mediaSource
     * @type {HTMLMediaElement|FORGE.MediaStore}
     * @private
     */
    this._mediaSource = null;

    /**
     * Background rendering media source
     * Can be either a media element (image, video, canvas) or a MediaStore if the media is tiled for example
     * @name FORGE.BackgroundTextureRenderer#_mediaSource
     * @type {HTMLMediaElement}
     * @private
     */
    this._displayObject = null;

    FORGE.BackgroundRenderer.call(this, sceneRenderer, type || "BackgroundTextureRenderer");
};

FORGE.BackgroundTextureRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundTextureRenderer.prototype.constructor = FORGE.BackgroundTextureRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundTextureRenderer#_boot
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    this._displayObject = this._media.displayObject;

    if (this._displayObject === null)
    {
        return;
    }

    if ("onQualityChange" in this._displayObject)
    {
        this._displayObject.onQualityChange.add(this._onVideoQualityChanged, this);
    }

    this._mediaSource = this._sceneRenderer.media.displayObject.element;
};

/**
 * Create texture
 * @method FORGE.BackgroundTextureRenderer#_createTexture
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._createTexture = function()
{
    if (this._displayObject === null)
    {
        return;
    }

    if (this._texture !== null)
    {
        this._texture.dispose();   
    }

    this._texture = new THREE.Texture();
    this._texture.needsUpdate = true;

    this._texture.format = THREE.RGBFormat;
    this._texture.mapping = THREE.Texture.DEFAULT_MAPPING;
    this._texture.magFilter = THREE.LinearFilter;
    this._texture.wrapS = THREE.ClampToEdgeWrapping;
    this._texture.wrapT = THREE.ClampToEdgeWrapping;

    if (FORGE.Math.isPowerOfTwo(this._displayObject.width) &&
        FORGE.Math.isPowerOfTwo(this._displayObject.height))
    {
        // Enable mipmaps for flat rendering to avoid aliasing
        this._texture.generateMipmaps = true;
        this._texture.minFilter = THREE.LinearMipMapLinearFilter;
    }
    else
    {
        this._texture.generateMipmaps = false;
        this._texture.minFilter = THREE.LinearFilter; 
    }

    if (FORGE.Utils.isTypeOf(this._displayObject, "Image") || FORGE.Utils.isTypeOf(this._displayObject, "Canvas"))
    {
        this._texture.image = this._displayObject.element;
    }
    else if (FORGE.Utils.isTypeOf(this._displayObject, ["VideoHTML5", "VideoDash"]))
    {
        // Evil hack from Hell
        // Reduce texture size for big videos on safari
        if (FORGE.Device.browser.toLowerCase() === "safari" && this._displayObject.originalHeight > 1440)
        {
            this._videoReductionFactor = 2;
        }

        this._textureCanvas = document.createElement("canvas");
        this._textureCanvas.width = this._displayObject.originalWidth / this._videoReductionFactor;
        this._textureCanvas.height = this._displayObject.originalHeight / this._videoReductionFactor;
        this._textureContext = this._textureCanvas.getContext("2d");
        this._texture = new THREE.Texture(this._textureCanvas);
    }
    else
    {
        throw "Wrong type of display object " + this._displayObject.type;
    }
};

/**
 * Handler of media quality change event
 * @method FORGE.BackgroundTextureRenderer#_onVideoQualityChanged
 * @private
 */
FORGE.BackgroundTextureRenderer.prototype._onVideoQualityChanged = function(event)
{
    this.log("Video quality has changed");

    var displayObject = event.emitter;
    this._textureCanvas.width = displayObject.originalWidth / this._videoReductionFactor;
    this._textureCanvas.height = displayObject.originalHeight / this._videoReductionFactor;
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderer} webGLRenderer THREE WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundTextureRenderer#render
 */
FORGE.BackgroundTextureRenderer.prototype.render = function(webGLRenderer, target)
{
    // doesn't refresh when there is no texture or texture container and when a video as WebGL texture is paused
    if (!(this._displayObject === null ||
        this._texture === null || this._textureCanvas === null ||
        this._textureContext === null ||
        this._displayObject.element === null ||
        (FORGE.Utils.isTypeOf(this._displayObject, ["VideoHTML5", "VideoDash"]) === true && this._displayObject.playing === false)))
    {
        var video = this._displayObject.element;
        if (video instanceof HTMLVideoElement && video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
        {
            if (this._textureContext)
            {
                this._textureContext.drawImage(video,
                    0, 0, video.videoWidth, video.videoHeight,
                    0, 0, this._textureCanvas.width, this._textureCanvas.height);
                this._texture.needsUpdate = true;
                this.log("texture update done");
            }
        }
    }

    FORGE.BackgroundRenderer.prototype.render.call(this, webGLRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundTextureRenderer#destroy
 */
FORGE.BackgroundTextureRenderer.prototype.destroy = function()
{
    this._displayObject.onQualityChange.remove(this._onVideoQualityChanged, this);

    this._displayObject = null;
    this._textureCanvas = null;
    this._textureContext = null;

    if (this._texture !== null && this._texture instanceof THREE.Texture)
    {
        this._texture.dispose();
    }
    this._texture = null;

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get texture size.
 * @name FORGE.BackgroundTextureRenderer#textureSize
 * @type {FORGE.Size}
 */
Object.defineProperty(FORGE.BackgroundTextureRenderer.prototype, "textureSize",
{
    /** @this {FORGE.BackgroundTextureRenderer} */
    get: function()
    {
        if (this._texture === null || typeof this._texture.image === "undefined")
        {
            return null;
        }

        return new FORGE.Size(this._texture.image.width, this._texture.image.height);
    }
});

