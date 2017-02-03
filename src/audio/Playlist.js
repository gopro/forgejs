
/**
 * A FORGE.Playlist is an object that represents a list of media.
 *
 * @constructor FORGE.Playlist
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {AudioPlaylistConfig} config - The playlist config object.
 * @extends {FORGE.BaseObject}
 */
FORGE.Playlist = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Playlist#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config object.
     * @name FORGE.Playlist#_config
     * @type {?AudioPlaylistConfig}
     * @private
     */
    this._config = config;

    /**
     * Array of PlaylistTrack uid.
     * @name FORGE.Playlist#_tracks
     * @type {?Array<string>}
     * @private
     */
    this._tracks = null;

    /**
     * The name of the playlist.
     * @name FORGE.Playlist#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The default track uid or index of the playlist.
     * @name FORGE.Playlist#_defaultTrack
     * @type {string}
     * @private
     */
    this._defaultTrack = "";

    /**
     * UID of the current {@link FORGE.PlaylistTrack}.
     * @name FORGE.Playlist#_trackUID
     * @type {string}
     * @private
     */
    this._trackUID = "";

    /**
     * The maximum volume for playlist.
     * @name  FORGE.Playlist#_maxVolume
     * @type {number}
     * @private
     */
    this._maxVolume = 1;

    /**
     * The current volume of the playlist.
     * Can't be greater than the maximum volume.
     * @name FORGE.Playlist#_volume
     * @type {number}
     * @private
     */
    this._volume = 1;

    /**
     * Does the playlist will auto play?
     * @name FORGE.Playlist#_autoPlay
     * @type {boolean}
     * @private
     */
    this._autoPlay = true;

    /**
     * Internal flag to know if the playlist must check the autoPlay property.
     * @name  FORGE.Playlist#_checkAutoPlay
     * @type {boolean}
     * @private
     */
    this._checkAutoPlay = true;

    /**
     * Does the playlist will loop?
     * @name FORGE.Playlist#_loop
     * @type {boolean}
     * @private
     */
    this._loop = true;

    /**
     * Playlist with tracks ready event dispatcher.
     * @name FORGE.Playlist#_onReady
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * On playlist play event dispatcher.
     * @name FORGE.Playlist#_onPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On playlist stop event dispatcher.
     * @name FORGE.Playlist#_onStop
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * On playlist pause event dispatcher.
     * @name FORGE.Playlist#_onPause
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * On playlist resume event dispatcher.
     * @name FORGE.Playlist#_onResume
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * On playlist ended event dispatcher.
     * @name FORGE.Playlist#_onEnded
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnded = null;

    FORGE.BaseObject.call(this, "Playlist");

    this._boot();
};

FORGE.Playlist.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Playlist.prototype.constructor = FORGE.Playlist;

/**
 * Boot sequence.
 * @method FORGE.Playlist#_boot
 * @private
 */
FORGE.Playlist.prototype._boot = function()
{
    this._uid = this._config.uid;
    this._register();
    this._name = new FORGE.LocaleString(this._viewer, this._config.name);

    this._tracks = [];

    this._parseConfig(this._config);
    this._parseTracks(this._config);
};

/**
 * Parse playlist config.
 * @method FORGE.Playlist#_parseConfig
 * @private
 * @param {AudioPlaylistConfig} config - The object that describes the playlist config.
 */
FORGE.Playlist.prototype._parseConfig = function(config)
{
    this._autoPlay = typeof config.autoPlay !== "undefined" ? Boolean(config.autoPlay) : true;
    this._loop = typeof config.loop !== "undefined" ? Boolean(config.loop) : true;

    this._maxVolume = (typeof config.volume !== "undefined" && typeof config.volume.max === "number") ? FORGE.Math.clamp(config.volume.max, 0, 1) : 1;
    this._volume = (typeof config.volume !== "undefined" && typeof config.volume.default === "number") ? FORGE.Math.clamp(config.volume.default, 0, this._maxVolume) : FORGE.Math.clamp(1, 0, this._maxVolume);
};

