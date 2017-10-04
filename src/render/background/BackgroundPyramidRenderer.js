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
     * @name FORGE.BackgroundPyramidRenderer#_config
     * @type {?SceneMediaConfig}
     * @private
     */
    this._config = config;

    /**
     * Current level of the pyramid
     * @type {number}
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
     * @type {?FORGE.MediaStore}
     * @private
     */
    this._textureStore = null;

    /**
     * Cache of tiles
     * @type {?Object}
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
     * Number of tiles for all levels
     * @type {Array<TilesOnLevel>}
     * @private
     */
    this._tilesLevel = null;

    /**
     * List of renderered tiles
     * @type {?Array<FORGE.Tile>}
     * @private
     */
    this._renderList = null;

    /**
     * List of tiles in renderered tiles neighborhood
     * @type {?Array<FORGE.Tile>}
     * @private
     */
    this._renderNeighborList = null;

    /**
     * Enable tile clearing policy
     * @type {boolean}
     * @private
     */
    this._clearTilesEnabled = true;

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
FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_DISPLAY_MS = 3000;

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

    this._camera = this._viewer.renderer.camera.main;
    this._viewer.camera.onChange.add(this._onCameraChange, this);

    if (typeof this._config.preview !== "undefined")
    {
        this._createPreview();
    }

    for (var f = 0; f < 6; f++)
    {
        var face = Object.keys(FORGE.MediaStore.CUBE_FACE_CONFIG)[f];

        for (var y = 0, ty = this.nbTilesPerAxis(0, "y"); y < ty; y++)
        {
            for (var x = 0, tx = this.nbTilesPerAxis(0, "x"); x < tx; x++)
            {
                this.getTile(null, 0, face, x, y, "pyramid init");
            }
        }
    }
};

/**
 * Parse configuration.
 * @method FORGE.BackgroundPyramidRenderer#_parseConfig
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._parseConfig = function(config)
{
    // Store all tiles number per level for quick access
    this._tilesLevel = [];
    if (typeof this._config.source.levels !== "undefined")
    {
        var level;

        for (var l = 0, levels = this._config.source.levels.length; l < levels; l++)
        {
            level = this._config.source.levels[l];
            this._tilesLevel.push({
                x: level.width / level.tile,
                y: level.height / level.tile
            });
        }
    }

    // Set min fov to be used to reach max level of resolution
    this._fovMin = 1.01 * FORGE.Math.degToRad(this._pyramidLevelToCameraFov(config.source.levels.length - 1));
};

/**
 * Create the preview (sub zero level)
 * @method FORGE.BackgroundPyramidRenderer.prototype._createPreview
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._createPreview = function()
{
    for (var f = 0; f < 6; f++)
    {
        var face = Object.keys(FORGE.MediaStore.CUBE_FACE_CONFIG)[f];

        this.getTile(null, FORGE.Tile.PREVIEW, face, 0, 0, "pyramid preview");
    }

    if (typeof(this._tileCache[FORGE.Tile.PREVIEW]) !== "undefined")
    {
        this._tileCache[FORGE.Tile.PREVIEW].forEach(function(tile)
        {
            this._scene.add(tile);
        }.bind(this));
    }
};

/**
 * Clear routine.
 * @method FORGE.BackgroundPyramidRenderer#_clear
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._clear = function()
{
    // Draw to clear screen, then clear display object / texture
    this._viewer.renderer.webGLRenderer.clearColor();
};


/**
 * Update after view change
 * @method FORGE.BackgroundPyramidRenderer#updateAfterViewChange
 */
FORGE.BackgroundPyramidRenderer.prototype.updateAfterViewChange = function()
{
    if (this._viewer.view.type !== FORGE.ViewType.RECTILINEAR)
    {
        this.warn("Only Rectilinear view is supported for multi resolution scene");
        this._viewer.view.type = FORGE.ViewType.RECTILINEAR;
    }
};

