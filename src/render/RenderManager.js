/**
 * RenderManager class.
 *
 * @constructor FORGE.RenderManager
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 *
 * @todo think about how to render multiple scene at the same time, with blending / overlap / viewport layouting...
 * maybe add a layer object encapsulating background / foreground renderings to ease the process
 */
FORGE.RenderManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.RenderManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * WebGL Renderer
     * @name FORGE.RenderManager#_webGLRenderer
     * @type {?THREE.WebGLRenderer}
     * @private
     */
    this._webGLRenderer = null;

    /**
     * Render pipeline managing composers
     * @name FORGE.RenderManager#_renderPipeline
     * @type {FORGE.RenderPipeline}
     * @private
     */
    this._renderPipeline = null;

    /**
     * Object managing screen/VR display
     * @name FORGE.RenderManager#_renderDisplay
     * @type {FORGE.RenderDisplay}
     * @private
     */
    this._renderDisplay = null;

    /**
     * View manager reference
     * @name FORGE.RenderManager#_viewManager
     * @type {FORGE.ViewManager}
     * @private
     */
    this._viewManager = null;

    /**
     * The sound reference linked to the media.
     * @name FORGE.RenderManager#_mediaSound
     * @type {?(FORGE.Sound|Object)}
     * @private
     */
    this._mediaSound = null;

    /**
     * Picking manager
     * @name FORGE.RenderManager#_pickingManager
     * @type {FORGE.PickingManager}
     * @private
     */
    this._pickingManager = null;

    /**
     * Background renderer.
     * @name FORGE.RenderManager#_backgroundRenderer
     * @type {?(FORGE.BackgroundMeshRenderer|FORGE.BackgroundShaderRenderer|FORGE.BackgroundPyramidRenderer)}
     * @private
     */
    this._backgroundRenderer = null;

    /**
     * Type of the background renderer.
     * @name FORGE.RenderManager#_backgroundRendererType
     * @type {string}
     * @private
     */
    this._backgroundRendererType = FORGE.BackgroundType.UNDEFINED;

    /**
     * Camera reference.
     * @name FORGE.RenderManager#_camera
     * @type {?FORGE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * Canvas resolution (px)
     * @name FORGE.RenderManager#_canvasResolution
     * @type {?FORGE.Size}
     * @private
     */
    this._canvasResolution = null;

    /**
     * Display resolution (px)
     * @name FORGE.RenderManager#_displayResolution
     * @type {?FORGE.Size}
     * @private
     */
    this._displayResolution = null;

    /**
     * objects renderer
     * @name  FORGE.RenderManager#_objectRenderer
     * @type {?FORGE.ObjectRenderer}
     * @private
     */
    this._objectRenderer = null;

    /**
     * Background renderer ready flag
     * @name FORGE.RenderManager#_backgroundReady
     * @type {boolean}
     * @private
     */
    this._backgroundReady = false;

    /**
     * Render pipeline renderer ready flag
     * @name FORGE.RenderManager#_renderPipelineReady
     * @type {boolean}
     * @private
     */
    this._renderPipelineReady = false;

    /**
     * Event dispatcher for background renderer ready.
     * @name FORGE.RenderManager#_onBackgroundReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onBackgroundReady = null;

    /**
     * Event dispatcher for on before render.
     * @name FORGE.RenderManager#_onBeforeRender
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onBeforeRender = null;

    /**
     * Event dispatcher for on after render.
     * @name FORGE.RenderManager#_onAfterRender
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onAfterRender = null;

    FORGE.BaseObject.call(this, "RenderManager");

    this._boot();
};

FORGE.RenderManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.RenderManager.prototype.constructor = FORGE.RenderManager;

/**
 * Render manager constant near depth
 * @type {number}
 */
FORGE.RenderManager.DEPTH_NEAR = 0.01;

/**
 * Render manager constant far depth
 * @type {number}
 */
FORGE.RenderManager.DEPTH_FAR = 10000;

/**
 * Boot sequence.
 * @method FORGE.RenderManager#_boot
 * @private
 */
FORGE.RenderManager.prototype._boot = function()
{
    this._clock = new THREE.Clock();

    this._viewer.onConfigLoadComplete.add(this._onViewerConfigLoadComplete, this, 1000);
};

