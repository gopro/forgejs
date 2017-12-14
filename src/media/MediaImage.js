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
    //placeholder
    //@todo to replace the displayObject reference
    this._image = null;

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
    this._notifyLoadComplete();
};

/**
 * Method to dispatch the load complete event and set the MediaImage ready.
 * @method FORGE.MediaImage#_onLoadedMetaDataHandler
 */
FORGE.MediaImage.prototype._notifyLoadComplete = function()
{
    this._loaded = this._displayObject !== null && this._displayObject.loaded && this._preview !== null && this._preview.loaded;

    if (this._preview === null || (this._displayObject !== null && this._displayObject.loaded === false) || this._preview.loaded === false)
    {
        this._onLoadComplete.dispatch();
    }
    else if (this._viewer.renderer.backgroundRenderer !== null)
    {
        //@todo ! Ouch ! Remove this strong link between media image and the background renderer !
        this._viewer.renderer.backgroundRenderer.displayObject = this._displayObject;
    }
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

    this._displayObject = new FORGE.Image(this._viewer, imageConfig);
    this._displayObject.onLoadComplete.addOnce(this._onImageLoadComplete, this);
};

/**
 * Media image unload
 * @method FORGE.MediaImage#load
 */
FORGE.MediaImage.prototype.unload = function()
{
    if(this._displayObject !== null)
    {
        this._displayObject.destroy();
        this._displayObject = null;
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