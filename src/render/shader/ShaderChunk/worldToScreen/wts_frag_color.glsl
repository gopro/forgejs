/**
 * Fragment shader - single color drawing
 */

#include <defines>

uniform float tOpacity;
uniform vec3 tColor;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(tColor, tOpacity);
}
