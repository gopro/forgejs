/**
 * Renderer class.
 *
 * @constructor FORGE.Renderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.Renderer = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Renderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    this._webGLRenderer = null;

    this._scene = null;

    this._quad = null;
    
    this._camera = null;

    this._layout = null;

    // Scene ?? Media ?? Something else ?
    this._currentScene = null;
    this._nextScene = null;



    /**
     * Material pool
     * @name FORGE.Viewer#_materialPool
     * @type {Array<THREE.Material>}
     * @private
     */
    this._materialPool = null;

    /**
     * Event dispatcher for the scene transition start event.
     * @name FORGE.Viewer#_onSceneTransitionStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneTransitionStart = null;

    /**
     * Event dispatcher for the scene transition progress event.
     * @name FORGE.Viewer#_onSceneTransitionProgress
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneTransitionProgress = null;

    /**
     * Event dispatcher for the scene transition complete event.
     * @name FORGE.Viewer#_onSceneTransitionComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneTransitionComplete = null;


    FORGE.BaseObject.call(this, "Renderer");

    this._boot();
};

FORGE.Renderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Renderer.prototype.constructor = FORGE.Renderer;

/**
 * Renderer constant near depth
 * @type {number}
 */
FORGE.Renderer.DEPTH_NEAR = 0.01;

/**
 * Renderer constant far depth
 * @type {number}
 */
FORGE.Renderer.DEPTH_FAR = 10000;

/**
 * Boot sequence.
 * @method FORGE.Renderer#_boot
 * @private
 */
FORGE.Renderer.prototype._boot = function()
{
    this._viewer.onConfigLoadComplete.add(this._onViewerConfigLoadComplete, this, 1000);
};

/**
 * Viewer ready handler
 * @method FORGE.Renderer#_onViewerConfigLoadComplete
 * @private
 */
FORGE.Renderer.prototype._onViewerConfigLoadComplete = function()
{
    // TODO
    // this._layout = new FORGE.LayoutManager();
    // var canvas = this._layout.container;
    var canvas = this._viewer.canvas.dom;

    var options = this._viewer.config.webgl;
    options.canvas = canvas;
    options.antialias = true;

    // WebGLRenderer will draw any component supported by WebGL
    try
    {
        this._webGLRenderer = new THREE.WebGLRenderer(options);
    }
    catch (error)
    {
        this.destroy();
        return;
    }

    this._webGLRenderer.autoClear = false;
    // this._webGLRenderer.autoClearDepth = true;
    // this._webGLRenderer.autoClearColor = true;

    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    var material = this._buildMaterial(canvas);

    this._quad = new THREE.Mesh(geometry, material);
    
    this._scene = new THREE.Scene();
    this._scene.add(this._quad);

    this._clock = new FORGE.Clock();
};

/**
 * Build material object.
 * @method FORGE.Renderer#_buildMaterial
 * @param {HTMLCanvasElement} canvas
 * @return {THREE.RawShaderMaterial} shader material
 * @private
 */
FORGE.Renderer.prototype._buildMaterial = function(canvas)
{
    var uniforms = {
        tTime: {
            value: 1.0
        },

        tMixRatio: {
            value: 1.0
        },

        tTexture1: {
            value: null
        },

        tTexture2: {
            value: null
        },

        tOpacity: {
            value: 1.0
        },

        tResolution: {
            value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight)
        }
    };

    var vertexShader = FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_vert_rectilinear);
    // var fragmentShader = FORGE.ShaderLib.parseIncludes(FORGE.ShaderChunk.wts_frag);

    var fragmentShader = [
        "precision highp float;",

        "varying vec2 vUv;",

        "uniform float tTime;",
        "uniform float tMixRatio;",
        "uniform sampler2D tTexture1;",
        "uniform sampler2D tTexture2;",
        "uniform float tOpacity;",
        "uniform vec2 tResolution;",
        
        "void main() {",
        "   gl_FragColor = texture2D(tTexture1, gl_FragCoord.xy / tResolution);",
        // "   gl_FragColor = texture2D(tTexture1, vUv);",
        "}"
        // "void main() { gl_FragColor = mix(texture2D(tTexture1, vUv), texture2D(tTexture2, vUv), tMixRatio); }"
        // "void main() { gl_FragColor = vec4(0.8, 0.8, 0.2, 1.); }"

    ].join("\n");

    return new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
};

/**
 * Render routine
 *
 * @method FORGE.Renderer#render
 */
