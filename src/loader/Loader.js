/**
 * This class have several methods to load assets and put them in cache.
 * @constructor FORGE.Loader
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 *
 * @todo  Clean callback and context from file like in jsonLoadComplete, this cause JS keep reference to viewer when destroyed.
 */
FORGE.Loader = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.Loader#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    FORGE.BaseObject.call(this, "Loader");
};

FORGE.Loader.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Loader.prototype.constructor = FORGE.Loader;

/**
 * Load a json file.
 * @method FORGE.Loader#json
 * @param  {string} key - The key for the json file.
 * @param  {string} url - URL of the file.
 * @param  {Function} onCompleteCallback - The callback function called when file is completed.
 * @param  {Object} onCompleteContext - The callback context when file is completed.
 * @param  {Function=} onErrorCallback - The callback function called on file error.
 * @param  {Object=} onErrorContext - The callback context for file error.
 */
FORGE.Loader.prototype.json = function(key, url, onCompleteCallback, onCompleteContext, onErrorCallback, onErrorContext)
{
    var file = new FORGE.File();
    file.type = "json";
    file.key = key;
    file.url = url;
    file.onCompleteCallback = onCompleteCallback;
    file.onCompleteContext = onCompleteContext;
    file.onErrorCallback = onErrorCallback;
    file.onErrorContext = onErrorContext;

    this._xhr(file, "text", this._jsonLoadComplete, this._jsonLoadError);
};

/**
 * Internal method called when a json file is completed.
 * @method FORGE.Loader#_jsonLoadComplete
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the json file.
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest response.
 */
FORGE.Loader.prototype._jsonLoadComplete = function(file, xhr)
{
    if (xhr.responseText)
    {
        file.data = Object(JSON.parse(xhr.responseText));

        if (this._viewer.cache.has(FORGE.Cache.types.JSON, file.key) === false)
        {
            this._viewer.cache.add(FORGE.Cache.types.JSON, file.key, file);
        }
        else
        {
            this.log("FORGE.Loader.json : JSON file already exists");
        }

        if (typeof file.onCompleteCallback === "function" && file.onCompleteContext !== null)
        {
            var callback = file.onCompleteCallback;
            var context = file.onCompleteContext;

            file.onCompleteCallback = null;
            file.onCompleteContext = null;
            file.onErrorCallback = null;
            file.onErrorContext = null;

            callback.call(context, file);
        }
    }
    else
    {
        throw "FORGE.Loader.json : JSON file empty ?";
    }
};

/**
 * Internal method called when the load of a json file return error.
 * @method FORGE.Loader#_jsonLoadError
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the json file.
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest response.
 */
FORGE.Loader.prototype._jsonLoadError = function(file, xhr)
{
    if (xhr.responseText)
    {
        if (typeof file.onErrorCallback === "function" && file.onErrorContext !== null)
        {
            var callback = file.onErrorCallback;
            var context = file.onErrorContext;

            file.onCompleteCallback = null;
            file.onCompleteContext = null;
            file.onErrorCallback = null;
            file.onErrorContext = null;

            callback.call(context, file);
        }
    }
    else
    {
        throw "FORGE.Loader.json : JSON file empty ?";
    }
};

/**
 * Load a xml file.
 * @method FORGE.Loader#xml
 * @param  {string} key - The key for the xml file.
 * @param  {string} url - URL of the file.
 * @param  {Function} onCompleteCallback - The callback function called when file is completed.
 * @param  {Object} onCompleteContext - The callback context when file is completed.
 * @param  {Function} onErrorCallback - The callback function called on file error.
 * @param  {Object} onErrorContext - The callback context for file error.
 */
FORGE.Loader.prototype.xml = function(key, url, onCompleteCallback, onCompleteContext, onErrorCallback, onErrorContext)
{
    var file = new FORGE.File();
    file.type = "xml";
    file.key = key;
    file.url = url;
    file.onCompleteCallback = onCompleteCallback;
    file.onCompleteContext = onCompleteContext;
    file.onErrorCallback = onCompleteCallback;
    file.onErrorContext = onErrorContext;

    this._xhr(file, "document", this._xmlLoadComplete, this._xmlLoadError);
};

/**
 * Internal method called when a xml file is completed.
 * @method FORGE.Loader#_xmlLoadComplete
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the xml file.
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest response.
 */
