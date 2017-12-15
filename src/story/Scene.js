/**
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
     * Scene viewports manager.
     * @name FORGE.Scene#_viewportManager
     * @type {FORGE.SceneViewportManager}
     * @private
     */
    this._viewportManager = null;

    /**
     * The scene config object.
     * @name FORGE.Scene#_sceneConfig
     * @type {?SceneConfig}
     * @private
     */
    this._config = null;

    /**
     * The internationalizable name of the scene.
     * @name FORGE.Scene#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The internationalizable slug name of the scene.
     * @name FORGE.Scene#_slug
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._slug = null;

    /**
     * The internationalizable description of the scene.
     * @name FORGE.Scene#_description
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._description = null;

    /**
     * The array of scene uids to be sync with
     * @name FORGE.Scene#_sync
     * @type {Array<string>}
     * @private
     */
    this._sync = [];

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
     * The media of the scene
     * @name FORGE.Scene#_media
     * @type {FORGE.Media}
     * @private
     */
    this._media = null;

    this._transition = null;

    this._renderTarget = null;

    /**
     * Load request event dispatcher.
     * @name  FORGE.Scene#_onLoadRequest
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadRequest = null;

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

    /**
     * media create event dispatcher.
     * @name  FORGE.Scene#_onMediaCreate
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onMediaCreate = null;
    this._onTransitionCreate = null;

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
    this._config = config;

    this._uid = config.uid;
    this._tags = config.tags;
    this._register();

    this._name = new FORGE.LocaleString(this._viewer, this._config.name);
    this._slug = new FORGE.LocaleString(this._viewer, this._config.slug);
    this._description = new FORGE.LocaleString(this._viewer, this._config.description);
    this._sync = (FORGE.Utils.isArrayOf(this._config.sync, "string") === true) ? this._config.sync : [];

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
    this.log("config load complete");

    this._booted = true;

    //extend the config
    if (typeof file.data === "string")
    {
        file.data = /** @type {Object} */ (JSON.parse(file.data));
    }

    // extend init config
    this._config = /** @type {SceneConfig} */ (FORGE.Utils.extendSimpleObject(this._config, file.data));

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
    this.log("create events");

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
    this.log("clear events");

    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Create the scene media
 * @param  {SceneMediaConfig} media - media configuration
 * @private
 */
FORGE.Scene.prototype._createMedia = function(media)
{
    this.log("create media");

    if(this._media === null)
    {
        this._media = new FORGE.Media(this._viewer, media);

        if(this._onMediaCreate !== null)
        {
            this._onMediaCreate.dispatch({ media: this._media });
        }
    }
};

/**
 * Get the master camera of the scene
 * @method FORGE.Scene#_getMasterCamera
 * @private
 */
FORGE.Scene.prototype._getMasterCamera = function()
{
    // @todo: define a policy for master camera (for example: viewport active with user focus)
    return this._viewportManager.activeViewport.camera;
};

/**
 * Create viewports and renderers based on layout definition in config
 * @method FORGE.Scene#_createViewports
 * @private
 * @param {!SceneConfig} config - Scene config
 */
FORGE.Scene.prototype._createViewports = function(config)
{
    if (this._renderTarget !== null)
    {
        this._renderTarget.dispose();
        this._renderTarget = null;
    }

    var rtParams =
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
    };

    // TODO : renderer should expose scene size for each frame, it could change during transitions
    this._renderTarget = new THREE.WebGLRenderTarget(this._viewer.width, this._viewer.height, rtParams);
    this._viewportManager = new FORGE.SceneViewportManager(this._viewer, this);
};

