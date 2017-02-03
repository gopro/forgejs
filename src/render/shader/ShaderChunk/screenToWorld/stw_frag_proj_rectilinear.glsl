/**
 * Fragment shader reverse projection - screen to world
 * Rectilinear view projection
 */

#include <defines>

uniform sampler2D tTexture;
uniform vec2 tViewportResolution;
uniform float tViewportResolutionRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>

vec2 projection() {
    // [-1 .. 1 , -1 .. 1]
    vec2 frag = tProjectionScale * getFragment();

    // Screen point is on the zn plane, expressed it in clip space
    vec4 screenPT = vec4(frag, -1.0, 1.0);

    // World space point
    vec4 worldPT = tModelViewMatrixInverse * screenPT;

    // Spherical point for texture lookup
    return toSpherical(worldPT.xyz).yz;
}

void main() {
    vec2 texCoords = toEquirectangularTexCoords(projection());
    gl_FragColor = vec4(texture2D(tTexture, texCoords).rgb, 1.0);
}
