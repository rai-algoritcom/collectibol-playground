export default /* glsl */ `
varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;

    void main() {
        // Convert UV coordinates to match screen space
        vec2 uv = (vUv - 0.5) * 2.0;
        uv.x *= uResolution.x / uResolution.y; // Adjust for aspect ratio

        vec2 uv2 = uv;
        uv2.x += uResolution.x / uResolution.y; // Horizontal shift
        uv2.x -= 2.0 * mod(uTime, 1.0 * uResolution.x / uResolution.y);

        // Width calculation
        float width = -(1.0 / (25.0 * uv2.x));
        vec3 l = vec3(width, width * 1.9, width * 1.5);

        // Vertical stretching
        uv.y *= 2.0;
        float xx = abs(1.0 / (20.0 * max(abs(uv.x), 0.3)));

        // Curve distortion
        uv.x *= 3.0;
        uv.y -= xx * (
            sin(uv.x) + 
            3.0 * sin(2.0 * uv.x) + 
            2.0 * sin(3.0 * uv.x) + 
            sin(4.0 * uv.x)
        );

        // Color gradient
        vec3 col = mix(vec3(1.0), vec3(0.0), smoothstep(0.02, 0.03, abs(uv.y)));

        // Final color with modulation
        gl_FragColor = vec4(col * l, 1.0);
    }
`;
