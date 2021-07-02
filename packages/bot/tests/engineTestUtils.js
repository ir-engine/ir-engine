export const pipe = (...functions) => (value) => {
  return functions.reduce((currentValue, currentFunction) => {
    return currentFunction(currentValue);
  }, value);
};

export async function overrideXR () {
    // inject the webxr polyfill from the webxr emulator source
    globalThis.WebXRPolyfillInjection();
    new globalThis.CustomWebXRPolyfill();
    // override session supported request, it hangs indefinitely for some reason
    //@ts-ignore
    globalThis.navigator.xr.isSessionSupported = () => { return true }
}

export async function xrSupported () {
  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  globalThis.Engine.xrSupported = supported;
  return supported
}

export function xrInitialized () {
  return typeof globalThis.Engine.xrSession !== 'undefined';
}

export function getComponent (entity, name) {
  return Object.values(entity.components).find((component) => { return component.name === name; });
}

export function getPlayerPosition () {
  return (Object.values(globalThis.Network.instance.localClientEntity.components).find((component) => { 
    return component.name === 'TransformComponent';
  }))?.position;
}

export function getIsYourTurn () {
  return typeof (Object.values(globalThis.Network.instance.localClientEntity.components).find((component) => { 
    return component.name === 'YourTurn';
  })) !== 'undefined';
}