
/**
 * A FORGE.SoundManager is an object to manage all sounds.
 *
 * @constructor FORGE.SoundManager
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo Start/Stop sound to avoid autoplay
 */
FORGE.SoundManager = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.SoundManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The global sound config backup.
     * @name FORGE.SoundManager#_config
     * @type {?AudioConfig}
     * @private
     */
    this._config = null;

    /**
     * The global volume for sounds.
     * @name FORGE.SoundManager#_volume
     * @type {number}
     * @private
     */
    this._volume = 1;

    /**
     * The volume has been changed?
     * @name FORGE.SoundManager#_volumeChanged
     * @type {boolean}
     * @private
     */
    this._volumeChanged = false;

    /**
     * The default volume for sounds.
     * Can't be greater than the maximum volume.
     * @name FORGE.SoundManager#_defaultVolume
     * @type {number}
     * @private
     */
    this._defaultVolume = 1;

    /**
     * The maximum volume for sounds.
     * @name  FORGE.SoundManager#_maxVolume
     * @type {number}
     * @private
     */
    this._maxVolume = 1;

    /**
     * The save of the global volume for sounds before a mute.
     * @name FORGE.SoundManager#_mutedVolume
     * @type {number}
     * @private
     */
    this._mutedVolume = 1;

    /**
     * Are all sounds muted?
     * @name FORGE.SoundManager#_muted
     * @type {boolean}
     * @private
     */
    this._muted = false;

    /**
     * Is the sound manager enabled?
     * @name  FORGE.SoundManager#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Array of {@link FORGE.Sound}.
     * @name FORGE.SoundManager#_sounds
     * @type {?Array<FORGE.Sound>}
     * @private
     */
    this._sounds = null;

    /**
     * Is audio deactivated?
     * @name FORGE.SoundManager#_noAudio
     * @type {boolean}
     * @private
     */
    this._noAudio = false;

    /**
     * Is Audio tag activated?
     * @name FORGE.SoundManager#_useAudioTag
     * @type {boolean}
     * @private
     */
    this._useAudioTag = false;

    /**
     * Is WebAudio API activated?
     * @name FORGE.SoundManager#_useWebAudio
     * @type {boolean}
     * @private
     */
    this._useWebAudio = true;

    /**
     * Number of sound channels.
     * @name FORGE.SoundManager#_channels
     * @type {number}
     * @private
     */
    this._channels = 32;

    /**
     * The AudioContext interface.
     * @name FORGE.SoundManager#_context
     * @type {?(AudioContext|webkitAudioContext)}
     * @private
     */
    this._context = null;

    /**
     * The AudioContext state.
     * @name FORGE.SoundManager#_contextState
     * @type {string}
     * @private
     */
    this._contextState = "running";

    /**
     * AnalyserNode to expose audio time and frequency data and create data visualisations.
     * @name FORGE.SoundManager#_analyser
     * @type {AnalyserNode}
     * @private
     */
    this._analyser = null;

    /**
     * Master GainNode used to control the overall volume of the audio graph.
     * @name FORGE.SoundManager#_masterGain
     * @type {GainNode}
     * @private
     */
    this._masterGain = null;

    /**
     * On sounds muted event dispatcher.
     * @name FORGE.SoundManager#_onMute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMute = null;

     /**
     * On sounds unmuted event dispatcher.
     * @name FORGE.SoundManager#_onUnmute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onUnmute = null;

    /**
     * On sounds volume change event dispatcher.
     * @name FORGE.SoundManager#_onVolumeChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onVolumeChange = null;

    /**
     * On sounds disabled event dispatcher.
     * @name FORGE.SoundManager#_onDisable
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onDisable = null;

    /**
     * On sounds enabled event dispatcher.
     * @name FORGE.SoundManager#_onEnable
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnable = null;

    FORGE.BaseObject.call(this, "SoundManager");
};

FORGE.SoundManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SoundManager.prototype.constructor = FORGE.SoundManager;

/**
 * Boot sequence.
 * @method FORGE.SoundManager#_boot
 * @private
 * @suppress {deprecated}
 */
