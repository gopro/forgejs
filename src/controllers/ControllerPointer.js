/**
 * This controller takes mouse and touch events on screen to animate camera moves.
 *
 * @constructor FORGE.ControllerPointer
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @param {ControllerInstanceConfig} config - the configuration of the controller
 * @extends {FORGE.ControllerBase}
 */
FORGE.ControllerPointer = function(viewer, config)
{
    /**
     * Configuration
     * @name FORGE.ControllerPointer#_config
     * @type {ControllerInstanceConfig}
     * @private
     */
    this._config = config;

    /**
     * Orientation controller configuration.
     * @name FORGE.ControllerPointer#_orientation
     * @type {ControllerOrientationConfig}
     * @private
     */
    this._orientation;

    /**
     * Zoom controller configuration.
     * @name FORGE.ControllerPointer#_zoom
     * @type {ControllerZoomConfig}
     * @private
     */
    this._zoom;

    /**
     * Fullscreen configuration.
     * @name FORGE.ControllerPointer#_fullscreen
     * @type {boolean}
     * @private
     */
    this._fullscreen = true;

    /**
     * Start position vector.
     * @name FORGE.ControllerPointer#_positionStart
     * @type {THREE.Vector2}
     * @private
     */
    this._positionStart = null;

    /**
     * Current position vector.
     * @name FORGE.ControllerPointer#_positionCurrent
     * @type {THREE.Vector2}
     * @private
     */
    this._positionCurrent = null;

    /**
     * Previous position vector.
     * @name FORGE.ControllerPointer#_positionPrevious
     * @type {THREE.Vector2}
     * @private
     */
    this._positionPrevious = null;

    /**
     * The fov value when you start to pinch in/out
     * @name FORGE.ControllerPointer#_pinchStartFov
     * @type {number}
     * @private
     */
    this._pinchStartFov = 0;

    /**
     * This is used when we have reached the minimum or maximum scale,
     * in order not to have a "no-effect" zone when zooming the other way
     * @name FORGE.ControllerPointer#_pinchScaleFactorCorrection
     * @type {number}
     * @private
     */
    this._pinchScaleFactorCorrection = 1;

    /**
     * Current velocity vector.
     * @name FORGE.ControllerPointer#_velocity
     * @type {THREE.Vector2}
     * @private
     */
    this._velocity = null;

    /**
     * Previous velocity vector.
     * @name FORGE.ControllerPointer#_inertia
     * @type {THREE.Vector2}
     * @private
     */
    this._inertia = null;

    /**
     * Panning flag.
     * @name FORGE.ControllerPointer#_panning
     * @type {boolean}
     * @private
     */
    this._panning = false;

    FORGE.ControllerBase.call(this, viewer, "ControllerPointer");
};

FORGE.ControllerPointer.prototype = Object.create(FORGE.ControllerBase.prototype);
FORGE.ControllerPointer.prototype.constructor = FORGE.ControllerPointer;

/**
 * Default configuration
 * @name {FORGE.ControllerPointer.DEFAULT_OPTIONS}
 * @type {ControllerPointerConfig}
 */
FORGE.ControllerPointer.DEFAULT_OPTIONS =
{
    fullscreen: true,

    orientation:
    {
        drag: false,
        hardness: 0.6, //Hardness factor impatcing controller response to some instant force.
        damping: 0.15, //Damping factor controlling inertia.
        velocityMax: 300,
        invert: {
            x: false,
            y: false
        }
    },

    zoom:
    {
        hardness: 5,
        invert: false,
        toPointer: false
    }
};

/**
 * Boot sequence.
 * @method FORGE.ControllerPointer#_boot
 * @private
 */
FORGE.ControllerPointer.prototype._boot = function()
{
    FORGE.ControllerBase.prototype._boot.call(this);

    this._type = FORGE.ControllerType.POINTER;

    this._inertia = new THREE.Vector2();
    this._velocity = new THREE.Vector2();
    this._positionStart = new THREE.Vector2();
    this._positionPrevious = new THREE.Vector2();
    this._positionCurrent = new THREE.Vector2();

    this._parseConfig(this._config);

    if(this._enabled === true)
    {
        this.enable();
    }
};

/**
 * Parse the configuration.
 * @method FORGE.ControllerPointer#_parseConfig
 * @param {ControllerInstanceConfig} config - configuration object to parse
 */
