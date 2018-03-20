/**
 * Vertex shader
 * GoPro view projection
 *
 * To fit with screen to world projection, world points are first projected on a unit sphere (normalized)
 * Then sphere points are scaled and shifted by a negative offset on z-axis to simulate projection from
 * a point at a distance from sphere center.
 * Finally, projectionMatrix is applied to project from origin that is no more the origin of the sphere.
 * Note: FOV used to update projection matrix should be computed to take scale and offset into account.
 */

#include <defines>
#include <vert_attributes_wireframe>
#include <uniforms>

uniform float tProjectionDistance;

varying vec2 vQuadrilateralCoords;

void main()
{
    vec4 spherePt = normalize(modelViewMatrix * vec4( position, 1.0 ));
    float radius = 1.0 - 0.5 * tProjectionDistance;
    float offset = radius - 1.0;
    spherePt.xyz *= radius;
    spherePt.z += offset;

    gl_Position = projectionMatrix * spherePt;

    vQuadrilateralCoords = quadrilateralCoords;
}
