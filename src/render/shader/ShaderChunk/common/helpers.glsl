
/**
 * wrap a value between 2 edges
 * @param  {float} x - value
 * @param  {float} min - low edge
 * @param  {float} max - high edge
 * @return {float} wrapped value
 */
float wrap(in float x, in float min, in float max)
{
    return x - ((max - min) * (1.0 - step(x, min) - step(x, max)));
}

/**
 * get current fragment in screen space for a given viewport
 * @return {vec2} fragment
 */
vec2 getScreenPoint(vec4 coords, vec4 viewport)
{
    return (coords.xy - viewport.xy) / viewport.zw;
}

/**
 * Get current fragment in clip space
 * @param {vec2} screenPoint - The screen point to convert in clip space
 * @param {vec4} viewport - The viewport rectangle
 * @return {vec2} fragment
 */
vec2 screenToNDC(vec2 screenPoint, vec4 viewport)
{
    float ratio = viewport.z / viewport.w;
    return (2.0 * screenPoint - 1.0) * vec2(ratio, 1.0);
}

/**
 * Inverse a matrix 2x2
 * @param {mat2} matrix
 * @return {mat2} inverted matrix
 */
mat2 inverseMat2(mat2 m)
{
    float det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    return mat2(m[1][1], -m[0][1],
               -m[1][0],  m[0][0]) / det;
}
