/**
 * A FORGE.Camera tells the renderer wich part of the scene to render.
 *
 * @constructor FORGE.Camera
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Viewport} viewport - {@link FORGE.Viewport} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Camera = function(viewer, viewport)
{
    /**
     * The viewer reference.
     * @name FORGE.Camera#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The viewport reference.
     * @name FORGE.Camera#_viewport
     * @type {FORGE.Viewport}
     * @private
     */
    this._viewport = viewport;

    /**
     * Camera configuration that has been loaded.
     * @name  FORGE.Camera#_config
     * @type {?CameraConfig}
     * @private
     */
    this._config = null;

    /**
     * The yaw value in radians.
     * @name FORGE.Camera#_yaw
     * @type {number}
     * @private
     */
    this._yaw = 0;

    /**
     * The yaw minimum value in radians.
     * @name FORGE.Camera#_yawMin
     * @type {number}
     * @private
     */
    this._yawMin = -Infinity;

    /**
     * The yaw maximum value in radians.
     * @name FORGE.Camera#_yawMax
     * @type {number}
     * @private
     */
    this._yawMax = Infinity;

    /**
     * The pitch value in radians.
     * @name FORGE.Camera#_pitch
     * @type {number}
     * @private
     */
    this._pitch = 0;

    /**
     * The pitch minimum value in radians.
     * @name FORGE.Camera#_pitchMin
     * @type {number}
     * @private
     */
    this._pitchMin = -Infinity;

    /**
     * The pitch maximum value  in radians.
     * @name FORGE.Camera#_pitchMax
     * @type {number}
     * @private
     */
    this._pitchMax = Infinity;

    /**
     * The roll value in radians.
     * @name FORGE.Camera#_roll
     * @type {number}
     * @private
     */
    this._roll = 0;

    /**
     * The roll minimum value  in radians.
     * @name FORGE.Camera#_rollMin
     * @type {number}
     * @private
     */
    this._rollMin = -Infinity;

    /**
     * The roll maximum value in radians.
     * @name FORGE.Camera#_rollMax
     * @type {number}
     * @private
     */
    this._rollMax = Infinity;

    /**
     * The fov value in radians.
     * @name FORGE.Camera#_fov
     * @type {number}
     * @private
     */
    this._fov = 90;

    /**
     * The fov minimum value in radians.
     * @name FORGE.Camera#_fovMin
     * @type {number}
     * @private
     */
    this._fovMin = 0;

    /**
     * The fov maximum value in radians.
     * @name FORGE.Camera#_fovMax
     * @type {number}
     * @private
     */
    this._fovMax = Infinity;

    /**
     * Parallax setting
     * Value range is between 0 and 1
     * @name FORGE.Camera#_parallax
     * @type {number}
     * @private
     */
    this._parallax = 0;

    /**
     * Does the camera keep its orientation between scenes?
     * @name FORGE.Camera#_keep
     * @type {boolean}
     * @private
     */
    this._keep = false;

    /**
     * The modelview rotation matrix.
     * @name FORGE.Camera#_modelView
     * @type {THREE.Matrix4}
     * @private
     */
    this._modelView = null;

    /**
     * The inverse of the modelview rotation matrix.
     * @name FORGE.Camera#_modelViewInverse
     * @type {THREE.Matrix4}
     * @private
     */
    this._modelViewInverse = null;

    /**
     * Rotation quaternion of the camera
     * @name FORGE.Camera#_quaternion
     * @type {THREE.Quaternion}
     * @private
     */
    this._quaternion = null;

    /**
     * Three Perspective Camera object
     * @name FORGE.Camera#_main
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._main = null;

    /**
     * Three Orthographic Camera object
     * @name FORGE.Camera#_flat
     * @type {THREE.OrthographicCamera}
     * @private
     */
    this._flat = null;

    /**
     * Three Perspective Camera radius (depends on parallax)
     * @name FORGE.Camera#_radius
     * @type {number}
     * @private
     */
    this._radius = 0;

    /**
     * Camera animation object
     * @name FORGE.Camera#_cameraAnimation
     * @type {FORGE.CameraAnimation}
     * @private
     */
    this._cameraAnimation = null;

    /**
     * Camera gaze cursor
     * @name FORGE.Camera#_gaze
     * @type {FORGE.CameraGaze}
     * @private
     */
    this._gaze = null;

    /**
     * Is the camera have load its configuration at least one time? For keep feature.
     * @name FORGE.Camera#_initialized
     * @type {boolean}
     * @private
     */
    this._initialized = false;

    /**
     * Log the camera changes between two updates.
     * @name FORGE.Camera#_changelog
     * @type {?CameraChangelog}
     * @private
     */
    this._changelog = null;

    /**
     * On camera change event dispatcher.
     * @name FORGE.Camera#_onChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onChange = null;

    /**
     * On camera orientation change event dispatcher.
     * @name FORGE.Camera#_onOrientationChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onOrientationChange = null;

    /**
     * On camera fov change event dispatcher.
     * @name FORGE.Camera#_onFovChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onFovChange = null;

    FORGE.BaseObject.call(this, "Camera");

    this._boot();
};

FORGE.Camera.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Camera.prototype.constructor = FORGE.Camera;

/**
 * Camera default radius for parallax.
 * @name FORGE.Camera.RADIUS
 * @type {number}
 * @const
 */
