#define BLADES 110

uniform float uTime;               // Animation time
uniform vec2 uResolution;          // Screen resolution
uniform sampler2D uAlphaMask;        // Alpha mask texture

varying vec2 vUv;                  // UV coordinates passed from vertex shader

vec3 rotateX(float a, vec3 v) {
    return vec3(v.x, cos(a) * v.y + sin(a) * v.z, cos(a) * v.z - sin(a) * v.y);
}

vec3 rotateY(float a, vec3 v) {
    return vec3(cos(a) * v.x + sin(a) * v.z, v.y, cos(a) * v.z - sin(a) * v.x);
}

vec3 rotateZ(float a, vec3 v) {
    return vec3(cos(a) * v.x + sin(a) * v.y, cos(a) * v.y - sin(a) * v.x, v.z);
}

vec4 grass(vec2 p, float x) {
    float s = mix(0.7, 2.0, 0.5 + sin(x * 12.0) * 0.5);
    p.x += pow(1.0 + p.y, 2.0) * 0.1 * cos(x * 0.5 + uTime);
    p.x *= s;
    p.y = (1.0 + p.y) * s - 1.0;
    float m = 1.0 - smoothstep(0.0, clamp(1.0 - p.y * 1.5, 0.01, 0.6) * 0.2 * s, pow(abs(p.x) * 19.0, 1.5) + p.y - 0.6);
    return vec4(mix(vec3(0.05, 0.1, 0.0) * 0.8, vec3(0.0, 0.3, 0.0), (p.y + 1.0) * 0.5 + abs(p.x)), m * smoothstep(-1.0, -0.9, p.y));
}

float dither() {
    return fract(gl_FragCoord.x * 0.482635532 + gl_FragCoord.y * 0.1353412 + uTime * 100.0) * 0.008;
}

void main() {
    vec3 ct = vec3(0.0, 1.0, 5.0);
    vec3 cp = rotateY(cos(uTime * 0.2) * 0.4, vec3(0.0, 0.6, 0.0));
    vec3 cw = normalize(cp - ct);
    vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
    vec3 cv = normalize(cross(cu, cw));

    mat3 rm = mat3(cu, cv, cw);

    vec2 uv = (vUv * 2.0 - vec2(1.0));
    vec2 t = uv;
    t.x *= uResolution.x / uResolution.y;

    vec3 ro = cp;
    vec3 rd = rotateY(sin(uTime * 0.7) * 0.1,
                      rm * rotateZ(sin(uTime * 0.15) * 0.1, vec3(t, -1.3)));

    vec3 fcol = vec3(0.0); // Start with a transparent background color

    for (int i = 0; i < BLADES; i += 1) {
        float z = -(float(BLADES - i) * 0.1 + 1.0);
        vec4 pln = vec4(0.0, 0.0, -1.0, z);
        float t = (pln.w - dot(pln.xyz, ro)) / dot(pln.xyz, rd);
        vec2 tc = ro.xy + rd.xy * t;

        tc.x += cos(float(i) * 3.0) * 4.0;

        float cell = floor(tc.x);

        tc.x = (tc.x - cell) - 0.5;

        vec4 c = grass(tc, float(i) + cell * 10.0);

        fcol = mix(fcol, c.rgb, step(0.0, t) * c.w);
    }

    fcol = pow(fcol * 1.1, vec3(0.8));

    vec2 q = (uv + vec2(1.0)) * 0.5;
    fcol *= 0.2 + 0.8 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.1);

    // Apply alpha mask
    float alphaMask = texture2D(uAlphaMask, vUv).r; // Use red channel of alphaMap
    float alpha = length(fcol) > 0.01 ? alphaMask : 0.0; // Multiply by mask

    gl_FragColor.rgb = fcol * 1.8 + vec3(dither());
    gl_FragColor.a = alpha; // Final alpha with mask applied
}
