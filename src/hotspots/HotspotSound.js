/**
 * Hotspot sound handles the parse of the sound config and the loading of the needed sound ressource.
 * It also ajusts the volume of the sound depending of your camera position.
 *
 * @constructor FORGE.HotspotSound
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotSound = function(viewer)
{
    /**
     * Viewer reference.
     * @name  FORGE.HotspotSound#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The onReady event dispatcher.
     * @name  FORGE.HotspotSound#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * World position
     * @name FORGE.HotspotSound#_positionWorld
     * @type {THREE.Vector3}
     * @private
     */
    this._positionWorld = null;

    /**
     * The FORGE.Sound object
     * @name FORGE.HotspotSound#_sound
     * @type {FORGE.Sound}
     * @private
     */
    this._sound = null;

    /**
     * The minimum volume when you are out of range
     * @name FORGE.HotspotSound#_volumeMin
     * @type {number}
     * @private
     */
    this._volumeMin = 0;

    /**
     * The maximum volume when you are in the center of the range
     * @name FORGE.HotspotSound#_volumeMax
     * @type {number}
     * @private
     */
    this._volumeMax = 1;

    /**
     * Is sound looped?
     * @name FORGE.HotspotSound#_loop
     * @type {boolean}
     * @private
     */
    this._loop = false;

    /**
     * Start time for the sound.
     * @name  FORGE.HotspotSound#_startTime
     * @type {number}
     * @private
     */
    this._startTime = 0;

    /**
     * Is sound auto started?
     * @name  FORGE.HotspotSound#_autoPlay
     * @type {boolean}
     * @private
     */
    this._autoPlay = false;

    /**
     * The theta/phi position of the sound.
     * @name  FORGE.HotspotSound#_position
     * @type {?HotspotTransformPosition}
     * @private
     *
     * @todo Use the HotspotTransformPosition object of the HotspotTransform class?
     */
    this._position = { x: 0, y: 0, z: 200 };

    /**
     * The range in degrees where sound can be played from it's position.
     * @name  FORGE.HotspotSound#_range
     * @type {number}
     * @default
     * @private
     */
    this._range = 360;

    FORGE.BaseObject.call(this, "HotspotSound");
};

FORGE.HotspotSound.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotSound.prototype.constructor = FORGE.HotspotSound;

/**
 * Parse the configuration object.
 * @method FORGE.HotspotSound#_parseConfig
 * @param {SoundConfig} configSound - The configuration object of the sound.
 * @param {HotspotTransformConfig} configTransform - The transform configuration object.
 * @private
 */
FORGE.HotspotSound.prototype._parseConfig = function(configSound, configTransform)
{
    if (typeof configSound.source === "undefined" || typeof configSound.source !== "object")
    {
        return;
    }

    // Warning : UID is not registered and applied to the FORGE.Sound for registration
    this._uid = configSound.uid;

    // Is it a source url
    if (typeof configSound.source.url !== "undefined" && typeof configSound.source.url === "string" && configSound.source.url !== "")
    {
        this._url = configSound.source.url;
    }
    // or a source UID?
    else if (typeof configSound.source.target !== "undefined" && FORGE.UID.exists(configSound.source.target) === true)
    {
        //@todo
        var object = FORGE.UID.get(configSound.source.target);
        //this._url = "";
        return;
    }
    else
    {
        return;
    }

    if (typeof configSound.options !== "undefined" && typeof configSound.options === "object")
    {
        if(typeof configSound.options.volume === "number")
        {
            this._volumeMax = configSound.options.volume;
        }
        else if (typeof configSound.options.volume === "object")
        {
            var volume = /** @type {SoundVolumeConfig} */ (configSound.options.volume);
            this._volumeMin = (typeof volume.min === "number") ? FORGE.Math.clamp(volume.min, 0, 1) : 0;
            this._volumeMax = (typeof volume.max === "number") ? FORGE.Math.clamp(volume.max, 0, 1) : 1;
        }

        this._loop = (typeof configSound.options.loop === "boolean") ? configSound.options.loop : false;
        this._startTime = (typeof configSound.options.startTime === "number") ? configSound.options.startTime : 0; //in ms
        this._autoPlay = (typeof configSound.options.autoPlay === "boolean") ? configSound.options.autoPlay : false;
        this._range = (typeof configSound.options.range === "number") ? FORGE.Math.clamp(configSound.options.range, 1, 360) : 360;
    }

    if (typeof configTransform !== "undefined" && typeof configTransform.position !== "undefined")
    {
        this._position.theta = (typeof configTransform.position.theta === "number") ? FORGE.Math.clamp(configTransform.position.theta, -180, 180) : 0;
        this._position.phi = (typeof configTransform.position.phi === "number") ? FORGE.Math.clamp(configTransform.position.phi, -90, 90) : 0;
        //@todo manage radius
    }

    this._setupSound();
};