FORGE.SoundManager.prototype.boot = function()
{
    this._sounds = [];

    if (FORGE.Device.iOS && FORGE.Device.webAudio === false)
    {
        this._channels = 1; //only 1 channel in iOS with AudioTag support
    }

    if (FORGE.Device.webAudio === true)
    {
        try
        {
            if (typeof window.AudioContext === "function")
            {
                this._context = new window.AudioContext();
            }
            else
            {
                this._context = new window.webkitAudioContext();
            }
        }
        catch (error)
        {
            this._context = null;
            this._useWebAudio = false;
            this._noAudio = true;
        }
    }

    if (FORGE.Device.audioTag === true && this._context === null)
    {
        this._useWebAudio = false;
        this._useAudioTag = true;
        this._noAudio = false;
    }

    if (this._context !== null)
    {
        if (typeof this._context.createGain === "undefined")
        {
            this._masterGain = this._context.createGainNode();
        }
        else
        {
            this._masterGain = this._context.createGain();
        }

        this._analyser = this._context.createAnalyser();
        this._analyser.connect(this._masterGain);

        this._masterGain.gain.value = this._volume;
        this._masterGain.connect(this._context.destination);

        // The common coordinate system used with WebGL.
        // The listener is always facing down the negative Z axis, the
        // positive Y axis points up, the positive X axis points right.
        this._context.listener.setOrientation(0, 0, -1, 0, 1, 0);
    }

    this._viewer.story.onSceneLoadStart.add(this._sceneLoadStartHandler, this);
};

/**
 * Event handler for scene start.
 * @method FORGE.SoundManager#_sceneLoadStartHandler
 * @private
 */
FORGE.SoundManager.prototype._sceneLoadStartHandler = function()
{
    if(typeof this._viewer.story.scene.config.audio !== "undefined")
    {
        this._parseSceneConfig(this._viewer.story.scene.config.audio);
    }
    else
    {
        //restore global sounds config
        this._applyConfig(this._config);

        //Is the sound manager enabled?
        if(this._enabled === false)
        {
            if(this._onDisable !== null)
            {
                this._onDisable.dispatch();
            }
        }
        else
        {
            if(this._onEnable !== null)
            {
                this._onEnable.dispatch();
            }
        }
    }
};

/**
 * Parse the scene configuration part related to sounds.
 * @method  FORGE.SoundManager#_parseSceneConfig
 * @private
 * @param  {AudioConfig} config - The scene configuration part related to sounds.
 */
FORGE.SoundManager.prototype._parseSceneConfig = function(config)
{
    var extendedConfig = /** @type {AudioConfig} */ FORGE.Utils.extendMultipleObjects(this._config, config);
    this._applyConfig(extendedConfig);

    //Is the sound manager enabled?
    if(this._enabled === false)
    {
        if(this._onDisable !== null)
        {
            this._onDisable.dispatch();
        }
    }
    else
    {
        if(this._onEnable !== null)
        {
            this._onEnable.dispatch();
        }
    }
};

/**
 * Set values from configuration file.
 * @method  FORGE.SoundManager#_applyConfig
 * @param {?AudioConfig} config - The config file.
 * @private
 */
FORGE.SoundManager.prototype._applyConfig = function(config)
{
    if(config !== null)
    {
        this._enabled = typeof config.enabled !== "undefined" ? Boolean(config.enabled) : true;
        this._maxVolume = (typeof config.volume !== "undefined" && typeof config.volume.max === "number") ? FORGE.Math.clamp(config.volume.max, 0, 1) : 1;

        if(this._volumeChanged === false)
        {
            this._defaultVolume = (typeof config.volume !== "undefined" && typeof config.volume.default === "number") ? FORGE.Math.clamp(config.volume.default, 0, this._maxVolume) : 1;
        }
        else
        {
            this._defaultVolume = FORGE.Math.clamp(this._volume, 0, this._maxVolume);
        }
    }
};

/**
 * Add a sound config to the manager.
 * @method FORGE.SoundManager#addConfig
 * @param {AudioConfig} config - The config you want to add.
 */
