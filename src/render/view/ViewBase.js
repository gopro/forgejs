/**
 * Abstract base class for projeted views. Should be subclassed for every supported projection / view type.
 *
 * @constructor FORGE.ViewBase
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {string} className - object className.
 * @param {string} type - object view type.
 * @extends {FORGE.BaseObject}
 */
FORGE.ViewBase = function(viewer, className, type)
{
    /**
     * The Viewer reference.
     * @name FORGE.ViewBase#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Projection scale.
     * @name FORGE.ViewBase#_projectionScale
     * @type {number}
     * @private
     */
    this._projectionScale = 1.0;

    /**
     * View type.
     * @name FORGE.ViewBase#_type
     * @type {string}
     * @private
     */
    this._type = type;

    /**
     * Yaw min angle for current view type [radians].
     * @name FORGE.ViewBase#_yawMin
     * @type {number}
     * @private
     */
    this._yawMin = -Infinity;

    /**
     * Yaw max angle for current view type [radians].
     * @name FORGE.ViewBase#_yawMax
     * @type {number}
     * @private
     */
    this._yawMax = Infinity;

    /**
     * Pitch min angle for current view type [radians].
     * @name FORGE.ViewBase#_pitchMin
     * @type {number}
     * @private
     */
    this._pitchMin = -Infinity;

    /**
     * Pitch min angle for current view type [radians].
     * @name FORGE.ViewBase#_pitchMax
     * @type {number}
     * @private
     */
    this._pitchMax = Infinity;

    /**
     * Roll min angle for current view type [radians].
     * @name FORGE.ViewBase#_rollMin
     * @type {number}
     * @private
     */
    this._rollMin = -Infinity;

    /**
     * Roll max angle for current view type [radians].
     * @name FORGE.ViewBase#_rollMax
     * @type {number}
     * @private
     */
    this._rollMax = Infinity;

    /**
     * Fov min angle for current view type [radians].
     * @name FORGE.ViewBase#_fovMin
     * @type {number}
     * @private
     */
    this._fovMin = 0;

    /**
     * Fov max angle for current view type [radians].
     * @name FORGE.ViewBase#_fovMax
     * @type {number}
     * @private
     */
    this._fovMax = Infinity;

    /**
     * Shader screen to world
     * @name FORGE.ViewBase#_shaderSTW
     * @type {?ScreenToWorldProgram}
     * @private
     */
    this._shaderSTW = null;

    /**
     * Shader world to screen
     * @name FORGE.ViewBase#_shaderWTS
     * @type {?WorldToScreenProgram}
     * @private
     */
    this._shaderWTS = null;

    FORGE.BaseObject.call(this, className || "ViewBase");
};

FORGE.ViewBase.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ViewBase.prototype.constructor = FORGE.ViewBase;

/**
 * Boot sequence.
 *
 * @method FORGE.ViewBase#_boot
 * @private
 */
FORGE.ViewBase.prototype._boot = function()
{

};

/**
 * Compute fragment from a screen point.
 *
 * @method FORGE.ViewBase#_screenToFragment
 * @param  {THREE.Vector2} screenPt - Point in screen space
 * @return {THREE.Vector2} Fragment in normalized space
 * @private
 */
FORGE.ViewBase.prototype._screenToFragment = function(screenPt)
{
    var resolution = this._viewer.renderer.displayResolution;
    var fx = (2.0 * screenPt.x / resolution.width) - 1.0;
    var fy = (2.0 * screenPt.y / resolution.height) - 1.0;
    return new THREE.Vector2(fx * resolution.ratio, fy);
};

/**
 * Compute screen point from a fragment.
 *
 * @method FORGE.ViewBase#_fragmentToScreen
 * @param {THREE.Vector2} fragment - Fragment in normalized space
 * @return  {THREE.Vector2} Point in screen space
 * @private
 */
FORGE.ViewBase.prototype._fragmentToScreen = function(fragment)
{
    var resolution = this._viewer.renderer.displayResolution;
    fragment.x = ((fragment.x / resolution.ratio) + 1) * (resolution.width / 2);
    fragment.y = ((fragment.y / resolution.ratio) + 1) * (resolution.height / 2);
    return new THREE.Vector2(Math.round(fragment.x), resolution.height - Math.round(fragment.y));
};

