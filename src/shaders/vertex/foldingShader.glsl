#define M_PI 3.1415926535897932384626433832795

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vNormalMatrix;

varying vec3 vWorldPosition;

uniform sampler2D heightMap;
uniform float displacementScale;
uniform float foldIntensity; // Controls the intensity of the fold (in radians)
uniform vec2 foldPosition;   // Position of the fold (x, y)
uniform float foldRotationZ; // Rotation of the fold in radians

// 2D rotation matrix
mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vUv = uv;

    // Apply displacement mapping
    float displacement = texture2D(heightMap, vUv).r * displacementScale;
    vec3 displacedPosition = position + normal * displacement;

    // Transform position for fold effect
    vec2 localPos = displacedPosition.xy - foldPosition; // Translate to fold's local space
    localPos *= rotate2D(-foldRotationZ);               // Rotate into fold's orientation

    // Add fold effect (hinge-like behavior)
    if (localPos.x > 0.0) { // Apply fold to one side (localPos.x > 0.0)
        float foldAngle = min(foldIntensity, M_PI / 2.0); // Clamp fold angle to 90 degrees (PI/2)
        float foldAmount = sin(foldAngle);               // Calculate fold curve
        displacedPosition.z += foldAmount * localPos.x;  // Adjust Z for fold
        displacedPosition.y += (1.0 - cos(foldAngle)) * localPos.x; // Adjust Y for hinge effect
    }

    // Transform back to global space
    localPos *= rotate2D(foldRotationZ);               // Rotate back
    displacedPosition.xy = localPos + foldPosition;    // Translate back to global space

    // Pass normal and position to fragment shader
    vNormalMatrix = mat3(modelViewMatrix);
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
