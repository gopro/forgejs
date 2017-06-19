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
     * Internal raycaster. Used to refresh where neighborhood is unknown
     * @type {THREE.Raycaster}
     * @private
     */
    this._raycaster = null;
    this._raycastChain = null;
    this._renderList = null;

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

    this._raycaster = new THREE.Raycaster();
    this._raycastChain = [];

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
    frustum.setFromMatrix(new THREE.Matrix4().multiply(camera.projectionMatrix, camera.matrixWorldInverse));
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
    this._tileCache(tile.level).delete(tile.name);
    this._scene.remove(tile);
};

/**
 * Internal raycast used to refresh textures
 * @method FORGE.BackgroundPyramidRenderer#_raycast
 * @private
 */
FORGE.BackgroundPyramidRenderer.prototype._raycast = function()
{
    this._raycastChain = [];

    // TODO: add a grid of points
    var screenPoint = new THREE.Vector2(0.5, 0.5).multiplyScalar(2).addScalar(-1);
    // var screenPoint = new THREE.Vector2(this._viewer.canvas.dom.width, this._viewer.canvas.dom.height).divideScalar(2).floor();
    this._raycaster.setFromCamera(screenPoint, viewer.renderer.camera.main);
    
    var intersects = this._raycaster.intersectObjects(this._scene.children, true);

    var count=0;
    intersects.forEach(function(intersect, idx, array) {
        if (intersect.object.level === this._level)
        {
            ++count;
        }
    }.bind(this));

    if (count > 1)
    {
        return;
    }

    intersects = intersects.filter(function(intersect, idx, array) {
        // return intersect.object instanceof FORGE.Tile && intersect.faceIndex === 0 && array.indexOf(intersect) === idx;
        var isTile = intersect.object instanceof FORGE.Tile;
        var isUnique = array.indexOf(intersect) === idx;
        
        // var name = intersect.object.name;

        // var isFirstWithThisName = array.find(function(element) {
        //     element.object.name === name;
        // }) === idx;

        // return isTile && isUnique && isFirstWithThisName;
        return isTile && isUnique;
    });

    intersects.sort(function(a, b) {
        if (a.object.level > b.object.level) {
            return -1;
        }
        else {
            return 1;
        }
    });

    this._raycastChain = intersects.map(function(intersect, idx, array) {
        return intersect.object;
    });  

    // console.log(intersects.length);
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

    if (this._scene.children.indexOf(tile) === -1)
    {
        // if (tile.level === 0)
        // {
            this._scene.add(tile);
        // }
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

    // Restore all tiles visibility for this level and add them to the scene
    if (typeof this._tileCache[level] !== "undefined")
    {
        this._tileCache[level].forEach(function(tile)
        {
            tile.visible = true;
            // this.scene.add(tile);
        });
    }

    // Update internals
    this._tilesOnAxisX = this.nbTilesPerAxis(this._level, "x");
    this._tilesOnAxisY = this.nbTilesPerAxis(this._level, "y");

    this.log("Tiles per axis - X: " + this._tilesOnAxisX + ", Y: " + this._tilesOnAxisY);

    // // Clear every tile at level -2/+1 and add every tile at level -1/current
    // if (typeof this._tileCache[this._level - 2] !== "undefined")
    // {
    //     this._tileCache[this._level - 2].forEach(function(element, index, array) {
    //         this._scene.remove(element);
    //     }.bind(this));
    // }

    // if (typeof this._tileCache[this._level + 1] !== "undefined")
    // {
    //     this._tileCache[this._level + 1].forEach(function(element, index, array) {
    //         this._scene.remove(element);
    //     }.bind(this));
    // }

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

    FORGE.BackgroundRenderer.prototype.render.call(this, this._viewer.camera.main);
    
    // Cleanup scene
    this._scene.children.forEach(function(tile) {
        // Only remove tile upper than level zeror and not at current level
        if (tile.level === 0 || tile.level === this._level)
        {
            return;
        }

        // Remove tiles with zero opacity
        if (tile.opacity === 0)
        {
            this._scene.remove(tile);
        }
    }.bind(this));
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundPyramidRenderer#destroy
 */
FORGE.BackgroundPyramidRenderer.prototype.destroy = function()
{
    this._textureStore = null;
    this._tileCache = null;
    this._renderList.length = 0;
    this._renderList = [];
    this._raycastChain.length = 0;
    this._raycastChain = null;
    this._raycaster = null;
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

/**
 * Get raycasted tiles array, ordered from top to bottom
 * @name FORGE.BackgroundPyramidRenderer#raycastChain
 * @type {number}
 */
Object.defineProperty(FORGE.BackgroundPyramidRenderer.prototype, "raycastChain",
{
    /** @this {FORGE.BackgroundPyramidRenderer} */
    get: function()
    {
        return this._raycastChain;
    }
});