FORGE.Camera.RADIUS = 50;

/**
 * Camera default configuration in degrees like in the json configuration.
 * @name FORGE.Camera.DEFAULT_CONFIG
 * @type {CameraConfig}
 * @const
 */
FORGE.Camera.DEFAULT_CONFIG =
{
    keep: false,
    parallax: 0,
    yaw:
    {
        min: -Infinity,
        max: Infinity,
        default: 0
    },
    pitch:
    {
        min: -Infinity,
        max: Infinity,
        default: 0
    },
    roll:
    {
        min: -Infinity,
        max: Infinity,
        default: 0
    },
    fov:
    {
        min: 0,
        max: Infinity,
        default: 90
    },
    gaze:
    {
        delay: 2000,
        cursor:
        {
            innerRadius: 0.02,
            outerRadius: 0.04,
            color: 0xffffff,
            opacity: 0.5
        },
        progress:
        {
            innerRadius: 0.02,
            outerRadius: 0.04,
            color: 0xff0000,
            opacity: 0.5
        }
    }
};

/**
 * Init sequence.
 * @method FORGE.Camera#_boot
 * @private
 */
FORGE.Camera.prototype._boot = function()
{
    this._viewport.onReady.addOnce(this._viewportReadyHandler, this);

    this._resetChangelog();

    this._modelView = new THREE.Matrix4();
    this._modelViewInverse = new THREE.Matrix4();
    this._quaternion = new THREE.Quaternion();

    this._gaze = new FORGE.CameraGaze(this._viewer, FORGE.Camera.DEFAULT_CONFIG.gaze);

    this._createMainCamera();
    this._createFlatCamera();
};

/**
 * Viewport ready handler.
 * @method FORGE.Camera#_viewportReadyHandler
 * @private
 */
FORGE.Camera.prototype._viewportReadyHandler = function()
{
    this._viewport.view.onChange.add(this._updateInternals, this);

    this._parseConfig(this._config);
};

/**
 * Parse a camera configuration.
 * @method FORGE.Camera#_parseConfig
 * @param {?CameraConfig} config - The camera configuration to parse.
 * @private
 */
FORGE.Camera.prototype._parseConfig = function(config)
{
    this._parallax = config.parallax;
    this._radius = this._parallax * FORGE.Camera.RADIUS;
    this._keep = config.keep;

    if(this._keep === true && this._initialized === true)
    {
        return;
    }

    if (typeof config.fov.min === "number")
    {
        this._fovMin = FORGE.Math.degToRad(config.fov.min);
    }

    if (typeof config.fov.max === "number")
    {
        this._fovMax = FORGE.Math.degToRad(config.fov.max);
    }

    if (typeof config.fov.default === "number")
    {
        this._setFov(config.fov.default, FORGE.Math.DEGREES);
    }

    if (typeof config.yaw.min === "number")
    {
        this._yawMin = FORGE.Math.degToRad(config.yaw.min);
    }

    if (typeof config.yaw.max === "number")
    {
        this._yawMax = FORGE.Math.degToRad(config.yaw.max);
    }

    if (typeof config.yaw.default === "number")
    {
        this._setYaw(config.yaw.default, FORGE.Math.DEGREES);
    }

    if (typeof config.pitch.min === "number")
    {
        this._pitchMin = FORGE.Math.degToRad(config.pitch.min);
    }

    if (typeof config.pitch.max === "number")
    {
        this._pitchMax = FORGE.Math.degToRad(config.pitch.max);
    }

    if (typeof config.pitch.default === "number")
    {
        this._setPitch(config.pitch.default, FORGE.Math.DEGREES);
    }

    if (typeof config.roll.min === "number")
    {
        this._rollMin = FORGE.Math.degToRad(config.roll.min);
    }

    if (typeof config.roll.max === "number")
    {
        this._rollMax = FORGE.Math.degToRad(config.roll.max);
    }

    if (typeof config.roll.default === "number")
    {
        this._setRoll(config.roll.default, FORGE.Math.DEGREES);
    }

    this._updateFromEuler();

    this._updateMainCamera();
    this._updateFlatCamera();

    this._gaze.load(/** @type {CameraGazeConfig} */ (config.gaze));

    this._initialized = true;
};

