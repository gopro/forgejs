/**
 * EffectComposer class.
 *
 * Used to feed time to shader when uniform is declared
 *
 * @constructor FORGE.EffectComposer
 * @param {string} type - effect composer type
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.WebGLRenderTarget=} renderTarget - render target
 * @extends {THREE.EffectComposer}
 */
FORGE.EffectComposer = function(type, renderer, renderTarget)
{
    /**
     * Effect composer type
     * @name FORGE.EffectComposer#_type
     * @type {string}
     * @private
     */
    this._type = type || FORGE.EffectComposerType.RENDER;

    /**
     * Rendering target
     * @name FORGE.EffectComposer#_renderTarget
     * @type {?THREE.WebGLRenderTarget}
     * @private
     */
    this._renderTarget = renderTarget || null;

    /**
     * Name
     * @name FORGE.EffectComposer#_name
     * @type {string}
     * @private
     */
    this._name = "";

    /**
     * Enabled flag
     * @name FORGE.EffectComposer#_enabled
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    THREE.EffectComposer.call(this, renderer, renderTarget);

    this._boot();
};

FORGE.EffectComposer.prototype = Object.create(THREE.EffectComposer.prototype);
FORGE.EffectComposer.prototype.constructor = FORGE.EffectComposer;

/**
 * Boot sequence
 * @method FORGE.EffectComposer#_boot
 * @private
 */
FORGE.EffectComposer.prototype._boot = function()
{
    this._name = FORGE.EffectComposer.getUniqueName(this._type);
};

/**
 * Destroy sequence
 * @method FORGE.EffectComposer#destroy
 */
FORGE.EffectComposer.prototype.destroy = function()
{
    this._renderTarget = null;

    this.writeBuffer.dispose();
    this.writeBuffer = null;

    this.readBuffer.dispose();
    this.readBuffer = null;
};

/**
 * Static EffectComposer uid
 * @name FORGE.EffectComposer#uid
 * @type {number}
 */
FORGE.EffectComposer.uid = 0;

/**
 * Get EffectComposer unique name
 * @name FORGE.EffectComposer#getUniqueName
 * @param {string} type effect composer type
 * @return {string} unique name
 */
FORGE.EffectComposer.getUniqueName = function(type)
{
    return "FORGE.EffectComposer." + type + "." + (FORGE.EffectComposer.uid++);
};

/**
 * Get EffectComposer type
 * @name FORGE.EffectComposer#type
 * @type {string}
 */
Object.defineProperty(FORGE.EffectComposer.prototype, "type",
{
    /** @this {FORGE.EffectComposer} */
    get: function()
    {
        return this._type;
    }
});

/**
 * EffectComposer render target
 * @name FORGE.EffectComposer#renderTarget
 * @type {THREE.WebGLRenderTarget}
 */
Object.defineProperty(FORGE.EffectComposer.prototype, "renderTarget",
{
    /** @this {FORGE.EffectComposer} */
    get: function()
    {
        return this.readBuffer;
    },

    /** @this {FORGE.EffectComposer} */
    set: function(value)
    {
        if (this.readBuffer !== null)
        {
            this.readBuffer.dispose();
        }
        this.readBuffer = value;
    }
});

/**
 * EffectComposer enabled flag
 * @name FORGE.EffectComposer#enabled
 * @type {boolean}
 */
Object.defineProperty(FORGE.EffectComposer.prototype, "enabled",
{
    /** @this {FORGE.EffectComposer} */
    get: function()
    {
        return this._enabled;
    },

    /** @this {FORGE.EffectComposer} */
    set: function(value)
    {
        this._enabled = value;
    }
});

/**
 * Get EffectComposer name
 * @name FORGE.EffectComposer#name
 * @type {string}
 */
Object.defineProperty(FORGE.EffectComposer.prototype, "name",
{
    /** @this {FORGE.EffectComposer} */
    get: function()
    {
        return this._name;
    }
});
