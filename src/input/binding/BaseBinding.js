/**
 * Base class for input bindings
 *
 * @constructor FORGE.BaseBinding
 * @param {FORGE.Viewer} viewer - The viewer reference.
 * @param {string=} className - The name of the class binding.
 * @param {Object=} context - The context in which you want your callbacks to be executed.
 * @param {string=} name - The name of the binding, can be use as an identifier.
 * @extends {FORGE.BaseObject}
 */
FORGE.BaseBinding = function(viewer, className, context, name)
{
    /**
     * Viewer reference
     * @name  FORGE.BaseBinding#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The context in which we execute down, up and hold callback.
     * @name  FORGE.BaseBinding#_context
     * @type {Object}
     * @private
     */
    this._context = context || this;

    /**
     * The name of the binding, can be usefull if multiple keycodes react for this binding.
     * @name FORGE.BaseBinding#_name
     * @type {string}
     * @private
     */
    this._name = name || "";

    FORGE.BaseObject.call(this, className);
};

FORGE.BaseBinding.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.BaseBinding.prototype.constructor = FORGE.BaseBinding;

/**
 * Destroy sequence.
 * @method FORGE.BaseBinding#destroy
 */
FORGE.BaseBinding.prototype.destroy = function()
{
    this._context = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Gets the name of this BaseBinding.
 * @name FORGE.BaseBinding#name
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.BaseBinding.prototype, "name",
{
    /** @this {FORGE.BaseBinding} */
    get: function()
    {
        return this._name;
    }
});
