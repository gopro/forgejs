/**
 * Vertex shader
 * Little planet view projection
 */

#include <defines>
#include <vert_attributes>
#include <uniforms>

uniform float tProjectionScale;
uniform float tViewportResolutionRatio;

varying vec2 vUv;

void main() {
    vec4 camPt = modelViewMatrix * vec4( position, 1.0 );

    camPt.z -= distance(camPt, vec4(vec3(0.0), 1.0));
    camPt.xyz /= tProjectionScale;

    gl_Position = projectionMatrix * camPt;

    vUv = uv;
}
