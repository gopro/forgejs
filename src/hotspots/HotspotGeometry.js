/**
 * Namespace to store all geometry methods.
 * @name FORGE.HotspotGeometry
 * @type {Object}
 */
FORGE.HotspotGeometry = {};

/**
 * @method FORGE.HotspotGeometry.SHAPE
 * @param {HotspotGeometryShape=} options
 * @return {THREE.ShapeBufferGeometry}
 */
FORGE.HotspotGeometry.SHAPE = function(options)
{
    options = options || {};

    // clean the points given to remove any duplicate when points are following each other
    if (Array.isArray(options.points))
    {
        options.points.push(options.points[0]);

        var a, b, res = [];
        for (var i = 0, ii = options.points.length - 1; i < ii; i++)
        {
            a = options.points[i];
            b = options.points[i + 1];

            if (a[0] !== b[0] || a[1] !== b[1])
            {
                res.push(a);
            }
        }

        options.points = res;
    }

    if (options.points.length < 3)
    {
        console.warn("FORGE.HotspotGeometry.SHAPE: the points given to draw the shape should be a least 3");
        options.points = null;
    }

    //Default points array that is a square
    if (Array.isArray(options.points) === false)
    {
        options.points =
        [
            [-10, 10],
            [10, 10],
            [10, -10],
            [-10, -10]
        ];
    }

    var points = [];
    for (var i = 0, ii = options.points.length; i < ii; i++)
    {
        var point = options.points[i];
        var x, y;

        if(Array.isArray(point) === true)
        {
            x = (typeof point[0] === "number" && isNaN(point[0]) === false) ? point[0] : 0;
            y = (typeof point[1] === "number" && isNaN(point[1]) === false) ? point[1] : 0;
            points.push(new THREE.Vector2(x, y));
        }
    }

    return new THREE.ShapeBufferGeometry(new THREE.Shape(points));
};

/**
 * @method FORGE.HotspotGeometry.PLANE
 * @param {HotspotGeometryPlane=} options
 * @return {THREE.PlaneBufferGeometry}
 */
FORGE.HotspotGeometry.PLANE = function(options)
{
    options = options || {};

    var width = options.width || 20;
    var height = options.height || 20;
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

    var width = options.width || 20;
    var height = options.height || 20;
    var depth = options.depth || 20;
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
