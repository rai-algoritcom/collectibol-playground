export default /* glsl */ `

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAlphaMask;

varying vec2 vUv;

mat2 m(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    p.xz *= m(uTime * 0.4);
    p.xy *= m(uTime * 0.3);
    vec3 q = p * 2.0 + uTime;
    return length(p + vec3(sin(uTime * 0.7))) * log(length(p) + 1.0) 
           + sin(q.x + sin(q.z + sin(q.y))) * 5.5 - 1.0;
}

void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 p = fragCoord / uResolution.y - vec2(0.9, 0.5);
    vec3 cl = vec3(0.0);
    float d = 0.9;

    for (int i = 0; i <= 5; i++) {
        vec3 pos = vec3(0.0, 0.0, 5.0) + normalize(vec3(p, -1.0)) * d;
        float rz = map(pos);
        float f = clamp((rz - map(pos + 0.1)) * 0.5, -0.1, 1.0);
        vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + (1.0 - smoothstep(0.0, 2.5, rz)) * 0.7 * l;
        d += min(rz, 1.0);
    }

    // Sample the alpha mask texture
    float alpha = texture2D(uAlphaMask, vUv).r;

    // Apply the alpha mask to the output
    gl_FragColor = vec4(cl, alpha);
}
`;
