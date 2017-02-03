/**
 * Gaze Cursor base class. Draw a geometry on the camera space for gaze selection.
 *
 * @constructor FORGE.CameraGaze
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.CameraGaze = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.CameraGaze#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The gaze configuration object
     * @name  FORGE.CameraGaze#_config
     * @type {CameraGazeConfig}
     * @private
     */
    this._config = config;

    /**
     * THREE object
     * @name FORGE.CameraGaze#_object
     * @type {THREE.Object3D}
     * @private
     */
    this._object = null;

    /**
     * Flag to know if the gaze cursor is hovering an object
     * @name FORGE.CameraGaze#_hovering
     * @type {boolean}
     * @private
     */
    this._hovering = false;

    /**
     * Timer for delayed click by gaze
     * @name FORGE.CameraGaze#_timer
     * @type {FORGE.Timer}
     * @private
     */
    this._timer = null;

    /**
     * Timer event used by a current countdown forn click by gaze.
     * @name FORGE.CameraGaze#_timerEvent
     * @type {FORGE.TimerEvent}
     * @private
     */
    this._timerEvent = null;

    /**
     * The percentage of progress to have a valid gaze interaction.
     * @name  FORGE.CameraGaze#_progress
     * @type {number}
     * @private
     */
    this._progress = 0;

    FORGE.BaseObject.call(this, "CameraGaze");

    this._boot();
};

FORGE.CameraGaze.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.CameraGaze.prototype.constructor = FORGE.CameraGaze;

/**
 * Boot sequence.
 * @method FORGE.CameraGaze#_boot
 * @private
 */
FORGE.CameraGaze.prototype._boot = function()
{
    this._timer = this._viewer.clock.create(false);

    this._object = new THREE.Object3D();
    this._object.name = "CameraGaze";
    this._object.position.z = -2;

    this._createCursor();
};

/**
 * Create ring geometry.
 * @method FORGE.CameraGaze#_createRingGeometry
 * @param {number=} [innerRadius=0.02] Inner radius of the ring.
 * @param {number=} [outerRadius=0.04] OuterRadius of the ring.
 * @param {number=} [thetaSegments=32] Number of theta segments on the ring.
 * @param {number=} [phiSegments=1] Number of phi segments on the ring.
 * @param {number=} [thetaStart=0] Thetha start.
 * @param {number=} [thetaLength=6.28] Thetha length, default is two PI.
 * @return {THREE.BufferGeometry} The ring geometry.
 * @private
 */
FORGE.CameraGaze.prototype._createRingGeometry = function(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength)
{
    innerRadius = innerRadius || 0.02;
    outerRadius = outerRadius || 0.04;
    thetaSegments = thetaSegments || 32;
    phiSegments = phiSegments || 1;
    thetaStart = thetaStart || 0;
    thetaLength = thetaLength || Math.PI * 2;

    var geometry = new THREE.RingBufferGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength);

    return geometry;
};

/**
 * Create the base cursor based on its configuration
 * @method FORGE.CameraGaze#_createCursor
 * @private
 */
FORGE.CameraGaze.prototype._createCursor = function()
{
    var material = new THREE.MeshBasicMaterial(
    {
        color: this._config.cursor.color,
        opacity: this._config.cursor.opacity,
        transparent: true
    });

    var ring = new THREE.Mesh(this._createRingGeometry(this._config.cursor.innerRadius, this._config.cursor.outerRadius), material);
    ring.name = "cursor";

    this._object.add(ring);
};

/**
 * Update the second ring according to the progress percentage of the timer event.
 * @method FORGE.CameraGaze#_updateProgressRing
 * @param  {number} progress - The progress percentage of the timer.
 * @private
 */
FORGE.CameraGaze.prototype._updateProgressRing = function(progress)
{
    this._progress = progress;

    this._destroyRing("progress");

    this._createProgress();
};

/**
 * Create the progress cursor based on its configuration and the percentage of progress
 * @method FORGE.CameraGaze#_createProgress
 * @private
 */
FORGE.CameraGaze.prototype._createProgress = function()
{
    var material = new THREE.MeshBasicMaterial(
    {
        color: this._config.progress.color,
        opacity: this._config.progress.opacity,
        transparent: true,
        side: THREE.DoubleSide
    });

    var thetaLength = (this._progress / 100) * FORGE.Math.TWOPI;

    var ring = new THREE.Mesh(this._createRingGeometry(this._config.progress.innerRadius, this._config.progress.outerRadius, 32, 1, (Math.PI / 2), thetaLength), material);
    ring.name = "progress";
    ring.rotateY(Math.PI);

    this._object.add(ring);
};

