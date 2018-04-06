/**
 * Action manager
 * @constructor FORGE.ActionManager
 * @param {FORGE.Viewer} viewer - viewer reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.ActionManager = function(viewer)
{
    /**
     * Viewer reference.
     * @name FORGE.ActionManager#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Actions array.
     * @name FORGE.ActionManager#_actions
     * @type {Array<FORGE.Action>}
     * @private
     */
    this._actions = [];

    FORGE.BaseObject.call(this, "ActionManager");
};

FORGE.ActionManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ActionManager.prototype.constructor = FORGE.ActionManager;

/**
 * Parse an array of configuration
 * @param {(Array<ActionConfig>|ActionConfig)} config - Array of action configurations or a single action configuration.
 * @private
 */
FORGE.ActionManager.prototype._parseConfig = function(config)
{
    var action;

    // If it is an array of actions
    if (Array.isArray(config) === true)
    {
        for (var i = 0, ii = config.length; i < ii; i++)
        {
            action = new FORGE.Action(this._viewer, config[i]);
            this._actions.push(action);
        }
    }
    // If it is a single action
    else
    {
        action = new FORGE.Action(this._viewer, /** @type {ActionConfig} */ (config));
        this._actions.push(action);
    }
};

/**
 * Add actions configuration
 * @method FORGE.ActionManager#loadConfig
 * @param {(Array<ActionConfig>|ActionConfig)} config - Array of action configurations or a single action configuration.
 */
FORGE.ActionManager.prototype.loadConfig = function(config)
{
    if (typeof config === "object" && config !== null)
    {
        this._parseConfig(config);
    }
};

/**
 * Get an action by its UID.
 * @method FORGE.ActionManager#get
 * @param {string} uid - The UID of the action you want to get.
 */
FORGE.ActionManager.prototype.get = function(uid)
{
    return FORGE.UID.get(uid, "Action");
};

/**
 * Destroy routine
 * @method FORGE.ActionManager#destroy
 */
FORGE.ActionManager.prototype.destroy = function()
{
    if (FORGE.Utils.isArrayOf(this._actions, "Action"))
    {
        while (this._actions.length > 0)
        {
            var a = this._actions.pop();
            a.destroy();
            a = null;
        }
    }

    this._actions = null;

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};