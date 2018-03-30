/**
 * Fragment shader reverse projection - screen to world
 * GoPro view projection
 *
 * Anti-aliasing experiments
 *
 * Online bibliography is abondant but 2 good inputs to understand the algorithms
 * https://blog.demofox.org/2015/04/23/4-rook-antialiasing-rgss/
 * https://blog.demofox.org/2015/04/22/quincunx-antialiasing/
 *
 * All renderings are done. Then the screen is split in 4 quarters to show each processing
 * No antialias in 2 quarters, RGSS and quincunx.
 *
 * BackgroundShaderRenderer should also be considered to understand how the job is done
 * for the quincunx case (2 render passes with offset)
 */

#include <defines>

uniform int tAAPass;
uniform vec2 tAAOffset;
uniform sampler2D tAATexture;

uniform int tMediaFormat;
uniform int tMediaFormatTransition;

uniform int tTransition;
uniform float tMixRatio;
uniform sampler2D tTextureTransition;

uniform sampler2D tTexture;
uniform vec2 tTextureResolution;

uniform vec4 tViewport;
uniform float tViewportRatio;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionDistance;
uniform float tProjectionScale;


#include <helpers>
#include <coordinates>
#include <texcoords>
#include <fibonacci>
#include <transition>

/**
 * GoPro view screen to world inverse projection
 * @param  {vec2} screenPT - screen pt
 * @return {vec3} world ptx
 */
vec3 projectionInverse(vec2 screenPT) {
    // Screen point is on the zn plane, expressed it in clip space [-1 .. 1 , -1 .. 1]
    vec4 clipPT = vec4(tProjectionScale * screenToNDC(screenPT), -1.0, 1.0);

    float zs = tProjectionDistance;
    float zs12 = (zs + 1.0) * (zs + 1.0);

    float xy2 = dot(clipPT.xy, clipPT.xy);
    float delta = 4.0 * (zs * zs * xy2 * xy2 - (xy2 + zs12) * (xy2 * zs * zs - zs12));
    if (delta < 0.0) {
        return vec3(-1.);
    }

    float z = (2.0 * zs * xy2 - sqrt(delta)) / (2.0 * (zs12 + xy2));
    float x = clipPT.x * ((zs - z) / (zs + 1.0));
    float y = clipPT.y * ((zs - z) / (zs + 1.0));

    vec4 worldPT = tModelViewMatrixInverse * vec4(x, y, z, 1.0);

    // Spherical point for texture lookup
    return worldPT.xyz;
}

// "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/MKZD_Bratcevo_2015-10_Equirectangular.jpg/1600px-MKZD_Bratcevo_2015-10_Equirectangular.jpg"
// "url": "rubikscube.jpg"

vec4 draw_MSAA_RGSS() {
    vec2 dt = 1. / tViewport.zw;
    vec2 screenPT = ((gl_FragCoord.xy - tViewport.xy)) * dt;

    // 4-Rook Antialiasing (RGSS) : 4 points subsampling
    // https://blog.demofox.org/2015/04/23/4-rook-antialiasing-rgss/
    // 1/8 = 0.125 | 3/8 = 0.375 | 5/8 = 0.625 | 7/8 = 0.875
    vec2 sa, sb, sc, sd;
    sa = (gl_FragCoord.xy + vec2(.625, .125) - tViewport.xy) * dt;
    sb = (gl_FragCoord.xy + vec2(.875, .625) - tViewport.xy) * dt;
    sc = (gl_FragCoord.xy + vec2(.375, .875) - tViewport.xy) * dt;
    sd = (gl_FragCoord.xy + vec2(.125, .375) - tViewport.xy) * dt;

    vec3 sphereA = projectionInverse(sa);
    vec3 sphereB = projectionInverse(sb);
    vec3 sphereC = projectionInverse(sc);
    vec3 sphereD = projectionInverse(sd);

    vec2 uvA = getTexCoords(sphereA, tMediaFormat);
    vec2 uvB = getTexCoords(sphereB, tMediaFormat);
    vec2 uvC = getTexCoords(sphereC, tMediaFormat);
    vec2 uvD = getTexCoords(sphereD, tMediaFormat);

    vec4 colA = getFragColor(sphereA, screenPT, uvA, uvA);
    vec4 colB = getFragColor(sphereB, screenPT, uvB, uvB);
    vec4 colC = getFragColor(sphereC, screenPT, uvC, uvC);
    vec4 colD = getFragColor(sphereD, screenPT, uvD, uvD);

    vec4 colAvg = .25 * (colA + colB + colC + colD);

    // Find destination texture pixels projected
    // Compute area in texture space covered by the projected quadrilateral
    // Amplify with an arbitrary factor to extend the antialias area
    vec3 rx = vec3(uvA - uvD, 0.);
    vec3 ry = vec3(uvC - uvD, 0.);
    float area = length(cross(rx, ry));
    float outPixels = clamp(tTextureResolution.x * tTextureResolution.y * area * 10., 0., 1.);

    // gl_FragColor = ratioToColor(outPixels); return;

    // Debug: display compression mask with blue pixels
    vec3 blendMask = vec3(1., 1., 1. + outPixels);
    // gl_FragColor = colAvg * vec4(blendMask, 1.); return;

    // Final color: blend of sample A with average color
    vec3 color = mix(colA.rgb, colAvg.rgb, outPixels);

    // gl_FragColor = vec4(color * blendMask, 1.);
    return vec4(color, 1.);
}

