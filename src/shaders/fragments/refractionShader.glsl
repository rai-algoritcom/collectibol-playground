varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D albedoMap;       // Base texture
uniform sampler2D albedoMap2;
uniform sampler2D gradientMap;     // Gradient/iridescent texture
uniform sampler2D alphaMap;        // Alpha map
uniform sampler2D alphaMap2;
uniform sampler2D roughnessMap;    // Roughness map
uniform sampler2D normalMap;       // Normal map
uniform sampler2D fxMask; // Iridescence mask

uniform float uTime;               // Animation time
uniform float roughnessIntensity;  // Controls roughness intensity
uniform float normalIntensity;     // Controls normal intensity
uniform float refractionIntensity; // Refraction effect intensity
uniform bool useBrightness;       // Toggle for iridescence effect
uniform float brightnessIntensity;// Intensity of the iridescence
uniform vec3 brightnessColor1;    // First gradient color
uniform vec3 brightnessColor2;    // Second gradient color
uniform vec3 lightDirection;       // Direction of the light
uniform bool stripesVisible;

uniform int blendMode; 
uniform sampler2D uDisp;
uniform float uHoverState;
uniform bool useTransition;



void main() {
    vec2 uv = vUv;

    // === Refraction & Iridescence Base ===
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float angle = dot(normalize(vNormal), viewDir); // Angle between normal and view direction
    float rotationIntensity = clamp(1.0 - abs(angle), 0.0, 1.0); // Adjust falloff based on angle

    // Sample textures
    vec4 baseColor = texture2D(albedoMap, uv);
    vec4 gradColor = texture2D(gradientMap, uv);

    float alphaValue = texture2D(alphaMap, uv).r;
    float alphaValue2 = texture2D(alphaMap2, vUv).r;
    float blendedAlpha = alphaValue;

    float roughnessValue = texture2D(roughnessMap, uv).r * roughnessIntensity;

    // Normalize interpolated normal
    vec3 normalFromMap = (texture2D(normalMap, uv).rgb * 2.0 - 1.0) * normalIntensity;
    vec3 normal = normalize(vNormal + normalFromMap);


    if (useTransition) {
        vec4 albedo1 = texture2D(albedoMap, vUv);
        vec4 albedo2 = texture2D(albedoMap2, vUv);
        vec4 disp = texture2D(uDisp, vUv); 
        float pct = clamp((disp.r - uHoverState) * 20.0, 0., 1.);
        baseColor = mix(albedo1, albedo2, pct);
        blendedAlpha = mix(alphaValue2, alphaValue, pct);
    }



    // === Soft Light & Color Dodge ===
    vec3 softLight = mix(baseColor.rgb, baseColor.rgb * gradColor.rgb * rotationIntensity, 0.5);
    vec3 colorDodge = gradColor.rgb / (1.0 - baseColor.rgb * rotationIntensity);
    vec3 refractionEffect = mix(softLight, colorDodge, rotationIntensity);

    // Apply refraction intensity
    vec3 blendedRefraction = mix(baseColor.rgb, refractionEffect, refractionIntensity);

    // === Iridescence Effect ===
    if (useBrightness) {
        // Fresnel Effect: Based on angle between viewDir and normal
        float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);

        // Iridescence color blend based on Fresnel
        vec3 iridescenceColor = mix(brightnessColor1, brightnessColor2, fresnel);

        // Blend with light direction to make it dynamic
        float lightInfluence = max(dot(normal, normalize(lightDirection)), 0.0); // Dynamic reaction to light
        iridescenceColor *= lightInfluence;

        // Apply mask to limit effect
        float maskValue = texture2D(fxMask, uv).r; // Iridescence mask
        iridescenceColor *= maskValue;

        // Add iridescence to the refraction-blended color
        blendedRefraction += iridescenceColor * brightnessIntensity;
    }

    vec3 stripeColor = vec3(1.0);
    vec3 finalColor = vec3(1.0);

    if (stripesVisible) {
        // === Diagonal Lighting Stripes ===
        float stripeMovement = uTime * rotationIntensity * 5.0; // Only moves when rotated
        float stripePattern = abs(sin((uv.x + uv.y) * 20.0 + stripeMovement)); // Thicker stripes
        float stripeIntensity = smoothstep(0.3, 0.5, stripePattern);          // Adjust thickness
        stripeColor = vec3(1.5, 1.5, 1.5) * stripeIntensity * 0.5;   
        stripeColor *= rotationIntensity;

        finalColor = blendedRefraction + stripeColor;
    } else {
        finalColor = blendedRefraction;
    }


    // Apply roughness to soften the effect
    finalColor = mix(finalColor, finalColor * (1.0 - roughnessValue), 0.5);

    // Output final color with alpha transparency
    if (blendMode == 1) {
        gl_FragColor = vec4(finalColor, baseColor.a * blendedAlpha);
    } else {
        gl_FragColor = vec4(finalColor, alphaValue);
    }
}