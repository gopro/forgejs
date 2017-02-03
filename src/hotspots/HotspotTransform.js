/**
 * HotspotTransform handle the parsing of the position, rotation and scale of a 3d Hotspot.
 *
 * @constructor FORGE.HotspotTransform
 * @param {HotspotTransformPosition=} position - The spherical coordinates of a 3D object (radius, theta, phi)
 * @param {HotspotTransformRotation=} rotation - The rotation of a 3D object (x, y, z).
 * @param {HotspotTransformScale=} scale - The scale of a 3D object (x, y, z).
 * @extends {FORGE.BaseObject}
 *
 * @todo Add an option to keep the ratio of a texture or not.
 */
FORGE.HotspotTransform = function(position, rotation, scale)
{
    /**
     * The cartesian coordinates of a 3D object (x, y, z).
     * @name FORGE.HotspotTransform#_position
     * @type {HotspotTransformPosition}
     * @private
     */
    this._position = position ||
    {
        x: 0,
        y: 0,
        z: -200
    };

    /**
     * The rotation of a 3D object (x, y, z).
     * @name FORGE.HotspotTransform#_rotation
     * @type {HotspotTransformRotation}
     * @private
     */
    this._rotation = rotation ||
    {
        x: 0,
        y: 0,
        z: 0
    };

    /**
     * The scale of a 3D object.<br>
     * Is expressed in world units (x, y, z).
     * @name FORGE.HotspotTransform#_scale
     * @type {HotspotTransformScale}
     * @private
     */
    this._scale = scale || {
        x: 1,
        y: 1,
        z: 1
    };

    FORGE.BaseObject.call(this, "HotspotTransform");
};

FORGE.HotspotTransform.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotTransform.prototype.constructor = FORGE.HotspotTransform;

/**
 * Parse the config object, set default values where values are undefined.
 * @method FORGE.HotspotTransform#_parseConfig
 * @param {HotspotTransformConfig} config - The transform config to parse.
 * @private
 */
FORGE.HotspotTransform.prototype._parseConfig = function(config)
{
    if (typeof config.position !== "undefined")
    {
        // Try with xyz first
        if (typeof config.position.x === "number" || typeof config.position.y === "number" || typeof config.position.z === "number")
        {
            this._position.x = (typeof config.position.x === "number") ? config.position.x : 0;
            this._position.y = (typeof config.position.y === "number") ? config.position.y : 0;
            this._position.z = (typeof config.position.z === "number") ? config.position.z : -200;
        }
        else
        {
            var radius = (typeof config.position.radius === "number") ? config.position.radius : 200;
            var theta = (typeof config.position.theta === "number") ? FORGE.Math.degToRad(config.position.theta) : 0;
            var phi = (typeof config.position.phi === "number") ? FORGE.Math.degToRad(config.position.phi) : 0;

            theta = FORGE.Math.wrap(Math.PI - theta, -Math.PI, Math.PI);

            var cartesian = new THREE.Vector3().setFromSpherical(FORGE.Utils.toTHREESpherical(radius, theta, phi));

            this._position.x = cartesian.x;
            this._position.y = cartesian.y;
            this._position.z = cartesian.z;
        }
    }

    if (typeof config.rotation !== "undefined")
    {
        this._rotation.x = (typeof config.rotation.x === "number") ? config.rotation.x : 0;
        this._rotation.y = (typeof config.rotation.y === "number") ? config.rotation.y : 0;
        this._rotation.z = (typeof config.rotation.z === "number") ? config.rotation.z : 0;
    }
    else
    {
        this._rotation = this._getAutoRotationFromPosition(this._position);
    }

    if (typeof config.scale !== "undefined")
    {
        this._scale.x = (typeof config.scale.x === "number") ? FORGE.Math.clamp(config.scale.x, 0.000001, 100000) : 1;
        this._scale.y = (typeof config.scale.y === "number") ? FORGE.Math.clamp(config.scale.y, 0.000001, 100000) : 1;
        this._scale.z = (typeof config.scale.z === "number") ? FORGE.Math.clamp(config.scale.z, 0.000001, 100000) : 1;
    }
};

/**
 * Computes actual position to an automatic rotation in a way that the object will faces the camera.
 * @method FORGE.HotspotTransform#_getAutoRotationFromPosition
 * @param {HotspotTransformPosition} position - The position used to determine the rotation.
 * @private
 */
FORGE.HotspotTransform.prototype._getAutoRotationFromPosition = function(position)
{
    var rotation = {
        x: 0,
        y: 0,
        z: 0
    };

    if (typeof position !== "undefined")
    {
        // Apply inverse rotation angles to make the spot facing the camera

        var spherical = new THREE.Spherical().setFromVector3(new THREE.Vector3(this._position.x, this._position.y, this._position.z));

        // y-axis rotation: yaw
        rotation.y = -spherical.phi + Math.PI / 2;

        // x-axis rotation: pitch
        rotation.x = spherical.theta + Math.PI;
    }

    return rotation;
};

/**
 * Load a transform configuration.
 * @method FORGE.HotspotTransform#load
 * @param {HotspotTransformConfig} config - The transform config to load.
 */
FORGE.HotspotTransform.prototype.load = function(config)
{
    this._parseConfig(config);
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotTransform#destroy
 */
FORGE.HotspotTransform.prototype.destroy = function()
{
    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get/set the spherical position of the transform object
 * @name FORGE.HotspotTransform#position
 * @type {HotspotTransformPosition}
 */
Object.defineProperty(FORGE.HotspotTransform.prototype, "position",
{
    /** @this {FORGE.HotspotTransform} */
    get: function()
    {
        return this._position;
    }
});

/**
 * Get/set the rotation of the transform object
 * @name FORGE.HotspotTransform#rotation
 * @type {HotspotTransformRotation}
 */
Object.defineProperty(FORGE.HotspotTransform.prototype, "rotation",
{
    /** @this {FORGE.HotspotTransform} */
    get: function()
    {
        return this._rotation;
    }
});

/**
 * Get/set the scale of the transform object
 * @name FORGE.HotspotTransform#scale
 * @type {HotspotTransformScale}
 */
Object.defineProperty(FORGE.HotspotTransform.prototype, "scale",
{
    /** @this {FORGE.HotspotTransform} */
    get: function()
    {
        return this._scale;
    }
});