/**
 * Fragment shader
 * Retrieve the color of a texture
 * Alpha is mixed with input opacity
 */

#include <defines>

uniform float tOpacity;
uniform sampler2D tTexture;

varying vec2 vUVCoord;

void main()
{
    vec4 texel = texture2D( tTexture, vUVCoord );
    gl_FragColor = vec4(texel.rgb, texel.a * tOpacity);
}
