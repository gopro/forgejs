/**
 * Namespace to store all geometry methods.
 * @name FORGE.HotspotGeometry
 * @type {Object}
 */
FORGE.HotspotGeometry = {};

/**
 * @method FORGE.HotspotGeometry.PLANE
 * @param {HotspotGeometryPlane=} options
 * @return {THREE.PlaneBufferGeometry}
 */
FORGE.HotspotGeometry.PLANE = function(options)
{
    options = options || {};

    var width = options.width || 100;
    var height = options.height || 100;
    var widthSegments = options.widthSegments || 8;
    var heightSegments = options.heightSegments || 8;

    return new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
};

/**
 * @method FORGE.HotspotGeometry.BOX
 * @param {HotspotGeometryBox=} options
 * @return {THREE.BoxBufferGeometry}
 */
FORGE.HotspotGeometry.BOX = function(options)
{
    options = options || {};

    var width = options.width || 100;
    var height = options.height || 100;
    var depth = options.depth || 100;
    var widthSegments = options.widthSegments || 8;
    var heightSegments = options.heightSegments || 8;
    var depthSegments = options.depthSegments || 8;

    return new THREE.BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
};

/**
 * @method FORGE.HotspotGeometry.SPHERE
 * @param {HotspotGeometrySphere=} options
 * @return {THREE.SphereBufferGeometry}
 */
FORGE.HotspotGeometry.SPHERE = function(options)
{
    options = options || {};

    var radius = options.radius || 10;
    var widthSegments = options.widthSegments || 64;
    var heightSegments = options.heightSegments || 64;
    var phiStart = options.phiStart || 0;
    var phiLength = options.phiLength || 2 * Math.PI;
    var thetaStart = options.thetaStart || 0;
    var thetaLength = options.thetaLength || 2 * Math.PI;

    return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
};

/**
 * @method FORGE.HotspotGeometry.CYLINDER
 * @param {HotspotGeometryCylinder=} options
 * @return {THREE.CylinderBufferGeometry}
 */
FORGE.HotspotGeometry.CYLINDER = function(options)
{
    options = options || {};

    var radiusTop = options.radiusTop || 10;
    var radiusBottom = options.radiusBottom || 10;
    var height = options.height || 20;
    var radiusSegments = options.radiusSegments || 32;
    var heightSegments = options.heightSegments || 1;
    var openEnded = options.openEnded || false;
    var thetaStart = options.thetaStart || 0;
    var thetaLength = options.thetaLength || 2 * Math.PI;

    return new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength);
};
