
/**
 * Iframe display object.<br>
 * Can load an exteranl web page with i18n url.
 * @constructor FORGE.Iframe
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {(IframeConfig|string)=} config - Iframe configuration.
 * @extends {FORGE.DisplayObject}
 */
FORGE.Iframe = function(viewer, config)
{
    /**
     * The iframe html element
     * @name  FORGE.Iframe#_element
     * @type {Element|HTMLIFrameElement}
     * @private
     */
    this._element = null;

    /**
     * The configuration object.
     * @name  FORGE.Iframe#_config
     * @type {?(IframeConfig|string)}
     * @private
     */
    this._config = config || null;

    /**
     * The current url of the Iframe element.
     * @name FORGE.Iframe#_url
     * @type {string}
     * @private
     */
    this._url = "";

    /**
     * The i18n flag of this display object.
     * @name FORGE.Iframe#_i18n
     * @type {boolean}
     * @private
     */
    this._i18n = false;

    /**
     * The i18n key for the url to load into the iframe.
     * @name FORGE.Iframe#_i18nUrl
     * @type {string}
     * @private
     */
    this._i18nUrl = "";

    /**
     * The i18n locale string used to translate the url to load into the iframe.
     * @name FORGE.Iframe#_i18nUrlLocaleString
     * @type {FORGE.LocaleString}
     * @private
     */
    this._i18nUrlLocaleString = null;

    /**
     * This is copy of load complete handler with this as this reference (bind).
     * @name  FORGE.Iframe#_loadCompleteBind
     * @type {Function}
     * @default  null
     * @private
     */
    this._loadCompleteBind = null;

    /**
     * Is the current web content of the iframe is loaded.
     * @name FORGE.Iframe#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    /**
     * On load start event dispatcher.
     * @name  FORGE.Iframe#_onLoadStart
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadStart = null;

    /**
     * On load complete event dispatcher.
     * @name  FORGE.Iframe#_onLoadComplete
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    FORGE.DisplayObject.call(this, viewer, null, "Iframe");
};

FORGE.Iframe.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.Iframe.prototype.constructor = FORGE.Iframe;

/**
 * Boot sequence.
 * @method FORGE.Iframe#_boot
 * @private
 */
FORGE.Iframe.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    this._loadCompleteBind = this._loadCompleteHandler.bind(this);

    this._element = document.createElement("iframe");
    this._element.style.width = "100%";
    this._element.style.height = "100%";
    this._element.style.border = 0;
    this._element.style.overflow = "hidden";
    this._element.addEventListener("load", this._loadCompleteBind, this !== null && this !== undefined);
    this._element.setAttribute("allowFullScreen", "");
    this._dom.appendChild(this._element);

    if(this._config !== null)
    {
        this.load(this._config);
    }

    this._viewer.display.register(this);
    this._notifyReady();
    this._applyPending(false);
};

/**
 * Handler for locale change.
 * @method FORGE.Iframe#_localeChangeComplete
 * @private
 */
FORGE.Iframe.prototype._localeChangeComplete = function()
{
    this.log("_localeChangeComplete");

    if(this._viewer.i18n.hasValue(this._i18nUrl) === true)
    {
        var url = this._i18nUrlLocaleString.value;
        this._loadIframe(url);
    }
};

/**
 * Load iframe content
 * @method  FORGE.Iframe#_loadIframe
 * @param  {string} url - The url you want to load in the iframe.
 * @private
 */
FORGE.Iframe.prototype._loadIframe = function(url)
{
    this.log("_loadIframe url: "+url);
    this._loaded = false;

    if(this._onLoadStart !== null)
    {
        this._onLoadStart.dispatch();
    }

    this._url = url;
    this._element.src = this._url;
};

/**
 * Internal handler for load complete.
 * This method is copied in _loadCompleteBind on boot with a new this reference!
 * @method  FORGE.Iframe#_loadCompleteHandler
 * @private
 */
FORGE.Iframe.prototype._loadCompleteHandler = function()
{
    //At creation the iframe load an empty url?
    //Just to prevent false load complete notification
    if(this._url === "")
    {
        return;
    }

    this.log("_loadCompleteHandler url: "+this._url);
    this._loaded = true;

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.dispatch();
    }
};

/**
 * Parse the iframe configuration.
 * @method  FORGE.Iframe#_parseConfig
 * @param {(IframeConfig|string)} config - The configuration object to parse.
 * @private
 */
FORGE.Iframe.prototype._parseConfig = function(config)
{
    if(typeof config === "object" && config !== null)
    {
        this._i18n = config.i18n || false;

        if(this._i18n === true)
        {
            this._url = "";
            this._i18nUrl = config.url;
        }
        else
        {
            this._url = config.url;
        }
    }
    else
    {
        this._i18n = false;
        this._url = "";

        if(typeof config === "string")
        {
            this._url = config;
        }
    }
};

