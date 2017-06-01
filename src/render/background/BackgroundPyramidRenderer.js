/**
 * FORGE.BackgroundPyramidRenderer
 * BackgroundPyramidRenderer class.
 *
 * @constructor FORGE.BackgroundPyramidRenderer
 * @extends {FORGE.BackgroundRenderer}
 *
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.WebGLRenderTarget} target - render target
 * @param {SceneMediaConfig} config - media config
 */
FORGE.BackgroundPyramidRenderer = function(viewer, target, config)
{
    /**
     * Input scene and media config
     * @name FORGE.Media#_config
     * @type {SceneMediaConfig}
     * @private
     */
    this._config = config;

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
     * Number of pixels at current level
     * @type {number}
     * @private
     */
    this._levelPixels = 0;

    /**
     * Minimum fov computed with max level
     * @type {number}
     * @private
     */
    this._fovMin = 0;


    /**
     * Number of pixels at current level presented in human readable format
     * @type {string}
     * @private
     */
    this._levelPixelsHumanReadable = "";

    FORGE.BackgroundRenderer.call(this, viewer, target, config, "BackgroundPyramidRenderer");
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

    this._parseConfig(this._config);

    this._size = 2 * FORGE.RenderManager.DEPTH_FAR;

    this._tileCache = {};

    this._textureStore = this._viewer.story.scene.media.store;

    this._viewer.camera.onCameraChange.add(this._onCameraChange, this);

    this.selectLevel(this._cameraFovToPyramidLevel(this._viewer.camera.fov));

    for (var face=0; face<6; face++)
    {
        for (var y=0, ty = this.nbTilesPerAxis(this._level, "y"); y<ty; y++)
        {
            for (var x=0, tx = this.nbTilesPerAxis(this._level, "x"); x<tx; x++)
            {
                var tile = this.getTile(null, this._level, face, x, y);
                this._scene.add(tile);
            }        
        }
    }

    window.scene = this._scene;
};

/**
 * Parse configuration.
 * @method FORGE.BackgroundPyramidRenderer#_parseConfig
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._parseConfig = function(config)
{
    // Set min fov to be used to reach max level of resolution
    this._fovMin = 1.01 * FORGE.Math.degToRad(this._pyramidLevelToCameraFov(this._config.source.levels.length - 1));
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
        // this.log("Create tile " + tile.name + " (parent: " + (parent ? parent.name : "none") + ")");
        this._tileCache[level].set(key, tile);
        this._scene.add(tile);
    }

    return tile;
};

/**
 * Get number of tiles per axis for a given level
 * @param {number} level - pyramid level
 * @param {string} axis - axis ("x" or "y")
 * @method FORGE.BackgroundPyramidRenderer#nbTilesPerAxis
 */
FORGE.BackgroundPyramidRenderer.prototype.nbTilesPerAxis = function(level, axis)
{
    if (typeof this._config.source.levels === "undefined" || typeof axis === "undefined")
    {
        return Math.pow(2, level);
    }

    var level = this._config.source.levels[level];

    if (axis === "x")
    {
        return level.width / level.tile;        
    }

    else if (axis === "y")
    {
        return level.height / level.tile;
    }

    return Math.pow(2, level);
};

/**
 * Get number of tiles for a given level
 * @method FORGE.BackgroundPyramidRenderer#nbTiles
 */
FORGE.BackgroundPyramidRenderer.prototype.nbTiles = function(level)
{
    return 6 * this.nbTilesPerAxis(level, "x") * this.nbTilesPerAxis(level, "y");
};

/**
 * Get tile size at a given level (world units)
 * @method FORGE.BackgroundPyramidRenderer#tileSize
 * @return {FORGE.Size} size of a tile in world units
 */
FORGE.BackgroundPyramidRenderer.prototype.tileSize = function(level)
{
    return new FORGE.Size(this._size / this.nbTilesPerAxis(level, "x"), this._size / this.nbTilesPerAxis(level, "y"));
};

/**
 * Select current level for the pyramid
 * @method FORGE.BackgroundPyramidRenderer#selectLevel
 * @param {Number} level pyramid level
 */
FORGE.BackgroundPyramidRenderer.prototype.selectLevel = function(level)
{
    this._level = level;

    var levelConfig = this._config.source.levels[level];
    var tilePixels = levelConfig.width * levelConfig.height;

    this._levelPixels = this.nbTiles(this._level) * tilePixels;

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
 * Get cube size in world units.
 * @name FORGE.BackgroundPyramidRenderer#cubeSize
 * @type {FORGE.MediaStore}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "cubeSize",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._size;
    }
});

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
 * Get fov min.
 * @name FORGE.BackgroundPyramidRenderer#fovMin
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "fovMin",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._fovMin;
    }
});

