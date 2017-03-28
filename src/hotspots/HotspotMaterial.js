/**
 * Hotspot material handles the parse of the material config and the loading of the needed ressource.<br>
 * In the end it provides a THREE.MeshBasicMaterial when the ressources are loaded.
 *
 * @constructor FORGE.HotspotMaterial
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotMaterial = function(viewer, hotspotUid)
{
    /**
     * Viewer reference.
     * @name  FORGE.HotspotMaterial#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The hotspot uid
     * @name FORGE.HotspotMaterial#_hotspotUid
     * @type {string}
     * @private
     */
    this._hotspotUid = hotspotUid;

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
     * @type {THREE.Texture|THREE.CanvasTexture}
     * @private
     */
    this._texture = null;

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
     * @type {(FORGE.Image|FORGE.DisplayObject)}
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
     * Ready flag
     * @name FORGE.HotspotMaterial#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

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
 * @name FORGE.HotspotMaterial.types.SPRITE
 * @type {string}
 * @const
 */
FORGE.HotspotMaterial.types.SPRITE = "sprite";

/**
 * @name FORGE.HotspotMaterial.types.VIDEO
 * @type {string}
 * @const
 */
FORGE.HotspotMaterial.types.VIDEO = "video";

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

    // Hotspot with animated sprite as background
    else if (typeof config.sprite !== "undefined" && config.sprite !== null)
    {
        this._setupWithSprite(config.sprite);
    }

    // Hotspot with video as background
    else if (typeof config.video !== "undefined" && config.video !== null)
    {
        this._setupWithVideo(config.video);
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

    // If the config is a string, we assume that this is the image url.
    // We convert the config into a image config object.
    if(typeof config === "string")
    {
        config = { url: config };
    }

    //Force the render mode to canvas
    config.renderMode = FORGE.Image.renderModes.CANVAS;

    this._displayObject = new FORGE.Image(this._viewer, config);
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

    this.log("image load complete : " + image.element.src);
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

    this._texture = new THREE.Texture();

    this.setTextureFrame(image.frame);

    this.log("create texture from image");

    this._setupComplete();
};

/**
 * Setup hotspot material with a sprite as texture.
 * @method FORGE.HotspotMaterial#_setupWithSprite
 * @param {(string|SpriteConfig)} config - The sprite configuration you want to load and use as a texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._setupWithSprite = function(config)
{
    this._type = FORGE.HotspotMaterial.types.SPRITE;
    this._update = true;

    this._displayObject = new FORGE.Sprite(this._viewer, config);
    this._displayObject.onLoadComplete.addOnce(this._spriteLoadCompleteHandler, this);
};

/**
 * Sprite loaded event handler for the sprite setup.
 * @method FORGE.HotspotMaterial#_spriteLoadCompleteHandler
 * @param {FORGE.Event} event - load event
 * @private
 */
FORGE.HotspotMaterial.prototype._spriteLoadCompleteHandler = function(event)
{
    var sprite = /** @type {FORGE.Sprite} */ (event.emitter);

    this.log("sprite load complete");
    this._createTextureFromSprite(sprite);
};

/**
 * Create a THREE.Texture from the loaded FORGE.Sprite
 * @method  FORGE.HotspotMaterial#_createTextureFromSprite
 * @param  {FORGE.Sprite} sprite - The FORGE.Sprite used to create the texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._createTextureFromSprite = function(sprite)
{
    this._texture = new THREE.Texture();

    this.setTextureFrame(sprite.frame);

    this.log("create texture from sprite");

    this._setupComplete();
};

/**
 * Setup hotspot material with a video as texture.
 * @method FORGE.HotspotMaterial#_setupWithVideo
 * @param {(string|VideoConfig)} config - The video configuration you want to load and use as a texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._setupWithVideo = function(config)
{
    this._type = FORGE.HotspotMaterial.types.VIDEO;
    this._update = true;

    this._displayObject = new FORGE.VideoHTML5(this._viewer, this._hotspotUid+"-material-video");
    this._displayObject.currentTime = 100000;
    this._displayObject.onLoadedMetaData.addOnce(this._videoLoadedMetaDataHandler, this);
    this._displayObject.load(config.url);
};

/**
 * Video meta data loaded event handler for the video setup.
 * @method FORGE.HotspotMaterial#_videoLoadedMetaDataHandler
 * @param {FORGE.Event} event - load event
 * @private
 */
