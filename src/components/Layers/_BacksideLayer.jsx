import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function BacksideLayer () {

    return (
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.000011]} >
            {/* Slight offset to prevent z-fighting */}
            <planeGeometry   args={[2, 3, 120, 120]} />
            <meshStandardMaterial 
                color={'#000000'}   
                transparent 
                alphaMap={useTexture('/textures/base/alpha.png')}
                side={THREE.DoubleSide} 
           />
        </mesh>
    )
}