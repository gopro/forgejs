/**
 * Global utilities.
 * @namespace  FORGE.Utils
 * @type {Object}
 */
FORGE.Utils = {};

/**
 * Convert a string value into a size object.
 * @method FORGE.Utils.parseSizeString
 * @param {string} value - The string value to convert.
 * @return {Object} A size object with value and unit.
 */
FORGE.Utils.parseSizeString = function(value)
{
    var result =
    {
        value: null,
        unit: null
    };

    if (typeof value === "string")
    {
        var size = parseInt(value, 10);
        if (isNaN(size) === false)
        {
            result.value = size;
        }

        if (value.indexOf("%") > -1)
        {
            result.unit = "%";
        }
        else if (value.indexOf("px") > -1)
        {
            result.unit = "px";
        }
    }

    return result;
};

/**
 * TODO. Use for config extend / override.
 * @method FORGE.Utils.extendSimpleObject
 * @param  {Object}   from
 * @param  {Object}   to
 * @param  {boolean=} recursive
 * @return {Object}
 */
FORGE.Utils.extendSimpleObject = function(from, to, recursive)
{
    var result = {};

    from = (typeof from !== "undefined") ? from : {};
    to = (typeof to !== "undefined") ? to : {};

    for (var f in from)
    {
        if (from.hasOwnProperty(f)) //to guarantee that keys are on the object instance itself
        {
            result[f] = from[f];
        }
    }

    for (var t in to)
    {
        if (to.hasOwnProperty(t)) //to guarantee that keys are on the object instance itself
        {
            if (recursive !== false && from !== null && to[t] !== null && typeof to[t] !== "undefined" && to[t].constructor === Object)
            {
                result[t] = FORGE.Utils.extendSimpleObject(from[t], to[t], true);
            }
            else
            {
                result[t] = to[t];
            }
        }
    }

    return result;
};

/**
 * Extend multiple object you pass in arguments, the last overrides the first and so on ...
 * @method  FORGE.Utils.extedMultipleObjects
 * @param  {...Object} obj - the objects to merge
 * @return {Object} return the merged objects.
 */
//jscs:disable
FORGE.Utils.extendMultipleObjects = function(obj)
{
    var objects = arguments;
    var res = {};

    for (var i = 0, ii = objects.length; i < ii; i++)
    {
        res = FORGE.Utils.extendSimpleObject(res, objects[i], true);
    }

    return res;
};
//jscs:enable

/**
 * Compare two objects
 * @method FORGE.Utils.compareObjects
 * @param  {*} objectA - The first object to compare
 * @param  {*} objectB - The second object to compare
 * @return {boolean} Returns true if the two objects are the same
 */
FORGE.Utils.compareObjects = function(objectA, objectB)
{
    if (typeof(objectA) !== typeof(objectB))
    {
        return false;
    }

    if (typeof(objectA) === "function")
    {
        return objectA.toString() === y.toString();
    }

    if (objectA instanceof Object && objectB instanceof Object)
    {
        if (FORGE.Utils.countProperties(objectA) !== FORGE.Utils.countProperties(objectB))
        {
            return false;
        }

        for (prop in objectA)
        {
            if(FORGE.Utils.compareObjects(objectA[prop], objectB[prop]) === false)
            {
                return false;
            }
        }

        return true;
    }
    else
    {
        return objectA === objectB;
    }
};

/**
 * Count object properties
 * @method FORGE.Utils.countProperties
 * @param  {*} object
 * @return {number} Returns the count of the object's properties
 */
FORGE.Utils.countProperties = function(object)
{
    var count = 0;

    for (i in object)
    {
        if (object.hasOwnProperty(i))
        {
            count++;
        }
    }

    return count;
};

/**
 * Clone an object deeply, without keeping a single reference.
 * @method FORGE.Utils.clone
 * @param  {*} obj - any object to clone
 * @return {*} the cloned object
 */
FORGE.Utils.clone = function(obj)
{
    if (!(obj instanceof Object))
    {
        return obj;
    }

    var clone = new obj.constructor();

    for (var prop in obj)
    {
        clone[prop] = FORGE.Utils.clone(obj[prop]);
    }

    return clone;
};

/**
 * Is the object a display object? Check the className.
 * @method FORGE.Utils.isDisplayObject
 * @param {Object} object - The object to verify.
 * @return {boolean} Returns true if the object is a display object.
 */
FORGE.Utils.isDisplayObject = function(object)
{
    if (object !== null && typeof object === "object")
    {
        if (typeof object.className === "string" && FORGE.DisplayList.types.indexOf(object.className) !== -1)
        {
            return true;
        }
    }

    return false;
};

/**
 * Is the className of the object can be verified?
 * @method FORGE.Utils.isTypeOf
 * @param {*} object - The object to verify.
 * @param {(string|Array<string>)} className - The className to search for, it can be a string or an array of string if you accept multiple types.
 * @return {boolean} Returns true if the className of the object can be verified.
 */
