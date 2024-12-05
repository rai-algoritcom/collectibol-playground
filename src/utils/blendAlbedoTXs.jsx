import blendUVs from "./blendUVs";
import * as THREE from 'three'


/**
 * Combines all texture maps for the given layers
 * @param {Object} textures - Object containing textures for all layers
 * @returns {Object} Combined texture maps
 */
export function blendAlbedoTXs(
    renderer, 
    textures, 
    controls, 
    is2ndPattern = false, 
    is2ndLayout = false, 
    layoutColor,
    gradingAlbedoProps
) {
    const { base, pattern, main_interest, layout, gradingv2 } = textures 

    const { manchas, doblez, rascado } = gradingAlbedoProps

    const { 
        gradingDoblez,
        gradingExterior, 
        gradingManchas, 
        gradingRascado
    } = gradingv2

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
        // grading_albedo,
        grading_v2_doblez_albedo,
        grading_v2_exterior_albedo,
        grading_v2_manchas_albedo,
        grading_v2_rascado_albedo
    } = controls

    let blendedAlbedo = null

    if (pattern_albedo) blendedAlbedo = is2ndPattern ? pattern.albedo2 : pattern.albedo
    if (main_interest_albedo) blendedAlbedo = main_interest.albedo;
    if (layout_albedo) blendedAlbedo = is2ndLayout ? layout.albedo2 : layout.albedo;
    // if (grading_albedo) blendedAlbedo = grading.albedo;
    if (grading_v2_doblez_albedo) blendedAlbedo = gradingDoblez.albedo;
    if (grading_v2_exterior_albedo) blendedAlbedo = gradingExterior.albedo;
    if (grading_v2_manchas_albedo) blendedAlbedo = gradingManchas.albedo;
    if (grading_v2_rascado_albedo) blendedAlbedo = gradingRascado.albedo;
    if (base_albedo) blendedAlbedo = base.albedo;


    if (base_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, base.albedo, renderer);
    if (pattern_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndPattern ? pattern.albedo2 : pattern.albedo, renderer);
    if (main_interest_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, main_interest.albedo, renderer);
    if (layout_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndLayout ? layout.albedo2 : layout.albedo, renderer, 0, false, new THREE.Vector2(0,0), 0, threeColor);
    // if (grading_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, grading.albedo, renderer);
    if (grading_v2_doblez_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingDoblez.albedo, renderer, 0,  true, doblez.pos, doblez.rot);;
    if (grading_v2_exterior_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingExterior.albedo, renderer);
    if (grading_v2_manchas_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingManchas.albedo, renderer, 0, true, manchas.pos, manchas.rot);
    if (grading_v2_rascado_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingRascado.albedo, renderer, 0, true, rascado.pos, rascado.rot);
    

    return blendedAlbedo
}