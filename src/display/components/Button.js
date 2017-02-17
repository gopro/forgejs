

/**
 * A button with three states with out, over and down.
 *
 * @constructor FORGE.Button
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {ButtonConfig=} config - The button config.
 * @extends {FORGE.DisplayObjectContainer}
 *
 * @todo  Add tween for properties
 * @todo  Ability to set image size to the defined width/height/padding/margin of the button
 */
FORGE.Button = function(viewer, config)
{
    /**
     * Button configuration object.
     * @name FORGE.Button#_config
     * @type {?ButtonConfig}
     * @private
     */
    this._config = config || null;

    /**
     * Object that handles the button skins.
     * @name FORGE.Button#_skins
     * @type {Object}
     * @private
     */
    this._skins = {};

    /**
     * Current skin name.
     * @name FORGE.Button#_skin
     * @type {string}
     * @private
     */
    this._skin = "";

    /**
     * Current state of the button.<br>
     * Available states are in {link FORGE.Button.states}.
     * @type {string}
     * @private
     */
    this._state = "";

    /**
     * Name of the default skin.
     * @name  FORGE.Button#_defaultSkin
     * @type {string}
     * @private
     */
    this._defaultSkin = "";

    /**
     * Button image component.
     * @name  FORGE.Button#_image
     * @type {FORGE.Image}
     * @private
     */
    this._image = null;

    /**
     * Button label component.
     * @name  FORGE.Button#_label
     * @type {FORGE.TextField}
     * @private
     */
    this._label = null;

    /**
     * Is this button is on auto width?
     * @name FORGE.Button#_autoWidth
     * @type {boolean}
     * @private
     */
    this._autoWidth = false;

    /**
     * Is this button is on auto height?
     * @name FORGE.Button#_autoHeight
     * @type {boolean}
     * @private
     */
    this._autoHeight = false;

    /**
     * The number of items to load.
     * @name  FORGE.Button#_itemToLoad
     * @type {number}
     * @private
     */
    //this._itemsToLoad = 0;

    /**
     * Item that are loaded.
     * @name  FORGE.Button#_itemToLoad
     * @type {number}
     * @private
     */
    this._itemsLoaded = 0;

    /**
     * Is this button loaded?
     * @name  FORGE.Button#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    FORGE.DisplayObjectContainer.call(this, viewer, null, "Button");
};

FORGE.Button.prototype = Object.create(FORGE.DisplayObjectContainer.prototype);
FORGE.Button.prototype.constructor = FORGE.Button;

/**
 * Button possible states
 * @name  FORGE.Button.states
 * @type {Object}
 * @property {string} OUT
 * @property {string} OVER
 * @property {string} DOWN
 * @const
 */
FORGE.Button.states =
{
    OUT: "out",
    OVER: "over",
    DOWN: "down"
};

/**
 * Boot sequence.
 * @method FORGE.Button#_boot
 * @private
 */
FORGE.Button.prototype._boot = function()
{
    FORGE.DisplayObjectContainer.prototype._boot.call(this);

    this._state = FORGE.Button.states.OUT;

    this._image = new FORGE.Image(this._viewer);
    this._image.onLoadComplete.add(this._itemLoadComplete, this);
    this._image.onResize.add(this._itemResizeHandler, this);
    this.addChild(this._image);

    this._label = new FORGE.TextField(this._viewer);
    this._label.onLoadComplete.add(this._itemLoadComplete, this);
    this._label.onResize.add(this._itemResizeHandler, this);
    this._label.autoWidth = true;
    this._label.autoHeight = true;
    this.addChild(this._label);

    this.pointer.enabled = true;
    this.pointer.cursor = FORGE.Pointer.cursors.POINTER;
    this.pointer.onEnter.add(this._mouseEnterHandler, this);
    this.pointer.onLeave.add(this._mouseLeaveHandler, this);
    this.pointer.onPressStart.add(this._pressStartHandler, this);
    this.pointer.onPressEnd.add(this._pressEndHandler, this);

    this._viewer.display.register(this);
    this._notifyReady();
    this._applyPending(false);

    this._viewer.i18n.onLocaleChangeComplete.add(this._localeChangeCompleteHandler, this);

    this.load(this._config);
};

/**
 * Handler for mouse enter.
 * @method FORGE.Button#_mouseEnterHandler
 * @private
 */
FORGE.Button.prototype._mouseEnterHandler = function()
{
    this._applyState(FORGE.Button.states.OVER);
};

/**
 * Handler for mouse leave.
 * @method FORGE.Button#_mouseLeaveHandler
 * @private
 */
FORGE.Button.prototype._mouseLeaveHandler = function()
{
    this._applyState(FORGE.Button.states.OUT);
};

/**
 * Handler for mouse down.
 * @method FORGE.Button#_mouseDownHandler
 * @private
 */
FORGE.Button.prototype._pressStartHandler = function()
{
    this._applyState(FORGE.Button.states.DOWN);
};

/**
 * Handler for mouse up.
 * @method FORGE.Button#_mouseUpHandler
 * @private
 */
FORGE.Button.prototype._pressEndHandler = function()
{
    this._applyState(FORGE.Button.states.OVER);
};

/**
 * Handler for localeChangeComplete.
 * @method FORGE.Button#_localeChangeCompleteHandler
 * @private
 */
FORGE.Button.prototype._localeChangeCompleteHandler = function()
{
    this._applyState(this._state);
};

/**
 * Image or Label load complete callback.
 * @method FORGE.Button._imageLoadComplete
 * @private
 */
FORGE.Button.prototype._itemLoadComplete = function(event)
{
    this.log("_itemLoadComplete "+event.emitter.className);
    this._itemsLoaded++;

    //if(this._itemsLoaded === this._itemsToLoad)
    if(this._itemsLoaded === 2)
    {
        this._allItemsLoaded();
    }
};

/**
 * This method is called after all items are loaded. (image and label).
 * @method FORGE.Button#_allItemsLoaded
 * @private
 */
FORGE.Button.prototype._allItemsLoaded = function()
{
    this.log("_allItemsLoaded");
    this._updateLayout();
    this._updateAutoSize();
    this._loaded = true;
};

/**
 * Event handler for items resize.
 * @method FORGE.Button#_itemResizeHandler
 * @private
 */
FORGE.Button.prototype._itemResizeHandler = function()
{
    this._updateLayout();
    this._updateAutoSize();
};

/**
 * Apply a skin to the button.
 * @method  FORGE.Button#_applySkin
 * @private
 * @param {string} name - The of the skin you want to apply.
 */
FORGE.Button.prototype._applySkin = function(name)
{
    this._skin = name;

    this._applyState(this._state);
};

/**
 * Apply a specified state of the current skin.
 * @method  FORGE.Button._applyState
 * @private
 * @param  {string} state - The name of the state you want to apply (listed on FORGE.Button.states)
 */
FORGE.Button.prototype._applyState = function(state)
{
    //The button is not loaded the time to apply its skin and load its ressources
    this._loaded = false;

    //Set the current state (out, over, down)
    this._state = state;

    //Get the current skin
    var skin = this._skins[this._skin];

    //Reset the load count
    this._itemsLoaded = 0;
    //this._itemsToLoad = 0;

    var hasImage = skin.hasImage(this._state);

    // if(hasImage === true)
    // {
    //     this._itemsToLoad ++;
    // }

    //var hasLabel = skin.hasLabel(this._state);
    //if(hasLabel === true)
    // {
    //     this._itemsToLoad ++;
    // }

    // var width = skin.getProperty("width", state);
    // var height = skin.getProperty("height", state);

    // if(width !== this.width)
    // {
    //     this.width = width;
    // }

    // if(height !== this.height)
    // {
    //     this.height = height;
    // }

    this.background = /** @type {string} */ (skin.getProperty("background", this._state));
    this.borderStyle = /** @type {string} */ (skin.getProperty("borderStyle", this._state));
    this.borderColor = /** @type {string} */ (skin.getProperty("borderColor", this._state));
    this.borderRadius = /** @type {number} */ (skin.getProperty("borderRadius", this._state));
    this.borderWidth = /** @type {number} */ (skin.getProperty("borderWidth", this._state));

    this._autoWidth = /** @type {boolean} */ (skin.getProperty("autoWidth", this._state));
    this._autoHeight = /** @type {boolean} */ (skin.getProperty("autoHeight", this._state));

    var label = /** @type {(string|TextFieldConfig)} */ (skin.getProperty("label", this._state)); //@todo !!!
    if(typeof label !== "undefined")
    {
        this._label.load(label);
    }

    // Image =================================

    if(hasImage === true)
    {
        this._image.load(/** @type {(string|ImageConfig)} */ (skin.getProperty("image", this._state)));
    }
    else
    {
        // this._image.load(null);
    }

    // if(hasImage === false && hasLabel === false)
    // {
    //     this._allItemsLoaded();
    // }
};

/**
 * Apply the layout of the button skin elements.
 * @method  FORGE.Button.prototype#_updateLayout
 * @private
 */
FORGE.Button.prototype._updateLayout = function()
{
    this.log("_updateLayout");

    var skin = this._skins[this._skin];
    var align = skin.getProperty("align", this._state);
    var padding = skin.getProperty("padding", this._state);
    var spacing = skin.getProperty("spacing", this._state);
    var f = skin.getProperty("first", this._state);
    var first, second;

    if(f === "label")
    {
        first = this._label;
        second = this._image;
    }
    else
    {
        first = this._image;
        second = this._label;
    }

    switch(align)
    {
        case "left":
            first.left = padding;
            first.verticalCenter = true;
            second.left = first.left + spacing + first.pixelWidth;
            second.verticalCenter = true;
            break;

        case "right":
            first.right = padding;
            first.verticalCenter = true;
            second.right = first.right + spacing + first.pixelWidth;
            second.verticalCenter = true;
            break;

        case "top":
            first.top = padding;
            first.horizontalCenter = true;
            second.top = first.top + first.pixelHeight + spacing;
            second.horizontalCenter = true;
            break;

        case "bottom":
            first.bottom = padding;
            first.horizontalCenter = true;
            second.bottom = first.bottom + spacing + first.pixelHeight;
            second.horizontalCenter = true;
            break;

        default:
            //center
            first.horizontalCenter = true;
            first.verticalCenter = true;
            second.horizontalCenter = true;
            second.verticalCenter = true;
    }

};

/**
 * Update auto sizes, ajust width and height if auto size is enabled.
 * @method  FORGE.Button#_updateAutoSize
 * @private
 */
FORGE.Button.prototype._updateAutoSize = function()
{

    this.log("_updateAutoSize");

    if(this._autoWidth === false && this._autoHeight === false)
    {
        return;
    }

    var skin = this._skins[this._skin];
    var padding = /** @type {number} */ (skin.getProperty("padding", this._state));

    if(this._autoWidth === true)
    {
        var width = this.pixelWidth;
        var xMin = Math.min(this._label.x, this._image.x);
        var xMax = Math.max(this._label.x + this._label.pixelWidth, this._image.x + this._image.pixelWidth);

        this._width = (xMax - xMin) + padding * 2 + this._borderWidth * 2;
        this._unitWidth = "px";
        this._dom.style.width = this._width+"px";

        if(width !== this.pixelWidth)
        {
            this._notifyResize({ property: "autoWidth" });
        }
    }

    if(this._autoHeight === true)
    {
        var height = this.pixelHeight;
        var yMin = Math.min(this._label.y, this._image.y);
        var yMax = Math.max(this._label.y + this._label.pixelHeight, this._image.y + this._image.pixelHeight);

        this._height = (yMax - yMin) + padding * 2 + this._borderWidth * 2;
        this._unitHeight = "px";
        this._dom.style.height = this._height+"px";

        if(height !== this.pixelHeight)
        {
            this._notifyResize({ property: "autoHeight" });
        }
    }
};

/**
 * Parse a Button configuration
 * @method FORGE.Button#_parseConfig
 * @private
 * @param  {(ButtonConfig|FORGE.ButtonSkin)} config - The configuration to parse.
 */
FORGE.Button.prototype._parseConfig = function(config)
{
    if(typeof config !== "undefined" && config !== null)
    {
        //If there is an array of skins, add them
        if(FORGE.Utils.isArrayOf(config.skins, "ButtonSkin") === true)
        {
            for(var i = 0, ii = config.skins.length; i < ii; i++)
            {
                this.addSkin(config.skins[i]);
            }
        }
        else
        {
            //convert skins object definition into FORGE.ButtonSkin objects
            if(typeof config.skins === "object" && config.skins.length > 0)
            {
                var skin;
                for(var j = 0, jj = config.skins.length; j < jj; j++)
                {
                    skin = new FORGE.ButtonSkin(config.skins[j].name, config.skins[j].states);
                    this.addSkin(skin);
                }
            }
        }
        //If there is a single skin in config, add it
        if(FORGE.Utils.isTypeOf(config.skin, "ButtonSkin"))
        {
            this.addSkin(config.skin);
        }
        else
        {
            //convert skin object definition into FORGE.ButtonSkin
            if(typeof config.skin === "object")
            {
                var singleSkin = new FORGE.ButtonSkin(config.skin.name, config.skin.states);
                this.addSkin(singleSkin);
            }
        }

        if(FORGE.Utils.isTypeOf(config.default, "string") === true && this.hasSkin(/** @type {string} */ (config.default)) === true)
        {
            this._defaultSkin = /** @type {string} */ (config.default);
        }
    }

    //If no skin found, add the default skin
    var skins = this._skins || {};
    if(Object.keys(skins).length === 0)
    {
        var defaultSkin = new FORGE.ButtonSkin("default");
        this.addSkin(defaultSkin);
        // this._skins.default = new FORGE.ButtonSkin("default");
    }

    //If no skin have been chosen pick the first one
    if(this._defaultSkin === "")
    {
        this._defaultSkin = this._skins[Object.keys(skins)[0]].name;
    }
};

/**
 * Destroy image method.
 * @method FORGE.Button#_destroyImage
 * @private
 */
FORGE.Button.prototype._destroyImage = function()
{
    if(this._image !== null)
    {
        this._image.onLoadComplete.remove(this._itemLoadComplete, this);
        this._image.onResize.remove(this._itemResizeHandler, this);

        this.removeChild(this._image, true);
        this._image = null;
    }
};

/**
 * Destroy label method.
 * @method FORGE.Button#_destroyLabel
 * @private
 */
FORGE.Button.prototype._destroyLabel = function()
{
    if(this._label !== null)
    {
        this._label.onLoadComplete.remove(this._itemLoadComplete, this);
        this._label.onResize.remove(this._itemResizeHandler, this);

        this.removeChild(this._label, true);
        this._label = null;
    }
};

/**
 * Load a button configuration.
 * @method  FORGE.Button#load
 * @param  {(ButtonConfig|FORGE.ButtonSkin)} config - The button configuration to load.
 */
FORGE.Button.prototype.load = function(config)
{
    this._parseConfig(config);
    this._applySkin(this._defaultSkin);
};

/**
 * Add a skin to the button
 * @method  FORGE.Button#addSkin
 * @param {FORGE.ButtonSkin} skin - The button skin you want to add to this button.
 * @param {boolean=} setup - Does the skin you add should be defined as the new current skin.
 */
FORGE.Button.prototype.addSkin = function(skin, setup)
{
    if(FORGE.Utils.isTypeOf(skin, "ButtonSkin") === false)
    {
        throw "FORGE.Button: Invalid button skin!";
    }

    skin.setDefaultFromState(FORGE.Button.states.OUT);
    this._skins[skin.name] = skin;

    if(setup === true)
    {
        this._applySkin(skin.name);
    }
};

/**
 * Set the button skin
 * @method FORGE.Button#setSkin
 * @param {(string|FORGE.ButtonSkin)} value - Either an existing skin name or an existing or a new {@link FORGE.ButtonSkin}
 */
FORGE.Button.prototype.setSkin = function(value)
{
    if(typeof value === "string" && FORGE.Utils.isTypeOf(this._skins[value], "ButtonSkin") === true)
    {
        this._applySkin(value);
    }
    else if(FORGE.Utils.isTypeOf(value, "ButtonSkin") === true)
    {
        if(this._skins[value.name] === value)
        {
            this._applySkin(value.name);
        }
        else if(typeof this._skins[value.name] === "undefined" || this._skins[value.name] === null)
        {
            this.addSkin(/** @type {FORGE.ButtonSkin} */ (value), true);
        }
    }
};

/**
 * Does the button has a specified skin ?
 * @param  {string}  name - The name of the skin you want to check.
 * @return {boolean} Returns true if the button have a skin with asked name.
 */
FORGE.Button.prototype.hasSkin = function(name)
{
    return (typeof this._skins[name] !== "undefined");
};

/**
 * Update the skin display, use this method if you change the skin and you need to update it.
 * @method  FORGE.Button#updateSkin
 */
FORGE.Button.prototype.updateSkin = function()
{
    this._skins[this._skin].setDefaultFromState(FORGE.Button.states.OUT);
    this._applySkin(this._skin);
};

/**
 * Destroy method.
 * @method FORGE.Button#destroy
 */
FORGE.Button.prototype.destroy = function()
{
    this._viewer.i18n.onLocaleChangeComplete.remove(this._localeChangeCompleteHandler, this);

    if(typeof this._skins !== "undefined" && this._skins.length > 0)
    {
        for(var i in this._skins)
        {
            if(this._skins.hasOwnProperty(i))
            {
                this._skins[i].destroy();
            }
        }
    }
    this._skins = {};

    this._destroyImage();

    this._destroyLabel();

    FORGE.DisplayObjectContainer.prototype.destroy.call(this);
};

/**
 * Get the skins list.
 * @name  FORGE.Button#skins
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Button.prototype, "skins",
{
    /** @this {FORGE.Button} */
    get: function()
    {
        return this._skins;
    }
});

/**
 * Get and set the current skin.
 * @name  FORGE.Button#skin
 * @type {FORGE.ButtonSkin}
 */
Object.defineProperty(FORGE.Button.prototype, "skin",
{
    /** @this {FORGE.Button} */
    get: function()
    {
        return this._skins[this._skin];
    },

    /** @this {FORGE.Button} */
    set: function(value)
    {
        this.setSkin(value);
    }
});

/**
* Get and set the flag for auto size on width.
* @name FORGE.Button#autoWidth
* @type {boolean}
*/
Object.defineProperty(FORGE.Button.prototype, "autoWidth",
{
    /** @this {FORGE.Button} */
    get: function()
    {
        return this._autoWidth;
    },

    /** @this {FORGE.Button} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._autoWidth = value;

        this._updateAutoSize();
    }
});

/**
* Get and set the flag for auto size on height.
* @name FORGE.Button#autoHeight
* @type {boolean}
*/
Object.defineProperty(FORGE.Button.prototype, "autoHeight",
{
    /** @this {FORGE.Button} */
    get: function()
    {
        return this._autoHeight;
    },

    /** @this {FORGE.Button} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._autoHeight = value;

        this._updateAutoSize();
    }
});