FORGE.ControllerPointer.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._register();

    var options = config.options || {};

    this._orientation = /** @type {ControllerOrientationConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerPointer.DEFAULT_OPTIONS.orientation, options.orientation));
    this._zoom = /** @type {ControllerZoomConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.ControllerPointer.DEFAULT_OPTIONS.zoom, options.zoom));
    this._fullscreen = (typeof options.fullscreen === "boolean") ? options.fullscreen : FORGE.ControllerPointer.DEFAULT_OPTIONS.fullscreen;

    this._enabled = (typeof config.enabled === "boolean") ? config.enabled : true;
};

/**
 * Pan start event handler.
 * @method FORGE.ControllerPointer#_panStartHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._panStartHandler = function(event)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    this._viewer.canvas.pointer.onPanMove.add(this._panMoveHandler, this);
    this.log("_panStartHandler (" + event.data.velocityX.toFixed(2) + ", " + event.data.velocityY.toFixed(2) + ")");

    this._active = true;
    this._panning = true;

    var position = FORGE.Pointer.getRelativeMousePosition(event.data);
    this._positionStart = new THREE.Vector2(position.x, position.y);
    this._positionPrevious.copy(this._positionStart);
    this._positionCurrent.copy(this._positionStart);
    this._velocity.set(0, 0);

    if (this._onControlStart !== null)
    {
        this._onControlStart.dispatch();
    }

    this._viewer.controllers.notifyControlStart(this);
};

/**
 * Pan move event handler.
 * @method FORGE.ControllerPointer#_panMoveHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._panMoveHandler = function(event)
{
    var position = FORGE.Pointer.getRelativeMousePosition(event.data);

    if(this._viewer.controllers.enabled === false || position === null)
    {
        return;
    }

    this._positionPrevious.copy(this._positionCurrent);
    this._positionCurrent.set(position.x, position.y);
    // this.log("Current position: " + this._positionCurrent.x + ", " + this._positionCurrent.y);

    if(this._orientation.drag === true && this._panning === true)
    {
        this._updateCameraWithDrag();
    }
};

/**
 * Pan end event handler.
 * @method FORGE.ControllerPointer#_panEndHandler
 * @private
 */
FORGE.ControllerPointer.prototype._panEndHandler = function()
{
    this._viewer.canvas.pointer.onPanMove.remove(this._panMoveHandler, this);
    this.log("_panEndHandler");

    this._active = false;
    this._panning = false;

    this._velocity.set(0, 0);
    this._positionStart.set(0, 0);
    this._positionCurrent.copy(this._positionStart);

    if (this._onControlEnd !== null)
    {
        this._onControlEnd.dispatch();
    }

    this._viewer.controllers.notifyControlEnd(this);
};

/**
 * Update the camera from the mouse position.
 * @method FORGE.ControllerPointer#_updateCameraWithDrag
 * @private
 */
FORGE.ControllerPointer.prototype._updateCameraWithDrag = function()
{
    var stw0 = this._viewer.view.screenToWorld(this._positionPrevious);
    var stw1 = this._viewer.view.screenToWorld(this._positionCurrent);

    // If the screen point do not match any world position, return
    if(stw0 === null || stw1 === null)
    {
        return;
    }

    var spherical0 = FORGE.Math.cartesianToSpherical(stw0.x, stw0.y, stw0.z);
    var quat0 = FORGE.Quaternion.fromEuler(spherical0.theta, spherical0.phi, 0);

    var spherical1 = FORGE.Math.cartesianToSpherical(stw1.x, stw1.y, stw1.z);
    var quat1 = FORGE.Quaternion.fromEuler(spherical1.theta, spherical1.phi, 0);

    this._camera.yaw += FORGE.Math.radToDeg(spherical0.theta - spherical1.theta);
    this._camera.pitch += FORGE.Math.radToDeg(spherical0.phi - spherical1.phi);
    this._camera.roll = 0;
};

/**
 * Update the camera from the velocity that results of the mouse movement.
 * @method FORGE.ControllerPointer#_updateCameraWithVelocity
 * @private
 */
