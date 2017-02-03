/**
 * A FORGE.Group is an object that represents a group of {@link FORGE.Scene} objects.
 *
 * @constructor FORGE.Group
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {GroupConfig} config - The group config object.
 * @extends {FORGE.BaseObject}
 */
FORGE.Group = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Group#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config object.
     * @name FORGE.Group#_config
     * @type {GroupConfig}
     * @private
     */
    this._config = config;

    /**
     * The internationalizable name of the group.
     * @name FORGE.Group#_name
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._name = null;

    /**
     * The color associated to this group (hexa code like #ffffff).<br>
     * Default value is the white code #ffffff.
     * @name  FORGE.Group#_color
     * @type {string}
     * @private
     */
    this._color = "#ffffff";

    /**
     * The color alpha associated to this group is a number between 0 and 1.<br>
     * Default value is 1.
     * @name  FORGE.Group#_alpha
     * @type {number}
     * @private
     */
    this._alpha = 1;

    /**
     * The internationalizable slug name of the group.
     * @name FORGE.Group#_slug
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._slug = null;

    /**
     * The internationalizable description of the group.
     * @name FORGE.Group#_description
     * @type {?FORGE.LocaleString}
     * @private
     */
    this._description = null;

    /**
     * Array of children that can be {@link FORGE.Scene} or {@link FORGE.Group}.
     * @name FORGE.Group#children
     * @type {Array<string>}
     * @private
     */
    this._children = null;

    /**
     * The default child uid to load.
     * @name  FORGE.group#_default
     * @type {string}
     * @private
     */
    this._default = "";

    /**
     * Parents of this group, these are {@link FORGE.Group}.
     * @name  FORGE.Group#parents
     * @type {Array<FORGE.Group>}
     * @private
     */
    this._parents = null;

    FORGE.BaseObject.call(this, "Group");

    this._boot();

};

FORGE.Group.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Group.prototype.constructor = FORGE.Group;

/**
 * Boot sequence.
 * @method FORGE.Group#_boot
 * @private
 */
FORGE.Group.prototype._boot = function()
{
    this.log("FORGE.Group._boot();");

    this._uid = this._config.uid;
    this._tags = this._config.tags;
    this._register();

    this._parents = [];
    this._children = [];

    this._name = new FORGE.LocaleString(this._viewer, this._config.name);
    this._slug = new FORGE.LocaleString(this._viewer, this._config.slug);
    this._description = new FORGE.LocaleString(this._viewer, this._config.description);

    if (typeof this._config.color === "string")
    {
        this._color = this._config.color;
    }

    if (typeof this._config.alpha === "number")
    {
        this._alpha = this._config.alpha;
    }

    this._parseChildren(this._config);
};

/**
 * Parse scenes in config.
 * @method FORGE.Group#_parseChildren
 * @private
 * @param  {GroupConfig} config - The object that describes the scenes config.
 */
FORGE.Group.prototype._parseChildren = function(config)
{

    if (typeof config.children !== "undefined" && FORGE.Utils.isArrayOf(config.children, "string") === true)
    {
        this._children = config.children;
    }
    else
    {
        this.warn("A group has no children in its configuration, or configuration is not valid!");
    }

    //Parse the default child of the group
    if (typeof config.default === "string")
    {
        if (this._children.indexOf(config.default) !== -1)
        {
            this._default = config.default;
        }
        else
        {
            this.warn("A group has a default child that is not in its children array!");
        }
    }
};

/**
 * Load the group with a specific scene, by default the scene is scene index 0.
 * @method FORGE.Group#load
 * @param {number|string|FORGE.Scene|FORGE.Group=} value - The numeric index of the child or the uid of the child you want to load.<br>
 * If no value passed in arguments, the group will load its default child if it is set.<br>
 * If no default child set, it will load its first child no matter the type of this child
 */
