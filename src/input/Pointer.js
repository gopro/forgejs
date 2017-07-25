
/**
 * Pointer input management, work with mouse and touch screen (using Hammer.js)
 * @constructor FORGE.Pointer
 * @param {FORGE.DisplayObject} displayObject - The display object on which you want to listen to pointer events
 * @extends {FORGE.BaseObject}
 *
 * @todo prevent event binding if not supported (ex: prevent pinch if not touch screen)
 */
FORGE.Pointer = function(displayObject)
{
    /**
     * The {@link FORGE.DisplayObject} on which events will be listened.
     * @name FORGE.Pointer#_displayObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._displayObject = displayObject;

    /**
     * Enabled flag for pointer module
     * @name  FORGE.Pointer#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = false;

    /**
     * Cursor css string.
     * @name FORGE.Pointer#_cursor
     * @type {string}
     * @private
     */
    this._cursor = FORGE.Pointer.cursors.DEFAULT;

    /**
     * Hammer manager reference.
     * @name FORGE.Pointer#_hammer
     * @type {Hammer.Manager}
     * @private
     */
    this._hammer = null;

    /**
     * Array that keeps reference to listeners.
     * @name FORGE.Pointer#_listeners
     * @type {Array}
     * @private
     */
    this._listeners = [];

    /**
     * Hammer Tap recognizer
     * @name FORGE.Pointer._tap
     * @type {Hammer.Tap}
     * @private
     */
    this._tap = null;

    /**
     * Hammer Double tap recognizer
     * @name FORGE.Pointer._doubleTap
     * @type {Hammer.Tap}
     * @private
     */
    this._doubleTap = null;

    /**
     * Hammer Press recognizer
     * @name FORGE.Pointer._press
     * @type {Hammer.Press}
     * @private
     */
    this._press = null;

    /**
     * Hammer Pan recognizer
     * @name FORGE.Pointer._pan
     * @type {Hammer.Pan}
     * @private
     */
    this._pan = null;

    /**
     * Hammer Pinch recognizer
     * @name FORGE.Pointer._pinch
     * @type {Hammer.Pinch}
     * @private
     */
    this._pinch = null;

    /**
     * Hammer Rotate recognizer
     * @name FORGE.Pointer._rotate
     * @type {Hammer.Rotate}
     * @private
     */
    this._rotate = null;

    /**
     * Hammer Swipe recognizer
     * @name FORGE.Pointer._swipe
     * @type {Hammer.Swipe}
     * @private
     */
    this._swipe = null;

    /**
     * {@link FORGE.EventDispatcher} for the enable event.
     * @name FORGE.Pointer#_onEnable
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnable = null;

    /**
     * {@link FORGE.EventDispatcher} for the disable event.
     * @name FORGE.Pointer#_onDisable
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onDisable = null;

    /**
     * {@link FORGE.EventDispatcher} for the tap event.
     * @name FORGE.Pointer#_onTap
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onTap = null; //alias onClick

    /**
     * {@link FORGE.EventDispatcher} for the double tap event.
     * @name FORGE.Pointer#_onDoubleTap
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onDoubleTap = null; //alias onDoubleClick

    /**
     * {@link FORGE.EventDispatcher} for the press start event.
     * @name FORGE.Pointer#_onPressStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPressStart = null; //alias onMouseDown

    /**
     * {@link FORGE.EventDispatcher} for the press end event.
     * @name FORGE.Pointer#_onPressEnd
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPressEnd = null; //alias onMouseUp

    /**
     * {@link FORGE.EventDispatcher} for the pan start event.
     * @name FORGE.Pointer#_onPanStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPanStart = null;

    /**
     * {@link FORGE.EventDispatcher} for the pan move event.
     * @name FORGE.Pointer#_onPanMove
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPanMove = null;

    /**
     * {@link FORGE.EventDispatcher} for the pan end event.
     * @name FORGE.Pointer#_onPanEnd
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPanEnd = null;

    /**
     * {@link FORGE.EventDispatcher} for the pinch start event.
     * @name FORGE.Pointer#_onPinchStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPinchStart = null;

    /**
     * {@link FORGE.EventDispatcher} for the pinch move event.
     * @name FORGE.Pointer#_onPinchMove
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPinchMove = null;

    /**
     * {@link FORGE.EventDispatcher} for the pinch end event.
     * @name FORGE.Pointer#_onPinchEnd
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onPinchEnd = null;

    /**
     * {@link FORGE.EventDispatcher} for the rotate start event.
     * @name FORGE.Pointer#_onRotateStart
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onRotateStart = null;

    /**
     * {@link FORGE.EventDispatcher} for the rotate move event.
     * @name FORGE.Pointer#_onRotateMove
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onRotateMove = null;

    /**
     * {@link FORGE.EventDispatcher} for the rotate end event.
     * @name FORGE.Pointer#_onRotateEnd
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onRotateEnd = null;

    /**
     * {@link FORGE.EventDispatcher} for the swipe event.
     * @name FORGE.Pointer#_onSwipe
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onSwipe = null;

    /**
     * {@link FORGE.EventDispatcher} for the enter event.
     * @name FORGE.Pointer#_onEnter
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onEnter = null;

    /**
     * {@link FORGE.EventDispatcher} for the leave event.
     * @name FORGE.Pointer#_onLeave
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onLeave = null;

    /**
     * {@link FORGE.EventDispatcher} for the over event.
     * @name FORGE.Pointer#_onOver
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onOver = null;

    /**
     * {@link FORGE.EventDispatcher} for the out event.
     * @name FORGE.Pointer#_onOut
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onOut = null;

    /**
     * {@link FORGE.EventDispatcher} for the move event.
     * @name FORGE.Pointer#_onMove
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onMove = null;

    /**
     * {@link FORGE.EventDispatcher} for the wheel event.
     * @name FORGE.Pointer#_onWheel
     * @type {?FORGE.EventDispatcher}
     * @private
     */
    this._onWheel = null;

    FORGE.BaseObject.call(this, "Pointer");

    this._boot();
};