/**
 * Parse playlist tracks.
 * @method FORGE.Playlist#_parseTracks
 * @private
 * @param {AudioPlaylistConfig} config - The object that describes the playlist config.
 */
FORGE.Playlist.prototype._parseTracks = function(config)
{
    if(typeof config.tracks !== "undefined" && FORGE.Utils.isArrayOf(config.tracks, "string") === true)
    {
        this._tracks = config.tracks;
    }
    else
    {
        this.warn("A playlist has no track in its configuration, or configuration is not valid!");
    }

    //Parse the default track of the playlist
    if(typeof config.default === "string" && config.default !== "")
    {
        this._defaultTrack = config.default;
    }
    else if(typeof config.default === "number" && config.default >= 0 && config.default < this._tracks.length)
    {
        this._defaultTrack = this._tracks[config.default].uid;
    }
    else
    {
        this.warn("A playlist has a default track that is not in its tracks array!");
    }

    this._trackUID = this._defaultTrack;

    if(this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * Internal method to find a {@link FORGE.PlaylistTrack} index in the _tracks Array.
 * @method FORGE.Playlist#_indexOfTrack
 * @private
 * @param {FORGE.PlaylistTrack} value - The {@link FORGE.PlaylistTrack} you search for.
 * @return {number} Returns the index of the searched {@link FORGE.PlaylistTrack} if found, -1 if not.
 *
FORGE.Playlist.prototype._indexOfTrack = function (track)
{
    if(this._tracks === null)
        return -1;

    var _track;

    for (var i = 0, ii = this._tracks.length; i < ii; i++)
    {
        _track = this._tracks[i];

        if(_track === track)
            return i;
    }

    return -1;
};
*/

/**
 * Event handler that triggers when the current track ends, set the next track to play.
 * @method FORGE.Playlist#_trackEndHandler
 * @private
 */
FORGE.Playlist.prototype._trackEndHandler = function()
{
    if(this._tracks.length > 0)
    {
        var index = this._tracks.indexOf(this._trackUID) + 1;

        // loop if playlist loop is activated and track doesn't loop.
        if(index === this._tracks.length && (this._loop === false || this.track.loop === true))
        {
            // reset to the first track of the playlist for next call to play
            this._trackUID = this._tracks[0];
            return;
        }
    }

    this.nextTrack();
};

/**
 * Dispatch play event to the track
 * @method  FORGE.Playlist#_notifyPlay
 * @private
 */
FORGE.Playlist.prototype._notifyPlay = function()
{
    if(this._onPlay !== null)
    {
        this._onPlay.dispatch();
    }
};

/**
 * Dispatch stop event to the track
 * @method  FORGE.Playlist#_notifyStop
 * @private
 */
FORGE.Playlist.prototype._notifyStop = function()
{
    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }
};

/**
 * Dispatch pause event to the track
 * @method  FORGE.Playlist#_notifyPause
 * @private
 */
FORGE.Playlist.prototype._notifyPause = function()
{
    if(this._onPause !== null)
    {
        this._onPause.dispatch();
    }
};

/**
 * Dispatch resume event to the track
 * @method  FORGE.Playlist#_notifyResume
 * @private
 */
FORGE.Playlist.prototype._notifyResume = function()
{
    if(this._onResume !== null)
    {
        this._onResume.dispatch();
    }
};

/**
 * Dispatch ended event to the track
 * @method  FORGE.Playlist#_notifyEnded
 * @private
 */
FORGE.Playlist.prototype._notifyEnded = function()
{
    if(this._onEnded !== null)
    {
        this._onEnded.dispatch();
    }
};

/**
 * Know if the playlist have any {@link FORGE.PlaylistTrack}.
 * @method FORGE.Playlist#hasTracks
 * @return {boolean} Returns true if the playlist has at least a {@link FORGE.PlaylistTrack}, false if not.
 */
FORGE.Playlist.prototype.hasTracks = function()
{
    return this._tracks.length !== 0;
};

/**
 * Play the current track or set a track to be the current one then play it.
 * @method FORGE.Playlist#play
 * @param {?FORGE.PlaylistTrack|string|number=} track - The track you want to play or its uid or its index, if undefined, play the current track.
 * @param {boolean=} checkAutoPlay - Does the autoPlay status must be checked?
 * @return {FORGE.PlaylistTrack} Returns the playing track.
 */
FORGE.Playlist.prototype.play = function(track, checkAutoPlay)
{
    this._checkAutoPlay = typeof checkAutoPlay !== "undefined" ? checkAutoPlay : false;

    var uid;

    if(typeof track === "string" && FORGE.UID.isTypeOf(track, "PlaylistTrack"))
    {
        uid = track;
    }
    else if(FORGE.Utils.isTypeOf(track, "PlaylistTrack"))
    {
        uid = track.uid;
    }
    else if (typeof track === "number" && track >= 0 && track < this._tracks.length)
    {
        uid = this._tracks[track];
    }
    else if(this._trackUID !== "")
    {
        uid = this._trackUID;
    }
    else if(typeof track === "undefined" || track === "")
    {
        uid = this._tracks[0];
    }

    if(typeof uid !== "undefined")
    {
        this.stop();

        this._trackUID = uid;

        if (this._checkAutoPlay === true && this._autoPlay === false)
        {
            this.warn("FORGE.Playlist.play(); autoPlay is disabled");
            return this.track;
        }

        this.track.play();

        if(this.track.onEnded.has(this._trackEndHandler, this) === false)
        {
            this.track.onEnded.add(this._trackEndHandler, this);
        }

        this.log("FORGE.Playlist.play(); [uid: "+this._trackUID+"]");

        return this.track;
    }

    return null;
};

/**
 * Stop the current track.
 * @method FORGE.Playlist#stop
 */
FORGE.Playlist.prototype.stop = function()
{
    if(this.track !== null)
    {
        this.track.stop();

        if(typeof this.track.onEnded !== "undefined" && this.track.onEnded.has(this._trackEndHandler, this) === false)
        {
            this.track.onEnded.remove(this._trackEndHandler, this);
        }
    }
};

/**
 * Pause the current track.
 * @method FORGE.Playlist#pause
 */
FORGE.Playlist.prototype.pause = function()
{
    if(this.track !== null)
    {
        this.track.pause();
    }
};

/**
 * Resume the current track if it's paused.
 * @method FORGE.Playlist#resume
 */
FORGE.Playlist.prototype.resume = function()
{
    if(this.track !== null)
    {
        this.track.resume();
    }
};

/**
 * Set the next {@link FORGE.PlaylistTrack} to be the current track.
 * If the playlist is paused, keep the pause status of the playlist.
 * @method FORGE.Playlist#nextTrack
 */
FORGE.Playlist.prototype.nextTrack = function()
{
    var index = -1;

    if(this._tracks.length > 0)
    {
        index = this._tracks.indexOf(this._trackUID) + 1;

        if(index === this._tracks.length)
        {
            index = 0;
        }
    }

    this.play(index, this._checkAutoPlay);

    if(this.paused === true)
    {
        this.pause();
    }
};

/**
 * Set the previous {@link FORGE.PlaylistTrack} to be the current track.
 * If the playlist is paused, keep the pause status of the playlist.
 * @method FORGE.Playlist#previousTrack
 */
FORGE.Playlist.prototype.previousTrack = function()
{
    var index = -1;

    if(this._tracks.length > 0)
    {
        index = this._tracks.indexOf(this._trackUID) - 1;

        if(index === -1)
        {
            index = this._tracks.length - 1;
        }
    }

    this.play(index, this._checkAutoPlay);

    if(this.paused === true)
    {
        this.pause();
    }
};

/**
 * Destroy sequence
 * @method FORGE.Playlist#destroy
 */
FORGE.Playlist.prototype.destroy = function()
{
    this.stop();

    this._viewer = null;

    this._name.destroy();
    this._name = null;

    if(this._tracks.length > 0)
    {
        this._tracks.length = 0;
        this._tracks = null;
    }

    this._config = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the list of tracks of this playlist.
 * @name FORGE.Playlist#tracks
 * @readonly
 * @type {Array<string>}
 */
Object.defineProperty(FORGE.Playlist.prototype, "tracks",
{
    /** @this {FORGE.Playlist} */
    get: function ()
    {
        return this._tracks;
    }
});

/**
 * Get the name of this playlist.
 * @name FORGE.Playlist#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Playlist.prototype, "name",
{
    /** @this {FORGE.Playlist} */
    get: function ()
    {
        return this._name.value;
    }
});