/**
 * Reset the camera changelog.
 * @method FORGE.Camera#_resetChangelog
 * @private
 */
FORGE.Camera.prototype._resetChangelog = function()
{
    this._changelog =
    {
        yaw: false,
        pitch: false,
        roll: false,
        fov: false
    };
};

/**
 * Init the THREE PerspectiveCamera.
 * @method FORGE.Camera#_createMainCamera
 * @private
 */
FORGE.Camera.prototype._createMainCamera = function()
{
    this._main = new THREE.PerspectiveCamera(this._fov, this._viewport.size.ratio, FORGE.Renderer.DEPTH_NEAR, 2 * FORGE.Renderer.DEPTH_FAR);
    this._main.name = "CameraMain";
    this._main.matrixAutoUpdate = false;
};

/**
 * Init the THREE OrthographicCamera.
 * @method FORGE.Camera#_createFlatCamera
 * @private
 */
FORGE.Camera.prototype._createFlatCamera = function()
{
    this._flat = new THREE.OrthographicCamera(
        -1000, 1000,
        1000, -1000,
        FORGE.Renderer.DEPTH_NEAR,
        FORGE.Renderer.DEPTH_FAR);

    this._flat.name = "CameraFlat";
    this._flat.matrixAutoUpdate = false;
};

/**
 * Apply Camera change internally.
 * @method FORGE.Camera#_updateFromEuler
 * @private
 */
FORGE.Camera.prototype._updateFromEuler = function()
{
    this._modelView = FORGE.Math.eulerToRotationMatrix(this._yaw, this._pitch, this._roll, false);

    this._modelViewInverse = this._modelView.clone().transpose();

    this._quaternion = FORGE.Quaternion.fromEuler(this._yaw, this._pitch, this._roll);

    // complete camera update
    this._updateComplete();
};

/**
 * Camera update internals after quaternion has been set
 * @method FORGE.Camera#_updateFromQuaternion
 * @private
 */
FORGE.Camera.prototype._updateFromQuaternion = function()
{
    this._modelView = FORGE.Quaternion.toRotationMatrix(this._quaternion);

    this._modelViewInverse = this._modelView.clone().transpose();

    var euler = FORGE.Quaternion.toEuler(this._quaternion);

    this._setAll(euler.yaw, euler.pitch, euler.roll, null, FORGE.Math.RADIANS);
};

/**
 * Camera update internals after modelview matrix has been set.
 * @method FORGE.Camera#_updateFromMatrix
 * @private
 */
FORGE.Camera.prototype._updateFromMatrix = function()
{
    this._modelViewInverse = this._modelView.clone().transpose();

    var euler = FORGE.Math.rotationMatrixToEuler(this._modelView);

    this._setAll(euler.yaw, euler.pitch, euler.roll, null, FORGE.Math.RADIANS);

    this._quaternion = FORGE.Quaternion.fromRotationMatrix(this._modelView);
};

/**
 * THREE Perspective camera update internals after modelview matrix has been set.
 * @method FORGE.Camera#_updateMainCamera
 * @private
 */
FORGE.Camera.prototype._updateMainCamera = function()
{
    if (this._main === null || this._viewport.view.current === null)
    {
        return;
    }

    var mat = new THREE.Matrix4().copy(this._modelViewInverse);

    if (this._parallax !== 0)
    {
        mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -this._radius));
    }

    // Now set the object quaternion (side effect: it will override the world matrix)
    this._main.quaternion.setFromRotationMatrix(mat);

    this._main.matrixWorld = mat;
    this._main.matrixWorldInverse.getInverse(mat);

    this._main.fov = FORGE.Math.radToDeg(this._viewport.view.current.getProjectionFov());
    this._main.aspect = this._viewport.size.ratio;
    this._main.updateProjectionMatrix();
};

/**
 * THREE Orthographic camera update internals.
 * @method FORGE.Camera#_updateFlatCamera
 * @private
 */
FORGE.Camera.prototype._updateFlatCamera = function()
{
    if (this._flat === null)
    {
        return;
    }

    var camW = this._flat.right - this._flat.left;
    var camH = this._flat.top - this._flat.bottom;

    this._flat.left = this._flat.position.x - camW / 2;
    this._flat.right = this._flat.position.x + camW / 2;

    this._flat.top = this._flat.position.y + camH / 2;
    this._flat.bottom = this._flat.position.y - camH / 2;

    var view = this._viewport.view.current;
    var max = Math.min(view.fovMax, this._fovMax);

    this._flat.zoom = max / this._fov;

    this._flat.updateProjectionMatrix();
};

