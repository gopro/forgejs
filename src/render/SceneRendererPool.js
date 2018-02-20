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
     * @name FORGE.SceneRendererPool#_sceneRenderers
     * @type {FORGE.Viewer}
     * @private
     */
    this._sceneRenderers = null;

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
    this._sceneRenderers = [];
};

/**
 * Remove all scene renderers.
 * @method FORGE.SceneRendererPool#_removeAllScenes
 * @private
 */
FORGE.SceneRendererPool.prototype._removeAllScenes = function(sceneUID)
{
    while (this._sceneRenderers.length > 0)
    {
        var sceneRenderer = this._sceneRenderers.pop();
        sceneRenderer.viewports.onActiveViewportChange.remove(this._onActiveViewportChanged, this);
        sceneRenderer.destroy();
    }
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
 * Add scene renderer.
 * @method FORGE.SceneRendererPool#addScene
 * @param {FORE.UID} sceneUID - scene unique identifier
 */
FORGE.SceneRendererPool.prototype.addScene = function(sceneUID)
{
    var sceneRenderer = new FORGE.SceneRenderer(this._viewer, sceneUID);

    // First scene renderer becomes the active one
    // That means we listen to active viewport change event and keep its sceneUID
    // if (this._sceneRenderers.length === 0)
    // {
    //     this._activeSceneUID = sceneUID;
    //     sceneRenderer.viewports.onActiveViewportChange.add(this._onActiveViewportChanged, this);
    // }


    this._sceneRenderers.push(sceneRenderer);
    this._activeSceneUID = sceneUID;
};

/**
 * Remove scene renderer.
 * @method FORGE.SceneRendererPool#removeScene
 * @param {FORE.UID} sceneUID - scene unique identifier
 */
FORGE.SceneRendererPool.prototype.removeScene = function(sceneUID)
{
    var index = this._sceneRenderers.findIndex(function(sceneRenderer) {
        return sceneRenderer.scene.uid === sceneUID;
    });

    var sceneRenderer = this._sceneRenderers.splice(index, 1);
    sceneRenderer.viewports.onActiveViewportChange.remove(this._onActiveViewportChanged, this);
    sceneRenderer.destroy();

    if (this._sceneRenderers.length === 1)
    {
        this._activeSceneUID = this._sceneRenderers[0].sceneUID;
    }
};

/**
 * Render routine.
 * @method FORGE.SceneRendererPool#render
 * @return {Array<THREE.WebGLRenderTarget>} array of render targets
 */
FORGE.SceneRendererPool.prototype.render = function()
{
    var renderTargets = [];

    for (var i=0; i<this._sceneRenderers.length; i++)
    {
        renderTargets.push(this._sceneRenderers[i].render());
    }

    return renderTargets;
};

/**
 * Destroy sequence.
 * @method FORGE.SceneRendererPool#destroy
 */
FORGE.SceneRendererPool.prototype.destroy = function()
{
    this._removeAllScenes();

    this._sceneRenderers = null;

    if (this._onActiveViewportChange !== null)
    {
        this._onActiveViewportChange.destroy();
        this._onActiveViewportChange = null;
    }

    this._viewer = null;
};

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
        var sceneRenderer = this._sceneRenderers.find(function(r) {
            return r.scene.uid === this._activeSceneUID;
        }.bind(this));

        if (sceneRenderer === undefined)
        {
            return null;
        }

        return sceneRenderer.viewports.active;
    }
});
