/**
 * Vertex shader
 * Rectilinear view projection for equirectangular texture
 */

#include <defines>
#include <vert_attributes>
#include <uniforms>

uniform float tViewportResolutionRatio;

varying vec3 vWorldPosition;

void main() {
    vec4 camPt = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * camPt;

    vWorldPosition = vec3( position );
}
