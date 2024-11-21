export default /* glsl */`
    varying vec2 vUv;

    uniform float uTime;
    uniform sampler2D uAlphaMask; // Alpha mask texture
    uniform vec2 uResolution;

    float time;
    float atime;

    struct Ray {
        vec3 org;
        vec3 dir;
    };

    vec3 background(vec3 dir) {
        float f = dir.z;
        vec3 sky = vec3(1.0); // White sky
        vec3 zenith = vec3(0.0, 0.0, 0.2); // Darker blue zenith
        return mix(sky, zenith, pow(f, 0.25)); // Gradient without the green
    }

    vec4 box(vec3 p, float w) {
        p = abs(p);
        float dx = p.x - w;
        float dy = p.y - w;
        float dz = p.z - w;
        float m = max(p.x - w, max(p.y - w, p.z - w));
        return vec4(m, dx, dy, dz);
    }

    mat3 rotateX(float a) {
        return mat3(1.0, 0.0, 0.0,
                    0.0, cos(a), -sin(a),
                    0.0, sin(a), cos(a));
    }

    mat3 rotateY(float a) {
        return mat3(cos(a), 0.0, -sin(a),
                    0.0, 1.0, 0.0,
                    sin(a), 0.0, cos(a));
    }

    mat3 rotateZ(float a) {
        return mat3(cos(a), -sin(a), 0.0,
                    sin(a), cos(a), 0.0,
                    0.0, 0.0, 1.0);
    }

    mat3 rotation;
    float jitter;

    vec4 map(vec3 p) {
        for (int i = 0; i < 5; i++) {
            p = abs(p * rotation + vec3(0.1, 0.0, 0.0));
            p.y -= 0.8;
            p.x -= 0.06;
            p.z -= jitter;
            p.xy = p.yx;
        }
        return box(p, 0.6);
    }

    vec3 normal(vec3 pos) {
        vec3 eps = vec3(0.001, 0.0, 0.0);
        vec3 nor = vec3(
            map(pos + eps.xyy).x - map(pos - eps.xyy).x,
            map(pos + eps.yxy).x - map(pos - eps.yxy).x,
            map(pos + eps.yyx).x - map(pos - eps.yyx).x
        );
        return normalize(nor);
    }

    vec3 render(Ray ray) {
        float dist = 0.0;
        vec3 pos;
        for (int i = 0; i < 60; i++) {
            pos = ray.org + dist * ray.dir;
            dist += map(pos).x;
        }
        vec4 m = map(pos);
        if (m.x < 0.01) {
            vec3 n = normal(pos);
            vec3 l = normalize(vec3(1.0, 2.0, 5.0));
            vec3 diffuse = clamp(dot(n, l), 0.0, 1.0) * vec3(1.0);
            vec3 r = reflect(ray.dir, n);
            vec3 refl = background(r);
            float dx = m.y;
            float dy = m.z;
            float dz = m.w;
            float start = 0.00;
            float end = 0.05;
            float f = smoothstep(start, end, abs(dx - dy));
            f *= smoothstep(start, end, abs(dx - dz));
            f *= smoothstep(start, end, abs(dz - dy));
            f = 1.0 - f;
            float rf = 1.0 - abs(dot(ray.dir, n));
            rf = pow(rf, 3.0);
            float flash = 1.0 - fract(atime);
            flash = sqrt(flash);
            return diffuse * (1.0 - rf) * 0.8 + flash * f * vec3(2.9, 1.4, 1.2) + refl * rf * 1.3;
        }
        return background(ray.dir) * 0.2;
    }

    Ray createRay(vec3 center, vec3 lookAt, vec3 up, vec2 uv, float fov, float aspect) {
        Ray ray;
        ray.org = center;
        vec3 dir = normalize(lookAt - center);
        up = normalize(up - dir * dot(dir, up));
        vec3 right = cross(dir, up);
        uv = 2.0 * uv - vec2(1.0);
        fov = fov * 3.1415 / 180.0;
        ray.dir = dir + tan(fov / 2.0) * right * uv.x + tan(fov / 2.0) / aspect * up * uv.y;
        ray.dir = normalize(ray.dir);
        return ray;
    }

    void main() {
        vec2 uv = vUv;
        uv = (uv - 0.5) * mat2(0.0, -1.0, 1.0, 0.0) + 0.5; // Rotate UV 90 degrees counter-clockwise

        time = uTime;
        vec3 cameraPos = vec3(7.0 * sin(time / 3.0), 7.0 * cos(time / 3.0), -4.0 * sin(time / 8.0));
        vec3 lookAt = vec3(0.0);
        vec3 up = vec3(0.0, 0.0, 1.0);
        float aspect = uResolution.x / uResolution.y;
        float t = floor(time);
        float f = fract(time);
        t += 1.0 - exp(-f * 9.0);
        atime = t;
        rotation = rotateX(atime * 1.9) * rotateY(atime * 1.4);
        jitter = sin(time * 80.0) * 0.1 * pow((1.0 - fract(time)), 4.0);
        Ray ray = createRay(cameraPos, lookAt, up, uv, 90.0, aspect);
        vec3 col = render(ray);

        // Sample alpha mask
        float alpha = texture2D(uAlphaMask, vUv).r; // Use the red channel for alpha

        // Final output with alpha applied
        gl_FragColor = vec4(col, alpha);
    }
`;

