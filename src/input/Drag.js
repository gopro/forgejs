
/**
 * Drag manager module
 * @constructor FORGE.Drag
 * @param {FORGE.DisplayObject} displayObject - The display object concerned by the drag.
 * @extends {FORGE.BaseObject}
 *
 * @todo  work also with rectangle for constrain
 */
FORGE.Drag = function(displayObject)
{
    /**
     * The display object taht will be moved during the drag.
     * @name  FORGE.Drag#_displayObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._displayObject = displayObject;

    /**
     * The object that will be litening to mouse down.<br>
     * This is the handle object that initiate the drag.<br>
     * By default, this is the same object that the display object. 
     * @name  FORGE.Drag#_handleObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._handleObject = displayObject;

    /**
     * Is the drag is enabled ?
     * @name FORGE.Drag#_enabled
     * @type {boolean}
     * @default  false
     * @private
     */
    this._enabled = false;

    /**
     * The display object taht will be used as constrain.
     * @name  FORGE.Drag#_constrain
     * @type {FORGE.DisplayObject}
     * @default  null
     * @private
     */
    this._constrain = null;

    /**
     * The axis constrain.<br>
     * This could be "x" or "y" or "" an empty string will remove the axis constrain.
     * @name  FORGE.Drag#_axis
     * @type {string}
     * @default ""
     * @private
     */
    this._axis = "";

    /**
     * The position of the object on start drag.
     * @name  FORGE.Drag#_startPostion
     * @type {Object}
     * @property {number} x - The x position.
     * @property {number} y - The y position.
     * @default  null
     * @private
     */
    this._startPostion = null;

    /**
     * The last  mouse position during drag.<br>
     * This is used to calculate distances.
     * @name  FORGE.Drag#_lastMousePosition
     * @type {Object}
     * @property {number} x - The x position.
     * @property {number} y - The y position.
     * @default null
     * @private
     */
    this._lastMousePosition = null;

    /**
     * Flag for dragging.
     * @name  FORGE.Drag#_dragging
     * @type {boolean}
     * @default  false
     * @private
     */
    this._dragging = false;

    /**
     * Flag to know if the displayObject have to revert position after drag stop.
     * @name  FORGE.Drag#_revert
     * @type {boolean}
     * @default  false
     * @private
     */
    this._revert = false;

    /**
     * Flag to know if the displayObject is currently reverting its position.
     * @name  FORGE.Drag#_reverting
     * @type {boolean}
     * @default  false
     * @private
     */
    this._reverting = false;

    /**
     * Tween used to revert the dispay object position after drag stops.
     * @name  FORGE.Drag#_revertTween
     * @type {FORGE.Tween}
     * @private
     */
    this._revertTween = null;

    /**
     * The revert duration in milliseconds.
     * @name FORGE.Drag#_revertDuration
     * @type {number}
     * @default 200
     * @private
     */
    this._revertDuration = 200;

    /**
     * This is a backup of the original alpha when alpha is altered during drag.
     * @name  FORGE.Drag#_originalAlpha
     * @type {number}
     * @private
     */
    this._originalAlpha = 1;

    /**
     * This is the alpha that will be applied to the display object during drag.
     * @name FORGE.Drag#_alpha
     * @type {number}
     * @private
     */
    this._alpha = 1;

    /**
     * The revert easing method.
     * @name FORGE.Drag#_revertEasing
     * @type {Function}
     * @default  {@link FORGE.Easing.LINEAR}
     * @private
     */
    this._revertEasing = FORGE.Easing.LINEAR;

    /**
     * On start event dispatcher.
     * @name  FORGE.Drag#_onStart
     * @type {FORGE.EventDispatcher}
     * @default  null
     * @private
     */
    this._onStart = null;

    /**
     * On drag event dispatcher.
     * @name  FORGE.Drag#_onDrag
     * @type {FORGE.EventDispatcher}
     * @default  null
     * @private
     */
    this._onDrag = null;

    /**
     * On stop event dispatcher.
     * @name  FORGE.Drag#_onStop
     * @type {FORGE.EventDispatcher}
     * @default  null
     * @private
     */
    this._onStop = null;

    /**
     * On revert event dispatcher.
     * @name  FORGE.Drag#_onRevert
     * @type {FORGE.EventDispatcher}
     * @default  null
     * @private
     */
    this._onRevert = null;

    FORGE.BaseObject.call(this, "Drag");

    this._boot();
};

FORGE.Drag.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Drag.prototype.constructor = FORGE.Drag;

/**
 * Boot sequence
 * @method FORGE.Drag#_boot
 * @private
 */
FORGE.Drag.prototype._boot = function()
{
    this._alpha = this._displayObject.alpha;
};

