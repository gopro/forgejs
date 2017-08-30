
/**
 * Utility for URL.
 * @constructor FORGE.URL
 * @param {string=} url - The URL to use.
 * @extends {FORGE.BaseObject}
 *
 * @todo  exists method is a POC
 */
FORGE.URL = function(url)
{
    /**
     * The full URL.
     * @name FORGE.URL#_url
     * @type {string|undefined}
     * @private
     */
    this._url = url;

    /**
     * The protocol of the URL (http or https).
     * @name FORGE.URL#_protocol
     * @type {string}
     * @private
     */
    this._protocol = "";

    /**
     * The host for the URL.
     * @name FORGE.URL#_host
     * @type {string}
     * @private
     */
    this._host = "";

    /**
     * The port used in the URL.
     * @name FORGE.URL#_port
     * @type {string}
     * @private
     */
    this._port = "";

    /**
     * The path of the URL.
     * @name FORGE.URL#_path
     * @type {string}
     * @private
     */
    this._path = "";

    /**
     * The query string of the URL.
     * @name FORGE.URL#_query
     * @type {string}
     * @private
     */
    this._query = "";

    /**
     * The hash of the URL (slug name in there).
     * @name FORGE.URL#_hash
     * @type {string}
     * @private
     */
    this._hash = "";

    /**
     * This object contains hash parameters key / value.
     * @name  FORGE.URL#_hashParameters
     * @type {Object}
     * @private
     */
    this._hashParameters = null;

    /**
     * The extension of a file in URL.
     * @name FORGE.URL#_extension
     * @type {string}
     * @private
     */
    this._extension = "";

    FORGE.BaseObject.call(this, "URL");
};

FORGE.URL.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.URL.prototype.constructor = FORGE.URL;

/**
 * Parse the given URL.
 * @method  FORGE.URL.parse
 * @param  {string=} url - The URL to parse.
 * @return {FORGE.URL} Returns the a new FORGE.URL with parsed data.
 */
FORGE.URL.parse = function(url)
{
    var result = new FORGE.URL();

    if(typeof url !== "string")
    {
        //throw "FORGE.URL : Can't parse an undefined URL!";
        url = window.location.toString();
    }

    result._url = url;

    var a = document.createElement("a");
    a.href = result._url;

    result._protocol = a.protocol;
    result._host = a.hostname;
    result._port = a.port;
    result._path = a.pathname;
    result._query = a.search;
    result._hash = a.hash;
    result._extension = result._path.substr(result._path.lastIndexOf(".") + 1);

    if(result._hash !== "")
    {
        var hash = result._hash.replace("#", "");
        var hashComponents = hash.split("&");

        var parameters = {};
        parameters.slug = hashComponents[0];

        for(var i = 1, ii = hashComponents.length; i < ii; i++)
        {
            var item = hashComponents[i].split("=");
            parameters[item[0]] = decodeURIComponent(item[1]);
        }

        result._hashParameters = parameters;
    }

    return result;
};

/**
 * Check if a given url exists.
 * Beware of cross domain, work only on the same domain.
 * @method  FORGE.URL.exists
 * @param  {string} url - The URL to test.
 * @param  {Function} success - The callback to call when test is succeed.
 * @param  {Function} fail - The callback to call when test is failed.
 * @param  {Object} context - The context in which to call the callback.
 */
FORGE.URL.exists = function(url, success, fail, context)
{
    var xhr = new XMLHttpRequest();
    var exists = false;
    var timeout = null;

    /** @this {XMLHttpRequest} */
    xhr.onreadystatechange = function()
    {
        if(this.readyState === XMLHttpRequest.DONE)
        {
            if(this.status === 200)
            {
                exists = true;
                clearTimeout(timeout);

                if(typeof success === "function")
                {
                    success.call(context);
                }

            }
        }
    };

    xhr.onerror = function(event)
    {
        console.log(event);
    };

    xhr.open("HEAD", url);
    xhr.send();

    var timeoutCallback = function()
    {
        if(typeof fail === "function")
        {
            fail.call(context);
        }

    };

    timeout = window.setTimeout(timeoutCallback, 500);
};

/**
 * Check if a URL is valid.
 * Works only for absolute URLs.
 * @method  FORGE.URL.isValid
 * @param  {string} url - The URL to test.
 * @return {boolean} Returns true if URL is valid.
 */
FORGE.URL.isValid = function(url)
{
    var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/;

    if(!urlRegEx.test(url))
    {
        return false;
    }

    return true;
};

/**
 * Get the full URL.
 * @name FORGE.URL#url
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "url",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._url;
    }
});

/**
 * Get the protocol of the URL.
 * @name FORGE.URL#protocol
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "protocol",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._protocol;
    }
});

/**
 * Get the host of the URL.
 * @name FORGE.URL#host
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "host",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._host;
    }
});

/**
 * Get the port of the URL.
 * @name FORGE.URL#port
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "port",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._port;
    }
});

/**
 * Get the path of the URL.
 * @name FORGE.URL#path
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "path",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._path;
    }
});

/**
 * Get the query of the URL.
 * @name FORGE.URL#query
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "query",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._query;
    }
});

/**
 * Get the hash of the URL.
 * @name FORGE.URL#hash
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "hash",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._hash;
    }
});

/**
 * Get the hash parameters of the URL.
 * @name FORGE.URL#hashParameters
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.URL.prototype, "hashParameters",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._hashParameters;
    }
});

/**
 * Get the extension of the URL.
 * @name FORGE.URL#extension
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.URL.prototype, "extension",
{
    /** @this {FORGE.URL} */
    get: function()
    {
        return this._extension;
    }
});
