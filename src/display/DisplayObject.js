
/**
 * A display object is a visual element which has width / height and coordianate x / y in space.<br>
 * It's a way to create and manipulate a div element, many other class inherit from this one.
 *
 * @constructor FORGE.DisplayObject
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {Element|HTMLElement=} dom - Use a specific dom element to be the display object, if undefined a div will be created.
 * @param {string=} className - The className of the object as long as many other object inherits from this one.
 * @extends {FORGE.BaseObject}
 *
 * @todo Define a better behavior for anchors / margins. If we set a top and a bottom anchor what happen ?
 * @todo Do the last anchor have the priority ? Does the DisplayObject will change its height if a top and a bottom anchors are set ?
 * @todo  Remove the _borderUpdate, at least find a way to do it properly ?!
 */
FORGE.DisplayObject = function(viewer, dom, className)
{
    /**
     * The viewer reference.
     * @name FORGE.DisplayObject#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The dom element that represent the display object.
     * @name FORGE.DisplayObject#_dom
     * @type {Element|HTMLElement}
     * @private
     */
    this._dom = dom || null;

    /**
     * The parent element of the display object, generally it is a {@link FORGE.DisplayObjectContainer}.
     * @name FORGE.DisplayObject#_parent
     * @type {?FORGE.DisplayObjectContainer|HTMLElement}
     * @private
     */
    this._parent = null;

    /**
     * The index of the display object, understand it as the z-index CSS property.
     * @name FORGE.DisplayObject#_index
     * @type {number}
     * @private
     */
    this._index = 0;

    /**
     * The id of the display object, this id is associated to the dom element.
     * @name  FORGE.DisplayObject#_id
     * @type {string}
     * @private
     */
    this._id = "";

    /**
     * The x position of the display object relative to it's parent origin.
     * @name  FORGE.DisplayObject#_x
     * @type {number}
     * @private
     */
    this._x = 0;

    /**
     * The x position of the display object relative to it's parent origin.
     * @name  FORGE.DisplayObject#_y
     * @type {number}
     * @private
     */
    this._y = 0;

    /**
     * Does this display object have to automatically keeps its ratio when width or height change?
     * @name  FORGE.DisplayObject#_keepRatio
     * @type {boolean}
     * @private
     */
    this._keepRatio = false;

    /**
     * The width of the display object whatever is its unit, it can be pixel or percent.
     * @name  FORGE.DisplayObject#_width
     * @type {number}
     * @private
     */
    this._width = 0;

    /**
     * The unit of the display object's width, it can be "px" or "%".
     * @name  FORGE.DisplayObject#_unitWidth
     * @type {string}
     * @private
     */
    this._unitWidth = "px";

    /**
     * The display object's scale width.
     * @name  FORGE.DisplayObject#_scaleWidth
     * @type {number}
     * @private
     */
    this._scaleWidth = 1;

    /**
     * The height of the display object whatever is its unit, it can be pixel or percent.
     * @name  FORGE.DisplayObject#_height
     * @type {number}
     * @private
     */
    this._height = 0;

    /**
     * The unit of the display object's height, it can be "px" or "%".
     * @name  FORGE.DisplayObject#_unitHeight
     * @type {string}
     * @private
     */
    this._unitHeight = "px";

    /**
     * The display object's scale height.
     * @name  FORGE.DisplayObject#_scaleHeight
     * @type {number}
     * @private
     */
    this._scaleHeight = 1;

    /**
     * Does this display object have to center (horizontally) itself inside its parent?
     * @name  FORGE.DisplayObject#_horizontalCenter
     * @type {boolean}
     * @private
     */
    this._horizontalCenter = false;

    /**
     * Does this display object have to center (vertically) itself inside its parent?
     * @name  FORGE.DisplayObject#_verticalCenter
     * @type {boolean}
     * @private
     */
    this._verticalCenter = false;

    /**
     * The top anchor of the display object inside its parent? It can be null.
     * @name  FORGE.DisplayObject#_top
     * @type {?number}
     * @private
     */
    this._top = null;

    /**
     * The right anchor of the display object inside its parent? It can be null.
     * @name  FORGE.DisplayObject#_right
     * @type {?number}
     * @private
     */
    this._right = null;

    /**
     * The bottom anchor of the display object inside its parent? It can be null.
     * @name  FORGE.DisplayObject#_bottom
     * @type {?number}
     * @private
     */
    this._bottom = null;

    /**
     * The left anchor of the display object inside its parent? It can be null.
     * @name  FORGE.DisplayObject#_left
     * @type {?number}
     * @private
     */
    this._left = null;

    /**
     * The alpha value of the display object (0 to 1).
     * @name  FORGE.DisplayObject#_alpha
     * @type {number}
     * @private
     */
    this._alpha = 1;

    /**
     * The rotation value of the display object (in degree).
     * @name  FORGE.DisplayObject#_rotation
     * @type {number}
     * @private
     */
    this._rotation = 0;

    /**
     * The {@link FORGE.Pointer} reference for this display object.
     * @name  FORGE.DisplayObject#_pointer
     * @type {FORGE.Pointer}
     * @private
     */
    this._pointer = null;

    /**
     * The {@link FORGE.Drag} module reference for this display Object.
     * @name FORGE.DisplayObject#_drag
     * @type {FORGE.Drag}
     * @private
     */
    this._drag = null;

    /**
     * The background CSS value for this display object.
     * @name  FORGE.DisplayObject#_background
     * @type {string}
     * @private
     */
    this._background = "";

    /**
     * The border-style CSS value for this display object.
     * @name  FORGE.DisplayObject#_borderStyle
     * @type {string}
     * @private
     */
    this._borderStyle = "solid";

    /**
     * The border-width CSS value for this display object.
     * @name  FORGE.DisplayObject#_borderWidth
     * @type {number}
     * @private
     */
    this._borderWidth = 0;

    /**
     * The border-color CSS value for this display object.
     * @name  FORGE.DisplayObject#_borderColor
     * @type {string}
     * @private
     */
    this._borderColor = "rgb(0, 0, 0)";

    /**
     * The border-radius CSS value for this display object.
     * @name  FORGE.DisplayObject#_borderRadius
     * @type {number}
     * @private
     */
    this._borderRadius = 0;

    /**
     * Does this display object have to be maximized (in size) inside its parent.
     * @name  FORGE.DisplayObject#_maximized
     * @type {boolean}
     * @private
     */
    this._maximized = false;

    /**
     * The tooltip of this display object. It's the "title" value of the dom element.
     * @name  FORGE.DisplayObject#_tooltip
     * @type {string}
     * @private
     */
    this._tooltip = "";

    /**
     * Any custom data you want to associate to this display object.
     * @name  FORGE.DisplayObject#_data
     * @type {?Object}
     * @private
     */
    this._data = null;

    /**
     * Is this display object is ready?
     * @name  FORGE.DisplayObject#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * Does the display object have to put some properties in pending ?
     * @name FORGE.DisplayObject#_needPending
     * @type {boolean}
     * @private
     */
    this._needPending = true;

    /**
     * This object save pending values to be applied after the display object will be ready.
     * @name  FORGE.DisplayObject#_pending
     * @type {?Object}
     * @private
     */
    this._pending = null;

    /**
     * This is a flag to set if the display object is currently applying its pending values when ready.
     * @name  FORGE.DisplayObject#_pendingApplying
     * @type {boolean}
     * @private
     */
    this._pendingApplying = false;

    /**
     * This object is here to store data when fullscreen state changes.<br>
     * @name  FORGE.DisplayObject#_fullscreenData
     * @type {?ScreenData}
     * @private
     */
    this._fullscreenData = null;

    /**
     * On ready event dispatcher.
     * @name  FORGE.DisplayObject#_onReady
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    /**
     * On resize event dispatcher.
     * @name  FORGE.DisplayObject#_onResize
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onResize = null;

    /**
     * On border resize event dispatcher.
     * @name FORGE.DisplayObject#_onBorderResize
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onBorderResize = null;

    /**
     * On move event dispatcher.
     * @name  FORGE.DisplayObject#_onMove
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMove = null;

    /**
     * On added to parent event dispatcher
     * @name  FORGE.DisplayObject#_onAddedToParent
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onAddedToParent = null;

    /**
     * On added to dom event dispatcher
     * @name  FORGE.DisplayObject#_onAddedToDom
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onAddedToDom = null;

    /**
     * On show event dispatcher
     * @name  FORGE.DisplayObject#_onShow
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onShow = null;

    /**
     * On hide event dispatcher
     * @name  FORGE.DisplayObject#_onHide
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onHide = null;

    /**
     * On fullscreen enter event dispatcher
     * @name  FORGE.DisplayObject#_onFullscreenEnter
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onFullscreenEnter = null;

    /**
     * On fullscreen exit event dispatcher
     * @name  FORGE.DisplayObject#_onFullscreenExit
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onFullscreenExit = null;

    FORGE.BaseObject.call(this, className || "DisplayObject");

    this._boot();
};

FORGE.DisplayObject.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.DisplayObject.prototype.constructor = FORGE.DisplayObject;

/**
 * Boot sequence.
 * @method FORGE.DisplayObject#_boot
 * @private
 */
FORGE.DisplayObject.prototype._boot = function()
{
    if(this._ready === true)
    {
        return;
    }

    this._register();

    this._createDom();

    this._pending = [];

    //Many object extends the DisplayObject, it's the only one that can be ready here!
    if(this._className === "DisplayObject")
    {
        this._viewer.display.register(this);
        this._notifyReady();
        this._applyPending(false);
    }
};

/**
 * Create the dom if not specified, apply default CSS.
 * @method FORGE.DisplayObject#_createDom
 * @private
 */
FORGE.DisplayObject.prototype._createDom = function()
{
    if(typeof this._dom === "undefined" || this._dom === null)
    {
        this._dom = document.createElement("div");
    }
    else
    {
        //Dom is predifined we have to determine width height stuff
        this._width = FORGE.Dom.getValueWidth(this._dom);
        this._unitWidth = FORGE.Dom.getUnitWidth(this._dom);

        this._height = FORGE.Dom.getValueHeight(this._dom);
        this._unitHeight = FORGE.Dom.getUnitHeight(this._dom);
    }

    this._dom.style.width = this._width+""+this._unitWidth;
    this._dom.style.height = this._height+""+this._unitHeight;

    this._dom.style.display = "block";
    this._dom.style.position = "relative";
    this._dom.style.margin = "0px";
    this._dom.style.padding = "0px";
    this._dom.style.top = this._y+"px";
    this._dom.style.left = this._x+"px";
    this._dom.style.overflow = "hidden";
    this._dom.style.boxSizing = "border-box";

    if(FORGE.Device.cssPointerEvents === true)
    {
        this._dom.style.pointerEvents = "none";
    }

    this._dom.style.userSelect = "none";
    this._dom.style.webkitUserSelect = "none";
    this._dom.style.mozUserSelect = "none";
    this._dom.style.msUserSelect = "none";
    this._dom.style.webkitTouchCallout = "none";

    this._dom.style.borderStyle = this._borderStyle;
    this._dom.style.borderWidth = this._borderWidth+"px";
    this._dom.style.borderColor = this._borderColor;
    this._dom.style.background = this._background;
};

/**
 * Method to notify that the display object is ready !<br>
 * This part of of code is here to be overrided by object that inherits from display object.
 * @method  FORGE.DisplayObject#_notifyReady
 * @private
 */
FORGE.DisplayObject.prototype._notifyReady = function()
{
    if(this._ready === true)
    {
        return;
    }

    this.log("_notifyReady");
    this._ready = true;

    if(this._onReady !== null)
    {
        this._onReady.dispatch();
    }
};

/**
 * Internal method used by parents to notify that this DisplayObject has been added to DOM.
 * @method FORGE.DisplayObject#_notifyAddedToDom
 * @private
 */
FORGE.DisplayObject.prototype._notifyAddedToDom = function()
{
    this.log("_notifyAddedToDom");

    if(this._onAddedToDom !== null)
    {
        this._onAddedToDom.dispatch();
    }
};

/**
 * Notify that the visibility of this DisplayObject has changed to visible.
 * @method FORGE.DisplayObject#_notifyShow
 * @private
 */
FORGE.DisplayObject.prototype._notifyShow = function()
{
    this.log("_notifyShow");

    if(this.isInDom() === false)
    {
        return;
    }

    if(this._onShow !== null && this.visible === true)
    {
        this._onShow.dispatch();
    }
};

/**
 * Notify that the visibility of this DisplayObject has changed to invisible.
 * @method FORGE.DisplayObject#_notifyHide
 * @private
 */
FORGE.DisplayObject.prototype._notifyHide = function()
{
    this.log("_notifyHide");

    if(this._onHide !== null && this.visible === false)
    {
        this._onHide.dispatch();
    }
};

/**
 * Method to notify that borders has been resized.<br>
 * This can be override by other class that inherits from DisplayObject.
 * @method  FORGE.DisplayObject#_notifyBorderResize
 * @private
 */
FORGE.DisplayObject.prototype._notifyBorderResize = function()
{
    if(this._onBorderResize !== null)
    {
        this._onBorderResize.dispatch();
    }
};

/**
 * Method used by parents to adapt size and position.
 * @method FORGE.DisplayObject#_notifyParentResize
 * @private
 * @param {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.DisplayObject.prototype._notifyParentResize = function(data)
{
    if(this._maximized === true)
    {
        this.maximize(this._maximized);
    }

    this._updatePercentValues(data.property);
    this._updateAnchors();
};

/**
 * Notify that the dispay object has been resized.<br>
 * This method can be overrided by object that extends FORGE.DisplayObject.
 * @method  FORGE.DisplayObject#_notifyResize
 * @private
 * @param {PropertyToUpdate} data - The data contains the property that have changed.
 */
FORGE.DisplayObject.prototype._notifyResize = function(data)
{
    this._updateAnchors();

    if(this._onResize !== null)
    {
        this._onResize.dispatch(data);
    }
};

/**
 * Notify the display object that it entered in fullscreen.
 * @method FORGE.DisplayObject#_notifyfullscreenEnter
 * @private
 */
FORGE.DisplayObject.prototype._notifyFullscreenEnter = function()
{
    this.log("_notifyFullscreenEnter");

    this._fullscreenSaveData();

    if(this._onFullscreenEnter !== null)
    {
        this._onFullscreenEnter.dispatch();
    }
};

/**
 * Notify the display object that it left fullscreen mode.
 * @method FORGE.DisplayObject#_notifyFullscreenExit
 * @private
 */
FORGE.DisplayObject.prototype._notifyFullscreenExit = function()
{
    this.log("_notifyFullscreenChange");

    this._fullscreenRestoreData();

    if(this._onFullscreenExit !== null)
    {
        this._onFullscreenExit.dispatch();
    }
};

/**
 * Save the display object state into fullscreenData for further restoration.<br>
 * Set the object's dom css to be in fullscreen.
 * @method FORGE.DisplayObject#_fullscreenSaveData
 * @private
 */
FORGE.DisplayObject.prototype._fullscreenSaveData = function()
{
    this.log("_fullscreenSaveData");

    this._fullscreenData =
    {
        x: this._x,
        y: this._y,

        width: this._width,
        unitWidth: this._unitWidth,
        height: this._height,
        unitHeight: this._unitHeight,

        top: this._top,
        right: this._right,
        bottom: this._bottom,
        left: this._left
    };

    this._x = 0;
    this._y = 0;

    this._width = screen.width;
    this._unitWidth = "px";
    this._dom.style.width = this._width+"px";

    this._height = screen.height;
    this._unitHeight = "px";
    this._dom.style.height = this._height+"px";

    this._top = null;
    this._right = null;
    this._bottom = null;
    this._left = null;

    this._dom.style.top = "0";
    this._dom.style.left = "0";

    this._notifyResize({property: "both"});
};

/**
 * Restore the object state at what it was before fullscreen.
 * Happens on fullscreen exit.
 * @method FORGE.DisplayObject#_fullscreenRestoreData
 * @private
 */
FORGE.DisplayObject.prototype._fullscreenRestoreData = function()
{
    this.log("_fullscreenRestoreData");

    this._x = this._fullscreenData.x;
    this._dom.style.left = this._x+"px";
    this._y = this._fullscreenData.y;
    this._dom.style.top = this._y+"px";

    this._width = this._fullscreenData.width;
    this._unitWidth = this._fullscreenData.unitWidth;
    this._dom.style.width = this.pixelWidth+"px";

    this._height = this._fullscreenData.height;
    this._unitHeight = this._fullscreenData.unitHeight;
    this._dom.style.height = this.pixelHeight+"px";

    this._top = this._fullscreenData.top;
    this._right = this._fullscreenData.right;
    this._bottom = this._fullscreenData.bottom;
    this._left = this._fullscreenData.left;

    //this._updateAnchors();
    this._notifyResize({property: "both"});

    this._fullscreenData = null;
};

/**
 * Apply anchor values. Adapt the position of the display object according to its anchors and its alignement flags.
 * @method FORGE.DisplayObject#_updateAnchors
 * @private
 */
FORGE.DisplayObject.prototype._updateAnchors = function()
{
    //No need to update anchors if has no parent or no size!
    if(this._parent === null || this._width === 0 || this._height === 0)
    {
        return;
    }

    this.log("_updateAnchors");

    if(this._horizontalCenter === true)
    {
        this.horizontalCenter = true;
    }
    else
    {
        this.left = this._left;
        this.right = this._right;
    }

    if(this._verticalCenter === true)
    {
        this.verticalCenter = true;
    }
    else
    {
        this.top = this._top;
        this.bottom = this._bottom;
    }
};

/**
 * Update width or height if it's set in percent. It happened when a parent is set or if the parent is resize.
 * @method FORGE.DisplayObject#_updatePercentValues
 * @private
 * @param {string} property - The property that have changed.
 */
FORGE.DisplayObject.prototype._updatePercentValues = function(property)
{
    var widthRelated = property.toLowerCase().indexOf("width") !== -1 || property === "both";
    var heightRelated = property.toLowerCase().indexOf("height") !== -1 || property === "both";
    var notification = 0;

    if(widthRelated === true && this._unitWidth === "%")
    {
        this._dom.style.width = this.pixelWidth+"px";
        this._dom.width = this.pixelWidth;
        notification += 1;
    }

    if(heightRelated === true && this._unitHeight === "%")
    {
        this._dom.style.height = this.pixelHeight+"px";
        this._dom.height = this.pixelHeight;
        notification += 2;
    }

    switch(notification)
    {
        case 1:
            this._notifyResize({ property: "width" });
            break;
        case 2:
            this._notifyResize({ property: "height" });
            break;
        case 3:
            this._notifyResize({ property: "both" });
            break;
        default:
            // no notification needed
    }
};

/**
 * Internal method that add a pending value for a specific property.
 * @method FORGE.DisplayObject#_addPending
 * @private
 * @param {string} prop - The property name for the pending value.
 * @param {*} value - The value you want to associate to the property.
 */
FORGE.DisplayObject.prototype._addPending = function(prop, value)
{
    //this._pending[prop] = value;
    this._pending.push(
    {
        prop: prop,
        value: value
    });
};

/**
 * Internal method to known if a property have a pending value.
 * @method FORGE.DisplayObject#_hasPending
 * @private
 * @param {string} prop - The property name for the pending value.
 * @return {boolean} Returns true if the property have a pending value, false if not.
 */
FORGE.DisplayObject.prototype._hasPending = function(prop)
{
    //return (typeof this._pending[prop] !== "undefined");
    for(var i = 0, ii = this._pending.length; i < ii; i++)
    {
        if(this._pending[i].prop === prop)
        {
            return true;
        }
    }

    return false;
};

/**
 * Method to clear a specific property from the pending list
 * @method  FORGE.DisplayObject#_clearPending
 * @private
 * @param  {string=} prop - The prop to clear, if not specified clear all the pending
 */
FORGE.DisplayObject.prototype._clearPending = function(prop)
{
    if(typeof prop === "string")
    {
        //delete this._pending[prop];
        var i = this._pending.length;

        while(i--)
        {
            if(this._pending[i].prop === prop)
            {
                this._pending.splice(i, 1);
            }
        }
    }
    else
    {
        this._pending = [];
    }
};

/**
 * Apply all the pending values then reset the object that stores these values.
 * @method FORGE.DisplayObject#_applyPending
 * @private
 * @param {boolean} needPending - does it need pending ?
 */
FORGE.DisplayObject.prototype._applyPending = function(needPending)
{
    this.log("_applyPending");

    this._needPending = needPending;

    if(this._pending === null || this._pending.length === 0)
    {
        return;
    }

    this._pendingApplying = true;

    // for(var prop in this._pending)
    // {
    //     this[prop] = this._pending[prop];
    // }

    for(var i = 0, ii = this._pending.length; i < ii; i++)
    {
        this[this._pending[i].prop] = this._pending[i].value;
    }

    this._pendingApplying = false;

    this._clearPending();
};

/**
 * Show this display object.
 * @method FORGE.DisplayObject#show
 */
FORGE.DisplayObject.prototype.show = function()
{
    this._dom.style.display = "block";
    this._notifyShow();
};

/**
 * Hide this display object.
 * @method FORGE.DisplayObject#hide
 */
FORGE.DisplayObject.prototype.hide = function()
{
    this._dom.style.display = "none";
    this._notifyHide();
};

/**
 * Toggles th visibility of this display object.
 * @method  FORGE.DisplayObject#toggleVisibility
 */
FORGE.DisplayObject.prototype.toggleVisibility = function()
{
    this.visible = !this.visible;
};

/**
 * Maximize the size of this display object to the size of its parent.
 * @method FORGE.DisplayObject#maximize
 * @param {boolean} keepMaximized - Set this param to true if you want that this display object auto resize to max when its parent is resized.
 */
FORGE.DisplayObject.prototype.maximize = function(keepMaximized)
{
    if(keepMaximized === true)
    {
        this._maximized = true;

        if(this._needPending === true)
        {
            this._addPending("maximized", true);
        }
    }

    if(this._parent !== null)
    {
        this._keepRatio = false;

        var width = this.pixelWidth;
        this._width = this._parent.innerWidth;
        this._unitWidth = "px";
        this._dom.style.width = this._parent.innerWidth+"px";
        this._dom.width = this._parent.innerWidth;

        var height = this.pixelHeight;
        this._height = this._parent.innerHeight;
        this._unitHeight = "px";
        this._dom.style.height = this._parent.innerHeight+"px";
        this._dom.height = this._parent.innerHeight;

        if(width !== this.pixelWidth || height !== this.pixelHeight)
        {
            this._notifyResize({ property: "both" });
        }
    }
};

/**
 * Method to know if a display object is in dom.
 * @method  FORGE.DisplayObject#isInDom
 * @return {boolean} Returns true if the display Object is in DOM, false if not.
 */
FORGE.DisplayObject.prototype.isInDom = function()
{
    return FORGE.Dom.has(this._dom);
};

/**
 * Resize this display object to a given width / height.
 * @method FORGE.DisplayObject#resize
 * @param {number|string} width - The width you want to set, it can be for example 10, "10px" or "10%".
 * @param {number|string} height - The height you want to set, it can be for example 10, "10px" or "10%".
 */
FORGE.DisplayObject.prototype.resize = function(width, height)
{
    if(width !== null && typeof width !== "undefined")
    {
        this.width = width;
    }

    if(height !== null && typeof height !== "undefined")
    {
        this.height = height;
    }
};

/**
 * Request a fullscreen enter on this display object.
 * @method  FORGE.DisplayObject#fullscreenEnter
 */
FORGE.DisplayObject.prototype.fullscreenEnter = function()
{
    if(document[FORGE.Device.fullscreenEnabled] === true && this.isFullscreen() === false)
    {
        this._dom[FORGE.Device.requestFullscreen]();
    }
};

/**
 * Request a fullscreen exit on this display object.
 * @method  FORGE.DisplayObject#fullscreenExit
 */
FORGE.DisplayObject.prototype.fullscreenExit = function()
{
    if(document[FORGE.Device.fullscreenEnabled] === true && this.isFullscreen() === true)
    {
        document[FORGE.Device.exitFullscreen]();
    }
};

/**
 * Know if this display object is in fullscreen
 * @method  FORGE.DisplayObject#isFullscreen
 * @return {boolean}
 */
FORGE.DisplayObject.prototype.isFullscreen = function()
{
    return document[FORGE.Device.fullscreenElement] === this._dom;
};

/**
 * Destroy method.
 * @method FORGE.DisplayObject#destroy
 */
FORGE.DisplayObject.prototype.destroy = function()
{
    if(this._alive === false)
    {
        return;
    }

    this._viewer.display.unregister(this);

    if(this._parent !== null)
    {
        this._parent.removeChild(this, false);
        this._parent = null;
    }

    if(this._pointer !== null)
    {
        this._pointer.destroy();
        this._pointer = null;
    }

    if(this._drag !== null)
    {
        this._drag.destroy();
        this._drag = null;
    }

    if(this._onResize !== null)
    {
        this._onResize.destroy();
        this._onResize = null;
    }

    if(this._onBorderResize !== null)
    {
        this._onBorderResize.destroy();
        this._onBorderResize = null;
    }

    if(this._onReady !== null)
    {
        this._onReady.destroy();
        this._onReady = null;
    }

    if(this._onAddedToParent !== null)
    {
        this._onAddedToParent.destroy();
        this._onAddedToParent = null;
    }

    if(this._onAddedToDom !== null)
    {
        this._onAddedToDom.destroy();
        this._onAddedToDom = null;
    }

    if(this._onFullscreenEnter !== null)
    {
        this._onFullscreenEnter.destroy();
        this._onFullscreenEnter = null;
    }

    if(this._onFullscreenExit !== null)
    {
        this._onFullscreenExit.destroy();
        this._onFullscreenExit = null;
    }

    this._dom = null;

    this._data = null;

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the viewer reference object.
 * @name FORGE.DisplayObject#viewer
 * @readonly
 * @type {FORGE.Viewer}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "viewer",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._viewer;
    }
});

