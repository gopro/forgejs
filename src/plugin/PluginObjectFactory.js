
/**
 * Factory helper to create object inside plugins.<br>
 * The factory knows what objects are created for a plugin, so it can destroy all object of the plugin at plugin destroy.
 *
 * @constructor FORGE.PluginObjectFactory
 * @param {FORGE.Viewer} viewer - {@link FORGE.Viewer} reference.
 * @param {FORGE.Plugin} plugin - The {@link FORGE.Plugin} that will use this factory.
 * @extends {FORGE.BaseObject}
 *
 * @todo add the file key restriction for i18n stuff
 */
FORGE.PluginObjectFactory = function(viewer, plugin)
{
    /**
     * The viewer reference.
     * @name FORGE.PluginEngine#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The plugin reference.
     * @name FORGE.PluginEngine#_plugin
     * @type {FORGE.Plugin}
     * @private
     */
    this._plugin = plugin;

    /**
     * The type of object list.
     * @name FORGE.PluginEngine#_objects
     * @type {Array<Object>}
     * @private
     */
    this._objects = [];

    FORGE.BaseObject.call(this, "PluginObjectFactory");
};

FORGE.PluginObjectFactory.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PluginObjectFactory.prototype.constructor = FORGE.PluginObjectFactory;

/**
 * Search for an object into the list.
 * @method FORGE.PluginObjectFactory#_indexOfObject
 * @param  {Object} obj - The object to look for.
 * @return {number} Returns the index of the object found, if not, returns -1.
 * @private
 */
FORGE.PluginObjectFactory.prototype._indexOfObject = function(obj)
{
    var n = this._objects.length;
    var o;

    while(n--)
    {
        o = this._objects[n];

        if(o === obj)
        {
            return n;
        }
    }

    return -1;
};

/**
 * Internal handler on object destroy.
 * @method FORGE.PluginObjectFactory#_destroyObjectHandler
 * @param  {FORGE.Event} event - The event.
 * @private
 */
FORGE.PluginObjectFactory.prototype._destroyObjectHandler = function(event)
{
    var o = event.emitter;
    var i = this._indexOfObject(o);
    this._objects.splice(i, 1);
};

/**
 * Add a {@link FORGE.LocaleString}.
 * @method FORGE.PluginObjectFactory#string
 * @param  {string} key - Object key.
 * @return {FORGE.LocaleString} Returns the created FORGE.LocaleString.
 */
FORGE.PluginObjectFactory.prototype.string = function(key)
{
    var str = new FORGE.LocaleString(this._viewer, key);
    str.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(str);
    return str;
};

/**
 * Add a {@link FORGE.Textfield}.
 * @method FORGE.PluginObjectFactory#textField
 * @param  {(string|TextFieldConfig)} config - Object configuration.
 * @return {FORGE.TextField} Returns the created FORGE.Textfield.
 */
FORGE.PluginObjectFactory.prototype.textField = function(config)
{
    var textField = new FORGE.TextField(this._viewer, config);
    textField.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(textField);
    return textField;
};

/**
 * Add a {@link FORGE.Sound}.
 * @method FORGE.PluginObjectFactory#sound
 * @param {string} key - Object key.
 * @param {string} url - The sound url.
 * @return {FORGE.Sound} Returns the created FORGE.Sound.
 */
FORGE.PluginObjectFactory.prototype.sound = function(key, url)
{
    var sound = new FORGE.Sound(this._viewer, key, url);
    sound.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(sound);
    return sound;
};

/**
 * Add a {@link FORGE.DisplayObjectContainer}.
 * @method FORGE.PluginObjectFactory#displayObjectContainer
 * @param  {Element|HTMLElement} dom - Dom object.
 * @return {FORGE.DisplayObjectContainer} Returns the created FORGE.DisplayObjectContainer.
 */
FORGE.PluginObjectFactory.prototype.displayObjectContainer = function(dom)
{
    var displayObjectContainer = new FORGE.DisplayObjectContainer(this._viewer, dom);
    displayObjectContainer.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(displayObjectContainer);
    return displayObjectContainer;
};

/**
 * Add a {@link FORGE.DisplayObject}.
 * @method FORGE.PluginObjectFactory#displayObject
 * @param  {Element|HTMLElement} dom - Dom object.
 * @return {FORGE.DisplayObject} Returns the created FORGE.DisplayObject.
 */
FORGE.PluginObjectFactory.prototype.displayObject = function(dom)
{
    var displayObject = new FORGE.DisplayObject(this._viewer, dom);
    displayObject.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(displayObject);
    return displayObject;
};

