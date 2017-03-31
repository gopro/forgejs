/**
 * A FORGE.Camera tells the renderer wich part of the scene to render.
 *
 * @constructor FORGE.Camera
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Camera = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Camera#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

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
     * @type {?number}
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
    this._fov = Math.PI / 2;

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
     * Left camera for VR rendering
     * @name  FORGE.Camera._left
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._left = null;

    /**
     * Right camera for VR rendering
     * @name  FORGE.Camera._right
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._right = null;

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
     * On camera change event dispatcher.
     * @name FORGE.Camera#_onCameraChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onCameraChange = null;

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
FORGE.Camera.DEFAULT_CONFIG = {
    parallax: 0,
    yaw:
    {
        default: 0
    },
    pitch:
    {
        default: 0
    },
    roll:
    {
        default: 0
    },
    fov:
    {
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
    this._modelView = new THREE.Matrix4();
    this._modelViewInverse = new THREE.Matrix4();
    this._quaternion = new THREE.Quaternion();

    this._gaze = new FORGE.CameraGaze(this._viewer, FORGE.Camera.DEFAULT_CONFIG.gaze);

    this._createMainCamera();
    this._createFlatCamera();
    this._createVRCameras();
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

    this._updateFromEuler();
    this._updateComplete();

    this._gaze.load(/** @type {CameraGazeConfig} */ (config.gaze));
};

/**
 * Init the THREE PerspectiveCamera.
 * @method FORGE.Camera#_createMainCamera
 * @private
 */
FORGE.Camera.prototype._createMainCamera = function()
{
    if (typeof this._viewer.renderer !== "undefined")
    {
        var aspect = this._viewer.renderer.displayResolution.ratio;
        this._main = new THREE.PerspectiveCamera(this._fov, aspect, FORGE.RenderManager.DEPTH_NEAR, 2 * FORGE.RenderManager.DEPTH_FAR);
        this._main.name = "CameraMain";
        this._main.matrixAutoUpdate = false;
    }
};

/**
 * Init the THREE OrthographicCamera.
 * @method FORGE.Camera#_createFlatCamera
 * @private
 */
FORGE.Camera.prototype._createFlatCamera = function()
{
    if (typeof this._viewer.renderer !== "undefined")
    {
        this._flat = new THREE.OrthographicCamera(
            -1000, 1000,
            1000, -1000,
            FORGE.RenderManager.DEPTH_NEAR,
            FORGE.RenderManager.DEPTH_FAR);

        this._flat.name = "CameraFlat";
        this._flat.matrixAutoUpdate = false;
    }
};

/**
 * Create the left and right THREE PerspectiveCamera for VR.
 * @method FORGE.Camera#_createVRCameras
 * @private
 */
FORGE.Camera.prototype._createVRCameras = function()
{
    this._left = this._main.clone();
    this._left.name = "CameraLeft";
    this._left.layers.enable(1);

    this._left.add(this._gaze.object);

    this._right = this._main.clone();
    this._right.name = "CameraRight";
    this._right.layers.enable(2);
};

/**
 * Update VR cameras.
 * @method FORGE.Camera#_updateVRCameras
 * @private
 */