FORGE.Pointer.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Pointer.prototype.constructor = FORGE.Pointer;

/**
 * Boot sequence
 * @method  FORGE.Pointer#_boot
 * @private
 */
FORGE.Pointer.prototype._boot = function()
{
    //Create a Hammer manager
    this._hammer = new Hammer.Manager(this._displayObject.dom);
    //Disabled by default
    this._hammer.set({ enable: false });
};

/**
 * Get the index of a listener (event + callback + type), internal only.
 * @method FORGE.Pointer#_indexOfListener
 * @private
 * @param  {string} event - The event name ("tap", "swipe", click", "mousedown", "mouseover" ...).
 * @param  {Function} callback - The function that handles the event, this is one of the private function like _tapHandler for tap & click event.
 * @param  {number} type - The type of listener (could be 0 for native or 1 for hammer)
 * @return {number} Returns the index of the reserached listener if found, -1 if not.
 */
FORGE.Pointer.prototype._indexOfListener = function(event, callback, type)
{
    var listener;

    for ( var i = 0, ii = this._listeners.length; i < ii; i++ )
    {
        listener = this._listeners[i];

        if(listener.event === event && listener.callback === callback && listener.type === type)
        {
            return i;
        }
    }

    return -1;
};

/**
 * Add a callback function associated to an event name.
 * @method FORGE.Pointer#_addListener
 * @private
 * @param  {string} event - The event name ("tap", "swipe", click", "mousedown", "mouseover" ...).
 * @param  {Function} callback - The function that handles the event, this is one of the private function like _tapHandler for tap & click event.
 * @param  {number} type - The type of listener (could be 0 for native or 1 for hammer)
 * @return {boolean} Returns true if the listener is successfully added, false if not.
 */
FORGE.Pointer.prototype._addListener = function(event, callback, type)
{
    var index = this._indexOfListener(event, callback, type);

    if(index === -1)
    {
        this._listeners.push({ event: event, callback: callback, type: type });

        if(type === FORGE.Pointer.listenerTypes.NATIVE)
        {
            this._displayObject.dom.addEventListener(event, Hammer.bindFn(callback, this));
        }
        else if(type === FORGE.Pointer.listenerTypes.HAMMER)
        {
            this._hammer.on(event, Hammer.bindFn(callback, this));
        }

        return true;
    }

    return false;
};

/**
 * Remove a lister function associated to an HTML DOM mouse related event name.
 * @method FORGE.Pointer#_removeListener
 * @private
 * @param  {string} event - The event name ("tap", "swipe", click", "mousedown", "mouseover" ...).
 * @param  {Function} callback - The function that handles the event, this is one of the private function like _tapHandler for tap & click event.
 * @param  {number} type - The type of listener (could be 0 for native or 1 for hammer)
 * @return {boolean} Returns true if the listener is successfully removed, false if not.
 */
