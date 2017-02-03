/**
 * @constructor FORGE.ObjectRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ObjectRenderer = function(viewer)
{
    /**
     * Viewer reference
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * List of object that have to be rendered
     * @name FORGE.ObjectRenderer#_objects
     * @type {Array<FORGE.Object3D>}
     * @private
     */
    this._objects = null;

    /**
     * Array of render passes
     * @type {Array<FORGE.RenderScene>}
     * @private
     */
    this._renderScenes = null;

    FORGE.BaseObject.call(this, "ObjectRenderer");

    this._boot();
};

FORGE.ObjectRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ObjectRenderer.prototype.constructor = FORGE.ObjectRenderer;

/**
 * Init routine
 * @method FORGE.ObjectRenderer#_boot
 * @private
 */
FORGE.ObjectRenderer.prototype._boot = function()
{
    this._objects = [];
    this._renderScenes = [];
};

/**
 * Get 3d objects by FX
 * @method  FORGE.ObjectRenderer#_getByFX
 * @param  {?string} fx - The fx name you want to use to filter 3d objects. If undefined or null, will return 3d objects without fx.
 * @return {Array<FORGE.Object3D>}
 * @private
 */
FORGE.ObjectRenderer.prototype._getByFX = function(fx)
{
    var result = [];

    if(typeof fx === "undefined" || fx === "" || fx === null)
    {
        result = this._objects.filter(function(hs)
        {
            return (typeof hs.fx === "undefined" || hs.fx === "" || hs.fx === null);
        });
    }
    else
    {
        result = this._objects.filter(function(hs)
        {
            return hs.fx === fx;
        });
    }

    return result;
};

/**
 * Get 3d objects that have no fx
 * @method  FORGE.ObjectRenderer#_getWithoutFX
 * @return {Array<FORGE.Object3D>}
 * @private
 */
FORGE.ObjectRenderer.prototype._getWithoutFX = function()
{
    var result = this._getByFX(null);
    return result;
};

/**
 * Get 3d objects that have fx
 * @method  FORGE.ObjectRenderer#_getWithFX
 * @return {Array<FORGE.Object3D>}
 * @private
 */
FORGE.ObjectRenderer.prototype._getWithFX = function()
{
    var withoutFX = this._getWithoutFX();
    var result = FORGE.Utils.arrayByDifference(this._objects, withoutFX);
    return result;
};

/**
 * Get single fx list used by all objects
 * @method  FORGE.ObjectRenderer#_getFX
 * @return {Array<string>}
 * @private
 */
FORGE.ObjectRenderer.prototype._getFX = function()
{
    var withFX = this._getWithFX();

    var result = withFX.reduce(function(list, spot)
    {
        if (list.indexOf(spot.fx) < 0)
        {
            list.push(spot.fx);
        }

        return list;

    }, []);

    return result;
};

/**
 * Register an object to the object renderer
 * @method FORGE.ObjectRenderer#register
 * @param  {FORGE.Object3D} object - The object to register
 */
FORGE.ObjectRenderer.prototype.register = function(object)
{
    this._objects.push(object);
};

/**
 * Unregister an object from the object renderer.
 * @method  FORGE.ObjectRenderer#unregister
 * @param {FORGE.Object3D} object - The object to unregister from the object renderer.
 */
FORGE.ObjectRenderer.prototype.unregister = function(object)
{
    this._objects.splice(this._objects.indexOf(object), 1);
};

/**
 * @method FORGE.ObjectRenderer#createRenderScenes
 */
FORGE.ObjectRenderer.prototype.createRenderScenes = function()
{
    // First get all 3d objects without any FX and create a render pass for them
    // Then get all other 3d objects (with some FX), extract FX list and create
    // as many render passes as needed (one for each FX set).

    var camera = this._viewer.renderer.camera.main;

    // Get list of objects without any fx
    var withoutFX = this._getWithoutFX();

    // Create a render pass for them
    if (withoutFX.length > 0)
    {
        var scene = new THREE.Scene();

        for (var i = 0, ii = withoutFX.length; i < ii; i++)
        {
            scene.add(withoutFX[i].mesh);
        }

        var renderScene = new FORGE.RenderScene(this._viewer, scene, camera, null);
        this._renderScenes.push(renderScene);
    }

    var fxList = this._getFX();

    // For each FX in the list, create a render scene and assign all 3d objects
    // with the FX to it
    for (var j = 0, jj = fxList.length; j < jj; j++)
    {
        var fx = fxList[j];
        var renderList = this._getByFX(fx);
        var sceneFx = new THREE.Scene();

        for (var k = 0, kk = renderList.length; k < kk; k++)
        {
            sceneFx.add(renderList[k].mesh);
        }

        var fxSet = this._viewer.postProcessing.getFxSetByUID(fx);

        var renderScene = new FORGE.RenderScene(this._viewer, sceneFx, camera, fxSet);
        this._renderScenes.push(renderScene);
    }
};

/**
 * Get 3d objects that are eligible to raycast (interactive)
 * @method  FORGE.ObjectRenderer#getRaycastable
 * @return {Array<FORGE.Object3D>}
 */
FORGE.ObjectRenderer.prototype.getRaycastable = function()
{
    var result = this._objects.filter(function(object)
    {
        return (object.ready === true && object.interactive === true);
    });

    return result;
};

/**
 * Get a 3d object from it's mesh
 * @method  FORGE.ObjectRenderer#getByMesh
 * @return {?FORGE.Object3D}
 */
FORGE.ObjectRenderer.prototype.getByMesh = function(mesh)
{
    for(var i = 0, ii = this._objects.length; i < ii; i++)
    {
        if(this._objects[i].mesh === mesh)
        {
            return this._objects[i];
        }
    }

    return null;
};

/**
 * Clear all render scenes
 * @method FORGE.ObjectRenderer#clear
 */
FORGE.ObjectRenderer.prototype.clear = function()
{
    var count = this._renderScenes.length;
    while(count--)
    {
        var renderScene = this._renderScenes.pop();
        renderScene.destroy();
    }
};

/**
 * Destroy sequence
 * @method FORGE.ObjectRenderer#destroy
 */
FORGE.ObjectRenderer.prototype.destroy = function()
{
    this.clear();
    this._renderScenes = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get all the objects
 * @name FORGE.ObjectRenderer#all
 * @type {Array<FORGE.Object3D>}
 */
Object.defineProperty(FORGE.ObjectRenderer.prototype, "all",
{
    /** @this {FORGE.ObjectRenderer} */
    get: function()
    {
        return this._objects;
    }
});


/**
 * Get background renderer render items array.
 * @name FORGE.ObjectRenderer#renderScenes
 * @type {Array<FORGE.RenderScene>}
 */
Object.defineProperty(FORGE.ObjectRenderer.prototype, "renderScenes",
{
    /** @this {FORGE.ObjectRenderer} */
    get: function()
    {
        return this._renderScenes;
    }
});


