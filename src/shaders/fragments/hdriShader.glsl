varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;
varying vec3 vWorldPosition;

uniform sampler2D albedoMap;
uniform sampler2D albedoMap2;
uniform sampler2D alphaMap;
uniform sampler2D alphaMap2;
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;
uniform sampler2D hdriTexture;

uniform vec3 uOrbitCameraPosition;

// Light properties 
uniform vec3 ambientLightColor;
uniform float ambientLightIntensity;
uniform vec3 lightDirection;

uniform vec3 pointLightPosition;
uniform vec3 pointLightColor;
uniform float pointLightIntensity;
uniform float pointLightDecay;

uniform vec3 pointLightPosition2;
uniform vec3 pointLightColor2;
uniform float pointLightIntensity2;
uniform float pointLightDecay2;

// Roughness and normal map controls 
uniform float roughnessIntensity;
uniform float roughnessPresence;
uniform float normalIntensity;

// Transition and blending controls 
uniform int blendMode;
uniform sampler2D uDisp;
uniform float uHoverState;
uniform bool useTransition;


void main() {
    // Sample textures 
    vec4 albedoColor = texture2D(albedoMap, vUv);
    vec4 albedoColor2 = texture2D(albedoMap2, vUv);

    float alphaValue = texture2D(alphaMap, vUv).r;
    float alphaValue2 = texture2D(alphaMap2, vUv).r;
    float blendedAlpha = alphaValue;

    float roughnessValue = texture2D(roughnessMap, vUv).r * roughnessIntensity;
    // Normal mapping 
    vec3 normalFromMap = (texture2D(normalMap, vUv).rgb * 2.0 - 1.0) * normalIntensity;
    vec3 normal = normalize(vNormal + normalFromMap);

    // HDRI texture handling 
    vec3 viewDir = normalize(vWorldPosition - uOrbitCameraPosition);
    vec2 sphericalCoords = vec2(
          0.5 - atan(viewDir.z, viewDir.x) / (2.0 * 3.14159265359),
          0.5 + asin(viewDir.y) / 3.14159265359
    );
    vec4 hdriColor = texture2D(hdriTexture, sphericalCoords);
    float hdriAlpha = hdriColor.a;


    if (useTransition) {
        vec4 albedo1 = mix(hdriColor, albedoColor, albedoColor.a);
        vec4 albedo2 = mix(hdriColor, albedoColor2, albedoColor2.a);

        vec4 disp = texture2D(uDisp, vUv);
        float pct = clamp((disp.r - uHoverState) * 20.0, 0.0, 1.0);
        albedoColor = mix(albedo1, albedo2, pct);
        blendedAlpha = mix(alphaValue2, alphaValue, pct);
    } else {
        albedoColor = mix(hdriColor, albedoColor, albedoColor.a);
    }

    // === Ambient Light ===
    vec3 ambientLight = ambientLightColor * ambientLightIntensity;

    // === Directional Light ===
    vec3 lightDir = normalize(lightDirection);
    vec3 lightReflection = reflect(-lightDir, normal);

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

    vec3 lighting = ambientLight + pointLight + pointLight2;
    vec3 roughnessEffect = mix(lighting, lighting * (1. - roughnessValue), roughnessPresence);
    vec3 finalLighting = clamp(roughnessEffect * albedoColor.rgb, 0.0, 1.0);


    // Final output
    if (blendMode == 1) {
         gl_FragColor = vec4(finalLighting, blendedAlpha * hdriAlpha);
    } else {
        gl_FragColor = vec4(finalLighting, alphaValue * hdriAlpha);
    }
}