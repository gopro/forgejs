/**
 * HotspotTransformValues handle the three values x, y and z.
 *
 * @constructor FORGE.HotspotTransformValues
 * @param {number} x - The spherical coordinates of a 3D object (radius, theta, phi)
 * @param {number} y - The rotation of a 3D object (x, y, z).
 * @param {number} z - The scale of a 3D object (x, y, z).
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotTransformValues = function(transform, x, y, z)
{
    /**
     * The transformation related to this values.
     * @name FORGE.HotspotTransformValues#_transform
     * @type {FORGE.HotspotTransform}
     * @private
     */
    this._transform = transform;

    /**
     * The x.
     * @name FORGE.HotspotTransformValues#_x
     * @type {number}
     * @private
     */
    this._x = typeof(x) === "number" ? x : 0;

    /**
     * The y.
     * @name FORGE.HotspotTransformValues#_y
     * @type {number}
     * @private
     */
    this._y = typeof(y) === "number" ? y : 0;

    /**
     * The z.
     * @name FORGE.HotspotTransformValues#_z
     * @type {number}
     * @private
     */
    this._z = typeof(z) === "number" ? z : 0;

    /**
     * onChange event dispatcher for transform values change.
     * @name  FORGE.HotspotTransformValues#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;

    FORGE.BaseObject.call(this, "HotspotTransform");
};

FORGE.HotspotTransformValues.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotTransformValues.prototype.constructor = FORGE.HotspotTransformValues;

/**
 * Load values.
 * @method FORGE.HotspotTransformValues#load
 * @param {HotspotTransformValuesConfig} values
 * @param {bollean} notify - Do we notify the transform object after the load ?
 */
FORGE.HotspotTransformValues.prototype.load = function(values, notify)
{
    var changed = false;

    if(typeof values.x === "number" && isNaN(values.x) === false && this._x !== values.x)
    {
        this._x = values.x;
        changed = true;
    }

    if(typeof values.y === "number" && isNaN(values.y) === false && this._y !== values.y)
    {
        this._y = values.y;
        changed = true;
    }

    if(typeof values.z === "number" && isNaN(values.z) === false && this._z !== values.z)
    {
        this._z = values.z;
        changed = true;
    }

    if(notify !== false && changed === true)
    {
        if(this._onChange !== null)
        {
            this._onChange.dispatch();
        }

        this._transform.notifyChange();
    }
};

/**
 * Dump values.
 * @method FORGE.HotspotTransformValues#dump
 * @return {Object}
 */
FORGE.HotspotTransformValues.prototype.dump = function()
{
    var dump =
    {
        x: this._x,
        y: this._y,
        z: this._z
    };

    return dump;
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotTransformValues#destroy
 */
FORGE.HotspotTransformValues.prototype.destroy = function()
{
    this._transform = null;

    if(this._onChange !== null)
    {
        this._onChange.destroy();
        this._onChange = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get/set the x value
 * @name FORGE.HotspotTransformValues#x
 * @type {number}
 */
Object.defineProperty(FORGE.HotspotTransformValues.prototype, "x",
{
    /** @this {FORGE.HotspotTransformValues} */
    get: function()
    {
        return this._x;
    },

    set: function(value)
    {
        if(typeof value !== "number" || isNaN(value) === true || this._x === value)
        {
            return;
        }

        this._x = value;

        if(this._onChange !== null)
        {
            this._onChange.dispatch();
        }

        this._transform.notifyChange();
    }
});

/**
 * Get/set the y value
 * @name FORGE.HotspotTransformValues#y
 * @type {number}
 */
Object.defineProperty(FORGE.HotspotTransformValues.prototype, "y",
{
    /** @this {FORGE.HotspotTransformValues} */
    get: function()
    {
        return this._y;
    },

    set: function(value)
    {
        if(typeof value !== "number" || isNaN(value) === true || this._y === value)
        {
            return;
        }

        this._y = value;

        if(this._onChange !== null)
        {
            this._onChange.dispatch();
        }

        this._transform.notifyChange();
    }
});

/**
 * Get/set the x value
 * @name FORGE.HotspotTransformValues#x
 * @type {number}
 */
Object.defineProperty(FORGE.HotspotTransformValues.prototype, "z",
{
    /** @this {FORGE.HotspotTransformValues} */
    get: function()
    {
        return this._z;
    },

    set: function(value)
    {
        if(typeof value !== "number" || isNaN(value) === true || this._z === value)
        {
            return;
        }

        this._z = value;

        if(this._onChange !== null)
        {
            this._onChange.dispatch();
        }

        this._transform.notifyChange();
    }
});

/**
 * Get the onChange {@link FORGE.EventDispatcher}.
 * @name FORGE.HotspotTransformValues#onChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotTransformValues.prototype, "onChange",
{
    /** @this {FORGE.HotspotTransformValues} */
    get: function()
    {
        if (this._onChange === null)
        {
            this._onChange = new FORGE.EventDispatcher(this);
        }

        return this._onChange;
    }
});