import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CardLoader from "./components/CardLoader";
import Field from "./components/Field";
import Grass from "./components/Grass";
import { useRef } from "react";
import LinkButton from "./components/LinkButton";
import AnimCards from "./components/Layers/AnimCards";


export default function Gameplay() {

    const controlsRef = useRef()

    return (
        <>
            <Canvas 
                shadows 
                camera={{ position: [3, 3, 3], fov: 30 }} 
                gl={{ alpha: true, antialias: true, precision: 'mediump' }} 
                dpr={[1, 2]} 
            >
                <color attach="background" args={["#1B1B1B"]} />

                <Environment files="/env/the_sky_is_on_fire_4k.hdr" background={false} />

                {/* Camera */}
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                {/* Controls */}
                <OrbitControls ref={controlsRef} />
                
                {/* Gameplay */}
                <CardLoader isGameplay={true} />
                {/* <AnimCards /> */}

                {/* Field */}
                <Field controlsRef={controlsRef} />
                <Grass /> 

            </Canvas>


            <LinkButton 
                to={"/builder"}
                content={"Builder"}
            />

        </>
    )
}