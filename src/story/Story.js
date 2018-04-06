/**
 * The FORGE.Story manages groups and scenes of the project's story.
 *
 * @constructor FORGE.Story
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.Story = function(viewer)
{
    /**
    * The viewer reference.
    * @name FORGE.Story#_viewer
    * @type {FORGE.Viewer}
    * @private
    */
    this._viewer = viewer;

    /**
     * The config object.
     * @name FORGE.Story#_config
     * @type {?StoryConfig}
     * @private
     */
    this._config = null;

    /**
     * The internationalizable name of the story.
     * @name FORGE.Story#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The internationalizable slug name of the story.
     * @name FORGE.Story#_slug
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._slug = null;

    /**
     * The internationalizable description of the story.
     * @name FORGE.Story#_description
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._description = null;

    /**
     * The default uid to load, this can be a scene or a group uid.
     * @name FORGE.Story#_default
     * @type {string}
     * @private
     */
    this._default = "";

    /**
     * Array of {@link FORGE.Scene} uid of the story.
     * @name FORGE.Story#_scenes
     * @type {?Array<string>}
     * @private
     */
    this._scenes = null;

    /**
     * Uid of the scene being loading.
     * If no scene is loading it will be an empty string.
     * @name FORGE.Story#_loadingSceneUid
     * @type {string}
     * @private
     */
    this._loadingSceneUid = "";

    /**
     * Uid of the current scene.
     * @name FORGE.Story#_sceneUid
     * @type {string}
     * @private
     */
    this._sceneUid = "";

    /**
     * Array of {@link FORGE.Group} uid of the story.
     * @name FORGE.Story#_groups
     * @type {?Array<string>}
     * @private
     */
    this._groups = null;

    /**
     * Uid of the current group.
     * @name FORGE.Story#_groupUid
     * @type {?string}
     * @private
     */
    this._groupUid = "";

    /**
     * Story events from the json configuration
     * @name FORGE.Story#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = {};

    /**
     * On ready event dispatcher
     * @name FORGE.Story#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * On scene load start event dispatcher.
     * @name  FORGE.Story#_onSceneLoadStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneLoadStart = null;

    /**
     * On scene load progress event dispatcher.
     * @name FORGE.Story#_onSceneLoadProgress
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneLoadProgress = null;

    /**
     * On scene load complete event dispatcher.
     * @name FORGE.Story#_onSceneLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneLoadComplete = null;

    /**
     * On scene load error event dispatcher.
     * @name FORGE.Story#_onSceneLoadError
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onSceneLoadError = null;

    /**
     * On scene preview event dispatcher.
     * @name FORGE.Story#_onScenePreview
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onScenePreview = null;

    /**
     * On group change event dispatcher.
     * @name FORGE.Story#_onGroupChange
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onGroupChange = null;

    FORGE.BaseObject.call(this, "Story");

    this._boot();
};

FORGE.Story.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Story.prototype.constructor = FORGE.Story;

/**
 * Boot sequence.
 * @method FORGE.Story#_boot
 */
FORGE.Story.prototype._boot = function()
{
    this.log("FORGE.Story.boot();");

    this._scenes = [];
    this._groups = [];

    this._name = new FORGE.LocaleString(this._viewer);
    this._slug = new FORGE.LocaleString(this._viewer);
    this._description = new FORGE.LocaleString(this._viewer);
};

/**
 * Event handler for the configuration JSON load complete.
 * @method FORGE.Story#_configLoadComplete
 * @private
 * @param  {FORGE.File} file - The {@link FORGE.File} that describes the loaded JSON file.
 */
FORGE.Story.prototype._configLoadComplete = function(file)
{
    this.log("FORGE.Story.loadComplete();");

    var json = this._viewer.cache.get(FORGE.Cache.types.JSON, file.key);
    var config = /** @type {StoryConfig} */ (json.data);

    this._parseConfig(config);
};

/**
 * Parse the story configuration.
 * @method FORGE.Story#_parseConfig
 * @private
 * @param  {StoryConfig} config - The story configuration to parse.
 */
