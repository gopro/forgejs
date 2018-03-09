/**
 * Get equirectangular texel coordinates from spherical point
 * Theta equals 0 at center of the equirectangular texture, -pi at left and +pi at right
 * @param  {vec3} spherePT - spherical pt
 * @return {vec2} texture coordinates
 */
vec2 equirectangularTexCoords(in vec3 spherePT) {
    spherePT = vec3(1.0, toSpherical(spherePT).yz);
    spherePT.y = wrap(spherePT.y + PI, -PI, PI);
    return 0.5 + spherePT.yz / vec2(TWO_PI, PI);
}

/**
 * Get cubeface texel coordinates from spherical point
 * Theta equals 0 at center of the equirectangular texture, -pi at left and +pi at right
 * @param  {vec3} spherePT - spherical pt
 * @return {vec2} texture coordinates
 */
vec2 cubefaceTexCoords(in vec3 spherePT) {
    spherePT = normalize(spherePT);
    vec2 faceCoords, colrow;

    // Projected coordinates (2 coords for each pair of plane)
    float y_x = spherePT.y / spherePT.x;
    float z_x = spherePT.z / spherePT.x;
    float x_y = spherePT.x / spherePT.y;
    float z_y = spherePT.z / spherePT.y;
    float x_z = spherePT.x / spherePT.z;
    float y_z = spherePT.y / spherePT.z;

    vec2 proj_x = vec2(z_x, y_x);
    vec2 proj_y = vec2(x_y, z_y);
    vec2 proj_z = vec2(x_z, y_z);

    // Useful vectors
    vec2 v_unit = vec2(1.0);
    vec2 v_flip = vec2(1.0, -1.0);

    // Front / Back
    if (all(lessThanEqual(abs(proj_z), v_unit))) {
        float direction = dot(spherePT, vec3(0., 0., 1.));

        // Back
        if (direction > 0.0) {
            colrow = vec2(2.0, 0.0);
            faceCoords = -proj_z * v_flip;
        }
        // Front
        else {
            colrow = vec2(1.0, 0.0);
            faceCoords = -proj_z;
        }
    }

    // Left / Right
    else
    if (all(lessThanEqual(abs(proj_x), v_unit))) {
        float direction = dot(spherePT, vec3(1., 0., 0.));

        // Left
        if (direction > 0.0) {
            colrow = vec2(0.0, 1.0);
            faceCoords = proj_x;
        }
        // Right
        else {
            colrow = vec2(1.0, 1.0);
            faceCoords = proj_x * v_flip;
        }
    }

    // Up / Down
    else
    if (all(lessThanEqual(abs(proj_y), v_unit))) {
        float direction = dot(spherePT, vec3(0., 1., 0.));

        // Up
        if (direction > 0.0) {
            colrow = vec2(2.0, 1.0);
            faceCoords = proj_y;
        }
        // Down
        else {
            colrow = vec2(0.0, 0.0);
            faceCoords = -proj_y * v_flip;
        }
    }

    else {
        discard;
    }

    // Scale [-1 .. 1] coordinates from cube face projection to [0 .. 1]
    // and then add offset and scale to find the right face
    return ((0.5 + 0.5 * 0.99 * faceCoords) + colrow) / vec2(3.0, 2.0);
}

/**
 * Get texture UV coordinates from a spherical point
 * @param  {vec3} spherePT - point on a sphere (cartesian coordinates)
 * @return {vec2} UV texture coordinates
 */
vec2 getTexCoords(vec3 spherePT, int mediaFormat) {

    if (mediaFormat == 1) {
        return cubefaceTexCoords(spherePT);
    }

    // mediaFormat is 0 or default value
    return equirectangularTexCoords(spherePT);
}
