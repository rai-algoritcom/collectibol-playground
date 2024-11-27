
import { useTexture } from "@react-three/drei";
import LayeredMaterialCard from "./Layers/LayeredMaterialCard.jsx";
import { useState } from "react";
import { useControls } from "leva";


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
            albedo2: '/textures/pattern/albido.png',
            height: '/textures/pattern/albido2.png'
        },
        main_interest: {
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

    useControls(
        'Base Textures', {
            'Alpha': { image: texturePaths.base.alpha, onChange: (v) => updateTexture('base', 'alpha', v) },
            'Albedo': { image: texturePaths.base.albedo, onChange: (v) => updateTexture('base', 'albedo', v) },
            'Height': { image: texturePaths.base.height, onChange: (v) => updateTexture('base', 'height', v) },
            'Normal': { image: texturePaths.base.normal, onChange: (v) => updateTexture('base', 'normal', v) },
            'Roughness': { image: texturePaths.base.roughness, onChange: (v) => updateTexture('base', 'roughness', v) }
    })


    useControls(
        'Pattern Textures', {
            'Albedo': { image: texturePaths.pattern.albedo, onChange: (v) => updateTexture('pattern', 'albedo', v) },
            'Albedo2': { image: texturePaths.pattern.albedo2, onChange: (v) => updateTexture('pattern', 'albedo2', v) },
            // 'Height': { image: texturePaths.pattern.height, onChange: (v) => updateTexture('pattern', 'height', v) },
    })


    useControls(
        'Main Textures', {
            'Albedo': { image: texturePaths.main_interest.albedo, onChange: (v) => updateTexture('main_interest', 'albedo', v) },
            'Height': { image: texturePaths.main_interest.height, onChange: (v) => updateTexture('main_interest', 'height', v) },
            'Normal': { image: texturePaths.main_interest.normal, onChange: (v) => updateTexture('main_interest', 'normal', v) },
        }
    )


    useControls(
        'Layout Textures', {
            'Albedo': { image: texturePaths.layout.albedo, onChange: (v) => updateTexture('layout', 'albedo', v) },
            'Height': { image: texturePaths.layout.height, onChange: (v) => updateTexture('layout', 'height', v) },
            'Normal': { image: texturePaths.layout.normal, onChange: (v) => updateTexture('layout', 'normal', v) },
        }
    )

    
    useControls(
        'Grading Textures', {
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

    const baseTextures = useTexture(texturePaths.base);
    const patternTexture = useTexture(texturePaths.pattern);
    const mainInterestTextures = useTexture(texturePaths.main_interest);
    const layoutTextures = useTexture(texturePaths.layout);
    const gradingTextures = useTexture(texturePaths.grading);

    if (
        !(
            baseTextures &&
            patternTexture &&
            mainInterestTextures &&
            layoutTextures &&
            gradingTextures
        )
    ) {
        return  <></>
    }

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