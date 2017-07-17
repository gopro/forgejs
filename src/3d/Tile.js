/**
 * Tile class.
 *
 * @constructor FORGE.Tile
 * @param {?FORGE.Tile} parent - parent tile reference
 * @param {FORGE.BackgroundPyramidRenderer} renderer - renderer reference
 * @param {number} x - x coordinate (column)
 * @param {number} y - y coordinate (row)
 * @param {number} level - pyramid level
 * @param {string} face - cube face
 * @param {string} creator - string describing what created the tile
 * @extends {THREE.Mesh}
 */
FORGE.Tile = function(parent, renderer, x, y, level, face, creator)
{
    /**
     * String describing what created the tile
     * @type {string}
     */
    this._creator = creator;

    /**
     * Reference on background renderer
     * @name FORGE.Tile#_renderer
     * @type {FORGE.BackgroundPyramidRenderer}
     * @private
     */
    this._renderer = renderer;

    /**
     * X axis value on face coordinate system
     * @name FORGE.Tile#_x
     * @type {number}
     * @private
     */
    this._x = x;

    /**
     * Y axis value on face coordinate system
     * @name FORGE.Tile#_y
     * @type {number}
     * @private
     */
    this._y = y;

    /**
     * Resolution level
     * @name FORGE.Tile#_level
     * @type {number}
     * @private
     */
    this._level = level;

    /**
     * Cube face
     * @name FORGE.Tile#_face
     * @type {string}
     * @private
     */
    this._face = face;

    /**
     * Creation timestamp
     * @name FORGE.Tile#_createTS
     * @type {?number}
     * @private
     */
    this._createTS = null;

    /**
     * Last display timestamp
     * @name FORGE.Tile#_displayTS
     * @type {?number}
     * @private
     */
    this._displayTS = null;

    /**
     * Reference on parent tile
     * @name FORGE.Tile#_parent
     * @type {FORGE.Tile}
     * @private
     */
    this._parent = parent;

    /**
     * Reference on children tiles
     * @name FORGE.Tile#_children
     * @type {Array<FORGE.Tile>}
     * @private
     */
    this._children = null;

    /**
     * Array of references on neighbour tiles
     * @name FORGE.Tile#_neighbours
     * @type {Array<FORGE.Tile>}
     * @private
     */
    this._neighbours = null;

    /**
     * Flag to know if parent has been checked
     * @name FORGE.MediaStore#_parentNeedsCheck
     * @type {boolean}
     * @private
     */
    this._parentNeedsCheck = true;

    /**
     * Flag to know if neighbourhood has been checked
     * @name FORGE.MediaStore#_neighborsNeedCheck
     * @type {boolean}
     * @private
     */
    this._neighborsNeedCheck = true;

    /**
     * Global opacity value
     * @name FORGE.Tile#_opacity
     * @type {number}
     * @private
     */
    this._opacity = 0;

    /**
     * Texture load pending flag
     * @name FORGE.Tile#_texturePending
     * @type {boolean}
     * @private
     */
    this._texturePending = false;

    /**
     * Event dispatcher for destroy.
     * @name FORGE.Tile#_onDestroy
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onDestroy = null;

    THREE.Mesh.call(this);

    this._boot();
};

FORGE.Tile.prototype = Object.create(THREE.Mesh.prototype);
FORGE.Tile.prototype.constructor = FORGE.Tile;

/**
 * Cube faces table
 * @type {Array}
 */
FORGE.Tile.FACES = ["front", "right", "back", "left", "up", "down"];

/**
 * Opacity increment [unit per render cycle]
 * @type {number}
 */
FORGE.Tile.OPACITY_INCREMENT = 0.04;

/**
 * Opacity decrement [unit per render cycle]
 * @type {number}
 */
FORGE.Tile.OPACITY_DECREMENT = 0.01;

/**
 * Texture load predelay (time between creation and display)
 * @type {number}
 */
FORGE.Tile.TEXTURE_LOADING_PREDELAY_MS = 200;

/**
 * Table describing previous cube face
 * @type {CubeFaceObject}
 */
FORGE.Tile.FACE_PREVIOUS = {
    "front": "left",
    "right": "front",
    "back": "right",
    "left": "back",
    "up": "up",
    "down": "down"
};

/**
 * Table describing next cube face
 * @type {CubeFaceObject}
 */
FORGE.Tile.FACE_NEXT = {
    "front": "right",
    "right": "back",
    "back": "left",
    "left": "front",
    "up": "up",
    "down": "down"
};

/**
 * Create tile name
 * @method FORGE.Tile#createName
 * @param {string|number} face - cube face
 * @param {number} level - pyramid level
 * @param {number} x - x coordinate (column)
 * @param {number} y - y coordinate (row)
 */
FORGE.Tile.createName = function(face, level, x, y)
{
    face = typeof face === "number" ? FORGE.Tile.FACES[face] : face.toLowerCase();
    return face.substring(0, 1).toUpperCase() + "-" + level + "-" + y + "-" + x;
};

/**
 * Get the coordinates of the parent tile
 * @method FORGE.Tile#getParentTileCoordinates
 * @param {FORGE.Tile} tile - tile
 * @return {THREE.Vector2} parent tile x,y coordinates
 */
FORGE.Tile.getParentTileCoordinates = function(tile)
{
    var px = Math.floor(tile.x / 2),
        py = Math.floor(tile.y / 2);

    return new THREE.Vector2(px, py);
};

/**
 * Boot sequence
 * @method FORGE.Tile#_boot
 * @private
 */
FORGE.Tile.prototype._boot = function()
{
    this._neighbours = [];
    this._children = [];

    // Always ensure a new tile has a parent tile
    // This will prevent from zomming out into some empty area
    if (this._level > 0 && this._parent === null)
    {
        this._checkParent();
    }

    this.name = FORGE.Tile.createName(this._face, this._level, this._x, this._y);

    this.onBeforeRender = this._onBeforeRender.bind(this);
    this.onAfterRender = this._onAfterRender.bind(this);

    this._setGeometry();

    // Level 0 objects are opaque to be rendered first
    var transparent = this._level > 0;
    this._opacity = transparent ? 0.001 : 1.0;

    this.material = new THREE.MeshBasicMaterial(
    {
        color: new THREE.Color(0x000000),
        transparent: transparent,
        opacity: this._opacity,
        depthTest: false,
        side: THREE.FrontSide
    });

    if (this._level === 0)
    {
        this._queryTexture();
    }

    if (FORGE.Tile.DEBUG === true)
    {
        this._addDebugLayer();
    }


    this._createTS = Date.now();
};

/**
 * Before render callback
 * This is called by THREE.js render routine before render is done
 * Add to background renderer list and set opacity
 * @method FORGE.Tile#_onBeforeRender
 * @private
 */
FORGE.Tile.prototype._onBeforeRender = function()
{
    // Add to renderer render list
    this._renderer.addToRenderList(this);

    // Update tile opacity if in transition
    if (this._renderer.level !== this._level)
    {
        if (this._opacity > 0)
        {
            this._setOpacity(this._opacity - FORGE.Tile.OPACITY_DECREMENT);
        }

        return;
    }

    if (this._opacity < 1 && this.material.map !== null)
    {
        this._setOpacity(this._opacity + FORGE.Tile.OPACITY_INCREMENT);
    }
};

/**
 * After render callback
 * This is called by THREE.js render routine after render has been done
 * Here we update all links to other tiles, ask for subdivision or neighbours
 * Request texture if none
 * @method FORGE.Tile#_onAfterRender
 * @private
 */
FORGE.Tile.prototype._onAfterRender = function()
{
    // Update last display timestamp
    this._displayTS = Date.now();

    // Check if tile should be divided
    if (this._renderer.level > this._level)
    {
        this._subdivide();
    }

    // Get all neighbour tiles references
    this._checkNeighbours();

    if (this._level > 0)
    {
        this._queryTexture();
    }
};

/**
 * Query texture for the tile
 * @method FORGE.Tile#_addDebugLayer
 * @private
 */
FORGE.Tile.prototype._queryTexture = function()
{
    // Update texture mapping
    if (this.material !== null && this.material.map === null && this._texturePending === false)
    {
        // Check if predelay since creation has been respected (except for level 0)
        if (this._level !== this._renderer.level ||
            (this._level > 0 && this._displayTS - this._createTS < FORGE.Tile.TEXTURE_LOADING_PREDELAY_MS))
        {
            return;
        }

        var texPromise = this._renderer.textureStore.get(this);

        if (texPromise !== null)
        {
            texPromise.then(function(texture)
            {
                // Check if tile has been destroyed in the meantime
                if (this.material === null)
                {
                    return;
                }

                if (texture !== null && texture instanceof THREE.Texture)
                {
                    this._texturePending = true;

                    texture.generateMipmaps = false;
                    texture.minFilter = THREE.LinearFilter;
                    texture.needsUpdate = true;

                    this.material.color = new THREE.Color(0xffffff);
                    this.material.map = texture;
                    this.material.needsUpdate = true;
                }
            }.bind(this),

            function(error)
            {
                console.warn("Tile texture loading error: " + error);
            }.bind(this));
        }
    }
};

/**
 * Add graphical debug layer
 * @method FORGE.Tile#_addDebugLayer
 * @private
 */
FORGE.Tile.prototype._addDebugLayer = function()
{
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF0000";

    var x = canvas.width / 2;
    var y = canvas.height / 2 - 25;

    ctx.fillStyle = "gray";
    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // General font style
    ctx.textAlign = "center";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";

    ctx.font = "16px Courier";
    ctx.fillText("TILE " + this.name, x, y);
    y += 40;

    var fontSize = 12;
    ctx.font = fontSize + "px Courier";
    var ceiling = canvas.width - 20;

    ctx.textAlign = "left";
    ctx.font = "10px Courier";
    ctx.fillText("Level " + this._level, 10, canvas.height - 10);

    ctx.textAlign = "right";
    ctx.fillText(this._renderer.pixelsAtCurrentLevelHumanReadable, canvas.width - 10, canvas.height - 10);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial(
    {
        transparent: true,
        map: texture,
        depthTest: false
    });
    var mesh = new THREE.Mesh(this.geometry.clone(), material);
    mesh.name = this.name + "-debug-canvas";
    this.add(mesh);
};

/**
 * Set opacity of the tile and its children (recursive)
 * @method FORGE.Tile#_setOpacity
 * @param {number} opacity - tile opacity
 * @private
 */
FORGE.Tile.prototype._setOpacity = function(opacity)
{
    opacity = FORGE.Math.clamp(opacity, 0, 1);

    this._opacity = opacity;

    var setNodeOpacity = function(node)
    {
        if (node !== null && node.material !== null &&
            typeof node.material.opacity !== "undefined")
        {
            if (node.material.transparent === true)
            {
                node.material.opacity = opacity;
            }
        }

        for (var i = 0, ii = node.children.length; i < ii; i++)
        {
            setNodeOpacity(node.children[i]);
        }
    };

    setNodeOpacity(this);
};

/**
 * Set geometry of the tile
 * This means rotation and position in world coordinates
 * @method FORGE.Tile#_setGeometry
 * @private
 */
FORGE.Tile.prototype._setGeometry = function()
{
    var tx = this._renderer.nbTilesPerAxis(this._level, "x");
    var ty = this._renderer.nbTilesPerAxis(this._level, "y");

    var fullTileWidth = this._renderer.cubeSize / tx;
    var fullTileHeight = this._renderer.cubeSize / ty;

    var scaleX = this._x < Math.floor(tx) ? 1 : tx - Math.floor(tx);
    var scaleY = this._y < Math.floor(ty) ? 1 : ty - Math.floor(ty);

    var tileSize = new FORGE.Size(scaleX * fullTileWidth, scaleY * fullTileHeight);

    this.geometry = new THREE.PlaneBufferGeometry(tileSize.width, tileSize.height);

    var baseOffset = -this._renderer.cubeSize * 0.5;

    // position = tile offset in XY plane - half cube size + half tile size
    var position = new THREE.Vector3(
        baseOffset + fullTileWidth * this._x + 0.5 * tileSize.width,
        -(baseOffset + fullTileHeight * this._y + 0.5 * tileSize.height),
        baseOffset);

    var rotation = this._getRotation();
    this.rotation.copy(rotation);
    
    position.applyEuler(rotation);
    this.position.copy(position);
};

/**
 * Get rotation of the tile
 * @method FORGE.Tile#_setRotation
 * @private
 */
FORGE.Tile.prototype._getRotation = function()
{
    if (this._parent !== null)
    {
        return this._parent.rotation;
    }

    switch (this._face)
    {
        case "front":
            return new THREE.Euler(0, 0, 0);

        case "back":
            return new THREE.Euler(0, Math.PI, 0);

        case "left":
            return new THREE.Euler(0, Math.PI / 2, 0);

        case "right":
            return new THREE.Euler(0, -Math.PI / 2, 0);

        case "up":
            return new THREE.Euler(Math.PI / 2, 0, 0);

        case "down":
            return new THREE.Euler(-Math.PI / 2, 0, 0);
    }
};

/**
 * Subdivide tile into 4 tiles
 * @method FORGE.Tile#subdivide
 * @private
 */
FORGE.Tile.prototype._subdivide = function()
{
    if (this._children.length === 4)
    {
        return;
    }

    // var halfSize = this.geometry.boundingBox.getSize().multiplyScalar(0.5);
    var tile;
    var level = this._level + 1;

    var x0 = 2 * this._x;
    var x1 = 2 * this._x + 1;
    var y0 = 2 * this._y;
    var y1 = 2 * this._y + 1;

    tile = this._renderer.getTile(this, level, this._face, x0, y0, "quarter NW of " + this.name);
    if (this._children.indexOf(tile) === -1)
    {
        tile.onDestroy.add(this._onChildTileDestroyed, this);
        this._children.push(tile);
    }

    var tx = this._renderer.nbTilesPerAxis(this._level + 1, "x");
    var ty = this._renderer.nbTilesPerAxis(this._level + 1, "y");

    var x1_in = x1 < tx;
    var y1_in = y1 < ty;

    if (x1_in === true)
    {
        tile = this._renderer.getTile(this, level, this._face, x1, y0, "quarter NE of " + this.name);
        if (this._children.indexOf(tile) === -1)
        {
            tile.onDestroy.add(this._onChildTileDestroyed, this);
            this._children.push(tile);
        }
    }

    if (y1_in === true)
    {
        tile = this._renderer.getTile(this, level, this._face, x0, y1, "quarter SW of " + this.name);
        if (this._children.indexOf(tile) === -1)
        {
            tile.onDestroy.add(this._onChildTileDestroyed, this);
            this._children.push(tile);
        }
    }

    if (x1_in === true && y1_in === true)
    {
        tile = this._renderer.getTile(this, level, this._face, x1, y1, "quarter SE of " + this.name);
        if (this._children.indexOf(tile) === -1)
        {
            tile.onDestroy.add(this._onChildTileDestroyed, this);
            this._children.push(tile);
        }
    }
};

/**
 * Child tile destroy event handler
 * @method FORGE.Tile#_onChildTileDestroyed
 */
FORGE.Tile.prototype._onChildTileDestroyed = function(event)
{
    var tile = event.emitter;
    tile.onDestroy.remove(this._onChildTileDestroyed, this);

    if (this._children === null)
    {
        return;
    }

    var idx = this._children.indexOf(tile);

    if (idx !== -1)
    {
        this._children.splice(idx, 1);
    }
};

/**
 * Neighbour tile destroy event handler
 * @method FORGE.Tile#_onNeighbourTileDestroyed
 */
FORGE.Tile.prototype._onNeighbourTileDestroyed = function(event)
{
    var tile = event.emitter;
    tile.onDestroy.remove(this._onNeighbourTileDestroyed, this);

    this._neighborsNeedCheck = true;

    if (this._neighbours === null)
    {
        return;
    }

    var idx = this._neighbours.indexOf(tile);

    if (idx !== -1)
    {
        this._neighbours.splice(idx, 1);
    }
};

/**
 * Parent tile destroy event handler
 * @method FORGE.Tile#_onParentTileDestroyed
 */
FORGE.Tile.prototype._onParentTileDestroyed = function(event)
{
    var tile = event.emitter;
    tile.onDestroy.remove(this._onParentTileDestroyed, this);

    this._parent = null;
    this._parentNeedsCheck = true;
};

/**
 * Get parent tile
 * @method FORGE.Tile#_checkParent
 * @private
 */
FORGE.Tile.prototype._checkParent = function()
{
    if (this._parent !== null ||
        this._parentNeedsCheck === false ||
        this._level === 0 ||
        this._level !== this._renderer.level)
    {
        return;
    }

    this._parentNeedsCheck = false;

    var sequence = Promise.resolve();
    sequence.then(function()
    {
        this._parent = this._renderer.getParentTile(this);
        this._parent.onDestroy.add(this._onParentTileDestroyed, this);
    }.bind(this));
};

/**
 * Lookup tiles around current one and create them if needed
 * @method FORGE.Tile#_checkNeighbours
 * @private
 */
FORGE.Tile.prototype._checkNeighbours = function()
{
    if (this._neighborsNeedCheck === false ||
        this._level !== this._renderer.level)
    {
        return;
    }

    this._neighborsNeedCheck = false;

    var tx = Math.ceil(this._renderer.nbTilesPerAxis(this._level, "x"));
    var ty = Math.ceil(this._renderer.nbTilesPerAxis(this._level, "y"));

    var name = this.name;

    var sequence = Promise.resolve();
    var sequenceFn = function(prenderer, plevel, pface, px, py, neighbours, plog)
    {
        sequence.then(function()
        {
            var tile = prenderer.getTile(null, plevel, pface, px, py, plog);
            if (neighbours.indexOf(tile) === -1)
            {
                tile.onDestroy.add(tileDestroyedCallback);
                neighbours.push(tile);
            }
        });
    };

    // Check tile neighbors in current face
    var xmin = Math.max(0, this._x - 1);
    var xmax = Math.min(tx - 1, this._x + 1);

    var ymin = Math.max(0, this._y - 1);
    var ymax = Math.min(ty - 1, this._y + 1);

    var tileDestroyedCallback = this._onNeighbourTileDestroyed.bind(this);

    // and do the job for the current face
    for (var y = ymin; y <= ymax; y++)
    {
        for (var x = xmin; x <= xmax; x++)
        {
            if (x === this._x && y === this._y)
            {
                continue;
            }

            sequenceFn(this._renderer, this._level, this._face, x, y, this._neighbours, "foo");
        }
    }


    var tileX = this._x;
    var tileY = this._y;

    // Check if tile is on a left or right edge of the cube face
    if (tileX === 0 || tileX === tx - 1)
    {
        var edge = (tileX === 0); // true for left, false for right
        var log = "neighbour-" + (edge ? "left" : "right") + "-edge of " + name;
        var face = edge ? FORGE.Tile.FACE_PREVIOUS[this._face] : FORGE.Tile.FACE_NEXT[this._face];
        var x = edge ? tx - 1 : 0;

        sequenceFn(this._renderer, this._level, face, x, tileY, this._neighbours, log);
    }

    // Check if tile is on a bottom or top edge of the cube face
    if (tileY === ty - 1 || tileY === 0)
    {
        var edge = (tileY === 0); // true for top, false for bottom
        var fx, fy,
            face = edge ? "up" : "down";

        if (this._face === "front")
        {
            fx = tileX;
            fy = edge ? 0 : ty - 1;
        }
        else if (this._face === "back")
        {
            fx = tx - 1 - tileX;
            fy = edge ? ty - 1 : 0;
        }
        else if (this._face === "right")
        {
            fx = ty - 1;
            fy = edge ? tx - 1 - tileX : tileX;
        }
        else if (this._face === "left")
        {
            fx = 0;
            fy = edge ? tileX : tx - 1 - tileX;
        }
        else if (this._face === "up")
        {
            fx = edge ? tx - 1 - tileX : tileX;
            fy = 0;
            face = edge ? "back" : "front";
        }
        else if (this._face === "down")
        {
            fx = edge ? tileX : tx - 1 - tileX;
            fy = edge ? tx - 1 : ty - 1;
            face = "back";
        }

        var log = "neighbour-" + (edge ? "top" : "bottom") + "-edge of " + name;

        sequenceFn(this._renderer, this._level, face, fx, fy, this._neighbours, log);
    }
};

/**
 * Get name of the parent tile
 * @method FORGE.Tile#getParentName
 * @return {?string} parent tile name
 */
FORGE.Tile.prototype.getParentName = function()
{
    if (this._level === 0)
    {
        return null;
    }

    var coords = FORGE.Tile.getParentTileCoordinates(this);
    return FORGE.Tile.createName(this._face, this._level - 1, coords.x, coords.y);
};

/**
 * Destroy sequence
 * @method FORGE.Tile#destroy
 */
FORGE.Tile.prototype.destroy = function()
{
    if (this.material !== null)
    {
        if (typeof this.material.uniforms !== "undefined")
        {
            for (var u in this.material.uniforms)
            {
                this.material.uniforms[u].value = null;
            }
        }

        if (this.material.map !== null)
        {
            this.material.map.dispose();
            this.material.map = null;
        }

        this.material.dispose();
        this.material = null;
    }

    if (this.geometry !== null)
    {
        this.geometry.dispose();
        this.geometry = null;
    }

    this._parent = null;

    for (var i = 0, ii = this._children.length; i < ii; i++)
    {
        this._children[i].onDestroy.remove(this._onChildTileDestroyed, this);
    }
    this._children.length = 0;
    this._children = null;

    for (var i = 0, ii = this._neighbours.length; i < ii; i++)
    {
        this._neighbours[i].onDestroy.remove(this._onNeighbourTileDestroyed, this);
    }
    this._neighbours.length = 0;
    this._neighbours = null;

    this._position = null;

    this._renderer = null;

    if (this._onDestroy !== null)
    {
        this._onDestroy.dispatch();
        this._onDestroy.destroy();
        this._onDestroy = null;
    }
};

/**
 * Get the onDestroy {@link FORGE.EventDispatcher}.
 * @name FORGE.Tile#onDestroy
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.Tile.prototype, "onDestroy",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        if (this._onDestroy === null)
        {
            this._onDestroy = new FORGE.EventDispatcher(this, true);
        }

        return this._onDestroy;
    }
});

/**
 * Get face.
 * @name FORGE.Tile#face
 * @type {string}
 */
Object.defineProperty(FORGE.Tile.prototype, "face",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        // return FORGE.Tile.FACES.indexOf(this._face);
        return this._face;
    }
});

