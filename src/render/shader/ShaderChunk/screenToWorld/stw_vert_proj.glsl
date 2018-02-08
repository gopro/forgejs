/**
 * Vertex shader - screen to world
 */

#include <defines>
#include <vert_attributes>
#include <uniforms>

void main() {
   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

