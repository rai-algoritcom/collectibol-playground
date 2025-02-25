uniform sampler2D uAlphaMask;
uniform sampler2D signatureMask;
varying vec2 vUv;

void main() {
    vec4 signatureColor = texture2D(signatureMask, vUv);
    float alphaMask = texture2D(uAlphaMask, vUv).r; // Assuming the alpha mask uses the red channel

    // Calculate luminance of the signature texture
    float luminance = dot(signatureColor.rgb, vec3(0.299, 0.587, 0.114)); 

    // Define a fade threshold for smooth edges
    float edgeThresholdLow = 0.1;  // Adjust for stronger or weaker fade
    float edgeThresholdHigh = 0.99; // Pixels above this are fully transparent

    // Smoothly transition transparency instead of hard discard
    float alpha = smoothstep(edgeThresholdHigh, edgeThresholdLow, luminance) * alphaMask;

    // Ensure proper blending
    gl_FragColor = vec4(signatureColor.rgb * alpha, alpha);
}