/**
 * Set the object that will be the handle object.<br>
 * Sets up mouse events on the handle.
 * @method  FORGE.Drag#_setHandleObject
 * @private
 * @param {FORGE.DisplayObject} displayObject - The {@link FORGE.DisplayObject} that will be the handle.
 */
FORGE.Drag.prototype._setHandleObject = function(displayObject)
{
    if(this._handleObject !== null)
    {
        this._unsetHandleObject();
    }

    this._handleObject = displayObject;

    this._handleObject.pointer.enabled = true;
    this._handleObject.pointer.onPanStart.add(this._panStartHandler, this);
    this._handleObject.pointer.onPanMove.add(this._panMoveHandler, this);
    this._handleObject.pointer.onPanEnd.add(this._panEndHandler, this);
};

/**
 * Unset the handle object.<br>
 * Remove mouse events on the previous handle.
 * @method  FORGE.Drag#_unsetHandleObject
 * @private
 */
FORGE.Drag.prototype._unsetHandleObject = function()
{
    if(this._handleObject !== null)
    {
        this._handleObject.pointer.onPanStart.remove(this._panStartHandler, this);
        this._handleObject.pointer.onPanMove.remove(this._panMoveHandler, this);
        this._handleObject.pointer.onPanEnd.remove(this._panEndHandler, this); 
    }

    this._handleObject = null;
};

/**
 * Internal pan start handler, this event is on the handle object.
 * 
 * @method  FORGE.Drag#_panStartHandler
 * @private
 * @param  {MouseEvent} event - The resulting event object from pan start.
 */
FORGE.Drag.prototype._panStartHandler = function(event)
{
    this.log("_panStartHandler");

    var hammerEvent = event.data;
    var mouseEvent = event.data["srcEvent"];

    //If it is a touch event we need to get the coordinate from the first touch
    if(typeof mouseEvent.touches !== "undefined" && typeof mouseEvent.touches[0] === "object")
    {
        mouseEvent = mouseEvent.touches[0];
    }

    //Cancel the drag if reverting OR if its not the target OR if its start position isn't valid
    if(this._reverting === true || hammerEvent.target !== this._handleObject.dom || this._isPositionValid() === false)
    {
        return;
    }

    this._dragging = true;

    this._startPostion = {x: this._displayObject.x, y: this._displayObject.y};
    
    this._displayObject.top = null;
    this._displayObject.right = null;
    this._displayObject.bottom = null;
    this._displayObject.left = null;

    this._lastMousePosition = {x: mouseEvent.pageX, y: mouseEvent.pageY};

    this._originalAlpha = this._displayObject.alpha;
    this._displayObject.alpha = this._alpha;

    if(this._onStart !== null)
    {
        this._onStart.dispatch();
    }
};

/**
 * Internal pan end handler.
 * @method  FORGE.Drag#_panEndHandler
 * @private
 */
FORGE.Drag.prototype._panEndHandler = function()
{
    this.log("_panEndHandler");

    if(this._dragging !== true)
    {
        return;
    }

    this._dragging = false;

    if(this._onStop !== null)
    {
        this._onStop.dispatch();
    }

    if(this._revert === true && this._revertTween !== null)
    {
        this._reverting = true;
        this._revertTween.to({x: this._startPostion.x, y: this._startPostion.y}, this._revertDuration, this._revertEasing).start();
    }
    else
    {
        this._displayObject.alpha = this._originalAlpha;
    }

    this._startPostion = null;
    
    this._lastMousePosition = null;
};

/**
 * Internal pointer pan move handler.
 *
 * @method  FORGE.Drag#_panMoveHandler
 * @private
 * @param  {MouseEvent} event - The resulting event object from pan move.
 */
FORGE.Drag.prototype._panMoveHandler = function(event)
{
    this.log("_panMoveHandler");

    if(this._dragging !== true)
    {
        return;
    }

    var mouseEvent = event.data["srcEvent"];

    //If it is a touch event we need to get the coordinate from the first touch
    if(typeof mouseEvent.touches !== "undefined" && typeof mouseEvent.touches[0] === "object")
    {
        mouseEvent = mouseEvent.touches[0];
    }

    var position = {x: mouseEvent.pageX, y: mouseEvent.pageY};
    var dx = position.x - this._lastMousePosition.x;
    var dy = position.y - this._lastMousePosition.y;

    this._lastMousePosition = position;

    if(this._constrain !== null)
    {
        var o = this._displayObject.globalOffset; // o = offset
        var po = this._displayObject.parent.globalOffset; // po = parent offset
        var co = this._constrain.globalOffset; // co = constrain offset

        if(this._axis === "" || this._axis === "x")
        {
            if(o.left + dx < co.left)
            {
                this.log("out left");
                this._displayObject.x = Math.abs(po.left - co.left);
            }
            else if(o.left + dx + this._displayObject.pixelWidth > co.left + this._constrain.innerWidth)
            {
                this.log("out right");
                this._displayObject.x = Math.abs(po.left - co.left) + this._constrain.innerWidth - this._displayObject.pixelWidth;
            }
            else
            {
                this._displayObject.x += dx;
            }
        }
        
        if(this._axis === "" || this._axis === "y")
        {
            if(o.top + dy < co.top)
            {
                this.log("out top");
                this._displayObject.y = Math.abs(po.top - co.top);
            }
            else if(o.top + dy + this._displayObject.pixelHeight > co.top + this._constrain.innerHeight)
            {
                this.log("out bottom");
                this._displayObject.y = Math.abs(po.top - co.top) + this._constrain.innerHeight - this._displayObject.pixelHeight;
            }
            else
            {
                this._displayObject.y += dy;
            }
        }
    }
    else
    {
        if(this._axis === "" || this._axis === "x")
        {
            this._displayObject.x += dx;
        }
        
        if(this._axis === "" || this._axis === "y")
        {
            this._displayObject.y += dy;
        }
    }

    if(this._onDrag !== null)
    {
        this._onDrag.dispatch();
    }
};