FORGE.Group.prototype.load = function(value)
{
    this.log("FORGE.Group.load();");

    if (this._children === null || this._children.length === 0)
    {
        throw "Group.load() : can't load a group that have no children";
    }

    var uid = "";

    // If no value passed in arguments, the group will load its default child if it is set.
    if (typeof value === "undefined" || value === null)
    {
        if (typeof this._default === "string" && this._default !== "")
        {
            uid = this._default;
        }
        else
        {
            uid = this._children[0];
        }
    }
    else if (typeof value === "number" && value >= 0 && value < this._children.length)
    {
        uid = this._children[value];
    }
    else if (typeof value === "string")
    {
        uid = value;
    }
    else if (typeof value === "object" && this.hasChild(value) === true)
    {
        uid = value.uid;
    }

    if (this._children.indexOf(uid) === -1)
    {
        throw "Group.load() : uid \"" + uid + "\" is not in children of the group!";
    }

    if (FORGE.UID.isTypeOf(uid, "Scene") === true || FORGE.UID.isTypeOf(uid, "Group") === true)
    {
        var child = FORGE.UID.get(uid);
        child.load();
    }
    else
    {
        throw "Impossible to load group child with uid " + uid + ", it seems to be neither a scene or a group!";
    }

};

/**
 * Know if a {@link FORGE.Scene}, a {@link FORGE.Group} or a uid is part of this group?
 * @method FORGE.Group#hasScene
 * @param {(FORGE.Scene|FORGE.Group|string)} value - Either the {@link FORGE.Scene} or a {@link FORGE.Group} or a uid string.
 * @return {boolean} Returns true if the child is part of this group, false if not.
 */
FORGE.Group.prototype.hasChild = function(value)
{
    if (typeof value === "string")
    {
        return this._children.indexOf(value) !== -1;
    }
    else if (FORGE.Utils.isTypeOf(value, "Scene") === true || FORGE.Utils.isTypeOf(value, "Group") === true)
    {
        return this.hasChild(value.uid);
    }

    return false;
};


/**
 * Know if a {@link FORGE.Scene} is part of this group?
 * @method FORGE.Group#hasScene
 * @param {(FORGE.Scene|string)} value - Either the {@link FORGE.Scene} or a uid string.
 * @return {boolean} Returns true if the scene is part of this group, false if not.
 */
FORGE.Group.prototype.hasScene = function(value)
{
    if (typeof value === "string" && FORGE.UID.isTypeOf(value, "Scene"))
    {
        return this._children.indexOf(value) !== -1;
    }
    else if (FORGE.Utils.isTypeOf(value, "Scene") === true)
    {
        return this.hasScene(value.uid);
    }

    return false;
};

/**
 * Know if a {@link FORGE.Group} is part of this group?
 * @method FORGE.Group#hasGroup
 * @param {(FORGE.Group|string)} value - Either the {@link FORGE.Group} or a uid string.
 * @return {boolean} Returns true if the group is part of this group, false if not.
 */
FORGE.Group.prototype.hasGroup = function(value)
{
    if (typeof value === "string" && FORGE.UID.isTypeOf(value, "Group"))
    {
        return this._children.indexOf(value) !== -1;
    }
    else if (FORGE.Utils.isTypeOf(value, "Group") === true)
    {
        return this.hasGroup(value.uid);
    }

    return false;
};

/**
 * Know if this group have any children.
 * @method FORGE.Group#hasChildren
 * @return {boolean} Returns true if this group have at least a children, false if not.
 */
FORGE.Group.prototype.hasChildren = function()
{
    return this._children.length !== 0;
};

/**
 * Know if this group have any object of a specified className.
 * @method FORGE.Group#hasTypeOfChild
 * @param {string} className - the className of the object you want to know if this group has in its children array.
 * @return {boolean} Returns true if this group have at least an object of the requested className in its children, false if not.
 */
FORGE.Group.prototype.hasTypeOfChild = function(className)
{
    var uid;
    for (var i = 0, ii = this._children.length; i < ii; i++)
    {
        uid = this._children[i];
        if (FORGE.UID.isTypeOf(uid, className))
        {
            return true;
        }
    }

    return false;
};