/**
 * Update uniforms.
 * Abstract method that should be implemented by subclass.
 *
 * @method FORGE.ViewBase#updateUniforms
 * @param {FORGEUniform} uniforms
 */
FORGE.ViewBase.prototype.updateUniforms = function(uniforms)
{
    this.log(uniforms); //@closure
    throw "Please implement " + this._className + "::updateUniforms";
};

/**
 * Convert a point from world space to screen space.
 * Abstract method that should be implemented by subclass.
 *
 * @method FORGE.ViewBase#worldToScreen
 * @param {THREE.Vector3} worldPt - Point in world space
 * @param {number} parallax - Parallax factor [0..1]
 * @return {!THREE.Vector2} Point in screen coordinates or null if the point is out of bounds.
 * @todo Implement worldToScreen
 */
FORGE.ViewBase.prototype.worldToScreen = function(worldPt, parallax)
{
    this.log(worldPt); //@closure
    this.log(parallax); //@closure
    throw "Please implement " + this._className + "::worldToScreen";
};

/**
 * Convert a point from screen space to world space.
 * Abstract method that should be implemented by subclass.
 * @method FORGE.ViewBase#screenToWorld
 * @param {THREE.Vector2} screenPt point in screen space
 * @return {!THREE.Vector3} Point in world space or null if the screenPt is out of bounds.
 * @todo Implement screenToWorld
 */
FORGE.ViewBase.prototype.screenToWorld = function(screenPt)
{
    this.log(screenPt); //@closure
    throw "Please implement " + this._className + "::screenToWorld";
};

/**
 * Get fov computed for projection.
 * @method FORGE.ViewBase#getProjectionFov
 */
FORGE.ViewBase.prototype.getProjectionFov = function()
{
    return FORGE.Math.degToRad(this._viewer.renderer.camera.fov);
};

/**
 * Destroy method.
 *
 * @method FORGE.ViewBase#destroy
 */
FORGE.ViewBase.prototype.destroy = function()
{
    this._viewer = null;
    this._camera = null;

    this._shaderSTW = null;
    this._shaderWTS = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the view type.
 * @name FORGE.ViewBase#type
 * @type {string}
 * @readonly
 */
Object.defineProperty(FORGE.ViewBase.prototype, "type",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get the minimum yaw value in radians.
 * @name FORGE.ViewBase#yawMin
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "yawMin",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._yawMin;
    }
});

/**
 * Get the maximum yaw value in radians.
 * @name FORGE.ViewBase#yawMax
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "yawMax",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._yawMax;
    }
});

/**
 * Get the minimum pitch value in radians.
 * @name FORGE.ViewBase#pitchMin
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "pitchMin",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._pitchMin;
    }
});

/**
 * Get the maximum pitch value in radians.
 * @name FORGE.ViewBase#pitchMax
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "pitchMax",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._pitchMax;
    }
});

/**
 * Get the minimum roll value in radians.
 * @name FORGE.ViewBase#rollMin
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "rollMin",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._rollMin;
    }
});

/**
 * Get the maximum roll value in radians.
 * @name FORGE.ViewBase#rollMax
 * @type {number}
 */
Object.defineProperty(FORGE.ViewBase.prototype, "rollMax",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._rollMax;
    }
});

/**
 * Get minimum fov for current view in radians.
 * @name FORGE.ViewBase#fovMin
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.ViewBase.prototype, "fovMin",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._fovMin;
    }
});

/**
 * Get maximum fov for current view in radians.
 * @name FORGE.ViewBase#fovMax
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.ViewBase.prototype, "fovMax",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._fovMax;
    }
});

/**
 * Shader screen to world
 * @name FORGE.ViewBase#shaderSTW
 * @type {ScreenToWorldProgram}
 * @readonly
 */
Object.defineProperty(FORGE.ViewBase.prototype, "shaderSTW",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._shaderSTW;
    }
});

/**
 * Shader world to screen
 * @name FORGE.ViewBase#shaderWTS
 * @type {WorldToScreenProgram}
 * @readonly
 */
Object.defineProperty(FORGE.ViewBase.prototype, "shaderWTS",
{
    /** @this {FORGE.ViewBase} */
    get: function()
    {
        return this._shaderWTS;
    }
});
