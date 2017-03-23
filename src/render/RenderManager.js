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
     * View reference.
     * @name FORGE.RenderManager#_view
     * @type {?FORGE.ViewBase}
     * @private
     */
    this._view = null;

    /**
     * View type when not in VR.
     * @name FORGE.RenderManager#_viewType
     * @type {string}
     * @private
     */
    this._viewType = FORGE.ViewType.UNDEFINED;

    /**
     * The media reference.
     * @name FORGE.RenderManager#_media
     * @type {?FORGE.Media}
     * @private
     */
    this._media = null;

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
     * @type {?(FORGE.BackgroundMeshRenderer|FORGE.BackgroundShaderRenderer)}
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
     * Scene configuration
     * @name  FORGE.RenderManager#_sceneConfig
     * @type {FORGE.SceneParser}
     * @private
     */
    this._sceneConfig = null;

    /**
     * Background renderer ready flag
     * @name FORGE.RenderManager#_backgroundReady
     * @type boolean
     * @private
     */
    this._backgroundReady = false;

    /**
     * View ready flag
     * @name FORGE.RenderManager#_viewReady
     * @type boolean
     * @private
     */
    this._viewReady = false;

    /**
     * Render pipeline renderer ready flag
     * @name FORGE.RenderManager#_renderPipelineReady
     * @type boolean
     * @private
     */
    this._renderPipelineReady = false;

    /**
     * Hotspot renderer ready flag
     * @name FORGE.RenderManager#_hotspotsReady
     * @type boolean
     * @private
     */
    this._hotspotsReady = false;

    /**
     * Event dispatcher for background renderer ready.
     * @name FORGE.RenderManager#_onBackgroundReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onBackgroundReady = null;

    /**
     * Event dispatcher for view ready.
     * @name FORGE.RenderManager#_onViewReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onViewReady = null;

    /**
     * Event dispatcher for media ready status.
     * @name FORGE.RenderManager#_onMediaReady
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMediaReady = null;

    /**
     * Event dispatcher for media release.
     * @name FORGE.RenderManager#_onMediaRelease
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMediaRelease = null;

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

    this._viewer.onReady.add(this._onViewerReady, this, 1000);
};

/**
 * Viewer ready handler
 * @method FORGE.RenderManager#_onViewerReady
 * @private
 */
FORGE.RenderManager.prototype._onViewerReady = function()
{
    var canvas = this._viewer.canvas.dom;

    var options = {
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
        canvas: canvas
    };

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

    this._pickingManager = new FORGE.PickingManager(this._viewer);
    this._renderDisplay = new FORGE.RenderDisplay(this._viewer);
    this._objectRenderer = new FORGE.ObjectRenderer(this._viewer);
    this._renderPipeline = new FORGE.RenderPipeline(this._viewer);

    this._renderDisplay.onDisplayChange.add(this._renderDisplayChangeHandler, this);
    this._setRendererSize(this._renderDisplay.rendererSize);

    this._camera = new FORGE.Camera(this._viewer);

    this._viewer.canvas.onResize.add(this._canvasResizeHandler, this);
    this._viewer.story.onSceneLoadStart.add(this._onSceneLoadStart, this);
};

/**
 * Scene has started to load.
 * Init the view, the camera and the media
 * @todo create media / background renderer
 *
 * @method FORGE.RenderManager#_onSceneLoadStart
 * @private
 */
FORGE.RenderManager.prototype._onSceneLoadStart = function()
{
    // Listen to scene unload
    this._viewer.story.scene.onUnloadStart.addOnce(this._onSceneUnloadStart, this);

    this._sceneConfig = this._viewer.story.scene.config;

    // Apply background to renderer
    this._viewer.container.background = this._sceneConfig.background;

    // Create render scenes before initing the view to ensure pipeline is ready when
    // enabling the picking manager
    this._objectRenderer.createRenderScenes();
    this._renderPipeline.addRenderScenes(this._objectRenderer.renderScenes);

    this._initView(this._sceneConfig);

    this._initCamera(this._sceneConfig);

    this._initMedia(this._sceneConfig);

    this._initSound(this._sceneConfig);
};

/**
 * Scene has started to unload
 * @todo clean media / background renderer
 *
 * @method FORGE.RenderManager#_onSceneUnloadStart
 * @private
 */
