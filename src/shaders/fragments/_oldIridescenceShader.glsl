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

// Additional textures for iridescence
uniform sampler2D fxMask;
uniform sampler2D iridescenceMask;

uniform vec3 ambientLightColor;  // Ambient light color
uniform float ambientLightIntensity; // Ambient light intensity
uniform vec3 lightDirection; // Directional light direction
uniform vec3 directionalLightColor; // Directional light color
uniform float directionalLightIntensity; // Directional light intensity
uniform vec3 pointLightPosition; // Point light position
uniform vec3 pointLightColor; // Point light color
uniform float pointLightIntensity; // Point light intensity
uniform float pointLightDecay; // Point light decay factor

// Iridescence-related uniforms
uniform bool useIridescence;        // Toggle for iridescence effect
uniform float iridescenceIntensity; // Intensity of the iridescence
uniform float uTime;                // Time uniform for animation
uniform float uRotation;            // Rotation angle for iridescence mask

// Roughness and normal map controls
uniform float roughnessIntensity; // Controls the influence of roughness
uniform float roughnessPresence;  // Adjusts the overall roughness effect
uniform float normalIntensity;

uniform int blendMode;
uniform sampler2D uDisp;
uniform float uHoverState;
uniform bool useTransition;

void main() {
    // Sample base textures
    vec4 albedoColor = texture2D(albedoMap, vUv);
    float alphaValue = texture2D(alphaMap, vUv).r;
    float alphaValue2 = texture2D(alphaMap2, vUv).r;
    float blendedAlpha = alphaValue;

    // float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;

    // vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
    // vec3 normal = normalize(vNormal + normalFromMap);

    if (useTransition) {
        vec4 albedo1 = texture2D(albedoMap, vUv);
        vec4 albedo2 = texture2D(albedoMap2, vUv);
        vec4 disp = texture2D(uDisp, vUv);
        float pct = clamp((disp.r - uHoverState) * 20.0, 0., 1.);
        albedoColor = mix(albedo1, albedo2, pct);
        blendedAlpha = mix(alphaValue2, alphaValue, pct);
    }

    // Lighting calculations (ambient, directional, point lights)
    vec3 viewDir = normalize(cameraPosition - vPosition);
    // vec3 ambientLight = ambientLightColor * ambientLightIntensity;
    vec3 lightDir = normalize(lightDirection);
    // vec3 lightReflection = reflect(-lightDir, normal);

    // float diffuseDirectional = max(dot(normal, lightDir), 0.0);
    // float specularDirectional = pow(max(dot(lightReflection, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    vec3 directionalLight = directionalLightColor * directionalLightIntensity * 
                            (0.6 * 1.0 + 0.4 );

    // vec3 pointDelta = pointLightPosition - vPosition;
    // float pointDistance = length(pointDelta);
    // vec3 pointDir = normalize(pointDelta);
    // vec3 pointReflection = reflect(-pointDir, normal);

    // float diffusePoint = max(dot(normal, pointDir), 0.0);
    // float specularPoint = pow(max(dot(pointReflection, viewDir), 0.0), 16.0 * (1.0 - roughnessValue));
    // float pointDecay = max(1.0 / (1.0 + pointDistance * pointDistance * pointLightDecay), 0.0);
    // vec3 pointLight = pointLightColor * pointLightIntensity * pointDecay * 
    //                   (0.6 * diffusePoint + 0.4 * specularPoint);

    vec3 lighting = directionalLight; // ambientLight + directionalLight + pointLight;

   //  vec3 roughnessEffect = mix(lighting, lighting * (1.0 - roughnessValue), roughnessPresence);

    // Final base lighting
    vec3 finalLighting = albedoColor.rgb; // roughnessEffect * albedoColor.rgb;

    // === Iridescence Effect ===
    if (useIridescence) {
        // Rotate UVs for the iridescence mask
        vec2 center = vec2(0.5, 0.5);
        vec2 uvRotated = vUv - center;
        float angle = uRotation;
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
        uvRotated = rotationMatrix * uvRotated + center;

        // Sample iridescence mask and fxMask
        vec3 iridescenceColor = texture2D(iridescenceMask, uvRotated).rgb;
        float fxMaskValue = texture2D(fxMask, vUv).r;

        // Angle-dependent iridescence intensity
        float viewAngle =abs(dot(vNormal, viewDir));
        float smoothFactor = smoothstep(0.4, 1.0, viewAngle);

        // Apply iridescence effect
        vec3 iridescenceEffect = iridescenceColor * fxMaskValue * smoothFactor * iridescenceIntensity;
        finalLighting += iridescenceEffect;
    }

    // Output final color
    if (blendMode == 1) {
        gl_FragColor = vec4(finalLighting, alphaValue2);
        // gl_FragColor = vec4(finalLighting, blendedAlpha);
    } else {
        gl_FragColor = vec4(finalLighting, alphaValue);
    }
}
