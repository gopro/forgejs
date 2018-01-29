/**
 * Fragment shader
 * Retrieve the color of a texture
 * Alpha is mixed with input opacity
 */

#include <defines>

uniform float tOpacity;
uniform sampler2D tTexture;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D( tTexture, vUv );
    gl_FragColor = vec4(texel.rgb, texel.a * tOpacity);
}
