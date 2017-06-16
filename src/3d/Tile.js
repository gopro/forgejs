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
     * Reference on parent tile
     * @name FORGE.Tile#_parent
     * @type {FORGE.Tile}
     * @private
     */
    this._parent = parent;

    /**
     * String describing what created the tile
     * @type {FORGE.Tile}
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
    this._face = typeof face === "number" ? FORGE.Tile.FACES[face] : face.toLowerCase();

    /**
     * Creation timestamp
     * @name FORGE.Tile#_createTS
     * @type {Date}
     * @private
     */
    this._createTS = null;

    /**
     * Last display timestamp
     * @name FORGE.Tile#_displayTS
     * @type {Date}
     * @private
     */
    this._displayTS = null;

    /**
     * Reference on north west tile
     * @name FORGE.Tile#_northWest
     * @type {FORGE.Tile}
     * @private
     */
    this._northWest = null;

    /**
     * Reference on north east tile
     * @name FORGE.Tile#_northEast
     * @type {FORGE.Tile}
     * @private
     */
    this._northEast = null;   

    /**
     * Reference on south east tile
     * @name FORGE.Tile#_southEast
     * @type {FORGE.Tile}
     * @private
     */
    this._southEast = null;   

    /**
     * Reference on south west tile
     * @name FORGE.Tile#_southWest
     * @type {FORGE.Tile}
     * @private
     */
    this._southWest = null;

    /**
     * Flag to know if parent has been checked
     * @name FORGE.MediaStore#_parentCheckDone
     * @type {boolean}
     * @private
     */
    this._parentCheckDone = false;

    /**
     * Flag to know if neighbourhood has been checked
     * @name FORGE.MediaStore#_neighbourhoodCheckDone
     * @type {boolean}
     * @private
     */
    this._neighbourhoodCheckDone = false;

    /**
     * Global opacity value
     * @name FORGE.Tile#_opacity
     * @type {number}
     * @private
     */
    this._opacity = 0.001;

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
FORGE.Tile.FACES = ["f", "r", "b", "l", "u", "d"];

/**
 * Faces color object (debug purpose)
 * @type {Object}
 */
FORGE.Tile.FACES_COLOR = {
    "f": { "h": 239, "s": 0.47 },
    "l": { "h": 6  , "s": 0.66 },
    "b": { "h": 178, "s": 0.41 },
    "r": { "h": 137, "s": 0.55 },
    "u": { "h": 44 , "s": 0.46 },
    "d": { "h": 263, "s": 0.56 }
};

/**
 * Opacity increment [unit per render cycle]
 * @type {number}
 */
FORGE.Tile.OPACITY_INCREMENT = 0.04;

/**
 * Texture load predelay (time between creation and display)
 * @type {number}
 */
FORGE.Tile.TEXTURE_LOADING_PREDELAY_MS = 200;

/**
 * Table describing previous cube face
 * @type {object}
 */
FORGE.Tile.FACE_PREVIOUS = {
    "f": "l",
    "r": "f",
    "b": "r",
    "l": "b",
    "u": "u",
    "d": "d"
};

/**
 * Table describing next cube face
 * @type {object}
 */
FORGE.Tile.FACE_NEXT = {
    "f": "r",
    "r": "b",
    "b": "l",
    "l": "f",
    "u": "u",
    "d": "d"
};

/**
 * Create tile name
 * @method FORGE.Tile#createName
 * @param {string} face - cube face
 * @param {number} level - pyramid level
 * @param {number} x - x coordinate (column)
 * @param {number} y - y coordinate (row)
 */
