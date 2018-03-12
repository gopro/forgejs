/**
 * SceneRendererPool class.
 *
 * This is a collection of FORGE.SceneRenderer objects used to render
 * scenes. The pool will be filled up with scenes currently renderer.
 *
 * Use cases are multiple scenes during a transition, or a scene displayed
 * as an overlay in a dedicated viewport (floorplan, ...)
 *
 * @constructor FORGE.SceneRendererPool
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneRendererPool = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneRendererPool#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Pool of FORGE.SceneRenderer objects.
     * @name FORGE.SceneRendererPool#_pool
     * @type {FORGE.Viewer}
     * @private
     */
    this._pool = null;

    /**
     * Active scene UID
     * @todo : at the moment it will always be set to the first scene
     * @name FORGE.SceneRendererPool#_activeSceneUID
     * @type {FORGE.UID}
     * @private
     */
    this._activeSceneUID = null;

    FORGE.BaseObject.call(this, "SceneRendererPool");

    this._boot();
};

FORGE.SceneRendererPool.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneRendererPool.prototype.constructor = FORGE.SceneRendererPool;

/**
 * Boot sequence.
 * @method FORGE.SceneRendererPool#_boot
 * @private
 */
FORGE.SceneRendererPool.prototype._boot = function()
{
    this._pool = {};
};

/**
 * Active viewport change handler.
 * @method FORGE.SceneRendererPool#_onActiveViewportChanged
 * @param {FORGE.Event} event - event
 */
FORGE.SceneRendererPool.prototype._onActiveViewportChanged = function()
{
    this._viewer.renderer.notifyActiveViewportChange();
};

/**
 * Remove all scene renderers.
 * @method FORGE.SceneRendererPool#has
 * @param {string} sceneUID - The scene uinque identifier you are looking for.
 * @return {boolean} return true if the pool has a renderer for a given uid, false if not.
 */
FORGE.SceneRendererPool.prototype.has = function(sceneUID)
{
    return typeof this._pool[sceneUID] !== "undefined";
};

/**
 * Add scene renderer.
 * @method FORGE.SceneRendererPool#add
 * @param {FORE.UID} sceneUID - scene unique identifier
 */
FORGE.SceneRendererPool.prototype.add = function(sceneUID)
{
    // Create a renderer for this scene if it does not exist
    if(typeof this._pool[sceneUID] === "undefined")
    {
        this._pool[sceneUID] = new FORGE.SceneRenderer(this._viewer, sceneUID);
    }

    this._activeSceneUID = sceneUID;
};

/**
 * Remove scene renderer.
 * @method FORGE.SceneRendererPool#remove
 * @param {FORE.UID} sceneUID - scene unique identifier
 */
FORGE.SceneRendererPool.prototype.remove = function(sceneUID)
{
    if (this.has(sceneUID) === false)
    {
        return;
    }

    var renderer = this.get(sceneUID);
    renderer.viewports.onActiveViewportChange.remove(this._onActiveViewportChanged, this);
    renderer.destroy();

    this._pool[sceneUID] = null;
    delete this._pool[sceneUID];
};

/**
 * Remove all scene renderers.
 * @method FORGE.SceneRendererPool#clear
 */
FORGE.SceneRendererPool.prototype.clear = function()
{
    for(uid in this._pool)
    {
        this.remove(uid);
    }

    this._pool = {};
};

FORGE.SceneRendererPool.prototype.get = function(sceneUID)
{
    return this._pool[sceneUID];
};

/**
 * Render routine.
 * @method FORGE.SceneRendererPool#render
 * @return {Array<THREE.WebGLRenderTarget>} array of render targets
 */
FORGE.SceneRendererPool.prototype.render = function()
{
    for (uid in this._pool)
    {
        this._pool[uid].render();
    }
};

/**
 * Destroy sequence.
 * @method FORGE.SceneRendererPool#destroy
 */
FORGE.SceneRendererPool.prototype.destroy = function()
{
    this.clear();

    this._pool = null;

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    this._viewer = null;
};

/**
 * Get all the scenes renderers
 * @name FORGE.SceneRendererPool#all
 * @type {Array<FORGE.SceneRenderer>}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRendererPool.prototype, "all",
{
    /** @this {FORGE.SceneRendererPool} */
    get: function()
    {
        return Object.values(this._pool);
    }
});

/**
 * Get the active viewport
 * @name FORGE.SceneRendererPool#activeViewport
 * @type {FORGE.Viewport}
 * @readonly
 */
Object.defineProperty(FORGE.SceneRendererPool.prototype, "activeViewport",
{
    /** @this {FORGE.SceneRendererPool} */
    get: function()
    {
        return this._pool[this._activeSceneUID].viewports.active;
    }
});
