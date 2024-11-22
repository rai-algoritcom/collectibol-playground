
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying mat3 vNormalMatrix;

    uniform sampler2D heightMap;
    uniform float displacementScale;
    uniform float uTime;

    // Random function for glitch
    float random2D(vec2 value) {
        return fract(sin(dot(value.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
        vUv = uv;

        // Apply displacement mapping
        float displacement = texture2D(heightMap, vUv).r * displacementScale;
        vec3 displacedPosition = position + normal * displacement;

        // Glitch effect
        vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
        float glitchTime = uTime - modelPosition.y;
        float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
        glitchStrength /= 3.0;
        glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
        glitchStrength *= 0.25;
        modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
        modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;

        // Final transformed position
        gl_Position = projectionMatrix * modelViewMatrix * modelPosition;

        // Pass normal and position to fragment shader
        vNormalMatrix = mat3(modelViewMatrix);
        vNormal = normalize(normalMatrix * normal);
        vPosition = modelPosition.xyz;
    }

