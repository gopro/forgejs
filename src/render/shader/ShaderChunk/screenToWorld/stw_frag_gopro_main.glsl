/**
 * Fragment shader reverse projection - screen to world
 * GoPro view projection
 */

#include <defines>

uniform int tMediaFormat;
uniform int tMediaFormatTransition;

uniform int tTransition;
uniform float tMixRatio;
uniform sampler2D tTextureTransition;

uniform sampler2D tTexture;
uniform vec4 tViewport;
uniform float tViewportRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionDistance;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>
#include <stw_frag_gopro>

// Have to remove this
#include <fibonacci>
#include <transition>

void main()
{
    vec2 screenPT = getScreenPoint(gl_FragCoord, tViewport);
    vec3 spherePT = normalize(screenToWorld(screenPT, tViewport, tModelViewMatrixInverse, tProjectionScale, tProjectionDistance));
    vec2 texCoords = getTexCoords(spherePT, tMediaFormat);

    vec2 texTransitionCoords = getTexCoords(spherePT, tMediaFormatTransition);
    gl_FragColor = getFragColor(spherePT, screenPT, texCoords, texTransitionCoords);
}