FORGE.Pointer.prototype._removeListener = function(event, callback, type)
{
    var index = this._indexOfListener(event, callback, type);

    if(index !== -1)
    {
        this._listeners.splice(index, 1);

        if(type === FORGE.Pointer.listenerTypes.NATIVE)
        {
            this._displayObject.dom.removeEventListener(event, callback);
        }
        else if(type === FORGE.Pointer.listenerTypes.HAMMER)
        {
            this._hammer.off(event);
        }

        return true;
    }

    return false;
};

/**
 * Handler to remove event listener on mouse events.
 * @method FORGE.Pointer#_generateDestroyCallback
 * @private
 * @param  {string} event - The event name ("tap", "swipe", click", "mousedown", "mouseover" ...).
 * @param  {Function} callback - The function that handles the event, this is one of the private function like _tapHandler for tap & click event.
 * @param  {number} type - The type of listener (could be 0 for native or 1 for hammer)
 */
FORGE.Pointer.prototype._generateDestroyCallback = function(event, callback, type)
{
    var destroyCallback = function destroyCallback()
    {
        this._removeListener(event, callback, type);
    };

    return destroyCallback;
};

/**
 * Internal handler for the "tap" event.
 * @method FORGE.Pointer#_tapHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._tapHandler = function(event)
{
    if(this._onTap !== null && this._enabled === true)
    {
        this._onTap.dispatch(event);
    }
};

/**
 * Internal handler for the "doubletap" event.
 * @method FORGE.Pointer#_doubleTapHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._doubleTapHandler = function(event)
{
    if(this._onDoubleTap !== null && this._enabled === true)
    {
        this._onDoubleTap.dispatch(event);
    }
};

/**
 * Internal handler for the "pressstart" event.
 * @method FORGE.Pointer#_pressStartHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._pressStartHandler = function(event)
{
    if(this._onPressStart !== null && this._enabled === true)
    {
        this._onPressStart.dispatch(event);
    }
};

/**
 * Internal handler for the "pressend" event.
 * @method FORGE.Pointer#_pressEndHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._pressEndHandler = function(event)
{
    if(this._onPressEnd !== null && this._enabled === true)
    {
        this._onPressEnd.dispatch(event);
    }
};

/**
 * Internal handler for the "panstart" event.
 * @method FORGE.Pointer#_panStartHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._panStartHandler = function(event)
{
    if(this._onPanStart !== null && this._enabled === true)
    {
        this._onPanStart.dispatch(event);
    }
};

/**
 * Internal handler for the "panmove" event.
 * @method FORGE.Pointer#_panMoveHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._panMoveHandler = function(event)
{
    if(this._onPanMove !== null && this._enabled === true)
    {
        this._onPanMove.dispatch(event);
    }
};

/**
 * Internal handler for the "panend" event.
 * @method FORGE.Pointer#_panEndHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._panEndHandler = function(event)
{
    if(this._onPanEnd !== null && this._enabled === true)
    {
        this._onPanEnd.dispatch(event);
    }
};

/**
 * Internal handler for the "pinchstart" event.
 * @method FORGE.Pointer#_pinchStartHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._pinchStartHandler = function(event)
{
    if(this._onPinchStart !== null && this._enabled === true)
    {
        this._onPinchStart.dispatch(event);
    }
};

/**
 * Internal handler for the "pinchmove" event.
 * @method FORGE.Pointer#_pinchMoveHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._pinchMoveHandler = function(event)
{
    if(this._onPinchMove !== null && this._enabled === true)
    {
        this._onPinchMove.dispatch(event);
    }
};

/**
 * Internal handler for the "pinchend" event.
 * @method FORGE.Pointer#_pinchEndHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._pinchEndHandler = function(event)
{
    if(this._onPinchEnd !== null && this._enabled === true)
    {
        this._onPinchEnd.dispatch(event);
    }
};

/**
 * Internal handler for the "rotatestart" event.
 * @method FORGE.Pointer#_rotateStartHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._rotateStartHandler = function(event)
{
    if(this._onRotateStart !== null && this._enabled === true)
    {
        this._onRotateStart.dispatch(event);
    }
};

/**
 * Internal handler for the "rotatemove" event.
 * @method FORGE.Pointer#_rotateMoveHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._rotateMoveHandler = function(event)
{
    if(this._onRotateMove !== null && this._enabled === true)
    {
        this._onRotateMove.dispatch(event);
    }
};

/**
 * Internal handler for the "rotateend" event.
 * @method FORGE.Pointer#_rotateEndHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._rotateEndHandler = function(event)
{
    if(this._onRotateEnd !== null && this._enabled === true)
    {
        this._onRotateEnd.dispatch(event);
    }
};

/**
 * Internal handler for the "swipe" event.
 * @method FORGE.Pointer#_swipeHandler
 * @private
 * @param  {Object} event - The Hammer event.
 */