FORGE.Tile.createName = function(face, level, x, y)
{
    face = typeof face === "number" ? FORGE.Tile.FACES[face] : face.toLowerCase();
    return face.toUpperCase() + "-" + level + "-" + y + "-" + x;
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
    // Always ensure a new tile has a parent tile
    // This will prevent from zomming out into some empty area
    if (this._level > 0 && this._parent === null) {
        this._checkParent();
    }

    this.name = FORGE.Tile.createName(this._face, this._level, this._x, this._y);

    this.onBeforeRender = this._onBeforeRender.bind(this);
    this.onAfterRender = this._onAfterRender.bind(this);

    this._setGeometry();

    // Create checkboard colors as default material
    var hs = FORGE.Tile.FACES_COLOR[this._face];
    var l = (this._x & 1) ^ (this._y & 1) ? 0.25 : 0.50;
    var hsl = new THREE.Color().setHSL(hs.h / 360, hs.s, l);
    hsl = new THREE.Color(0x000000);

    // Level 0 objects are opaque to be rendered first
    var transparent = this._level > 0;
    this._opacity = transparent ? 0.0 : 1.0;

    // this.renderOrder = this._level;

    this.material = new THREE.MeshBasicMaterial({
        color:hsl,
        transparent: transparent,
        opacity: this._opacity,
        depthTest: false,
        side:THREE.FrontSide
    });

    if (FORGE.Tile.DEBUG === true)
    {
        this._addDebugLayer();
    }

    this._createTS = Date.now();
};

/**
 * Before render callback
 * This is called by THREE.js render routine
 * @method FORGE.Tile#_onBeforeRender
 * @private
 */
