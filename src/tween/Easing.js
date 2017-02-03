/**
 * Namespace to store all easing methods.
 * @name FORGE.Easing
 * @type {Object}
 */
FORGE.Easing = {};

/**
 * @method FORGE.Easing.LINEAR
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.LINEAR = function(t)
{
    var y = t;
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.SINE_IN
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.SINE_IN = function(t)
{
    var y = 1.0 + Math.sin(Math.PI / 2.0 * (t - 1.0));
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.SINE_IN_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.SINE_IN_OUT = function(t)
{
    var y = 0.5 * (1.0 + Math.sin(Math.PI / 2.0 * (2.0 * t - 1.0)));
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.SINE_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.SINE_OUT = function(t)
{
    var y = Math.sin(Math.PI / 2.0 * t);
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.QUAD_IN
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.QUAD_IN = function(t)
{
    var y = t * t;
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.QUAD_IN_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.QUAD_IN_OUT = function(t)
{
    var y;
    if (t < 0.5)
    {
        y = 2.0 * t * t;
    }
    else
    {
        y = 1.0 - 2.0 * (t - 1.0) * (t - 1.0);
    }

    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.QUAD_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.QUAD_OUT = function(t)
{
    t = 1.0 - t;
    var y = 1.0 - (t * t);
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.CUBIC_IN
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.CUBIC_IN = function(t)
{
    var y = t * t * t;
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.CUBIC_IN_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.CUBIC_IN_OUT = function(t)
{
    var y;
    if (t < 0.5)
    {
        y = 4.0 * t * t * t;
    }
    else
    {
        y = 1.0 + 4.0 * (t - 1.0) * (t - 1.0) * (t - 1.0);
    }

    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.CUBIC_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.CUBIC_OUT = function(t)
{
    t = 1.0 - t;
    var y = 1.0 - (t * t * t);
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.BOUNCE_OUT
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.BOUNCE_OUT = function (t)
{

    var y;
    if (t < 1 / 2.75)
    {
        y = 7.5625 * t * t;
    }
    else if (t < 2/2.75)
    {
        t = t - (1.5 / 2.75);
        y = 7.5625 * t * t + 0.75;
    }
    else if (t < 2.5 / 2.75)
    {
        t = t - 2.25 / 2.75;
        y = 7.5625 * t * t + 0.9375;
    }
    else
    {
        t = t - 2.625 / 2.75;
        y = 7.5625 * t * t + 0.984375;
    }
    return FORGE.Math.clamp(y, 0, 1);
};

/**
 * @method FORGE.Easing.BOUNCE_IN
 * @nocollapse
 * @param {number} t
 * @return {number}
 */
FORGE.Easing.BOUNCE_IN = function (t)
{
    return 1.0 - FORGE.Easing.BOUNCE_OUT(1-t);
};