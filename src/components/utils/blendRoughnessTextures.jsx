
import blendUVs from './blendUvs.jsx';


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendRoughnessTextures(renderer, textures, controls) {
    const { base, grading } = textures 

    if (!renderer) return null

    const {
        base_roughness,
        grading_roughness
    } = controls

    let blendedRoughness = null

    if (base_roughness) blendedRoughness = base.roughness;
    if (grading_roughness) blendedRoughness = grading.roughness;

    if (base_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, base.roughness, renderer);
    if (grading_roughness && blendedRoughness) blendedRoughness = blendUVs(blendedRoughness, grading.roughness, renderer);

    return blendedRoughness
}