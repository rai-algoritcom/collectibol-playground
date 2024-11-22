
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform sampler2D heightMap;
    uniform float displacementScale;
    uniform float uTime;

    void main() {
        vUv = uv;

        // Displacement mapping
        float displacement = texture2D(heightMap, vUv).r * displacementScale;
        vec3 displacedPosition = position + normal * displacement;

        // Add floating animation
        displacedPosition.y += sin(uTime * 1.5) * 0.1;
        displacedPosition.xz *= mat2(cos(uTime * 0.5), -sin(uTime * 0.5), sin(uTime * 0.5), cos(uTime * 0.5));

        // Final transformed position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

        // Pass to fragment shader
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
    }

