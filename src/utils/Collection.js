
/**
 * Describe a collection of elements.
 * @constructor FORGE.Collection
 */
FORGE.Collection = function() 
{
    /**
     * The elements list.
     * @name FORGE.Collection#_elements
     * @type {Array<*>}
     * @private
     */
    this._elements = [];
};

FORGE.Collection.prototype.constructor = FORGE.Collection;

/**
 * Add an element of the list.
 * @method FORGE.Collection.add
 * @param {*} item - The item to add.
 * @return {number} The size of the elements list.
 */
FORGE.Collection.prototype.add = function(item)
{
    this._elements.push(item);
    return this._elements.length;
};

/**
 * Remove an element of the list.
 * @method FORGE.Collection.remove
 * @param {*} item - The item to remove.
 */
FORGE.Collection.prototype.remove = function(item) 
{
    for(var i = 0, ii = this._elements.length; i < ii; i++)
    {
        if(this._elements[i] === item)
        {
            this._elements.splice(i, 1);
        }
    }
};

/**
 * Get an element of the list.
 * @method FORGE.Collection.get
 * @param {number} index - The element index to search for.
 * @return {*} Returns an element.
 */
FORGE.Collection.prototype.get = function(index)
{
    return this._elements[index];
};

/**
 * Returns the elements list array.
 * @method FORGE.Collection.toArray
 * @return {Array} Returns the elements list.
 */
FORGE.Collection.prototype.toArray = function()
{
    return this._elements;
};

/**
 * Get the size of the elements list.
 * @name FORGE.Collection.size
 * @type {number}
 * @readonly
 */
Object.defineProperty(FORGE.Collection.prototype, "size", 
{
    /** @this {FORGE.Collection} */
    get: function()
    {
        return this._elements.length;
    }
});
