import {
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import Card from "./Card.jsx";

export const Experience = ({
}) => {

  return (
    <>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        {/* Controls */}
        <OrbitControls />
        {/* Lights */}
        {/* <ambientLight intensity={5} />
        <directionalLight position={[10, 10, 10]} /> */}
        <Card  />
    </>
  );
};
