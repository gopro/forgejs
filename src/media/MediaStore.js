/**
 * This object stores a number of tiles used for multi resolution cases with
 * tiles. It acts as a LRU map, as we can't store infinite amount of tiles.
 * The number of tiles to store is (6 * 2^n)!, with n being the number of levels.
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
     * A map containing all {@link FORGE.Image}, with the key being constitued
     * from the level, face, x and y properties defining the image
     * @name FORGE.MediaStore#_images
     * @type {?FORGE.Map}
     * @private
     */
    this._images = null;

    /**
     * The maximum size of the store
     * @name FORGE.MediaStore#_maxSize
     * @type {number}
     * @private
     */
    this._maxSize = 0;

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
 * Boot routine.
 *
 * @method FORGE.MediaStore#_boot
 * @private
 */
FORGE.MediaStore.prototype._boot = function()
{
    this._register();

    this._images = new FORGE.Map();
    this._maxSize = 200; // can contains level 0 to 4

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
 * Loads an Image from parameters, but doesn't add it to the map yet.
 *
 * @method FORGE.MediaStore#_load
 * @param {string} face - the face associated to this image
 * @param {number} level - the level of quality
 * @param {number} x - the x coordinate for position
 * @param {number} y - the y coordinate for position
 * @private
 */
FORGE.MediaStore.prototype._load = function(face, level, x, y)
{
    var key = "";
    key += face;
    key += "-" + level;
    key += "-" + x;
    key += "-" + y;

    var url = this._pattern;
    url.replace(/{face}/, face);
    url.replace(/{level}/, level.toString());
    url.replace(/{x}/, x.toString());
    url.replace(/{y}/, y.toString());

    var config = {
        key: key,
        url: url
    };

    var image = new FORGE.Image(this._viewer, config);
    image.onLoadComplete.addOnce(this._onLoadComplete, this);
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
    this._images.set(image.uid, image);
};

/**
 * Get an image from this store, given four parameters: the face associated to
 * this image, the level of quality and the x and y positions. It returns
 * either a {@link FORGE.Image} or null.
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
 * @return {?FORGE.Image} returns the image if present, else null
 */
FORGE.MediaStore.prototype.get = function(face, level, x, y)
{
    var key = "";

    key += face;
    key += "-" + level;
    key += "-" + x;
    key += "-" + y;

    var res = /** @type {FORGE.Image} */ (this._images.get(key));

    if (res !== undefined)
    {
        return res;
    }

    this._load(face, level, x, y);

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

    this._images.clear();
    this._images = null;
};
