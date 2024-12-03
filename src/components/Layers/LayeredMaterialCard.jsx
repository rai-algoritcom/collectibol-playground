import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from 'three';
import { button, useControls } from "leva";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import gsap from "gsap";


/**
 * Vertex
 */
import standardVertexShader from '../../shaders/vertex/standardShader.glsl'
import foldingVertexShader from '../../shaders/vertex/foldingShader.glsl'

import glitchVertexShader from "../../shaders/vertex/glitchShader.glsl";
import waveVertexShader from "../../shaders/vertex/waveShader.glsl";
import breathVertexShader from "../../shaders/vertex/breathShader.glsl";
import twisterVertexShader from '../../shaders/vertex/twisterShader.glsl'
import pulseVertexShader from '../../shaders/vertex/pulseShader.glsl';
import jitterVertexShader from '../../shaders/vertex/jitterShader.glsl';
import noiseVertexShader from '../../shaders/vertex/noiseShader.glsl'
import clothVertexShader from '../../shaders/vertex/clothShader.glsl'


/**
 * Lights Fragment
 */
import standardFragmentShader from '../../shaders/fragments/standardShader.glsl';
import iridescenceFragmentShader from '../../shaders/fragments/iridescenceShader.glsl';
import brightnessFragmentShader from '../../shaders/fragments/brightnessShader.glsl';
import shineFragmentShader from '../../shaders/fragments/shineShader.glsl'
// import transitionFragmentShader from '../../shaders/fragments/transitionShader.glsl';
import newTransitionFragmentShader from '../../shaders/fragments/newTransitionShader.glsl'
import refractionFragmentShader from '../../shaders/fragments/refractionShader.glsl'

/**
 * Fx Fragment
 */
import cardioFxFragmentShader from "../../shaders/fx/cardioShader.glsl";
import squaresFxFragmentShader from "../../shaders/fx/squaresShader.glsl"
import circleFxFragmentShader from "../../shaders/fx/circleShader.glsl"
import dankFxFragmentShader from "../../shaders/fx/dankShader.glsl"
import lightFxFragmentShader from "../../shaders/fx/lightShader.glsl"
import etherFxFragmentShader from "../../shaders/fx/etherShader.glsl"
import fireFxFragmentShader from "../../shaders/fx/fireShader.glsl"
import waveFxFragmentShader from "../../shaders/fx/waveShader.glsl"
import smokeFxFragmentShader from "../../shaders/fx/smokeShader.glsl"
import rayFxFragmentShader from "../../shaders/fx/rayShader.glsl"
import crystalFxFragmentShader from "../../shaders/fx/crystalShader.glsl"
import galaxyFxFragmentShader from "../../shaders/fx/galaxyShader.glsl"
import liquidFxFragmentShader from "../../shaders/fx/liquidShader.glsl"
import asciFxFragmentShader from "../../shaders/fx/asciShader.glsl"
import spinFxFragmentShader from "../../shaders/fx/spinShader.glsl"
import particlesFxFragmentShader from "../../shaders/fx/particlesShader.glsl"
import blobsFxFragmentShader from "../../shaders/fx/blobsShader.glsl"
import grassFxFragmentShader from "../../shaders/fx/grassShader.glsl"


/**
 * Blenders
 */
import { 
    blendNormalTXs, 
    blendAlbedoTXs, 
    blendRoughnessTXs, 
    blendHeightTXs, 
    blendAlphaTXs, 
} from "../../utils";

import { downloadJSON, normalizeAngle, takeScreenshot } from "../../utils/helpers";

import Stats from "three/examples/jsm/libs/stats.module.js";
import SkillLabel from "./SkillLabel";



const stats = Stats();
document.body.appendChild(stats.dom);