/**
 * Setup the sound and apply options.
 * @method FORGE.HotspotSound#_setupSound
 * @private
 */
FORGE.HotspotSound.prototype._setupSound = function()
{
    this._sound = new FORGE.Sound(this._viewer, this._uid, this._url || "");
    this._sound.onCanPlayThrough.addOnce(this._onCanPlayThroughHandler, this);

    // spatial sound options
    if(this._isSpatialized() === true)
    {
        // Create world position from inversed theta angle and phi angle
        var sphericalPt = FORGE.Utils.toTHREESpherical(1, FORGE.Math.degToRad(-this._position.theta), FORGE.Math.degToRad(this._position.phi)); //@todo manage radius here
        this._positionWorld = new THREE.Vector3().setFromSpherical(sphericalPt);

        this._sound.spatialized = this._isSpatialized();
        this._sound.x = this._positionWorld.x;
        this._sound.y = this._positionWorld.y;
        this._sound.z = this._positionWorld.z;
    }

    // sound options
    this._sound.volume = this._volumeMax;
    this._sound.loop = this._loop;
    this._sound.startTime = this._startTime;

    if(this._autoPlay === true)
    {
        this._sound.play(this._startTime, this._loop, true);
    }
};

/**
 * Is the sound spatialized?
 * @method  FORGE.HotspotSound#_isSpatialized
 * @return {boolean} Is spatialized?
 * @private
 */
FORGE.HotspotSound.prototype._isSpatialized = function()
{
    return this._range < 360;
};

/**
 * On can play through handler.
 * @method  FORGE.HotspotSound#_onCanPlayThroughHandler
 * @private
 */
FORGE.HotspotSound.prototype._onCanPlayThroughHandler = function()
{
    this.log("Sound load complete");
    this._setupComplete();
};

/**
 * Setup completed handler.
 * @method FORGE.HotspotSound#_setupComplete
 * @private
 */
FORGE.HotspotSound.prototype._setupComplete = function()
{
    if(this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * Set an observer cone for the sound volume.
 * @method FORGE.HotspotSound#_applyRange
 * @private
 *
 * @todo  doesn't work if the camera is reversed on the y axis !
 */
FORGE.HotspotSound.prototype._applyRange = function()
{
    if(this._isSpatialized() === true && typeof this._range === "number")
    {
        var camera = this._viewer.renderer.camera;
        var qCamera = FORGE.Quaternion.fromEuler(FORGE.Math.degToRad(camera.yaw), FORGE.Math.degToRad(camera.pitch), 0);
        var qSound = FORGE.Quaternion.fromEuler(FORGE.Math.degToRad(this._position.theta), FORGE.Math.degToRad(this._position.phi), 0);
        var distance = FORGE.Quaternion.angularDistance(qSound, qCamera);
        var radius = FORGE.Math.degToRad(this._range / 2); //from range to radius in radians

        // reduce the volume or "mute" volume when out of the range
        if (distance < radius)
        {
            var amplitude = this._volumeMax - this._volumeMin;
            this._sound.volume = this._volumeMin + (amplitude * (1 - distance / radius));
        }
        else
        {
            this._sound.volume = this._volumeMin;
        }
    }
};

/**
 * Load a sound configuration
 * @method FORGE.HotspotSound#load
 * @param  {SoundConfig} configSound - The hotspot sound configuration object.
 * @param  {HotspotTransformConfig} configTransform - The hotspot transform configuration object.
 */
FORGE.HotspotSound.prototype.load = function(configSound, configTransform)
{
    this._parseConfig(configSound, configTransform);
};

/**
 * Render sound.
 * @method FORGE.HotspotSound#update
 */
FORGE.HotspotSound.prototype.update = function()
{
    if (this._viewer.audio.enabled === false)
    {
        if(this._sound !== null)
        {
            this._sound.stop();
        }

        return;
    }

    if(this._isSpatialized() === true)
    {
        this._applyRange();
    }
};

/**
 * Destroy routine.
 * @method FORGE.HotspotSound#destroy
 */
FORGE.HotspotSound.prototype.destroy = function()
{
    if (this._sound !== null)
    {
        this._sound.destroy();
        this._sound = null;
    }

    this._positionWorld = null;

    this._position = null;

    if(this._onReady !== null)
    {
        this._onReady.destroy();
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the {@link FORGE.Sound} object.
 * @name FORGE.HotspotSound#sound
 * @readonly
 * @type {FORGE.Sound}
 */
Object.defineProperty(FORGE.HotspotSound.prototype, "sound",
{
    /** @this {FORGE.HotspotSound} */
    get: function()
    {
        return this._sound;
    }
});

/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of this hotspot sound.
 * @name FORGE.HotspotSound#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.HotspotSound.prototype, "onReady",
{
    /** @this {FORGE.HotspotSound} */
    get: function()
    {
        if(this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});
