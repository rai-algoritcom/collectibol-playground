import { Environment, OrbitControls, PerspectiveCamera, useHelper } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CardLoader from "./components/CardLoader";
import LinkButton from "./components/LinkButton";
import ResetButton from "./components/ResetButton";
import { removeStorageConfig } from "./data/localStorage";
import * as THREE from "three"
import { useRef } from "react";


export default function Builder() {

    return (
        <>
            <div className="bg"></div>
            <div className="bg-main"></div>
            <Canvas
                // camera={{ position: [3, 3, 3], fov: 30 }}
                gl={{ alpha: true, antialias: true, precision: 'mediump', stencil: true }}
                dpr={[1, 2]}
                onCreated={({ gl }) => {
                    gl.toneMappingExposure = 1.2;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.outputEncoding = THREE.sRGBEncoding;
                }}
            >
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