
/**
 * @constructor FORGE.MediaManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.MediaManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.MediaManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Array of media.
     * @name FORGE.MediaManager#_media
     * @type {Array<FORGE.Layout>}
     * @private
     */
    this._media = [];

    FORGE.BaseObject.call(this, "MediaManager");
};

FORGE.MediaManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.MediaManager.prototype.constructor = FORGE.MediaManager;

/**
 * Update the media
 * @method FORGE.MediaManager#add
 * @param {SceneMediaConfig} config - The config of the media to add.
 */
FORGE.MediaManager.prototype.add = function(config)
{
    var media = null;

    if(typeof config === "undefined" || config === null)
    {
        config = { uid: "FORGE.MediaType.UNDEFINED" };
    }

    if(FORGE.UID.exists(config.uid) === true)
    {
        this.warn("Media "+config.uid+" already exists");
        return config.uid;
    }

    switch(config.type)
    {
        case FORGE.MediaType.GRID:
            media = new FORGE.MediaGrid(this._viewer, config);
            break;

        case FORGE.MediaType.IMAGE:
            media = new FORGE.MediaImage(this._viewer, config);
            break;

        case FORGE.MediaType.VIDEO:
            media = new FORGE.MediaVideo(this._viewer, config);
            break;

        case FORGE.MediaType.TILED:
            media = new FORGE.MediaTiled(this._viewer, config);
            break;

        default:
            media = new FORGE.Media(this._viewer, config);
            break;
    }

    this._media.push(media);

    return media.uid;
};

/**
 * Update the media
 * @method FORGE.MediaManager#update
 */
FORGE.MediaManager.prototype.update = function()
{
    var media;

    for(var i = 0, ii = this._media.length; i < ii; i++)
    {
        media = this._media[i];

        if(typeof media.update === "function")
        {
            media.update();
        }
    }
};

/**
 * Load a media by its uid
 * @method FORGE.MediaManager#load
 * @param  {string} uid - The uid of the media to load
 */
FORGE.MediaManager.prototype.load = function(uid)
{
    var media = FORGE.UID.get(uid);
    media.load();
};

/**
 * Unload a media by its uid
 * @method FORGE.MediaManager#unload
 * @param  {string} uid - The uid of the media to unload
 */
FORGE.MediaManager.prototype.unload = function(uid)
{
    var media = FORGE.UID.get(uid);
    media.unload();
};

/**
 * Get all the media
 * @name FORGE.MediaManager#media
 * @type {FORGE.MediaManager}
 * @readonly
 */
Object.defineProperty(FORGE.MediaManager.prototype, "all",
{
    /** @this {FORGE.MediaManager} */
    get: function()
    {
        return this._media;
    }
});