
import * as THREE from 'three'

export const texturePaths = {
    base: {
        alpha: '/mobile/prod/base/alpha.jpg',
        alpha2: '/mobile/prod/base/alpha2.jpg',
        albedo: '/mobile/prod/base/albido.jpg',
        height: '/mobile/prod/base/height.png',
        normal: '/mobile/prod/base/normal.png',
        roughness: '/mobile/prod/base/roughness.jpg',
    },
    pattern: {
        albedo2: '/mobile/fx/fluid.jpg',
        albedo: '/mobile/prod/pattern/bk.png',
        height: '/mobile/fx/fluid.jpg'
    },
    main_interest: {
        albedo: '/mobile/prod/main_interest/albido.png',
        height: '/mobile/prod/main_interest/height.png',
    },
    layout: {
        albedo: '/mobile/prod/layout/albido2.png',
        albedo2: '/mobile/prod/layout/albido2-skills.png',
        ao: '/mobile/prod/layout/ao.png',
        height: '/mobile/prod/layout/height.png',
    },
    gradingV2: {
        doblez: {
            albedo: '/mobile/prod/crop_grading/poor4/doblez_albedo.png',
            roughness: '/mobile/prod/crop_grading/poor4/doblez_roughness.png'
        },
        exterior: {
            albedo: '/mobile/prod/crop_grading/poor4/exterior_albedo.png',
            roughness: '/mobile/prod/crop_grading/poor4/exterior_roughness.png'
        },
        manchas: {
            albedo: '/mobile/prod/crop_grading/poor4/manchas_albedo.png'
        },
        rascado: {
            albedo: '/mobile/prod/crop_grading/poor4/rascado_albedo.png',
            roughness: '/mobile/prod/crop_grading/poor4/rascado_roughness.png'
        },
        scratches: {
            albedo: '/mobile/prod/crop_grading/poor4/scratches_albedo.png',
            roughness: '/mobile/prod/crop_grading/poor4/scratches_roughness.png'
        }
    },
    fx: {
        irisMask: '/mobile/fx/iris-mask.jpg',
        iridescence: '/mobile/fx/iris4.jpg',
        brightnessMask: '/mobile/fx/LamineCard.png',
        brightness: '/mobile/fx/brightness.jpg',
        shine: '/mobile/prod/main_interest/ao.jpg',
        refraction: '/mobile/fx/pattern.jpg',
        transition: '/mobile/fx/trans.jpg'
    }
}


