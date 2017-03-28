
/**
 * A FORGE.TextField is a display object that displays an internationalizable string.
 *
 * @constructor FORGE.TextField
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {(TextFieldConfig|string)=} config - The text field config.
 * @extends {FORGE.DisplayObject}
 *
 * @todo    vertical-align ?
 * @todo    NO WILL DO A FONT MANAGER web-fonts with <link>
 * @todo    why +1 into _updateDom method
 * @todo    DONE _updateDom and auto size won't work if not displayed
 * @todo    I don't think that margin has to be part of any display object as long as all is postionned in x/y
 * @todo  clarify _updateTextarea "calc thing"
 */
FORGE.TextField = function(viewer, config)
{
    //CONTAINER @todo
    //margin
    //padding
    //shadow + range + angle + color + alpha : box-shadow: none|     h-shadow v-shadow blur spread color [inset]    |initial|inherit;

    //GOOGLE FONT @todo
    //to add :
    //<link href='https://fonts.googleapis.com/css?family=Open+Sans&subset=latin,vietnamese' rel='stylesheet' type='text/css'>
    //@import url(https://fonts.googleapis.com/css?family=Open+Sans&subset=latin,vietnamese);
    //to use
    //font-family: 'Open Sans', sans-serif;
    //
    // this._webfont = ""; //@todo test with google font url + font name (and options) as attributes
    // this._stdfont = "sans-serif";

    //_editable
    //todo editable => textarea with some css values + boxSizing + parent width and height if no values
    //ENTER => validate save data and set it as textfield.

    /**
     * Button Configuration object.
     * @name  FORGE.TextField#_config
     * @type {(TextFieldConfig|string|undefined)}
     * @private
     */
    this._config = config;

    /**
     * i18n key for internationalizable strings.
     * @name  FORGE.TextField#_i18nKey
     * @type {string}
     * @private
     */
    this._i18nKey = "";

    /**
     * Flag to know if the textfield is in i18n mode.
     * @name FORGE.TextField#_i18n
     * @type {boolean}
     * @private
     */
    this._i18n = false;

    /**
     * Internal {@link FORGE.LocaleString} reference.
     * @name  FORGE.TextField#_i18nLocaleString
     * @type {FORGE.LocaleString}
     * @private
     */
    this._i18nLocaleString = null;

    /**
     * Internal reference to the string that the text field have to display.
     * @name  FORGE.TextField#_value
     * @type {string}
     * @private
     */
    this._value = "";

    /**
     * Internal reference to the color of the displayed string, can be any CSS value.
     * @name  FORGE.TextField#_color
     * @type {string}
     * @private
     */
    this._color = "rgb(0, 0, 0)";

    /**
     * Does the text field manages its width automatically?
     * @name  FORGE.TextField#_autoWidth
     * @type {boolean}
     * @private
     */
    this._autoWidth = true;

    /**
     * Does the text field manages its height automatically?
     * @name  FORGE.TextField#_autoHeight
     * @type {boolean}
     * @private
     */
    this._autoHeight = true;

    /**
     * Margin of the text.
     * @name  FORGE.TextField#_margin
     * @type {number}
     * @private
     */
    //this._margin = 0;

    /**
     * Padding of the text.
     * @name  FORGE.TextField#_padding
     * @type {(number|string)}
     * @private
     */
    this._padding = 0;

    /**
     * Is the text is user selectable?
     * @name  FORGE.TextField#_selectable
     * @type {boolean}
     * @private
     */
    this._selectable = false;

    /**
     * Is the text is user editable?<br>
     * When edited the textfield is converted into a textarea element until the ENTER key is pressed.
     * @name  FORGE.TextField#_editable
     * @type {boolean}
     * @private
     */
    this._editable = false;

    /**
     * Reference to the keybinding used for the editable feature.
     * @name  FORGE.TextField#_editableKeyBinding
     * @type {FORGE.KeyBinding}
     * @private
     */
    this._editableKeyBinding = null;

    /**
     * Is the text can be breaked when reach the max width ?<br>
     * Will be unactive if autoWidth is set to true.
     * @name  FORGE.TextField#_wordWrap
     * @type {boolean}
     * @private
     */
    this._wordWrap = false;

    /**
     * The text-align CSS value. Can be "", "inherit", "left", "right", "center" and "justify".
     * @name  FORGE.TextField#_textAlign
     * @type {string}
     * @private
     */
    this._textAlign = "";

    /**
     * The text-decoration CSS value. Can be "", "inherit", "none", "underline", "overline" and "line-through".
     * @name  FORGE.TextField#_textDecoration
     * @type {string}
     * @private
     */
    this._textDecoration = "";

    /**
     * The text-shadow CSS value. Can be "", "inherit", "none" or a properties list. The properties that can be set, are (in order): "h-shadow v-shadow blur-radius color".
     * @name  FORGE.TextField#_textShadow
     * @type {string}
     * @private
     */
    this._textShadow = "";

    /**
     * The text-transform CSS value. Can be "", "inherit", "none", "capitalize", "uppercase" or "lowercase".
     * @name  FORGE.TextField#_textTransform
     * @type {string}
     * @private
     */
    this._textTransform = "";

    /**
     * The text-overflow CSS value. Can be "", "clip", "ellipsis", "initial", "inherit" or a string to render the clip.
     * @name  FORGE.TextField#_textOverflow
     * @type {string}
     * @private
     */
    this._textOverflow = "";

    /**
     * The white-space CSS value. Can be "", "normal", "nowrap", "pre", "pre-line", "pre-wrap", "initial" or "inherit".
     * @name  FORGE.TextField#_whiteSpace
     * @type {string}
     * @private
     */
    this._whiteSpace = "";

    /**
     * The font CSS value. Can be "", "inherit" or a properties list. The properties that can be set, are (in order): "font-style font-variant font-weight font-size/line-height font-family".<br>
     * The font-size and font-family values are required.
     * @name  FORGE.TextField#_font
     * @type {string}
     * @private
     */
    this._font = "";

    /**
     * The font-family CSS value. Can be "", inherit" or a web safe font family name.<br>
     * List of the web safe fonts :<br>
     * Serif<br>
     * - "Times New Roman", Times, serif<br>
     * - Georgia, serif<br>
     * - "Palatino Linotype", "Book Antiqua", Palatino, serif<br>
     * Sans-serif<br>
     * - Arial, Helvetica, sans-serif<br>
     * - Verdana, Geneva, sans-serif<br>
     * - "Arial Black", Gadget, sans-serif<br>
     * - "Comic Sans MS", cursive, sans-serif<br>
     * - Impact, Charcoal, sans-serif<br>
     * - "Lucida Sans Unicode", "Lucida Grande", sans-serif<br>
     * - Tahoma, Geneva, sans-serif<br>
     * - "Trebuchet MS", Helvetica, sans-serif<br>
     * Monospace<br>
     * - "Courier New", Courier, monospace<br>
     * - "Lucida Console", Monaco, monospace
     * @name  FORGE.TextField#_font
     * @type {string}
     * @private
     */
    this._fontFamily = "";

    /**
     * The font-size CSS value. Can be "", "inherit", "medium", "xx-small", "x-small", "small", "large", "x-large", "xx-large", "smaller", "larger", % or length.
     * @name  FORGE.TextField#_fontSize
     * @type {string}
     * @private
     */
    this._fontSize = "";

    /**
     * The font-style CSS value. Can be "", "inherit", "normal" or "italic".
     * @name  FORGE.TextField#_fontStyle
     * @type {string}
     * @private
     */
    this._fontStyle = "";

    /**
     * The font-weight CSS value. Can be "", "inherit", "normal" (400), "bold" (700), "bolder", "lighter" or a value between 100 and 900.
     * @name  FORGE.TextField#_fontWeight
     * @type {string}
     * @private
     */
    this._fontWeight = "";

    /**
     * The font-variant CSS value. Can be "", "inherit", "normal" or "small-caps".
     * @name  FORGE.TextField#_fontVariant
     * @type {string}
     * @private
     */
    this._fontVariant = "";

    /**
     * The line-height CSS value. Can be "", "inherit", "normal", % or length.
     * @name  FORGE.TextField#_lineHeight
     * @type {string}
     * @private
     */
    this._lineHeight = "";

    /**
     * This is the dom element into which the value will be injected
     * @name  FORGE.TextField#_span
     * @type {(Element|HTMLSpanElement)}
     * @private
     */
    this._span = null;

    /**
     * The textarea element to replace the textfield once set as "editable".
     * @name FORGE.TextField#_textArea
     * @type {(Element|HTMLTextAreaElement)}
     * @private
     */
    this._textArea = null;

    /**
     * This is a reference to clickHandler function but with a different this bind reference.
     * @name  FORGE.TextField#_clickBind
     * @type {Function}
     * @private
     */
    this._clickBind = null;

    /**
     * This is a reference to changeHandler function but with a different this bind reference.
     * @name  FORGE.TextField#_changeBind
     * @type {Function}
     * @private
     */
    this._changeBind = null;

    /**
     * This is a reference to blurHandler function but with a different this bind reference.
     * @name  FORGE.TextField#_blurBind
     * @type {Function}
     * @private
     */
    this._blurBind = null;

    /**
     * Has this TextField loaded its configuration?
     * @name  FORGE.TextField#_loaded
     * @type {boolean}
     * @private
     */
    this._loaded = false;

    /**
     * Event dispatcher for onValueChange event
     * @name  FORGE.TextField#_onValueChange
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onValueChange = null;

    /**
     * Event dispatcher for onLoadComplete event
     * @name  FORGE.TextField#_onLoadComplete
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLoadComplete = null;

    FORGE.DisplayObject.call(this, viewer, null, "TextField");
};


FORGE.TextField.prototype = Object.create(FORGE.DisplayObject.prototype);
FORGE.TextField.prototype.constructor = FORGE.TextField;

/**
 * Boot sequence.
 * @method FORGE.TextField#_boot
 * @private
 */
FORGE.TextField.prototype._boot = function()
{
    FORGE.DisplayObject.prototype._boot.call(this);

    this._clickBind = this._clickHandler.bind(this);
    this._changeBind = this._changeHandler.bind(this);
    this._blurBind = this._blurHandler.bind(this);

    this._span = document.createElement("span");
    this._dom.appendChild(this._span);

    if(typeof this._config !== "undefined" && this._config !== null)
    {
        this.load(this._config);
    }

    this._viewer.display.register(this);
    this._notifyReady();
    this._applyPending(false);
};

/**
 * Notify that the dispay object has been resized.<br>
 * This method ovverrides the {@link FORGE.DisplayObject} method.
 * @method  FORGE.TextField#_notifyResize
 * @private
 * @param  {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.TextField.prototype._notifyResize = function(data)
{
    var property = data.property;

    //If property is related to width except autoWidth
    if(property.toLowerCase().indexOf("width") !== -1 && property !== "autoWidth")
    {
        this._autoWidth = false;
    }

    //If property is related to height except autoHeight
    if(property.toLowerCase().indexOf("height") !== -1 && property !== "autoHeight")
    {
        this._autoHeight = false;
    }

    //this._updateTextarea();

    FORGE.DisplayObject.prototype._notifyResize.call(this, data);
};

/**
 * Notify that the dispay object is now visible.<br>
 * This method ovverrides the {@link FORGE.DisplayObject} method.
 * @method  FORGE.TextField#_notifyShow
 * @private
 */
FORGE.TextField.prototype._notifyShow = function()
{
    this._updateAutoSize();

    FORGE.DisplayObject.prototype._notifyShow.call(this);
};

/**
 * Update the dom with a new value.
 * @method FORGE.TextField#_updateValue
 * @param {(number|string)} value - The new value to display.
 * @private
 */
FORGE.TextField.prototype._updateValue = function(value)
{
    if(value !== this._value)
    {
        this._value = String(value);
        this._span.innerHTML = value;
        this._updateAutoSize();
        this._updateAnchors();

        if(this._onValueChange !== null)
        {
            this._onValueChange.dispatch();
        }
    }

    if(this._i18n === false || (this._i18n === true && this._i18nLocaleString.loaded === true))
    {
        this._loaded = true;

        if(this._onLoadComplete !== null)
        {
            this._onLoadComplete.dispatch();
        }
    }
};

/**
 * Update auto sizes, ajust width and height if auto size is enabled.
 * @method  FORGE.TextField#_updateAutoSize
 * @private
 */
FORGE.TextField.prototype._updateAutoSize = function()
{
    //If not in dom, no need to update autosize!
    if(this.isInDom() === false)
    {
        return;
    }

    if(this._autoWidth === true)
    {
        var width = this.pixelWidth;
        this._dom.style.width = "";

        //increment the width by 1 to follow the possible float value returned by the browser
        var w = this._dom.offsetWidth;
        if(w > 0)
        {
            w += 1;
        }

        this._width = w;
        this._unitWidth = "px";
        this._dom.style.width = this._width+"px";

        if(width !== this._width)
        {
            this._notifyResize({ property: "autoWidth" });
        }
    }

    if(this._autoHeight === true)
    {
        var height = this.pixelHeight;
        this._dom.style.height = "";

        //increment the height by 1 to follow the possible float value returned by the browser
        var h = this._dom.offsetHeight;
        if(h > 0)
        {
            h += 1;
        }

        this._height = h;
        this._unitHeight = "px";
        this._dom.style.height = this._height+"px";

        if(height !== this._height)
        {
            this._notifyResize({ property: "autoHeight" });
        }
    }
};

/**
 * Create an internal {@link FORGE.LocaleString} for internationalization.
 * @method FORGE.TextField#_createLocaleString
 * @private
 */
FORGE.TextField.prototype._createLocaleString = function()
{
    if(this._i18nLocaleString === null)
    {
        this._i18nLocaleString = new FORGE.LocaleString(this._viewer, this._i18nKey);
    }

    this._updateValue(this._i18nLocaleString.value);
};

/**
 * Binds an event listener for locale change.
 * @method FORGE.TextField#_createLocaleStringEvent
 * @private
 */
FORGE.TextField.prototype._createLocaleStringEvent = function()
{
    if(this._viewer.i18n.onLocaleChangeComplete.has(this._localeChangeComplete, this) === false)
    {
        this._viewer.i18n.onLocaleChangeComplete.add(this._localeChangeComplete, this);
    }
};

/**
 * Event handler for locale change.
 * @method FORGE.TextField#_localeChangeComplete
 * @private
 */
FORGE.TextField.prototype._localeChangeComplete = function()
{
    this.log("_localeChangeComplete");

    if(this._viewer.i18n.hasValue(this._i18nKey) === true)
    {
        this.value = this._i18nLocaleString.value;
    }
};

/**
 * Handler for textarea linked to the textfield if "editable" is set to true.
 * @method FORGE.TextField#_textareaResizeHandler
 * @private
 */
FORGE.TextField.prototype._updateTextarea = function()
{
    // if(this._editable === false)
    // {
    //     return;
    // }

    // if(this.pixelWidth !== 0)
    // {
    //     this._textArea.style.width = this.pixelWidth+"px";
    // }
    // else
    // {
    //     this._textArea.style.width = "calc(100% - "+(this._dom.style.marginLeft+this._dom.style.marginRight)+")";
    // }

    // if(this.pixelHeight !== 0)
    // {
    //     this._textArea.style.height = this.pixelHeight+"px";
    // }
    // else
    // {
    //     this._textArea.style.height = "calc(100% - "+(this._dom.style.marginTop+this._dom.style.marginBottom)+")";
    // }
};

/**
 * Event handler on textarea for keyup event.
 * @method FORGE.TextField#_textareaInput
 * @param  {Event} event - The onkeyup event.
 * @private
 */
// FORGE.TextField.prototype._textareaInput = function(event)
// {
//     if(event.keyCode === 13 && event.shiftKey === false && event.ctrlKey === false)
//     {
//         this.tfElement.value = this.value;

//         this.tfElement.editable = false;

//     }
//     else if(event.keyCode === 13)
//     {
//         this.value = this.value + "\n";
//     }
//     else if(event.keyCode === 27)
//     {
//         this.tfElement.editable = false;
//     }
// };

/**
 * Event handler for click on the textfield, to switch to editable mode.
 * @method  FORGE.TextField#_clickHandler
 * @private
 */
FORGE.TextField.prototype._clickHandler = function()
{
    if(this._editable === true && this._textArea === null)
    {
        this._createInput();
        this._textArea.focus();
    }
};

/**
 * Event handler for input change on the textarea.
 * @method  FORGE.TextField#_changeHandler
 * @private
 */
FORGE.TextField.prototype._changeHandler = function()
{
    this._updateValue(this._textArea.value);
};

/**
 * Event handler for blut on textaera, will quit edit mode on blur.
 * @method FORGE.TextField#_blurHandler
 * @private
 */
FORGE.TextField.prototype._blurHandler = function()
{
    this._destroyInput();
};

/**
 * Create a textarea to enter in editable mode.
 * @method FORGE.TextField#_createInput
 * @private
 */
FORGE.TextField.prototype._createInput = function()
{
    this._editing = true;

    this._textArea = document.createElement("textarea");

    this._textArea.style.position = "absolute";
    this._textArea.style.top = "0px";
    this._textArea.style.left = "0px";
    this._textArea.style.width = "100%"; //this.innerWidth+"px";
    this._textArea.style.height = "100%"; //this.innerHeight+"px";
    this._textArea.style.resize = "none"; // Prevent the browser resize corner
    this._textArea.style.margin = "0px";
    this._textArea.style.padding = "0px";
    this._textArea.style.overflowX = "hidden";
    this._textArea.style.overflowY = "auto";
    this._textArea.style.boxSizing = "border-box";

    this._textArea.value = this._value;

    this._textArea.addEventListener("input", this._changeBind, false);
    this._textArea.addEventListener("blur", this._blurBind, false);

    this._dom.appendChild(this._textArea);
};

/**
 * Destroy the textarea to leave the editable mode.
 * @method FORGE.TextField#_destroyInput
 * @private
 */
FORGE.TextField.prototype._destroyInput = function()
{
    this._editing = false;

    if(this._textArea !== null)
    {
        this._textArea.removeEventListener("input", this._changeBind, false);
        this._textArea.removeEventListener("blur", this._blurBind, false);
        this._dom.removeChild(this._textArea);
        this._textArea = null;
    }
};

/**
 * Parse the TextField configuration.
 * @method  FORGE.TextField#_parseConfig
 * @private
 * @param  {(TextFieldConfig|string)} config - The TextField object config or a string that is an i18n key.
 */
FORGE.TextField.prototype._parseConfig = function(config)
{
    if(typeof config === "object" && config !== null)
    {
        if(config.color)
        {
            this.color = config.color;
        }
        if(config.font)
        {
            this.font = config.font;
        }
        if(config.fontFamily)
        {
            this.fontFamily = config.fontFamily;
        }
        if(config.fontWeight)
        {
            this.fontWeight = config.fontWeight;
        }
        if(config.fontSize)
        {
            this.fontSize = config.fontSize;
        }
        if(config.fontStyle)
        {
            this.fontStyle = config.fontStyle;
        }
        if(config.fontVariant)
        {
            this.fontVariant = config.fontVariant;
        }
        if(config.textAlign)
        {
            this.textAlign = config.textAlign;
        }
        if(config.textShadow)
        {
            this.textShadow = config.textShadow;
        }
        if(config.textDecoration)
        {
            this.textDecoration = config.textDecoration;
        }
        if(config.textOverflow)
        {
            this.textOverflow = config.textOverflow;
        }
        if(config.textTransform)
        {
            this.textTransform = config.textTransform;
        }
        if(config.whiteSpace)
        {
            this.whiteSpace = config.whiteSpace;
        }
        if(config.wordWrap)
        {
            this.wordWrap = config.wordWrap;
        }
        if(config.lineHeight)
        {
            this.lineHeight = config.lineHeight;
        }
        if(config.autoWidth)
        {
            this.autoWidth = config.autoWidth;
        }
        if(config.autoHeight)
        {
            this.autoHeight = config.autoHeight;
        }
        if(config.padding)
        {
            this.padding = config.padding;
        }
        if(config.selectable)
        {
            this.selectable = config.selectable;
        }
        if(config.editable)
        {
            this.editable = config.editable;
        }

        this._i18n = config.i18n || false;

        //If there is a i18n key in the configuration
        if(this._i18n === true)
        {
            this._i18nKey = config.value;
        }
        else
        {
            this.value = config.value;
        }
    }
    else if(typeof config === "string")
    {
        this._i18n = false;
        this.value = config;
    }
};

/**
 * Load a textfield configuration.
 * @method  FORGE.TextField#load
 * @param  {(TextFieldConfig|string)} config - The config object to load, if it's a simple string will try to get i18n from the string.
 */
FORGE.TextField.prototype.load = function(config)
{
    this._loaded = false;

    this._parseConfig(config);

    if(this._i18n === true && (typeof this._i18nKey === "string" && this._i18nKey !== ""))
    {
        this._createLocaleString();
        this._createLocaleStringEvent();
    }
};

/**
 * Destroy method.
 * @method FORGE.TextField#destroy
 */
FORGE.TextField.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    if(this._i18nLocaleString !== null)
    {
        this._i18nLocaleString.destroy();
        this._i18nLocaleString = null;
        this._viewer.i18n.onLocaleChangeComplete.remove(this._localeChangeComplete, this);
    }

    this._destroyInput();

    if(this._onLoadComplete !== null)
    {
        this._onLoadComplete.destroy();
        this._onLoadComplete = null;
    }

    if(this._onValueChange !== null)
    {
        this._onValueChange.destroy();
        this._onValueChange = null;
    }

    FORGE.DisplayObject.prototype.destroy.call(this);
};