/**
 * Add locale change complete listener.
 * @method FORGE.Iframe#_addLocaleChangeListener
 * @private
 */
FORGE.Iframe.prototype._addLocaleChangeListener = function()
{
    if(this._viewer.i18n.onLocaleChangeComplete.has(this._localeChangeComplete, this) === false)
    {
        this._viewer.i18n.onLocaleChangeComplete.add(this._localeChangeComplete, this);
    }
};

/**
 * Load an iframe configuration.
 * @method  FORGE.Iframe#load
 * @param {(string|IframeConfig)} config - The url string or the configuration object to load.
 */
FORGE.Iframe.prototype.load = function(config)
{
    this._parseConfig(config);

    var url;
    if(this._i18n === true && (typeof this._i18nUrl === "string" && this._i18nUrl !== ""))
    {
        this._i18nUrlLocaleString = new FORGE.LocaleString(this._viewer, this._i18nUrl);

        this._addLocaleChangeListener();

        url = this._i18nUrlLocaleString.value;
    }
    else if(typeof this._url === "string" && this._url !== "")
    {
        url = this._url;
    }

    if(typeof url !== "undefined")
    {
        this._loadIframe(url);
    } 
};

/**
 * Destroy method.
 * @method FORGE.Iframe#destroy
 */
FORGE.Iframe.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    if(this._i18nUrlLocaleString !== null)
    {
        this._i18nUrlLocaleString.destroy();
        this._i18nUrlLocaleString = null;
        this._viewer.i18n.onLocaleChangeComplete.remove(this._localeChangeComplete, this);
    }

    if(this._onLoadStart !== null)
    {
        this._onLoadStart.destroy();
        this._onLoadStart = null;
    }

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    this._element = null;
    this._loadCompleteBind = null;

    FORGE.DisplayObject.prototype.destroy.call(this);
};

/**
* Get and set the i18n iframe url.
* @name FORGE.Iframe#i18nUrl
* @type {string} 
*/
Object.defineProperty(FORGE.Iframe.prototype, "i18nUrl", 
{
    /** @this {FORGE.Iframe} */
    get: function()
    {
        return this._i18nUrl;
    },

    /** @this {FORGE.Iframe} */
    set: function(value)
    {
        if(typeof value === "string")
        {
            this._i18n = true;
            this._i18nUrl = value;

            var url;
            if(this._i18nUrl !== "")
            {
                this._i18nUrlLocaleString = new FORGE.LocaleString(this._viewer, this._i18nUrl);

                this._addLocaleChangeListener();

                url = this._i18nUrlLocaleString.value;
            }

            if(typeof url !== "undefined")
            {
                this._loadIframe(url);
            }
        }
    }
});

/**
* Get and set the iframe url.<br>
* You'll lose the i18n behavior if you use this setter.
* @name FORGE.Iframe#url
* @type {string} 
*/
Object.defineProperty(FORGE.Iframe.prototype, "url", 
{
    /** @this {FORGE.Iframe} */
    get: function()
    {
        return this._url;
    },

    /** @this {FORGE.Iframe} */
    set: function(value)
    {
        if(typeof value === "string")
        {
            this._i18n = false;
            this._loadIframe(value);
        }
    }
});

/**
* Get the loaded status of the iframe.
* @name FORGE.Iframe#loaded
* @readonly
* @type {boolean} 
*/
Object.defineProperty(FORGE.Iframe.prototype, "loaded", 
{
    /** @this {FORGE.Iframe} */
    get: function()
    {
        return this._loaded;
    }
});

/**
* Get the onLoadStart {@link FORGE.EventDispatcher}.
* @name FORGE.Iframe#onLoadStart
* @readonly
* @type {FORGE.EventDispatcher} 
*/
Object.defineProperty(FORGE.Iframe.prototype, "onLoadStart", 
{
    /** @this {FORGE.Iframe} */
    get: function()
    {
        if(this._onLoadStart === null)
        {
            this._onLoadStart = new FORGE.EventDispatcher(this);
        }
        
        return this._onLoadStart;
    }
});

/**
* Get the onLoadComplete {@link FORGE.EventDispatcher}.
* @name FORGE.Iframe#onLoadComplete
* @readonly
* @type {FORGE.EventDispatcher} 
*/
Object.defineProperty(FORGE.Iframe.prototype, "onLoadComplete", 
{
    /** @this {FORGE.Iframe} */
    get: function()
    {
        if(this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }
        
        return this._onLoadComplete;
    }
});
