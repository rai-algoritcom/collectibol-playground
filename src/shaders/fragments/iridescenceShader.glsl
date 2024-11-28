varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D albedoMap;
uniform sampler2D alphaMap;
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;
uniform sampler2D fxMask;
uniform sampler2D iridescenceMask; // New colorful texture

uniform float environmentIntensity; // Intensity of the environment light
uniform vec3 environmentColor;      // Color of the environment light

uniform float roughnessIntensity;   // Controls the influence of roughness
uniform float roughnessPresence;    // Adjusts the overall roughness effect
uniform float normalIntensity;

uniform bool useIridescence;        // Toggle for iridescence effect
uniform float iridescenceIntensity; // Intensity of the iridescence
uniform float uTime;                // Time uniform for rotation
uniform float uRotation;


void main() {
    // Sample base textures
    vec4 albedoColor = texture2D(albedoMap, vUv);
    float alphaValue = texture2D(alphaMap, vUv).r;
    vec3 normalFromMap = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    vec3 normal = normalize(-vNormal + normalFromMap);

    // Rotate the UV coordinates for iridescenceMask
    vec2 center = vec2(0.5, 0.5); // Center of rotation
    vec2 uvRotated = vUv - center; // Translate UVs to origin
    float angle = uRotation; // Rotation angle based on time
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
    uvRotated = rotationMatrix * uvRotated; // Apply rotation
    uvRotated += center; // Translate UVs back

    // Sample mask textures
    float fxMaskValue = texture2D(fxMask, vUv).r; // Effect mask value
    vec4 iridescenceMaskColor = texture2D(iridescenceMask, uvRotated); // Albedo from rotated iridescenceMask

    // View direction
    vec3 viewDir = normalize(cameraPosition - vPosition);

    // Simulate ambient environment lighting
    vec3 ambientLight = environmentColor * environmentIntensity;

    // Angle-dependent transparency for the iridescence effect
    float viewAngle = 0.5 - abs(dot(-normal, viewDir)); // 0.0 when facing, 1.0 when edge-on
    float smoothFactor = smoothstep(0.0, 1.0, viewAngle); // Smooth transition

    // Iridescence effect
    if (useIridescence) {
        // Blend the iridescenceMask color with fxMask
        vec3 iridescenceColor = iridescenceMaskColor.rgb * iridescenceMaskColor.a; // Use alpha to modulate

        // Apply fxMask to control visibility of iridescence effect
        vec3 fxBlendedColor = iridescenceColor * fxMaskValue * smoothFactor;

        // Add the iridescence to the base color
        albedoColor.rgb += fxBlendedColor * iridescenceIntensity;
    }

    // Combine base color with ambient lighting
    vec3 finalColor = albedoColor.rgb * ambientLight;

    // Output final fragment color with adjusted transparency
    gl_FragColor = vec4(finalColor, alphaValue);
}
