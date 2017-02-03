
/**
 * The FORGE.PlaylistManager is an object that manages playlists of the project.
 *
 * @constructor FORGE.PlaylistManager
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo  previous/next playlist
 * @todo  real keepAudio to resume a "lost sound"
 * @todo  preload of all sounds
 */
FORGE.PlaylistManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.PlaylistManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The general config backup.
     * @name FORGE.PalylistManager#_config
     * @type {?AudioPlaylistsConfig}
     * @private
     */
    this._config = null;

    /**
     * Array of {@link FORGE.Playlist}.
     * @name FORGE.PlaylistManager#_playlists
     * @type {?Array<FORGE.Playlist>}
     * @private
     */
    this._playlists = null;

    /**
     * The tracks list object.
     * @name  FORGE.PlaylistManager#_tracks
     * @type {?Array<FORGE.PlaylistTrack>}
     * @private
     */
    this._tracks = null;

    /**
     * Uid of the current {@link FORGE.Playlist}.
     * @name  FORGE.PlaylistManager#_playlistUID
     * @type {string}
     * @private
     */
    this._playlistUID = "";

    /**
     * The default playlist uid.
     * @name FORGE.PlaylistManager#_defaultList
     * @type {string}
     * @private
     */
    this._defaultList = "";

    /**
     * The maximum volume for all playlists.
     * @name  FORGE.PlaylistManager#_maxVolume
     * @type {number}
     * @private
     */
    this._maxVolume = 1;

    /**
     * The current volume for all the playlists.
     * @name FORGE.PlaylistManager#_volume
     * @type {number}
     * @private
     */
    this._volume = 1;

    /**
     * Is the playlist manager enabled?
     * @name  FORGE.PlaylistManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Tracks must be preloaded?
     * @name  FORGE.PlaylistManager#_preload
     * @type {boolean}
     * @private
     */
    this._preload = false;

    /**
     * Is the playlistManager paused?
     * @name  FORGE.PlaylistManager#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    /**
     * On playlist manager ready event dispatcher.
     * @name FORGE.Sound#_onReady
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * On playlist manager play event dispatcher.
     * @name FORGE.PlaylistManager#_onPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On playlist manager stop event dispatcher.
     * @name FORGE.PlaylistManager#_onStop
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * On playlist manager pause event dispatcher.
     * @name FORGE.PlaylistManager#_onPause
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * On playlist manager resume event dispatcher.
     * @name FORGE.PlaylistManager#_onResume
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * On playlist manager ended event dispatcher.
     * @name FORGE.PlaylistManager#_onEnded
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnded = null;

    FORGE.BaseObject.call(this, "PlaylistManager");

};

FORGE.PlaylistManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PlaylistManager.prototype.constructor = FORGE.PlaylistManager;

/**
 * Boot sequence.
 * @method FORGE.PlaylistManager#boot
 */
FORGE.PlaylistManager.prototype.boot = function()
{
    this._playlists = [];
    this._tracks = [];

    this._viewer.audio.onEnable.add(this._enableSoundHandler, this);
    this._viewer.story.onSceneLoadStart.add(this._sceneLoadStartHandler, this);
};

/**
 * Enable handler the sound manager.
 * @method FORGE.PlaylistManager#_enableSoundHandler
 * @private
 */
FORGE.PlaylistManager.prototype._enableSoundHandler = function()
{
    if(this._enabled === true && this._playlists.length > 0 && this.ready === true && this.decoded === true && this._paused === false)
    {
        if(this.paused === true)
        {
            this.resume();
        }
        else if(this.playing === false)
        {
            this.play();
        }
    }
};

/**
 * Event handler for scene start.
 * @method FORGE.PlaylistManager#_sceneLoadStartHandler
 * @private
 */
FORGE.PlaylistManager.prototype._sceneLoadStartHandler = function()
{
    if(typeof this._viewer.story.scene.config.playlists !== "undefined")
    {
        this._parseSceneConfig(this._viewer.story.scene.config.playlists);
    }
    else
    {
        //restore global playlists config
        this._applyConfig(this._config);

        if(this._paused === false && this._defaultList !== this._playlistUID)
        {
            if(this._enabled === false || this.ready === false || this.decoded === false || this.playing === true)
            {
                this._stopScenePlaylist();
            }

            //load the default playlist of the global audio if exists
            this._startScenePlaylist(this._defaultList);
        }
    }
};