/**
 * Viewer ready handler
 * @method FORGE.RenderManager#_onViewerConfigLoadComplete
 * @private
 */
FORGE.RenderManager.prototype._onViewerConfigLoadComplete = function()
{
    var canvas = this._viewer.canvas.dom;

    var options = this._viewer.config.webgl;
    options.canvas = canvas;

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
    this._webGLRenderer.autoClearDepth = true;
    this._webGLRenderer.autoClearColor = true;

    this._viewManager = new FORGE.ViewManager(this._viewer);
    this._viewManager.onChange.add(this._onViewChangeHandler, this);

    this._pickingManager = new FORGE.PickingManager(this._viewer);
    this._renderDisplay = new FORGE.RenderDisplay(this._viewer);
    this._objectRenderer = new FORGE.ObjectRenderer(this._viewer);
    this._renderPipeline = new FORGE.RenderPipeline(this._viewer);

    this._renderDisplay.onDisplayChange.add(this._renderDisplayChangeHandler, this);
    this._setRendererSize(this._renderDisplay.rendererSize);

    this._camera = new FORGE.Camera(this._viewer);

    this._viewer.canvas.onResize.add(this._canvasResizeHandler, this);
    this._viewer.story.onSceneLoadStart.add(this._onSceneLoadStartHandler, this);
};

/**
 * Scene has started to load.
 * Init the view, the camera and the media
 * @todo create media / background renderer
 *
 * @method FORGE.RenderManager#_onSceneLoadStartHandler
 * @private
 */
FORGE.RenderManager.prototype._onSceneLoadStartHandler = function()
{
    // Listen to scene unload
    this._viewer.story.scene.onUnloadStart.addOnce(this._onSceneUnloadStartHandler, this);

    var sceneConfig = this._viewer.story.scene.config;

    // Apply background to renderer
    this._viewer.container.background = this._viewer.story.scene.background;

    // Create render scenes before initing the view to ensure pipeline is ready when
    // enabling the picking manager
    this._objectRenderer.createRenderScenes();
    this._renderPipeline.addRenderScenes(this._objectRenderer.renderScenes);

    this._viewManager.load(sceneConfig.view);

    this._initCamera(sceneConfig);

    this._initSound(sceneConfig);

    this._setupMedia();
};

/**
 * Bind event handlers on media.
 * @method FORGE.RenderManager#_setupMedia
 * @private
 */
FORGE.RenderManager.prototype._setupMedia = function()
{
    var media = this._viewer.story.scene.media;

    media.onLoadComplete.addOnce(this._mediaLoadCompleteHandler, this);

    // If media is a video, listen to the quality change event
    if (FORGE.Utils.isTypeOf(media.displayObject, ["VideoHTML5", "VideoDash"]))
    {
        media.displayObject.onQualityChange.add(this._mediaQualityChangeHandler, this);
    }
};

/**
 * Scene has started to unload
 * @todo clean media / background renderer
 *
 * @method FORGE.RenderManager#_onSceneUnloadStartHandler
 * @private
 */
FORGE.RenderManager.prototype._onSceneUnloadStartHandler = function()
{
    this._renderPipelineReady = false;

    this._clearBackgroundRenderer();

    // Clear fx composer and hotspot renderer
    if (this._objectRenderer !== null)
    {
        this._objectRenderer.clear();
    }

    if (this._pickingManager !== null)
    {
        this._pickingManager.clear();
    }

    if (this._renderPipeline !== null)
    {
        this._renderPipeline.clear();
    }

    // Destroy media
    if (this._mediaSound !== null)
    {
        this._mediaSound.destroy();
        this._mediaSound = null;
    }
};

/**
 * Init camera with info contained in configuration
 * @method FORGE.RenderManager#_initCamera
 * @param {SceneConfig} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initCamera = function(sceneConfig)
{
    var sceneCameraConfig = /** @type {CameraConfig} */ (sceneConfig.camera);
    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
    var extendedCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig));

    this._camera.load(extendedCameraConfig);
};

