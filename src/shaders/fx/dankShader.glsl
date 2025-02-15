varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uAlphaMask; // Alpha mask texture

// 2D Random function
float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Noise function
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Vector field manipulation
vec2 vectorField(vec2 uv) {
    vec2 res = uv;
    float n = noise(res * vec2(3.0));
    
    // Improved distortion effect
    res.y -= uTime * 0.02;
    res += sin(res.yx * 30.0) * 0.03; // More intensity
    res += vec2(n * 0.1); // Adjusted noise impact
    return res;
}

// Plot function for grid lines
float plot(float val, float c, float t) {
    float l = smoothstep(c, c - t, val);
    float r = smoothstep(c, c - t / 5.0, val);
    return r - l;
}

void main() {
    vec2 st = vUv;
    st.y *= uResolution.y / uResolution.x; // Correct aspect ratio
    st = vectorField(st);

    // Read the alpha mask
    float maskValue = texture2D(uAlphaMask, vUv).r; // Read red channel

    // Apply full transparency on fully black parts
    if (maskValue <= 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Full transparency
        return;
    }

    // Grid density control
    float cell = 0.15; 
    vec2 modSt = mod(st, vec2(cell));

    // Define grid sharpness
    float x = plot(modSt.x, cell, 0.06);
    float y = plot(modSt.y, cell, 0.4);

    // Improved color blending for contrast
    vec3 bgCol = vec3(0.02, 0.02, 0.02); // Slight ambient glow
    vec3 col = vec3(0.85, 0.85, 0.85) * x; // Sharper white grid
    col += vec3(0.94, 0.72, 0.12) * y; // Stronger gold/yellow grid
    col += bgCol * vec3(smoothstep(1.5, 0.02, x + y)); 

    // Improved transparency blending
    float alphaValue = maskValue; // Directly use maskValue for transparency control

    gl_FragColor = vec4(col, alphaValue * .85);
}
