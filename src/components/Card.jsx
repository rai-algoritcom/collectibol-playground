
import { useTexture } from "@react-three/drei";
import LayeredMaterialCard from "./Layers/LayeredMaterialCard.jsx";
import { useState } from "react";
import { folder, useControls } from "leva";


export default function Card() {

    const [texturePaths, setTexturePaths] = useState({
        base: {
            alpha: '/prod/base/alpha.jpg',
            albedo: '/textures/base/albido.png',
            height: '/textures/base/height.png',
            normal: '/textures/base/normal.png',
            roughness: '/textures/base/roughness.png',
        },
        pattern: {
            albedo: '/textures/pattern/albido2.png',
            height: '/textures/pattern/albido2.png'
        },
        mainInterest: {
            albedo: '/prod/main_interest/albido.png',
            // ao: '/textures/main_interest/ao.png',
            height: '/prod/main_interest/height.png',
            normal: '/prod/main_interest/normal.png'
        },
        layout: {
            albedo: '/prod/layout/albido.png',
            ao: '/prod/layout/ao.png',
            height: '/prod/layout/height.png',
            normal: '/prod/layout/normal.png',
        },
        grading: {
            albedo: '/textures/grading/poor/alpha.png',
            height: '/textures/grading/poor/height.png',
            normal: '/textures/grading/poor/normal.png',
            alpha: '/textures/grading/poor/opacity.png',
            roughness: '/textures/grading/poor/roughness.png',
        }
    })

    useControls({
        'Base Textures': folder({
            'Alpha': { value: texturePaths.base.alpha, onChange: (v) => updateTexture('base', 'alpha', v) },
            'Albedo': { value: texturePaths.base.albedo, onChange: (v) => updateTexture('base', 'albedo', v) },
            'Height': { value: texturePaths.base.height, onChange: (v) => updateTexture('base', 'height', v) },
            'Normal': { value: texturePaths.base.normal, onChange: (v) => updateTexture('base', 'normal', v) },
            'Roughness': { value: texturePaths.base.roughness, onChange: (v) => updateTexture('base', 'roughness', v) }
        })
    })

    useControls({
        'Pattern Textures': folder({
            'Albedo': { value: texturePaths.pattern.albedo, onChange: (v) => updateTexture('pattern', 'albedo', v) },
            // 'Height': { value: texturePaths.pattern.height, onChange: (v) => updateTexture('pattern', 'height', v) },
        })
    })

    useControls({
        'Main Textures': folder({
            'Albedo': { value: texturePaths.mainInterest.albedo, onChange: (v) => updateTexture('mainInterest', 'albedo', v) },
            'Height': { value: texturePaths.mainInterest.height, onChange: (v) => updateTexture('mainInterest', 'height', v) },
            'Normal': { value: texturePaths.mainInterest.normal, onChange: (v) => updateTexture('mainInterest', 'normal', v) },
        })
    })

    useControls({
        'Layout Textures': folder({
            'Albedo': { value: texturePaths.layout.albedo, onChange: (v) => updateTexture('layout', 'albedo', v) },
            'Height': { value: texturePaths.layout.height, onChange: (v) => updateTexture('layout', 'height', v) },
            'Normal': { value: texturePaths.layout.normal, onChange: (v) => updateTexture('layout', 'normal', v) },
        })
    })

    useControls({
        'Grading Textures': folder({
            'Alpha': { value: texturePaths.grading.alpha, onChange: (v) => updateTexture('grading', 'alpha', v) },
            'Albedo': { value: texturePaths.grading.albedo, onChange: (v) => updateTexture('grading', 'albedo', v) },
            'Height': { value: texturePaths.grading.height, onChange: (v) => updateTexture('grading', 'height', v) },
            'Normal': { value: texturePaths.grading.normal, onChange: (v) => updateTexture('grading', 'normal', v) },
            'Roughness': { value: texturePaths.grading.roughness, onChange: (v) => updateTexture('grading', 'roughness', v) }
        }),
    })


    useControls({
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
    })

    const updateTexture = (category, type, value) => {
        setTexturePaths((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: value,
            },
        }));
    };

    const baseTextures = useTexture(texturePaths.base);
    const patternTexture = useTexture(texturePaths.pattern);
    const mainInterestTextures = useTexture(texturePaths.mainInterest);
    const layoutTextures = useTexture(texturePaths.layout);
    const gradingTextures = useTexture(texturePaths.grading);



    return (
            <LayeredMaterialCard
                textures={{
                    base: baseTextures,
                    pattern: patternTexture,
                    main_interest: mainInterestTextures,
                    layout: layoutTextures,
                    grading: gradingTextures,
                }}
                texturePaths={texturePaths}
            />
    )
}