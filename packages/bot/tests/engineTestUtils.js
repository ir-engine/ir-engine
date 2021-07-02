export const pipe = (...functions) => (value) => {
  return functions.reduce((currentValue, currentFunction) => {
    return currentFunction(currentValue);
  }, value);
};

export async function overrideXR() {
  // inject the webxr polyfill from the webxr emulator source
  globalThis.WebXRPolyfillInjection();
  new globalThis.CustomWebXRPolyfill();
  // override session supported request, it hangs indefinitely for some reason
  globalThis.navigator.xr.isSessionSupported = () => { return true }

  // send our device info to the polyfill API so it knows our capabilities
  window.dispatchEvent(new CustomEvent('webxr-device-init', 
    {
      detail: {
      stereoEffect: true,
      deviceDefinition: {
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
    }
  }))
}

export async function xrSupported() {
  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  globalThis.Engine.xrSupported = supported;
  return supported
}

export function startXR() {
  globalThis.EngineEvents.instance.dispatchEvent({ type: 'WEBXR_RENDERER_SYSTEM_XR_START' });
}
export function xrInitialized() {
  return Boolean(globalThis.Engine.xrSession);
}

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