/**
 * Destroy a ring from its name
 * @method FORGE.CameraGaze#_destroyRing
 * @param {string} name - The name of the ring to destroy
 * @private
 */
FORGE.CameraGaze.prototype._destroyRing = function(name)
{
    var ring = null;

    for (var i = 0, ii = this._object.children.length; i < ii; i++)
    {
        if (this._object.children[i].name === name)
        {
            ring = this._object.children[i];
        }
    }

    if (ring !== null)
    {
        this._object.remove(ring);

        ring.geometry.dispose();
        ring.material.dispose();
    }
};

/**
 * Timer complete handler, triggers the click action!
 * @method FORGE.CameraGaze#_timerCompleteHandler
 * @private
 */
FORGE.CameraGaze.prototype._timerCompleteHandler = function()
{
    this.stop();

    this._viewer.renderer.pickingManager.click();
};

/**
 * Loads a configuration for gaze cursors.
 * @method FORGE.CameraGaze#load
 * @param {CameraGazeConfig} config -  The configuration to load.
 */
FORGE.CameraGaze.prototype.load = function(config)
{
    this._config = config;

    this._destroyRing("progress");
    this._destroyRing("cursor");

    this._createCursor();

    if (this._hovering === true && this._progress !== 0)
    {
        this._createProgress();
    }
};

/**
 * Starts the gaze timer, this is called from the raycaster.
 * @method FORGE.CameraGaze#start
 */
FORGE.CameraGaze.prototype.start = function()
{
    this.log("startGazeAnimation");

    this._hovering = true;

    this._updateProgressRing(0);

    if (this._timer !== null)
    {
        var delay = 2000 || this._config.delay;

        this._timer.stop();
        this._timerEvent = this._timer.add( /** @type {number} */ (delay), this._timerCompleteHandler, this);
        this._timer.start();
    }
};

/**
 * Stops the gaze timer, this is called from the raycaster.
 * @method FORGE.CameraGaze#stop
 */
FORGE.CameraGaze.prototype.stop = function()
{
    this.log("stopGazeAnimation");

    this._hovering = false;

    this._timer.stop();
    this._timerEvent = null;

    this._progress = 0;

    var ring = this._object.children[1];

    if (typeof ring !== "undefined" && ring !== null)
    {
        this._object.remove(ring);

        ring.geometry.dispose();
        ring.material.dispose();
    }
};

/**
 * Update loop of the gaze cursor, it updates the graphics according to the progress percentage of the timer.
 * @method FORGE.CameraGaze#update
 */
FORGE.CameraGaze.prototype.update = function()
{
    if (this._hovering === true && this._timerEvent !== null)
    {
        var percent = (this._timerEvent.delay - this._timer.duration) * 100 / this._timerEvent.delay;
        this.log("timer update : " + percent + "%");

        this._updateProgressRing(percent);
    }
};

/**
 * Destroy sequence.
 * @method FORGE.CameraGaze#destroy
 */
FORGE.CameraGaze.prototype.destroy = function()
{
    this.stop();

    if (this._object !== null)
    {
        if (typeof this._object.geometry !== "undefined" && this._object.geometry !== null)
        {
            this._object.geometry.dispose();
        }

        if (typeof this._object.material !== "undefined" && this._object.material !== null)
        {
            this._object.material.dispose();
        }

        this._object = null;
    }

    this._scene = null;
};

/**
 * Visibility flag.
 * @name FORGE.CameraGaze#visible
 * @type {boolean}
 */
Object.defineProperty(FORGE.CameraGaze.prototype, "visible",
{
    /** @this {FORGE.CameraGaze} */
    get: function()
    {
        return this._object.visible;
    },

    /** @this {FORGE.CameraGaze} */
    set: function(value)
    {
        this._object.visible = value;
    }
});

/**
 * 3D object
 * @name FORGE.CameraGaze#object
 * @readonly
 * @type {THREE.Mesh}
 */
Object.defineProperty(FORGE.CameraGaze.prototype, "object",
{
    /** @this {FORGE.CameraGaze} */
    get: function()
    {
        return this._object;
    }
});