/**
 * @typedef {{screenToWorld:(ScreenToWorldProgram|undefined), worldToScreen:(ScreenToWorldProgram|undefined)}}
 */
var FORGEProgram;

/**
 * @typedef {{rectilinear:(ViewObjectProgram|WorldToScreenProgram|undefined), gopro:(ViewObjectProgram|WorldToScreenProgram|undefined), flat:(ViewObjectProgram|WorldToScreenProgram|undefined), littlePlanet:(ViewObjectProgram|WorldToScreenProgram|undefined)}}
 */
var ScreenToWorldProgram;

/**
 * @typedef {{mapping:(ViewObjectProgram|undefined), equirectangular:(ViewObjectProgram|undefined), flat:(ViewObjectProgram|undefined)}}
 */
var WorldToScreenProgram;

/**
 * @typedef {{uniforms:(FORGEUniform|undefined), vertexShader:(string|undefined), fragmentShader:(string|undefined)}}
 */
var ViewObjectProgram;

/**
 * @typedef {{tTexture:(TUniform|undefined), tTextureSize:(TUniform|undefined), tTextureRatio:(TUniform|undefined), resolution:(TUniform|undefined), tViewportResolution:(TUniform|undefined), tViewportResolutionMin:(TUniform|undefined), tViewportResolutionRatio:(TUniform|undefined), tFov:(TUniform|undefined), tYaw:(TUniform|undefined), tPitch:(TUniform|undefined), tRepeatX:(TUniform|undefined), tRepeatY:(TUniform|undefined), tModelViewMatrix:(TUniform|undefined), tModelViewMatrixInverse:(TUniform|undefined), tProjectionScale:(TUniform|undefined), tProjectionDistance:(TUniform|undefined), tScreenOffset:(TUniform|undefined), tTextureInfo:(TUniform|undefined), tAdd:(TUniform|undefined), tColor:(TUniform|undefined), tOpacity:(TUniform|undefined), time:(TUniform|undefined)}}
 * @name FORGEUniform
 * @property {TUniform=} tTexture
 * @property {TUniform=} tTextureSize
 * @property {TUniform=} tTextureRatio
 * @property {TUniform=} resolution
 * @property {TUniform=} tViewportResolution
 * @property {TUniform=} tViewportResolutionMin
 * @property {TUniform=} tViewportResolutionRatio
 * @property {TUniform=} tFov
 * @property {TUniform=} tYaw
 * @property {TUniform=} tPitch
 * @property {TUniform=} tRepeatX
 * @property {TUniform=} tRepeatY
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

/**
 * @typedef {{load:Promise, cancelled:boolean}}
 * @name TexturePromiseObject
 */
var TexturePromiseObject;

/**
 * @typedef {{front:string, left:string, back:string, right:string, up:string, down:string}}
 * @name CubeFaceObject
 * @property {string} front
 * @property {string} left
 * @property {string} back
 * @property {string} right
 * @property {string} up
 * @property {string} down
 */
var CubeFaceObject;

