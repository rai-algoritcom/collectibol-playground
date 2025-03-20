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
    gradingAlbedoProps,
    useVideoTexture = false,
    useHDRITexture = false
) {

    const { base, pattern, main_interest, layout, gradingv2 } = textures 

    const { manchas, doblez, rascado, scratches } = gradingAlbedoProps

    const { 
        gradingDoblez,
        gradingExterior, 
        gradingManchas, 
        gradingRascado,
        gradingScratches
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
        grading_v2_rascado_albedo,
        grading_v2_scratches_albedo
    } = controls

    let blendedAlbedo = null

    if (pattern_albedo && !useVideoTexture && !useHDRITexture) blendedAlbedo = is2ndPattern ? pattern.albedo2 : pattern.albedo
    if (main_interest_albedo && !useVideoTexture) blendedAlbedo = main_interest.albedo;
    if (layout_albedo) blendedAlbedo = is2ndLayout ? layout.albedo2 : layout.albedo;
    // if (grading_albedo) blendedAlbedo = grading.albedo;
    if (grading_v2_doblez_albedo) blendedAlbedo = gradingDoblez.albedo;
    if (grading_v2_exterior_albedo) blendedAlbedo = gradingExterior.albedo;
    if (grading_v2_manchas_albedo) blendedAlbedo = gradingManchas.albedo;
    if (grading_v2_rascado_albedo) blendedAlbedo = gradingRascado.albedo;
    if (grading_v2_scratches_albedo) blendedAlbedo = gradingScratches.albedo;
    if (base_albedo) blendedAlbedo = base.albedo;


    if (base_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, base.albedo, renderer);
    if (pattern_albedo && blendedAlbedo && !useVideoTexture && !useHDRITexture) blendedAlbedo = blendUVs(blendedAlbedo, is2ndPattern ? pattern.albedo2 : pattern.albedo, renderer);
    if (main_interest_albedo && blendedAlbedo && !useVideoTexture) blendedAlbedo = blendUVs(blendedAlbedo, main_interest.albedo, renderer);
    if (layout_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, is2ndLayout ? layout.albedo2 : layout.albedo, renderer, 0, false, new THREE.Vector2(0,0), 0, threeColor);
    // if (grading_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, grading.albedo, renderer);
    if (grading_v2_doblez_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingDoblez.albedo, renderer, 0,  true, doblez.pos, doblez.rot);
    if (grading_v2_exterior_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingExterior.albedo, renderer);
    if (grading_v2_manchas_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingManchas.albedo, renderer, 0, true, manchas.pos, manchas.rot);
    if (grading_v2_rascado_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingRascado.albedo, renderer, 0, true, rascado.pos, rascado.rot);
    if (grading_v2_scratches_albedo && blendedAlbedo) blendedAlbedo = blendUVs(blendedAlbedo, gradingScratches.albedo, renderer, 0, true, scratches.pos, scratches.rot);
    

    return blendedAlbedo
}









