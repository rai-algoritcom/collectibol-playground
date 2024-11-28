varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform sampler2D albedoMap;
    uniform sampler2D alphaMap;
    uniform sampler2D roughnessMap;
    uniform sampler2D normalMap;
    uniform sampler2D iridescenceMask;

    uniform float environmentIntensity; // Intensity of the environment light
    uniform vec3 environmentColor;      // Color of the environment light

    uniform float roughnessIntensity;   // Controls the influence of roughness
    uniform float roughnessPresence;    // Adjusts the overall roughness effect
    uniform float normalIntensity;

    // Iridescence parameters
    uniform bool useIridescence;        // Toggle for iridescence effect
    uniform float iridescenceIntensity; // Intensity of the iridescence
    uniform vec3 iridescenceColor1;     // First gradient color
    uniform vec3 iridescenceColor2;     // Second gradient color

    void main() {
        // Sample textures
        vec4 albedoColor = texture2D(albedoMap, vUv);
        float alphaValue = texture2D(alphaMap, vUv).r;
        vec3 normalFromMap = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
        vec3 normal = normalize(-vNormal + normalFromMap);
        float maskValue = texture2D(iridescenceMask, vUv).r; // Iridescence mask

        // View direction
        vec3 viewDir = normalize(cameraPosition - vPosition);

        // Simulate ambient environment lighting
        vec3 ambientLight = environmentColor * environmentIntensity;

        // Angle-dependent transparency for the iridescence mask
        float viewAngle = .5 - abs(dot(-normal, viewDir)); // 0.0 when facing, 1.0 when edge-on
        float smoothFactor = smoothstep(0.0, 1.0, viewAngle); // Smooth transition

        // Iridescence
        if (useIridescence) {
            // Fresnel Effect: Based on angle between viewDir and normal
            float fresnel = pow(1.0 - dot(-normal, viewDir), 3.0); // Sharpened Fresnel falloff

            // Iridescence color blend based on Fresnel
            vec3 iridescenceColor = mix(iridescenceColor1, iridescenceColor2, fresnel);

            // Apply mask to limit effect and fade based on view angle
            iridescenceColor *= maskValue * smoothFactor;

            // Add iridescence to base color
            albedoColor.rgb += iridescenceColor * iridescenceIntensity;
        }

        // Combine base color with ambient lighting
        vec3 finalColor = albedoColor.rgb * ambientLight;

        // Output final fragment color with adjusted transparency
        gl_FragColor = vec4(finalColor, alphaValue);
    
    }