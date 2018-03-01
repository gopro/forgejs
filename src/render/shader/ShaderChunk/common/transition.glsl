/**
 * Get fragment color
 * @param  {vec3} spherePT - sphere point (world space)
 * @param  {vec2} texCoords -  texture coordinates (uv space)
 * @return {vec4} fragment color
 */
vec4 getFragColor(vec3 spherePT, vec2 screenPT, vec2 texCoords) {

    // Fade between 1 and 2
    if (tTransition == 1) {

        vec4 texel1 = texture2D( tTexture, texCoords );
        vec4 texel2 = texture2D( tTransitionTexture, texCoords );
        return mix( texel1, texel2, 1.0 - tMixRatio );

    }

    // Slide H
    else if (tTransition == 2) {

        float edgeMix = smoothstep(tMixRatio - 0.01, tMixRatio + 0.01, screenPT.x);
        vec4 texel1 = texture2D( tTexture, texCoords );
        vec4 texel2 = texture2D( tTransitionTexture, texCoords );
        return mix( texel1, texel2, edgeMix );

    }

    // Slide V
    else if (tTransition == 3) {

        float edgeMix = smoothstep(tMixRatio - 0.01, tMixRatio + 0.01, screenPT.y);
        vec4 texel1 = texture2D( tTexture, texCoords );
        vec4 texel2 = texture2D( tTransitionTexture, texCoords );
        return mix( texel1, texel2, edgeMix );

    }

    // Z axis plane crossing the sphere smoothly
    else if (tTransition == 4) {

        vec4 texel1 = texture2D( tTexture, texCoords );
        vec4 texel2 = texture2D( tTransitionTexture, texCoords );

        float ratioSineInOut =  0.5 * (1.0 + sin(PI_OVER_TWO * (2.0 * tMixRatio - 1.0)));
        float zn = 2.0 * ratioSineInOut - 1.0;

        float edgeMix = 1.0 - smoothstep(zn - 0.2, zn + 0.2, spherePT.z);
        return mix(texel1, texel2, edgeMix);

    }

    // Fibonnaci sphere mapping
    else if (tTransition == 5) {

        float dss = 0.1;
        float lowEdge = 0.4;
        float highEdge = 0.6;
        float fiboMix = smoothstep(lowEdge - dss, lowEdge + dss, tMixRatio) * (1.0 - smoothstep(highEdge - dss, highEdge + dss, tMixRatio));
        float colorMix = smoothstep(lowEdge, highEdge, tMixRatio);

        float nPts = (1.0 - fiboMix) * 8000. + 8000.;

        vec4 dist, idx;
        fibspheren(spherePT, nPts, dist, idx);

        vec2 closePt  = calcpoint(idx.x, nPts);
        vec3 cartesianPT = s2c(closePt);
        float dis = dist.y - dist.x;

        lowEdge += 0.05;
        highEdge -= 0.05;
        float fiboMaskMix = smoothstep(lowEdge - dss, lowEdge + dss / 2., tMixRatio) * (1.0 - smoothstep(highEdge - dss, highEdge + dss, tMixRatio));
        vec4 fiboMask = mix(vec4(1.0), clamp(vec4(vec3(smoothstep( 0.0, 0.001, dis)), 1.0), 0., 1.), fiboMaskMix);

        vec2 fiboTexCoords = getTexCoords(toSpherical(cartesianPT));
        vec4 fiboFg = texture2D(tTexture, fiboTexCoords);
        vec4 fiboBg = texture2D(tTransitionTexture, fiboTexCoords);

        vec4 fg = texture2D(tTexture, texCoords);
        vec4 bg = texture2D(tTransitionTexture, texCoords);

        vec4 color = mix(fg, bg, colorMix);
        vec4 fiboColor = mix(fiboFg, fiboBg, colorMix);

        return fiboMask * mix(color, fiboColor, fiboMix);

    }

    return texture2D( tTexture, texCoords );
}
