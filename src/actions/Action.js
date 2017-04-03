/**
 * An action is a description of a method to execute in reaction to an event.<br>
 * The method will be executed from a target.
 *
 * @constructor FORGE.Action
 * @param {FORGE.Viewer} viewer - The {@link FORGE.Viewer} reference.
 * @param {ActionConfig} config - The config of the action.
 * @extends {FORGE.BaseObject}
 */
FORGE.Action = function(viewer, config)
{
    /**
     * The viewer reference.
     * @name FORGE.Action#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The config of the action.
     * @name FORGE.Action#_config
     * @type {ActionConfig}
     * @private
     */
    this._config = config;

    /**
     * The object related to this action.
     * @name FORGE.Action#_object
     * @type {(string|ActionTargetConfig)}
     * @private
     */
    this._target = "";

    /**
     * The method name with args who will be executed.
     * @name FORGE.Action#_method
     * @type {?ActionMethodConfig}
     * @private
     */
    this._method = null;

    /**
     * The property name who will be changed with the value.
     * @name FORGE.Action#_property
     * @type {?ActionPropertyConfig}
     * @private
     */
    this._property = null;

    /**
     * The number of time this action has been executed
     * @name FORGE.Action._count
     * @type {number}
     * @private
     */
    this._count = 0;

    FORGE.BaseObject.call(this, "Action");

    this._boot();
};

FORGE.Action.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Action.prototype.constructor = FORGE.Action;

/**
 * List of possible operation when you affect a property.
 * @name  FORGE.Action.operation
 * @type {Object}
 * @const
 */
FORGE.Action.operation = {};

/**
 * Operation set is the default one, it will just set the value.
 * @name  FORGE.Action.operation.SET
 * @type {string}
 * @const
 */
FORGE.Action.operation.SET = "set";

/**
 * Operation addition.
 * @name  FORGE.Action.operation.ADD
 * @type {string}
 * @const
 */
FORGE.Action.operation.ADD = "add";

/**
 * Operation substract.
 * @name  FORGE.Action.operation.SUBSTRACT
 * @type {string}
 * @const
 */
FORGE.Action.operation.SUBSTRACT = "substract";

/**
 * Operation multiply.
 * @name  FORGE.Action.operation.MULTIPLY
 * @type {string}
 * @const
 */
FORGE.Action.operation.MULTIPLY = "multiply";

/**
 * Operation divide.
 * @name  FORGE.Action.operation.DIVIDE
 * @type {string}
 * @const
 */
FORGE.Action.operation.DIVIDE = "divide";

/**
 * Operation boolean toggle.
 * @name  FORGE.Action.operation.TOGGLE
 * @type {string}
 * @const
 */
FORGE.Action.operation.TOGGLE = "toggle";

/**
 * Boot sequence.
 * @method FORGE.Action#_boot
 * @private
 */
FORGE.Action.prototype._boot = function()
{
    this._parseConfig(this._config);
    this._register();
};

/**
 * Parse the action configuration object from the json
 * @method FORGE.Action#_parseConfig
 * @param  {ActionConfig} config - Action configuration to parse
 * @private
 */
FORGE.Action.prototype._parseConfig = function(config)
{
    this._uid = config.uid;

    this._target = config.target;

    this._method = (typeof config.method !== "undefined") ? config.method : null;

    this._property = (typeof config.property !== "undefined") ? config.property : null;
};

/**
 * Parse the target.<br>
 * If undefined action will be executed on "window".<br>
 * If target start by "this" keyword, method will be searched on the action set instance.<br>
 * Target can also be the id of a plugin.
 * @method FORGE.Action#_parseTarget
 * @private
 * @param  {(string|ActionTargetConfig)} target - The target to parse.
 * @return {*} The target object.
 */