/**
 * Internal handler for the revert tween complete.
 * @method  FORGE.Drag#_revertCompleteHandler
 * @private
 */
FORGE.Drag.prototype._revertCompleteHandler = function()
{
    this.log("_revertCompleteHandler");

    this._reverting = false;
    this._displayObject.alpha = this._originalAlpha;

    if(this._onRevert !== null)
    {
        this._onRevert.dispatch();
    }
};

/**
 * Helper that check if the display object position is valid.<br>
 * By valid I mean in its constrain if it have one.
 * @method  FORGE.Drag#_isPositionValid
 * @private
 * @return {boolean} Returns true if the current dragged object position is valid, false if not.
 */
FORGE.Drag.prototype._isPositionValid = function()
{
    //If no constrain, the position is always valid.
    if(this._constrain === null)
    {
        return true;
    }

    var o = this._displayObject.globalOffset; // o = offset
    var co = this._constrain.globalOffset; // co = constrain offset

    //Is it out of bound for left, right, top & bottom?
    var left = (o.left < co.left);
    var right = (o.left + this._displayObject.pixelWidth > co.left + this._constrain.innerWidth);
    var top = (o.top < co.top);
    var bottom = (o.top + this._displayObject.pixelHeight > co.top + this._constrain.innerHeight);

    if(left === true || right === true || top === true || bottom === true)
    {
        return false;
    }
        
    return true;
};

/**
 * Enable the drag on its display object
 * @method FORGE.Drag.enable
 */
FORGE.Drag.prototype.enable = function()
{
    this._enabled = true;
    this._setHandleObject(this._handleObject);
};

/**
 * Disable the drag on its display object
 * @method FORGE.Drag.disable
 */
FORGE.Drag.prototype.disable = function()
{
    this._enabled = false;
};

/**
 * Destroy sequence
 * @method FORGE.Drag#destroy
 */
FORGE.Drag.prototype.destroy = function()
{
    this.revert = false; //This unbind events and nullify revertTween

    if(this._onStart !== null)
    {
        this._onStart.destroy();
        this._onStart = null;
    }

    if(this._onDrag !== null)
    {
        this._onDrag.destroy();
        this._onDrag = null;
    }

    if(this._onStop !== null)
    {
        this._onStop.destroy();
        this._onStop = null;
    }

    if(this._onRevert !== null)
    {
        this._onRevert.destroy();
        this._onRevert = null;
    }

    this._handleObject = null;
    this._displayObject = null;
    this._constrain = null;

    this._lastMousePosition = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Enabled flag for the drag module
 * @name FORGE.Drag#enabled
 * @type {boolean} 
 * @default false
 */
Object.defineProperty(FORGE.Drag.prototype, "enabled", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        var enabled = Boolean(value);

        if(enabled === true)
        {
            this.enable();
        }
        else
        {
            this.disable();
        }
    }
});

/**
 * Dragging flag for the drag module
 * @name FORGE.Drag#dragging
 * @readonly
 * @type {boolean} 
 */
Object.defineProperty(FORGE.Drag.prototype, "dragging", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._dragging;
    }
});

/**
 * Get and set the handle object
 * @name FORGE.Drag#handle
 * @type {FORGE.DisplayObject} 
 */
Object.defineProperty(FORGE.Drag.prototype, "handle", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._handleObject;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        this._setHandleObject(value);
    }
});

/**
 * Get and set the constrain object
 * @name FORGE.Drag#constrain
 * @type {FORGE.DisplayObject} 
 * @default  null
 */
Object.defineProperty(FORGE.Drag.prototype, "constrain", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._constrain;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        this._constrain = value;
    }
});

