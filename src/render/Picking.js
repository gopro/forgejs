/**
 * FORGE.Picking
 * Picking class.
 *
 * Picking object is owned by an object renderer. It draws the object renderer's scene
 * with its children objects with an overriding picking material into a local picking
 * texture (target). ObjectRenderer is responsible of the calling picking render
 * method and should avoid calling it when no objects are pickable and only for active
 * viewport.
 *
 * For performance matters, picking target is downscaled from a factor defined as
 * a class member.
 *
 * A picking material is a simple ShaderMaterial with color and texture uniforms used to
 * assign each object a single color computed from its mesh id. Texture is used to take
 * alpha into account.
 *
 * The picking instance listens to pointer events (click/over) and fetchs the point
 * matching the event coordinates from the picking texture. Picking is then able to
 * get an object id from the color. Object renderer owning the picking is asked for
 * the object once the id is computed.
 *
 * Objects events supported: click, over, out.
 *
 * @constructor FORGE.Picking
 *
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {FORGE.ObjectRenderer} objectRenderer - {@link FORGE.ObjectRenderer} reference
 * @extends {FORGE.BaseObject}
 */
FORGE.Picking = function(viewer, objectRenderer)
{
    /**
     * Viewer reference
     * @name FORGE.Picking#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Object renderer reference
     * @name FORGE.Picking#_objectRenderer
     * @type {FORGE.ObjectRenderer}
     * @private
     */
    this._objectRenderer = objectRenderer;

    /**
     * Hovered object (null if none)
     * @name FORGE.Picking#_hovered
     * @type {FORGE.Object3D}
     * @private
     */
    this._hovered = null;

    /**
     * Picking render target
     * @name FORGE.Picking#_renderTarget
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTarget = null;

    /**
     * Render target down scale factor
     * @name FORGE.Picking#_targetDownScale
     * @type {number}
     * @private
     */
    this._targetDownScale = 0;

    /**
     * Render target minimum height when scaling
     * @name FORGE.Picking#_targetMinHeight
     * @type {number}
     * @private
     */
    this._targetMinHeight = 0;

    FORGE.BaseObject.call(this, "Picking");

    this._boot();
};

FORGE.Picking.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Picking.prototype.constructor = FORGE.Picking;

/**
 * Create a color with unique identifier of an object3D
 * @method FORGE.Picking#colorFromUID
 * @static
 * @return {THREE.Color}
 */
FORGE.Picking.colorFromObjectID = function(id)
{
    return new THREE.Color(id);
};

/**
 * Retrieve object id from color
 * @method FORGE.Picking#_colorTo3DObjectUID
 * @private
 * @static
 * @return {FORGE.Object3D} object id matching the color
 */
FORGE.Picking.colorTo3DObjectID = function(color)
{
    return ((color.r & 0x0000ff) << 16) | ((color.g & 0x0000ff) << 8) + (color.b & 0x0000ff);
};

/**
 * Boot sequence.
 * @method FORGE.Picking#_boot
 * @private
 */
FORGE.Picking.prototype._boot = function()
{
    // Create selection texture with initial size set to one
    // Size will depend on the viewport at render time and will be set accordingly
    this._renderTarget = new THREE.WebGLRenderTarget(1, 1);
    this._renderTarget.name = "Picking RenderTarget";

    // Setup some default values for perfomance/accuracy tradeoff
    // Increase downscale factor and decrease min height will lower picking accuracy
    // but increase performances
    this._targetDownScale = 5;
    this._targetMinHeight = 64;

    this._addHandlers();
};

/**
 * Add interaction handler
 * @method FORGE.Picking#_addHandlers
 * @private
 */
FORGE.Picking.prototype._addHandlers = function(event)
{
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
 * Remove interaction handler
 * @method FORGE.Picking#_removeHandlers
 * @private
 */
FORGE.Picking.prototype._removeHandlers = function(event)
{
    this._viewer.canvas.pointer.onClick.remove(this._canvasPointerClickHandler, this);
    this._viewer.canvas.pointer.onMove.remove(this._canvasPointerMoveHandler, this);
};

/**
 * Pointer click handler, launch raycasting
 * @method FORGE.Picking#_canvasPointerClickHandler
 * @param {Object} event click event
 * @private
 */
FORGE.Picking.prototype._canvasPointerClickHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);

    var viewport = this._viewer.renderer.activeViewport;
    var viewportPosition = viewport.viewportManager.getRelativeMousePosition(screenPosition);
    var viewportSize = viewport.rectangle.size;

    var object = this._getObjectAtNormalizedPosition(viewportPosition.divide(viewportSize.vector2));
    if (typeof object === "undefined" || !object.interactive)
    {
        return;
    }

    if (typeof object.click === "function")
    {
        object.click();
    }
};

