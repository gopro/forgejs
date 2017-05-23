/**
 * Tile class.
 *
 * @constructor FORGE.Tile
 * @param {FORGE.BackgroundPyramidRenderer} renderer - renderer reference
 * @extends {THREE.Mesh}
 */
FORGE.Tile = function(renderer, x, y, level, face)
{
    this._renderer = renderer;

    this._parent = null;

    this._children = null;

    this._position = new THREE.Vector3(x, y, 0);

    this._level = level;

    this._face = face.toLowerCase();

    this._rotation = null;

    this._createTS = new Date();

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

FORGE.Tile.Material = null;

FORGE.Tile.prototype._material = function()
{
    if (FORGE.Tile.Material !== null)
    {
        return FORGE.Tile.Material;
    }

    var material = new THREE.MeshBasicMaterial({color:0xffffff * Math.random(), side:THREE.FrontSide});
    FORGE.Tile.Material = material;
    return FORGE.Tile.Material;
};


/**
 * Boot sequence
 * @method FORGE.Tile#_boot
 * @private
 */
FORGE.Tile.prototype._boot = function()
{
    this.name = "tile_level_" + this._level + "_" + FORGE.Tile.FACES[this._face] + "_" + this._position.x + "_" + this._position.y;

    this.onBeforeRender = this._onBeforeRender.bind(this);
    this.onAfterRender = this._onAfterRender.bind(this);

    this.addEventListener( 'removed', function (event) {
        var tile = event.target;
        // console.log(tile.name + " : " + event.type);
    });

    var tileSize = this._renderer.tileSize(this._level);
    this.geometry = this._geometry();

    var rotation = this._getRotation();
    this.rotation.copy(rotation);
    this._setPosition(rotation);
};

/**
 * On before render callback
 * @method FORGE.Tile#_onBeforeRender
 * @private
 */
FORGE.Tile.prototype._onBeforeRender = function()
{
    if (this.material === null)
    {
        var tpa = this._renderer.nbTilesPerAxis(this._level);
        var grad = 1 - ((this._position.y * tpa + this._position.x) / Math.max(0, (tpa * tpa - 1)));
        var color = new THREE.Color().setHSL(1, 0, grad);

        var material = new THREE.MeshBasicMaterial({color:color, side:THREE.FrontSide});

        // var vshader = FORGE.ShaderChunk.wts_vert_rectilinear;
        // var fshader = FORGE.ShaderChunk.wts_frag_color;

        // var vertexShader = FORGE.ShaderLib.parseIncludes(vshader);
        // var fragmentShader = FORGE.ShaderLib.parseIncludes(fshader);

        // var material = new THREE.RawShaderMaterial(
        // {
        //     fragmentShader: fragmentShader,
        //     vertexShader: vertexShader,
        //     uniforms:
        //     {
        //         tOpacity: { type: "f", value: 1.0 },
        //         tColor: { type: "c", value: null },
        //         tModelViewMatrixInverse: { type: "m4", value: null }
        //     },
        //     name: "BackgroundPyramidMaterial",
        //     transparent: true,
        //     side: THREE.DoubleSide
        // });

        // material.uniforms.tColor.value = color;

        this.material = material;

        // this.material = new THREE.MeshBasicMaterial({color:Math.random() * 0xffffff, side:THREE.DoubleSide});
    }
};

/**
 * On after render callback
 * @method FORGE.Tile#_onAfterRender
 * @private
 */
FORGE.Tile.prototype._onAfterRender = function()
{
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

    var vec = this._position.clone().multiplyScalar(tileSize).addScalar(offset);
    vec.z = -0.5 * tpa * tileSize;

    vec.applyEuler(rotation);

    this.position.copy(vec);

    // console.log("Tile size: " + tileSize + ", position: " + this.position.x + " " + this.position.y);
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
            return new THREE.Euler(0, -Math.PI / 2, 0);
        break;
        case "r":
            return new THREE.Euler(0, Math.PI / 2, 0);
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
 * Get parent tile
 * @method FORGE.Tile#getParent
 * @private
 * @return {FORGE.Tile} parent tile or null if there is no parent
 */
FORGE.Tile.prototype.getParent = function()
{
    if (this._level <= this._renderer.levelMin) {
        return null;
    }

    var position = this._position.divideScalar(2).floor();

    return this._renderer.getTile(this._level - 1, this._face, position.x, position.y);
};

/**
 * Get children tile array
 * @method FORGE.Tile#getChildren
 * @private
 * @return {Array<FORGE.Tile>} children tiles array
 */
FORGE.Tile.prototype.getChildren = function()
{
    if (this._level >= this._renderer.levelMax - 1) {
        return null;
    }

    var level = this._level + 1;

    var x0 = 2 * this._position.x;
    var x1 = 2 * this._position.x + 1;
    var y0 = 2 * this._position.y;
    var y1 = 2 * this._position.y + 1;

    return [
        this._renderer.getTile(level, this._face, x0, y0),
        this._renderer.getTile(level, this._face, x1, y0),
        this._renderer.getTile(level, this._face, x1, y1),
        this._renderer.getTile(level, this._face, x0, y1)
    ];
};

/**
 * Get neighbours tile array
 * @method FORGE.Tile#getNeighbours
 * @private
 * @return {Array<FORGE.Tile>} neighbours tiles array
 */
FORGE.Tile.prototype.getNeighbours = function()
{
    var x = this._position.x;
    var y = this._position.y;
    var neighbours = [];

    var tpa = this._renderer.nbTilesPerAxis(this._level);
    
    for (var y=Math.max(0, this._position.y-1); y<=Math.min(tpa-1, this._position.y+1); y++)
    {
        for (var x=Math.max(0, this._position.x-1); x<=Math.min(tpa-1, this._position.x+1); x++)
        {
            if (x === this._position.x && y === this._position.y)
            {
                continue;
            }
            neighbours.push(this._renderer.getTile(this._level, this._face, x, y));
        }
    }

    return neighbours;
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

    this._parent = null;

    this._children = null;

    this._position = null;

    this._renderer = null;
};
