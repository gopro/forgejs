/**
 * Rectangle object.
 *
 * @constructor FORGE.Rectangle
 * @param {number} x - horizontal coordinate of origin
 * @param {number} y - vertical coordinate of origin
 * @param {number} width - width of the rectangle
 * @param {number} height - height of the rectangle
 */
FORGE.Rectangle = function(x, y, width, height)
{
    /**
     * Horizontal coordinate of origin
     * @name FORGE.Rectangle#_x
     * @type {number}
     * @private
     */
    this._x = typeof x === "number" ? x : 0;

    /**
     * Vertical coordinate of origin
     * @name FORGE.Rectangle#_y
     * @type {number}
     * @private
     */
    this._y = typeof y === "number" ? y : 0;

    /**
     * Width
     * @name FORGE.Rectangle#_width
     * @type {number}
     * @private
     */
    this._width = typeof width === "number" ? width : 0;

    /**
     * Height
     * @name FORGE.Rectangle#_height
     * @type {number}
     * @private
     */
    this._height = typeof height === "number" ? height : 0;

};

FORGE.Rectangle.prototype.constructor = FORGE.Rectangle;


/**
 * Get and set x origin coordinate.
 * @name FORGE.Rectangle#x
 * @type {number}
 */
Object.defineProperty(FORGE.Rectangle.prototype, "x",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return this._x;
    },

    /** @this {FORGE.Rectangle} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._x = value;
        }
    }
});

/**
 * Get and set y origin coordinate.
 * @name FORGE.Rectangle#y
 * @type {number}
 */
Object.defineProperty(FORGE.Rectangle.prototype, "y",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return this._y;
    },

    /** @this {FORGE.Rectangle} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._y = value;
        }
    }
});

/**
 * Get and set width of the rectangle.
 * @name FORGE.Rectangle#width
 * @type {number}
 */
Object.defineProperty(FORGE.Rectangle.prototype, "width",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return this._width;
    },

    /** @this {FORGE.Rectangle} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._width = value;
        }
    }
});

/**
 * Get and set height of the rectangle.
 * @name FORGE.Rectangle#height
 * @type {number}
 */
Object.defineProperty(FORGE.Rectangle.prototype, "height",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return this._height;
    },

    /** @this {FORGE.Rectangle} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._height = value;
        }
    }
});

/**
 * Get center point.
 * @name FORGE.Rectangle#center
 * @type {THREE.Vector2}
 * @readonly
 */
Object.defineProperty(FORGE.Rectangle.prototype, "center",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return new THREE.Vector2(this._x + 0.5 * this._width, this._y + 0.5 * this._height);
    }
});

/**
 * Get origin.
 * @name FORGE.Rectangle#origin
 * @type {THREE.Vector2}
 * @readonly
 */
Object.defineProperty(FORGE.Rectangle.prototype, "origin",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return new THREE.Vector2(this._x, this._y);
    }
});

/**
 * Get size.
 * @name FORGE.Rectangle#size
 * @type {FORGE.Size}
 * @readonly
 */
Object.defineProperty(FORGE.Rectangle.prototype, "size",
{
    /** @this {FORGE.Rectangle} */
    get: function()
    {
        return new FORGE.Size(this._width, this._height);
    }
});


