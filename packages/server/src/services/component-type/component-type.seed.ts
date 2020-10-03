import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'component-type',
  randomize: false,
  templates:
      [
        // Default Aframe components
        { type: 'animation' },
        { type: 'background' },
        { type: 'camera' },
        { type: 'cursor' },
        { type: 'debug' },
        { type: 'device-orientation-permission-ui' },
        { type: 'embedded' },
        { type: 'fog' },
        { type: 'geometry' },
        { type: 'gltf-model' },
        { type: 'hand-controls' },
        { type: 'keyboard-shortcuts' },
        { type: 'laser-controls' },
        { type: 'light' },
        { type: 'line' },
        { type: 'link' },
        { type: 'loading-screen' },
        { type: 'look-controls' },
        { type: 'obj-model' },
        { type: 'oculus-go-controls' },
        { type: 'pool' },
        { type: 'position' },
        { type: 'raycaster' },
        { type: 'renderer' },
        { type: 'rotation' },
        { type: 'scale' },
        { type: 'screenshot' },
        { type: 'shadow' },
        { type: 'sound' },
        { type: 'stats' },
        { type: 'text' },
        { type: 'tracked-controls' },
        { type: 'visible' },
        { type: 'vive-controls' },
        { type: 'vive-focus-controls' },
        { type: 'vr-mode-ui' },
        { type: 'wasd-controls' },
        { type: 'windows-motion-controls' },
        { type: 'networked' },
        // Custom Components
        { type: 'grid' }
      ]
};

export default seed;