FORGE.Pointer.prototype._swipeHandler = function(event)
{
    if(this._onSwipe !== null && this._enabled === true)
    {
        this._onSwipe.dispatch(event);
    }
};

/**
 * Internal handler for the "mouseenter" event.
 * @method FORGE.Pointer#_enterHandler
 * @private
 * @param  {MouseEvent} event - The mouse event.
 */
FORGE.Pointer.prototype._enterHandler = function(event)
{
    if(this._onEnter !== null && this._enabled === true)
    {
        this._onEnter.dispatch(event);
    }
};

/**
 * Internal handler for the "mouseleave" event.
 * @method FORGE.Pointer#_leaveHandler
 * @private
 * @param  {Object} event - The mouse event.
 */
FORGE.Pointer.prototype._leaveHandler = function(event)
{
    if(this._onLeave !== null && this._enabled === true)
    {
        this._onLeave.dispatch(event);
    }
};

/**
 * Internal handler for the "mouseover" event.
 * @method FORGE.Pointer#_overHandler
 * @private
 * @param  {Object} event - The mouse event.
 */
FORGE.Pointer.prototype._overHandler = function(event)
{
    if(this._onOver !== null && this._enabled === true)
    {
        this._onOver.dispatch(event);
    }
};

/**
 * Internal handler for the "mouseout" event.
 * @method FORGE.Pointer#_outHandler
 * @private
 * @param  {Object} event - The mouse event.
 */
FORGE.Pointer.prototype._outHandler = function(event)
{
    if(this._onOut !== null && this._enabled === true)
    {
        this._onOut.dispatch(event);
    }
};

/**
 * Internal handler for the "mousemove" event.
 * @method FORGE.Pointer#_moveHandler
 * @private
 * @param  {Object} event - The mouse event.
 */
FORGE.Pointer.prototype._moveHandler = function(event)
{
    if(this._onMove !== null && this._enabled === true)
    {
        this._onMove.dispatch(event);
    }
};

/**
 * Internal handler for the "wheel" event.
 * @method FORGE.Pointer#_wheelHandler
 * @private
 * @param  {Object} event - The mouse event.
 */
FORGE.Pointer.prototype._wheelHandler = function(event)
{
    if(this._onWheel !== null && this._enabled === true)
    {
        this._onWheel.dispatch(event);
    }
};

/**
 * Enable the pointer module
 * @method  FORGE.Pointer#enable
 */
FORGE.Pointer.prototype.enable = function()
{
    if(FORGE.Device.cssPointerEvents === true)
    {
        this._displayObject.dom.style.pointerEvents = "auto";
    }

    this._hammer.set({ enable: true });

    if(this._tap === null)
    {
        this._tap = new Hammer.Tap();
        this._hammer.add(this._tap);
    }

    if(this._doubleTap === null)
    {
        this._doubleTap = new Hammer.Tap({ event: FORGE.Pointer.events.DOUBLE_TAP, taps: 2}).recognizeWith(this._tap);
        this._hammer.add(this._doubleTap);
    }

    if(this._press === null)
    {
        this._press = new Hammer.Press().recognizeWith(this._tap); //{ time: 0 }
        this._hammer.add(this._press);
    }

    if(this._pan === null)
    {
        this._pan = new Hammer.Pan();
        this._hammer.add(this._pan);
    }

    if(this._pinch === null)
    {
        this._pinch = new Hammer.Pinch();
        this._hammer.add(this._pinch);
    }

    if(this._rotate === null)
    {
        this._rotate = new Hammer.Rotate().recognizeWith(this._pinch);
        this._hammer.add(this._rotate);
    }

    if(this._swipe === null)
    {
        this._swipe = new Hammer.Swipe().recognizeWith(this._pan);
        this._hammer.add(this._swipe);
    }

    this._enabled = true;

    if(this._onEnable !== null)
    {
        this._onEnable.dispatch();
    }
};