/**
 * Get the ready status of this playlist current track.
 * @name FORGE.Playlist#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "ready",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this.track !== null)
        {
            return this.track.ready;
        }

        return false;
    }
});

/**
 * Get the decoded status of this playlist current track.
 * @name FORGE.Playlist#decoded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "decoded",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this.track !== null)
        {
            return this.track.decoded;
        }

        return false;
    }
});

/**
 * Get the playing status of this playlist current track.
 * @name FORGE.Playlist#playing
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "playing",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this.track !== null)
        {
            return this.track.playing;
        }

        return false;
    }
});

/**
 * Get the paused status of this playlist current track.
 * @name FORGE.Playlist#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "paused",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this.track !== null)
        {
            return this.track.paused;
        }

        return false;
    }
});

/**
 * Get the current {@link FORGE.PlaylistTrack} of this playlist.
 * @name FORGE.Playlist#track
 * @readonly
 * @type {FORGE.PlaylistTrack}
 */
Object.defineProperty(FORGE.Playlist.prototype, "track",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(FORGE.UID.isTypeOf(this._trackUID, "PlaylistTrack") === true)
        {
            return FORGE.UID.get(this._trackUID, "PlaylistTrack");
        }

        return null;
    }
});

/**
 * Get and set the loop state of the playlist.
 * @name FORGE.Playlist#loop
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "loop",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        return this._loop;
    },

    /** @this {FORGE.Playlist} */
    set: function(value)
    {
        this._loop = Boolean(value);
    }
});

