
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
 * Parse configuration object
 * @method FORGE.MediaManager#_parseConfig
 * @param {ControllersConfig} config - The config you want to add.
 * @private
 */
FORGE.MediaManager.prototype._parseConfig = function(config)
{

};


FORGE.MediaManager.prototype.add = function(config)
{
    if(FORGE.UID.exists(config.uid) === false)
    {
        var media = new Media();
        this._media.push(media);
    }
};

FORGE.MediaManager.prototype.load = function(uid)
{

};


/**
 * Get the "onControlEnd" {@link FORGE.EventDispatcher} of the camera controller.
 * @name FORGE.MediaManager#onControlEnd
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
// Object.defineProperty(FORGE.MediaManager.prototype, "onControlEnd",
// {
//     /** @this {FORGE.MediaManager} */
//     get: function()
//     {
//         if(this._onControlEnd === null)
//         {
//             this._onControlEnd = new FORGE.EventDispatcher(this);
//         }

//         return this._onControlEnd;
//     }
// });