FORGE.SoundManager.prototype.addConfig = function(config)
{
    this._parseConfig(config);

    this._initSounds();
};

/**
 * Parse a playlist config object.
 * @method FORGE.SoundManager#_parseConfig
 * @private
 * @param {AudioConfig} config - The config you want to parse.
 */
FORGE.SoundManager.prototype._parseConfig = function(config)
{
    this._config = config;

    this._applyConfig(config);
};

/**
 * Initialize the sounds manager.
 * @method FORGE.PlaylistManager#_initSounds
 * @private
 */
FORGE.SoundManager.prototype._initSounds = function()
{
    if(typeof this._defaultVolume === "number" && this._volumeChanged === false)
    {
        this._volume = FORGE.Math.clamp(this._defaultVolume, 0, 1);
    }

    this._updateVolume();
};

/**
 * Update method called by the viewer main loop.
 * @method FORGE.SoundManager#update
 */
FORGE.SoundManager.prototype.update = function ()
{
    for (var i = 0, ii = this._sounds.length; i < ii; i++)
    {
        this._sounds[i].update();
    }

    // update listener position
    this._setContextListenerOrientation();
};

/**
 * Add a {@link FORGE.Sound} into the _sounds Array.
 * @method FORGE.SoundManager#add
 * @param {FORGE.Sound} sound - The {@link FORGE.Sound} to add.
 */
FORGE.SoundManager.prototype.add = function (sound)
{
    var index = this._indexOfSound(sound);

    if(index === -1)
    {
        this._sounds.push(sound);
    }
};

/**
 * Remove a {@link FORGE.Sound} into the _sounds Array.
 * @method FORGE.SoundManager#remove
 * @param {FORGE.Sound} sound - The {@link FORGE.Sound} to remove.
 */
FORGE.SoundManager.prototype.remove = function (sound)
{
    var index = this._indexOfSound(sound);

    if(index > -1)
    {
        this._sounds.splice(index, 1);
    }
};

/**
 * Internal method to find a {@link FORGE.Sound} index in the _sounds Array.
 * @method FORGE.SoundManager#_indexOfSound
 * @private
 * @param {FORGE.Sound} sound - The {@link FORGE.Sound} itself.
 * @return {number} Returns the index of the searched {@link FORGE.Sound} if found, -1 if not.
 *
 * @todo Either the {@link FORGE.Sound} itself or its index or its uid. (FORGE.Sound|Number|String)
 */
