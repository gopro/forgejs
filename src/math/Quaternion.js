/**
 * Quaternion helper.
 * @namespace {Object} FORGE.Quaternion
 */
FORGE.Quaternion = {};

/**
 * Get euler angles from a quaternion.
 *
 * @method FORGE.Quaternion.toEuler
 * @param {THREE.Quaternion} quat - rotation quaternion
 * @return {TEuler} euler angle object
 */
FORGE.Quaternion.toEuler = function(quat)
{
    var euler = new THREE.Euler().setFromQuaternion (quat, "XYZ");

    var result =
    {
        yaw: euler.x,
        pitch: -euler.y,
        roll: euler.z
    };

    return result;
};

/**
 * Get a quaternion from euler angles.
 *
 * @method FORGE.Quaternion.fromEuler
 * @param {TEuler|number} yaw - yaw euler angle (y axis) [radians]
 * @param {number=} pitch - pitch euler angle (x axis) [radians]
 * @param {number=} roll - roll euler angle (z axis) [radians]
 * @return {THREE.Quaternion} resulting rotation quaternion
 */
FORGE.Quaternion.fromEuler = function(yaw, pitch, roll)
{
    if(typeof yaw === "object")
    {
        pitch = yaw.pitch;
        roll = yaw.roll;
        yaw = yaw.yaw;
    }

    return new THREE.Quaternion().setFromEuler(new THREE.Euler(yaw, -pitch, roll, "ZXY"));
};

/**
 * Get a rotation matrix from a quaternion.
 *
 * @method FORGE.Quaternion.toRotationMatrix
 * @param {THREE.Quaternion} quat - quaternion
 * @return {THREE.Matrix4} rotation matrix
 */
FORGE.Quaternion.toRotationMatrix = function(quat)
{
    var euler = FORGE.Quaternion.toEuler(quat);
    return FORGE.Math.eulerToRotationMatrix(euler.yaw, euler.pitch, euler.roll);
};

/**
 * Get a quaternion from a rotation matrix.
 *
 * @method FORGE.Quaternion.fromRotationMatrix
 * @param {THREE.Matrix4} mat - rotation matrix
 * @return {THREE.Quaternion} quat quaternion
 */
FORGE.Quaternion.fromRotationMatrix = function(mat)
{
    var euler = FORGE.Math.rotationMatrixToEuler(mat);
    return FORGE.Quaternion.fromEuler(euler);
};

/**
 * Cancel roll and return new quaternion.
 *
 * @method FORGE.Quaternion.cancelRoll
 * @param  {THREE.Quaternion} quat - input quaternion
 * @return {THREE.Quaternion} quaternion without roll
 */
FORGE.Quaternion.cancelRoll = function(quat)
{
    var euler = FORGE.Quaternion.toEuler(quat);
    return FORGE.Quaternion.fromEuler(euler.yaw, euler.pitch, 0);
};

/**
 * Get difference quaternion between two rotation quaternions.
 *
 * @method FORGE.Quaternion.diffBetweenQuaternions
 * @param {THREE.Quaternion} q0 - start quaternion
 * @param {THREE.Quaternion} q1 - end quaternion
 * @return {THREE.Quaternion}
 */
FORGE.Quaternion.diffBetweenQuaternions = function(q0, q1)
{
    return new THREE.Quaternion().copy(q0).inverse().multiply(q1);
};

/**
 * Get rotation angle between two quaternions.
 *
 * @method FORGE.Quaternion.angularDistance
 * @param {THREE.Quaternion} q0 - interval start quaternion
 * @param {THREE.Quaternion} q1 - interval end quaternion
 * @return {number} angle in radians
 */
FORGE.Quaternion.angularDistance = function(q0, q1)
{
    var d = Math.abs(q0.dot(q1));

    if (d >= 1.0)
    {
        return 0;
    }

    return 2 * Math.acos(d);
};

