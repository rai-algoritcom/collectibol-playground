import { Decal } from "@react-three/drei";
import { DoubleSide } from "three";

export default function DecalLayer({ textures, geometry }) {
    return (
      <Decal
        debug
        geometry={geometry}
        position={[0, 0, 0.2]} // Raise the decal above the surface
        rotation={[0, 0, 0]} // No rotation
        scale={[2, 3, 1]} // Match the base geometry dimensions
      >
      <meshStandardMaterial 
            map={textures.base_albedo}
            normalMap={textures.base_normal}
            alphaMap={textures.base_alpha}
            displacementMap={textures.base_height}
            displacementScale={0.001}
            roughnessMap={textures.base_roughness}
            side={DoubleSide} 
            toneMapped={false}
            transparent
            depthWrite={false}
      />
    </Decal>
    )
}
  