/**
* Get and set the i18n key of the textfield value.
* @name FORGE.TextField#i18nValue
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "i18nValue",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._i18nKey;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        if(this._i18nKey === "")
        {
            this._createLocaleStringEvent();
        }

        this._i18n = true;
        this._i18nKey = value;

        this._createLocaleString();
    }
});

/**
 * Get the flag to know if this TextField works in i18n mode.
 * @name  FORGE.TextField#i18n
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(FORGE.TextField.prototype, "i18n",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._i18n;
    }
});

/**
* Get and set the value displayed by the text field.<br>
* You'll lose the i18n behavior if you use this setter.
* @name FORGE.TextField#value
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "value",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._value;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if((typeof value !== "string" && typeof value !== "number"))
        {
            return;
        }

        this._i18n = false;
        this._updateValue(value);
    }
});

/**
* Get and set the color CSS of the text.
* @name FORGE.TextField#color
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "color",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._color;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._color = value;
        this._dom.style.color = this._color;
    }
});

/**
* Get and set the font CSS of the text.
* @name FORGE.TextField#font
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "font",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._font;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        var valueArray = value.split(" ").toString();
        if(valueArray.length < 2)
        {
            return;
        }

        this._font = value.replace(/"/g, "\"");
        this._dom.style.font = this._font;

        //this._updateAutoSize();
    }
});

/**
* Get and set the font-family CSS of the text.
* @name FORGE.TextField#fontFamily
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "fontFamily",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._fontFamily;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._fontFamily = value.replace(/"/g, "\"");
        this._dom.style.fontFamily = this._fontFamily;

        this._updateAutoSize();
    }
});

/**
* Get and set the line-height CSS of the text.
* @name FORGE.TextField#fontSize
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "fontSize",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._fontSize;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "number" && typeof value !== "string")
        {
            return;
        }

        if (typeof value === "number")
        {
            value = value+"px";
        }

        this._fontSize = value;
        this._dom.style.fontSize = this._fontSize;

        //this._updateAutoSize();
    }
});

/**
* Get and set the font-style CSS of the text.
* @name FORGE.TextField#fontStyle
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "fontStyle",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._fontStyle;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._fontStyle = value;
        this._dom.style.fontStyle = this._fontStyle;

        //this._updateAutoSize();
    }
});

/**
* Get and set the font-weight CSS of the text.
* @name FORGE.TextField#fontWeight
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "fontWeight",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._fontWeight;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string" && typeof value !== "number")
        {
            return;
        }

        this._fontWeight = value.toString();
        this._dom.style.fontWeight = this._fontWeight;

        //this._updateAutoSize();
    }
});

/**
* Get and set the font-variant CSS of the text.
* @name FORGE.TextField#fontVariant
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "fontVariant",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._fontVariant;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._fontVariant = value;
        this._dom.style.fontVariant = this._fontVariant;
    }
});

/**
* Get and set the line-height CSS of the text.
* @name FORGE.TextField#lineHeight
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "lineHeight",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._lineHeight;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "number" && typeof value !== "string")
        {
            return;
        }

        if (typeof value === "number")
        {
            value = value+"px";
        }

        this._lineHeight = value;
        this._dom.style.lineHeight = this._lineHeight;
    }
});

/**
* Get and set the text-align CSS of the text.
* @name FORGE.TextField#textAlign
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "textAlign",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._textAlign;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._textAlign = value;
        this._dom.style.textAlign = this._textAlign;
    }
});

/**
* Get and set the text-shadow CSS of the text.
* @name FORGE.TextField#textShadow
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "textShadow",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._textShadow;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._textShadow = value;
        this._dom.style.textShadow = this._textShadow;
    }
});

/**
* Get and set the text-decoration CSS of the text.
* @name FORGE.TextField#textDecoration
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "textDecoration",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._textDecoration;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._textDecoration = value;
        this._dom.style.textDecoration = this._textDecoration;
    }
});

/**
* Get and set the text-transform CSS of the text.
* @name FORGE.TextField#textTransform
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "textTransform",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._textTransform;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._textTransform = value;
        this._dom.style.textTransform = this._textTransform;
    }
});

/**
* Get and set the flag for auto size on width.
* @name FORGE.TextField#autoWidth
* @type {boolean}
*/
Object.defineProperty(FORGE.TextField.prototype, "autoWidth",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._autoWidth;
    },

    /** @this {FORGE.TextField} */
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
* @name FORGE.TextField#autoHeight
* @type {boolean}
*/
Object.defineProperty(FORGE.TextField.prototype, "autoHeight",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._autoHeight;
    },

    /** @this {FORGE.TextField} */
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

