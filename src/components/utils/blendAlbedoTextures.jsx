

import blendUVs from './blendUvs.jsx';

/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlbedoTextures(renderer, textures, controls) {
    const { base, pattern, main_interest, layout, grading } = textures 

    if (!renderer) return null

    const {
        base_albedo,
        pattern_albedo,
        main_interest_albedo,
        layout_albedo,
        grading_albedo
    } = controls

    let blendedAlbedo = null

    if (base_albedo) blendedAlbedo = base.albedo;
    if (pattern_albedo) blendedAlbedo = pattern.albedo;
    if (main_interest_albedo) blendedAlbedo = main_interest.albedo;
    if (layout_albedo) blendedAlbedo = layout.albedo;
    if (grading_albedo) blendedAlbedo = grading.albedo;

    if (base_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, base.albedo, renderer);
    if (pattern_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, pattern.albedo, renderer);
    if (main_interest_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, main_interest.albedo, renderer);
    if (layout_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, layout.albedo, renderer);
    if (grading_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, grading.albedo, renderer);

    return blendedAlbedo
}