/**
 * FORGE.BackgroundGridRenderer
 * BackgroundGridRenderer class.
 *
 * @constructor FORGE.BackgroundGridRenderer
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.Viewport} viewport - {@link FORGE.Viewport} reference.
 * @extends {FORGE.BackgroundMeshRenderer}
 */
FORGE.BackgroundGridRenderer = function(viewer, viewport)
{
    /**
     * Grid color
     * @name FORGE.BackgroundGridRenderer#_gridColor
     * @type {string}
     * @private
     */
    this._gridColor = "#7F7FFF";

    FORGE.BackgroundMeshRenderer.call(this, viewer, viewport, "BackgroundGridRenderer");
};

FORGE.BackgroundGridRenderer.prototype = Object.create(FORGE.BackgroundMeshRenderer.prototype);
FORGE.BackgroundGridRenderer.prototype.constructor = FORGE.BackgroundGridRenderer;

/**
 * Boot routine.
 * @method FORGE.BackgroundGridRenderer#_boot
 * @private
 */
FORGE.BackgroundGridRenderer.prototype._boot = function()
{
    FORGE.BackgroundMeshRenderer.prototype._boot.call(this);

    this._subdivision = 32;

    if(this._media.options !== null)
    {
        if(typeof this._media.options.color !== "undefined")
        {
            this._gridColor = this._media.options.color;
        }
    }

    this._bootComplete();
};

/**
 * Compute quadrilateral coordinates as geometry attribute
 * Used to draw the wireframe in fragment shader
 * @method FORGE.BackgroundGridRenderer#_computeQuadrilateralCoordsAttribute
 * @return {new THREE.BufferAttribute} buffer attribute with quadrilateral coordinates
 * @private
 */
FORGE.BackgroundGridRenderer.prototype._computeQuadrilateralCoordsAttribute = function()
{
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

    return new THREE.BufferAttribute(quadri, 2);
};

/**
 * Add quadrilateral coordinates to vertices once the mesh is created
 * @method FORGE.BackgroundGridRenderer#_onMeshCreated
 * @private
 */
FORGE.BackgroundGridRenderer.prototype._onMeshCreated = function()
{
    var quadCoordsAttr = this._computeQuadrilateralCoordsAttribute();
    this._mesh.geometry.addAttribute("quadrilateralCoords", quadCoordsAttr);

    FORGE.BackgroundMeshRenderer.prototype._onMeshCreated.call(this);
};

/**
 * Create geometry
 * @method FORGE.BackgroundGridRenderer#_createGeometry
 * @private
 */
FORGE.BackgroundGridRenderer.prototype._createGeometry = function()
{
   return new THREE.BoxBufferGeometry(this._size, this._size, this._size, this._subdivision, this._subdivision, this._subdivision);
};

/**
 * Create material for fragment shader rendering
 * @method FORGE.BackgroundGridRenderer#_createMaterial
 * @private
 */
FORGE.BackgroundGridRenderer.prototype._createMaterial = function()
{
    var shader = FORGE.Utils.clone(this._viewport.view.current.shaderWTS).wireframe;
    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    var material = new THREE.RawShaderMaterial(
    {
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        name: "BackgroundMeshMaterial",
        depthTest: false,
        depthWrite: false,
        transparent: true,
        side: THREE.BackSide
    });

    material.uniforms.tBackgroundColor.value = new THREE.Color(this._viewport.background);
    material.uniforms.tColor.value = new THREE.Color(this._gridColor);

    material.blending = THREE.CustomBlending;
    material.blendEquationAlpha = THREE.AddEquation;
    material.blendSrcAlpha = THREE.SrcAlphaFactor;
    material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

    material.needsUpdate = true;

    return material;
};

