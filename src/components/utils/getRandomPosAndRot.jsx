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