/**
 * Disable the pointer module
 * @method  FORGE.Pointer#disable
 */
FORGE.Pointer.prototype.disable = function()
{
    if(FORGE.Device.cssPointerEvents === true)
    {
        this._displayObject.dom.style.pointerEvents = "none";
    }

    this._enabled = false;

    this._hammer.set({ enable: false });

    if(this._onDisable !== null)
    {
        this._onDisable.dispatch();
    }
};

/**
 * Destroy sequence
 * @method  FORGE.Pointer#destroy
 */
FORGE.Pointer.prototype.destroy = function()
{
    this.disable();

    this._tap = null;
    this._doubleTap = null;
    this._press = null;
    this._pan = null;
    this._pinch = null;
    this._rotate = null;
    this._swipe = null;

    if(this._onEnable !== null)
    {
        this._onEnable.destroy();
        this._onEnable = null;
    }

    if(this._onDisable !== null)
    {
        this._onDisable.destroy();
        this._onDisable = null;
    }

    if(this._onTap !== null)
    {
        this._onTap.destroy();
        this._onTap = null;
    }

    if(this._onDoubleTap !== null)
    {
        this._onDoubleTap.destroy();
        this._onDoubleTap = null;
    }

    if(this._onPressStart !== null)
    {
        this._onPressStart.destroy();
        this._onPressStart = null;
    }

    if(this._onPressEnd !== null)
    {
        this._onPressEnd.destroy();
        this._onPressEnd = null;
    }

    if(this._onPanStart !== null)
    {
        this._onPanStart.destroy();
        this._onPanStart = null;
    }

    if(this._onPanMove !== null)
    {
        this._onPanMove.destroy();
        this._onPanMove = null;
    }

    if(this._onPanEnd !== null)
    {
        this._onPanEnd.destroy();
        this._onPanEnd = null;
    }

    if(this._onPinchStart !== null)
    {
        this._onPinchStart.destroy();
        this._onPinchStart = null;
    }

    if(this._onPinchMove !== null)
    {
        this._onPinchMove.destroy();
        this._onPinchMove = null;
    }

    if(this._onPinchEnd !== null)
    {
        this._onPinchEnd.destroy();
        this._onPinchEnd = null;
    }

    if(this._onRotateStart !== null)
    {
        this._onRotateStart.destroy();
        this._onRotateStart = null;
    }

    if(this._onRotateMove !== null)
    {
        this._onRotateMove.destroy();
        this._onRotateMove = null;
    }

    if(this._onRotateEnd !== null)
    {
        this._onRotateEnd.destroy();
        this._onRotateEnd = null;
    }

    if(this._onSwipe !== null)
    {
        this._onSwipe.destroy();
        this._onSwipe = null;
    }

    if(this._onEnter !== null)
    {
        this._onEnter.destroy();
        this._onEnter = null;
    }

    if(this._onLeave !== null)
    {
        this._onLeave.destroy();
        this._onLeave = null;
    }

    if(this._onOver !== null)
    {
        this._onOver.destroy();
        this._onOver = null;
    }

    if(this._onOut !== null)
    {
        this._onOut.destroy();
        this._onOut = null;
    }

    if(this._onMove !== null)
    {
        this._onMove.destroy();
        this._onMove = null;
    }

    if(this._onWheel !== null)
    {
        this._onWheel.destroy();
        this._onWheel = null;
    }

    this._displayObject = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * Get the relative mouse position inside the target element of a mouse event
 * @method FORGE.Pointer.getRelativeMousePosition
 * @static
 * @param {MouseEvent} event - The mouse event
 * @return {THREE.Vector2}
 */
FORGE.Pointer.getRelativeMousePosition = function(event)
{
    if(typeof event.target.getBoundingClientRect === "function")
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        return new THREE.Vector2(x, y);
    }

    return null;
};

