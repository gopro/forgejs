/**
 * FORGE.BackgroundMeshRenderer
 * BackgroundMeshRenderer class.
 *
 * @constructor FORGE.BackgroundMeshRenderer
 * @extends {FORGE.BackgroundRenderer}
 *
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {THREE.WebGLRenderTarget} target - render target
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
     * Media type
     * @type {string}
     * @private
     */
    this._mediaType = options.type || FORGE.MediaType.GRID;

    /**
     * Media vertical fov (radians)
     * @type {number}
     * @private
     */
    this._mediaVFov = options.verticalFov || 90;

    /**
     * Grid color
     * @type {string}
     * @private
     */
    this._gridColor = options.color || "#000000";

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

    FORGE.BackgroundRenderer.call(this, viewer, target, options, "BackgroundMeshRenderer");
};

FORGE.BackgroundMeshRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundMeshRenderer.prototype.constructor = FORGE.BackgroundMeshRenderer;

/**
 * Default texture name
 * @type {string}
 */
FORGE.BackgroundMeshRenderer.DEFAULT_TEXTURE_NAME = "Default Texture";

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

    this._updateInternals();
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
    
    if (typeof this._mesh.material.uniforms.tTextureRatio !== "undefined")
    {
        this._mesh.material.uniforms.tTextureRatio.value = this._texture.image.width / this._texture.image.height;
    }

    if (this._mediaFormat === FORGE.MediaFormat.FLAT)
    {
        // Enable mipmaps for flat rendering to avoid aliasing
        this._texture.generateMipmaps = true;
        this._texture.minFilter = THREE.LinearMipMapLinearFilter;
        
        // Replace geometry with a rectangle matching texture ratio
        // First release previous default geometry
        if (this._mesh.geometry != null)
        {
            this._mesh.geometry.dispose();
            this._mesh.geometry = null;
        }

        // Compute camera fov limits depending on geometry size and position and on display object size
        var canvasHeight = this._viewer.container.height;
        var canvasWidth = this._viewer.container.width;
        var canvasRatio = canvasWidth / canvasHeight;

        var texHeight = displayObject.height;
        var texRatio = displayObject.width / displayObject.height;

        var geomWidth = this._size;
        var geomHeight = Math.round(geomWidth / texRatio);
        var geomDepth = geomHeight / (2 * Math.tan(0.5 * this._mediaVFov));

        var geometry = new THREE.PlaneBufferGeometry(geomWidth, geomHeight);
        this._mesh.geometry = geometry;
        this._mesh.position.set(0, 0, -geomDepth);

        var fovMax = FORGE.Math.radToDeg(2 * Math.atan(0.5 * geomHeight / geomDepth));
        var fovMin = FORGE.Math.radToDeg(2 * Math.atan((0.5 * geomHeight / geomDepth) * (canvasHeight / texHeight)));

        this.log("Flat rendering boundaries [" + fovMin.toFixed() + ", " + fovMax.toFixed() + "]");
    }
    else
    {
        this._texture.generateMipmaps = false;
        this._texture.minFilter = THREE.LinearFilter;
    }

    this._texture.needsUpdate = true;

    this._mesh.material.wireframe = false;

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
    var it = FORGE.Utils.arrayKeys(uvMap);

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
 * Add quadrilateral coordinates as geometry attribute
 * Used to draw wireframe
 * @method FORGE.BackgroundMeshRenderer#_addQuadrilateralCoordsAttribute
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._addQuadrilateralCoordsAttribute = function()
{
    if (this._mesh === null || typeof this._mesh.geometry === "undefined")
    {
        return;
    }

    // Quadrilateral is a 2 components system, reduce vertices array size from 3:2
    var size = this._mesh.geometry.attributes.position.array.length * 2 / 3;
    var quadri = new Int8Array(size);
    var it = FORGE.Utils.arrayKeys(quadri);

    var qa = new THREE.Vector2(1, 1);
    var qb = new THREE.Vector2(1, -1);
    var qc = new THREE.Vector2(-1, 1);
    var qd = new THREE.Vector2(-1, -1);

    var ipd = this._subdivision + 1; // indices per dimension
    for (var f = 0; f < 6; f++)
    {
        for (var r=0; r < ipd; r++)
        {
            var q0, q1;

            if (r & 1)
            {
                q0 = qa;
                q1 = qb;
            }
            else
            {
                q0 = qc;
                q1 = qd;
            }

            for (var c=0; c < ipd; c++)
            {
                if (c & 1)
                {
                    quadri[it.next().value] = q1.x;
                    quadri[it.next().value] = q1.y;
                }
                else
                {
                    quadri[it.next().value] = q0.x;
                    quadri[it.next().value] = q0.y;
                }
            }
        }
    }
            
    this._mesh.geometry.addAttribute("quadrilateralCoords", new THREE.BufferAttribute(quadri, 2));
};

