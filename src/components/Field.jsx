import { useGLTF } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"

 
export default function Field({
    controlsRef
}) {

    const { scene } = useGLTF('/models/ground_optim.glb', true)
    const { set, size, camera } = useThree()


    useControls('Camera', {
        'mode': {
            value: 'perspective',
            options: {
                Default: 'perspective',
                'Built In': 'builtIn'
            },
            label: '*Mode',
            onChange: (value) => {
                if (value === 'builtIn') {
                    const builtInCamera = scene.children[0]
                    if (builtInCamera && builtInCamera.isCamera) {
                        
                        builtInCamera.aspect = size.width / size.height; // Match canvas aspect ratio
                        builtInCamera.updateProjectionMatrix();

                        set({ camera: builtInCamera });
                        // controlsRef.current.enabled = false
                    }
                } else {
                    set({ camera })
                    // controlsRef.current.enabled = true
                }
            }
        }
    })

    return (
        <primitive 
            object={scene} 
            rotation={[0, Math.PI * 3, 0]} 
            position={[0, -2.5, -3]} 
            scale={[8, 8, 8]} 
        />
    )
}