FORGE.HotspotMaterial.prototype._videoLoadedMetaDataHandler = function(event)
{
    var video = /** @type {FORGE.VideoBase} */ (event.emitter);
    video.play();

    this.log("video load complete");
    this._createTextureFromVideo(video);
};

/**
 * Create a THREE.Texture from the loaded FORGE.Video
 * @method FORGE.HotspotMaterial#_createTextureFromVideo
 * @param {FORGE.VideoBase} video - The FORGE.Video used to create the texture.
 * @private
 */
FORGE.HotspotMaterial.prototype._createTextureFromVideo = function(video)
{
    this.log("create texture from video");

    this._texture = new THREE.Texture();
    this._texture.image = video.element;
    this._texture.generateMipmaps = false;
    this._texture.minFilter = THREE.LinearFilter;

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

    this.log("create texture from plugin");

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
    this._createShaderMaterial();

    this._ready = true;

    if (this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * Create the THREE.MeshBasicMaterial that will be used on a THREE.Mesh
 * @method FORGE.HotspotMaterial#_createShaderMaterial
 * @private
 */
FORGE.HotspotMaterial.prototype._createShaderMaterial = function()
{
    this.log("create shader material");

    if(this._viewer.renderer.view.current === null)
    {
        return;
    }

    if (this._material !== null)
    {
        this._material.dispose();
        this._material = null;
    }

    var shader = FORGE.Utils.clone(this._viewer.renderer.view.current.shaderWTS.mapping);

    if (this._type === FORGE.HotspotMaterial.types.GRAPHICS)
    {
        shader.fragmentShader = FORGE.ShaderChunk.wts_frag_color;
        shader.uniforms.tColor = { type: "c", value: new THREE.Color(this._color) };
    }

    shader.uniforms.tOpacity = { type: "f", value: this._opacity };

    var vertexShader = FORGE.ShaderLib.parseIncludes(shader.vertexShader);
    var fragmentShader = FORGE.ShaderLib.parseIncludes(shader.fragmentShader);

    this._material = new THREE.RawShaderMaterial(
    {
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: /** @type {FORGEUniform} */ (shader.uniforms),
        side: THREE.DoubleSide,
        name: "HotspotMaterial"
    });

    if (this._texture !== null)
    {
        //Apply transparent parameter only if we have a texture.
        this._material.transparent = this._transparent;
        this._material.needsUpdate = true;
    }
};

FORGE.HotspotMaterial.prototype.updateShader = function()
{
    this._createShaderMaterial();
};

/**
 * Load a material configuration
 * @method FORGE.HotspotMaterial#load
 * @param  {HotspotMaterialConfig} config - The hotspot material configuration object.
 */
FORGE.HotspotMaterial.prototype.load = function(config)
{
    this._config = config;
    this._ready = false;
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
 * Set texture frame
 * @method FORGE.HotspotMaterial#setTextureFrame
 * @param {FORGE.Rectangle=} frame - texture frame
 */
FORGE.HotspotMaterial.prototype.setTextureFrame = function(frame)
{
    // Only support type IMAGE and SPRITE
    if (this._displayObject === null || (this._type !== FORGE.HotspotMaterial.types.IMAGE && this._type !== FORGE.HotspotMaterial.types.SPRITE))
    {
        return;
    }

    var textureFrame = frame || new FORGE.Rectangle(0, 0, this._displayObject.element.naturalWidth, this._displayObject.element.naturalHeight);

    this._displayObject.frame = textureFrame;

    this._texture.image = this._displayObject.canvas;
    this._texture.image.crossOrigin = "anonymous";
    this._texture.needsUpdate = true;

    this.update();
};

/**
 * Destroy sequence.
 * @method FORGE.HotspotMaterial#destroy
 */
FORGE.HotspotMaterial.prototype.destroy = function()
{
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
 * @type {(FORGE.Image|FORGE.DisplayObject)}
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
 * Get the ready flag of this hotspot material.
 * @name FORGE.HotspotMaterial#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.HotspotMaterial.prototype, "ready",
{
    /** @this {FORGE.HotspotMaterial} */
    get: function()
    {
        return this._ready;
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