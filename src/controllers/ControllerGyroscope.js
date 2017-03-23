/**
 * This controller takes gyroscope events on screen to animate camera moves.
 *
 * @constructor FORGE.ControllerGyroscope
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {ControllerInstanceConfig} config - the configuration of the controller
 * @extends {FORGE.ControllerBase}
 */
FORGE.ControllerGyroscope = function(viewer, config)
{
    /**
     * Configuration
     * @name FORGE.ControllerGyroscope#_config
     * @type {ControllerInstanceConfig}
     * @private
     */
    this._config = config;

    /**
     * Position euler.
     * @name FORGE.ControllerGyroscope#_position
     * @type {THREE.Euler}
     * @private
     */
    this._position = null;

    /**
     * Order of the euler position depends on the device. By default the most common case is "XYZ"
     * @name FORGE.ControllerGyroscope#_order
     * @type {string}
     * @private
     */
    this._order = "YXZ";

    /**
     * Quaternion result of the position.
     * @name FORGE.ControllerGyroscope#_quaternion
     * @type {THREE.Quaternion}
     * @private
     */
    this._quaternion = null;

    FORGE.ControllerBase.call(this, viewer, "ControllerGyroscope");
};

FORGE.ControllerGyroscope.prototype = Object.create(FORGE.ControllerBase.prototype);
FORGE.ControllerGyroscope.prototype.constructor = FORGE.ControllerGyroscope;

/**
 * Boot sequence
 * @method FORGE.ControllerGyroscope#_boot
 * @private
 */
FORGE.ControllerGyroscope.prototype._boot = function()
{
    FORGE.ControllerBase.prototype._boot.call(this);

    this._position = new THREE.Euler();
    this._quaternion = new THREE.Quaternion();

    this._parseConfig(this._config);

    if (this._enabled === true)
    {
        this.enable();
    }
};

/**
 * Parse the configuration.
 * @method FORGE.ControllerGyroscope#_parseConfig
 * @param {ControllerInstanceConfig} config - configuration object to parse.
 */
FORGE.ControllerGyroscope.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._register();

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : false;
};

/**
 * Orientation change handler.
 * @method FORGE.ControllerGyroscope#_orientationChangeHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerGyroscope.prototype._orientationChangeHandler = function(event)
{
    if (this._viewer.controllers.enabled === false)
    {
        return;
    }

    var position = /** @type {DeviceOrientationEvent} */ (event.data);

    if (typeof position.alpha === "number" && typeof position.beta === "number" && typeof position.gamma === "number")
    {
        this._position.set(FORGE.Math.degToRad(position.beta), FORGE.Math.degToRad(position.alpha), -FORGE.Math.degToRad(position.gamma), "YXZ");

        // Compute the quaternion
        var quatPi2 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
        this._quaternion.setFromEuler(this._position);
        this._quaternion.multiply(quatPi2);
        this._quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0));
    }
};

/**
 * Enable controller
 * @method FORGE.ControllerGyroscope#enable
 */
FORGE.ControllerGyroscope.prototype.enable = function()
{
    FORGE.ControllerBase.prototype.enable.call(this);

    this._viewer.gyroscope.onOrientationChange.add(this._orientationChangeHandler, this);
};

/**
 * Disable controller
 * @method FORGE.ControllerGyroscope#disable
 */
FORGE.ControllerGyroscope.prototype.disable = function()
{
    FORGE.ControllerBase.prototype.disable.call(this);

    this._viewer.gyroscope.onOrientationChange.remove(this._orientationChangeHandler, this);
};

/**
 * Update routine.
 * @method FORGE.ControllerGyroscope#update
 */
FORGE.ControllerGyroscope.prototype.update = function()
{
    this._viewer.camera.quaternion = this._quaternion;
};

/**
 * Destroy squence
 * @method FORGE.ControllerGyroscope#destroy
 * @private
 */
FORGE.ControllerGyroscope.prototype.destroy = function()
{
    FORGE.ControllerBase.prototype.destroy.call(this);
};
