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
     * Media limits specified by the config
     * @type {object}
     * @private
     */
    this._limits = null;

    /**
     * Tiles on axis X for current level
     * @type {number}
     * @private
     */
    this._tilesOnAxisX = 0;

    /**
     * Tiles on axis Y for current level
     * @type {number}
     * @private
     */
    this._tilesOnAxisY = 0;
    
    /**
     * List of renderered tiles
     * @type {Array<FORGE.Tile>}
     * @private
     */
    this._renderList = null;
    
    /**
     * List of tiles in renderered tiles neighborhood
     * @type {Array<FORGE.Tile>}
     * @private
     */
    this._renderNeighborList = null;

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
 * Max allowed time since a tile has been created before discarding it
 * @type {number}
 */
FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_CREATION_MS = 2000;

/**
 * Max allowed time since a tile has been displayed before discarding it
 * @type {number}
 */
FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_DISPLAY_MS = 30000;

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

    for (var f=0; f<6; f++)
    {
        var face = Object.keys(FORGE.MediaStore.CUBE_FACE_CONFIG)[f];

        for (var y=0, ty = this.nbTilesPerAxis(this._level, "y"); y<ty; y++)
        {
            for (var x=0, tx = this.nbTilesPerAxis(this._level, "x"); x<tx; x++)
            {
                this.getTile(null, this._level, face, x, y, "pyramid init");
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
    this._fovMin = 1.01 * FORGE.Math.degToRad(this._pyramidLevelToCameraFov(config.source.levels.length - 1));

    if (typeof config.source.limits === "object")
    {    
        this._limits = config.source.limits;
    }
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
    var fovReference = 90 / this.nbTilesPerAxis(0, "y");
    return Math.max(0, Math.floor(1 - Math.log(fov / fovReference) / Math.LN2));
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
    var fovReference = 90 / this.nbTilesPerAxis(0, "y");
    return fovReference / Math.pow(2, level);
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
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    return frustum.intersectsObject(tile);
};

/**
 * Tile destroyed event handler
 * @param {FORGE.Event} event - event
 * @method FORGE.BackgroundPyramidRenderer#_onTileDestroyed
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._onTileDestroyed = function(event)
{
    var tile = event.emitter;
    tile.onDestroy.remove(this._onTileDestroyed, this);
    this._tileCache[tile.level].delete(tile.name);
    this._scene.remove(tile);
};

// Compute tile that should be displayed (and its parents) using camera yaw, pitch and fov
// Useful for debugging refresh holes
FORGE.BackgroundPyramidRenderer.prototype._getTileStackAtCurrentPoint = function()
{
    var camera = this._viewer.camera;
    alert('_getTileStackAtCurrentPoint');
};

/**
 * Get XnYn normalized tile coords at a given level
 * @method FORGE.BackgroundPyramidRenderer#_levelXYToXnYn
 * @param {number} level - pyramid level
 * @param {THREE.Vector2} XY - coordinates
 * @return {THREE.Vector2} normalized tile coordinates vector
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._levelXYToXnYn = function(level, XY)
{
    var tx = this.nbTilesPerAxis(level, "x"),
        ty = this.nbTilesPerAxis(level, "y");

    return XY.divide(new THREE.Vector2(tx, ty));
};

/**
 * Get XY tile coords at a given level depending on normalized coordinates
 * @method FORGE.BackgroundPyramidRenderer#_levelXnYnToXY
 * @param {number} level - pyramid level
 * @param {THREE.Vector2} xnyn - normalized coordinates
 * @return {THREE.Vector2} tile coordinates vector
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._levelXnYnToXY = function(level, xnyn)
{
    var tx = this.nbTilesPerAxis(level, "x"),
        ty = this.nbTilesPerAxis(level, "y");

    var x = Math.min(Math.floor(tx * xnyn.x), Math.ceil(tx) - 1);
    var y = Math.min(Math.floor(ty * xnyn.y), Math.ceil(ty) - 1);

    return new THREE.Vector2(x, y);
};

/**
 * Get parent tile reference and create it if does not exist
 * @method FORGE.BackgroundPyramidRenderer#getParentTile
 * @param {FORGE.Tile} tile - tile
 * @return {FORGE.Tile} parent tile or null if it has no parent (level 0)
 */
FORGE.BackgroundPyramidRenderer.prototype.getParentTile = function(tile)
{
    if (tile.level === 0)
    {
        return null;
    }

    var xnyn = this._levelXYToXnYn(tile.level, new THREE.Vector2(tile.x, tile.y));

    var parentLevel = tile.level - 1;
    var parentCoords = this._levelXnYnToXY(parentLevel, xnyn);

    return this.getTile(null, parentLevel, tile.face, parentCoords.x, parentCoords.y, "parent of " + tile.name);
};

/**
 * Get tile
 * Lookup in cache first or create it if not already in cache
 * @method FORGE.BackgroundPyramidRenderer#getTile
 */
FORGE.BackgroundPyramidRenderer.prototype.getTile = function(parent, level, face, x, y, creator)
{
    if (typeof this._tileCache[level] === "undefined")
    {
        this._tileCache[level] = new Map();
    }

    var name = FORGE.Tile.createName(face, level, x, y);

    var tile = this._tileCache[level].get(name);

    if (tile === undefined)
    {
        tile = new FORGE.Tile(null, this, x, y, level, face, creator);

        tile.onDestroy.add(this._onTileDestroyed, this);
        this.log("Create tile " + tile.name + " (" + creator + ")");
        this._tileCache[level].set(name, tile);
    }

    if (this._scene.children.indexOf(tile) === -1 && this._isTileInFrustum(tile) === true)
    {
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

    var levelConfig = this._config.source.levels[level];

    if (axis === "x")
    {
        return levelConfig.width / levelConfig.tile;        
    }

    else if (axis === "y")
    {
        return levelConfig.height / levelConfig.tile;
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
 * Remove tile from the scene
 * @method FORGE.BackgroundPyramidRenderer#removeFromScene
 * @param {FORGE.Tile} tile
 */
FORGE.BackgroundPyramidRenderer.prototype.removeFromScene = function(tile)
{
    this._scene.remove(tile);
};

/**
 * Select current level for the pyramid
 * @method FORGE.BackgroundPyramidRenderer#selectLevel
 * @param {Number} level pyramid level
 */
FORGE.BackgroundPyramidRenderer.prototype.selectLevel = function(level)
{
    this._level = level;

    // Update internals
    this._tilesOnAxisX = this.nbTilesPerAxis(this._level, "x");
    this._tilesOnAxisY = this.nbTilesPerAxis(this._level, "y");

    this.log("Tiles per axis - X: " + this._tilesOnAxisX + ", Y: " + this._tilesOnAxisY);

    if (typeof (this._tileCache[this._level]) !== "undefined")
    {
        this._tileCache[this._level].forEach(function(tile) {
            this._scene.add(tile);
        }.bind(this));
    }
    
    // Compute pixels count
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
 * Add tile to render list
 * @method FORGE.BackgroundPyramidRenderer#addToRenderList
 * @param {FORGE.Tile} tile - tile
 */
FORGE.BackgroundPyramidRenderer.prototype.addToRenderList = function(tile)
{
    this._renderList.push(tile);

    // Add tile neighbours to the list only if its level is the current one
    if (tile.level === this._level)
    {
        this._renderNeighborList = this._renderNeighborList.concat(tile.neighbours);
    }
};

/**
 * Discard a tile. Removes from the cache and the scene
 * @method FORGE.BackgroundPyramidRenderer#_discardTile
 * @param {FORGE.Tile} tile - tile
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._discardTile = function(tile)
{
    if (typeof this._tileCache[tile.level] !== "undefined")
    {
        this._tileCache[tile.level].delete(tile);   
    }

    // var rl = "";
    // this._renderList.forEach(function(tile) {
    //     rl += tile.name + " ";
    // });

    // var ns = "";
    // this._renderNeighborList.forEach(function(tile) {
    //     ns += tile.name + " ";
    // });

    // this.log("Discard tile " + tile.name + "(ns: " + ns + ")" + "(rl: " + rl + ")");
    
    // this.log("Discard tile " + tile.name);

    this._scene.remove(tile);

    this._textureStore.discardTileTexture(tile);

    tile.destroy();
};

/**
 * Render routine.
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundPyramidRenderer#render
 * @param {THREE.PerspectiveCamera} camera - perspective camera
 */
FORGE.BackgroundPyramidRenderer.prototype.render = function(camera)
{
    // Renderer should find if some tile at current level are currently rendered
    this._renderList = [];
    this._renderNeighborList = [];

    FORGE.BackgroundRenderer.prototype.render.call(this, this._viewer.camera.main);
    
    this._renderNeighborList = FORGE.Utils.arrayUnique(this._renderNeighborList);

    var clearList = [];

    var now = Date.now();

    this._scene.children.forEach(function(tile) {
        // Clear tile policy
        // Only applies to tiles with non zero level
        // Delete all tiles with zero opacity
        // Delete all tiles that has been created more than 2s ago and have never been displayed
        // Delete all tiles that has not been displayed since 30s
        
        var timeSinceCreate = now - tile.createTS;
        var timeSinceDisplay = now - tile.displayTS;

        if (tile.level > 0 &&
            this._renderNeighborList.indexOf(tile) === -1 &&
            ((tile.displayTS === null && timeSinceCreate > FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_CREATION_MS) ||
            (tile.displayTS !== null && timeSinceDisplay > FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_DISPLAY_MS) ||
            tile.opacity === 0))
        {
            clearList.push(tile);
        }

    }.bind(this));

    clearList.forEach(function(tile)
    {
        this._discardTile(tile);
    }.bind(this));

};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundPyramidRenderer#destroy
 */
FORGE.BackgroundPyramidRenderer.prototype.destroy = function()
{
    this._viewer.camera.onCameraChange.remove(this._onCameraChange, this);

    this._limits = null;
    this._textureStore = null;
    this._tileCache = null;
    this._renderNeighborList.length = 0;
    this._renderNeighborList = null;
    this._renderList.length = 0;
    this._renderList = null;
    this._config = null;

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get cube size in world units.
 * @name FORGE.BackgroundPyramidRenderer#cubeSize
 * @type {number}
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
 * Get pyramid max level.
 * @name FORGE.BackgroundPyramidRenderer#levelMax
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "levelMax",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._config.source.levels.length - 1;
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

/**
 * Get media limits.
 * @name FORGE.BackgroundPyramidRenderer#limits
 * @type {object}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "limits",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._limits;
    }
});

/**
 * Get number of tiles on axis X for current level.
 * @name FORGE.BackgroundPyramidRenderer#tilesOnAxisX
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "tilesOnAxisX",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._tilesOnAxisX;
    }
});

/**
 * Get number of tiles on axis Y for current level.
 * @name FORGE.BackgroundPyramidRenderer#tilesOnAxisY
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "tilesOnAxisY",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._tilesOnAxisY;
    }
});