export function blendAlbedosZipped(
    { renderScene, renderCamera, renderer },
    textures,
    is2ndLayout = false,
    layoutColor, 
    gradingAlbedoProps,
    patternBgProps
) {

    // Textures
    const { base, pattern, main_interest, layout, pattern_bg, gradingv2 } = textures;
    const { gradingDoblez, gradingExterior, gradingManchas, gradingRascado, gradingScratches } = gradingv2;

    // Offset + Rotation
    const { manchas, doblez, rascado, scratches } = gradingAlbedoProps;
    const patternBg = patternBgProps;

    // Layout color
    const { r, g, b } = layoutColor;
    const threeColor = new THREE.Color(r / 255, g / 255, b / 255);
  
    if (!renderer) return null;

    base.albedo.minFilter = THREE.LinearFilter;
    base.albedo.magFilter = THREE.LinearFilter;
    base.albedo.format = THREE.RGBAFormat;

    pattern.albedo.minFilter = THREE.LinearFilter;
    pattern.albedo.magFilter = THREE.LinearFilter;
    pattern.albedo.format = THREE.RGBAFormat;

    pattern_bg.albedo.minFilter = THREE.LinearFilter;
    pattern_bg.albedo.magFilter = THREE.LinearFilter;
    pattern_bg.albedo.format = THREE.RGBAFormat;

    main_interest.albedo.minFilter = THREE.LinearFilter;
    main_interest.albedo.magFilter = THREE.LinearFilter;
    main_interest.albedo.format = THREE.RGBAFormat;

    layout.layoutTxt.minFilter = THREE.LinearFilter;
    layout.layoutTxt.magFilter = THREE.LinearFilter;
    layout.layoutTxt.format = THREE.RGBAFormat;

    if (is2ndLayout) {
        layout.albedo2.minFilter = THREE.LinearFilter;
        layout.albedo2.magFilter = THREE.LinearFilter;
        layout.albedo2.format = THREE.RGBAFormat;
    } else {
        layout.albedo.minFilter = THREE.LinearFilter;
        layout.albedo.magFilter = THREE.LinearFilter;
        layout.albedo.format = THREE.RGBAFormat;
    }
    gradingDoblez.albedo.minFilter = THREE.LinearFilter;
    gradingDoblez.albedo.magFilter = THREE.LinearFilter;
    gradingDoblez.albedo.format = THREE.RGBAFormat;
    gradingExterior.albedo.minFilter = THREE.LinearFilter;
    gradingExterior.albedo.magFilter = THREE.LinearFilter;
    gradingExterior.albedo.format = THREE.RGBAFormat;
    gradingManchas.albedo.minFilter = THREE.LinearFilter;
    gradingManchas.albedo.magFilter = THREE.LinearFilter;
    gradingManchas.albedo.format = THREE.RGBAFormat;
    gradingRascado.albedo.minFilter = THREE.LinearFilter;
    gradingRascado.albedo.magFilter = THREE.LinearFilter;
    gradingRascado.albedo.format = THREE.RGBAFormat;
    gradingScratches.albedo.minFilter = THREE.LinearFilter;
    gradingScratches.albedo.magFilter = THREE.LinearFilter;
    gradingScratches.albedo.format = THREE.RGBAFormat;

    const width = base.albedo.image.width
    const height = base.albedo.image.height

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });

    const quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                // textures
                baseMap: { value: base.albedo },
                patternMap: { value: pattern.albedo },
                patternBgMap: { value: pattern_bg.albedo },
                mainInterestMap: { value: main_interest.albedo },
                layoutMap: { value: is2ndLayout ? layout.albedo2 : layout.albedo },
                layoutTxtMap: { value: layout.layoutTxt },
                gradingDoblezMap: { value: gradingDoblez.albedo },
                gradingExteriorMap: { value: gradingExterior.albedo },
                gradingManchasMap: { value: gradingManchas.albedo },
                gradingRascadoMap: { value: gradingRascado.albedo },
                gradingScratchesMap: { value: gradingScratches.albedo },
                // props 
                color: { value: threeColor ? [threeColor.r, threeColor.g, threeColor.b] : [0, 0, 0] },
                // grading pos. offset + rotation
                positionOffsetManchas: { value: manchas.pos },
                rotationManchas: { value: manchas.rot },
                positionOffsetDoblez: { value: doblez.pos },
                rotationDoblez: { value: doblez.rot },
                positionOffsetRascado: { value: rascado.pos },
                rotationRascado: { value: rascado.rot },
                positionOffsetScratches: { value: scratches.pos },
                rotationScratches: { value: scratches.rot },
                // pattern bg props 
                positionOffsetPatternBg: { value: patternBg.pos },
                rotationPatternBg: { value: patternBg.rot },
                // + configs
                overlayAspectRatio: { value: 1 },
                meshAspectRatio: { value: 1 },
                hasPatternBg: { value: true }
            },
            vertexShader: /* glsl */ `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: /*glsl*/ `
                uniform sampler2D baseMap;
                uniform sampler2D patternMap;
                uniform sampler2D patternBgMap;
                uniform sampler2D mainInterestMap;
                uniform sampler2D layoutMap;
                uniform sampler2D layoutTxtMap;
                uniform sampler2D gradingDoblezMap;
                uniform sampler2D gradingExteriorMap;
                uniform sampler2D gradingManchasMap;
                uniform sampler2D gradingRascadoMap;
                uniform sampler2D gradingScratchesMap;

                uniform vec3 color;
                uniform bool hasPatternBg;

                uniform vec2 positionOffsetManchas;
                uniform float rotationManchas;
                uniform vec2 positionOffsetDoblez;
                uniform float rotationDoblez;
                uniform vec2 positionOffsetRascado;
                uniform float rotationRascado;
                uniform vec2 positionOffsetScratches;
                uniform float rotationScratches;

                uniform vec2 positionOffsetPatternBg;
                uniform float rotationPatternBg;

                uniform float overlayAspectRatio;
                uniform float meshAspectRatio;

                varying vec2 vUv;

                vec4 mixGrading(
                    vec2 centeredUv,
                    float rotation,
                    vec2 positionOffset,
                    sampler2D gradingMap
                ) {
                    // Rotation + Offset Pos. Manchas
                    float cosAngle = cos(rotation);
                    float sinAngle = sin(rotation);
                    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
                    vec2 centeredUV = rotationMatrix * centeredUv;
                    centeredUV += positionOffset;
                    vec2 uv = centeredUV + 0.5;
                    vec4 result = texture2D(gradingMap, uv);
                    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                        result = vec4(0.0); // Clip parts outside the texture
                    }
                    return result;
                }

                vec3 adjustSaturation(vec3 color, float saturation) {
                    float intensity = dot(color, vec3(0.299, 0.587, 0.114)); // Luminance
                    return mix(vec3(intensity), color, saturation);
                }

                // Convert to linear space
                vec3 toLinear(vec3 color) {
                    return pow(color, vec3(2.2));
                }

                // Convert to sRGB
                vec3 toSRGB(vec3 color) {
                    return pow(color, vec3(1.0 / 2.2));
                }

                void main() {
                    vec4 base = texture2D(baseMap, vUv);
                    vec4 pattern = texture2D(patternMap, vUv);
                    vec4 mainInterest = texture2D(mainInterestMap, vUv);

                    vec4 _layout = texture2D(layoutMap, vUv);
                    vec4 layoutTxt = texture2D(layoutTxtMap, vUv);

                    vec4 gradingExterior = texture2D(gradingExteriorMap, vUv);

                    vec3 coloredOverlay; 
                    vec4 result; 
                    vec2 uv = vUv;

                    pattern.rgb = toLinear(pattern.rgb);
                    mainInterest.rgb = toLinear(mainInterest.rgb);

                    pattern.rgb = adjustSaturation(pattern.rgb, 1.); // Boost saturation by 50%
                    mainInterest.rgb = adjustSaturation(mainInterest.rgb, 1.);

                    pattern.rgb *= 1.2; // Increase brightness by 20%
                    mainInterest.rgb *= 1.2; // Increase brightness by 20%

                    // Grading configs
                    vec2 centeredUV = uv * 1. - 0.5;
                    float aspectScale = overlayAspectRatio * .68 / meshAspectRatio * 1.; 
                    centeredUV.x *= aspectScale;

                    // Mixing 
                    result = mix(base, pattern, pattern.a);

                    if (hasPatternBg) {
                        // Scale down UVs (centered around 0.5)
                        vec2 scaleFactor = vec2(.7, .65); // Adjust for desired downscaling (1.0 = no scaling)
                        vec2 scaledUV = ((centeredUV - .5) * scaleFactor) + (1. * (1.0 - scaleFactor));

                        vec4 patternBg = mixGrading(scaledUV, rotationPatternBg, positionOffsetPatternBg, patternBgMap);
                        patternBg.rgb = toLinear(patternBg.rgb);
                        patternBg.rgb = adjustSaturation(patternBg.rgb, 1.);
                        patternBg.rgb *= 1.2;
                    
                        // Smooth alpha blending for better edge transition
                        float feather = 1.; // Adjust for more or less softness
                        float alpha = smoothstep(0.0, feather, patternBg.a); // Soften the transition
                        vec3 patternColor = patternBg.rgb * alpha; // Multiply color by new soft alpha
                    
                        result = mix(result, vec4(patternColor, alpha), alpha);
                    }

                    result = mix(result, mainInterest, mainInterest.a);

                    /**
                     * Layout Txt applied
                     */
                    float blackThreshold = 0.1;
                    float isBlack = step(length(_layout.rgb), blackThreshold);
                    vec3 layoutColor = mix(_layout.rgb, layoutTxt.rgb, isBlack);
                    result = mix(result, vec4(layoutColor, 1.), _layout.a); 
                    // [OLD code] result = mix(result, vec4(mix(_layout.rgb, color, 1.), 1.), _layout.a);


                    result = mix(result, gradingExterior, gradingExterior.a);

                    // Rotation + Offset Pos. Manchas
                    vec4 gradingManchas = mixGrading(centeredUV, rotationManchas, positionOffsetManchas, gradingManchasMap);
                    result = mix(result, gradingManchas, gradingManchas.a);
                    // Rotation + Offset Pos. Doblez
                    vec4 gradingDoblez = mixGrading(centeredUV, rotationDoblez, positionOffsetDoblez, gradingDoblezMap);
                    result = mix(result, gradingDoblez, gradingDoblez.a);
                    // Rotation + Offset Pos. Rascado
                    vec4 gradingRascado = mixGrading(centeredUV, rotationRascado, positionOffsetRascado, gradingRascadoMap);
                    result = mix(result, gradingRascado, gradingRascado.a);
                    // Rotation + Offset Pos. Scratches
                    vec4 gradingScratches = mixGrading(centeredUV, rotationScratches, positionOffsetScratches, gradingScratchesMap);
                    result = mix(result, gradingScratches, gradingScratches.a);

                    //result.rgb = toSRGB(result.rgb);
                    gl_FragColor = result;
                }
          
            `
        })
    )

    renderScene.add(quad);
  
    renderer.setRenderTarget(renderTarget);
    renderer.render(renderScene, renderCamera);
    renderer.setRenderTarget(null);

    renderScene.remove(quad);
    return renderTarget.texture;
}





export function blendAlbedosBacksideZipped(
    { renderScene, renderCamera, renderer },
    textures,
    gradingAlbedoProps
) {

    // Textures
    const { backside, gradingv2 } = textures;
    const { gradingDoblez, gradingExterior, gradingManchas, gradingRascado, gradingScratches } = gradingv2;

    // Offset + Rotation
    const { manchas, doblez, rascado, scratches } = gradingAlbedoProps;

    backside.albedo.minFilter = THREE.LinearFilter;
    backside.albedo.magFilter = THREE.LinearFilter;
    backside.albedo.format = THREE.RGBAFormat;

    gradingDoblez.albedo.minFilter = THREE.LinearFilter;
    gradingDoblez.albedo.magFilter = THREE.LinearFilter;
    gradingDoblez.albedo.format = THREE.RGBAFormat;
    gradingExterior.albedo.minFilter = THREE.LinearFilter;
    gradingExterior.albedo.magFilter = THREE.LinearFilter;
    gradingExterior.albedo.format = THREE.RGBAFormat;
    gradingManchas.albedo.minFilter = THREE.LinearFilter;
    gradingManchas.albedo.magFilter = THREE.LinearFilter;
    gradingManchas.albedo.format = THREE.RGBAFormat;
    gradingRascado.albedo.minFilter = THREE.LinearFilter;
    gradingRascado.albedo.magFilter = THREE.LinearFilter;
    gradingRascado.albedo.format = THREE.RGBAFormat;
    gradingScratches.albedo.minFilter = THREE.LinearFilter;
    gradingScratches.albedo.magFilter = THREE.LinearFilter;
    gradingScratches.albedo.format = THREE.RGBAFormat;

    const width = backside.albedo.image.width
    const height = backside.albedo.image.height

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });

    const quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                // textures
                backsideMap: { value: backside.albedo },
                gradingDoblezMap: { value: gradingDoblez.albedo },
                gradingExteriorMap: { value: gradingExterior.albedo },
                gradingManchasMap: { value: gradingManchas.albedo },
                gradingRascadoMap: { value: gradingRascado.albedo },
                gradingScratchesMap: { value: gradingScratches.albedo },
                // grading pos. offset + rotation
                positionOffsetManchas: { value: manchas.pos },
                rotationManchas: { value: manchas.rot },
                positionOffsetDoblez: { value: doblez.pos },
                rotationDoblez: { value: doblez.rot },
                positionOffsetRascado: { value: rascado.pos },
                rotationRascado: { value: rascado.rot },
                positionOffsetScratches: { value: scratches.pos },
                rotationScratches: { value: scratches.rot },
                // + configs
                overlayAspectRatio: { value: 1 },
                meshAspectRatio: { value: 1 },
            },
            vertexShader: /* glsl */ `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: /*glsl*/ `
                uniform sampler2D backsideMap;
                uniform sampler2D gradingDoblezMap;
                uniform sampler2D gradingExteriorMap;
                uniform sampler2D gradingManchasMap;
                uniform sampler2D gradingRascadoMap;
                uniform sampler2D gradingScratchesMap;

                uniform vec2 positionOffsetManchas;
                uniform float rotationManchas;
                uniform vec2 positionOffsetDoblez;
                uniform float rotationDoblez;
                uniform vec2 positionOffsetRascado;
                uniform float rotationRascado;
                uniform vec2 positionOffsetScratches;
                uniform float rotationScratches;

                uniform float overlayAspectRatio;
                uniform float meshAspectRatio;

                varying vec2 vUv;

                vec4 mixGrading(
                    vec2 centeredUv,
                    float rotation,
                    vec2 positionOffset,
                    sampler2D gradingMap
                ) {
                    // Rotation + Offset Pos. Manchas
                    float cosAngle = cos(rotation);
                    float sinAngle = sin(rotation);
                    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
                    vec2 centeredUV = rotationMatrix * vec2(centeredUv.x, -centeredUv.y);
                    centeredUV += positionOffset;
                    vec2 uv = centeredUV + 0.5;
                    vec4 result = texture2D(gradingMap, uv);
                    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                        result = vec4(0.0); // Clip parts outside the texture
                    }
                    return result;
                }

                void main() {
                    vec4 backside = texture2D(backsideMap, vUv);
                    vec4 gradingExterior = texture2D(gradingExteriorMap, vUv);

                    vec4 result; 
                    vec2 uv = vUv;

                    // Mixing 
                    result = mix(backside, gradingExterior, gradingExterior.a);
                    // Grading configs
                    vec2 centeredUV = uv * 0.25 - 0.25;
                    float aspectScale = overlayAspectRatio / meshAspectRatio; 
                    centeredUV.x *= aspectScale;
                    // Rotation + Offset Pos. Manchas
                    vec4 gradingManchas = mixGrading(centeredUV, rotationManchas, positionOffsetManchas, gradingManchasMap);
                    result = mix(result, gradingManchas, gradingManchas.a);
                    // Rotation + Offset Pos. Doblez
                    vec4 gradingDoblez = mixGrading(centeredUV, rotationDoblez, positionOffsetDoblez, gradingDoblezMap);
                    result = mix(result, gradingDoblez, gradingDoblez.a);
                    // Rotation + Offset Pos. Rascado
                    vec4 gradingRascado = mixGrading(centeredUV, rotationRascado, positionOffsetRascado, gradingRascadoMap);
                    result = mix(result, gradingRascado, gradingRascado.a);
                    // Rotation + Offset Pos. Scratches
                    vec4 gradingScratches = mixGrading(centeredUV, rotationScratches, positionOffsetScratches, gradingScratchesMap);
                    result = mix(result, gradingScratches, gradingScratches.a);

                    gl_FragColor = result;
                }
          
            `
        })
    )

    renderScene.add(quad);
  
    renderer.setRenderTarget(renderTarget);
    renderer.render(renderScene, renderCamera);
    renderer.setRenderTarget(null);

    renderScene.remove(quad);
    return renderTarget.texture;
}