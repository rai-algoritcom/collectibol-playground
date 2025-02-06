import * as THREE from 'three'
import { toPng } from "html-to-image";


export const randomInRange = (min, max) => Math.random() * (max - min) + min

export const getRandomPositionAndRotation = () => ({
  pos: new THREE.Vector2(
      randomInRange(-0.1, 0.1),
      randomInRange(-0.1, 0.1)
  ),
  rot: randomInRange(0, Math.PI * 3)
})


export const getRandoPositionAndRotationPattern = () => ({
  pos: new THREE.Vector2(
    randomInRange(-0.2, 0.2),
    randomInRange(-0.2, 0.2)
  ),
  rot: randomInRange(0, Math.PI * 6)
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



export const takeScreenshot = async (gl, scene, camera, mesh, htmlElements = [], transparent = false, isMin = false) => {
  const originalPosition = camera.position.clone(); // Save original camera position
  const originalRotation = camera.rotation.clone(); // Save original camera rotation
  const originalAspect = camera.aspect; // Save original aspect ratio

  // Enable transparency
  const ogBackground = scene.background;

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

  // Adjust the center to the bottom of the mesh
  const bottomPosition = center.clone();
  bottomPosition.y -= size.y / 2; // Move to the bottom of the mesh

  // Calculate distance required to fit the entire mesh
  const maxDimension = Math.max(size.x, size.y, size.z);
  const marginMultiplier = 1.1; // Adjust this for larger/smaller margins
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

  // Generate WebGL canvas image
  const webglImage = gl.domElement.toDataURL("image/png");

  // Prepare the combined canvas
  const combinedCanvas = document.createElement("canvas");
  combinedCanvas.width = width;
  combinedCanvas.height = height;
  const ctx = combinedCanvas.getContext("2d");

  // Draw WebGL content
  const webglImg = new Image();
  webglImg.src = webglImage;
  await new Promise((resolve) => {
    webglImg.onload = () => {
      ctx.drawImage(webglImg, 0, 0, width, height);
      resolve();
    };
  });

  let index = 0
  // Process each HTML element
  for (const htmlElement of htmlElements) {
    // Capture HTML content
    const htmlImage = await toPng(htmlElement);

    // Calculate HTML element position and size relative to the mesh
    const htmlRect = htmlElement.getBoundingClientRect();
    const meshScreenPosition = new THREE.Vector3(bottomPosition.x, bottomPosition.y - ((isMin && index == 0) ? -1 : index > 0 ? -.125 : 0), bottomPosition.z);
    meshScreenPosition.project(camera);

    const meshScreenX = ((meshScreenPosition.x + 1) / 2) * width;
    const meshScreenY = ((1 - meshScreenPosition.y) / 2) * height;

    const widthScalingFactor = (isMin && index == 0) ? .98 : 1.0; // Adjust for consistent scaling
    const heightScalingFactor = (isMin && index == 0) ? .98 : 1.0;

    const meshScaleX = ((htmlRect.width / window.innerWidth) * width) * widthScalingFactor;
    const meshScaleY = ((htmlRect.height / window.innerHeight) * height) * heightScalingFactor;

    // Draw HTML content aligned with the mesh
    const htmlImg = new Image();
    htmlImg.src = htmlImage;
    await new Promise((resolve) => {
      htmlImg.onload = () => {
        ctx.drawImage(htmlImg, meshScreenX - meshScaleX / 2, meshScreenY - meshScaleY, meshScaleX, meshScaleY);
        resolve();
      };
    });

    index++
  }

  // Save combined screenshot
  const screenshot = combinedCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = screenshot;
  link.download = "screenshot.png";
  link.click();

  // Restore original camera settings
  camera.position.copy(originalPosition);
  camera.rotation.copy(originalRotation);
  camera.aspect = originalAspect;
  camera.updateProjectionMatrix();

  // Restore renderer size
  gl.setSize(window.innerWidth, window.innerHeight);
  gl.setPixelRatio(window.devicePixelRatio);

  if (transparent) {
    scene.background = ogBackground;
  }
};