FORGE.Story.prototype._parseConfig = function(config)
{
    if(FORGE.UID.validate(config) !== true)
    {
        throw "Story configuration is not valid, you have duplicate uids";
    }

    this._config = config;

    this._uid = this._config.uid;
    this._register();

    this._default = this._config.default;

    // Set the keys for the locale strings
    this._name.key = this._config.name;
    this._slug.key = this._config.slug;
    this._description.key = this._config.description;

    if(typeof this._config.scenes !== "undefined" && this._config.scenes.length > 0)
    {
        this._createScenes(this._config.scenes);
    }

    if(typeof this._config.groups !== "undefined" && this._config.groups.length > 0)
    {
        this._createGroups(this._config.groups);
    }

    if(typeof this._config.events === "object" && this._config.events !== null)
    {
        this._createEvents(this._config.events);
    }

    this._checkStoryScenes();
};

/**
 * Create events dispatchers.
 * @method FORGE.Story#_createEvents
 * @private
 * @param {StoryEventsConfig} events - The events config of the story.
 */
FORGE.Story.prototype._createEvents = function(events)
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
 * @method FORGE.Story#_clearEvents
 * @private
 */
FORGE.Story.prototype._clearEvents = function()
{
    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Check if all scenes have been loaded.
 * @method FORGE.Story#_checkStoryScenes
 * @private
 */
FORGE.Story.prototype._checkStoryScenes = function()
{
    if(typeof this._config.scenes === "undefined" || this._scenes.length === this._config.scenes.length)
    {
        this._setStoryReady();
    }
};

/**
 * Activate the story and load the first scene.
 * @method FORGE.Story#_setStoryReady
 * @private
 */
FORGE.Story.prototype._setStoryReady = function()
{
    if(this._onReady !== null)
    {
        this._onReady.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onReady, "ActionEventDispatcher") === true)
    {
        this._events.onReady.dispatch();
    }

    // If slug name in URL load the associated object
    // NB: I couldn't find another way to correctly access the property without minification
    var hashParameters = FORGE.URL.parse()["hashParameters"];

    if(hashParameters !== null && typeof hashParameters.uid === "string" && FORGE.UID.exists(hashParameters.uid))
    {
        this._loadUid(hashParameters.uid);

        // this._viewer.i18n.onLocaleChangeComplete.addOnce(this._localeChangeCompleteHandler, this);
    }
    //Else if default uid
    else if(this._default !== "" && this._default !== null && FORGE.UID.exists(this._default))
    {
        this._loadUid(this._default);
    }
    //Else load scene index 0
    else
    {
        this.loadScene(0);
    }
};

/**
 * Load an object by its uid. It can be a scene uid or a group uid.
 * @method FORGE.Story._loadUid
 * @private
 * @param  {string} uid - Uid of the object you want to load.
 */
FORGE.Story.prototype._loadUid = function(uid)
{
    if(FORGE.UID.isTypeOf(uid, "Scene") === true || FORGE.UID.isTypeOf(uid, "Group") === true)
    {
        FORGE.UID.get(uid).load();
    }
};

/**
 * Create {@link FORGE.Scene}s from scenes configuration object.
 * @method FORGE.Story#_createScenes
 * @private
 * @param  {Array<SceneConfig>} config - The object that describes the scenes, issued from the main configuration.
 */
FORGE.Story.prototype._createScenes = function(config)
{
    var scene;
    for(var i = 0, ii = config.length; i < ii; i++)
    {
        scene = new FORGE.Scene(this._viewer);
        scene.addConfig(config[i]);

        //Scene is not booted at creation if the scene config is in an external file
        if(scene.booted === true)
        {
            this._addScene(scene);
        }
    }
};

/**
 * Add a scene into the scenes array.
 * @param {FORGE.Scene} scene - The scene to add.
 * @private
 */
FORGE.Story.prototype._addScene = function(scene)
{
    // scene.onLoadRequest.add(this._sceneLoadRequestHandler, this);
    scene.onLoadStart.add(this._sceneLoadStartHandler, this);
    scene.onLoadComplete.add(this._sceneLoadCompleteHandler, this);

    this._scenes.push(scene.uid);
};