FORGE.ControllerPointer.prototype._updateCameraWithVelocity = function()
{
    var size = this._viewer.renderer.displayResolution;
    var hardness = 1 / (this._orientation.hardness * Math.min(size.width, size.height));

    hardness *= (this._camera.fov / 90);

    this._velocity.subVectors(this._positionCurrent, this._positionStart);

    if (this._velocity.length() > this._orientation.velocityMax)
    {
        this._velocity.setLength(this._orientation.velocityMax);
    }

    this._velocity.multiplyScalar(hardness);

    // this.log("Current velocity: " + this._velocity.x + ", " + this._velocity.y);

    var invert = this._orientation.invert;
    var invertX = (invert === true) ? -1 : (typeof invert === "object" && invert.x === true) ? -1 : 1;
    var invertY = (invert === true) ? -1 : (typeof invert === "object" && invert.y === true) ? -1 : 1;

    var dx = this._velocity.x + this._inertia.x;
    var dy = this._velocity.y + this._inertia.y;

    if (dx === 0 && dy === 0)
    {
        return;
    }

    var yaw = invertX * dx;
    //Do not move the camera anymore if the modifier is too low, this prevent onCameraChange to be fired too much times
    if(Math.abs(yaw) > 0.05)
    {
        this._camera.yaw += yaw;
        this._camera.flat.position.x += dx;
    }

    var pitch = invertY * dy;
    //Do not move the camera anymore if the modifier is too low, this prevent onCameraChange to be fired too much times
    if(Math.abs(pitch) > 0.05)
    {
        this._camera.pitch -= pitch;
        this._camera.flat.position.y -= dy;
    }

    // Damping 1 -> stops instantly, 0 infinite rebounds
    this._inertia.add(this._velocity).multiplyScalar(FORGE.Math.clamp(1 - this._orientation.damping, 0, 1));
};

/**
 * Pinch start event handler.
 * @method FORGE.ControllerPointer#_pinchStartHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._pinchStartHandler = function(event)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    this._pinchStartFov = this._camera.fov;
    this._pinchScaleFactorCorrection = 1;

    this._viewer.canvas.pointer.onPinchMove.add(this._pinchMoveHandler, this);
    this.log("_pinchStartHandler "+event);
};

/**
 * Pinch move event handler.
 * @method FORGE.ControllerPointer#_pinchMoveHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._pinchMoveHandler = function(event)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    event.data.preventDefault();

    var scale = this._zoom.invert ? event.data.scale : 1 / event.data.scale;
    var fovMin = this._camera.fovMin;
    var fovMax = this._camera.fovMax;

    var tmpFov = this._pinchStartFov * scale / this._pinchScaleFactorCorrection;

    if (tmpFov < fovMin)
    {
        this._pinchScaleFactorCorrection = this._pinchStartFov * scale / fovMin;
    }
    else if (tmpFov > fovMax)
    {
        this._pinchScaleFactorCorrection = this._pinchStartFov * scale / fovMax;
    }

    tmpFov = this._pinchStartFov * scale / this._pinchScaleFactorCorrection;

    this._camera.fov = tmpFov;
};

/**
 * Pinch end event handler.
 * @method FORGE.ControllerPointer#_pinchEndHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._pinchEndHandler = function(event)
{
    this._viewer.canvas.pointer.onPinchMove.remove(this._pinchMoveHandler, this);
    this.log("_pinchEndHandler "+event);
};

/**
 * Wheel event handler.
 * @method FORGE.ControllerPointer#_wheelHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.ControllerPointer.prototype._wheelHandler = function(event)
{
    if(this._viewer.controllers.enabled === false)
    {
        return;
    }

    event.data.preventDefault();

    var invert = this._zoom.invert ? 1 : -1;
    var delta = invert / this._zoom.hardness;
    var factorDeltaY = 1;

    var hardness = (this._camera.fov / 90);

    if (event.data.deltaMode)
    {
        switch(event.data.deltaMode)
        {
            case 1: //DOM_DELTA_LINE (3 lines === 100 pixels)
                factorDeltaY = 33.3;
                break;
            case 2: //DOM_DELTA_PAGE
                factorDeltaY = self.innerHeight;
                break;
            default: //DOM_DELTA_PIXEL
                factorDeltaY = 1;
        }
    }

    if (event.data.deltaY)
    {
        delta *= (event.data.deltaY * factorDeltaY) / 5;
    }

    var fov = this._camera.fov - delta;

    if(this._zoom.toPointer === true)
    {
        var screen = FORGE.Pointer.getRelativeMousePosition(event.data);
        var stw0 = this._viewer.view.screenToWorld(screen);
        var spherical0 = FORGE.Math.cartesianToSpherical(stw0.x, stw0.y, stw0.z);
        var quat0 = FORGE.Quaternion.fromEuler(spherical0.theta, spherical0.phi, 0);

        // Change the camera fov
        this._camera.fov = fov;
        this._viewer.view.current.updateUniforms();

        var stw1 = this._viewer.view.screenToWorld(screen);
        var spherical1 = FORGE.Math.cartesianToSpherical(stw1.x, stw1.y, stw1.z);
        var quat1 = FORGE.Quaternion.fromEuler(spherical1.theta, spherical1.phi, 0);

        var quat = FORGE.Quaternion.diffBetweenQuaternions(quat1, quat0);
        var euler = FORGE.Quaternion.toEuler(quat);

        this._camera.yaw += FORGE.Math.radToDeg(euler.yaw);
        this._camera.pitch += FORGE.Math.radToDeg(euler.pitch);
    }
    else
    {
        this._camera.fov = fov;
    }

    delta *= hardness;

    this._camera.fov = this._camera.fov - delta;
    this.log("_wheelHandler (fov:" + this._camera.fov + ")");
};

/**
 * Double tap event handler. Toggle the fullscreen.
 * @method FORGE.ControllerPointer#_doubleTapHandler
 * @private
 */
