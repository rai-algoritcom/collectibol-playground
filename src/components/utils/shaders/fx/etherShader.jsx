export default /* glsl */`
    #define t uTime
    #define PI 3.14159

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;

    // Rotation matrix for 90 degrees
    mat2 rotate(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
    }

    float map(vec3 p) {
        p.xz *= rotate(t * 0.4); // Rotate over time
        p.xy *= rotate(t * 0.3);
        vec3 q = p * 2.0 + t;
        return length(p + vec3(sin(t * 0.7))) * log(length(p) + 1.0)
             + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
    }

    void main() {
        // Apply a 90-degree rotation to UV coordinates
        vec2 p = vUv - 0.5; // Center UVs around (0, 0)
        p = rotate(PI / 2.0) * p; // Rotate by 90 degrees
        p += 0.5; // Shift back to the original range

        vec2 fragCoord = p * uResolution; // Scale UVs to screen resolution
        vec2 uv = fragCoord / uResolution.y - vec2(0.9, 0.5);
        vec3 cl = vec3(0.0);
        float d = 2.5;

        for (int i = 0; i <= 5; i++) {
            vec3 p = vec3(0.0, 0.0, 5.0) + normalize(vec3(uv, -1.0)) * d;
            float rz = map(p);
            float f = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
            vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
            cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.7 * l;
            d += min(rz, 1.0);
        }

        gl_FragColor = vec4(cl, 1.0);
    }
`;