/**
* Get or set the enabled flag.
* @name FORGE.Pointer#enabled
* @type {boolean}
*/
Object.defineProperty(FORGE.Pointer.prototype, "enabled",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.Pointer} */
    set: function(value)
    {
        if(Boolean(value) === true)
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
* Get or set the cursor value.<br>
* Use the constant {@link FORGE.Pointer.cursors} to set a valid cursor.
* @name FORGE.Pointer#cursor
* @type {string}
*/
Object.defineProperty(FORGE.Pointer.prototype, "cursor",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this._cursor;
    },

    /** @this {FORGE.Pointer} */
    set: function(value)
    {
        this._displayObject.dom.style.cursor = value;

        //On webkit browsers some cursors have to have -webkit prefix
        //If invalid cursor value, webkit will leave an empty string or the previous value intact.
        if(value !== this._displayObject.dom.style.cursor || this._displayObject.dom.style.cursor === "")
        {
            this._displayObject.dom.style.cursor = "-webkit-"+value;
        }

        this._cursor = value;
    }
});

/**
* Gets the onEnable {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.
* @name FORGE.Pointer#onEnable
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onEnable",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onEnable === null)
        {
            this._onEnable = new FORGE.EventDispatcher(this);
        }

        return this._onEnable;
    }
});

/**
* Gets the onDisable {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.
* @name FORGE.Pointer#onDisable
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onDisable",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onDisable === null)
        {
            this._onDisable = new FORGE.EventDispatcher(this);
        }

        return this._onDisable;
    }
});

/**
* Gets the onTap {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.
* @name FORGE.Pointer#onTap
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onTap",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onTap === null)
        {
            this._onTap = new FORGE.EventDispatcher(this._displayObject);
            this._onTap.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.TAP, this._tapHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.TAP, this._tapHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onTap;
    }
});

/**
* Gets the onClick {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* This is an alias for onTap.
* @name FORGE.Pointer#onClick
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onClick",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this.onTap;
    }
});

/**
* Gets the onDoubleTap {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.
* @name FORGE.Pointer#onDoubleTap
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onDoubleTap",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onDoubleTap === null)
        {
            this._onDoubleTap = new FORGE.EventDispatcher(this._displayObject);
            this._onDoubleTap.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.DOUBLE_TAP, this._doubleTapHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.DOUBLE_TAP, this._doubleTapHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onDoubleTap;
    }
});

/**
* Gets the onDoubleClick {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* This is an alias for onDoubleTap.
* @name FORGE.Pointer#onDoubleClick
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onDoubleClick",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this.onDoubleTap;
    }
});

/**
* Gets the onPressStart {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPressStart
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPressStart",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPressStart === null)
        {
            this._onPressStart = new FORGE.EventDispatcher(this._displayObject);
            this._onPressStart.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PRESS_START, this._pressStartHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PRESS_START, this._pressStartHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPressStart;
    }
});

/**
* Gets the onDown {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* This is an alias for onPressStart.
* @name FORGE.Pointer#onDown
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onDown",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this.onPressStart;
    }
});

/**
* Gets the onPressEnd {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPressEnd
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPressEnd",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPressEnd === null)
        {
            this._onPressEnd = new FORGE.EventDispatcher(this._displayObject);
            this._onPressEnd.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PRESS_END, this._pressEndHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PRESS_END, this._pressEndHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPressEnd;
    }
});

/**
* Gets the onUp {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* This is an alias for onPressEnd.
* @name FORGE.Pointer#onUp
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onUp",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        return this.onPressEnd;
    }
});

/**
* Gets the onPanStart {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPanStart
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPanStart",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPanStart === null)
        {
            this._onPanStart = new FORGE.EventDispatcher(this._displayObject);
            this._onPanStart.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PAN_START, this._panStartHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PAN_START, this._panStartHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPanStart;
    }
});

/**
* Gets the onPanMove {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPanMove
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPanMove",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPanMove === null)
        {
            this._onPanMove = new FORGE.EventDispatcher(this._displayObject);
            this._onPanMove.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PAN_MOVE, this._panMoveHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PAN_MOVE, this._panMoveHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPanMove;
    }
});

/**
* Gets the onPanEnd {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPanEnd
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPanEnd",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPanEnd === null)
        {
            this._onPanEnd = new FORGE.EventDispatcher(this._displayObject);
            this._onPanEnd.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PAN_END, this._panEndHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PAN_END, this._panEndHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPanEnd;
    }
});

/**
* Gets the onPinchStart {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPinchStart
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPinchStart",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPinchStart === null)
        {
            this._onPinchStart = new FORGE.EventDispatcher(this._displayObject);
            this._onPinchStart.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PINCH_START, this._pinchStartHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PINCH_START, this._pinchStartHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPinchStart;
    }
});

/**
* Gets the onPinchMove {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPinchMove
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPinchMove",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPinchMove === null)
        {
            this._onPinchMove = new FORGE.EventDispatcher(this._displayObject);
            this._onPinchMove.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PINCH_MOVE, this._pinchMoveHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PINCH_MOVE, this._pinchMoveHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPinchMove;
    }
});

/**
* Gets the onPinchEnd {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onPinchEnd
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onPinchEnd",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onPinchEnd === null)
        {
            this._onPinchEnd = new FORGE.EventDispatcher(this._displayObject);
            this._onPinchEnd.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.PINCH_END, this._pinchEndHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.PINCH_END, this._pinchEndHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onPinchEnd;
    }
});

/**
* Gets the onRotateStart {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onRotateStart
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onRotateStart",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onRotateStart === null)
        {
            this._onRotateStart = new FORGE.EventDispatcher(this._displayObject);
            this._onRotateStart.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.ROTATE_START, this._rotateStartHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.ROTATE_START, this._rotateStartHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onRotateStart;
    }
});

/**
* Gets the onRotateMove {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onRotateMove
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onRotateMove",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onRotateMove === null)
        {
            this._onRotateMove = new FORGE.EventDispatcher(this._displayObject);
            this._onRotateMove.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.ROTATE_MOVE, this._rotateMoveHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.ROTATE_MOVE, this._rotateMoveHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onRotateMove;
    }
});

/**
* Gets the onRotateEnd {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onRotateEnd
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onRotateEnd",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onRotateEnd === null)
        {
            this._onRotateEnd = new FORGE.EventDispatcher(this._displayObject);
            this._onRotateEnd.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.ROTATE_END, this._rotateEndHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.ROTATE_END, this._rotateEndHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onRotateEnd;
    }
});

/**
* Gets the onSwipe {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onSwipe
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onSwipe",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onSwipe === null)
        {
            this._onSwipe = new FORGE.EventDispatcher(this._displayObject);
            this._onSwipe.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.SWIPE, this._swipeHandler, FORGE.Pointer.listenerTypes.HAMMER), this );
            this._addListener(FORGE.Pointer.events.SWIPE, this._swipeHandler, FORGE.Pointer.listenerTypes.HAMMER);
        }

        return this._onSwipe;
    }
});

/**
* Gets the onEnter {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onEnter
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onEnter",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onEnter === null)
        {
            this._onEnter = new FORGE.EventDispatcher(this._displayObject);
            this._onEnter.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.ENTER, this._enterHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.ENTER, this._enterHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onEnter;
    }
});

/**
* Gets the onLeave {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onLeave
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onLeave",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onLeave === null)
        {
            this._onLeave = new FORGE.EventDispatcher(this._displayObject);
            this._onLeave.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.LEAVE, this._leaveHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.LEAVE, this._leaveHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onLeave;
    }
});

/**
* Gets the onOver {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onOver
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onOver",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onOver === null)
        {
            this._onOver = new FORGE.EventDispatcher(this._displayObject);
            this._onOver.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.OVER, this._overHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.OVER, this._overHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onOver;
    }
});

/**
* Gets the onOut {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onOut
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onOut",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onOut === null)
        {
            this._onOut = new FORGE.EventDispatcher(this._displayObject);
            this._onOut.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.OUT, this._outHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.OUT, this._outHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onOut;
    }
});

/**
* Gets the onMove {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onMove
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onMove",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onMove === null)
        {
            this._onMove = new FORGE.EventDispatcher(this._displayObject);
            this._onMove.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.MOVE, this._moveHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.MOVE, this._moveHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onMove;
    }
});

/**
* Gets the onWheel {@link FORGE.EventDispatcher}.<br>
* The {@link FORGE.EventDispatcher} is created only if you ask for it.<br>
* @name FORGE.Pointer#onWheel
* @type {FORGE.EventDispatcher}
*/
Object.defineProperty(FORGE.Pointer.prototype, "onWheel",
{
    /** @this {FORGE.Pointer} */
    get: function()
    {
        if(this._onWheel === null)
        {
            this._onWheel = new FORGE.EventDispatcher(this._displayObject);
            this._onWheel.onDestroy.addOnce( this._generateDestroyCallback(FORGE.Pointer.events.WHEEL, this._wheelHandler, FORGE.Pointer.listenerTypes.NATIVE), this );
            this._addListener(FORGE.Pointer.events.WHEEL, this._wheelHandler, FORGE.Pointer.listenerTypes.NATIVE);
        }

        return this._onWheel;
    }
});

