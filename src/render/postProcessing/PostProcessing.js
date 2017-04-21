/**
 * FORGE.PostProcessing
 * Post processing class.
 *
 * @constructor FORGE.PostProcessing
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.PostProcessing = function(viewer)
{
    /**
     * The viewer reference.
     * @name FORGE.PostProcessing#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * Input config.
     * @name FORGE.PostProcessing#_config
     * @type {?FXConfig}
     * @private
     */
    this._config = null;

    /**
     * Shader pass sets.
     * @name FORGE.PostProcessing#_sets
     * @type {Object<string, Array<FX>>}
     * @private
     */
    this._sets = null;

    FORGE.BaseObject.call(this, "PostProcessing");

    this._boot();
};

FORGE.PostProcessing.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.PostProcessing.prototype.constructor = FORGE.PostProcessing;


/**
 * Init routine
 * @method FORGE.PostProcessing#_boot
 * @private
 */
FORGE.PostProcessing.prototype._boot = function()
{
    this._sets = {};
};

/**
 * Configuration parsing
 * @method FORGE.PostProcessing#_parseConfig
 * @param {FXConfig} config input media configuration
 * @private
 */
FORGE.PostProcessing.prototype._parseConfig = function(config)
{
    this._uid = config.uid;

    if (typeof config.fxSets !== "undefined" && config.fxSets.length > 0)
    {
        // Create sets of fx configuration
        for (var i = 0, ii = config.fxSets.length; i < ii; i++)
        {
            var fxConfig = config.fxSets[i];
            this._sets[fxConfig.uid] = fxConfig.set;
        }
    }
};

/**
 * Parse shader config
 * @method FORGE.PostProcessing#_parseShaderConfig
 * @param {FX} shaderConfig - a shader configuration
 * @return {THREE.Pass} pass to be added to the render pipeline
 */
FORGE.PostProcessing.prototype._parseShaderConfig = function(shaderConfig)
{
    var shader = THREE[shaderConfig.type];
    var pass = new FORGE.ShaderPass(shaderConfig.uid, shaderConfig.type, shader);

    if (typeof pass.uniforms !== "undefined")
    {
        for (var param in shaderConfig.params)
        {
            var paramValue = shaderConfig.params[param];
            var value = paramValue;

            // Check if param is an object to build
            if (typeof paramValue === "object" && paramValue.hasOwnProperty("type") && paramValue.hasOwnProperty("args"))
            {
                var args = paramValue.args;
                switch (paramValue.type)
                {
                    case "THREE.Color":
                        if (args.length === 3)
                        {
                            value = new THREE.Color(args[0], args[1], args[2]);
                        }
                        else if (typeof args === "string" || typeof args === "number")
                        {
                            value = new THREE.Color(args);
                        }
                        else
                        {
                            throw new Error("Cannot create THREE.Color with " + (typeof args) + " (length " + args.length + ")");
                        }
                        break;

                    case "THREE.Vector2":
                        value = new THREE.Vector2(args[0], args[1]);
                        break;

                    case "THREE.Vector3":
                        value = new THREE.Vector3(args[0], args[1], args[2]);
                        break;
                }
            }

            pass.uniforms[param].value = value;
        }
    }

    return pass;
};

/**
 * Parse shader config
 * @method FORGE.PostProcessing#_parsePassConfig
 * @param {FX} passConfig - a pass configuration
 * @return {THREE.Pass} pass to be added to the render pipeline
 */
FORGE.PostProcessing.prototype._parsePassConfig = function(passConfig)
{
    var constructor = THREE[passConfig.type];

    var args = [];
    if (typeof passConfig.args !== "undefined")
    {
        // If args is an array, feed constructor with it, else create array from values if it's an object
        if (passConfig.args instanceof Array)
        {
            args = [null].concat(passConfig.args);
        }
        else
        {
            args = [null].concat(Object.values(passConfig.args));
        }
    }

    var pass = new (Function.prototype.bind.apply(constructor, args));
    pass.uid = passConfig.uid;

    if (typeof passConfig.params !== "undefined")
    {
        for (var param in passConfig.params)
        {
            pass[param] = passConfig.params[param];    
        }        
    }

    return pass;
};

/**
 * Parse shader passes from FX configuration object
 * @method FORGE.PostProcessing#parseShaderPasses
 * @param {Array<FX>} fxConfig - a set of FX
 * @return {Array<THREE.ShaderPass>} array of shader passes
 */
FORGE.PostProcessing.prototype.parseShaderPasses = function(fxConfig)
{
    if (typeof fxConfig === "undefined" ||
        fxConfig === null ||
        fxConfig.length === 0)
    {
        return [];
    }

    var passes = [];

    for (var j = 0, jj = fxConfig.length; j < jj; j++)
    {
        var fx = /** type {FX} */ (fxConfig[j]);

        if (!THREE.hasOwnProperty(fx.type))
        {
            this.warn("Unknown image effect (" + fx.type + ")");
            continue;
        }

        var pass = null;
        if (fx.type.indexOf("Shader") != -1)
        {
            pass = this._parseShaderConfig(fx);
        }
        else if (fx.type.indexOf("Pass") != -1)
        {
            pass = this._parsePassConfig(fx);
        }

        if (pass !== null)
        {
            passes.push(pass);
        }
    }

    return passes;
};

/**
 * Add a post processing config.
 * @method FORGE.PostProcessing#addConfig
 * @param {string} uid fx unique identifier
 * @return {Array<FX>} fx set
 */
FORGE.PostProcessing.prototype.getFxSetByUID = function(uid)
{
    return this._sets[uid];
};

/**
 * Add a post processing config.
 * @method FORGE.PostProcessing#addConfig
 * @param {FXConfig} config - The config you want to add.
 */
FORGE.PostProcessing.prototype.addConfig = function(config)
{
    this._config = config;
    this._parseConfig(this._config);
};

/**
 * Destroy sequence
 * @method FORGE.PostProcessing#destroy
 */
FORGE.PostProcessing.prototype.destroy = function()
{
    this._viewer = null;
    this._sets = null;
};
