/**
 * A FORGE.Sound is an object that manages a sound.
 *
 * @constructor FORGE.Sound
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {string} key - The sound file id reference.
 * @param {string} url - The sound file url.
 * @param {boolean=} ambisonic - Is the sound ambisonic and need binaural rendering?
 * @extends {FORGE.BaseObject}
 *
 * @todo  Ability to force audio type into config
 * @todo  Make a test plugin that creates sound, add sound to the PluginObjectFactory
 * @todo  Loop during x steps (parameter) only if loop is true
 */
FORGE.Sound = function(viewer, key, url, ambisonic)
{
    /**
     * The viewer reference.
     * @name FORGE.Sound#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The sound identifier.
     * @name FORGE.Sound#_key
     * @type {string}
     * @private
     */
    this._key = key;

    /**
     * The sound file url.
     * @name FORGE.Sound#_url
     * @type {string}
     * @private
     */
    this._url = url;

    /**
     * The current volume of the sound.
     * @name FORGE.Sound#_volume
     * @type {number}
     * @private
     */
    this._volume = 1;

    /**
     * The volume level before a mute of the sound.
     * @name FORGE.Sound#_mutedVolume
     * @type {number}
     * @private
     */
    this._mutedVolume = 1;

    /**
     * The muted state of the sound.
     * @name FORGE.Sound#_muted
     * @type {boolean}
     * @private
     */
    this._muted = false;

    /**
     * Is the sound enabled?
     * @name  FORGE.Sound#enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * Is the sound spatialized?
     * @name  FORGE.Sound#_spatialized
     * @type {boolean}
     * @private
     */
    this._spatialized = false;

    /**
     * The duration in seconds of the sound.
     * @name FORGE.Sound#_duration
     * @type {number}
     * @private
     */
    this._duration = 0;

    /**
     * The duration in milliseconds of the sound.
     * @name FORGE.Sound#_durationMS
     * @type {number}
     * @private
     */
    this._durationMS = 0;

    /**
     * The start time in milliseconds of the sound linked to the global clock.
     * @name FORGE.Sound#_startTime
     * @type {number}
     * @private
     */
    this._startTime = 0;

    /**
     * The pause time in milliseconds of the sound linked to the global clock.
     * @name FORGE.Sound#_pauseTime
     * @type {number}
     * @private
     */
    this._pauseTime = 0;

    /**
     * The current time in milliseconds of the sound.<br>
     * The current time value is based on duration minus time on the current clock because the AudioContext currentTime value is global to the audio context.
     * @name FORGE.Sound#_currentTime
     * @type {number}
     * @private
     */
    this._currentTime = 0;

    /**
     * The loop state of the sound.
     * @name FORGE.Sound#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * The playing state of the sound.
     * @name FORGE.Sound#_playing
     * @type {boolean}
     * @private
     */
    this._playing = false;

    /**
     * The number of play of the sound.
     * @name FORGE.Sound#_playCount
     * @type {number}
     * @private
     */
    this._playCount = 0;

    /**
     * The paused state of the sound.
     * @name FORGE.Sound#_paused
     * @type {boolean}
     * @private
     */
    this._paused = false;

    /**
     * The resumed state of the sound.
     * @name FORGE.Sound#_resumed
     * @type {boolean}
     * @private
     */
    this._resumed = false;

    /**
     * The sound file with augmented properties.
     * @property {AudioBuffer} data The sound file data contained into an AudioBuffer.
     * @name FORGE.Sound#_soundFile
     * @type {?FORGE.File}
     * @private
     */
    this._soundFile = null;

    /**
     * The AudioBufferSourceNode instance used to play audio data contained within an AudioBuffer object.
     * @name FORGE.Sound#_sound
     * @type {?AudioBufferSourceNode}
     * @private
     */
    this._sound = null;

    /**
     * The sound file data contained into an AudioBuffer.
     * @name FORGE.Sound#_buffer
     * @type {?AudioBuffer}
     * @private
     */
    this._buffer = null;

    /**
     * The sound file position data contained into a PannerNode.
     * @name FORGE.Sound#_panner
     * @type {?AudioPannerNode}
     * @private
     */
    this._panner = null;

    /**
     * The AudioContext interface.
     * @name FORGE.Sound#_context
     * @type {?AudioContext}
     * @private
     */
    this._context = null;

    /**
     * The AudioDestinationNode representing the final destination of all audio in the context.
     * @name FORGE.Sound#_inputNode
     * @type {?AudioDestinationNode}
     * @private
     */
    this._inputNode = null;

    /**
     * The GainNode which can be used to control the overall volume of the audio graph.
     * @type {?GainNode}
     * @private
     */
    this._gainNode = null;

    /**
     * THREE Vector3 x coordinate.
     * @name  FORGE.Sound#_x
     * @type {number}
     * @private
     */
    this._x = 0;

    /**
     * THREE Vector3 y coordinate.
     * @name  FORGE.Sound#_y
     * @type {number}
     * @private
     */
    this._y = 0;

    /**
     * THREE Vector3 z coordinate.
     * @name  FORGE.Sound#_z
     * @type {number}
     * @private
     */
    this._z = 0;

    /**
     * FOARenderer is a ready-made FOA decoder and binaural renderer.
     * @name  FORGE.Sound#_foaRenderer
     * @type {?FOARenderer}
     * @private
     */
    this._foaRenderer = null;

    /**
     * Is it an ambisonical sound?
     * @name  FORGE.Sound#_ambisonic
     * @type {boolean}
     * @private
     */
    this._ambisonic = ambisonic || false;

    /**
     * Default channel map for ambisonic sound.
     * @name  FORGE.Sound#_defaultChannelMap
     * @type {Array<number>}
     * @private
     */
    this._defaultChannelMap = [0, 1, 2, 3]; //AMBIX
    // this._defaultChannelMap = [0, 3, 1, 2]; //FUMA

    /**
     * To save the pending state to be applied after the sound object will be ready.
     * @name FORGE.Sound#_pendingPlay
     * @type {boolean}
     * @private
     */
    this._pendingPlay = false;

    /**
     * Is this sound object is ready?
     * @name FORGE.Sound#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * This is a reference to decodeComplete function but with a different this bind reference.
     * @name  FORGE.Sound#_decodeCompleteBind
     * @type {?Function}
     * @private
     */
    this._decodeCompleteBind = null;

    /**
     * This is a reference to decodeError function but with a different this bind reference.
     * @name  FORGE.Sound#_decodeErrorBind
     * @type {?Function}
     * @private
     */
    this._decodeErrorBind = null;

    /**
     * Is the sound decoded?
     * @name  FORGE.Sound#_decoded
     * @type {boolean}
     * @private
     */
    this._decoded = false;

    /**
     * On sound decoded event dispatcher.
     * @name FORGE.Sound#_onSoundDecode
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onSoundDecode = null;

    /**
     * On load start event dispatcher.
     * @name FORGE.Sound#_onLoadStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadStart = null;

    /**
     * On loaded data event dispatcher.
     * @name FORGE.Sound#_onLoadedData
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadedData = null;

    /**
     * On can play event dispatcher.
     * @name FORGE.Sound#_onCanPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onCanPlay = null;

    /**
     * On can play through event dispatcher.
     * @name FORGE.Sound#_onCanPlayThrough
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onCanPlayThrough = null;

    /**
     * On sound muted event dispatcher.
     * @name FORGE.Sound#_onMute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMute = null;

    /**
     * On sound unmuted event dispatcher.
     * @name FORGE.Sound#_onUnmute
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onUnmute = null;

    /**
     * On sound volume change event dispatcher.
     * @name FORGE.Sound#_onVolumeChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onVolumeChange = null;

    /**
     * On sound play event dispatcher.
     * @name FORGE.Sound#_onPlay
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPlay = null;

    /**
     * On sound stop event dispatcher.
     * @name FORGE.Sound#_onStop
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    /**
     * On sound pause event dispatcher.
     * @name FORGE.Sound#_onPause
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPause = null;

    /**
     * On sound resume event dispatcher.
     * @name FORGE.Sound#_onResume
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onResume = null;

    /**
     * On sound decoded event dispatcher.
     * @name FORGE.Sound#_onEnded
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnded = null;

    FORGE.BaseObject.call(this, "Sound");

    this._boot();
};

FORGE.Sound.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Sound.prototype.constructor = FORGE.Sound;

/**
 * Boot sequence.
 * @method FORGE.Sound#_boot
 * @private
 * @suppress {deprecated}
 */
FORGE.Sound.prototype._boot = function()
{
    if (this._ambisonic === true && this._isAmbisonic() === false)
    {
        this.log("FORGE.Sound: can't manage ambisonic sound without Google Chrome Omnitone library and WebAudio API.");
        this._ambisonic = false;
    }

    //register the uid
    this._uid = this._key;
    this._register();

    if (this._viewer.audio.useWebAudio === true)
    {
        this._context = this._viewer.audio.context;

        this._inputNode = this._viewer.audio.inputNode;

        if (typeof this._context.createGain === "undefined")
        {
            this._gainNode = this._context.createGainNode();
        }
        else
        {
            this._gainNode = this._context.createGain();
        }

        this._gainNode.gain.value = this._volume * this._viewer.audio.volume;
        this._gainNode.connect(this._inputNode);
    }

    var loaded = false;
    if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
    {
        if (this._viewer.cache.has(FORGE.Cache.types.SOUND, this._key) === true)
        {
            // wait long enough so that a frame has passed (here at 24fps)
            window.setTimeout(this._loadComplete.bind(this, this._viewer.cache.get(FORGE.Cache.types.SOUND, this._key)), 40);
            loaded = true;
        }

        //Listen to the main volume change to adapt the sound volume accordingly.
        this._viewer.audio.onVolumeChange.add(this._mainVolumeChangeHandler, this);
    }

    this._viewer.audio.onDisable.add(this._disableSoundHandler, this);

    if (this._url !== "")
    {
        if (loaded === false)
        {
            this._viewer.load.sound(this._key, this._url, this._loadComplete, this, this._isAmbisonic());
        }

        if (this._onLoadStart !== null)
        {
            this._onLoadStart.dispatch();
        }
    }

    this._viewer.audio.add(this);
};

/**
 * Event handler for load complete event, it launch the decoding of the sound file.
 * @method FORGE.Sound#_loadComplete
 * @private
 * @param {FORGE.File} file - The sound file.
 */
FORGE.Sound.prototype._loadComplete = function(file)
{
    // In some case, the sound is destroyed before the loading
    if(this._alive === false)
    {
        return;
    }

    if (this._isAmbisonic() === true)
    {
        file.data = file.data.cloneNode(true);
    }

    this._soundFile = file;

    this._ready = true;

    // loaded events
    if (this._onLoadedData !== null)
    {
        this._onLoadedData.dispatch();
    }

    if (this._viewer.audio.useWebAudio === true)
    {
        this._decode(this._soundFile);
    }
    else
    {
        this._dispatchDecodedEvents();

        this._decodeComplete(null);
    }
};

/**
 * Decoding of the sound file.
 * @method FORGE.Sound#_decode
 * @private
 * @param {Object} file - The sound file
 */
FORGE.Sound.prototype._decode = function(file)
{
    if (file)
    {
        if (this._decoded === false)
        {
            this._decodeCompleteBind = this._decodeComplete.bind(this);
            this._decodeErrorBind = this._decodeError.bind(this);

            if (this._isAmbisonic() === true)
            {
                // Source
                this._soundElementSource = this._context.createMediaElementSource(file.data);

                // FOA decoder and binaural renderer
                this._foaRenderer = Omnitone.createFOARenderer(this._context,
                {
                    channelMap: this._defaultChannelMap
                });

                // Initialize the decoder
                this._foaRenderer.initialize().then(this._decodeCompleteBind, this._decodeErrorBind);
            }
            else
            {
                this._context.decodeAudioData(file.data, this._decodeCompleteBind, this._decodeErrorBind);
            }
        }
    }
};

/**
 * Event handler for decode error event, it stores decoding data into the sound file object.
 * @method FORGE.Sound#_decodeError
 * @private
 */
FORGE.Sound.prototype._decodeError = function()
{
    if (this._soundFile !== null)
    {
        this._soundFile.data = null;
        this._decoded = false;
    }
};

/**
 * Dispatcher for decoded events.
 * @method  FORGE.Sound#_dispatchDecodedEvents
 * @private
 */
FORGE.Sound.prototype._dispatchDecodedEvents = function()
{
    if (this._onSoundDecode !== null)
    {
        this._onSoundDecode.dispatch();
    }

    if (this._onCanPlay !== null)
    {
        this._onCanPlay.dispatch();
    }

    if (this._onCanPlayThrough !== null)
    {
        this._onCanPlayThrough.dispatch();
    }
};

/**
 * Event handler for decode complete event, it stores decoding data into the sound file object.
 * @method FORGE.Sound#_decodeComplete
 * @private
 */
FORGE.Sound.prototype._decodeComplete = function(buffer)
{
    if (this._soundFile === null)
    {
        this.log("FORGE.Sound._decodeComplete error, sound file is null");
        return;
    }

    if (buffer)
    {
        this._soundFile.data = buffer;
    }

    if (this._foaRenderer)
    {
        this._soundElementSource.connect(this._foaRenderer.input);
        this._foaRenderer.output.connect(this._context.destination);
    }

    this._decoded = true;

    this._dispatchDecodedEvents();

    if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
    {
        this._sound = this._viewer.cache.get(FORGE.Cache.types.SOUND, this._key);

        this._updateVolume();

        this._duration = 0;
        if (this._sound.data.duration)
        {
            this._duration = this._sound.data.duration;
            this._durationMS = Math.ceil(this._duration * 1000);
        }
    }

    if (this._pendingPlay === true)
    {
        this.play(this._currentTime, this._loop, true);
    }
};

/**
 * Handles the main volume change, update the volume factor to the sound volume.
 * @method FORGE.Sound#_mainVolumeChangeHandler
 * @private
 */
FORGE.Sound.prototype._mainVolumeChangeHandler = function()
{
    this._updateVolume();
};

/**
 * Apply the main volume factor to the sound volume.
 * @method FORGE.Sound#_updateVolume
 * @private
 */
FORGE.Sound.prototype._updateVolume = function()
{
    if (this._sound !== null && (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true))
    {
        this._sound.data.volume = FORGE.Math.clamp(this._volume, 0, 1) * this._viewer.audio.volume;
    }
};

/**
 * Disable the sound.
 * @method FORGE.Sound#_disableSoundHandler
 * @private
 */
FORGE.Sound.prototype._disableSoundHandler = function()
{
    if (this._playing === true)
    {
        this.pause();
    }
    else if (this.paused === false)
    {
        this.stop();
    }
};

/**
 * Reset of the sound values.
 * @method FORGE.Sound#_reset
 * @private
 */
FORGE.Sound.prototype._reset = function()
{
    this._currentTime = 0;
    this._pendingPlay = false;
    this._playing = false;
    this._paused = false;
};

/**
 * Setup for sound panner.
 * @method FORGE.Sound#_setupPanner
 * @private
 */
FORGE.Sound.prototype._setupPanner = function()
{
    this._panner = this._context.createPanner();
    this._panner.panningModel = "HRTF";
    this._panner.distanceModel = "inverse";
    this._panner.refDistance = 1;
    this._panner.maxDistance = 10000;
    this._panner.rolloffFactor = 1;
    this._panner.coneInnerAngle = 360;
    this._panner.coneOuterAngle = 0;
    this._panner.coneOuterGain = 0;
    // look to listener position (x, y, z)
    this._panner.setOrientation(0, 0, 0);
    // init the 3D position of the panner (x, y, z)
    this._panner.setPosition(0, 0, 0);
};

/**
 * Apply sound panner orientation.
 * @method  FORGE.Sound#_applyPanner
 * @param {boolean=} connect - Panner must be connected to sound and gainNode?
 * @private
 */
FORGE.Sound.prototype._applyPanner = function(connect)
{
    if (this._panner === null)
    {
        this._setupPanner();
    }

    this._panner.setPosition(this._x, this._y, this._z);

    if (connect === true)
    {
        this._sound.connect(this._panner);
        // Connect the "panner" object to the "destination" object.
        this._panner.connect(this._gainNode);
    }
};

/**
 * Does the audio sound must be considered as ambisonic?
 * @method FORGE.Sound#_isAmbisonic
 * @return {boolean} Is ambisonic?
 * @private
 */
FORGE.Sound.prototype._isAmbisonic = function()
{
    return (this._ambisonic === true && this._viewer.audio.useWebAudio === true && typeof Omnitone !== "undefined");
};

/**
 * Update method called by the viewer main loop.
 * @method FORGE.Sound#update
 */
FORGE.Sound.prototype.update = function()
{
    if (this._playing === true && this._paused === false)
    {
        var time = this._viewer.clock.time - this._startTime;
        if (time >= this._durationMS)
        {
            this._currentTime = this._durationMS;

            if (this._viewer.audio.useWebAudio === true || this._viewer.audio.useAudioTag === true)
            {
                this.stop(true);

                if (this._onEnded !== null)
                {
                    this._onEnded.dispatch();
                }

                if (this._loop === true)
                {
                    this._currentTime = 0;
                    this.resume();
                }
            }
        }
        else
        {
            //also for this case when using streaming for data or bad headers : this._duration === Infinity
            this._currentTime = time;
        }
    }

    if (this._foaRenderer !== null && this._playing === true)
    {
        // Rotate the binaural renderer based on a Three.js camera object.
        var m4 = this._viewer.renderer.camera.modelViewInverse;
        this._foaRenderer.setRotationMatrixFromCamera(m4);
    }
};

/**
 * Play method of the sound.
 * @method FORGE.Sound#play
 * @param {number=} position - The start position to play the sound in milliseconds.
 * @param {?boolean=} loop - The loop state of the sound.
 * @param {?boolean=} forceRestart - If the sound is already playing you can set forceRestart to restart it from the beginning.
 * @suppress {deprecated}
 */
FORGE.Sound.prototype.play = function(position, loop, forceRestart)
{
    if (this._viewer.audio.enabled === false || this._enabled === false)
    {
        this._playing = false;
        this._paused = false;
        return;
    }

    this._loop = loop || this._loop;

    if (this._playing === true)
    {
        if (forceRestart === true)
        {
            this.stop();
        }
        else
        {
            return;
        }
    }

    if (this._ready === false)
    {
        this._pendingPlay = true;
        return;
    }

    if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
    {
        //  Does the sound need decoding?
        if (this._decoded === true)
        {
            //  Do we need to do this every time we play? How about just if the buffer is empty?
            if (this._buffer === null)
            {
                this._buffer = this._soundFile.data;
            }

            this._sound = this._context.createBufferSource();
            this._sound.buffer = this._buffer;

            if (this._spatialized === true)
            {
                this._applyPanner(true);
            }
            else
            {
                this._sound.connect(this._gainNode);
            }

            this._duration = this._sound.buffer.duration;
            this._durationMS = Math.ceil(this._duration * 1000);

            if (!isNaN(position) && position < this._durationMS)
            {
                this._startTime = this._viewer.clock.time - position;
            }
            else
            {
                position = 0;
                this._startTime = this._viewer.clock.time;
            }

            var time = FORGE.Math.round10(position / 1000);
            //  Useful to cache this somewhere perhaps?
            if (typeof this._sound.start === "undefined")
            {
                this._sound.noteGrainOn(0, time % this._duration, this._duration);
            }
            else
            {
                // Start playback, but make sure we stay in bound of the buffer.
                this._sound.start(0, time % this._duration, this._duration);
            }

            this._playing = true;
            this._currentTime = /** @type {number} */ (position);
            this._playCount++;

            if (this._onPlay !== null)
            {
                this._onPlay.dispatch();
            }
        }
        else
        {
            this.log("Sound is not decoded yet");
            this._pendingPlay = true;
            return;
        }
    }
    else if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
    {
        if (this._duration === 0)
        {
            this._duration = this._sound.data.duration;
            this._durationMS = Math.ceil(this._duration * 1000);
        }
        else if (this._duration === Infinity)
        {
            this._sound.data.loop = true;
        }

        if (!isNaN(position) && this._durationMS !== 0 && position < this._durationMS)
        {
            this._sound.data.currentTime = FORGE.Math.round10(position / 1000);
            this._startTime = this._viewer.clock.time - position;
        }
        else
        {
            position = 0;
            this._sound.data.currentTime = position;
            this._startTime = this._viewer.clock.time;
        }

        this._sound.data.play();

        this._playing = true;
        this._currentTime = /** @type {number} */ (position);
        this._playCount++;

        if (this._onPlay !== null)
        {
            this._onPlay.dispatch();
        }
    }

    this._viewer.audio.resume();
};

/**
 * Stop method of the sound.
 * @method FORGE.Sound#stop
 * @param  {boolean=} internal - Internal use: true prevents event firing.
 */
FORGE.Sound.prototype.stop = function(internal)
{
    if (this._sound !== null)
    {
        this._stop(true);

        this._pauseTime = this._viewer.clock.time;
        this._startTime = this._viewer.clock.time;
        this._pendingPlay = false;
        this._playing = false;
        this._paused = false;

        if (this._onStop !== null && internal === true)
        {
            this._onStop.dispatch();
        }

        this._viewer.audio.suspend();
    }
    else if (this._ready === false || this._decoded !== true)
    {
        this._reset();
    }
};

/**
 * Stop actions to apply to the sound.
 * @method FORGE.Sound#_stop
 * @private
 * @param {boolean} resetCurrentTime - To force a reset of the current time
 * @suppress {deprecated}
 */
FORGE.Sound.prototype._stop = function(resetCurrentTime)
{
    if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
    {
        if (typeof this._sound.stop === "undefined")
        {
            this._sound.noteOff(0);
        }
        else
        {
            try
            {
                this._sound.stop(0);
            }
            catch (e)
            {

            }
        }

        // Clean up the buffer source
        this._sound.disconnect(0);

        if (resetCurrentTime === true)
        {
            this._currentTime = 0;
        }
    }
    else if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
    {
        this._sound.data.pause();
        if (resetCurrentTime === true)
        {
            this._currentTime = 0;
            this._sound.data.currentTime = 0;
        }
    }
};

/**
 * Pause method of the sound.
 * @method FORGE.Sound#pause
 */
FORGE.Sound.prototype.pause = function()
{
    if (this._playing === true && this._sound !== null)
    {
        this._stop(false);

        this._paused = true;
        this._pauseTime = this._viewer.clock.time;
        this._pendingPlay = false;
        this._playing = false;

        if (this._onPause !== null)
        {
            this._onPause.dispatch();
        }

        this._viewer.audio.suspend();
    }
    else if (this._ready === false || this._decoded !== true)
    {
        this._reset();
    }
};

/**
 * Resume method of the sound.
 * @method FORGE.Sound#resume
 * @suppress {deprecated}
 */
FORGE.Sound.prototype.resume = function()
{
    if (this._viewer.audio.enabled === false || this._enabled === false)
    {
        return;
    }

    if (this._paused === true || this._playing === false || this._resumed === true)
    {
        if (this._sound === null)
        {
            this.play(this._currentTime, this._loop, true);
            return;
        }
        else
        {
            this._startTime = this._viewer.clock.time - (this._pauseTime - this._startTime);
            this._currentTime = this._viewer.clock.time - this._startTime; //force current time update
            var time = FORGE.Math.round10(this._currentTime / 1000);

            if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
            {
                this._sound = this._context.createBufferSource();
                this._sound.buffer = this._buffer;

                if (this._spatialized === true)
                {
                    this._applyPanner(true);
                }
                else
                {
                    this._sound.connect(this._gainNode);
                }

                var duration = Math.ceil((this._durationMS - this._currentTime) / 1000);

                if (typeof this._sound.start === "undefined")
                {
                    this._sound.noteGrainOn(0, time % this._duration, duration);
                }
                else
                {
                    this._sound.start(0, time % this._duration, duration);
                }
            }
            else if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
            {
                this._sound.data.currentTime = time;
                this._sound.data.play();
            }
        }

        this._playing = true;
        this._paused = false;

        if (this._onResume !== null)
        {
            this._onResume.dispatch();
        }

        this._viewer.audio.resume();
    }
    else if (this._ready === false || this._decoded === false)
    {
        this._reset();
        this._pendingPlay = true;
    }
};

/**
 * Mute method of the sound.
 * @method FORGE.Sound#mute
 */
FORGE.Sound.prototype.mute = function()
{
    if (this._muted === true || this._viewer.audio.enabled === false || this._enabled === false)
    {
        return;
    }

    this._muted = true;
    this._mutedVolume = this._volume;
    this._volume = 0;

    if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
    {
        this._gainNode.gain.value = this._volume;
    }
    else if ((this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true) && this._sound !== null)
    {
        this._sound.data.volume = this._volume;
    }

    if (this._onMute !== null)
    {
        this._onMute.dispatch();
    }
};

/**
 * Unmute method of the sound.
 * @method FORGE.Sound#unmute
 */
FORGE.Sound.prototype.unmute = function()
{
    if (this._muted === false || this._viewer.audio.enabled === false || this._enabled === false)
    {
        return;
    }

    this._muted = false;
    this._volume = this._mutedVolume;

    if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
    {
        this._gainNode.gain.value = this._mutedVolume;
    }
    else if ((this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true) && this._sound !== null)
    {
        this._sound.data.volume = this._mutedVolume;
    }

    if (this._onUnmute !== null)
    {
        this._onUnmute.dispatch();
    }
};

/**
 * Augmented destroy method.
 * @method FORGE.Sound#destroy
 */
FORGE.Sound.prototype.destroy = function()
{
    this.stop();

    if (this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true)
    {
        this._viewer.audio.onVolumeChange.remove(this._mainVolumeChangeHandler, this);
    }

    this._viewer.audio.onDisable.remove(this._disableSoundHandler, this);

    this._viewer.audio.remove(this);

    this._viewer = null;

    this._soundFile = null;
    this._sound = null;
    this._buffer = null;
    this._context = null;
    this._inputNode = null;
    this._gainNode = null;
    this._panner = null;

    this._decodeCompleteBind = null;
    this._decodeErrorBind = null;

    if (this._onSoundDecode !== null)
    {
        this._onSoundDecode.destroy();
        this._onSoundDecode = null;
    }

    if (this._onLoadStart !== null)
    {
        this._onLoadStart.destroy();
        this._onLoadStart = null;
    }

    if (this._onLoadedData !== null)
    {
        this._onLoadedData.destroy();
        this._onLoadedData = null;
    }

    if (this._onCanPlay !== null)
    {
        this._onCanPlay.destroy();
        this._onCanPlay = null;
    }

    if (this._onCanPlayThrough !== null)
    {
        this._onCanPlayThrough.destroy();
        this._onCanPlayThrough = null;
    }

    if (this._onMute !== null)
    {
        this._onMute.destroy();
        this._onMute = null;
    }

    if (this._onUnmute !== null)
    {
        this._onUnmute.destroy();
        this._onUnmute = null;
    }

    if (this._onVolumeChange !== null)
    {
        this._onVolumeChange.destroy();
        this._onVolumeChange = null;
    }

    if (this._onPlay !== null)
    {
        this._onPlay.destroy();
        this._onPlay = null;
    }

    if (this._onStop !== null)
    {
        this._onStop.destroy();
        this._onStop = null;
    }

    if (this._onPause !== null)
    {
        this._onPause.destroy();
        this._onPause = null;
    }

    if (this._onResume !== null)
    {
        this._onResume.destroy();
        this._onResume = null;
    }

    if (this._onEnded !== null)
    {
        this._onEnded.destroy();
        this._onEnded = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the sound enabled status.
 * @name FORGE.Sound#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "enabled",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "boolean")
        {
            this._enabled = value;

            if (this._enabled === false && (this._playing === true || this._paused === true))
            {
                this.stop();
            }
        }
    }
});


