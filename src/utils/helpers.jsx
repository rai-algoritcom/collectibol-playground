import * as THREE from 'three'


export const getRandomPositionAndRotation = () => ({
    position: [
      (Math.random() - 0.5) * 8, // Random X within [-1, 1]
      (Math.random() - 0.5) * 6, // Random Y within [-1.5, 1.5]
      -0.02, // Slightly above the surface
    ],
    rotation: [
      0, // Keep rotation flat on the surface
      0,
      Math.random() * Math.PI * 2, // Random Z-axis rotation
    ],
  });


export const debounce = (func, wait, immediate) => {
  let timeout;
  return function (...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);

    if (callNow) func.apply(context, args);
  };
}


export const downloadJSON = (cfg) => {
  const configData = JSON.stringify(cfg, null, 2); // Convert config to JSON string
  const blob = new Blob([configData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'configurations.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export const takeScreenshot = (gl, scene, camera, mesh) => {
  const originalPosition = camera.position.clone(); // Save original camera position
  const originalRotation = camera.rotation.clone(); // Save original camera rotation

  // Calculate bounding box of the mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Position camera at a distance that fits the whole mesh
  const maxDimension = Math.max(size.x, size.y, size.z);
  const distance = maxDimension * 1.5; // Adjust multiplier for desired framing

  camera.position.set(0, 0, distance); // Center camera at (0, 0, distance)
  camera.lookAt(0, 0, 0); // Look at the center of the scene
  camera.updateProjectionMatrix(); // Ensure the camera projection is updated

  // Ensure the scene is updated
  scene.updateMatrixWorld(true);

  // Take the screenshot
  const width = window.innerWidth * 2; // Adjust resolution
  const height = window.innerHeight * 2;

  gl.setSize(width, height);
  gl.setPixelRatio(2);
  gl.render(scene, camera);

  const screenshot = gl.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = screenshot;
  link.download = "screenshot.png";
  link.click();

  // Restore original camera position and orientation
  camera.position.copy(originalPosition);
  camera.rotation.copy(originalRotation);
  camera.updateProjectionMatrix();

  // Restore original renderer size
  gl.setSize(window.innerWidth, window.innerHeight);
  gl.setPixelRatio(window.devicePixelRatio);
}