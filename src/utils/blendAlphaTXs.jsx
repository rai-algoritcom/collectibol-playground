

import blendUVs from './blendUVs.jsx';


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


export function blendAlphasZipped(
    textures, 
    is2ndLayout = false
) {
    const { base } = textures
    let blendedAlpha = is2ndLayout ? base.alpha2 : base.alpha
    return blendedAlpha
}