FORGE.Tile.prototype._onBeforeRender = function()
{
    // this._setOpacity(this._opacity);

    if (this._renderer.level !== this._level)
    {
        if (this._opacity > 0)
        {
            this._setOpacity(this._opacity - FORGE.Tile.OPACITY_INCREMENT);
        }

        return;
    }
    else
    {
        if (this._opacity < 1 && this.material.map !== null)
        {
            this._setOpacity(this._opacity + FORGE.Tile.OPACITY_INCREMENT);
        }
    }

    // Add to renderer render list
    this._renderer.addToRenderList(this);

    // Get neighbour tiles to ensure there is no hole near the frustum
    this._checkNeighbours();

    // Update last display timestamp
    this._displayTS = Date.now();

    // Enable texture mapping
    if (this._texturePending === false &&
        this._displayTS - this._createTS > FORGE.Tile.TEXTURE_LOADING_PREDELAY_MS)
    {
        var texPromise = this._renderer.textureStore.get(this);

        if (texPromise !== null)
        {
            texPromise.then(function(texture) {
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

            function(error) {
                //console.log("Tile texture loading error: " + error);
            }.bind(this));
        }
    }

};

/**
 * After render callback
 * This is called by THREE.js render routine
 * @method FORGE.Tile#_onAfterRender
 * @private
 */
FORGE.Tile.prototype._onAfterRender = function(renderer, scene, camera, geometry, material, group)
{
    if (this._renderer.level > this._level)
    {
        this._subdivide();
    }
};

/**
 * Add graphical debug layer
 * @method FORGE.Tile#_addDebugLayer
 * @private
 */
FORGE.Tile.prototype._addDebugLayer = function()
{
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';

    var x = canvas.width / 2;
    var y = canvas.height / 2 - 25;

    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'white';
    ctx.strokeRect(20,20, canvas.width - 40, canvas.height - 40); 

    // General font style
    ctx.textAlign = 'center';
    ctx.textAlign = 'center';
    ctx.textBaseline = "middle";
    ctx.fillStyle = 'white';

    ctx.font = "16px Courier";
    ctx.fillText("TILE " + this.name, x, y);
    y += 40;

    var fontSize = 12;
    ctx.font = fontSize + "px Courier";
    var ceiling = canvas.width - 20;
    
    ctx.textAlign = 'left';
    ctx.font = "10px Courier";
    ctx.fillText("Level " + this._level, 10, canvas.height - 10);

    ctx.textAlign = 'right';
    ctx.fillText(this._renderer.pixelsAtCurrentLevelHumanReadable, canvas.width - 10, canvas.height - 10);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({transparent:true, map:texture, depthTest: false});
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

    var setNodeOpacity = function(node) {
        if (node !== null && node.material !== null &&
            typeof node.material.opacity !== "undefined")
        {
            if (node.material.transparent === true)
            {
                node.material.opacity = opacity;
            }
        }

        for (var i=0,ii=node.children.length; i<ii; i++)
        {
            setNodeOpacity(node.children[i]);
        }
    }

    setNodeOpacity(this);
};

/**
 * Set geometry of the tile
 * This means rotation and position in world coordinates
 * @method FORGE.Tile#_setGeometry
 * @param {THREE.Euler} rotation face rotation
 * @private
 */
FORGE.Tile.prototype._setGeometry = function(rotation)
{
    var tx = this._renderer.nbTilesPerAxis(this._level, "x");
    var ty = this._renderer.nbTilesPerAxis(this._level, "y");

    var fullTileWidth = this._renderer.cubeSize / tx;
    var fullTileHeight = this._renderer.cubeSize / ty;

    var scaleX = this._x < Math.floor(tx) ? 1 : tx - Math.floor(tx);
    var scaleY = this._y < Math.floor(ty) ? 1 : ty - Math.floor(ty);

    var tileSize = new FORGE.Size(scaleX * fullTileWidth, scaleY * fullTileHeight);

    this.geometry = new THREE.PlaneBufferGeometry(tileSize.width, tileSize.height);
    this.geometry.computeBoundingBox();

    var baseOffset = -this._renderer.cubeSize * 0.5;

    // position = tile offset in XY plane - half cube size + half tile size
    var position = new THREE.Vector3(
        baseOffset + fullTileWidth * this._x + 0.5 * tileSize.width,
        -(baseOffset + fullTileHeight * this._y + 0.5 * tileSize.height),
        baseOffset);

    // var position = new THREE.Vector3(0, 0, -0.5 * this._renderer.cubeSize);

    // //console.log("tile height: " + tileSize.height + ", full tile height: " + fullTileHeight);
    // console.log(this.name + " - position: " + position.x + ", " + position.y);

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
        case "f":
            return new THREE.Euler(0, 0, 0);
        break;
        case "b":
            return new THREE.Euler(0, Math.PI, 0);
        break;

        case "l":
            return new THREE.Euler(0, Math.PI / 2, 0);
        break;
        case "r":
            return new THREE.Euler(0, -Math.PI / 2, 0);
        break;

        case "u":
            return new THREE.Euler(Math.PI / 2, 0, 0);
        break;
        case "d":
            return new THREE.Euler(-Math.PI / 2, 0, 0);
        break;
    }
};

/**
 * Subdivide tile into 4 tiles
 * @method FORGE.Tile#subdivide
 * @private
 */
FORGE.Tile.prototype._subdivide = function()
{
    if (this._northWest !== null)
    {
        return;
    }

    var halfSize = this.geometry.boundingBox.getSize().multiplyScalar(0.5);

    var level = this._level + 1;

    var x0 = 2 * this._x;
    var x1 = 2 * this._x + 1;
    var y0 = 2 * this._y;
    var y1 = 2 * this._y + 1;

    this._northWest = this._renderer.getTile(this, level, this._face, x0, y0, "quarter NW of " + this.name);
    // this._northWest.position.set(-halfSize.x, halfSize.y);
    // this.add(this._northWest);

    var tx = this._renderer.nbTilesPerAxis(this._level + 1, "x");
    var ty = this._renderer.nbTilesPerAxis(this._level + 1, "y");

    var x1_in = x1 < tx;
    var y1_in = y1 < ty;

    if (x1_in === true)
    {
        this._northEast = this._renderer.getTile(this, level, this._face, x1, y0, "quarter NE of " + this.name);
        // this._northEast.position.set(halfSize.x, halfSize.y);
        // this.add(this._northEast);
    }

    if (y1_in === true)
    {
        this._southWest = this._renderer.getTile(this, level, this._face, x0, y1, "quarter SW of " + this.name);
        // this._southWest.position.set(-halfSize.x, -halfSize.y);
        // this.add(this._southWest);
    }

    if (x1_in === true && y1_in === true)
    {
        this._southEast = this._renderer.getTile(this, level, this._face, x1, y1, "quarter SE of " + this.name);
        // this._southEast.position.set(halfSize.x, -halfSize.y);
        // this.add(this._southEast);
    }
};

