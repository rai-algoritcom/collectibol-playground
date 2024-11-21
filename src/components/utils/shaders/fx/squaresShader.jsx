export default /*glsl*/ `
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uAlphaMask; // Alpha mask texture

    const int iterations = 20;

    void main() {
        vec2 z = vUv - 0.5;
        z.y *= uResolution.y / uResolution.x; // Correct aspect ratio
        
        // Time-based distortions
        z.x += sin(z.y * 2.0 + uTime * 0.2) / 10.0;
        z *= 0.6 + pow(sin(uTime * 0.05), 10.0) * 10.0;
        z += vec2(sin(uTime * 0.08), cos(uTime * 0.01));
        z = abs(vec2(
            z.x * cos(uTime * 0.12) - z.y * sin(uTime * 0.12),
            z.y * cos(uTime * 0.12) + z.x * sin(uTime * 0.12)
        ));
        
        vec2 c = vec2(0.2, 0.188);
        
        float expsmooth = 0.0;
        float average = 0.0;
        float l = length(z);
        float prevl;

        // Iterative effect calculations
        for (int i = 0; i < iterations; i++) {
            z = abs(z * (2.2 + cos(uTime * 0.2))) / (z.x * z.y) - c;
            prevl = l;
            l = length(z);
            expsmooth += exp(-0.2 / abs(l - prevl));
            average += abs(l - prevl);
        }

        float brightness = expsmooth * 0.002;
        average /= float(iterations) * 22.87;

        vec3 myColor = vec3(
            max(abs(sin(uTime)), 0.45),
            max(abs(cos(uTime * 0.2)), 0.45),
            max(abs(sin(uTime * 2.0)), 0.45)
        );
        
        vec3 finalColor;
        finalColor.r = (float(average) / myColor.r);
        finalColor.g = (float(average) / myColor.g);
        finalColor.b = (float(average) / myColor.b);

        // Sample the alpha mask
        float alpha = texture2D(uAlphaMask, vUv).r; // Use red channel as alpha mask

        gl_FragColor = vec4(finalColor * brightness, alpha); // Apply alpha from mask
    }
`;
