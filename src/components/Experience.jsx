import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import Card from "./Card.jsx";
import Grass from "./Grass.jsx";
import Field from "./Field.jsx";


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
        
        {/* Gameplay */}
        <Card  />

        {/* Field */}
        <Field />
        <Grass /> 
    </>
  );
};
