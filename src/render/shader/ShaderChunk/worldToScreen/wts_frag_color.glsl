/**
 * Fragment shader - single color drawing
 */

#include <defines>

uniform vec3 tColor;
uniform float tOpacity;

varying vec2 vUv;

void main() {
    vec2 texCoords = vUv;
    gl_FragColor = vec4(tColor, tOpacity);
}
