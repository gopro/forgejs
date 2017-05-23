/**
 * This object stores a number of tiles used for multi resolution cases with
 * tiles. It acts as a LRU map, as we can't store infinite amount of tiles.
 * The number of tiles to store is (6 * 4^n)!, with n being the number of levels.
 *
 * There is an exception though: the level 0 of a multi resolution is always
 * kept in the cache.
 *
 * @constructor FORGE.MediaStore
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference
 * @param {SceneMediaSourceConfig} config - the config given by a media to know
 *                                          how to load each tile
 * @extends {FORGE.BaseObject}
 */
FORGE.MediaStore = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.MediaStore#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Media source configuration
     * @name FORGE.MediaStore#_config
     * @type {SceneMediaSourceConfig}
     * @private
     */
    this._config = config;

    /**
     * A map containing all {@link FORGE.MediaTexture}, with the key being constitued
     * from the level, face, x and y properties defining the texture
     * @name FORGE.MediaStore#_textures
     * @type {?FORGE.Map}
     * @private
     */
    this._textures = null;

    /**
     * The current size of all loaded textures.
     * @name FORGE.MediaStore#_size
     * @type {number}
     * @private
     */
    this._size = 0;

    /**
     * The pattern to follow to laod the images
     * @name FORGE.MediaStore#_pattern
     * @type {string}
     * @private
     */
    this._pattern = "";

    FORGE.BaseObject.call(this, "MediaStore");

    this._boot();
};

FORGE.MediaStore.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.MediaStore.prototype.constructor = FORGE.MediaStore;

/**
 * The maximum size of texture at once. It is set at 30Mb, as we assume the
 * median size of a cache is 32Mb, and we keep 2Mb for other texture.
 * @name FORGE.MediaStore.MAX_SIZE
 * @type {string}
 * @const
 */
FORGE.MediaStore.MAX_SIZE = 31457280;

/**
 * Boot routine.
 *
 * @method FORGE.MediaStore#_boot
 * @private
 */
FORGE.MediaStore.prototype._boot = function()
{
    this._register();

    this._textures = new FORGE.Map();

    this._parseConfig(this._config);
};

/**
 * Parse config routine.
 *
 * @method FORGE.MediaStore#_parseConfig
 * @param {SceneMediaSourceConfig} config - the config of the media source
 * @private
 */
FORGE.MediaStore.prototype._parseConfig = function(config)
{
    // a pattern should contains at least {f}, {l}, {x} or {y}
    var re = /\{[lfxy]\}/;
    if (typeof config.pattern !== "string" || config.pattern.match(re) === null)
    {
        throw "the pattern of the multi resolution media is wrong";
    }

    this._pattern = config.pattern;
};

/**
 * Create the key of an image.
 *
 * @method FORGE.MediaStore#_createKey
 * @param {string} face - the face associated to this image
 * @param {number=} level - the level of quality
 * @param {number=} x - the x coordinate for position
 * @param {number=} y - the y coordinate for position
 * @return {string} returns the key for this image
 * @private
 */
FORGE.MediaStore.prototype._createKey = function(face, level, x, y)
{
    var key = "";
    key += typeof face !== "undefined" ? face + "-" : "";
    key += typeof level !== "undefined" ? level  + "-" : "";
    key += typeof x !== "undefined" ? x + "-" : "";
    key += typeof y !== "undefined" ? y : "";

    return key;
};

/**
 * Loads an Image from parameters, but doesn't add it to the map yet.
 *
 * @method FORGE.MediaStore#_load
 * @param {string} key - the key of the image
 * @param {string} face - the face associated to this image
 * @param {number} level - the level of quality
 * @param {number} x - the x coordinate for position
 * @param {number} y - the y coordinate for position
 * @private
 */
FORGE.MediaStore.prototype._load = function(key, face, level, x, y)
{
    var url = this._pattern;
    url = url.replace(/\{face\}/, face);
    url = url.replace(/\{level\}/, level.toString());
    url = url.replace(/\{x\}/, x.toString());
    url = url.replace(/\{y\}/, y.toString());

    var config = {
        url: url
    };

    var image = new FORGE.Image(this._viewer, config);

    image.data = {
        key: key,
        level: level
    };

    image.onLoadComplete.add(this._onLoadComplete, this);
};

/**
 * Add the loaded image to the map.
 *
 * @method FORGE.MediaStore#_onLoadComplete
 * @param {FORGE.Image} image - the loaded image
 * @private
 */
FORGE.MediaStore.prototype._onLoadComplete = function(image)
{
    image = image.emitter;

    var texture = new THREE.Texture();
    texture.image = image.element;

    var size = image.element.height * image.element.width;
    this._size += size;

    var mediaTexture = new FORGE.MediaTexture(texture, (image.data.level === 0), size);
    this._textures.set(image.data.key, mediaTexture);

    // destroy the image, it is no longer needed
    image.destroy();

    this._checkSize();
};

/**
 * Check the current size of the store, and flush some texture if necessary.
 *
 * @method FORGE.MediaStore#_checkSize
 * @private
 */
FORGE.MediaStore.prototype._checkSize = function()
{
    if (this._size < FORGE.MediaStore.MAX_SIZE)
    {
        return;
    }

    var entries = this._textures.entries(),
        time = window.performance.now();

    entries = FORGE.Utils.sortArrayByProperty(entries, "1.lastTime");

    var force = false;

    while (this._size > FORGE.MediaStore.MAX_SIZE)
    {
        // oldest are first
        texture = entries.shift();

        // if no  more entries (aka all texture are level 0) remove it anyway
        if (typeof texture === "undefined")
        {
            entries = this._textures.entries();
            entries = FORGE.Utils.sortArrayByProperty(entries, "1.lastTime");
            force = true;
        }

        // but don't delete if it is locked
        if (texture[1].locked !== true || force === true)
        {
            this._size -= texture[1].size;
            texture[1].destroy();
            this._textures.delete(texture[0]);
        }
    }
};

/**
 * Get an image from this store, given four parameters: the face associated to
 * this image, the level of quality and the x and y positions. It returns
 * either a {@link THREE.Texture} or null.
 *
 * The inner working is as follow: either the image is already loaded and
 * returned, or either the image is being loaded and nothing is returned yet.
 * If the latter, the image is added to the map once it is completely loaded
 * (the onLoadComplete event).
 *
 * @method FORGE.MediaStore#get
 * @param {string} face - the face associated to this image
 * @param {number} level - the level of quality
 * @param {number} x - the x coordinate for position
 * @param {number} y - the y coordinate for position
 * @return {?THREE.Texture} returns the image if present, else null
 */
FORGE.MediaStore.prototype.get = function(face, level, x, y)
{
    var key = this._createKey(face, level, x, y);

    var res = /** @type {FORGE.MediaTexture} */ (this._textures.get(key));

    if (res !== undefined)
    {
        return res.texture;
    }

    this._load(key, face, level, x, y);

    return null;
};

/**
 * Destroy routine.
 *
 * @method FORGE.MediaStore#destroy
 */
FORGE.MediaStore.prototype.destroy = function()
{
    this._viewer = null;

    this._textures.clear();
    this._textures = null;
};