/**
 * Pointer over handler, launch raycasting
 * @method FORGE.Picking#_canvasPointerMoveHandler
 * @param {Object} event move event
 * @private
 */
FORGE.Picking.prototype._canvasPointerMoveHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);

    var viewport = this._viewer.renderer.activeViewport;
    var viewportPosition = viewport.viewportManager.getRelativeMousePosition(screenPosition);
    var viewportSize = viewport.rectangle.size;

    var object = this._getObjectAtNormalizedPosition(viewportPosition.divide(viewportSize.vector2));
    if (typeof object === "undefined" || !object.interactive)
    {
        // Case: one object was hovered and no object is hovered now
        if (this._hovered !== null)
        {
            if (typeof this._hovered.out === "function")
            {
                this._hovered.out();
                this._hovered = null;
            }
        }

        return;
    }

    // Test if hovered object is still the same, if it has changed, call previous out function
    if (this._hovered !== null && this._hovered !== object)
    {
        if (typeof this._hovered.out === "function")
        {
            this._hovered.out();
        }
    }

    this._hovered = object;

    if (typeof this._hovered.over === "function")
    {
        this._hovered.over();
    }
};

/**
 * Get object located at a given normalized set of coordinates
 * @method FORGE.Picking#getObjectAtXnYn
 * @param {THREE.Vector2} posn - normalized position
 * @return {FORGE.Object3D}
 * @private
 */
FORGE.Picking.prototype._getObjectAtNormalizedPosition = function(posn)
{
    var renderer = this._viewer.renderer.webGLRenderer;

    var data = new Uint8Array(4);
    renderer.readRenderTargetPixels(this._renderTarget,
                                    posn.x * this._renderTarget.width,
                                    (1 -  posn.y) * this._renderTarget.height,
                                    1,
                                    1,
                                    data );

    var id = FORGE.Picking.colorTo3DObjectID(new THREE.Color(data[0], data[1], data[2]));
    return this._objectRenderer.getPickableObjectWithId(id);
};

/**
 * Dump picking texture to the scene target
 * @method FORGE.Picking#render
 * @param {THREE.WebGLRenderTarget} target - draw target
 */
FORGE.Picking.prototype._dumpTexture = function(target)
{
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    var geometry = new THREE.PlaneBufferGeometry(1, 1);
    var material = new THREE.MeshBasicMaterial({color:new THREE.Color(0xffffff), map: this._renderTarget});
    var quad = new THREE.Mesh(geometry, material);
    var scene = new THREE.Scene();
    scene.add(quad);

    this._viewer.renderer.webGLRenderer.render(scene, camera, target, false);
};

/**
 * Render routine
 * @method FORGE.Picking#render
 * @param {FORGE.Viewport} viewport - current rendering viewport
 */
FORGE.Picking.prototype.render = function(viewport)
{
    var view = viewport.view.current;
    var camera = viewport.camera.main;
    var scene = this._objectRenderer.scene;

    var h = Math.max(this._targetMinHeight, viewport.rectangle.height / this._targetDownScale);
    var w = h * viewport.rectangle.ratio;

    // SetSize won't do anything if size does not change, otherwise it will
    // dispose the internal WebGL texture object and next render will recreate it
    // with the new size stored
    this._renderTarget.setSize(w, h);

    var objectMaterial = this._viewer.renderer.materials.get(view.type, FORGE.ObjectMaterialType.PICK);
    scene.overrideMaterial = objectMaterial.shaderMaterial;

    view.updateUniforms(scene.overrideMaterial.uniforms);

    this._viewer.renderer.webGLRenderer.clearTarget(this._renderTarget, true, true, false);
    this._viewer.renderer.webGLRenderer.render(scene, camera, this._renderTarget, false);

    // Restore scene params
    scene.overrideMaterial = null;

    // this._dumpTexture(viewport.scene.renderTarget);
};

/**
 * Destroy sequence.
 * @method FORGE.Picking#destroy
 */
FORGE.Picking.prototype.destroy = function()
{
    this._renderTarget.dispose();
    this._renderTarget = null;

    this._removeHandlers();

    this._hovered = null;
    this._objectRenderer = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
