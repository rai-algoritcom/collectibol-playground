
import * as THREE from 'three'

/**
 * Combines two textures using a specified blending mode
 * @param {THREE.Texture} baseTexture - The base texture
 * @params {THREE.Texture} overlayTexture - The overlay texture 
 * @param {string} blendMode - Blending mode ('normal', 'multiply', 'additive')
 * @returns {THREE.Texture} - The combined texture
 */
export default function blendUVs(
    baseTexture, 
    overlayTexture, 
    renderer,
    blendMode = 0,
    useGrading = false,
    positionOffset = new THREE.Vector2(0, 0),
    rotation = 0,
    color = undefined,
) {

    const width = baseTexture.image.width;
    const height = baseTexture.image.height;

    // Ensure textures have compatible settings
    baseTexture.minFilter = THREE.LinearFilter;
    baseTexture.magFilter = THREE.LinearFilter;
    baseTexture.format = THREE.RGBAFormat;

    overlayTexture.minFilter = THREE.LinearFilter;
    overlayTexture.magFilter = THREE.LinearFilter;
    overlayTexture.format = THREE.RGBAFormat;
  
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
  
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2), // Mesh with 2x3 aspect ratio
      new THREE.ShaderMaterial({
        uniforms: {
          baseMap: { value: baseTexture },
          overlayMap: { value: overlayTexture },
          blendMode: { value: blendMode },
          color: { value: color ? [ color.r, color.g, color.b ] : [ 0, 0, 0 ] },
          useColor: { value: color ? true : false },
          useGrading: { value: useGrading },
          positionOffset: { value: positionOffset },
          rotation: { value: rotation },
          overlayAspectRatio: { value: 1 }, // Example: aspect ratio of overlay texture
          meshAspectRatio: { value: 1 },   // Aspect ratio of the mesh
        },
        vertexShader:  /* glsl */`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: /*glsl*/ `
          uniform sampler2D baseMap;
          uniform sampler2D overlayMap;
          uniform int blendMode;
    
          uniform vec2 positionOffset;
          uniform float rotation;
          uniform float overlayAspectRatio;
          uniform float meshAspectRatio;
    
          uniform vec3 color;
          uniform bool useColor;
          uniform bool useGrading;
    
          varying vec2 vUv;

          vec3 unpackNormal(vec4 normalMap) {
            // Unpack the normal map from [0, 1] range to [-1, 1] range
            return normalMap.xyz * 2.0 - 1.0;
          }
        
          vec3 blendNormals(vec3 normal1, vec3 normal2) {
              // Combine two normals in tangent space
              vec3 blendedNormal = normalize(vec3(
                  normal1.xy + normal2.xy, // Combine the X and Y components
                  normal1.z * normal2.z    // Adjust the Z component for depth
              ));
          
              return blendedNormal;
          }
    
          void main() {
            vec4 base = texture2D(baseMap, vUv);
            vec4 overlay = texture2D(overlayMap, vUv);

            vec3 coloredOverlay;
            vec4 result;

            vec2 uv = vUv;

            if (useGrading) {
              // Transform UVs for overlay map
              vec2 centeredUV = uv * 0.55 - 0.25; 
              
              // Handle aspect ratio adjustment (maintain overlay texture's aspect)
              float aspectScale = overlayAspectRatio / meshAspectRatio;
              centeredUV.x *= aspectScale;

              // Apply rotation
              float cosAngle = cos(rotation);
              float sinAngle = sin(rotation);
              mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
              centeredUV = rotationMatrix * centeredUV;

              // Apply position offset
              centeredUV += positionOffset;

              // Translate back to UV space
              uv = centeredUV + 0.5;

              // Sample overlay texture
              overlay = texture2D(overlayMap, uv);

              if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                overlay = vec4(0.0); // Clip parts outside the texture
              }
            }

       
            if (blendMode == 0) { // Normal

                if (useColor) {
                  coloredOverlay = mix(overlay.rgb, color, 1.);
                  result = mix(base, vec4(coloredOverlay, 1.0), overlay.a);
                } else {
                  result = mix(base, overlay, overlay.a);
                }

            } else if (blendMode == 1) { // Multiply [x Normals]
                // result = base * overlay;
              // Unpack the normal maps
              vec3 normal1 = unpackNormal(base);
              vec3 normal2 = unpackNormal(overlay);

              // Blend the normals
              vec3 blendedNormal = blendNormals(normal1, normal2);

              // Convert blended normal back to [0, 1] range
              vec3 packedNormal = blendedNormal * 0.5 + 0.5;

              result = vec4(packedNormal, 1.0);


            } else { // Additive
              result = base * overlay;
              result = clamp(base + overlay, 0.0, 1.0);
            }
            gl_FragColor = result;
        }
        `,
      })
    );
  
    scene.add(quad);
  
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  
    return renderTarget.texture;
}
