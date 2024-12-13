varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;

uniform sampler2D albedoMap;
uniform sampler2D albedoMap2;
uniform sampler2D alphaMap;
uniform sampler2D alphaMap2;
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;
uniform sampler2D fxMask;

// Lighting uniforms
uniform vec3 ambientLightColor;  // Ambient light color
uniform float ambientLightIntensity; // Ambient light intensity
uniform vec3 lightDirection; // Directional light direction
uniform vec3 directionalLightColor; // Directional light color
uniform float directionalLightIntensity; // Directional light intensity
uniform vec3 pointLightPosition; // Point light position
uniform vec3 pointLightColor; // Point light color
uniform float pointLightIntensity; // Point light intensity
uniform float pointLightDecay; // Point light decay factor

// Roughness and normal map controls
uniform float roughnessIntensity; // Controls the influence of roughness
uniform float roughnessPresence;  // Adjusts the overall roughness effect
uniform float normalIntensity;

// Iridescence parameters
uniform bool useShine; // Toggle for iridescence effect
uniform float shineIntensity; // Intensity of the iridescence
uniform vec3 shineColor1; // First gradient color
uniform vec3 shineColor2; // Second gradient color

uniform int blendMode; 
uniform sampler2D uDisp;
uniform float uHoverState; 
uniform bool useTransition;


void main() {
    // Sample textures
    vec4 albedoColor = texture2D(albedoMap, vUv);

    float alphaValue = texture2D(alphaMap, vUv).r;
    float alphaValue2 = texture2D(alphaMap2, vUv).r;
    float blendedAlpha = alphaValue;

    float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;

    // Normalize interpolated normal
    vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
    vec3 normal = normalize(vNormal + normalFromMap);


    if (useTransition) {    
        vec4 albedo1 = texture2D(albedoMap, vUv);
        vec4 albedo2 = texture2D(albedoMap2, vUv);
        vec4 disp = texture2D(uDisp, vUv);
        float pct = clamp((disp.r - uHoverState) * 20.0, 0., 1.);
        albedoColor = mix(albedo1, albedo2, pct);
        blendedAlpha = mix(alphaValue2, alphaValue, pct);
    }


    // View direction
    vec3 viewDir = normalize(cameraPosition - vPosition);

    // === Lighting Calculations ===

    // === Ambient Light ===
    vec3 ambientLight = ambientLightColor * ambientLightIntensity;

    // === Directional Light ===
    vec3 lightDir = normalize(lightDirection);
    vec3 lightReflection = reflect(-lightDir, normal);

    float diffuseDirectional = max(dot(normal, lightDir), 0.0);
    float specularDirectional = pow(max(dot(lightReflection, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    vec3 directionalLight = directionalLightColor * directionalLightIntensity * 
                            (0.6 * diffuseDirectional + 0.4 * specularDirectional); // Blend diffuse & specular

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

    // Combine lighting contributions
    vec3 lighting = ambientLight + directionalLight + pointLight;

    // Soften roughness by blending lighting with a roughness-adjusted diffuse
    vec3 roughnessEffect = mix(lighting, lighting * (1.0 - roughnessValue), roughnessPresence);

    // === Iridescence Effect ===
    if (useShine) {
        float maskValue = texture2D(fxMask, vUv).r; // Iridescence mask

        // Fresnel Effect: Based on angle between viewDir and normal
        float fresnel = pow(1.0 - dot(normal, viewDir), 3.0); // Adjust exponent for sharper falloff

        // Iridescence color blend based on Fresnel
        vec3 iridescenceColor = mix(shineColor1, shineColor2, fresnel);

        // Blend with light direction to make it dynamic
        float lightInfluence = max(dot(normal, lightDir), 0.0); // Dynamic reaction to light
        iridescenceColor *= lightInfluence;

        // Apply mask to limit effect
        iridescenceColor *= maskValue;

        // Add iridescence to base lighting
        roughnessEffect += iridescenceColor * shineIntensity;
    }

    // Final lighting with albedo and soft clamping
    vec3 finalLighting = clamp(roughnessEffect * albedoColor.rgb, 0.0, 1.0);

    // Output with alpha transparency
    if (blendMode == 1) {
        gl_FragColor = vec4(finalLighting, alphaValue2);
        // gl_FragColor = vec4(finalLighting, blendedAlpha);
    } else {
        gl_FragColor = vec4(finalLighting, alphaValue);
    }
}

