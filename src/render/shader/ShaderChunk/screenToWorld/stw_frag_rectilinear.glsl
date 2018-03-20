
/**
 * Rectilinear view screen to world inverse projection
 * @param  {vec2} screenPT - Screen point
 * @param  {vec4} viewport - The viewport rectangle
 * @param  {mat4} matrixInverse - The model view matrix inverse
 * @param  {float} scale - The projection scale
 * @return {vec3} Returns a world point
 */
vec3 screenToWorld(vec2 screenPT, vec4 viewport, mat4 matrixInverse, float scale)
{
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(scale * screenToNDC(screenPT, viewport), -1.0, 1.0);

    // World space point
    vec4 worldPT = matrixInverse * clipPT;

    // Spherical point for texture lookup
    return worldPT.xyz;
}