FORGE.Camera.prototype._updateVRCameras = function()
{
    var display = this._viewer.renderer.display;

    // Get frame data before pose to ensure pose values are up to date
    var frameData = display.vrFrameData;
    var quat = display.getQuaternionFromPose();

    if (quat !== null)
    {
        this._quaternion = quat;
        this._updateFromQuaternion();
    }

    var eyeParamsL = display.vrDisplay.getEyeParameters("left");
    var eyeParamsR = display.vrDisplay.getEyeParameters("right");

    this._main.matrixWorld.decompose(this._left.position, this._left.quaternion, this._left.scale);
    this._left.matrixWorld = new THREE.Matrix4().makeRotationFromQuaternion(this._main.quaternion);

    this._main.matrixWorld.decompose(this._right.position, this._right.quaternion, this._right.scale);
    this._right.matrixWorld = new THREE.Matrix4().makeRotationFromQuaternion(this._main.quaternion);

    // Get translation from central camera matrix
    this._left.matrixWorld.elements[12] = this._main.matrixWorld.elements[12] + eyeParamsL.offset[0];
    this._left.matrixWorld.elements[13] = this._main.matrixWorld.elements[13] + eyeParamsL.offset[1];
    this._left.matrixWorld.elements[14] = this._main.matrixWorld.elements[14] + eyeParamsL.offset[2];

    // Get translation from central camera matrix
    this._right.matrixWorld.elements[12] = this._main.matrixWorld.elements[12] + eyeParamsR.offset[0];
    this._right.matrixWorld.elements[13] = this._main.matrixWorld.elements[13] + eyeParamsR.offset[1];
    this._right.matrixWorld.elements[14] = this._main.matrixWorld.elements[14] + eyeParamsR.offset[2];

    // Setup camera projection matrix
    if (frameData !== null)
    {
        this._left.projectionMatrix.elements = frameData.leftProjectionMatrix;
        this._right.projectionMatrix.elements = frameData.rightProjectionMatrix;
    }
    else
    {
        var eyeFOVL = {
            upDegrees: eyeParamsL.fieldOfView.upDegrees,
            downDegrees: eyeParamsL.fieldOfView.downDegrees,
            leftDegrees: eyeParamsL.fieldOfView.leftDegrees,
            rightDegrees: eyeParamsL.fieldOfView.rightDegrees
        };

        this._left.projectionMatrix = this._fovToProjectionMatrix(eyeFOVL, this._main);

        var eyeFOVR = {
            upDegrees: eyeParamsR.fieldOfView.upDegrees,
            downDegrees: eyeParamsR.fieldOfView.downDegrees,
            leftDegrees: eyeParamsR.fieldOfView.leftDegrees,
            rightDegrees: eyeParamsR.fieldOfView.rightDegrees
        };

        this._right.projectionMatrix = this._fovToProjectionMatrix(eyeFOVR, this._main);
    }

    this._updateComplete();
};

/**
 * Clone VR cameras objects.
 * @method FORGE.Camera#_cloneVRCamerasChildren
 * @private
 */
FORGE.Camera.prototype._cloneVRCamerasChildren = function()
{
    //First clear all children from camera right
    for (var i = 0, ii = this._right.children.length; i < ii; i++)
    {
        this._right.remove(this._right.children[i]);
    }

    //Then clone all children of camera left to camera right
    var clone = null;
    for (var j = 0, jj = this._left.children.length; j < jj; j++)
    {
        clone = this._left.children[j].clone();
        this._right.add(clone);
    }
};

/**
 * Get projection matrix from a VRFieldOfView
 * @method FORGE.Camera#_fovToProjectionMatrix
 * @param {VRFieldOfViewObject} fov - VRFieldOfView for an eye
 * @param {THREE.PerspectiveCamera} camera - reference camera
 * @return {THREE.Matrix4} projection matrix
 * @private
 */
FORGE.Camera.prototype._fovToProjectionMatrix = function(fov, camera)
{
    // Get projections of field of views on zn plane
    var fovUpTan = Math.tan(FORGE.Math.degToRad(fov.upDegrees));
    var fovDownTan = Math.tan(FORGE.Math.degToRad(fov.downDegrees));
    var fovLeftTan = Math.tan(FORGE.Math.degToRad(fov.leftDegrees));
    var fovRightTan = Math.tan(FORGE.Math.degToRad(fov.rightDegrees));

    // and with scale/offset info for normalized device coords
    var pxscale = 2.0 / (fovLeftTan + fovRightTan);
    var pxoffset = (fovLeftTan - fovRightTan) * pxscale * 0.5;
    var pyscale = 2.0 / (fovUpTan + fovDownTan);
    var pyoffset = (fovUpTan - fovDownTan) * pyscale * 0.5;

    // start with an identity matrix
    var matrix = new THREE.Matrix4();
    var m = matrix.elements;

    // X result, map clip edges to [-w,+w]
    m[0 * 4 + 0] = pxscale;
    m[0 * 4 + 1] = 0.0;
    m[0 * 4 + 2] = -pxoffset;
    m[0 * 4 + 3] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[1 * 4 + 0] = 0.0;
    m[1 * 4 + 1] = pyscale;
    m[1 * 4 + 2] = pyoffset;
    m[1 * 4 + 3] = 0.0;

    // Z result (up to the app)
    m[2 * 4 + 0] = 0.0;
    m[2 * 4 + 1] = 0.0;
    m[2 * 4 + 2] = camera.far / (camera.near - camera.far);
    m[2 * 4 + 3] = (camera.far * camera.near) / (camera.near - camera.far);

    // W result (= Z in)
    m[3 * 4 + 0] = 0.0;
    m[3 * 4 + 1] = 0.0;
    m[3 * 4 + 2] = -1.0;
    m[3 * 4 + 3] = 0.0;

    matrix.transpose();

    return matrix;
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
    if (this._main === null || this._viewer.renderer.view.current === null)
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

    this._main.fov = FORGE.Math.radToDeg(this._viewer.renderer.view.current.getProjectionFov());
    this._main.aspect = this._viewer.renderer.displayResolution.ratio;
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

    var max = this._fovMax;
    var view = this._viewer.renderer.view.current;

    if (view !== null && view.fovMax !== null)
    {
        max = Math.min(FORGE.Math.degToRad(view.fovMax), this._fovMax);
        this._flat.zoom = max / this._fov;
    }
    else
    {
        this._flat.zoom = 1;
    }

    this._flat.updateProjectionMatrix();
};

