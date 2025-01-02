varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;

varying vec3 vWorldPosition;

uniform sampler2D heightMap;
uniform float displacementScale;
uniform float uTime;

void main() {
    vUv = uv;

    // Displacement from height map
    float displacement = texture2D(heightMap, vUv).r * displacementScale;

    // Edge burning effect based on UV and time
    float burn = smoothstep(0.0, 0.5, abs(sin(uTime * 3.0 + vUv.x * 10.0)) - vUv.y * 1.2);
    vec3 displacedPosition = position + normal * (displacement * burn);

    // Add random jitter for burning distortion
    displacedPosition.xy += vec2(sin(vUv.x * 10.0), cos(vUv.y * 10.0)) * burn * 0.05;

    // Transform to clip space
    vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * modelPosition;

    // Pass normal and position to fragment shader
    vNormalMatrix = mat3(modelViewMatrix);
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = modelPosition.xyz;
}