/**
 * Multiply a quaternion with a scalar.
 *
 * @method FORGE.Quaternion.multiplyScalar
 * @param {number} scalar scalar - multiplyScalar
 * @param {THREE.Quaternion} quat - quaternion
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.multiplyScalar = function (scalar, quat)
{
    return new THREE.Quaternion(scalar * quat.x, scalar * quat.y, scalar * quat.z, scalar * quat.w);
};

/**
 * Add quaternions.
 *
 * @method FORGE.Quaternion.add
 * @param {THREE.Quaternion} q0 - first quaternion
 * @param {THREE.Quaternion} q1 - second quaternion
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.add = function (q0, q1)
{
    return new THREE.Quaternion(q0.x + q1.x, q0.y + q1.y, q0.z + q1.z, q0.w + q1.w);
};

/**
 * Quaternion log function.
 *
 * @method FORGE.Quaternion.log
 * @param {THREE.Quaternion} quat - quaternion
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.log = function(quat)
{
    var qres = new THREE.Quaternion(0, 0, 0, 0);

    if (Math.abs(quat.w) < 1)
    {
        var angle = Math.acos(quat.w);
        var sin = Math.sin(angle);

        if (sin > 0)
        {
            qres.x = angle * quat.x / sin;
            qres.y = angle * quat.y / sin;
            qres.z = angle * quat.z / sin;
        }

        return qres;
    }

    qres.x = quat.x;
    qres.y = quat.y;
    qres.z = quat.z;

    return qres;
};

/**
 * Quaternion exp function.
 *
 * @method FORGE.Quaternion.exp
 * @param {THREE.Quaternion} quat - quaternion
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.exp = function (quat)
{
    var angle = Math.sqrt(quat.x * quat.x + quat.y * quat.y + quat.z * quat.z);
    var sin = Math.sin(angle);

    var qres = new THREE.Quaternion().copy(quat);
    qres.w = Math.cos(angle);

    if (Math.abs(sin) > Number.EPSILON)
    {
        qres.x = sin * quat.x / angle;
        qres.y = sin * quat.y / angle;
        qres.z = sin * quat.z / angle;
    }

    return qres;
};

/**
 * Quaternion slerp computation.
 *
 * @method FORGE.Quaternion.slerp
 * @param {THREE.Quaternion} q0 - interval start quaternion
 * @param {THREE.Quaternion} q1 - interval end quaternion
 * @param {number} t - interpolation time
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.slerp = function(q0, q1, t)
{
    var qres = new THREE.Quaternion();
    THREE.Quaternion.slerp(q0, q1, qres, t);
    return qres;
};

/**
 * Compute squad interpolation.
 *
 * @method FORGE.Quaternion.squad
 * @param {THREE.Quaternion} q0 - interval start quaternion
 * @param {THREE.Quaternion} a0 - left quandrangle
 * @param {THREE.Quaternion} a1 - right quandrangle
 * @param {THREE.Quaternion} q1 - interval end quaternion
 * @param {THREE.Quaternion} qres - result quaternion
 * @param {number} t - interpolation time
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.squad = function(q0, a0, a1, q1, qres, t)
{
    var slerp1 = FORGE.Quaternion.slerp(q0, q1, t);
    var slerp2 = FORGE.Quaternion.slerp(a0, a1, t);
    return FORGE.Quaternion.slerp(slerp1, slerp2, 2*t*(1-t));
};

/**
 * Compute NLERP interpolation without inversion
 *
 * @method FORGE.Quaternion.nlerpNoInvert
 * @param {THREE.Quaternion} q0 interval start quaternion
 * @param {THREE.Quaternion} q1 interval end quaternion
 * @param {number} t interpolation time
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.nlerpNoInvert = function(q0, q1, t)
{
    return FORGE.Quaternion.add(
        FORGE.Quaternion.multiplyScalar(1 - t, q0),
        FORGE.Quaternion.multiplyScalar(t, q1)
    ).normalize();
};

/**
 * Compute SLERP interpolation without inversion
 *
 * @method FORGE.Quaternion.slerpNoInvert
 * @param {THREE.Quaternion} q0 interval start quaternion
 * @param {THREE.Quaternion} q1 interval end quaternion
 * @param {number} t interpolation time
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.slerpNoInvert = function(q0, q1, t)
{
    var dot = q0.dot(q1);

    if (Math.abs(dot) >= 0.95)
    {
        return FORGE.Quaternion.nlerpNoInvert(q0, q1, t);
    }

    var angle = Math.acos(dot);
    return FORGE.Quaternion.multiplyScalar(1.0 / Math.sin(angle),
        FORGE.Quaternion.add(
            FORGE.Quaternion.multiplyScalar(Math.sin(angle * (1-t)), q0),
            FORGE.Quaternion.multiplyScalar(Math.sin(angle * t), q1)
        )
    );
};

/**
 * Compute SQUAD interpolation without inversion
 *
 * @method FORGE.Quaternion.squadNoInvert
 * @param {THREE.Quaternion} q0 interval start quaternion
 * @param {THREE.Quaternion} a0 left quandrangle
 * @param {THREE.Quaternion} a1 right quandrangle
 * @param {THREE.Quaternion} q1 interval end quaternion
 * @param {number} t interpolation time
 * @return {THREE.Quaternion} result quaternion
 */
FORGE.Quaternion.squadNoInvert = function(q0, a0, a1, q1, t)
{
    var qq = FORGE.Quaternion.slerpNoInvert(q0, q1, t);
    var qa = FORGE.Quaternion.slerpNoInvert(a0, a1, t);
    return FORGE.Quaternion.slerpNoInvert(qq, qa, 2 * t * (1-t));
};

/**
 * Make a spline from three quaternions.
 *
 * @method FORGE.Quaternion.spline
 * @param {THREE.Quaternion} q0 previous quaternion
 * @param {THREE.Quaternion} q1 current quaternion
 * @param {THREE.Quaternion} q2 next quaternion
 * @return {THREE.Quaternion}
 */
FORGE.Quaternion.spline = function (q0, q1, q2)
{
    var q1Inv = new THREE.Quaternion().copy(q1).conjugate();

    var p0 = new THREE.Quaternion().copy(q1Inv).multiply(q0);
    var p2 = new THREE.Quaternion().copy(q1Inv).multiply(q2);

    var qLog0 = FORGE.Quaternion.log(p0);
    var qLog2 = FORGE.Quaternion.log(p2);

    var qLogSum = FORGE.Quaternion.add(qLog0, qLog2);
    var qLogSumQuater = FORGE.Quaternion.multiplyScalar(-0.25, qLogSum);
    var qExp = FORGE.Quaternion.exp(qLogSumQuater);

    return new THREE.Quaternion().copy(q1).multiply(qExp).normalize();
};
