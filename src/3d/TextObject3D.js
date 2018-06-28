/**
 * Text 3D object class.
 *
 * @constructor FORGE.TextObject3D
 * @param {FORGE.Viewer} viewer - reference on the viewer.
 * @param {string} text - text content.
 * @param {TextObject3DConfig} config - text object config.
 * @extends {FORGE.Object3D}
 */
FORGE.TextObject3D = function(viewer, text, config)
{
    /**
     * Text 3D configuration.
     * @name FORGE.TextObject3D#_config
     * @type {!TextObject3DConfig}
     * @private
     */
    this._config = config;

    /**
     * Text content.
     * @name FORGE.TextObject3D#_text
     * @type {string}
     * @private
     */
    this._text = typeof text === "string" ? text : "";

    /**
     * Font.
     * @name FORGE.TextObject3D#_font
     * @type {string}
     * @private
     */
    this._font = null;

    /**
     * Fill style.
     * @name FORGE.TextObject3D#_fillStyle
     * @type {string}
     * @private
     */
    this._fillStyle = null;

    /**
     * Stroke color.
     * @name FORGE.TextObject3D#_strokeColor
     * @type {string}
     * @private
     */
    this._strokeColor = null;

    /**
     * Stroke width.
     * @name FORGE.TextObject3D#_strokeWidth
     * @type {string}
     * @private
     */
    this._strokeWidth = null;

    FORGE.Object3D.call(this, viewer, "TextObject3D");
};

// FORGE.TextObject3D.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.TextObject3D.prototype = Object.create(FORGE.Object3D.prototype);
FORGE.TextObject3D.prototype.constructor = FORGE.TextObject3D;

/**
 * Boot routine
 * @method FORGE.TextObject3D#_boot
 * @private
 */
FORGE.TextObject3D.prototype._boot = function()
{
    FORGE.Object3D.prototype._boot.call(this);

    this._parseConfig(this._config);

    this._setupMesh();
};

/**
 * Configuration parsing routine
 * @method FORGE.TextObject3D#_parseConfig
 * @param {TextObject3DConfig} config - text object config.
 * @private
 */
FORGE.TextObject3D.prototype._parseConfig = function(config)
{
    this._font = typeof config.font === "string" ? config.font : "12px sans-serif";
    this._fillColor = typeof config.fillStyle === "string" ? config.fillStyle : "white";
    this._strokeColor = typeof config.strokeColor === "string" ? config.strokeColor : "black";
    this._strokeWidth = typeof config.strokeWidth === "number" ? config.strokeWidth : 0;
};

/**
 * Create mesh
 * @method FORGE.TextObject3D#_setupMesh
 * @private
 */
FORGE.TextObject3D.prototype._setupMesh = function()
{
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    context.font = this._font;
    var textWidth = context.measureText(this._text).width;
    var textHeight = textWidth / Math.max(1, Math.floor(this._text.length / 2));

    var margin = 10;
    canvas.width = FORGE.Math.greaterPOT(textWidth + 2 * margin);
    canvas.height = FORGE.Math.greaterPOT(textHeight + 2 * margin);

    context.font = this._font;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = this._fillColor;
    context.fillText(this._text, canvas.width / 2, canvas.height / 2);

    if (this._strokeWidth !== 0)
    {
        context.strokeStyle = this._strokeColor;
        context.lineWidth = this._strokeWidth;
        context.strokeText(this._text, canvas.width / 2, canvas.height / 2);
    }

    var texture = new THREE.Texture(canvas);

    texture.format = THREE.RGBAFormat;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    this._mesh.material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
    this._mesh.geometry = new THREE.PlaneBufferGeometry(canvas.width, canvas.height, 2, 2);
};

/**
 * Destroy routine
 * @method FORGE.TextObject3D#destroy
 * @private
 */
FORGE.TextObject3D.prototype.destroy = function()
{
    FORGE.Object3D.prototype.destroy.call(this);

    this._config = null;
};