/**
 * Get level.
 * @name FORGE.Tile#level
 * @type {string}
 */
Object.defineProperty(FORGE.Tile.prototype, "level",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._level;
    }
});

/**
 * Get x coordinate.
 * @name FORGE.Tile#x
 * @type {number}
 */
Object.defineProperty(FORGE.Tile.prototype, "x",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._x;
    }
});

/**
 * Get y coordinate.
 * @name FORGE.Tile#y
 * @type {number}
 */
Object.defineProperty(FORGE.Tile.prototype, "y",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._y;
    }
});

/**
 * Get opacity.
 * @name FORGE.Tile#opacity
 * @type {number}
 */
Object.defineProperty(FORGE.Tile.prototype, "opacity",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._opacity;
    }
});

/**
 * Create timestamp.
 * @name FORGE.Tile#createTS
 * @type {number}
 */
Object.defineProperty(FORGE.Tile.prototype, "createTS",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._createTS;
    }
});

/**
 * Last display timestamp.
 * @name FORGE.Tile#displayTS
 * @type {number}
 */
Object.defineProperty(FORGE.Tile.prototype, "displayTS",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._displayTS;
    }
});

/**
 * Neighbour tiles.
 * @name FORGE.Tile#neighbours
 * @type {Array<FORGE.Tile>}
 */
Object.defineProperty(FORGE.Tile.prototype, "neighbours",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._neighbours;
    }
});
