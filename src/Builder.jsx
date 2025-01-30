import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CardLoader from "./components/CardLoader";
import LinkButton from "./components/LinkButton";
import ResetButton from "./components/ResetButton";
import { removeStorageConfig } from "./data/localStorage";


export default function Builder() {
    return (
        <>
            <Canvas
                shadows 
                camera={{ position: [3, 3, 3], fov: 30 }}
                gl={{ alpha: true, antialias: true, precision: 'mediump', stencil: true }}
                dpr={[1, 2]}
            >
                <color attach="background" args={["#1B1B1B"]} />
                
                <Environment files="/env/the_sky_is_on_fire_1k.exr" background={false} />

                {/* Camera */}
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                {/* Controls */}
                <OrbitControls />
                
                {/* Gameplay */}
                <CardLoader isGameplay={false} />

            </Canvas>

            {/* <LinkButton 
                to={"/gameplay"}
                content={"Gameplay"}
            /> */}

            <ResetButton 
                onClick={ () => removeStorageConfig() } 
            />

        </>
    )
}