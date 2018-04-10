/**
 * @namespace {FORGEProgram} FORGE.ShaderLib
 */

//jscs:disable

FORGE.ShaderLib = {

    screenToWorld:
    {
        rectilinear:
        {
            /** @type {FORGEUniform} */
            uniforms:
            {
                tMediaFormat : { type: "i", value: 0 },
                tMediaFormatTransition : { type: "i", value: 0 },
                tTransition: { type: "i", value: 1 },
                tTextureTransition: { type: "t", value: null },
                tMixRatio: { type: "f", value: 0.0 },
                tTexture: { type: "t", value: null },
                tViewport: { type: "v4", value: new THREE.Vector4() },
                tViewportRatio: { type: "f", value: 1.0 },
                tModelViewMatrixInverse: { type: "m4", value: new THREE.Matrix4() },
                tProjectionScale: { type: "f", value: 1.0 }
            },

            vertexShader: FORGE.ShaderChunk.stw_vert_main,
            fragmentShader: FORGE.ShaderChunk.stw_frag_rectilinear_main
        },

        flat:
        {
            /** @type {FORGEUniform} */
            uniforms:
            {
                tTexture: { type: "t", value: null },
                tTextureRatio: { type: "f", value: 1.0 },
                tViewport: { type: "v4", value: new THREE.Vector4() },
                tViewportRatio: { type: "f", value: 1.0 },
                tFov: { type: "f", value: 0.0 },
                tYaw: { type: "f", value: 0.0 },
                tPitch: { type: "f", value: 0.0 },
                tRepeatX: { type: "i", value: 0 },
                tRepeatY: { type: "i", value: 0 }
            },

            vertexShader: FORGE.ShaderChunk.stw_vert_main,
            fragmentShader: FORGE.ShaderChunk.stw_frag_flat_main
        },

        gopro:
        {
            /** @type {FORGEUniform} */
            uniforms:
            {
                tMediaFormat : { type: "i", value: 0 },
                tMediaFormatTransition : { type: "i", value: 0 },
                tTransition: { type: "i", value: 0 },
                tTextureTransition: { type: "t", value: null },
                tMixRatio: { type: "f", value: 0.0 },
                tTexture: { type: "t", value: null },
                tViewport: { type: "v4", value: new THREE.Vector4() },
                tViewportRatio: { type: "f", value: 1.0 },
                tModelViewMatrixInverse: { type: "m4", value: new THREE.Matrix4() },
                tProjectionDistance: { type: "f", value: 0.0 },
                tProjectionScale: { type: "f", value: 1.0 }
            },

            vertexShader: FORGE.ShaderChunk.stw_vert_main,
            fragmentShader: FORGE.ShaderChunk.stw_frag_gopro_main
        }
    },

    worldToScreen:
    {
        rectilinear:
        {
            map:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_map
            },

            color:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_color
            },

            pick:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tUseTextureAlpha: { type: "i", value: 1 },
                    tTexture: { type: "t", value: null },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_pick
            },

            wireframe:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tBackgroundColor: { type: "c", value: new THREE.Color() },
                    tColor: { type: "c", value: new THREE.Color() },
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear_wireframe,
                fragmentShader: FORGE.ShaderChunk.wts_frag_wireframe
            }
        },

        flat:
        {
            map:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_map
            },

            color:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_color
            },

            pick:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tUseTextureAlpha: { type: "i", value: 1 },
                    tTexture: { type: "t", value: null },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag_pick
            },

            wireframe:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tBackgroundColor: { type: "c", value: new THREE.Color() },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear_wireframe,
                fragmentShader: FORGE.ShaderChunk.wts_frag_wireframe
            }
        },

        gopro:
        {
            map:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tProjectionDistance: { type: "f", value: 1 },
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro,
                fragmentShader: FORGE.ShaderChunk.wts_frag_map
            },

            color:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tProjectionDistance: { type: "f", value: 1 },
                    tOpacity: { type: "f", value: 1.0 },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro,
                fragmentShader: FORGE.ShaderChunk.wts_frag_color
            },

            pick:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tProjectionDistance: { type: "f", value: 1 },
                    tUseTextureAlpha: { type: "i", value: 1 },
                    tTexture: { type: "t", value: null },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro,
                fragmentShader: FORGE.ShaderChunk.wts_frag_pick
            },

            wireframe:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tProjectionDistance: { type: "f", value: 1 },
                    tBackgroundColor: { type: "c", value: new THREE.Color() },
                    tColor: { type: "c", value: new THREE.Color() }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro_wireframe,
                fragmentShader: FORGE.ShaderChunk.wts_frag_wireframe
            }
        }
    }
};

//jscs:enable


/**
 * Parses include of a shader
 * @method FORGE.ShaderLib.parseIncludes
 * @param  {string} string - The shader string to parse
 * @return {string} Returns the parsed shaders with its includes
 */
FORGE.ShaderLib.parseIncludes = function(string)
{
    // Pattern for #include <chunck-name>
    var pattern = /#include +<([\w\d.]+)>/g;

    // Replace includes by chunks
    // Will look for the chunk into FORGE.ShaderChunk then on THREE.ShaderChunk
    function replace(match, include)
    {
        var chunk = FORGE.ShaderChunk[include];

        if (typeof chunk === "undefined")
        {
            chunk = THREE.ShaderChunk[include];

            if (typeof chunk === "undefined")
            {
                throw new Error("FORGE.ShaderLib : Can not resolve #include <" + include + ">");
            }
        }

        // Call the parse include recusively on the chunk itself
        return FORGE.ShaderLib.parseIncludes(chunk);
    }

    return string.replace(pattern, replace);
};

/**
 * Clean a shader chunk from its comments
 * @method FORGE.ShaderLib.cleanChunk
 * @param  {string} string - The shader chunk to clean
 * @return {string} Returns the cleaned shader chunk
 */
FORGE.ShaderLib.cleanChunk = function(string)
{
    return string.replace( /[ \t]*\/\/.*\n/g, "" )
                 .replace( /[ \t]*\/\*[\s\S]*?\*\//g, "" )
                 .replace( /\n{2,}/g, "\n" );

};

/**
 * add a shader chunk to the FORGE.ShaderChunk namespace if it does not already exists
 * @method FORGE.ShaderLib.cleanChunk
 * @param  {string} string - The shader chunk to add
 * @param  {string} name - The name of the shader chunk to add, must be unique
 */
FORGE.ShaderLib.addChunk = function(string, name)
{
    if (typeof FORGE.ShaderChunk[name] !== "undefined")
    {
        throw new Error("FORGE.ShaderLib : Can not add a chunk named " + name + ", exists already!");
    }

    FORGE.ShaderChunk[name] = FORGE.ShaderLib.cleanChunk(string);
};

