import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience.jsx";
import { Environment } from "@react-three/drei";

function App() {

  return (
    <Canvas 
      shadows 
      camera={{ position: [3, 3, 3], fov: 30 }} 
      gl={{ alpha: true, antialias: true, precision: 'mediump' }} 
      dpr={[1, 2]} 
    >
      <color attach="background" args={["#1B1B1B"]} />

      <Environment files="/env/the_sky_is_on_fire_4k.hdr" background={false} />

      <Experience />
    </Canvas>
  );
}

export default App;
