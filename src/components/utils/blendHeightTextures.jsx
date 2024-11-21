

import blendUVs from './blendUvs';


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendHeightTextures(renderer, textures, controls) {
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