export default function LayeredMaterialCard({ textures, texturePaths, layoutColor }) {
    const { gl, scene, camera } = useThree(); 

    const [key, setKey] = useState(0);

    const planeRef = useRef()
    const shaderRef = useRef()
    const overlayRef = useRef()

    const [jsonCfg, setJsonCfg] = useState()
    const [animationTrigger, setAnimationTrigger] = useState('rotation')

    const albedoToggles = useControls('Albedo Channels', {
        base_albedo: {
            value: true,
            label: 'Base'
        },
        pattern_albedo: {
            value: true,
            label: 'Pattern'
        },
        main_interest_albedo: {
            value: true,
            label: 'Main'
        },
        layout_albedo: {
            value: true,
            label: 'Layout'
        },
        grading_albedo: {
            value: true,
            label: 'Grading'
        }
    })


    const alphaToggles = useControls('Alpha Channels', {
        base_alpha: {
            value: true,
            label: 'Base'
        },
        grading_alpha: {
            value: true,
            label: 'Grading'
        }
    })

    const roughnessToggles = useControls('Roughness Channels', {
        base_roughness: {
            value: true,
            label: 'Base'
        },
        grading_roughness: {
            value: true,
            label: 'Grading'
        }
    })

    const heightToggles = useControls('Height Channels', {
        base_height: {
            value: false,
            label: 'Base'
        },
        pattern_height: {
            value: false,
            label: 'Pattern'
        },
        main_interest_height: {
            value: true,
            label: 'Main'
        },
        layout_height: {
            value: false,
            label: 'Layout'
        },
        grading_height: {
            value: false,
            label: 'Grading'
        }
    })

    const normalToggles = useControls('Normal Channels', {
        base_normal: {
            value: true,
            label: 'Base'
        },
        main_interest_normal: {
            value: false,
            label: 'Main'
        },
        layout_normal: {
            value: false,
            label: 'Layout'
        },
        grading_normal: {
            value: true,
            label: 'Grading'
        }
    })



    // Blended Textures
    const blendedAlbedoTextures = useMemo(() => {
        return blendAlbedoTXs(gl, textures, albedoToggles, false, false, layoutColor);
    }, [gl, textures, albedoToggles, layoutColor]);

    // const blendedAlbedo2Textures = useMemo(() => {
    //     return blendAlbedoTXs(gl, textures, albedoToggles, true, false, layoutColor);
    // }, [gl, textures, albedoToggles, layoutColor])

    const blendedAlbedo3Textures = useMemo(() => {
        return blendAlbedoTXs(gl, textures, albedoToggles, false, true, layoutColor);
    }, [gl, textures, albedoToggles, layoutColor])

    const blendedAlphaTextures = useMemo(() => {
        return blendAlphaTXs(gl, textures, alphaToggles);
    }, [gl, textures, alphaToggles]);

    const blendedHeightTextures = useMemo(() => {
        return blendHeightTXs(gl, textures, heightToggles);
    }, [gl, textures, heightToggles]);

    const blendedRoughnessTextures = useMemo(() => {
        return blendRoughnessTXs(gl, textures, roughnessToggles);
    }, [gl, textures, roughnessToggles]);

    const blendedNormalTextures = useMemo(() => {
        return blendNormalTXs(gl, textures, normalToggles);
    }, [gl, textures, normalToggles]);

    const blendedNormalTexturesIris = useMemo(() => {
        return blendNormalTXs(gl, textures, {...normalToggles, /*base_normal: false*/ });
    }, [gl, textures, normalToggles]);


    const { roughnessIntensity, roughnessPresence } = useControls('Roughness Config.', {
        roughnessIntensity: {
            label: 'Intensity',
            value: 0.7,
            min: 0.0,
            max: 2.0,
            step: 0.1,
        },
        roughnessPresence: {
            label: 'Presence',
            value: 0.5,
            min: 0.0,
            max: 1.0,
            step: 0.1,
        },
    });

    const { normalIntensity } = useControls('Normal Config.', {
        normalIntensity: { label: 'Intensity', value: 1.0, min: 0.1, max: 5.0, step: 0.01 }
    });

    const { displacementScale } = useControls('Displacement Config.', {
        displacementScale: { label: 'Height Scale', value: 0.025, min: 0.0, max: 0.5, step: 0.0001 }
    })


    const {
        ambientLightColor,
        ambientLightIntensity,
        directionalLightColor,
        directionalLightIntensity,
        pointLightColor,
        pointLightIntensity,
        pointLightDecay
    } = useControls('Lighting Config. [Ambient, Directional, Point]', {
        ambientLightColor: { value: { r: 0, g: 0, b: 0 }, label: 'AL Color' },
        ambientLightIntensity: { value: 0.03, min: 0, max: 1, step: 0.001, label: 'AL Intensity' },
        directionalLightColor: { value: { r: 7, g: 7, b: 7 }, label: 'DL Color' },
        directionalLightIntensity: { value: 0.22, min: 0, max: 1, step: 0.001, label: 'DL Intensity' },
        pointLightColor: { value: { r: 121, g: 121, b: 121 }, label: 'PL Color' },
        pointLightIntensity: { value: 0.0, min: 0, max: 2, step: 0.001, label: 'PL Intensity' },
        pointLightDecay: { value: 0.0, min: 0, max: 2, step: 0.001, label: 'PL Decay' },
    })
    


    const { useBrightness, brightnessIntensity, brightnessColor1, brightnessColor2 } = useControls('Brightness Fx', {
        useBrightness: { value: false, label: 'Enable' },
        brightnessIntensity: { value: 0.005, min: 0, max: 0.02, step: 0.0001, label: 'Intensity' },
        brightnessColor1: { value: { r: 7, g: 7, b: 7 }, label: 'Color 1' },
        brightnessColor2: { value: { r: 79, g: 79, b: 79 }, label: 'Color 2' },
    });


    const { useIridescence, iridescenceIntensity } = useControls('Iridescence Fx', {
        useIridescence: { value: true, label: 'Enable' },
        iridescenceIntensity: { value: 0.99, min: 0, max: 4.0, step: 0.0001, label: 'Intensity' },
    });

    

    const { useShiney, shineyIntensity, shineyColor } = useControls('Shine Fx', {
        useShiney: { value: false, label: 'Enable' },
        shineyIntensity: { value: 0.0045, min: 0, max: 0.02, step: 0.0001, label: 'Intensity' },
        shineyColor: { value: { r: 231, g: 245, b: 81 }, label: 'Color' },
    })



    const { useRefraction, refractionIntensity, stripesVisible } = useControls('Refraction Fx', {
        useRefraction: { value: false, label: 'Enable' },
        stripesVisible: { value: false, label: 'Stripes' },
        refractionIntensity: { value: 1.0, min: 0, max: 1.0, step: 0.001, label: 'Intensity' },
    })



    const { useTransition, transitionSpeed } = useControls('Transition Fx', {
        useTransition: { value: false, label: 'Enable' },
        transitionSpeed: { value: 0.8, min: 0, max: 3, label: 'Speed' },
    })


    const { useFolding, foldIntensity, foldX, foldY, foldRotation } = useControls('Folding Fx', { 
        useFolding: { value: false, label: 'Enable' },
        foldIntensity: { value: 0.65, min: 0, max: 2, step: 0.01, label: 'Intensity' },
        foldX: { value: 0.8, min: -1.5, max: 1.5, step: 0.01, label: 'Position X' },
        foldY: { value: 1.43, min: -1.5, max: 1.5, step: 0.01, label: 'Position Y' },
        foldRotation: { value: 0.12, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' }
    })
    

    const { useGlitch, useWave, useBreath, useTwister, usePulse, useJitter, useNoise, useCloth } = useControls('Animations Vertex', {
        useGlitch: { value: false, label: 'Glitch Fx' },
        useWave: { value: false, label: 'Wave Fx' },
        useBreath: { value: false, label: 'Breathe Fx' },
        useTwister: { value: false, label: 'Twist Fx' },
        usePulse: { value: false, label: 'Float Fx' },
        useJitter: { value: false, label: 'Jitter Fx' },
        useNoise: { value: false, label: 'Noise Fx' },
        useCloth: { value: false, label: 'Cloth Fx' }
    })


    const { useCardio, useSquares, useCircle, useDank, useShine, useEther, useFire, useWaves, useSmoke, useRay, useCrystal, useGalaxy, useLiquid, useAsci, useSpin, useParticles, useBlobs, useGrass } = useControls('Animations Fragment (overlay)', {
        '*Trigger': { options: { rotation: 'rotation', time: 'time' }, onChange: (v) => setAnimationTrigger(v), value: 'rotation' },
        useCardio: { value: false, label: 'Cardio Fx' },
        useSquares: { value: false, label: 'Fractal Fx' },
        useCircle: { value: false, label: 'Circle Fx' },
        useDank: { value: false, label: 'Dank Fx' },
        useShine: { value: false, label: 'Shine Fx' },
        useEther: { value: false, label: 'Ether Fx' },
        useFire: { value: false, label: 'Fire Fx' },
        useWaves: { value: false, label: 'Waves Fx' },
        useSmoke: { value: false, label: 'Smoke Fx' },
        useRay: { value: false, label: '[!] Ray Fx' },
        useCrystal: { value: false, label: 'Crystal Fx' },
        useGalaxy: { value: false, label: 'Galaxy Fx' },
        useLiquid: { value: false, label: 'Liquid Fx' },
        useAsci: { value: false, label: 'Ascii Fx' },
        useSpin: { value: false, label: 'Spin Fx' },
        useParticles: { value: false, label: '[!] Particles Fx' },
        useBlobs: { value: false, label: 'Blobs Fx' },
        useGrass: { value: false, label: 'Grass Fx' }
    })




    const { fontColor, fontSize, maxWidth, lineHeight, letterSpacing, textContent } = useControls('Text Overlay', {
        fontColor: { value: "#ffffff", label: 'Color' },
        fontSize: { value: .16, min: 0, max: 1, label: 'Font Size' },
        maxWidth: { value: 1, min: 1, max: 5, label: 'Max Width' },
        lineHeight: { value: 0.75, min: 0.1, max: 10 , label: 'Line Height' },
        letterSpacing: { value: -0.08, min: -0.5, max: 1, label: 'Letter Spacing' },
        textContent: { value: '', label: 'Content'}
    })


    useControls({
        'Snapshot .jpg': button(() => takeScreenshot(gl, scene, camera, planeRef.current)),
        'Snapshot .png': button(() => takeScreenshot(gl, scene, camera, planeRef.current, true))
    }, [scene])


    useControls({
        'Download JSON': button(() => downloadJSON(jsonCfg))
    }, [jsonCfg])
    


    const refreshMesh = () => {
        setKey((prevKey) => prevKey + 1);
    }



    useEffect(() => {

        const cfg =
            {
                textures: texturePaths,
                albedo_ch: albedoToggles, 
                alpha_ch: alphaToggles,
                roughness_ch: roughnessToggles,
                height_ch: heightToggles, 
                normal_ch: normalToggles,
                roughness_intensity: roughnessIntensity,
                roughness_presence: roughnessPresence,
                normal_intensity: normalIntensity,
                displacement_scale: displacementScale,
                lights: {
                    ambient_light_color: ambientLightColor,
                    ambient_light_intensity: ambientLightIntensity,
                    directional_light_color: directionalLightColor,
                    directional_light_intensity: directionalLightIntensity,
                    point_light_color: pointLightColor,
                    point_light_intensity: pointLightIntensity,
                    point_light_decay: pointLightDecay
                },
                brightness: {
                    brightness_intensity: brightnessIntensity,
                    use_brightness: useBrightness,
                    brightness_color_1: brightnessColor1,
                    brightness_color_2: brightnessColor2
                },
                iridescence: {
                    use_iridescence: useIridescence, 
                    iridescence_intensity: iridescenceIntensity
                },
                shine: {
                    shine_intensity: shineyIntensity,
                    use_shine: useBrightness ? false : useRefraction ? false : useShiney,
                    shine_color: shineyColor
                },
                refraction: {
                    refraction_intensity: refractionIntensity,
                    use_refraction: useRefraction,
                    stripes_visible: stripesVisible
                },
                transition: {
                    transition_speed: transitionSpeed,
                    use_transition: useBrightness ? false : useShiney ? false : useRefraction ? false : useTransition
                },
                folding: {
                    use_folding: useFolding,
                    folding_intensity: foldIntensity,
                    folding_x: foldX,   
                    folding_y: foldY,
                    folding_rotation: foldRotation
                },
                text_overlay: {
                    font_color: fontColor,
                    font_size: fontSize,
                    max_widt: maxWidth,
                    line_height: lineHeight, 
                    letter_spacing: letterSpacing, 
                    text_content: textContent
                },
                vertex_fx: {
                    id: useGlitch 
                    ? 
                    'glitch' 
                    : useWave 
                    ? 
                    'wave' 
                    : useBreath
                    ? 
                    'breath'
                    : useTwister
                    ?
                    'twister'
                    : usePulse
                    ?
                    'float'
                    : useJitter
                    ? 
                    'jitter'
                    : useNoise 
                    ? 
                    'noise'
                    : useCloth
                    ? 'cloth'
                    : 'none'
                },
                fragment_fx: {
                    trigger: animationTrigger,
                    id: useCircle 
                    ?
                    'circle'
                    : useSquares 
                    ?
                    'fractal'
                    : useDank
                    ? 
                    'dank'
                    : useShine
                    ?
                    'shine'
                    : useEther
                    ?
                    'ether'
                    : useFire
                    ?
                    'fire'
                    : useWaves
                    ?
                    'waves'
                    : useSmoke 
                    ?
                    'smoke'
                    : useRay 
                    ?
                    'ray'
                    : useCrystal 
                    ?
                    'crystal'
                    : useGalaxy 
                    ?
                    'galaxy'
                    : useLiquid 
                    ? 
                    'liquid'
                    : useAsci 
                    ?
                    'asci'
                    : useSpin 
                    ?
                    'spin'
                    : useParticles 
                    ? 
                    'particles'
                    : useCardio 
                    ? 
                    'cardio'
                    : useBlobs
                    ? 
                    'blobs'
                    : useGrass
                    ? 
                    'grass'
                    : 'none'
                }
            }

        refreshMesh(); 

        setJsonCfg(cfg)

        return () => {
            if (shaderRef.current) {
                if (shaderRef.current.uniforms) {
                    // Dispose any texture-based uniforms
                    Object.values(shaderRef.current.uniforms).forEach((uniform) => {
                        if (uniform && uniform.value && uniform.value.dispose) {
                            uniform.value.dispose();
                        }
                    });
                }
                shaderRef.current.dispose()
                shaderRef.current = null
            }
            if (overlayRef.current) {
                if (overlayRef.current.uniforms) {
                    // Dispose any texture-based uniforms
                    Object.values(overlayRef.current.uniforms).forEach((uniform) => {
                        if (uniform && uniform.value && uniform.value.dispose) {
                            uniform.value.dispose();
                        }
                    });
                }
                overlayRef.current.dispose()
                overlayRef.current = null
            }
            if (planeRef.current) {
                if (planeRef.current.geometry) {
                    planeRef.current.geometry.dispose(); // Dispose geometry explicitly
                }
                planeRef.current = null
            }

            // Dispose Textures
            const disposeTexture = (texture) => {
                if (texture && texture.dispose) {
                    texture.dispose();
                }
            };
            [
                blendedAlbedoTextures,
                // blendedAlbedo2Textures,
                blendedAlbedo3Textures,
                blendedAlphaTextures,
                blendedHeightTextures,
                blendedRoughnessTextures,
                blendedNormalTextures,
                blendedNormalTexturesIris,
                textures.fx
            ].forEach(disposeTexture);
        
            // Additional cleanups for textures if applicable
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.geometry?.dispose();
                    child.material?.dispose();
                }
            });
        }
    }, [
        animationTrigger,
        // Fragment FX
        useGrass,
        useBlobs,
        useParticles,
        useSpin,
        useAsci,
        useLiquid,
        useGalaxy,
        useCrystal,
        useRay,
        useSmoke,
        useWaves,
        useFire,
        useEther,
        useShine,
        useDank,
        useCircle,
        useSquares,
        useCardio,
        // Vertex FX
        useCloth,
        useNoise,
        useJitter,
        usePulse,
        useTwister,
        useBreath,
        useWave,
        useGlitch,
        // Shine
        useShiney,
        shineyIntensity,
        shineyColor,
        // Brightness
        useBrightness,
        brightnessIntensity,
        brightnessColor1,
        brightnessColor2,
        // Iridescence
        useIridescence,
        iridescenceIntensity,
        // Refraction 
        useRefraction,
        stripesVisible,
        refractionIntensity,
        // Transition, 
        useTransition, 
        transitionSpeed,
        // Rugosity
        normalIntensity,
        roughnessIntensity,
        roughnessPresence,
        // Height 
        displacementScale,
        // Blending
        blendedAlbedoTextures,
        // blendedAlbedo2Textures,
        blendedAlbedo3Textures,
        blendedAlphaTextures,
        blendedHeightTextures,
        blendedRoughnessTextures,
        blendedNormalTextures,
        textures.fx,
        // Lights
        ambientLightColor,
        ambientLightIntensity,
        directionalLightColor,
        directionalLightIntensity,
        pointLightColor,
        pointLightIntensity,
        pointLightDecay,
        // Folding
        useFolding, 
        foldIntensity, 
        foldX, 
        foldY, 
        foldRotation,
        // Text overlay 
        fontColor, 
        fontSize, 
        maxWidth, 
        lineHeight, 
        letterSpacing, 
        textContent
    ])


    let lastAngle = 0; // Keep track of the last angle


    useFrame((state) => {

        stats.update();

        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            shaderRef.current.uniforms.foldIntensity.value = foldIntensity;
            shaderRef.current.uniforms.foldPosition.value.set(foldX, foldY);
            shaderRef.current.uniforms.foldRotationZ.value = foldRotation;
        }

        if (overlayRef.current) {
            overlayRef.current.uniforms.foldIntensity.value = foldIntensity;
            overlayRef.current.uniforms.foldPosition.value.set(foldX, foldY);
            overlayRef.current.uniforms.foldRotationZ.value = foldRotation;
        }

        if (planeRef.current && camera && shaderRef.current) {
            const cameraToMesh = new THREE.Vector3();
            cameraToMesh.subVectors(planeRef.current.getWorldPosition(new THREE.Vector3()), camera.position).normalize();
            
            const angle = Math.atan2(cameraToMesh.x, cameraToMesh.z)
            const smoothAngle = normalizeAngle(angle, lastAngle)
            
            if (overlayRef.current) {
                if (animationTrigger === 'rotation') {
                    overlayRef.current.uniforms.uTime.value = smoothAngle 
                } else {
                    overlayRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
                }
            }

            shaderRef.current.uniforms.uRotation.value = smoothAngle * 3
            lastAngle = smoothAngle
        }
    })


    const hoverState = (hovered) => {
        if (shaderRef.current) {
            if (hovered) {
                gsap.to(shaderRef.current.uniforms.uHoverState, {
                    duration: transitionSpeed,
                    value: 1
                })
            } else {
                gsap.to(shaderRef.current.uniforms.uHoverState, {
                    duration: transitionSpeed,
                    value: 0
                })
            }
        }
    }

    return (
        <group>
            <mesh 
                ref={planeRef}
                key={`main-${key}`} 
                onPointerOut={() => hoverState(false) } 
                onPointerOver={() => hoverState(true) }
                onPointerDown={() => hoverState(true)}
                onPointerUp={() => hoverState(false)}
            > 
                <planeGeometry args={[2, 3, 120, 120]} />
                {
                        <shaderMaterial
                            ref={shaderRef}
                            needsUpdate={true}
                            uniformsNeedUpdate={true}
                            uniforms={{
              
                                albedoMap2: { value: blendedAlbedoTextures },
                                albedoMap: { value: blendedAlbedo3Textures /*blendedAlbedo2Textures*/ },
                                alphaMap: { value: blendedAlphaTextures },
                                heightMap: { value: blendedHeightTextures },
                                roughnessMap: { value: blendedRoughnessTextures },
                                normalMap: { value: useIridescence ? blendedNormalTexturesIris : useBrightness ? blendedNormalTexturesIris : blendedNormalTextures },
                                fxMask: { value: useIridescence ? textures.fx.irisMask : useBrightness ? textures.fx.brightness : textures.fx.shine },
                                iridescenceMask: { value: textures.fx.iridescence },

                                gradientMap: { value: textures.fx.refraction  },
                                refractionIntensity: { value: refractionIntensity },
                                stripesVisible: { value: stripesVisible },

                                uDisp: { value: textures.fx.transition },
                                uHoverState: { value: 0 },
                                
                                displacementScale: { value: displacementScale },
                                normalIntensity: { value: normalIntensity }, 

                                lightDirection: { value: new THREE.Vector3(0, 0, 2).normalize() },
                                cameraPosition: { value: new THREE.Vector3(0, 0, 5) },

                                /**
                                 * Folding
                                 */
                                foldIntensity: { value: 0.25 },
                                foldPosition: { value: new THREE.Vector2(0.0, 0.0) },
                                foldRotationZ: { value: 0.0 },

                                /**
                                 * Lights
                                 */
                                // Ambient Light 
                                ambientLightColor: { value: ambientLightColor },
                                ambientLightIntensity: { value: ambientLightIntensity },
                                // Directional Light 
                                directionalLightColor: { value: directionalLightColor },
                                directionalLightIntensity: { value: directionalLightIntensity },
                                // Point Light 
                                pointLightColor: { value: pointLightColor },
                                pointLightIntensity: { value: pointLightIntensity },
                                pointLightPosition: { value: new THREE.Vector3(0, 0, 10) },
                                pointLightDecay: { value: pointLightDecay },

                                roughnessIntensity: { value: roughnessIntensity },
                                roughnessPresence: { value: roughnessPresence },

                                useIridescence: { value: useIridescence }, 
                                iridescenceIntensity: { value: iridescenceIntensity },

                                useBrightness: { value: useBrightness }, 
                                brightnessIntensity: { value: brightnessIntensity },
                                brightnessColor1: { value: brightnessColor1 }, 
                                brightnessColor2: { value: brightnessColor2 },

                                useShine: { value: useShiney  },
                                shineIntensity: { value: shineyIntensity },
                                shineColor1: { value: shineyColor },
                                shineColor2: { value: brightnessColor1 },

                                uTime: { value: 0.0 },
                                uRotation: { value: 0.0 },
                                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

                                environmentIntensity: { value: 1.0 }, // Adjust as needed
                                environmentColor: { value: new THREE.Color(0xffffff) }, // White light
                            }}
                            vertexShader={
                                useGlitch 
                                ? 
                                glitchVertexShader 
                                : useWave 
                                ? 
                                waveVertexShader 
                                : useBreath
                                ? 
                                breathVertexShader
                                : useTwister
                                ?
                                twisterVertexShader
                                : usePulse
                                ?
                                pulseVertexShader
                                : useJitter
                                ? 
                                jitterVertexShader
                                : useNoise 
                                ? 
                                noiseVertexShader
                                : useCloth
                                ? 
                                clothVertexShader
                                : useFolding
                                ? 
                                foldingVertexShader
                                : 
                                standardVertexShader
                                }
                            fragmentShader={
                                useRefraction
                                ? 
                                refractionFragmentShader
                                : useBrightness 
                                ? 
                                brightnessFragmentShader 
                                : useIridescence
                                ?
                                iridescenceFragmentShader
                                : useShiney 
                                ? 
                                shineFragmentShader 
                                : useTransition
                                ?
                                newTransitionFragmentShader // transitionFragmentShader
                                : 
                                standardFragmentShader
                            }
                            transparent={true}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                    />
                }
            </mesh>
            
            {(useCardio || useSquares || useCircle || useDank || useShine || useEther || useFire || useWaves || useSmoke || useRay || useCrystal || useGalaxy || useLiquid || useAsci || useSpin || useParticles || useBlobs || useGrass) && (
                <mesh position={[0, 0, .005]} key={`overlay-${key}`} >
                    <planeGeometry args={[2, 3, 120, 120]} />
                    <shaderMaterial
                        ref={overlayRef} 
                        vertexShader={
                            useGlitch 
                                ? 
                                glitchVertexShader 
                                : useWave 
                                ? 
                                waveVertexShader 
                                : useBreath
                                ? 
                                breathVertexShader
                                : useTwister
                                ?
                                twisterVertexShader
                                : usePulse
                                ?
                                pulseVertexShader
                                : useJitter
                                ? 
                                jitterVertexShader
                                : useNoise
                                ? 
                                noiseVertexShader
                                : useCloth
                                ? 
                                clothVertexShader
                                : useFolding 
                                ?
                                foldingVertexShader
                                : standardVertexShader
                        }
                        fragmentShader={
                            useCircle 
                            ?
                            circleFxFragmentShader
                            : useSquares 
                            ?
                            squaresFxFragmentShader
                            : useDank
                            ? 
                            dankFxFragmentShader
                            : useShine
                            ?
                            lightFxFragmentShader
                            : useEther
                            ?
                            etherFxFragmentShader
                            : useFire
                            ?
                            fireFxFragmentShader
                            : useWaves
                            ?
                            waveFxFragmentShader
                            : useSmoke 
                            ?
                            smokeFxFragmentShader
                            : useRay 
                            ?
                            rayFxFragmentShader
                            : useCrystal 
                            ?
                            crystalFxFragmentShader
                            : useGalaxy 
                            ?
                            galaxyFxFragmentShader
                            : useLiquid 
                            ? 
                            liquidFxFragmentShader
                            : useAsci 
                            ?
                            asciFxFragmentShader
                            : useSpin 
                            ?
                            spinFxFragmentShader
                            : useParticles 
                            ? 
                            particlesFxFragmentShader
                            : useBlobs
                            ? 
                            blobsFxFragmentShader
                            : useGrass 
                            ? 
                            grassFxFragmentShader
                            : cardioFxFragmentShader
                        }
                        uniforms={{
                            uTime: { value: 0.0 },
                            uAlphaMask: { value: textures.fx.irisMask /*textures.base.alpha*/ },
                            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                            foldIntensity: { value: 0.25 },
                            foldPosition: { value: new THREE.Vector2(0.0, 0.0) },
                            foldRotationZ: { value: 0.0 },
                        }}
                        side={THREE.DoubleSide}
                        transparent={true}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

            {<Text
                material-side={THREE.FrontSide}
                color={fontColor}
                fontSize={fontSize}
                maxWidth={maxWidth}
                lineHeight={lineHeight}
                letterSpacing={letterSpacing}
                textAlign={'center'}
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="top"
                position={[0, -1, .1]}
            >
                {textContent}
            </Text>}


            <Html
                position={[0, -.8, 0.1]}
                transform
                scale={1}
                distanceFactor={2}
                distance
                side={THREE.FrontSide}
            >
                <div style={{ padding: '1rem', width: '360px', height: 'max-content', border: '1px solid transparent'}}>

                    <SkillLabel>
                        <span>Lamine Yamal, la Revelación</span>
                    </SkillLabel>
                    <SkillLabel>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="white"
                                width="24px"
                                height="24px"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            </svg>
                            <span>Skill #1</span>
                    </SkillLabel>
                    <SkillLabel>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="white"
                                width="24px"
                                height="24px"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            </svg>
                            <span>Skill #2</span>
                    </SkillLabel>
               
                </div>
            </Html>
            
        </group>
    )
}