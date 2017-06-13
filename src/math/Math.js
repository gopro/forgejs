/**
 * Math helper
 * @namespace FORGE.Math
 * @type {Object}
 */
FORGE.Math = {};

/**
 * @name FORGE.Math.DEGREES
 * @type {string}
 * @const
 */
FORGE.Math.DEGREES = "degrees";

/**
 * @name FORGE.Math.RADIANS
 * @type {string}
 * @const
 */
FORGE.Math.RADIANS = "radians";

/**
 * FORGE.Math.DEG2RAD
 * @type {number}
 * @const
 */
FORGE.Math.DEG2RAD = Math.PI / 180.0;

/**
 * FORGE.Math.RAD2DEG
 * @type {number}
 * @const
 */
FORGE.Math.RAD2DEG = 180.0 / Math.PI;

/**
 * FORGE.Math.TWOPI
 * @type {number}
 * @const
 */
FORGE.Math.TWOPI = Math.PI * 2;


/**
 * Converts angle unit degrees to radians
 *
 * @method FORGE.Math.degToRad
 * @param  {number} deg - angle in degrees
 * @return {number} Return the angle in radians
 */
FORGE.Math.degToRad = function(deg)
{
    return deg * FORGE.Math.DEG2RAD;
};

/**
 * Converts angle unit radians to degrees
 *
 * @method FORGE.Math.radToDeg
 * @param  {number} rad - angle in radians
 * @return {number} Return the angle in degrees
 */
FORGE.Math.radToDeg = function(rad)
{
    return rad * FORGE.Math.RAD2DEG;
};

/**
 * Returns the value of a number rounded to the nearest decimal value
 *
 * @method FORGE.Math.round10
 * @param  {number} value - Value to round
 * @return {number} Return the rounded value
 */
FORGE.Math.round10 = function(value)
{
    return Math.round(value * 10) / 10;
};

/**
 * Clamp a value between a min and a max value
 *
 * @method FORGE.Math.clamp
 * @param  {number} value - Value to clamp
 * @param  {?number=} min - The min value
 * @param  {?number=} max - The max value
 * @return {number} Return the clamped value
 */
FORGE.Math.clamp = function(value, min, max)
{
    min = (typeof min === "number" && isNaN(min) === false) ? min : -Infinity;
    max = (typeof max === "number" && isNaN(max) === false) ? max : Infinity;

    return Math.min(Math.max(value, min), max);
};

/**
 * Wrap a value between a min and a max value
 *
 * @method FORGE.Math.wrap
 * @param  {number} value - Value to wrap
 * @param  {number} min - The min value
 * @param  {number} max - The max value
 * @return {number} Return the wrapped value
 */
FORGE.Math.wrap = function(value, min, max)
{
    if (value === max)
    {
        return max;
    }

    var range = max - min;

    if (range === 0)
    {
        return min;
    }

    return ((value - min) % range + range) % range + min;
};

/**
 * Linear mix function
 *
 * @method FORGE.Math.mix
 * @param  {number} a - first value
 * @param  {number} b - second value
 * @param  {number} mix - factor
 * @return {number} linear mix of a and b
 */
FORGE.Math.mix = function(a, b, mix)
{
    return a * mix + b * (1 - mix);
};

/**
 * Smoothstep function
 *
 * @method FORGE.Math.smoothStep
 * @param  {number} value - Value to smooth
 * @param  {number} edge0 - low edge
 * @param  {number} edge1 - high edge
 * @return {number} smooth step result
 */
FORGE.Math.smoothStep = function(value, edge0, edge1)
{
    value = FORGE.Math.clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
    return value * value * (3 - 2 * value);
};

/**
 * Check if a value is a power of two
 * @method FORGE.Math.isPowerOfTwo
 * @param  {number} value - value to check
 */
FORGE.Math.isPowerOfTwo = function(value)
{
    return ((value != 0) && !(value & (value - 1)));
};

/**
 * Get euler angles from rotation matrix
 *
 * @method FORGE.Math.rotationMatrixToEuler
 * @param  {THREE.Matrix4} mat - rotation matrix
 * @return {TEuler} object with keys {yaw, pitch, roll} and euler angles as values [radians]
 */