/**
 * Get the progress of the drag position on its contrain on two axes.<br>
 * If no constrain, this wiil return undefined.
 * @name  FORGE.Drag#progress
 * @readonly
 * @type {Object}
 * @property {number} [x] The progress on x axis between 0 and 1.
 * @property {number} [y] The progress on y axis between 0 and 1.
 */
Object.defineProperty(FORGE.Drag.prototype, "progress", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        if(this._constrain === null)
        {
            return undefined;
        }

        var o = this._displayObject.globalOffset; // o = offset
        var co = this._constrain.globalOffset; // co = constrain offset
        var progressX = (o.left - co.left) / (this._constrain.innerWidth - this._displayObject.pixelWidth);
        var progressY = (o.top - co.top) / (this._constrain.innerHeight - this._displayObject.pixelHeight);
        return {x: progressX, y: progressY};
    }
});

/**
 * Get and set the axis constrains.<br>
 * Values can be "x" or "y".<br>
 * To disable axis constrain, you can set an empty string or anything else.
 * @name FORGE.Drag#axis
 * @type {string} 
 * @default  "empty string"
 */
Object.defineProperty(FORGE.Drag.prototype, "axis", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._axis;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        if(value === "x" || value === "y")
        {
            this._axis = value;
        }
        else
        {
            this._axis = "";
        }
    }
});

/**
 * Get and set the alpha of the display object during drag
 * Value can be between 0 and 1.
 * @name FORGE.Drag#alpha
 * @type {number} 
 * @default 1
 */
Object.defineProperty(FORGE.Drag.prototype, "alpha", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._alpha;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._alpha = value;
        }
    }
});

/**
 * Reverting flag for the drag module
 * @name FORGE.Drag#reverting
 * @readonly
 * @type {boolean} 
 */
Object.defineProperty(FORGE.Drag.prototype, "reverting", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._reverting;
    }
});

/**
 * Get and set the revert flag.
 * If revert is at true, the display object will revert its position to its original position after the drag stop.
 * @name FORGE.Drag#revert
 * @type {boolean} 
 * @default  false
 */
Object.defineProperty(FORGE.Drag.prototype, "revert", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._revert;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        this._revert = Boolean(value);

        if(this._revert === true && this._revertTween === null)
        {
            this._revertTween = new FORGE.Tween(this._displayObject.viewer, this._displayObject);
            this._revertTween.onComplete.add(this._revertCompleteHandler, this);
            this._displayObject.viewer.tween.add(this._revertTween);
        }
        else if(this._revert === false && this._revertTween !== null)
        {
            this._displayObject.viewer.tween.remove(this._revertTween);
            this._revertTween.onComplete.remove(this._revertCompleteHandler, this);
            this._revertTween.destroy();
            this._revertTween = null;
        }
    }
});

/**
 * Get and set the revert duration in milliseconds
 * @name FORGE.Drag#revertDuration
 * @type {number} 
 * @default  200
 */
Object.defineProperty(FORGE.Drag.prototype, "revertDuration", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._revertDuration;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        if(typeof value === "number")
        {
            this._revertDuration = value;
        }
    }
});

/**
 * Get and set the revert easing method
 * @name FORGE.Drag#revertEasing
 * @type {Function} 
 * @default FORGE.Easing.LINEAR
 */
Object.defineProperty(FORGE.Drag.prototype, "revertEasing", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        return this._revertEasing;
    },

    /** @this {FORGE.Drag} */
    set: function(value)
    {
        if(typeof value === "function")
        {
            this._revertEasing = value;
        }
    }
});


/**
 * Get the onStart {@link FORGE.EventDispatcher}.
 * @name  FORGE.Drag#onStart
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Drag.prototype, "onStart", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        if(this._onStart === null)
        {
            this._onStart = new FORGE.EventDispatcher(this._displayObject);
        }
        
        return this._onStart;
    }
});

/**
 * Get the onDrag {@link FORGE.EventDispatcher}.
 * @name  FORGE.Drag#onDrag
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Drag.prototype, "onDrag", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        if(this._onDrag === null)
        {
            this._onDrag = new FORGE.EventDispatcher(this._displayObject);
        }
        
        return this._onDrag;
    }
});

/**
 * Get the onStop {@link FORGE.EventDispatcher}.
 * @name  FORGE.Drag#onStop
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Drag.prototype, "onStop", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        if(this._onStop === null)
        {
            this._onStop = new FORGE.EventDispatcher(this._displayObject);
        }
        
        return this._onStop;
    }
});

/**
 * Get the onRevert {@link FORGE.EventDispatcher}.
 * @name  FORGE.Drag#onRevert
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Drag.prototype, "onRevert", 
{
    /** @this {FORGE.Drag} */
    get: function()
    {
        if(this._onRevert === null)
        {
            this._onRevert = new FORGE.EventDispatcher(this._displayObject);
        }
        
        return this._onRevert;
    }
});

