
/**
 * This class describe a button skin.
 * @constructor FORGE.ButtonSkin
 * @param {string=} name - The name of this button skin.
 * @param {Object=} states - An object that describe the different states.
 * @extends {FORGE.BaseObject}
 */
FORGE.ButtonSkin = function(name, states)
{
    /**
     * Button skin name.
     * @name FORGE.ButtonSkin#_config
     * @type {string}
     * @private
     */
    this._name = name || "";

    /**
     * Default skin state.
     * @name FORGE.ButtonSkin#_defaultState
     * @type {ButtonSkinStateConfig}
     * @private
     */
    this._defaultState = /** @type {ButtonSkinStateConfig} */ (FORGE.Utils.extendSimpleObject(FORGE.ButtonSkin.DEFAULT_STATE, {}));

    /**
     * List of skin states.
     * @name FORGE.ButtonSkin#_states
     * @type {Object<ButtonSkinStateConfig>}
     * @private
     */
    this._states = /** @type {Object<ButtonSkinStateConfig>} */ (FORGE.Utils.extendSimpleObject((states || {}), {"out": {}, "over": {}, "down": {}}));

    FORGE.BaseObject.call(this, "ButtonSkin");
};

FORGE.ButtonSkin.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.ButtonSkin.prototype.constructor = FORGE.ButtonSkin;

/**
 * This is the empty Skin state for image
 * @name  FORGE.ButtonSkin.EMPTY_STATE_IMAGE
 * @type {ImageConfig}
 * @const
 */
FORGE.ButtonSkin.EMPTY_STATE_IMAGE =
{
    key: "",
    url: "",
    i18n: false,
    keepRatio: true,
    maximized: false,
    alpha: 1
};

/**
 * This is the empty Skin state for label
 * @name  FORGE.ButtonSkin.EMPTY_STATE_LABEL
 * @type {TextFieldConfig}
 * @const
 */
FORGE.ButtonSkin.EMPTY_STATE_LABEL =
{
    value: "",
    i18n: false,
    color: "",
    fontFamily: "",
    fontWeight: ""
};

/**
 * This is the empty Skin state
 * @name  FORGE.ButtonSkin.EMPTY_STATE
 * @type {ButtonSkinStateConfig}
 * @const
 */
FORGE.ButtonSkin.EMPTY_STATE =
{
    name: "",
    background: "",
    borderStyle: "solid",
    borderColor: "",
    borderRadius: 0,
    borderWidth: 0,
    autoWidth: true,
    autoHeight: true,
    align: "center",
    padding: 0,
    spacing: 0,
    first: "image",

    image: /** @type {ImageConfig} */ (FORGE.ButtonSkin.EMPTY_STATE_IMAGE),

    label: /** @type {TextFieldConfig} */ (FORGE.ButtonSkin.EMPTY_STATE_LABEL)
};

/**
 * This is the empty Skin state for image
 * @name  FORGE.ButtonSkin.DEFAULT_STATE_IMAGE
 * @type {ImageConfig}
 * @const
 */
FORGE.ButtonSkin.DEFAULT_STATE_IMAGE =
{
    key: "",
    url: "",
    i18n: false,
    keepRatio: true,
    maximized: false,
    alpha: 1
};

/**
 * This is the empty Skin state for label
 * @name  FORGE.ButtonSkin.DEFAULT_STATE_LABEL
 * @type {TextFieldConfig}
 * @const
 */
FORGE.ButtonSkin.DEFAULT_STATE_LABEL =
{
    value: "Button",
    i18n: false,
    color: "",
    fontFamily: "",
    fontWeight: ""
};

/**
 * This is the default Skin
 * @name  FORGE.ButtonSkin.DEFAULT_STATE
 * @type {ButtonSkinStateConfig}
 * @const
 */
FORGE.ButtonSkin.DEFAULT_STATE =
{
    name: "default",
    background: "#eee",
    borderStyle: "solid",
    borderColor: "#555",
    borderRadius: 5,
    borderWidth: 2,
    autoWidth: true,
    autoHeight: true,
    align: "left",
    padding: 5,
    spacing: 0,
    first: "image",

    image: /** @type {ImageConfig} */ (FORGE.ButtonSkin.DEFAULT_STATE_IMAGE),

    label: /** @type {TextFieldConfig} */ (FORGE.ButtonSkin.DEFAULT_STATE_LABEL)
};

/**
 * Set the default skin from a declared state, by default the default skin state will be "out".
 * @method FORGE.ButtonSkin#setDefaultFromState
 * @param {string} name - The name of the state that you want to be the default one.
 */
