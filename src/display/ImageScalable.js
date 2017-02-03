
/**
 * Scalable Image.
 *
 * @constructor FORGE.ImageScalable
 * @param {FORGE.Viewer} viewer - The Viewer reference.
 * @param {(string|ImageConfig)} config - Image configuration object or just tan image URL.
 * @extends {FORGE.Image}
 */
FORGE.ImageScalable = function(viewer, config)
{
    /**
     * Scale width
     * @name FORGE.ImageScalable#_scaleWidth
     * @type {number}
     * @private
     */
    this._scaleWidth = 1;

    /**
     * Scale height
     * @name FORGE.ImageScalable#_scaleHeight
     * @type {number}
     * @private
     */
    this._scaleHeight = 1;

    /**
     * Initial size
     * @name FORGE.ImageScalable#_initialSize
     * @type {FORGE.Size}
     * @private
     */
    this._initialSize = null;

    FORGE.Image.call(this, viewer, config, "ImageScalable");

    this._boot();
};

FORGE.ImageScalable.prototype = Object.create(FORGE.Image.prototype);
FORGE.ImageScalable.prototype.constructor = FORGE.ImageScalable;

/**
 * Boot Sequence
 * @method FORGE.ImageScalable#_boot
 * @private
 */
FORGE.ImageScalable.prototype._boot = function()
{
    this.warn(this._className + " test both render modes");
    this._renderMode = FORGE.Image.renderModes.CANVAS;

    FORGE.Image.prototype._boot.call(this);
};

/**
 * Event handler for image load complete.
 * @method FORGE.ImageScalable#_loadImageComplete
 * @private
 */
FORGE.ImageScalable.prototype._loadImageComplete = function(file)
{
    var image = file.data;

    this._initialSize = new FORGE.Size(image.naturalWidth, image.naturalHeight);

    FORGE.Image.prototype._loadImageComplete.call(this, file);
};

/**
 * Method to draw the frame if render mode is CANVAS.
 * @method FORGE.ImageScalable#_drawFrame
 * @param  {Object} frame - The frame to draw
 * @private
 */
FORGE.ImageScalable.prototype._drawFrame = function(frame)
{
    this.log(frame);

    if (this._renderMode !== FORGE.Image.renderModes.CANVAS)
    {
        this.warn ("Invalid render mode for " + this._className);
        return;
    }

    if(this._img === null || this._imageLoaded === false)
    {
        return;
    }

    this._width = this._canvas.width = this._initialSize.width * this._scaleWidth;
    this._dom.style.width = this._canvas.width + "px";

    this._height = this._canvas.height = this._initialSize.height * this._scaleHeight;
    this._dom.style.height = this._canvas.height + "px";

    var ctx = this._canvas.getContext("2d");
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    ctx.drawImage(this._img, 0, 0, this._initialSize.width, this._initialSize.height, 0, 0, this._canvas.width, this._canvas.height);
};

/**
 * Destroy method
 * @method  FORGE.ImageScalable#destroy
 */
FORGE.ImageScalable.prototype.destroy = function()
{
    this._initialSize = null;

    FORGE.Image.prototype.destroy.call(this);
};

/**
 * Get/Set scale width
 * @name  FORGE.ImageScalable#scaleWidth
 * @type {number}
 */
Object.defineProperty(FORGE.ImageScalable.prototype, "scaleWidth",
{
    /** @this {FORGE.ImageScalable} */
    get: function()
    {
        return this._scaleWidth;
    },
    /** @this {FORGE.ImageScalable} */
    set: function(value)
    {
        value = Math.max(Number.EPSILON, value);

        if (this._scaleWidth !== value)
        {
            this._scaleWidth = value;
            this._drawFrame(this.frame);
        }
    }
});


/**
 * Get/Set scale height
 * @name  FORGE.ImageScalable#scaleHeight
 * @type {number}
 */
Object.defineProperty(FORGE.ImageScalable.prototype, "scaleHeight",
{
    /** @this {FORGE.ImageScalable} */
    get: function()
    {
        return this._scaleHeight;
    },
    /** @this {FORGE.ImageScalable} */
    set: function(value)
    {
        value = Math.max(Number.EPSILON, value);

        if (this._scaleHeight !== value)
        {
            this._scaleHeight = value;
            this._drawFrame(this.frame);
        }
    }
});
