/**
 * FORGE.BackgroundMeshRenderer
 * BackgroundMeshRenderer class.
 *
 * @constructor FORGE.BackgroundMeshRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.SceneRenderer} sceneRenderer - {@link FORGE.SceneRenderer} reference.
 * @param {string=} className - The class name of the object as long as many other object inherits from this one.
 * @extends {FORGE.BackgroundRenderer}
 */
FORGE.BackgroundMeshRenderer = function(viewer, sceneRenderer, className)
{
    /**
     * The mesh (cube) the video is on.
     * @name FORGE.BackgroundMeshRenderer#_mesh
     * @type {THREE.Mesh}
     * @private
     */
    this._mesh = null;

    /**
     * The size of the mesh.
     * @name FORGE.BackgroundMeshRenderer#_size
     * @type {number}
     * @private
     */
    this._size = 2 * FORGE.Renderer.DEPTH_FAR;

    /**
     * The number of subdivision of a face, per direction. For example, if the
     * subdivision is 4, the cube would be composed of 4 * 4 quads per face (in
     * reality it is 4 * 4 * 2 triangles).
     * @name FORGE.BackgroundMeshRenderer#_subdivision
     * @type {number}
     * @private
     */
    this._subdivision = 8;

    FORGE.BackgroundRenderer.call(this, viewer, sceneRenderer, className || "BackgroundMeshRenderer");
};

FORGE.BackgroundMeshRenderer.prototype = Object.create(FORGE.BackgroundRenderer.prototype);
FORGE.BackgroundMeshRenderer.prototype.constructor = FORGE.BackgroundMeshRenderer;

/**
 * Default texture name
 * @type {string}
 */
FORGE.BackgroundMeshRenderer.DEFAULT_TEXTURE_NAME = "Default Texture";

/**
 * Boot routine.
 * @method FORGE.BackgroundMeshRenderer#_boot
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._boot = function()
{
    FORGE.BackgroundRenderer.prototype._boot.call(this);

    this._sceneRenderer.view.onChange.add(this._onViewChanged, this);

    // Only this class will call boot complete.
    // The child classes will call this at the end of their own boot function
    if(this.className === "BackgroundMeshRenderer")
    {
        this._bootComplete();
    }
};

/**
 * Boot complete routine.
 * @method FORGE.BackgroundMeshRenderer#_bootComplete
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._bootComplete = function()
{
    this._createMesh();
    this._onMeshCreated();
    this._onTextureCreated();
};


/**
 * Placeholder function to be implemented by subclass specific needs
 * It will be called if it exists, once the mesh is created
 * @method FORGE.BackgroundMeshRenderer#_onMeshCreated
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._onMeshCreated = function()
{

};

/**
 * It will be called if it exists, once the mesh is created
 * @method FORGE.BackgroundMeshRenderer#_onTextureCreated
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._onTextureCreated = function()
{

};

/**
 * Event handler called when the view has changed
 * Refresh the mesh material with new shaders
 * @method FORGE.BackgroundMeshRenderer#_onViewChanged
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._onViewChanged = function()
{
    if (this._mesh.material instanceof THREE.Material)
    {
        this._mesh.material.dispose();
    }

    this._mesh.material = this._createMaterial();
};

/**
 * Create geometry
 * @method FORGE.BackgroundMeshRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._createGeometry = function()
{
    throw new Error( "Abstract method, should be implemented by subclass" );
}

/**
 * Create material
 * @method FORGE.BackgroundMeshRenderer#_createMaterial
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._createMaterial = function()
{
    var shader = FORGE.Utils.clone(this._sceneRenderer.view.current.shaderWTS).mapping;
    this.log("Media " + this._media.type + ", use mapping shader");

    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    var material = new THREE.RawShaderMaterial(
    {
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        name: "BackgroundMeshMaterial",
        transparent: false,
        side: THREE.BackSide
    });

    material.needsUpdate = true;

    return material;
};


/**
 * Create mesh
 * @method FORGE.BackgroundMeshRenderer#_createMesh
 * @private
 */
FORGE.BackgroundMeshRenderer.prototype._createMesh = function()
{
    // Start with clearing existing mesh
    if (this._mesh !== null)
    {
        this._scene.remove(this._mesh);
        FORGE.Utils.destroyMesh(this._mesh);
    }

    var geometry = this._createGeometry();
    var material = this._createMaterial();

    this._mesh = new THREE.Mesh(geometry, material);

    this._scene.add(this._mesh);
};

/**
 * Render routine.
 * @param {THREE.WebGLRenderer} webGLRenderer THREE WebGL renderer
 * @param {THREE.WebGLRenderTarget} target WebGL render target
 * @method FORGE.BackgroundMeshRenderer#render
 */
FORGE.BackgroundMeshRenderer.prototype.render = function(webGLRenderer, target)
{

    // Update common shader material parameters
    var uniforms = this._mesh.material.uniforms;

    if ("tViewport" in uniforms)
    {
        uniforms.tViewport.value = this._getViewport().asVector;
    }

    if ("tViewportRatio" in uniforms)
    {
        uniforms.tViewportRatio.value = this._getViewport().size.ratio;
    }

    if ("tModelViewMatrixInverse" in uniforms)
    {
        uniforms.tModelViewMatrixInverse.value = this._sceneRenderer.camera.modelViewInverse;
    }

    this._sceneRenderer.view.current.updateUniforms(uniforms);

    FORGE.BackgroundRenderer.prototype.render.call(this, webGLRenderer, target);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundMeshRenderer#destroy
 */
FORGE.BackgroundMeshRenderer.prototype.destroy = function()
{
    this._sceneRenderer.view.onChange.remove(this._onViewChanged, this);

    // Remove and dispose all meshes from the scene
    if (this._mesh !== null)
    {
        this._scene.remove(this._mesh);
        FORGE.Utils.destroyMesh(this._mesh);
        this._mesh = null;
    }

    FORGE.BackgroundRenderer.prototype.destroy.call(this);
};
