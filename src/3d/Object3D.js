
/**
 * ForgeJS Base 3d object with a mesh and events mechanisms.
 * @constructor FORGE.Object3D
 * @param {FORGE.Viewer} viewer - Viewer reference.
 * @param {string=} className - Class name for objects that extends Object3D
 * @extends {FORGE.BaseObject}
 */
FORGE.Object3D = function(viewer, className)
{
    /**
     * Viewer reference
     * @name  FORGE.Object3D#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * THREE Mesh
     * @name FORGE.Object3D#_mesh
     * @type {THREE.Mesh}
     * @private
     */
    this._mesh = null;

    /**
     * The fx set id applied to the object
     * @name  FORGE.Object3D#_fx
     * @type {string}
     * @private
     */
    this._fx = "";

    /**
     * Visibility flag
     * @name  FORGE.Object3D#_visible
     * @type {boolean}
     * @private
     */
    this._visible = true;

    /**
     * Is this object is interactive / raycastable
     * @name FORGE.Object3D#_interactive
     * @type {boolean}
     * @private
     */
    this._interactive = true;

    /**
     * Events object that will keep references of the ActionEventDispatcher
     * @name FORGE.Object3D#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = null;

    /**
     * The hovered flag is set to true when any pointer is over the object.
     * @name FORGE.Object3D#_hovered
     * @type {boolean}
     * @private
     */
    this._hovered = false;

    /**
     * Color based on 3D Object id used for picking.
     * @name FORGE.Object3D#_pickingColor
     * @type {THREE.Color}
     * @private
     */
    this._pickingColor = null;

    /**
     * Is ready?
     * @name  FORGE.Object3D#_ready
     * @type {boolean}
     * @private
     */
    this._ready = false;

    /**
     * Click event dispatcher
     * @name FORGE.Object3D#_onClick
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onClick = null;

    /**
     * Over event dispatcher
     * @name FORGE.Object3D#_onOver
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onOver = null;

    /**
     * Out event dispatcher
     * @name FORGE.Object3D#_onOut
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onOut = null;

    /**
     * Event dispatcher for ready state.
     * @name FORGE.Object3D#_onReady
     * @type {FORGE.EventDispatcher}
     * @private
     */
    this._onReady = null;

    FORGE.BaseObject.call(this, className || "Object3D");

    this._boot();
};

FORGE.Object3D.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.Object3D.prototype.constructor = FORGE.Object3D;

/**
 * Boot sequence.
 * @method FORGE.Object3D#_boot
 */
FORGE.Object3D.prototype._boot = function()
{
    this._events = {};
    this._mesh = new THREE.Mesh();
    this._pickingColor = FORGE.PickingDrawPass.colorFrom3DObject(this._mesh);
    this._viewer.renderer.objects.register(this);
};

/**
 * Create action events dispatchers.
 * @method FORGE.Object3D#_createEvents
 * @private
 * @param {Object} events - The events config of the 3d object.
 */
FORGE.Object3D.prototype._createEvents = function(events)
{
    var event;
    for(var e in events)
    {
        event = new FORGE.ActionEventDispatcher(this._viewer, e);
        event.addActions(events[e]);
        this._events[e] = event;
    }
};

/**
 * Triggers actions for the click event
 * @method FORGE.Object3D#click
 */
FORGE.Object3D.prototype.click = function()
{
    this.log("click " + this._mesh.id);

    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onClick, "ActionEventDispatcher") === true)
    {
        this._events.onClick.dispatch();
    }

    // Classical event dispatcher
    if(this._onClick !== null)
    {
        this._onClick.dispatch();
    }
};

/**
 * Triggers actions for the over event
 * @method FORGE.Object3D#over
 */
FORGE.Object3D.prototype.over = function()
{
    this.log("over " + this._mesh.id);

    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onOver, "ActionEventDispatcher") === true)
    {
        this._events.onOver.dispatch();
    }

    // Classical event dispatcher
    if(this._onOver !== null)
    {
        this._onOver.dispatch();
    }
};

/**
 * Triggers actions for the out event
 * @method FORGE.Object3D#out
 */
