/**
 * Vertex shader
 * Rectilinear view projection
 */

#include <defines>
#include <vert_attributes_wireframe>
#include <uniforms>

uniform float tViewportResolutionRatio;

varying vec2 vUv;
varying vec2 vQuadrilateralCoords;

void main() {
    vec4 camPt = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * camPt;

    vUv = uv;
    vQuadrilateralCoords = quadrilateralCoords;
}
