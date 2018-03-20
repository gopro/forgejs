/**
 * Fragment shader reverse projection - screen to world
 * Rectilinear view projection
 */

#include <defines>

uniform int tMediaFormat;
uniform int tMediaFormatTransition;

uniform int tTransition;
uniform float tMixRatio;
uniform sampler2D tTextureTransition;

uniform vec3 tColor;
uniform vec3 tColorTransition;

uniform sampler2D tTexture;
uniform vec4 tViewport;
uniform float tViewportRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>
#include <stw_frag_rectilinear>

// Have to remove this
#include <fibonacci>
#include <transition>

void main()
{
    vec2 screenPT = getScreenPoint(gl_FragCoord, tViewport);
    vec3 spherePT = normalize(screenToWorld(screenPT, tViewport, tModelViewMatrixInverse, tProjectionScale));
    vec2 texCoords = getTexCoords(spherePT, tMediaFormat);
    vec2 texTransitionCoords = getTexCoords(spherePT, tMediaFormatTransition);
    gl_FragColor = getFragColor(spherePT, screenPT, texCoords, texTransitionCoords);
}
