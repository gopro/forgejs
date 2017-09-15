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
     * @type {FORGE.HotspotTransformValues}
     * @private
     */
    this._position = null;

    /**
     * The rotation of a 3D object (x, y, z).
     * @name FORGE.HotspotTransform#_rotation
     * @type {FORGE.HotspotTransformValues}
     * @private
     */
    this._rotation = null;

    /**
     * The scale of a 3D object.<br>
     * Is expressed in world units (x, y, z).
     * @name FORGE.HotspotTransform#_scale
     * @type {FORGE.HotspotTransformValues}
     * @private
     */
    this._scale = null;

    /**
     * onChange event dispatcher for transform change.
     * @name  FORGE.HotspotTransform#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;

    FORGE.BaseObject.call(this, "HotspotTransform");

    this._boot();
};

FORGE.HotspotTransform.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotTransform.prototype.constructor = FORGE.HotspotTransform;

/**
 * Init HotspotTransform.
 * @method  FORGE.HotspotTransform#_boot
 * @private
 */
FORGE.HotspotTransform.prototype._boot = function()
{
    this._register();

    this._position = new FORGE.HotspotTransformValues(this._uid, 0, 0, -200);
    this._rotation = new FORGE.HotspotTransformValues(this._uid, 0, 0, 0);
    this._scale = new FORGE.HotspotTransformValues(this._uid, 1, 1, 1);
};

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

        if (FORGE.Utils.compareObjects(this._position.dump(), position) === false)
        {
            this._position.load(/** @type {HotspotTransformValuesConfig} */ (position), false);
            changed = true;
        }
    }

    if (typeof config.rotation !== "undefined")
    {
        var rotation = FORGE.Utils.extendSimpleObject({}, this._rotation.dump());

        rotation.x = (typeof config.rotation.x === "number") ? config.rotation.x : 0;
        rotation.y = (typeof config.rotation.y === "number") ? config.rotation.y : 0;
        rotation.z = (typeof config.rotation.z === "number") ? config.rotation.z : 0;

        if (FORGE.Utils.compareObjects(this._rotation.dump(), rotation) === false)
        {
            this._rotation.load(/** @type {HotspotTransformValuesConfig} */ (rotation), false);
            changed = true;
        }
    }

    if (typeof config.scale !== "undefined")
    {
        var scale = FORGE.Utils.extendSimpleObject({}, this._scale.dump());

        scale.x = (typeof config.scale.x === "number") ? FORGE.Math.clamp(config.scale.x, 0.000001, 100000) : 1;
        scale.y = (typeof config.scale.y === "number") ? FORGE.Math.clamp(config.scale.y, 0.000001, 100000) : 1;
        scale.z = (typeof config.scale.z === "number") ? FORGE.Math.clamp(config.scale.z, 0.000001, 100000) : 1;

        if (FORGE.Utils.compareObjects(this._scale.dump(), scale) === false)
        {
            this._scale.load(/** @type {HotspotTransformValuesConfig} */ (scale), false);
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
        if (typeof config.radius === "number" || typeof config.theta === "number" || typeof config.phi === "number")
        {
            var radius = (typeof config.radius === "number") ? config.radius : 200;
            var theta = (typeof config.theta === "number") ? FORGE.Math.degToRad(config.theta) : 0;
            var phi = (typeof config.phi === "number") ? FORGE.Math.degToRad(config.phi) : 0;

            position = FORGE.Math.sphericalToCartesian(radius, theta, phi);
        }
        else
        {
            position.x = (typeof config.x === "number") ? config.x : 0;
            position.y = (typeof config.y === "number") ? config.y : 0;
            position.z = (typeof config.z === "number") ? config.z : -200;
        }
    }

    return position;
};

/**
 * Update all the transform values from the mesh.
 * @method FORGE.HotspotTransform#updateFromObject3D
 * @param {THREE.Object3D} object - The 3D object to read data from.
 */
FORGE.HotspotTransform.prototype.updateFromObject3D = function(object)
{
    this._position.load(object.position);

    var rotation =
    {
        x: -FORGE.Math.radToDeg(object.rotation.x),
        y: FORGE.Math.radToDeg(object.rotation.y),
        z: FORGE.Math.radToDeg(object.rotation.z)
    };

    this._rotation.load(rotation);

    this._scale.load(object.scale);
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
 * @param {boolean} [notify=true] - Do we have to notify the change of the transform after the config loading
 */
FORGE.HotspotTransform.prototype.load = function(config, notify)
{
    var changed = this._parseConfig(config);

    if (notify !== false && changed === true)
    {
        this.notifyChange();
    }
};

/**
 * Dump the transform actual configuration
 * @method FORGE.HotspotTransform#dump
 * @return {HotspotTransformConfig} Return the hotspot transform configuration
 */
FORGE.HotspotTransform.prototype.dump = function()
{
    var dump =
    {
        position: this._position.dump(),
        rotation: this._rotation.dump(),
        scale: this._scale.dump()
    };

    return dump;
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

    /** @this {FORGE.HotspotTransform} */
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

    /** @this {FORGE.HotspotTransform} */
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

    /** @this {FORGE.HotspotTransform} */
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