FORGE.Action.prototype._parseTarget = function(target)
{
    var result = null;

    if (typeof target === "undefined")
    {
        result = window;
    }
    else
    {
        var targetUid = target;
        var path = target;

        if (typeof target === "object")
        {
            if (typeof target.identifier === "string")
            {
                targetUid = target.identifier;
            }
            if (typeof target.accessor === "string")
            {
                path = target.accessor;
            }
        }

        // Root target
        var targetByUid = FORGE.UID.get(targetUid);

        if (typeof targetByUid !== "undefined" && targetByUid !== null)
        {
            if (FORGE.Utils.isTypeOf(targetByUid, "Plugin"))
            {
                result = targetByUid.instance;
            }
            else
            {
                result = targetByUid;
            }
        }

        // Path
        path = path.split(".");

        var i = 0;
        // If it is the viewer, reset the result to it
        if (path[0].toLowerCase() === "viewer" && result === null)
        {
            result = this._viewer;
            i = 1;
        }
        else if (result === null)
        {
            result = window;
        }

        for (var ii = path.length; i < ii; i++)
        {
            if (typeof result[path[i]] === "object")
            {
                result = result[path[i]];
            }
        }
    }

    if (result === null)
    {
        this.warn("The target of the action " + this._uid + " is invalid.");
    }

    return result;
};

/**
 * Apply the property configuration to the target.
 * @method FORGE.Action#_applyProperty
 * @param  {*} target - The target that own the desired method.
 * @param  {ActionPropertyConfig} property - The property configuration with its name and its arguments array
 * @private
 */
FORGE.Action.prototype._applyProperty = function(target, property)
{
    if (typeof target[property.name] !== "undefined")
    {
        if (typeof property.operation === "undefined")
        {
            property.operation = FORGE.Action.operation.SET;
        }

        switch (property.operation)
        {
            case FORGE.Action.operation.SET:
                target[property.name] = property.value;
                break;

            case FORGE.Action.operation.ADD:
                target[property.name] += property.value;
                break;

            case FORGE.Action.operation.SUBSTRACT:
                target[property.name] -= /** @type {number} */ (property.value);
                break;

            case FORGE.Action.operation.MULTIPLY:
                target[property.name] *= /** @type {number} */ (property.value);
                break;

            case FORGE.Action.operation.DIVIDE:
                target[property.name] /= /** @type {number} */ (property.value);
                break;

            case FORGE.Action.operation.TOGGLE:
                target[property.name] = !target[property.name];
                break;
        }
    }
};

/**
 * Apply the method configuration to the target.
 * @method FORGE.Action#_applyMethod
 * @param  {*} target - The target that own the desired method.
 * @param  {ActionMethodConfig} method - The method configuration with its name and its arguments array
 * @private
 */
FORGE.Action.prototype._applyMethod = function(target, method)
{
    if (typeof target[method.name] === "function")
    {
        var args = (typeof method.args !== "undefined") ? method.args : null;

        if (!Array.isArray(args))
        {
            args = [args];
        }

        target[method.name].apply(target, args);
    }
};

/**
 * The execute method will trigger the action, parse the target if necessary.
 * @method FORGE.Action#execute
 */
FORGE.Action.prototype.execute = function()
{
    //Get the target at the last time and do NOT keep a reference !
    var target = this._parseTarget(this._target);

    if (target !== null)
    {
        if (this._property !== null)
        {
            this._applyProperty(target, this._property);
        }

        if (this._method !== null)
        {
            this._applyMethod(target, this._method);
        }
    }
};

/**
 * Destroy sequence.
 * @method  FORGE.Action#destroy
 */
FORGE.Action.prototype.destroy = function()
{
    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};


/**
 * Get the target of the action.
 * @name FORGE.Action#target
 * @readonly
 * @type {*}
 */
Object.defineProperty(FORGE.Action.prototype, "target",
{
    /** @this {FORGE.Action} */
    get: function()
    {
        return this._parseTarget(this._target);
    }
});

/**
 * Get the number of time this action has been executed.
 * @name FORGE.Action#count
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.Action.prototype, "count",
{
    /** @this {FORGE.Action} */
    get: function()
    {
        return this._count;
    }
});