/**
 * Init the scene sound with info contained in configuration
 * @method FORGE.RenderManager#_initSound
 * @param {SceneConfig} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initSound = function(sceneConfig)
{
    var soundConfig = /** @type {SoundConfig} */ (sceneConfig.sound);

    // Create sound from the SceneConfig
    if (typeof soundConfig !== "undefined" && typeof soundConfig.source !== "undefined")
    {
        var volume, loop, startTime, autoPlay;

        if (typeof soundConfig.options !== "undefined")
        {
            volume = (typeof soundConfig.options.volume === "number") ? FORGE.Math.clamp(soundConfig.options.volume, 0, 1) : 1;
            loop = (typeof soundConfig.options.loop === "boolean") ? soundConfig.options.loop : false;
            startTime = (typeof soundConfig.options.startTime === "number") ? soundConfig.options.startTime : 0;
            autoPlay = (typeof soundConfig.options.autoPlay === "boolean") ? soundConfig.options.autoPlay : false;
        }

        if (typeof soundConfig.source.url !== "undefined" && soundConfig.source.url !== "")
        {
            // Warning : UID is not registered and applied to the FORGE.Sound object for registration
            this._mediaSound = new FORGE.Sound(this._viewer, sceneConfig.sound.uid, sceneConfig.sound.source.url, (sceneConfig.sound.type === FORGE.SoundType.AMBISONIC));

            if (typeof soundConfig.options !== "undefined" && soundConfig.options !== null)
            {
                this._mediaSound.volume = volume;
                this._mediaSound.loop = loop;
                this._mediaSound.startTime = startTime;

                if (autoPlay === true)
                {
                    this._mediaSound.play(this._mediaSound.startTime, this._mediaSound.loop, true);
                }
            }
        }
        // @todo Ability to use a target uid rather than a source url (ie. soundConfig.source.target)
    }
};

/**
 * View change handler
 * @method FORGE.RenderManager#_onViewChangeHandler
 * @private
 */
FORGE.RenderManager.prototype._onViewChangeHandler = function()
{
    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.updateAfterViewChange();
    }

    this._pickingManager.updateForViewType(this._viewManager.type);

    if (this._viewManager.type === FORGE.ViewType.RECTILINEAR)
    {
        this._renderPipeline.enablePicking(false);
    }
    else
    {
        this._renderPipeline.enablePicking(true, this._pickingManager.material, this._pickingManager.renderTarget);
    }
};

/**
 * Handler of media load complete event
 * @method FORGE.RenderManager#_mediaLoadCompleteHandler
 * @param {FORGE.Event} event - Event object
 * @private
 */
FORGE.RenderManager.prototype._mediaLoadCompleteHandler = function(event)
{
    this.log("Media load is complete");

    var media = event.emitter;

    this._setBackgroundRendererType(this._renderDisplay.presentingVR);
    this._setBackgroundRenderer(this._backgroundRendererType);

    if (this._backgroundRenderer !== null)
    {
        // this._backgroundRenderer.displayObject = media.displayObject;
        this._backgroundRenderer.media = media;
    }

    this._setupRenderPipeline();
};

/**
 * Handler of media quality change event
 * @method FORGE.RenderManager#_mediaQualityChangeHandler
 * @private
 */
FORGE.RenderManager.prototype._mediaQualityChangeHandler = function(event)
{
    this.log("Media quality has changed");

    // this._backgroundRenderer.displayObject = event.emitter;
};

/**
 * Setup render pipeline
 * @method FORGE.RenderManager#_setupRenderPipeline
 * @private
 */
FORGE.RenderManager.prototype._setupRenderPipeline = function()
{
    var fxSet = null;

    var sceneConfig = this._viewer.story.scene.config;
    var mediaConfig = sceneConfig.media;

    if (typeof mediaConfig !== "undefined" && mediaConfig !== null &&
        typeof mediaConfig.fx !== "undefined" && mediaConfig.fx !== null)
    {
        fxSet = this._viewer.postProcessing.getFxSetByUID(mediaConfig.fx);
    }

    if(this._backgroundRenderer !== null)
    {
        this._renderPipeline.addBackground(this._backgroundRenderer.renderTarget.texture, fxSet, 1.0);
    }

    if (typeof sceneConfig.fx !== "undefined" && sceneConfig.fx !== null)
    {
        var globalFxSet = this._viewer.postProcessing.getFxSetByUID(sceneConfig.fx);
        this._renderPipeline.addGlobalFx(globalFxSet);
    }

    this._renderPipelineReady = true;
};

/**
 * Render background.
 * @method FORGE.RenderManager#_drawBackground
 * @param {THREE.PerspectiveCamera} camera - perspective camera used to render mesh, N/A with shader rendering
 * @private
 */
