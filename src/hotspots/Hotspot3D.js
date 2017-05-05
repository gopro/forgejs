/**
 * FORGE.Hotspot3D
 * Abstract base class for projeted views. Should be subclassed for every supported projection / view type.
 *
 * @constructor FORGE.Hotspot3D
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {HotspotConfig} config - hostspot configuration
 * @extends {FORGE.Object3D}
 *
 * @todo Review/refactor all the raycasting and click part
 */
FORGE.Hotspot3D = function(viewer, config)
{
    /**
     * Hotspot configuration
     * @name  FORGE.Hotspot3D#_config
     * @type {HotspotConfig}
     * @private
     */
    this._config = config;

    /**
     * Name
     * @name  FORGE.Hotspot3D#_name
     * @type {string}
     * @private
     */
    this._name = "";

    /**
     * HotspotTransform object for the 3D object.
     * @name  FORGE.Hotspot3D#_transform
     * @type {FORGE.HotspotTransform}
     * @private
     */
    this._transform = null;

    /**
     * Material object for the 3D object.
     * @name  FORGE.Hotspot3D#_material
     * @type {FORGE.HotspotMaterial}
     * @private
     */
    this._material = null;

    /**
     * Sound object for the 3D object.
     * @name  FORGE.Hotspot3D#_sound
     * @type {FORGE.HotspotSound}
     * @private
     */
    this._sound = null;

    /**
     * Animation object for the 3D object.
     * @name FORGE.Hotspot3D#_animation
     * @type {FORGE.HotspotAnimation}
     * @private
     */
    this._animation = null;

    /**
     * Hotspots states manager
     * @name FORGE.Hotspot3D#_states
     * @type {FORGE.HotspotStates}
     * @private
     */
    this._states = null;

    /**
     * Does the hotspot is facing the camera ? Useful for a flat hotspot we want
     * to always be facing to the camera.
     * @name FORGE.Hotspot3D#_facingCenter
     * @type {boolean}
     * @private
     */
    this._facingCenter = false;

    /**
     * The pointer cursor when pointer is over the Object3D
     * @name FORGE.Hotspot3D#_cursor
     * @type {string}
     * @private
     */
    this._cursor = "pointer";

    /**
     * Before render bound callback.
     * @name FORGE.Hotspot3D#_onBeforeRenderBound
     * @type {?function(this:THREE.Object3D,?THREE.WebGLRenderer,?THREE.Scene,?THREE.Camera,?THREE.Geometry,?THREE.Material,?THREE.Group)}
     * @private
     */
    this._onBeforeRenderBound = null;

    /**
     * After render bound callback.
     * @name FORGE.Hotspot3D#_onAfterRenderBound
     * @type {?function(this:THREE.Object3D,?THREE.WebGLRenderer,?THREE.Scene,?THREE.Camera,?THREE.Geometry,?THREE.Material,?THREE.Group)}
     * @private
     */
    this._onAfterRenderBound = null;

    FORGE.Object3D.call(this, viewer, "Hotspot3D");
};

FORGE.Hotspot3D.prototype = Object.create(FORGE.Object3D.prototype);
FORGE.Hotspot3D.prototype.constructor = FORGE.Hotspot3D;

/**
 * Boot sequence.<br>
 * Call superclass boot when objects are created as it will trigger parse config
 * @private
 */
FORGE.Hotspot3D.prototype._boot = function()
{
    FORGE.Object3D.prototype._boot.call(this);

    this._transform = new FORGE.HotspotTransform();
    this._transform.onChange.add(this._onTransformChangeHandler, this);

    this._animation = new FORGE.HotspotAnimation(this._viewer, this._transform);

    this._onBeforeRenderBound = this._onBeforeRender.bind(this);
    this._onAfterRenderBound = this._onAfterRender.bind(this);

    this._mesh.visible = false;
    this._mesh.onBeforeRender = /** @type {function(this:THREE.Object3D,?THREE.WebGLRenderer,?THREE.Scene,?THREE.Camera,?THREE.Geometry,?THREE.Material,?THREE.Group)} */ (this._onBeforeRenderBound);
    this._mesh.onAfterRender = /** @type {function(this:THREE.Object3D,?THREE.WebGLRenderer,?THREE.Scene,?THREE.Camera,?THREE.Geometry,?THREE.Material,?THREE.Group)} */ (this._onAfterRenderBound);

    this._viewer.renderer.view.onChange.add(this._viewChangeHandler, this);

    if (typeof this._config !== "undefined" && this._config !== null)
    {
        this._parseConfig(this._config);
    }
};

