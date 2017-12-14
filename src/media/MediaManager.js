
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

FORGE.MediaManager.prototype.load = function(uid)
{
    var media = FORGE.UID.get(uid);
    media.load();
};

FORGE.MediaManager.prototype.unload = function(uid)
{
    var media = FORGE.UID.get(uid);
    media.unload();
};