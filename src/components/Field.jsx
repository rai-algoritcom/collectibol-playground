import { useGLTF } from "@react-three/drei"

 
export default function Field() {

    const { scene } = useGLTF('/models/ground_optim.glb', true)

    return (
        <primitive 
            object={scene} 
            rotation={[0, Math.PI * 3, 0]} 
            position={[0, -2.5, -3]} 
            scale={[8, 8, 8]} 
        />
    )
}