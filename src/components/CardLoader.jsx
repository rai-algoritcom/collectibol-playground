
import { useTexture } from "@react-three/drei";
import LayeredMaterialCard from "./Layers/LayeredMaterialCard.jsx";
import { Suspense, useMemo, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three"
import MainCard from "./Layers/MainCard.jsx";

import mock from '../data/genesis.js'
import { getCardConfigJSON } from "../data/localStorage.js";


export default function CardLoader({ controlsRef, isGameplay }) {

    const cardConfig = useMemo(() => getCardConfigJSON(), []) 

    /**
     * Blending Reusable Configs.
     */
    const renderScene = useMemo(() => new THREE.Scene(), [])
    const renderCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
    
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
            albedo: '/mobile/prod/pattern/bk.png',
            height: '/mobile/fx/fluid.jpg'
        },
        main_interest: {
            albedo: '/mobile/prod/main_interest/albido.png',
            height: '/mobile/prod/main_interest/height.png',
        },
        layout: {
            albedo: '/mobile/prod/layout/albido2.png',
            albedo2: '/mobile/prod/layout/albido2-skills.png',
            ao: '/mobile/prod/layout/ao.png',
            height: '/mobile/prod/layout/height.png',
        },
        gradingV2: {
            doblez: {
                albedo: '/mobile/prod/crop_grading/poor4/doblez_albedo.png',
                roughness: '/mobile/prod/crop_grading/poor4/doblez_roughness.png'
            },
            exterior: {
                albedo: '/mobile/prod/crop_grading/poor4/exterior_albedo.png',
                roughness: '/mobile/prod/crop_grading/poor4/exterior_roughness.png'
            },
            manchas: {
                albedo: '/mobile/prod/crop_grading/poor4/manchas_albedo.png'
            },
            rascado: {
                albedo: '/mobile/prod/crop_grading/poor4/rascado_albedo.png',
                roughness: '/mobile/prod/crop_grading/poor4/rascado_roughness.png'
            },
            scratches: {
                albedo: '/mobile/prod/crop_grading/poor4/scratches_albedo.png',
                roughness: '/mobile/prod/crop_grading/poor4/scratches_roughness.png'
            }
        },
        backside: {
            albedo: '/mobile/backside/albedo.jpg',
            roughness1: '/mobile/backside/roughness1.jpg',
            roughness2: '/mobile/backside/roughness2.jpg'
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
            'Height': { image: texturePaths.base.height, onChange: (v) => updateTexture('base', 'height', v) },
            'Normal': { image: texturePaths.base.normal, onChange: (v) => updateTexture('base', 'normal', v) },
            'Roughness': { image: texturePaths.base.roughness, onChange: (v) => updateTexture('base', 'roughness', v) }, 
            base_alpha: {
                value: cardConfig.alpha_ch.base_alpha,
                label: 'Alpha ch.'
            },
            base_height: {
                value: cardConfig.height_ch.base_height,
                label: 'Height ch.'
            },
            base_normal: {
                value: cardConfig.normal_ch.base_normal,
                label: 'Normal ch.'
            },
            base_roughness: {
                value: cardConfig.roughness_ch.base_roughness,
                label: 'Roughness ch.'
            }
    })


    const { pattern_albedo } = useControls(
        'Pattern Textures + Channels', {
            'Albedo I': { image: texturePaths.pattern.albedo, onChange: (v) => updateTexture('pattern', 'albedo', v) },
            'Albedo II': { image: texturePaths.pattern.albedo2, onChange: (v) => updateTexture('pattern', 'albedo2', v) },
            pattern_albedo: {
                value: cardConfig.albedo_ch.pattern_albedo,
                label: 'Albedo ch.'
            }
    })


    const { main_interest_albedo, main_interest_height } = useControls(
        'Main Textures + Channels', {
            'Albedo': { image: texturePaths.main_interest.albedo, onChange: (v) => updateTexture('main_interest', 'albedo', v) },
            'Height': { image: texturePaths.main_interest.height, onChange: (v) => updateTexture('main_interest', 'height', v) },
            main_interest_albedo: {
                value: cardConfig.albedo_ch.main_interest_albedo,
                label: 'Albedo ch.'
            },
            main_interest_height: {
                value: cardConfig.height_ch.main_interest_height,
                label: 'Height ch.'
            },
        }
    )


    const { layout_albedo, layout_height, layoutColor } = useControls(
        'Layout Textures + Channels', {
            'Albedo': { image: texturePaths.layout.albedo, onChange: (v) => updateTexture('layout', 'albedo', v) },
            'Albedo II': { image: texturePaths.layout.albedo2, onChange: (v) => updateTexture('layout', 'albedo2', v)  },
            'Height': { image: texturePaths.layout.height, onChange: (v) => updateTexture('layout', 'height', v) },
            layoutColor: { value: cardConfig.layout_color, label: '*Color' },
            layout_albedo: {
                value: cardConfig.albedo_ch.layout_albedo,
                label: 'Albedo ch.'
            },
            layout_height: {
                value: cardConfig.height_ch.layout_height,
                label: 'Height ch.'
            },
        }
    )


    const { grading_v2_doblez_albedo, grading_v2_doblez_roughness } = useControls(
        'Doblez (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.doblez.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'doblez', 'albedo', v) } ,
            'Roughness': { image: texturePaths.gradingV2.doblez.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'doblez', 'roughness', v)  },
            grading_v2_doblez_albedo: {
                value: cardConfig.albedo_ch.grading_v2_doblez_albedo,
                label: 'Albedo ch.'
            },
            grading_v2_doblez_roughness: {
                value: cardConfig.roughness_ch.grading_v2_doblez_roughness,
                label: 'Roughness ch.'
            }
        },
    )

    const { grading_v2_exterior_albedo, grading_v2_exterior_roughness } = useControls(
        'Exterior (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.exterior.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'exterior', 'albedo', v)  },
            'Roughness': { image: texturePaths.gradingV2.exterior.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'exterior', 'roughness', v)  },
            grading_v2_exterior_albedo: {
                value: cardConfig.albedo_ch.grading_v2_exterior_albedo,
                label: 'Albedo ch.'
            },
            grading_v2_exterior_roughness: {
                value: cardConfig.roughness_ch.grading_v2_exterior_roughness,
                label: 'Roughness ch.'
            }
        }
    )

    const { grading_v2_manchas_albedo } = useControls(
        'Manchas (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.manchas.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'manchas', 'albedo', v)  },
            grading_v2_manchas_albedo: {
                value: cardConfig.albedo_ch.grading_v2_manchas_albedo,
                label: 'Albedo ch.'
            }
        }
    )

    const { grading_v2_rascado_albedo, grading_v2_rascado_roughness } = useControls(
        'Rascado (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.rascado.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'rascado', 'albedo', v)  },
            'Roughness': { image: texturePaths.gradingV2.rascado.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'rascado', 'roughness', v) },
            grading_v2_rascado_albedo: {
                value: cardConfig.albedo_ch.grading_v2_rascado_albedo,
                label: 'Albedo ch.'
            },
            grading_v2_rascado_roughness: {
                value: cardConfig.roughness_ch.grading_v2_rascado_roughness,
                label: 'Roughness ch.'
            }
        }
    )

    const { grading_v2_scratches_albedo, grading_v2_scratches_roughness } = useControls(
        'Scratches (Grading Textures v2)', {
            'Albedo': { image: texturePaths.gradingV2.scratches.albedo, onChange: (v) => updateGradingTexture('gradingV2', 'scratches', 'albedo', v)  },
            'Roughness': { image: texturePaths.gradingV2.scratches.roughness, onChange: (v) => updateGradingTexture('gradingV2', 'scratches', 'roughness', v) },
            grading_v2_scratches_albedo: {
                value: cardConfig.albedo_ch.grading_v2_scratches_albedo,
                label: 'Albedo ch.'
            },
            grading_v2_scratches_roughness: {
                value: cardConfig.roughness_ch.grading_v2_scratches_roughness,
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
    }

    
    /*useControls(
        'Grading Textures (vO - Deprecated)', {
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

    const backsideTextures = useTexture(texturePaths.backside)

    const textures = useMemo(() => ({
        base: baseTextures,
        pattern: patternTexture,
        main_interest: mainInterestTextures,
        layout: layoutTextures,
        fx: fxTextures,
        backside: backsideTextures,
        gradingv2: {
            gradingDoblez,
            gradingExterior,
            gradingManchas,
            gradingRascado,
            gradingScratches
        }
    }), [baseTextures, patternTexture, mainInterestTextures, layoutTextures, fxTextures, backsideTextures, gradingDoblez, gradingExterior, gradingManchas, gradingRascado, gradingScratches])


    // Queue to process cards sequentally 
    // const queueRef = useRef([])
    // const [queue, setQueue] = useState([])
    // const processingCard = useRef(null)

    // const enqueue = useCallback((id) => {
    //     queueRef.current = [...queueRef.current, id]
    //     setQueue([...queueRef.current])
    // }, [])

    // const processNext = useCallback(() => {
    //     if (queueRef.current.length > 0 && !processingCard.current) {
    //         const nextCard = queueRef.current[0];
    //         processingCard.current = nextCard;
      
    //         // Remove the processed card from the queue
    //         queueRef.current = queueRef.current.slice(1);
    //         setQueue([...queueRef.current]); // Trigger React re-render
    //       } else {
    //           processingCard.current = null;
    //       }
    // }, [])

    // useEffect(() => {
    //     if (!processingCard.current && queueRef.current.length > 0) {
    //         processNext()
    //     }
    // }, [queue])

    const mit =
     [
        useTexture('/mobile/web/1.png'),
        useTexture('/mobile/web/2.png'),
        useTexture('/mobile/web/3.png'),
        useTexture('/mobile/web/4.png'),
        useTexture('/mobile/web/5.png'),
        useTexture('/mobile/web/6.png'),
        useTexture('/mobile/web/7.png'),
        useTexture('/mobile/web/8.png'),
        useTexture('/mobile/web/9.png'),
        useTexture('/mobile/web/10.png'),
        useTexture('/mobile/web/11.png'),
        useTexture('/mobile/web/12.png'),
        useTexture('/mobile/web/13.png'),
        useTexture('/mobile/web/14.png')
     ]

    return (
        <Suspense fallback={<></>}>
            {
                isGameplay 
                ? 
                    mock.map((props, i) => (
                        <MainCard 
                            key={`card-${i}`}
                            id={`card-${i}`}

                            controlsRef={controlsRef}
                            textures={textures}

                            renderScene={renderScene}
                            renderCamera={renderCamera}

                            // enqueue={enqueue}
                            // processNext={processNext}
                            // isProcessing={(id) => processingCard.current === id}
                            mainIntTexture={mit[i]}
                            {...props}
                        />
                    ))
                : 
                
                <LayeredMaterialCard
                    cardConfig={cardConfig}
                    textures={textures}
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
    )
}