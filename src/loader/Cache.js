
/**
 * Cache manager for loaded objects.
 *
 * @constructor FORGE.Cache
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 */
FORGE.Cache = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Cache#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The list of json.
     * @name FORGE.Cache#_json
     * @type {FORGE.Map}
     * @private
     */
    this._json = new FORGE.Map();

    /**
     * The list of xml.
     * @name FORGE.Cache#_xml
     * @type {FORGE.Map}
     * @private
     */
    this._xml = new FORGE.Map();

    /**
     * The list of images.
     * @name FORGE.Cache#_images
     * @type {FORGE.Map}
     * @private
     */
    this._images = new FORGE.Map();

    /**
     * The list of sounds.
     * @name FORGE.Cache#_sounds
     * @type {FORGE.Map}
     * @private
     */
    this._sounds = new FORGE.Map();

    /**
     * The current key increment used to generate keys.
     * @name FORGE.Cache#_keyIncrement
     * @type {number}
     * @private
     */
    this._keyIncrement = 0;
};

/**
 * Default prefix for generated keys
 * @name FORGE.PluginEngine._PREFIX
 * @type {string}
 * @const
 * @private
 */
FORGE.Cache._PREFIX = "FORGE-cache";

/**
 * Const that list different types of cache.
 * @name  FORGE.Cache.types
 * @type {Object}
 * @const
 */
FORGE.Cache.types = {};

/**
 * @name FORGE.Cache.types.JSON
 * @type {string}
 * @const
 */
FORGE.Cache.types.JSON = "json";

/**
 * @name FORGE.Cache.types.XML
 * @type {string}
 * @const
 */
FORGE.Cache.types.XML = "xml";

/**
 * @name FORGE.Cache.types.IMAGE
 * @type {string}
 * @const
 */
FORGE.Cache.types.IMAGE = "image";

/**
 * @name FORGE.Cache.types.SOUND
 * @type {string}
 * @const
 */
FORGE.Cache.types.SOUND = "sound";

/**
 * List of reserved keys for specific cache.
 * @name FORGE.PluginEngine.reserved
 * @type {Object}
 * @const
 */
FORGE.Cache.reserved = {};

/**
 * @name FORGE.Cache.reserved.COMMON
 * @type {Array<string>}
 * @const
 */
FORGE.Cache.reserved.COMMON = ["forge", "forgejs", "FORGE"];

/**
 * @name FORGE.Cache.reserved.JSON
 * @type {Array<string>}
 * @const
 */
FORGE.Cache.reserved.JSON = ["forge.story.config"].concat(FORGE.Cache.reserved.COMMON);

/**
 * @name FORGE.Cache.reserved.XML
 * @type {Array<string>}
 * @const
 */
FORGE.Cache.reserved.XML = [].concat(FORGE.Cache.reserved.COMMON);

/**
 * @name FORGE.Cache.reserved.IMAGE
 * @type {Array<string>}
 * @const
 */
FORGE.Cache.reserved.IMAGE = [].concat(FORGE.Cache.reserved.COMMON);

/**
 * @name FORGE.Cache.reserved.SOUND
 * @type {Array<string>}
 * @const
 */
FORGE.Cache.reserved.SOUND = [].concat(FORGE.Cache.reserved.COMMON);

/**
 * Get a cache map from a type that is listed on FORGE.Cache.types
 * @method FORGE.Cache._getCacheByType
 * @param  {string} type - The type of cache you want to get.
 * @return {?FORGE.Map} Returns the {@link FORGE.Map} associated to the required type of cache.
 * @private
 */
FORGE.Cache.prototype._getCacheByType = function(type)
{
    var cache = null;

    switch(type)
    {
        case FORGE.Cache.types.JSON:
            cache = this._json;
            break;

        case FORGE.Cache.types.XML:
            cache = this._xml;
            break;

        case FORGE.Cache.types.IMAGE:
            cache = this._images;
            break;

        case FORGE.Cache.types.SOUND:
            cache = this._sounds;
            break;
    }

    return cache;
};

/**
 * Get a reserved key array from a type that is listed on FORGE.Cache.types
 * @method FORGE.Cache._getReservedByType
 * @param  {string} type - The type of reserved key you want to get.
 * @return {?Array<string>} Returns the reserved key array associated to the required type of cache.
 * @private
 */