/**
 * Internal envent handler for scene load start, updates the group index, re-dispatch scene load start at the story level.
 * @method FORGE.Story#_sceneLoadStartHandler
 * @private
 */
FORGE.Story.prototype._sceneLoadStartHandler = function(event)
{
    this._loadingSceneUid = event.emitter.uid;

    this.log("scene "+this._loadingSceneUid+" load start");

    if(this._onSceneLoadStart !== null)
    {
        this._onSceneLoadStart.dispatch(/** @type {StoryEvent} */({ sceneUid: this._loadingSceneUid }));
    }

    if(FORGE.Utils.isTypeOf(this._events.onSceneLoadStart, "ActionEventDispatcher") === true)
    {
        this._events.onSceneLoadStart.dispatch();
    }
};

/**
 * Internal event handler for scene load complete, re-dispatch the load complete event at the story level.
 * @method FORGE.Story#_sceneLoadCompleteHandler
 * @private
 */
FORGE.Story.prototype._sceneLoadCompleteHandler = function(event)
{
    // Set the current scene uid on load complete
    this._sceneUid = this._loadingSceneUid;

    // No scene is loading so I reset the loadingSceneUid to an empty string
    this._loadingSceneUid = "";

    this.log("scene "+this._loadingSceneUid+" load complete");

    var scene = event.emitter;

    //The scene has no group so nullify the _groupUid
    if(scene.hasGroups() === false)
    {
        this._groupUid = null;

        if(this._onGroupChange !== null)
        {
            this._onGroupChange.dispatch(/** @type {StoryEvent} */({ groupUid: this._groupUid }));
        }

        if(FORGE.Utils.isTypeOf(this._events.onGroupChange, "ActionEventDispatcher") === true)
        {
            this._events.onGroupChange.dispatch();
        }
    }
    else if (scene.hasGroups() === true && scene.hasGroup(this._groupUid) === false)
    {
        this._setGroupUid(scene.groups[0].uid);
    }

    if(this._onSceneLoadComplete !== null)
    {
        this._onSceneLoadComplete.dispatch(/** @type {StoryEvent} */({ sceneUid: this._sceneUid }));
    }

    if(FORGE.Utils.isTypeOf(this._events.onSceneLoadComplete, "ActionEventDispatcher") === true)
    {
        this._events.onSceneLoadComplete.dispatch();
    }
};

/**
 * Create {@link FORGE.Group}s from groups configuration object.
 * @method FORGE.Story#_createGroups
 * @private
 * @param  {Object} config - The object that describes the groups, issued from the main configuration.
 */
FORGE.Story.prototype._createGroups = function(config)
{
    var group;
    for(var i = 0, ii = config.length; i < ii; i++)
    {
        group = new FORGE.Group(this._viewer, config[i]);
        this._groups.push(group.uid);
    }
};

/**
 * Internal method to set the current {@link FORGE.Group} uid. Dispatch "onGroupChange" if its a valid operation.
 * @method FORGE.Story#_setGroupUid
 * @private
 * @param {string} uid - Uid of the group to set
 */
FORGE.Story.prototype._setGroupUid = function(uid)
{
    if(FORGE.UID.isTypeOf(uid, "Group") === true && uid !== this._groupUid)
    {
        this._groupUid = uid;

        if(this._onGroupChange !== null)
        {
            this._onGroupChange.dispatch(/** @type {StoryEvent} */({ groupUid: this._groupUid }));
        }

        if(FORGE.Utils.isTypeOf(this._events.onGroupChange, "ActionEventDispatcher") === true)
        {
            this._events.onGroupChange.dispatch();
        }
    }
};

/**
 * Load a JSON story configuration.
 * @method FORGE.Story#loadConfig
 * @param  {(string|StoryConfig)} config - The URL of the configuration JSON file to load or a story configuration object.
 */