/**
 * Parse the config object.
 * @method FORGE.Hotspot3D#_parseConfig
 * @param {HotspotConfig} config - The hotspot config to parse.
 * @private
 */
FORGE.Hotspot3D.prototype._parseConfig = function(config)
{
    this._uid = config.uid;
    this._tags = config.tags;
    this._register();

    // Set the mesh name
    this._mesh.name = "mesh-" + this._uid;
    this._mesh.userData = config;

    this._name = (typeof config.name === "string") ? config.name : "";
    this._visible = (typeof config.visible === "boolean") ? config.visible : true;
    this._facingCenter = (typeof config.facingCenter === "boolean") ? config.facingCenter : false;
    this._interactive = (typeof config.interactive === "boolean") ? config.interactive : true;
    this._cursor = (typeof config.cursor === "string") ? config.cursor : "pointer";

    this._material = new FORGE.HotspotMaterial(this._viewer, this._uid);
    this._states = new FORGE.HotspotStates(this._viewer, this._uid);

    if (typeof config.states === "object" && config.states !== null)
    {
        this._states.addConfig(config.states);
    }

    // if (typeof config.transform === "object" && config.transform !== null)
    // {
    //     this._transform.load(config.transform);
    // }

    if (typeof config.animation === "object" && config.animation !== null)
    {
        this._animation.load(config.animation);
        this._animation.onProgress.add(this._updatePosition, this);
    }

    this._createGeometry(config.geometry);

    /** @type {HotspotMaterialConfig} */
    // var materialConfig;

    // if (typeof config.material === "object" && config.material !== null)
    // {
    //     materialConfig = config.material;
    // }
    // else
    // {
    //     materialConfig = FORGE.HotspotMaterial.presets.TRANSPARENT;
    // }

    // if (this._debug === true)
    // {
    //     materialConfig = /** @type {HotspotMaterialConfig} */ (FORGE.Utils.extendMultipleObjects(materialConfig, FORGE.HotspotMaterial.presets.DEBUG));
    // }

    if (typeof config.sound === "object" && config.sound !== null)
    {
        this._sound = new FORGE.HotspotSound(this._viewer);
        this._sound.load(config.sound, config.transform);
    }

    if (typeof config.fx === "string" && config.fx !== "")
    {
        this._fx = config.fx;
    }

    if (typeof config.events === "object" && config.events !== null)
    {
        this._createEvents(config.events);
    }

    // this._updatePosition();

    this._states.onLoadComplete.add(this._stateLoadCompleteHandler, this);
    this._states.load();
};

FORGE.Hotspot3D.prototype._createGeometry = function(config)
{
    this.log("create geometry");

    if (typeof config !== "undefined" && typeof config.type === "string")
    {
        var options = config.options;

        switch (config.type)
        {
            case FORGE.HotspotGeometryType.BOX:
                this._mesh.geometry = FORGE.HotspotGeometry.BOX(options);
                break;

            case FORGE.HotspotGeometryType.SPHERE:
                this._mesh.geometry = FORGE.HotspotGeometry.SPHERE(options);
                break;

            case FORGE.HotspotGeometryType.CYLINDER:
                this._mesh.geometry = FORGE.HotspotGeometry.CYLINDER(options);
                break;

            case FORGE.HotspotGeometryType.PLANE:
                this._mesh.geometry = FORGE.HotspotGeometry.PLANE(options);
                break;

            case FORGE.HotspotGeometryType.SHAPE:
                this._mesh.geometry = FORGE.HotspotGeometry.SHAPE(options);
                break;

            default:
                this._mesh.geometry = FORGE.HotspotGeometry.PLANE();
                break;
        }
    }
    else
    {
        this._mesh.geometry = FORGE.HotspotGeometry.PLANE();
    }
};

