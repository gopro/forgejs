/**
 * Fragment shader reverse projection - screen to world
 * Rectilinear view projection
 */

#include <defines>

uniform int tTransition;
uniform float tTime;
uniform float tMixRatio;
uniform sampler2D tTransitionTexture;

uniform sampler2D tTexture;
uniform vec4 tViewport;
uniform float tViewportRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>
#include <fibonacci>
#include <transition>

vec3 projection(vec2 screenPT) {
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(tProjectionScale * screenToNDC(screenPT), -1.0, 1.0);

    // World space point
    vec4 worldPT = tModelViewMatrixInverse * clipPT;

    // Spherical point for texture lookup
    return worldPT.xyz;
}

void main() {
    vec2 screenPT = getScreenPt();
    vec3 spherePT = normalize(projection(screenPT));
    vec2 texCoords = toEquirectangularTexCoords(toSpherical(spherePT).yz);
    gl_FragColor = getFragColor(spherePT, screenPT, texCoords);
}
