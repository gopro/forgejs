/**
 * Forge Hotspot Geometry
 * @constructor FORGE.HotspotGeometry
 */
FORGE.HotspotGeometry = function()
{
    /**
     * Geometry configuration
     * @name FORGE.HotspotGeometry#_config
     * @type {HotspotGeometryConfig}
     * @private
     */
    this._config = FORGE.HotspotGeometry.DEFAULT_CONFIG;

    /**
     * The geometry type
     * @name FORGE.HotspotGeometry#_type
     * @type {string}
     * @private
     */
    this._type = "";

    /**
     * The THREE geometry object
     * @name FORGE.HotspotGeometry#_geometry
     * @type {(THREE.Geometry|THREE.PlaneBufferGeometry|THREE.BoxBufferGeometry|THREE.SphereBufferGeometry|THREE.CylinderBufferGeometry|THREE.ShapeBufferGeometry)}
     * @private
     */
    this._geometry = null;

    /**
     * Event dispatcher for the onLoadComplete
     * @name FORGE.HotspotGeometry#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;
};

/**
 * @name FORGE.HotspotGeometry.DEFAULT_CONFIG
 * @type {HotspotGeometryConfig}
 * @const
 */
FORGE.HotspotGeometry.DEFAULT_CONFIG =
{
    type: "plane",

    options:
    {
        width: 20,
        height: 20,
        widthSegments: 8,
        heightSegments: 8
    },

    offset:
    {
        x: 0,
        y: 0,
        z: 0
    }
};

/**
 * Parse the hotspot geometry config
 * @method FORGE.HotspotGeometry#_parseConfig
 * @param {HotspotGeometryConfig} config
 */
FORGE.HotspotGeometry.prototype._parseConfig = function(config)
{
    this._type = config.type;

    var options = config.options;

    var offset = (typeof config.offset !== "undefined") ? config.offset : { x: 0, y: 0, z: 0 };

    switch (this._type)
    {
        case FORGE.HotspotGeometryType.PLANE:
            this._geometry = this._createPlane(options);
            break;

        case FORGE.HotspotGeometryType.BOX:
            this._geometry = this._createBox(options);
            break;

        case FORGE.HotspotGeometryType.SPHERE:
            this._geometry = this._createSphere(options);
            break;

        case FORGE.HotspotGeometryType.CYLINDER:
            this._geometry = this._createCylinder(options);
            break;

        case FORGE.HotspotGeometryType.SHAPE:
            this._geometry = this._createShape(options);
            break;

        default:
            this._geometry = this._createPlane(options);
            break;
    }

    // add offset values
    this._geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
};

/**
 * @method FORGE.HotspotGeometry#_createPlane
 * @param {HotspotGeometryPlane=} options
 * @return {THREE.PlaneBufferGeometry}
 * @private
 */
FORGE.HotspotGeometry.prototype._createPlane = function(options)
{
    options = options || {};

    var width = options.width || 20;
    var height = options.height || 20;
    var widthSegments = options.widthSegments || 8;
    var heightSegments = options.heightSegments || 8;

    return new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
};

/**
 * @method FORGE.HotspotGeometry#_createBox
 * @param {HotspotGeometryBox=} options
 * @return {THREE.BoxBufferGeometry}
 * @private
 */
FORGE.HotspotGeometry.prototype._createBox = function(options)
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
 * @method FORGE.HotspotGeometry#_createSphere
 * @param {HotspotGeometrySphere=} options
 * @return {THREE.SphereBufferGeometry}
 * @private
 */
FORGE.HotspotGeometry.prototype._createSphere = function(options)
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
 * @method FORGE.HotspotGeometry#_createCylinder
 * @param {HotspotGeometryCylinder=} options
 * @return {THREE.CylinderBufferGeometry}
 * @private
 */
FORGE.HotspotGeometry.prototype._createCylinder = function(options)
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

/**
 * @method FORGE.HotspotGeometry#_createShape
 * @param {HotspotGeometryShape=} options
 * @return {THREE.ShapeBufferGeometry}
 * @private
 */
FORGE.HotspotGeometry.prototype._createShape = function(options)
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
 * Load a hotspot geometry config
 * @method FORGE.HotspotGeometry#load
 * @param {HotspotGeometryConfig} config
 */
FORGE.HotspotGeometry.prototype.load = function(config)
{
    if (typeof config !== "undefined" && typeof config.type === "string")
    {
        this._config = config;
    }
    else
    {
        this._config = /** @type {HotspotGeometryConfig} */ (FORGE.Utils.extendSimpleObject({}, FORGE.HotspotGeometry.DEFAULT_CONFIG));
    }

    this._parseConfig(this._config);

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }
};

/**
 * Dump the geometry configuration
 * @method FORGE.HotspotGeometry#dump
 * @return {HotspotGeometryConfig} Return the actual hotspot geometry config
 */
FORGE.HotspotGeometry.prototype.dump = function()
{
    var dump =
    {
        type: this._type
    };

    var options = {};

    switch(this._type)
    {
        case FORGE.HotspotGeometryType.PLANE:
        case FORGE.HotspotGeometryType.BOX:
        case FORGE.HotspotGeometryType.SPHERE:
        case FORGE.HotspotGeometryType.CYLINDER:
            options = this._geometry.parameters;
            break;

        case FORGE.HotspotGeometryType.SHAPE:

            var points = [];
            if(Array.isArray(this._geometry.parameters.shapes.curves) === true)
            {
                var c = this._geometry.parameters.shapes.curves;

                points.push([c[0].v1.x, c[0].v1.y]);
                points.push([c[0].v2.x, c[0].v2.y]);

                for(var i = 1, ii = c.length; i < ii; i++)
                {
                    points.push([c[i].v2.x, c[i].v2.y]);
                }
            }
            else
            {
                points = this._config.options.points;
            }

            options = { points: points };

            break;
    }

    dump.options = options;

    return dump;
};

/**
 * Destroy sequence
 * @method FORGE.HotspotGeometry#destroy
 */
FORGE.HotspotGeometry.prototype.destroy = function()
{
    if(this._geometry !== null)
    {
        this._geometry.dispose();
        this._geometry = null;
    }

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }
};

/**
 * Geometry type accessor
 * @name FORGE.HotspotGeometry#type
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.HotspotGeometry.prototype, "type",
{
    /** @this {FORGE.HotspotGeometry} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Geometry accessor
 * @name FORGE.HotspotGeometry#geometry
 * @readonly
 * @type {THREE.Geometry}
 */
Object.defineProperty(FORGE.HotspotGeometry.prototype, "geometry",
{
    /** @this {FORGE.HotspotGeometry} */
    get: function()
    {
        return this._geometry;
    }
});

/**
 * Get the onLoadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.HotspotGeometry#onLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotGeometry.prototype, "onLoadComplete",
{
    /** @this {FORGE.HotspotGeometry} */
    get: function()
    {
        if (this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});
