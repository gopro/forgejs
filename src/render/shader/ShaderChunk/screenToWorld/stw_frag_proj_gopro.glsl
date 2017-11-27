/**
 * Fragment shader reverse projection - screen to world
 * GoPro view projection
 */

#include <defines>

uniform int tTransition;
uniform float tTime;
uniform float tMixRatio;
uniform sampler2D tTransitionTexture;

uniform sampler2D tTexture;
uniform vec2 tViewportResolution;
uniform float tViewportResolutionRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionDistance;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>
#include <fibonacci>
#include <transition>

vec3 projection(vec2 screenPT) {

    vec2 frag = screenToNDC(screenPT);
    vec2 c = tProjectionScale * frag;
    float zs = tProjectionDistance;
    float xy2 = dot(c,c);
    float zs12 = (zs + 1.0) * (zs + 1.0);
    float delta = 4.0 * (zs * zs * xy2 * xy2 - (xy2 + zs12) * (xy2 * zs * zs - zs12));
    if (delta < 0.0) { return vec3(-1.); }
    float z = (2.0 * zs * xy2 - sqrt(delta)) / (2.0 * (zs12 + xy2));
    float x = c.x * ((zs - z) / (zs + 1.0));
    float y = c.y * ((zs - z) / (zs + 1.0));
    return vec3(tModelViewMatrixInverse * vec4(x, y, z, 1.0));
}

void main() {
    vec2 screenPT = getScreenPt();
    vec3 spherePT = normalize(projection(screenPT));
    vec2 texCoords = toEquirectangularTexCoords(toSpherical(spherePT).yz);
    gl_FragColor = getFragColor(spherePT, screenPT, texCoords);
}
