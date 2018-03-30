/**
 * wrap a value between 2 edges
 * @param  {float} x - value
 * @param  {float} min - low edge
 * @param  {float} max - high edge
 * @return {float} wrapped value
 */
float wrap(in float x, in float min, in float max) {
    return x - ((max - min) * (1.0 - step(x, min) - step(x, max)));
}

/**
 * get current fragment in screen space
 * @return {vec2} fragment
 */
vec2 getScreenPt() {
    return (gl_FragCoord.xy - tViewport.xy) / tViewport.zw;
}

/**
 * get current fragment in clip space
 * @param {vec2} screen point
 * @return {vec2} fragment
 */
vec2 screenToNDC(vec2 screenPt) {
    return (2.0 * screenPt - 1.0) * vec2(tViewportRatio, 1.0);
}

/**
 * Get smooth UV coordinates to remove some aliasing artefacts
 * @param  {vec2} uv - texture coordinates
 * @param  {vec2} texSize - texture size
 * @return {vec2} smooth coordinates
 */
vec2 smoothTexUV(vec2 uv, vec2 texSize) {
    uv = uv * texSize + 0.5;
    vec2 iuv = floor(uv);
    vec2 fuv = uv - iuv;
    uv = iuv + fuv * fuv * fuv * (fuv * (fuv * 6.0 - 15.0) + 10.0);
    return (uv - 0.5) / texSize;
}

/**
 * Get random float value in [0..1] range
 * @return {float} random value
 */
float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

/**
 * Get random value in [0..1] range for a given 2D coord
 * @return {float} random value
 */
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

/**
 * Inverse a matrix 2x2
 * @param {mat2} matrix
 * @return {mat2} inverted matrix
 */
mat2 inverse(mat2 m) {
    float det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    return mat2(m[1][1], -m[0][1],
               -m[1][0],  m[0][0]) / det;
}