/**
 * Get the dom element that compose this display object.
 * @name FORGE.DisplayObject#dom
 * @readonly
 * @type {Element|HTMLElement}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "dom",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._dom;
    }
});

/**
 * Get and set the id of this display object.
 * @name FORGE.DisplayObject#id
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "id",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._id;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        this._id = value;
        this._dom.id = this._id;
    }
});

/**
 * Get the ready status of this display object.
 * @name FORGE.DisplayObject#ready
 * @readonly
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "ready",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get and set the parent of this display object.
 * @name FORGE.DisplayObject#parent
 * @type {FORGE.DisplayObjectContainer}
 *
 * @todo  Find a clean way to identify DisplayObjectContainer and other class that inherits from.
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "parent",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._parent;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "object" || Array.isArray(value.children) === false || value === this._parent)
        {
            return;
        }

        this._parent = value;
        this._dom.style.position = "absolute";

        if(this._maximized === true)
        {
            this.maximize(this._maximized);
        }

        this._updatePercentValues("both");
        this._updateAnchors();

        if(this._onAddedToParent !== null)
        {
            this._onAddedToParent.dispatch();
        }

        if(this._parent.isInDom() === true)
        {
            this._notifyAddedToDom();
            this._notifyShow();
        }
    }
});

/**
 * Get and set the visibility of this display object.
 * @name FORGE.DisplayObject#visible
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "visible",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._dom.style.display === "block";
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        if(value === true)
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }
});

/**
 * Get and set the x position of this display object.
 * @name FORGE.DisplayObject#x
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "x",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._x;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var x = this._x;
        this._x = value;
        this._dom.style.left = this._x+"px";

        if(this._onMove !== null && x !== this._x)
        {
            this._onMove.dispatch({ property: "x" });
        }
    }
});

/**
 * Get and set the y position of this display object.
 * @name FORGE.DisplayObject#y
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "y",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._y;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var y = this._y;
        this._y = value;
        this._dom.style.top = this._y+"px";

        if(this._onMove !== null && y !== this._y)
        {
            this._onMove.dispatch({ property: "y" });
        }
    }
});

/**
 * Get and set the keepRatio status of this display object.
 * @name FORGE.DisplayObject#keepRatio
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "keepRatio",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._keepRatio;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean" || value === this._keepRatio)
        {
            return;
        }

        this._keepRatio = value;
    }
});

/**
 * Get and set the width of this display object.
 * The getter will always return a number, but you can pass to the setter either a number like 10 or a string like "10px" or "10%".
 * @name FORGE.DisplayObject#width
 * @type {number|string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "width",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._width;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        var width = this._width;
        var unitWidth = this._unitWidth;

        if(typeof value === "string")
        {
            var size = FORGE.Utils.parseSizeString(value);

            if(size.value === null || size.unit === null)
            {
                throw "FORGE.DisplayObject.width value "+value+" is incorrect";
            }

            this._unitWidth = size.unit;
            this._width = size.value;
        }
        else if(typeof value === "number")
        {
            this._width = value;
        }
        else
        {
            return;
        }

        if(this._needPending === true)
        {
            this._addPending("width", this._width);
            return;
        }

        this._maximized = false;

        this._dom.style.width = this.pixelWidth+"px";
        this._dom.width = this.pixelWidth;

        if((width !== this._width || unitWidth !== this._unitWidth) || this._pendingApplying === true)
        {
            this._notifyResize({ property: "width" });
        }
    }
});

/**
 * Get and set the width of this display object in pixel only.
 * @name FORGE.DisplayObject#pixelWidth
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "pixelWidth",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._unitWidth === "px")
        {
            return this._width;
        }
        else if (this._unitWidth === "%")
        {
            if(this._parent !== null)
            {
                return this._parent.innerWidth * this._width / 100;
            }
            else
            {
                return 0;
            }
        }
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var width = this._width;
        var unitWidth = this._unitWidth;

        this._width = value;
        this._unitWidth = "px";

        if(this._needPending === true)
        {
            this._addPending("pixelWidth", value);
            return;
        }

        this._maximized = false;

        this._dom.style.width = this.pixelWidth+"px";
        this._dom.width = this.pixelWidth;

        if((width !== this._width || unitWidth !== "px") || this._pendingApplying === true)
        {
            this._notifyResize({ property: "pixelWidth" });
        }
    }
});

/**
 * Get and set the width of this display object in percent only.
 * @name FORGE.DisplayObject#percentWidth
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "percentWidth",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._unitWidth === "%")
        {
            return this._width;
        }
        else if(this._unitWidth === "px")
        {
            if(this._parent !== null)
            {
                return this._width / this._parent.innerWidth * 100;
            }
            else
            {
                return 0;
            }
        }
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var width = this._width;
        var unitWidth = this._unitWidth;

        this._width = value;
        this._unitWidth = "%";

        if(this._needPending === true)
        {
            this._addPending("percentWidth", value);
            return;
        }

        this._maximized = false;

        this._dom.style.width = this.pixelWidth+"px";
        this._dom.width = this.pixelWidth;

        if((width !== this._width || unitWidth !== "%") || this._pendingApplying === true)
        {
            this._notifyResize({ property: "percentWidth" });
        }
    }
});

/**
 * Get and set the width unit of this display object.
 * @name FORGE.DisplayObject#unitWidth
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "unitWidth",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._unitWidth;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "string" || (value !== "px" && value !== "%"))
        {
            return;
        }

        var unitWidth = this._unitWidth;

        this._unitWidth = value;

        if(this._needPending === true)
        {
            this._addPending("unitWidth", value);
            return;
        }

        this._maximized = false;

        this._dom.style.width = this.pixelWidth+"px";
        this._dom.width = this.pixelWidth;

        if(unitWidth !== this._unitWidth || this._pendingApplying === true)
        {
            this._notifyResize({ property: "unitWidth" });
        }
    }
});

/**
 * Get the inner width (understand width without borders) of this DisplayObject.
 * @name  FORGE.DisplayObject#innerWidth
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "innerWidth",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this.pixelWidth - (this._borderWidth * 2);
    }
});

/**
 * Get and set the height of this display object.
 * The getter will always return a number, but you can pass to the setter either a number like 10 or a string like "10px" or "10%".
 * @name FORGE.DisplayObject#height
 * @type {number|string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "height",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._height;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        var height = this._height;
        var unitHeight = this._unitHeight;

        if(typeof value === "string")
        {
            var size = FORGE.Utils.parseSizeString(value);

            if(size.value === null || size.unit === null)
            {
                throw "FORGE.DisplayObject.height value "+value+" is incorrect";
            }

            this._unitHeight = size.unit;
            this._height = size.value;
        }
        else if(typeof value === "number")
        {
            this._height = value;
        }
        else
        {
            return;
        }

        if(this._needPending === true)
        {
            this._addPending("height", this._height);
            return;
        }

        this._maximized = false;

        this._dom.style.height = this.pixelHeight+"px";
        this._dom.height = this.pixelHeight;

        if((height !== this._height || unitHeight !== this._unitHeight) || this._pendingApplying === true)
        {
            this._notifyResize({ property: "height" });
        }
    }
});

/**
 * Get and set the height of this display object in pixel only.
 * @name FORGE.DisplayObject#pixelHeight
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "pixelHeight",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._unitHeight === "px")
        {
            return this._height;
        }
        else if (this._unitHeight === "%")
        {
            if(this._parent !== null)
            {
                return this._parent.innerHeight * this._height / 100;
            }
            else
            {
                return 0;
            }
        }
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var height = this._height;
        var unitHeight = this._unitHeight;

        this._height = value;
        this._unitHeight = "px";

        if(this._needPending === true)
        {
            this._addPending("pixelHeight", value);
            return;
        }

        this._maximized = false;

        this._dom.style.height = this.pixelHeight+"px";
        this._dom.height = this.pixelHeight;

        if((height !== this._height || unitHeight !== "px") || this._pendingApplying === true)
        {
            this._notifyResize({ property: "pixelHeight" });
        }
    }
});

/**
 * Get and set the height of this display object in percent only.
 * @name FORGE.DisplayObject#percentHeight
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "percentHeight",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._unitHeight === "%")
        {
            return this._height;
        }
        else if(this._unitHeight === "px")
        {
            if(this._parent !== null)
            {
                return this._height / this._parent.innerHeight * 100;
            }
            else
            {
                return 0;
            }
        }
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var height = this._height;
        var unitHeight = this._unitHeight;

        this._height = value;
        this._unitHeight = "%";

        if(this._needPending === true)
        {
            this._addPending("percentHeight", value);
            return;
        }

        this._maximized = false;

        this._dom.style.height = this.pixelHeight+"px";
        this._dom.height = this.pixelHeight;

        if((height !== this._height || unitHeight !== "%") || this._pendingApplying === true)
        {
            this._notifyResize({ property: "percentHeight" });
        }
    }
});

/**
 * Get and set the height unit of this display object.
 * @name FORGE.DisplayObject#unitHeight
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "unitHeight",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._unitHeight;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "string")
        {
            return;
        }

        var unitHeight = this._unitHeight;

        this._unitHeight = value;

        if(this._needPending === true)
        {
            this._addPending("unitHeight", value);
            return;
        }

        this._maximized = false;

        this._dom.style.height = this.pixelHeight+"px";
        this._dom.height = this.pixelHeight;

        if(unitHeight !== this._unitHeight || this._pendingApplying === true)
        {
            this._notifyResize({ property: "unitHeight" });
        }
    }
});

/**
 * Get the inner height in pixels (understand height without borders) of this DisplayObject.
 * @name  FORGE.DisplayObject#innerHeight
 * @readonly
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "innerHeight",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this.pixelHeight - (this._borderWidth * 2);
    }
});

/**
 * Get and set the maximized status of this display object.
 * @name FORGE.DisplayObject#maximized
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "maximized",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._maximized;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._maximized = value;

        if(this._maximized === true)
        {
            this.maximize(true);
        }
    }
});


/**
 * Get and set the horizontal center status of this display object.
 * @name FORGE.DisplayObject#horizontalCenter
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "horizontalCenter",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._horizontalCenter;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._horizontalCenter = value;

        if(this._horizontalCenter === true)
        {
            this._left = null;
            this._right = null;
        }

        if(this._parent === null)
        {
            return;
        }

        var x = this._x;
        this._x = (this._parent.innerWidth -this.pixelWidth) / 2;
        this._dom.style.left = this._x+"px";

        if(this._onMove !== null && x !== this._x)
        {
            this._onMove.dispatch({ property: "x" });
        }
    }
});

/**
 * Get and set the vertical center status of this display object.
 * @name FORGE.DisplayObject#verticalCenter
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "verticalCenter",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._verticalCenter;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        this._verticalCenter = value;

        if(this._verticalCenter === true)
        {
            this._top = null;
            this._bottom = null;
        }

        if(this._parent === null)
        {
            return;
        }

        var y = this._y;
        this._y = (this._parent.innerHeight - this.pixelHeight) / 2;
        this._dom.style.top = this._y+"px";

        if(this._onMove !== null && y !== this._y)
        {
            this._onMove.dispatch({ property: "y" });
        }
    }
});

/**
 * Get and set the top anchor of this display object.
 * @name FORGE.DisplayObject#top
 * @type {?number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "top",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._top;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" && value !== null)
        {
            return;
        }

        this._top = value;
        this._verticalCenter = false;

        if(this._parent === null || this._top === null)
        {
            return;
        }

        var y = this._y;
        this._y = value;
        this._dom.style.top = this._y+"px";

        if(this._onMove !== null && y !== this._y)
        {
            this._onMove.dispatch({ property: "y" });
        }
    }
});

/**
 * Get and set the right anchor of this display object.
 * @name FORGE.DisplayObject#right
 * @type {?number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "right",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._right;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" && value !== null)
        {
            return;
        }

        this._right = value;
        this._horizontalCenter = false;

        if(this._parent === null || this._right === null)
        {
            return;
        }

        var x = this._x;
        this._x = this._parent.innerWidth - this.pixelWidth - value;
        this._dom.style.left = this._x+"px";

        if(this._onMove !== null && x !== this._x)
        {
            this._onMove.dispatch({ property: "x" });
        }
    }
});

/**
 * Get and set the bottom anchor of this display object.
 * @name FORGE.DisplayObject#bottom
 * @type {?number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "bottom",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._bottom;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" && value !== null)
        {
            return;
        }

        this._bottom = value;
        this._verticalCenter = false;

        if(this._parent === null || this._bottom === null)
        {
            return;
        }

        var y = this._y;
        this._y = this._parent.innerHeight - this.pixelHeight - value;
        this._dom.style.top = this._y+"px";

        if(this._onMove !== null && y !== this._y)
        {
            this._onMove.dispatch({ property: "y" });
        }
    }
});

/**
 * Get and set the left anchor of this display object.
 * @name FORGE.DisplayObject#left
 * @type {?number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "left",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._left;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" && value !== null)
        {
            return;
        }

        this._left = value;
        this._horizontalCenter = false;

        if(this._parent === null || this._left === null)
        {
            return;
        }

        var x = this._x;
        this._x = value;
        this._dom.style.left = this._x+"px";

        if(this._onMove !== null && x !== this._x)
        {
            this._onMove.dispatch({ property: "x" });
        }
    }
});

/**
 * Get and set the left alpha of this display object. (between 0 and 1).
 * @name FORGE.DisplayObject#alpha
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "alpha",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._alpha;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" || value === this._alpha)
        {
            return;
        }

        this._alpha = value;
        this._dom.style.opacity = this._alpha;
    }
});

/**
 * Get and set the rotation of this display object. (in degree).
 * @name FORGE.DisplayObject#rotation
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "rotation",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._rotation;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" || value === this._rotation)
        {
            return;
        }

        this._rotation = value;
        this._dom.style.transform = "rotate("+this._rotation+"deg)";
    }
});

/**
 * Get and set the backgound CSS value of this display object.
 * @name FORGE.DisplayObject#background
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "background",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._background;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "string" || value === this._background)
        {
            return;
        }

        this._background = value;
        this._dom.style.background = this._background;
    }
});

/**
 * Get and set the border-style CSS value of this display object.
 * @name FORGE.DisplayObject#borderStyle
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "borderStyle",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._borderStyle;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        var borderStyles =
        [
            "none",
            "dotted",
            "dashed",
            "solid",
            "double",
            "groove",
            "ridge",
            "inset",
            "outset"
        ];

        if(borderStyles.indexOf(value) === -1 || value === this._borderStyle)
        {
            return;
        }

        this._borderStyle = value;

        if(this._needPending === true)
        {
            this._addPending("borderStyle", value);
            return;
        }

        this._dom.style.borderStyle = this._borderStyle;
    }
});

/**
 * Get and set the border-width CSS value of this display object.
 * @name FORGE.DisplayObject#borderWidth
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "borderWidth",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._borderWidth;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number")
        {
            return;
        }

        var borderWidth = this._borderWidth;

        this._borderWidth = value;

        if(this._needPending === true)
        {
            this._addPending("borderWidth", value);
            return;
        }

        this._dom.style.borderWidth = this._borderWidth+"px";

        if(borderWidth !== this._borderWidth || this._pendingApplying === true)
        {
            this._notifyBorderResize();
        }
    }
});

/**
 * Get and set the border-color CSS value of this display object.
 * @name FORGE.DisplayObject#borderColor
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "borderColor",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._borderColor;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "string" || value === this._borderColor)
        {
            return;
        }

        this._borderColor = value;
        this._dom.style.borderColor = this._borderColor;
    }
});

/**
 * Get and set the border-radius CSS value of this display object.
 * @name FORGE.DisplayObject#borderRadius
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "borderRadius",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._borderRadius;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if((typeof value !== "number" && typeof value !== "string") || value === this._borderRadius)
        {
            return;
        }

        if (typeof value === "string")
        {
            value = parseInt(value, 10);
        }

        if (isNaN(value))
        {
            return;
        }

        this._borderRadius = value;
        this._dom.style.borderRadius = this._borderRadius + "px";
    }
});

/**
 * Get the global offset
 * @name FORGE.DisplayObject#globalOffset
 * @readonly
 * @type {{top:number,left:number}}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "globalOffset",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        var element = this._dom;
        var top = 0, left = 0;

        do
        {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        }
        while(element);

        return { top: top, left: left };
    }
});

/**
 * Get and set the tooltip value of this display object. This is the title dom property.
 * @name FORGE.DisplayObject#tooltip
 * @type {string}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "tooltip",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._tooltip;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "string" || value === this._tooltip)
        {
            return;
        }

        this._tooltip = value;
        this._dom.title = this._tooltip;
    }
});

/**
 * Get and set the index value of this display object. This is the z-index CSS property.
 * @name FORGE.DisplayObject#index
 * @type {number}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "index",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        return this._index;
    },

    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "number" || value === this._index)
        {
            return;
        }

        this._index = value;
        this._dom.style.zIndex = this._index;
    }
});

/**
 * Set the fullscreen property of this display object.
 * @name FORGE.DisplayObject#fullscreen
 * @type {boolean}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "fullscreen",
{
    /** @this {FORGE.DisplayObject} */
    set: function(value)
    {
        if(typeof value !== "boolean")
        {
            return;
        }

        if(value === true)
        {
            this.fullscreenEnter();
        }
        else
        {
            this.fullscreenExit();
        }
    }
});

