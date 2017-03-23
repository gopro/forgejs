/**
 * Hotspot material handles the parse of the material config and the loading of the needed ressource.<br>
 * In the end it provides a THREE.MeshBasicMaterial when the ressources are loaded.
 *
 * @constructor FORGE.HotspotMaterial
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotMaterial = function(viewer)
{
    /**
     * Viewer reference.
     * @name  FORGE.HotspotMaterial#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Hotspot material config
     * @name FORGE.HotspotMaterial#_config
     * @type {?HotspotMaterialConfig}
     * @private
     */
    this._config = null;

    /**
     * Material input type.<br>
     * Can be one of the values listed in FORGE.HotspotMaterial.types
     * @name  FORGE.HotspotMaterial#_type
     * @type {string}
     * @private
     */
    this._type = "";

    /**
     * THREE texture.
     * @name  FORGE.HotspotMaterial#_texture
     * @type {THREE.Texture}
     * @private
     */
    this._texture = null;

    /**
     * Texture frame.
     * @name FORGE.HotspotMaterial#_textureFrame
     * @type {FORGE.Rectangle}
     * @private
     */
    this._textureFrame = null;

    /**
     * THREE material.
     * @name  FORGE.HotspotMaterial#_material
     * @type {THREE.RawShaderMaterial}
     * @private
     */
    this._material = null;

    /**
     * The opacity of the material (between 0 and 1)
     * @name  FORGE.HotspotMaterial#_opacity
     * @type {number}
     * @default
     * @private
     */
    this._opacity = 1;

    /**
     * The transparent flag of the material.<br>
     * if you use a PNG file as texture with some transparency, you have to set this to true.
     * @name  FORGE.HotspotMaterial#_transparent
     * @type {boolean}
     * @default
     * @private
     */
    this._transparent = false;

    /**
     * The base color of the material.<br>
     * Can be a number 0xff0000 or a string: rgb(255, 0, 0), rgb(100%, 0%, 0%), hsl(0, 100%, 50%), #ff0000.
     * @name  FORGE.HotspotMaterial#_opacity
     * @type {(number|string)}
     * @default
     * @private
     */
    this._color = 0xffffff;

    /**
     * The display object used for the texture
     * @name  FORGE.HotspotMaterial#_displayObject
     * @type {(FORGE.ImageScalable|FORGE.DisplayObject)}
     * @private
     */
    this._displayObject = null;

    /**
     * Does this material needs update
     * @name FORGE.HotspotMaterial#_update
     * @type {boolean}
     * @private
     */
    this._update = false;

    /**
     * The onReady event dispatcher.
     * @name  FORGE.HotspotMaterial#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    FORGE.BaseObject.call(this, "HotspotMaterial");
};

FORGE.HotspotMaterial.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotMaterial.prototype.constructor = FORGE.HotspotMaterial;

/**
 * Material input type list.
 * @name FORGE.HotspotMaterial.types
 * @type {Object}
 * @const
 */
FORGE.HotspotMaterial.types = {};

/**
 * @name FORGE.HotspotMaterial.types.IMAGE
 * @type {string}
 * @const
 */
FORGE.HotspotMaterial.types.IMAGE = "image";

/**
 * @name FORGE.HotspotMaterial.types.PLUGIN
 * @type {string}
 * @const
 */
FORGE.HotspotMaterial.types.PLUGIN = "plugin";

/**
 * @name FORGE.HotspotMaterial.types.GRAPHICS
 * @type {string}
 * @const
 */
FORGE.HotspotMaterial.types.GRAPHICS = "graphics";


/**
 * Materials presets.
 * @name FORGE.HotspotMaterial.presets
 * @type {Object}
 * @const
 */
FORGE.HotspotMaterial.presets = {};

/**
 * @name FORGE.HotspotMaterial.presets.TRANSPARENT
 * @type {HotspotMaterialConfig}
 * @const
 */
FORGE.HotspotMaterial.presets.TRANSPARENT =
{
    color: "#ffffff",
    opacity: 0,
    transparent: false
};

/**
 * @name FORGE.HotspotMaterial.presets.DEBUG
 * @type {HotspotMaterialConfig}
 * @const
 */
