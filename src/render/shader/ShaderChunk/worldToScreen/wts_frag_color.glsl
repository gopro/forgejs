/**
 * Fragment shader
 * Retrieve a color with given opacity
 * Use this shader to apply simple colors to a mesh
 */

#include <defines>

uniform float tOpacity;
uniform vec3 tColor;

varying vec2 vUVCoord;

void main()
{
    gl_FragColor = vec4(tColor, tOpacity);
}
