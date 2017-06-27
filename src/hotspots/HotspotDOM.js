/**
 * A HotspotDOM, to be displayed like a billboard. This hotspot provides a
 * single div positioned at the right position in the scene, without any
 * content in it and any deformation. It is up to the FORGE user to specify
 * those. Two things can be tweaked here: the displayObject property of this
 * hotspot, which is a {@link FORGE.DisplayObjectContainer}, and the DOM part
 * of this container, accessible through `displayObject.dom` or more directly
 * using the `dom` property on the object HotspotDOM.
 *
 * @constructor FORGE.HotspotDOM
 * @param {FORGE.Viewer} viewer - viewer reference
 * @param {HotspotConfig} config - hotspot configuration
 * @extends {FORGE.BaseObject}
 */
FORGE.HotspotDOM = function(viewer, config)
{
    /**
     * The viewer reference
     * @name FORGE.HotspotDOM#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Hotspot configuration
     * @name FORGE.HotspotDOM#_config
     * @type {HotspotConfig}
     * @private
     */
    this._config = config;

    /**
     * HotspotTransform object for the positioning and scaling (no rotation)
     * @name  FORGE.Hotspot3D#_transform
     * @type {FORGE.HotspotTransform}
     * @private
     */
    this._transform = null;

    /**
     * The HTML element composing the hotspot
     * @name FORGE.HotspotDOM#_dom
     * @type {Element|HTMLElement}
     * @private
     */
    this._dom = null;

    /**
     * Events object that will keep references of the ActionEventDispatcher
     * @name FORGE.HotspotDOM#_events
     * @type {Object<FORGE.ActionEventDispatcher>}
     * @private
     */
    this._events = null;

    FORGE.BaseObject.call(this, "HotspotDOM");

    this._boot();
};

FORGE.HotspotDOM.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotDOM.prototype.constructor = FORGE.HotspotDOM;

/**
 * @name FORGE.HotspotDOM.DEFAULT_CONFIG
 * @type {HotspotConfig}
 */
FORGE.HotspotDOM.DEFAULT_CONFIG =
{
    dom:
    {
        id: "hostpot-dom",
        width: 320,
        height: 240,
        color: "white",
        index: 10
    }
};

/**
 * Boot sequence.
 * @method FORGE.HotspotDOM#_boot
 * @private
 */
FORGE.HotspotDOM.prototype._boot = function()
{
    this._transform = new FORGE.HotspotTransform();

    this._events = {};

    this._parseConfig(this._config);
    this._register();

    this._viewer.renderer.view.onChange.add(this._viewChangeHandler, this);
};

/**
 * Parse the config object
 * @method FORGE.HotspotDOM#_parseConfig
 * @param {HotspotConfig} config - the hotspot config to parse
 * @private
 */
