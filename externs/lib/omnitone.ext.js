/**
 * Simple extern file for Omnitone, used in ForgeJS player.
 * Only include used methods from Omnitone.
 */

/**
 * @const Omnitone main namespace.
 */
var Omnitone = {};

/**
 * Create a FOARenderer, the first-order ambisonic decoder and the optimized binaural renderer.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {FOARendererConfig} config
 * @return {FOARenderer}
 */
Omnitone.createFOARenderer = function(context, config) {};

/**
 * @typedef {{channelMap:(Array|undefined), hrirPathList:(Array|undefined), renderingMode:(string|undefined)}}
 * @name FOARendererConfig
 * @property {Array} channelMap - Custom channel routing map. Useful for handling the inconsistency in browser's multichannel audio decoding.
 * @property {Array} hrirPathList - A list of paths to HRIR files. It overrides the internal HRIR list if given.
 * @property {string} renderingMode - Rendering mode.
 */
var FOARendererConfig;

/**
 * Creates HOARenderer for higher-order ambisonic decoding and the optimized binaural rendering.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {HOARendererConfig} config
 * @return {HOARenderer}
 */
Omnitone.createHOARenderer = function(context, config) {};

/**
 * @typedef {{ambisonicOrder:(number|undefined), hrirPathList:(Array|undefined), renderingMode:(string|undefined)}}
 * @name HOARendererConfig
 * @property {number} ambisonicOrder - Ambisonic order.
 * @property {Array} hrirPathList - A list of paths to HRIR files. It overrides the internal HRIR list if given.
 * @property {string} renderingMode - Rendering mode.
 */
var HOARendererConfig;

/**
 * Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {FOARendererConfig} config
 * @return {!FOARenderer}
 */
function FOARenderer(context, config) {};

/**
 * @const
 */
Omnitone.FOARenderer = FOARenderer;

/**
 * Initializes and loads the resource for the renderer.
 */
FOARenderer.prototype.initialize = function() {};

/**
 * Set the channel map.
 * @param {Array<number>} channelMap - Custom channel routing for FOA stream.
 */
FOARenderer.prototype.setChannelMap = function(channelMap) {};

/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Array<number>} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {};

/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Array<number>} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {};

/**
 * Set the rotation matrix from a Three.js camera object. Deprecated in V1, and this exists only for the backward compatiblity. Instead, use |setRotatationMatrix4()| with Three.js |camera.worldMatrix.elements|.
 * @deprecated
 * @param {Object} cameraMatrix - Matrix4 from Three.js |camera.matrix|.
 */
FOARenderer.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {};

/**
 * Set the rendering mode.
 * @param {string} mode - Rendering mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
FOARenderer.prototype.setRenderingMode = function(mode) {};

/**
 * @type {GainNode}
 */
FOARenderer.prototype.input;

/**
 * @type {GainNode}
 */
FOARenderer.prototype.output;

/**
 * Omnitone HOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {HOARendererConfig} config
 * @return {!HOARenderer}
 */
function HOARenderer(context, config) {};

/**
 * @const
 */
Omnitone.HOARenderer = HOARenderer;

/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
HOARenderer.prototype.initialize = function() {};

/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Array<number>} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {};

/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Array<number>} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {};

/**
 * Set the decoding mode.
 * @param {string} mode - Decoding mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
HOARenderer.prototype.setRenderingMode = function(mode) {};

/**
 * @type {GainNode}
 */
HOARenderer.prototype.input;

/**
 * @type {GainNode}
 */
HOARenderer.prototype.output;