/**
 * Neighbor tile destroy event handler
 * @method FORGE.Tile#_onNeighborTileDestroyed
 */
FORGE.Tile.prototype._onNeighborTileDestroyed = function()
{
    this._neighbourhoodCheckDone = false;
};

/**
 * Parent tile destroy event handler
 * @method FORGE.Tile#_onParentTileDestroyed
 */
FORGE.Tile.prototype._onParentTileDestroyed = function()
{
    this._parentCheckDone = false;
};

/**
 * Get parent tile
 * @method FORGE.Tile#_checkParent
 * @private
 */
FORGE.Tile.prototype._checkParent = function()
{
    if (this._parent !== null ||
        this._parentCheckDone === true ||
        this._level === 0 ||
        this._level !== this._renderer.level) {
        return;
    }

    this._parentCheckDone = true;

    var sequence = Promise.resolve();
    sequence.then(function() {
        this._parent = this._renderer.getParentTile(this);
        this._parent.onDestroy.add(this._onParentTileDestroyed, this);

        // if (this._parent.children.indexOf(this) === -1)
        // {
        //     this._parent.add(this);   
        // }
        //console.log("Parent tile created (" + parent.name + ")");
        
    }.bind(this));
};

/**
 * Lookup tiles around current one and create them if needed
 * @method FORGE.Tile#_checkNeighbours
 * @private
 */
