/**
 * @constructor FORGE.RenderDisplay
 * @param {FORGE.Viewer} viewer - viewer reference
 * @extends {FORGE.BaseObject}
 */
FORGE.RenderDisplay = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.RenderDisplay#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * WebVR flag, true if runtime supports WebVR.
     * @name FORGE.RenderDisplay#_webVR
     * @type {boolean}
     * @private
     */
    this._webVR = false;

    /**
     * Presenting VR status.
     * @name FORGE.RenderDisplay#_presentingVR
     * @type {boolean}
     * @private
     */
    this._presentingVR = false;

    /**
     * WebVR VRDisplay interface.
     * @name FORGE.RenderDisplay#_vrDisplay
     * @type {VRDisplay}
     * @private
     */
    this._vrDisplay = null;

    /**
     * VRDisplay boundaries for left eye.
     * @name FORGE.RenderDisplay#_leftBounds
     * @type {Array<number>}
     * @private
     */
    this._leftBounds = null;

    /**
     * VRDisplay boundaries for right eye.
     * @name FORGE.RenderDisplay#_rightBounds
     * @type {Array<number>}
     * @private
     */
    this._rightBounds = null;

    /**
     * Renderer size.
     * @name FORGE.RenderDisplay#_rendererSize
     * @type {FORGE.Size}
     * @private
     */
    this._rendererSize = null;

    /**
     * Renderer size for screen display.
     * @name FORGE.RenderDisplay#_rendererSizeScreen
     * @type {FORGE.Size}
     * @private
     */
    this._rendererSizeScreen = null;

    /**
     * Renderer pixel ratio.
     * @name FORGE.RenderDisplay#_rendererPixelRatio
     * @type {number}
     * @private
     */
    this._rendererPixelRatio = 1;

    /**
     * WebVR frame data receiver
     * @name FORGE.RenderDisplay#_frameData
     * @type {VRFrameData}
     * @private
     */
    this._frameData = null;

    /**
     * On display change event dispatcher.
     * @name  FORGE.RenderDisplay#_onDisplayChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onDisplayChange = null;

    FORGE.BaseObject.call(this, "RenderDisplay");

    this._boot();
};

FORGE.RenderDisplay.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.RenderDisplay.prototype.constructor = FORGE.RenderDisplay;

/**
 * Boot sequence
 * @method FORGE.RenderDisplay#_boot
 * @private
 */
FORGE.RenderDisplay.prototype._boot = function()
{
    var renderer = this._viewer.renderer.webGLRenderer;
    this._rendererPixelRatio = renderer.getPixelRatio();
    var size = renderer.getSize();
    this._rendererSizeScreen = new FORGE.Size(size.width, size.height);
    this._rendererSize = this._rendererSizeScreen;

    // Bounds will be set when user request fullscreen VR display
    this._leftBounds = [ 0.0, 0.0, 0.5, 1.0 ];
    this._rightBounds = [ 0.5, 0.0, 0.5, 1.0 ];

    // Create frame data receiver
    if ("VRFrameData" in window)
    {
        this._frameData = new VRFrameData();
    }

    if(FORGE.Device.webVR === true)
    {
        var self = this;

        var gotVRDisplaysBind = this._gotVRDisplays.bind(this);

        navigator.getVRDisplays().then(gotVRDisplaysBind);

        this._addFullscreenListener();
    }
    else
    {
        this.warn("missing api navigator.getVRDisplays");
    }
};

/**
 * VR display interface found callback
 * Just keep the first interface available
 * @method FORGE.RenderDisplay#_gotVRDisplays
 * @param {Array<VRDisplay>} displays - array of VRDisplay interfaces available
 * @private
 */
FORGE.RenderDisplay.prototype._gotVRDisplays = function(displays)
{
    this._webVR = displays.length > 0;

    for (var i=0, ii=displays.length; i<ii; i++)
    {
        if ("VRDisplay" in window && displays[i] instanceof VRDisplay)
        {
            this._vrDisplay = displays[i];
            this._vrDisplay.depthNear = FORGE.RenderManager.DEPTH_NEAR;
            this._vrDisplay.depthFar = 2 * FORGE.RenderManager.DEPTH_FAR;
            break;
        }
    }

    if (this._vrDisplay === null)
    {
        this.warn("No HMD available");
    }
};

