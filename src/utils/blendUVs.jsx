
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
    color
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
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: {
          baseMap: { value: baseTexture },
          overlayMap: { value: overlayTexture },
          blendMode: { value: blendMode },
          color: { value: color ? [ color.r, color.g, color.b ] : [ 0, 0, 0 ] } ,
          useColor: { value: color ? true : false }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D baseMap;
          uniform sampler2D overlayMap;
          uniform int blendMode;
          
          uniform vec3 color;
          uniform bool useColor;

          varying vec2 vUv;
  
          void main() {
            vec4 base = texture2D(baseMap, vUv);
            vec4 overlay = texture2D(overlayMap, vUv);

            vec3 coloredOverlay;
            vec4 result;

            if (blendMode == 0) { // Normal

                if (useColor) {
                  coloredOverlay = mix(overlay.rgb, color, 1.);
                  result = mix(base, vec4(coloredOverlay, 1.0), overlay.a);
                } else {
                  result = mix(base, overlay, overlay.a);
                }

            } else if (blendMode == 1) { // Multiply
                result = base * overlay;
            } else { // Additive
                result = base + overlay;
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
