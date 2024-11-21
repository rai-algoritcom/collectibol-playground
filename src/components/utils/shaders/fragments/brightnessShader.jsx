export default /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform sampler2D albedoMap;
    uniform sampler2D alphaMap;
    uniform sampler2D roughnessMap;
    uniform sampler2D normalMap;
    uniform sampler2D iridescenceMask;

    uniform vec3 lightDirection;
    uniform vec3 ambientLightColor;
    uniform float ambientLightIntensity;

    uniform float roughnessIntensity;
    uniform float roughnessPresence;
    uniform float normalIntensity;

    uniform bool useBrightness;
    uniform float brightnessIntensity;
    uniform vec3 brightnessColor1;
    uniform vec3 brightnessColor2;

    void main() {
        // Sample base textures
        vec4 albedoColor = texture2D(albedoMap, vUv);
        float alphaValue = texture2D(alphaMap, vUv).r;
        float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;

        // Rugosity: Calculate normal from normal map and adjust for paper-like effect
        vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
        vec3 normal = normalize(vNormal + normalFromMap);

        // Lighting: Diffuse and specular
        vec3 lightDir = normalize(lightDirection);
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float diffuse = max(dot(normal, lightDir), 0.0);

        vec3 halfwayDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), 16.0 * (1.0 - roughnessValue));

        vec3 lighting = albedoColor.rgb * diffuse + specular * vec3(1.0);
        lighting = mix(lighting, lighting * (1.0 - roughnessValue), roughnessPresence);

        // Ambient lighting
        vec3 ambientLight = ambientLightColor * ambientLightIntensity;
        lighting += ambientLight;

        // Improved Iridescence Effect
        if (useBrightness) {
            // Fresnel Effect
            float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);

            // Dynamic Iridescence Color Blend
            vec3 iridescenceColor = mix(brightnessColor1, brightnessColor2, fresnel);

            // Light Influence on Iridescence
            float lightInfluence = max(dot(normal, lightDir), 0.0);
            iridescenceColor *= lightInfluence;

            // Apply Iridescence Mask
            float maskValue = texture2D(iridescenceMask, vUv).r;
            iridescenceColor *= maskValue;

            // Blend Iridescence with Lighting
            lighting = mix(lighting, lighting + iridescenceColor, brightnessIntensity);
        }

        // Final color output
        gl_FragColor = vec4(lighting, alphaValue);
    }

`