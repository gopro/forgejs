/**
 * Picking draw pass
 * 3D object picker based on additional draw passes rendering objects with a single color based on object ID
 * Bottleneck: should be used carefully as it uses gl.readPixels to access render target texture syncing CPU and GPU
 *
 * @constructor FORGE.PickingDrawPass
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.PickingDrawPass = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.PickingDrawPass#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Picking render target reference.
     * @name FORGE.PickingDrawPass#_target
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._target = null;

    /**
     * Picking material reference
     * Should be used to override all objects materials in some scene
     * @name FORGE.PickingDrawPass#_material
     * @type {THREE.Material}
     * @private
     */
    this._material = null;

    /**
     * The last hovered 3d object
     * @name FORGE.PickingDrawPass#_hoveredObject
     * @type {?FORGE.Object3D}
     * @private
     */
    this._hoveredObject = null;

    /**
     * Target scaling factor to reduce texture memory footprint
     * @name FORGE.PickingDrawPass#_scaling
     * @type {number}
     * @private
     */
    this._scaling = 3;

    FORGE.BaseObject.call(this, "PickingDrawPass");

    this._boot();
};

FORGE.PickingDrawPass.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PickingDrawPass.prototype.constructor = FORGE.PickingDrawPass;


/**
 * Boot sequence
 * @method FORGE.PickingDrawPass#_boot
 * @private
 */
FORGE.PickingDrawPass.prototype._boot = function()
{
    // Create picking material reference
    // Replace fragment shader with picking shader only drawing objects with one flat colour
    var shader = FORGE.Utils.clone(this._viewer.renderer.view.current.shaderWTS.map);
    shader.uniforms.tColor = { type: "c", value: new THREE.Color( 0x000000 ) };

    this._material = new THREE.RawShaderMaterial({
        fragmentShader: FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_frag_color),
        vertexShader: FORGE.ShaderLib.parseIncludes(shader.vertexShader),
        uniforms: shader.uniforms,
        side: THREE.FrontSide,
        name: "PickingMaterial"
    });

    // Create picking render target
    // Should be RGBA to allow WebGLRenderer to read pixels
    var rtParams =
    {
        format: THREE.RGBAFormat
    };

    var width = this._viewer.renderer.canvasResolution.width / this._scaling;
    var height = this._viewer.renderer.canvasResolution.height / this._scaling;

    this._target = new THREE.WebGLRenderTarget(width, height, rtParams);
    this._target.name = "Picking RenderTarget";
};

/**
 * Get object by its mesh id
 * @method FORGE.PickingDrawPass#_getObjectByID
 * @param {number} id - The ID of the object to get
 * @return {?FORGE.Object3D}
 * @private
 */
FORGE.PickingDrawPass.prototype._getObjectByID = function(id)
{
    var objects = this._viewer.renderer.objects.all;

    for (var i = 0, ii = objects.length; i < ii; i++)
    {
        if (objects[i].mesh.id === id)
        {
            return objects[i];
        }
    }

    return null;
};

/**
 * Convert object into a color based on its unique identifier
 * @method FORGE.PickingDrawPass#_colorFrom3DObject
 * @return {THREE.Color}
 */
FORGE.PickingDrawPass.colorFrom3DObject = function(object)
{
    return new THREE.Color(object.id);
};

/**
 * Convert color into object ID
 * @method FORGE.PickingDrawPass#_colorTo3DObject
 * @private
 * @return {FORGE.Object3D}
 */
FORGE.PickingDrawPass.prototype._colorTo3DObject = function(color)
{
    var id = ((color.r & 0x0000ff) << 16) | ((color.g & 0x0000ff) << 8) + (color.b & 0x0000ff);
    return this._getObjectByID(id);
};

/**
 * Get object located at a given normalized set of coordinates
 * @method FORGE.PickingDrawPass#getObjectAtXnYn
 * @param {number} xn - x normalized coordinate
 * @param {number} yn - y normalized coordinate
 * @return {FORGE.Object3D}
 * @private
 */
FORGE.PickingDrawPass.prototype._getObjectAtXnYn = function(xn, yn)
{
    var renderer = this._viewer.renderer.webGLRenderer;

    var data = new Uint8Array(4);
    renderer.readRenderTargetPixels(this._target,
                                    xn * this._target.width,
                                    yn * this._target.height,
                                    1, 1, data );

    return this._colorTo3DObject(new THREE.Color(data[0], data[1], data[2]));
};

/**
 * Get object under pointer event
 * @method FORGE.PickingDrawPass#_getObjectUnderPointerEvent
 * @private
 * @return {FORGE.Object3D}
 */