FORGE.Story.prototype.loadConfig = function(config)
{
    this.log("loadConfig");

    if(typeof config === "string")
    {
        this._viewer.load.json("forge.story.config", config, this._configLoadComplete, this);
    }
    else if (typeof config === "object" && config !== null)
    {
        this._parseConfig(config);
    }
};

/**
 * Know if the story have any {@link FORGE.Scene}.
 * @method FORGE.Story#hasScenes
 * @return {boolean} Returns true if the story have at least a {@link FORGE.Scene}, false if not.
 */
FORGE.Story.prototype.hasScenes = function()
{
    return this._scenes.length !== 0;
};

/**
 * Know if the story have any {@link FORGE.Group}.
 * @method FORGE.Story#hasGroups
 * @return {boolean} Returns true if the story have at least a {@link FORGE.Group}, false if not.
 */
FORGE.Story.prototype.hasGroups = function()
{
    return this._groups.length !== 0;
};

/**
 * Load the next scene of the story.
 * @method FORGE.Story#nextScene
 */
FORGE.Story.prototype.nextScene = function()
{
    var index = this._scenes.indexOf(this._sceneUid);
    var uid;

    if(index + 1 < this._scenes.length)
    {
        uid = this._scenes[index + 1];
    }
    else
    {
        uid = this._scenes[0];
    }

    this.loadScene(uid);
};

/**
 * Load the previous scene of the story.
 * @method FORGE.Story#previousScene
 */
FORGE.Story.prototype.previousScene = function()
{
    var index = this._scenes.indexOf(this._sceneUid);
    var uid;

    if(index - 1 >= 0)
    {
        uid = this._scenes[index - 1];
    }
    else
    {
        uid = this._scenes[this._scenes.length - 1];
    }

    this.loadScene(uid);
};

/**
 * Load a {@link FORGE.Scene}.
 * @method FORGE.Story#loadScene
 * @param  {(FORGE.Scene|number|string)} value - Either the {@link FORGE.Scene} itself its index in the main _scenes Array or its uid.
 */
FORGE.Story.prototype.loadScene = function(value)
{
    var uid;

    // use the index of the group array
    if (typeof value === "number")
    {
        if(value >= 0 && value < this._scenes.length)
        {
            uid = this._scenes[value];
        }
        else
        {
            this.warn("Load scene error: index "+value+" is out of bounds");
        }
    }
    // use the uid
    else if (typeof value === "string" && FORGE.UID.isTypeOf(value, "Scene"))
    {
        uid = value;
    }
    // use a Group object directly
    else if (typeof value === "object" && FORGE.Utils.isTypeOf(value, "Scene"))
    {
        uid = value.uid;
    }

    //If uid is defined and if it's not the current scene
    if(typeof uid !== "undefined" && uid !== this._sceneUid)
    {
        this._loadUid(uid);
    }
};

/**
 * Internal method to load a {@link FORGE.Group}.
 * @method FORGE.Story#loadGroup
 * @param  {(FORGE.Group|number|string)} value - Either the {@link FORGE.Group} itself its index in the main _groups Array or its uid.
 */
FORGE.Story.prototype.loadGroup = function(value)
{
    var uid;

    // use the index of the group array
    if (typeof value === "number")
    {
        if(value >= 0 && value < this._groups.length)
        {
            uid = this._groups[value];
        }
        else
        {
            this.warn("Load group, index "+value+" is out of bounds");
        }
    }
    // use the uid
    else if (typeof value === "string" && FORGE.UID.isTypeOf(value, "Group"))
    {
        uid = value;
    }
    // use a Group object directly
    else if (typeof value === "object" && FORGE.Utils.isTypeOf(value, "Group"))
    {
        uid = value.uid;
    }

    //If uid is defined and if it's not the current scene
    if(typeof uid !== "undefined" && uid !== this._groupUid)
    {
        this._setGroupUid(uid);
        this._loadUid(uid);
    }
};

/**
 * Event handler for scene loaded from an external json file into config.
 * @method  FORGE.Story#_sceneConfigComplete
 * @param  {FORGE.Scene} scene - The scene that has finish to load its configuration.
 * @private
 */