FORGE.RenderManager.prototype._drawBackground = function(camera)
{
    // this.log("_drawBackground");

    if (this._backgroundRenderer === null)
    {
        return;
    }

    this._backgroundRenderer.render(camera || null);
};

/**
 * Set renderer size and all objects aware of resolution
 * @method FORGE.RenderManager#_setRendererSize
 * @param {FORGE.Size} size - new renderer size
 * @private
 */
FORGE.RenderManager.prototype._setRendererSize = function(size)
{
    var vr = this._renderDisplay.presentingVR;

    var keepCanvasStyle = true;

    if (vr === true)
    {
        size = this._renderDisplay.rendererSize;
        keepCanvasStyle = false;
    }
    else
    {
        this._renderDisplay.setSize(size);
    }

    this.log("set renderer size: " + size.width + "x" + size.height);

    this._webGLRenderer.setSize(size.width, size.height, keepCanvasStyle);
    this._canvasResolution = size;

    this._displayResolution = new FORGE.Size(size.width, size.height);

    if (vr === true)
    {
        this._displayResolution.width *= 0.5;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.setSize(this._displayResolution);
    }

    this._pickingManager.setSize(this._displayResolution);

    this._renderPipeline.setSize(this._displayResolution);

    this.log("render size change in " + (vr ? "VR" : "screen") + " mode, resolution: " + this._displayResolution.width + "x" + this._displayResolution.height);
};

/**
 * Internal handler on canvas resize.
 * @method FORGE.RenderManager#_canvasResizeHandler
 * @private
 */
FORGE.RenderManager.prototype._canvasResizeHandler = function()
{
    this.log("canvas resize handler");

    var canvas = this._viewer.canvas.dom;
    this._setRendererSize(new FORGE.Size(canvas.width, canvas.height));
};

/**
 * VR Renderer display change event handler
 * @method FORGE.RenderManager#_renderDisplayChangeHandler
 * @private
 */
FORGE.RenderManager.prototype._renderDisplayChangeHandler = function()
{
    this.log("render display change handler");

    this._setRendererSize(this._renderDisplay.rendererSize);

    if (this._renderDisplay.presentingVR === true)
    {
        this._pickingManager.mode = FORGE.PickingManager.modes.GAZE;
    }
    else
    {
        this._pickingManager.mode = FORGE.PickingManager.modes.POINTER;
    }
};

/**
 * Renderer set background renderer
 *
 * @method FORGE.RenderManager#_setBackgroundRenderer
 * @param {string} type - type of background renderer
 * @private
 */
