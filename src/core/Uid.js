/**
 * Manage UIDs inside FORGE.<br>
 * UID is singleton, so if you have multiple instances in the same page you MUST avoid UID conflict.
 * @constructor
 * @extends {FORGE.BaseObject}
 */
FORGE.UID = (function(c)
{
    var Tmp = c();
    Tmp.prototype = Object.create(FORGE.BaseObject.prototype);
    Tmp.prototype.constructor = Tmp;

    /**
     * Generate a uid.
     * @method FORGE.UID.generate
     * @return {string} Return a UID string.
     */
    Tmp.prototype.generate = function()
    {
        // see http://stackoverflow.com/a/2117523/1233787
        var uid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c)
        {
            var h = Math.random() * 16 | 0;
            h = c == "x" ? h : (h & 0x3 | 0x8);
            return h.toString(16);
        });

        if (FORGE.UID.exists(uid) === false)
        {
            return uid;
        }
        else
        {
            return FORGE.UID.generate();
        }
    };

    /**
     * Validate recursively a uid.
     * @method FORGE.UID.validate
     * @param  {Object} object - The object you want to validate into the index.
     * @return {boolean} Returns the validate status.
     */
    Tmp.prototype.validate = function(object)
    {
        var uids = [];

        var validateRecursive = function(object)
        {
            var uid;

            for (var i in object)
            {
                if (i === "uid")
                {
                    uid = object[i];

                    if (typeof uid === "string")
                    {
                        if (FORGE.UID.exists(uid))
                        {
                            throw "UID configuration not valid, uid " + uid + " already have an object binded to!";
                        }
                        else if (uids.indexOf(uid) !== -1)
                        {
                            throw "UID configuration not valid, uid " + uid + " is in double in config file!";
                        }
                        else
                        {
                            uids.push(object[i]);
                        }
                    }
                    else
                    {
                        throw "Found a uid in configuration that is not a string!";
                    }
                }
                else if (typeof(object[i]) === "object")
                {
                    validateRecursive(object[i]);
                }
            }

            return true;
        };

        return validateRecursive(object);
    };


    /**
     * Register an object into the uid index.
     * @method FORGE.UID.register
     * @param  {Object} object - The object you want to register into the index.
     * @return {boolean} Return true if the object is added to UID, false if not.
     */
    Tmp.prototype.register = function(object)
    {
        if (typeof object === "object" && typeof object.uid === "string")
        {
            var uid = object.uid;

            if (FORGE.UID.exists(uid) === false)
            {
                this._objects[uid] = object;
                return true;
            }
            else
            {
                this.warn("The uid you want to register already exists!");
                this.warn(object);
            }
        }
        else
        {
            this.warn("No uid on the object you try to register!");
            this.warn(object);
        }

        return false;
    };

    /**
     * Unregister an object from the uid index.
     * @method FORGE.UID.unregister
     * @param  {Object} object - The object you want to unregister from the index.
     */
    Tmp.prototype.unregister = function(object)
    {
        if (typeof object === "object" && typeof object.uid === "string")
        {
            var uid = object.uid;
            this._objects[uid] = null;
            delete this._objects[uid];
            return;
        }

        this.warn("No uid on the object you try to unregister!");
    };

    /**
     * Get all uids or uids of a specific className.
     * @method  FORGE.UID.getuids
     * @param  {string} className - Type of uids you want to get, if undefined this will return all the uids.
     * @return {Array<string>} Returns an array of uids.
     */
    Tmp.prototype.getUids = function(className)
    {
        if (typeof className === "undefined" || className === null)
        {
            return Object.keys(this._objects);
        }
        else
        {
            return FORGE.UID.filterType(Object.keys(this._objects), className);
        }
    };

    /**
     * Filter an array of uids and return only uids of a specific className.
     * @method FORGE.UID.filterType
     * @param  {Array<string>} uids - Array of uids to filter by className.
     * @param  {string} className - Class name of object to filter.
     * @return {Array<string>} Returns an array of uids filtered by className.
     */
    Tmp.prototype.filterType = function(uids, className)
    {
        var filter = function(uid)
        {
            if (FORGE.UID.isTypeOf(uid, className))
            {
                return true;
            }

            return false;
        };

        return uids.filter(filter);
    };

    /**
     * Get a registered object from its uid.
     * @method FORGE.UID.get
     * @param  {string|Array} value - The uid or array of uids of object(s) you want to get.
     * @param  {string=} className - The className of the object you want
     * @return {*} Returns the object(s) related to the filters.
     */
    Tmp.prototype.get = function(value, className)
    {
        //If no value is passed, the whole uids array is used as values
        if (typeof value === "undefined" || value === null)
        {
            //If no value and no className, return all the objects.
            if (typeof className !== "string")
            {
                return this._objects;
            }

            value = Object.keys(this._objects);
        }

        if (typeof value === "string")
        {
            return this._objects[value];
        }
        else if (Array.isArray(value))
        {
            if (typeof className === "string")
            {
                value = FORGE.UID.filterType(value, className);
            }

            var result = [];
            var uid;
            for (var i = 0, ii = value.length; i < ii; i++)
            {
                uid = value[i];
                if (FORGE.UID.exists(uid) === true)
                {
                    result.push(this._objects[uid]);
                }
            }

            return result;
        }

        return undefined;
    };

    /**
     * Tell if this uid matches an object of a specific className.
     * @method  FORGE.UID.isTypeOf
     * @param {string}  uid - uid of the object you want to check the className of.
     * @param {string} className - The className you want to check.
     * @return {boolean} Returns true if the object is of the asked className.
     */
    Tmp.prototype.isTypeOf = function(uid, className)
    {
        var object = FORGE.UID.get(uid);
        return FORGE.Utils.isTypeOf(object, className);
    };

    /**
     * Does a uid exists?
     * @method FORGE.UID.exists
     * @param  {string} uid - The uid you want to check.
     * @return {boolean} Return true if uid is already registered, false if not.
     */
    Tmp.prototype.exists = function(uid)
    {
        return (typeof this._objects[uid] !== "undefined" && this._objects[uid] !== null);
    };

    return new Tmp();

})(function()
{
    return function()
    {
        /**
         * The object that reference all uids objects couples.
         * @name FORGE.UID#_objects
         * @type {Object}
         * @private
         */
        this._objects = {};

        FORGE.BaseObject.call(this, "UID");
    };
});
