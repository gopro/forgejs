/**
 * Picking manager
 *
 * @constructor FORGE.PickingManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.RenderManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Picking draw pass.
     * @name FORGE.PickingManager#_pickingDrawPass
     * @type {FORGE.PickingDrawPass}
     * @private
     */
    this._pickingDrawPass = null;

    /**
     * Raycaster.
     * @name FORGE.PickingManager#_raycaster
     * @type {FORGE.Raycaster}
     * @private
     */
    this._raycaster = null;

    /**
     * The current picking mode (pointer or gaze)
     * @name {FORGE.PickingManager#_mode}
     * @type {string}
     * @private
     */
    this._mode = FORGE.PickingManager.modes.POINTER;

    FORGE.BaseObject.call(this, "PickingManager");

    this._boot();
};

FORGE.PickingManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PickingManager.prototype.constructor = FORGE.PickingManager;

/**
 * List diffrent modes for picking
 * @type {Object}
 * @const
 */
FORGE.PickingManager.modes = {};

/**
 * This mode is for picking the pointer position (like mouse / touch)
 * @type {string}
 * @const
 */
FORGE.PickingManager.modes.POINTER = "pointer";

/**
 * This mode is for gaze picking for VR, always pick in the middle of the view.
 * @type {string}
 * @const
 */
FORGE.PickingManager.modes.GAZE = "gaze";

/**
 * Boot sequence
 * @method FORGE.PickingManager#_boot
 * @private
 */
FORGE.PickingManager.prototype._boot = function()
{

};

/**
 * Setup and start raycast picking
 * Destroy draw pass picking if it exists
 * @method FORGE.PickingManager#_startRaycasting
 * @private
 */
FORGE.PickingManager.prototype._startRaycastPicking = function()
{
    if (this._raycaster !== null)
    {
        return;
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.stop();
        this._pickingDrawPass.destroy();
        this._pickingDrawPass = null;
    }

    this._raycaster = new FORGE.Raycaster(this._viewer);
    this._raycaster.start(this._mode);
};

/**
 * Setup and start drawpass picking
 * Destroy raycaster if it exists
 * @method FORGE.PickingManager#_startDrawpassPicking
 * @private
 */
FORGE.PickingManager.prototype._startDrawpassPicking = function()
{
    if (this._pickingDrawPass !== null)
    {
        return;
    }

    if (this._raycaster !== null)
    {
        this._raycaster.stop();
        this._raycaster.destroy();
        this._raycaster = null;
    }

    this._pickingDrawPass = new FORGE.PickingDrawPass(this._viewer);
    this._pickingDrawPass.start();
};

/**
 * Update internals for a given view type
 * @method FORGE.PickingManager#updateForViewType
 * @param {string} type - view type
 */
FORGE.PickingManager.prototype.updateForViewType = function(type)
{
    // Check view type: rectilinear will use raycasting, otherwise picking draw passes
    if (type === FORGE.ViewType.RECTILINEAR)
    {
        this._startRaycastPicking();
    }
    else
    {
        this._startDrawpassPicking();
    }
};

/**
 * Clear picking manager
 * @method FORGE.PickingManager#clear
 */
FORGE.PickingManager.prototype.clear = function()
{
    if (this._raycaster !== null)
    {
        this._raycaster.clear();
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.clear();
    }
};

/**
 * Update size (resolution)
 * @method FORGE.PickingManager#setSize
 * @param {FORGE.Size} size - size [px]
 */
FORGE.PickingManager.prototype.setSize = function(size)
{
    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.setSize(size);
    }
};

/**
 * Trigger a click on hovered oject (if it exists)
 * @method FORGE.PickingManager#click
 */
FORGE.PickingManager.prototype.click = function()
{
    if (this._raycaster !== null)
    {
        this._raycaster.click();
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.click();
    }
};

/**
 * Start picking
 * @method FORGE.PickingManager#start
 */
FORGE.PickingManager.prototype.start = function()
{
    if (this._raycaster !== null)
    {
        this._raycaster.start(this._mode);
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.start();
    }
};

/**
 * Stop picking
 * @method FORGE.PickingManager#stop
 */
FORGE.PickingManager.prototype.stop = function()
{
    if (this._raycaster !== null)
    {
        this._raycaster.stop();
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.stop();
    }
};

/**
 * Destroy routine
 * @method FORGE.PickingManager#destroy
 */
FORGE.PickingManager.prototype.destroy = function()
{
    if (this._raycaster !== null)
    {
        this._raycaster.stop();
        this._raycaster.destroy();
        this._raycaster = null;
    }

    if (this._pickingDrawPass !== null)
    {
        this._pickingDrawPass.stop();
        this._pickingDrawPass.destroy();
        this._pickingDrawPass = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get picking render target.
 * @name FORGE.PickingManager#renderTarget
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.PickingManager.prototype, "renderTarget",
{
    /** @this {FORGE.PickingManager} */
    get: function()
    {
        if (this._pickingDrawPass === null)
        {
            return null;
        }

        return this._pickingDrawPass.renderTarget;
    }
});

/**
 * Get picking material.
 * @name FORGE.PickingManager#material
 * @type {THREE.Material}
 */
Object.defineProperty(FORGE.PickingManager.prototype, "material",
{
    /** @this {FORGE.PickingManager} */
    get: function()
    {
        if (this._pickingDrawPass === null)
        {
            return null;
        }

        return this._pickingDrawPass.material;
    }
});

/**
 * Get and set the raycaster mode between pointer or gaze
 * @name FORGE.PickingManager#mode
 * @type {string}
 */
Object.defineProperty(FORGE.PickingManager.prototype, "mode",
{
    /** @this {FORGE.PickingManager} */
    get: function()
    {
        return this._mode;
    },

    /** @this {FORGE.PickingManager} */
    set: function(value)
    {
        if(value !== FORGE.PickingManager.modes.POINTER && value !== FORGE.PickingManager.modes.GAZE)
        {
            return;
        }

        if(value !== this._mode)
        {
            this._mode = value;
            this.start();
        }
    }
});

