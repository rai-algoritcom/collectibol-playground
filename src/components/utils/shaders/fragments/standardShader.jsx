export default /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying mat3 vNormalMatrix;

    uniform sampler2D albedoMap;
    uniform sampler2D alphaMap;
    uniform sampler2D roughnessMap;
    uniform sampler2D normalMap;

    uniform vec3 lightDirection;
    uniform vec3 ambientLightColor; // New uniform for ambient light
    uniform float ambientLightIntensity; // Control ambient light intensity

    uniform float roughnessIntensity; // Controls the influence of roughness
    uniform float roughnessPresence;  // Adjusts the overall roughness effect
    uniform float normalIntensity;


    void main() {
        // Sample textures
        vec4 albedoColor = texture2D(albedoMap, vUv);
        float alphaValue = texture2D(alphaMap, vUv).r;
        float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;

        // Normalize interpolated normal
        vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
        vec3 normal = normalize(cameraPosition * .5 * vNormal * normalFromMap);

        // Light and view directions
        vec3 lightDir = normalize(lightDirection);
        vec3 viewDir =  cameraPosition * normalize(vPosition); // Assuming view direction is towards the camera

        // Diffuse lighting
        float diffuse = max(dot(normal, lightDir), 1.0);

        // Specular reflection based on roughness
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), 16.0 * (1.0 - roughnessValue));

        // Combine diffuse and specular lighting
        vec3 lighting = albedoColor.rgb * diffuse + specular * vec3(1.0);

        // Adjust lighting with roughness (rugosity effect)
        lighting = mix(lighting, lighting * (1.0 - roughnessValue), roughnessPresence);

        // Add ambient lighting
        vec3 ambientLight = ambientLightColor * ambientLightIntensity;
        lighting = clamp(lighting + ambientLight, 0.0, 1.0); // Ensure lighting stays within valid range


        // Final output with alpha transparency
        gl_FragColor = vec4(lighting, alphaValue);
    }
`