vec4 draw() {
    vec2 screenPT = (gl_FragCoord.xy - tViewport.xy) / tViewport.zw;
    vec3 spherePT = projectionInverse(screenPT);
    vec2 uv = getTexCoords(spherePT, tMediaFormat);
    return getFragColor(spherePT, screenPT, uv, uv);
}

vec4 draw_MSAA_QCX_pass1() {
    vec2 screenPT = (tAAOffset + gl_FragCoord.xy - tViewport.xy) / tViewport.zw;
    vec3 spherePT = projectionInverse(screenPT);
    vec2 uv = getTexCoords(spherePT, tMediaFormat);
    return getFragColor(spherePT, screenPT, uv, uv);
}

vec4 draw_MSAA_QCX_pass2() {
    vec2 screenPT = ((gl_FragCoord.xy - tViewport.xy)) / tViewport.zw;
    vec3 spherePT = projectionInverse(screenPT);
    vec2 uv = getTexCoords(spherePT, tMediaFormat);
    vec4 color = getFragColor(spherePT, screenPT, uv, uv);

    vec4 colA = texture2D(tAATexture, (gl_FragCoord.xy + vec2(-1., -1.) - tViewport.xy) / tViewport.zw);
    vec4 colB = texture2D(tAATexture, (gl_FragCoord.xy + vec2(-1.,  0.) - tViewport.xy) / tViewport.zw);
    vec4 colC = texture2D(tAATexture, (gl_FragCoord.xy + vec2( 0., -1.) - tViewport.xy) / tViewport.zw);
    vec4 colD = texture2D(tAATexture, (gl_FragCoord.xy + vec2( 0.,  0.) - tViewport.xy) / tViewport.zw);

    return .5 * color + .125 * (colA + colB + colC + colD);
}

void main() {
    if (tAAPass == 1) {
        gl_FragColor = draw_MSAA_QCX_pass1();
    }
    else {
        vec4 noaa = draw();
        vec4 quincunx = draw_MSAA_QCX_pass2();
        vec4 rgss = draw_MSAA_RGSS();

        vec2 screenPT = ((gl_FragCoord.xy - tViewport.xy)) / tViewport.zw;

        float east = step(.5, screenPT.x);
        float west = 1. - east;

        float north = step(.5, screenPT.y);
        float south = 1. - north;

        float nw = north * west;
        float ne = north * east;
        float sw = south * west;
        float se = south * east;

        float dx = 0.001;
        float vband = step(.5 + dx, screenPT.x) + 1. - step(.5 - dx, screenPT.x);
        float hband = step(.5 + dx, screenPT.y) + 1. - step(.5 - dx, screenPT.y);

        gl_FragColor = vec4(vec3((nw + se) * noaa + sw * quincunx + ne * rgss) * hband * vband, 1.);
    }
}