/**
 * Parse the scene configuration part related to playlist.
 * @method  FORGE.PlaylistManager#_parseSceneConfig
 * @private
 * @param  {AudioPlaylistsConfig} config - The scene configuration part related to playlist.
 */
FORGE.PlaylistManager.prototype._parseSceneConfig = function(config)
{
    var extendedConfig = /** @type {AudioPlaylistsConfig} */ FORGE.Utils.extendMultipleObjects(this._config, config);
    this._applyConfig(extendedConfig);

    if(this._paused === false)
    {
        if(this._enabled === false)
        {
            this._stopScenePlaylist();
        }
        else
        {
            if(!this._startScenePlaylist(this._defaultList))
            {
                if(this.playing === true)
                {
                    this._stopScenePlaylist();
                }
            }
        }
    }
};

/**
 * Set values from configuration file.
 * @method  FORGE.PlaylistManager#_applyConfig
 * @param {?AudioPlaylistsConfig} config - The config file.
 * @private
 */
FORGE.PlaylistManager.prototype._applyConfig = function(config)
{
    if(config !== null)
    {
        this._enabled = typeof config.enabled !== "undefined" ? Boolean(config.enabled) : true;

        if (typeof config.default !== "undefined")
        {
            if (typeof config.default === "string" && config.default !== "")
            {
                this._defaultList = config.default;
            }
            else if (typeof config.default === "number" && config.default >= 0 && config.default < this._playlists.length)
            {
                this._defaultList = this._playlists[config.default].uid;
            }
        }

        this._maxVolume = (typeof config.volume !== "undefined" && typeof config.volume.max === "number") ? FORGE.Math.clamp(config.volume.max, 0, 1) : 1;
        this._volume = (typeof config.volume !== "undefined" && typeof config.volume.default === "number") ? FORGE.Math.clamp(config.volume.default, 0, this._maxVolume) : FORGE.Math.clamp(1, 0, this._maxVolume);
    }
};

/**
 * Add a playlist config to the manager.
 * @method FORGE.PlaylistManager#addConfig
 * @param {AudioPlaylistsConfig} config - The config you want to add.
 */
FORGE.PlaylistManager.prototype.addConfig = function(config)
{
    this._parseConfig(config);

    this._initPlaylist();
};

/**
 * Parse a playlist config object.
 * @method FORGE.PlaylistManager#_parseConfig
 * @private
 * @param {AudioPlaylistsConfig} config - The config you want to parse.
 */
FORGE.PlaylistManager.prototype._parseConfig = function(config)
{
    var playlist, track;

    this._config = config;

    if(typeof config.lists !== "undefined")
    {
        for(var i = 0, ii = config.lists.length; i<ii; i++)
        {
            playlist = new FORGE.Playlist(this._viewer, config.lists[i]);
            this.add(playlist);
        }
    }

    if(typeof config.tracks !== "undefined")
    {
        for(var j = 0, jj = config.tracks.length; j<jj; j++)
        {
            track = new FORGE.PlaylistTrack(this._viewer, config.tracks[j]);
            this.addTrack(track);

            if(this._preload === true)
            {
                // @todo manage preload queue
                this.warn("Preload is not supported yet.");
            }
        }
    }

    this._applyConfig(config);

    if(typeof config.lists !== "undefined" && config.lists.length > 0)
    {
        if (this._defaultList === "")
        {
            this.warn("The playlist manager has a default playlist that is not in its playlists array!");
        }

        this._playlistUID = this._defaultList;
    }
};

/**
 * Initialize the default playlist.
 * @method FORGE.PlaylistManager#_initPlaylist
 * @private
 */
FORGE.PlaylistManager.prototype._initPlaylist = function()
{
    if(this._playlists.length <= 0)
    {
        return;
    }

    var uid;
    if(typeof this._defaultList === "string" && this._defaultList !== "")
    {
        uid = this._defaultList;
    }
    else
    {
        uid = this._playlists[0].uid;
    }

    if(FORGE.UID.get(uid) === undefined)
    {
        this.warn("PlaylistManager : uid \""+uid+"\" is not into playlists");
    }

    if(FORGE.UID.isTypeOf(uid, "Playlist") === true)
    {
        this.play(uid, true);
    }
    else
    {
        this.warn("Impossible to play the playlist with uid "+uid+", it doesn't seem to be a playlist!");
    }
};

