import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience.jsx";
// import { Environment } from "@react-three/drei";

function App() {
  return (
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} dpr={[1, 2]} >
      <color attach="background" args={["#111211"]} />
      {/* <Environment preset="city" background blur={4} /> */}
      <Experience />
    </Canvas>
  );
}

export default App;
