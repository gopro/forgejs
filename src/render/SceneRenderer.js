/**
 * SceneRenderer class.
 *
 * @constructor FORGE.SceneRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {FORGE.SceneViewport} viewport - viewport parent object
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneRenderer = function(viewer, viewport)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene viewport parent object.
     * @name FORGE.SceneRenderer#_viewport
     * @type {FORGE.SceneViewport}
     * @private
     */
    this._viewport = viewport;

    /**
     * Background renderer.
     * @name FORGE.SceneRenderer#_backgroundRenderer
     * @type {FORGE.BackgroundRenderer}
     * @private
     */
    this._backgroundRenderer = null;

    /**
     * Scene effect Composer.
     * @name FORGE.SceneRenderer#_composer
     * @type {FORGE.SceneEffectComposer}
     * @private
     */
    this._composer = null;

    /**
     * Composer input texture.
     * @name FORGE.SceneRenderer#_composerTexture
     * @type {THREE.WebGLRenderTarget}
     * @private
     */
    this._composerTexture = null;

    FORGE.BaseObject.call(this, "SceneRenderer");

    this._boot();
};

FORGE.SceneRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneRenderer.prototype.constructor = FORGE.SceneRenderer;

/**
 * Boot sequence.
 * @method FORGE.SceneRenderer#_boot
 * @private
 */
FORGE.SceneRenderer.prototype._boot = function()
{
    this._createBackgroundRenderer();
    this._createComposer();
};

/**
 * Create composer and render texture
 * @method FORGE.SceneRenderer#_createComposer
 * @private
 */
FORGE.SceneRenderer.prototype._createComposer = function()
{
    if (this._viewport.fx.length === 0)
    {
        return;
    }

    if (this._composerTexture !== null)
    {
        this._composerTexture.dispose();
        this._composerTexture = null;
    }

    var rtParams =
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: false
    };

    // TODO : renderer should expose scene size for each frame, it could change during transitions
    this._composerTexture = new THREE.WebGLRenderTarget(this._viewport.size.width, this._viewport.size.height, rtParams);
    this._composerTexture.name = "Viewport-EffectComposer-Target-in-" + this._viewport.uid;

    this._composer = new FORGE.SceneEffectComposer(this._viewer, this._composerTexture, this._viewport.scene.renderTarget, this._viewport.fx);
};

/**
 * Create background renderer.
 *
 * Background renderer choice policy is based on media type and format
 *
 * - Media type grid: grid renderer
 *
 * - Type is image and source has some defined levels: pyramid renderer (multiresolution)

 * - Source format is equirectangular: shader renderer
 *   we should also use a mesh renderer and map the equirectangular texture on a sphere geometry
 *   this could be a good fallback on devices with cheap GPU where fragment shader rendering is top heavy
 *
 * - Source format is flat: plane renderer
 *
 * - Source format is cube: mesh renderer
 *
 * @method FORGE.SceneRenderer#_createBackgroundRenderer
 * @private
 */
FORGE.SceneRenderer.prototype._createBackgroundRenderer = function(event)
{
    var media = this._viewport.scene.media;
    var backgroundRendererRef;

    if (media.type === FORGE.MediaType.UNDEFINED)
    {
        backgroundRendererRef = FORGE.BackgroundRenderer;
    }
    else
    {
        if (media.type === FORGE.MediaType.GRID)
        {
            backgroundRendererRef = FORGE.BackgroundGridRenderer;
        }

        // Multi resolution is checked before other meshes as it is a special case of cube format
        else if (media.type === FORGE.MediaType.TILED)
        {
            backgroundRendererRef = FORGE.BackgroundPyramidRenderer;
        }

        else if(media.type === FORGE.MediaType.IMAGE || media.type === FORGE.MediaType.VIDEO)
        {
            if (media.source.format === FORGE.MediaFormat.EQUIRECTANGULAR)
            {
                // Background shader or mesh with sphere geometry
                // Default choice: using a shader renderer allows spherical transitions between scenes
                // Performance fallback: mesh sphere renderer
                if (this._viewport.vr === true)
                {
                    backgroundRendererRef = FORGE.BackgroundSphereRenderer;
                }
                else
                {
                    backgroundRendererRef = FORGE.BackgroundShaderRenderer;
                }
            }

            // Flat media format (beware: flat view is another thing)
            else if (media.source.format === FORGE.MediaFormat.FLAT)
            {
                backgroundRendererRef = FORGE.BackgroundShaderRenderer;
            }

            // Cube: mesh with cube geometry
            // Todo: add cube texel picking in shader to allow shader renderer usage and support spherical transitions
            else if (media.source.format === FORGE.MediaFormat.CUBE)
            {
                backgroundRendererRef = FORGE.BackgroundCubeRenderer;
            }
        }
    }

    this._backgroundRenderer = new backgroundRendererRef(this._viewer, this._viewport);
};

/**
 * Render routine.
 * @method FORGE.SceneRenderer#render
 */
FORGE.SceneRenderer.prototype.render = function()
{
    var target = this._composer !== null ? this._composerTexture : this._viewport.scene.renderTarget;

    this._backgroundRenderer.render(target);
    this._viewport.scene.viewports.objectRenderer.render(this._viewport, target);

    if (this._composer !== null)
    {
        this._composer.render();
    }
};

/**
 * Destroy sequence.
 * @method FORGE.SceneRenderer#destroy
 */
FORGE.SceneRenderer.prototype.destroy = function()
{
    this._config = null;
    this._viewer = null;

    if (this._composer !== null)
    {
        this._composer.destroy();
        this._composer = null;
    }

    if (this._backgroundRenderer !== null)
    {
        this._backgroundRenderer.destroy();
        this._backgroundRenderer = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the background renderer.
 * @name FORGE.SceneRenderer#backgroundRenderer
 * @type {FORGE.BackgroundRenderer}
 */
Object.defineProperty(FORGE.SceneRenderer.prototype, "background",
{
    /** @this {FORGE.SceneRenderer} */
    get: function()
    {
        return this._backgroundRenderer;
    }
});
