import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { button, useControls } from "leva";
import * as THREE from 'three';
import gsap from "gsap";

import { Resizer, BlendFunction, KernelSize } from "postprocessing"


/**
 * Vertex
 */
import {
    standardVertexShader,
    foldingVertexShader,
    glitchVertexShader,
    waveVertexShader,
    breathVertexShader,
    twisterVertexShader,
    pulseVertexShader,
    jitterVertexShader,
    noiseVertexShader,
    clothVertexShader
} from '../../shaders/vertex/index'

/**
 * Fragment
 */
import {
    standardFragmentShader,
    iridescenceFragmentShader,
    brightnessFragmentShader,
    shineFragmentShader,
    videoFragmentShader,
    hdriFragmentShader,
    refractionFragmentShader,
    rarityFragmentShader,
    outerIridescenceFragmentShader,
    outerBrightnessFragmentShader
} from '../../shaders/fragments/index'

/**
 * Fx Fragment
 */
import {
    cardioFxFragmentShader,
    squaresFxFragmentShader,
    circleFxFragmentShader,
    dankFxFragmentShader,
    lightFxFragmentShader,
    etherFxFragmentShader,
    fireFxFragmentShader,
    waveFxFragmentShader,
    smokeFxFragmentShader,
    rayFxFragmentShader,
    crystalFxFragmentShader,
    galaxyFxFragmentShader,
    liquidFxFragmentShader,
    asciFxFragmentShader,
    spinFxFragmentShader,
    particlesFxFragmentShader,
    blobsFxFragmentShader,
    grassFxFragmentShader
} from "../../shaders/fx/index";


/**
 * Blenders
 */
import { 
    blendNormalTXs, 
    blendAlbedoTXs, 
    blendRoughnessTXs, 
    blendHeightTXs, 
    blendAlphaTXs,
    blendAlbedosBacksideZipped,
    blendRoughnessBacksideZipped,
    blendAlbedosZipped, 
} from "../../utils";

import { 
    downloadJSON, 
    normalizeAngle,
    takeScreenshot,
    getRandomPositionAndRotation 
} from "../../utils/helpers";

import FooterCard from "./FooterCard";
import SkillsCard from "./SkillsCard";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { writeStorageConfig } from "../../data/localStorage";

import { BrightnessContrast, ChromaticAberration, DepthOfField, EffectComposer, GodRays, HueSaturation } from "@react-three/postprocessing"
import { Decal, Float, Mask, useGLTF, useTexture } from "@react-three/drei";
import CollCardFooter from "./FooterCardV2";




const stats = Stats();
document.body.appendChild(stats.dom);



