/**
 * ViewportRenderer class.
 *
 * @constructor FORGE.ViewportRenderer
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {FORGE.Viewport} viewport - viewport parent object
 * @extends {FORGE.BaseObject}
 */
FORGE.ViewportRenderer = function(viewer, viewport)
{
    /**
     * The viewer reference.
     * @name FORGE.ViewportRenderer#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene viewport parent object.
     * @name FORGE.ViewportRenderer#_viewport
     * @type {FORGE.Viewport}
     * @private
     */
    this._viewport = viewport;

    /**
     * Background renderer.
     * @name FORGE.ViewportRenderer#_backgroundRenderer
     * @type {FORGE.BackgroundRenderer}
     * @private
     */
    this._backgroundRenderer = null;

    /**
     * Scene effect Composer.
     * @name FORGE.ViewportRenderer#_composer
     * @type {FORGE.ViewportComposer}
     * @private
     */
    this._composer = null;

    FORGE.BaseObject.call(this, "ViewportRenderer");

    this._boot();
};

FORGE.ViewportRenderer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ViewportRenderer.prototype.constructor = FORGE.ViewportRenderer;

/**
 * Boot sequence.
 * @method FORGE.ViewportRenderer#_boot
 * @private
 */
FORGE.ViewportRenderer.prototype._boot = function()
{
    this._createBackgroundRenderer();

    if (this._viewport.fx.length > 0)
    {
        this._createComposer();
    }
};

/**
 * Create composer and render texture
 * @method FORGE.ViewportRenderer#_createComposer
 * @private
 */
FORGE.ViewportRenderer.prototype._createComposer = function()
{
    this._composer = new FORGE.ViewportComposer(this._viewer, this._viewport);
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
 * @method FORGE.ViewportRenderer#_createBackgroundRenderer
 * @private
 */
FORGE.ViewportRenderer.prototype._createBackgroundRenderer = function()
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
 * Render background and objects to the given target.
 * @method FORGE.ViewportRenderer#_renderToTarget
 * @param {FORGE.ObjectRenderer} objectRenderer - object renderer
 * @param {THREE.WebGLRenderTarget} target - render target
 * @private
 */
FORGE.ViewportRenderer.prototype._renderToTarget = function(objectRenderer, target)
{
    if (this._backgroundRenderer.ready === false)
    {
        return;
    }

    this._backgroundRenderer.render(target);
    this._viewer.renderer.webGLRenderer.clearTarget(target, false, true, false);
    objectRenderer.render(this._viewport, target);
};

/**
 * Render routine.
 * @method FORGE.ViewportRenderer#render
 * @param {FORGE.ObjectRenderer} objectRenderer - object renderer
 * @param {THREE.WebGLRenderTarget} target - render target
 */
FORGE.ViewportRenderer.prototype.render = function(objectRenderer, target)
{
    if (this._composer !== null)
    {
        this._composer.setSize(this._viewport.rectangle.size);
        this._renderToTarget(objectRenderer, this._composer.texture);
        this._composer.render();
    }
    else
    {
        this._renderToTarget(objectRenderer, target);
    }
};

/**
 * Destroy sequence.
 * @method FORGE.ViewportRenderer#destroy
 */
FORGE.ViewportRenderer.prototype.destroy = function()
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
 * @name FORGE.ViewportRenderer#background
 * @type {FORGE.BackgroundRenderer}
 */
Object.defineProperty(FORGE.ViewportRenderer.prototype, "background",
{
    /** @this {FORGE.ViewportRenderer} */
    get: function()
    {
        return this._backgroundRenderer;
    }
});
