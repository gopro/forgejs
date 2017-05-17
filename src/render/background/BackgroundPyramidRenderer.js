/**
 * FORGE.BackgroundPyramidRenderer
 * BackgroundPyramidRenderer class.
 *
 * @constructor FORGE.BackgroundPyramidRenderer
 * @extends {FORGE.BackgroundRenderer}
 *
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.WebGLRenderTarget} target - render target
 * @param {SceneMediaOptionsConfig} options - the options for the cubemap
 */
FORGE.BackgroundPyramidRenderer = function(viewer, target, options)
{
    /**
     * Minimum level of the pyramid
     * @type {Number}
     * @private
     */
    this._levelMin = 0;

    /**
     * Maximum level of the pyramid
     * @type {Number}
     * @private
     */
    this._levelMax = 10;

    /**
     * Current level of the pyramid
     * @type {Number}
     * @private
     */
    this._level = 1;

    /**
     * The size of the cube.
     * @type {number}
     * @private
     */
    this._size = 0;

    /**
     * Cache of tiles
     * @type {}
     * @private
     */
    this._tileCache = null;

    FORGE.BackgroundRenderer.call(this, viewer, target, options, "BackgroundPyramidRenderer");
};

FORGE.BackgroundPyramidRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundPyramidRenderer.prototype.constructor = FORGE.BackgroundPyramidRenderer;

/**
 * Boot routine.
 * @method FORGE.BackgroundPyramidRenderer#_boot
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    this.log("boot");

    // this._size = 2 * FORGE.RenderManager.DEPTH_FAR;
    this._size = 100;

    this._tileCache = {};

    this._viewer.camera.onCameraChange.add(this._onCameraChange, this);

    this.selectLevel(this._cameraFovToPyramidLevel(this._viewer.camera.fov));

    // window.scene = this._scene;
};

/**
 * Clear routine.
 * @method FORGE.BackgroundPyramidRenderer#_clear
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._clear = function()
{
    // ...
};

/**
 * Update after view change
 * @method FORGE.BackgroundPyramidRenderer#updateAfterViewChange
 */
FORGE.BackgroundPyramidRenderer.prototype.updateAfterViewChange = function()
{
    // ...
};

/**
 * Get pyramid level for a given fov
 * @method FORGE.BackgroundPyramidRenderer#_cameraFovToPyramidLevel
 * @param {number} fov camera field of view [degrees]
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._cameraFovToPyramidLevel = function(fov)
{
    return Math.max(0, Math.floor(1 - Math.log(fov / 90) / Math.LN2));
};

/**
 * Get fov threshold from a pyramid level
 * @method FORGE.BackgroundPyramidRenderer#_pyramidLevelToCameraFov
 * @param {number} level pyramid level
 * @return {number} fov camera field of view [degrees]
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._pyramidLevelToCameraFov = function(level)
{
    return 90 / Math.pow(2, level);
};

/**
 * Camera change callback.
 * @method FORGE.BackgroundPyramidRenderer#_onCameraChange
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._onCameraChange = function(event)
{
    var camera = event.emitter;
    var fov = camera.fov;

    var level = this._cameraFovToPyramidLevel(fov);
    if (this._level !== level)
    {
        this.selectLevel(level);
    }
};

/**
 * Is tile in frustum
 * @method FORGE.BackgroundPyramidRenderer#getVisibleTiles
 * @return {Boolean} true if tile is in frustum, false otherwise
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._isTileInFrustum = function(tile)
{
    var camera = this._viewer.camera.main;
    var frustum = new THREE.Frustum();
    frustum.setFromMatrix(new THREE.Matrix4().multiply(camera.projectionMatrix, camera.matrixWorldInverse));
    return frustum.intersectsObject(tile);
};

/**
 * Get tile unique key based on its attribute.
 * @method FORGE.BackgroundPyramidRenderer#_getTileKey
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._getTileKey = function(level, face, x, y)
{
    return "tile_l" + level + "_f" + face + "_y" + y + "_x" + x;
};

/**
 * Get tile
 * Lookup in cache first or create it if not already in cache
 * @method FORGE.BackgroundPyramidRenderer#visibleTiles
 */
