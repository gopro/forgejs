
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
