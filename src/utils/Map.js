
/**
 * Describe a Map.
 * @constructor FORGE.Map
 *
 * @todo be carreful with 'key' which can be a keyword as "length" !
 */
FORGE.Map = function()
{
    /**
     * The number of elements into the Map.
     * @name FORGE.Map#_count
     * @type {number}
     * @private
     */
    this._count = 0;

    /**
     * The map object.
     * @name FORGE.Map#_map
     * @type {Object}
     * @private
     */
    this._map = {};
};

FORGE.Map.prototype.constructor = FORGE.Map;

/**
 * Set an element into the Map.
 * @method FORGE.Map.set
 * @param {string} key - The key to assign.
 * @param {?} item - The item to add.
 * @return {number|undefined} The size of the Map.
 */
FORGE.Map.prototype.set = function(key, item)
{
    if (typeof key === "undefined")
    {
        return undefined;
    }

    if (this._map[key] === undefined)
    {
        this._count++;
    }

    this._map[key] = item;

    return this._count;
};

/**
 * Delete an element into the Map.
 * @method FORGE.Map.delete
 * @param {string} key - The key to search for.
 * @return {number|undefined} The size of the Map.
 */
FORGE.Map.prototype.delete = function(key)
{
    if (typeof key === "undefined" || this._map[key] === undefined)
    {
        return undefined;
    }

    delete this._map[key];
    return --this._count;
};

/**
 * Get an element of the Map.
 * @method FORGE.Map.get
 * @param {string} key - The key to search for.
 * @return {?} The item linked to the key.
 */
FORGE.Map.prototype.get = function(key)
{
    return this._map[key];
};

/**
 * The list of the keys.
 * @method FORGE.Map.keys
 * @return {Array<String>} The list of all the Map keys.
 */
FORGE.Map.prototype.keys = function()
{
    var keys = new FORGE.Collection();

    for (var key in this._map)
    {
        keys.add(key);
    }

    return keys.toArray();
};

/**
 * The list of the values.
 * @method FORGE.Map.values
 * @return {Array<?>} The list of all the Map values.
 */
FORGE.Map.prototype.values = function()
{
    var values = new FORGE.Collection();

    for (var key in this._map)
    {
        values.add(this._map[key]);
    }

    return values.toArray();
};

/**
 * The whole content of the Map.
 * @method FORGE.Map.entries
 * @return {Array} The complete key-value list of the Map.
 */
FORGE.Map.prototype.entries = function()
{
    var entries = new FORGE.Collection();

    for (var key in this._map)
    {
        var entry = [];
        entry.push(key);
        entry.push(this._map[key]);
        entries.add(entry);
    }

    return entries.toArray();
};

/**
 * Clear the Map object.
 * @method FORGE.Map.clear
 */
FORGE.Map.prototype.clear = function()
{
    for (var key in this._map)
    {
        this.delete(key);
    }
};

/**
 * Has an element into the Map?
 * @method FORGE.Map.has
 * @param {string} key - The key to search for.
 * @return {boolean} Returns true if an item corresponding to the key is found, if not, returns false.
 */
FORGE.Map.prototype.has = function(key)
{
    return (this._count > 0 && this._map[key] !== undefined);
};

/**
 * Get the size of the Map.
 * @name FORGE.Map.size
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Map.prototype, "size",
{
    /** @this {FORGE.Map} */
    get: function()
    {
        return this._count;
    }
});