export default function LayeredMaterialCard({ 
    cardConfig,
    // 
    textures, 
    texturePaths, 
    layoutColor,
    //Toggles 
    albedoToggles, 
    normalToggles, 
    roughnessToggles, 
    alphaToggles, 
    heightToggles,
}) {
    const { gl, scene, camera } = useThree(); 

    const [key, setKey] = useState(0);

    const groupRef = useRef()
    const planeRef = useRef()

    const shaderRef = useRef()

    const overlayRef = useRef()
    const skillsRef = useRef()
    const footerRef = useRef()
    const glbRef = useRef()

    const [blendMode, setBlendMode] = useState(0)

    const [jsonCfg, setJsonCfg] = 
        useState(cardConfig)
    const [animationTrigger, setAnimationTrigger] = 
        useState(cardConfig.fragment_fx.trigger)

    /**
     * Randomize offset and rotation for 'Grading v2': 
     * - 'Doblez' 
     * - 'Manchas' 
     * - 'Rascado' 
     * - 'Scratches' 
     */

    const doblezRand = getRandomPositionAndRotation()
    const rascadoRand = getRandomPositionAndRotation()
    const scratchesRand = getRandomPositionAndRotation()
    const manchasRand = getRandomPositionAndRotation()

    const logoTexture = useLoader(THREE.TextureLoader, '/icons/fcb.png')

    const { posDoblez, rotDoblez } = useControls('Doblez Config.', {
        posDoblez: {
            value: doblezRand.pos,
            min: -0.1,
            max: 0.1,
            step: 0.001,
            label: 'Position'
        },
        rotDoblez: {
            value: doblezRand.rot, 
            min: 0, 
            max: Math.PI * 3,
            label: 'Rotation'
        }
    })

    const { posManchas, rotManchas } = useControls('Manchas Config.', {
        posManchas: {
            value: manchasRand.pos,
            min: -0.1,
            max: 0.1,
            step: 0.001,
            label: 'Position'
        },
        rotManchas: {
            value: manchasRand.rot,
            min: 0,
            max: Math.PI * 3,
            label: 'Rotation'
        }
    })

    const { posRascado, rotRascado } = useControls('Rascado Config.', {
        posRascado: {
            value: rascadoRand.pos,
            min: -0.1,
            max: 0.1,
            step: 0.001,
            label: 'Position'
        },
        rotRascado: {
            value: rascadoRand.rot,
            min: 0,
            max: Math.PI * 3, 
            label: 'Rotation'
        }
    })

    const { posScratches, rotScratches } = useControls('Scratches Config.', {
        posScratches: {
            value: scratchesRand.pos,
            min: -0.1,
            max: 0.1,
            step: 0.001,
            label: 'Position'
        },
        rotScratches: {
            value: scratchesRand.rot,
            min: 0,
            max: Math.PI * 3,
            label: 'Rotation'
        }
    })


    const gradingRoughnessProps = {
        doblez: {
            pos: posDoblez,
            rot: rotDoblez,
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        }
    }
    
    const gradingNormalsProps = {
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        }
    }

    const gradingAlbedoProps = {
        manchas: {
            pos: posManchas,
            rot: rotManchas
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
    }


    /**
     * Video textures
     */
    const videoElement = useMemo(() => {
        const video = document.createElement("video");
        video.src = "/clips/Lamine_clip.mov"; // Path to your video
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true; // Prevent autoplay sound issues
        video.play();
        return video;
    }, []);
    
    const videoTexture = useMemo(() => {
        return new THREE.VideoTexture(videoElement);
    }, [videoElement]);
    const { useVideoTexture, clip } = useControls("Video Texture", {
        useVideoTexture: { value: cardConfig.use_video, label: "Enable" },
        clip: { value: "/clips/Lamine_clip.mov", onChange: () => {}, label: 'Clip' }
    });
        

    /**
     * HDRI textures
     */
    // const hdriTexture = useLoader(RGBELoader, "/env/the_sky_is_on_fire_4k.hdr");
    const hdriTexture = useLoader(THREE.TextureLoader, "/env/orlando_stadium_4k.jpg");
    // hdriTexture.mapping = THREE.EquirectangularReflectionMapping;
    const { useHDRITexture, hdri } = useControls("HDRI Texture", {
        useHDRITexture: { value: cardConfig.use_hdri, label: "Enable" },
        hdri: { image: "/env/orlando_stadium_4k.jpg", onChange: () => {}, label: 'HDRI' }
    })


    /**
     * GLB textures
     */
    const glbTextureModel = useGLTF("/models/cat_compressed.glb")
    // const glbTextureModel2 = useGLTF("/models/fcb_low_polly.glb")
    const { useGLBTexture, glb } = useControls('GLB Texture', {
        useGLBTexture: { value: false, label: "Enable" },
        glb: { value: "/models/cat_compressed.glb", onChange: () => {}, label: 'GLB' }
    })


    const renderScene = useMemo(() => new THREE.Scene(), [])
    const renderCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    // Blended Textures
    const blendedAlbedoTextures = useMemo(() => {
        return  blendAlbedosZipped(
            { renderScene, renderCamera, renderer: gl },
            textures,
            false,
            layoutColor,
            gradingAlbedoProps
        )
        // return blendAlbedoTXs(gl, textures, albedoToggles, false, false, layoutColor, gradingAlbedoProps, useVideoTexture || useGLBTexture, useHDRITexture);
    }, [gl, textures, albedoToggles, layoutColor, posRascado, rotRascado, posManchas, rotManchas, posDoblez, rotDoblez, posScratches, rotScratches, useVideoTexture, useHDRITexture, useGLBTexture]);

    const blendedAlbedo3Textures = useMemo(() => {
        return  blendAlbedosZipped(
            { renderScene, renderCamera, renderer: gl },
            textures,
            true,
            layoutColor,
            gradingAlbedoProps
        )
        // return blendAlbedoTXs(gl, textures, albedoToggles, false, true, layoutColor, gradingAlbedoProps, useVideoTexture || useGLBTexture, useHDRITexture);
    }, [gl, textures, albedoToggles, layoutColor, posRascado, rotRascado, posManchas, rotManchas, posDoblez, rotDoblez, posScratches, rotScratches, useVideoTexture, useHDRITexture, useGLBTexture])



    const blendedAlbedoBacksideTextures = useMemo(() => {
        return  blendAlbedosBacksideZipped(
            { renderScene, renderCamera, renderer: gl },
            textures,
            gradingAlbedoProps
        )
    }, [gl, textures,  posRascado, rotRascado, posManchas, rotManchas, posDoblez, rotDoblez, posScratches, rotScratches ])

    const blendedRoughnessBacksideTextures = useMemo(() => {
        return blendRoughnessBacksideZipped(
            { renderScene, renderCamera, renderer: gl },
            textures,
            gradingRoughnessProps
        )
    })


    const blendedAlphaTextures = useMemo(() => {
        return blendAlphaTXs(gl, textures, alphaToggles);
    }, [gl, textures, alphaToggles]);

    const blendedAlpha2Textures = useMemo(() => {
        return blendAlphaTXs(gl, textures, alphaToggles, true)
    }, [gl, textures, alphaToggles])

    const blendedHeightTextures = useMemo(() => {
        return blendHeightTXs(gl, textures, heightToggles);
    }, [gl, textures, heightToggles]);

    const blendedRoughnessTextures = useMemo(() => {
        return blendRoughnessTXs(gl, textures, roughnessToggles, gradingRoughnessProps);
    }, [gl, textures, roughnessToggles, posRascado, rotRascado, posDoblez, rotDoblez, posScratches, rotScratches ]);

    const blendedNormalTextures = useMemo(() => {
        return blendNormalTXs(gl, textures, normalToggles, gradingNormalsProps);
    }, [gl, textures, normalToggles, posRascado, rotRascado, posDoblez, rotDoblez, posScratches, rotScratches ]);



    const { roughnessIntensity, roughnessPresence } = useControls('Roughness Config.', {
        roughnessIntensity: {
            label: 'Intensity',
            value: cardConfig.roughness_intensity,
            min: 0.0,
            max: 2.0,
            step: 0.1,
        },
        roughnessPresence: {
            label: 'Presence',
            value: cardConfig.roughness_presence,
            min: 0.0,
            max: 1.0,
            step: 0.1,
        },
    });

    const { normalIntensity } = useControls('Normal Config.', {
        normalIntensity: { 
            label: 'Intensity', 
            value: cardConfig.normal_intensity, 
            min: 0.1, 
            max: 5.0, 
            step: 0.01 
        }
    });

    const { displacementScale } = useControls('Displacement Config.', {
        displacementScale: { 
            label: 'Height Scale', 
            value: cardConfig.displacement_scale, 
            min: 0.0, 
            max: 0.5, 
            step: 0.0001 
        }
    })


    const {
        // AL
        ambientLightColor,
        ambientLightIntensity,
        // PL 1
        pointLightColor,
        pointLightIntensity,
        pointLightDecay,
        plXandY,
        plZ,
        // PL 2
        pointLightColor2,
        pointLightIntensity2,
        pointLightDecay2,
        plXandY2,
        plZ2,
    } = useControls('Lighting Config. [Ambient, Point 1, Point 2]', {
        ambientLightColor: { value: cardConfig.lights.ambient_light_color, label: 'AL Color' },
        ambientLightIntensity: { value: cardConfig.lights.ambient_light_intensity, min: 0, max: 1, step: 0.001, label: 'AL Intensity' },

        pointLightColor: { value: cardConfig.lights.point_light_color, label: 'PL1 Color' },
        pointLightIntensity: { value: cardConfig.lights.point_light_intensity, min: 0, max: 2, step: 0.001, label: 'PL1 Intensity' },
        pointLightDecay: { value: cardConfig.lights.point_light_decay, min: 0, max: 2, step: 0.001, label: 'PL1 Decay' },
        plXandY: {
            value: new THREE.Vector2(
                cardConfig.lights.point_light_pos.x,
                cardConfig.lights.point_light_pos.y
            ),
            min: -20,
            max: 20,
            step: 0.1,
            label: 'PL1 x & y'
        },
        plZ: {
            value: cardConfig.lights.point_light_pos.z,
            min: -1,
            max: 20,
            label: 'PL1 z'
        },

        pointLightColor2: { value: cardConfig.lights.point_light_color_2, label: 'PL2 Color' },
        pointLightIntensity2: { value: cardConfig.lights.point_light_intensity_2, min: 0, max: 2, step: 0.001, label: 'PL2 Intensity' },
        pointLightDecay2: { value: cardConfig.lights.point_light_decay_2, min: 0, max: 2, step: 0.001, label: 'PL2 Decay' },
        plXandY2: {
            value: new THREE.Vector2(
                cardConfig.lights.point_light_pos_2.x,
                cardConfig.lights.point_light_pos_2.y
            ),
            min: -20,
            max: 20,
            step: 0.1,
            label: 'PL2 x & y'
        },
        plZ2: {
            value: cardConfig.lights.point_light_pos_2.z,
            min: -1,
            max: 20,
            label: 'PL2 z'
        },
    })
    


    const { useBrightness, brightnessIntensity  } = useControls('Brightness Fx', {
        useBrightness: { value: cardConfig.brightness.use_brightness, label: 'Enable' },
        brightnessIntensity: { value: cardConfig.brightness.brightness_intensity, min: 0, max: 4.0, step: 0.0001, label: 'Intensity' },
    });


    const { useIridescence, iridescenceIntensity } = useControls('Iridescence Fx', {
        useIridescence: { value: cardConfig.iridescence.use_iridescence, label: 'Enable' },
        iridescenceIntensity: { value: cardConfig.iridescence.iridescence_intensity, min: 0, max: 4.0, step: 0.0001, label: 'Intensity' },
    });

    

    const { useShiney, shineyIntensity, shineyColor } = useControls('Shine Fx', {
        useShiney: { value: cardConfig.shine.use_shine, label: 'Enable' },
        shineyIntensity: { value: cardConfig.shine.shine_intensity, min: 0, max: 0.02, step: 0.0001, label: 'Intensity' },
        shineyColor: { value: cardConfig.shine.shine_color, label: 'Color' },
    })



    const { useRefraction, refractionIntensity, stripesVisible } = useControls('Refraction Fx', {
        useRefraction: { value: cardConfig.refraction.use_refraction, label: 'Enable' },
        stripesVisible: { value: cardConfig.refraction.stripes_visible, label: 'Stripes' },
        refractionIntensity: { value: cardConfig.refraction.refraction_intensity, min: 0, max: 1.0, step: 0.001, label: 'Intensity' },
    })


    
    const { useTransition, transitionSpeed } = useControls('Transition Fx', {
        useTransition: { value: cardConfig.transition.use_transition, label: 'Enable' },
        transitionSpeed: { value: cardConfig.transition.transition_speed, min: 0, max: 3, label: 'Speed' },
        'mode': {
                value: 'full',
                options: {
                    Full: 'full',
                    Skills: 'max',
                    Min: 'min'
                },
                label: '*Mode',
                onChange: (value) => { 
                    if (value == 'full') {
                        setBlendMode(0)
                    } else if (value == 'max') {
                        setBlendMode(0)
                    } else {
                        setBlendMode(1)
                    }
                    changeCardMode(value)
                }
        }
    }, [shaderRef.current])


    const { useFolding, foldIntensity, foldX, foldY, foldRotation } = useControls('Folding Fx', { 
        useFolding: { value: cardConfig.folding.use_folding, label: 'Enable' },
        foldIntensity: { value: cardConfig.folding.fold_intensity, min: 0, max: 2, step: 0.01, label: 'Intensity' },
        foldX: { value: cardConfig.folding.fold_x, min: -1.5, max: 1.5, step: 0.01, label: 'Position X' },
        foldY: { value: cardConfig.folding.fold_y, min: -1.5, max: 1.5, step: 0.01, label: 'Position Y' },
        foldRotation: { value: cardConfig.folding.fold_rotation, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' }
    })
    

    const { useGlitch, useWave, useBreath, useTwister, usePulse, useJitter, useNoise, useCloth } = useControls('Animations Vertex', {
        useGlitch: { value: cardConfig.vertex_fx.id === 'glitch', label: 'Glitch Fx' },
        useWave: { value: cardConfig.vertex_fx.id === 'wave', label: 'Wave Fx' },
        useBreath: { value: cardConfig.vertex_fx.id === 'breath', label: 'Breathe Fx' },
        useTwister: { value: cardConfig.vertex_fx.id === 'twister', label: 'Twist Fx' },
        usePulse: { value: cardConfig.vertex_fx.id === 'pulse', label: 'Float Fx' },
        useJitter: { value: cardConfig.vertex_fx.id === 'jitter', label: 'Jitter Fx' },
        useNoise: { value: cardConfig.vertex_fx.id === 'noise', label: 'Noise Fx' },
        useCloth: { value: cardConfig.vertex_fx.id === 'cloth', label: 'Cloth Fx' }
    })


    const { useCardio, useSquares, useCircle, useDank, useShine, useEther, useFire, useWaves, useSmoke, useRay, useCrystal, useGalaxy, useLiquid, useAsci, useSpin, useParticles, useBlobs, useGrass } = useControls('Animations Fragment (overlay)', {
        '*Trigger': { options: { rotation: 'rotation', time: 'time' }, onChange: (v) => setAnimationTrigger(v), value: cardConfig.fragment_fx.trigger },
        useCardio: { value: cardConfig.fragment_fx.id === 'cardio', label: 'Cardio Fx' },
        useSquares: { value: cardConfig.fragment_fx.id === 'squares', label: 'Fractal Fx' },
        useCircle: { value: cardConfig.fragment_fx.id === 'circle', label: 'Circle Fx' },
        useDank: { value: cardConfig.fragment_fx.id === 'dank', label: 'Dank Fx' },
        useShine: { value: cardConfig.fragment_fx.id === 'shine', label: 'Shine Fx' },
        useEther: { value: cardConfig.fragment_fx.id === 'ether', label: 'Ether Fx' },
        useFire: { value: cardConfig.fragment_fx.id === 'fire', label: 'Fire Fx' },
        useWaves: { value: cardConfig.fragment_fx.id === 'waves', label: 'Waves Fx' },
        useSmoke: { value: cardConfig.fragment_fx.id === 'smoke', label: 'Smoke Fx' },
        useRay: { value: cardConfig.fragment_fx.id === 'ray', label: '[!] Ray Fx' },
        useCrystal: { value: cardConfig.fragment_fx.id === 'crystal', label: 'Crystal Fx' },
        useGalaxy: { value: cardConfig.fragment_fx.id === 'galaxy', label: 'Galaxy Fx' },
        useLiquid: { value: cardConfig.fragment_fx.id === 'liquid', label: 'Liquid Fx' },
        useAsci: { value: cardConfig.fragment_fx.id === 'asci', label: 'Ascii Fx' },
        useSpin: { value: cardConfig.fragment_fx.id === 'spin', label: 'Spin Fx' },
        useParticles: { value: cardConfig.fragment_fx.id === 'particles', label: '[!] Particles Fx' },
        useBlobs: { value: cardConfig.fragment_fx.id === 'blobs', label: 'Blobs Fx' },
        useGrass: { value: cardConfig.fragment_fx.id === 'grass', label: 'Grass Fx' }
    })


    /**
     * PostProcessing
     */
    const { useDepthOfField, focusDistance, focalLength, bokehScale } = useControls('Depth of Field [Postprocessing]', {
        useDepthOfField: { value: false, label: 'Enable' },
        focusDistance: { value: 0.012, min: 0.001, max: 0.1, step: 0.001, label: 'Focus Distance' },
        focalLength: { value: 0.015, min: 0.001, max: 0.1, step: 0.001, label: 'Focal Length' },
        bokehScale: { value: 7, min: 0, max: 20, step: 0.1, label: 'Bokeh Scale'} 
    })

    const { useHueSaturation, hue, saturation } = useControls('Hue Saturation [Postprocessing]', {
        useHueSaturation: { value: false, label: 'Enable' },
        hue: { value: 0, min: -1, max: 1, step: 0.01, label: 'Hue' },
        saturation: { value: -0.15, min: -1, max: 1, step: 0.01, label: 'Saturation' },
    })

    const { useBrightnessContrast, brightness, contrast } = useControls('Brightness Contrast [Postprocessing]', {
        useBrightnessContrast: { value: false, label: 'Enable' },
        brightness: { value: 0.0, min: -1, max: 1, step: 0.01, label: 'Brightness' },
        contrast: { value: 0.035, min: -1, max: 1, step: 0.01, label: 'Contrast' },
    })

    const { useChromaticAberration, radialModulation, offset } = useControls('Chromatic Aberration [Postprocessing]', {
        useChromaticAberration: { value: false, label: 'Enable' },
        radialModulation: { value: true, label: 'Radial Modulation' },
        offset: { value: 0.0015, min: 0, max: 0.1, step: 0.0001, label: 'Offset' },
    })

    const { useGodRays, useRaysBg, raysBgColor, samples, density, weight, decay, exposure } = useControls('God Rays [Postprocessing]', {
        useGodRays: { value: false, label: 'Enable' },
        useRaysBg: { value: false, label: 'Background' },
        raysBgColor: { value: { r: 100, g: 20, b: 0 }, label: 'Background Color' },
        samples: { value: 10, min: 1, max: 100, step: 1, label: 'Samples' },
        density: { value: 0.97, min: 0, max: 1, step: 0.01, label: 'Density' },
        weight: { value: 0.5, min: 0, max: 1, step: 0.001, label: 'Weight' },
        decay: { value: 0.95, min: 0, max: 1, step: 0.001, label: 'Decay' },
        exposure: { value: 0.3, min: 0, max: 1, step: 0.001, label: 'Exposure' },
    })

    let mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 3, 120, 120),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(
                raysBgColor.r / 255,
                raysBgColor.g / 255,
                raysBgColor.b / 255
            ), 
            transparent: true,
            opacity: 1,
            alphaMap: textures.base.alpha,
        })
    )
    mesh.position.set(0, 0, -.15)
    mesh.scale.set(1.05, 1.05, 1.05)



    useControls({
        'Snapshot .jpg': button(async () => await takeScreenshot(gl, scene, camera, planeRef.current, [footerRef.current, skillsRef.current], false, useTransition && blendMode == 1)),
        'Snapshot .png': button(() => takeScreenshot(gl, scene, camera, planeRef.current, [footerRef.current, skillsRef.current], true, useTransition && blendMode == 1)),
    }, [scene, useTransition, blendMode])


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
                layout_color: layoutColor,
                albedo_ch: albedoToggles, 
                alpha_ch: alphaToggles,
                roughness_ch: roughnessToggles,
                height_ch: heightToggles, 
                normal_ch: normalToggles,
                roughness_intensity: roughnessIntensity,
                roughness_presence: roughnessPresence,
                normal_intensity: normalIntensity,
                displacement_scale: displacementScale,
                grading: {
                    roughness_props: gradingRoughnessProps,
                    normals_props: gradingNormalsProps,
                    albedo_props: gradingAlbedoProps
                },
                lights: {
                    ambient_light_color: ambientLightColor,
                    ambient_light_intensity: ambientLightIntensity,
                    point_light_color: pointLightColor,
                    point_light_intensity: pointLightIntensity,
                    point_light_decay: pointLightDecay,
                    point_light_pos: {
                        x: plXandY.x,
                        y: plXandY.y,
                        z: plZ
                    },
                    point_light_color_2: pointLightColor2,
                    point_light_intensity_2: pointLightIntensity2,
                    point_light_decay_2: pointLightDecay2,
                    point_light_pos_2: {
                        x: plXandY2.x,
                        y: plXandY2.y,
                        z: plZ2
                    }
                },
                brightness: {
                    brightness_intensity: brightnessIntensity,
                    use_brightness: useBrightness,
                },
                iridescence: {
                    use_iridescence: useIridescence, 
                    iridescence_intensity: iridescenceIntensity
                },
                shine: {
                    shine_intensity: shineyIntensity,
                    use_shine: useShiney,
                    shine_color: shineyColor
                },
                refraction: {
                    refraction_intensity: refractionIntensity,
                    use_refraction: useRefraction,
                    stripes_visible: stripesVisible
                },
                transition: {
                    transition_speed: transitionSpeed,
                    use_transition:  useTransition
                },
                folding: {
                    use_folding: useFolding,
                    fold_intensity: foldIntensity,
                    fold_x: foldX,   
                    fold_y: foldY,
                    fold_rotation: foldRotation
                },
                use_video: useVideoTexture,
                use_hdri: useHDRITexture,
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
        writeStorageConfig(cfg)

        if (!useTransition && skillsRef.current) {
            skillsRef.current.style.opacity = 1
        }

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
                blendedAlbedo3Textures,
                blendedAlphaTextures,
                blendedAlpha2Textures,
                blendedHeightTextures,
                blendedRoughnessTextures,
                blendedNormalTextures,
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
        blendedAlbedo3Textures,
        blendedAlphaTextures,
        blendedAlpha2Textures,
        blendedHeightTextures,
        blendedRoughnessTextures,
        blendedNormalTextures,
        textures.fx,
        // Lights
        ambientLightColor,
        ambientLightIntensity,
        pointLightColor,
        pointLightIntensity,
        pointLightDecay,
        pointLightColor2,
        pointLightIntensity2,
        pointLightDecay2,
        plXandY,
        plZ,
        plXandY2,
        plZ2,
        // Folding
        useFolding, 
        foldIntensity, 
        foldX, 
        foldY, 
        foldRotation,
        // 
        blendMode, 
        // 
        useVideoTexture,
        videoTexture,
        useHDRITexture,
        hdriTexture
    ])


    let lastAngle = 0; // Keep track of the last angle

    useFrame((state) => {

        stats.update();

        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            // shaderRef.current.uniforms.foldIntensity.value = foldIntensity;
            // shaderRef.current.uniforms.foldPosition.value.set(foldX, foldY);
            // shaderRef.current.uniforms.foldRotationZ.value = foldRotation;
        }


        if (overlayRef.current) {
            // overlayRef.current.uniforms.foldIntensity.value = foldIntensity;
            // overlayRef.current.uniforms.foldPosition.value.set(foldX, foldY);
            // overlayRef.current.uniforms.foldRotationZ.value = foldRotation;
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


    const changeCardMode = (mode) => {
        if (shaderRef.current && footerRef.current && useTransition) {
            if (mode == 'max') {

                gsap.to(shaderRef.current.uniforms.uHoverState, {
                    duration: transitionSpeed,
                    value: 1,
                })
                gsap.to(skillsRef.current, {
                    duration: transitionSpeed ,
                    opacity: 1,
                    delay: 0.5
                })
                
            } else if (mode == 'min') { 

                gsap.to(footerRef.current, {
                    opacity: 0,
                    duration: 0
                })
                
                gsap.to(skillsRef.current, {
                    duration: transitionSpeed,
                    opacity: 0,
                })
                gsap.to(shaderRef.current.uniforms.uHoverState, {
                    duration: transitionSpeed,
                    value: 1,
                }).then(() => {
                    gsap.to(footerRef.current, {
                        opacity: 1,
                        duration: transitionSpeed
                    })
                })

            } else if (mode == 'full')  {

                gsap.to(shaderRef.current.uniforms.uHoverState, {
                    duration: transitionSpeed,
                    value: 0,
                    delay: 0.5
                })
                gsap.to(skillsRef.current, {
                    duration: transitionSpeed ,
                    opacity: 0,
                })
            }
        }
    }



    const stencilMaterial = { 
        depthWrite: true,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
    }
    

    useEffect(() => {
        if (groupRef.current && glbTextureModel.scene) {
          const portal = groupRef.current;
    
          const hasCameraPassedThroughPortal = () => {
            const cameraPosition = camera.position.clone();
            const portalCenter = new THREE.Vector3(0, 0, 0.01).applyMatrix4(portal.matrixWorld); // Portal center in world space
            const portalNormal = new THREE.Vector3(0, 0, 1).applyMatrix3(new THREE.Matrix3().getNormalMatrix(portal.matrixWorld));
    
            const toCamera = cameraPosition.clone().sub(portalCenter);
            return toCamera.dot(portalNormal) > 0; // Positive if in front, negative if behind
          };
    
          const updateStencilLogic = () => {
            const isCameraInFront = hasCameraPassedThroughPortal();
    
            glbTextureModel.scene.traverse((child) => {
              if (child.isMesh) {
                child.material.stencilWrite = true;
                child.material.stencilFunc = THREE.EqualStencilFunc;
                child.material.stencilRef = isCameraInFront ? 1 : 2; // Use different stencil refs for front/back
                child.material.stencilFail = THREE.KeepStencilOp;
                child.material.stencilZFail = THREE.KeepStencilOp;
                child.material.stencilZPass = THREE.ReplaceStencilOp;
                child.material.needsUpdate = true;
                // child.material.transparent = true; // Enable transparency
                // child.material.opacity = 0.85; 
                // child.material.depthWrite = true
              }
            });
          };
    
    
          updateStencilLogic(); // Run once initially
          camera.addEventListener("change", updateStencilLogic); // Run on camera movement
    
          return () => {
            camera.removeEventListener("change", updateStencilLogic);
          };
        }
      }, [camera, glbTextureModel.scene, groupRef.current]);


      useEffect(() => {
        // Perpetual rotation using GSAP
        if (glbRef.current) {
          gsap.to(glbRef.current.rotation, {
            y: "+=6.28", // Rotate 360 degrees (2 * Math.PI)
            duration: 10, // Rotation duration
            repeat: -1, // Infinite repeat
            ease: "linear", // Linear easing for consistent rotation
          });
        }
      }, [glbRef.current]);





      /**
       * FX Footer -Rarity-
       */
      const envMap = new THREE.CubeTextureLoader().load([
        '/cube/px.png', '/cube/nx.png',
        '/cube/py.png', '/cube/ny.png',
        '/cube/pz.png', '/cube/nz.png',
        // '/metal/nx.jpg', '/metal/nx.jpg',
        // '/metal/nx.jpg', '/metal/nx.jpg',
        // '/metal/nx.jpg', '/metal/nx.jpg',
      ]);


      const raritiesColors = [
        new THREE.Color(0.0156, 0.490, 0.784), // Common
        new THREE.Color(0.360, 0.015, 0.784), // Rare
        new THREE.Color(0.784, .015, .682), // Epic
        new THREE.Color(0.784, .047, .015), // Legendary
        new THREE.Color(0.784, .462, .015), // Mythic
      ]
    

    return (
        <group ref={groupRef}>
            {/* { useRaysBg && <primitive object={mesh}></primitive> } */}


            <ambientLight intensity={.5} color="white" />
            <directionalLight position={[0, 0, 3]} intensity={.45} color="#cccccc" />
            <hemisphereLight
                intensity={4} // Adjust for brightness
                skyColor="white" // Upper hemisphere color
                groundColor="#888888" // Lower hemisphere (ground) color
                position={[0, 0, 3]} 
            />

            
            {/* Realistic Mesh */}
            <mesh rotation={[0, 0, 0]} renderOrder={0}>
                <planeGeometry args={[2, 3, 10, 10]} />
                <meshStandardMaterial 
                    transparent={false}
                    alphaMap={textures.base.alpha} 
                    alphaTest={0.1} 
                    map={blendedAlbedoTextures} 
                    roughnessMap={blendedRoughnessTextures} 
                    normalMap={blendedNormalTextures}
                    metalness={0.45} // Lower for non-metallic surfaces
                    roughness={.8} // Adjust to balance reflectivity
                    side={THREE.FrontSide}
                    opacity={1}
                    color="white"
                />
                 <Decal 
                    position={[.85, -1.38, 0.06]} // Adjust position relative to the mesh
                    rotation={[0, 0, 0]} // Adjust rotation as needed
                    scale={.125} // Adjust size of the decal
                    map={logoTexture}
                    depthTest={false}
                    depthWrite={true}
                    polygonOffsetFactor={-60}
                    renderOrder={1}
                />
            </mesh>


            {/* <mesh
                frustumCulled={true} 
                ref={planeRef}
                key={`main-${key}`} 
                renderOrder={1}
                visible={false}
            > 
                <planeGeometry args={[2, 3, 120, 120]} />
                {
                        <shaderMaterial
                            ref={shaderRef}
                            needsUpdate={true}
                            uniformsNeedUpdate={true}
                            uniforms={{
                                albedoMap2: { value: blendedAlbedoTextures },
                                albedoMap: { value: blendedAlbedo3Textures },
                                alphaMap2: { value: blendedAlpha2Textures },
                                alphaMap: { value: blendedAlphaTextures },
                                heightMap: { value: blendedHeightTextures },
                                roughnessMap: { value: blendedRoughnessTextures },
                                normalMap: { value: blendedNormalTextures },
                                fxMask: { value: useIridescence ? textures.fx.irisMask : useBrightness ? textures.fx.brightnessMask : textures.fx.shine },
                                iridescenceMask: { value: useIridescence ? textures.fx.iridescence : textures.fx.brightness },

                                // Transition
                                blendMode: { value: blendMode },

                                gradientMap: { value: textures.fx.refraction  },
                                refractionIntensity: { value: refractionIntensity },
                                stripesVisible: { value: stripesVisible },

                                uDisp: { value: textures.fx.transition },
                                uHoverState: { value: 0 },
                                
                                displacementScale: { value: displacementScale },
                                normalIntensity: { value: normalIntensity }, 

                                lightDirection: { value: new THREE.Vector3(0, 0, 2).normalize() },
                                cameraPosition: { value: new THREE.Vector3(0, 0, 5) },
                                uOrbitCameraPosition: { value: camera.position },

                       
                                foldIntensity: { value: 0.25 },
                                foldPosition: { value: new THREE.Vector2(0.0, 0.0) },
                                foldRotationZ: { value: 0.0 },

                         
                                // Ambient Light 
                                ambientLightColor: { value: ambientLightColor },
                                ambientLightIntensity: { value: ambientLightIntensity },
                                // Point Light 
                                pointLightColor: { value: pointLightColor },
                                pointLightIntensity: { value: pointLightIntensity * 0.1 },
                                pointLightPosition: { value: new THREE.Vector3(
                                    plXandY.x,
                                    plXandY.y,
                                    plZ
                                ) },
                                pointLightDecay: { value: pointLightDecay },
                                // Point Light 2
                                pointLightColor2: { value: pointLightColor2 },
                                pointLightIntensity2: { value: pointLightIntensity2 * 0.1 },
                                pointLightPosition2: { value: new THREE.Vector3(
                                    plXandY2.x,
                                    plXandY2.y,
                                    plZ2
                                ) },
                                pointLightDecay2: { value: pointLightDecay2 },

                                roughnessIntensity: { value: roughnessIntensity },
                                roughnessPresence: { value: roughnessPresence },

                                useIridescence: { value: useIridescence }, 
                                iridescenceIntensity: { value: iridescenceIntensity },

                                useBrightness: { value: useBrightness }, 
                                brightnessIntensity: { value: brightnessIntensity },

                                useShine: { value: useShiney  },
                                shineIntensity: { value: shineyIntensity },
                                shineColor1: { value: shineyColor },
                                shineColor2: { value: shineyColor },

                                useTransition: { value: useTransition },

                                uTime: { value: 0.0 },
                                uRotation: { value: 0.0 },
                                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

                                environmentIntensity: { value: 1.0 }, // Adjust as needed
                                environmentColor: { value: new THREE.Color(0xffffff) }, // White light

                                // Grading Randomness 
                                rotation: { value: 0.0 },
                                scale: { value: new THREE.Vector2(1, 1) },
                                offset: { value: new THREE.Vector2(0, 0)},

                                // Video
                                videoTexture: { value: videoTexture },
                                // HDRI 
                                hdriTexture: { value: hdriTexture }
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
                                useHDRITexture 
                                ? 
                                hdriFragmentShader 
                                : useVideoTexture 
                                ? 
                                videoFragmentShader 
                                : useRefraction
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
                                : 
                                standardFragmentShader
                            }
                            transparent={true}
                            side={THREE.DoubleSide}
                            // depthWrite={false}
                    />
                }
                <Decal 
                    position={[.85, -1.38, 0.06]} // Adjust position relative to the mesh
                    rotation={[0, 0, 0]} // Adjust rotation as needed
                    scale={.125} // Adjust size of the decal
                    map={logoTexture}
                    depthTest={false}
                    depthWrite={true}
                    polygonOffsetFactor={-60}
                    renderOrder={2}
                />
            </mesh> */}


            /**
             *  Outer Mask FX -Brightness, Iridescence, ShaderFX-
             */
             <mesh 
                visible={useBrightness || useIridescence || useCardio || useSquares || useCircle || useDank || useShine || useEther || useFire || useWaves || useSmoke || useRay || useCrystal || useGalaxy || useLiquid || useAsci || useSpin || useParticles || useBlobs || useGrass} 
                key={`main-${key}`}  
                ref={planeRef} 
                position={[0, 0, 0.005]} 
                renderOrder={0}
            >
                <planeGeometry args={[2, 3, 10, 10]} />
                <shaderMaterial 
                      ref={shaderRef}
                      needsUpdate={true}
                      uniformsNeedUpdate={true}
                      vertexShader={standardVertexShader}
                      // fragmentShader={smokeFxFragmentShader}
                      fragmentShader={
                        useIridescence 
                        ?
                        outerIridescenceFragmentShader 
                        : 
                        useBrightness 
                        ?
                        outerBrightnessFragmentShader 
                        : 
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
                      transparent={true}
                      uniforms={{
                        fxMask: { value: textures.fx.irisMask },
                        uAlphaMask: { value: textures.fx.irisMask },
                        iridescenceMask: { value: textures.fx.iridescence },
                        brightnessMask: { value: textures.fx.brightness },
                        
                        displacementScale: { value: displacementScale },
                        cameraPosition: { value: new THREE.Vector3(0, 0, 5) },

                        roughnessIntensity: { value: roughnessIntensity },
                        roughnessPresence: { value: roughnessPresence },

                        iridescenceIntensity: { value: iridescenceIntensity },
                        brightnessIntensity: { value: brightnessIntensity * 2.0 },


                        uTime: { value: 0.0 },
                        uRotation: { value: 0.0 },
                        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                      }}
                />
             </mesh> 

            
            /**
            * Footer Mask FX -Rarity Logo-
            */
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[2, 3, 10, 10]} />
                <shaderMaterial 
            
                    vertexShader={standardVertexShader}
                    fragmentShader={rarityFragmentShader}
                    transparent={true}
                    uniforms={{
                        environmentMap:{ value: envMap },
                        reflectivity: { value: .25 }, 
                        baseColor: { value: raritiesColors[4] },
                        heightMap: { value: blendedHeightTextures },
                        displacementScale: { value: displacementScale },
                        alphaMap: { value: blendedAlphaTextures },
                        rarityMask: { value: useTexture('/mobile/fx/footer_mask.jpg') },
                    }}
                />
            </mesh>




            
            {/* {(useCardio || useSquares || useCircle || useDank || useShine || useEther || useFire || useWaves || useSmoke || useRay || useCrystal || useGalaxy || useLiquid || useAsci || useSpin || useParticles || useBlobs || useGrass) && (
                <mesh frustumCulled={true} position={[0, 0, .005]} key={`overlay-${key}`} >
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
                            uAlphaMask: { value:  textures.base.alpha },
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
            )} */}


            {/* Backside */}

            <directionalLight position={[0, 0, -3]} intensity={0.75} />
            <mesh rotation={[0, Math.PI * 3, 0]}>
                <planeGeometry args={[2, 3, 10, 10]} />
                <meshStandardMaterial 
                    transparent={false}
                    alphaMap={textures.base.alpha} 
                    alphaTest={0.1}
                    map={blendedAlbedoBacksideTextures} 
                    roughnessMap={blendedRoughnessBacksideTextures} 
                    normalMap={blendedNormalTextures}
                    metalness={0.75}
                    roughness={1}
                    color="#cccccc"
                />
            </mesh>


            <CollCardFooter />

{/*             
            <SkillsCard 
                ref={skillsRef} 
            />
             */}

            {/* <FooterCard 
                blendMode={blendMode} 
                ref={footerRef} 
            /> */}

            <EffectComposer> 
                { useDepthOfField && (
                    <DepthOfField
                        focusDistance={focusDistance}
                        focalLength={focalLength}
                        bokehScale={bokehScale}
                    />
                )}

                { useHueSaturation && (
                    <HueSaturation
                        hue={hue}
                        saturation={saturation}
                    />
                )}

                { useBrightnessContrast && (
                    <BrightnessContrast
                        brightness={brightness}
                        contrast={contrast}
                    />
                )}

                { useChromaticAberration && (
                    <ChromaticAberration
                        radialModulation={radialModulation}
                        offset={[offset, offset]}
                    />
                )}


                { useGodRays && (
                    <GodRays
                        sun={mesh}
                        blendFunction={BlendFunction.Screen}
                        samples={samples}
                        density={density}
                        decay={decay}
                        weight={weight}
                        exposure={exposure}
                        clampMax={1}
                        width={Resizer.AUTO_SIZE}
                        height={Resizer.AUTO_SIZE}
                        kernelSize={KernelSize.SMALL}
                        blur={true}
                    />
                )}
        
            </EffectComposer>


            { useGLBTexture && (
                <>
                    <Mask
                            scale={[1, 1, 1]}
                            position={blendMode === 0 ? [0, 0, 0.01] : [0, .5, 0.01] }
                        >
                            <planeGeometry args={blendMode === 0 ? [2, 3] : [2, 2]} />
                            <shaderMaterial 
                                args={[stencilMaterial]} 
                            />
                    </Mask>
                    <Float speed={4}>
                        <group ref={glbRef} position={[0, -.95, .65]}>
                            <primitive 
                                object={glbTextureModel.scene}
                                scale={[10, 10, 10]}
                            />
                        </group>
                    </Float>
                    {/* <group position={[.55, -.85, .15]}>
                            <primitive 
                                object={glbTextureModel2.scene}
                                scale={[0.001, 0.001, 0.001]}
                            />
                    </group> */}
                </>
            )}
      
        </group>
    )
}