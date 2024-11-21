export default /* glsl */ `

    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uAlphaMask; // Alpha mask texture

    varying vec2 vUv;

    const float PI = 3.14159265359;

    float RATIO_SPINS_PEED = 5.2;
    float RATIO_SPIN_POWER = 0.1;
    float RATIO_DIVIDE = 20.0;

    float getAngle(vec2 uvCenter) {
        float angle = atan(uvCenter.y, uvCenter.x) / (2.0 * PI);
        if (angle < 0.0) angle += 1.0;
        return angle;
    }

    float getDis(vec2 v) {
        return sqrt(v.x * v.x + v.y * v.y);
    }

    void main() {
        vec2 uv = vUv;
        vec2 uvCenter = uv - vec2(0.5, 1.0);
        float angle = getAngle(uvCenter);
        float dis = getDis(uvCenter);
        angle += cos(dis * PI - uTime * RATIO_SPINS_PEED) * RATIO_SPIN_POWER;

        float color = cos(angle * 2.0 * PI * RATIO_DIVIDE);
        vec3 finalColor = vec3(color * 0.2, color * 0.1, color * 0.9);

        // Sample the alpha from the mask texture
        float alpha = texture2D(uAlphaMask, uv).r;

        gl_FragColor = vec4(finalColor, alpha);
    }
`;
