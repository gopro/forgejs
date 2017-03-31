/**
 * A FORGE.Scene is an object that represents a scene of a {@link FORGE.Story}.
 *
 * @constructor FORGE.Scene
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Scene = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Scene#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene config object.
     * @name FORGE.Scene#_sceneConfig
     * @type {FORGE.SceneParser}
     * @private
     */
    this._config = null;

    /**
     * The number of times this has been viewed.
     * @name  FORGE.Scene#_viewCount
     * @type {number}
     * @private
     */
    this._viewCount = 0;

    /**
     * Array of group uids this scene belongs to. aka "parents".
     * @name FORGE.Scene#_groups
     * @type {?Array<string>}
     * @private
     */
    this._groups = null;

    /**
     * Is booted flag.
     * @name FORGE.Scene#_booted
     * @type {boolean}
     * @private
     */
    this._booted = false;

    /**
     * Use external config file flag.
     * @name FORGE.Scene#_useExternalConfig
     * @type {boolean}
     * @private
     */
    this._useExternalConfig = false;

    /**
     * Scene events from the json configuration
     * @name FORGE.Story#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = {};

    /**
     * Load start event dispatcher.
     * @name  FORGE.Scene#_onLoadStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadStart = null;

    /**
     * Load complete event dispatcher.
     * @name  FORGE.Scene#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    /**
     * Unload start event dispatcher.
     * @name  FORGE.Scene#_onUnloadStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onUnloadStart = null;

    /**
     * Unload complete event dispatcher.
     * @name  FORGE.Scene#_onUnloadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onUnloadComplete = null;

    /**
     * Load complete event dispatcher for scene configuration file.
     * @name  FORGE.Scene#_onConfigLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onConfigLoadComplete = null;

    FORGE.BaseObject.call(this, "Scene");
};

FORGE.Scene.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Scene.prototype.constructor = FORGE.Scene;

/**
 * Parse scene configuration.
 * @method FORGE.Scene#_parseConfig
 * @private
 * @param {SceneConfig} config - The configuration object to parse.
 */
FORGE.Scene.prototype._parseConfig = function(config)
{
    this._config = new FORGE.SceneParser(this._viewer, config);

    this._uid = this._config.uid;
    this._tags = this._config.tags;
    this._register();

    if(typeof config.events === "object" && config.events !== null)
    {
        this._createEvents(config.events);
    }

    if (this._booted === false && typeof config.url === "string" && config.url !== "")
    {
        //use an external config json file
        this._useExternalConfig = true;
        this._viewer.load.json(this._uid, config.url, this._configLoadComplete, this);
    }
    else
    {
        this._booted = true;
    }
};

/**
 * Event handler for the load of the scene config json file.
 * @method FORGE.Scene#_configLoadComplete
 * @param {FORGE.File} file - The file data.
 * @private
 *
 * @todo the "story.config" cache file is not updated in this case, a cache entry is added for each scene UID.
 */
FORGE.Scene.prototype._configLoadComplete = function(file)
{
    this._booted = true;

    //extend the config
    if (typeof file.data === "string")
    {
        file.data = /** @type {Object} */ (JSON.parse(file.data));
    }

    // extend init config
    this._config.extendConfiguration(file.data);

    this._viewer.story.notifySceneConfigLoadComplete(this);

    if (this._onConfigLoadComplete !== null)
    {
        this._onConfigLoadComplete.dispatch();
    }
};

/**
 * Create events dispatchers.
 * @method FORGE.Scene#_createEvents
 * @private
 * @param {SceneEventsConfig} events - The events config of the scene.
 */
FORGE.Scene.prototype._createEvents = function(events)
{
    var event;
    for(var e in events)
    {
        event = new FORGE.ActionEventDispatcher(this._viewer, e);
        event.addActions(events[e]);
        this._events[e] = event;
    }
};

/**
 * Clear all events.
 * @method FORGE.Scene#_clearEvents
 * @private
 */
FORGE.Scene.prototype._clearEvents = function()
{
    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Add a scene configuration object.
 * @method  FORGE.Scene#addConfig
 * @param {SceneConfig} config - The scene configuration object to add.
 */
FORGE.Scene.prototype.addConfig = function(config)
{
    this._parseConfig(config);
};

/**
 * Load the scene.
 * @method FORGE.Scene#load
 *
 * @todo  better scene loader for the loadComplete event
 */
FORGE.Scene.prototype.load = function()
{
    this.log("FORGE.Scene.load();");

    if (this._viewer.story.scene === this)
    {
        return;
    }

    if (this._onLoadStart !== null)
    {
        this._onLoadStart.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onLoadStart, "ActionEventDispatcher") === true)
    {
        this._events.onLoadStart.dispatch();
    }

    this._viewCount++;

    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onLoadComplete, "ActionEventDispatcher") === true)
    {
        this._events.onLoadComplete.dispatch();
    }
};

/**
 * Unload the scene.
 * @method FORGE.Scene#unload
 * @todo cleanup if useless
 */
FORGE.Scene.prototype.unload = function()
{
    if (this._onUnloadStart !== null)
    {
        this._onUnloadStart.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onUnloadStart, "ActionEventDispatcher") === true)
    {
        this._events.onUnloadStart.dispatch();
    }

    if (this._onUnloadComplete !== null)
    {
        this._onUnloadComplete.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onUnloadComplete, "ActionEventDispatcher") === true)
    {
        this._events.onUnloadComplete.dispatch();
    }
};