FORGE.Math.rotationMatrixToEuler = function(mat)
{
    return {
        yaw: Math.atan2(-mat.elements[2 + 0 * 4], mat.elements[2 + 2 * 4]),
        pitch: Math.asin(-mat.elements[2 + 1 * 4]),
        roll: Math.atan2(-mat.elements[0 + 1 * 4], mat.elements[1 + 1 * 4])
    };
};

/**
 * Get rotation matrix from euler angles
 *
 * @method FORGE.Math.eulerToRotationMatrix
 * @param  {number} yaw - yaw angle [rad]
 * @param  {number} pitch - pitch angle [rad]
 * @param  {number} roll - roll angle [rad]
 * @param  {boolean=} orderYPR
 * @return {THREE.Matrix4} rotation matrix
 */
FORGE.Math.eulerToRotationMatrix = function(yaw, pitch, roll, orderYPR)
{
    var cy = Math.cos(yaw);
    var sy = Math.sin(yaw);
    var cp = Math.cos(-pitch);
    var sp = Math.sin(-pitch);
    var cr = Math.cos(roll);
    var sr = Math.sin(roll);

    if (typeof orderYPR === "undefined")
    {
        orderYPR = false;
    }

    //jscs:disable
    if (orderYPR)
    {
        // M(yaw) * M(pitch) * M(roll)
        return new THREE.Matrix4().set(
             cy * cr + sy * sp * sr, -cy * sr + sy * sp * cr, sy * cp, 0,
                            cp * sr,                 cp * cr,     -sp, 0,
            -sy * cr + cy * sp * sr,  sy * sr + cy * sp * cr, cy * cp, 0,
                                  0,                       0,       0, 1
        );
    }

    // M(roll) * M(pitch) *  M(yaw)
    return new THREE.Matrix4().set(
        cr * cy - sr * sp * sy, -sr * cp, cr * sy + sr * sp * cy, 0,
        sr * cy + cr * sp * sy,  cr * cp, sr * sy - cr * sp * cy, 0,
                      -sy * cp,       sp,                cp * cy, 0,
                             0,        0,                      0, 1
     );
    //jscs:enable
};

/**
 * Converts spherical coordinates to cartesian, respecting the FORGE
 * coordinates system.
 *
 * @method FORGE.Math.sphericalToCartesian
 * @param {number} radius - radius
 * @param {number} theta - theta angle [rad]
 * @param {number} phi - phi angle [rad]
 * @return {CartesianCoordinates} the resulting cartesian coordinates
 */
FORGE.Math.sphericalToCartesian = function(radius, theta, phi)
{
    var res = {};

    // wrap phi in [-π/2; π/2]
    phi = FORGE.Math.wrap(phi, -Math.PI / 2, Math.PI / 2);
    // invert theta if radius is negative
    theta += radius < 0 ? Math.PI : 0;
    // wrap theta in [0; 2π)
    theta = FORGE.Math.wrap(theta, 0, 2 * Math.PI);
    // abs so the radius is positive
    radius = Math.abs(radius);

    res.x = radius * Math.cos(phi) * Math.sin(theta);
    res.y = radius * Math.sin(phi);
    res.z = -radius * Math.cos(phi) * Math.cos(theta);

    return res;
};

/**
 * Converts cartesian coordinates to spherical, respecting the FORGE
 * coordinates system.
 *
 * @method FORGE.Math.cartesianToSpherical
 * @param {number} x - x
 * @param {number} y - y
 * @param {number} z - z
 * @param {string} [unit=radian] - The unit used to return spherical
 * @return {SphericalCoordinates}
 */
FORGE.Math.cartesianToSpherical = function(x, y, z, unit)
{
    var res = {};

    res.radius = Math.sqrt(x*x + y*y + z*z);

    if (res.radius === 0)
    {
        return { radius: 0, theta: 0, phi: 0 };
    }

    res.phi = Math.asin(y / res.radius);
    res.theta = Math.atan2(x, -z || 0); // we want to avoid -z = -0

    if(typeof unit === "string" && unit.toLowerCase().substring(0, 3) === "deg")
    {
        res.phi = FORGE.Math.radToDeg(res.phi);
        res.theta = FORGE.Math.radToDeg(res.theta);
    }

    return res;
};
