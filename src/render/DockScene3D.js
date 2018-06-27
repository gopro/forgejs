/**
 * Screen aligned 3D scene with OSX dock behaviour.
 *
 * @constructor FORGE.DockScene3D
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {Scene3DConfig} config - scene configuration.
 * @extends {FORGE.Scene3D}
 */
FORGE.DockScene3D = function(viewer, config)
{
    /**
     * Pitch where the scene begins to be displayed (degrees)
     * @name FORGE.Scene3D#_pitchShow
     * @type {number}
     * @private
     */
    this._pitchShow = 0;

    /**
     * Pitch where the scene is hidden (degrees)
     * @name FORGE.Scene3D#_pitchHide
     * @type {number}
     * @private
     */
    this._pitchHide = 0;

    /**
     * Yaw where the scene has been displayed
     * @name FORGE.Scene3D#_yawScene
     * @type {number}
     * @private
     */
    this._yawScene = 0;

    /**
     * Lock set when scene becomes invisible while pitch was in display range
     * @name FORGE.Scene3D#_pitchLocked
     * @type {boolean}
     * @private
     */
    this._pitchLocked = false;

    /**
     * Ready flag set when a scene has been loaded to enable access to viewport and camera
     * @name FORGE.Scene3D#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    FORGE.Scene3D.call(this, viewer, config, "DockScene3D");
};

FORGE.DockScene3D.prototype = Object.create(FORGE.Scene3D.prototype);
FORGE.DockScene3D.prototype.constructor = FORGE.DockScene3D;

/**
 * Boot routine
 * @method FORGE.DockScene3D#_boot
 * @private
 */
FORGE.DockScene3D.prototype._boot = function()
{
    FORGE.Scene3D.prototype._boot.call(this);

    this._pitchShow = typeof this._config.pitchShow === "number" ? this._config.pitchShow : -30;
    this._pitchHide = typeof this._config.pitchHide === "number" ? this._config.pitchHide : -30;

    // this._scene.visible = false;
};

/**
 * Update opacity multiplier for inner objects
 * @method FORGE.DockScene3D#_updateOpacity
 * @private
 */
FORGE.DockScene3D.prototype._updateOpacity = function()
{
    if (this._ready === false)
    {
        return;
    }

    // Unlock pitch if camera is over hide boundary
    if (this._pitchLocked)
    {
        if (this._viewer.camera.pitch > this._pitchHide)
        {
            this._pitchLocked = false;
        }
        else
        {
            return;
        }
    }

    // If scene wasn't visible and pitch is out of bounds, just return
    if (this._scene.visible === false && this._viewer.camera.pitch > this._pitchHide)
    {
        return;
    }

    // Compute opacity by evaluating smoothed distance to pitch hide and show boundaries
    var opacity = FORGE.Math.smoothStep(this._viewer.camera.pitch, this._pitchHide, this._pitchShow);

    // The scene becomes visible if opacity becomes positive, then store current camera yaw for scene display
    if (this._scene.visible === false && opacity > 0)
    {
        this._yawScene = this._viewer.camera.yaw;
        this._scene.rotation.set(0, -FORGE.Math.degToRad(this._yawScene), 0);
        this._scene.updateMatrix();
    }

    // Then apply adjustment depending on yaw distance (45 degrees to disappear)
    var angle = Math.abs(this._viewer.camera.yaw - this._yawScene);
    var factor = FORGE.Math.clamp(1 - angle / 45, 0, 1);
    opacity *= factor;

    // If opacity is not positive anymore, lock the pitch
    if (opacity <= 0 && this._scene.visible &&
        this._viewer.camera.pitch < this._pitchHide)
    {
        this._pitchLocked = true;
    }

    // Update scene visibility
    this._scene.visible = opacity > 0;

    // Update display with new opacity value
    this._scene.traverse(function(node) {
        if (node.material) {
            node.material.opacity = opacity * node.userData.opacity;
        }
    });
};

/**
 * Scene before render callback
 * @method FORGE.DockScene3D#_sceneBeforeRender
 * @private
 */
FORGE.DockScene3D.prototype._sceneBeforeRender = function(renderer, scene, camera)
{
    FORGE.Scene3D.prototype._sceneBeforeRender.call(this, renderer, scene, camera);

    if (this._viewer.vr)
    {
        this._updateOpacity();
    }
};


/**
 * Camera orientation change event handler
 * @method FORGE.DockScene3D#_cameraOrientationOrientationChangeHandler
 * @param {FORGE.Event} event - camera orientation change event
 * @private
 */
FORGE.DockScene3D.prototype._cameraOrientationOrientationChangeHandler = function(event)
{
    if (this._interactive === false)
    {
        return;
    }

    this._updateOpacity();
};

/**
 * Set render property
 * @method FORGE.DockScene3D#_setRender
 * @param {boolean} value - render value
 * @private
 */
FORGE.DockScene3D.prototype._setRender = function(value)
{
    FORGE.Scene3D.prototype._setRender.call(this, value);

    this._updateOpacity();
};

/**
 * Scene load complete event handler
 * @method FORGE.DockScene3D#_sceneLoadCompleteHandler
 * @param {FORGE.Event} event - scene load complete event
 * @private
 */
FORGE.DockScene3D.prototype._sceneLoadCompleteHandler = function(event)
{
    FORGE.Scene3D.prototype._sceneLoadCompleteHandler.call(this, event);

    this._ready = true;

    this._updateOpacity();

    // Add listeners on camera change controlling dock display
    this._viewer.camera.onOrientationChange.add(this._cameraOrientationOrientationChangeHandler, this);
};

/**
 * Scene unload event handler
 * @method FORGE.DockScene3D#_sceneUnloadStartHandler
 * @private
 */
FORGE.DockScene3D.prototype._sceneUnloadStartHandler = function()
{
    FORGE.Scene3D.prototype._sceneUnloadStartHandler.call(this, event);

    this._ready = false;

    // Remove listeners on camera change controlling dock display
    this._viewer.camera.onOrientationChange.remove(this._cameraChangeHandler, this);
};

/**
 * Add a new object to the scene
 * @method FORGE.DockScene3D#add
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.DockScene3D.prototype.add = function(object)
{
    FORGE.Scene3D.prototype.add.call(this, object);

    object.traverse(function(mesh)
    {
        if (mesh.isMesh)
        {
            mesh.userData.opacity = mesh.material.opacity;
        }
    }.bind(this));
};

/**
 * Destroy routine
 * @method FORGE.DockScene3D#destroy
 */
FORGE.DockScene3D.prototype.destroy = function()
{
    if (this._viewer.camera !== null)
    {
        this._viewer.camera.onOrientationChange.remove(this._cameraChangeHandler, this);
    }

    FORGE.Scene3D.prototype.destroy.call(this);
};

