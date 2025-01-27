varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D fxMask;           // Effect mask for transparency and modulation
uniform sampler2D brightnessMask; // Iridescence mask for dynamic visual effect

uniform float brightnessIntensity; // Intensity of the iridescence effect
uniform float uRotation;            // Rotation angle for iridescence mask

void main() {
    // Lighting calculations
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 normal = normalize(vNormal);

    // Prevent black/dark areas by ensuring normals face the camera
    float facingRatio = max(dot(viewDir, normal), 0.0); // Ranges from 0 (back) to 1 (front)

    // Iridescence Effect
    vec2 center = vec2(0.5, 0.5);
    vec2 uvRotated = vUv - center;
    float angle = uRotation;
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
    uvRotated = rotationMatrix * uvRotated + center;

    vec3 iridescenceColor = texture2D(brightnessMask, uvRotated).rgb;
    float fxMaskValue = texture2D(fxMask, vUv).r;

    // Iridescence modulation based on the fxMask and facingRatio
    float viewAngle = abs(dot(normal, viewDir));
    float smoothFactor = smoothstep(0.4, 1.0, viewAngle);
    vec3 iridescenceEffect = iridescenceColor * fxMaskValue * smoothFactor * brightnessIntensity * facingRatio;

    // Apply the iridescence effect to lighting
    vec3 finalLighting = iridescenceEffect * 10.0;

    // Add overall transparency to the effect
    float alphaValue = fxMaskValue * 0.4 * facingRatio; // Reduce opacity for both black and white parts, fades with facing ratio

    // Output the final color
    gl_FragColor = vec4(finalLighting, alphaValue);
}
