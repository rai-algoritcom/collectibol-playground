export default /* glsl */ `
    #define pi 3.14159

    varying vec2 vUv;

    uniform float uTime;         // Time uniform
    uniform vec2 uResolution;   // Screen resolution
    uniform sampler2D uAlphaMask; // Alpha mask texture

    const float dotsnb = 30.0; // Number of dots

    // Convert HSV to RGB color
    vec3 hsv2rgb(vec3 hsv) {
        hsv.yz = clamp(hsv.yz, 0.0, 1.0);
        return hsv.z * (1.0 + 0.63 * hsv.y * (cos(2.0 * pi * (hsv.x + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0))) - 1.0));
    }

    void main() {
        float mx = max(uResolution.x, uResolution.y);
        vec2 scrs = uResolution.xy / mx; // Screen scaling factor
        vec2 uv = vUv; // Normalized UV coordinates
        
        vec2 pos = vec2(0.0); // Position of the dots
        vec3 col = vec3(0.0); // Accumulated color of the dots
        float radius = 0.35;  // Radius of the circle
        float intensity = 1.0 / 500.0; // Light intensity
        
        for (float i = 0.0; i < dotsnb; i++) {
            // Compute the dot positions
            pos = vec2(
                radius * cos(2.0 * pi * i / dotsnb + uTime),
                radius * sin(2.0 * pi * i / dotsnb + uTime * 2.0 / 3.0)
            );
            
            // Accumulate color using HSV to RGB
            col += hsv2rgb(vec3(
                i / dotsnb, 
                distance(uv, scrs / 2.0 + pos) * (1.0 / intensity), 
                intensity / distance(uv, scrs / 2.0 + pos)
            ));
        }
        
        // Sample the alpha mask
        float alpha = texture2D(uAlphaMask, uv).r; // Use red channel as alpha mask

        gl_FragColor = vec4(col, alpha); // Apply alpha from mask
    }
`;
