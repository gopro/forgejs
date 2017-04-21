
/**
 * Manage Display Objects list and fullscreen events.
 * @constructor FORGE.DisplayList
 * @extends {FORGE.BaseObject}
 * @param {FORGE.Viewer} viewer - Viewer reference.
 */
FORGE.DisplayList = function(viewer)
{
    /**
     * The viewer reference.
     * @name  FORGE.DisplayList#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Array that references all the display objects.
     * @name  FORGE.DisplayList#_objects
     * @type {Array<FORGE.DisplayObject>}
     * @private
     */
    this._objects = [];

    /**
     * Array that references the display objects that needs to be updated.
     * @name  FORGE.DisplayList#_objectsToUpdate
     * @type {Array<Object>}
     * @private
     */
    this._objectsToUpdate = [];

    /**
     * fullscreen change handler binded to this context.
     * @name FORGE.DisplayList#_fullScreenChangeBind
     * @type {Function}
     * @private
     */
    this._fullScreenChangeBind = null;

    /**
     * The object that is currently in fullscreen.
     * @name FORGE.DisplayObject#_fullscreenObject
     * @type {FORGE.DisplayObject}
     * @private
     */
    this._fullscreenObject = null;

    FORGE.BaseObject.call(this, "DisplayList");

    this._boot();
};

FORGE.DisplayList.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.DisplayList.prototype.constructor = FORGE.DisplayList;

/**
 * Boot sequence
 * @method FORGE.DisplayList#_boot
 * @private
 */
FORGE.DisplayList.prototype._boot = function()
{
    this._fullScreenChangeBind = this._fullScreenChangeHandler.bind(this);

    //Listen to all kind of events for cross browser compatibility
    document.addEventListener("fullscreenchange", this._fullScreenChangeBind, false);
    document.addEventListener("mozfullscreenchange", this._fullScreenChangeBind, false);
    document.addEventListener("webkitfullscreenchange", this._fullScreenChangeBind, false);
    document.addEventListener("MSFullscreenChange", this._fullScreenChangeBind, false);
};

/**
 * Event handler for full screen change.
 * @name  FORGE.DisplayList#_fullScreenChangeHandler
 * @private
 */
FORGE.DisplayList.prototype._fullScreenChangeHandler = function()
{
    this.log("_fullScreenChangeHandler");

    if(document[FORGE.Device.fullscreenElement] !== null)
    {
        var obj;
        var n = this._objects.length;

        while(n--)
        {
            obj = this._objects[n];

            if(obj.dom === document[FORGE.Device.fullscreenElement])
            {
                this._fullscreenObject = obj;
                break;
            }
        }

        if (this._fullscreenObject === null)
        {
            this._fullscreenObject = this._objects[0];
        }

        this._fullscreenObject._notifyFullscreenEnter();
    }
    else if (this._fullscreenObject !== null)
    {
        this._fullscreenObject._notifyFullscreenExit();
        this._fullscreenObject = null;
    }
};

/**
 * Registers a display object in the display list.
 * @method  FORGE.DisplayList#register
 * @param  {FORGE.DisplayObject} object - The display object to register.
 * @param  {boolean=} update - Is this display object needs to be updated updated?
 */
FORGE.DisplayList.prototype.register = function(object, update)
{
    this._objects.push(object);

    if(update === true)
    {
        this._objectsToUpdate.push(object);
    }
};

/**
 * Unregister a display object from the display list.
 * @method  FORGE.DisplayList#unregister
 * @param {FORGE.DisplayObject} object - The object to unregister from the display list.
 */
FORGE.DisplayList.prototype.unregister = function(object)
{
    this._objects.splice(this._objects.indexOf(object), 1);

    var index = this._objectsToUpdate.indexOf(object);

    if(index !== -1)
    {
        this._objectsToUpdate.splice(index, 1);
    }
};

/**
 * Update method of the DisplayList
 * @method FORGE.DispalyList#update
 */
FORGE.DisplayList.prototype.update = function()
{
    for(var i = 0, ii = this._objectsToUpdate.length; i < ii; i++)
    {
        this._objectsToUpdate[i].update();
    }
};

/**
 * Destroy sequence
 * @method FORGE.DisplayList#destroy
 */
FORGE.DisplayList.prototype.destroy = function()
{
    var objCount = this._objects.length;
    while(objCount--)
    {
        this._objects[objCount].destroy();
    }

    this._objects = [];
    this._objectsToUpdate = [];

    document.removeEventListener("fullscreenchange", this._fullScreenChangeBind, false);
    document.removeEventListener("mozfullscreenchange", this._fullScreenChangeBind, false);
    document.removeEventListener("webkitfullscreenchange", this._fullScreenChangeBind, false);
    document.removeEventListener("MSFullscreenChange", this._fullScreenChangeBind, false);

    this._fullScreenChangeBind = null;
    this._fullscreenObject = null;
};

/**
 * Types of display objects.
 * @name  FORGE.DisplayList.types
 * @type {Array<string>}
 */
FORGE.DisplayList.types =
[
    "DisplayObject",
    "DisplayObjectContainer",
    "Image",
    "TextField",
    "Button",
    "VideoDash",
    "VideoHTML5",
    "Canvas",
    "Sprite",
    "Iframe"
];