/**
 * Final method call to complete camera update, ensure main camera is up to date.
 * @method FORGE.Camera#_updateComplete
 * @private
 */
FORGE.Camera.prototype._updateComplete = function()
{
    if (this._onCameraChange !== null)
    {
        this._onCameraChange.dispatch(null, true);
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

    // Wrap the value between -PI and +PI, except for FLAT view where we apply texture ratio
    if (this._viewer.renderer.backgroundRenderer !== null &&
        this._viewer.renderer.view.type === FORGE.ViewType.FLAT)
    {
        var disp = this._viewer.renderer.backgroundRenderer.displayObject;
        var ratio = disp.pixelWidth / disp.pixelHeight;
        if (disp.element instanceof HTMLVideoElement)
        {
            ratio = disp.element.videoWidth / disp.element.videoHeight;
        }
        value = FORGE.Math.wrap(value, -Math.PI * ratio, Math.PI * ratio);
    }
    else
    {
        value = FORGE.Math.wrap(value, -Math.PI, Math.PI);
    }

    // Clamp the value between min and max
    var min = this._yawMin;
    var max = this._yawMax;
    var view = this._viewer.renderer.view.current;

    if (typeof view !== "undefined")
    {
        if (view.yawMin !== null)
        {
            min = Math.max(view.yawMin, min);
        }

        if (view.yawMax !== null)
        {
            max = Math.min(view.yawMax, max);
        }
    }

    var yaw = FORGE.Math.clamp(value, min, max);

    var changed = this._yaw !== yaw;

    this._yaw = yaw;

    return changed;
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

    // Clamp the value between min and max
    var min = this._pitchMin;
    var max = this._pitchMax;
    var view = this._viewer.renderer.view.current;

    if (typeof view !== "undefined")
    {
        if (view.pitchMin !== null)
        {
            min = Math.max(view.pitchMin, min);
        }

        if (view.pitchMax !== null)
        {
            max = Math.min(view.pitchMax, max);
        }
    }

    var pitch = FORGE.Math.clamp(value, min, max);

    // If old view accepted pitch out of [-PI/2 , PI/2] and new one does not,
    // check if old pitch value was in authorized range and if not, set to zero
    if (Math.abs(oldPitch) > Math.PI / 2 && Math.abs(pitch) === Math.PI / 2)
    {
        pitch = 0;
    }
    
    var changed = this._pitch !== pitch;

    this._pitch = pitch;

    return changed;
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

    // Clamp the value between min and max
    var min = this._rollMin;
    var max = this._rollMax;
    var view = this._viewer.renderer.view.current;

    if (typeof view !== "undefined")
    {
        if (view.rollMin !== null)
        {
            min = Math.max(view.rollMin, min);
        }

        if (view.rollMax !== null)
        {
            max = Math.min(view.rollMax, max);
        }
    }

    var roll = FORGE.Math.clamp(value, min, max);

    var changed = this._roll !== roll;

    this._roll = roll;

    return changed;
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

    // Clamp the value between min and max
    var min = this._fovMin;
    var max = this._fovMax;
    var view = this._viewer.renderer.view.current;

    if (typeof view !== "undefined")
    {
        if (view.fovMin !== null)
        {
            min = Math.max(FORGE.Math.degToRad(view.fovMin), min);
        }

        if (view.fovMax !== null)
        {
            max = Math.min(FORGE.Math.degToRad(view.fovMax), max);
        }
    }

    var fov = FORGE.Math.clamp(value, min, max);

    var changed = this._fov !== fov;

    this._fov = fov;

    // If fov has changed, ensure angles are inside camera and view boundaries
    // by calling their setters with their current value
    var eulerChanged = this._setYaw(this._yaw) || this._setPitch(this._pitch) || this._setRoll(this._roll);
    if (eulerChanged)
    {
        this._updateFromEuler();
        this._updateComplete();
    }

    return changed;
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
    var yawChanged = this._setYaw(yaw, unit);
    var pitchChanged = this._setPitch(pitch, unit);
    var rollChanged = this._setRoll(roll, unit);
    var fovChanged = this._setFov(fov, unit);

    return (yawChanged === true || pitchChanged === true || rollChanged === true || fovChanged === true);
};

/**
 * Load a camera configuration.
 * @method FORGE.Camera#load
 * @param {CameraConfig} config - The camera configuration to load.
 */
FORGE.Camera.prototype.load = function(config)
{
    this._config = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.Camera.DEFAULT_CONFIG, config));

    this._parseConfig(this._config);
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
 * @param {string=} easing - Easing method (default to {@link FORGE.Easing.LINEAR}).
 */