/**
 * Get or set the current time in milliseconds of the sound.
 * @name FORGE.Sound#currentTime
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "currentTime",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._currentTime;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value !== "number")
        {
            return;
        }

        this.pause();
        this._currentTime = value;
        if (this._playing === true)
        {
            this.resume();
        }
    }
});

/**
 * Get or set the spatialized state of the sound.
 * @name FORGE.Sound#spatialized
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "spatialized",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._spatialized;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "boolean")
        {
            this._spatialized = value;
        }
    }
});

/**
 * Get the ambisonic state of the sound.
 * @name FORGE.Sound#ambisonic
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "ambisonic",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._ambisonic;
    }
});

/**
 * Get the duration in seconds of the sound.
 * @name FORGE.Sound#duration
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "duration",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._duration;
    }
});

/**
 * Get or set the muted state of the sound.
 * @name FORGE.Sound#muted
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "muted",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return (this._muted || this._viewer.audio.mute);
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "boolean")
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
 * Get or set the volume of the sound.
 * @name FORGE.Sound#volume
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "volume",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._volume;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value !== "number" || isNaN(value) === true)
        {
            return;
        }

        value = FORGE.Math.clamp(value, 0, 1);

        if (value === this._volume || this._viewer.audio.enabled === false || this._enabled === false)
        {
            return;
        }

        this._volume = value;

        if (this._volume > 0)
        {
            this._muted = false;
        }

        if (this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false)
        {
            this._gainNode.gain.value = value;
        }
        else
        {
            this._updateVolume();
        }

        if (this._onVolumeChange !== null)
        {
            this._onVolumeChange.dispatch();
        }
    }
});

/**
 * Get the decoded status of the sound.
 * @name FORGE.Sound#decoded
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "decoded",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._soundFile === null)
        {
            return false;
        }

        return this._decoded;
    }
});

/**
 * Get the number of play of the sound.
 * @name FORGE.Sound#playCount
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "playCount",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._playCount;
    }
});

/**
 * Get the playing status of the sound.
 * @name FORGE.Sound#playing
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "playing",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._playing;
    }
});

/**
 * Get the ready status of the sound.
 * @name FORGE.Sound#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "ready",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get the paused status of the sound.
 * @name FORGE.Sound#paused
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "paused",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._paused;
    }
});

/**
 * Get/Set the resumed status of the sound.
 * @name FORGE.Sound#resumed
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "resumed",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._resumed;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "boolean")
        {
            this._resumed = value;
        }
    }
});

/**
 * Get and set the loop status of the sound.
 * @name FORGE.Sound#loop
 * @type {boolean}
 */
