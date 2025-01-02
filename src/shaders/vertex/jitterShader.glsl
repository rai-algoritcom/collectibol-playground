
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    varying vec3 vWorldPosition;

    uniform sampler2D heightMap;
    uniform float displacementScale;
    uniform float uTime;

    // Random function for jitter
    float random2D(vec2 value) {
        return fract(sin(dot(value.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
        vUv = uv;

        // Apply displacement mapping
        float displacement = texture2D(heightMap, vUv).r * displacementScale;
        vec3 displacedPosition = position + normal * displacement;

        // Trigger jitter every X seconds
        float interval = 2.0; // Trigger every 2 seconds
        float trigger = step(0.7, fract(uTime / interval)); // Active during the last 10% of the interval

        // Jitter effect (only when triggered)
        if (trigger > 0.5) {
            displacedPosition.x += (random2D(position.xz + uTime) - 0.5) * 0.105;
            displacedPosition.z += (random2D(position.zx + uTime) - 0.5) * 0.105;
        }

        // Final transformed position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

        // Pass to fragment shader
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
    }

