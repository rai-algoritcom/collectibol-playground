varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D alphaMap;
uniform sampler2D rarityMask;
uniform vec3 baseColor; // Input color for the white parts of rarityMask

uniform samplerCube environmentMap; // Cube map for reflections
uniform float reflectivity;         // Control the intensity of reflections

void main() {
    float alphaValue = texture2D(alphaMap, vUv).r;
    vec3 normal = normalize(vNormal);

    // Masking using rarityMask with edge smoothing
    float fxMaskValue = texture2D(rarityMask, vUv).r;
    float smoothMask = smoothstep(0.2, 0.8, fxMaskValue);

    // Background color (assumed from alphaMap)
    vec3 backgroundColor = texture2D(alphaMap, vUv).rgb;

    // Eliminate white margins by reducing baseColor contribution
    vec3 baseColorFinal = mix(backgroundColor, baseColor * fxMaskValue, smoothMask);

    // Discard fragments where the mask is fully transparent
    if (smoothMask <= 0.01) {
        discard;
    }

    // Reflection calculation with smooth mask influence
    vec3 viewDir = normalize(vPosition);       // View direction
    vec3 reflectDir = reflect(viewDir, normal); // Reflection direction
    vec3 reflectionColor = textureCube(environmentMap, reflectDir).rgb * smoothMask;

    // Combine base color and reflection
    vec3 finalColor = mix(baseColorFinal, reflectionColor, reflectivity);
    finalColor = clamp(finalColor, 0.0, 1.0); // Clamp to prevent over-brightening

    // Final output with alpha
    gl_FragColor = vec4(finalColor * 1.95, alphaValue * smoothMask * 0.65);
}

