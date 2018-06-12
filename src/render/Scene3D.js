/**
 * Addional scene to be rendered class.
 *
 * @constructor FORGE.Scene3D
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {Scene3DConfig} config - scene configuration.
 * @param {string=} className - Class name for objects that extends Object3D
 * @extends {FORGE.BaseObject}
 */
FORGE.Scene3D = function(viewer, config, className)
{
    /**
     * The viewer reference.
     * @name FORGE.Scene3D#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Scene configuration.
     * @name FORGE.Scene3D#_config
     * @type {Scene3DConfig}
     * @private
     */
    this._config = typeof config !== "undefined" ? config : {};

    /**
     * Interactive flag
     * Default value: false
     * @name FORGE.Scene3D#_interactive
     * @type {boolean}
     * @private
     */
    this._interactive = true;

    /**
     * Render flag
     * Default value: true
     * @name FORGE.Scene3D#_render
     * @type {boolean}
     * @private
     */
    this._render = true;

    /**
     * 3D scene
     * @name FORGE.Scene3D#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * Reference on render target to draw the HUD
     * @name FORGE.Scene3D#renderTargetRef
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTargetRef = null;

    /**
     * Reference on camera to draw the HUD
     * @name FORGE.Scene3D#_cameraRef
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._cameraRef = null;

    /**
     * Raycaster.
     * @name FORGE.Scene3D#_raycaster
     * @type {THREE.Matrix4}
     * @private
     */
    this._raycaster = null;

    /**
     * Object hovered by raycast.
     * @name FORGE.Scene3D#_hovered
     * @type {THREE.Object3D}
     * @private
     */
    this._hovered = null;

    /**
     * Camera gaze reference.
     * @name FORGE.Scene3D#_gaze
     * @type {FORGE.CameraGaze}
     * @private
     */
    this._gaze = null;

    FORGE.BaseObject.call(this, className || "Scene3D");

    this._boot();
};

FORGE.Scene3D.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Scene3D.prototype.constructor = FORGE.Scene3D;

/**
 * Parse configuration
 * @method FORGE.Scene3D#_parseConfig
 * @param {Scene3DConfig} config - scene configuration
 * @private
 */
FORGE.Scene3D.prototype._parseConfig = function(config)
{
    this._interactive = typeof config.interactive === "boolean" ? config.interactive : false;
    this._render = typeof config.enabled === "boolean" ? config.enabled : true;
};

/**
 * Boot routine
 * @method FORGE.Scene3D#_boot
 * @private
 */
FORGE.Scene3D.prototype._boot = function()
{
    this._register();

    this._parseConfig(this._config);

    this._scene = new THREE.Scene();
    this._scene.frustumCulled = false;
    this._scene.name = "Scene3D-" + this.id;
    this._scene.onBeforeRender = this._sceneBeforeRender.bind(this);
    this._scene.onAfterRender = this._sceneAfterRender.bind(this);

    this._viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);

    if (this._interactive)
    {
        this._addHandlers();
    }
};

/**
 * Add event handlers for interactivity
 * @method FORGE.Scene3D#_addHandlers
 * @private
 */
FORGE.Scene3D.prototype._addHandlers = function()
{
    if (this._viewer.canvas.pointer.onMove.has(this._moveHandler, this) === false)
    {
        this._viewer.canvas.pointer.onMove.add(this._moveHandler, this);
    }

    if (this._viewer.canvas.pointer.onTap.has(this._tapHandler, this) === false)
    {
        this._viewer.canvas.pointer.onTap.add(this._tapHandler, this);
    }

    if (this._raycaster === null)
    {
        this._raycaster = new THREE.Raycaster();
    }
};

/**
 * Remove event handlers for interactivity
 * @method FORGE.Scene3D#_removeHandlers
 * @private
 */
FORGE.Scene3D.prototype._removeHandlers = function()
{
    this._viewer.canvas.pointer.onMove.remove(this._moveHandler, this);
    this._viewer.canvas.pointer.onTap.remove(this._tapHandler, this);
};

/**
 * Tap event handler
 * @method FORGE.Scene3D#_tapHandler
 * @param {FORGE.Event} event - tap event
 * @private
 */
