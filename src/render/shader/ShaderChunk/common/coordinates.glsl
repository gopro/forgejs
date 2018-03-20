/**
 * Converts 3D point from spherical into cartersian coordinates
 * @param  {vec3} rtp - spherical coordinates (.x = radius, .y = azimuth, .z = elevation)
 * @return {vec3} cartesian coordinates xyz
 */
vec3 sphericalToCartesian(in vec3 rtp)
{
    float r = rtp.x;
    float theta = rtp.y;
    float phi = rtp.z;
    float x = r * cos(phi) * sin(theta);
    float y = r * sin(phi);
    float z = r * cos(phi) * cos(theta);

    return vec3(x, y, z);
}

/**
 * Converts 3D point from cartersian into spherical coordinates
 * @param  {vec3} pt - cartesian coordinates xyz
 * @return {object} rtp spherical coordinates (.x = radius, .y = azimuth, .z = elevation)
 */
vec3 cartesianToSpherical(in vec3 pt)
{
    float r = length(pt);
    float theta = -atan(pt.x, pt.z);
    float phi = asin(pt.y / r);

    return vec3(r, theta, phi);
}