FORGE.Story.prototype.notifySceneConfigLoadComplete = function(scene)
{
    this._addScene(scene);

    //check if all scenes are loaded
    this._checkStoryScenes();
};

/**
 * Destroy method.
 * @method FORGE.Story#destroy
 */
FORGE.Story.prototype.destroy = function()
{
    this._viewer = null;
    this._config = null;

    this._name.destroy();
    this._name = null;

    this._slug.destroy();
    this._slug = null;

    this._description.destroy();
    this._description = null;

    for(var i = 0, ii = this._scenes.length; i < ii; i++)
    {
        FORGE.UID.get(this._scenes[i]).destroy();
    }
    this._scenes = null;

    for(var j = 0, jj = this._groups.length; j < jj; j++)
    {
        FORGE.UID.get(this._groups[j]).destroy();
    }
    this._groups = null;

    // Events
    if(this._onReady !== null)
    {
        this._onReady.destroy();
        this._onReady = null;
    }

    if(this._onSceneLoadStart !== null)
    {
        this._onSceneLoadStart.destroy();
        this._onSceneLoadStart = null;
    }

    if(this._onSceneLoadProgress !== null)
    {
        this._onSceneLoadProgress.destroy();
        this._onSceneLoadProgress = null;
    }

    if(this._onSceneLoadComplete !== null)
    {
        this._onSceneLoadComplete.destroy();
        this._onSceneLoadComplete = null;
    }

    if(this._onSceneLoadError !==null)
    {
        this._onSceneLoadError.destroy();
        this._onSceneLoadError = null;
    }

    if(this._onScenePreview !== null)
    {
        this._onScenePreview.destroy();
        this._onScenePreview = null;
    }

    if(this._onGroupChange !== null)
    {
        this._onGroupChange.destroy();
        this._onGroupChange = null;
    }

    this._clearEvents();
    this._events = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the story config object.
* @name FORGE.Story#config
* @readonly
* @type {Object}
*/
Object.defineProperty(FORGE.Story.prototype, "config",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._config;
    }
});

/**
* Get the name of the story.
* @name FORGE.Story#name
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "name",
{
    /** @this {FORGE.Story} */
    get: function ()
    {
        return this._name.value;
    }
});

/**
* Get the slug name of the story.
* @name FORGE.Story#slug
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "slug",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._slug.value;
    }
});

/**
* Get the description of the story.
* @name FORGE.Story#description
* @readonly
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "description",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._description.value;
    }
});


/**
* Get the Array of {@link FORGE.Scene} that compose the story.
* @name FORGE.Story#scenes
* @readonly
* @type {?Array<FORGE.Scene>}
*/
Object.defineProperty(FORGE.Story.prototype, "scenes",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return FORGE.UID.get(this._scenes);
    }
});

/**
 * Get the loading {@link FORGE.Scene} object.
 * Returns null if there no scene being loaded.
 * @name FORGE.Story#loadingScene
 * @type  {FORGE.Scene}
 */
Object.defineProperty(FORGE.Story.prototype, "loadingScene",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._loadingSceneUid === null || this._loadingSceneUid === "")
        {
            return null;
        }

        return FORGE.UID.get(this._loadingSceneUid);
    }
});

/**
 * Get the current {@link FORGE.Scene} object, or set the current scene passing the {@link FORGE.Scene} object itself, its index or uid.
 * @name FORGE.Story#scene
 * @type  {FORGE.Scene}
 */
Object.defineProperty(FORGE.Story.prototype, "scene",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._sceneUid === null || this._sceneUid === "")
        {
            return null;
        }

        return FORGE.UID.get(this._sceneUid);
    },

    /** @this {FORGE.Story} */
    set: function(value)
    {
        this.loadScene(value);
    }
});

/**
* Get all the sceneUids.
* @name FORGE.Story#sceneUids
* @readonly
* @type {Array<string>}
*/
Object.defineProperty(FORGE.Story.prototype, "sceneUids",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._scenes;
    }
});

