export default /* glsl */ `
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

        // Add breathing scale
        float scale = 1.0 + sin(uTime * 2.0) * 0.05;
        displacedPosition *= scale;

        // Final transformed position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

        // Pass to fragment shader
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
    }
`;
