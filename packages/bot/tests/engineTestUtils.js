export const pipe = (...functions) => (value) => {
  return functions.reduce((currentValue, currentFunction) => {
    return currentFunction(currentValue);
  }, value);
};

// === INFO === //

/**
 * Because these functions are serialised, they must be already in-line.
 * It would be great to use esbuild or babel or something to 
 *  compile more complex functions into single es5 functions
 */

/**
 * @todo: make this file .ts and add typings from @xrengine/engine
 * @todo: https://stackoverflow.com/a/51122739
 */


// === SETUP WEBXR === //

export async function overrideXR() {
  // inject the webxr polyfill from the webxr emulator source
  globalThis.WebXRPolyfillInjection();
  new globalThis.CustomWebXRPolyfill();
  // override session supported request, it hangs indefinitely for some reason
  globalThis.navigator.xr.isSessionSupported = () => { return true }

  const deviceDefinition = {
    "id": "Oculus Quest",
    "name": "Oculus Quest",
    "modes": [
      "inline",
      "immersive-vr"
    ],
    "headset": {
      "hasPosition": true,
      "hasRotation": true
    },
    "controllers": [
      {
        "id": "Oculus Touch (Right)",
        "buttonNum": 7,
        "primaryButtonIndex": 0,
        "primarySqueezeButtonIndex": 1,
        "hasPosition": true,
        "hasRotation": true,
        "hasSqueezeButton": true,
        "isComplex": true
      },
      {
        "id": "Oculus Touch (Left)",
        "buttonNum": 7,
        "primaryButtonIndex": 0,
        "primarySqueezeButtonIndex": 1,
        "hasPosition": true,
        "hasRotation": true,
        "hasSqueezeButton": true,
        "isComplex": true
      }
    ]
  }

  // send our device info to the polyfill API so it knows our capabilities
  window.dispatchEvent(new CustomEvent('webxr-device-init', { detail: { stereoEffect: false, deviceDefinition } }))
}

export async function xrSupported() {
  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  globalThis.Engine.xrSupported = supported;
  return supported
}

export function xrInitialized() {
  return Boolean(globalThis.Engine.xrSession);
}

export function startXR() {
  globalThis.EngineEvents.instance.dispatchEvent({ type: 'WEBXR_RENDERER_SYSTEM_XR_START' });
  window.dispatchEvent(new CustomEvent('webxr-pose', { 
    detail: {
      position: [0, 1.6, 0],
      quaternion: [0, 0, 0, 1]
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', { 
    detail: {
      objectName: 'rightController',
      position: [0.5, 1.5, -1],
      quaternion: [0, 0, 0, 1]
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', { 
    detail: {
      objectName: 'leftController',
      position: [-0.5, 1.5, -1],
      quaternion: [0, 0, 0, 1]
    }
  }))
}

/**
 * @param {object} args 
 * @param {array} args.position
 * @param {array} args.quaternion
 * @returns {function}
 */
 export function updateHead(args) {
  window.dispatchEvent(new CustomEvent('webxr-pose', { 
    detail: args
  }))
}

/**
 * @param {object} args 
 * @param {array} args.position
 * @param {array} args.quaternion
 * @param {string} args.objectName
 * @returns {function}
 */
export function updateController(args) {
  window.dispatchEvent(new CustomEvent('webxr-input-pose', { 
    detail: args
  }))
}
/**
 * @param {object} args 
 * @param {boolean} args.pressed
 * @param {string} args.objectName
 * @param {number} args.buttonIndex
 * @returns {function}
 */
export function pressControllerButton(args) {
  window.dispatchEvent(new CustomEvent('webxr-input-button', { 
    detail: args
  }))
}

/**
 * @param {object} args 
 * @param {boolean} args.value
 * @param {string} args.objectName
 * @param {number} args.axesIndex
 * @returns {function}
 */
export function moveControllerStick(args) {
  window.dispatchEvent(new CustomEvent('webxr-input-axes', { 
    detail: args
  }))
}

// === ENGINE === //

export function getComponent(entity, name) {
  return Object.values(entity.components).find((component) => { return component.name === name; });
}

export function getPlayerPosition() {
  const pos = (Object.values(globalThis.Network.instance.localClientEntity.components).find((component) => {
    return component.name === 'TransformComponent';
  }))?.position;
  if(!pos) return;
  // transform is centered on collider
  pos.y -= 0.9
  return pos;
}

export function getIsYourTurn() {
  return typeof (Object.values(globalThis.Network.instance.localClientEntity.components).find((component) => {
    return component.name === 'YourTurn';
  })) !== 'undefined';
}

// is in world space, so subtract player pos from it
export function getXRInputPosition() {
  const input = (Object.values(globalThis.Network.instance.localClientEntity.components).find((component) => {
    return component.name === 'Input';
  }));
  const headInputValue = input.data.get(37)?.value;
  const leftControllerInputValue = input.data.get(38)?.value;
  const rightControllerInputValue = input.data.get(39)?.value;
  return {
    headInputValue,
    leftControllerInputValue,
    rightControllerInputValue
  }
}