FORGE.Renderer.prototype.render = function()
{
    // Update time (increasing ramp in [0..1]) and mix ratio increasing and decreasing ramp in [[0..1]]
    // var periodMS = 15 * 1000;
    // var tn = (this._clock.elapsedTime % periodMS) / periodMS;
    // this._quad.material.uniforms.tMixRatio.value = tn < 0.5 ? 2 * tn : 2 - 2 * tn;
    // this._quad.material.uniforms.tTime.value = tn;

    var currentScene = this._viewer.story.scene;

    // Ask current scene (and transition if any) to render
    // They will change the renderer viewport, we'll set it back once it's done
    currentScene.render();

    // Assign textures from the scene and render the whole scene
    this._quad.material.uniforms.tTexture1.value = currentScene.renderTarget;
    this._webGLRenderer.setViewport(0, 0, this._viewer.width, this._viewer.height);
    this._webGLRenderer.render(this._scene, this._camera);
};

/**
 * Change current scene with or without transition
 * @method FORGE.Renderer#changeScene
 * @param {FORGE.Something} scene new scene
 */
FORGE.Renderer.prototype.changeScene = function(scene)
{
    if (this._onSceneTransitionStart !== null)
    {
        this._onSceneTransitionStart.dispatch();
    }

    if (this._onSceneTransitionProgress !== null)
    {
        this._onSceneTransitionProgress.dispatch({ progress: 0.5});
    }
    
    if (this._onSceneTransitionComplete !== null)
    {
        this._onSceneTransitionComplete.dispatch();
    }
};

/**
 * Get material for a given view type
 * Set a pool of materials with lazy instantiation
 * @method FORGE.Renderer#getMaterialForView
 * @param {FORGE.ViewType} viewType - view type
 * @return {THREE.RawShaderMaterial} world to screen mapping shader for the given view
 */
FORGE.Renderer.prototype.getMaterialForView = function(viewType, shaderType)
{
    if (this._materialPool === null)
    {
        this._materialPool = {};
    }

    if (typeof shaderType === "undefined")
    {
        shaderType = "mapping";
    }

    if (viewType in this._materialPool)
    {
        return this._materialPool[viewType][shaderType];
    }

    this._materialPool[viewType] = {};

    var shaderTypes = ["mapping", "picking", "wireframe"];
    for (var i=0, ii=shaderTypes.length; i<ii; i++)
    {
        var type = shaderTypes[i];
        var shader = FORGE.Utils.clone(FORGE.ShaderLib.worldToScreen[viewType][type]);
        var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
        var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

        var material = new THREE.RawShaderMaterial(
        {
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
            side: THREE.FrontSide,
            name: viewType + "." + type
        });

        material.needsUpdate = true;

        this._materialPool[viewType][type] = material;
    }

    return this._materialPool[viewType][shaderType];
};

 /**
 * Renderer destroy sequence
 *
 * @method FORGE.Renderer#destroy
 */
FORGE.Renderer.prototype.destroy = function()
{
    this._viewer.onConfigLoadComplete.remove(this._onViewerConfigLoadComplete, this);

    this._onSceneTransitionStart = null;
    this._onSceneTransitionProgress = null;
    this._onSceneTransitionComplete = null;

    if (this._materialPool !== null)
    {
        while (this._materialPool.length > 0) {
            var material = this._materialPool.shift();
            material.dispose();
        }
        this._materialPool = null;
    }

    if (this._clock !== null)
    {
        this._clock.destroy();
        this._clock = null;
    }

    if (this._quad !== null) {
        if (this._quad.material !== null) {
            this._quad.material.dispose();
            this._quad.material = null;
        }

        if (this._quad.geometry !== null) {
            this._quad.geometry.dispose();
            this._quad.geometry = null;            
        }
    }

    if (this._scene !== null) {
        this._scene.children = 0;
        this._scene = null;
    }

    if (this._camera !== null) {
        this._camera = null;
    }

    this._webGLRenderer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the WebGL renderer.
 * @name FORGE.Renderer#webGLRenderer
 * @type {THREE.WebGLRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.Renderer.prototype, "webGLRenderer",
{
    /** @this {FORGE.Renderer} */
    get: function()
    {
        return this._webGLRenderer;
    }
});

/**
 * Get and set VR status.
 * @name FORGE.Renderer#vr
 * @type {boolean}
 */
Object.defineProperty(FORGE.Renderer.prototype, "vr",
{
    /** @this {FORGE.Viewer} */
    get: function()
    {
        return this._webGLRenderer.vr.enabled;
    },

    /** @this {FORGE.Viewer} */
    set: function(value)
    {
        this._webGLRenderer.vr.enabled = value;
    }
});

