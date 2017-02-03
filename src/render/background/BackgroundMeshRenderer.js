/**
 * FORGE.BackgroundMeshRenderer
 * BackgroundMeshRenderer class.
 *
 * @constructor FORGE.BackgroundMeshRenderer
 * @extends {FORGE.BackgroundRenderer}
 *
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {SceneMediaOptionsConfig} options - the options for the cubemap
 */
FORGE.BackgroundMeshRenderer = function(viewer, target, options)
{
    /**
     * Display object (image, canvas or video)
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._displayObject = null;

    /**
     * Texture used for video rendering
     * @type {THREE.Texture}
     * @private
     */
    this._texture = null;

    /**
     * Texture canvas used for video rendering
     * @type {Element|HTMLCanvasElement}
     * @private
     */
    this._textureCanvas = null;

    /**
     * Texture context associated with texture canvas
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._textureContext = null;

    /**
     * The layout of the faces in the texture. There are six faces to specify:
     * Right (R), Left (L), Up (U), Down (D), Front (F), Back (B). The default
     * layout is the Facebook one, with RLUDFB.
     * @type {string}
     * @private
     */
    this._layout = options.order || "RLUDFB";

    /**
     * The number of horizontal faces and vertical ones in the media.
     * @type {THREE.Vector2}
     * @private
     */
    this._faces = new THREE.Vector2(0, 0);

    /**
     * The size of a tile (width = height)
     * @type {number}
     * @private
     */
    this._tile = options.tile || 512;

    /**
     * Media format (cubemap, equi...)
     * @type {string}
     * @private
     */
    this._mediaFormat = options.mediaFormat || FORGE.MediaFormat.CUBE;

    /**
     * The size of the cube.
     * @type {number}
     * @private
     */
    this._size = 0;

    /**
     * The number of subdivision of a face, per direction. For example, if the
     * subdivision is 4, the cube would be composed of 4 * 4 quads per face (in
     * reality it is 4 * 4 * 2 triangles).
     * @type {number}
     * @private
     */
    this._subdivision = 0;

    /**
     * When source is a video, a reduction factor can be set to improve perf by lowering quality
     * @type {number}
     * @private
     */
    this._videoReductionFactor = 1;

    FORGE.BackgroundRenderer.call(this, viewer, target, "BackgroundMeshRenderer");
};

FORGE.BackgroundMeshRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundMeshRenderer.prototype.constructor = FORGE.BackgroundMeshRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundMeshRenderer#_boot
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    // Set perspective camera
    this._camera = this._viewer.renderer.camera.main;
    this._viewer.renderer.camera.fovMin = this._viewer.renderer.view.fovMin;
    this._viewer.renderer.camera.fovMax = this._viewer.renderer.view.fovMax;

    this._size = 2 * FORGE.RenderManager.DEPTH_FAR;

    this._subdivision = 32;

    // Finalize now
    this.updateAfterViewChange();
};