/**
 * Add event listeners for fullscreen and VR display change
 * Cross browser implementation
 * @method FORGE.RenderDisplay#_addFullscreenListener
 * @private
 */
FORGE.RenderDisplay.prototype._addFullscreenListener = function()
{
    this._viewer.container.onFullscreenEnter.add(this._displayChangeHandler, this);
    this._viewer.container.onFullscreenExit.add(this._displayChangeHandler, this);

    window.addEventListener("vrdisplaypresentchange", this._displayChangeHandler.bind(this), false);
};

/**
 * Remove event listeners for fullscreen and VR display change
 * Cross browser implementation
 * @method FORGE.RenderDisplay#_addFullscreenListener
 * @private
 */
FORGE.RenderDisplay.prototype._removeFullscreenListener = function()
{
    this._viewer.container.onFullscreenEnter.remove(this._displayChangeHandler, this);
    this._viewer.container.onFullscreenExit.remove(this._displayChangeHandler, this);

    window.removeEventListener("vrdisplaypresentchange", this._displayChangeHandler.bind(this));
};

/**
 * Display change event handler
 * @method FORGE.RenderDisplay#_displayChangeHandler
 * @private
 */
FORGE.RenderDisplay.prototype._displayChangeHandler = function()
{
    var wasPresentingVR = this._presentingVR;
    var renderer = this._viewer.renderer.webGLRenderer;

    this._presentingVR = this._vrDisplay !== null &&
        (this._vrDisplay.isPresenting === true ||
            (this._webVR === false && document[FORGE.Device.fullscreenElement] instanceof window.HTMLElement));

    var displaySize;

    if (this._presentingVR === true)
    {
        var eyeParamsL = this._vrDisplay.getEyeParameters("left");

        if (this._webVR === true)
        {
            this._eyeWidth = eyeParamsL.renderWidth;
            this._eyeHeight = eyeParamsL.renderHeight;

            this.log("Window size: " + window.innerWidth + "x" + window.innerHeight);
            this.log("Render size: " + this._eyeWidth + "x" + this._eyeHeight);

            this._leftBounds = [ 0.0, 0.0, 0.5, 1.0 ];
            this._rightBounds = [ 0.5, 0.0, 0.5, 1.0 ];

            if (this._vrDisplay.getLayers)
            {
                var layers = this._vrDisplay.getLayers();

                if (layers.length > 0 && layers[0].leftBounds !== null && layers[0].leftBounds.length === 4)
                {
                    this._leftBounds = layers[0].leftBounds;
                    this._rightBounds = layers[0].rightBounds;
                }
            }

            this.log("Bounds L:[" + this._leftBounds[0] + ", " + this._leftBounds[1] + ", " + this._leftBounds[2] + ", " + this._leftBounds[3] + "], " +
                            "R:[" + this._rightBounds[0] + ", " + this._rightBounds[1] + ", " + this._rightBounds[2] + ", " + this._rightBounds[3] + "]");
        }

        if (wasPresentingVR === false || this._vrDisplay.displayName === "Cardboard VRDisplay (webvr-polyfill)")
        {
            this._rendererPixelRatio = renderer.getPixelRatio();
            var size = renderer.getSize();
            this._rendererSizeScreen.width = size.width;
            this._rendererSizeScreen.height = size.height;

            if (this._vrDisplay.displayName === "Cardboard VRDisplay (webvr-polyfill)")
            {
                this._rendererSize = new FORGE.Size(size.height, size.width)
            }
            else
            {
                this._rendererSize = new FORGE.Size(this._eyeWidth * 2, this._eyeHeight);
            }

            renderer.setPixelRatio( 1 );
        }
    }
    else if (wasPresentingVR === true)
    {
        this._rendererSize = this._rendererSizeScreen;
        renderer.setPixelRatio( this._rendererPixelRatio );
    }

    // dispatch change event only when display is impacted
    if (this._presentingVR !== wasPresentingVR && this._onDisplayChange !== null)
    {
        this._onDisplayChange.dispatch();
    }
};