/**
* Get and set the padding CSS value of the text.
* @name FORGE.TextField#padding
* @type {(number|string)}
*/
Object.defineProperty(FORGE.TextField.prototype, "padding",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._padding;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "number" && typeof value !== "string")
        {
            return;
        }

        if (typeof value === "string")
        {
            var valueArray = value.split(" ", 4).toString();
            value = valueArray.replace(/,/g, " ");
        }
        else
        {
            value = value+"px";
        }

        this._padding = value;
        this._dom.style.padding = this._padding;
    }
});

/**
* Get and set the selectable property of the text.
* @name FORGE.TextField#selectable
* @type {boolean}
*/
Object.defineProperty(FORGE.TextField.prototype, "selectable",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._selectable;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._selectable = value;
        if(this._selectable === false)
        {
            if(this._editable === false && this._restoreMouse === true)
            {
                this.pointer.enabled = false;
                this._restoreMouse = false;
            }

            this._dom.style.userSelect = "none";
            this._dom.style.webkitUserSelect = "none";
            this._dom.style.mozUserSelect = "none";
            this._dom.style.msUserSelect = "none";
            this._dom.style.webkitTouchCallout = "none";
        }
        else
        {
            if(this.pointer.enabled === false)
            {
                this.pointer.enabled = true;
                this._restoreMouse = true;
            }

            this._dom.style.userSelect = "text";
            this._dom.style.webkitUserSelect = "text";
            this._dom.style.mozUserSelect = "text";
            this._dom.style.msUserSelect = "text";
            this._dom.style.webkitTouchCallout = "inherit";
        }
    }
});

