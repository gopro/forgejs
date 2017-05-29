/**
 * Tile class.
 *
 * @constructor FORGE.Tile
 * @param {FORGE.BackgroundPyramidRenderer} renderer - renderer reference
 * @extends {THREE.Mesh}
 */
FORGE.Tile = function(parent, renderer, x, y, level, face)
{
    this._parent = parent;

    this._renderer = renderer;

    this._position = null;

    this._x = x;

    this._y = y;

    this._level = level;

    this._face = face.toLowerCase();

    this._rotation = null;

    this._createTS = new Date();
    
    this._displayTS = null;

    this._quadTreeID = "";

    this._northWest = null;

    this._northEast = null;   

    this._southEast = null;   

    this._southWest = null;

    this._debug = false;

    this._opacity = 0;

    THREE.Mesh.call(this);

    this._boot();
};

FORGE.Tile.prototype = Object.create(THREE.Mesh.prototype);
FORGE.Tile.prototype.constructor = FORGE.Tile;

FORGE.Tile.FACES = {
    "f": "front",
    "b": "back",
    "l": "left",
    "r": "right",
    "u": "up",
    "d": "down"
};

FORGE.Tile.FACES_COLOR = {
    "f": { "h": 239, "s": 0.47 },
    "l": { "h": 6  , "s": 0.66 },
    "b": { "h": 178, "s": 0.41 },
    "r": { "h": 137, "s": 0.55 },
    "u": { "h": 44 , "s": 0.46 },
    "d": { "h": 263, "s": 0.56 }
};

FORGE.Tile.OPACITY_INCREMENT = 0.04;

// Cache geometry for each level to increase performances
FORGE.Tile.Geometry = new Map();

FORGE.Tile.prototype._geometry = function()
{
    if (FORGE.Tile.Geometry.has(this._level) === true)
    {
        return FORGE.Tile.Geometry.get(this._level);
    }

    var tileSize = this._renderer.tileSize(this._level);
    var geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize, 1, 1);
    FORGE.Tile.Geometry.set(this._level, geometry);
    return FORGE.Tile.Geometry.get(this._level);
};


/**
 * Boot sequence
 * @method FORGE.Tile#_boot
 * @private
 */
FORGE.Tile.prototype._boot = function()
{
    this._position = new THREE.Vector3(this._x, this._y, 0);

    if (this._parent !== null)
    {
        var quadTreeIndex = (this._x & 1) + 2 * (this._y & 1);
        this._quadTreeID = this._parent.quadTreeID + quadTreeIndex;        
    }
    else
    {
        this._quadTreeID = this._face;        
    }

    this.name = FORGE.Tile.FACES[this._face] + "-" + this._level + "-" + this._position.y + "-" + this._position.x;
    // this.name = this._name;

    this.onBeforeRender = this._onBeforeRender.bind(this);
    this.onAfterRender = this._onAfterRender.bind(this);

    var tileSize = this._renderer.tileSize(this._level);
    this.geometry = this._geometry();

    var rotation = this._getRotation();
    this.rotation.copy(rotation);
    this._setPosition(rotation);

    // Create checkboard colors as default material
    var hs = FORGE.Tile.FACES_COLOR[this._face];
    var l = (this._position.x & 1) ^ (this._position.y & 1) ? 0.25 : 0.50;
    var hsl = new THREE.Color().setHSL(hs.h / 360, hs.s, l);
    hsl = new THREE.Color(0xffffff);

    // Level 0 objects are opaque to be rendered first
    var transparent = this._level > 0;
    this._opacity = transparent ? 0.0 : 1.0;

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

    // Always ensure a new tile has a parent tile
    // This will prevent from zomming out into some empty area
    if (this._level > 0 && this._parent === null) {
        this._checkParent();
    }
};

/**
 * On before render callback
 * @method FORGE.Tile#_onBeforeRender
 * @private
 */
FORGE.Tile.prototype._onBeforeRender = function(renderer, scene, camera, geometry, material, group)
{
    this._setOpacity(this._opacity);

    if (this._renderer.level !== this._level)
    {
        if (this._level > 0 && this._opacity > 0)
        {
            this._setOpacity(this._opacity - FORGE.Tile.OPACITY_INCREMENT);
        }

        if (this._renderer.level > this._level)
        {
            this._subdivide();
        }

        return;
    }
    else
    {
        if (this._level > 0 && this._opacity < 1)
        {
            this._setOpacity(this._opacity + FORGE.Tile.OPACITY_INCREMENT);
        }        
    }

    // Get neighbour tiles to ensure there is no hole near the frustum
    this._checkNeighbours();

    // Enable texture mapping
    if (this.material.map === null)
    {
        var tpa = this._renderer.nbTilesPerAxis(this._level);
        var texture = this._renderer.textureStore.get(this._face, this._level, this._position.x, tpa - 1 - this._position.y);
        if (texture !== null)
        {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.needsUpdate = true;

            this.material.color = new THREE.Color(0xffffff);
            this.material.map = texture;
            this.material.needsUpdate = true;
        }
    }

    // Update last display timestamp
    this._displayTS = new Date();
};