/**
 * Final method call to complete camera update, ensure main camera is up to date.
 * @method FORGE.Camera#_updateComplete
 * @private
 */
FORGE.Camera.prototype._updateComplete = function()
{
    var changed = false;

    if(this._changelog.yaw === true || this._changelog.pitch === true || this._changelog.roll === true)
    {
        changed = true;

        if (this._onOrientationChange !== null)
        {
            this._onOrientationChange.dispatch(null, true);
        }
    }

    if(this._changelog.fov === true)
    {
        changed = true;

        if (this._onFovChange !== null)
        {
            this._onFovChange.dispatch(null, true);
        }
    }


    if (changed === true && this._onChange !== null)
    {
        this._onChange.dispatch(null, true);
    }
};

/**
 * Internal setter for yaw, take a value and a unit. Default unit is radians.
 * @method FORGE.Camera#_setYaw
 * @param {?number=} value - The value you want to set for yaw.
 * @param {string=} [unit="radians"] - The unit you use to set the yaw value.
 * @return {boolean} Returns true if the value has changed.
 * @private
 */
FORGE.Camera.prototype._setYaw = function(value, unit)
{
    if (typeof value !== "number" || isNaN(value) === true)
    {
        return false;
    }

    // If unit is not well defined, default will be radians
    unit = (unit === FORGE.Math.DEGREES || unit === FORGE.Math.RADIANS) ? unit : FORGE.Math.RADIANS;

    // Convert value in radians for clamp if unit is in degrees.
    value = (unit === FORGE.Math.DEGREES) ? FORGE.Math.degToRad(value) : value;

    // Wrap the value between -PI and +PI
    value = FORGE.Math.wrap(value, -Math.PI, Math.PI);

    var boundaries = this._getYawBoundaries();

    var yaw = FORGE.Math.clamp(value, boundaries.min, boundaries.max);

    var changed = this._yaw !== yaw;

    this._changelog.yaw = changed;

    this._yaw = yaw;

    return changed;
};

/**
 * Compute the yaw boundaries with yaw min and yaw max.
 * @method FORGE.Camera#_getYawBoundaries
 * @param {boolean=} relative - do we need to get the yaw relative to the current fov (default true)
 * @param {number=} fov - specify a fov if we do not want to use the current one (useful for simulation)
 * @return {CameraBoundaries} Returns the min and max yaw computed from the camera configuration and the view limits.
 * @private
 */
FORGE.Camera.prototype._getYawBoundaries = function(relative, fov)
{
    var min = this._yawMin;
    var max = this._yawMax;

    fov = fov || this._fov;

    if (relative !== false && min !== max)
    {
        var halfHFov = 0.5 * fov * this._viewport.size.ratio;
        min += halfHFov;
        max -= halfHFov;
    }

    var view = this._viewport.view.current;
    min = Math.max(view.yawMin, min);
    max = Math.min(view.yawMax, max);

    return { min: min, max: max };
};

/**
 * Internal setter for pitch, take a value and a unit. Default unit is radians.
 * @method FORGE.Camera#_setPitch
 * @param {?number=} value - The value you want to set for pitch.
 * @param {string=} [unit="radians"] - The unit you use to set the pitch value.
 * @return {boolean} Returns true if the value has changed.
 * @private
 */
FORGE.Camera.prototype._setPitch = function(value, unit)
{
    if (typeof value !== "number" || isNaN(value) === true)
    {
        return false;
    }

    var oldPitch = this._pitch;

    // If unit is not well defined, default will be radians
    unit = (unit === FORGE.Math.DEGREES || unit === FORGE.Math.RADIANS) ? unit : FORGE.Math.RADIANS;

    // Convert value in radians for clamp if unit is in degrees.
    value = (unit === FORGE.Math.DEGREES) ? FORGE.Math.degToRad(value) : value;

    // Wrap the value between -PI and +PI
    value = FORGE.Math.wrap(value, -Math.PI, Math.PI);

    var boundaries = this._getPitchBoundaries();

    var pitch = FORGE.Math.clamp(value, boundaries.min, boundaries.max);

    // If old view accepted pitch out of [-PI/2 , PI/2] and new one does not,
    // check if old pitch value was in authorized range and if not, set to zero
    if (Math.abs(oldPitch) > Math.PI / 2 && Math.abs(pitch) === Math.PI / 2)
    {
        pitch = 0;
    }

    var changed = this._pitch !== pitch;

    this._changelog.pitch = changed;

    this._pitch = pitch;

    return changed;
};