export const getCardConfigJSON = () => {
    return ({
        layout_color: { r: 44, g: 44, b: 49 },
        albedo_ch: {
            base_albedo: true,
            pattern_albedo: true,
            main_interest_albedo: true,
            layout_albedo: true,
            grading_v2_doblez_albedo: true,
            grading_v2_exterior_albedo: true,
            grading_v2_manchas_albedo: true,
            grading_v2_rascado_albedo: true,
            grading_v2_scratches_albedo: true 
        },
        alpha_ch: {
            base_alpha: true
        },
        roughness_ch: {
            base_roughness: false,
            grading_v2_doblez_roughness: true,
            grading_v2_exterior_roughness: true,
            grading_v2_rascado_roughness: true,
            grading_v2_scratches_roughness: true
        },
        normal_ch: {
            base_normal: true
        },
        height_ch: {
            base_height: false,
            layout_height: false,
            main_interest_height: true
        },
        roughness_intensity: 1.1,
        roughness_presence: 0.55,
        normal_intensity: 5,
        displacement_scale: 0.01,
        lights: {
            ambient_light_color: { r: 2, g: 2, b: 2 },
            ambient_light_intensity: 0.35,

            point_light_color: { r: 248, g: 223, b: 177 },
            point_light_intensity: 1,
            point_light_decay: 1.2,
            point_light_pos: { x: -4, y: 1, z: 1 },

            point_light_color_2: { r: 149, g: 181, b: 230 },
            point_light_intensity_2: 1.0,
            point_light_decay_2: 1.2,
            point_light_pos_2: { x: 4, y: 1, z: 1 }
        },
        brightness: {
            brightness_intensity: 0.6,
            use_brightness: false
        },
        iridescence: {
            iridescence_intensity: 0.6,
            use_iridescence: true
        },
        shine: {
            shine_intensity: 0.0045,
            use_shine: false,
            shine_color: { r: 231, g: 245, b: 81 }
        },
        refraction: {
            refraction_intensity: 1,
            use_refraction: false,
            stripes_visible: false
        },
        transition: {
            use_transition: false,
            transition_speed: 0.8,
        },
        folding: {
            fold_intensity: 0.65,
            use_folding: false,
            fold_rotation: 0.12,
            fold_x: 0.8,
            fold_y: 1.43
        },
        vertex_fx: {
            id: 'none'
        },
        fragment_fx: {
            id: 'none',
            trigger: 'rotation'
        }
    })
}


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
              vec2 centeredUV = uv * 0.25 - 0.25; 
              
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

       
            if (blendMode == 0) { // Basic [x Albedo, etc.]

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


            } else { // Additive [x Roughness]
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




/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlbedoTXs(
    renderer, 
    textures, 
    controls, 
    is2ndPattern = false, 
    is2ndLayout = false, 
    layoutColor,
    gradingAlbedoProps
) {
    const { base, pattern, main_interest, layout, gradingv2 } = textures 

    const { manchas, doblez, rascado, scratches } = gradingAlbedoProps

    const { 
        gradingDoblez,
        gradingExterior, 
        gradingManchas, 
        gradingRascado,
        gradingScratches
    } = gradingv2

    const { r, g, b } = layoutColor
    const threeColor = new THREE.Color(
        r / 255,
        g / 255,
        b / 255
      );

    if (!renderer) return null

    const {
        base_albedo,
        pattern_albedo,
        main_interest_albedo,
        layout_albedo,
        // grading_albedo,
        grading_v2_doblez_albedo,
        grading_v2_exterior_albedo,
        grading_v2_manchas_albedo,
        grading_v2_rascado_albedo,
        grading_v2_scratches_albedo
    } = controls

    let blendedAlbedo = null

    if (pattern_albedo) blendedAlbedo = is2ndPattern ? pattern.albedo2 : pattern.albedo
    if (main_interest_albedo) blendedAlbedo = main_interest.albedo;
    if (layout_albedo) blendedAlbedo = is2ndLayout ? layout.albedo2 : layout.albedo;
    // if (grading_albedo) blendedAlbedo = grading.albedo;
    if (grading_v2_doblez_albedo) blendedAlbedo = gradingDoblez.albedo;
    if (grading_v2_exterior_albedo) blendedAlbedo = gradingExterior.albedo;
    if (grading_v2_manchas_albedo) blendedAlbedo = gradingManchas.albedo;
    if (grading_v2_rascado_albedo) blendedAlbedo = gradingRascado.albedo;
    if (grading_v2_scratches_albedo) blendedAlbedo = gradingScratches.albedo;
    if (base_albedo) blendedAlbedo = base.albedo;


    if (base_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, base.albedo, renderer);
    if (pattern_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndPattern ? pattern.albedo2 : pattern.albedo, renderer);
    if (main_interest_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, main_interest.albedo, renderer);
    if (layout_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndLayout ? layout.albedo2 : layout.albedo, renderer, 0, false, new THREE.Vector2(0,0), 0, threeColor);
    // if (grading_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, grading.albedo, renderer);
    if (grading_v2_doblez_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingDoblez.albedo, renderer, 0,  true, doblez.pos, doblez.rot);
    if (grading_v2_exterior_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingExterior.albedo, renderer);
    if (grading_v2_manchas_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingManchas.albedo, renderer, 0, true, manchas.pos, manchas.rot);
    if (grading_v2_rascado_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingRascado.albedo, renderer, 0, true, rascado.pos, rascado.rot);
    if (grading_v2_scratches_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingScratches.albedo, renderer, 0, true, scratches.pos, scratches.rot);
    

    return blendedAlbedo
}




/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlphaTXs(renderer, textures, controls, is2ndLayout = false) {
    const { base, grading } = textures 

    if (!renderer) return null

    const {
        base_alpha,
        grading_alpha
    } = controls

    let blendedAlpha = null

    if (grading_alpha) blendedAlpha = grading.alpha;
    if (base_alpha) blendedAlpha = is2ndLayout ? base.alpha2 : base.alpha;

    if (grading_alpha && blendedAlpha && !is2ndLayout) blendedAlpha = blendUVs(blendedAlpha, grading.alpha, renderer);
    if (base_alpha && blendedAlpha) blendedAlpha = blendUVs(blendedAlpha, is2ndLayout ? base.alpha2 : base.alpha, renderer);

    return blendedAlpha
}





/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendHeightTXs(renderer, textures, controls) {
    const { base, pattern, main_interest, layout, grading } = textures 

    if (!renderer) return null

    const {
        base_height,
        pattern_height,
        main_interest_height,
        layout_height,
        grading_height
    } = controls

    let blendedHeight = null

    if (base_height) blendedHeight = base.height;
    if (pattern_height) blendedHeight = pattern.height;
    if (main_interest_height) blendedHeight = main_interest.height;
    if (layout_height) blendedHeight = layout.height;
    if (grading_height) blendedHeight = grading.height;

    if (base_height && blendedHeight) blendedHeight = blendUVs(blendedHeight, base.height, renderer);
    if (pattern_height && blendedHeight) blendedHeight = blendUVs(blendedHeight, pattern.height, renderer);
    if (main_interest_height && blendedHeight) blendedHeight = blendUVs(blendedHeight, main_interest.height, renderer);
    if (layout_height && blendedHeight) blendedHeight = blendUVs(blendedHeight, layout.height, renderer);
    if (grading_height && blendedHeight) blendedHeight = blendUVs(blendedHeight, grading.height, renderer);

    return blendedHeight
}



/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendRoughnessTXs(renderer, textures, controls, gradingRoughnessProps) {
    const { base, grading, gradingv2 } = textures 

    if (!renderer) return null

    const {
        doblez, rascado, scratches
    } = gradingRoughnessProps

    const {
        gradingDoblez, 
        gradingExterior, 
        gradingRascado,
        gradingScratches
    } = gradingv2

    const {
        base_roughness,
        // grading_roughness
        grading_v2_doblez_roughness,
        grading_v2_exterior_roughness,
        grading_v2_rascado_roughness,
        grading_v2_scratches_roughness
    } = controls

    let blendedRoughness = null

    // if (grading_roughness) blendedRoughness = grading.roughness;
    if (grading_v2_exterior_roughness) blendedRoughness = gradingExterior.roughness;
    if (grading_v2_rascado_roughness) blendedRoughness = gradingRascado.roughness;
    if (base_roughness) blendedRoughness = base.roughness;
    if (grading_v2_doblez_roughness) blendedRoughness = gradingDoblez.roughness;
    if (grading_v2_scratches_roughness) blendedRoughness = gradingScratches.roughness;

    if (base_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, base.roughness, renderer, 2);
    // if (grading_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, grading.roughness, renderer);
    if (grading_v2_exterior_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, gradingExterior.roughness, renderer, 2);
    if (grading_v2_rascado_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, gradingRascado.roughness, renderer, 2, true, rascado.pos, rascado.rot);
    if (grading_v2_doblez_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, gradingDoblez.roughness, renderer, 2, true, doblez.pos, doblez.rot);
    if (grading_v2_scratches_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, gradingScratches.roughness, renderer, 2, true, scratches.pos, scratches.rot);

    return blendedRoughness
}




/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendNormalTXs(renderer, textures, controls, gradingNormalsProps) {
    const { base, main_interest, layout, grading, gradingv2 } = textures 

    const { 
        scratches, 
        doblez, 
        rascado
    } = gradingNormalsProps

    const {
        gradingDoblez, 
        gradingRascado, 
        gradingScratches
    } = gradingv2

    if (!renderer) return null

    const {
        base_normal,
        main_interest_normal,
        layout_normal,
        // grading_normal
        grading_v2_doblez_normal,
        // grading_v2_exterior_normal,
        grading_v2_rascado_normal,
        grading_v2_scratches_normal
    } = controls

    let blendedNormal = null

    if (main_interest_normal) blendedNormal = main_interest.normal;
    if (layout_normal) blendedNormal = layout.normal;
    // if (grading_normal) blendedNormal = grading.normal;
    if (grading_v2_doblez_normal) blendedNormal = gradingDoblez.normal;
    if (grading_v2_rascado_normal) blendedNormal = gradingRascado.normal;
    if (grading_v2_scratches_normal) blendedNormal = gradingScratches.normal;
    if (base_normal) blendedNormal = base.normal;

    // if (grading_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, grading.normal, renderer);
    if (grading_v2_doblez_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingDoblez.normal, renderer, 1, true, doblez.pos, doblez.rot);
    if (grading_v2_rascado_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingRascado.normal, renderer, 1, true, rascado.pos, rascado.rot);
    if (grading_v2_scratches_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingScratches.normal, renderer, 1, true, scratches.pos, scratches.rot);
    if (base_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, base.normal, renderer, 1);
    if (main_interest_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, main_interest.normal, renderer, 1);
    if (layout_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, layout.normal, renderer, 1);

    return blendedNormal



}



export const randomInRange = (min, max) => Math.random() * (max - min) + min

export const getRandomPositionAndRotation = () => ({
  pos: new THREE.Vector2(
      randomInRange(-0.1, 0.1),
      randomInRange(-0.1, 0.1)
  ),
  rot: randomInRange(0, Math.PI * 3)
})


export function getGradingProps () {
    
    const doblezRand = getRandomPositionAndRotation()
    const rascadoRand = getRandomPositionAndRotation()
    const scratchesRand = getRandomPositionAndRotation()
    const manchasRand = getRandomPositionAndRotation()

    const {
        posDoblez, 
        rotDoblez
    } = {
        posDoblez: doblezRand.pos, 
        rotDoblez: doblezRand.rot
    }

    const {
        posManchas, 
        rotManchas
    } = {
        posManchas: manchasRand.pos,
        rotManchas: manchasRand.rot
    }

    const {
        posRascado, 
        rotRascado
    } = {
        posRascado: rascadoRand.pos, 
        rotRascado: rascadoRand.rot
    }

    const {
        posScratches, 
        rotScratches
    } = {
        posScratches: scratchesRand.pos,
        rotScratches: scratchesRand.rot
    }


    const gradingRoughnessProps = {
        doblez: {
            pos: posDoblez,
            rot: rotDoblez,
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        }
    }

    const gradingNormalsProps = {
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        }
    }

    const gradingAlbedoProps = {
        manchas: {
            pos: posManchas,
            rot: rotManchas
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
    }

    return {
        gradingRoughnessProps,
        gradingNormalsProps,
        gradingAlbedoProps
    }
}



export function normalizeAngle(newAngle, lastAngle) {
    let delta = newAngle - lastAngle;
  
    // Adjust for wraparound: Ensure delta is in range [-π, π]
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
  
    // Compute the smoothed angle
    return lastAngle + delta;
  }
  