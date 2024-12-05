

import blendUVs from './blendUVs.jsx';


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
        gradingExterior, 
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
        grading_v2_exterior_normal,
        grading_v2_rascado_normal,
        grading_v2_scratches_normal
    } = controls

    let blendedNormal = null

    if (main_interest_normal) blendedNormal = main_interest.normal;
    if (layout_normal) blendedNormal = layout.normal;
    // if (grading_normal) blendedNormal = grading.normal;
    if (grading_v2_doblez_normal) blendedNormal = gradingDoblez.normal;
    if (grading_v2_exterior_normal) blendedNormal = gradingExterior.normal;
    if (grading_v2_rascado_normal) blendedNormal = gradingRascado.normal;
    if (grading_v2_scratches_normal) blendedNormal = gradingScratches.normal;
    if (base_normal) blendedNormal = base.normal;

    // if (grading_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, grading.normal, renderer);
    if (grading_v2_doblez_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingDoblez.normal, renderer, 0, true, doblez.pos, doblez.rot);
    if (grading_v2_exterior_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingExterior.normal, renderer);
    if (grading_v2_rascado_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingRascado.normal, renderer, 0, true, rascado.pos, rascado.rot);
    if (grading_v2_scratches_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, gradingScratches.normal, renderer, 0, true, scratches.pos, scratches.rot);
    if (base_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, base.normal, renderer);
    if (main_interest_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, main_interest.normal, renderer);
    if (layout_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, layout.normal, renderer);

    return blendedNormal



}