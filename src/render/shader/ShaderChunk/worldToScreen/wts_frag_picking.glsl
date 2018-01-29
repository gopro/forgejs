/**
 * Fragment shader
 * Draw single color for picking purpose
 * Texture is looked up to discard points where alpha is null
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
