
import blendUVs from './blendUVs.jsx';
import * as THREE from "three"


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


export function blendRoughnessZipped(
    { renderScene, renderCamera, renderer },
    textures,
    gradingRoughnessProps,
    optimize = false
) {
    // Textures 
    const { gradingv2 } = textures 
    const { gradingDoblez, gradingExterior, gradingRascado, gradingScratches } = gradingv2
    
    // Offset + Rotation
    const { doblez, rascado, scratches } = gradingRoughnessProps

    if (!renderer) return null
    if (optimize) return gradingExterior.roughness

    gradingDoblez.roughness.minFilter = THREE.LinearFilter 
    gradingDoblez.roughness.magFilter = THREE.LinearFilter
    gradingDoblez.roughness.format = THREE.RGBAFormat;
    gradingExterior.roughness.minFilter = THREE.LinearFilter 
    gradingExterior.roughness.magFilter = THREE.LinearFilter
    gradingExterior.roughness.format = THREE.RGBAFormat;
    gradingRascado.roughness.minFilter = THREE.LinearFilter 
    gradingRascado.roughness.magFilter = THREE.LinearFilter
    gradingRascado.roughness.format = THREE.RGBAFormat;
    gradingScratches.roughness.minFilter = THREE.LinearFilter 
    gradingScratches.roughness.magFilter = THREE.LinearFilter
    gradingScratches.roughness.format = THREE.RGBAFormat;

    const width = gradingDoblez.roughness.image.width 
    const height = gradingDoblez.roughness.image.height

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });

    const quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                // textures 
                gradingDoblezMap: { value: gradingDoblez.roughness },
                gradingExteriorMap: { value: gradingExterior.roughness },
                gradingRascadoMap: { value: gradingRascado.roughness },
                gradingScratchesMap: { value: gradingScratches.roughness },
                // offset + rotation
                positionOffsetDoblez: { value: doblez.pos },
                rotationDoblez: { value: doblez.rot },
                positionOffsetRascado: { value: rascado.pos },
                rotationRascado: { value: rascado.rot },
                positionOffsetScratches: { value: scratches.pos },
                rotationScratches: { value: scratches.rot },
                // + configs 
                overlayAspectRatio: { value: 1 },
                meshAspectRatio: { value: 1 },
            },
            vertexShader: /* glsl */ `
                varying vec2 vUv;
                void main() {
                    vUv = uv; 
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: /* glsl */ `
                uniform sampler2D gradingDoblezMap;
                uniform sampler2D gradingExteriorMap;
                uniform sampler2D gradingRascadoMap;
                uniform sampler2D gradingScratchesMap;

                uniform vec2 positionOffsetDoblez;
                uniform vec2 positionOffsetRascado;
                uniform vec2 positionOffsetScratches;
                uniform float rotationDoblez;
                uniform float rotationRascado;
                uniform float rotationScratches;

                uniform float overlayAspectRatio;
                uniform float meshAspectRatio;

                varying vec2 vUv;

                vec4 mixGrading(
                    vec2 centeredUv,
                    float rotation,
                    vec2 positionOffset,
                    sampler2D gradingMap
                ) {
                    // Rotation + Offset Pos. Manchas
                    float cosAngle = cos(rotation);
                    float sinAngle = sin(rotation);
                    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
                    vec2 centeredUV = rotationMatrix * centeredUv;
                    centeredUV += positionOffset;
                    vec2 uv = centeredUV + 0.5;
                    vec4 result = texture2D(gradingMap, uv);
                    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                        result = vec4(0.0); // Clip parts outside the texture
                    }
                    return result;
                }

                void main() {
                    vec4 gradingExterior = texture2D(gradingExteriorMap, vUv);

                    vec4 result;
                    vec2 uv = vUv;

                    // Mixing 
                    result = gradingExterior;
                    // Grading configs
                    vec2 centeredUV = uv * 0.25 - 0.25;
                    float aspectScale = overlayAspectRatio / meshAspectRatio; 
                    centeredUV.x *= aspectScale;
                    // Rotation + Offset Pos. Doblez
                    vec4 gradingDoblez = mixGrading(centeredUV, rotationDoblez, positionOffsetDoblez, gradingDoblezMap);
                    result = clamp(result + gradingDoblez, 0.0, 1.0);
                    // Rotation + Offset Pos. Rascado
                    vec4 gradingRascado = mixGrading(centeredUV, rotationRascado, positionOffsetRascado, gradingRascadoMap);
                    result = clamp(result + gradingRascado, 0.0, 1.0);
                    // Rotation + Offset Pos. Scratches 
                    vec4 gradingScratches = mixGrading(centeredUV, rotationScratches, positionOffsetScratches, gradingScratchesMap);
                    result = clamp(result + gradingScratches, 0.0, 1.0);

                    gl_FragColor = result;
                }
            `
        })
    )

    renderScene.add(quad);
  
    renderer.setRenderTarget(renderTarget);
    renderer.render(renderScene, renderCamera);
    renderer.setRenderTarget(null);

    renderScene.remove(quad);
  
    return renderTarget.texture;

}