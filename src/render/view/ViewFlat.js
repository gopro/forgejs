/**
 * Flat view class.
 *
 * @constructor FORGE.ViewFlat
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.ViewBase}
 */
FORGE.ViewFlat = function(viewer)
{
    FORGE.ViewBase.call(this, viewer, "ViewFlat", FORGE.ViewType.FLAT);

    /**
     * Repeat texture horizontally
     * @type {boolean}
     * @private
     */
    this._repeatX = false;

    /**
     * Repeat texture vertically
     * @type {boolean}
     * @private
     */
    this._repeatY = false;

    this._boot();
};

FORGE.ViewFlat.prototype = Object.create(FORGE.ViewBase.prototype);
FORGE.ViewFlat.prototype.constructor = FORGE.ViewFlat;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewFlat#_boot
 * @private
 */
FORGE.ViewFlat.prototype._boot = function()
{
    FORGE.ViewBase.prototype._boot.call(this);

    this._shaderSTW = /** @type {ScreenToWorldProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.screenToWorld.flat));
    this._shaderWTS = /** @type {WorldToScreenProgram} */ (FORGE.Utils.extendSimpleObject({}, FORGE.ShaderLib.worldToScreen.flat));

    this._yawMin = FORGE.Math.degToRad(-360);
    this._yawMax = FORGE.Math.degToRad(360);

    this._pitchMin = FORGE.Math.degToRad(-180);
    this._pitchMax = FORGE.Math.degToRad(180);

    this._fovMin = FORGE.Math.degToRad(20);
    this._fovMax = FORGE.Math.degToRad(180);
};

/**
 * Update view params.
 * @method FORGE.ViewFlat#_updateViewParams
 * @private
 */
FORGE.ViewFlat.prototype._updateViewParams = function()
{
    var vfov = FORGE.Math.degToRad(this._viewer.camera.fov);

    // When repeat is ON, set yaw and pitch min and max depending on
    // texture and screen ratios

    if (this._viewer.renderer.backgroundRenderer instanceof FORGE.BackgroundShaderRenderer)
    {
        if (this._repeatX === false)
        {
            var hfov = vfov * this._viewer.renderer.displayResolution.ratio;
            var texRatio = this._viewer.renderer.backgroundRenderer.textureSize.ratio;
            this._yawMax = Math.min(360, Math.max(0, (Math.PI * texRatio - hfov) * 0.5)); // image
            this._yawMin = -this._yawMax;
        }
        else
        {
            this._yawMin = FORGE.Math.degToRad(-360);
            this._yawMax = FORGE.Math.degToRad(360);
        }

        if (this._repeatY === false)
        {
            this._pitchMax = 0.5 * Math.max(0, Math.PI - vfov);
            this._pitchMin = -this._pitchMax;
        }
        else
        {
            this._pitchMin = FORGE.Math.degToRad(-180);
            this._pitchMax = FORGE.Math.degToRad(180);
        }

        this._viewer.view.notifyChange();
    }

    // Mesh rendering in flat view is limited around -+ 20 degrees
    else
    {
        this._yawMax = this._pitchMax = FORGE.Math.degToRad(20);
        this._yawMin = -this._yawMax;
        this._pitchMin = -this._pitchMax;
    }
};

/**
 * Update uniforms.
 *
 * @method FORGE.ViewFlat#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewFlat.prototype.updateUniforms = function(uniforms)
{
    this._updateViewParams();

    if (typeof uniforms === "undefined")
    {
        return;
    }

    if (uniforms.hasOwnProperty("tRepeatX"))
    {
        uniforms.tRepeatX.value = this._repeatX ? 1 : 0;
    }

    if (uniforms.hasOwnProperty("tRepeatY"))
    {
        uniforms.tRepeatY.value = this._repeatY ? 1 : 0;
    }

    if (uniforms.hasOwnProperty("tYaw"))
    {
        uniforms.tYaw.value = FORGE.Math.degToRad(this._viewer.camera.yaw);
    }

    if (uniforms.hasOwnProperty("tPitch"))
    {
        uniforms.tPitch.value = FORGE.Math.degToRad(this._viewer.camera.pitch);
    }

    if (uniforms.hasOwnProperty("tFov"))
    {
        uniforms.tFov.value = FORGE.Math.degToRad(this._viewer.renderer.camera.fov);
    }
};

/**
 * Convert a point from world space to screen space.
 *
 * @method FORGE.ViewFlat#worldToScreen
 * @return {THREE.Vector2} point in screen coordinates
 */
FORGE.ViewFlat.prototype.worldToScreen = function()
{
    return new THREE.Vector2();
};

/**
 * Convert a point from screen space to world space.
 *
 * @method FORGE.ViewFlat#screenToWorld
 * @return {THREE.Vector3} world point
 */
FORGE.ViewFlat.prototype.screenToWorld = function()
{
    return new THREE.Vector3();
};

/**
 * Destroy method.
 *
 * @method FORGE.ViewFlat#destroy
 */
FORGE.ViewFlat.prototype.destroy = function()
{
    FORGE.ViewBase.prototype.destroy.call(this);
};

/**
 * Get and set the repeat X beahvior.
 * @name  FORGE.ViewFlat#repeatX
 * @type {string}
 */
Object.defineProperty(FORGE.ViewFlat.prototype, "repeatX",
{
    /** @this {FORGE.ViewFlat} */
    get: function()
    {
        return this._repeatX;
    },

    /** @this {FORGE.ViewFlat} */
    set: function(value)
    {
        this._repeatX = value;
        this._updateViewParams();

        // Notify the view manager of the change
        this._viewer.view.notifyChange();
    }
});

/**
 * Get and set the repeat Y beahvior.
 * @name  FORGE.ViewFlat#repeatY
 * @type {string}
 */
Object.defineProperty(FORGE.ViewFlat.prototype, "repeatY",
{
    /** @this {FORGE.ViewFlat} */
    get: function()
    {
        return this._repeatY;
    },

    /** @this {FORGE.ViewFlat} */
    set: function(value)
    {
        this._repeatY = value;
        this._updateViewParams();

        // Notify the view manager of the change
        this._viewer.view.notifyChange();
    }
});