FORGE.RenderManager.prototype._setBackgroundRenderer = function(type)
{
    this.log("set background renderer");

    var displayObject = null;
    var renderTarget = null;

    if (this._backgroundRenderer !== null)
    {
        if (this._backgroundRenderer.displayObject !== null)
        {
            displayObject = this._backgroundRenderer.displayObject;
        }

        if (this._backgroundRenderer.renderTarget !== null)
        {
            renderTarget = this._backgroundRenderer.renderTarget;
        }
    }

    this._clearBackgroundRenderer();

    var config = {};
    var media = this._viewer.story.scene.media;
    var mediaConfig = media.config;

    // if (typeof mediaConfig !== "undefined" && mediaConfig !== null)
    if (media.type !== FORGE.MediaType.UNDEFINED)
    {
        config.type = media.type;

        if (typeof media.source !== "undefined" && media.source !== null)
        {
            var source = media.source;

            if (typeof source.levels === "undefined")
            {
                config.mediaFormat = source.format;
                var ratio = media.displayObject.element.width / media.displayObject.element.height || 1;

                if (typeof source.fov !== "undefined")
                {
                    var vFov;
                    if (typeof source.fov === "number")
                    {
                        vFov = source.fov.vertical;
                    }
                    else if (typeof source.fov.vertical === "number")
                    {
                        vFov = source.fov.vertical;
                    }
                    else if (typeof source.fov.horizontal === "number")
                    {
                        vFov = source.fov.horizontal / ratio;
                    }
                    else if (typeof source.fov.diagonal === "number")
                    {
                        vFov = source.fov.diagonal / Math.sqrt(1 + ratio * ratio);
                    }
                    else
                    {
                        vFov = 90;
                    }

                    config.verticalFov = FORGE.Math.degToRad(vFov);
                }
            }
        }

        if (typeof media.options !== "undefined" && media.options !== null)
        {
            if (typeof media.options.color !== "undefined")
            {
                config.color = media.options.color;
            }
        }
    }

    if (type === FORGE.BackgroundType.SHADER)
    {
        this.log("Create background shader renderer");
        this._backgroundRenderer = new FORGE.BackgroundShaderRenderer(this._viewer, renderTarget, config);

        var size = this._webGLRenderer.getSize();
        this._setRendererSize(new FORGE.Size(size.width, size.height));
    }
    else if (type === FORGE.BackgroundType.PYRAMID)
    {
        this.log("Create background pyramid renderer (multiresolution image)");
        this._backgroundRenderer = new FORGE.BackgroundPyramidRenderer(this._viewer, renderTarget, media.config);
    }
    else if (type === FORGE.BackgroundType.MESH)
    {
        this.log("Create background mesh renderer");

        if (typeof media.config !== "undefined" && media.config !== null)
        {
            if (typeof media.source !== "undefined" && media.source !== null)
            {
                config.order = media.source.order || "RLUDFB";

                // Get the right tile
                if (typeof media.source.tile === "number")
                {
                    config.tile = media.source.tile;
                }
                else if (Array.isArray(media.source.levels) && typeof media.source.levels[0].tile === "number")
                {
                    config.tile = media.source.levels[0].tile;
                }
            }
        }

        this._backgroundRenderer = new FORGE.BackgroundMeshRenderer(this._viewer, renderTarget, config);
    }
    else
    {
        //@todo not implemented
        // auto mode: try with fragment shader and fall back to mesh if fps is too low
    }

    if (displayObject !== null)
    {
        this._backgroundRenderer.displayObject = displayObject;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.updateAfterViewChange();
    }

    this._backgroundReady = true;

    if (this._onBackgroundReady !== null)
    {
        this._onBackgroundReady.dispatch();
    }
};

/**
 * Set the background renderer depending on current media format and view type.
 * @method FORGE.RenderManager#_setBackgroundRendererType
 * @param {boolean} vrEnabled - VR enabled flag
 * @private
 */
FORGE.RenderManager.prototype._setBackgroundRendererType = function(vrEnabled)
{
    this.log("set background renderer type");

    var media = this._viewer.story.scene.media;

    if(media.type === FORGE.MediaType.UNDEFINED)
    {
        this._backgroundRendererType = FORGE.BackgroundType.UNDEFINED;
        return;
    }

    if (vrEnabled === true)
    {
        this.log("VR on - background type = MESH");
        this._backgroundRendererType = FORGE.BackgroundType.MESH;
        return;
    }

    if (media.type === FORGE.MediaType.GRID)
    {
        this._backgroundRendererType = FORGE.BackgroundType.MESH;
    }
    else if (typeof media.source !== null)
    {
        if (typeof media.source.levels !== "undefined" && media.type === FORGE.MediaType.TILED)
        {
            this._backgroundRendererType = FORGE.BackgroundType.PYRAMID;
        }
        else if (media.source.format === FORGE.MediaFormat.CUBE)
        {
            this._backgroundRendererType = FORGE.BackgroundType.MESH;
        }
        else
        {
            this._backgroundRendererType = FORGE.BackgroundType.SHADER;
        }
    }
    else
    {
        this._backgroundRendererType = FORGE.BackgroundType.SHADER;
    }

    if (media.source === null || typeof media.source.format === "undefined")
    {
        this.log("VR off - view " + this._viewManager.current.type + ", background type = " + this._backgroundRendererType);
    }
    else
    {
        this.log("VR off - media " + media.source.format + ", view " + this._viewManager.current.type +
            ", background type = " + this._backgroundRendererType);
    }
};


/**
 * Clear the background renderer.
 * @method FORGE.RenderManager#_clearBackgroundRenderer
 * @private
 */
FORGE.RenderManager.prototype._clearBackgroundRenderer = function()
{
    this.log("clear background renderer");

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.destroy();
        this._backgroundRenderer = null;
    }

    this._backgroundReady = false;
};

/**
 * Update routine
 * @method FORGE.RenderManager#update
 */
FORGE.RenderManager.prototype.update = function()
{
    this._camera.update();
};

