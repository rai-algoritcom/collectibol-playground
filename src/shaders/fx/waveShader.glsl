varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAudioTexture; // Replaces iChannel0
uniform sampler2D uAlphaMask; // Alpha mask texture

float squared(float value) {
    return value * value;
}

float getAmp(float frequency) {
    return texture2D(uAudioTexture, vec2(frequency / 512.0, 0)).x;
}

float getWeight(float f) {
    return (
        + getAmp(f - 2.0)
        + getAmp(f - 1.0)
        + getAmp(f + 2.0)
        + getAmp(f + 1.0)
        + getAmp(f)
    ) / 5.0;
}

void main() {
    // Correct UV coordinates for aspect ratio
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y; // Adjust width relative to height

    float lineIntensity;
    float glowWidth;
    vec3 color = vec3(0.0);

    for (float i = 0.0; i < 5.0; i++) {
        uv.y += (0.2 * sin(uv.x + i / 7.0 - uTime * 0.6));
        float Y = uv.y + getWeight(squared(i) * 20.0) *
            (texture2D(uAudioTexture, vec2(vUv.x, 1.0)).x - 0.5);
        lineIntensity = 0.4 + squared(1.6 * abs(mod(vUv.x + i / 1.3 + uTime, 2.0) - 1.0));
        glowWidth = abs(lineIntensity / (150.0 * Y));
        color += vec3(
            glowWidth * (2.0 + sin(uTime * 0.13)),
            glowWidth * (2.0 - sin(uTime * 0.23)),
            glowWidth * (2.0 - cos(uTime * 0.19))
        );
    }

    // Sample alpha mask
    float alpha = texture2D(uAlphaMask, vUv).r; // Use the red channel for alpha

    // Apply full transparency where the mask is black
    if (alpha <= 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Fully transparent
        return;
    }

    // Improved alpha handling for better blending
    float alphaValue = alpha; // Directly use the mask value for transparency

    // Output the final color with the adjusted alpha
    gl_FragColor = vec4(color, alphaValue);
}
