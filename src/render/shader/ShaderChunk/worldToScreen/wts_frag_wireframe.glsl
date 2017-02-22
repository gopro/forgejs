/**
 * Fragment shader drawing wireframe
 * Wireframe is computed using barycentric coordinates
 * Compute distance to the edge to find what should be displayed
 */

#extension GL_OES_standard_derivatives : enable 

#include <defines>

// Set thickness to 1.5. Seems like 1.0 adds aliasing to the grid.
#define WIRE_THICKNESS 1.50

uniform vec3 tColor;

varying vec2 vUv;
varying vec2 vQuadrilateralCoords;


void main() {
    // Wireframe should be drawn when barycentric coords of
    // opposite corner is near zero. 
    // Compute quadratic sum of partial derivatives to get a fixed
    // width and a threshold giving a smooth profile.
    vec2 dfdx = dFdx(vQuadrilateralCoords);
    vec2 dfdy = dFdy(vQuadrilateralCoords);
    vec2 threshold = vec2(WIRE_THICKNESS * sqrt(dfdx * dfdx + dfdy * dfdy));

    // Compute amount at local point depending on threshold
    // and apply smoothstep for antialiasing
    vec2 amount = smoothstep(vec2(0.0), WIRE_THICKNESS * threshold, vec2(1.0) - abs(vQuadrilateralCoords));

    // Use amount to compute color and alpha and draw the texel
    float alpha = 1.0 - amount.x * amount.y;

    gl_FragColor = vec4(tColor.rgb, alpha);
}