FORGE.ButtonSkin.prototype.setDefaultFromState = function(name)
{
    if(typeof this._states[name] !== "undefined")
    {
        //this._defaultState = FORGE.Utils.extendSimpleObject(FORGE.ButtonSkin.EMPTY_STATE, this._states[name]);
        //this._defaultState = FORGE.Utils.extendSimpleObject(this._defaultState, this._states[name]);
        this._defaultState = this._states[name];
    }
};

/**
 * Static method to validate a {@link FORGE.ButtonSkin}
 * @method  FORGE.ButtonSkin.isValid
 * @static
 * @param  {FORGE.ButtonSkin} skin
 * @return {boolean} Returns true if the button skin is valid.
 */
FORGE.ButtonSkin.isValid = function(skin)
{
    // @todo This is WIP obviously
    if(skin)
    {
        return true;
    }

    return false;
};

/**
 * Get a property of a specified state.
 * @method FORGE.ButtonSkin#getProperty
 * @param  {string} property - The property name you want to get (eg: "borderColor")
 * @param  {string} state - For which state you want the property ? (out, ouver or down)
 * @return {*} Returns the property you asked for, if the property doesn't exist on the requested state, this will return a default value.
 */
FORGE.ButtonSkin.prototype.getProperty = function(property, state)
{
    var result = FORGE.Utils.getObjectProperty(this._states, state+"."+property,
                        FORGE.Utils.getObjectProperty(this._defaultState, property,
                            FORGE.Utils.getObjectProperty(FORGE.ButtonSkin.EMPTY_STATE, property)));

    if(typeof result === "object")
    {
        result = FORGE.Utils.extendSimpleObject(this._defaultState[property], /** @type {Object} */ (result));
    }

    return result;
};

/**
 * Know if a skin state has an image?
 * @method  FORGE.ButtonSkin#hasImage
 * @param  {string} state - For which state you want to know if there is an image ? (out, ouver or down)
 * @return {boolean} Returns true if the specified state has an image
 */
FORGE.ButtonSkin.prototype.hasImage = function(state)
{
    var image = this.getProperty("image", state);
    return (typeof image !== "undefined" && (typeof image.url === "string" && image.url !== ""));
};

/**
 * Know if a skin state has a label?
 * @method  FORGE.ButtonSkin#hasLabel
 * @param  {string} state - For which state you want to know if there is a label ? (out, ouver or down)
 * @return {boolean} Returns true if the specified state has a label
 */
FORGE.ButtonSkin.prototype.hasLabel = function(state)
{
    var label = this.getProperty("label", state);
    return (typeof label !== "undefined" && (typeof label.value === "string" && label.value !== ""));
};

/**
 * Get the name of this skin.
 * @name FORGE.ButtonSkin#name
 * @type {string}
 */
Object.defineProperty(FORGE.ButtonSkin.prototype, "name",
{
    /** @this {FORGE.ButtonSkin} */
    get: function()
    {
        return this._name;
    }
});

/**
 * Get and set the default state of this skin.
 * @name FORGE.ButtonSkin#default
 * @type {ButtonSkinStateConfig}
 */
Object.defineProperty(FORGE.ButtonSkin.prototype, "default",
{
    /** @this {FORGE.ButtonSkin} */
    get: function()
    {
        return this._defaultState;
    },

    /** @this {FORGE.ButtonSkin} */
    set: function(value)
    {
        this._defaultState = value;
    }
});

/**
 * Get and set the "out" state of this skin.
 * @name FORGE.ButtonSkin#out
 * @type {ButtonSkinStateConfig}
 */
Object.defineProperty(FORGE.ButtonSkin.prototype, "out",
{
    /** @this {FORGE.ButtonSkin} */
    get: function()
    {
        return this._states.out;
    },

    /** @this {FORGE.ButtonSkin} */
    set: function(value)
    {
        this._states.out = value;
    }
});

/**
 * Get and set the "over" state of this skin.
 * @name FORGE.ButtonSkin#over
 * @type {ButtonSkinStateConfig}
 */
Object.defineProperty(FORGE.ButtonSkin.prototype, "over",
{
    /** @this {FORGE.ButtonSkin} */
    get: function()
    {
        return this._states.over;
    },

    /** @this {FORGE.ButtonSkin} */
    set: function(value)
    {
        this._states.over = value;
    }
});

/**
 * Get and set the "down" state of this skin.
 * @name FORGE.ButtonSkin#down
 * @type {ButtonSkinStateConfig}
 */
Object.defineProperty(FORGE.ButtonSkin.prototype, "down",
{
    /** @this {FORGE.ButtonSkin} */
    get: function()
    {
        return this._states.down;
    },

    /** @this {FORGE.ButtonSkin} */
    set: function(value)
    {
        this._states.down = value;
    }
});
