/**
 * This object stores a number of tiles used for multi resolution cases with
 * tiles. It acts as a LRU map, as we can't store infinite amount of tiles.
 * The number of tiles to store is Σ(6 * 4^n), with n being the number of levels.
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
     * The list of currently being loaded textures
     * @name FORGE.MediaStore#_loadingTextures
     * @type {?Array<string>}
     * @private
     */
    this._loadingTextures = null;

    /**
     * Map of texture promises
     * @type {FORGE.Map}
     * @private
     */
    this._texturePromises = null;

    /**
     * LIFO stack holding texture requests
     * @type {Array}
     * @private
     */
    this._textureStack = null;

    /**
     * LIFO stack timer interval
     * @type {?number}
     * @private
     */
    this._textureStackInterval = null;

    /**
     * The current size of all loaded textures.
     * @name FORGE.MediaStore#_size
     * @type {number}
     * @private
     */
    this._size = 0;

    /**
     * The global pattern of texture file urls
     * @name FORGE.MediaStore#_pattern
     * @type {string}
     * @private
     */
    this._pattern = "";

    /**
     * Object containing patterns of texture file urls per pyramid level
     * @name FORGE.MediaStore#_patterns
     * @type {?Object}
     * @private
     */
    this._patterns = null;

    /**
     * Faces configuration
     * @type {?Object}
     * @private
     */
    this._cubeFaceConfig = null;

    FORGE.BaseObject.call(this, "MediaStore");

    this._boot();
};

FORGE.MediaStore.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.MediaStore.prototype.constructor = FORGE.MediaStore;

/**
 * Texture stack interval in milliseconds
 * @type {number}
 */
FORGE.MediaStore.TEXTURE_STACK_INTERVAL_MS = 250;

/**
 * Table describing previous cube face
 * @type {CubeFaceObject}
 */
FORGE.MediaStore.CUBE_FACE_CONFIG = {
    "front": "front",
    "right": "right",
    "back": "back",
    "left": "left",
    "down": "down",
    "up": "up"
};

/**
 * The maximum size of texture at once. It is set at 30Mb, as we assume the
 * median size of a cache is 32Mb, and we keep 2Mb for other texture.
 * @name FORGE.MediaStore.MAX_SIZE
 * @type {number}
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
    this._loadingTextures = [];
    this._textureStack = [];
    this._texturePromises = new FORGE.Map();
    this._patterns = {};

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

    // Check if there is a global pattern
    if (typeof config.pattern === "string")
    {
        if (config.pattern.match(re) === null)
        {
            throw "the pattern of the multi resolution media is wrong";
        }

        this._pattern = config.pattern;
    }

    // Then check if each resolution level has its own pattern
    for (var l = 0, ll = config.levels.length; l < ll; l++)
    {
        if (typeof config.levels[l].pattern === "string")
        {
            if (config.pattern.match(re) === null)
            {
                throw "the pattern of the multi resolution media is wrong";
            }

            this._patterns[l] = config.levels[l].pattern;
        }
    }

    this._cubeFaceConfig = FORGE.MediaStore.CUBE_FACE_CONFIG;
    if (typeof config.faces !== "undefined")
    {
        this._cubeFaceConfig = config.faces;
    }
};

/**
 * Create the key of an image.
 *
 * @method FORGE.MediaStore#_createKey
 * @param {FORGE.Tile} tile - tile
 * @return {string} returns the key for this image
 * @private
 */
FORGE.MediaStore.prototype._createKey = function(tile)
{
    var key = "";
    key += typeof tile.face !== "undefined" ? this._cubeFaceConfig[tile.face] + "-" : "";
    key += typeof tile.level !== "undefined" ? tile.level + "-" : "";
    key += typeof tile.x !== "undefined" ? tile.x + "-" : "";
    key += typeof tile.y !== "undefined" ? tile.y : "";

    return key;
};

/**
 * Loads an Image from parameters, but doesn't add it to the map yet.
 *
 * @method FORGE.MediaStore#_load
 * @param {FORGE.Tile} tile - tile
 * @private
 */
FORGE.MediaStore.prototype._load = function(tile)
{
    var key = this._createKey(tile);
    if (this._loadingTextures.indexOf(key) !== -1)
    {
        return;
    }

    var entry = this._texturePromises.get(key);
    if (entry.cancelled)
    {
        this.log("Load promise cancelled for tile " + tile.name);
        entry.load.reject("Tile cancelled");
        this._texturePromises.delete(key);
        return;
    }

    this.log("Push loading texture for tile " + tile.name);
    this._loadingTextures.push(key);

    var url = this._pattern;

    if (typeof this._patterns[tile.level] !== "undefined")
    {
        url = this._patterns[tile.level];
    }

    url = url.replace(/\{face\}/, this._cubeFaceConfig[tile.face]);
    url = url.replace(/\{level\}/, tile.level.toString());
    url = url.replace(/\{x\}/, tile.x.toString());
    url = url.replace(/\{y\}/, tile.y.toString());

    var config = {
        url: url
    };

    var image = new FORGE.Image(this._viewer, config);

    image.data = {
        tile: tile
    };

    image.onLoadComplete.add(this._onLoadComplete.bind(this), this);
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
    var tile = image.data.tile;
    var key = this._createKey(tile);

    this.log("Texture load complete for tile " + tile.name);

    var texture = new THREE.Texture();
    texture.image = image.element;

    var size = image.element.height * image.element.width;
    this._size += size;

    var mediaTexture = new FORGE.MediaTexture(texture, (tile.level === 0), size);
    this._textures.set(key, mediaTexture);

    // destroy the image, it is no longer needed
    this._loadingTextures.splice(this._loadingTextures.indexOf(image.data.key), 1);

    var entry = this._texturePromises.get(key);
    entry.load.resolve(mediaTexture.texture);
    this._texturePromises.delete(key);

    image.destroy();

    this._checkSize();
};