Object.defineProperty(FORGE.Sound.prototype, "loop",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._loop;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "boolean")
        {
            this._loop = value;

            if ((this._viewer.audio.useAudioTag === true || this._isAmbisonic() === true) && this._sound !== null && this._duration === Infinity)
            {
                this._sound.data.loop = this._loop;
            }
        }
    }
});

/**
 * Get and set the x axis position of the sound.
 * @name FORGE.Sound#x
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "x",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._x;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._x = value;

            if ((this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false) && this._sound !== null && this._panner !== null && this._spatialized === true)
            {
                this._applyPanner();
            }
        }
    }
});

/**
 * Get and set the y axis position of the sound.
 * @name FORGE.Sound#y
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "y",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._y;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._y = value;

            if ((this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false) && this._sound !== null && this._panner !== null && this._spatialized === true)
            {
                this._applyPanner();
            }
        }
    }
});

/**
 * Get and set the z axis position of the sound.
 * @name FORGE.Sound#z
 * @type {number}
 */
Object.defineProperty(FORGE.Sound.prototype, "z",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        return this._y;
    },

    /** @this {FORGE.Sound} */
    set: function(value)
    {
        if (typeof value === "number")
        {
            this._z = value;

            if ((this._viewer.audio.useWebAudio === true && this._isAmbisonic() === false) && this._sound !== null && this._panner !== null && this._spatialized === true)
            {
                this._applyPanner();
            }
        }
    }
});

