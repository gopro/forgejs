
/**
 * Handles the loading of a scene.
 * @constructor FORGE.SceneLoader
 * @param {FORGE.Viewer} viewer - Viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneLoader = function(viewer)
{
    /**
     * Viewer reference
     * @name  FORGE.SceneLoader#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;


    this._sceneUid = "";
    this._transitionUid = "";

    this._loading = false;

    this._onLoadStart = null;
    this._onLoadComplete = null;

    this._onMediaLoadStart = null;
    this._onMediaLoadComplete = null;

    this._onTransitionStart = null;
    this._onTransitionComplete = null;




    FORGE.BaseObject.call(this, className || "SceneLoader");

    this._boot();
};

FORGE.SceneLoader.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneLoader.prototype.constructor = FORGE.SceneLoader;

/**
 * Boot sequence.
 * @method FORGE.SceneLoader#_boot
 */
FORGE.SceneLoader.prototype._boot = function()
{

};

/**
 * Load media.
 * @method FORGE.SceneLoader#_loadMedia
 */
FORGE.SceneLoader.prototype._loadMedia = function()
{
    var scene = FORGE.UID.get(this._sceneUid);
    scene.media.onLoadComplete.addOnce(this._mediaLoadCompleteHandler, this);
    scene.media.load();

    if(this._onMediaLoadStart !== null)
    {
        this._onMediaLoadStart.dispatch();
    }
};

/**
 * Media load complete handler.
 * @method FORGE.SceneLoader#_mediaLoadCompleteHandler
 */
FORGE.SceneLoader.prototype._mediaLoadCompleteHandler = function()
{
    if(this._onMediaLoadComplete !== null)
    {
        this._onMediaLoadComplete.dispatch();
    }

    this._startTransition();
};

/**
 * Starts the transition.
 * @method FORGE.SceneLoader#_startTransition
 */
FORGE.SceneLoader.prototype._startTransition = function()
{
    if(this._onTransitionStart !== null)
    {
        this._onTransitionStart.dispatch();
    }

    var transition = FORGE.UID.get(this._transitionUid);
    transition.onComplete.addonce(this._transitionCompleteHandler, this);
    trnsition.start();
};

/**
 * Transition complete handler.
 * @method FORGE.SceneLoader#_transitionCompleteHandler
 */
FORGE.SceneLoader.prototype._transitionCompleteHandler = function()
{
    if(this._onTransitionComplete !== null)
    {
        this._onTransitionComplete.dispatch();
    }

    this._loading = false;
};

/**
 * Load a scene by its uid.
 * @method FORGE.SceneLoader#load
 * @param {string} sceneUid - The scene uid to load
 */
FORGE.SceneLoader.prototype.load = function(sceneUid, transitionUid)
{
    if (this._loading === true)
    {
        this.warn("Can't load multiple scene, scene "+this._sceneUid+" is already loading");
        return;
    }

    if (FORGE.UID.istypeOf(sceneUid, "Scene") === false)
    {
        this.warn("the scene uid "+sceneUid+" does not exists");
        return;
    }

    if (FORGE.UID.istypeOf(transitionUid, "Transition") === false)
    {
        this.warn("the transition uid "+transitionUid+" does not exists");
        return;
    }

    this._loading = true;
    this._sceneUid = sceneUid;
    this._transitionUid = transitionUid;

    this._loadMedia();
};

/**
 * Destroy sequence
 * @method FORGE.SceneLoader#destroy
 */
FORGE.SceneLoader.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * description
 * @name FORGE.SceneLoader#prop
 * @readonly
 * @type {void}
  */
Object.defineProperty(FORGE.SceneLoader.prototype, "prop",
{
    /** @this {FORGE.SceneLoader} */
    get: function()
    {
        return;
    }
});


/**
 * Get the onReady {@link FORGE.EventDispatcher}.
 * @name FORGE.Object3D#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SceneLoader.prototype, "onReady",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        if (this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});