/**
 * Set fullscreen
 * @method FORGE.RenderDisplay#_setFullScreen
 * @param {boolean} status fullscreen status
 * @private
 */
FORGE.RenderDisplay.prototype._setFullScreen = function (status)
{
    var canvas = this._viewer.renderer.webGLRenderer.domElement;

    return new Promise(function (resolve, reject)
    {
        if (this._vrDisplay === null)
        {
            reject(new Error("No VR hardware found."));
            return;
        }

        if (this._presentingVR === status)
        {
            resolve();
            return;
        }

        if (this._webVR === true)
        {
            if (status)
            {
                resolve(this._vrDisplay.requestPresent([ { source: canvas } ] ));
            }
            else
            {
                resolve(this._vrDisplay.exitPresent());
            }
        }

    }.bind(this));
};

/**
 * VR controls reset routine
 * @method FORGE.RenderDisplay#_vrControlsReset
 * @private
 */
FORGE.RenderDisplay.prototype._vrControlsReset = function()
{
    if (this._vrDisplay !== null)
    {
        if (typeof this._vrDisplay.resetPose !== "undefined")
        {
            this._vrDisplay.resetPose();
        }
        else if (typeof this._vrDisplay.resetSensor !== "undefined")
        {
            // Deprecated API.
            this._vrDisplay.resetSensor();
        }
        else if (typeof this._vrDisplay.zeroSensor !== "undefined")
        {
            // Really deprecated API.
            this._vrDisplay.zeroSensor();
        }
    }
};

/**
 * Request presentation through VR display interface
 * @method FORGE.RenderDisplay#_requestPresent
 * @private
 */
FORGE.RenderDisplay.prototype._requestPresent = function()
{
    this._viewer.raf.stop();
    this._viewer.raf.start(this._vrDisplay);
    return this._setFullScreen(true);
};

/**
 * Exit presentation from VR display interface
 * @method FORGE.RenderDisplay#_exitPresent
 * @private
 */
FORGE.RenderDisplay.prototype._exitPresent = function()
{
    this._viewer.raf.stop();
    this._viewer.raf.start(window);
    return this._setFullScreen(false);
};

/**
 * Enable VR display
 * @method FORGE.RenderDisplay#enableVR
 */
FORGE.RenderDisplay.prototype.enableVR = function()
{
    this._requestPresent();
};

/**
 * Start or stop VR display
 * @method FORGE.RenderDisplay#disableVR
 */
FORGE.RenderDisplay.prototype.disableVR = function()
{
    this._exitPresent();
};

/**
 * Get camera orientation quaternion when presenting VR
 * @method FORGE.RenderDisplay#getQuaternionFromPose
 * @return {THREE.Quaternion} quaternion extracted from pose or null if vrDisplay is not available
 * @private
 */
FORGE.RenderDisplay.prototype.getQuaternionFromPose = function()
{
    if (this._vrDisplay === null)
    {
        return null;
    }

    var pose = null;
    if (this._frameData !== null && typeof this._frameData.pose !== "undefined")
    {
        pose = this._frameData.pose;
    }
    else
    {
        pose = this._vrDisplay.getPose();
    }

    if (pose === null || pose.orientation === null)
    {
        return new THREE.Quaternion();
    }

    var o = pose.orientation;
    return new THREE.Quaternion(-o[1], -o[0], -o[2], o[3]);
};

/**
 * Get render parameters
 * @method FORGE.RenderDisplay#getRenderParams
 * @return {Array<FORGE.RenderParams>} Returns an array of render parameters.
 */
