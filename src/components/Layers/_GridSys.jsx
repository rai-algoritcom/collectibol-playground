
import { OrbitControls, useTexture } from "@react-three/drei";
import LayeredMaterialCard from "./Layers/LayeredMaterialCard.jsx";
import { Suspense, useEffect, useRef, useState } from "react";
import { useControls } from "leva";
import MainCard from "./Layers/MainCard.jsx";
import mock from '../data/genesis.js'
import { useThree } from "@react-three/fiber";
import { DragControls } from "three/examples/jsm/controls/DragControls"


export default function CardLoader({ isGameplay }) {



    const groupRef = useRef([])
    const dragControls = useRef()
    const orbitControls = useRef()
    const { camera, gl } = useThree()
    const initialYRef = useRef(new Map())


    const gridSize = 1 
    const dragLimits = {
        minX: -5, 
        maxX: 5, 
        minZ: -5, 
        maxZ: 5
    }


    const [texturePaths, setTexturePaths] = useState({
        base: {
            alpha: '/mobile/prod/base/alpha.jpg',
            alpha2: '/mobile/prod/base/alpha2.jpg',
            albedo: '/mobile/prod/base/albido.jpg',
            height: '/mobile/prod/base/height.png',
            normal: '/mobile/prod/base/normal.png',
            roughness: '/mobile/prod/base/roughness.jpg',
        },
        pattern: {
            albedo2: '/mobile/fx/fluid.jpg',
            albedo: '/mobile/prod/pattern/albido3.jpg',
            height: '/mobile/fx/fluid.jpg'
        },
        main_interest: {
            albedo: '/mobile/prod/main_interest/albido.png',
            // ao: '/textures/main_interest/ao.png',
            height: '/mobile/prod/main_interest/height.png',
            // normal: '/mobile/prod/main_interest/normal.png'
        },
        layout: {
            albedo: '/mobile/prod/layout/albido2.png',
            albedo2: '/mobile/prod/layout/albido2-skills.png',
            ao: '/mobile/prod/layout/ao.png',
            height: '/mobile/prod/layout/height.png',
            // normal: '/mobile/prod/layout/normal.png',
        },
        // grading: {
        //     albedo: '/textures/grading/poor/alpha.png',
        //     height: '/textures/grading/poor/height.png',
        //     normal: '/textures/grading/poor/normal.png',
        //     alpha: '/textures/grading/poor/opacity.png',
        //     roughness: '/textures/grading/poor/roughness.png',
        // },
        gradingV2: {
            doblez: {
                albedo: '/mobile/prod/grading/poor4/doblez_albedo.png',
                // normal: '/mobile/prod/crop_grading/poor2/doblez_normal.png',
                roughness: '/mobile/prod/grading/poor4/doblez_roughness.png'
            },
            exterior: {
                albedo: '/mobile/prod/grading/poor4/exterior_albedo.png',
                // normal: '/prod/grading/poor/exterior_normal.png',
                roughness: '/mobile/prod/grading/poor4/exterior_roughness.png'
            },
            manchas: {
                albedo: '/mobile/prod/grading/poor4/manchas_albedo.png'
            },
            rascado: {
                albedo: '/mobile/prod/grading/poor4/rascado_albedo.png',
                // normal: '/mobile/prod/crop_grading/poor2/rascado_normal.png',
                roughness: '/mobile/prod/grading/poor4/rascado_roughness.png'
            },
            scratches: {
                albedo: '/mobile/prod/grading/poor4/scratches_albedo.png',
                // normal: '/mobile/prod/crop_grading/poor2/scratches_normal.png',
                roughness: '/mobile/prod/grading/poor4/scratches_roughness.png'
            }
        },
        fx: {
            irisMask: '/mobile/fx/iris-mask.jpg',
            iridescence: '/mobile/fx/iris4.jpg',
            brightnessMask: '/mobile/fx/LamineCard.png',
            brightness: '/mobile/fx/brightness.jpg',
            shine: '/mobile/prod/main_interest/ao.jpg',
            refraction: '/mobile/fx/pattern.jpg',
            transition: '/mobile/fx/trans.jpg'
        }
    })


    const { base_alpha, base_albedo, base_height, base_normal, base_roughness } = useControls(
        'Base Textures + Channels', {
            'Alpha': { image: texturePaths.base.alpha, onChange: (v) => updateTexture('base', 'alpha', v) },
            'Alpha II': { image: texturePaths.base.alpha2, onChange: (v) => updateTexture('base', 'alpha2', v)  },
            'Albedo': { image: texturePaths.base.albedo, onChange: (v) => updateTexture('base', 'albedo', v) },
            'Height': { image: texturePaths.base.height, onChange: (v) => updateTexture('base', 'height', v) },
            'Normal': { image: texturePaths.base.normal, onChange: (v) => updateTexture('base', 'normal', v) },
            'Roughness': { image: texturePaths.base.roughness, onChange: (v) => updateTexture('base', 'roughness', v) }, 
            base_alpha: {
                value: true,
                label: 'Alpha ch.'
            },
            base_albedo: {
                value: true, 
                label: 'Albedo ch.'
            },
            base_height: {
                value: false,
                label: 'Height ch.'
            },
            base_normal: {
                value: true,
                label: 'Normal ch.'
            },
            base_roughness: {
                value: false,
                label: 'Roughness ch.'
            }
    })


    const { pattern_albedo } = useControls(
        'Pattern Textures + Channels', {
            'Albedo I': { image: texturePaths.pattern.albedo, onChange: (v) => updateTexture('pattern', 'albedo', v) },
            'Albedo II': { image: texturePaths.pattern.albedo2, onChange: (v) => updateTexture('pattern', 'albedo2', v) },
            // 'Height': { image: texturePaths.pattern.height, onChange: (v) => updateTexture('pattern', 'height', v) },
            pattern_albedo: {
                value: true,
                label: 'Albedo ch.'
            }
    })


    const { main_interest_albedo, main_interest_height, /*main_interest_normal*/ } = useControls(
        'Main Textures + Channels', {
            'Albedo': { image: texturePaths.main_interest.albedo, onChange: (v) => updateTexture('main_interest', 'albedo', v) },
            'Height': { image: texturePaths.main_interest.height, onChange: (v) => updateTexture('main_interest', 'height', v) },
            // 'Normal': { image: texturePaths.main_interest.normal, onChange: (v) => updateTexture('main_interest', 'normal', v) },
            main_interest_albedo: {
                value: true,
                label: 'Albedo ch.'
            },
            main_interest_height: {
                value: true,
                label: 'Height ch.'
            },
            // main_interest_normal: {
            //     value: false,
            //     label: 'Normal ch.'
            // }
        }
    )


    const { layout_albedo, layout_height, /*layout_normal,*/ layoutColor } = useControls(
        'Layout Textures + Channels', {
            'Albedo': { image: texturePaths.layout.albedo, onChange: (v) => updateTexture('layout', 'albedo', v) },
            'Albedo II': { image: texturePaths.layout.albedo2, onChange: (v) => updateTexture('layout', 'albedo2', v)  },
            'Height': { image: texturePaths.layout.height, onChange: (v) => updateTexture('layout', 'height', v) },
            // 'Normal': { image: texturePaths.layout.normal, onChange: (v) => updateTexture('layout', 'normal', v) },
            layoutColor: { value: { r: 44, g: 44, b: 49 }, label: '*Color' },
            layout_albedo: {
                value: true,
                label: 'Albedo ch.'
            },
            layout_height: {
                value: false,
                label: 'Height ch.'
            },
            // layout_normal: {
            //     value: false,
            //     label: 'Normal ch.'
            // }
        }
    )


    const { grading_v2_doblez_albedo, grading_v2_doblez_normal, grading_v2_doblez_roughness } = useControls(
        'Doblez (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.doblez.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'doblez', 'albedo', v) } ,
            // 'Normal': { image: texturePaths.gradingV2.doblez.normal, onChange: (v) => updateGradingTexture('gradingV2', 'doblez', 'normal', v)   },
            'Roughness': { image: texturePaths.gradingV2.doblez.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'doblez', 'roughness', v)  },
            grading_v2_doblez_albedo: {
                value: true,
                label: 'Albedo ch.'
            },
            // grading_v2_doblez_normal: {
            //     value: false,
            //     label: 'Normal ch.'
            // },
            grading_v2_doblez_roughness: {
                value: true,
                label: 'Roughness ch.'
            }
        },
    )

    const { grading_v2_exterior_albedo, grading_v2_exterior_roughness } = useControls(
        'Exterior (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.exterior.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'exterior', 'albedo', v)  },
            'Roughness': { image: texturePaths.gradingV2.exterior.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'exterior', 'roughness', v)  },
            grading_v2_exterior_albedo: {
                value: true,
                label: 'Albedo ch.'
            },
            grading_v2_exterior_roughness: {
                value: true,
                label: 'Roughness ch.'
            }
        }
    )

    const { grading_v2_manchas_albedo } = useControls(
        'Manchas (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.manchas.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'manchas', 'albedo', v)  },
            grading_v2_manchas_albedo: {
                value: true,
                label: 'Albedo ch.'
            }
        }
    )

    const { grading_v2_rascado_albedo, grading_v2_rascado_normal, grading_v2_rascado_roughness } = useControls(
        'Rascado (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.rascado.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'rascado', 'albedo', v)  },
            // 'Normal': { image: texturePaths.gradingV2.rascado.normal, onChange: (v) => updateGradingTexture('gradingV2', 'rascado', 'normal', v) },
            'Roughness': { image: texturePaths.gradingV2.rascado.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'rascado', 'roughness', v) },
            grading_v2_rascado_albedo: {
                value: true,
                label: 'Albedo ch.'
            },
            // grading_v2_rascado_normal: {
            //     value: false,
            //     label: 'Normal ch.'
            // },
            grading_v2_rascado_roughness: {
                value: true,
                label: 'Roughness ch.'
            }
        }
    )

    const { grading_v2_scratches_albedo, grading_v2_scratches_normal, grading_v2_scratches_roughness } = useControls(
        'Scratches (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.scratches.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'scratches', 'albedo', v)  },
            // 'Normal': { image: texturePaths.gradingV2.scratches.normal, onChange: (v) => updateGradingTexture('gradingV2', 'scratches', 'normal', v) },
            'Roughness': { image: texturePaths.gradingV2.scratches.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'scratches', 'roughness', v) },
            grading_v2_scratches_albedo: {
                value: false,
                label: 'Albedo ch.'
            },
            // grading_v2_scratches_normal: {
            //     value: false,
            //     label: 'Normal ch.'
            // },
            grading_v2_scratches_roughness: {
                value: true,
                label: 'Roughness ch.'
            }
        }
    )


    const albedoToggles = {
        base_albedo,
        pattern_albedo,
        main_interest_albedo,
        layout_albedo,
        grading_v2_doblez_albedo,
        grading_v2_exterior_albedo,
        grading_v2_manchas_albedo,
        grading_v2_rascado_albedo,
        grading_v2_scratches_albedo
    }


    const alphaToggles = {
        base_alpha
    }

    const roughnessToggles = {
        base_roughness,
        grading_v2_doblez_roughness,
        grading_v2_exterior_roughness,
        grading_v2_rascado_roughness,
        grading_v2_scratches_roughness
    }

    const heightToggles = {
        base_height,
        main_interest_height, 
        layout_height,
    }

    const normalToggles = {
        base_normal,
        // main_interest_normal,
        // layout_normal,
        // grading_v2_doblez_normal,
        // grading_v2_rascado_normal,
        // grading_v2_scratches_normal,
    }

    
    /*useControls(
        'Grading Textures (vO - Deprecated)', {
            'Alpha': { image: texturePaths.grading.alpha, onChange: (v) => updateTexture('grading', 'alpha', v) },
            'Albedo': { image: texturePaths.grading.albedo, onChange: (v) => updateTexture('grading', 'albedo', v) },
            'Height': { image: texturePaths.grading.height, onChange: (v) => updateTexture('grading', 'height', v) },
            'Normal': { image: texturePaths.grading.normal, onChange: (v) => updateTexture('grading', 'normal', v) },
            'Roughness': { image: texturePaths.grading.roughness, onChange: (v) => updateTexture('grading', 'roughness', v) },
            'Grading Level': {
                value: 'poor',
                options: {
                    Poor: 'poor',
                    Used: 'used',
                    Good: 'good',
                    'Near Mint': 'near_mint',
                    Mint: 'mint'
                },
                onChange: (value) => {
                        setTexturePaths((prev) => ({
                            ...prev,
                            ['grading']: {
                                ...prev['grading'],
                                ['albedo']: `/textures/grading/${value}/alpha.png`,
                                ['height']: `/textures/grading/${value}/height.png`,
                                ['normal']: `/textures/grading/${value}/normal.png`,
                                ['alpha']: `/textures/grading/${value}/opacity.png`,
                                ['roughness']: `/textures/grading/${value}/roughness.png`,
                            },
                        }));
                }
            }
        }
    )*/


    useControls(
        'Fx Textures', {
            'Iridescence': { image: texturePaths.fx.iridescence, onChange: (v) => updateTexture('fx', 'iridescence', v) },
            'Iris Mask': { image: texturePaths.fx.irisMask, onChange: (v) => updateTexture('fx', 'irisMask', v) },
            'Brightness Mask': { image: texturePaths.fx.brightnessMask, onChange: (v) => updateTexture('fx', 'brightness', v) }, 
            'Shine Mask': { image: texturePaths.fx.shine, onChange: (v) => updateTexture('fx', 'shine', v) },
            'Refraction': { image: texturePaths.fx.refraction, onChange: (v) => updateTexture('fx', 'refraction', v) },
            'Transition': { image: texturePaths.fx.transition, onChange: (v) => updateTexture('fx', 'transition', v) },
            'Brightness': { image: texturePaths.fx.brightness, onChange: (v) => updateTexture('fx', 'brightness', v) },
        }
    )


    const updateTexture = (category, type, value) => {
        setTexturePaths((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: value,
            },
        }));
    };

    
    const updateGradingTexture = (category, subcategory, type, value) => {
        setTexturePaths((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [subcategory]: {
                    ...prev[category]?.[subcategory],
                    [type]: value,
                }
            },
        }));
    };



    const baseTextures = useTexture(texturePaths.base);
    const patternTexture = useTexture(texturePaths.pattern);
    const mainInterestTextures = useTexture(texturePaths.main_interest);
    const layoutTextures = useTexture(texturePaths.layout);
    const fxTextures = useTexture(texturePaths.fx);
    // Grading Textures 
    const gradingDoblez = useTexture(texturePaths.gradingV2.doblez)
    const gradingExterior = useTexture(texturePaths.gradingV2.exterior) 
    const gradingManchas = useTexture(texturePaths.gradingV2.manchas)
    const gradingRascado = useTexture(texturePaths.gradingV2.rascado)
    const gradingScratches = useTexture(texturePaths.gradingV2.scratches)



    useEffect(() => {

        if (isGameplay) {
            if (groupRef.current) {
                dragControls.current = new DragControls(
                    groupRef.current,
                    camera,
                    gl.domElement
                )
            }
    
             // Disable OrbitControls on drag start
            dragControls.current.addEventListener("dragstart", (event) => {
                orbitControls.current.enabled = false;
                const object = event.object
    
                if (!initialYRef.current.has(object.uuid)) {
                    initialYRef.current.set(object.uuid, object.position.y);
                }
            });
      
            // Re-enable OrbitControls on drag end
            dragControls.current.addEventListener("dragend", () => {
                orbitControls.current.enabled = true;
            });
    
            // Restrict movement to X/Z axes
            dragControls.current.addEventListener("drag", (event) => {
             const object = event.object; 
             const originalY = initialYRef.current.get(object.uuid);
             object.position.y = originalY;
          });
    
          return () => {
            dragControls.current.removeEventListener("dragstart", () => {});
            dragControls.current.removeEventListener("dragend", () => {});
            dragControls.current.removeEventListener("drag", () => {});
            dragControls.current.dispose();
          };   
        }


    }, [camera, gl])



    return (
        <>
            <Suspense fallback={<></>}>
                {
                    isGameplay 
                    ? 
                            mock.map((props, i) => (
                                // <DragControls  key={i}>
                                    <MainCard 
                                        key={i}
                                        ref={(el) => (groupRef.current[i] = el)}
                                        textures={{
                                            base: baseTextures,
                                            pattern: patternTexture,
                                            main_interest: mainInterestTextures,
                                            layout: layoutTextures,
                                            // grading: gradingTextures,
                                            gradingv2: {
                                                gradingDoblez, 
                                                gradingExterior, 
                                                gradingManchas, 
                                                gradingRascado, 
                                                gradingScratches
                                            },
                                            fx: fxTextures
                                        }}
                    
                                        {...props}
                                    />
                                // </DragControls>
                            ))
                    : 
                    <LayeredMaterialCard
                        textures={{
                            base: baseTextures,
                            pattern: patternTexture,
                            main_interest: mainInterestTextures,
                            layout: layoutTextures,
                            // grading: gradingTextures,
                            gradingv2: {
                                gradingDoblez, 
                                gradingExterior, 
                                gradingManchas, 
                                gradingRascado, 
                                gradingScratches
                            },
                            fx: fxTextures
                        }}
                        texturePaths={texturePaths}
                        layoutColor={layoutColor}
                        // Toggles
                        albedoToggles={albedoToggles}
                        normalToggles={normalToggles}
                        roughnessToggles={roughnessToggles}
                        alphaToggles={alphaToggles}
                        heightToggles={heightToggles} 
                    />
                }

            </Suspense>

            <OrbitControls ref={orbitControls} />
        </>
    )
}