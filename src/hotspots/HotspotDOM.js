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
     * The {@link FORGE.DisplayObjectContainer} representing the hotspot
     * @name FORGE.HotspotDOM#_displayObject
     * @type {FORGE.DisplayObjectContainer}
     * @private
     */
    this._displayObject = null;

    FORGE.BaseObject.call(this, "HotspotDOM");

    this._boot();
};

FORGE.HotspotDOM.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.HotspotDOM.prototype.constructor = FORGE.HotspotDOM;

/**
 * @name FORGE.HotspotDOM.DEFAULT_CONFIG
 * @type {HotspotDomConfig}
 */
FORGE.HotspotDOM.DEFAULT_CONFIG =
{
    id: "hostpot-dom",
    width: 320,
    height: 240,
    color: "white",
    index: 10

};

/**
 * Boot sequence.
 * @method FORGE.HotspotDOM#_boot
 * @private
 */
FORGE.HotspotDOM.prototype._boot = function()
{
    this._displayObject = new FORGE.DisplayObjectContainer(this._viewer);
    this._transform = new FORGE.HotspotTransform();
    this._viewer.renderer.view.onChange.add(this._viewChangeHandler, this);
    this._register();
    this._parseConfig(this._config);
};

/**
 * Parse the config object
 * @method FORGE.HotspotDOM#_parseConfig
 * @param {HotspotConfig} config - the hotspot config to parse
 * @private
 */
FORGE.HotspotDOM.prototype._parseConfig = function(config)
{
    config = /** @type {HotspotConfig} */ (FORGE.Utils.extendMultipleObjects(FORGE.HotspotDOM.DEFAULT_CONFIG, config.dom));

    if (config !== null && typeof config !== "undefined")
    {
        if (typeof config.id === "string")
        {
            this._displayObject.id = config.id;
        }

        if (typeof config.width === "number" || typeof config.width === "string")
        {
            this._displayObject.width = config.width;
        }

        if (typeof config.height === "number" || typeof config.width === "string")
        {
            this._displayObject.height = config.height;
        }

        if (typeof config.color === "string")
        {
            this._displayObject.background = config.color;
        }

        if (typeof config.index === "number")
        {
            this._displayObject.index = config.index;
        }
    }

    this.show();
};

/**
 * Handles the changing view, as it can only be present in the Rectilinear view.
 * @method FORGE.HotspotDOM#_viewChangeHandler
 * @private
 */
FORGE.HotspotDOM.prototype._viewChangeHandler = function()
{
    this._displayObject.visible = true;

    if (this._viewer.view.type !== FORGE.ViewType.RECTILINEAR)
    {
        this._displayObject.visible = false;
    }
};

/**
 * Show the hotspot by appending it to the DOM container.
 * @method FORGE.HotspotDOM#show
 */
FORGE.HotspotDOM.prototype.show = function()
{
    this._viewer.domHotspotContainer.addChild(this._displayObject);
};

/**
 * Hide the hotspot by removing it to the DOM container.
 * @method FORGE.HotspotDOM#hide
 */
FORGE.HotspotDOM.prototype.hide = function()
{
    this._viewer.domHotspotContainer.removeChild(this._displayObject, false);
};

/**
 * Update routine
 * @method FORGE.HotspotDOM#update
 */
FORGE.HotspotDOM.prototype.update = function()
{
};

/**
 * Destroy routine
 * @method FORGE.HotspotDOM#destroy
 */
FORGE.HotspotDOM.prototype.destroy = function()
{
    this._displayObject.destroy();
    this._displayObject = null;

    this._transform.destroy();
    this._transform = null;
};

/**
 * @name FORGE.HotspotDOM#displayObject
 * @readonly
 * @type {FORGE.DisplayObjectContainer}
 */
Object.defineProperty(FORGE.HotspotDOM.prototype, "displayObject",
{
    /** @this {FORGE.HotspotDOM} */
    get: function()
    {
        return this._displayObject;
    }
});

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
        if (this._displayObject !== null)
        {
            return this._displayObject.dom;
        }

        return null;
    }
});