/**
 * Compute the pitch boundaries with pitch min and pitch max.
 * @method FORGE.Camera#_getPitchBoundaries
 * @param {boolean=} relative - do we need to get the pitch relative to the current fov (default true)
 * @param {number=} fov - specify a fov if we do not want to use the current one (useful for simulation)
 * @return {CameraBoundaries} Returns the min and max pitch computed from the camera configuration and the view limits.
 * @private
 */
FORGE.Camera.prototype._getPitchBoundaries = function(relative, fov)
{
    var min = this._pitchMin;
    var max = this._pitchMax;

    fov = fov || this._fov;

    if (relative !== false && min !== max)
    {
        var halfFov = 0.5 * fov;
        min += halfFov;
        max -= halfFov;
    }

    var view = this._viewport.view.current;
    min = Math.max(view.pitchMin, min);
    max = Math.min(view.pitchMax, max);

    return { min: min, max: max };
};

/**
 * Internal setter for roll, take a value and a unit. Default unit is radians.
 * @method FORGE.Camera#_setRoll
 * @param {?number=} value - The value you want to set for roll.
 * @param {string=} [unit="radians"] - The unit you use to set the roll value.
 * @return {boolean} Returns true if the value has changed.
 * @private
 */
FORGE.Camera.prototype._setRoll = function(value, unit)
{
    if (typeof value !== "number" || isNaN(value) === true)
    {
        return false;
    }

    // If unit is not well defined, default will be radians
    unit = (unit === FORGE.Math.DEGREES || unit === FORGE.Math.RADIANS) ? unit : FORGE.Math.RADIANS;

    // Convert value in radians for clamp if unit is in degrees.
    value = (unit === FORGE.Math.DEGREES) ? FORGE.Math.degToRad(value) : value;

    // Wrap the value between -PI and +PI
    value = FORGE.Math.wrap(value, -Math.PI, Math.PI);

    var boundaries = this._getRollBoundaries();

    var roll = FORGE.Math.clamp(value, boundaries.min, boundaries.max);

    var changed = this._roll !== roll;

    this._changelog.roll = changed;

    this._roll = roll;

    return changed;
};

/**
 * Compute the roll boundaries with yaw min and yaw max.
 * @method FORGE.Camera#_getRollBoundaries
 * @return {CameraBoundaries} Returns the min and max roll computed from the camera configuration and the view limits.
 * @private
 */
FORGE.Camera.prototype._getRollBoundaries = function()
{
    var view = this._viewport.view.current;
    var min = Math.max(view.rollMin, this._rollMin);
    var max = Math.min(view.rollMax, this._rollMax);

    return { min: min, max: max };
};

/**
 * Internal setter for fov (field of view), take a value and a unit. Default unit is radians.
 * @method FORGE.Camera#_setFov
 * @param {?number=} value - The value you want to set for fov.
 * @param {string=} [unit="radians"] - The unit you use to set the fov value.
 * @return {boolean} Returns true if the value has changed.
 * @private
 */
FORGE.Camera.prototype._setFov = function(value, unit)
{
    if (typeof value !== "number" || isNaN(value) === true)
    {
        return false;
    }

    // If unit is not well defined, default will be radians
    unit = (unit === FORGE.Math.DEGREES || unit === FORGE.Math.RADIANS) ? unit : FORGE.Math.RADIANS;

    // Convert value in radians for clamp if unit is in degrees.
    value = (unit === FORGE.Math.DEGREES) ? FORGE.Math.degToRad(value) : value;

    var boundaries = this._getFovBoundaries();

    var fov = FORGE.Math.clamp(value, boundaries.min, boundaries.max);

    var changed = this._fov !== fov;

    this._changelog.fov = changed;

    this._fov = fov;

    if (changed)
    {
        this._setYaw(this._yaw);
        this._setPitch(this._pitch);
    }

    return changed;
};

/**
 * Compute the fov boundaries with yaw min and yaw max.
 * @method FORGE.Camera#_getFovBoundaries
 * @return {CameraBoundaries} Returns the min and max fov computed from the camera configuration and the view limits.
 * @private
 */
