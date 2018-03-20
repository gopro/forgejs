
/**
 * GoPro view screen to world inverse projection
 * @param  {vec2} screenPT - Screen point
 * @param  {vec4} viewport - The viewport rectangle
 * @param  {mat4} matrixInverse - The model view matrix inverse
 * @param  {float} scale - The projection scale
 * @param  {float} distance - The projection distance
 * @return {vec3} Returns a world point
 */
vec3 screenToWorld(vec2 screenPT, vec4 viewport, mat4 matrixInverse, float scale, float distance)
{
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(scale * screenToNDC(screenPT, viewport), -1.0, 1.0);

    float zs = distance;
    float zs12 = (zs + 1.0) * (zs + 1.0);

    float xy2 = dot(clipPT.xy, clipPT.xy);
    float delta = 4.0 * (zs * zs * xy2 * xy2 - (xy2 + zs12) * (xy2 * zs * zs - zs12));

    if (delta < 0.0)
    {
        return vec3(-1.);
    }

    float z = (2.0 * zs * xy2 - sqrt(delta)) / (2.0 * (zs12 + xy2));
    float x = clipPT.x * ((zs - z) / (zs + 1.0));
    float y = clipPT.y * ((zs - z) / (zs + 1.0));

    vec4 worldPT = matrixInverse * vec4(x, y, z, 1.0);

    // Spherical point for texture lookup
    return worldPT.xyz;
}
