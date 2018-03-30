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
uniform vec2 tTextureResolution;

uniform vec4 tViewport;
uniform float tViewportRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>
#include <fibonacci>
#include <transition>

/**
 * Rectilinear view screen to world inverse projection
 * @param  {vec2} screenPT - screen pt
 * @return {vec3} world pt
 */
vec3 projectionInverse(vec2 screenPT) {
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(tProjectionScale * screenToNDC(screenPT), -1.0, 1.0);

    // World space point
    vec4 worldPT = tModelViewMatrixInverse * clipPT;

    // Spherical point for texture lookup
    return worldPT.xyz;
}

void main() {
    vec2 screenPT = getScreenPt();
    vec3 spherePT = normalize(projectionInverse(screenPT));
    vec2 texCoords = getTexCoords(spherePT, tMediaFormat);
    vec2 texTransitionCoords = getTexCoords(spherePT, tMediaFormatTransition);
    gl_FragColor = getFragColor(spherePT, screenPT, texCoords, texTransitionCoords);
}