FORGE.HotspotDOM.prototype._parseConfig = function(config)
{
    config = /** @type {HotspotConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.HotspotDOM.DEFAULT_CONFIG, config));

    this._uid = config.uid;

    if (typeof config.events === "object" && config.events !== null)
    {
        this._createEvents(config.events);
    }

    var dom = config.dom;

    if (dom !== null && typeof dom !== "undefined")
    {
        var id;

        if (typeof dom.id === "string")
        {
            id = dom.id;
        }
        else
        {
            id = this._uid;
        }

        // get the already present hotspot in the dom, or create it
        var div = document.getElementById(id);

        if (div !== null)
        {
            this._dom = div;
        }
        else
        {
            this._dom = document.createElement("div");
            this._dom.id = id;
        }

        this._dom.classList.add("hotspot-dom");
        this._dom.style.position = "absolute";

        if (typeof dom.class === "string")
        {
            this._dom.classList.add(dom.class);
        }
        else if (Array.isArray(dom.class) === true)
        {
            for (var i = 0, ii = dom.class.length; i < ii; i++)
            {
                this._dom.classList.add(dom.class[i]);
            }
        }

        // basic CSS from json configuration
        var rule = "." + this._dom.id + "-basic-class {";

        if (typeof dom.width === "number")
        {
            rule += "width: " + dom.width + "px;";
        }
        else if (typeof dom.width === "string")
        {
            rule += "width: " + dom.width + ";";
        }

        if (typeof dom.height === "number")
        {
            rule += "height: " + dom.height + "px;";
        }
        else if (typeof dom.height === "string")
        {
            rule += "height: " + dom.height + ";";
        }

        if (typeof dom.color === "string")
        {
            rule += "background-color: " + dom.color + ";";
        }

        if (typeof dom.index === "number")
        {
            rule+= "z-index: " + dom.index + ";";
        }

        rule += "}";
        this._viewer.domHotspotStyle.sheet.insertRule(rule, 0);
        this._dom.classList.add(this._dom.id + "-basic-class");
    }

    this._dom.style.pointerEvents = "auto";
    this._dom.addEventListener("click", this._domClickHandler.bind(this));
    this._dom.addEventListener("mouseover", this._domOverHandler.bind(this));
    this._dom.addEventListener("mouseout", this._domOutHandler.bind(this));

    if (config.transform !== null && typeof config.transform !== "undefined")
    {
        this._transform.load(config.transform, false);
    }

    this.show();
};

FORGE.HotspotDOM.prototype._domClickHandler = function(event)
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onClick, "ActionEventDispatcher") === true)
    {
        this._events.onClick.dispatch();
    }
};

FORGE.HotspotDOM.prototype._domOverHandler = function(event)
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onOver, "ActionEventDispatcher") === true)
    {
        this._events.onOver.dispatch();
    }
};

FORGE.HotspotDOM.prototype._domOutHandler = function(event)
{
    // Actions defined from the json
    if(FORGE.Utils.isTypeOf(this._events.onOut, "ActionEventDispatcher") === true)
    {
        this._events.onOut.dispatch();
    }
};

/**
 * Create action events dispatchers.
 * @method FORGE.HotspotDOM#_createEvents
 * @private
 * @param {Object} events - The events config of the dom hotspot.
 */
FORGE.HotspotDOM.prototype._createEvents = function(events)
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
 * Clear all object events.
 * @method FORGE.HotspotDOM#_clearEvents
 * @private
 */
FORGE.HotspotDOM.prototype._clearEvents = function()
{
    for(var e in this._events)
    {
        this._events[e].destroy();
        this._events[e] = null;
    }
};

/**
 * Handles the changing view, as it can only be present in the Rectilinear view.
 * @method FORGE.HotspotDOM#_viewChangeHandler
 * @private
 */
FORGE.HotspotDOM.prototype._viewChangeHandler = function()
{
    this._dom.style.display = "block";

    if (this._viewer.view.type !== FORGE.ViewType.RECTILINEAR)
    {
        this._dom.style.display = "none";
    }
};

/**
 * Show the hotspot by appending it to the DOM container.
 * @method FORGE.HotspotDOM#show
 */
FORGE.HotspotDOM.prototype.show = function()
{
    this._viewer.domHotspotContainer.dom.appendChild(this._dom);
};

/**
 * Hide the hotspot by removing it to the DOM container.
 * @method FORGE.HotspotDOM#hide
 */
FORGE.HotspotDOM.prototype.hide = function()
{
    this._viewer.domHotspotContainer.dom.removeChild(this._dom, false);
};

/**
 * Update routine
 * @method FORGE.HotspotDOM#update
 */
FORGE.HotspotDOM.prototype.update = function()
{
    // get the screen position of the hotspots
    var position = this._viewer.view.worldToScreen(this._transform.position.values);

    if (position !== null)
    {
        var x = position.x - this._dom.clientWidth / 2;
        var y = position.y - this._dom.clientHeight / 2;
        this._dom.style.left = x + "px";
        this._dom.style.top = y + "px";
    }
    else
    {
        this._dom.style.left = "99999px";
        this._dom.style.top = "99999px";
    }
};

/**
 * Destroy routine
 * @method FORGE.HotspotDOM#destroy
 */
FORGE.HotspotDOM.prototype.destroy = function()
{
    this._dom = null;

    this._transform.destroy();
    this._transform = null;

    this._clearEvents();
    this._events = null;
};

/**
 * @name FORGE.HotspotDOM#dom
 * @readonly
 * @type {?Element|HTMLElement}
 */
Object.defineProperty(FORGE.HotspotDOM.prototype, "dom",
{
    /** @this {FORGE.HotspotDOM} */
    get: function()
    {
        return this._dom;
    }
});
