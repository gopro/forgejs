/**
 * MediaImage class.
 *
 * @constructor FORGE.MediaImage
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input MediaImage configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.MediaImage = function(viewer, config)
{
    /**
     * The Image reference
     * @name FORGE.MediaImage#_image
     * @type {FORGE.Image}
     * @private
     */
    this._image = null;

    /**
     * The Media texture associated to this image.
     * @name FORGE.MediaImage#_texture
     * @type {FORGE.MediaTexture}
     * @private
     */
    this._texture = null;

    FORGE.Media.call(this, viewer, config, "MediaImage");
};

FORGE.MediaImage.prototype = Object.create(FORGE.Media.prototype);
FORGE.MediaImage.prototype.constructor = FORGE.MediaImage;

/**
 * Configuration parsing.
 * @method FORGE.MediaImage#_parseConfig
 * @param {SceneMediaConfig} config input MediaImage configuration
 * @private
 */
FORGE.MediaImage.prototype._parseConfig = function(config)
{
    FORGE.Media.prototype._parseConfig.call(this, config);

    if (this._source === null)
    {
        return;
    }

    // If no format is specified, set default format as flat
    if (this._source.format === "undefined")
    {
        this._source.format = FORGE.MediaFormat.FLAT;
    }

    var preview = this._preview;

    // Load the preview
    if (preview !== null)
    {
        if (typeof preview === "string")
        {
            preview = { url: preview };
        }

        var re = /\{[lfxy].*\}/;
        if (preview.url.match(re) !== null)
        {
            this._preview = /** @type {SceneMediaPreviewConfig} */ (preview);
        }
        else if (this._source.format === FORGE.MediaFormat.EQUIRECTANGULAR ||
            this._source.format === FORGE.MediaFormat.CUBE ||
            this._source.format === FORGE.MediaFormat.FLAT)
        {
            var previewConfig =
            {
                key: this._uid + "-preview",
                url: preview.url
            };

            this._preview = new FORGE.Image(this._viewer, previewConfig);
            this._preview.onLoadComplete.addOnce(this._onImageLoadComplete, this);
        }
    }
};

/**
 * Internal handler on image ready.
 * @method FORGE.MediaImage#_onImageLoadComplete
 * @private
 */
FORGE.MediaImage.prototype._onImageLoadComplete = function()
{
    this._texture = new FORGE.MediaTexture(this._image);

    this._notifyLoadComplete();
};

/**
 * Media image load
 * @method FORGE.MediaImage#load
 */
FORGE.MediaImage.prototype.load = function()
{
    var imageConfig =
    {
        key: this._uid,
        url: this._source.url
    };

    this._image = new FORGE.Image(this._viewer, imageConfig);
    this._image.onLoadComplete.addOnce(this._onImageLoadComplete, this);
};

/**
 * Media image unload
 * @method FORGE.MediaImage#load
 */
FORGE.MediaImage.prototype.unload = function()
{
    if(this._image !== null)
    {
        this._image.destroy();
        this._image = null;
    }

    if(this._texture !== null)
    {
        this._texture.destroy();
        this._texture = null;
    }

    FORGE.Media.prototype.unload.call(this);
};

/**
 * MediaImage destroy sequence
 * @method FORGE.MediaImage#destroy
 */
FORGE.MediaImage.prototype.destroy = function()
{
    this.unload();

    FORGE.Media.prototype.destroy.call(this);
};

/**
 * Get the image
 * @name FORGE.MediaImage#image
 * @type {FORGE.Image}
 * @readonly
 */
Object.defineProperty(FORGE.MediaImage.prototype, "image",
{
    /** @this {FORGE.MediaImage} */
    get: function()
    {
        return this._image;
    }
});

/**
 * Get the displayObject
 * @name FORGE.MediaImage#displayObject
 * @type {FORGE.Image}
 * @readonly
 */
Object.defineProperty(FORGE.MediaImage.prototype, "displayObject",
{
    /** @this {FORGE.MediaImage} */
    get: function()
    {
        return this._image;
    }
});

/**
 * Get the texture
 * @name FORGE.MediaImage#texture
 * @type {FORGE.MediaTexture}
 * @readonly
 */
Object.defineProperty(FORGE.MediaImage.prototype, "texture",
{
    /** @this {FORGE.MediaImage} */
    get: function()
    {
        return this._texture;
    }
});