FORGE.Utils.isTypeOf = function(object, className)
{
    if (typeof className === "string" && ((object !== null && typeof object === "object" && typeof object.className === "string" && object.className.toLowerCase() === className.toLowerCase()) || typeof object === className.toLowerCase()))
    {
        return true;
    }
    else if (Array.isArray(className) === true && FORGE.Utils.isArrayOf(className, "string") === true)
    {
        for (var i = 0, ii = className.length; i < ii; i++)
        {
            if (FORGE.Utils.isTypeOf(object, className[i]) === true)
            {
                return true;
            }
        }
    }

    return false;
};

/**
 * Check the className of an object based on it's path (pointed syntax in string)<br>
 * Very usefull if you have to check a deep property without the knowing if all the parent chain is defined.
 * @method  FORGE.Utils.isTypeOfRecursive
 * @param  {Object}  object - The main object that handle the property you want to check.
 * @param  {string}  path - Path to the target you want to check (example : "image.url" on a button skin state)
 * @param  {string}  className - The className you want to check for
 * @return {boolean} Returns true if object is of the asked className, false if not or if it's not found.
 */
FORGE.Utils.isTypeOfRecursive = function(object, path, className)
{
    var pathArray = path.split(".");
    var currentObject = object;

    for (var i = 0, ii = pathArray.length; i < ii; i++)
    {
        currentObject = currentObject[pathArray[i]];

        if (i === ii - 1)
        {
            return FORGE.Utils.isTypeOf(currentObject, className);
        }
        else if (typeof currentObject === "undefined")
        {
            return false;
        }
    }

    return false;
};

/**
 * Know if array is an array full of object of a single ForgeJS className or classic JS types like string, number ...
 * @method FORGE.Utils.isArrayOf
 * @param  {*} array - The array to test.
 * @param  {string} className - The className to test if this array is exclusvie to this className.
 * @return {boolean} Returns true if the array is full of object with the className in params.
 */
FORGE.Utils.isArrayOf = function(array, className)
{
    if (typeof array === "object" && Array.isArray(array) === true)
    {
        for (var i = 0, ii = array.length; i < ii; i++)
        {
            if (FORGE.Utils.isTypeOf(array[i], className) === false)
            {
                return false;
            }
        }

        return true;
    }

    return false;
};


/**
 * Get an objet property by its string path in pointed syntax.
 * @method  FORGE.Utils.getObjectProperty
 * @param  {Object}  object - The main object that handle the property you want to check.
 * @param  {string}  property - Path to the property you want to get (example : "image.url" on a button skin state)
 * @param  {*=}  defaultReturnValue - The default return value if not found, if not specified the default is undefined
 * @return {*} Returns the property if found, if not found returns your defaultReturnValue or undefined.
 */
FORGE.Utils.getObjectProperty = function(object, property, defaultReturnValue)
{
    var pathArray = property.split(".");
    var currentObject = object;

    for (var i = 0, ii = pathArray.length; i < ii; i++)
    {
        currentObject = currentObject[pathArray[i]];

        //If current object is undefined, return default value or undefined
        if (typeof currentObject === "undefined")
        {
            return defaultReturnValue;
        }
        //If this is the target item (the last in property path)
        if (i === ii - 1)
        {
            return currentObject;
        }
    }

    return defaultReturnValue;
};

/**
 * Sort an array by property.
 * @method FORGE.Utils.sortArrayByProperty
 * @param  {Array} array - The array to test.
 * @param  {string} property - The property to sort.
 * @return {Array} Returns the sorted array.
 */
FORGE.Utils.sortArrayByProperty = function(array, property)
{
    var props = property.split(".");
    var len = props.length;

    array.sort(function(a, b)
    {
        var i = 0;

        while (i < len)
        {
            a = a[props[i]];
            b = b[props[i]];
            i++;
        }

        if (a < b)
        {
            return -1;
        }
        else if (a > b)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    });

    return array;
};

/**
 * Randomize the content of an array. Uses the Durstenfeld version of the
 * Fisher-Yates algorithm.
 * https://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
 * @method FORGE.Utils.randomize
 * @param  {Array<*>} array - The array to randomize
 * @return {Array<*>}         The randomized array
 */
FORGE.Utils.randomize = function(array)
{
    var res = array.slice();
    var temp, j;

    for (var i = res.length - 1; i > 0; i--)
    {
        j = ~~(Math.random() * (i + 1));

        temp = res[i];
        res[i] = res[j];
        res[j] = temp;
    }

    return res;
};

/**
 * Fill a string from the left
 * @method FORGE.Utils.leftFill
 * @param {string} string - String to fill.
 * @param {string|number} fillCharacter - Char or string to fill with.
 * @param {number} length - The length for the output string.
 * @return {string} The filled string.
 */
FORGE.Utils.leftFill = function(string, fillCharacter, length)
{
    var str = String(string);

    while (str.length < length)
    {
        str = fillCharacter + str;
    }

    return str;
};

/**
 * Parse seconds value in hours, minutes and seconds components.
 * @method FORGE.Utils.parseTime
 * @param {number} seconds - Seconds to parse.
 * @return {Object} Parsed values in an object.
 */
