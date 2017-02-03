/**
 * Vertex shader
 * GoPro view projection for equirectangular texture
 */

#include <defines>
#include <vert_attributes>
#include <uniforms>

uniform float tProjectionDistance;
uniform float tProjectionScale;
uniform float tViewportResolutionRatio;

varying vec3 vWorldPosition;

void main() {
    vec4 camPt = modelViewMatrix * vec4( position, 1.0 );

    vec4 origin = vec4(vec3(0.0), 1.0);
    camPt.z -= tProjectionDistance * distance(camPt, origin);
    camPt.xyz /= max(1.0, tProjectionScale);

    gl_Position = projectionMatrix * camPt;

    vWorldPosition = vec3(position);
}