/**
 * Get the {@link FORGE.Pointer} object that handles mouse and touch events for this display object.
 * @name FORGE.DisplayObject#pointer
 * @readonly
 * @type {FORGE.Pointer}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "pointer",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._pointer === null)
        {
            this._pointer = new FORGE.Pointer(this);
        }

        return this._pointer;
    }
});

/**
 * Get the {@link FORGE.Drag} object that handles drag events for this display object.
 * @name FORGE.DisplayObject#drag
 * @readonly
 * @type {FORGE.Drag}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "drag",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._drag === null)
        {
            this._drag = new FORGE.Drag(this);
        }

        return this._drag;
    }
});

/**
 * Get the "onResize" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onResize
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onResize",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onResize === null)
        {
            this._onResize = new FORGE.EventDispatcher(this);
        }

        return this._onResize;
    }
});

/**
 * Get the "onBorderResize" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onBorderChange
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onBorderResize",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onBorderResize === null)
        {
            this._onBorderResize = new FORGE.EventDispatcher(this);
        }

        return this._onBorderResize;
    }
});

/**
 * Get the "onMove" {@link FORGE.EventDispatcher} of this display object.<br>
 * This event is triggered when object's coordinate (x, y) changed.
 * @name FORGE.DisplayObject#onMove
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onMove",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onMove === null)
        {
            this._onMove = new FORGE.EventDispatcher(this);
        }

        return this._onMove;
    }
});

/**
 * Get the "onReady" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onReady",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this, true);
        }

        return this._onReady;
    }
});

/**
 * Get the "onAddedToParent" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onAddedToParent
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onAddedToParent",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onAddedToParent === null)
        {
            this._onAddedToParent = new FORGE.EventDispatcher(this);
        }

        return this._onAddedToParent;
    }
});

/**
 * Get the "onAddedToDom" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onAddedToDom
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onAddedToDom",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onAddedToDom === null)
        {
            this._onAddedToDom = new FORGE.EventDispatcher(this);
        }

        return this._onAddedToDom;
    }
});

/**
 * Get the "onShow" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onShow
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onShow",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onShow === null)
        {
            this._onShow = new FORGE.EventDispatcher(this);
        }

        return this._onShow;
    }
});

/**
 * Get the "onHide" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onHide
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onHide",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onHide === null)
        {
            this._onHide = new FORGE.EventDispatcher(this);
        }

        return this._onHide;
    }
});

/**
 * Get the "onFullscreenEnter" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onFullscreenEnter
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onFullscreenEnter",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onFullscreenEnter === null)
        {
            this._onFullscreenEnter = new FORGE.EventDispatcher(this);
        }

        return this._onFullscreenEnter;
    }
});

/**
 * Get the "onFullscreenExit" {@link FORGE.EventDispatcher} of this display object.
 * @name FORGE.DisplayObject#onFullscreenExit
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.DisplayObject.prototype, "onFullscreenExit",
{
    /** @this {FORGE.DisplayObject} */
    get: function()
    {
        if(this._onFullscreenExit === null)
        {
            this._onFullscreenExit = new FORGE.EventDispatcher(this);
        }

        return this._onFullscreenExit;
    }
});

