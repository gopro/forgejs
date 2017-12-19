/**
 * MediaTiled class.
 *
 * @constructor FORGE.MediaTiled
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneMediaConfig} config input MediaTiled configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.MediaTiled = function(viewer, config)
{
    this._store = null;

    FORGE.Media.call(this, viewer, config, "MediaTiled");
};

FORGE.MediaTiled.prototype = Object.create(FORGE.Media.prototype);
FORGE.MediaTiled.prototype.constructor = FORGE.MediaTiled;

/**
 * Configuration parsing.
 * @method FORGE.MediaTiled#_parseConfig
 * @param {SceneMediaConfig} config input MediaTiled configuration
 * @private
 */
FORGE.MediaTiled.prototype._parseConfig = function(config)
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
 * Method to dispatch the load complete event and set the MediaTiled ready.
 * @method FORGE.MediaTiled#_onLoadedMetaDataHandler
 */
FORGE.MediaTiled.prototype._notifyLoadComplete = function()
{
    if (this._store !== null)
    {
        this._loaded = true;
        this._onLoadComplete.dispatch();
    }
};



FORGE.MediaTiled.prototype.load = function()
{
    this._displayObject = null; //@todo clean displayObject, no need in a tiled media !
    this._store = new FORGE.MediaStore(this._viewer, this._source, this._preview);
    this._notifyLoadComplete();
};



FORGE.MediaTiled.prototype.unload = function()
{
    if (this._store !== null)
    {
        this._store.destroy();
        this._store = null;
    }

    FORGE.Media.prototype.unload.call(this);
};

/**
 * MediaTiled destroy sequence
 *
 * @method FORGE.MediaTiled#destroy
 */
FORGE.MediaTiled.prototype.destroy = function()
{
    this.unload();

    FORGE.Media.prototype.destroy.call(this);
};

/**
 * Get the MediaTiled store, if this is a multi resolution MediaTiled.
 * @name FORGE.MediaTiled#store
 * @type {FORGE.MediaStore}
 * @readonly
 */
Object.defineProperty(FORGE.MediaTiled.prototype, "store",
{
    /** @this {FORGE.MediaTiled} */
    get: function()
    {
        return this._store;
    }
});