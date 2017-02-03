/**
 * Fragment shader - equirectangular texture picking
 */

#include <defines>

uniform sampler2D tTexture;

varying vec3 vWorldPosition;

void main() {
    vec3 direction = normalize( vWorldPosition );

    vec2 sampleUV;
    sampleUV.y = clamp( direction.y * 0.5 + 0.5, 0.0, 1.0 );
    sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 - 0.25;
    sampleUV.x += (1.0 - step(0.0, sampleUV.x));

    gl_FragColor = texture2D( tTexture, sampleUV );
}