/**
 * Discard texture.
 *
 * @method FORGE.MediaStore#_discardTexture
 * @param {string} key - texture key
 * @private
 */
FORGE.MediaStore.prototype._discardTexture = function(key)
{
    if (this._textures.has(key) === false)
    {
        return;
    }

    var texture = this._textures.get(key);

    this._size -= texture.size;
    texture.destroy();

    this._textures.delete(key);
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
        time = window.performance.now(),
        force = false,
        texture;

    entries = FORGE.Utils.sortArrayByProperty(entries, "1.lastTime");

    while (this._size > FORGE.MediaStore.MAX_SIZE)
    {
        // oldest are first
        texture = entries.shift();

        // if no more entries (aka all texture are level 0) remove it anyway
        if (typeof texture === "undefined")
        {
            entries = this._textures.entries();
            entries = FORGE.Utils.sortArrayByProperty(entries, "1.lastTime");
            force = true;
        }
        else
        // but don't delete if it is locked
        if (force === true || texture[1].locked !== true)
        {
            this._discardTexture(texture[0]);
        }
    }
};

/**
 * Push item from texture stack.
 *
 * @method FORGE.MediaStore#_textureStackPush
 * @param {FORGE.Tile} tile - tile requesting texture
 */
FORGE.MediaStore.prototype._textureStackPush = function(tile)
{
    // First clear interval if any and push
    if (this._textureStackInterval !== null)
    {
        window.clearTimeout(this._textureStackInterval);
        this._textureStackInterval = null;
    }

    // if a tile parent has asked for a texture, cancel it
    var parentName = tile.getParentName();
    var parentTile = this._textureStack.find(function(item)
    {
        return item.name === parentName;
    });

    if (parentTile !== undefined)
    {
        this.log("Unstack pending parent texture and cancel it");
        var parentKey = this._createKey(parentTile);
        var entry = this._texturePromises.get(parentKey);
        entry.cancelled = true;
    }

    this._textureStack.push(tile);

    this._textureStackInterval = window.setTimeout(this._textureStackPop.bind(this), FORGE.MediaStore.TEXTURE_STACK_INTERVAL_MS);
};

/**
 * Pop item from texture stack.
 *
 * @method FORGE.MediaStore#_textureStackPop
 */
FORGE.MediaStore.prototype._textureStackPop = function()
{
    this._textureStackInterval = null;

    while (this._textureStack.length > 0)
    {
        var tile = this._textureStack.pop();
        //this.log("Texture stack length (---): " + this._textureStack.length + " (" + tile.name + ")");

        this.log("Pop texture request from stack for tile " + tile.name);
        this._load(tile);
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
 * @param {FORGE.Tile} tile - tile
 * @return {Promise} returns a promise on the image
 */
FORGE.MediaStore.prototype.get = function(tile)
{
    var key = this._createKey(tile);

    // If texture is available, return a resolved promise
    if (this._textures.has(key))
    {
        this.log("Texture available, return resolved promise");
        var promise = FORGE.Utils.makePromise();
        var mediaTexture = this._textures.get(key);
        promise.resolve(mediaTexture.texture);
        return promise;
    }

    // First check if texture is already loading (pending promise)
    // Return null, and client should do nothing but wait
    var promise = this._texturePromises.get(key);
    if (promise !== undefined)
    {
        return null;
    }

    this.log("Create load promise for tile " + tile.name);

    var loadingPromise = FORGE.Utils.makePromise();

    // Texture already available
    // Return resolved promise
    if (this._textures.has(key))
    {
        this.log("and resolve it immediately");
        loadingPromise.resolve(this._textures.get(key));
        return loadingPromise;
    }

    // Create new entry in map of promises
    var entry = /** @type {!TexturePromiseObject} */ (
    {
        load: loadingPromise,
        cancelled: false
    });

    this._texturePromises.set(key, entry);

    this._textureStackPush(tile);

    return loadingPromise;
};

/**
 * Ask store if it has a texture already available
 * @method FORGE.MediaStore#get
 * @param {string} key - texture key
 */
FORGE.MediaStore.prototype.has = function(key)
{
    return this._textures.has(key);
};

/**
 * Discard texture for a given tile
 * @method FORGE.MediaStore#discardTileTexture
 * @param {FORGE.Tile} tile - tile
 */
FORGE.MediaStore.prototype.discardTileTexture = function(tile)
{
    this._discardTexture(this._createKey(tile));
};

/**
 * Destroy routine.
 *
 * @method FORGE.MediaStore#destroy
 */
FORGE.MediaStore.prototype.destroy = function()
{
    this._unregister();

    this._patterns = null;

    this._viewer = null;
    this._loadingTextures = null;

    if (this._textureStack !== null)
    {
        this._textureStack.length = 0;
        this._textureStack = null;
    }

    this._texturePromises = null;

    this._textures.clear();
    this._textures = null;
};
