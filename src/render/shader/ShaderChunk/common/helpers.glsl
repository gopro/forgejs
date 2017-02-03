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
