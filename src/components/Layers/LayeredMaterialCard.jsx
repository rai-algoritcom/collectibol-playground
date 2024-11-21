import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from 'three';
import { folder, useControls } from "leva";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";


/**
 * Vertex
 */
import standardVertexShader from '../utils/shaders/vertex/standardShader'
import glitchVertexShader from "../utils/shaders/vertex/glitchShader";
import waveVertexShader from "../utils/shaders/vertex/waveShader";
import breathVertexShader from "../utils/shaders/vertex/breathShader";
import twisterVertexShader from '../utils/shaders/vertex/twisterShader'
import pulseVertexShader from '../utils/shaders/vertex/pulseShader';
import jitterVertexShader from '../utils/shaders/vertex/jitterShader';


/**
 * Lights Fragment
 */
import standardFragmentShader from '../utils/shaders/fragments/standardShader';
import iridescenceFragmentShader from '../utils/shaders/fragments/iridescenceShader';
import brightnessFragmentShader from '../utils/shaders/fragments/brightnessShader';


/**
 * Fx Fragment
 */
import cardioFxFragmentShader from "../utils/shaders/fx/cardioShader";
import squaresFxFragmentShader from "../utils/shaders/fx/squaresShader"
import circleFxFragmentShader from "../utils/shaders/fx/circleShader"
import dankFxFragmentShader from "../utils/shaders/fx/dankShader"
import lightFxFragmentShader from "../utils/shaders/fx/lightShader"
import etherFxFragmentShader from "../utils/shaders/fx/etherShader"
import fireFxFragmentShader from "../utils/shaders/fx/fireShader"
import waveFxFragmentShader from "../utils/shaders/fx/waveShader"
import smokeFxFragmentShader from "../utils/shaders/fx/smokeShader"
import rayFxFragmentShader from "../utils/shaders/fx/rayShader"
import crystalFxFragmentShader from "../utils/shaders/fx/crystalShader"
import galaxyFxFragmentShader from "../utils/shaders/fx/galaxyShader"
import liquidFxFragmentShader from "../utils/shaders/fx/liquidShader"
import asciFxFragmentShader from "../utils/shaders/fx/asciShader"
import spinFxFragmentShader from "../utils/shaders/fx/spinShader"
import particlesFxFragmentShader from "../utils/shaders/fx/particlesShader"


/**
 * Blenders
 */
import { 
    blendNormalTextures, 
    blendAlbedoTextures, 
    blendRoughnessTextures, 
    blendHeightTextures, 
    blendAlphaTextures 
} from "../utils";