FORGE.Loader.prototype._xmlLoadComplete = function(file, xhr)
{
    if (xhr.responseXML)
    {
        file.data = xhr.responseXML;

        if (this._viewer.cache.has(FORGE.Cache.types.XML, file.key) === false)
        {
            this._viewer.cache.add(FORGE.Cache.types.XML, file.key, file);
        }
        else
        {
            this.log("FORGE.Loader.xml : XML file already exists");
        }

        if (typeof file.onCompleteCallback === "function" && file.onCompleteContext !== null)
        {
            var callback = file.onCompleteCallback;
            var context = file.onCompleteContext;

            file.onCompleteCallback = null;
            file.onCompleteContext = null;
            file.onErrorCallback = null;
            file.onErrorContext = null;

            callback.call(context, file);
        }
    }
    else
    {
        throw "FORGE.Loader.xml : XML file empty ?";
    }
};

/**
 * Internal method called when the load of a xml file return error.
 * @method FORGE.Loader#_xmlLoadError
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the xml file.
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest response.
 */
FORGE.Loader.prototype._xmlLoadError = function(file, xhr)
{
    if (xhr.responseXML)
    {
        if (typeof file.onErrorCallback === "function" && file.onErrorContext !== null)
        {
            var callback = file.onErrorCallback;
            var context = file.onErrorContext;

            file.onCompleteCallback = null;
            file.onCompleteContext = null;
            file.onErrorCallback = null;
            file.onErrorContext = null;

            callback.call(context, file);
        }
    }
    else
    {
        throw "FORGE.Loader.xml : JSON file empty ?";
    }
};

/**
 * Load a sound file.
 * @method FORGE.Loader#sound
 * @param {string} key - The key for the sound file.
 * @param {string} url - The url of the sound file.
 * @param {Function} onCompleteCallback - The callback function called when file is completed.
 * @param {Object} onCompleteContext - The callback context when file is completed.
 * @param {boolean=} forceAudioTag - Is audio tag is forced ?
 */
FORGE.Loader.prototype.sound = function(key, url, onCompleteCallback, onCompleteContext, forceAudioTag)
{
    var file = new FORGE.File();
    file.type = "sound";
    file.key = key;
    file.url = url;
    file.onCompleteCallback = onCompleteCallback;
    file.onCompleteContext = onCompleteContext;

    if (this._viewer.audio.useWebAudio === true && forceAudioTag !== true)
    {
        this._xhr(file, "arraybuffer", this._soundLoadComplete);
    }
    else if (this._viewer.audio.useAudioTag === true || forceAudioTag === true)
    {
        this._loadAudioTag(file, this._soundLoadComplete, this);
    }
};

/**
 * Internal method called when a sound file is completed and use the WebAudio API.
 * @method FORGE.Loader#_soundLoadComplete
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the sound file.
 * @param {XMLHttpRequest=} xhr - The XMLHttpRequest response.
 */
FORGE.Loader.prototype._soundLoadComplete = function(file, xhr)
{
    if (this._viewer.audio.useWebAudio === true && typeof xhr !== "undefined")
    {
        file.data = xhr.response;
    }

    this._viewer.cache.add(FORGE.Cache.types.SOUND, file.key, file);

    if (typeof file.onCompleteCallback === "function" && file.onCompleteContext !== null)
    {
        file.onCompleteCallback.call(file.onCompleteContext, file);
    }
};

/**
 * Internal method called when a sound file is completed and use the AudioTag.
 * @method FORGE.Loader#_loadAudioTag
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the sound file.
 * @param {Function} callback - The callback function called when file is completed.
 * @param  {Object} context - The callback context when file is completed.
 */
FORGE.Loader.prototype._loadAudioTag = function(file, callback, context)
{
    // create an Audio element
    var audioElement = new Audio();

    var canPlayEvent = "canplay";
    var errorEvent = "error";
    var canPlayCallback = function()
    {
        this.removeEventListener(canPlayEvent, canPlayCallback);
        this.removeEventListener(errorEvent, errorCallback);

        if (typeof callback === "function")
        {
            file.data = this;
            callback.call(context, file);
        }
    };
    var errorCallback = function()
    {
        this.removeEventListener(canPlayEvent, canPlayCallback);
        this.removeEventListener(errorEvent, errorCallback);
        throw "FORGE.Loader : Could not load HTMLMediaElement " + file.url;
    };

    audioElement.addEventListener(canPlayEvent, canPlayCallback);
    audioElement.addEventListener(errorEvent, errorCallback);

    audioElement.preload = "auto";
    audioElement.crossOrigin = "anonymous";
    audioElement.src = file.url;
    audioElement.load();
};