/**
 * Start or resume a playlist for a specific scene.
 * @method  FORGE.PlaylistManager#_startScenePlaylist
 * @param {string} playlistUID - The default playlist uid.
 * @return {boolean} Returns true if the playlist is found.
 * @private
 */
FORGE.PlaylistManager.prototype._startScenePlaylist = function(playlistUID)
{
    if(playlistUID !== null && FORGE.UID.isTypeOf(playlistUID, "Playlist") === true)
    {
        //Maybe the new scene shares the same playlist so we do not reset the playback
        if(this.playlist !== null && this.playlist.uid === playlistUID)
        {
            if(this.playlist.track !== null && (typeof this.playlist.track.uid !== "undefined" && this.playlist.track.uid !== ""))
            {
                if(this.paused === true)
                {
                    this.resume();
                }
                else if(this.playing === false)
                {
                    this.play(playlistUID, true);
                }
            }
            else
            {
                this.stop();
                this.play(playlistUID, true);
            }
        }
        else
        {
            this.stop();
            this.play(playlistUID, true);
        }

        return true;
    }

    return false;
};

/**
 * Stop or pause a playlist.
 * @method  FORGE.PlaylistManager#_stopScenePlaylist
 * @private
 */
FORGE.PlaylistManager.prototype._stopScenePlaylist = function()
{
    if(this.playing === true)
    {
        this.pause();
    }
    else
    {
        this.stop();
    }
};

/**
 * Dispatch play event and notify it to the playlist
 * @method  FORGE.PlaylistManager#_notifyPlay
 * @private
 */
FORGE.PlaylistManager.prototype._notifyPlay = function()
{
    if(this._onPlay !== null)
    {
        this._onPlay.dispatch();
    }

    if(this.playlist !== null)
    {
        FORGE.Playlist.prototype._notifyPlay.call(this.playlist);
    }
};

/**
 * Dispatch stop event and notify it to the playlist
 * @method  FORGE.PlaylistManager#_notifyStop
 * @private
 */
FORGE.PlaylistManager.prototype._notifyStop = function()
{
    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }

    if(this.playlist !== null)
    {
        FORGE.Playlist.prototype._notifyStop.call(this.playlist);
    }
};

/**
 * Dispatch pause event and notify it to the playlist
 * @method  FORGE.PlaylistManager#_notifyPause
 * @private
 */
FORGE.PlaylistManager.prototype._notifyPause = function()
{
    if(this._onPause !== null)
    {
        this._onPause.dispatch();
    }

    if(this.playlist !== null)
    {
        FORGE.Playlist.prototype._notifyPause.call(this.playlist);
    }
};

/**
 * Dispatch resume event and notify it to the playlist
 * @method  FORGE.PlaylistManager#_notifyResume
 * @private
 */
FORGE.PlaylistManager.prototype._notifyResume = function()
{
    if(this._onResume !== null)
    {
        this._onResume.dispatch();
    }

    if(this.playlist !== null)
    {
        FORGE.Playlist.prototype._notifyResume.call(this.playlist);
    }
};

/**
 * Dispatch ended event and notify it to the playlist
 * @method  FORGE.PlaylistManager#_notifyEnded
 * @private
 */
FORGE.PlaylistManager.prototype._notifyEnded = function()
{
    if(this._onEnded !== null)
    {
        this._onEnded.dispatch();
    }

    if(this.playlist !== null)
    {
        FORGE.Playlist.prototype._notifyEnded.call(this.playlist);
    }
};

/**
 * Add a {@link FORGE.Playlist} to the playlist manager.
 * @method  FORGE.PlaylistManager#add
 * @param {FORGE.Playlist} playlist - The {@link FORGE.Playlist} you want to add.
 */
FORGE.PlaylistManager.prototype.add = function(playlist)
{
    this._playlists.push(playlist);
};

/**
 * Add a {@link FORGE.PlaylistTrack} to the playlist manager.
 * @method  FORGE.PlaylistManager#addTrack
 * @param {FORGE.PlaylistTrack} track - The {@link FORGE.PlaylistTrack} you want to add.
 */