/**
 * @name FORGE.Pointer.listenerTypes
 * @type {Object}
 * @const
 */
FORGE.Pointer.listenerTypes = {};

/**
 * @name FORGE.Pointer.listenerTypes.NATIVE
 * @type {number}
 * @const
 */
FORGE.Pointer.listenerTypes.NATIVE = 0;

/**
 * @name FORGE.Pointer.listenerTypes.HAMMER
 * @type {number}
 * @const
 */
FORGE.Pointer.listenerTypes.HAMMER = 1;


/**
 * @name FORGE.Pointer.events
 * @type {Object}
 * @const
 */
FORGE.Pointer.events = {};

/**
 * @name FORGE.Pointer.events.TAP
 * @type {string}
 * @const
 */
FORGE.Pointer.events.TAP = "tap";

/**
 * @name FORGE.Pointer.events.DOUBLE_TAP
 * @type {string}
 * @const
 */
FORGE.Pointer.events.DOUBLE_TAP = "doubletap";

/**
 * @name FORGE.Pointer.events.PRESS_START
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PRESS_START = "press";

/**
 * @name FORGE.Pointer.events.PRESS_END
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PRESS_END = "pressup";

/**
 * @name FORGE.Pointer.events.PAN_START
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PAN_START = "panstart";

/**
 * @name FORGE.Pointer.events.PAN_MOVE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PAN_MOVE = "panmove";

/**
 * @name FORGE.Pointer.events.PAN_END
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PAN_END = "panend";

/**
 * @name FORGE.Pointer.events.PINCH_START
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PINCH_START = "pinchstart";

/**
 * @name FORGE.Pointer.events.PINCH_MOVE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PINCH_MOVE = "pinchmove";

/**
 * @name FORGE.Pointer.events.PINCH_END
 * @type {string}
 * @const
 */