FORGE.Scene.prototype._createTransition = function(transition)
{
    this.log("create transition");

    if(this._transition === null)
    {
        this._transition = new FORGE.Media(this._viewer, transition);

        if(this.onTransitionCreate !== null)
        {
            this.onTransitionCreate.dispatch({ media: this._transition });
        }
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
 * Load just emmit a load request. The story will trigger the loadStart.
 * @method FORGE.Scene#load
 */
FORGE.Scene.prototype.load = function()
{
    this.log("load");

    if (this._viewer.story.scene === this)
    {
        return;
    }

    if (this._onLoadRequest !== null)
    {
        this._onLoadRequest.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onLoadRequest, "ActionEventDispatcher") === true)
    {
        this._events.onLoadRequest.dispatch();
    }
};

/**
 * Create the media and start to load.
 * @method FORGE.Scene#loadStart
 * @param {number} time - The time of the media (if video)
 */
FORGE.Scene.prototype.loadStart = function(time)
{
    if(typeof time === "number" && isNaN(time) === false && typeof this._config.media !== "undefined")
    {
        if(typeof this._config.media.options === "undefined")
        {
            this._config.media.options = {};
        }

        this._config.media.options.startTime = time;
    }

    this._createMedia(this._config.media);
    this._createTransition(this._config.transition);
    this._createViewports(this._config);

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
    this.log("unload");

    if (this._onUnloadStart !== null)
    {
        this._onUnloadStart.dispatch();
    }

    if(FORGE.Utils.isTypeOf(this._events.onUnloadStart, "ActionEventDispatcher") === true)
    {
        this._events.onUnloadStart.dispatch();
    }

    this._transition.destroy();
    this._transition = null;

    this._media.destroy();
    this._media = null;

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
 * Know if the scene has sound source?
 * @method FORGE.Scene#hasSoundSource
 * @return {boolean} Returns true if the scene has a sound source, false if not.
 */
FORGE.Scene.prototype.hasSoundSource = function()
{
    if (typeof this._config.sound !== "undefined" && typeof this._config.sound.source !== "undefined" && ((typeof this._config.sound.source.url !== "undefined" && this._config.sound.source.url !== "") || (typeof this._config.sound.source.target !== "undefined" && this._config.sound.source.target !== "")))
    {
        return true;
    }
    return false;
};

/**
 * Know if the scene has sound target as source?
 * @method FORGE.Scene#hasSoundTarget
 * @param {string} uid - The target source UID to verify.
 * @return {boolean} Returns true if the scene has a sound source target, false if not.
 */
FORGE.Scene.prototype.hasSoundTarget = function(uid)
{
    if (typeof this._config.sound !== "undefined" && typeof this._config.sound.source !== "undefined" && typeof this._config.sound.source.target !== "undefined" && this._config.sound.source.target !== "" && this._config.sound.source.target === uid)
    {
        return true;
    }

    return false;
};

/**
 * Know if an ambisonic sound is attached to the scene?
 * @method FORGE.Scene#isAmbisonic
 * @return {boolean} Returns true if the scene has an ambisonic sound source, false if not.
 */
FORGE.Scene.prototype.isAmbisonic = function()
{
    //@todo real check of the UID target object rather then the isAmbisonic method of the FORGE.Scene
    if (this.hasSoundSource() === true && this._config.sound.type === FORGE.SoundType.AMBISONIC)
    {
        return true;
    }

    return false;
};

/**
 * Render routine.
 * @method FORGE.Scene#render
 * @private
 */
FORGE.Scene.prototype.render = function(webGLRenderer)
{
    this._viewportManager.render(webGLRenderer, this._renderTarget);
};

/**
 * Destroy method
 * @method FORGE.Scene#destroy
 */
FORGE.Scene.prototype.destroy = function()
{
    this._viewer = null;

    this._name.destroy();
    this._name = null;

    this._slug.destroy();
    this._slug = null;

    this._description.destroy();
    this._description = null;

    this._viewportManager.destroy();
    this._viewportManager = null;

    if (this._media !== null)
    {
        this._media.destroy();
        this._media = null;
    }

    if (this._transition !== null)
    {
        this._transition.destroy();
        this._transition = null;
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
* @type {SceneConfig}
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
 * Camera property.
 * Each scene viewport has a camera, and the scene knows what is the master
 * @name FORGE.Scene#camera
 * @readonly
 * @type {FORGE.Camera}
 */
Object.defineProperty(FORGE.Scene.prototype, "camera",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._getMasterCamera();
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
        return this._name.value;
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
        return this._slug.value;
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
        return this._description.value;
    }
});

/**
 * Get the sync array.
 * @name FORGE.Scene#sync
 * @readonly
 * @type {Array<string>}
 */
Object.defineProperty(FORGE.Scene.prototype, "sync",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._sync;
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
 * Get the scene media.
 * @name  FORGE.Scene#media
 * @readonly
 * @type {FORGE.Media}
 */
Object.defineProperty(FORGE.Scene.prototype, "media",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._media;
    }
});

/**
 * Get the scene render target.
 * @name  FORGE.Scene#renderTarget
 * @readonly
 * @type {THREE.RenderTarget}
 */
Object.defineProperty(FORGE.Scene.prototype, "renderTarget",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._renderTarget;
    }
});

/**
 * Get the scene transition.
 * @name  FORGE.Scene#transition
 * @readonly
 * @type {FORGE.Media}
 */
Object.defineProperty(FORGE.Scene.prototype, "transition",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return this._transition;
    }
});

/**
 * Get the background of the scene.
 * @name  FORGE.Scene#background
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Scene.prototype, "background",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        return (typeof this._config.background !== "undefined") ? this._config.background : this._viewer.config.background;
    }
});

/**
 * Get the onLoadRequest {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onLoadRequest
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onLoadRequest",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onLoadRequest === null)
        {
            this._onLoadRequest = new FORGE.EventDispatcher(this);
        }

        return this._onLoadRequest;
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

/**
 * Get the onMediaCreate {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onMediaCreate
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onMediaCreate",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onMediaCreate === null)
        {
            this._onMediaCreate = new FORGE.EventDispatcher(this);
        }

        return this._onMediaCreate;
    }
});

/**
 * Get the onTransitionCreate {@link FORGE.EventDispatcher}.
 * @name  FORGE.Scene#onTransitionCreate
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Scene.prototype, "onTransitionCreate",
{
    /** @this {FORGE.Scene} */
    get: function()
    {
        if (this._onTransitionCreate === null)
        {
            this._onTransitionCreate = new FORGE.EventDispatcher(this);
        }

        return this._onTransitionCreate;
    }
});
