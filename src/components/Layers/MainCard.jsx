import { useEffect, useMemo, useRef, useState } from "react";
import { 
    blendRoughnessZipped,
    blendAlbedosZipped,
    blendNormalsZipped,
    blendHeightsZipped,
    blendAlphasZipped,
    getGradingProps } from "../../utils"
import { useFrame, useThree } from "@react-three/fiber";
import { normalizeAngle } from "../../utils/helpers";
import { DragControls } from "@react-three/drei";

import * as THREE from "three"
import gsap from "gsap"


/**
 * Fragment
 */
import {
    standardFragmentShader,
    iridescenceFragmentShader,
    brightnessFragmentShader,
    shineFragmentShader,
    refractionFragmentShader
} from '../../shaders/fragments/index'

import {
    standardVertexShader,
} from '../../shaders/vertex/index'
import FooterCard from "./FooterCard";
import { button, useControls } from "leva";



const BOARD_LIMITS = {
    x: [-1.8, 1.8],
    z: [-5.75, 0],
};



const MainCard = ({
       id,
       //
       controlsRef,
       // configs
       renderScene,
       renderCamera,
       // pos
       position,
       // textures
       textures,
       mainIntTexture,
       layoutColor,
       // roughness
       roughnessIntensity,
       roughnessPresence,
       // normals
       normalIntensity,
       // height
       displacementScale,
       // lights 
       ambientLightColor,
       ambientLightIntensity,
       pointLightColor,
       pointLightIntensity,
       pointLightDecay,
       // brightness 
       brightnessIntensity,
       useBrightness,
       // iridescence 
       iridescenceIntensity,
       useIridescence, 
       // shine 
       shineyIntensity, 
       useShiney, 
       shineyColor,
       // refraction 
       refractionIntensity, 
       useRefraction, 
       stripesVisible, 
       // transition 
       useTransition, 
       // queue 
    //    enqueue, 
    //    processNext,
    //    isProcessing
}) => {
    const { gl, camera, clock } = useThree()

    const dragRef = useRef()
    const planeRef = useRef()
    const shaderRef = useRef()
    const overlayRef = useRef()
    const skillsRef = useRef()
    const footerRef = useRef()

    const shaderMaterialCfg = useRef(null)

    const [blendMode] = useState(1)
    const [animationTrigger] = useState('rotation')


    console.log(mainIntTexture)


    const {
        gradingRoughnessProps,
        gradingAlbedoProps
    } = useMemo(() => getGradingProps(), [])


    useEffect(() => {

        // const blendedAlbedoTextures = 
        //     blendAlbedosZipped(
        //         { renderTarget, renderScene, renderCamera, renderer: gl },
        //         textures, false, layoutColor, gradingAlbedoProps
        //     )

        const blendedAlbedo3Textures = 
            blendAlbedosZipped(
                { renderScene, renderCamera, renderer: gl },
                {...textures,
                  main_interest: {
                    ...textures.main_interest,
                    albedo: mainIntTexture
                  }
                }, true, layoutColor, gradingAlbedoProps
            )

        const blendedAlphaTextures = 
            blendAlphasZipped(
                textures, false
            )

        const blendedAlpha2Textures = 
            blendAlphasZipped(
                textures, true
            )

        const blendedHeightTextures = 
            blendHeightsZipped(
                textures
            )

        const blendedRoughnessTextures = 
            blendRoughnessZipped(
                { renderScene, renderCamera, renderer: gl },
                textures, gradingRoughnessProps,
                 true
            )

        const blendedNormalTextures =
            blendNormalsZipped(
                textures
            )

        shaderMaterialCfg.current = {
            vertexShader: standardVertexShader,
            fragmentShader: 
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
                : 
                standardFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                // textures
                // albedoMap2: { value: blendedAlbedoTextures },
                albedoMap: { value: blendedAlbedo3Textures },
                alphaMap: { value: blendedAlphaTextures },
                alphaMap2: { value: blendedAlpha2Textures },
                heightMap: { value: blendedHeightTextures },
                roughnessMap: { value: blendedRoughnessTextures },
                normalMap: { value: blendedNormalTextures },
                fxMask: { value: useIridescence ? textures.fx.irisMask : useBrightness ? textures.fx.brightnessMask : textures.fx.shine },
                iridescenceMask: { value: useIridescence ? textures.fx.iridescence : textures.fx.brightness },
                // transition 
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

                /**
                * Lights
                */
                // Ambient Light 
                ambientLightColor: { value: ambientLightColor },
                ambientLightIntensity: { value: ambientLightIntensity }, 

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
            }
        
        }
    }, [])


    useEffect(() => {
        if (!useTransition && skillsRef.current) {
            skillsRef.current.style.opacity = 1
        }
    }, [ ])



    let lastAngle = 0; // Keep track of the last angle
    useFrame(() => {

        /*if (
            shaderRef.current && 
            shaderRef.current.uniforms
        ) {
            shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
            shaderRef.current.needsUpdate = true
        }

        if (
            camera &&
            planeRef.current &&  
            shaderRef.current && 
            shaderRef.current.uniforms
        ) {
            const cameraToMesh = new THREE.Vector3();
            cameraToMesh.subVectors(
                planeRef.current.getWorldPosition(new THREE.Vector3()), 
                camera.position
            ).normalize();
            
            const angle = Math.atan2(cameraToMesh.x, cameraToMesh.z)
            const smoothAngle = normalizeAngle(angle, lastAngle)
            
            if (overlayRef.current) {
                if (animationTrigger === 'rotation') {
                    overlayRef.current.uniforms.uTime.value = smoothAngle 
                } else {
                    overlayRef.current.uniforms.uTime.value = clock.getElapsedTime()
                }
            }

            shaderRef.current.uniforms.uRotation.value = smoothAngle * 3
            lastAngle = smoothAngle
        }*/
    })


    const onDragStart = () => {
        if (controlsRef?.current) {
          controlsRef.current.enabled = false; // Disable OrbitControls
        }
    };
    

    const onDragEnd = () => {
        if (controlsRef?.current) {
          controlsRef.current.enabled = true; // Re-enable OrbitControls
        }
    };

    const dragLimits = useMemo(() => {
        const boardCenter = [0, 0]; // Center of the board in global space
        const [xMin, xMax] = BOARD_LIMITS.x;
        const [zMin, zMax] = BOARD_LIMITS.z;

        return {
            x: [(xMin + boardCenter[0]) - position[0], (xMax + boardCenter[0]) - position[0]],
            z: [(zMin + boardCenter[1]) - position[2], (zMax + boardCenter[1]) - position[2]],
        };
    }, []);


    useControls('Card ' + id, {
        [`Roll #${id}`]: button(() => moveCards({x: 2, y: position[1], z: -2.85})),
        [`Unroll #${id}`]: button(() => moveCards({x: position[0], y: position[1], z: position[2]}))
    }, [])

    const moveCards = (targetPosition) => {
        // Temporarily disable DragControls
        if (controlsRef?.current) controlsRef.current.enabled = false;

        // Animate the mesh's position
        gsap.to(planeRef.current.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1, // Duration of the animation
            ease: 'power2.out',
            onUpdate: () => {
                // Ensure the matrixWorld is updated
                planeRef.current.updateMatrix();
                planeRef.current.updateMatrixWorld(true);

                // Trigger a re-render
                // invalidate();
            },
            onComplete: () => {
                // Re-enable DragControls after the animation
                if (controlsRef?.current) controlsRef.current.enabled = true;
            },
        });
    };


 
    return (
        shaderMaterialCfg.current && (
            <DragControls
                ref={dragRef}
                enabled
                axisLock={"y"}
                args={[[planeRef.current], camera, gl.domElement]}
                dragLimits={[
                    dragLimits.x,
                    [0, 0],
                    dragLimits.z
                ]}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <mesh
                    frustumCulled={true}
                    ref={planeRef}
                    position={position}
                    scale={0.25}
                    rotation={[-Math.PI * 0.25, 0, 0]}
                >
                    <planeGeometry args={[2, 3, 120, 120]} />
                    <shaderMaterial 
                        ref={shaderRef}
                        attach="material"
                        {...shaderMaterialCfg.current}
                    />

                    {/* <SkillsCard 
                        ref={skillsRef} 
                    />
                    */}

                    <FooterCard blendMode={blendMode} ref={footerRef} />
                </mesh>
            </DragControls>
        )
    )
}


export default MainCard