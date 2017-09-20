
/**
 * Canvas display object.
 * @constructor FORGE.Canvas
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.DisplayObject}
 */
FORGE.Canvas = function(viewer)
{
    FORGE.DisplayObject.call(this, viewer, document.createElement("canvas"), "Canvas");
};

FORGE.Canvas.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.Canvas.prototype.constructor = FORGE.Canvas;

/**
 * Canvas capture modes
 * @name FORGE.Canvas.formats
 * @type {Object}
 * @const
 */
FORGE.Canvas.formats = {};

/**
 * Image format.
 * @name FORGE.Canvas.formats.IMAGE
 * @type {string}
 * @const
 */
FORGE.Canvas.formats.IMAGE = "image";

/**
 * Data format.
 * @name FORGE.Canvas.formats.DATA
 * @type {string}
 * @const
 */
FORGE.Canvas.formats.DATA = "data";

/**
 * Boot sequence.
 * @method FORGE.Canvas#_boot
 * @private
 */
FORGE.Canvas.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    this._viewer.display.register(this);
    this._notifyReady();
    this._applyPending(false);
};

/**
 * Capture the canvas and return an image or the DataURL.
 * @method FORGE.Canvas#capture
 * @param {string} format
 */
FORGE.Canvas.prototype.capture = function(format)
{
    format = format || FORGE.Canvas.formats.IMAGE;

    var data = this._dom.toDataURL();

    switch(format)
    {
        case FORGE.Canvas.formats.DATA:
            return data;

        case FORGE.Canvas.formats.IMAGE:
            var image = new Image();
            image.src = data;
            return image;
    }
};

/**
 * Get the context for 2D.
 * @name FORGE.Canvas#context2D
 * @type {CanvasRenderingContext2D}
 * @readonly
 */
Object.defineProperty(FORGE.Canvas.prototype, "context2D",
{
    /** @this {FORGE.Canvas} */
    get: function()
    {
        return this._dom.getContext("2d");
    }
});

/**
 * Get the webGl context for 3D.
 * @name FORGE.Canvas#context3D
 * @type {WebGLRenderingContext}
 * @readonly
 */
Object.defineProperty(FORGE.Canvas.prototype, "context3D",
{
    /** @this {FORGE.Canvas} */
    get: function()
    {
        return this._dom.getContext("webgl");
    }
});

/**
 * Get the canvas DOM element
 * @name FORGE.Canvas#element
 * @type {HTMLCanvasElement}
 * @readonly
 */
Object.defineProperty(FORGE.Canvas.prototype, "element",
{
    /** @this {FORGE.Canvas} */
    get: function()
    {
        return this._dom;
    }
});