FORGE.HotspotMaterial.presets.DEBUG =
{
    color: "#00ff00",
    opacity: 0.8,
    transparent: false
};

/**
 * Parse the configuration object.
 * @method FORGE.HotspotMaterial#_parseConfig
 * @param  {HotspotMaterialConfig} config - Configuration object of the material.
 * @private
 */
FORGE.HotspotMaterial.prototype._parseConfig = function(config)
{
    this._opacity = (typeof config.opacity === "number") ? FORGE.Math.clamp(config.opacity, 0, 1) : 1;
    this._transparent = (typeof config.transparent === "boolean") ? config.transparent : false;
    this._color = (typeof config.color === "string") ? config.color : 0xffffff;
    this._update = (typeof config.update === "boolean") ? config.update : false;

    // Hotspot with image as background
    if (typeof config.image !== "undefined" && config.image !== null)
    {
        this._setupWithImage(config.image);
    }

    // Hotspot with plugin that provide a texture as background
    else if (typeof config.plugin !== "undefined" && config.plugin !== null)
    {
        this._setupWithPlugin(config.plugin);
    }

    // Hotspot with graphical options as background
    else
    {
        this._setupWithGraphics();
    }

    // Nothing is defined, don't know what to do
    // else
    // {
    //     throw new Error("Unknown hotspot material texture input");
    // }
};

/**
 * Setup hotspot material with an image as texture.
 * @method FORGE.HotspotMaterial#_setupWithImage
 * @param {(string|ImageConfig)} config - The image configuration you want to load and use as a texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._setupWithImage = function(config)
{
    this._type = FORGE.HotspotMaterial.types.IMAGE;

    this._displayObject = new FORGE.ImageScalable(this._viewer, config);
    this._displayObject.onLoadComplete.addOnce(this._imageLoadCompleteHandler, this);
};

/**
 * Image loaded event handler for the image setup.
 * @method FORGE.HotspotMaterial#_imageLoadCompleteHandler
 * @param {FORGE.Event} event - load event
 * @private
 */
FORGE.HotspotMaterial.prototype._imageLoadCompleteHandler = function(event)
{
    var image = /** @type {FORGE.Image} */ (event.emitter);

    this.log("Texture load complete (Image) : " + image.element.src);
    this._createTextureFromImage(image);
};

/**
 * Create a THREE.Texture from the loaded FORGE.Image
 * @method  FORGE.HotspotMaterial#_createTextureFromImage
 * @param  {FORGE.Image} image - The FORGE.Image used to create the texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._createTextureFromImage = function(image)
{
    this._displayObject = image;

    this.setTextureFrame();

    this._texture.image.crossOrigin = "anonymous";

    this.log("Map new texture from image");

    this._setupComplete();
};

/**
 * Create a hotspot with a plugin that will provide a texture as input.
 * @method FORGE.HotspotMaterial#_setupWithPlugin
 * @param {string} config - The plugin instance UID you want to use as a texture provider.<br>
 * The plugin have to have a "texture" public property.
 * @private
 */
FORGE.HotspotMaterial.prototype._setupWithPlugin = function(config)
{
    this._type = FORGE.HotspotMaterial.types.PLUGIN;

    var plugin = this._viewer.plugins.get(config);

    if (typeof plugin === "undefined" || plugin === null)
    {
        this._viewer.plugins.onInstanceCreate.add(this._pluginInstanceCreateHandler, this);
    }
    else
    {
        this._setPlugin(plugin);
    }
};

/**
 * Plugin instance create event handler.
 * @method FORGE.HotspotMaterial#_pluginInstanceCreateHandler
 * @param {FORGE.Event} event - instance create event
 * @private
 */
FORGE.HotspotMaterial.prototype._pluginInstanceCreateHandler = function(event)
{
    var plugin = /** @type {FORGE.Plugin} */ (event.data);

    if (plugin.uid === this._config.plugin)
    {
        this._viewer.plugins.onInstanceCreate.remove(this._pluginInstanceCreateHandler, this);
        this._setPlugin(plugin);
    }
};

