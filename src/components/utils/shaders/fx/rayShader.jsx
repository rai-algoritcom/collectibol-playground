export default /* glsl */ `
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uAlphaMask; // Alpha mask texture

    #define LOOP_BODY p = pos;tof = time + i*0.5;p = vec3(p.x*sin(tof) + p.z*cos(tof),p.y, p.x*cos(tof) - p.z*cos(tof));tof*=1.3*i;p += vec3(4.,0.,0.);	p = vec3(p.x*sin(tof) + p.z*cos(tof),p.y,p.x*cos(tof) - p.z*sin(tof));	h = Hit(box(p, vec3(.4,20.,.2)),i); 	totalHit = hitUnion(h,totalHit);	i+=1.;

    struct Ray {
        vec3 org;
        vec3 dir;
    };
    
    struct Hit {
        float dist;
        float index;
    };

    float time;
    float glowAmt;

    float onOff(float a, float b, float c) {
        return clamp(c * sin(time + a * cos(time * b)), 0.0, 1.0);
    }

    float glows(float index) {
        return onOff(5.0 + index * 0.5, index + 3.0, 3.0);
    }

    float box(vec3 pos, vec3 dims) {
        pos = abs(pos) - dims;
        return max(max(pos.x, pos.y), pos.z);
    }
    
    Hit hitUnion(Hit h1, Hit h2) {
        Hit result;
        if (h1.dist < h2.dist) {
            result = h1;
        } else {
            result = h2;
        }
        return result;
    }

    Hit scene(vec3 pos) {
        Hit totalHit;
        totalHit.dist = 9000.0;

        float i = 0.0;
        Hit h;
        vec3 p;
        float tof;
        LOOP_BODY
        LOOP_BODY
        LOOP_BODY
        LOOP_BODY
        LOOP_BODY
        return totalHit;
    }

    Hit raymarch(Ray ray) {
        vec3 pos;
        Hit hit;
        hit.dist = 0.0;
        Hit curHit;
        for (int i = 0; i < 40; i++) {
            pos = ray.org + hit.dist * ray.dir;
            curHit = scene(pos);
            hit.dist += curHit.dist;
            glowAmt += clamp(pow(curHit.dist + 0.1, -8.0), 0.0, 0.15) * glows(curHit.index);
        }
        hit.index = curHit.index;
        hit.index = curHit.dist < 0.01 ? hit.index : -1.0;
        return hit;
    }

    vec3 calcNormal(vec3 pos) {
        vec3 eps = vec3(0.001, 0.0, 0.0);
        vec3 nor = vec3(
            scene(pos + eps.xyy).dist - scene(pos - eps.xyy).dist,
            scene(pos + eps.yxy).dist - scene(pos - eps.yxy).dist,
            scene(pos + eps.yyx).dist - scene(pos - eps.yyx).dist
        );
        return normalize(nor);
    }

    vec3 render(Ray ray) {
        Hit hit = raymarch(ray);
        vec3 pos = ray.org + hit.dist * ray.dir;
        vec3 col = vec3(0.0);
        if (hit.index != -1.0) {
            vec3 nor = calcNormal(pos);
            vec3 l = normalize(vec3(3.0, 0.0, 0.0) - pos);
            col = vec3(0.3, 0.5, 0.7);
            float diff = clamp(dot(nor, l), 0.0, 1.0);
            vec3 r = normalize(2.0 * dot(nor, l) * nor - l);
            vec3 v = normalize(ray.org - pos);
            float spec = clamp(dot(v, r), 0.0, 1.0);
            float ao = 1.0;
            col = diff * col * ao + pow(spec, 10.0) * vec3(1.0) * ao + vec3(0.5, 0.7, 1.0) * 1.9 * glows(hit.index);
            col *= clamp(1.0 - hit.dist * 0.03, 0.0, 1.0);
        }
        col += clamp(glowAmt * 0.4, 0.0, 1.0) * vec3(0.3, 0.5, 0.7);
        return col;
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
        glowAmt = 0.0;
        time = uTime + uv.y * (0.17 + 0.14 * clamp(sin(uTime * 1.2) * 2.0, -1.0, 1.0));
        vec3 cameraPos = vec3(6.0, 3.0, -6.0);
        vec3 lookAt = vec3(0.0);
        vec3 up = vec3(sin(0.6 * sin(time * 1.4)), cos(0.6 * sin(time * 1.4)), 0.0);
        float aspect = uResolution.x / uResolution.y;
        Ray ray = createRay(cameraPos, lookAt, up, uv, 90.0, aspect);
        vec3 col = render(ray);

        // Sample alpha from the mask texture
        float alpha = texture2D(uAlphaMask, vUv).r; // Use red channel for alpha

        gl_FragColor = vec4(col, alpha); // Apply alpha mask
    }
`;