FORGE.Object3D.prototype.out = function()
{
    this.log("out " + this._mesh.id);

    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onOut, "ActionEventDispatcher") === true)
    {
        this._events.onOut.dispatch();
    }

    // Classical event dispatcher
    if(this._onOut !== null)
    {
        this._onOut.dispatch();
    }
};

/**
 * Destroy sequence
 * @method FORGE.Object3D#destroy
 */
FORGE.Object3D.prototype.destroy = function()
{
    this._viewer.renderer.objects.unregister(this);

    if (this._mesh !== null)
    {
        this._mesh.userData = null;

        if (this._mesh.geometry !== null)
        {
            this._mesh.geometry.dispose();
            this._mesh.geometry = null;
        }

        this._mesh.material = null;

        this._mesh = null;
    }

    if(this._onClick !== null)
    {
        this._onClick.destroy();
        this._onClick = null;
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

    if(this._onReady !== null)
    {
        this._onReady.destroy();
        this._onReady = null;
    }

    this._viewer = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};

/**
 * 3D object mesh
 * @name FORGE.Object3D#mesh
 * @readonly
 * @type {THREE.Mesh}
  */
Object.defineProperty(FORGE.Object3D.prototype, "mesh",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._mesh;
    }
});

/**
 * Get and set the visible flag
 * @name FORGE.Object3D#visible
 * @type {boolean}
 */
Object.defineProperty(FORGE.Object3D.prototype, "visible",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._visible;
    },
    /** @this {FORGE.Object3D} */
    set: function(value)
    {
        this._visible = Boolean(value);

        if(this._mesh !== null)
        {
            this._mesh.visible = this._visible;
        }
    }
});

/**
 * Get and set the hovered flag
 * @name FORGE.Object3D#hovered
 * @type {boolean}
 */
Object.defineProperty(FORGE.Object3D.prototype, "hovered",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._hovered;
    },
    /** @this {FORGE.Object3D} */
    set: function(value)
    {
        this._hovered = Boolean(value);
    }
});


/**
 * Get and set the interactive flag
 * @name FORGE.Object3D#interactive
 * @type {boolean}
 */
Object.defineProperty(FORGE.Object3D.prototype, "interactive",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._interactive;
    },
    /** @this {FORGE.Object3D} */
    set: function(value)
    {
        this._interactive = Boolean(value);
    }
});

/**
 * Get the FX applied to this object
 * @name FORGE.Object3D#fx
 * @readonly
 * @type {string}
 */
Object.defineProperty(FORGE.Object3D.prototype, "fx",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._fx;
    }
});

/**
 * Get the events of this object
 * @name FORGE.Object3D#events
 * @readonly
 * @type {Object}
 */
Object.defineProperty(FORGE.Object3D.prototype, "events",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._events;
    }
});

/**
 * Object3D ready flag
 * @name FORGE.Object3D#ready
 * @readonly
 * @type boolean
  */
Object.defineProperty(FORGE.Object3D.prototype, "ready",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        return this._ready;
    }
});

/**
 * Get the onClick {@link FORGE.EventDispatcher}.
 * @name FORGE.Object3D#onClick
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Object3D.prototype, "onClick",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        if (this._onClick === null)
        {
            this._onClick = new FORGE.EventDispatcher(this);
        }

        return this._onClick;
    }
});

/**
 * Get the onOver {@link FORGE.EventDispatcher}.
 * @name FORGE.Object3D#onOver
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Object3D.prototype, "onOver",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        if (this._onOver === null)
        {
            this._onOver = new FORGE.EventDispatcher(this);
        }

        return this._onOver;
    }
});

/**
 * Get the onOut {@link FORGE.EventDispatcher}.
 * @name FORGE.Object3D#onOut
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Object3D.prototype, "onOut",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        if (this._onOut === null)
        {
            this._onOut = new FORGE.EventDispatcher(this);
        }

        return this._onOut;
    }
});

/**
 * Get the onReady {@link FORGE.EventDispatcher}.
 * @name FORGE.Object3D#onReady
 * @readonly
 * @type {FORGE.EventDispatcher}
 */
Object.defineProperty(FORGE.Object3D.prototype, "onReady",
{
    /** @this {FORGE.Object3D} */
    get: function()
    {
        if (this._onReady === null)
        {
            this._onReady = new FORGE.EventDispatcher(this);
        }

        return this._onReady;
    }
});

