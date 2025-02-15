#define pi 3.1415926535898

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAlphaMask; // Alpha mask texture

vec3 firePalette(float i) {
    float T = 1400. + 1300. * i; // Temperature range (in Kelvin).
    vec3 L = vec3(7.4, 5.6, 4.4); // Red, green, blue wavelengths.
    L = pow(L, vec3(5)) * (exp(1.43876719683e5 / (T * L)) - 1.);
    return 1. - exp(-5e8 / L);
}

vec3 hash33(vec3 p) {
    float n = sin(dot(p, vec3(7, 157, 113)));    
    return fract(vec3(2097152, 262144, 32768) * n); 
}

float voronoi(vec3 p) {
    vec3 b, r, g = floor(p);
    p = fract(p);
    float d = 1.;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            b = vec3(i, j, -1);
            r = b - p + hash33(g + b);
            d = min(d, dot(r, r));
            b.z = 0.0;
            r = b - p + hash33(g + b);
            d = min(d, dot(r, r));
            b.z = 1.;
            r = b - p + hash33(g + b);
            d = min(d, dot(r, r));
        }
    }
    return d; // Range: [0, 1]
}

float noiseLayers(vec3 p) {
    vec3 t = vec3(0., 0., p.z + uTime * 1.5);
    const int iter = 5;
    float tot = 0., sum = 0., amp = 1.;
    for (int i = 0; i < iter; i++) {
        tot += voronoi(p + t) * amp;
        p *= 2.;
        t *= 1.5;
        sum += amp;
        amp *= 0.5;
    }
    return tot / sum;
}

mat2 rotate(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv - 0.5; // Center UVs
    uv += 0.5; // Shift back

    vec2 fragCoord = uv * uResolution;

    // Screen coordinates
    vec2 p = (fragCoord - uResolution * 0.5) / uResolution.y;

    // Adjust for moving camera
    p += vec2(sin(uTime * 0.5) * 0.25, cos(uTime * 0.5) * 0.125);

    vec3 rd = normalize(vec3(p, 3.1415926535898 / 8.));
    float cs = cos(uTime * 0.25), si = sin(uTime * 0.25);
    rd.xy = rd.xy * mat2(cs, -si, si, cs);

    float c = noiseLayers(rd * 2.0);
    c = max(c + dot(hash33(rd) * 2. - 1., vec3(0.015)), 0.);

    vec3 col = firePalette(c);
    col = mix(col, col.zyx * 0.15 + c * 0.85, min(pow(dot(rd.xy, rd.xy) * 1.2, 1.5), 1.));
    col = pow(col, vec3(1.25));

    // Sample alpha mask
    float alpha = texture2D(uAlphaMask, uv).r; // Use red channel of alpha mask

    // Apply full transparency where the mask is black
    if (alpha <= 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Fully transparent
        return;
    }

    // Improved alpha handling for better blending
    float alphaValue = alpha; // Directly use the mask value for transparency

    // Output final color with adjusted alpha
    gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), alphaValue);
}
