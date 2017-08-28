/**
 * Browser history managment, add slug name of scenes in URL.
 *
 * @constructor FORGE.History
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @extends FORGE.BaseObject
 */
FORGE.History = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.History#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * History configuration
     * @name FORGE.History#_config
     * @type {HistoryConfig}
     * @private
     */
    this._config;

    /**
     * The history module enabled flag.
     * @name  FORGE.History#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = false;

    FORGE.BaseObject.call(this, "History");
};

FORGE.History.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.History.prototype.constructor = FORGE.History;

/**
 * Default configuration of the History
 * @name FORGE.History.DEFAULT_CONFIG
 * @type {HistoryConfig}
 * @const
 */
FORGE.History.DEFAULT_CONFIG =
{
    enabled: true
};

/**
 * Boot sequence.
 * @method FORGE.History#_parseConfig
 * @param {HistoryConfig} config - History configuration to parse
 * @private
 */
FORGE.History.prototype._parseConfig = function(config)
{
    this._config = /** @type {HistoryConfig} */ (FORGE.Utils.extendSimpleObject(FORGE.History.DEFAULT_CONFIG, config));

    this._enabled = (typeof this._config.enabled === "boolean") ? this._config.enabled : true;

    if (this._enabled === true)
    {
        this._enable();
    }
};

/**
 * Enable the handler needed for History
 * @method FORGE.History#_enable
 * @private
 */
FORGE.History.prototype._enable = function()
{
    this._viewer.story.onSceneLoadStart.add(this._sceneLoadStartHandler, this);
    this._viewer.i18n.onLocaleChangeComplete.add(this._localeChangeCompleteHandler, this);
    window.addEventListener("popstate", this._onPopStateHandler, false);
};

/**
 * Disable the handler needed for History
 * @method FORGE.History#_disable
 * @private
 */
FORGE.History.prototype._disable = function()
{
    this._viewer.story.onSceneLoadStart.remove(this._sceneLoadStartHandler, this);
    this._viewer.i18n.onLocaleChangeComplete.remove(this._localeChangeCompleteHandler, this);
    window.removeEventListener("popstate", this._onPopStateHandler, false);
};

/**
 * Internal handler for scene load start.
 * @method FORGE.History#_sceneLoadStartHandler
 * @private
 */
FORGE.History.prototype._sceneLoadStartHandler = function()
{
    this._addState();
};

/**
 * Internal handler for locale change complete.
 * @method FORGE.History#_localeChangeCompleteHandler
 * @private
 */
FORGE.History.prototype._localeChangeCompleteHandler = function()
{
    this._updateState();
};

/**
 * Add a state into the history.
 * @method  FORGE.History#_addState
 * @private
 */
FORGE.History.prototype._addState = function()
{
    this.log("_addState");

    var scene = this._viewer.story.scene;

    var newState = {
        "viewer":
        {
            uid: this._viewer.uid
        },

        "scene":
        {
            uid: scene.uid
        },

        "locale": this._viewer.i18n.locale
    };

    var currentState = window.history.state;

    if (currentState === null)
    {
        window.history.replaceState(newState, scene.name, this.generateHash(scene));
    }
    else if (currentState.scene.uid !== newState.scene.uid)
    {
        window.history.pushState(newState, scene.name, this.generateHash(scene));
    }
};

/**
 * Update the current state with the correct slug name.
 * @method FORGE.History#_updateState
 * @private
 */
FORGE.History.prototype._updateState = function()
{
    this.log("_updateState");

    var currentState = /** @type {Object} */ (window.history.state);

    if (this._isStateValid(currentState))
    {
        var scene = FORGE.UID.get(currentState.scene.uid);
        currentState.locale = this._viewer.i18n.locale;
        window.history.replaceState(currentState, scene.name, this.generateHash( /** @type {FORGE.Scene} */ (scene)));
    }
};

/**
 * Internal handler for browser pop state event.<br>
 * This event occur when user click on back or next browser buttons.
 * @param  {Event} event - The pop state event.
 * @private
 */
FORGE.History.prototype._onPopStateHandler = function(event)
{
    if (event.state === null)
    {
        return;
    }

    var viewer = FORGE.UID.get(event.state.viewer.uid);

    viewer.history.log("_onPopStateHandler");

    viewer.story.scene = event.state.scene.uid;
};

/**
 * Method to check if a state is valid for the history module.
 * @param  {Object}  state - The state to check.
 * @return {boolean} Returns true if the state is valid, false if not.
 * @private
 */
FORGE.History.prototype._isStateValid = function(state)
{
    if (state === null)
    {
        return false;
    }

    var viewerValid = (typeof state.viewer !== "undefined" && typeof state.viewer.uid === "string");
    var sceneValid = (typeof state.scene !== "undefined" && typeof state.scene.uid === "string");

    return (viewerValid === true && sceneValid === true);
};

/**
 * Generate a hash for the current scene with the i18n slug name and the scene uid.
 * @method FORGE.History#generateHash
 * @param  {FORGE.Scene|Object} scene - The scene for which you want to generate a hash.
 * @param {boolean} [keep=true] - Do we have to keep the existing URL parameters.
 * @return {string} The generated hash.
 */
FORGE.History.prototype.generateHash = function(scene, keep)
{
    // Search for other parameters in URL, beside the UID
    var result = "";

    // Keep others parameters
    if(keep !== false)
    {
        var hash = window.location.hash;

        // result for normal URL querystring (&yaw=0&pitch=0&roll=0&fov=0&view=rectilinear)
        var re = /(?:#|&)([\w\-]+)=([\w\-.]+)/g;
        var rr;
        while ((rr = re.exec(hash)) !== null)
        {
            if (rr[1] !== "uid")
            {
                result += "&" + rr[1] + "=" + rr[2];
            }
        }

        // result for Share plugin short URL support (&y0p0r0f0vrectilinear)
        var reShort = /&?(y|p|r|f|v)([0-9\-.]+|rectilinear|gopro|flat)/gi;
        var activeShort = false;
        while ((rr = reShort.exec(hash)) !== null)
        {
            if (activeShort === false && result.slice(-1) !== "&")
            {
                result += "&";
                activeShort = true;
            }
            result += rr[1] + rr[2];
        }
    }

    return "#" + scene.slug + "&uid=" + scene.uid + result;
};

/**
 * Add the history configuration.
 * @method FORGE.History#addConfig
 * @param {HistoryConfig} config - The configuration to add
 */
FORGE.History.prototype.addConfig = function(config)
{
    this._parseConfig(config);
};

/**
 * Destroy sequence.
 * @method FORGE.History#destroy
 */
FORGE.History.prototype.destroy = function()
{
    this._disable();

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the enbled flag value of the history.
 * @name FORGE.History#enabled
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.History.prototype, "enabled",
{
    /** @this {FORGE.History} */
    get: function()
    {
        return this._enabled;
    }
});