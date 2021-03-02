import { System } from "../ecs/classes/System";
import { WebGLRendererSystem } from "../renderer/WebGLRendererSystem";
import { MessageQueue } from './MessageQueue';

export const SYSTEM_PROXY = {
  EVENT: 'SYSTEM_PROXY_EVENT',
  EVENT_ADD: 'SYSTEM_PROXY_EVENT_ADD',
  EVENT_REMOVE: 'SYSTEM_PROXY_EVENT_REMOVE',
};

// this can exist isomorphically on either side of the worker context

export class SystemProxy extends System {
  static instance;
  systemLabel: string;  
  constructor(systemLabel: string) {
    super()
    this.systemLabel = systemLabel;
  }
  
  addEventListener(type: string, listener: any) {
    ((globalThis as any).__messageQueue as MessageQueue).sendEvent(SYSTEM_PROXY.EVENT_ADD, { system: this.systemLabel, type });
    super.addEventListener(type, listener)
  }
  
  removeEventListener(type: string, listener: any) {
    ((globalThis as any).__messageQueue as MessageQueue).sendEvent(SYSTEM_PROXY.EVENT_REMOVE, { system: this.systemLabel, type });
    super.removeEventListener(type, listener)
  }
  
  // @ts-ignore
  dispatchEvent (event: any, fromSelf?: boolean) {
    if(!fromSelf) {
      ((globalThis as any).__messageQueue as MessageQueue).sendEvent(SYSTEM_PROXY.EVENT, { system: this.systemLabel, event });
    }
    delete event.target;
    super.dispatchEvent(event);
  }

  static _getSystem(systemLabel): typeof System {
    switch(systemLabel) {
      case 'WebGLRendererSystem': return WebGLRendererSystem;
      default: return;
    }
  }
}