/**
 * Get pyramid level for a given fov
 * @method FORGE.BackgroundPyramidRenderer#_cameraFovToPyramidLevel
 * @param {number} fov camera field of view [degrees]
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._cameraFovToPyramidLevel = function(fov)
{
    // compute the optimal number of tiles on the y axis for this fov
    var tiles = Math.floor(180 / fov);

    // check the nearest level to this optimal number
    var level = this._tilesLevel.findIndex(function(lvl)
    {
        return lvl.y >= tiles;
    });

    if (level === -1)
    {
        level = this._tilesLevel.length - 1;
    }

    return Math.max(0, level);
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
    var lvl = this._tilesLevel[level];
    var fov = 90 / lvl.y;
    return fov;
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
 * Tile clearing routine.
 * Clear tile policy
 * Only applies to tiles with non zero level
 * Delete all tiles with zero opacity
 * Delete all tiles that has been created more than 2s ago and have never been displayed
 * Delete all tiles that has not been displayed since 30s
 * @method FORGE.BackgroundPyramidRenderer#_clearTiles
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._clearTiles = function()
{
    if (this._clearTilesEnabled === false)
    {
        return;
    }

    var clearList = [];

    var now = Date.now();

    this._scene.children.forEach(function(tile)
    {
        var timeSinceCreate = now - tile.createTS;
        var timeSinceDisplay = now - tile.displayTS;

        if (tile.level > this._level ||
            (tile.level !== this._level &&
            tile.level !== FORGE.Tile.PREVIEW &&
            this._renderNeighborList.indexOf(tile) === -1 &&
            ((tile.displayTS === null && timeSinceCreate > FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_CREATION_MS) ||
            (tile.displayTS !== null && timeSinceDisplay > FORGE.BackgroundPyramidRenderer.MAX_ALLOWED_TIME_SINCE_DISPLAY_MS))))
        {
            clearList.push(tile);
        }

    }.bind(this));

    clearList.forEach(function(tile)
    {
        this._scene.remove(tile);
    }.bind(this));
};

/**
 * Get parent tile reference and create it if does not exist
 * @method FORGE.BackgroundPyramidRenderer#getParentTile
 * @param {FORGE.Tile} tile - tile
 * @return {FORGE.Tile} parent tile or null if it has no parent (level 0)
 */
FORGE.BackgroundPyramidRenderer.prototype.getParentTile = function(tile)
{
    if (tile.level === FORGE.Tile.PREVIEW)
    {
        return null;
    }

    if (tile.level === 0)
    {
        return this.getTile(null, FORGE.Tile.PREVIEW, tile.face, 0, 0, "pyramid preview");
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

    if (typeof tile === "undefined")
    {
        tile = new FORGE.Tile(parent, this, x, y, level, face, creator);

        tile.onDestroy.add(this._onTileDestroyed, this);
        this.log("Create tile " + tile.name + " (" + creator + ")");
        this._tileCache[level].set(name, tile);
    }

    if (this._scene.children.indexOf(tile) === -1)
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
    if (this._tilesLevel === null || level === FORGE.Tile.PREVIEW)
    {
        return 1;
    }

    var lvl = this._tilesLevel[level];

    if (typeof lvl !== "undefined")
    {
        if (axis === "x")
        {
            return lvl.x;
        }
        else if (axis === "y")
        {
            return lvl.y;
        }
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
 * @param {number} level pyramid level
 */
FORGE.BackgroundPyramidRenderer.prototype.selectLevel = function(level)
{
    this._level = level;

    var tilesOnAxisX = this.nbTilesPerAxis(this._level, "x");
    var tilesOnAxisY = this.nbTilesPerAxis(this._level, "y");

    this.log("Tiles per axis - X: " + tilesOnAxisX + ", Y: " + tilesOnAxisY);

    if (typeof(this._tileCache[this._level]) !== "undefined")
    {
        this._tileCache[this._level].forEach(function(tile)
        {
            this._scene.add(tile);
        }.bind(this));
    }

    var levelConfig;
    if (level === FORGE.Tile.PREVIEW)
    {
        levelConfig = this._config.preview;
        levelConfig.width = levelConfig.tile;
        levelConfig.height = levelConfig.tile;
    }
    else
    {
        levelConfig = this._config.source.levels[level];
    }

    // Compute pixels count
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
        prefix = " too many ";
    }
    else if (rank >= 3)
    {
        prefix = " " + prefixes[rank];
    }

    this._levelPixelsHumanReadable = humanPixels.toFixed(1) + prefix + "pixels";
    this.log("Select new level: " + level + ", " + this._levelPixelsHumanReadable + " (" + this._levelPixels + ")");
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

    FORGE.BackgroundRenderer.prototype.render.call(this, camera);

    this._renderNeighborList = FORGE.Utils.arrayUnique(this._renderNeighborList);

    this._clearTiles();
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundPyramidRenderer#destroy
 */
FORGE.BackgroundPyramidRenderer.prototype.destroy = function()
{
    this._viewer.camera.onChange.remove(this._onCameraChange, this);

    this._clear();

    var tile;
    for (var level in this._tileCache)
    {
        while (this._tileCache[level].length)
        {
            tile = this._tileCache[level].pop();
            tile.destroy();
        }

        this._tileCache[level] = null;
    }

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
 * Get number of tiles on axis X for current level.
 * @name FORGE.BackgroundPyramidRenderer#tilesOnAxisX
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "tilesOnAxisX",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this.nbTilesPerAxis(this._level, "x");
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
        return this.nbTilesPerAxis(this._level, "y");
    }
});