FORGE.ControllerPointer.prototype._doubleTapHandler = function()
{
    if (this._viewer.controllers.enabled === false || this._fullscreen === false)
    {
        return;
    }

    this._viewer.fullscreen = !this._viewer.fullscreen;
};

/**
 * Enable controller
 * @method FORGE.ControllerPointer#enable
 */
FORGE.ControllerPointer.prototype.enable = function()
{
    FORGE.ControllerBase.prototype.enable.call(this);

    this._viewer.canvas.pointer.onPanStart.add(this._panStartHandler, this);
    this._viewer.canvas.pointer.onPanEnd.add(this._panEndHandler, this);

    this._viewer.canvas.pointer.onPinchStart.add(this._pinchStartHandler, this);
    this._viewer.canvas.pointer.onPinchEnd.add(this._pinchEndHandler, this);
    this._viewer.canvas.pointer.onWheel.add(this._wheelHandler, this);

    this._viewer.canvas.pointer.onDoubleTap.add(this._doubleTapHandler, this);
};

/**
 * Disable controller
 * @method FORGE.ControllerPointer#disable
 */
FORGE.ControllerPointer.prototype.disable = function()
{
    FORGE.ControllerBase.prototype.disable.call(this);

    this._viewer.canvas.pointer.onPanStart.remove(this._panStartHandler, this);
    this._viewer.canvas.pointer.onPanMove.remove(this._panMoveHandler, this);
    this._viewer.canvas.pointer.onPanEnd.remove(this._panEndHandler, this);

    this._viewer.canvas.pointer.onPinchStart.remove(this._pinchStartHandler, this);
    this._viewer.canvas.pointer.onPinchMove.remove(this._pinchEndHandler, this);
    this._viewer.canvas.pointer.onPinchEnd.remove(this._pinchEndHandler, this);
    this._viewer.canvas.pointer.onWheel.remove(this._wheelHandler, this);

    this._viewer.canvas.pointer.onDoubleTap.remove(this._doubleTapHandler, this);
};

/**
 * Update routine.
 * @method FORGE.ControllerPointer#update
 */
FORGE.ControllerPointer.prototype.update = function()
{
    if(this._orientation.drag !== true)
    {
        this._updateCameraWithVelocity();
    }
};

/**
 * Destroy routine
 * @method FORGE.ControllerPointer#destroy
 */
FORGE.ControllerPointer.prototype.destroy = function()
{
    FORGE.ControllerBase.prototype.destroy.call(this);
};

/**
 * Get and set the orientation options
 * @name FORGE.ControllerPointer#orientation
 * @type {boolean}
 */
Object.defineProperty(FORGE.ControllerPointer.prototype, "orientation",
{
    /** @this {FORGE.ControllerPointer} */
    get: function()
    {
        return this._orientation;
    },
    /** @this {FORGE.ControllerPointer} */
    set: function(value)
    {
        this._orientation = value;
    }
});

/**
 * Get and set the zoom options
 * @name FORGE.ControllerPointer#zoom
 * @type {boolean}
 */
Object.defineProperty(FORGE.ControllerPointer.prototype, "zoom",
{
    /** @this {FORGE.ControllerPointer} */
    get: function()
    {
        return this._zoom;
    },
    /** @this {FORGE.ControllerPointer} */
    set: function(value)
    {
        this._zoom = value;
    }
});
