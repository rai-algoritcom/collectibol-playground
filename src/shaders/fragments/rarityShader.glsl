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

    // Masking using rarityMask
    float fxMaskValue = texture2D(rarityMask, vUv).r;

    // Apply baseColor to the white parts of the rarityMask
    vec3 baseColorFinal = mix(vec3(0.0), baseColor, fxMaskValue);

    // Make black areas in rarityMask fully transparent
    if (fxMaskValue < 0.01) {
        discard;
    }

    // Reflection calculation
    vec3 viewDir = normalize(vPosition);       // View direction
    vec3 reflectDir = reflect(viewDir, normal); // Reflection direction
    vec3 reflectionColor = textureCube(environmentMap, reflectDir).rgb;

    // Combine base color and reflection
    vec3 finalColor = mix(baseColorFinal * 2., reflectionColor, reflectivity);

    // Final output with alpha
    gl_FragColor = vec4(finalColor, alphaValue);
}
