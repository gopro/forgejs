/**
 * Fragment shader drawing wireframe
 * Wireframe is computed using barycentric coordinates
 * Compute distance to the edge to find what should be displayed
 */

#extension GL_OES_standard_derivatives : enable

#include <defines>

#define WIRE_THICKNESS 1.0

uniform vec3 tColor;

varying vec3 vBarycentricCoords;
varying vec2 vUv;

void main() {
    // Wireframe should be drawn when barycentric coords of
    // opposite corner is near zero. 
    // Compute quadratic sum of partial derivatives to get a fixed
    // width and a threshold giving a smooth profile.
    // vec3 dfdx = dFdx(vBarycentricCoords);
    // vec3 dfdy = dFdy(vBarycentricCoords);
    // vec3 threshold = vec3(WIRE_THICKNESS * sqrt(dfdx * dfdx + dfdy * dfdy));
    vec3 threshold = vec3(WIRE_THICKNESS * fwidth(vBarycentricCoords));

    // Compute amount at local point depending on threshold
    // and apply smoothstep for antialiasing
    vec3 amount = smoothstep(vec3(0.0), threshold, vBarycentricCoords);
    float a = min(amount.x, min(amount.y, amount.z));

    // Use amount to compute color and alpha and draw the texel
    float alpha = 1.0 - a;

    gl_FragColor = vec4(tColor.rgb, alpha);
}
