/**
 * @typedef {{screenToWorld:(ScreenWorldProgram|undefined), worldToScreen:(ScreenWorldProgram|undefined)}}
 */
var FORGEProgram;

/**
 * @typedef {{rectilinear:(ViewObjectProgram|WorldToScreenProgram|undefined), gopro:(ViewObjectProgram|WorldToScreenProgram|undefined), littlePlanet:(ViewObjectProgram|WorldToScreenProgram|undefined)}}
 */
var ScreenWorldProgram;

/**
 * @typedef {{mapping:(ViewObjectProgram|undefined), equirectangular:(ViewObjectProgram|undefined)}}
 */
var WorldToScreenProgram;

/**
 * @typedef {{uniforms:(FORGEUniform|undefined), vertexShader:(string|undefined), fragmentShader:(string|undefined)}}
 */
var ViewObjectProgram;

/**
 * @typedef {{tTexture:(TUniform|undefined), resolution:(TUniform|undefined), tViewportResolution:(TUniform|undefined), tViewportResolutionMin:(TUniform|undefined), tViewportResolutionRatio:(TUniform|undefined), tModelViewMatrix:(TUniform|undefined), tModelViewMatrixInverse:(TUniform|undefined), tProjectionScale:(TUniform|undefined), tProjectionDistance:(TUniform|undefined), tScreenOffset:(TUniform|undefined), tTextureInfo:(TUniform|undefined), tAdd:(TUniform|undefined), tColor:(TUniform|undefined), tOpacity:(TUniform|undefined), time:(TUniform|undefined)}}
 * @name FORGEUniform
 * @property {TUniform=} tTexture
 * @property {TUniform=} resolution
 * @property {TUniform=} tViewportResolution
 * @property {TUniform=} tViewportResolutionMin
 * @property {TUniform=} tViewportResolutionRatio
 * @property {TUniform=} tModelViewMatrix
 * @property {TUniform=} tModelViewMatrixInverse
 * @property {TUniform=} tProjectionScale
 * @property {TUniform=} tProjectionDistance
 * @property {TUniform=} tScreenOffset
 * @property {TUniform=} tTextureInfo
 * @property {TUniform=} tAdd
 * @property {TUniform=} tColor
 * @property {TUniform=} tOpacity
 * @property {TUniform=} time
 */
var FORGEUniform;

/**
 * @typedef {{type:string, value:*}}
 * @name TUniform
 * @property {string} type - the type of the uniform
 * @property {*} value - the value of the uniform
 */
var TUniform;

/**
 * @typedef {{downDegrees:number, leftDegrees:number, rightDegrees:number, upDegrees:number}}
 * @name VRFieldOfViewObject
 */
var VRFieldOfViewObject;