/**
* Get the loading scene uid.
* if no scene are loading, this will be equal to an empty string.
* @name FORGE.Story#loadingSceneUid
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "loadingSceneUid",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._loadingSceneUid;
    }
});

/**
* Get the current sceneUid.
* @name FORGE.Story#sceneUid
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "sceneUid",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._sceneUid;
    },

    /** @this {FORGE.Story} */
    set: function(value)
    {
        this.loadScene(value);
    }
});

/**
* Get the Array of {@link FORGE.Group} that compose the story.
* @name FORGE.Story#groups
* @readonly
* @type {?Array<FORGE.Group>}
*/
Object.defineProperty(FORGE.Story.prototype, "groups",
{
    /** @this {FORGE.Story} */
    get: function ()
    {
        return FORGE.UID.get(this._groups);
    }
});

/**
 * Get the current {@link FORGE.Group} object, or set the current scene passing the {@link FORGE.Group} object itself, its index or uid.
 * @name FORGE.Story#group
 * @type  {(FORGE.Group)}
 */
Object.defineProperty(FORGE.Story.prototype, "group",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._groupUid === null || this._groupUid === "")
        {
            return null;
        }

        return FORGE.UID.get(this._groupUid);
    },

    /** @this {FORGE.Story} */
    set: function(value)
    {
        this.loadGroup(value);
    }
});

/**
* Get all the group Uids.
* @name FORGE.Story#groupUids
* @readonly
* @type {Array<string>}
*/
Object.defineProperty(FORGE.Story.prototype, "groupUids",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._groups;
    }
});

/**
* Get the current groupUid.
* @name FORGE.Story#groupUid
* @type {string}
*/
Object.defineProperty(FORGE.Story.prototype, "groupUid",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        return this._groupUid;
    },

    /** @this {FORGE.Story} */
    set: function(value)
    {
        this.loadGroup(value);
    }
});

/**
 * Get the onReady {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Story.prototype, "onReady",
{
    /** @this {FORGE.Story} */
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
 * Get the onSceneLoadStart {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onSceneLoadStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Story.prototype, "onSceneLoadStart",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onSceneLoadStart === null)
        {
            this._onSceneLoadStart = new FORGE.EventDispatcher(this);
        }

        return this._onSceneLoadStart;
    }
});

/**
 * Get the onSceneLoadProgress {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onSceneLoadProgress
 * @readonly
 * @type {FORGE.EventDispatcher}
 * @todo  This event is currently not dispatched
 */
Object.defineProperty(FORGE.Story.prototype, "onSceneLoadProgress",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onSceneLoadProgress === null)
        {
            this._onSceneLoadProgress = new FORGE.EventDispatcher(this);
        }

        return this._onSceneLoadProgress;
    }
});

/**
 * Get the onSceneLoadComplete {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onSceneLoadComplete
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Story.prototype, "onSceneLoadComplete",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onSceneLoadComplete === null)
        {
            this._onSceneLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onSceneLoadComplete;
    }
});

/**
 * Get the onSceneLoadError {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onSceneLoadError
 * @readonly
 * @type {FORGE.EventDispatcher}
 * @todo  This event is currently not dispatched
 */
Object.defineProperty(FORGE.Story.prototype, "onSceneLoadError",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onSceneLoadError === null)
        {
            this._onSceneLoadError = new FORGE.EventDispatcher(this);
        }

        return this._onSceneLoadError;
    }
});

/**
 * Get the onScenePreview {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onScenePreview
 * @readonly
 * @type {FORGE.EventDispatcher}
 * @todo  This event is currently not dispatched
 */
Object.defineProperty(FORGE.Story.prototype, "onScenePreview",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onScenePreview === null)
        {
            this._onScenePreview = new FORGE.EventDispatcher(this);
        }

        return this._onScenePreview;
    }
});

/**
 * Get the onGroupChange {@link FORGE.EventDispatcher}.
 * @name  FORGE.Story#onGroupChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Story.prototype, "onGroupChange",
{
    /** @this {FORGE.Story} */
    get: function()
    {
        if(this._onGroupChange === null)
        {
            this._onGroupChange = new FORGE.EventDispatcher(this);
        }

        return this._onGroupChange;
    }
});
