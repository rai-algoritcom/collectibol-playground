varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;

uniform sampler2D albedoMap; // First albedo texture
uniform sampler2D albedoMap2; // Second albedo texture
uniform sampler2D alphaMap;
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;

uniform float uHoverState; // Speed of the transition

// Light properties
uniform vec3 ambientLightColor;  // Ambient light color
uniform float ambientLightIntensity; // Ambient light intensity
uniform vec3 lightDirection; // Directional light direction

uniform vec3 pointLightPosition; // Point light position
uniform vec3 pointLightColor; // Point light color
uniform float pointLightIntensity; // Point light intensity
uniform float pointLightDecay; // Point light decay factor

uniform vec3 pointLightPosition2;
uniform vec3 pointLightColor2;
uniform float pointLightIntensity2;
uniform float pointLightDecay2;

// Roughness and normal map controls
uniform float roughnessIntensity; // Controls the influence of roughness
uniform float roughnessPresence;  // Adjusts the overall roughness effect
uniform float normalIntensity;

void main() {
    // Sample albedo textures
    vec4 albedo1 = texture2D(albedoMap, vUv);
    vec4 albedo2 = texture2D(albedoMap2, vUv);

    // Calculate transition factor based on vUv.y and time
    float transitionFactor = clamp( 1.75 * uHoverState - ( vUv.y), 0.0, 1.0);

    // Blend the albedo textures progressively along the Y-axis
    vec4 blendedAlbedo = mix(albedo1, albedo2, transitionFactor);

    // Sample alpha and roughness
    float alphaValue = texture2D(alphaMap, vUv).r;
    float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;

    // Normalize interpolated normal
    vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
    vec3 normal = normalize(vNormal + normalFromMap);

    // View direction
    vec3 viewDir = normalize(cameraPosition - vPosition);

    // === Ambient Light ===
    vec3 ambientLight = ambientLightColor * ambientLightIntensity;

    // === Directional Light ===
    vec3 lightDir = normalize(lightDirection);
    vec3 lightReflection = reflect(-lightDir, normal);

    float diffuseDirectional = max(dot(normal, lightDir), 0.0);
    float specularDirectional = pow(max(dot(lightReflection, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    // vec3 directionalLight = directionalLightColor * directionalLightIntensity * 
    //                         (0.6 * diffuseDirectional + 0.4 * specularDirectional); // Blend diffuse & specular

    // === Point Light ===
    vec3 pointDelta = pointLightPosition - vPosition;
    float pointDistance = length(pointDelta);
    vec3 pointDir = normalize(pointDelta);
    vec3 pointReflection = reflect(-pointDir, normal);

    float diffusePoint = max(dot(normal, pointDir), 0.0);
    float specularPoint = pow(max(dot(pointReflection, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    float pointDecay = max(1.0 / (1.0 + pointDistance * pointDistance * pointLightDecay), 0.0); // Soft decay
    vec3 pointLight = pointLightColor * pointLightIntensity * pointDecay *
                      (0.6 * diffusePoint + 0.4 * specularPoint); // Blend diffuse & specular



    // PL2 
    vec3 pointDelta2 = pointLightPosition2 - vPosition;
    float pointDistance2 = length(pointDelta2);
    vec3 pointDir2 = normalize(pointDelta2);
    vec3 pointReflection2 = reflect(-pointDir2, normal);

    float diffusePoint2 = max(dot(normal, pointDir2), 0.0);
    float specularPoint2 = pow(max(dot(pointReflection2, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    float pointDecay2 = max(1.0 / (1.0 + pointDistance2 * pointDistance2 * pointLightDecay2), 0.0);
    vec3 pointLight2 = pointLightColor2 * pointLightIntensity2 * pointDecay2 * 
                    (0.6 * diffusePoint2 + 0.4 * specularPoint2);                 

    // Combine lighting contributions
    vec3 lighting = ambientLight + pointLight + pointLight2;

    // Soften roughness by blending lighting with a roughness-adjusted diffuse
    vec3 roughnessEffect = mix(lighting, lighting * (1.0 - roughnessValue), roughnessPresence);

    // Final lighting with blended albedo and soft clamping
    vec3 finalLighting = clamp(roughnessEffect * blendedAlbedo.rgb, 0.0, 1.0);

    // Output with alpha transparency
    gl_FragColor = vec4(finalLighting, blendedAlbedo.a * alphaValue);
}
