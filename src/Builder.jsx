import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CardLoader from "./components/CardLoader";
import { Link } from "react-router-dom";


export default function Builder() {
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
                <OrbitControls />
                
                {/* Gameplay */}
                <CardLoader isGameplay={false} />

            </Canvas>
            <Link
                to="/gameplay"
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    border: '2px solid white',
                    borderRadius: '8px',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)', // Subtle transparent background
                    backdropFilter: 'blur(10px)', // Blur effect for modern aesthetics
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif',
                    fontWeight: '400'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'black';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = 'white';
                  }}
            >
                Gameplay &rarr; </Link>
        </>
    )
}