/**
 * Know if this group have any {@link FORGE.Scene}.
 * @method FORGE.Group#hasScenes
 * @return {boolean} Returns true if this group have at least a {@link FORGE.Scene}, false if not.
 */
FORGE.Group.prototype.hasScenes = function()
{
    return this.hasTypeOfChild("Scene");
};

/**
 * Know if this group have any {@link FORGE.Group}.
 * @method FORGE.Group#hasGroups
 * @return {boolean} Returns true if this group have at least a {@link FORGE.Group}, false if not.
 */
FORGE.Group.prototype.hasGroups = function()
{
    return this.hasTypeOfChild("Group");
};

/**
 * Get children uids of a specified className (or not).
 * @method FORGE.Group#getChildrenUids
 * @param {string=} className - the className of the object uids you want to get.
 * @return {Array} Returns array of children uids of the specified className.
 */
FORGE.Group.prototype.getChildrenUids = function(className)
{
    //If no className specified, return the complete array of children uids.
    if (typeof className !== "string")
    {
        return this._children;
    }

    var children = [];
    //var child;

    for (var i = 0, ii = this._children.length; i < ii; i++)
    {
        /*
        child = FORGE.UID.get(this._children[i]);

        if(typeof child === "undefined" || child === null)
        {
            continue;
        }

        if(child.className === className)
        {
            children.push(this._children[i]);
        }*/

        if (FORGE.UID.isTypeOf(this._children[i], className))
        {
            children.push(this._children[i]);
        }
    }

    return children;
};

/**
 * Get children objects of a specified className.<br>
 * If you do not specify className this method will return all the children objects.
 * @method FORGE.Group#getChildren
 * @param {string=} className - the className of the object you want to get.
 * @return {Array} Returns array of children objects of the specified className.
 */
FORGE.Group.prototype.getChildren = function(className)
{
    var uids = this.getChildrenUids(className);
    return FORGE.UID.get(uids);
};

/**
 * Load the next scene of this group.<br>
 * If this group has no scene, you can't use this method.<br>
 * If the current scene of the story is not one of this group, the group will load either the default child or its first found scene.<br>
 * If the current scene is part of this group, nextScene will loop forward through its scenes.
 * @method FORGE.Group#nextScene
 */
FORGE.Group.prototype.nextScene = function()
{
    if (this.hasScenes() === false)
    {
        this.warn("Can't do Group.nextScene() on this group that have no scenes!");
        return;
    }

    var scenesUids = this.scenesUids;
    var index = scenesUids.indexOf(this._viewer.story.sceneUid);
    var uid; //Default uid to load is the first scene.

    if (index === -1)
    {
        if (FORGE.UID.isTypeOf(this._default, "Scene"))
        {
            uid = this._default;
        }
        else
        {
            uid = scenesUids[0];
        }
    }

    if (index + 1 < scenesUids.length)
    {
        uid = scenesUids[index + 1];
    }
    else if (index !== -1)
    {
        uid = scenesUids[0];
    }

    this.load(uid);
};

/**
 * Load the previous scene of this group.<br>
 * If this group has no scene, you can't use this method.<br>
 * If the current scene of the story is not one of this group, the group will load either the default child or its first found scene.<br>
 * If the current scene is part of this group, previousScene will loop backward through its scenes.
 * @method FORGE.Group#previousScene
 */
FORGE.Group.prototype.previousScene = function()
{
    if (this.hasScenes() === false)
    {
        this.warn("Can't do Group.previousScene() on this group that have no scenes!");
        return;
    }

    var scenesUids = this.scenesUids;
    var index = scenesUids.indexOf(this._viewer.story.sceneUid);
    var uid; //Default uid to load is the first scene.

    if (index === -1)
    {
        if (FORGE.UID.isTypeOf(this._default, "Scene"))
        {
            uid = this._default;
        }
        else
        {
            uid = scenesUids[0];
        }
    }

    if (index - 1 >= 0)
    {
        uid = scenesUids[index - 1];
    }
    else if (index !== -1)
    {
        uid = scenesUids[scenesUids.length - 1];
    }

    this.load(uid);
};