FORGE.PlaylistManager.prototype.addTrack = function(track)
{
    this._tracks.push(track);
};

/**
 * Know if the project have any {@link FORGE.Playlist}.
 * @method FORGE.PlaylistManager#hasPlaylists
 * @return {boolean} Returns true if the project has at least a {@link FORGE.Playlist}, false if not.
 */
FORGE.PlaylistManager.prototype.hasPlaylists = function()
{
    return this._playlists.length !== 0;
};

/**
 * Know if the project have any {@link FORGE.PlaylistTrack}.
 * @method FORGE.PlaylistManager#hasTracks
 * @return {boolean} Returns true if the project has at least a {@link FORGE.PlaylistTrack}, false if not.
 */
FORGE.PlaylistManager.prototype.hasTracks = function()
{
    return this._tracks.length !== 0;
};

/**
 * Play the current playlist or a specific one at a specific track.
 * @method  FORGE.PlaylistManager#play
 * @param  {FORGE.Playlist|string|number=} playlist - The {@link FORGE.Playlist} you want to play or its uid or its index.
 * @param {boolean=} checkAutoPlay - Set to true if the autoPlay status of the playlist must be checked.
 */
FORGE.PlaylistManager.prototype.play = function(playlist, checkAutoPlay)
{
    var uid;

    if(typeof playlist === "string" && FORGE.UID.isTypeOf(playlist, "Playlist"))
    {
        uid = playlist;
    }
    else if(FORGE.Utils.isTypeOf(playlist, "Playlist"))
    {
        uid = playlist.uid;
    }
    else if (typeof playlist === "number" && playlist >= 0 && playlist < this._playlists.length)
    {
        uid = this._playlists[playlist].uid;
    }
    else if(this._playlistUID !== "")
    {
        uid = this._playlistUID;
    }
    else if(typeof playlist === "undefined" || playlist === "")
    {
        uid = this._playlists[0].uid;
    }

    if(typeof uid !== "undefined")
    {
        if(this.playing === true)
        {
            this.stop();
        }

        this._playlistUID = uid;

        if(this._enabled === true)
        {
            this._paused = false;

            this.playlist.play(null, checkAutoPlay);

            this.log("FORGE.PlaylistManager.play(); [uid: "+this._playlistUID+"]");
        }
    }
};

/**
 * Stop the current {@link FORGE.Playlist}.
 * @method  FORGE.PlaylistManager#play
 */
FORGE.PlaylistManager.prototype.stop = function()
{
    if(this.playlist !== null)
    {
        this.playlist.stop();
    }
};

/**
 * Pause the current {@link FORGE.Playlist}.
 * @method  FORGE.PlaylistManager#pause
 */
FORGE.PlaylistManager.prototype.pause = function()
{
    if(this.playlist !== null && this.playlist.playing === true)
    {
        this._paused = true;
        this.playlist.pause();
    }
};

/**
 * Resume the current {@link FORGE.Playlist}.
 * @method  FORGE.PlaylistManager#resume
 */
FORGE.PlaylistManager.prototype.resume = function()
{
    if(this.playlist !== null && this._enabled === true && this.playlist.paused === true)
    {
        var isPaused = this._paused;
        this._paused = false;
        if (isPaused === true && this._defaultList !== this._playlistUID)
        {
            this._startScenePlaylist(this._defaultList);
        }
        else
        {
            this.playlist.resume();
        }
    }
};

/**
 * Set the next {@link FORGE.PlaylistTrack} of the current {@link FORGE.Playlist} to be the current track.<br>
 * If the playlist is paused, keep the pause status of the playlist.
 * @method FORGE.PlaylistManager#nextTrack
 */
FORGE.PlaylistManager.prototype.nextTrack = function()
{
    if(this.playlist !== null && this._enabled === true)
    {
        this.playlist.nextTrack();
    }
};

/**
 * Set the previous {@link FORGE.PlaylistTrack} of the current {@link FORGE.Playlist} to be the current track.<br>
 * If the playlist is paused, keep the pause status of the playlist.
 * @method FORGE.PlaylistManager#previousTrack
 */