export default function LayeredMaterialCard({ textures }) {
    const { gl } = useThree(); 

    const [key, setKey] = useState(0);

    const shaderRef = useRef()
    const overlayRef = useRef()

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
            value: true,
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
            value: true,
            label: 'Layout'
        },
        grading_height: {
            value: true,
            label: 'Grading'
        }
    })

    const normalToggles = useControls('Normal Channels', {
        base_normal: {
            value: true,
            label: 'Base'
        },
        main_interest_normal: {
            value: true,
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
        return blendAlbedoTextures(gl, textures, albedoToggles);
    }, [gl, textures, albedoToggles]);

    const blendedAlphaTextures = useMemo(() => {
        return blendAlphaTextures(gl, textures, alphaToggles);
    }, [gl, textures, alphaToggles]);

    const blendedHeightTextures = useMemo(() => {
        return blendHeightTextures(gl, textures, heightToggles);
    }, [gl, textures, heightToggles]);

    const blendedRoughnessTextures = useMemo(() => {
        return blendRoughnessTextures(gl, textures, roughnessToggles);
    }, [gl, textures, roughnessToggles]);

    const blendedNormalTextures = useMemo(() => {
        return blendNormalTextures(gl, textures, normalToggles);
    }, [gl, textures, normalToggles]);


    const { roughnessIntensity, roughnessPresence } = useControls('Roughness Config.', {
        roughnessIntensity: {
            label: 'Intensity',
            value: 1.1,
            min: 0.0,
            max: 2.0,
            step: 0.1,
        },
        roughnessPresence: {
            label: 'Presence',
            value: 0.1,
            min: 0.0,
            max: 1.0,
            step: 0.1,
        },
    });

    const { normalIntensity } = useControls('Normal Config.', {
        normalIntensity: { label: 'Intensity', value: 2.0, min: 0.1, max: 5.0, step: 0.1 }
    });
    

    const { ambientLightColor, ambientLightIntensity } = useControls('Lighting Config.', {
        ambientLightColor: { value: { r: 0, g: 0, b: 0 }, label: 'Color' }, // Soft gray color
        ambientLightIntensity: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Intensity' }
    });

    const [irisTexturePath, setIrisTexturePath] = useState('/prod/main_interest/ao.jpg')
    const irisTexture = useTexture(irisTexturePath);

    const { useIridescence, iridescenceIntensity, iridescenceColor1, iridescenceColor2 } = useControls('Iridescence Fx', {
        useIridescence: { value: false, label: 'Enable' },
        iridescenceIntensity: { value: 0.0045, min: 0, max: 0.02, step: 0.0001, label: 'Intensity' },
        iridescenceColor1: { value: { r: 252, g: 102, b: 226 }, label: 'Color 1' },
        iridescenceColor2: { value: { r: 231, g: 245, b: 81 }, label: 'Color 2' },
        Mask: folder({'Texture': {
            value: irisTexturePath, onChange: (v) => setIrisTexturePath(v) ,
        }})
    });

    
    const { useBrightness, brightnessIntensity, brightnessColor } = useControls('Brightness Fx', {
        useBrightness: { value: false, label: 'Enable' },
        brightnessIntensity: { value: 0.0045, min: 0, max: 0.02, step: 0.0001, label: 'Intensity' },
        brightnessColor: { value: { r: 231, g: 245, b: 81 }, label: 'Color' },
    })

    const { useGlitch, useWave, useBreath, useTwister, usePulse, useJitter } = useControls('Animations Vertex', {
        useGlitch: { value: false, label: 'Glitch Fx' },
        useWave: { value: false, label: 'Wave Fx' },
        useBreath: { value: false, label: 'Breathe Fx' },
        useTwister: { value: false, label: 'Twist Fx' },
        usePulse: { value: false, label: 'Float Fx' },
        useJitter: { value: false, label: 'Jitter Fx' },
    })

    const alphaMaskTexture = useTexture('/prod/base/alpha.jpg')
    const { useCardio, useSquares, useCircle, useDank, useShine, useEther, useFire, useWaves, useSmoke, useRay, useCrystal, useGalaxy, useLiquid, useAsci, useSpin, useParticles } = useControls('Animations Fragment (overlay)', {
        useCardio: { value: false, label: 'Cardio Fx' },
        useSquares: { value: false, label: 'Fractal Fx' },
        useCircle: { value: false, label: 'Circle Fx' },
        useDank: { value: false, label: 'Dank Fx' },
        useShine: { value: false, label: 'Shine Fx' },
        useEther: { value: false, label: 'Ether Fx' },
        useFire: { value: false, label: 'Fire Fx' },
        useWaves: { value: false, label: 'Waves Fx' },
        useSmoke: { value: false, label: 'Smoke Fx' },
        useRay: { value: false, label: 'Ray Fx' },
        useCrystal: { value: false, label: 'Crystal Fx' },
        useGalaxy: { value: false, label: 'Galaxy Fx' },
        useLiquid: { value: false, label: 'Liquid Fx' },
        useAsci: { value: false, label: 'Ascii Fx' },
        useSpin: { value: false, label: 'Spin Fx' },
        useParticles: { value: false, label: 'Particles Fx' }
    })

    const refreshMesh = () => {
        setKey((prevKey) => prevKey + 1);
    }

    useEffect(() => {
        refreshMesh(); 
    }, [
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
        useJitter,
        usePulse,
        useTwister,
        useBreath,
        useWave,
        useGlitch,
        irisTexture,
        useBrightness,
        brightnessIntensity,
        brightnessColor,
        useIridescence,
        iridescenceIntensity,
        iridescenceColor1,
        iridescenceColor2,
        normalIntensity,
        roughnessIntensity,
        roughnessPresence,
        ambientLightColor, 
        ambientLightIntensity,
        blendedAlbedoTextures,
        blendedAlphaTextures,
        blendedHeightTextures,
        blendedRoughnessTextures,
        blendedNormalTextures
    ])


    useFrame((state) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
        }

        if (overlayRef.current) {
            overlayRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
        }
    })

    return (
        <>
            <mesh key={`main-${key}`}> 
                <planeGeometry args={[2, 3, 120, 120]} />
                {
                        // <meshPhysicalMaterial 
                        //     map={blendedAlbedoTextures}
                        //     alphaMap={blendedAlphaTextures}
                        //     displacementMap={blendedHeightTextures}
                        //     roughnessMap={blendedRoughnessTextures}
                        //     displacementScale={0.05}
                        //     side={THREE.DoubleSide}
                        //     transparent={true}
                        // />
                        
                        <shaderMaterial
                            ref={shaderRef}
                            needsUpdate={true}
                            uniformsNeedUpdate={true}
                            uniforms={{
                                albedoMap: { value: blendedAlbedoTextures },
                                alphaMap: { value: blendedAlphaTextures },
                                heightMap: { value: blendedHeightTextures },
                                roughnessMap: { value: blendedRoughnessTextures },
                                normalMap: { value: blendedNormalTextures },
                                iridescenceMask: { value: irisTexture },
                                displacementScale: { value: 0.025 },
                                normalIntensity: { value: normalIntensity }, 
                                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                                ambientLightColor: { value: ambientLightColor }, 
                                ambientLightIntensity: { value: ambientLightIntensity },
                                cameraPosition: { value: new THREE.Vector3(0, 0, 5) },
                                roughnessIntensity: { value: roughnessIntensity },
                                roughnessPresence: { value: roughnessPresence },
                                useIridescence: { value: useIridescence }, 
                                iridescenceIntensity: { value: iridescenceIntensity },
                                iridescenceColor1: { value: iridescenceColor1 }, 
                                iridescenceColor2: { value: iridescenceColor2 },
                                useBrightness: { value: useBrightness  },
                                brightnessIntensity: { value: brightnessIntensity },
                                brightnessColor1: { value: brightnessColor },
                                brightnessColor2: { value: iridescenceColor1 },
                                uTime: { value: 0.0 },
                                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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
                                : standardVertexShader
                                }
                            fragmentShader={
                                useIridescence 
                                ? 
                                iridescenceFragmentShader 
                                : useBrightness 
                                ? 
                                brightnessFragmentShader 
                                : standardFragmentShader
                            }
                            transparent={true}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                    />
                }
            </mesh>
            { (useCardio || useSquares || useCircle || useDank || useShine || useEther || useFire || useWaves || useSmoke || useRay || useCrystal || useGalaxy || useLiquid || useAsci || useSpin || useParticles) && (
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
                            : cardioFxFragmentShader
                        }
                        uniforms={{
                            uTime: { value: 0.0 },
                            uAlphaMask: { value: alphaMaskTexture },
                            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                        }}
                        side={THREE.DoubleSide}
                        transparent={true}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}
        </>
    )
}