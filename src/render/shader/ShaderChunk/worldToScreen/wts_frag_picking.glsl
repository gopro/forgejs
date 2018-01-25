/**
 * Fragment shader - single color drawing for picking purpose
 * It will lookup texture to discard points where texture alpha is null
 */

#include <defines>

uniform sampler2D tTexture;
uniform vec3 tColor;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D( tTexture, vUv );
    if (texel.a < 0.001) {
        discard;
    }

    gl_FragColor = vec4(tColor, 1.0);
}