/**
 * Know if a {@link FORGE.Group} is related to this scene?
 * @method FORGE.Scene#hasGroup
 * @param {(FORGE.Group|string)} value - Either the {@link FORGE.Group} itself or its index or its uid.
 * @return {boolean} Returns true if the {@link FORGE.Group} is related to this scene, false if not.
 */
FORGE.Scene.prototype.hasGroup = function(value)
{
    if (typeof value === "string" && FORGE.UID.isTypeOf(value, "Group") === true)
    {
        return FORGE.UID.get( /** @type {string} */ (value)).hasScene(this);
    }
    else if (FORGE.Utils.isTypeOf(value, "Group") === true)
    {
        return value.hasScene(this);
    }

    return false;
};

/**
 * Know if this scene is related to any {@link FORGE.Group}.
 * @method FORGE.Scene#hasGroups
 * @return {boolean} Returns true if this scene is related to at least a {@link FORGE.Group}, false if not.
 */
FORGE.Scene.prototype.hasGroups = function()
{
    var groups = this._viewer.story.groups;
    var group;
    for (var i = 0, ii = groups.length; i < ii; i++)
    {
        group = groups[i];
        if (group.hasScene(this) === true)
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroy method
 * @method FORGE.Scene#destroy
 */
FORGE.Scene.prototype.destroy = function()
{
    this._viewer = null;

    if (this._config !== null)
    {
        this._config.destroy();
        this._config = null;
    }

    if (this._onLoadStart !== null)
    {
        this._onLoadStart.destroy();
        this._onLoadStart = null;
    }

    if (this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    if (this._onUnloadStart !== null)
    {
        this._onUnloadStart.destroy();
        this._onUnloadStart = null;
    }

    if (this._onUnloadComplete !== null)
    {
        this._onUnloadComplete.destroy();
        this._onUnloadComplete = null;
    }

    this._clearEvents();
    this._events = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the booted status of the scene.
* @name FORGE.Scene#booted
* @type {boolean}
* @readonly
*/
Object.defineProperty(FORGE.Scene.prototype, "booted",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._booted;
    }
});

/**
* Get the group config object.
* @name FORGE.Scene#config
* @readonly
* @type {FORGE.SceneParser}
*/
Object.defineProperty(FORGE.Scene.prototype, "config",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Get the count of how many times this group has been viewed.
 * @name FORGE.Scene#viewCount
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Scene.prototype, "viewCount",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._viewCount;
    }
});

/**
 * Know if this scene has been viewed at least one time.
 * @name FORGE.Scene#viewed
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.Scene.prototype, "viewed",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._viewCount !== 0;
    }
});

/**
 * Get the name of this scene.
 * @name FORGE.Scene#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Scene.prototype, "name",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._config.name;
    }
});

/**
 * Get the slug name of this scene.
 * @name FORGE.Scene#slug
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Scene.prototype, "slug",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._config.slug;
    }
});

/**
 * Get the description of this scene.
 * @name FORGE.Scene#description
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Scene.prototype, "description",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._config.description;
    }
});

/**
 * Get the Array of groups uids to which this scene belongs to.
 * @name FORGE.Scene#groupsUid
 * @readonly
 * @type {?Array<FORGE.Group>}
 */
Object.defineProperty(FORGE.Scene.prototype, "groupsUid",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        var groups = this._viewer.story.groups;
        var group;
        var result = [];

        for (var i = 0, ii = groups.length; i < ii; i++)
        {
            group = groups[i];

            if (group.hasScene(this) === true)
            {
                result.push(group.uid);
            }
        }

        return result;
    }
});

/**
 * Get the Array of {@link FORGE.Group} to which this scene belongs to.
 * @name FORGE.Scene#groups
 * @readonly
 * @type {?Array<FORGE.Group>}
 */
Object.defineProperty(FORGE.Scene.prototype, "groups",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return FORGE.UID.get(this.groupsUid);
    }
});

/**
 * Get the thumbnails Array.
 * @name  FORGE.Scene#thumbnails
 * @readonly
 * @type {Array}
 *
 * @todo  Define what is a thumbnail array, maybe with a thumbnail object descriptor
 */
Object.defineProperty(FORGE.Scene.prototype, "thumbnails",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._config.thumbnails;
    }
});

/**
 * Get the onLoadStart {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onLoadStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onLoadStart",
{
    /** @this {FORGE.Scene} */
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
 * Get the onLoadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onLoadComplete",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});

/**
 * Get the onUnloadStart {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onUnloadStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onUnloadStart",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onUnloadStart === null)
        {
            this._onUnloadStart = new FORGE.EventDispatcher(this);
        }

        return this._onUnloadStart;
    }
});

/**
 * Get the onUnloadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onUnloadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onUnloadComplete",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onUnloadComplete === null)
        {
            this._onUnloadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onUnloadComplete;
    }
});

/**
 * Get the onConfigLoadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onConfigLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onConfigLoadComplete",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onConfigLoadComplete === null)
        {
            this._onConfigLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onConfigLoadComplete;
    }
});