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
#include <fibonacci>
#include <transition>

/**
 * GoPro view screen to world inverse projection
 * @param  {vec2} screenPT - screen pt
 * @return {vec3} world pt
 */
vec3 projectionInverse(vec2 screenPT) {
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(tProjectionScale * screenToNDC(screenPT), -1.0, 1.0);

    float zs = tProjectionDistance;
    float zs12 = (zs + 1.0) * (zs + 1.0);

    float xy2 = dot(clipPT.xy, clipPT.xy);
    float delta = 4.0 * (zs * zs * xy2 * xy2 - (xy2 + zs12) * (xy2 * zs * zs - zs12));
    if (delta < 0.0) {
        return vec3(-1.);
    }

    float z = (2.0 * zs * xy2 - sqrt(delta)) / (2.0 * (zs12 + xy2));
    float x = clipPT.x * ((zs - z) / (zs + 1.0));
    float y = clipPT.y * ((zs - z) / (zs + 1.0));

    vec4 worldPT = tModelViewMatrixInverse * vec4(x, y, z, 1.0);

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