/**
 * Destroy method.
 * @method FORGE.Group#destroy
 */
FORGE.Group.prototype.destroy = function()
{
    this._viewer = null;

    this._children = null;

    this._name.destroy();
    this._name = null;

    this._slug.destroy();
    this._slug = null;

    this._description.destroy();
    this._description = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the group config object.
 * @name FORGE.Group#config
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Group.prototype, "config",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._config;
    }
});

/**
 * Get the count of how many times this group has been viewed.
 * @name FORGE.Group#viewCount
 * @readonly
 * @type {number}
 */
// Object.defineProperty(FORGE.Group.prototype, "viewCount",
// {
//     /** @this {FORGE.Group} */
//     get: function()
//     {
//         var count = 0;

//         for(var i = 0, ii = this._scenes.length; i < ii; i++)
//         {
//             count += this._scenes[i].viewCount;
//         }
//         return count;
//     }
// });

/**
 * Know if this group has been viewed at least one time.
 * @name FORGE.Group#viewed
 * @readonly
 * @type {boolean}
 */
// Object.defineProperty(FORGE.Group.prototype, "viewed",
// {
//     /** @this {FORGE.Group} */
//     get: function()
//     {
//         return this.viewCount !== 0;
//     }
// });


/**
 * Get the name of this group.
 * @name FORGE.Group#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Group.prototype, "name",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._name.value;
    }
});

/**
 * Get the color associated to this group.
 * @name FORGE.Group#color
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Group.prototype, "color",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._color;
    }
});

/**
 * Get the alpha associated to this group.
 * @name FORGE.Group#alpha
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Group.prototype, "alpha",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._alpha;
    }
});

/**
 * Get the slug name of this group.
 * @name FORGE.Group#slug
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Group.prototype, "slug",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._slug.value;
    }
});

/**
 * Get the description of this group.
 * @name FORGE.Group#description
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Group.prototype, "description",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this._description.value;
    }
});

/**
 * Get the Array of children uids that compose this group.
 * @name FORGE.Group#childrenUids
 * @readonly
 * @type {?Array<string>}
 */
Object.defineProperty(FORGE.Group.prototype, "childrenUids",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildrenUids();
    }
});

/**
 * Get the Array of children objects that compose this group.
 * @name FORGE.Group#children
 * @readonly
 * @type {?Array<Object>}
 */
Object.defineProperty(FORGE.Group.prototype, "children",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildren();
    }
});

/**
 * Get the Array of {@link FORGE.Scene} uids that compose this group.
 * @name FORGE.Group#scenesUids
 * @readonly
 * @type {?Array<string>}
 */
Object.defineProperty(FORGE.Group.prototype, "scenesUids",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildrenUids("Scene");
    }
});

/**
 * Get the Array of {@link FORGE.Scene} objects that compose this group.
 * @name FORGE.Group#scenes
 * @readonly
 * @type {?Array<FORGE.Scene>}
 */
Object.defineProperty(FORGE.Group.prototype, "scenes",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildren("Scene");
    }
});

/**
 * Get the Array of {@link FORGE.Group} uids that compose this group.
 * @name FORGE.Group#groupsUids
 * @readonly
 * @type {?Array<string>}
 */
Object.defineProperty(FORGE.Group.prototype, "groupsUids",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildrenUids("Group");
    }
});

/**
 * Get the Array of {@link FORGE.Group} uids that compose this group.
 * @name FORGE.Group#groups
 * @readonly
 * @type {?Array<FORGE.Group>}
 */
Object.defineProperty(FORGE.Group.prototype, "groups",
{
    /** @this {FORGE.Group} */
    get: function()
    {
        return this.getChildren("Group");
    }
});