/**
 * Scene Parser class.
 *
 * @constructor FORGE.SceneParser
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {SceneConfig} config input scene configuration from json
 * @extends {FORGE.BaseObject}
 *
 */
FORGE.SceneParser = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneParser#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Initial config
     * @name FORGE.SceneParser#_config
     * @type {SceneConfig}
     * @private
     */
    this._config = config;

    /**
     * The internationalizable name of the scene.
     * @name FORGE.Scene#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The internationalizable slug name of the scene.
     * @name FORGE.Scene#_slug
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._slug = null;

    /**
     * The internationalizable description of the scene.
     * @name FORGE.Scene#_description
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._description = null;

    FORGE.BaseObject.call(this, "SceneParser");

    this._boot();
};

FORGE.SceneParser.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneParser.prototype.constructor = FORGE.SceneParser;

/**
 * Init routine
 * @method FORGE.SceneParser#_boot
 * @private
 */
FORGE.SceneParser.prototype._boot = function()
{
    // UID and tags will be registrered into FORGE.Scene
    this._uid = this._config.uid;
    this._tags = this._config.tags;

    this._name = new FORGE.LocaleString(this._viewer, this._config.name);
    this._slug = new FORGE.LocaleString(this._viewer, this._config.slug);
    this._description = new FORGE.LocaleString(this._viewer, this._config.description);
};

/**
 * Extend the init scene config
 * @method FORGE.SceneParser#extendConfiguration
 * @param {Object} data - Extended configuration data.
 */
FORGE.SceneParser.prototype.extendConfiguration = function(data)
{
    this._config = /** @type {SceneConfig} */ (FORGE.Utils.extendSimpleObject(this._config, data));
};

/**
 * Know if the scene has sound source?
 * @method FORGE.SceneParser#hasSoundSource
 * @return {boolean} Returns true if the scene has a sound source, false if not.
 */
FORGE.SceneParser.prototype.hasSoundSource = function()
{
    if (typeof this._config.sound !== "undefined" && typeof this._config.sound.source !== "undefined" && ((typeof this._config.sound.source.url !== "undefined" && this._config.sound.source.url !== "") || (typeof this._config.sound.source.target !== "undefined" && this._config.sound.source.target !== "")))
    {
        return true;
    }

    return false;
};

/**
 * Know if the scene has sound target as source?
 * @method FORGE.SceneParser#hasSoundTarget
 * @param {string} uid - The target source UID to verify.
 * @return {boolean} Returns true if the scene has a sound source target, false if not.
 */
FORGE.SceneParser.prototype.hasSoundTarget = function(uid)
{
    if (typeof this._config.sound !== "undefined" && typeof this._config.sound.source !== "undefined" && typeof this._config.sound.source.target !== "undefined" && this._config.sound.source.target !== "" && this._config.sound.source.target === uid)
    {
        return true;
    }

    return false;
};

/**
 * Know if an ambisonic sound is attached to the scene?
 * @method FORGE.SceneParser#isAmbisonic
 * @return {boolean} Returns true if the scene has an ambisonic sound source, false if not.
 */
FORGE.SceneParser.prototype.isAmbisonic = function()
{
    //@todo real check of the UID target object rather then the isAmbisonic method of the FORGE.SceneParser
    if (this.hasSoundSource() === true && this._config.sound.type === FORGE.SoundType.AMBISONIC)
    {
        return true;
    }

    return false;
};

/**
 * Destroy method
 * @method FORGE.SceneParser#destroy
 */
FORGE.SceneParser.prototype.destroy = function()
{
    this._viewer = null;

    this._name.destroy();
    this._name = null;

    this._slug.destroy();
    this._slug = null;

    this._description.destroy();
    this._description = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the UID of the scene.
 * @name FORGE.SceneParser#uid
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "uid",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._uid;
    }
});

/**
 * Get the name of the scene.
 * @name FORGE.SceneParser#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "name",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._name.value;
    }
});

/**
 * Get the slug name of the scene.
 * @name FORGE.SceneParser#slug
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "slug",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._slug.value;
    }
});

/**
 * Get the description of the scene.
 * @name FORGE.SceneParser#description
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "description",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._description.value;
    }
});

/**
 * Get the tags Array.
 * @name  FORGE.SceneParser#tags
 * @readonly
 * @type {Array}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "tags",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._tags;
    }
});

/**
 * Get the background of the scene.
 * @name  FORGE.SceneParser#background
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "background",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return (typeof this._config.background !== "undefined") ? this._config.background : this._viewer.config.background;
    }
});

/**
 * Get the thumbnails Array.
 * @name  FORGE.SceneParser#thumbnails
 * @readonly
 * @type {Array}
 *
 * @todo  Define what is a thumbnail array, maybe with a thumbnail object descriptor
 */
Object.defineProperty(FORGE.SceneParser.prototype, "thumbnails",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.thumbnails;
    }
});

/**
 * Get the media object.
 * @name  FORGE.SceneParser#media
 * @readonly
 * @type {SceneMediaConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "media",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.media;
    }
});

/**
 * Get the sound object.
 * @name  FORGE.SceneParser#sound
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "sound",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.sound;
    }
});

/**
 * Get the fx set UID.
 * @name  FORGE.SceneParser#fx
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "fx",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.fx;
    }
});

/**
 * Get the playlists object.
 * @name  FORGE.SceneParser#playlists
 * @readonly
 * @type {AudioPlaylistsConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "playlists",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.playlists;
    }
});

/**
 * Get the view object.
 * @name  FORGE.SceneParser#view
 * @readonly
 * @type {ViewConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "view",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.view;
    }
});

/**
 * Get the camera object.
 * @name  FORGE.SceneParser#camera
 * @readonly
 * @type {CameraConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "camera",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.camera;
    }
});

/**
 * Get the hotspots object.
 * @name  FORGE.SceneParser#hotspots
 * @readonly
 * @type {Array<HotspotConfig>}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "hotspots",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.hotspots;
    }
});

/**
 * Get the director object.
 * @name  FORGE.SceneParser#director
 * @readonly
 * @type {DirectorConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "director",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.director;
    }
});

/**
 * Get the plugins object.
 * @name  FORGE.SceneParser#plugins
 * @readonly
 * @type {PluginsConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "plugins",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.plugins;
    }
});

/**
 * Get the audio object.
 * @name  FORGE.SceneParser#audio
 * @readonly
 * @type {AudioConfig}
 */
Object.defineProperty(FORGE.SceneParser.prototype, "audio",
{
    /** @this {FORGE.SceneParser} */
    get: function()
    {
        return this._config.audio;
    }
});
