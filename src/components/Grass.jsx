import { Grid, useTexture } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three"


import grassFragmentShader from "../shaders/grass/grassFragmentShader.glsl";
import grassVertexShader from "../shaders/grass/grassVertexShader.glsl"
import { useFrame } from "@react-three/fiber";


export default function Grass() {

    const bufferRef = useRef()
    const shaderRef = useRef()

    const instances = 10000 
    const w = 10 // width
    const d = 10 // depth
    const h = 0 // height

    const positions = []
    const indexs = []
    const uvs = []
    const terrPos = []
    const angles = []


    const createParticles = () => {
        positions.push(0.5, -0.5, 0)
        positions.push(-0.5, -0.5, 0)
        positions.push(-0.5, 0.5, 0)
        positions.push(0.5, 0.5, 0)

        indexs.push(0)
        indexs.push(1)
        indexs.push(2)
        indexs.push(2)
        indexs.push(3)
        indexs.push(0)

        uvs.push(1.0, 0.0)
        uvs.push(0.0, 0.0)
        uvs.push(0.0, 1.0)
        uvs.push(1.0, 1.0)

        for (let i=0; i<instances; i++) {

            let posiX = Math.random() * w - w/2 
            let posiY = h; 
            let posiZ = Math.random() * d - d/2

            terrPos.push(posiX, posiY, posiZ)

            let angle = Math.random() * 360; 
            angles.push(angle)
        }

        bufferRef.current.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        bufferRef.current.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(uvs, 2)
        )
        bufferRef.current.setIndex(
            new THREE.BufferAttribute(new Uint16Array(indexs), 1)
        )
        bufferRef.current.setAttribute(
            'terrPos',
            new THREE.InstancedBufferAttribute(new Float32Array(terrPos), 3)
        )
        bufferRef.current.setAttribute(
            'angle',
            new THREE.InstancedBufferAttribute(new Float32Array(angles), 1)
        )
    }

    useEffect(() => {
        createParticles()
    }, [])


    useFrame((state) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 100
        }
    })

    
    return (
        <group>
            <Grid args={[10, 10]}  position={[ 0, -1.85, 0 ]} />
            {/* <axesHelper args={[1]} position={[ 0, -1.85, 0 ]} /> */}

            <instancedMesh args={[null, null, instances]} position={[ 0, -1.85, 0 ]} frustumCulled={false} >
                <instancedBufferGeometry ref={bufferRef} instanceCount={instances} attach="geometry" />
                <rawShaderMaterial
                    needsUpdate={true}
                    ref={shaderRef}
                    side={THREE.DoubleSide}
                    vertexShader={grassVertexShader}
                    fragmentShader={grassFragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                        grassMaskTex: { value: useTexture('/grass/grass.jpg') },
                        grassDiffTex: { value: useTexture('/grass/grass_diffuse.jpg') }
                    }}
                />
            </instancedMesh>

            <mesh position={[0, -1.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w + 2, d + 2]} />
                <meshBasicMaterial color={0x08731f} side={THREE.DoubleSide} />
            </mesh>
            
        </group>
    )
}