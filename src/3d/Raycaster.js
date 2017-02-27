/**
 * Raycaster for mouse interaction with 3d objects of the scene
 * @constructor FORGE.Raycaster
 * @param {FORGE.Viewer} viewer - Viewer reference
 * @extends {FORGE.BaseObject}
 */
FORGE.Raycaster = function(viewer)
{
    /**
     * Viewer reference
     * @name FORGE.Raycaster#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * THREE raycaster instance.
     * @name FORGE.Raycaster#_raycaster
     * @type {THREE.Raycaster}
     * @private
     */
    this._raycaster = null;

    /**
     * The last hovered 3d object
     * @name FORGE.Raycaster#_hoveredObject
     * @type {?FORGE.Object3D}
     * @private
     */
    this._hoveredObject = null;

    FORGE.BaseObject.call(this, "Raycaster");

    this._boot();
};

FORGE.Raycaster.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Raycaster.prototype.constructor = FORGE.Raycaster;

/**
 * Boot sequence
 * @method FORGE.Raycaster#_boot
 * @private
 */
FORGE.Raycaster.prototype._boot = function()
{
    // this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);
};

/**
 * Start raycasting.
 * Add event on the main canvas for mouse interaction
 * @method FORGE.Raycaster#_start
 * @param {string} mode - picking mode
 */
FORGE.Raycaster.prototype.start = function(mode)
{
    this.log("Raycaster start");

    if (this._raycaster === null)
    {
        this._raycaster = new THREE.Raycaster();
    }

    if (mode === FORGE.PickingManager.modes.POINTER)
    {
        this._startPointer();
    }
    else if (mode === FORGE.PickingManager.modes.GAZE)
    {
        this._startGaze();
    }
};

/**
 * Add the listeners for the pointer mode.
 * @method FORGE.Raycaster#_startPointer
 * @private
 */