FORGE.PlaylistManager.prototype.previousTrack = function()
{
    if(this.playlist !== null && this._enabled === true)
    {
        this.playlist.previousTrack();
    }
};

/**
 * Destroy sequence
 * @method FORGE.PlaylistManager#destroy
 */
FORGE.PlaylistManager.prototype.destroy = function()
{
    this.stop();

    this._viewer.audio.onEnable.remove(this._enableSoundHandler, this);
    this._viewer.story.onSceneLoadStart.remove(this._sceneLoadStartHandler, this);

    this._viewer = null;
    this._config = null;

    var i = this._playlists.length;
    while(i--)
    {
        this._playlists[i].destroy();
    }
    this._playlists = null;

    var j = this._tracks.length;
    while(j--)
    {
        this._tracks[j].destroy();
    }
    this._tracks = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the playlists Array.
 * @name FORGE.PlaylistManager#playlists
 * @readonly
 * @type {Array<FORGE.Playlist>}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "playlists",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        return this._playlists;
    }
});

/**
 * Get the tracks Array.
 * @name FORGE.PlaylistManager#tracks
 * @readonly
 * @type {Array<FORGE.Playlist>}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "tracks",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        return this._tracks;
    }
});

/**
 * Get the current playlist.
 * @name FORGE.PlaylistManager#playlist
 * @readonly
 * @type {?FORGE.Playlist}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "playlist",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(FORGE.UID.isTypeOf(this._playlistUID, "Playlist") === true)
        {
            return FORGE.UID.get(this._playlistUID, "Playlist");
        }

        return null;
    }
});

/**
 * Get the loop status of the current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#loop
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "loop",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.loop;
        }

        return true; // default state is true
    }
});

/**
 * Get the auto play status of the current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#autoPlay
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "autoPlay",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.autoPlay;
        }

        return true; // default state is true
    }
});

/**
 * Preload status of audio files.
 * @name FORGE.PlaylistManager#preload
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "preload",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        return this._preload;
    },

    /** @this {FORGE.PlaylistManager} */
    set: function(value)
    {
        this._preload = Boolean(value);
    }
});

/**
 * Get the enabled status of the playlists manager.
 * @name FORGE.PlaylistManager#enabled
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "enabled",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        return this._enabled;
    }
});

/**
 * Get the ready status of current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "ready",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.ready;
        }

        return false;
    }
});

/**
 * Get the decoded status of current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#decoded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "decoded",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.decoded;
        }

        return false;
    }
});

/**
 * Get the playing status of current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#playing
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "playing",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.playing;
        }

        return false;
    }
});

/**
 * Get the pause status of current {@link FORGE.Playlist}.
 * @name FORGE.PlaylistManager#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "paused",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this.playlist !== null)
        {
            return this.playlist.paused;
        }

        return false;
    }
});

/**
 * Get the playlist manager main volume.
 * @name FORGE.PlaylistManager#volume
 * @type {number}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "volume",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        return this._volume;
    },

    /** @this {FORGE.PlaylistManager} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        value = FORGE.Math.clamp(value, 0, 1);
        if(this._maxVolume < value)
        {
            this._volume = this._maxVolume;
        }
        else
        {
            this._volume = value;
        }

        if(FORGE.UID.isTypeOf(this._playlistUID, "Playlist") === true)
        {
            var playlist = FORGE.UID.get(this._playlistUID, "Playlist");

            if(playlist !== null)
            {
                var track = playlist.track;

                if(track !== null)
                {
                    track.volume = playlist.volume * this._volume;
                }
            }
        }
    }
});

/**
 * Get the "onReady" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.PlaylistManager#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onReady",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});

/**
 * Get the "onPlay" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistManager#onPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onPlay",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onPlay === null)
        {
            this._onPlay = new FORGE.EventDispatcher(this);
        }

        return this._onPlay;
    }
});

/**
 * Get the "onStop" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistManager#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onStop",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});

/**
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistManager#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onPause",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
 * Get the "onResume" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistManager#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onResume",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});

/**
 * Get the "onEnded" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistManager#onEndedd
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistManager.prototype, "onEnded",
{
    /** @this {FORGE.PlaylistManager} */
    get: function()
    {
        if(this._onEnded === null)
        {
            this._onEnded = new FORGE.EventDispatcher(this);
        }

        return this._onEnded;
    }
});