/**
 * Once the plugin is created by the manager we can set the plugin that we will provide the texture.
 * This method will check if the instance is ready, if not will setup a listener.
 * @method FORGE.HotspotMaterial#_setPlugin
 * @param {FORGE.Plugin} plugin - The plugin that will provides the texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._setPlugin = function(plugin)
{
    if (plugin.instanceReady === true)
    {
        this._createTextureFromPlugin(plugin);
    }
    else
    {
        plugin.onInstanceReady.addOnce(this._pluginInstanceReadyHandler, this);
    }
};

/**
 * Plugin instance ready event handler.
 * @method FORGE.HotspotMaterial#_pluginInstanceReadyHandler
 * @param {FORGE.Event} event - instance ready event
 * @private
 */
FORGE.HotspotMaterial.prototype._pluginInstanceReadyHandler = function(event)
{
    var plugin = /** @type {FORGE.Plugin} */ (event.emitter);

    if (plugin.instance === null || plugin.instanceReady === false)
    {
        throw new Error("Plugin instance not available");
    }

    this._createTextureFromPlugin(plugin);
};

/**
 * Create a texture from a plugin that provides a display object on a "texture" property.
 * @method FORGE.HotspotMaterial#_createTextureFromPlugin
 * @param {FORGE.Plugin} plugin - plugin that provides the texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._createTextureFromPlugin = function(plugin)
{
    this._displayObject = plugin.instance.texture;

    this._texture = new THREE.Texture(this._displayObject.dom);
    this._texture.format = THREE.RGBAFormat;
    this._texture.minFilter = THREE.LinearFilter;
    this._texture.generateMipmaps = false;
    this._texture.needsUpdate = true;

    this.log("Map new texture from plugin");

    this._setupComplete();
};

/**
 * Create a hotspot material with graphical attributes.
 * @method FORGE.HotspotMaterial#_setupWithGraphics
 * @private
 * @todo Make a config to use only graphical properties
 */
FORGE.HotspotMaterial.prototype._setupWithGraphics = function()
{
    this._type = FORGE.HotspotMaterial.types.GRAPHICS;

    this._setupComplete();
};

/**
 * This is the final setup step when any of the loading or wainting instance ready process is complete.
 * @method FORGE.HotspotMaterial#_setupComplete
 * @private
 */
FORGE.HotspotMaterial.prototype._setupComplete = function()
{
    this._createMaterial();
};

/**
 * Callback triggered on view ready
 * @method FORGE.HotspotMaterial#_onViewReady
 * @private
 */
