
/**
 * Manager for the dependencies (scripts).
 *
 * @constructor  FORGE.DependencyManager
 * @param {FORGE.Viewer} viewer - Reference to the FORGE.Viewer.
 * @extends {FORGE.BaseObject}
 */
FORGE.DependencyManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.DependencyManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Number of dependencies.
     * @name FORGE.DependencyManager#_dependenciesCounter
     * @type {number}
     * @private
     */
    this._dependenciesCounter = 0;

    /**
     * Number of loaded dependencies.
     * @name FORGE.DependencyManager#_dependenciesLoaded
     * @type {number}
     * @private
     */
    this._dependenciesLoaded = 0;

    /**
     * On all dependencies scripts loaded event dispatcher.
     * @name  FORGE.DependencyManager#_onAllScriptsLoaded
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onAllScriptsLoaded = null;

    FORGE.BaseObject.call(this, "DependencyManager");
};

FORGE.DependencyManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.DependencyManager.prototype.constructor = FORGE.DependencyManager;

/**
 * Add dependency data.
 * @method FORGE.DependencyManager#add
 * @param {Object} config - The configuration data.
 */
FORGE.DependencyManager.prototype.add = function(config)
{
    if(typeof config === "undefined")
    {
        return;
    }

    if(typeof config.url === "string")
    {
        this._dependenciesCounter++;
        this._viewer.load.script(config.url, this._scriptLoadComplete, this);
    }
};

/**
 * Internal callback when a dependency script is loaded.
 * @method FORGE.DependencyManager#_scriptLoadComplete
 * @private
 */
FORGE.DependencyManager.prototype._scriptLoadComplete = function()
{
    this._dependenciesLoaded++;

    this._allScriptsLoaded();
};

/**
 * All dependencies are loaded?
 * @method FORGE.DependencyManager#_allScriptsLoaded
 * @private
 */
FORGE.DependencyManager.prototype._allScriptsLoaded = function()
{
    if ((this._dependenciesCounter - this._dependenciesLoaded) === 0)
    {
        console.log("DependencyManager : all scripts loaded");

        if(this._onAllScriptsLoaded !== null)
        {
            this._onAllScriptsLoaded.dispatch();
        }
    }
};

/**
 * Destroy method.
 * @method FORGE.DependencyManager#destroy
 */
FORGE.DependencyManager.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
* Get the number of dependencies.
* @name FORGE.DependencyManager#dependencies
* @type {number}
*/
Object.defineProperty(FORGE.DependencyManager.prototype, "dependencies",
{
    /** @this {FORGE.DependencyManager} */
    get: function()
    {
        return this._dependenciesCounter;
    }
});

/**
 * Get the "onAllDependenciesComplete" {@link FORGE.EventDispatcher} of the DependencyManager.
 * @name FORGE.DependencyManager#onAllScriptsLoaded
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DependencyManager.prototype, "onAllScriptsLoaded",
{
    /** @this {FORGE.DependencyManager} */
    get: function()
    {
        if(this._onAllScriptsLoaded === null)
        {
            this._onAllScriptsLoaded = new FORGE.EventDispatcher(this);
        }

        return this._onAllScriptsLoaded;
    }
});