FORGE.RenderManager.prototype._onSceneUnloadStart = function()
{
    this._hotspotsReady = false;
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

    if (this._media !== null)
    {
        if (FORGE.Utils.isTypeOf(this._media.displayObject, ["VideoHTML5", "VideoDash"]) === true &&
            this._media.displayObject.onQualityChange !== undefined &&
            this._media.displayObject.onQualityChange.has(this._mediaQualityChangeHandler, this))
        {
            this._media.displayObject.onQualityChange.remove(this._mediaQualityChangeHandler, this);
        }

        if (this._onMediaRelease !== null)
        {
            this._onMediaRelease.dispatch();
        }

        this._media.destroy();
        this._media = null;
    }
};

/**
 * Init view with info contained in configuration
 * @method FORGE.RenderManager#_initView
 * @param {FORGE.SceneParser} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initView = function(sceneConfig)
{
    var sceneViewConfig = /** @type {ViewConfig} */ (sceneConfig.view);
    var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.config.view);
    var extendedViewConfig = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(storyViewConfig, sceneViewConfig));

    var type = (typeof extendedViewConfig.type === "string") ? extendedViewConfig.type.toLowerCase() : FORGE.ViewType.RECTILINEAR;
  
    if (this._view !== null && this._view.type === type) 
    {
        this.log("Render manager won't set view if it's already set");
        return;
    }

    switch (type)
    {
        case FORGE.ViewType.GOPRO:
        case FORGE.ViewType.RECTILINEAR:
        case FORGE.ViewType.FLAT:
            this.setView(type);
            break;

        default:
            this.setView(FORGE.ViewType.RECTILINEAR);
            break;
    }
};

/**
 * Init camera with info contained in configuration
 * @method FORGE.RenderManager#_initCamera
 * @param {FORGE.SceneParser} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initCamera = function(sceneConfig)
{
    var sceneCameraConfig = /** @type {CameraConfig} */ (sceneConfig.camera);
    var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.config.camera);
    var extendedCameraConfig = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig));

    this._camera.load(extendedCameraConfig);
};

/**
 * Init the scene media with info contained in configuration
 * @method FORGE.RenderManager#_initMedia
 * @param {FORGE.SceneParser} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initMedia = function(sceneConfig)
{
    var mediaConfig = /** @type {SceneMediaConfig} */ (sceneConfig.media);

    // Create media
    if (mediaConfig !== null &&
        typeof mediaConfig !== "undefined" &&
        typeof mediaConfig.source !== "undefined")
    {
        this._media = new FORGE.Media(this._viewer, sceneConfig);

        if (this._media.ready === true)
        {
            this._mediaLoadCompleteHandler();
        }
        else
        {
            // Listen to media load complete event once
            this._media.onLoadComplete.addOnce(this._mediaLoadCompleteHandler, this);
        }

        // If media is a video, listen to the quality change event
        if (FORGE.Utils.isTypeOf(this._media.displayObject, ["VideoHTML5", "VideoDash"]))
        {
            this._media.displayObject.onQualityChange.add(this._mediaQualityChangeHandler, this);
        }

        if (this._onMediaReady !== null)
        {
            this._onMediaReady.dispatch();
        }
    }
    else
    {
        // No media - Clear the previous background renderer
        this._clearBackgroundRenderer();
    }
};

/**
 * Init the scene sound with info contained in configuration
 * @method FORGE.RenderManager#_initSound
 * @param {FORGE.SceneParser} sceneConfig - scene configuration
 * @private
 */