FORGE.RenderDisplay.prototype.getRenderParams = function()
{
    var renderer = this._viewer.renderer.webGLRenderer;
    var canvas = renderer.domElement;
    var camera = this._viewer.renderer.camera;
    var renderParams = [];

    if (this._vrDisplay !== null && this._presentingVR === true)
    {
        // Setup render rectangle, that will be use as glViewport
        var rx = this._rendererSize.width * this._leftBounds[0],
        ry = this._rendererSize.height * this._leftBounds[1],
        rw = this._rendererSize.width * this._leftBounds[2],
        rh = this._rendererSize.height * this._leftBounds[3];

        var renderRectL = new FORGE.Rectangle(rx, ry, rw, rh);

        rx = this._rendererSize.width * this._rightBounds[0];
        ry = this._rendererSize.height * this._rightBounds[1];
        rw = this._rendererSize.width * this._rightBounds[2];
        rh = this._rendererSize.height * this._rightBounds[3];

        var renderRectR = new FORGE.Rectangle(rx, ry, rw, rh);

        renderParams.push(new FORGE.RenderParams(renderRectL, camera.left));
        renderParams.push(new FORGE.RenderParams(renderRectR, camera.right));
    }
    else
    {
        var rectangle = new FORGE.Rectangle(0, 0, this._rendererSizeScreen.width, this._rendererSizeScreen.height);
        var renderCamera = this._viewer.renderer.view.type === FORGE.ViewType.FLAT ? camera.flat : camera.main;
        renderParams.push(new FORGE.RenderParams(rectangle, renderCamera));
    }

    return renderParams;
};

/**
 * Set size of rendering objects
 * @method FORGE.RenderDisplay#setSize
 * @param {FORGE.Size} size - new renderer size
 */
FORGE.RenderDisplay.prototype.setSize = function(size)
{
    this._rendererSizeScreen = size;

    var renderer = this._viewer.renderer.webGLRenderer;
    renderer.setPixelRatio( 1 );
};

/**
 * Submit current frame to VR display interface
 * @method FORGE.RenderDisplay#submitFrame
 */
FORGE.RenderDisplay.prototype.submitFrame = function()
{
    if (this._webVR === true && this._vrDisplay !== null && this._presentingVR === true)
    {
        if (this._vrDisplay.capabilities.hasExternalDisplay === true || this._vrDisplay.displayName === "Cardboard VRDisplay (webvr-polyfill)")
        {
            this._vrDisplay.submitFrame();
        }
    }
};

/**
 * Destroy sequence
 * @method FORGE.RenderDisplay#destroy
 */
FORGE.RenderDisplay.prototype.destroy = function()
{
    this._removeFullscreenListener();

    this._vrDisplay = null;
    this._frameData = null;
    this._leftBounds = null;
    this._rightBounds = null;
    this._rendererSize = null;
    this._viewer = null;
};

/**
 * Presenting in VR or not.
 * @name FORGE.RenderDisplay#presentingVR
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.RenderDisplay.prototype, "presentingVR",
{
    /** @this {FORGE.RenderDisplay} */
    get: function()
    {
        return this._presentingVR;
    }
});

/**
 * Get the VR display.
 * @name FORGE.RenderDisplay#vrDisplay
 * @type {VRDisplay}
 * @readonly
 */
Object.defineProperty(FORGE.RenderDisplay.prototype, "vrDisplay",
{
    /** @this {FORGE.RenderDisplay} */
    get: function()
    {
        return this._vrDisplay;
    }
});

/**
 * Get the VR display.
 * @name FORGE.RenderDisplay#vrFrameData
 * @type {VRFrameData}
 * @readonly
 */
Object.defineProperty(FORGE.RenderDisplay.prototype, "vrFrameData",
{
    /** @this {FORGE.RenderDisplay} */
    get: function()
    {
        if(this._vrDisplay !== null && typeof this._vrDisplay.getFrameData === "function" && this._frameData !== null)
        {
            this._vrDisplay.getFrameData(this._frameData);
            return this._frameData;
        }

        return null;
    }
});

/**
 * Render size.
 * @name FORGE.RenderDisplay#rendererSize
 * @readonly
 * @type {FORGE.Size}
 */
Object.defineProperty(FORGE.RenderDisplay.prototype, "rendererSize",
{
    /** @this {FORGE.RenderDisplay} */
    get: function()
    {
        return this._rendererSize;
    }
});

/**
 * Get the onDisplayChange {@link FORGE.EventDispatcher}.
 * @name FORGE.RenderDisplay#onDisplayChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.RenderDisplay.prototype, "onDisplayChange",
{
    /** @this {FORGE.RenderDisplay} */
    get: function()
    {
        if(this._onDisplayChange === null)
        {
            this._onDisplayChange = new FORGE.EventDispatcher(this);
        }

        return this._onDisplayChange;
    }
});
