
#define pi 3.14159265358979323846
#define tao 6.28318530717958647692

#define overbright 2.0

#define armCount 3.0
#define armRot 1.6

#define innerColor vec4(2.0, 0.5, 0.1, 1.0)
#define outerColor vec4(0.8, 0.6, 1.0, 1.0)
#define white vec4(1.0, 1.0, 1.0, 1.0)

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uAlphaMask;
uniform vec2 uResolution;

// Renamed function to avoid conflicts
float clampValue(float f) {
    return clamp(f, 0.0, 1.0);
}

void main() {
    float time = uTime;
    vec2 uv = vUv;

    // Scale UVs to screen space (-1 to 1)
    vec2 p = uv * 2.0 - 1.0;

    // Constant slow rotation
    float cost = cos(-time * 0.2);
    float sint = sin(-time * 0.2);
    mat2 trm = mat2(cost, sint, -sint, cost);

    // Apply slow rotation
    p = p * trm;

    // Calculate distance from center
    float d = length(p);

    // Build arm rotation matrix
    float cosr = cos(armRot * sin(armRot * time));
    float sinr = sin(armRot * cos(armRot * time));
    mat2 rm = mat2(cosr, sinr, -sinr, cosr);

    // Calculate arm rotation based on distance
    p = mix(p, p * rm, d);

    // Find angle to the middle
    float angle = (atan(p.y, p.x) / tao) * 0.5 + 0.5;

    // Add crinkle effect
    angle += sin(-time * 5.0 + fract(d * d * d) * 10.0) * 0.004;

    // Calculate angle in terms of arm number
    angle *= 2.0 * armCount;
    angle = fract(angle);

    // Build arms & wrap the angle around 0.0 & 1.0
    float arms = abs(angle * 2.0 - 1.0);

    // Sharpen arms
    arms = pow(arms, 10.0 * d * d + 5.0);

    // Calculate radial falloff
    float bulk = 1.0 - clampValue(d);

    // Create glowy center
    float core = pow(bulk, 9.0);

    // Calculate color
    vec4 color = mix(innerColor, outerColor, d * 2.0);

    // Final output color
    vec4 finalColor = bulk * arms * color + core + bulk * 0.25 * mix(color, white, 0.5);

    // Apply brightness scaling
    finalColor *= overbright;

    // Sample alpha mask for transparency
    float alpha = texture2D(uAlphaMask, vUv).r; // Use red channel for alpha

    // Apply full transparency where the mask is black
    if (alpha <= 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Fully transparent
        return;
    }

    // Improved alpha handling for better blending
    float alphaValue = alpha; // Directly use the mask value for transparency

    // Set final fragment color
    gl_FragColor = vec4(finalColor.rgb, alphaValue);
}
