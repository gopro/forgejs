/**
 * W3C early specifications support for VRDisplay
 * https://w3c.github.io/webvr/
 */

/**
 * @constructor
 * @return {VRDisplay}
 */
var VRDisplay = function() {};

/** @type {VRDisplayCapabilities} */
VRDisplay.prototype.capabilities;

/** @type {number} */
VRDisplay.prototype.depthFar;

/** @type {number} */
VRDisplay.prototype.depthNear;

/** @type {number} */
VRDisplay.prototype.displayId;

/** @type {string} */
VRDisplay.prototype.displayName;

/** @type {boolean} */
VRDisplay.prototype.isConnected;

/** @type {boolean} */
VRDisplay.prototype.isPresenting;

/** @type {VRStageParameters} */
VRDisplay.prototype.stageParameters;

/**
 * @param  {number} arg1
 */
VRDisplay.prototype.cancelAnimationFrame = function(arg1) {};

/**
 * @return {Promise}
 */
VRDisplay.prototype.exitPresent = function() {};

/**
 * @param  {string} arg1
 * @return {VREyeParameters} 
 */
VRDisplay.prototype.getEyeParameters = function(arg1) {};

/**
 * @param {VRFrameData} arg1
 * @return {boolean}
 */
VRDisplay.prototype.getFrameData = function(arg1) {};

/**
 * @return {Array<VRLayer>}
 */
VRDisplay.prototype.getLayers = function() {};

/**
 * @return {VRPose} 
 */
VRDisplay.prototype.getPose = function() {};

/**
 * @param {Function} arg1
 * @return {number}
 */
VRDisplay.prototype.requestAnimationFrame = function(arg1) {};

/**
 * @param {Array<VRLayer>} arg1
 * @return {Promise}
 */
VRDisplay.prototype.requestPresent = function(arg1) {};

/** */
VRDisplay.prototype.resetPose = function() {};

/** */
VRDisplay.prototype.submitFrame = function() {};


/**
 * @constructor
 * @return {VRDisplayCapabilities}
 */
var VRDisplayCapabilities = function() {};

/** @type {boolean} */
VRDisplayCapabilities.prototype.canPresent;

/** @type {boolean} */
VRDisplayCapabilities.prototype.hasExternalDisplay;

/** @type {boolean} */
VRDisplayCapabilities.prototype.hasOrientation;

/** @type {boolean} */
VRDisplayCapabilities.prototype.hasPosition;

/** @type {number} */
VRDisplayCapabilities.prototype.maxLayers;


/**
 * @constructor
 * @return {VRDisplayEvent}
 */
var VRDisplayEvent = function() {};

/** @type {VRDisplay} */
VRDisplayEvent.prototype.display;

/** @type {string} */
VRDisplayEvent.prototype.reason;


/**
 * @constructor
 * @return {VRLayer}
 */
var VRLayer = function() {};

/** @type {HTMLCanvasElement} */
VRLayer.prototype.source;

/** @type {Array<number>} */
VRLayer.prototype.leftBounds;

/** @type {Array<number>} */
VRLayer.prototype.rightBounds;


/**
 * @constructor
 * @return {VREyeParameters}
 */
var VREyeParameters = function() {};

/** @type {VRFieldOfView} */
VREyeParameters.prototype.fieldOfView;

/** @type {Float32Array} */
VREyeParameters.prototype.offset;

/** @type {number} */
VREyeParameters.prototype.renderWidth;

/** @type {number} */
VREyeParameters.prototype.renderHeight;


/**
 * @constructor
 * @deprecated
 * @return {VRFieldOfView}
 */
var VRFieldOfView = function() {};

/** @type {number} */
VRFieldOfView.prototype.downDegrees;

/** @type {number} */
VRFieldOfView.prototype.leftDegrees;

/** @type {number} */
VRFieldOfView.prototype.rightDegrees;

/** @type {number} */
VRFieldOfView.prototype.upDegrees;


/**
 * @constructor
 * @return {VRFrameData}
 */
var VRFrameData = function() {};

/** @type {Float32Array} */
VRFrameData.prototype.leftProjectionMatrix;

/** @type {Float32Array} */
VRFrameData.prototype.leftViewMatrix;

/** @type {Float32Array} */
VRFrameData.prototype.rightProjectionMatrix;

/** @type {Float32Array} */
VRFrameData.prototype.rightViewMatrix;


/**
 * @constructor
 * @return {VRPose}
 */
var VRPose = function() {};

/** @type {Float32Array} */
VRPose.prototype.angularAcceleration;

/** @type {Float32Array} */
VRPose.prototype.angularVelocity;

/** @type {Float32Array} */
VRPose.prototype.orientation;

/** @type {Float32Array} */
VRPose.prototype.linearAcceleration;

/** @type {Float32Array} */
VRPose.prototype.linearVelocity;

/** @type {Float32Array} */
VRPose.prototype.position;


/**
 * @constructor
 * @return {VRStageParameters}
 */
var VRStageParameters = function() {};

/** @type {Float32Array} */
VRStageParameters.prototype.sittingToStandingTransform;

/** @type {number} */
VRStageParameters.prototype.sizeX;

/** @type {number} */
VRStageParameters.prototype.sizeY;


///////////////////////////////////////////////////////////////////////////////////
/// PARTIAL INTERFACE /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

/** @type {Array<VRDisplay>} */
Navigator.prototype.activeVRDisplays;

/** @type {boolean} */
Navigator.prototype.vrEnabled;

/**
 * @return {Promise<Array<VRDisplay>>}
 */
Navigator.prototype.getVRDisplays = function() {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplayconnect = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplaydisconnect = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplayactivate = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplaydeactivate = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplayblur = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplayfocus = function(arg1) {};

/**
 * @param {Event} arg1
 */
Window.prototype.onvrdisplaypresentchange = function(arg1) {};