FORGE.BackgroundPyramidRenderer.prototype.getTile = function(level, face, x, y)
{
    var key = this._getTileKey(level, face, x, y);

    if (typeof this._tileCache[level] === "undefined")
    {
        this._tileCache[level] = new Map();
    }

    var tile = this._tileCache[level].get(key);
    
    if (tile === undefined)
    {
        tile = new FORGE.Tile(this, x, y, level, face);
        this._tileCache[level].set(key, tile);
    }

    return tile;
};

/**
 * Get number of tiles per axis for a given level
 * @method FORGE.BackgroundPyramidRenderer#nbTilesPerAxis
 */
FORGE.BackgroundPyramidRenderer.prototype.nbTilesPerAxis = function(level)
{
    return Math.pow(2, level);
};

/**
 * Get number of tiles for a given level
 * @method FORGE.BackgroundPyramidRenderer#nbTiles
 */
FORGE.BackgroundPyramidRenderer.prototype.nbTiles = function(level)
{
    var tpa = this.nbTilesPerAxis(level);
    return tpa * tpa;
};

/**
 * Get tile size at a given level
 * @method FORGE.BackgroundPyramidRenderer#tileSize
 */
FORGE.BackgroundPyramidRenderer.prototype.tileSize = function(level)
{
    return this._size / this.nbTilesPerAxis(level);
};

/**
 * Get all visible tiles at current level
 * @method FORGE.BackgroundPyramidRenderer#visibleTiles
 */
FORGE.BackgroundPyramidRenderer.prototype.visibleTiles = function()
{
    var visibleTiles = [];

    // ...

    // Tile in frustum
    // Tile has a texture loaded (store)
    // If yes add to scene, otherwise try children or parent
};


/**
 * Select current level for the pyramid
 * @method FORGE.BackgroundPyramidRenderer#selectLevel
 * @param {Number} level pyramid level
 */
FORGE.BackgroundPyramidRenderer.prototype.selectLevel = function(level)
{
    this.log("Select new level: " + level);

    // Clear current level

    // var parent = tile.getParent();
    // if (parent !== null)
    // {
    //     this._scene.remove(parent);
    // }
    
    // var children = tile.getChildren();
    // if (children !== null)
    // {
    //     children.forEach(function(child)
    //     {
    //         if (child !== null)
    //         {
    //             this._scene.remove(child);
    //         }
    //     }.bind(this));
    // }

    if (typeof this._tileCache[this._level] !== "undefined")
    {
        this._tileCache[this._level].forEach(function(tile)
        {
            this._scene.remove(tile);
        }.bind(this));    
    }
    
    var tpa = this.nbTilesPerAxis(level);

    var faces = new Set(["f", "l", "b", "r", "u", "d"]);

    faces.forEach(function(face)
    {
        for (var y=0; y<tpa; y++)
        {
            for (var x=0; x<tpa; x++)
            {
                var tile = this.getTile(level, face, x, y);
                this._scene.add(tile);
            }        
        }
    }.bind(this));

    this._level = level;
};


/**
 * Render routine.
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundPyramidRenderer#render
 * @param {THREE.PerspectiveCamera} camera - perspective camera
 */
FORGE.BackgroundPyramidRenderer.prototype.render = function(camera)
{
    // Get all visible tiles for current level
    // Select tiles from current level with a loaded texture
    // For tiles without texture, iterate through children and parent
    
    var visibleTiles = [];
    var childrenTiles = [];
    var parentTiles = [];

    FORGE.BackgroundRenderer.prototype.render.call(this, this._viewer.camera.main);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundPyramidRenderer#destroy
 */
FORGE.BackgroundPyramidRenderer.prototype.destroy = function()
{
    // ...

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get pyramid current level.
 * @name FORGE.BackgroundPyramidRenderer#level
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "level",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._level;
    }
});

/**
 * Get pyramid minimum level.
 * @name FORGE.BackgroundPyramidRenderer#levelMin
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "levelMin",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._levelMin;
    }
});

/**
 * Get pyramid maximum level.
 * @name FORGE.BackgroundPyramidRenderer#levelMax
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "levelMax",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._levelMax;
    }
});

