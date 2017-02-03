/**
 * Get equirectangular texture coordinates UV from projected point
 * Theta equals 0 at center of the equirectangular texture, -pi at left and +pi at right
 * @param  {vec2} thetaphi - spherical angular coordinates
 * @return {vec2} equirectangular coordinates
 */
vec2 toEquirectangularTexCoords(in vec2 thetaphi) {
    thetaphi.x = wrap(thetaphi.x + PI, -PI, PI);
    vec2 coords = 0.5 + thetaphi / vec2(PI2, PI);
    return coords;
}
