/**
 * Fragment shader reverse projection - screen to world
 * GoPro view projection
 */

#include <defines>

uniform sampler2D tTexture;
uniform vec2 tViewportResolution;
uniform float tViewportResolutionRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionDistance;
uniform float tProjectionScale;

#include <helpers>
#include <coordinates>
#include <texcoords>

vec2 projection() {

    vec2 frag = getFragment();
    vec2 c = tProjectionScale * frag;
    float zs = tProjectionDistance;
    float xy2 = dot(c,c);
    float zs12 = (zs + 1.0) * (zs + 1.0);
    float delta = 4.0 * (zs * zs * xy2 * xy2 - (xy2 + zs12) * (xy2 * zs * zs - zs12));
    if (delta < 0.0) { return vec2(-1.); }
    float z = (2.0 * zs * xy2 - sqrt(delta)) / (2.0 * (zs12 + xy2));
    float x = c.x * ((zs - z) / (zs + 1.0));
    float y = c.y * ((zs - z) / (zs + 1.0));
    vec3 vx = vec3(tModelViewMatrixInverse * vec4(x, y, z, 1.0));
    return toSpherical(vx).yz;
}

void main() {
    vec2 texCoords = toEquirectangularTexCoords(projection());
    gl_FragColor = vec4(texture2D(tTexture, texCoords).rgb, 1.0);
}