/**
 * Update internals
 * @method FORGE.BackgroundMeshRenderer#_updateInternals
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._updateInternals = function()
{
    if (this._viewer.renderer.view === null)
    {
        this.log("Background renderer cannot update internals without a defined view");
        return;
    }

    var shader;
    if (this._mediaType === FORGE.MediaType.GRID)
    {
        shader = FORGE.Utils.clone(this._viewer.renderer.view.shaderWTS).wireframe;
        this.log("Media " + this._mediaType + ", use wireframe shader");
        this._subdivision = 8;
    }
    else
    {
        shader = FORGE.Utils.clone(this._viewer.renderer.view.shaderWTS).mapping;
        this.log("Media " + this._mediaType + ", use mapping shader");
    }

    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    var material = new THREE.RawShaderMaterial(
    {
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        name: "BackgroundMeshMaterial",
        transparent: true,
        side: THREE.BackSide
    });
    var geometry = null;

    if (this._texture !== null)
    {
        material.uniforms.tTexture.value = this._texture;
        material.uniforms.tTextureRatio.value = this._texture.image.width / this._texture.image.height;
    }

    if (this._mediaType === FORGE.MediaType.GRID)
    {
        material.uniforms.tColor.value = new THREE.Color(this._gridColor);
        material.blending = THREE.CustomBlending;
        material.blendEquationAlpha = THREE.AddEquation;
        material.blendSrcAlpha = THREE.SrcAlphaFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    }

    if (this._scene.children.length === 0)
    {
        if (this._mediaFormat === FORGE.MediaFormat.EQUIRECTANGULAR)
        {
            // Sphere mapping of equirectangular texture becomes acceptable with subdivision greater or equal to 64
            this._subdivision = 64;
            geometry = new THREE.SphereBufferGeometry(this._size, this._subdivision, this._subdivision);
            this.log("Create sphere geometry");
        }
        else if (this._mediaFormat === FORGE.MediaFormat.FLAT)
        {
            geometry = new THREE.PlaneBufferGeometry(this._size, this._size);
            this.log("Create plane geometry");
        }
        else
        {
            geometry = new THREE.BoxBufferGeometry(this._size, this._size, this._size, this._subdivision, this._subdivision, this._subdivision);
            this.log("Create box geometry");
        }

        this._mesh = new THREE.Mesh(geometry, material);

        if (this._mediaType === FORGE.MediaType.GRID)
        {
            this._addQuadrilateralCoordsAttribute();
        }
        
        if (this._mediaFormat === FORGE.MediaFormat.FLAT)
        {
            this._mesh.position.set(0, 0, -this._size * 0.5);
            this._mesh.material.side = THREE.FrontSide;
        }

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

    if (this._mesh !== null)
    {
        this.log ("Destroy mesh (dispose geometry and material)");
        if (this._mesh.geometry !== null)
        {
            this._mesh.geometry.dispose();
            this._mesh.geometry = null;
        }

        if (this._mesh.material !== null)
        {
            this._mesh.material.dispose();
            this._mesh.material = null;
        }

        this._mesh = null;
    }

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