/**
 * Get the sound "onSoundDecode" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onSoundDecode
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onSoundDecode",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onSoundDecode === null)
        {
            this._onSoundDecode = new FORGE.EventDispatcher(this);
        }

        return this._onSoundDecode;
    }
});

/**
 * Get the sound "onLoadStart" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onLoadStart
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onLoadStart",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onLoadStart === null)
        {
            this._onLoadStart = new FORGE.EventDispatcher(this);
        }

        return this._onLoadStart;
    }
});

/**
 * Get the sound "onLoadedData" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onLoadedData
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onLoadedData",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onLoadedData === null)
        {
            this._onLoadedData = new FORGE.EventDispatcher(this);
        }

        return this._onLoadedData;
    }
});

/**
 * Get the sound "onCanPlay" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onCanPlay
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onCanPlay",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onCanPlay === null)
        {
            this._onCanPlay = new FORGE.EventDispatcher(this);
        }

        return this._onCanPlay;
    }
});

/**
 * Get the sound "onCanPlayThrough" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onCanPlayThrough
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onCanPlayThrough",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onCanPlayThrough === null)
        {
            this._onCanPlayThrough = new FORGE.EventDispatcher(this);
        }

        return this._onCanPlayThrough;
    }
});

/**
 * Get the sound "onMute" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onMute
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onMute",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onMute === null)
        {
            this._onMute = new FORGE.EventDispatcher(this);
        }

        return this._onMute;
    }
});

/**
 * Get the sound "onUnmute" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onUnmute
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onUnmute",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onUnmute === null)
        {
            this._onUnmute = new FORGE.EventDispatcher(this);
        }

        return this._onUnmute;
    }
});

/**
 * Get the sound "onVolumeChange" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onVolumeChange
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onVolumeChange",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onVolumeChange === null)
        {
            this._onVolumeChange = new FORGE.EventDispatcher(this);
        }

        return this._onVolumeChange;
    }
});

/**
 * Get the sound "onPlay" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onPlay
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onPlay",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onPlay === null)
        {
            this._onPlay = new FORGE.EventDispatcher(this);
        }

        return this._onPlay;
    }
});

/**
 * Get the sound "onStop" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onStop
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onStop",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});

/**
 * Get the sound "onPause" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onPause
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onPause",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onPause === null)
        {
            this._onPause = new FORGE.EventDispatcher(this);
        }

        return this._onPause;
    }
});

/**
 * Get the sound "onResume" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onResume
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onResume",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onResume === null)
        {
            this._onResume = new FORGE.EventDispatcher(this);
        }

        return this._onResume;
    }
});

/**
 * Get the sound "onEnded" event {@link FORGE.EventDispatcher}.
 * The {@link FORGE.EventDispatcher} is created only if you ask for it.
 * @name FORGE.Sound#onEnded
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Sound.prototype, "onEnded",
{
    /** @this {FORGE.Sound} */
    get: function()
    {
        if (this._onEnded === null)
        {
            this._onEnded = new FORGE.EventDispatcher(this);
        }

        return this._onEnded;
    }
});
