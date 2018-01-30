/**
 * FORGE.FX
 * Post processing FX class.
 *
 * @constructor FORGE.FX
 * @param {ViewportConfig} config - fx configuration
 * @extends {FORGE.BaseObject}
 */
FORGE.FX = function(config)
{
    /**
     * FX configuration
     * @name FORGE.FX#_config
     * @type {FXConfig}
     * @private
     */
    this._config = config;

    FORGE.BaseObject.call(this, "FX");

    this._boot();
};

FORGE.FX.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.FX.prototype.constructor = FORGE.FX;

/**
 * boot sequence
 * @method FORGE.FX#_boot
 * @private
 */
FORGE.FX.prototype._boot = function()
{
    if (typeof this._config.type === "undefined" || !this._config.type in THREE)
    {
        this.warn("Unknown image effect (" + this._type + ")");
        return;
    }

    this._uid = this._config.uid;

    this._register();
};

/**
 * Get parameter value
 * @method FORGE.FX#_getParamValue
 * @param {object} param - fx param
 * @private
 */
FORGE.FX.prototype._getParamValue = function(param)
{
    if (typeof param === "boolean" || typeof param === "string" || typeof param === "number")
    {
        return param;
    }

    else if (typeof param === "object")
    {
        if ("type" in param && "args" in param)
        {
            var args = param.args;

            switch (param.type)
            {
                case "THREE.Color":
                    if (args.length === 3)
                    {
                        return new THREE.Color(args[0], args[1], args[2]);
                    }
                    else if (typeof args === "string" || typeof args === "number")
                    {
                        return new THREE.Color(args);
                    }
                    else
                    {
                        throw new Error("Cannot create THREE.Color with " + (typeof args) + " (length " + args.length + ")");
                    }
                    break;

                case "THREE.Vector2":
                    return new THREE.Vector2(args[0], args[1]);
                    break;

                case "THREE.Vector3":
                    return new THREE.Vector3(args[0], args[1], args[2]);
                    break;

                default:
                    this.warn("Param value with unknown type " + param.type);
                    return null;
            }
        }
    }

    else
    {
        this.warn("Param value with unknown type " + param.type);
        return null;
    }
};

/**
 * Create pass with known type
 * @method FORGE.FX#_createTypedPass
 * @param {FXConfig} config - fx configuration
 * @private
 */
FORGE.FX.prototype._createTypedPass = function(config)
{
    var constructor = THREE[config.type];

    if (constructor === undefined)
    {
        return;
    }

    var args = [null];

    if (typeof config.args !== "undefined")
    {
        for (var prop in config.args)
        {
            args.push(config.args[prop]);
        }
    }

    var pass = new (Function.prototype.bind.apply(constructor, args));

    if (typeof config.params !== "undefined")
    {
        for (var param in config.params)
        {
            pass[param] = config.params[param];    
        }        
    }

    return pass;
};

/**
 * Create shader pass
 * @method FORGE.FX#_createShaderPass
 * @param {FXConfig} config - fx configuration
 * @private
 */
FORGE.FX.prototype._createShaderPass = function(config)
{
    var pass = new FORGE.ShaderPass(THREE[config.type], "tDiffuse");

    if (typeof pass.uniforms !== "undefined")
    {
        for (var param in config.params)
        {
            pass.uniforms[param].value = this._getParamValue(config.params[param]);
        }
    }

    return pass;
};

/**
 * Create pass
 * @method FORGE.FX#_createPass
 * @param {FXConfig} config - fx configuration
 * @return {THREE.Pass} shader pass 
 * @private
 */
FORGE.FX.prototype.createPass = function()
{
    if (this._config.type.indexOf("Shader") != -1)
    {
        return this._createShaderPass(this._config);
    }

    else if (this._config.type.indexOf("Pass") != -1)
    {
        return this._createTypedPass(this._config);
    }

    return null;
};

/**
 * Destroy sequence
 * @method FORGE.FX#destroy
 * @private
 */
FORGE.FX.prototype.destroy = function()
{
    this._config = null;

    FORGE.BaseObject.prototype.destroy.call(this);
};
