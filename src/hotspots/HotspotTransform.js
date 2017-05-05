/**
 * HotspotTransform handle the parsing of the position, rotation and scale of a 3d Hotspot.
 *
 * @constructor FORGE.HotspotTransform
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotTransform = function()
{
    /**
     * The cartesian coordinates of a 3D object (x, y, z).
     * @name FORGE.HotspotTransform#_position
     * @type {HotspotTransformValues}
     * @private
     */
    this._position = new FORGE.HotspotTransformValues(this, 0, 0, -200);

    /**
     * The rotation of a 3D object (x, y, z).
     * @name FORGE.HotspotTransform#_rotation
     * @type {HotspotTransformValues}
     * @private
     */
    this._rotation = new FORGE.HotspotTransformValues(this, 0, 0, 0);

    /**
     * The scale of a 3D object.<br>
     * Is expressed in world units (x, y, z).
     * @name FORGE.HotspotTransform#_scale
     * @type {HotspotTransformValues}
     * @private
     */
    this._scale = new FORGE.HotspotTransformValues(this, 1, 1, 1);

    /**
     * onChange event dispatcher for transform change.
     * @name  FORGE.HotspotTransform#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;

    FORGE.BaseObject.call(this, "HotspotTransform");
};

FORGE.HotspotTransform.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotTransform.prototype.constructor = FORGE.HotspotTransform;

/**
 * Parse the config object, set default values where values are undefined.
 * @method FORGE.HotspotTransform#_parseConfig
 * @param {HotspotTransformConfig} config - The transform config to parse.
 * @return {boolean} return true if one of the values has changed
 * @private
 */
FORGE.HotspotTransform.prototype._parseConfig = function(config)
{
    var changed = false;

    if (typeof config.position !== "undefined")
    {
        var position = FORGE.Utils.extendSimpleObject(this._position.dump(), this._parsePosition(config.position));

        // // Try with xyz first
        // if (typeof config.position.x === "number" || typeof config.position.y === "number" || typeof config.position.z === "number")
        // {
        //     position.x = (typeof config.position.x === "number") ? config.position.x : 0;
        //     position.y = (typeof config.position.y === "number") ? config.position.y : 0;
        //     position.z = (typeof config.position.z === "number") ? config.position.z : -200;
        // }
        // else
        // {
        //     var radius = (typeof config.position.radius === "number") ? config.position.radius : 200;
        //     var theta = (typeof config.position.theta === "number") ? FORGE.Math.degToRad(config.position.theta) : 0;
        //     var phi = (typeof config.position.phi === "number") ? FORGE.Math.degToRad(config.position.phi) : 0;

        //     theta = FORGE.Math.wrap(Math.PI - theta, -Math.PI, Math.PI);

        //     var cartesian = new THREE.Vector3().setFromSpherical(FORGE.Utils.toTHREESpherical(radius, theta, phi));

        //     position.x = cartesian.x;
        //     position.y = cartesian.y;
        //     position.z = cartesian.z;
        // }

        if(FORGE.Utils.compareObjects(this._position.dump(), position) === false)
        {
            this._position.load(position, false);
            changed = true;
        }
    }

    if (typeof config.rotation !== "undefined")
    {
        var rotation = FORGE.Utils.extendSimpleObject({}, this._rotation.dump());

        this.rotation.x = (typeof config.rotation.x === "number") ? config.rotation.x : 0;
        this.rotation.y = (typeof config.rotation.y === "number") ? config.rotation.y : 0;
        this.rotation.z = (typeof config.rotation.z === "number") ? config.rotation.z : 0;

        if(FORGE.Utils.compareObjects(this._rotation.dump(), rotation) === false)
        {
            this._rotation.load(rotation, false);
            changed = true;
        }
    }

    if (typeof config.scale !== "undefined")
    {
        var scale = FORGE.Utils.extendSimpleObject({}, this._scale.dump());

        this.scale.x = (typeof config.scale.x === "number") ? FORGE.Math.clamp(config.scale.x, 0.000001, 100000) : 1;
        this.scale.y = (typeof config.scale.y === "number") ? FORGE.Math.clamp(config.scale.y, 0.000001, 100000) : 1;
        this.scale.z = (typeof config.scale.z === "number") ? FORGE.Math.clamp(config.scale.z, 0.000001, 100000) : 1;

        if(FORGE.Utils.compareObjects(this._scale.dump(), scale) === false)
        {
            this._scale.load(scale, false);
            changed = true;
        }
    }

    return changed;
};

/**
 * Parse the position object.
 * @method FORGE.HotspotTransform#_parsePosition
 * @param {HotspotTransformPosition} config - The transform position config to parse.
 * @private
 */
FORGE.HotspotTransform.prototype._parsePosition = function(config)
{
    var position =
    {
        x: 0,
        y: 0,
        z: -200
    };

    if (typeof config !== "undefined" && config !== null)
    {
        position.x = (typeof config.x === "number") ? config.x : 0;
        position.y = (typeof config.y === "number") ? config.y : 0;
        position.z = (typeof config.z === "number") ? config.z : -200;

        if(typeof config.radius === "number" && typeof config.theta === "number" && typeof config.phi === "number")
        {
            var radius = (typeof config.radius === "number") ? config.radius : 200;
            var theta = (typeof config.theta === "number") ? FORGE.Math.degToRad(config.theta) : 0;
            var phi = (typeof config.phi === "number") ? FORGE.Math.degToRad(config.phi) : 0;

            theta = FORGE.Math.wrap(Math.PI - theta, -Math.PI, Math.PI);

            var cartesian = new THREE.Vector3().setFromSpherical(FORGE.Utils.toTHREESpherical(radius, theta, phi));

            position.x = cartesian.x;
            position.y = cartesian.y;
            position.z = cartesian.z;
        }
    }

    return position;
};

/**
 * Notify the transform that a value has changed.
 * @method FORGE.HotspotTransform#notifyChange
 */
FORGE.HotspotTransform.prototype.notifyChange = function()
{
    if(this._onChange !== null)
    {
        this._onChange.dispatch();
    }
};


/**
 * Load a transform configuration.
 * @method FORGE.HotspotTransform#load
 * @param {HotspotTransformConfig} config - The transform config to load.
 */
FORGE.HotspotTransform.prototype.load = function(config, notify)
{
    var changed = this._parseConfig(config);

    if(notify !== false && changed === true)
    {
        this.notifyChange();
    }
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
    },

    set: function(value)
    {
        var config = { position: value };
        this._parseConfig(config);
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
    },

    set: function(value)
    {
        var config = { rotation: value };
        this._parseConfig(config);
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
    },

    set: function(value)
    {
        var config = { scale: value };
        this._parseConfig(config);
    }
});

/**
 * Get the onChange {@link FORGE.EventDispatcher}.
 * @name FORGE.HotspotTransform#onChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotTransform.prototype, "onChange",
{
    /** @this {FORGE.HotspotTransform} */
    get: function()
    {
        if (this._onChange === null)
        {
            this._onChange = new FORGE.EventDispatcher(this);
        }

        return this._onChange;
    }
});