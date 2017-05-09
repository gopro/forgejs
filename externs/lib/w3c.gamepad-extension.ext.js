/**
 * Externs file for the Gamepad API extension, as it is a working draft and not implemented in
 * the Closure Compiler.
 * https://w3c.github.io/gamepad/extensions.html
 */

/**
 * @constructor
 * @return {GamepadHapticActuator}
 */
var GamepadHapticActuator = function() {};

/** @type {string} */
GamepadHapticActuator.prototype.type;

/**
 * @param {number} value
 * @param {number} duration
 * @return {Promise}
 */
GamepadHapticActuator.prototype.pulse = function(value, duration) {};

/**
 * @constructor
 * @return {GamepadPose}
 */
var GamepadPose = function() {};

/** @type {boolean} */
GamepadPose.prototype.hasOrientation;

/** @type {boolean} */
GamepadPose.prototype.hasPosition;

/** @type {?Float32Array} */
GamepadPose.prototype.position;

/** @type {?Float32Array} */
GamepadPose.prototype.linearVelocity;

/** @type {?Float32Array} */
GamepadPose.prototype.linearAcceleration;

/** @type {?Float32Array} */
GamepadPose.prototype.orientation;

/** @type {?Float32Array} */
GamepadPose.prototype.angularVelocity;

/** @type {?Float32Array} */
GamepadPose.prototype.angularAcceleration;

//// Partial interface

/** @type {string} */
Gamepad.prototype.hand;

/** @type {GamepadHapticActuator} */
Gamepad.prototype.hapticActuators;

/** @type {?GamepadPose} */
Gamepad.prototype.pose;
