
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uAlphaMask; // Mask texture

    void main() {
        // Correct UV coordinates for aspect ratio
        vec2 uv = (2.0 * vUv - 1.0);
        uv.x *= uResolution.x / uResolution.y; // Adjust width relative to height

        // Loop for the effect
        for (float i = 1.0; i < 10.0; i++) {
            uv.x += 0.6 / i * cos(i * 2.5 * uv.y + uTime);
            uv.y += 0.6 / i * cos(i * 1.5 * uv.x + uTime);
        }

        // Final color calculation
        vec3 color = vec3(0.1) / abs(sin(uTime - uv.y - uv.x));

        // Sample alpha from mask texture
        float alpha = texture2D(uAlphaMask, vUv).r; // Use the red channel for alpha

        // Output color with mask-modulated alpha
        gl_FragColor = vec4(color, alpha * 0.35);
    }

