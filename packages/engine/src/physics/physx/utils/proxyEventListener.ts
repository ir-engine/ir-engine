import { EventDispatcher } from 'three';

export const proxyEventListener = (toProxy) => {
  const eventDispatcher = new EventDispatcher();
  toProxy.addEventListener = eventDispatcher.addEventListener;
  toProxy.hasEventListener = eventDispatcher.hasEventListener;
  toProxy.removeEventListener = eventDispatcher.removeEventListener;
  toProxy.dispatchEvent = eventDispatcher.dispatchEvent;
};
