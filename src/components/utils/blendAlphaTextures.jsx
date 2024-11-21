

import blendUVs from './blendUvs';


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlphaTextures(renderer, textures, controls) {
    const { base, grading } = textures 

    if (!renderer) return null

    const {
        base_alpha,
        grading_alpha
    } = controls

    let blendedAlpha = null

    if (grading_alpha) blendedAlpha = grading.alpha;
    if (base_alpha) blendedAlpha = base.alpha;

    if (grading_alpha && blendedAlpha) blendedAlpha = blendUVs(blendedAlpha, grading.alpha, renderer);
    if (base_alpha && blendedAlpha) blendedAlpha = blendUVs(blendedAlpha, base.alpha, renderer);

    return blendedAlpha
}