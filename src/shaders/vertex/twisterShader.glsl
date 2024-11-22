
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

        // Add twist animation
        float angle = uTime * 1.25 + position.y * .15;
        float sinAngle = sin(angle);
        float cosAngle = cos(angle);
        mat2 twist = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
        displacedPosition.xz = twist * displacedPosition.xz;

        // Final transformed position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

        // Pass to fragment shader
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
    }

