
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying mat3 vNormalMatrix;

    uniform sampler2D albedoMap;
    uniform sampler2D alphaMap;
    uniform sampler2D roughnessMap;
    uniform sampler2D normalMap;
    uniform sampler2D iridescenceMask;

    uniform vec3 lightDirection;

    uniform float roughnessIntensity; // Controls the influence of roughness
    uniform float roughnessPresence;  // Adjusts the overall roughness effect
    uniform float normalIntensity;

    // Iridescence parameters
    uniform bool useIridescence; // Toggle for iridescence effect
    uniform float iridescenceIntensity; // Intensity of the iridescence
    uniform vec3 iridescenceColor1; // First gradient color
    uniform vec3 iridescenceColor2; // Second gradient color


    void main() {
        // Sample textures
        vec4 albedoColor = texture2D(albedoMap, vUv);
        float alphaValue = texture2D(alphaMap, vUv).r;
        vec3 normalFromMap = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
        vec3 normal = normalize(-vNormal + normalFromMap);
        float maskValue = texture2D(iridescenceMask, vUv).r; // Iridescence mask

        // Light and view directions
        vec3 lightDir = normalize(lightDirection);
        vec3 viewDir = normalize(cameraPosition - vPosition);

        // Fresnel Effect: Based on angle between viewDir and normal
        float fresnel = pow(1.0 - dot(normal, viewDir), 3.0); // Adjust exponent for sharper falloff

        // Dynamic Iridescence
        if (useIridescence) {
            // Iridescence color blend based on Fresnel
            vec3 iridescenceColor = mix(iridescenceColor1, iridescenceColor2, fresnel);

            // Blend with light direction to make it dynamic
            float lightInfluence = max(dot(normal, lightDir), 0.0); // Dynamic reaction to light
            iridescenceColor *= lightInfluence;

            // Apply mask to limit effect
            iridescenceColor *= maskValue;

            // Add iridescence to base color
            albedoColor.rgb += iridescenceColor * iridescenceIntensity;
        }

        // Final output
        gl_FragColor = vec4(albedoColor.rgb, alphaValue);       
    }

