// Based on https://codepen.io/al-ro/pen/jJJygQ by al-ro, but rewritten in react-three-fiber
import * as THREE from "three"
import React, { useRef, useMemo, useEffect, useState } from "react"
import SimplexNoise from "simplex-noise"
import { useFrame, useLoader } from "@react-three/fiber"
//These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
import bladeDiffuse from "/grass/blade_diffuse.jpg"
import bladeAlpha from "/grass/blade_alpha.jpg"
import "./GrassMaterial.jsx"
import { useControls } from "leva"


THREE.ColorManagement.legacyMode = false;


const simplex = new SimplexNoise(Math.random)
export default function GrassV2({
  onLoad,
  // options = { bW: 0.05, bH: .83, joints: 5 },
  width = 70,
  height = 50, // Add height for rectangle dimensions
  // instances = 50000,
  ...props
}) {

  const [key, setKey] = useState(0)

  // const { bW, bH, joints } = options;
  const materialRef = useRef();
  const [texture, alphaMap] = useLoader(THREE.TextureLoader, [bladeDiffuse, bladeAlpha]);

  const { instances, bW, bH, joints } = useControls('Grass', {
    instances: { value: 80000, min: 0, max: 200000, step: 1 },
    bW: { value: 0.05, min: 0, max: 2, step: 0.001 },
    bH: { value: 1.05, min: 0, max: 2, step: 0.001 },
    joints: { value: 5, min: 0, max: 10, step: 1 }
  })


  // Grass attributes based on rectangular dimensions
  const attributeData = useMemo(() => getAttributeData(instances, width, height), [instances, width, height]);

  // Base blade geometry
  const baseGeom = useMemo(
    () => new THREE.PlaneGeometry(bW, bH, 1, joints).translate(0, bH / 2, 0),
    [bW, bH, joints]
  );

  useFrame((state) => (materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4));

  useEffect(() => {
    setKey((prevKey) => prevKey + 1)
    if (onLoad) onLoad()
  }, [
    bW, bH, joints, instances
  ])

  return (
    <group key={key} {...props} scale={[0.095, 0.095, 0.095]} position={[0, -2.45, -3]}  rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <instancedBufferGeometry
          index={baseGeom.index}
          attributes-position={baseGeom.attributes.position}
          attributes-uv={baseGeom.attributes.uv}
        >
          <instancedBufferAttribute attach={"attributes-offset"} args={[new Float32Array(attributeData.offsets), 3]} />
          <instancedBufferAttribute attach={"attributes-orientation"} args={[new Float32Array(attributeData.orientations), 4]} />
          <instancedBufferAttribute attach={"attributes-stretch"} args={[new Float32Array(attributeData.stretches), 1]} />
          <instancedBufferAttribute attach={"attributes-halfRootAngleSin"} args={[new Float32Array(attributeData.halfRootAngleSin), 1]} />
          <instancedBufferAttribute attach={"attributes-halfRootAngleCos"} args={[new Float32Array(attributeData.halfRootAngleCos), 1]} />
        </instancedBufferGeometry>
        <grassMaterial ref={materialRef} map={texture} alphaMap={alphaMap} toneMapped={false} />
      </mesh>
    </group>
  );
}

function getAttributeData(instances, width, height) {
  const offsets = [];
  const orientations = [];
  const stretches = [];
  const halfRootAngleSin = [];
  const halfRootAngleCos = [];

  let quaternion_0 = new THREE.Vector4();
  let quaternion_1 = new THREE.Vector4();

  const min = -0.25;
  const max = 0.25;

  for (let i = 0; i < instances; i++) {
    // Adjust offsets for rectangular proportions
    const offsetX = Math.random() * width - width / 2;
    const offsetZ = Math.random() * height - height / 2; // Use height for Z-dimension
    const offsetY = getYPosition(offsetX, offsetZ);
    offsets.push(offsetX, offsetY, offsetZ);

    // Grass blade orientation and rotation logic remains the same
    let angle = Math.PI - Math.random() * (2 * Math.PI);
    halfRootAngleSin.push(Math.sin(0.5 * angle));
    halfRootAngleCos.push(Math.cos(0.5 * angle));

    let RotationAxis = new THREE.Vector3(0, 1, 0);
    let x = RotationAxis.x * Math.sin(angle / 2.0);
    let y = RotationAxis.y * Math.sin(angle / 2.0);
    let z = RotationAxis.z * Math.sin(angle / 2.0);
    let w = Math.cos(angle / 2.0);
    quaternion_0.set(x, y, z, w).normalize();

    angle = Math.random() * (max - min) + min;
    RotationAxis = new THREE.Vector3(1, 0, 0);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    angle = Math.random() * (max - min) + min;
    RotationAxis = new THREE.Vector3(0, 0, 1);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);

    if (i < instances / 3) {
      stretches.push(Math.random() * 1.8);
    } else {
      stretches.push(Math.random());
    }
  }

  return {
    offsets,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin,
  };
}


function multiplyQuaternions(q1, q2) {
  const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x
  const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y
  const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z
  const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
  return new THREE.Vector4(x, y, z, w)
}

function getYPosition(x, z) {
  var y = 2 * simplex.noise2D(x / 50, z / 50)
  y += 4 * simplex.noise2D(x / 100, z / 100)
  y += 0.2 * simplex.noise2D(x / 10, z / 10)
  // return y
  return 0
}