FORGE.RenderManager.prototype._initSound = function(sceneConfig)
{
    // Create sound
    if (typeof sceneConfig.sound !== "undefined" && typeof sceneConfig.sound.source !== "undefined")
    {
        var volume, loop, startTime, autoPlay;

        if (typeof sceneConfig.sound.options !== "undefined")
        {
            volume = (typeof sceneConfig.sound.options.volume === "number") ? FORGE.Math.clamp(sceneConfig.sound.options.volume, 0, 1) : 1;
            loop = (typeof sceneConfig.sound.options.loop === "boolean") ? sceneConfig.sound.options.loop : false;
            startTime = (typeof sceneConfig.sound.options.startTime === "number") ? sceneConfig.sound.options.startTime : 0;
            autoPlay = (typeof sceneConfig.sound.options.autoPlay === "boolean") ? sceneConfig.sound.options.autoPlay : false;
        }

        if (typeof sceneConfig.sound.source.url !== "undefined" && sceneConfig.sound.source.url !== "")
        {
            // Warning : UID is not registered and applied to the FORGE.Sound object for registration
            this._mediaSound = new FORGE.Sound(this._viewer, sceneConfig.sound.uid, sceneConfig.sound.source.url, (sceneConfig.sound.type === FORGE.SoundType.AMBISONIC ? true : false));

            if (typeof sceneConfig.sound.options !== "undefined" && sceneConfig.sound.options !== null)
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
        // @todo Ability to use a target uid rather than a source url (ie. sceneConfig.sound.source.target)
    }
};

/**
 * Handler of media load complete event
 * @method FORGE.RenderManager#_mediaLoadCompleteHandler
 * @param {FORGE.Event=} event - Event object
 * @private
 */
FORGE.RenderManager.prototype._mediaLoadCompleteHandler = function(event)
{
    this.log("Media load is complete");

    this._setBackgroundRendererType(this._renderDisplay.presentingVR);
    this._setBackgroundRenderer(this._backgroundRendererType);

    if (typeof event !== "undefined" && event !== null)
    {
        this._backgroundRenderer.displayObject = event.emitter.displayObject;
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

    this._backgroundRenderer.displayObject = event.emitter;
};

/**
 * Setup render pipeline
 * @method FORGE.RenderManager#_setupRenderPipeline
 * @private
 */
FORGE.RenderManager.prototype._setupRenderPipeline = function()
{
    var fxSet = null;

     var mediaConfig = /** @type {SceneMediaConfig} */ (this._sceneConfig.media);

    if (typeof mediaConfig !== "undefined" && mediaConfig !== null &&
        typeof mediaConfig.fx !== "undefined" && mediaConfig.fx !== null)
    {
        fxSet = this._viewer.postProcessing.getFxSetByUID(mediaConfig.fx);
    }

    this._renderPipeline.addBackground(this._backgroundRenderer.renderTarget.texture, fxSet, 1.0);

    if (typeof this._sceneConfig.fx !== "undefined" && this._sceneConfig.fx !== null)
    {
        var globalFxSet = this._viewer.postProcessing.getFxSetByUID(this._sceneConfig.fx);
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
    this.log("Renderer size: " + size.width + "x" + size.height);

    var vr = this._renderDisplay.presentingVR;

    var keepCanvasStyle = true;

    if (vr === true)
    {
        keepCanvasStyle = false;
    }

    // Resize
    if (vr === false)
    {
        this._renderDisplay.setSize(size);
    }

    this._webGLRenderer.setSize(size.width, size.height, keepCanvasStyle);
    this._canvasResolution = size;

    this._displayResolution = new FORGE.Size(size.width * (vr ? 0.5 : 1), size.height);

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.setSize(this._displayResolution);
    }

    this._pickingManager.setSize(this._displayResolution);

    this._renderPipeline.setSize(this._displayResolution);

    this.log("Render size change in " + (vr ? "VR" : "screen") + " mode, resolution: " + this._displayResolution.width + "x" + this._displayResolution.height);
};

/**
 * Internal handler on canvas resize.
 * @method FORGE.RenderManager#_canvasResizeHandler
 * @private
 */
FORGE.RenderManager.prototype._canvasResizeHandler = function()
{
    this.log("_canvasResizeHandler");

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
    this._setRendererSize(this._renderDisplay.rendererSize);

    //this._camera.gaze.visible = this._renderDisplay.presentingVR;

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
    var mediaConfig = /** @type {SceneMediaConfig} */ (this._sceneConfig.media);
    if (typeof mediaConfig !== "undefined" && mediaConfig !== null)
    {
        config.type = mediaConfig.type;

        if (typeof mediaConfig.source !== "undefined" && mediaConfig.source !== null)
        {
            config.mediaFormat = mediaConfig.source.format;
            var ratio = this._media.displayObject.element.width / this._media.displayObject.element.height;

            if (typeof mediaConfig.source.fov !== "undefined")
            {
                var vFov;
                if (typeof mediaConfig.source.fov === "number")
                {
                    vFov = mediaConfig.source.fov.vertical;
                }
                else if (typeof mediaConfig.source.fov.vertical === "number")
                {
                    vFov = mediaConfig.source.fov.vertical;
                }
                else if (typeof mediaConfig.source.fov.horizontal === "number")
                {
                    vFov = mediaConfig.source.fov.horizontal / ratio;
                }                
                else if (typeof mediaConfig.source.fov.diagonal === "number")
                {
                    vFov = mediaConfig.source.fov.diagonal / Math.sqrt(1 + ratio * ratio);
                }
                else
                {
                    vFov = 90;
                }

                config.verticalFov = FORGE.Math.degToRad(vFov);
            }
        }

        if (typeof mediaConfig.options !== "undefined" && mediaConfig.options !== null)
        {
            if (typeof mediaConfig.options.color !== "undefined")
            {
                config.color = mediaConfig.options.color;
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
    else if (type === FORGE.BackgroundType.MESH)
    {
        this.log("Create background mesh renderer");

        if (typeof mediaConfig !== "undefined" && mediaConfig !== null)
        {
            if (typeof mediaConfig.source !== "undefined" && mediaConfig.source !== null)
            {
                config.order = mediaConfig.source.order || "RLUDFB";

                // Get the right tile
                if (typeof mediaConfig.source.tile === "number")
                {
                    config.tile = mediaConfig.source.tile;
                }
                else if (Array.isArray(mediaConfig.source.levels) && typeof mediaConfig.source.levels[0].tile === "number")
                {
                    config.tile = mediaConfig.source.levels[0].tile;
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
    if (vrEnabled === true)
    {
        this.log("VR on - background type = MESH");
        this._backgroundRendererType = FORGE.BackgroundType.MESH;
        return;
    }

    var mediaConfig = /** @type {SceneMediaConfig} */ (this._sceneConfig.media);
    if (mediaConfig.source.format === FORGE.MediaFormat.CUBE || 
        mediaConfig.source.format === FORGE.MediaFormat.FLAT ||
        typeof mediaConfig.source === "undefined" ||
        typeof mediaConfig.source.format === "undefined")
    {
        if (this._view.type === FORGE.ViewType.FLAT)
        {
            this._backgroundRendererType = FORGE.BackgroundType.SHADER;
        }

        else
        {
            this._backgroundRendererType = FORGE.BackgroundType.MESH;
        }
    }

    else
    {
        this._backgroundRendererType = FORGE.BackgroundType.SHADER;
    }

    this.log("VR off - media " + mediaConfig.source.format + ", view " + this._view.type +
        ", background type = " + this._backgroundRendererType);
};


/**
 * Clear the background renderer.
 * @method FORGE.RenderManager#_clearBackgroundRenderer
 * @private
 */
FORGE.RenderManager.prototype._clearBackgroundRenderer = function()
{
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
    if (this._viewReady === false ||
        this._renderPipelineReady === false ||
        this._renderPipeline === null)
    {
        return;
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

        //this._camera.gaze.visible = !this._renderDisplay.presentingVR;

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

    // @todo implement event for render stats (fps, objects count...)
};

/**
 * Screen to world conversion based on current view
 *
 * @method FORGE.RenderManager#screenToWorld
 * @param {THREE.Vector2} screenPt point in screen space
 * @return {THREE.Vector3} point in world space
 */
FORGE.RenderManager.prototype.screenToWorld = function(screenPt)
{
    return this._view.screenToWorld(screenPt);
};

/**
 * World to screen conversion based on current view
 *
 * @method FORGE.RenderManager#worldToScreen
 * @param {THREE.Vector3} worldPt point in world space
 * @param {number=} parallax parallax factor [0..1]
 * @return {THREE.Vector2} screenPt point in screen space
 */
FORGE.RenderManager.prototype.worldToScreen = function(worldPt, parallax)
{
    return this._view.worldToScreen(worldPt, parallax || 0);
};

/**
 * Enable / disable VR display
 *
 * @method FORGE.RenderManager#enableVR
 * @param {boolean} status new VR display status
 */
FORGE.RenderManager.prototype.enableVR = function(status)
{
    if (this._renderDisplay.presentingVR === status || FORGE.Device.webVR !== true)
    {
        return;
    }

    this._renderDisplay.enableVR(status);

    if (status)
    {
        this._viewType = this._view.type;
        this.setView(FORGE.ViewType.RECTILINEAR);
    }
    else
    {
        this.setView(this._viewType);
        this._camera.roll = 0;
    }


    // If we enter VR with a cubemap: do nothing. With an equi: toggle to mesh renderer
    // If we exit VR with a cubemap: do nothing. With an equi: toggle to shader renderer
    if (typeof this._sceneConfig.media !== "undefined" &&
        this._sceneConfig.media !== null &&
        typeof this._sceneConfig.media.source !== "undefined" &&
        this._sceneConfig.media.source !== null &&
        this._sceneConfig.media.source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
    {
        this._setBackgroundRendererType(status);
        this._setBackgroundRenderer(this._backgroundRendererType);
    }
};

/**
 * Toggle VR display
 *
 * @method FORGE.RenderManager#toggleVR
 */
FORGE.RenderManager.prototype.toggleVR = function()
{
    this.enableVR(!this._renderDisplay.presentingVR);
};

/**
 * Renderer set view type
 *
 * @method FORGE.RenderManager#setView
 * @param {string} type - type of view
 */
FORGE.RenderManager.prototype.setView = function(type)
{
    this.log("setView");

    if (this._view !== null)
    {
        if (this._view.type === type)
        {
            return;
        }

        this.log("Destroy previous view");
        this._view.destroy();
        this._view = null;
    }

    this._viewReady = false;

    if (type === FORGE.ViewType.RECTILINEAR)
    {
        this._view = new FORGE.ViewRectilinear(this._viewer);
    }
    else if (type === FORGE.ViewType.GOPRO)
    {
        this._view = new FORGE.ViewGoPro(this._viewer);
    }
    else if (type === FORGE.ViewType.FLAT)
    {
        this._view = new FORGE.ViewFlat(this._viewer);
    }
    else
    {
        throw "View type not supported " + type;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.updateAfterViewChange();
    }

    this._viewReady = true;

    this._pickingManager.updateForViewType(type);

    if (type === FORGE.ViewType.RECTILINEAR)
    {
        this._renderPipeline.enablePicking(false);
    }
    else
    {
        this._renderPipeline.enablePicking(true, this._pickingManager.material, this._pickingManager.renderTarget);
    }

    this.onViewReady.dispatch();
};

/**
 * Renderer destroy sequence
 *
 * @method FORGE.RenderManager#destroy
 */
FORGE.RenderManager.prototype.destroy = function()
{
    this._viewer.canvas.onResize.remove(this._canvasResizeHandler, this);
    this._viewer.story.onSceneLoadStart.remove(this._onSceneLoadStart, this);
    this._viewer.onReady.remove(this._onViewerReady, this);

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

    if (this._onViewReady !== null)
    {
        this._onViewReady.destroy();
        this._onViewReady = null;
    }

    if (this._onHotspotsReady !== null)
    {
        this._onHotspotsReady.destroy();
        this._onHotspotsReady = null;
    }

    if (this._mediaSound !== null)
    {
        this._mediaSound.destroy();
        this._mediaSound = null;
    }

    if (this._media !== null)
    {
        this._media.destroy();
        this._media = null;
    }

    if (this._objectRenderer !== null)
    {
        this._objectRenderer.destroy();
        this._objectRenderer = null;
    }

    if (this._view !== null)
    {
        this._view.destroy();
        this._view = null;
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

    this._clock = null;
    this._sceneConfig = null;
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
 * Get media.
 * @name FORGE.RenderManager#media
 * @type {FORGE.Media}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "media",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._media;
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
 * Get and set the view.
 * @name FORGE.RenderManager#view
 * @type {FORGE.ViewBase}
 */
Object.defineProperty(FORGE.RenderManager.prototype, "view",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._view;
    },
    /** @this {FORGE.RenderManager} */
    set: function(value)
    {
        if (typeof value === "string" && value !== "")
        {
            switch (value)
            {
                case FORGE.ViewType.GOPRO:
                case FORGE.ViewType.RECTILINEAR:
                case FORGE.ViewType.FLAT:
                    this.setView(value);
                    break;

                default:
                    throw "View type not supported: " + value;
            }
        }
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
 * Get the viewReady flag
 * @name FORGE.RenderManager#viewReady
 * @readonly
 * @type boolean
 */
Object.defineProperty(FORGE.RenderManager.prototype, "viewReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._viewReady;
    }
});

/**
 * Get the onViewReady {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderManager#onViewReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onViewReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onViewReady === null)
        {
            this._onViewReady = new FORGE.EventDispatcher(this, true);
        }

        return this._onViewReady;
    }
});

/**
 * Get the objects
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
 * Get the hotspotsReady flag
 * @name FORGE.RenderManager#hotspotsReady
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "hotspotsReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        return this._hotspotsReady;
    }
});

/**
 * Get the onHotspotsReady {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderManager#onHotspotsReady
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onHotspotsReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onHotspotsReady === null)
        {
            this._onHotspotsReady = new FORGE.EventDispatcher(this, true);
        }

        return this._onHotspotsReady;
    }
});

/**
 * Get the onMediaReady {@link FORGE.EventDispatcher}.
 * @name  FORGE.RenderManager#onMediaReady
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onMediaReady",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onMediaReady === null)
        {
            this._onMediaReady = new FORGE.EventDispatcher(this);
        }

        return this._onMediaReady;
    }
});

/**
 * Get the onMediaRelease {@link FORGE.EventDispatcher}.
 * @name  FORGE.RenderManager#onMediaRelease
 * @type {FORGE.EventDispatcher}
 * @readonly
 */
Object.defineProperty(FORGE.RenderManager.prototype, "onMediaRelease",
{
    /** @this {FORGE.RenderManager} */
    get: function()
    {
        if (this._onMediaRelease === null)
        {
            this._onMediaRelease = new FORGE.EventDispatcher(this);
        }

        return this._onMediaRelease;
    }
});