/**
 * Before render handler
 * @method FORGE.Hotspot3D#_onBeforeRender
 * @private
 */
FORGE.Hotspot3D.prototype._onBeforeRender = function(renderer, scene, camera, geometry, material, group)
{
    var g = group; // Just to avoid the jscs warning about group parameter not used.

    this._viewer.renderer.view.current.updateUniforms(material.uniforms);

    // Check what is the current render pass looking at the material: Hotspot or Picking Material
    if (material.name === "HotspotMaterial")
    {
        this._material.update();
    }
    else if (material.name === "PickingMaterial")
    {
        // As picking material is the same for all spots renderer in this pass, material uniforms won't be refreshed
        // Setting material.uniforms.tColor value will be useless, set direct value by acceding program uniforms map
        // Call useProgram first to avoid WebGL warning if material.program is not the current program
        // Set also material uniform to avoid both settings will collide on first object
        if (material.program)
        {
            var gl = this._viewer.renderer.webGLRenderer.getContext();
            gl.useProgram(material.program.program);
            material.program.getUniforms().map.tColor.setValue(gl, this._pickingColor);
            material.uniforms.tColor.value = this._pickingColor;
        }
    }
};

/**
 * After render handler
 * @method FORGE.Hotspot3D#_onAfterRender
 * @private
 */
FORGE.Hotspot3D.prototype._onAfterRender = function()
{

};

/**
 * Event handler for material ready. Triggers the creation of the hotspot3D.
 * @method FORGE.Hotspot3D#_stateLoadCompleteHandler
 * @private
 */
