
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying mat3 vNormalMatrix;
                        
    uniform sampler2D heightMap;
    uniform float displacementScale;
                        
    void main() {
        vUv = uv;
                        
        // Apply displacement mapping
        float displacement = texture2D(heightMap, vUv).r * displacementScale;
        vec3 displacedPosition = position + normal * displacement;
                        
        // Pass normal and position to fragment shader
        vNormalMatrix = mat3(modelViewMatrix);
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
                        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    }