/**
 * Get and set the auto play state of the playlist.
 * @name FORGE.Playlist#autoPlay
 * @type {boolean}
 */
Object.defineProperty(FORGE.Playlist.prototype, "autoPlay",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        return this._autoPlay;
    },

    /** @this {FORGE.Playlist} */
    set: function(value)
    {
        this._autoPlay = Boolean(value);
    }
});

/**
 * Get the playlist volume.
 * @name FORGE.Playlist#volume
 * @type {number}
 */
Object.defineProperty(FORGE.Playlist.prototype, "volume",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        return this._volume;
    },

    /** @this {FORGE.Playlist} */
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

        if(FORGE.UID.isTypeOf(this._trackUID, "PlaylistTrack") === true)
        {
            var track = FORGE.UID.get(this._trackUID, "PlaylistTrack");

            if(track !== null)
            {
                track.volume = this._volume * this._viewer.playlists.volume;
            }
        }
    }
});

/**
 * Get the "onPlay" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onPlay",
{
    /** @this {FORGE.Playlist} */
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
 * Get the "onStop" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onStop",
{
    /** @this {FORGE.Playlist} */
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
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onPause",
{
    /** @this {FORGE.Playlist} */
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
 * Get the "onResume" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onResume",
{
    /** @this {FORGE.Playlist} */
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
 * Get the "onEnded" event {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onEnded
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onEnded",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this._onEnded === null)
        {
            this._onEnded = new FORGE.EventDispatcher(this);
        }

        return this._onEnded;
    }
});

/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of the playlist.
 * @name FORGE.Playlist#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Playlist.prototype, "onReady",
{
    /** @this {FORGE.Playlist} */
    get: function()
    {
        if(this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});