/**
 * On after render callback
 * @method FORGE.Tile#_onAfterRender
 * @private
 */
FORGE.Tile.prototype._onAfterRender = function(renderer, scene, camera, geometry, material, group)
{

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

    var quadtTreeText = "Quadtree\n" + this._quadTreeID;
    while (--fontSize > 0 && ctx.measureText(quadtTreeText).width > ceiling)
    {
        ctx.font = fontSize + "px Courier";   
    }

    ctx.fillText(quadtTreeText, x, y);
    y += 25;
    
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
 * Set opacity of the tile and its children
 * @method FORGE.Tile#_setOpacity
 * @private
 */
FORGE.Tile.prototype._setOpacity = function(opacity, storeValue)
{
    opacity = FORGE.Math.clamp(opacity, 0, 1);

    if (typeof storeValue === "undefined" || storeValue === true)
    {
        this._opacity = opacity;
    }

    var setNodeOpacity = function(node) {
        if (node !== null && node.material !== null &&
            typeof node.material.opacity !== "undefined")
        {
            node.material.opacity = opacity;
        }

        for (var i=0,ii=node.children.length; i<ii; i++)
        {
            setNodeOpacity(node.children[i]);
        }
    }

    setNodeOpacity(this);
};

/**
 * Set position of the tile
 * @method FORGE.Tile#_setPosition
 * @param {THREE.Euler} rotation face rotation
 * @private
 */
FORGE.Tile.prototype._setPosition = function(rotation)
{
    var tileSize = this._renderer.tileSize(this._level);
    var tpa = this._renderer.nbTilesPerAxis(this._level);
    
    // Offset is: on the left of half of the cube size, half the tile size on the right (center anchor)
    // Add tilesize number of x,y coordinates
    var offset = 0.5 * tileSize * (1 - tpa);

    // this._position.y = tpa - 1 - this._position.y;

    var vec = this._position.clone().multiplyScalar(tileSize).addScalar(offset);
    vec.z = -0.5 * tpa * tileSize;

    vec.applyEuler(rotation);

    this.position.copy(vec);
};

/**
 * Set rotation of the tile
 * @method FORGE.Tile#_setRotation
 * @private
 */
FORGE.Tile.prototype._getRotation = function()
{
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
 */
FORGE.Tile.prototype._subdivide = function()
{
    if (this._northWest !== null)
    {
        return;
    }

    var level = this._level + 1;

    var x0 = 2 * this._position.x;
    var x1 = 2 * this._position.x + 1;
    var y0 = 2 * this._position.y;
    var y1 = 2 * this._position.y + 1;

    this._northWest = this._renderer.getTile(this, level, this._face, x0, y1);
    this._northEast = this._renderer.getTile(this, level, this._face, x1, y1);
    this._southWest = this._renderer.getTile(this, level, this._face, x0, y0);
    this._southEast = this._renderer.getTile(this, level, this._face, x1, y0);
};

/**
 * Get parent tile
 * @TODO: create a worker to create the tile asyncronously
 * @method FORGE.Tile#_checkParent
 */
FORGE.Tile.prototype._checkParent = function()
{
    if (this._level <= this._renderer.levelMin) {
        return null;
    }

    var position = this._position.clone().divideScalar(2).floor();

    var sequence = Promise.resolve();
    sequence.then(function() {
        this._renderer.getTile(null, this._level - 1, this._face, position.x, position.y);
    }.bind(this));
};

/**
 * Get neighbours tile array
 * @TODO: create a worker to create the tiles asyncronously
 * @method FORGE.Tile#_checkNeighbours
 * @private
 */
FORGE.Tile.prototype._checkNeighbours = function()
{
    var x = this._position.x;
    var y = this._position.y;
    var neighbours = [];

    var getTile = function(x, y)
    {
        this._renderer.getTile(null, this._level, this._face, x, y);
    }.bind(this);

    var sequence = Promise.resolve();
    
    var tpa = this._renderer.nbTilesPerAxis(this._level);

    var xmin = Math.max(0, this._position.x - 1);
    var xmax = Math.min(tpa - 1, this._position.x + 1);

    var ymin = Math.max(0, this._position.y - 1);
    var ymax = Math.min(tpa - 1, this._position.y + 1);
    
    // and do the job for the current face
    for (var y=ymin; y<=ymax; y++)
    {
        for (var x=xmin; x<=xmax; x++)
        {
            if (x === this._position.x && y === this._position.y)
            {
                continue;
            }

            sequence.then(getTile(this._position.x, this._position.y));
        }
    }
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

    this._renderer = null;
};

/**
 * Get QuadTree ID.
 * @name FORGE.Tile#quadTreeID
 * @type {string}
 */
Object.defineProperty(FORGE.Tile.prototype, "quadTreeID",
{
    /** @this {FORGE.Tile} */
    get: function()
    {
        return this._quadTreeID;
    }
});


