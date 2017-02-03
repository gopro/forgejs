/**
 * Vertex shader
 * Rectilinear view projection
 */

#include <defines>
#include <vert_attributes>
#include <uniforms>

uniform float tViewportResolutionRatio;

varying vec2 vUv;

void main() {
    vec4 camPt = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * camPt;

    vUv = uv;
}