FORGE.Pointer.events.PINCH_END = "pinchend";

/**
 * @name FORGE.Pointer.events.ROTATE_START
 * @type {string}
 * @const
 */
FORGE.Pointer.events.ROTATE_START = "rotatestart";

/**
 * @name FORGE.Pointer.events.ROTATE_MOVE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.ROTATE_MOVE = "rotatemove";

/**
 * @name FORGE.Pointer.events.ROTATE_END
 * @type {string}
 * @const
 */
FORGE.Pointer.events.ROTATE_END = "rotateend";

/**
 * @name FORGE.Pointer.events.SWIPE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.SWIPE = "swipe";

/**
 * @name FORGE.Pointer.events.ENTER
 * @type {string}
 * @const
 */
FORGE.Pointer.events.ENTER = "mouseenter";

/**
 * @name FORGE.Pointer.events.LEAVE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.LEAVE = "mouseleave";

/**
 * @name FORGE.Pointer.events.OVER
 * @type {string}
 * @const
 */
FORGE.Pointer.events.OVER = "mouseover";

/**
 * @name FORGE.Pointer.events.OUT
 * @type {string}
 * @const
 */
FORGE.Pointer.events.OUT = "mouseout";

/**
 * @name FORGE.Pointer.events.MOVE
 * @type {string}
 * @const
 */
FORGE.Pointer.events.MOVE = "mousemove";

/**
 * @name FORGE.Pointer.events.WHEEL
 * @type {string}
 * @const
 */
FORGE.Pointer.events.WHEEL = "wheel";


/**
 * @name FORGE.Pointer.cursors
 * @type {Object}
 * @const
 */
FORGE.Pointer.cursors = {};

/**
 * @name FORGE.Pointer.cursors.DEFAULT
 * @type {string}
 * @const
 */
FORGE.Pointer.cursors.DEFAULT = "default";

/**
 * @name FORGE.Pointer.cursors.POINTER
 * @type {string}
 * @const
 */
FORGE.Pointer.cursors.POINTER = "pointer";

/**
 * @name FORGE.Pointer.cursors.GRAB
 * @type {string}
 * @const
 */
FORGE.Pointer.cursors.GRAB = "grab";

/**
 * @name FORGE.Pointer.cursors.GRABBING
 * @type {string}
 * @const
 */
FORGE.Pointer.cursors.GRABBING = "grabbing";
