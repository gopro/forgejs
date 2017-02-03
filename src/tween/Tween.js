/**
 * Utility class to interpolate objects values.
 * @constructor FORGE.Tween
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {Object} object - The object to interpolate its property.
 * @extends {FORGE.BaseObject}
 */
FORGE.Tween = function(viewer, object)
{
    /**
     * The viewer reference.
     * @name FORGE.Tween#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The targeted object.
     * @name FORGE.Tween#_object
     * @type {Object}
     * @private
     */
    this._object = object;

    /**
     * The tween properties.
     * @name FORGE.Tween#_properties
     * @type {Object<string,TweenProperties>}
     * @private
     */
    this._properties = null;

    /**
     * The easing method.
     * @name FORGE.Tween#_easing
     * @type {Function}
     * @private
     */
    this._easing = FORGE.Easing.LINEAR;

    /**
     * The start time.
     * @name FORGE.Tween#_startTime
     * @type {?number}
     * @private
     */
    this._startTime = null;

    /**
     * Is started?
     * @name FORGE.Tween#_started
     * @type {boolean}
     * @private
     */
    this._started = false;

    /**
     * Is stopped?
     * @name FORGE.Tween#_stopped
     * @type {boolean}
     * @private
     */
    this._stopped = false;

    /**
     * Is completed?
     * @name FORGE.Tween#_complete
     * @type {boolean}
     * @private
     */
    this._complete = false;

    /**
     * Tween start event dispatcher.
     * @name  FORGE.Tween#_onStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStart = null;

    /**
     * Tween progress event dispatcher.
     * @name  FORGE.Tween#_onProgress
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onProgress = null;

    /**
     * Tween complete event dispatcher.
     * @name  FORGE.Tween#_onComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onComplete = null;

    /**
     * Tween stop event dispatcher.
     * @name  FORGE.Tween#_onStop
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onStop = null;

    FORGE.BaseObject.call(this, "Tween");
};

FORGE.Tween.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Tween.prototype.constructor = FORGE.Tween;

/**
 * Set the tween properties.
 * @method  FORGE.Tween#to
 * @param  {Array|Object} values - Array of values.
 * @param  {number} duration - Duration of the tween.
 * @param  {Function=} easing - Easing value.
 * @return {FORGE.Tween} Returns the {FORGE.Tween} object.
 */
FORGE.Tween.prototype.to = function(values, duration, easing)
{
    if (this._properties === null)
    {
        this._properties = {};
    }

    for (var p in values)
    {
        this._properties[p] = {
            name: p,
            min: null,
            max: values[p],
            duration: typeof duration === "number" ? duration : 0,
            easing: typeof easing === "function" ? easing : null,
            started: false,
            complete: false,
            startTime: null
        };
    }

    return this;
};

/**
 * Start the tween.
 * @method  FORGE.Tween#start
 * @return {FORGE.Tween} Returns the {FORGE.Tween} object.
 */
FORGE.Tween.prototype.start = function()
{
    this._startTime = Date.now();
    this._started = true;
    this._stopped = false;
    this._complete = false;

    var prop;
    for (var p in this._properties)
    {
        prop = this._properties[p];
        prop.min = this._object[p];
        prop.max = typeof this._properties[p].max === "string" ? prop.min + parseInt(this._properties[p].max, 10) : prop.max;
        prop.started = true;
        prop.startTime = this._startTime;
    }

    if (this._onStart !== null)
    {
        this._onStart.dispatch();
    }

    return this;
};

/**
 * Stop the tween.
 * @method  FORGE.Tween#start
 * @return {FORGE.Tween} Returns the {FORGE.Tween} object.
 */
FORGE.Tween.prototype.stop = function()
{
    this._stopped = true;

    if (this._onStop !== null)
    {
        this._onStop.dispatch();
    }

    return this;
};

/**
 * Update loop.
 * @method  FORGE.Tween#update
 */
FORGE.Tween.prototype.update = function()
{
    if (this._started === false || this._complete === true || this._stopped === true)
    {
        return;
    }

    var prop;
    var notCompleteCount = 0;
    for (var p in this._properties)
    {
        prop = this._properties[p];

        if (prop.complete === false)
        {
            this._updateProperty(prop);
        }

        if (prop.complete === false)
        {
            notCompleteCount++;
        }
    }

    if (this._onProgress !== null)
    {
        this._onProgress.dispatch();
    }

    if (notCompleteCount === 0)
    {
        this._complete = true;

        if (this._onComplete !== null)
        {
            this._onComplete.dispatch();
        }
    }
};

/**
 * Update the tween properties.
 * @method  FORGE.Tween#_updateProperty
 * @param {Object} prop - The properties object.
 * @private
 */
FORGE.Tween.prototype._updateProperty = function(prop)
{
    var currentTime = Date.now();
    var deltaTime = currentTime - prop.startTime;

    prop.complete = deltaTime >= prop.duration;

    if (prop.complete === false)
    {
        var easing = prop.easing !== null ? prop.easing : this._easing;
        var y = easing(deltaTime / prop.duration);
        this._object[prop.name] = (y * (prop.max - prop.min) + prop.min);
    }
    else
    {
        this._object[prop.name] = prop.max;
    }
};

/**
 * Destroy method.
 * @method FORGE.Tween#destroy
 */
FORGE.Tween.prototype.destroy = function()
{
    this.stop();

    this._viewer = null;

    this._object = null;

    this._properties = null;

    this._easing = null;

    if (this._onStart !== null)
    {
        this._onStart.destroy();
        this._onStart = null;
    }

    if (this._onProgress !== null)
    {
        this._onProgress.destroy();
        this._onProgress = null;
    }

    if (this._onComplete !== null)
    {
        this._onComplete.destroy();
        this._onComplete = null;
    }

    if (this._onStop !== null)
    {
        this._onStop.destroy();
        this._onStop = null;
    }

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get and set the easing method.
 * @name  FORGE.Tween#easing
 * @type {Function}
 */
Object.defineProperty(FORGE.Tween.prototype, "easing",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        return this._easing;
    },

    /** @this {FORGE.Tween} */
    set: function(easing)
    {
        if (typeof easing === "string")
        {
            switch (easing)
            {
                case FORGE.EasingType.LINEAR:
                    this._easing = FORGE.Easing.LINEAR;
                    break;
                case FORGE.EasingType.SINE_IN:
                    this._easing = FORGE.Easing.SINE_IN;
                    break;
                case FORGE.EasingType.SINE_IN_OUT:
                    this._easing = FORGE.Easing.SINE_IN_OUT;
                    break;
                case FORGE.EasingType.SINE_OUT:
                    this._easing = FORGE.Easing.SINE_OUT;
                    break;
                case FORGE.EasingType.QUAD_IN:
                    this._easing = FORGE.Easing.QUAD_IN;
                    break;
                case FORGE.EasingType.QUAD_IN_OUT:
                    this._easing = FORGE.Easing.QUAD_IN_OUT;
                    break;
                case FORGE.EasingType.QUAD_OUT:
                    this._easing = FORGE.Easing.QUAD_OUT;
                    break;
                case FORGE.EasingType.CUBIC_IN:
                    this._easing = FORGE.Easing.CUBIC_IN;
                    break;
                case FORGE.EasingType.CUBIC_IN_OUT:
                    this._easing = FORGE.Easing.CUBIC_IN_OUT;
                    break;
                case FORGE.EasingType.CUBIC_OUT:
                    this._easing = FORGE.Easing.CUBIC_OUT;
                    break;
                case FORGE.EasingType.BOUNCE_OUT:
                    this._easing = FORGE.Easing.BOUNCE_OUT;
                    break;
                case FORGE.EasingType.BOUNCE_IN:
                    this._easing = FORGE.Easing.BOUNCE_IN;
                    break;
                default:
                    this._easing = FORGE.Easing.LINEAR;
                    break;
            }
        }
        else if (typeof easing === "function")
        {
            this._easing = easing;
        }
    }
});

