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
    this._levelMax = Infinity;

    /**
     * Current level of the pyramid
     * @type {Number}
     * @private
     */
    this._level = 0;

    /**
     * The size of the cube.
     * @type {number}
     * @private
     */
    this._size = 0;

    /**
     * Texture store
     * @type {FORGE.MediaStore}
     * @private
     */
    this._textureStore = null;

    /**
     * Cache of tiles
     * @type {Map}
     * @private
     */
    this._tileCache = null;

    /**
     * Size of tiles
     * @TODO to be changed
     * @type {number}
     * @private
     */
    this._tileSize = 512;

    /**
     * Number of pixels at current level
     * @type {number}
     * @private
     */
    this._levelPixels = 0;

    /**
     * Number of pixels at current level presented in human readable format
     * @type {string}
     * @private
     */
    this._levelPixelsHumanReadable = "";

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

    this._size = 2 * FORGE.RenderManager.DEPTH_FAR;

    this._tileCache = {};

    this._textureStore = this._viewer.story.scene.media.store;

    this._viewer.camera.onCameraChange.add(this._onCameraChange, this);

    this.selectLevel(this._cameraFovToPyramidLevel(this._viewer.camera.fov));

    var tpa = this.nbTilesPerAxis(this._level);

    var faces = new Set(["f", "l", "b", "r", "u", "d"]);

    faces.forEach(function(face)
    {
        for (var y=0; y<tpa; y++)
        {
            for (var x=0; x<tpa; x++)
            {
                var tile = this.getTile(null, this._level, face, x, y);
                this._scene.add(tile);
            }        
        }
    }.bind(this));

    window.scene = this._scene;
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
FORGE.BackgroundPyramidRenderer.prototype.getTile = function(parent, level, face, x, y)
{
    var key = this._getTileKey(level, face, x, y);

    if (typeof this._tileCache[level] === "undefined")
    {
        this._tileCache[level] = new Map();
    }

    var tile = this._tileCache[level].get(key);
    
    if (tile === undefined)
    {
        tile = new FORGE.Tile(parent, this, x, y, level, face);
        this.log("Create tile " + tile.name + " (parent: " + (parent ? parent.name : "none") + ")");
        this._tileCache[level].set(key, tile);
        this._scene.add(tile);
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
    return 6 * tpa * tpa;
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
 * Select current level for the pyramid
 * @method FORGE.BackgroundPyramidRenderer#selectLevel
 * @param {Number} level pyramid level
 */
FORGE.BackgroundPyramidRenderer.prototype.selectLevel = function(level)
{
    this._level = level;
    this._levelPixels = this.nbTiles(this._level) * this._tileSize * this._tileSize;

    var prefixes = {
        3: "kilo",
        6: "mega",
        9: "giga",
        12: "tera",
        15: "peta",
        18: "exa",
        21: "zetta",
        24: "yotta"
    };

    var rank = Math.floor(Math.log(this._levelPixels) / (Math.LN10 * 3)) * 3;
    var humanPixels = this._levelPixels / Math.pow(10, rank);

    var prefix = "";
    if (rank >= 27)
    {
        prefix = " too many "
    }
    else if (rank >= 3)
    {
        prefix = " " + prefixes[rank];
    }

    this._levelPixelsHumanReadable = humanPixels.toFixed(1) + prefix + "pixels";
    this.log("Select new level: " + level + ", " + this._levelPixelsHumanReadable  + " (" + this._levelPixels + ")");
};


/**
 * Render routine.
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundPyramidRenderer#render
 * @param {THREE.PerspectiveCamera} camera - perspective camera
 */
FORGE.BackgroundPyramidRenderer.prototype.render = function(camera)
{
    FORGE.BackgroundRenderer.prototype.render.call(this, this._viewer.camera.main);
    // console.log("tiles: " + window.scene.children.length);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundPyramidRenderer#destroy
 */
FORGE.BackgroundPyramidRenderer.prototype.destroy = function()
{
    this._textureStore = null;
    this._tileCache = null;

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get texture store.
 * @name FORGE.BackgroundPyramidRenderer#textureStore
 * @type {FORGE.MediaStore}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "textureStore",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._textureStore;
    }
});

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

/**
 * Get number of pixels at current level.
 * @name FORGE.BackgroundPyramidRenderer#pixelsAtCurrentLevel
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "pixelsAtCurrentLevel",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._levelPixels;
    }
});

/**
 * Get number of pixels at current level presented as human readable string.
 * @name FORGE.BackgroundPyramidRenderer#pixelsAtCurrentLevelHumanReadable
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "pixelsAtCurrentLevelHumanReadable",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._levelPixelsHumanReadable;
    }
});

/**
 * Get camera reference.
 * @name FORGE.BackgroundPyramidRenderer#camera
 * @type {FORGE.Camera}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "camera",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._viewer.camera;
    }
});

