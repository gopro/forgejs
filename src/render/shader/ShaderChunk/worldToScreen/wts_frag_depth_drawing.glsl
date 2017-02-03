/**
 * Fragment shader - depth drawing
 */

#include <defines>

varying float vDepth;

void main() {
    gl_FragColor = vec4(vDepth, vDepth, vDepth, 1.0);
}
