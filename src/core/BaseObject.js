
/**
 * Most of the ForgeJS objects extends FORGE.BaseObject.<br>
 * Its main purpose is to name objects with a class name (a type) and to have a destroy method that handles an "alive" flag.
 *
 * @constructor FORGE.BaseObject
 * @param {string} className - The class name of the object.
 *
 * @todo  See if we can trace inheritance.
 */
FORGE.BaseObject = function(className)
{
    /**
     * The unique identifier of this object.
     * @name  FORGE.BaseObject#_uid
     * @type {string}
     * @private
     */
    this._uid = "";

    /**
     * Array of tags that can be used to identify / classify this object.
     * @name  FORGE.BaseObject#_tags
     * @type {?Array<string>}
     * @private
     */
    this._tags = null;

    /**
     * Custom data associated to this object.
     * @name  FORGE.BaseObject#_data
     * @type {?*}
     * @private
     */
    this._data = null;

    /**
     * Internal refernce to the onDestroy {@link FORGE.EventDispatcher}.
     * @name FORGE.BaseObject#_onDestroy
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onDestroy = null;

    /**
     * Internal reference to the alive flag.
     * @name FORGE.BaseObject#_alive
     * @type {boolean}
     * @private
     */
    this._alive = true;

    /**
     * Internal reference to the debug flag.
     * @name FORGE.BaseObject#_debug
     * @type {boolean}
     * @private
     */
    this._debug = false;

    /**
     * Internal reference to the warning flag.
     * @name  FORGE.BaseObject#_warning
     * @type {boolean}
     * @private
     */
    this._warning = false;

    /**
     * Array to store log if debug is enabled.
     * @name FORGE.BaseObject#_logs
     * @type {?Array}
     * @private
     */
    this._logs = null;

    /**
     * Internal reference to the class name of the object that extends this base object.
     * @name FORGE.BaseObject#_className
     * @type {string}
     * @private
     */
    this._className = className || "BaseObject";

    /**
     * Inheritance chain.
     * @name FORGE.BaseObject#_inheritance
     * @type {Array<String>}
     * @private
     * @todo  Code this mechanism of type chain inheritance
     */
    this._inheritance = ["BaseObject"];
};

FORGE.BaseObject.prototype.constructor = FORGE.BaseObject;


/**
 * Registers the object in the uid index and bind to tag manager if tags set.
 * If no uid set, use a generated one.
 * @method FORGE.BaseObject#_register
 * @private
 */
FORGE.BaseObject.prototype._register = function()
{
    //Generate a uid if undefined
    if(typeof this._uid !== "string" || this._uid === "")
    {
        this._uid = FORGE.UID.generate();
    }
    //Register in UID table
    var registered = FORGE.UID.register(this);

    //If this object have tags associated to it.
    if(this._tags !== null)
    {
        //Maybe there is a single string typed tag, convert it to an array.
        if(typeof this._tags === "string")
        {
            this._tags = [this._tags];
        }

        //Register tags if it is an Array
        if(Array.isArray(this._tags) === true)
        {
            FORGE.Tags.register(this);
        }
    }

    return registered;
};

/**
 * Unregisters the object in the uid index.
 * @method FORGE.BaseObject#_unregister
 * @private
 */
FORGE.BaseObject.prototype._unregister = function()
{
    if(this._uid !== "" && FORGE.UID.exists(this._uid) === true)
    {
        FORGE.UID.unregister(this);
    }
};

/**
 * That method describe how to output the log, can be overwritted by a debug plugin for example.
 * @method FORGE.BaseObject#_stdout
 * @private
 * @param {*} value - The value you want to stdout.
 * @param {string} mode - The console method to use (default is log)
 */
FORGE.BaseObject.prototype._stdout = function(value, mode)
{
    var m = mode || "log";
    console[m].apply(console, [
        "%c[ForgeJS]%c "
        + "FORGE." + this._className + " : " + value + " %c(@"
        + window.performance.now().toFixed(2) + "ms)",
        "background: #e2edff; color: #4286f4; font-weight: 700",
        "font-weight: 400",
        "color: #AAA"
    ]);

    if(typeof value === "object" && value !== null)
    {
        console[m](value);
    }
};

/**
 * Basic log method, log a string in the console if debug is enabled.
 * @method FORGE.BaseObject#log
 * @param {*} value - The value you want to log in the console.
 */
FORGE.BaseObject.prototype.log = function(value)
{
    if(window["FORGE"]["DEBUG"] === true || window["FORGE"][this._className]["DEBUG"] === true || this._debug === true)
    {
        this._stdout(value, "log");

        if(this._logs === null)
        {
            this._logs = [];
        }

        this._logs.push(value);
    }
};

/**
 * Basic warn method, log a warn string in the console if warning is enabled.
 * @method FORGE.BaseObject#warn
 * @param {?(string|Object)} value - The value you want to warn in the console.
 */
FORGE.BaseObject.prototype.warn = function(value)
{
    if(window["FORGE"]["WARNING"] === true || window["FORGE"][this._className]["WARNING"] === true || this._warning === true)
    {
        this._stdout(value, "warn");
    }
};

/**
 * Basic destroy method, prevent double destroy, change the alive flag.
 * @method FORGE.BaseObject#destroy
 */
FORGE.BaseObject.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    this._unregister();

    if(this._onDestroy !== null)
    {
        this._onDestroy.dispatch();
        this._onDestroy.destroy();
        this._onDestroy = null;
    }

    this._data = null;

    this._alive = false;
};

/**
 * Get the class name of the object.
 * @name FORGE.BaseObject#className
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "className",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._className;
    }

});

/**
 * Get the uid of the object.
 * @name FORGE.BaseObject#uid
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "uid",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._uid;
    }
});

/**
 * Get the tags associated to this object.
 * @name FORGE.BaseObject#tags
 * @readonly
 * @type {Array}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "tags",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._tags;
    }
});

/**
 * Get the alive flag value of the object.
 * @name FORGE.BaseObject#alive
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "alive",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._alive;
    }
});

/**
* Get and set any custom data you want to associate to this object.
* @name FORGE.BaseObject#data
* @type {*}
*/
Object.defineProperty(FORGE.BaseObject.prototype, "data",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._data;
    },

    /** @this {FORGE.BaseObject} */
    set: function(value)
    {
        this._data = value;
    }
});

/**
 * Get and set the debug flag.
 * @name FORGE.BaseObject#debug
 * @type {boolean}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "debug",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._debug;
    },

    /** @this {FORGE.BaseObject} */
    set: function(value)
    {
        this._debug = Boolean(value);

        if(this._debug === true)
        {
            console.log("Enabling debug for a FORGE."+this._className+" instance :");
            console.log(this);
        }
    }
});

/**
 * Get and set the warning flag.
 * @name FORGE.BaseObject#warning
 * @type {boolean}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "warning",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        return this._warning;
    },

    /** @this {FORGE.BaseObject} */
    set: function(value)
    {
        this._warning = Boolean(value);

        if(this._warning === true)
        {
            console.log("Enabling warning for a FORGE."+this._className+" instance :");
            console.log(this);
        }
    }
});

/**
 * Get the onDestroy {@link FORGE.EventDispatcher}, this event is emitted at the end of the destroy sequence.
 * @name FORGE.BaseObject#onDestroy
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.BaseObject.prototype, "onDestroy",
{
    /** @this {FORGE.BaseObject} */
    get: function()
    {
        if(this._onDestroy === null)
        {
            this._onDestroy = new FORGE.EventDispatcher(this);
        }

        return this._onDestroy;
    }
});
