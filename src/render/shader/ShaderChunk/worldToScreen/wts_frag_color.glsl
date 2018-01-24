/**
 * Fragment shader - single color drawing
 */

#include <defines>

uniform sampler2D tTexture;
uniform vec3 tColor;
uniform float tOpacity;

varying vec2 vUv;

void main() {
    vec2 texCoords = vUv;

    vec4 texel = texture2D( tTexture, vUv );
    if (texel.a < 0.001) {
        discard;
    }

    gl_FragColor = vec4(tColor, tOpacity);
}
