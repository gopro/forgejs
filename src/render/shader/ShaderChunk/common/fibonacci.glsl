#define PHI 1.61803398875
#define PHI_MINUS_ONE 0.61803398875
#define LOG_PHI_PLUS_ONE 0.96242365011
#define TWO_PI_ON_PHI 3.88322207745
#define ROOT_5 2.2360679775


// k'th fibonacci number
float calcfk(float k)
{
    return floor(0.5 + (pow(PHI, k) / ROOT_5));
}

// calculates a basis vector for fibonacci sphere n
vec2 calcbk(float fk, float n)
{
    return vec2(TWO_PI * fract((fk + 1.0) * PHI_MINUS_ONE) - TWO_PI_ON_PHI, -2.0 * fk / n);
}

// calc point i of n in spherical coordinates
vec2 calcpoint(float i, float n)
{
    return vec2(TWO_PI * fract(i * PHI_MINUS_ONE), 1.0 - (2.0 * i + 1.0) / n);
}

// converts [phi,cos theta] into [x,y,z] for unit sphere
vec3 s2c(vec2 s)
{
    float sinTheta = sqrt(1.0 - s.y * s.y);

    // POLES on the horizon
    // return vec3(cos(s.x) * sinTheta,
    //             sin(s.x) * sinTheta,
    //             s.y);

    // POLES on top/down
    return vec3(cos(s.x) * sinTheta,
                s.y,
                sin(s.x) * sinTheta);
}

// converts [x,y,z] into [phi, cos theta] for unit sphere
vec2 c2s(vec3 c)
{
    // POLES on the horizon
    // return vec2(atan(c.y, c.x), c.z);

    // POLES on top/down
    return vec2(atan(c.z, c.x), c.y);
}

// angle between two points in spherical coords
float angdist(vec2 sp1, vec2 sp2)
{
    float sinTheta1 = sqrt(1.0 - sp1.y * sp1.y);
    float sinTheta2 = sqrt(1.0 - sp2.y * sp2.y);
    return acos(sp1.y * sp2.y + sinTheta1 * sinTheta2 * cos(sp2.x - sp1.x));
}

// distance to nearest cell on a fibonacci sphere
void fibspheren(vec3 p, float n, 
                out vec4 minDist,
                out vec4 minIdx)
{    
    // get spherical coords for point p on surface of unit sphere
    vec2 sp = c2s(p);

    // calc the dominant zone number
    float k = max(2.0, floor(log(ROOT_5 * n * PI * (1.0 - sp.y * sp.y)) / LOG_PHI_PLUS_ONE));   
    
    // calc basis vectors for this zone
    // [could all be precalculated and looked up for k,n]
    vec2 f = vec2(calcfk(k), calcfk(k + 1.0));


    vec2 bk = calcbk(f[0], n);
    vec2 bk1 = calcbk(f[1], n);

    mat2 b = mat2(bk, bk1);
    mat2 invb = inverse(b);
    
    // change of basis for point sp to local grid uv
    float z0 = 1.0 - 1.0 / n;
    vec2 c = floor(invb * (sp - vec2(0.0, z0)));

    // minDist.x = idx;
    // return;
    
    // for k<=4 paper suggests using (-1,0,+1)^2 offset factors but we'll
    // stick with (0,1)^2 and live with the occasional glitches
    minDist = vec4(PI);
    for (int s = 0; s < 4; s++) {
        // figure out the point index and generate fib point
        vec2 o = vec2(s - (s/2) * 2, s / 2);
        float idx = floor(dot(f, c + o));

        //float idx = floor(n*0.5 - o.y*n*0.5);
        if (idx > n) continue;        
        vec2 isp = calcpoint(idx, n);

        // closest?
        float dist = angdist(isp, sp);

        if (dist <= minDist.x) {
            minDist.yzw = minDist.xyz;
            minDist.x = dist;
            minIdx.yzw = minIdx.xyz;
            minIdx.x = idx;
        }
        else if (dist <= minDist.y) {
            minDist.zw = minDist.yz;
            minDist.y = dist;
            minIdx.zw= minIdx.yz;
            minIdx.y = idx;
        }
        else if (dist <= minDist.z) {
            minDist.w = minDist.z;
            minDist.z = dist;
            minIdx.w= minIdx.z;
            minIdx.z = idx;
        }
        else {
            minDist.w = dist;
            minIdx.w = idx;
        }
    }
}