/**
 * Get the complete flag value.
 * @name  FORGE.Tween#complete
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Tween.prototype, "complete",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        return this._complete;
    }
});

/**
 * Get the onStart {@link FORGE.EventDispatcher}
 * @name  FORGE.Tween#onStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Tween.prototype, "onStart",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        if (this._onStart === null)
        {
            this._onStart = new FORGE.EventDispatcher(this);
        }

        return this._onStart;
    }
});

/**
 * Get the onProgress {@link FORGE.EventDispatcher}
 * @name  FORGE.Tween#onProgress
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Tween.prototype, "onProgress",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        if (this._onProgress === null)
        {
            this._onProgress = new FORGE.EventDispatcher(this);
        }

        return this._onProgress;
    }
});

/**
 * Get the onComplete {@link FORGE.EventDispatcher}
 * @name  FORGE.Tween#onComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Tween.prototype, "onComplete",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        if (this._onComplete === null)
        {
            this._onComplete = new FORGE.EventDispatcher(this);
        }

        return this._onComplete;
    }
});

/**
 * Get the onStop {@link FORGE.EventDispatcher}
 * @name  FORGE.Tween#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Tween.prototype, "onStop",
{
    /** @this {FORGE.Tween} */
    get: function()
    {
        if (this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this);
        }

        return this._onStop;
    }
});