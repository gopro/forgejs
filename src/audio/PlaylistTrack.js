
/**
 * A FORGE.PlaylistTrack is an object that manages the sound atached to a playlist track.
 *
 * @constructor FORGE.PlaylistTrack
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {AudioTrackConfig} config - The track config object.
 * @extends {FORGE.BaseObject}
 */
FORGE.PlaylistTrack = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.PlaylistTrack#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config object.
     * @name FORGE.PlaylistTrack#_config
     * @type {?AudioTrackConfig}
     * @private
     */
    this._config = config;

    /**
     * The name of the track.
     * @name  FORGE.PlaylistTrack#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The author of the track.
     * @name  FORGE.PlaylistTrack#_author
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._author = null;

    /**
     * The url of the track.
     * @name  FORGE.PlaylistTrack#_url
     * @type {string}
     * @private
     */
    this._url = "";

    /**
     * Does the track must be looped?
     * @name  FORGE.PlaylistTrack#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * The {@link FORGE.Sound} attached to this track.
     * @name  FORGE.PlaylistTrack#_sound
     * @type {?FORGE.Sound}
     * @private
     */
    this._sound = null;

    FORGE.BaseObject.call(this, "PlaylistTrack");

    this._boot();
};

FORGE.PlaylistTrack.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PlaylistTrack.prototype.constructor = FORGE.PlaylistTrack;

/**
 * Boot sequence.
 * @method FORGE.PlaylistTrack#_boot
 * @private
 */
FORGE.PlaylistTrack.prototype._boot = function()
{
    this._uid = this._config.uid;
    this._register();

    this._parseConfig(this._config);
};

/**
 * Parse the track config.
 * @method FORGE.PlaylistTrack#_parseConfig
 * @param {AudioTrackConfig} config - The config to parse.
 * @private
 */
FORGE.PlaylistTrack.prototype._parseConfig = function(config)
{
    this._unregister();
    this._uid = config.uid;
    this._register();
    this._name = new FORGE.LocaleString(this._viewer, config.name);
    this._author = new FORGE.LocaleString(this._viewer, config.author);
    this._url = config.url;
    this._loop = config.loop || false;
};

/**
 * Bind handlers on the sound
 * @method  FORGE.PlaylistTrack#_bindEvents
 * @private
 */
FORGE.PlaylistTrack.prototype._bindEvents = function()
{
    this._sound.onPlay.add(this._onPlayHandler, this);
    this._sound.onStop.add(this._onStopHandler, this);
    this._sound.onPause.add(this._onPauseHandler, this);
    this._sound.onResume.add(this._onResumeHandler, this);
    this._sound.onEnded.add(this._onEndedHandler, this);
};

/**
 * Unbind handlers on the sound
 * @method  FORGE.PlaylistTrack#_unbindEvents
 * @private
 */
FORGE.PlaylistTrack.prototype._unbindEvents = function()
{
    this._sound.onPlay.remove(this._onPlayHandler, this);
    this._sound.onStop.remove(this._onStopHandler, this);
    this._sound.onPause.remove(this._onPauseHandler, this);
    this._sound.onResume.remove(this._onResumeHandler, this);
    this._sound.onEnded.remove(this._onEndedHandler, this);
};

/**
 * Play handler to notify event to the playlist manager
 * @method  FORGE.PlaylistTrack#_onPlayHandler
 * @private
 */
FORGE.PlaylistTrack.prototype._onPlayHandler = function()
{
    FORGE.PlaylistManager.prototype._notifyPlay.call(this._viewer.playlists);
};

/**
 * Stop handler to notify event to the playlist manager
 * @method  FORGE.PlaylistTrack#_onStopHandler
 * @private
 */
FORGE.PlaylistTrack.prototype._onStopHandler = function()
{
    FORGE.PlaylistManager.prototype._notifyStop.call(this._viewer.playlists);
};

/**
 * Pause handler to notify event to the playlist manager
 * @method  FORGE.PlaylistTrack#_onPauseHandler
 * @private
 */
FORGE.PlaylistTrack.prototype._onPauseHandler = function()
{
    FORGE.PlaylistManager.prototype._notifyPause.call(this._viewer.playlists);
};

/**
 * Resume handler to notify event to the playlist manager
 * @method  FORGE.PlaylistTrack#_onResumeHandler
 * @private
 */
FORGE.PlaylistTrack.prototype._onResumeHandler = function()
{
    FORGE.PlaylistManager.prototype._notifyResume.call(this._viewer.playlists);
};

/**
 * Ended handler to notify event to the playlist manager
 * @method  FORGE.PlaylistTrack#_onEndedHandler
 * @private
 */
