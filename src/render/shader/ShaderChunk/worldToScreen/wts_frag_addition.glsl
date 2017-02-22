/**
 * Addition pass shader
 */

#include <defines>

uniform sampler2D tTexture;
uniform sampler2D tAdd;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D( tTexture, vUv );
    vec4 texelAdd = texture2D( tAdd, vUv );
    float alpha = max(texel.a, texelAdd.a);
    gl_FragColor = vec4(vec3(texelAdd.a * texelAdd.rgb + (1.0 - texelAdd.a) * texel.rgb), alpha);
}
