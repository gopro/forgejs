/**
 * Simple extern file for Omnitone, used in ForgeJS player.
 * Only include used methods from Omnitone.
 */

/**
 * @const Omnitone main namespace.
 */
var Omnitone = {};

/**
 * Create a singleton FOADecoder instance.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {HTMLMediaElement} element - Video or Audio DOM element to be streamed.
 * @param {FOADecoderOptions} options - Options for FOA decoder.
 * @return {FOADecoder}
 */
Omnitone.createFOADecoder = function (context, element, options) {};

/**
 * @typedef {{HRTFSetUrl:(string|undefined), postGainDB:(number|undefined), channelMap:(Array<number>|undefined)}}
 * @name FOADecoderOptions
 * @property {string} HRTFSetUrl - Base URL for the cube HRTF sets.
 * @property {number} postGainDB - Post-decoding gain compensation in dB.
 * @property {Array<number>} channelMap -  Custom channel map.
 */
var FOADecoderOptions;

/**
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {HTMLMediaElement} element - Target video or audio element for streaming.
 * @param {FOADecoderOptions} options
 * @return {!FOADecoder}
 */
function FOADecoder(context, element, options) {};

/**
 * @param  {Object} cameraMatrix - The Matrix4 object of the Three.js camera.
 */
FOADecoder.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {};

/**
 * @param {string} mode - Decoding mode.
 * When the mode is 'bypass' the decoder is disabled and bypass the input stream to the output.
 * Setting the mode to 'ambisonic' activates the decoder.
 * When the mode is 'off', all the processing is completely turned off saving the CPU power.
 */
FOADecoder.prototype.setMode = function(mode) {};

/**
 *
 */
FOADecoder.prototype.initialize = function() {};

/**
 * @const
 */
Omnitone.FOADecoder = FOADecoder;

/**
 * Create a singleton FOARenderer instance.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {FOARendererOptions} options - Options for FOA decoder.
 * @return {FOARenderer}
 */
Omnitone.createFOARenderer = function (context, options) {};

/**
 * @typedef {{channelMap:(Array|undefined), hrirPathList:(Array|undefined), renderingMode:(string|undefined)}}
 * @name FOARendererOptions
 * @property {Array} channelMap - Custom channel routing map.
 * @property {Array} hrirPathList - A list of paths to HRIR files.
 * @property {RenderingMode} renderingMode - Rendering mode.
 */
var FOARendererOptions;

/**
 * Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {FOARendererOptions} options
 * @return {!FOARenderer}
 */
function FOARenderer(context, options) {};

/**
 * @const
 */
Omnitone.FOARenderer = FOARenderer;
/**
 * @param  {Object} cameraMatrix - The Matrix4 object of the Three.js camera.
 */
FOARenderer.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {};

/**
 * @param {string} mode - Decoding mode.
 * When the mode is 'bypass' the decoder is disabled and bypass the input stream to the output.
 * Setting the mode to 'ambisonic' activates the decoder.
 * When the mode is 'off', all the processing is completely turned off saving the CPU power.
 */
FOARenderer.prototype.setMode = function(mode) {};

/**
 *
 */
FOARenderer.prototype.initialize = function() {};

/** @type {GainNode} */
FOARenderer.prototype.input;

/** @type {GainNode} */
FOARenderer.prototype.output;
