/**
 * FORGE.BackgroundRenderer
 * BackgroundRenderer class.
 *
 * @constructor FORGE.BackgroundRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {string=} type - The type of the object as long as many other object inherits from this one.
 * @extends {FORGE.BaseObject}
 */
FORGE.BackgroundRenderer = function(viewer, renderTarget, type)
{
    /**
     * @name FORGE.BackgroundRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * @name FORGE.BackgroundRenderer#_canvas
     * @type {FORGE.Canvas}
     * @private
     */
    this._canvas = null;

    /**
     * The mesh (cube) the video is on.
     * @type {THREE.Mesh}
     * @private
     */
    this._mesh = null;

    /**
     * @name FORGE.BackgroundRenderer#_scene
     * @type {THREE.Scene}
     * @private
     */
    this._scene = null;

    /**
     * @name FORGE.BackgroundRenderer#_camera
     * @type {THREE.Camera}
     * @private
     */
    this._camera = null;

    /**
     * @name FORGE.BackgroundRenderer#_renderTarget
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTarget = renderTarget || null;

    FORGE.BaseObject.call(this, type || "BackgroundRenderer");

    this._boot();
};

FORGE.BackgroundRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.BackgroundRenderer.prototype.constructor = FORGE.BackgroundRenderer;

/**
 * Init routine.
 * @method FORGE.BackgroundRenderer#_boot
 * @private
 */
FORGE.BackgroundRenderer.prototype._boot = function()
{
    this._scene = new THREE.Scene();

    if (this._renderTarget === null)
    {
        var width = this._viewer.renderer.canvasResolution.width;
        var height = this._viewer.renderer.canvasResolution.height;

        var rtParams =
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };

        this._renderTarget = new THREE.WebGLRenderTarget(width, height, rtParams);
    }
};

/**
 * Update texture if needed (video only).
 * @method FORGE.BackgroundRenderer#_updateTexture
 * @private
 */
FORGE.BackgroundRenderer.prototype._updateTexture = function()
{
    // doesn't refresh when there is no texture or texture container and when a video as WebGL texture is paused
    if (this._texture === null || this._textureCanvas === null ||
        this._textureContext === null || this._displayObject === null ||
        this._displayObject.element === null || (FORGE.Utils.isTypeOf(this._displayObject, ["VideoHTML5", "VideoDash"]) === true && this._displayObject.playing === false))
    {
        return;
    }

    var video = this._displayObject.element;
    if (video instanceof HTMLVideoElement && video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
    {
        if (this._textureContext)
        {
            this._textureContext.drawImage(video,
                0, 0, video.videoWidth, video.videoHeight,
                0, 0, this._textureCanvas.width, this._textureCanvas.height);
            this._texture.needsUpdate = true;
            this.log("texture update done");
        }
    }
};

/**
 * Update after view change
 * @todo change name of this method to be more generic (used by init and )
 * Should be overriden by subclass
 * @method FORGE.BackgroundRenderer#updateAfterViewChange
 */
FORGE.BackgroundRenderer.prototype.updateAfterViewChange = function()
{
    throw new Error(this._className + "::updateAfterViewChange not implemented");
};

/**
 * Update size (resolution)
 * @method FORGE.BackgroundRenderer#setSize
 * @param {FORGE.Size} size - size [px]
 */
FORGE.BackgroundRenderer.prototype.setSize = function(size)
{
    if (this.renderTarget !== null)
    {
        this.renderTarget.setSize(size.width, size.height);
    }
};

/**
 * Render routine.
 * @method FORGE.BackgroundRenderer#render
 * @param {THREE.PerspectiveCamera} camera - perspective camera with mesh rendering, N/A with shader rendering (null)
 */
FORGE.BackgroundRenderer.prototype.render = function(camera)
{
    if (this._viewer.renderer === null || this._renderTarget === null)
    {
        return;
    }

    this._updateTexture();

    if (camera !== null)
    {
        this._viewer.renderer.webGLRenderer.render ( this._scene, camera, this._renderTarget, true );
    }
    else
    {
        this._viewer.renderer.webGLRenderer.render ( this._scene, this._camera, this._renderTarget, true );
    }
};

/**
 * Update routine.
 * @method FORGE.BackgroundRenderer#update
 */
FORGE.BackgroundRenderer.prototype.update = function()
{
    if (!(this._mesh.material instanceof THREE.ShaderMaterial))
    {
        return;
    }

    var resolution = this._viewer.renderer.displayResolution;

    if (this._mesh.material.uniforms.hasOwnProperty("tViewportResolution"))
    {
        this._mesh.material.uniforms.tViewportResolution.value = new THREE.Vector2(resolution.width, resolution.height);
    }

    if (this._mesh.material.uniforms.hasOwnProperty("tViewportResolutionRatio"))
    {
        this._mesh.material.uniforms.tViewportResolutionRatio.value = resolution.ratio;
    }

    if (this._mesh.material.uniforms.hasOwnProperty("tModelViewMatrixInverse"))
    {
        this._mesh.material.uniforms.tModelViewMatrixInverse.value = this._viewer.renderer.camera.modelViewInverse;
    }


    this._viewer.renderer.view.updateUniforms(this._mesh.material.uniforms);
};

/**
 * Destroy sequence.
 * @method FORGE.BackgroundRenderer#destroy
 */
FORGE.BackgroundRenderer.prototype.destroy = function()
{
    this._camera = null;

    if (this._renderTarget !== null)
    {
        this._renderTarget.dispose();
        this._renderTarget = null;
    }

    while (this._scene.children.length > 0)
    {
        var mesh = this._scene.children.pop();

        if (mesh.geometry !== null)
        {
            mesh.geometry.dispose();
            mesh.geometry = null;
        }

        this._scene.remove(mesh);
    }

    this._scene = null;
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get texture size.
 * @name FORGE.BackgroundRenderer#textureSize
 * @type {FORGE.Size}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "textureSize",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        if (this._texture === null || typeof this._texture.image === "undefined") {
            return null;
        }

        return new FORGE.Size(this._texture.image.width, this._texture.image.height);
    }
});

/**
 * Get background render target.
 * @name FORGE.BackgroundRenderer#renderTarget
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "renderTarget",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._renderTarget;
    }
});

/**
 * Get/Set background renderer displayObject.
 * @name FORGE.BackgroundRenderer#displayObject
 * @type {string}
 */
Object.defineProperty(FORGE.BackgroundRenderer.prototype, "displayObject",
{
    /** @this {FORGE.BackgroundRenderer} */
    get: function()
    {
        return this._displayObject;
    },
    /** @this {FORGE.BackgroundRenderer} */
    set: function(value)
    {
        if (value === null)
        {
            this._clear();
        }
        else
        {
            this._setDisplayObject(value);
        }
    }
});
