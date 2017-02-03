/**
 * Manage Tags inside FORGE.
 * Tags is singleton, so if you have multiple instances in the same page you MUST avoid Tags conflict.
 * @constructor
 * @extends {FORGE.BaseObject}
 */
FORGE.Tags = (function(c)
{
    var Tmp = c();
    Tmp.prototype = Object.create(FORGE.BaseObject.prototype);
    Tmp.prototype.constructor = Tmp;

    /**
     * Register a tagged object.
     * @method FORGE.Tags.register
     * @param  {Object} object - The object you want to register into the tag index.
     */
    Tmp.prototype.register = function(object)
    {
        if(typeof object === "object" && typeof object.uid === "string" && Array.isArray(object.tags))
        {
            var uid = object.uid;
            var tags = object.tags;
            var tag;

            if(FORGE.UID.exists(uid) === true)
            {
                //this._objects[uid] = object;
                for(var i = 0, ii = tags.length; i < ii; i++)
                {
                    tag = tags[i];

                    //Skip if a tag is not a string, this is an error!
                    if(typeof tag !== "string")
                    {
                        this.warn("Tags: An object has a tag that isn't a string!");
                        continue;
                    }

                    //If the tag is unknow, add an entry to the tags array
                    if(typeof this._allTags[tag] === "undefined")
                    {
                        this._allTags[tag] = [];

                        if(this._onRegister !== null)
                        {
                            this._onRegister.dispatch({"tag": tag});
                        }
                    }

                    if(this._allTags[tag].indexOf(uid) === -1)
                    {
                        this._allTags[tag].push(uid);
                    }
                }
            }
            else
            {
                this.warn("Tags: The object you want to register in tags is not known by UID!");
                this.warn(object);
            }
        }
        else
        {
            this.warn("Tags: No uid or no tags on the object you try to register!");
            this.warn(object);
        }
    };

    /**
     * Get uids associated to a tag or to an array of tags.<br>
     * You can filter the className of objets to get.
     * @method FORGE.Tags.getUids
     * @param  {string|Array} value - The uid or array of uids of object(s) you want to get.
     * @param  {string} className  - Filter you result by className of objects.
     * @return {Array<string>}  Returns an array of uids that matches the request.
     */
    Tmp.prototype.getUids = function(value, className)
    {
        var uids = [];

        if(typeof value === "string")
        {
            uids = this._allTags[value];
        }
        else if(Array.isArray(value))
        {
            var tag;
            for(var i = 0, ii = value.length; i < ii; i++)
            {
                tag = value[i];
                if(this.exists(tag) === true)
                {
                    uids.concat(this.get[tag]);
                }
            }
        }

        if(typeof className === "string")
        {
            uids = FORGE.UID.filterType(uids, className);
        }

        return uids;
    };

    /**
     * Get objects associated to a tag or to an array of tags.<br>
     * You can filter the className of objets to get.
     * @method FORGE.Tags.get
     * @param  {(string|Array)} value - The uid or array of uids of object(s) you want to get.
     * @param {string} className - Filter you result by className of objects.
     * @return {(Object|Array|undefined)} Returns an object or an array of objects that matches the request.
     */
    Tmp.prototype.get = function(value, className)
    {
        if(typeof value === "string")
        {
            return FORGE.UID.get(this._allTags[value], className);
        }
        else if(Array.isArray(value))
        {
            var uids = [];
            var tag;
            for(var i = 0, ii = value.length; i < ii; i++)
            {
                tag = value[i];
                if(this.exists(tag) === true)
                {
                    uids.concat(this.get[tag]);
                }
            }

            return FORGE.UID.get(uids, className);
        }

        return undefined;
    };

    /**
     * Tell if this tag have at least an object of a specific className.
     * @method  FORGE.Tags.hasTypeOf
     * @param  {string}  tag - The tag you want to check if it reference an onbject of specified className.
     * @param {string} className - The className you want to check.
     * @return {boolean} Returns true if the tag have at least an object of the asked className.
     */
    Tmp.prototype.hasTypeOf = function(tag, className)
    {
        if(this.exists(tag) === true)
        {
            var uids = this._allTags[tag];

            for (var i = 0, ii = this._allTags.length; i < ii; i++)
            {
                if(FORGE.UID.isTypeOf(uids[i], className) === true)
                {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Does a tag exists ?
     * @method FORGE.Tags.exists
     * @param  {string} tag - The tag you want to check.
     * @return {boolean} Returns true if uid is already registered, false if not.
     */
    Tmp.prototype.exists = function(tag)
    {
        return (typeof this._allTags[tag] !== "undefined" && this._allTags[tag] !== null);
    };

    /**
     * Get the list of all existing tags.
     * @name  FORGE.Tags#list
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "list",
    {
        get: function()
        {
            return Object.keys(this._allTags);
        }
    });

    /**
     * Get the on add event dispatcher.
     * @name  FORGE.Tags#onRegister
     * @readonly
     */
    Object.defineProperty(Tmp.prototype, "onRegister",
    {
        get: function()
        {
            if(this._onRegister === null)
            {
                this._onRegister = new FORGE.EventDispatcher(this);
            }

            return this._onRegister;
        }
    });

    return new Tmp();
})(function()
{
    return function()
    {
        /**
         * The object that reference all tags objects couples.
         * @name FORGE.Tags#_allTags
         * @type {Object}
         * @private
         */
        this._allTags = {};

        /**
         * Event dispatcher for add tag event.
         * @name  FORGE.Tags#_onRegister
         * @type {FORGE.EventDispatcher}
         * @private
         */
        this._onRegister = null;

        FORGE.BaseObject.call(this, "Tags");
    };
});