FORGE.SoundManager.prototype._indexOfSound = function (sound)
{
    if(this._sounds === null)
    {
        return -1;
    }

    var _sound;

    for (var i = 0, ii = this._sounds.length; i < ii; i++)
    {
        _sound = this._sounds[i];

        if(_sound === sound)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Suspend audio context if no sound are playing.
 * @method FORGE.SoundManager#suspend
 */
FORGE.SoundManager.prototype.suspend = function()
{
    if(this._context !== null && typeof this._context.suspend !== "undefined" && this._useWebAudio === true && FORGE.Device.safari === false)
    {
        if(this._contextState === "running")
        {
            var allStopped = true;
            for (var i = 0, ii = this._sounds.length; i < ii; i++)
            {
                if(this._sounds[i].playing === true || this._sounds[i].paused === true)
                {
                    allStopped = false;
                    break;
                }
            }

            if(allStopped === true)
            {
                this._contextState = "suspended";
                this._context.suspend();
            }
        }
    }
};

/**
 * Resume the audio context if at least one sound is playing.
 * @method FORGE.SoundManager#resume
 */
FORGE.SoundManager.prototype.resume = function()
{
    if(this._context !== null && typeof this._context.resume !== "undefined" && this._useWebAudio === true && FORGE.Device.safari === false)
    {
        if(this._contextState === "suspended")
        {
            for (var i = 0, ii = this._sounds.length; i < ii; i++)
            {
                if(this._sounds[i].playing === true || this._sounds[i].paused === true)
                {
                    this._contextState = "running";
                    this._context.resume();
                    break;
                }
            }
        }
    }
};

/**
 * Pause all playing sounds.
 * @method FORGE.SoundManager#pauseAll
 */
FORGE.SoundManager.prototype.pauseAll = function()
{
    for (var i = 0, ii = this._sounds.length; i < ii; i++)
    {
        if (this._sounds[i].playing === true)
        {
            this._sounds[i].pause();
            this._sounds[i].resumed = true;
        }
    }
};

/**
 * Play all sounds that have been paused with the pauseAll method.
 * @method FORGE.SoundManager#resumeAll
 */
FORGE.SoundManager.prototype.resumeAll = function()
{
    for (var i = 0, ii = this._sounds.length; i < ii; i++)
    {
        if (this._sounds[i].resumed === true)
        {
            this._sounds[i].resume();
            this._sounds[i].resumed = false;
        }
    }
};

/**
 * Mute method of the sounds.
 * @method FORGE.SoundManager#mute
 */
FORGE.SoundManager.prototype.mute = function()
{
    if(this._muted === true)
    {
        return;
    }

    this._muted = true;
    this._mutedVolume = this._volume;
    this._volume = 0;

    if (this._useWebAudio === true)
    {
        this._mutedVolume = this._masterGain.gain.value;
    }

    this._updateVolume();

    if(this._onMute !== null)
    {
        this._onMute.dispatch();
    }
};

/**
 * Unmute method of the sounds.
 * @method FORGE.SoundManager#unmute
 */
FORGE.SoundManager.prototype.unmute = function()
{
    if(this._muted === false)
    {
        return;
    }

    this._muted = false;
    this._volume = this._mutedVolume;

    this._updateVolume();

    if(this._onUnmute !== null)
    {
        this._onUnmute.dispatch();
    }
};

/**
 * Update volume method for the sounds.
 * @method FORGE.SoundManager#unmute
 * @private
 */
FORGE.SoundManager.prototype._updateVolume = function()
{
    if (this._useWebAudio === true)
    {
        this._masterGain.gain.value = this._volume;
    }
    else if (this._useAudioTag === true)
    {
        // Loop through the sound cache and change the volume of all html audio tags
        for (var i = 0; i < this._sounds.length; i++)
        {
            this._sounds[i]._sound.data.volume = FORGE.Math.clamp(this._sounds[i]._volume, 0, 1) * this._volume;
        }
    }
    this._volumeChanged = true;

    if(this._onVolumeChange !== null)
    {
        this._onVolumeChange.dispatch();
    }
};

/**
 * Change the sound manager orientation to follow the THREE perspective camera.
 * @method FORGE.SoundManager#_setContextListenerOrientation
 * @private
 */
FORGE.SoundManager.prototype._setContextListenerOrientation = function()
{
    if (this._useWebAudio === true && this._viewer.renderer.camera.main !== null)
    {
        var cameraDirection = new THREE.Vector3();
        var qCamera = this._viewer.renderer.camera.main.quaternion;

        // front vector indicating where the listener is facing to
        cameraDirection.set(0, 0, -1);
        cameraDirection.applyQuaternion(qCamera);
        var camera = cameraDirection.clone();

        // up vector repesenting the direction of the top of the listener head
        cameraDirection.set(0, 1, 0);
        cameraDirection.applyQuaternion(qCamera);
        var cameraUp = cameraDirection;

        // apply orientation values
        this._context.listener.setOrientation(camera.x, camera.y, camera.z, cameraUp.x, cameraUp.y, cameraUp.z);
    }
};

/**
 * Destroy sequence
 * @method FORGE.SoundManager#destroy
 */
FORGE.SoundManager.prototype.destroy = function()
{
    this._viewer.story.onSceneLoadStart.remove(this._sceneLoadStartHandler, this);

    this._viewer = null;
    this._config = null;

    var i = this._sounds.length;
    while(i--)
    {
        this._sounds[i].destroy();
    }

    this._sounds = null;

    this._context = null;
    this._analyser = null;
    this._masterGain = null;

    if(this._onMute !== null)
    {
        this._onMute.destroy();
        this._onMute = null;
    }

    if(this._onUnmute !== null)
    {
        this._onUnmute.destroy();
        this._onUnmute = null;
    }

    if(this._onVolumeChange !== null)
    {
        this._onVolumeChange.destroy();
        this._onVolumeChange = null;
    }

    if(this._onDisable !== null)
    {
        this._onDisable.destroy();
        this._onDisable = null;
    }

    if(this._onEnable !== null)
    {
        this._onEnable.destroy();
        this._onEnable = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};


/**
 * Get the audio context.
 * @name FORGE.SoundManager#context
 * @type {?AudioContext}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "context",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._context;
    }
});

/**
 * Get the analyser.
 * @name FORGE.SoundManager#analyser
 * @type {?AnalyserNode}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "analyser",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._analyser;
    }
});

/**
 * Get the analyser
 * @name  FORGE.SoundManager#inputNode
 * @type {?AudioDestinationNode}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "inputNode",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._analyser;
    }
});

/**
 * Get the masterGain.
 * @name FORGE.SoundManager#masterGain
 * @type {?GainNode}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "masterGain",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._masterGain;
    }
});

/**
 * The WebAudio API tag must be used?
 * @name FORGE.SoundManager#useWebAudio
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "useWebAudio",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._useWebAudio;
    },

    /** @this {FORGE.SoundManager} */
    set: function(value)
    {
        if(typeof value === "boolean")
        {
            this._useWebAudio = value;
            this._useAudioTag = !value;
        }
    }
});

/**
 * The Audio tag must be used?
 * @name FORGE.SoundManager#useAudioTag
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.SoundManager.prototype, "useAudioTag",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._useAudioTag;
    },

    /** @this {FORGE.SoundManager} */
    set: function(value)
    {
        if(typeof value === "boolean")
        {
            this._useAudioTag = value;
            this._useWebAudio = !value;
        }
    }
});