FORGE.Camera.prototype.lookAt = function(yaw, pitch, roll, fov, durationMS, cancelRoll, easing)
{
    if (typeof durationMS !== "number" || durationMS === 0)
    {
        this._setAll(yaw, pitch, roll, fov, FORGE.Math.DEGREES);
        this._updateFromEuler();
        this._updateComplete();
    }
    else
    {
        var track = new FORGE.DirectorTrack(
        {
            easing:
            {
                default: easing || "LINEAR",
                start: 0
            },

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
    if (this._viewer.renderer.display.presentingVR === true)
    {
        this._gaze.update();
        this._updateVRCameras();
        this._cloneVRCamerasChildren();
    }

    this._updateMainCamera();
    this._updateFlatCamera();
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

    if (this._onCameraChange !== null)
    {
        this._onCameraChange.destroy();
        this._onCameraChange = null;
    }

    if (this._cameraAnimation !== null)
    {
        this._cameraAnimation.destroy();
        this._cameraAnimation = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the ycamera configuration (default min & max for all angles yaw, pitch, roll and fov).
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
            this._updateComplete();
        }
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
            this._updateComplete();
        }
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
            this._updateComplete();
        }
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
            this._updateComplete();
        }
    }
});

/**
 * Get and set the minimum fov value in degree.
 * @name FORGE.Camera#fovMin
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "fovMin",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._fovMin);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        this._fovMin = FORGE.Math.degToRad(value);
        this._setFov(this._fov, FORGE.Math.RADIANS);
    }
});

/**
 * Get and set the maximum fov value in degree.
 * @name FORGE.Camera#fovMax
 * @type {number}
 */
Object.defineProperty(FORGE.Camera.prototype, "fovMax",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return FORGE.Math.radToDeg(this._fovMax);
    },

    /** @this {FORGE.Camera} */
    set: function(value)
    {
        this._fovMax = FORGE.Math.degToRad(value);
        this._setFov(this._fov, FORGE.Math.RADIANS);
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
 * @readonly
 * @type {THREE.Matrix4}
 */
Object.defineProperty(FORGE.Camera.prototype, "modelView",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._modelView;
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
 * Get the left camera.
 * @name FORGE.Camera#left
 * @type {THREE.PerspectiveCamera}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "left",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._left;
    }
});

/**
 * Get the right camera.
 * @name FORGE.Camera#right
 * @type {THREE.PerspectiveCamera}
 * @readonly
 */
Object.defineProperty(FORGE.Camera.prototype, "right",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        return this._right;
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
 * Get the "onCameraChange" {@link FORGE.EventDispatcher} of the camera.
 * @name FORGE.Camera#onCameraChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Camera.prototype, "onCameraChange",
{
    /** @this {FORGE.Camera} */
    get: function()
    {
        if (this._onCameraChange === null)
        {
            this._onCameraChange = new FORGE.EventDispatcher(this);
        }

        return this._onCameraChange;
    }
});