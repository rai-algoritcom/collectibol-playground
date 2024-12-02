import blendUVs from "./blendUVs";
import * as THREE from 'three'


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlbedoTXs(renderer, textures, controls, is2ndPattern = false, is2ndLayout = false, layoutColor) {
    const { base, pattern, main_interest, layout, grading } = textures 

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
        grading_albedo
    } = controls

    let blendedAlbedo = null

    if (base_albedo) blendedAlbedo = base.albedo;
    if (pattern_albedo) blendedAlbedo = is2ndPattern ? pattern.albedo2 : pattern.albedo
    if (main_interest_albedo) blendedAlbedo = main_interest.albedo;
    if (layout_albedo) blendedAlbedo = is2ndLayout ? layout.albedo2 : layout.albedo;
    if (grading_albedo) blendedAlbedo = grading.albedo;


    if (base_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, base.albedo, renderer);
    if (pattern_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndPattern ? pattern.albedo2 : pattern.albedo, renderer);
    if (main_interest_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, main_interest.albedo, renderer);
    if (layout_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndLayout ? layout.albedo2 : layout.albedo, renderer, 0, threeColor);
    if (grading_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, grading.albedo, renderer);

    return blendedAlbedo
}