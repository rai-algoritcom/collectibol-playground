

import blendUVs from './blendUVs.jsx';


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendNormalTXs(renderer, textures, controls) {
    const { base, main_interest, layout, grading } = textures 

    if (!renderer) return null

    const {
        base_normal,
        main_interest_normal,
        layout_normal,
        grading_normal
    } = controls

    let blendedNormal = null


    if (base_normal) blendedNormal = base.normal;
    if (main_interest_normal) blendedNormal = main_interest.normal;
    if (layout_normal) blendedNormal = layout.normal;
    if (grading_normal) blendedNormal = grading.normal;

    if (grading_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, grading.normal, renderer);
    if (base_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, base.normal, renderer);
    if (main_interest_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, main_interest.normal, renderer);
    if (layout_normal && blendedNormal) blendedNormal = blendUVs(blendedNormal, layout.normal, renderer);

    return blendedNormal



}