/**
 * Internal method to load data from XMLHttpRequest.
 * @method FORGE.Loader#_xhr
 * @private
 * @param {FORGE.File} file - The {@link FORGE.File} corresponding to the file to load.
 * @param {string} type - The type of the object to load.
 * @param {Function} onComplete - The callback function called when file is completed.
 * @param {Function=} onError - The callback function for error during the load.
 * @param {Function=} onProgress - The callback function for the progress of the load.
 */
FORGE.Loader.prototype._xhr = function(file, type, onComplete, onError, onProgress)
{
    file.loading = true;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", file.url, true);
    xhr.responseType = type;

    var length = 0;

    /** @this {XMLHttpRequest} */
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE)
        {
            if (xhr.status === 200 || xhr.status === 0)
            {
                this.onreadystatechange = null;

                if (typeof onComplete === "function")
                {
                    file.loaded = true;
                    onComplete.call(this, file, xhr);
                }
            }
            else
            {
                throw "FORGE.Loader._xhr : Could not load " + file.url;
            }
        }
        else if (xhr.readyState === XMLHttpRequest.LOADING)
        {
            if (onProgress !== null && typeof onProgress !== "undefined")
            {
                if (length === 0)
                {
                    length = xhr.getResponseHeader("Content-Length");
                }

                if (typeof onProgress !== "undefined")
                {
                    onProgress(
                    {
                        "total": length,
                        "loaded": xhr.responseText.length
                    });
                }
            }
        }
        else if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED)
        {
            if (onProgress !== null && typeof onProgress !== "undefined")
            {
                length = xhr.getResponseHeader("Content-Length");
            }
        }

    }.bind(this);

    xhr.onerror = function()
    {
        if (typeof onError === "function")
        {
            onError.call(this, file, xhr);
        }
    }.bind(this);

    xhr.send();
};

/**
 * Load an image file.
 * @method FORGE.Loader#image
 * @param  {string} key - The key for the image file.
 * @param  {string} url - The url of the image file.
 * @param  {Function} success - The success callback function called when file is completed.
 * @param  {Function} error - The error callback function called when file won't load.
 * @param  {Object} context - The callbacks context when file is completed.
 */
FORGE.Loader.prototype.image = function(key, url, success, error, context)
{
    var file = new FORGE.File();
    file.type = "image";
    file.key = key;
    file.url = url;
    file.data = new Image();

    file.data.crossOrigin = "anonymous";

    file.data.onload = function()
    {
        file.data.onload = null;
        file.data.onerror = null;

        file.loading = false;
        file.loaded = true;

        this._viewer.cache.add(FORGE.Cache.types.IMAGE, file.key, file);

        if(typeof success === "function")
        {
            success.call(context, file);
        }

    }.bind(this);

    file.data.onerror = function()
    {
        file.data.onload = null;
        file.data.onerror = null;

        if(typeof error === "function")
        {
            error.call(context, file);
        }
        else
        {
            throw "ERROR : FORGE.Loader.image, failed to load image key : " + key + " at url " + url;
        }
    };

    file.data.src = file.url;
    file.loading = true;
};

/**
 * Load a script file.
 * @method FORGE.Loader#script
 * @param  {string} url - The url of the js file.
 * @param  {Function} callback - The callback function called when file is completed.
 * @param  {Object} context - The callback context when file is completed.
 */
FORGE.Loader.prototype.script = function(url, callback, context)
{
    var head = document.getElementsByTagName("head")[0];
    var scripts = head.getElementsByTagName("script");

    //Check if a script is not already in the head of the document
    for (var i = 0, ii = scripts.length; i < ii; i++)
    {
        if (scripts[i].src === url)
        {
            this.warn("Attempt to load an already loaded script!");
            callback.call(context);
            return;
        }
    }

    var script = document.createElement("script");
    script.type = "text/javascript";

    script.onload = function()
    {
        script.onload = null;
        callback.call(context);
    };

    script.src = url;
    head.appendChild(script);
};

/**
 * Load a CSS file.
 * @method FORGE.Loader#css
 * @param  {string} url - The url of the CSS file.
 * @param  {Function} callback - The callback function called when file is completed.
 * @param  {Object} context - The callback context when file is completed.
 */
FORGE.Loader.prototype.css = function(url, callback, context)
{
    var css = document.createElement("link");
    css.type = "text/css";
    css.rel = "stylesheet";

    if (typeof callback !== "undefined" && typeof context !== "undefined")
    {
        css.onload = function()
        {
            css.onload = null;
            callback.call(context);
        };
    }

    css.href = url;
    document.getElementsByTagName("head")[0].appendChild(css);
};

/**
 * Destroy sequence.
 * @method FORGE.Loader#destroy
 */
FORGE.Loader.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};