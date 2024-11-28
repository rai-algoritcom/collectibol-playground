    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying mat3 vNormalMatrix;

    uniform sampler2D albedoMap;
    uniform sampler2D alphaMap;
    uniform sampler2D roughnessMap;
    uniform sampler2D normalMap;
    uniform sampler2D fxMask;

    uniform float environmentIntensity; // Intensity of the environment light
    uniform vec3 environmentColor;      // Color of the environment light

    uniform float roughnessIntensity;   // Controls the influence of roughness
    uniform float roughnessPresence;    // Adjusts the overall roughness effect
    uniform float normalIntensity;

    // Iridescence parameters
    uniform bool useBrightness;       // Toggle for iridescence effect
    uniform float brightnessIntensity; // Intensity of the iridescence
    uniform vec3 brightnessColor1;    // First gradient color
    uniform vec3 brightnessColor2;    // Second gradient color

    void main() {
        // Sample textures
        vec4 albedoColor = texture2D(albedoMap, vUv);
        float alphaValue = texture2D(alphaMap, vUv).r;
        vec3 normalFromMap = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
        vec3 normal = normalize(-vNormal + normalFromMap);
        float maskValue = texture2D(fxMask, vUv).r; // Iridescence mask

        // View direction
        vec3 viewDir = normalize(cameraPosition - vPosition);

        // Simulate ambient environment lighting
        vec3 ambientLight = environmentColor * environmentIntensity;

        // Iridescence
        if (useBrightness) {
            // Fresnel Effect: Based on angle between viewDir and normal
            float fresnel = pow(1.0 - dot(normal, viewDir), 3.0); // Sharpened Fresnel falloff

            // Iridescence color blend based on Fresnel
            vec3 iridescenceColor = mix(brightnessColor1, brightnessColor2, fresnel);

            // Apply mask to limit effect
            iridescenceColor *= maskValue;

            // Add iridescence to base color
            albedoColor.rgb += iridescenceColor * brightnessIntensity;
        }

        // Combine base color with ambient lighting
        vec3 finalColor = albedoColor.rgb * ambientLight;

        // Output final fragment color with transparency
        gl_FragColor = vec4(finalColor, alphaValue);
    }