FORGE.Hotspot3D.prototype._stateLoadCompleteHandler = function()
{
    this.log("state load complete handler");

    this._mesh.material = this._material.material;
    this._mesh.visible = this._visible;

    this._updatePosition();

    if (this._animation.autoPlay === true && document[FORGE.Device.visibilityState] === "visible")
    {
        this._animation.play();
    }

    if (this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * transform change handler
 * @return {[type]} [description]
 */
FORGE.Hotspot3D.prototype._onTransformChangeHandler = function()
{
    this.log("transform change handler");
    this._updatePosition();
};

/**
 * Setup hotspot spatial position.
 * @method FORGE.Hotspot3D#_setupPosition
 * @private
 */
FORGE.Hotspot3D.prototype._updatePosition = function()
{
    this.log("update position");

    this._mesh.position.x = this._transform.position.x;
    this._mesh.position.y = this._transform.position.y;
    this._mesh.position.z = this._transform.position.z;

    if (this._facingCenter === true)
    {
        var spherical = new THREE.Spherical().setFromVector3(new THREE.Vector3(this._transform.position.x, this._transform.position.y, this._transform.position.z));

        this._mesh.rotation.set(-spherical.phi + Math.PI / 2, spherical.theta + Math.PI, 0, "YXZ");

        // Apply rotation
        this._mesh.rotation.x += -FORGE.Math.degToRad(this._transform.rotation.x); // pitch
        this._mesh.rotation.y += FORGE.Math.degToRad(this._transform.rotation.y); // yaw
        this._mesh.rotation.z += FORGE.Math.degToRad(this._transform.rotation.z);
    }
    else
    {
        // Apply rotation
        var rx = -FORGE.Math.degToRad(this._transform.rotation.x); // pitch
        var ry = FORGE.Math.degToRad(this._transform.rotation.y); // yaw
        var rz = FORGE.Math.degToRad(this._transform.rotation.z);

        this._mesh.rotation.set(rx, ry, rz, "YXZ");
    }

    // Scale
    this._mesh.scale.x = FORGE.Math.clamp(this._transform.scale.x, 0.000001, 100000);
    this._mesh.scale.y = FORGE.Math.clamp(this._transform.scale.y, 0.000001, 100000);
    this._mesh.scale.z = FORGE.Math.clamp(this._transform.scale.z, 0.000001, 100000);
};

/**
 * Check the ready flag of hotspot
 * @method FORGE.Hotspot3D#_checkReady
 * @return {boolean}
 * @private
 */
FORGE.Hotspot3D.prototype._checkReady = function()
{
    return (this._states.ready === true);
};

/**
 * View change handler
 * @method FORGE.Hotspot3D#_viewChangeHandler
 * @private
 */
FORGE.Hotspot3D.prototype._viewChangeHandler = function()
{
    // Only enable frustum culling when view is rectilinear and frustum makes sense
    this._mesh.frustumCulled = this._viewer.renderer.view.current instanceof FORGE.ViewRectilinear;

    this._material.updateShader();
    this._mesh.material = this._material.material;
};

/**
 * Override of the over method to trigger the state change
 * @method FORGE.Hotspot3D#over
 */
FORGE.Hotspot3D.prototype.over = function()
{
    FORGE.Object3D.prototype.over.call(this);

    if(this._states.auto === true)
    {
        this._states.load("over");
    }

    this._viewer.canvas.pointer.cursor = this._cursor;
};

/**
 * Override of the out method to trigger the state change
 * @method FORGE.Hotspot3D#out
 */
FORGE.Hotspot3D.prototype.out = function()
{
    FORGE.Object3D.prototype.out.call(this);

    if(this._states.auto === true)
    {
        this._states.load();
    }

    this._viewer.canvas.pointer.cursor = "default";
};

/**
 * Update hotspot content
 * @method FORGE.Hotspot3D#update
 */
FORGE.Hotspot3D.prototype.update = function()
{
    if (this._sound !== null)
    {
        this._sound.update();
    }
};

/**
 * Destroy routine
 * @method FORGE.Hotspot3D#destroy
 */
FORGE.Hotspot3D.prototype.destroy = function()
{
    this._viewer.renderer.view.onChange.remove(this._viewChangeHandler, this);

    this._onBeforeRenderBound = null;
    this._onAfterRenderBound = null;

    if(this._states !== null)
    {
        this._states.destroy();
        this._states = null;
    }

    if (this._transform !== null)
    {
        this._transform.destroy();
        this._transform = null;
    }

    if (this._animation !== null)
    {
        this._animation.destroy();
        this._animation = null;
    }

    if (this._material !== null)
    {
        this._material.destroy();
        this._material = null;
    }

    if (this._sound !== null)
    {
        this._sound.destroy();
        this._sound = null;
    }

    FORGE.Object3D.prototype.destroy.call(this);
};

/**
 * Hotspot config accessor
 * @name FORGE.Hotspot3D#config
 * @readonly
 * @type {HotspotConfig}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "config",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Hotspot name accessor
 * @name FORGE.Hotspot3D#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "name",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._name;
    }
});

/**
 * Hotspot animation accessor
 * @name FORGE.Hotspot3D#animation
 * @readonly
 * @type {FORGE.HotspotAnimation}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "animation",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._animation;
    }
});

/**
 * Hotspot material accessor
 * @name FORGE.Hotspot3D#material
 * @readonly
 * @type {FORGE.HotspotMaterial}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "material",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._material;
    }
});

/**
 * Hotspot transform accessor
 * @name FORGE.Hotspot3D#transform
 * @readonly
 * @type {FORGE.HotspotTransform}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "transform",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._transform;
    }
});

/**
 * Hotspot3D ready flag
 * @name FORGE.Hotspot3D#ready
 * @readonly
 * @type boolean
  */
Object.defineProperty(FORGE.Hotspot3D.prototype, "ready",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        this._ready = this._checkReady();
        return this._ready;
    }
});

/**
 * Hotspot states accessor
 * @name FORGE.Hotspot3D#states
 * @readonly
 * @type {FORGE.HotspotStates}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "states",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._states;
    }
});

/**
 * Hotspot states accessor
 * @name FORGE.Hotspot3D#states
 * @readonly
 * @type {FORGE.HotspotStates}
 */
Object.defineProperty(FORGE.Hotspot3D.prototype, "state",
{
    /** @this {FORGE.Hotspot3D} */
    get: function()
    {
        return this._states.state;
    },

    /** @this {FORGE.Hotspot3D} */
    set: function(value)
    {
        this._states.load(value);
    }
});