/**
 * Get the enabled state for sounds.
 * @name FORGE.SoundManager#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "enabled", {

    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._enabled;
    }

});

/**
 * Get or set the muted state for sounds.
 * @name FORGE.SoundManager#muted
 * @type {boolean}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "muted", {

    /** @this {FORGE.SoundManager} */
    get: function()
    {
        return this._muted;
    },

    /** @this {FORGE.SoundManager} */
    set: function(value)
    {
        if(typeof value === "boolean")
        {
            if (value === true)
            {
                this.mute();
            }
            else
            {
                this.unmute();
            }
        }
    }
});

/**
 * Get or set the global volume for sounds.
 * @name FORGE.SoundManager#volume
 * @type {number}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "volume", {

    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if (this._useWebAudio === true)
        {
            return this._masterGain.gain.value;
        }
        else
        {
            return this._volume;
        }
    },

    /** @this {FORGE.SoundManager} */
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

        if (this._volume > 0)
        {
            this._muted = false;
        }

        this._updateVolume();
    }
});

/**
 * Get the sounds "onMute" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.SoundManager#onMute
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "onMute",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if(this._onMute === null)
        {
            this._onMute = new FORGE.EventDispatcher(this);
        }

        return this._onMute;
    }
});

/**
 * Get the sounds "onUnmute" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.SoundManager#onUnmute
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "onUnmute",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if(this._onUnmute === null)
        {
            this._onUnmute = new FORGE.EventDispatcher(this);
        }

        return this._onUnmute;
    }
});

/**
 * Get the sounds "onVolumeChange" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.SoundManager#onVolumeChange
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "onVolumeChange",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if(this._onVolumeChange === null)
        {
            this._onVolumeChange = new FORGE.EventDispatcher(this);
        }

        return this._onVolumeChange;
    }
});

/**
 * Get the sounds "onDisable" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.SoundManager#onDisable
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "onDisable",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if(this._onDisable === null)
        {
            this._onDisable = new FORGE.EventDispatcher(this);
        }

        return this._onDisable;
    }
});

/**
 * Get the sounds "onEnable" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.SoundManager#onDisable
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.SoundManager.prototype, "onEnable",
{
    /** @this {FORGE.SoundManager} */
    get: function()
    {
        if(this._onEnable === null)
        {
            this._onEnable = new FORGE.EventDispatcher(this);
        }

        return this._onEnable;
    }
});