FORGE.HotspotMaterial.prototype._onViewReady = function()
{
    if (this._material !== null)
    {
        this._material.dispose();
        this._material = null;
    }

    var shader = FORGE.Utils.clone(this._viewer.renderer.view.shaderWTS.mapping);

    if (this._type === FORGE.HotspotMaterial.types.GRAPHICS)
    {
        shader.fragmentShader = FORGE.ShaderChunk.wts_frag_color;
        shader.uniforms.tColor = { type: "c", value: new THREE.Color( 0x202020 ) };
    }
    shader.uniforms.tOpacity = { type: "f", value: this._opacity };

    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    this._material = new THREE.RawShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        // wireframe: true,
        side: THREE.DoubleSide,
        name: "HotspotMaterial"
    });

    if (this._texture !== null)
    {
        //Apply transparent parameter only if we have a texture.
        this._material.transparent = this._transparent;
        this._material.needsUpdate = true;
    }

    if (this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * Create the THREE.MeshBasicMaterial that will be used on a THREE.Mesh.<br>
 * @method FORGE.HotspotMaterial#_createMaterial
 * @private
 */
FORGE.HotspotMaterial.prototype._createMaterial = function()
{
    if (this._viewer.renderer.viewReady === true)
    {
        this._onViewReady();
    }

    this._viewer.renderer.onViewReady.add(this._onViewReady, this);
};

/**
 * Load a material configuration
 * @method FORGE.HotspotMaterial#load
 * @param  {HotspotMaterialConfig} config - The hotspot material configuration object.
 */
FORGE.HotspotMaterial.prototype.load = function(config)
{
    this._config = config;
    this._parseConfig(this._config);
};

/**
 * Update method taht will be called by the Hotspot.
 * @method FORGE.HotspotMaterial#update
 */
FORGE.HotspotMaterial.prototype.update = function()
{
    if (this._material && this._material.uniforms)
    {
        this._material.uniforms.tTexture.value = this._texture;
        this._material.uniforms.tOpacity.value = this._opacity;
    }

    if(this._texture !== null && this._update === true)
    {
        this._texture.needsUpdate = true;
    }
};


/**
 * Set texture source
 * @method FORGE.HotspotMaterial#setTextureSource
 * @param {FORGE.Image} image - texture source image
 */
FORGE.HotspotMaterial.prototype.setTextureSource = function(image)
{
    if (this._displayObject !== null) {
        this._displayObject.destroy();
        this._displayObject = null;
    }

    this._displayObject = image;

    this.setTextureFrame();
};

/**
 * Set texture frame
 * @method FORGE.HotspotMaterial#setTextureFrame
 * @param {FORGE.Rectangle=} frame - texture frame
 */
FORGE.HotspotMaterial.prototype.setTextureFrame = function(frame)
{
    // Only support type IMAGE at the moment
    if (this._displayObject === null ||
        this._type !== FORGE.HotspotMaterial.types.IMAGE) {
        return;
    }

    var rSrc = frame || new FORGE.Rectangle(0, 0, this._displayObject.element.naturalWidth, this._displayObject.element.naturalHeight);
    var rDst = new FORGE.Rectangle(0, 0, rSrc.width, rSrc.height);

    this._textureFrame = rSrc;

    var canvas = document.createElement("canvas");
    canvas.width = rSrc.width;
    canvas.height = rSrc.height;

    var context = canvas.getContext("2d");
    context.drawImage(this._displayObject.element,
        rSrc.x, rSrc.y, rSrc.width, rSrc.height,
        rDst.x, rDst.y, rDst.width, rDst.height);

    this._texture = new THREE.CanvasTexture(canvas);
    this._texture.needsUpdate = true;

    this.update();
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotTransform#destroy
 */
FORGE.HotspotMaterial.prototype.destroy = function()
{
    this._viewer.renderer.onViewReady.remove(this._onViewReady, this);

    this._textureFrame = null;

    if (this._texture !== null)
    {
        this._texture.dispose();
        this._texture = null;
    }

    if (this._material !== null)
    {
        this._material.dispose();
        this._material = null;
    }

    if(this._type === FORGE.HotspotMaterial.types.IMAGE && this._displayObject !== null)
    {
        this._displayObject.destroy();
    }
    this._displayObject = null;

    if(this._onReady !== null)
    {
        this._onReady.destroy();
        this._onReady = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the type of texture provider of this hotspot material.
 * @name FORGE.HotspotMaterial#type
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "type",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._type;
    }
});

/**
 * Get the THREE.Texture used for this hotspot material.
 * @name FORGE.HotspotMaterial#texture
 * @readonly
 * @type {THREE.Texture}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "texture",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._texture;
    }
});

/**
 * Get the THREE.MeshBasicMaterial used for this hotspot material.
 * @name FORGE.HotspotMaterial#material
 * @readonly
 * @type {THREE.MeshBasicMaterial}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "material",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._material;
    }
});

/**
 * Get the opacity of this hotspot material.
 * @name FORGE.HotspotMaterial#opacity
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "opacity",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._opacity;
    }
});

/**
 * Get the transparent flag of this hotspot material.
 * @name FORGE.HotspotMaterial#transparent
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "transparent",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._transparent;
    }
});

/**
 * Get the color of this hotspot material.
 * @name FORGE.HotspotMaterial#color
 * @readonly
 * @type {(string|number)}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "color",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._color;
    }
});

/**
 * Get the displayObject of this hotspot material.
 * @name FORGE.HotspotMaterial#displayObject
 * @readonly
 * @type {(FORGE.ImageScalable|FORGE.DisplayObject)}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "displayObject",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._displayObject;
    }
});

/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of this hotspot material.<br/>
 * Dispatched when the material texture is loaded and ready to be used by a THREE.Texture.
 * @name FORGE.HotspotMaterial#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "onReady",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        if (this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});