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
                tOpacity: { type: "f", value: 1.0 },
                tTexture: { type: "t", value: null },
                tViewportResolution: { type: "v2", value: new THREE.Vector2() },
                tViewportResolutionRatio: { type: "f", value: 1.0 },
                tModelViewMatrixInverse: { type: "m4", value: new THREE.Matrix4() },
                tProjectionScale: { type: "f", value: 1.0 }
            },

            vertexShader: FORGE.ShaderChunk.stw_vert_proj,
            fragmentShader: FORGE.ShaderChunk.stw_frag_proj_rectilinear
        },

        gopro:
        {
            /** @type {FORGEUniform} */
            uniforms:
            {
                tOpacity: { type: "f", value: 1.0 },
                tTexture: { type: "t", value: null },
                tViewportResolution: { type: "v2", value: new THREE.Vector2() },
                tViewportResolutionRatio: { type: "f", value: 1.0 },
                tModelViewMatrixInverse: { type: "m4", value: new THREE.Matrix4() },
                tProjectionDistance: { type: "f", value: 0.0 },
                tProjectionScale: { type: "f", value: 1.0 }
            },

            vertexShader: FORGE.ShaderChunk.stw_vert_proj,
            fragmentShader: FORGE.ShaderChunk.stw_frag_proj_gopro
        }
    },

    worldToScreen:
    {
        rectilinear:
        {
            mapping:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear,
                fragmentShader: FORGE.ShaderChunk.wts_frag
            },

            wireframe:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tColor: { type: "c", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear_wireframe,
                fragmentShader: FORGE.ShaderChunk.wts_frag_wireframe
            },

            equirectangular:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tViewportResolutionRatio: { type: "f", value: 1.0 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_rectilinear_equirectangular,
                fragmentShader: FORGE.ShaderChunk.wts_frag_equirectangular
            }
        },

        littlePlanet:
        {
            equirectangular:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tViewportResolutionRatio: { type: "f", value: 1.0 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_littleplanet_equirectangular,
                fragmentShader: FORGE.ShaderChunk.wts_frag_equirectangular
            }
        },

        gopro:
        {
            mapping:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tProjectionDistance: { type: "f", value: 1 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro,
                fragmentShader: FORGE.ShaderChunk.wts_frag
            },

            wireframe:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tColor: { type: "c", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tProjectionDistance: { type: "f", value: 1 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro_wireframe,
                fragmentShader: FORGE.ShaderChunk.wts_frag_wireframe
            },

            equirectangular:
            {
                /** @type {FORGEUniform} */
                uniforms:
                {
                    tOpacity: { type: "f", value: 1.0 },
                    tTexture: { type: "t", value: null },
                    tProjectionScale: { type: "f", value: 1 },
                    tProjectionDistance: { type: "f", value: 1 },
                    tViewportResolutionRatio: { type: "f", value: 1.0 },
                    tModelViewMatrixInverse: { type: "m4", value: null }
                },
                vertexShader: FORGE.ShaderChunk.wts_vert_gopro_equirectangular,
                fragmentShader: FORGE.ShaderChunk.wts_frag_equirectangular
            }
        }
    }
};

//jscs:enable

FORGE.ShaderLib.parseIncludes = function(string)
{
    var pattern = /#include +<([\w\d.]+)>/g;

    function replace( match, include )
    {
        var r = FORGE.ShaderChunk[include];

        if (typeof r === "undefined")
        {
            r = THREE.ShaderChunk[include];

            if (typeof r === "undefined")
            {
                throw new Error( "Can not resolve #include <" + include + ">" );
            }
        }

        return FORGE.ShaderLib.parseIncludes(r);
    }

    return string.replace( pattern, replace );
};
