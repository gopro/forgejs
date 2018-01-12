/**
 * FORGE.BackgroundCubeRenderer
 * BackgroundCubeRenderer class.
 *
 * @constructor FORGE.BackgroundCubeRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneViewport} viewport - {@link FORGE.SceneViewport} reference.
 * @extends {FORGE.BackgroundTextureRenderer}
 */
FORGE.BackgroundCubeRenderer = function(viewer, viewport)
{
    /**
     * The layout of the faces in the texture. There are six faces to specify:
     * Right (R), Left (L), Up (U), Down (D), Front (F), Back (B). The default
     * layout is the Facebook one, with RLUDFB.
     * @name FORGE.BackgroundCubeRenderer#_order
     * @type {string}
     * @private
     */
    this._order = "RLUDFB";

    /**
     * The size of a tile (width = height)
     * @name FORGE.BackgroundCubeRenderer#_tile
     * @type {number}
     * @private
     */
    this._tile = 512;

    /**
     * The number of horizontal faces and vertical ones in the media.
     * @name FORGE.BackgroundCubeRenderer#_faces
     * @type {THREE.Vector2}
     * @private
     */
    this._faces = new THREE.Vector2(0, 0);

    FORGE.BackgroundTextureRenderer.call(this, viewer, viewport, "BackgroundCubeRenderer");
};

FORGE.BackgroundCubeRenderer.prototype = Object.create(FORGE.BackgroundTextureRenderer.prototype);
FORGE.BackgroundCubeRenderer.prototype.constructor = FORGE.BackgroundCubeRenderer;

/**
 * Boot routine.
 * @method FORGE.BackgroundCubeRenderer#_boot
 * @private
 */
FORGE.BackgroundCubeRenderer.prototype._boot = function()
{
    FORGE.BackgroundTextureRenderer.prototype._boot.call(this);

    this._subdivision = 32;

    if(this._media.source !== null)
    {
        if (typeof this._media.source.order !== "undefined")
        {
            this._order = this._media.source.order;
        }

        if (typeof this._media.source.tile !== "undefined")
        {
            this._tile = this._media.source.tile;
        }
    }

    this._bootComplete();
};

/**
 * Return an array containing each coord for the uv mapping of the cube geometry
 * @method FORGE.BackgroundCubeRenderer#_computeUVMap
 * @return {Float32Array} The array containing the UVs
 * @private
 */
FORGE.BackgroundCubeRenderer.prototype._computeUVMap = function()
{
    // the final array of uv coord for mapping
    var uvMap = new Float32Array((this._subdivision + 1) * (this._subdivision + 1) * 6 * 2);

    // iterator accross the uv coord
    var it = FORGE.Utils.arrayKeys(uvMap);

    // layout of the texture
    var layout = this._order.split("");

    // the width/height of a division in uv coord
    // the 1.01 is the default value for expand_coef in the ffmpeg filter
    // see https://github.com/facebook/transform/blob/04ec220a5c066a75d87f9e463b219262f7527421/vf_transform.c#L961
    var u = (1 / 1.01) * ((1 / this._faces.x) / this._subdivision);
    var v = (1 / 1.01) * ((1 / this._faces.y) / this._subdivision);

    // tiny offsets are for compensating the expand_coef of the ffmpeg filter
    // u tiny offset
    var uto = 0.005 * (1 / this._faces.x);
    // v tiny offset
    var vto = 0.005 * (1 / this._faces.y);

    /**
     * Apply the correct UV to the uv map
     * @param  {number} idx
     * @param  {number} x
     * @param  {number} y
     * @param  {number} sub
     * @param  {boolean=} upOrDown
     */
    function applyUVMapForFace(idx, x, y, sub, upOrDown)
    {
        if (idx === -1)
        {
            throw "Unknown face for cube mapping.";
        }

        // iterator
        var i, j, ii, jj;

        // u offset, where is it in the layout, change for each face
        var uo = (idx % x) / x;
        // v offset, where is it in the layout, change for each face
        var vo = 1 - ((1 + parseInt(idx / x, 10)) / y);

        // not the same inversion if up or down
        if (upOrDown)
        {
            // vertical
            for (i = 0, ii = sub; i <= ii; i++)
            {
                // horizontal
                for (j = 0, jj = sub; j <= jj; j++)
                {
                    // u
                    uvMap[it.next().value] = uto + u * j + uo;
                    // v
                    uvMap[it.next().value] = vto + v * i + vo;
                }
            }
        }
        else
        {
            // vertical
            for (i = 0, ii = sub; i <= ii; ii--)
            {
                // horizontal
                for (j = 0, jj = sub; j <= jj; jj--)
                {
                    // u
                    uvMap[it.next().value] = uto + u * jj + uo;
                    // v
                    uvMap[it.next().value] = vto + v * ii + vo;
                }
            }
        }
    }

    applyUVMapForFace(layout.indexOf("R"), this._faces.x, this._faces.y, this._subdivision);
    applyUVMapForFace(layout.indexOf("L"), this._faces.x, this._faces.y, this._subdivision);
    applyUVMapForFace(layout.indexOf("U"), this._faces.x, this._faces.y, this._subdivision, true);
    applyUVMapForFace(layout.indexOf("D"), this._faces.x, this._faces.y, this._subdivision, true);
    applyUVMapForFace(layout.indexOf("B"), this._faces.x, this._faces.y, this._subdivision);
    applyUVMapForFace(layout.indexOf("F"), this._faces.x, this._faces.y, this._subdivision);

    return uvMap;
};

/**
 * It will be called if it exists, once the mesh is created
 * @method FORGE.BackgroundCubeRenderer#_onTextureCreated
 * @private
 */
FORGE.BackgroundCubeRenderer.prototype._onTextureCreated = function()
{
    if (this._texture.image !== null)
    {
        this._faces.x = this._texture.image.width / this._tile;
        this._faces.y = this._texture.image.height / this._tile;
    }

    this._mesh.geometry.attributes.uv.set(this._computeUVMap());

    FORGE.BackgroundTextureRenderer.prototype._onTextureCreated.call(this);
};

/**
 * Create geometry
 * @method FORGE.BackgroundCubeRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundCubeRenderer.prototype._createGeometry = function()
{
    return new THREE.BoxBufferGeometry(this._size, this._size, this._size, this._subdivision, this._subdivision, this._subdivision);
};