FORGE.Scene3D.prototype._tapHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);
    var xn = 2 * screenPosition.x / this._viewer.canvas.pixelWidth - 1;
    var yn = 2 * screenPosition.y / this._viewer.canvas.pixelHeight - 1;
    this._raycast(new THREE.Vector2(xn, -yn), "click");
};

/**
 * Move event handler
 * @method FORGE.Scene3D#_moveHandler
 * @param {FORGE.Event} event - move event
 * @private
 */
FORGE.Scene3D.prototype._moveHandler = function(event)
{
    var screenPosition = FORGE.Pointer.getRelativeMousePosition(event.data);
    var xn = 2 * screenPosition.x / this._viewer.canvas.pixelWidth - 1;
    var yn = 2 * screenPosition.y / this._viewer.canvas.pixelHeight - 1;
    this._raycast(new THREE.Vector2(xn, -yn), "over");
};

/**
 * Scene before render callback
 * @method FORGE.Scene3D#_sceneBeforeRender
 * @private
 */
FORGE.Scene3D.prototype._sceneBeforeRender = function(renderer, scene, camera)
{
    // VR needs a constant raycast for interactive scenes
    if (this._interactive && this._viewer.vr)
    {
        this._raycast(new THREE.Vector2(0, 0), "over", null, camera);
    }
};

/**
 * Scene after render callback
 * @method FORGE.Scene3D#_sceneAfterRender
 * @private
 */
FORGE.Scene3D.prototype._sceneAfterRender = function(renderer, scene, camera)
{
    renderer.vr.enabled = false;
};

/**
 * Scene load complete event handler
 * @method FORGE.Scene3D#_sceneLoadCompleteHandler
 * @param {FORGE.Event} event - scene load complete event
 * @private
 */
FORGE.Scene3D.prototype._sceneLoadCompleteHandler = function(event)
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.add(this._sceneUnloadStartHandler, this);

    var sceneRenderer = this._viewer.renderer.scenes.get(sceneUid);

    this._renderTargetRef = sceneRenderer.target;
    this._cameraRef = this._viewer.camera.main;
    this._gaze = this._viewer.camera.gaze;
};

/**
 * Scene unload event handler
 * @method FORGE.Scene3D#_sceneUnloadStartHandler
 * @private
 */
FORGE.Scene3D.prototype._sceneUnloadStartHandler = function()
{
    var sceneUid = event.data.sceneUid;

    this._viewer.story.scene.onUnloadStart.remove(this._sceneUnloadStartHandler, this);

    this._renderTargetRef = null;
    this._cameraRef = null;
    this._gaze = null;
};

/**
 * Raycast routine
 * @method FORGE.Scene3D#_raycast
 * @param {THREE.Vector2} position - raycast screen position (coords in -1 .. +1)
 * @param {string} action - requested action (click, move)
 * @param {Array<THREE.Object3D>} objects - objects with possible ray intersection (scene children if undefined)
 * @param {THREE.Camera} camera - camera
 */
FORGE.Scene3D.prototype._raycast = function(position, action, objects, camera)
{
    objects = Array.isArray(objects) ? objects : this._scene.children;
    camera = camera instanceof THREE.Camera ? camera : this._cameraRef;

    if (camera === null || objects.length === 0)
    {
        return;
    }

    // Compute the ray
    // In VR, we compute the ray by extracting the rotation from one camera
    if (this._viewer.vr === true && camera.isArrayCamera)
    {
        var origin = new THREE.Vector3();

        var direction = new THREE.Vector3(0, 0, -1);
        var position = new THREE.Vector3();
        var scale = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();

        camera.cameras[0].matrixWorld.decompose( position, quaternion, scale );
        direction.applyQuaternion( quaternion );

        this._raycaster.set(origin, direction);
    }
    else
    {
        this._raycaster.setFromCamera(position, camera);
    }

    // Get intersect objects
    var intersects = this._raycaster.intersectObjects(objects, true);

    // Current state: one hotspot is hovered or not (this._hovered of type FORGE.Hotspot3D)

    // Ray intersects objects or not
    // If not, trigger out event for hovered if any and erase reference
    // Else consider first object and get the hotspot
    // If object is not a hotspot or is not interactive, return
    // Else compare the hotspot with the hovered reference
    // If same, trigger click but not over
    // If different, trigger action for the new one and store hovered reference

    // In VR, gaze starts when a new object is hovered and stops when hovered
    // reference changes

    if (intersects.length === 0)
    {
        if (this._hovered !== null)
        {
            this._hovered.out();
            this._hovered = null;

            if (this._viewer.vr === true)
            {
                this._gaze.stop();
            }
        }
    }
    else
    {
        var object = intersects[0].object;
        var hotspot = FORGE.UID.get(intersects[0].object.userData.hotspotUID, "FORGE.Hotspot3D");
        if (hotspot === undefined || Array.isArray(hotspot) || hotspot.interactive === false)
        {
            if (this._viewer.vr === true)
            {
                this._gaze.stop();
            }

            if (this._hovered !== null)
            {
                this._hovered.out();
                this._hovered = null;
            }

            return;
        }

        if (hotspot === this._hovered)
        {
            if (action === "click")
            {
                hotspot.click();
            }
        }
        else
        {
            if (this._hovered !== null)
            {
                this._hovered.out();
            }

            hotspot[action]();
            this._hovered = hotspot;

            if (this._viewer.vr === true)
            {
                this._gaze.start(this);
            }
        }
    }
};

