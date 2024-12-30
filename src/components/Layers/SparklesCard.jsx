import { Float, Sparkles } from "@react-three/drei";


export default function SparklesCard() {
    return (
        <>
            <Float
                speed={2.5}
                rotationIntensity={0.6}
                floatIntensity={0.6}
            >
                <Sparkles 
                    position={[-.5, 2, 0]}
                    count={50}
                    scale={[5, 3.5, 2.5]}
                    color={"#ffaacc"}
                    size={6}
                    speed={0.2}
                    noise={0.1}
                />

                <Sparkles 
                    position={[0, 1, 0]}
                    count={50}
                    scale={[12, 2, 12]}
                    color={"#ffe6a8"}
                    size={10}
                    speed={0.2}
                    noise={0.2}
                />

                <Sparkles 
                    position={[0, -2, 0]}
                    count={50}
                    scale={[4, 4, 4]}
                    color={"#ffe6a8"}
                    size={6}
                    speed={0.2}
                    noise={0.2}
                />
            </Float>
        </>
    )
}