/**
* Get and set the word-wrap CSS property of the text.
* @name FORGE.TextField#wordWrap
* @type {boolean}
*/
Object.defineProperty(FORGE.TextField.prototype, "wordWrap",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._wordWrap;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._wordWrap = value;
        if(this._wordWrap === false)
        {
            this._dom.style.wordWrap = "normal";
        }
        else
        {
            this._dom.style.wordWrap = "break-word";
        }
    }
});

/**
* Get and set the white-space CSS property of the text.
* @name FORGE.TextField#whiteSpace
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "whiteSpace",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._whiteSpace;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._whiteSpace = value;
        this._dom.style.whiteSpace = this._whiteSpace;
    }
});

/**
* Get and set the text-overflow CSS property of the text.
* @name FORGE.TextField#textOverflow
* @type {string}
*/
Object.defineProperty(FORGE.TextField.prototype, "textOverflow",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._textOverflow;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        this._textOverflow = value;
        this._dom.style.textOverflow = this._textOverflow;
    }
});

/**
 * Get and set the editable status for the textfield.<br>
 * When editable is set to true the textfield is transformed into a textarea field.<br>
 * Important: the editable status must be set after the textfield add into a container.
 * @name FORGE.TextField#editable
 * @type {boolean}
 */
Object.defineProperty(FORGE.TextField.prototype, "editable",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._editable;
    },

    /** @this {FORGE.TextField} */
    set: function(value)
    {
        var bool = Boolean(value);

        if(this._editable === bool)
        {
            return;
        }

        this._editable = bool;

        if(this._editable === false)
        {
            this._dom.removeEventListener("click", this._clickBind, this !== null && this !== undefined);

            this._viewer.keyboard.removeBinding(this._editableKeyBinding);
            this._editableKeyBinding = null;

            this.pointer.enabled = true;
            this._dom.style.cursor = "text";
        }
        else
        {
            this._dom.addEventListener("click", this._clickBind, this !== null && this !== undefined);

            this._editableKeyBinding = new FORGE.KeyBinding(this._viewer, [13, 27], this._destroyInput, null, null, null, this);
            this._viewer.keyboard.addBinding(this._editableKeyBinding);

            this._dom.style.cursor = "default";
        }
    }
});

/**
* Get the loaded status of the TextField.
* @name FORGE.TextField#loaded
* @readonly
* @type {boolean}
*/
Object.defineProperty(FORGE.TextField.prototype, "loaded",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        return this._loaded;
    }
});

/**
* Get the onLoadComplete {@link FORGE.EventDispatcher}.
* @name FORGE.TextField#onLoadComplete
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.TextField.prototype, "onLoadComplete",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        if(this._onLoadComplete === null)
        {
            this._onLoadComplete = new FORGE.EventDispatcher(this);
        }

        return this._onLoadComplete;
    }
});

/**
* Get the onValueChange {@link FORGE.EventDispatcher}.
* @name FORGE.TextField#onValueChange
* @readonly
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.TextField.prototype, "onValueChange",
{
    /** @this {FORGE.TextField} */
    get: function()
    {
        if(this._onValueChange === null)
        {
            this._onValueChange = new FORGE.EventDispatcher(this);
        }

        return this._onValueChange;
    }
});
