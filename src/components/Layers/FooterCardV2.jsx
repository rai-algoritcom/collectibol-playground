import { Text3D } from "@react-three/drei";
import * as THREE from "three"


export default function CollCardFooter() {
    return (
        <group>
                <Text3D
                  font={('/fonts/Inter_Bold.json')}
                  scale={0.08}
                  bevelSegments={3}
                  bevelEnabled
                  bevelThickness={0.0005}
                  position-x={-.9}
                  position-y={-1.4}
                  position-z={0.0002}
                >
                  PR
                </Text3D>
                <Text3D
                  font={('/fonts/Inter_Medium_Regular.json')}
                  scale={0.035}
                  bevelSegments={3}
                  bevelEnabled
                  bevelThickness={0.0005}
                  position-x={-.71}
                  position-y={-1.35}
                  position-z={0.0002}
                >
                  Joan Laporta 
                </Text3D>
                <Text3D
                  font={('/fonts/Inter_Medium_Regular.json')}
                  scale={0.035}
                  bevelSegments={3}
                  bevelEnabled
                  bevelThickness={0.0005}
                  position-x={-.71}
                  position-y={-1.41}
                  position-z={0.0002}
                >
                  President 
                </Text3D>
                <Text3D
                  font={('/fonts/Inter_Medium_Regular.json')}
                  scale={0.035}
                  bevelSegments={3}
                  bevelEnabled
                  bevelThickness={0.0005}
                  position-x={.39}
                  position-y={-1.36}
                  position-z={0.0002}
                >
                  FC BARCELONA 
                </Text3D>
                <Text3D
                    font={('/fonts/Inter_Medium_Regular.json')}
                  scale={0.035}
                  bevelSegments={3}
                  bevelEnabled
                  bevelThickness={0.0005}
                  position-x={.34}
                  position-y={-1.42}
                  position-z={0.0002}
                >
                  &copy;2025 Collectibol
                </Text3D>
        </group>
    )
}