FORGE.Utils.parseTime = function(seconds)
{
    var time = {
        "input": seconds,
        "hours": 0,
        "minutes": 0,
        "seconds": 0
    };

    //If input is not a parsable value, return time with default values
    if (typeof time.input !== "number" || isNaN(time.input))
    {
        return time;
    }

    time.hours = parseInt(time.input / 3600, 10) % 24;
    time.minutes = parseInt(time.input / 60, 10) % 60;
    time.seconds = parseInt(time.input % 60, 10);

    return time;
};

/**
 * Format a timestamp according to a format (eg: H:M:S)<br>
 * H = hours two digits.<br>
 * h = hours no 0 fill.<br>
 * M = minutes two digits.<br>
 * m = minutes no 0 fill.<br>
 * S = seconds two digits.<br>
 * s = seconds no 0 fill.
 * @method FORGE.Utils.formatTime
 * @param  {number} time - Timestamp in seconds.
 * @param  {string} format - The out format for time (default "H:M:S").
 * @return {string} Returns the formated time string.
 */
FORGE.Utils.formatTime = function(time, format)
{
    var parsed = FORGE.Utils.parseTime(time);

    var f = (typeof format === "string") ? format : "H:M:S";

    var h = 0;
    if (f.indexOf("H") !== -1)
    {
        h = 2;
    }
    else if (f.indexOf("h") !== -1)
    {
        h = 1;
    }

    var m = 0;
    if (f.indexOf("M") !== -1)
    {
        m = 2;
    }
    else if (f.indexOf("m") !== -1)
    {
        m = 1;
    }

    var s = 0;
    if (f.indexOf("S") !== -1)
    {
        s = 2;
    }
    else if (f.indexOf("s") !== -1)
    {
        s = 1;
    }

    var result = f.toLowerCase();

    if (h > 0)
    {
        result = result.replace("h", FORGE.Utils.leftFill(parsed.hours, 0, h));
    }

    if (m > 0)
    {
        result = result.replace("m", FORGE.Utils.leftFill(parsed.minutes, 0, m));
    }

    if (s > 0)
    {
        result = result.replace("s", FORGE.Utils.leftFill(parsed.seconds, 0, s));
    }

    return result;
};

/**
 * Get THREE.Spherical object from euler angles.
 * @method FORGE.Utils.toTHREESpherical
 * @param {number} radius radius
 * @param {number} theta theta angle
 * @param {number} phi phi angle
 * @return {THREE.Spherical} spherical object
 */
FORGE.Utils.toTHREESpherical = function(radius, theta, phi)
{
    return new THREE.Spherical(radius, Math.PI / 2 - phi, theta);
};

/**
 * Get object with euler angles from a THREE.Spherical object.
 * @method FORGE.Utils.fromTHREESpherical
 * @param {THREE.Spherical} spherical spherical object
 * @return {Object} spherical object
 */
FORGE.Utils.fromTHREESpherical = function(spherical)
{
    var result = {
        "radius": spherical.radius,
        "theta": spherical.theta,
        "phi": Math.PI / 2 - spherical.phi
    };

    return result;
};

/**
 * Get an array by difference with another array
 * @method FORGE.Utils.arrayByDifference
 * @param  {Array} array input array to be filtered
 * @param  {Array} elements elements to be excluded in result array
 * @return {Array} difference array (array - elements)
 */
FORGE.Utils.arrayByDifference = function(array, elements)
{
    return array.filter(function(i)
    {
        return elements.indexOf(i) < 0;
    });
};

/**
 * Remove and return item from an array at given index
 * @method FORGE.Utils.removeItemFromArrayAtIndex
 * @param {Array} array input array
 * @param {number} idx item index
 * @return {Object} removed array item or null if index was out of bounds
 */
FORGE.Utils.removeItemFromArrayAtIndex = function(array, idx)
{
    if (idx >= array.length)
    {
        return null;
    }

    return array.splice(idx, 1);
};

/**
 * endsWith ES6 implementation
 * @param  {string} str
 * @param  {string} suffix
 * @return {boolean} Ends with suffix?
 */
FORGE.Utils.endsWith = function(str, suffix)
{
    if (typeof String.prototype.endsWith !== "function")
    {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    return str.endsWith(suffix);
};

/**
 * Polyfill of Array.prototype.keys in ES5.
 *
 * @method FORGE.Utils.arrayKeys
 * @param {(Array|TypedArray)} array - Array to iterate.
 * @return {(IteratorIterable|Object)} Iterator
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys
 */
FORGE.Utils.arrayKeys = function(array)
{
    if (!Array.prototype.keys)
    {
        var len, result = {}, nextIndex = 0;
        len = array.length;
        result.array = [];
        result.length = array.length;
        while (len > 0) result.array[--len] = len;
        result.next = function()
        {
            return nextIndex < array.length ? {value: nextIndex++, done: false} : {done: true};
        };
        return result;
    }

    return array.keys();
};
