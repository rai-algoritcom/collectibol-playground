uniform float uTime;               // Animation time
uniform vec2 uResolution;          // Screen resolution
uniform sampler2D uAlphaMask;       // Noise texture

varying vec2 vUv;

// Function to render a "ball" effect
vec4 Ball(vec2 pos, vec2 uv, vec4 col, float k) {
    return vec4(1.3 - vec3(pow(length(pos * 5.0 + 5.0 - uv * 10.0), 0.2)), 1.0) * col * k;
}

// Noise generation using textures
vec4 Noise(sampler2D tex, vec2 uv) {
    vec4 n0 = textureLod(tex, uv, 0.0) * 0.03125;
    vec4 n1 = textureLod(tex, uv * 0.5, 0.0) * 0.0625;
    vec4 n2 = textureLod(tex, uv * 0.25, 0.0) * 0.125;
    vec4 n3 = textureLod(tex, uv * 0.125, 0.0) * 0.25;
    vec4 n4 = textureLod(tex, uv * 0.0625, 0.0) * 0.5;
    vec4 n5 = textureLod(tex, uv * 0.03125, 1.0);
    return (n0 + n1 + n2 + n3 + n4 + n5) / 1.0;
}

void main() {
    float _k = sin(uTime * 2.0);
    vec2 uv = vUv;
    
    vec4 ball0 = Ball(vec2(sin(uTime) * _k, cos(uTime) * _k), uv, vec4(1.0, 1.0, cos(uTime - 123.0), 1.0), 10.0);
    vec4 ball1 = Ball(vec2(sin(uTime - 123.0) * _k, -cos(uTime + sin(uTime * 0.1 + 123.0)) * _k), uv, vec4(sin(uTime - 123.0), 1.0, 0.0, 1.0), 10.0);
    vec4 ball2 = Ball(vec2(cos(uTime - 123.0) * _k, -sin(uTime + sin(uTime * 0.1 + 123.0)) * _k), uv, vec4(cos(uTime - 123.0), 1.0, 1.0, 1.0), 10.0);

    vec4 ball3 = Ball(vec2(sin(uTime) * _k, cos(uTime) * _k), uv, vec4(1.0, 0.0, sin(uTime), 1.0), 10.0);
    vec4 ball4 = Ball(vec2(sin(uTime - 434.0) * _k, -cos(uTime + sin(uTime * 0.1 + 564.0)) * _k), uv, vec4(sin(uTime), 0.0, 1.0, 1.0), 10.0);
    vec4 ball5 = Ball(vec2(cos(uTime - 534.0) * _k, -sin(uTime + sin(uTime * 0.5 + 643.0)) * _k), uv, vec4(cos(uTime), 1.0, 0.0, 1.0), 10.0);

    vec4 ball6 = Ball(vec2(sin(uTime) * _k, cos(uTime) * _k), uv, vec4(1.0, 0.0, sin(uTime + 7674.0), 1.0), 10.0);
    vec4 ball7 = Ball(vec2(sin(uTime - 946.0) * _k, -cos(uTime + sin(uTime * 0.51 + 84565.0)) * _k), uv, vec4(sin(uTime - 53347.0), 0.0, 0.0, 1.0), 10.0);
    vec4 ball8 = Ball(vec2(cos(uTime - 546.0) * _k, -sin(uTime + sin(uTime * 0.5 + 45645.0)) * _k), uv, vec4(cos(uTime), 1.0, 0.0, 1.0), 10.0);

    vec4 balls = ball0 + ball1 + ball2 + ball3 + ball4 + ball5 + ball6 + ball7 + ball8;
    vec4 noise = Noise(uAlphaMask, uv + uTime) + Noise(uAlphaMask, uv) * 1.0;
    
    // Sample alpha mask
    float alpha = texture2D(uAlphaMask, uv).r; // Use the red channel of the alpha map as the mask

    gl_FragColor = vec4((balls * noise).rgb, alpha); // Apply the alpha mask to the final color
}
