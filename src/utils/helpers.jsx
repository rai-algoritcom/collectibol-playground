import * as THREE from 'three'


export const randomInRange = (min, max) => Math.random() * (max - min) + min

export const getRandomPositionAndRotation = () => ({
  pos: new THREE.Vector2(
      randomInRange(-0.1, 0.1),
      randomInRange(-0.1, 0.1)
  ),
  rot: randomInRange(0, Math.PI * 3)
})


export function normalizeAngle(newAngle, lastAngle) {
  let delta = newAngle - lastAngle;

  // Adjust for wraparound: Ensure delta is in range [-π, π]
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;

  // Compute the smoothed angle
  return lastAngle + delta;
}



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



export const takeScreenshot = (gl, scene, camera, mesh, transparent = false) => {
  const originalPosition = camera.position.clone(); // Save original camera position
  const originalRotation = camera.rotation.clone(); // Save original camera rotation
  const originalAspect = camera.aspect; // Save original aspect ratio

  // Enable transparency
  const ogBackground = scene.background

  if (transparent) {
    gl.setClearColor(0x000000, 0); // Fully transparent
    gl.clear(); // Clear the frame buffer
    scene.background = null;   
  }

  // Ensure the mesh's world matrix is up-to-date
  mesh.updateMatrixWorld(true);

  // Calculate bounding box of the mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  // Calculate distance required to fit the entire mesh
  const maxDimension = Math.max(size.x, size.y, size.z);
  const marginMultiplier = 1.1; // Adjust this for larger/smaller margins (e.g., 1.1 for 10%)
  const distance = (maxDimension * marginMultiplier) / (2 * Math.tan((camera.fov * Math.PI) / 360)); // Perspective

  // Adjust camera position to center the mesh with added margins
  camera.position.set(center.x, center.y, center.z + distance); // Center camera at mesh
  camera.lookAt(center); // Ensure the camera looks at the center of the mesh

  // Adjust camera aspect ratio for consistency
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  // Adjust renderer to fit window dimensions
  const width = window.innerWidth * 2; // Increase resolution
  const height = window.innerHeight * 2;
  gl.setSize(width, height);
  gl.setPixelRatio(2);

  // Render the scene
  gl.render(scene, camera);

  // Generate the screenshot
  if (transparent) {
    const screenshot = gl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = "screenshoot.png";
    link.click();

    scene.background = ogBackground

  } else {
    const screenshot = gl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = "screenshoot.png";
    link.click();
  }

  // Restore original camera settings
  camera.position.copy(originalPosition);
  camera.rotation.copy(originalRotation);
  camera.aspect = originalAspect;
  camera.updateProjectionMatrix();

  // Restore renderer size
  gl.setSize(window.innerWidth, window.innerHeight);
  gl.setPixelRatio(window.devicePixelRatio);
};