/**
 * Set display object.
 * @method FORGE.BackgroundMeshRenderer#_setDisplayObject
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._setDisplayObject = function(displayObject)
{
    this._displayObject = displayObject;

    if (FORGE.Utils.isTypeOf(displayObject, "Image"))
    {
        this._texture = new THREE.Texture();
        this._texture.image = displayObject.element;
    }
    else if (FORGE.Utils.isTypeOf(displayObject, "Canvas"))
    {
        this._texture = new THREE.Texture();
        this._texture.image = displayObject.element;
    }
    else if (FORGE.Utils.isTypeOf(displayObject, ["VideoHTML5", "VideoDash"]))
    {
        // Evil hack from Hell
        // Reduce texture size for big videos on safari
        if (FORGE.Device.browser.toLowerCase() === "safari" && displayObject.originalHeight > 1440)
        {
            this._videoReductionFactor = 2;
        }

        this._textureCanvas = document.createElement("canvas");
        this._textureCanvas.width = displayObject.originalWidth / this._videoReductionFactor;
        this._textureCanvas.height = displayObject.originalHeight / this._videoReductionFactor;
        this._textureContext = this._textureCanvas.getContext("2d");
        this._texture = new THREE.Texture(this._textureCanvas);
    }
    else
    {
        throw "Wrong type of display object " + displayObject.type;
    }

    this._texture.format = THREE.RGBAFormat;
    this._texture.mapping = THREE.Texture.DEFAULT_MAPPING;
    this._texture.magFilter = THREE.LinearFilter;
    this._texture.minFilter = THREE.LinearFilter;
    this._texture.wrapS = THREE.ClampToEdgeWrapping;
    this._texture.wrapT = THREE.ClampToEdgeWrapping;
    this._texture.generateMipmaps = false;

    this._texture.needsUpdate = true;

    if (this._texture.image !== null)
    {
        this._faces.x = this._texture.image.width / this._tile;
        this._faces.y = this._texture.image.height / this._tile;
    }

    this._mesh.onBeforeRender = this._onBeforeRender.bind(this);

    var uvMap = this._setUVMapping();
    if (uvMap !== null)
    {
        this._mesh.geometry.attributes.uv.set(uvMap);
    }
};

/**
 * Before render handler
 * @method FORGE.BackgroundMeshRenderer#_onBeforeRender
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._onBeforeRender = function()
{
    if (typeof this._mesh.material.uniforms === "undefined")
    {
        return;
    }

    if (this._mesh.material.uniforms.hasOwnProperty("tTexture"))
    {
        this._mesh.material.uniforms.tTexture.value = this._texture;
    }

    if (this._mesh.material.uniforms.hasOwnProperty("tOpacity"))
    {
        this._mesh.material.uniforms.tOpacity.value = 1.0;
    }
};

/**
 * Return an array containing each coord for the uv mapping of the cube geometry
 * @method FORGE.BackgroundMeshRenderer#_setUVMappingCube
 * @return {Float32Array} The array containing the UVs
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._setUVMappingCube = function()
{
    // the final array of uv coord for mapping
    var uvMap = new Float32Array((this._subdivision + 1) * (this._subdivision + 1) * 6 * 2);

    // iterator accross the uv coord
    var it = uvMap.keys();

    // layout of the texture
    var layout = this._layout.split("");

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
 * Return an array containing each coord for the uv mapping of the sphere geometry
 * @method FORGE.BackgroundMeshRenderer#_setUVMappingSphere
 * @return {Float32Array} The array containing the UVs
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._setUVMappingSphere = function()
{
    // the final array of uv coord for mapping
    var uvMap = new Float32Array(this._mesh.geometry.attributes.uv.array.byteLength / 4);

    // iterator accross the uv coord
    var it = uvMap.keys();

    var div = this._subdivision;
    var d = 1 / div;

    var ix, iy;

    for (iy = 0; iy <= div; iy++)
    {
        var v = iy * d;

        for (ix = 0; ix <= div; ix++)
        {
            var u = ix * d;
            uvMap[it.next().value] = 1 - u;
            uvMap[it.next().value] = 1 - v;
        }
    }

    return uvMap;
};

/**
 * Return an array containing each coord for the uv mapping
 * @method FORGE.BackgroundMeshRenderer#_setUVMapping
 * @return {Float32Array} The array containing the UVs
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._setUVMapping = function()
{
    // BoxGeometry uv are not ok, compute them in our own way
    if (this._mesh.geometry instanceof THREE.BoxBufferGeometry)
    {
        return this._setUVMappingCube();
    }

    // Sphere uv are facing backward
    if (this._mesh.geometry instanceof THREE.SphereBufferGeometry)
    {
        return this._setUVMappingSphere();
    }

    return null;
};

/**
 * Clear background.
 * @method FORGE.BackgroundMeshRenderer#_clear
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._clear = function()
{
    // Draw to clear screen, then clear display object / texture
    this._viewer.renderer.webGLRenderer.clearColor();
};

/**
 * Update internals
 * @method FORGE.BackgroundMeshRenderer#_updateInternals
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._updateInternals = function()
{
    var shader = FORGE.Utils.clone(this._viewer.renderer.view.shaderWTS).mapping;
    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    var material = new THREE.RawShaderMaterial(
    {
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        name: "BackgroundMeshMaterial",
        // wireframe: false,
        side: THREE.BackSide
    });
    var geometry = null;

    if (this._texture !== null)
    {
        material.uniforms.tTexture.value = this._texture;
    }

    if (this._scene.children.length === 0)
    {
        if (this._mediaFormat === FORGE.MediaFormat.EQUIRECTANGULAR)
        {
            // Sphere mapping of equirectangular texture becomes acceptable with subdivision greater or equal to 64 
            this._subdivision = 64;
            geometry = new THREE.SphereBufferGeometry(this._size, this._subdivision, this._subdivision);
        }
        else
        {
            geometry = new THREE.BoxBufferGeometry(this._size, this._size, this._size, this._subdivision, this._subdivision, this._subdivision);
        }

        this._mesh = new THREE.Mesh(geometry, material);

        // Equirectangular mapping on a sphere needs a yaw shift of PI/2 to set front at center of the texture
        if (this._mediaFormat === FORGE.MediaFormat.EQUIRECTANGULAR)
        {
            this._mesh.rotation.set(0, Math.PI / 2, 0, "YXZ");
        }

        this._scene.add(this._mesh);
    }
    else
    {
        this._mesh = /** @type {THREE.Mesh} */ (this._scene.children[0]);
        this._mesh.material.dispose();
    }

    this._mesh.material = material;
    material.needsUpdate = true;
};

/**
 * Update after view change
 * @method FORGE.BackgroundMeshRenderer#updateAfterViewChange
 */
FORGE.BackgroundMeshRenderer.prototype.updateAfterViewChange = function()
{
    this._updateInternals();
};

/**
 * Render routine.
 * Do preliminary job of specific background renderer, then summon superclass method
 * @method FORGE.BackgroundMeshRenderer#render
 * @param {THREE.PerspectiveCamera} camera - perspective camera
 */
FORGE.BackgroundMeshRenderer.prototype.render = function(camera)
{
    if (this._viewer.renderer === null)
    {
        return;
    }

    FORGE.BackgroundRenderer.prototype.render.call(this, camera);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundMeshRenderer#destroy
 */
FORGE.BackgroundMeshRenderer.prototype.destroy = function()
{
    this._clear();

    this._displayObject = null;
    this._textureCanvas = null;
    this._textureContext = null;

    if (this._texture !== null)
    {
        this._texture.dispose();
        this._texture = null;
    }

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};

/**
 * Get background renderer texture.
 * @name FORGE.BackgroundMeshRenderer#texture
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundMeshRenderer.prototype, "texture",
{
    /** @this {FORGE.BackgroundMeshRenderer} */
    get: function()
    {
        return this._texture;
    }
});