/**
 * Add a {@link FORGE.Image}.
 * @method FORGE.PluginObjectFactory#image
 * @param  {string|Object} config - URL of the image or an image configuration object.
 * @param  {boolean} relativeToPluginPath
 * @return {FORGE.Image} Returns the created FORGE.Image.
 */
FORGE.PluginObjectFactory.prototype.image = function(config, relativeToPluginPath)
{
    var c = config;

    if(typeof config === "string")
    {
        c = {"key": null, "url": config};
    }

    c.key = this._plugin.uid + "-" + c.key;

    if(relativeToPluginPath !== false)
    {
        c.url = this._plugin.fullUrl + c.url;
    }

    var img = new FORGE.Image(this._viewer, c);
    img.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(img);
    return img;
};

/**
 * Add a {@link FORGE.Sprite}.
 * @method FORGE.PluginObjectFactory#sprite
 * @param  {Object} config - Sprite configuration object.
 * @param  {boolean} relativeToPluginPath
 * @return {FORGE.Image} Returns the created FORGE.Sprite.
 */
FORGE.PluginObjectFactory.prototype.sprite = function(config, relativeToPluginPath)
{
    var c = config;

    c.key = this._plugin.uid + "-" + c.key;

    if(relativeToPluginPath !== false)
    {
        c.url = this._plugin.fullUrl + c.url;
        c.frames = this._plugin.fullUrl + c.frames;
    }

    var sprite = new FORGE.Sprite(this._viewer, c);
    sprite.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(sprite);
    return sprite;
};

/**
 * Add a {@link FORGE.Button}.
 * @method FORGE.PluginObjectFactory#button
 * @param  {ButtonConfig} config - The button configuration object.
 * @return {FORGE.Button} Returns the created FORGE.Button.
 */
FORGE.PluginObjectFactory.prototype.button = function(config)
{
    var button = new FORGE.Button(this._viewer, config);
    button.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(button);
    return button;
};

/**
 * Add a {@link FORGE.Video}.
 * @method FORGE.PluginObjectFactory#video
 * @param {string} key - The video Id reference.
 * @param {?(string|FORGE.VideoQuality|Array<(FORGE.VideoQuality|string)>)=} config - The video configuration object
 * @param {string=} streaming - The video streaming format. Can be "HTML5" or "DASH".
 * @param {string=} qualityMode - The video quality mode. Can be "auto" or "manual".
 * @param {number=} ambisonicOrder - Ambisonic order to use for FOA/HOA renderer. For "HTML5" video only.
 * @return {(FORGE.VideoHTML5|FORGE.VideoDash)} Returns the created FORGE.Video object.
 */
FORGE.PluginObjectFactory.prototype.video = function(key, config, streaming, qualityMode, ambisonicOrder)
{
    var video;

    if(typeof streaming !== "undefined" && streaming.toLowerCase() === FORGE.VideoFormat.DASH)
    {
        video = new FORGE.VideoDash(this._viewer, key, config, qualityMode);
    }
    else
    {
        video = new FORGE.VideoHTML5(this._viewer, key, config, qualityMode, ambisonicOrder);
    }

    video.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(video);
    return video;
};

/**
 * Add a {@link FORGE.Canvas}.
 * @method FORGE.PluginObjectFactory#canvas
 * @return {FORGE.Canvas} Returns the created FORGE.Canvas.
 */
FORGE.PluginObjectFactory.prototype.canvas = function()
{
    var canvas = new FORGE.Canvas(this._viewer);
    canvas.onDestroy.addOnce(this._destroyObjectHandler, this);

    this._objects.push(canvas);
    return canvas;
};

/**
 * Add a {@link FORGE.Tween}.
 * @method FORGE.PluginObjectFactory#tween
 * @param {Object} object
 * @return {FORGE.Tween} Returns the created FORGE.Tween.
 */
FORGE.PluginObjectFactory.prototype.tween = function(object)
{
    var tween = new FORGE.Tween(this._viewer, object);
    tween.onDestroy.addOnce(this._destroyObjectHandler, this);
    this._viewer.tween.add(tween);

    this._objects.push(tween);
    return tween;
};

/**
 * Destroy all objects.
 * @method FORGE.PluginObjectFactory#destroyAllObjects
 */
FORGE.PluginObjectFactory.prototype.destroyAllObjects = function()
{
    this.log("destroyAllObjects();");

    var n = this._objects.length;

    while(n--)
    {
        this._objects[n].destroy();
    }
};

/**
 * Destroy method.
 * @method FORGE.PluginObjectFactory#destroy
 */
FORGE.PluginObjectFactory.prototype.destroy = function()
{
    this.destroyAllObjects();

    this._viewer = null;
    this._plugin = null;
    this._objects = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
