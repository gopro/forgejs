
/**
 * @typedef {{x:(number|undefined), y:(number|undefined), z:(number|undefined), radius:(number|undefined), theta:(number|undefined), phi:(number|undefined)}}
 */
var HotspotTransformPosition;

/**
 * @typedef {{x:number, y:number, z:number}}
 */
var HotspotTransformRotation;

/**
 * @typedef {{x:number, y:number, z:number}}
 */
var HotspotTransformScale;

/**
 * @typedef {{x:number, y:number, z:number}}
 */
var HotspotTransformOffset;

/**
 * @typedef {{x:number, y:number, z:number}}
 */
var HotspotTransformValuesConfig;

/**
 * @typedef {{points:(Array<THREE.Vector2>|undefined)}}
 */
var HotspotGeometryShape;

/**
 * @typedef {{width:(number|undefined), height:(number|undefined), widthSegments:(number|undefined), heightSegments:(number|undefined)}}
 */
var HotspotGeometryPlane;

/**
 * @typedef {{width:(number|undefined), height:(number|undefined), depth:(number|undefined), widthSegments:(number|undefined), heightSegments:(number|undefined), depthSegments:(number|undefined)}}
 */
var HotspotGeometryBox;

/**
 * @typedef {{radius:(number|undefined), widthSegments:(number|undefined), heightSegments:(number|undefined), phiStart:(number|undefined), phiLength:(number|undefined), thetaStart:(number|undefined), thetaLength:(number|undefined)}}
 */
var HotspotGeometrySphere;

/**
 * @typedef {{radiusTop:(number|undefined), radiusBottom:(number|undefined), height:(number|undefined), radiusSegments:(number|undefined), heightSegments:(number|undefined), openEnded:(boolean|undefined), thetaStart:(number|undefined), thetaLength:(number|undefined)}}
 */
var HotspotGeometryCylinder;