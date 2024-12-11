
import blendUVs from './blendUVs.jsx';


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