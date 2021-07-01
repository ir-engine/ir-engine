export const pipe = (...functions) => (value) => {
  return functions.reduce((currentValue, currentFunction) => {
    return currentFunction(currentValue);
  }, value);
};

export function engineInitialised () {
  return globalThis.Engine.isInitialized;
}

export function getComponent (entity, name) {
  return Object.values(entity.components).find((component: any) => { return component.name === name; }) as any;
}

export function getPlayerPosition () {
  return (Object.values(globalThis.Network.instance.localClientEntity.components).find((component: any) => { 
    return component.name === 'TransformComponent';
  }) as any)?.position;
}