/**
 * Render routine
 * @method FORGE.RenderManager#render
 */
FORGE.RenderManager.prototype.render = function()
{
    if (this._viewManager === null ||
        this._renderPipelineReady === false ||
        this._renderPipeline === null)
    {
        return;
    }

    if(this._onBeforeRender !== null)
    {
        this._onBeforeRender.dispatch();
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.update();
    }

    var vr = this._renderDisplay.presentingVR;
    var renderParams = this._renderDisplay.getRenderParams();

    for (var i = 0, ii = renderParams.length; i < ii; i++)
    {
        var params = renderParams[i];
        var rect = params.rectangle;
        var camera = params.camera;

        this._webGLRenderer.setViewport(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);

        this._drawBackground((vr === true) ? camera : null);

        this._renderPipeline.render(camera);

        // Render perspective camera children (objects in camera local space)
        this._webGLRenderer.clearDepth();

        if (vr === true)
        {
            var scene = new THREE.Scene();
            scene.add(camera);
            //window.scene = scene;

            this._webGLRenderer.render(scene, camera);
        }
    }

    if (this._renderDisplay.presentingVR === true)
    {
        this._renderDisplay.submitFrame();
    }

    if(this._onAfterRender !== null)
    {
        this._onAfterRender.dispatch();
    }

    // @todo implement event for render stats (fps, objects count...)
};

/**
 * Enable VR display
 * @method FORGE.RenderManager#enableVR
 */
FORGE.RenderManager.prototype.enableVR = function()
{
    if (this._renderDisplay.presentingVR === true || FORGE.Device.webVR !== true)
    {
        return;
    }

    this._renderDisplay.enableVR();
    this._viewManager.enableVR();

    var sceneConfig = this._viewer.story.scene.config;

    // If we enter VR with a cubemap: do nothing. With an equi: toggle to mesh renderer
    if (typeof sceneConfig.media !== "undefined" && sceneConfig.media !== null && typeof sceneConfig.media.source !== "undefined" && sceneConfig.media.source !== null && sceneConfig.media.source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
    {
        this._setBackgroundRenderer(FORGE.BackgroundType.MESH);
    }
};

/**
 * Disable VR display
 * @method FORGE.RenderManager#disableVR
 */
FORGE.RenderManager.prototype.disableVR = function()
{
    if (this._renderDisplay.presentingVR === false || FORGE.Device.webVR !== true)
    {
        return;
    }

    this._renderDisplay.disableVR();
    this._viewManager.disableVR();

    // If we exit VR with a cubemap: do nothing. With an equi: toggle to shader renderer
    var sceneConfig = this._viewer.story.scene.config;
    var mediaConfig = sceneConfig.media;

    if (typeof mediaConfig !== "undefined" && mediaConfig !== null &&
        typeof mediaConfig.source !== "undefined" && mediaConfig.source !== null &&
        mediaConfig.source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
    {
        this._setBackgroundRendererType(false);
        this._setBackgroundRenderer(this._backgroundRendererType);
    }
};

/**
 * Toggle VR display
 * @method FORGE.RenderManager#toggleVR
 */
FORGE.RenderManager.prototype.toggleVR = function()
{
    if(this._renderDisplay.presentingVR === true)
    {
        this.disableVR();
    }
    else
    {
        this.enableVR();
    }
};

/**
 * Renderer destroy sequence
 *
 * @method FORGE.RenderManager#destroy
 */
FORGE.RenderManager.prototype.destroy = function()
{
    this._viewer.canvas.onResize.remove(this._canvasResizeHandler, this);
    this._viewer.story.onSceneLoadStart.remove(this._onSceneLoadStartHandler, this);
    this._viewer.onConfigLoadComplete.remove(this._onViewerConfigLoadComplete, this);

    if (this._pickingManager !== null)
    {
        this._pickingManager.destroy();
        this._pickingManager = null;
    }

    if (this._onBackgroundReady !== null)
    {
        this._onBackgroundReady.destroy();
        this._onBackgroundReady = null;
    }

    if (this._mediaSound !== null)
    {
        this._mediaSound.destroy();
        this._mediaSound = null;
    }

    if (this._objectRenderer !== null)
    {
        this._objectRenderer.destroy();
        this._objectRenderer = null;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.destroy();
        this._backgroundRenderer = null;
    }

    if (this._camera !== null)
    {
        this._camera.destroy();
        this._camera = null;
    }

    if (this._viewManager !== null)
    {
        this._viewManager.destroy();
        this._viewManager = null;
    }

    if (this._renderDisplay !== null)
    {
        this._renderDisplay.onDisplayChange.remove(this._renderDisplayChangeHandler, this);
        this._renderDisplay.destroy();
        this._renderDisplay = null;
    }

    if (this._renderPipeline !== null)
    {
        this._renderPipeline.destroy();
        this._renderPipeline = null;
    }

    if(this._onBeforeRender !== null)
    {
        this._onBeforeRender.destroy();
        this._onBeforeRender = null;
    }

    if(this._onAfterRender !== null)
    {
        this._onAfterRender.destroy();
        this._onAfterRender = null;
    }

    this._clock = null;
    this._webGLRenderer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get viewer.
 * @name FORGE.RenderManager#viewer
 * @type {FORGE.Viewer}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "viewer",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._viewer;
    }
});