FORGE.Camera.prototype._getFovBoundaries = function()
{
    var min = this._fovMin;
    var max = this._fovMax;
    var view = this._viewport.view.current;


    /*
    // if JSON specifies a fov min (not default 0 value), use it
    // useful for multiresolution where fov limit will be computed depending
    // on max level of resolution available and stored in JSON
    if (this._viewport.renderer.backgroundRenderer !== null && "fovMin" in this._viewport.renderer.backgroundRenderer)
    {
        min = Math.max(this._viewport.renderer.backgroundRenderer.fovMin, min);
    }
    else if (min === 0)
    {
        if (view !== null)
        {
            min = Math.max(view.fovMin, min);
            max = Math.min(view.fovMax, max);
        }
    }

    if (view !== null && view.type !== FORGE.ViewType.FLAT)
    {
        // if there are limits, we may need to limit the maximum fov
        var pitchBoundaries = this._getPitchBoundaries(false);
        var pitchRange = pitchBoundaries.max - pitchBoundaries.min;

        if (pitchRange > 0)
        {
            max = Math.min(pitchRange, max);
        }

        var yawBoundaries = this._getYawBoundaries(false);
        var yawRange = yawBoundaries.max - yawBoundaries.min;
        yawRange /= this._viewport.size.ratio;

        if (yawRange > 0)
        {
            max = Math.min(yawRange, max);
        }

        // get the tiniest
        if (max < min)
        {
            min = max;
        }
    }
    */

    return { min: min, max: max };
};

/**
 * Set all camera angles in one call (yaw, pitch, roll, fov)
 * @method FORGE.Camera#_setAll
 * @param {?number=} yaw - The yaw value you want to set.
 * @param {?number=} pitch - The pitch value you want to set.
 * @param {?number=} roll - The roll value you want to set.
 * @param {?number=} fov - The fov value you want to set.
 * @param {string=} unit - The unit you use for all the previous arguments (FORGE.Math.DEGREES or FORGE.Math.RADIANS)
 * @return {boolean} Returns true if any values has changed.
 * @private
 */
FORGE.Camera.prototype._setAll = function(yaw, pitch, roll, fov, unit)
{
    var fovChanged = this._setFov(fov, unit);
    var yawChanged = this._setYaw(yaw, unit);
    var pitchChanged = this._setPitch(pitch, unit);
    var rollChanged = this._setRoll(roll, unit);

    return (yawChanged === true || pitchChanged === true || rollChanged === true || fovChanged === true);
};

/**
 * Update internals after a remote component has changed something
 * @method FORGE.Camera#_updateInternals
 * @private
 */
FORGE.Camera.prototype._updateInternals = function()
{
    // Force camera to update its values to bound it in new boundaries after view change
    var changed = this._setAll(this._yaw, this._pitch, this._roll, this._fov);

    if (changed === true)
    {
        this._updateFromEuler();
    }
};

/**
 * Load a camera configuration.
 * @method FORGE.Camera#load
 * @param {CameraConfig} config - The camera configuration to load.
 */
FORGE.Camera.prototype.load = function(config)
{
    this._config = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.Camera.DEFAULT_CONFIG, config));

    if(this._viewport.ready === true)
    {
        this._parseConfig(this._config);
    }
};

/**
 * Set the Camera to look at a specified point into the yaw/pitch/roll space.
 * @method FORGE.Camera#lookAt
 * @param {?number=} yaw Euler yaw angle (deg)
 * @param {?number=} pitch Euler pitch angle (deg)
 * @param {?number=} roll Euler roll angle (deg)
 * @param {?number=} fov Field of view (deg)
 * @param {number=} durationMS - Rotation animation duration ms (undefined or zero means immediat effect)
 * @param {boolean=} [cancelRoll=false] - If set to true, roll will be cancelled (always at 0).<br> If false an auto roll movement will be done by the camera for a more natural movement effect.
 * @param {string=} easing - Easing method name (default to {@link FORGE.EasingType.LINEAR}).
 */
FORGE.Camera.prototype.lookAt = function(yaw, pitch, roll, fov, durationMS, cancelRoll, easing)
{
    if (typeof durationMS !== "number" || durationMS === 0)
    {
        var changed = this._setAll(yaw, pitch, roll, fov, FORGE.Math.DEGREES);

        if (changed === true)
        {
            this._updateFromEuler();
        }
    }
    else
    {
        if (fov !== null && typeof fov !== "undefined")
        {
            var fovBoundaries = this._getFovBoundaries();

            fov = FORGE.Math.clamp(fov, FORGE.Math.radToDeg(fovBoundaries.min), FORGE.Math.radToDeg(fovBoundaries.max));

            if (yaw !== null && typeof yaw !== "undefined")
            {
                var yawBoundaries = this._getYawBoundaries(true, FORGE.Math.degToRad(fov));
                yaw = FORGE.Math.clamp(yaw, FORGE.Math.radToDeg(yawBoundaries.min), FORGE.Math.radToDeg(yawBoundaries.max));
            }

            if (pitch !== null && typeof pitch !== "undefined")
            {
                var pitchBoundaries = this._getPitchBoundaries(true, FORGE.Math.degToRad(fov));
                pitch = FORGE.Math.clamp(pitch, FORGE.Math.radToDeg(pitchBoundaries.min), FORGE.Math.radToDeg(pitchBoundaries.max));
            }
        }

        // before creating a track, set the goto point in future boundaries
        var track = new FORGE.DirectorTrack(
        {
            easing:
            {
                default: easing || "LINEAR",
                start: 0
            },

            cancelRoll: Boolean(cancelRoll),

            keyframes:
            [
                {
                    time: durationMS,
                    data:
                    {
                        yaw: yaw,
                        pitch: pitch,
                        roll: roll,
                        fov: fov
                    }
                }
            ]
        });

        this.animation.play(track.uid);
    }
};

