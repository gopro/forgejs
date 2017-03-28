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
 * get current fragment in clip space
 * @return {vec2} fragment
 */
vec2 getFragment() {
    return (2.0 * gl_FragCoord.xy / tViewportResolution - 1.0) * vec2(tViewportResolutionRatio, 1.0);
}

/**
 * Get smooth UV coordinates to remove some aliasing artefacts
 * @param  {vec2} vec2 uv - texture coordinates
 * @param  {vec2} vec2 texSize - texture size
 * @return {vec2} smooth coordinates
 */
vec2 smoothTexUV(vec2 uv, vec2 texSize) {
    uv = uv * texSize + 0.5;
    vec2 iuv = floor(uv);
    vec2 fuv = uv - iuv;
    uv = iuv + fuv * fuv * fuv * (fuv * (fuv * 6.0 - 15.0) + 10.0);
    return (uv - 0.5) / texSize;
}

