/**
 * The FORGE.HotspotManager is an object that manages hotspots of the project.
 *
 * @constructor FORGE.HotspotManager
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.HotspotManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The general config backup.
     * @name FORGE.HotspotManager#_config
     * @type {Object}
     * @private
     */
    this._config = null;

    /**
     * Hotspots array
     * @name  FORGE.HotspotManager#_hotspots
     * @type {Array<(FORGE.Hotspot3D|FORGE.HotspotDOM)>}
     * @private
     */
    this._hotspots = {};

    FORGE.BaseObject.call(this, "HotspotManager");

};

FORGE.HotspotManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotManager.prototype.constructor = FORGE.HotspotManager;

/**
 * Create a hotspot from a hotpsot config object.
 * @method FORGE.HotspotManager#create
 * @param {HotspotConfig} config - The config of the hotspot you want to create.
 * @return {(FORGE.Hotspot3D|FORGE.HotspotDOM|boolean)} Returns the hotspot if the hotspot is created, false if not.
 */
FORGE.HotspotManager.prototype.create = function(config)
{
    var hotspot = null;
    var type = config.type || FORGE.HotspotType.THREE_DIMENSIONAL; //3d is the default type

    switch (type)
    {
        case FORGE.HotspotType.THREE_DIMENSIONAL:
            hotspot = new FORGE.Hotspot3D(this._viewer, config);
            break;

        case FORGE.HotspotType.DOM:
            hotspot = new FORGE.HotspotDOM(this._viewer, config);
            break;
    }

    if (hotspot !== null)
    {
        this._hotspots[hotspot.uid] = hotspot;
        return hotspot;
    }

    return false;
};

/**
 * Remove a hotspot from the manager
 * @method FORGE.HotspotManager#remove
 * @param  {(string|FORGE.Hotspot3D)} hotspot - the hotspot or its uid to remove
 */
FORGE.HotspotManager.prototype.remove = function(hotspotUid)
{
   if (typeof this._hotspots[hotspotUid] !== "undefined")
   {
        this._hotspots[hotspotUid].destroy();
        this._hotspots[hotspotUid] = null;
        delete this._hotspots[hotspotUid];
   }
};

/**
 * Parse a list of tracks for hotspots movement.
 * @method FORGE.HotspotManager#_parseTracks
 * @param {Array<HotspotTrackConfig>} tracks - The array of tracks to add.
 * @private
 */
FORGE.HotspotManager.prototype._parseTracks = function(tracks)
{
    for (var i = 0, ii = tracks.length; i < ii; i++)
    {
        new FORGE.HotspotAnimationTrack(tracks[i]);
    }
};

/**
 * Event handler for scene unload start.
 * @method  FORGE.HotspotManager#_sceneUnloadStartHandler
 * @private
 */
FORGE.HotspotManager.prototype._sceneUnloadStartHandler = function()
{
    this.clear();
};

/**
 * Add a hotspots config to the manager.
 * @method FORGE.HotspotManager#addConfig
 * @param {Array<HotspotConfig>} config - The config you want to add.
 */
FORGE.HotspotManager.prototype.addConfig = function(config)
{
    return this.create(config);
};

/**
 * Add a list of tracks for the hotspots.
 * @method FORGE.HotspotManager#addTracks
 * @param {HotspotsConfig} config - The tracks you want to add.
 */
FORGE.HotspotManager.prototype.addTracks = function(config)
{
    if (config.tracks !== null && typeof config.tracks !== "undefined")
    {
        this._parseTracks(config.tracks);
    }
};

/**
 * Update loop
 * @method FORGE.HotspotManager#update
 */
FORGE.HotspotManager.prototype.update = function()
{
    for (uid in this._hotspots)
    {
        this._hotspots[uid].update();
    }
};

/**
 * Clear all hotspots from the manager
 * @method FORGE.HotspotManager#clear
 * @param {string=} type - the type of hotspots to clear, nothing for all
 */
FORGE.HotspotManager.prototype.clear = function(type)
{
    for (uid in this._hotspots)
    {
        this.remove(uid);
    }

};

/**
 * Dump the array of hotspot configurations.
 * @method FORGE.HotspotManager#dump
 * @return {Array<HotspotConfig>} Return an array of hotspot configurations of the current scene.
 */
FORGE.HotspotManager.prototype.dump = function()
{
    var dump = [];

    for (uid in this._hotspots)
    {
        dump.push(this._hotspots[uid].dump());
    }

    return dump;
};

/**
 * Destroy sequence
 * @method FORGE.HotspotManager#destroy
 */
FORGE.HotspotManager.prototype.destroy = function()
{
    this.clear();
    this._viewer = null;
    this._hotspots = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get all the hotspots.
 * @name FORGE.HotspotManager#all
 * @readonly
 * @type {Array<(FORGE.Hotspot3D|FORGE.HotspotDOM)>}
 */
Object.defineProperty(FORGE.HotspotManager.prototype, "all",
{
    /** @this {FORGE.HotspotManager} */
    get: function()
    {
        return this._hotspots;
    }
});

/**
 * Get all the hotspots uids.
 * @name FORGE.HotspotManager#uids
 * @readonly
 * @type {Array<string>}
 */
Object.defineProperty(FORGE.HotspotManager.prototype, "uids",
{
    /** @this {FORGE.HotspotManager} */
    get: function()
    {
        return Object.keys(this._hotspots);
    }
});

/**
 * Get the hotspots count.
 * @name FORGE.HotspotManager#count
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.HotspotManager.prototype, "count",
{
    /** @this {FORGE.HotspotManager} */
    get: function()
    {
        return this.uids.length;
    }
});
