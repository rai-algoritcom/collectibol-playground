import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"

import { standardVertexShader } from "../../shaders/vertex/index"
import { iridescenceFragmentShader } from "../../shaders/fragments/index"

import FooterCard from "./FooterCard";

import { useTexture } from "@react-three/drei"
import { 
    texturePaths, 
    blendAlbedoTXs, 
    blendAlphaTXs, 
    blendHeightTXs, 
    blendNormalTXs, 
    blendRoughnessTXs, 
    getGradingProps, 
    getCardConfigJSON,
    normalizeAngle
} from "../../utils/vanilla_utils"


const ProdCard = () => {

    const cardConfig = getCardConfigJSON()

    const { gl, camera } = useThree()

    const planeRef = useRef()
    const shaderRef = useRef()
    const footerRef = useRef()

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

    const textures = {
        base: baseTextures,
        pattern: patternTexture,
        main_interest: mainInterestTextures,
        layout: layoutTextures,
        gradingv2: {
            gradingDoblez, 
            gradingExterior, 
            gradingManchas, 
            gradingRascado, 
            gradingScratches
        },
        fx: fxTextures,
    }


    const {
        gradingRoughnessProps,
        gradingNormalsProps,
        gradingAlbedoProps
    } = getGradingProps()


    const blendedAlbedoTextures = useMemo(() => {
        return blendAlbedoTXs(gl, textures, cardConfig.albedo_ch, false, false, cardConfig.layout_color, gradingAlbedoProps)
    }, [gl, textures])

    const blendedAlphaTextures = useMemo(() => {
        return blendAlphaTXs(gl, textures, cardConfig.alpha_ch);
    }, [gl, textures]);

    const blendedHeightTextures = useMemo(() => {
        return blendHeightTXs(gl, textures, cardConfig.height_ch);
    }, [gl, textures]);

    const blendedRoughnessTextures = useMemo(() => {
        return blendRoughnessTXs(gl, textures, cardConfig.roughness_ch, gradingRoughnessProps);
    }, [gl, textures]);

    const blendedNormalTextures = useMemo(() => {
        return blendNormalTXs(gl, textures, cardConfig.normal_ch, gradingNormalsProps);
    }, [gl, textures]);
    


    let lastAngle = 0; 
    useFrame((state) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
        }

        if (planeRef.current && camera && shaderRef.current) {
            const cameraToMesh = new THREE.Vector3();
            cameraToMesh.subVectors(planeRef.current.getWorldPosition(new THREE.Vector3()), camera.position).normalize();
            
            const angle = Math.atan2(cameraToMesh.x, cameraToMesh.z)
            const smoothAngle = normalizeAngle(angle, lastAngle)

            shaderRef.current.uniforms.uRotation.value = smoothAngle * 3
            lastAngle = smoothAngle
        }
    })

    useEffect(() => {
        if (!planeRef.current) return;

        const timeline = gsap.timeline({ repeat: -1, yoyo: true });
        timeline
            .to(planeRef.current.rotation, {
                y: "+=0.45", // Small rotation on the Y-axis
                duration: 2,
                ease: "power1.inOut",
            })
            .to(planeRef.current.rotation, {
                y: "-=0.45", // Small rotation on the Y-axis
                duration: 2,
                ease: "power1.inOut",
            })
            .to(planeRef.current.rotation, {
                x: "+=0.25", // Slight tilt on the X-axis
                duration: 2,
                ease: "power1.inOut",
            }, "<"); // Simultaneously animate the X-axis

        return () => {
            timeline.kill();
        };
    }, []);



    return (
        <mesh
            frustumCulled={true} 
            ref={planeRef}
        >
            <planeGeometry args={[2, 3, 120, 120]} />
            <shaderMaterial 
                ref={shaderRef}
                needsUpdate={true}
                uniformsNeedUpdate={true}
                uniforms={{
                    albedoMap2: { value: blendedAlbedoTextures },
                    alphaMap: { value: blendedAlphaTextures },
                    heightMap: { value: blendedHeightTextures },
                    roughnessMap: { value: blendedRoughnessTextures },
                    normalMap: { value: blendedNormalTextures },
                    fxMask: { value: textures.fx.irisMask},
                    iridescenceMask: { value: textures.fx.iridescence },

                    blendMode: { value: 0 },

                    displacementScale: { value: cardConfig.displacement_scale },
                    normalIntensity: { value: cardConfig.normal_intensity }, 

                    lightDirection: { value: new THREE.Vector3(0, 0, 2).normalize() },
                    cameraPosition: { value: new THREE.Vector3(0, 0, 5) },

                    /**
                    * Lights
                    */
                    // Ambient Light 
                    ambientLightColor: { value: cardConfig.lights.ambient_light_color },
                    ambientLightIntensity: { value: cardConfig.lights.ambient_light_intensity }, 

                    // Point Light 
                    pointLightColor: { value: cardConfig.lights.point_light_color },
                    pointLightIntensity: { value: cardConfig.lights.point_light_intensity * 0.1 },
                    pointLightPosition: { value: new THREE.Vector3(
                        cardConfig.lights.point_light_pos.x,
                        cardConfig.lights.point_light_pos.y,
                        cardConfig.lights.point_light_pos.z
                    ) },
                    pointLightDecay: { value: cardConfig.lights.point_light_decay },
                    // Point Light 2
                    pointLightColor2: { value: cardConfig.lights.point_light_color_2 },
                    pointLightIntensity2: { value: cardConfig.lights.point_light_intensity_2 * 0.1 },
                    pointLightPosition2: { value: new THREE.Vector3(
                        cardConfig.lights.point_light_pos_2.x,
                        cardConfig.lights.point_light_pos_2.y,
                        cardConfig.lights.point_light_pos_2.z
                    )},
                    pointLightDecay2: { value: cardConfig.lights.point_light_decay_2 },

                    roughnessIntensity: { value: cardConfig.roughness_intensity },
                    roughnessPresence: { value: cardConfig.roughness_presence },

                    useIridescence: { value: cardConfig.iridescence.use_iridescence }, 
                    iridescenceIntensity: { value: cardConfig.iridescence.iridescence_intensity },

                    uTime: { value: 0.0 },
                    uRotation: { value: 0.0 },
                    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

                    environmentIntensity: { value: 1.0 }, // Adjust as needed
                    environmentColor: { value: new THREE.Color(0xffffff) }, // White light
                }}
                vertexShader={standardVertexShader}
                fragmentShader={iridescenceFragmentShader}
                transparent={true}
                side={THREE.DoubleSide}
            />

            <FooterCard blendMode={0} ref={footerRef} />
        </mesh>
    )
}

export default ProdCard