FORGE.Raycaster.prototype._startPointer = function()
{
    this.log("Raycating start pointer");

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
 * Add the listeners for the gaze mode.
 * @method FORGE.Raycaster#_startGaze
 * @private
 */
FORGE.Raycaster.prototype._startGaze = function()
{
    this.log("Raycating start gaze");

    if (this._viewer.renderer.camera.onCameraChange.has(this._cameraChangeHandler, this) === false)
    {
        this._viewer.renderer.camera.onCameraChange.add(this._cameraChangeHandler, this);
    }
};

/**
 * Stop raycasting, removes all event listeners
 * @method FORGE.Raycaster#_stop
 */
FORGE.Raycaster.prototype.stop = function()
{
    this.log("Raycaster stop");

    // Remove pointer event listeners
    if (this._viewer.canvas.pointer.onClick.has(this._canvasPointerClickHandler, this))
    {
        this._viewer.canvas.pointer.onClick.remove(this._canvasPointerClickHandler, this);
    }

    if (this._viewer.canvas.pointer.onMove.has(this._canvasPointerMoveHandler, this))
    {
        this._viewer.canvas.pointer.onMove.remove(this._canvasPointerMoveHandler, this);
    }

    //Remove gaze handlers
    if (this._viewer.renderer.camera.onCameraChange.has(this._cameraChangeHandler, this))
    {
        this._viewer.renderer.camera.onCameraChange.remove(this._cameraChangeHandler, this);
    }

    this._out();

    this._raycaster = null;
};


/**
 * Pointer click handler, launch raycasting
 * @method FORGE.Raycaster#_canvasPointerClickHandler
 * @param {Object} event click event
 * @private
 */
FORGE.Raycaster.prototype._canvasPointerClickHandler = function(event)
{
    event.data.center = event.data.center ||
    {
        x: event.data.clientX,
        y: event.data.clientY
    };
    this._raycast("click", event.data.center);
};

/**
 * Pointer over handler, launch raycasting
 * @method FORGE.Raycaster#_canvasPointerMoveHandler
 * @param {Object} event move event
 * @private
 */
FORGE.Raycaster.prototype._canvasPointerMoveHandler = function(event)
{
    event.data.center = event.data.center ||
    {
        x: event.data.clientX,
        y: event.data.clientY
    };
    this._raycast("move", event.data.center);
};

/**
 * Camera change handler, launch raycasting
 * @method FORGE.Raycaster#_cameraChangeHandler
 * @private
 */
FORGE.Raycaster.prototype._cameraChangeHandler = function()
{
    this._raycast("move");
};

/**
 * Raycasting internal method
 * @method FORGE.Raycaster#_raycast
 * @param {string} event - triggering event
 * @param {Object=} screenPoint - raycasting point in screen coordinates, if no screen point defined, it will raycast in the center of the view.
 * @private
 */
FORGE.Raycaster.prototype._raycast = function(event, screenPoint)
{
    var resolution = this._viewer.renderer.canvasResolution;

    screenPoint = screenPoint ||
    {
        x: resolution.width / 2,
        y: resolution.height / 2
    };

    var camera = this._viewer.renderer.camera;
    var ndc = new THREE.Vector2(screenPoint.x / resolution.width, 1.0 - screenPoint.y / resolution.height).multiplyScalar(2).addScalar(-1);

    // Get all objects of the object renderer that are ready and interactive
    var objects = this._viewer.renderer.objects.getRaycastable();

    //Reset the hovered flag of all the objects
    this._setHovered(objects, false);

    // Get the first intersected object
    var intersected = this._intersect(objects, ndc, camera);

    if (intersected !== null)
    {
        if (event === "click")
        {
            this.click();
        }
        else if (event === "move")
        {

            if (intersected !== this._hoveredObject)
            {
                this._out();

                this._hoveredObject = intersected;
                intersected.over();

                if (this._viewer.renderer.pickingManager.mode === FORGE.PickingManager.modes.GAZE)
                {
                    this._viewer.renderer.camera.gaze.start();
                }
            }
        }
    }
    else
    {
        this._out();
    }
};

/**
 * The out routine. Stops the timer, trigger the out method the hovered object and nullify its reference.
 * @method FORGE.Raycaster#_out
 * @private
 */
FORGE.Raycaster.prototype._out = function()
{
    if (this._hoveredObject !== null)
    {
        this._hoveredObject.out();
        this._hoveredObject = null;

        if (this._viewer.renderer.pickingManager.mode === FORGE.PickingManager.modes.GAZE)
        {
            this._viewer.renderer.camera.gaze.stop();
        }
    }
};

/**
 * Set the hovered flag to an array ok {@link FORGE.Object3D}
 * @method FORGE.Raycaster#_setHovered
 * @param {Array<FORGE.Object3D>} objects - The array of 3d objects who'll be affected
 * @param {boolean} hovered - The hovered flag you want to set to all the 3d objects of the array
 * @private
 */
FORGE.Raycaster.prototype._setHovered = function(objects, hovered)
{
    for (var i = 0, ii = objects.length; i < ii; i++)
    {
        objects[i].hovered = hovered;
    }
};

/**
 * Intrsect 3d objects from a ndc point and a camera
 * @param  {Array<FORGE.Object3D>} objects - Array of object to test
 * @param  {THREE.Vector2} ndc - Normalized device coordinate point
 * @param  {FORGE.Camera} camera - Camera to use
 * @return {?FORGE.Object3D} Return the first hitted 3d Object
 * @private
 */
FORGE.Raycaster.prototype._intersect = function(objects, ndc, camera)
{
    var result = null;

    // Set the three raycaster with the ndc coordinates and the camera.
    this._raycaster.setFromCamera(ndc, camera.main);

    // Make an array of meshes for the three raycaster
    var meshes = [];
    for (var i = 0, ii = objects.length; i < ii; i++)
    {
        meshes.push(objects[i].mesh);
    }

    // Get all objects intersected by the ray
    var intersects = this._raycaster.intersectObjects(meshes);

    while (result === null && intersects.length > 0)
    {
        var intersect = intersects.shift();
        var mesh = intersect.object;
        var uv = intersect.uv;
        var object = this._viewer.renderer.objects.getByMesh(mesh);

        if (mesh.material.transparent === false)
        {
            result = object;
        }
        else
        {
            var color = this._getObjectColorFromUVCoords(object, uv);

            // If color is null we consider that we are hitting the object but its texture is not ready
            if (color === null || (color != null && color.alpha > 10))
            {
                result = object;
            }
        }
    }

    return result;
};

/**
 * Get RGBA color at a given point on a texture
 * @method FORGE.Raycaster#_getObjectColorFromUVCoords
 * @param {THREE.Vector2} uv point with normalized coordinates
 * @return {FORGE.ColorRGBA} RGBA color at given point or null if image is not available
 * @private
 */
FORGE.Raycaster.prototype._getObjectColorFromUVCoords = function(object, uv)
{
    var color = null;

    if (object.mesh !== null && object.mesh.material !== null && typeof object.mesh.material.uniforms.tTexture !== "undefined")
    {
        var texture = object.mesh.material.uniforms.tTexture.value;
        var canvas = null;

        if (texture !== null && texture.image !== null)
        {
            if (texture.image.nodeName.toLowerCase() === "img")
            {
                canvas = document.createElement("canvas");
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                canvas.getContext("2d").drawImage(texture.image, 0, 0);
            }
            else if (texture.image.nodeName.toLowerCase() === "canvas")
            {
                canvas = texture.image;
            }

            if (canvas !== null)
            {
                var w = canvas.width;
                var h = canvas.height;
                var x = Math.floor(uv.x * w);
                var y = Math.floor(h - uv.y * h);
                var idx = 4 * (y * w + x);

                var data = canvas.getContext("2d").getImageData(0, 0, w, h).data;
                color = new FORGE.ColorRGBA(data[idx + 0], data[idx + 1], data[idx + 2], data[idx + 3]);
            }
        }
    }
    else if (typeof object.mesh.material.color !== "undefined")
    {
        color = object.mesh.material.color;
    }

    return color;
};
/**
 * Triggers the click method of the hovered object if exists.
 * @method FORGE.Raycaster#click
 */
FORGE.Raycaster.prototype.click = function()
{
    if (this._hoveredObject !== null)
    {
        this._hoveredObject.click();
    }
};

/**
 * Clear raycaster.
 * Release all references related to the scene
 * @method FORGE.Raycaster#clear
 */
FORGE.Raycaster.prototype.clear = function()
{
    this._hoveredObject = null;
};

/**
 * Get the hovered object
 * @name FORGE.Raycaster#hoveredObject
 * @type {FORGE.Object3D}
 * @readonly
 */
Object.defineProperty(FORGE.Raycaster.prototype, "hoveredObject",
{
    /** @this {FORGE.Raycaster} */
    get: function()
    {
        return this._hoveredObject;
    }
});