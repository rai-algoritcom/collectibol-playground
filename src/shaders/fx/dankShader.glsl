
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform sampler2D uAlphaMask; // Alpha mask texture

    // 2D Random function
    float random(in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // 2D Noise function
    float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // Vector field manipulation
    vec2 vectorField(vec2 uv) {
        vec2 res = uv;
        float n = noise(res * vec2(3.0));
        res.y -= uTime * 0.01;
        res += sin(res.yx * 40.0) * 0.02;
        res += vec2(n);
        return res;
    }

    // Plot function for grid lines
    float plot(float val, float c, float t) {
        float l = smoothstep(c, c - t, val);
        float r = smoothstep(c, c - t / 5.0, val);
        return r - l;
    }

    void main() {
        vec2 st = vUv;
        st.y *= uResolution.y / uResolution.x; // Correct aspect ratio
        st = vectorField(st);

        float cell = 0.2;
        vec2 modSt = mod(st, vec2(cell));

        float x = plot(modSt.x, cell, 0.08);
        float y = plot(modSt.y, cell, 0.47);

        vec3 bgCol = vec3(0.0, 0.0, 0.0);
        vec3 col = vec3(0.75, 0.75, 0.75) * x;
        col += vec3(0.83, 0.69, 0.22) * y;
        col += bgCol * vec3(smoothstep(1.7, 0.01, x + y));

        // Sample the alpha mask
        float alpha = texture2D(uAlphaMask, vUv).r; // Use red channel as alpha mask

        gl_FragColor = vec4(col, alpha * .25); // Apply alpha from mask
    }