FORGE.PickingDrawPass.prototype._getObjectUnderPointerEvent = function(event)
{
    var e = event.data;
    var position = FORGE.Pointer.getRelativeMousePosition(e);
    var xn = position.x / event.data.target.width;
    var yn = 1 - position.y / event.data.target.height;
    return this._getObjectAtXnYn(xn, yn);
};

/**
 * Pointer click handler
 * @method FORGE.PickingDrawPass#_canvasPointerClickHandler
 * @private
 */
FORGE.PickingDrawPass.prototype._canvasPointerClickHandler = function(event)
{
    var object = this._getObjectUnderPointerEvent(event);

    if (object === null)
    {
        return;
    }

    object.click();
};

/**
 * Pointer move handler
 * @method FORGE.PickingDrawPass#_canvasPointerMoveHandler
 * @private
 */
FORGE.PickingDrawPass.prototype._canvasPointerMoveHandler = function(event)
{
    var object = this._getObjectUnderPointerEvent(event);

    if (object === null)
    {
        if (this._hoveredObject !== null)
        {
            this._hoveredObject.out();
            this._hoveredObject = null;
        }

        return;
    }

    if (object !== this._hoveredObject)
    {
        // Pointer goes from one object to another one directly
        if (this._hoveredObject !== null)
        {
            this._hoveredObject.out();
        }

        // Invoke over method and store new hovered object
        object.over();
        this._hoveredObject = object;
    }
};


/**
 * Start picking
 * @method FORGE.PickingDrawPass#start
 */
FORGE.PickingDrawPass.prototype.start = function()
{
    this._viewer.canvas.pointer.enabled = true;

    if (this._viewer.canvas.pointer.onClick.has(this._canvasPointerClickHandler, this) === false)
    {
        this._viewer.canvas.pointer.onClick.add(this._canvasPointerClickHandler, this);
    }

    if (this._viewer.canvas.pointer.onMove.has(this._canvasPointerMoveHandler, this) === false)
    {
        this._viewer.canvas.pointer.onMove.add(this._canvasPointerMoveHandler, this);
    }
};

/**
 * Stop picking
 * @method FORGE.PickingDrawPass#start
 */
FORGE.PickingDrawPass.prototype.stop = function()
{
    if (this._viewer.canvas.pointer.onClick.has(this._canvasPointerClickHandler, this))
    {
        this._viewer.canvas.pointer.onClick.remove(this._canvasPointerClickHandler, this);
    }

    if (this._viewer.canvas.pointer.onMove.has(this._canvasPointerMoveHandler, this))
    {
        this._viewer.canvas.pointer.onMove.remove(this._canvasPointerMoveHandler, this);
    }
};

/**
 * Triggers the click method of the hovered object if exists.
 * @method FORGE.PickingDrawPass#click
 */
FORGE.PickingDrawPass.prototype.click = function()
{
    if(this._hoveredObject !== null && this._viewer.canvas.pointer.onClick.has(this._canvasPointerClickHandler, this))
    {
        this._hoveredObject.click();
    }
};

/**
 * Set size (resolution)
 * @method FORGE.PickingDrawPass#setSize
 * @param {FORGE.Size} size - size [px]
 */
FORGE.PickingDrawPass.prototype.setSize = function(size)
{
    if (this._target !== null)
    {
        this._target.setSize(size.width, size.height);
    }
};

/**
 * Clear draw pass.
 * Release all references related to the scene
 * @method FORGE.PickingDrawPass#clear
 */
FORGE.PickingDrawPass.prototype.clear = function()
{
    this._hoveredObject = null;
};

/**
 * Destroy routine
 * @method FORGE.PickingDrawPass#destroy
 */
FORGE.PickingDrawPass.prototype.destroy = function()
{
    if (this._material !== null)
    {
        this._material.dispose();
        this._material = null;
    }

    if (this._target !== null)
    {
        this._target.dispose();
        this._target = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get material.
 * @name FORGE.PickingDrawPass#material
 * @type {THREE.RawShaderMaterial}
 */
Object.defineProperty(FORGE.PickingDrawPass.prototype, "material",
{
    /** @this {FORGE.PickingDrawPass} */
    get: function()
    {
        return this._material;
    }
});

/**
 * Get render target.
 * @name FORGE.PickingDrawPass#renderTarget
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.PickingDrawPass.prototype, "renderTarget",
{
    /** @this {FORGE.PickingDrawPass} */
    get: function()
    {
        return this._target;
    }
});
