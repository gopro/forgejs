/**
 * Fragment shader
 */

#include <defines>

uniform sampler2D tTexture;
uniform float tOpacity;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D( tTexture, vUv );
    gl_FragColor = vec4(texel.rgb, texel.a * tOpacity);
}