FORGE.Tile.prototype._checkNeighbours = function()
{
    if (this._neighbourhoodCheckDone === true || this._level !== this._renderer.level)
    {
        return;
    }
    
    this._neighbourhoodCheckDone = true;

    var tx = Math.ceil(this._renderer.nbTilesPerAxis(this._level, "x"));
    var ty = Math.ceil(this._renderer.nbTilesPerAxis(this._level, "y"));

    var name = this.name;
    
    var sequence = Promise.resolve();
    
    // Check tile neighbors in current face
    var xmin = Math.max(0, this._x - 1);
    var xmax = Math.min(tx - 1, this._x + 1);

    var ymin = Math.max(0, this._y - 1);
    var ymax = Math.min(ty - 1, this._y + 1);

    // and do the job for the current face
    for (var y=ymin; y<=ymax; y++)
    {
        for (var x=xmin; x<=xmax; x++)
        {
            if (x === this._x && y === this._y)
            {
                continue;
            }

            (function (prenderer, plevel, pface, px, py) {
                sequence.then(function()
                {
                    var tile = prenderer.getTile(null, plevel, pface, px, py, "neighbour of " + name);
                    tile.onDestroy.add(this._onNeighborTileDestroyed, this);
                });
            })(this._renderer, this._level, this._face, x, y);
        }
    }

    // When tile per axis is under 3, all tiles are on the edge
    if (tx > 2 || ty > 2)
    {
        var tileX = this._x;
        var tileY = this._y;

        // Check if tile is on a left edge of the cube face
        if (tileX === 0)
        {
            sequence.then(function()
            {
                (function (prenderer, plevel, pface, px, py) {
                    sequence.then(function()
                    {
                        var tile = prenderer.getTile(null, plevel, pface, px, py, "neighbour.left-edge of " + name);
                        tile.onDestroy.add(this._onNeighborTileDestroyed, this);
                    });
                })(this._renderer, this._level, FORGE.Tile.FACE_PREVIOUS[this._face], tx - 1, tileY);

            }.bind(this));
        }

        // Check if tile is on a right edge of the cube face
        if (tileX === tx - 1)
        {
            sequence.then(function()
            {
                (function (prenderer, plevel, pface, px, py) {
                    sequence.then(function()
                    {
                        var tile = prenderer.getTile(null, plevel, pface, px, py, "neighbour.right-edge of " + name);
                        tile.onDestroy.add(this._onNeighborTileDestroyed, this);
                    });
                })(this._renderer, this._level, FORGE.Tile.FACE_NEXT[this._face], 0, tileY);

            }.bind(this));
        }

        // Check if tile is on a bottom edge of the cube face
        if (tileY === ty - 1)
        {
            var fx, fy, face = "d";

            if (this._face === "f")
            {
                fx = tileX;
                fy = 0;
            }
            else if (this._face === "b")
            {
                fx = tx - 1 - tileX;
                fy = ty - 1;
            }
            else if (this._face === "r")
            {
                fx = ty - 1;
                fy = tileX;
            }
            else if (this._face === "l")
            {
                fx = 0;
                fy = tx - 1 - tileX;
            }
            else if (this._face === "u")
            {
                fx = tileX;
                fy = 0;
                face = "f";
            }
            else if (this._face === "d")
            {
                fx = tx - 1 - tileX;
                fy = ty - 1;
                face = "b";
            }

            sequence.then(function()
            {
                (function (prenderer, plevel, pface, px, py) {
                    sequence.then(function()
                    {
                        var tile = prenderer.getTile(null, plevel, pface, px, py, "neighbour.bottom-edge of " + name);
                        tile.onDestroy.add(this._onNeighborTileDestroyed, this);
                    });
                })(this._renderer, this._level, face, fx, fy);

            }.bind(this));
        }

        // Check if tile is on a top edge of the cube face
        if (tileY === 0)
        {
            var fx, fy, face = "u";

            if (this._face === "f")
            {
                fx = tileX;
                fy = ty - 1;
            }
            else if (this._face === "b")
            {
                fx = tx - 1 - tileX;
                fy = 0;
            }
            else if (this._face === "r")
            {
                fx = tx - 1;
                fy = tx - 1 - tileX;
            }
            else if (this._face === "l")
            {
                fx = 0;
                fy = tileX;
            }
            else if (this._face === "u")
            {
                fx = tx - 1 - tileX;
                fy = 0;
                face = "b";
            }
            else if (this._face === "d")
            {
                fx = tileX;
                fy = tx - 1;
                face = "f";
            }

            sequence.then(function()
            {
                (function (prenderer, plevel, pface, px, py) {
                    sequence.then(function()
                    {
                        var tile = prenderer.getTile(null, plevel, pface, px, py, "neighbour.top-edge of " + name);
                        tile.onDestroy.add(this._onNeighborTileDestroyed, this);
                    });
                })(this._renderer, this._level, face, fx, fy);

            }.bind(this));
        }
    }
};

/**
 * Get name of the parent tile
 * @method FORGE.Tile#getParentName
 * @return {string} parent tile name
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
        
        this.material.dispose();
    }

    if (this.geometry !== null)
    {
        this.geometry.dispose();
    }

    this._position = null;

    if (this._northWest !== null)
    {
        this._northWest.destroy();   
        this._northWest = null;   
    }
    
    if (this._northEast !== null)
    {
        this._northEast.destroy();   
        this._northEast = null;   
    }
    
    if (this._southEast !== null)
    {
        this._southEast.destroy();   
        this._southEast = null;   
    }
    
    if (this._southWest !== null)
    {
        this._southWest.destroy();   
        this._southWest = null;   
    }

    this._parent = null;

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
        return FORGE.Tile.FACES.indexOf(this._face);
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
 * @type {string}
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
 * @type {string}
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