/**
 * Get sound linked to the media.
 * @name FORGE.RenderManager#mediaSound
 * @type {(FORGE.Sound|Object)}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "mediaSound",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._mediaSound;
    }
});

/**
 * Get WebGL renderer.
 * @name FORGE.RenderManager#WebGLRenderer
 * @type {THREE.WebGLRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "webGLRenderer",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._webGLRenderer;
    }
});

/**
 * Get FX Composer.
 * @name FORGE.RenderManager#renderPipeline
 * @type {FORGE.RenderPipeline}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "renderPipeline",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._renderPipeline;
    }
});

/**
 * Get background renderer.
 * @name FORGE.RenderManager#backgroundRenderer
 * @type {(FORGE.BackgroundMeshRenderer|FORGE.BackgroundShaderRenderer)}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "backgroundRenderer",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._backgroundRenderer;
    }
});

/**
 * Get picking manager.
 * @name FORGE.RenderManager#pickingManager
 * @type {FORGE.PickingManager}
 */
Object.defineProperty(FORGE.RenderManager.prototype, "pickingManager",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._pickingManager;
    }
});

/**
 * Get the view manager.
 * @name FORGE.RenderManager#view
 * @type {FORGE.ViewManager}
 */
Object.defineProperty(FORGE.RenderManager.prototype, "view",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._viewManager;
    }
});

/**
 * Get camera.
 * @name FORGE.RenderManager#camera
 * @type {FORGE.Camera}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "camera",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._camera;
    }
});

/**
 * Get canvas resolution in pixels.
 * @name FORGE.RenderManager#canvasResolution
 * @type {FORGE.Size}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "canvasResolution",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._canvasResolution;
    }
});

/**
 * Get display resolution in pixels.
 * @name FORGE.RenderManager#displayResolution
 * @type {FORGE.Size}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "displayResolution",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._displayResolution;
    }
});

/**
 * VR presenting status.
 * @name FORGE.RenderManager#presentingVR
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "presentingVR",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._renderDisplay.presentingVR;
    }
});

/**
 * Get the render display.
 * @name FORGE.RenderManager#display
 * @type {FORGE.RenderDisplay}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "display",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._renderDisplay;
    }
});

/**
 * Get the backgroundReady flag
 * @name FORGE.RenderManager#backgroundReady
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "backgroundReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._backgroundReady;
    }
});

/**
 * Get the FORGE.ObjectRenderer instance
 * @name FORGE.RenderManager#objects
 * @type {FORGE.ObjectRenderer}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "objects",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._objectRenderer;
    }
});

/**
 * Get the onBackgroundReady {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderManager#onBackgroundReady
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onBackgroundReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onBackgroundReady === null)
        {
            this._onBackgroundReady = new FORGE.EventDispatcher(this, true);
        }

        return this._onBackgroundReady;
    }
});

/**
 * Get the onBeforeRender {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderManager#onBeforeRender
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onBeforeRender",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onBeforeRender === null)
        {
            this._onBeforeRender = new FORGE.EventDispatcher(this);
        }

        return this._onBeforeRender;
    }
});

/**
 * Get the onAfterRender {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderManager#onAfterRender
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onAfterRender",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onAfterRender === null)
        {
            this._onAfterRender = new FORGE.EventDispatcher(this);
        }

        return this._onAfterRender;
    }
});
