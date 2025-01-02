varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;

varying vec3 vWorldPosition;

uniform sampler2D heightMap;
uniform float displacementScale;
uniform float uTime;

// Random noise function
float randomNoise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vUv = uv;

    // Displacement mapping
    float displacement = texture2D(heightMap, vUv).r * displacementScale;

    // Noise-based glitch
    float noise = randomNoise(vUv * uTime) * 0.05;
    vec3 displacedPosition = position + normal * (displacement + noise);

    // Transform vertex position to clip space
    vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * modelPosition;

    // Pass normal and position to fragment shader
    vNormalMatrix = mat3(modelViewMatrix);
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = modelPosition.xyz;
}
