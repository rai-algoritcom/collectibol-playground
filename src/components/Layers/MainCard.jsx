import { useEffect, useMemo, useRef, useState } from "react";
import { blendAlbedoTXs, blendAlphaTXs, blendHeightTXs, blendRoughnessTXs, blendNormalTXs, getGradingProps } from "../../utils"
import { useFrame, useThree } from "@react-three/fiber";
import { normalizeAngle } from "../../utils/helpers";

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
import SkillsCard from "./SkillsCard";
import FooterCard from "./FooterCard";



export default function MainCard({
       position,
       // textures
       textures,
       layoutColor,
       // channels
       albedoToggles, 
       alphaToggles, 
       roughnessToggles, 
       normalToggles,
       heightToggles,
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
       directionalLightColor,
       directionalLightIntensity,
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
       transitionSpeed, 
       // folding 
       foldIntensity, 
       useFolding, 
       foldX,
       foldY,
       foldRotation,
       // vertex_Fx 
       vertex_fx_id,
       // fragment_fx 
       fragment_fx_id,
       fragment_fx_trigger
}) {
    const { gl, scene, camera } = useThree()

    const planeRef = useRef()
    const shaderRef = useRef()
    const overlayRef = useRef()
    const skillsRef = useRef()
    const footerRef = useRef()

    const [key, setKey] = useState(0);

    const [blendMode, setBlendMode] = useState(1)
    const [animationTrigger, setAnimationTrigger] = useState('rotation')

    const {
        gradingRoughnessProps,
        gradingNormalsProps,
        gradingAlbedoProps
    } = getGradingProps()


     // Blended Textures
     const blendedAlbedoTextures = useMemo(() => {
        return blendAlbedoTXs(gl, textures, albedoToggles, false, false, layoutColor, gradingAlbedoProps);
    }, [gl, textures, albedoToggles, layoutColor]);

    const blendedAlbedo3Textures = useMemo(() => {
        return blendAlbedoTXs(gl, textures, albedoToggles, false, true, layoutColor, gradingAlbedoProps);
    }, [gl, textures, albedoToggles, layoutColor])

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
    }, [gl, textures, roughnessToggles]);

    const blendedNormalTextures = useMemo(() => {
        return blendNormalTXs(gl, textures, normalToggles, gradingNormalsProps);
    }, [gl, textures, normalToggles]);


    const refreshMesh = () => {
        setKey((prevKey) => prevKey + 1);
    }



    useEffect(() => {

        refreshMesh();

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
        position,
        // textures
        textures,
        layoutColor,
        // channels
        albedoToggles, 
        alphaToggles, 
        roughnessToggles, 
        normalToggles,
        heightToggles,
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
        directionalLightColor,
        directionalLightIntensity,
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
        transitionSpeed, 
        // folding 
        foldIntensity, 
        useFolding, 
        foldX,
        foldY,
        foldRotation,
        // vertex_Fx 
        vertex_fx_id,
        // fragment_fx 
        fragment_fx_id,
        fragment_fx_trigger
    ])



    let lastAngle = 0; // Keep track of the last angle


    useFrame((state) => {

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


    return (
        <group>
            <mesh
                key={`main-${key}`} 
                frustumCulled={true}
                ref={planeRef}
                position={position}
                // Tweaks to fit on Field
                scale={0.25}
                rotation={[-Math.PI * 0.25, 0, 0]}
            >
                <planeGeometry args={[2, 3, 120, 120]} />
                {/* <meshBasicMaterial color="pink" /> */}
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
                        offset: { value: new THREE.Vector2(0, 0)}
                    }}

                    vertexShader={
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
                        : 
                        standardFragmentShader
                    }
                    transparent={true}
                    side={THREE.DoubleSide}
                />

            {/* <SkillsCard 
                ref={skillsRef} 
            />
             */}

            <FooterCard blendMode={blendMode} ref={footerRef} planeOcclude={shaderRef} />
            </mesh>

        </group>
    )

}