/**
 * Vertex shader - screen to world
 */

#include <defines>

void main() {
   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

