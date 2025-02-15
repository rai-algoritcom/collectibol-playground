
#define PI 3.14159
#define t uTime

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAlphaMask; // Alpha mask texture

// Rotation matrix for 90 degrees
mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec3 c;
    float l, z = t;

    // Apply a 90-degree rotation to UV coordinates
    vec2 uv = vUv - 0.5; // Center UVs around (0, 0)
    uv = rotate(PI / 2.0) * uv; // Rotate by 90 degrees
    uv += 0.5; // Shift back to the original range

    for (int i = 0; i < 3; i++) {
        vec2 p = uv;
        p -= 0.5;
        z += 0.07;
        l = length(p);
        p += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));
        c[i] = 0.01 / length(mod(p, 1.0) - 0.5);
    }

    // Sample alpha mask
    float alpha = texture2D(uAlphaMask, uv).r; // Use red channel as alpha mask

    // Apply full transparency where the mask is black
    if (alpha <= 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Fully transparent
        return;
    }

    // Improved alpha handling for better blending
    float alphaValue = alpha; // Directly use the mask value for transparency

    // Output final color with adjusted alpha
    gl_FragColor = vec4(c / l, alphaValue);
}
