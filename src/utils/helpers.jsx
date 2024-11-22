
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