/**
 * Update routine called by render manager before rendering a frame.
 * All internals should be up to date.
 * @method FORGE.Camera#update
 */
FORGE.Camera.prototype.update = function()
{
    if (this._viewer.vr === true)
    {
        this._gaze.update();
    }

    this._updateMainCamera();
    this._updateFlatCamera();

    this._resetChangelog();
};

/**
 * Destroy sequence.
 * @method FORGE.Camera#destroy
 */
FORGE.Camera.prototype.destroy = function()
{
    this._modelView = null;
    this._modelViewInverse = null;
    this._quaternion = null;
    this._main = null;
    this._flat = null;

    this._gaze.destroy();
    this._gaze = null;

    this._viewport.view.onChange.remove(this._updateInternals, this);

    if (this._onChange !== null)
    {
        this._onChange.destroy();
        this._onChange = null;
    }

    if (this._onOrientationChange !== null)
    {
        this._onOrientationChange.destroy();
        this._onOrientationChange = null;
    }

    if (this._onFovChange !== null)
    {
        this._onFovChange.destroy();
        this._onFovChange = null;
    }

    if (this._cameraAnimation !== null)
    {
        this._cameraAnimation.destroy();
        this._cameraAnimation = null;
    }

    this._viewport = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the camera configuration (default min & max for all angles yaw, pitch, roll and fov).
 * @name FORGE.Camera#config
 * @type {CameraConfig}
 */
Object.defineProperty(FORGE.Camera.prototype, "config",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._config;
    },

    /** @this {FORGE.Camera} */
    set: function(config)
    {
        this.load(config);
    }
});

/**
 * Get the keep flag
 * @name FORGE.Camera#keep
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "keep",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._keep;
    }
});

/**
 * Get and set the yaw value in degree.
 * @name FORGE.Camera#yaw
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "yaw",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._yaw);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        var yawChanged = this._setYaw(value, FORGE.Math.DEGREES);

        if (yawChanged === true)
        {
            this._updateFromEuler();
        }
    }
});

/**
 * Get the yaw min value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#yawMin
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "yawMin",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getYawBoundaries();
        return FORGE.Math.radToDeg(boundaries.min);
    }
});

/**
 * Get the yaw max value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#yawMax
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "yawMax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getYawBoundaries();
        return FORGE.Math.radToDeg(boundaries.max);
    }
});

/**
 * Get and set the pitch value in degree.
 * @name FORGE.Camera#pitch
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "pitch",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._pitch);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        var pitchChanged = this._setPitch(value, FORGE.Math.DEGREES);

        if (pitchChanged)
        {
            this._updateFromEuler();
        }
    }
});

/**
 * Get the pitch min value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#pitchMin
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "pitchMin",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getPitchBoundaries();
        return FORGE.Math.radToDeg(boundaries.min);
    }
});

/**
 * Get the pitch max value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#pitchMax
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "pitchMax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getPitchBoundaries();
        return FORGE.Math.radToDeg(boundaries.max);
    }
});

/**
 * Get and set the roll value in degree.
 * @name FORGE.Camera#roll
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "roll",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._roll);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        var rollChanged = this._setRoll(value, FORGE.Math.DEGREES);

        if (rollChanged === true)
        {
            this._updateFromEuler();
        }
    }
});

/**
 * Get the roll min value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#rollMin
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "rollMin",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getRollBoundaries();
        return FORGE.Math.radToDeg(boundaries.min);
    }
});

/**
 * Get the roll max value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#rollMax
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "rollMax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getRollBoundaries();
        return FORGE.Math.radToDeg(boundaries.max);
    }
});

/**
 * Get and set the fov value in degree.
 * @name FORGE.Camera#fov
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "fov",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._fov);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        var fovChanged = this._setFov(value, FORGE.Math.DEGREES);

        if (fovChanged === true)
        {
            this._updateFromEuler();
        }
    }
});

/**
 * Get the fov min value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#fovMin
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "fovMin",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getFovBoundaries();
        return FORGE.Math.radToDeg(boundaries.min);
    }
});

/**
 * Get the fov max value.
 * Return the most restrictive value between the camera value and the view value.
 * @name FORGE.Camera#fovMax
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "fovMax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        var boundaries = this._getFovBoundaries();
        return FORGE.Math.radToDeg(boundaries.max);
    }
});

/**
 * Get/set quaternion rotation object of the camera.
 * Setter will update internal quaternion object
 * @name FORGE.Camera#quaternion
 * @readonly
 * @type {THREE.Quaternion}
 */
