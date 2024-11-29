
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
            albedo: '/fx/fluid.jpg',
            albedo2: '/textures/pattern/albido3.jpg',
            height: '/fx/fluid.jpg'
        },
        main_interest: {
            albedo: '/prod/main_interest/albido.png',
            // ao: '/textures/main_interest/ao.png',
            height: '/prod/main_interest/height.png',
            normal: '/prod/main_interest/normal.png'
        },
        layout: {
            albedo: '/prod/layout/albido2.png',
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
        },
        fx: {
            irisMask: '/fx/iris-mask.jpg',
            iridescence: '/fx/iris.jpg',
            brightness: '/fx/LamineCard.png',
            shine: '/prod/main_interest/ao.jpg',
            refraction: '/fx/pattern.jpg',
            transition: '/fx/brush.jpg'
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
            'Albedo I': { image: texturePaths.pattern.albedo, onChange: (v) => updateTexture('pattern', 'albedo', v) },
            'Albedo II': { image: texturePaths.pattern.albedo2, onChange: (v) => updateTexture('pattern', 'albedo2', v) },
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


    useControls(
        'Fx Textures', {
            'Iridescence': { image: texturePaths.fx.iridescence, onChange: (v) => updateTexture('fx', 'iridescence', v) },
            'Iris Mask': { image: texturePaths.fx.irisMask, onChange: (v) => updateTexture('fx', 'irisMask', v) },
            'Brightness Mask': { image: texturePaths.fx.brightness, onChange: (v) => updateTexture('fx', 'brightness', v) }, 
            'Shine Mask': { image: texturePaths.fx.shine, onChange: (v) => updateTexture('fx', 'shine', v) },
            'Refraction': { image: texturePaths.fx.refraction, onChange: (v) => updateTexture('fx', 'refraction', v) },
            'Transition': { image: texturePaths.fx.transition, onChange: (v) => updateTexture('fx', 'transition', v) }
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
    const fxTextures = useTexture(texturePaths.fx);

    if (
        !(
            baseTextures &&
            patternTexture &&
            mainInterestTextures &&
            layoutTextures &&
            gradingTextures && 
            fxTextures
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
                    fx: fxTextures
                }}
                texturePaths={texturePaths}
            />
    )
}