FORGE.Scene3D.prototype.click = function()
{
    if (this._hovered !== null && typeof this._hovered.click === "function")
    {
        this._hovered.click();
    }
};

/**
 * Clear the scene
 * @method FORGE.Scene3D#clear
 */
FORGE.Scene3D.prototype.clear = function()
{
    this._scene.children = [];
};

/**
 * Add a new object to the scene
 * @method FORGE.Scene3D#add
 * @param {THREE.Object3D} object - 3D object
 */
FORGE.Scene3D.prototype.add = function(object)
{
    if (arguments.length > 1)
    {
        for (var i=0; i<arguments.length; i++)
        {
            this.add(arguments[i]);
        }

        return
    }

    var mesh = object;
    if (object instanceof FORGE.Object3D)
    {
        mesh = object.mesh;
    }

    this._scene.add(mesh);
};

/**
 * Render routine
 * @method FORGE.Scene3D#render
 */
FORGE.Scene3D.prototype.render = function()
{
    if (this._render === false || this._cameraRef === null)
    {
        return;
    }

    this._viewer.renderer.webGLRenderer.vr.enabled = this._viewer.vr;
    this._viewer.renderer.webGLRenderer.render(this._scene, this._cameraRef, this._renderTargetRef);
};

/**
 * Destroy routine
 * @method FORGE.Scene3D#destroy
 * @private
 */
FORGE.Scene3D.prototype.destroy = function()
{
    this._viewer.story.onSceneLoadComplete.remove(this._sceneLoadCompleteHandler, this);

    this._removeHandlers();

    while (this._scene.children.length > 0)
    {
        var mesh = this._scene.children.pop();
        FORGE.Utils.destroyMesh(mesh);
    }

    this._raycaster = null;
    this._hovered = null;

    this._renderTargetRef = null;
    this._cameraRef = null;
    this._scene = null;

    this._viewer = null;
};

/**
 * Get the scene
 * @name FORGE.Scene3D#scene
 * @type {THREE.Scene}
 * @readonly
 */
Object.defineProperty(FORGE.Scene3D.prototype, "scene",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._scene;
    }
});

/**
 * Get the children
 * @name FORGE.Scene3D#children
 * @type {Array<THREE.Mesh>}
 * @readonly
 */
Object.defineProperty(FORGE.Scene3D.prototype, "children",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._scene.children;
    }
});

/**
 * Interactive flag
 * @name FORGE.Scene3D#interactive
 * @type {boolean}
 */
Object.defineProperty(FORGE.Scene3D.prototype, "interactive",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._interactive;
    },

    /** @this {FORGE.Scene3D} */
    set: function(value)
    {
        this._interactive = value;

        if (value === true)
        {
            this._addHandlers();
        }
        else
        {
            this._removeHandlers();
        }
    }
});

/**
 * Enabled flag
 * @name FORGE.Scene3D#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.Scene3D.prototype, "enabled",
{
    /** @this {FORGE.Scene3D} */
    get: function()
    {
        return this._render;
    },

    /** @this {FORGE.Scene3D} */
    set: function(value)
    {
        this._render = value;
    }
});