Object.defineProperty(FORGE.Camera.prototype, "quaternion",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._quaternion;
    },
    /** @this {FORGE.Camera} */
    set: function(value)
    {
        this._quaternion = value;
        this._updateFromQuaternion();
        this._updateComplete();
    }
});

/**
 * Get camera animation manager.
 * @name FORGE.Camera#animation
 * @readonly
 * @type {FORGE.CameraAnimation}
 */
Object.defineProperty(FORGE.Camera.prototype, "animation",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._cameraAnimation === null)
        {
            this._cameraAnimation = new FORGE.CameraAnimation(this._viewer, this);
        }

        return this._cameraAnimation;
    }
});

/**
 * Get/Set parallax setting.
 * @name FORGE.Camera#parallax
 * @type number
 */
Object.defineProperty(FORGE.Camera.prototype, "parallax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._parallax;
    },
    /** @this {FORGE.Camera} */
    set: function(value)
    {
        this._parallax = FORGE.Math.clamp(value, 0, 1);
        this._radius = this._parallax * FORGE.Camera.RADIUS;
        this._updateComplete();
    }
});

/**
 * Get the modelView of the camera.
 * @name FORGE.Camera#modelView
 * @type {THREE.Matrix4}
 */
Object.defineProperty(FORGE.Camera.prototype, "modelView",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._modelView;
    },
    /** @this {FORGE.Camera} */
    set: function(value)
    {
        this._modelView = value;
        this._updateFromMatrix();
        this._updateComplete();
    }
});

/**
 * Get the modelViewInverse of the camera.
 * @name FORGE.Camera#modelViewInverse
 * @readonly
 * @type {THREE.Matrix4}
 */
Object.defineProperty(FORGE.Camera.prototype, "modelViewInverse",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._modelViewInverse;
    }
});

/**
 * Get the main THREE.PerspectiveCamera of the camera.
 * @name FORGE.Camera#main
 * @readonly
 * @type {THREE.PerspectiveCamera}
 */
Object.defineProperty(FORGE.Camera.prototype, "main",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._main === null)
        {
            this._createMainCamera();
        }

        return this._main;
    }
});

/**
 * Get the flat THREE.OrthographicCamera of the camera.
 * @name FORGE.Camera#flat
 * @readonly
 * @type {THREE.OrthographicCamera}
 */
Object.defineProperty(FORGE.Camera.prototype, "flat",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._flat === null)
        {
            this._createFlatCamera();
        }

        return this._flat;
    }
});

/**
 * Get the THREE.PerspectiveCamera radius.
 * @name FORGE.Camera#perspectiveCameraRadius
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "perspectiveCameraRadius",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._radius;
    }
});

/**
 * Get the camera gaze.
 * @name FORGE.Camera#gaze
 * @readonly
 * @type {FORGE.CameraGaze}
 */
Object.defineProperty(FORGE.Camera.prototype, "gaze",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._gaze;
    }
});

/**
 * Get the "onChange" {@link FORGE.EventDispatcher} of the camera.
 * @name FORGE.Camera#onChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Camera.prototype, "onChange",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._onChange === null)
        {
            this._onChange = new FORGE.EventDispatcher(this);
        }

        return this._onChange;
    }
});

/**
 * Get the "onOrientationChange" {@link FORGE.EventDispatcher} of the camera.
 * @name FORGE.Camera#onOrientationChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Camera.prototype, "onOrientationChange",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._onOrientationChange === null)
        {
            this._onOrientationChange = new FORGE.EventDispatcher(this);
        }

        return this._onOrientationChange;
    }
});

/**
 * Get the "onFovChange" {@link FORGE.EventDispatcher} of the camera.
 * @name FORGE.Camera#onFovChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Camera.prototype, "onFovChange",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._onFovChange === null)
        {
            this._onFovChange = new FORGE.EventDispatcher(this);
        }

        return this._onFovChange;
    }
});
