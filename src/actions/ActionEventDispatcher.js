
/**
 * A action set event dispatcher is in charge to triggers actions binded on an event.
 *
 * @constructor FORGE.ActionEventDispatcher
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {string} name - The name of the event.
 * @extends {FORGE.BaseObject}
 */
FORGE.ActionEventDispatcher = function(viewer, name)
{
    /**
     * The viewer reference.
     * @name FORGE.ActionEventDispatcher#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Event name
     * @name FORGE.ActionEventDispatcher#_name
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * The actions uid list of the set.
     * @name  FORGE.ActionEventDispatcher#_actions
     * @type {Array<string>}
     * @private
     */
    this._actions = [];

    /**
     * Flag to know if the dispatcher is currently dispatching the events.
     * It happen that the dispatcher destroy method is called during the dispatching the events.
     * This allows us to re schedule the destroy call after all events have been executed.
     * @name  FORGE.ActionEventDispatcher#_dispatching
     * @type {boolean}
     * @private
     */
    this._dispatching = false;

    /**
     * Is the destroy method have been called during the dispatching?
     * @name  FORGE.ActionEventDispatcher#_pendingDestroy
     * @type {boolean}
     * @private
     */
    this._pendingDestroy = false;

    FORGE.BaseObject.call(this, "ActionEventDispatcher");
};

FORGE.ActionEventDispatcher.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ActionEventDispatcher.prototype.constructor = FORGE.ActionEventDispatcher;

/**
 * Boot sequence.
 * @method FORGE.ActionEventDispatcher#addActions
 * @param {(string|Array<string>)} actions - The actions uids you want to add
 */
FORGE.ActionEventDispatcher.prototype.addActions = function(actions)
{
    if(FORGE.Utils.isArrayOf(actions, "string") === true || FORGE.Utils.isTypeOf(actions, "string"))
    {
        this._actions = this._actions.concat(actions);
    }
};

/**
 * This method execute every actions binded on this event dispatcher.
 * @method FORGE.ActionEventDispatcher#dispatch
 */
FORGE.ActionEventDispatcher.prototype.dispatch = function()
{
    this._dispatching = true;

    for(var i = 0, ii = this._actions.length; i < ii; i++)
    {
        var action = this._viewer.actions.get(this._actions[i]);

        if(typeof action !== "undefined" && action !== null)
        {
            action.execute();
        }
    }

    this._dispatching = false;

    if(this._pendingDestroy === true)
    {
        this.destroy();
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.ActionEventDispatcher#destroy
 */
FORGE.ActionEventDispatcher.prototype.destroy = function()
{
    //If dispatching, wait for the dispatch is complete to execute the destroy
    if(this._dispatching === true)
    {
        this._pendingDestroy = true;
        return;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