FORGE.PlaylistTrack.prototype._onEndedHandler = function()
{
    FORGE.PlaylistManager.prototype._notifyEnded.call(this._viewer.playlists);
};

/**
 * Play the track.
 * @method FORGE.PlaylistTrack#play
 */
FORGE.PlaylistTrack.prototype.play = function()
{
    if(this._sound === null)
    {
        this._sound = new FORGE.Sound(this._viewer, this._uid + "-sound", this._url);
        this._sound.volume = this._viewer.playlists.volume * this._viewer.playlists.playlist.volume;
        if (this._loop === true)
        {
            this._sound.loop = this._loop;
        }

        this._bindEvents();
    }

    this._sound.play();
};

/**
 * Stop the track.
 * @method FORGE.PlaylistTrack#stop
 */
FORGE.PlaylistTrack.prototype.stop = function()
{
    if(this._sound !== null)
    {
        this._sound.stop(true);
    }
};

/**
 * Pause the track.
 * @method FORGE.PlaylistTrack#pause
 */
FORGE.PlaylistTrack.prototype.pause = function()
{
    if(this._sound !== null)
    {
        this._sound.pause();
    }
};

/**
 * Resume the track.
 * @method FORGE.PlaylistTrack#resume
 */
FORGE.PlaylistTrack.prototype.resume = function()
{
    if(this._sound !== null)
    {
        this._sound.resume();
    }
};

/**
 * Destroy sequence
 * @method  FORGE.PlaylistTrack#destroy
 */
FORGE.PlaylistTrack.prototype.destroy = function()
{
    this._viewer = null;

    this._config = null;

    this._name.destroy();
    this._name = null;

    this._author.destroy();
    this._author = null;

    if(this._sound !== null)
    {
        this._unbindEvents();

        this._sound.destroy();
        this._sound = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the name of the track.
 * @name  FORGE.PlaylistTrack#name
 * @type {string}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "name",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        return this._name.value;
    }
});

/**
 * Get the author of the track.
 * @name  FORGE.PlaylistTrack#author
 * @type {string}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "author",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        return this._author.value;
    }
});

/**
 * Get and set the current time of the track.
 * @name  FORGE.PlaylistTrack#currentTime
 * @type {number}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "currentTime",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.currentTime;
        }

        return 0;
    },

    /** @this {FORGE.PlaylistTrack} */
    set: function(value)
    {
        if(this._sound === null)
        {
            return;
        }

        this._sound.currentTime = value;
    }
});

/**
 * Get and set the volume of the track.
 * @name  FORGE.PlaylistTrack#volume
 * @type {number}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "volume",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.volume;
        }

        return false;
    },

    /** @this {FORGE.PlaylistTrack} */
    set: function(value)
    {
        if(this._sound === null)
        {
            return false;
        }

        this._sound.volume = value;
    }
});

/**
 * Get the ready status of the track.
 * @name FORGE.PlaylistTrack#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "ready",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.ready;
        }

        return false;
    }
});

/**
 * Get the decoded status of the track.
 * @name FORGE.PlaylistTrack#decoded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "decoded",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.decoded;
        }

        return false;
    }
});

/**
 * Get the playing status of the track.
 * @name FORGE.PlaylistTrack#playing
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "playing",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.playing;
        }

        return false;
    }
});

/**
 * Get the paused status of the track.
 * @name FORGE.PlaylistTrack#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "paused",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.paused;
        }

        return false;
    }
});

/**
 * Get ans set the loop state of the track.
 * @name FORGE.PlaylistTrack#loop
 * @type {boolean}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "loop",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        return this._loop;
    },

    /** @this {FORGE.PlaylistTrack} */
    set: function(value)
    {
        this._loop = Boolean(value);
    }
});

/**
 * Get the "onPlay" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistTrack#onPlay
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "onPlay",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.onPlay;
        }

        return;
    }
});

/**
 * Get the "onStop" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistTrack#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "onStop",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.onStop;
        }

        return;
    }
});

/**
 * Get the "onPause" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistTrack#onPause
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "onPause",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.onPause;
        }

        return;
    }
});

/**
 * Get the "onResume" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistTrack#onResume
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "onResume",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.onResume;
        }

        return;
    }
});

/**
 * Get the "onEnded" event {@link FORGE.EventDispatcher} of the track.
 * @name FORGE.PlaylistTrack#onEnded
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.PlaylistTrack.prototype, "onEnded",
{
    /** @this {FORGE.PlaylistTrack} */
    get: function()
    {
        if(this._sound !== null)
        {
            return this._sound.onEnded;
        }

        return;
    }
});