FORGE.Cache.prototype._getReservedByType = function(type)
{
    var reserved = null;

    switch(type)
    {
        case FORGE.Cache.types.JSON:
            reserved = FORGE.Cache.reserved.JSON;
            break;

        case FORGE.Cache.types.XML:
            reserved = FORGE.Cache.reserved.XML;
            break;

        case FORGE.Cache.types.IMAGE:
            reserved = FORGE.Cache.reserved.IMAGE;
            break;

        case FORGE.Cache.types.SOUND:
            reserved = FORGE.Cache.reserved.SOUND;
            break;
    }

    return reserved;
};

/**
 * Generate a key for a specific cache.
 * @method FORGE.Cache#_generateKey
 * @param  {string} type - In which cache type the key should be valid?
 * @param  {string} prefix - Custom key prefix.
 * @return {string} Returns a generated cache key.
 * @private
 */
FORGE.Cache.prototype._generateKey = function(type, prefix)
{
    var cache = this._getCacheByType(type);

    var p = prefix || FORGE.Cache._PREFIX;
    var key = p+"-"+this._keyIncrement;

    this._keyIncrement++;

    if(cache.has(key) === false && this._isReserved(type, key) === false)
    {
        return key;
    }
    else
    {
        return this._generateKey(type, prefix);
    }
};

/**
 * Check if a reserved key has been already added into cache.
 * @method FORGE.Cache#_isReservedAlreadyUsed
 * @param {string} type - The type of cache you want to check.
 * @param {string} key - The cache key to search for.
 * @return {boolean} Return true if the key is reserved and it is already registered
 * @private
 */
FORGE.Cache.prototype._isReservedAlreadyUsed = function(type, key)
{
    var cache = this._getCacheByType(type);
    var reserved = this._getReservedByType(type);

    return (this._isReserved(type, key) === true && cache.has(key) === true);
};

/**
 * Check if a key is reserved for a given type of cache.
 * @param  {string} type - The type of cache you want to check.
 * @param  {string} key - The key you want to check
 * @return {boolean} Return true if the key is a reserved one for the type of cache
 * @private
 */
FORGE.Cache.prototype._isReserved = function(type, key)
{
    var reserved = this._getReservedByType(type);

    if(reserved !== null)
    {
        return reserved.indexOf(key.toLowerCase()) !== -1;
    }

    return false;
};

/**
 * Is a cache has something associated to a key?
 * @method FORGE.Cache#has
 * @param {string} type - The type of cache you want to check.
 * @param {string} key - The key to search for.
 * @return {boolean} Returns true if found, false if not.
 */
FORGE.Cache.prototype.has = function(type, key)
{
    var cache = this._getCacheByType(type);

    if(cache !== null)
    {
        return cache.has(key);
    }

    return false;
};

/**
 * Get the file associated to a key in a specific cache.
 * @method FORGE.Cache#get
 * @param {string} type - The type of cache you want to use.
 * @param {string} key - The key to search for.
 * @return {?FORGE.File} Returns the {@link FORGE.File} object if found, null if not found.
 */
FORGE.Cache.prototype.get = function(type, key)
{
    if(this.has(type, key) === true)
    {
        var cache = this._getCacheByType(type);

        if(cache !== null)
        {
            return cache.get(key);
        }
    }

    return null;
};

/**
 * Add a file to a specific cache.
 * @method FORGE.Cache#add
 * @param {string} type - The type of cache you want to use.
 * @param {string} key - The key for the file.
 * @param {FORGE.File} file - The {@link FORGE.File} object you want to add.
 * @return {boolean} Returns true if the addition is complete, false if not.
 */
FORGE.Cache.prototype.add = function(type, key, file)
{
    if(typeof key !== "string" || key === "" || this._isReservedAlreadyUsed(type, key) === true)
    {
        key = this._generateKey(type, type+"-cache");
    }

    if(this.has(key, type) === false)
    {
        var cache = this._getCacheByType(type);

        if(cache !== null)
        {
            cache.set(key, file);
            return true;
        }
    }

    return false;
};

/**
 * Remove a {@link FORGE.File} from a specific cache.
 * @method FORGE.Cache#remove
 * @param {string} type - The type of cache you want to remove the file from.
 * @param {string} key - The key associated to the file you want to remove.
 * @return {boolean} Returns true if the deletion is complete, false if not.
 */
FORGE.Cache.prototype.remove = function(type, key)
{
    if(this.has(type, key) === true)
    {
        var cache = this._getCacheByType(type);

        if(cache !== null)
        {
            cache.delete(key);
            return true;
        }
    }

    return false;
};

/**
 * Destroy sequence.
 * @method FORGE.Cache#destroy
 */
FORGE.Cache.prototype.destroy = function()
{
    this._viewer = null;
    this._json = null;
    this._images = null;
    this._sounds = null;
};
