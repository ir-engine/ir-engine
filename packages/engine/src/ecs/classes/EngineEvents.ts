import { EventDispatcher } from "../../common/classes/EventDispatcher";
import { isClient } from "../../common/functions/isClient";
import { isMobileOrTablet } from "../../common/functions/isMobile";
import { Network } from "../../networking/classes/Network";
import { applyNetworkStateToClient } from "../../networking/functions/applyNetworkStateToClient";
import { ClientNetworkSystem } from "../../networking/systems/ClientNetworkSystem";
import { XRSystem } from "../../xr/systems/XRSystem";
import { loadScene } from "../../scene/functions/SceneLoading";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { loadActorAvatar } from "../../templates/character/prefabs/NetworkPlayerCharacter";
import { MessageQueue } from "../../worker/MessageQueue";
import { getEntityByID, getMutableComponent } from "../functions/EntityFunctions";
import { Engine } from "./Engine";

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
const EVENTS = {

  // INITALIZATION
  CONNECT_TO_WORLD: 'CORE_CONNECT_TO_WORLD',
  CONNECT_TO_WORLD_TIMEOUT: 'CORE_CONNECT_TO_WORLD_TIMEOUT',
  JOINED_WORLD: 'CORE_JOINED_WORLD',
  LEAVE_WORLD: 'CORE_LEAVE_WORLD',

  LOAD_SCENE: 'CORE_LOAD_SCENE',
  SCENE_LOADED: 'CORE_SCENE_LOADED',
  ENTITY_LOADED: 'CORE_ENTITY_LOADED',
  ASSET_LOADER: 'CORE_ASSET_LOADER',

  // Start or stop client side physics & rendering
  ENABLE_SCENE: 'CORE_ENABLE_SCENE',

  // Entity
  LOAD_AVATAR: "CORE_LOAD_AVATAR",

  // MISC
  USER_ENGAGE: 'CORE_USER_ENGAGE',
  ENTITY_DEBUG_DATA: 'CORE_ENTITY_DEBUG_DATA', // to pipe offscreen entity data to UI
  PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE: 'CORE_PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE',
  PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE: 'CORE_PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE',
  CONNECTION_LOST: 'CORE_CONNECTION_LOST',
};

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
export class EngineEvents {
  static readonly instance: EngineEvents = new EngineEvents();
  static EVENTS = EVENTS;
  _listeners = {};
  constructor() {
    globalThis.EngineEvents = EngineEvents.instance;
  }
  public reset(): void {
    Object.keys(EngineEvents.instance._listeners).forEach(key => {
      delete EngineEvents.instance._listeners[key];
    });
  }
  once(eventName: string | number, listener: Function, ...args: any): void {
    const onEvent = (ev) => {
      EngineEvents.instance.removeEventListener(eventName, onEvent);
      listener(ev);
    }
    EngineEvents.instance.addEventListener(eventName, onEvent)
  }
  addEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listeners = EngineEvents.instance._listeners;
    if (listeners[eventName] === undefined) {
      listeners[eventName] = [];
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener);
    }
  }
  hasEventListener(eventName: string | number, listener: Function, ...args: any): boolean {
    return EngineEvents.instance._listeners[eventName] !== undefined && EngineEvents.instance._listeners[eventName].indexOf(listener) !== -1;
  }
  removeEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listenerArray = EngineEvents.instance._listeners[eventName];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }
  removeAllListenersForEvent(eventName: string, deleteEvent?: boolean, ...args: any) {
    if (deleteEvent) {
      delete EngineEvents.instance._listeners[eventName];
    } else {
      EngineEvents.instance._listeners[eventName] = [];
    }
  }
  dispatchEvent(event: { type: string;[attachment: string]: any }, ...args: any): void {
    const listenerArray = EngineEvents.instance._listeners[event.type];
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0);
      for (let i = 0; i < array.length; i++) {
        array[i].call(EngineEvents.instance, event, ...args);
      }
    }
  }
}

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
export const addIncomingEvents = () => {

  // INITIALIZATION
  EngineEvents.instance.once(EngineEvents.EVENTS.LOAD_SCENE, ({ sceneData }) => { loadScene(sceneData); })
  EngineEvents.instance.once(EngineEvents.EVENTS.USER_ENGAGE, () => { Engine.hasUserEngaged = true; });
  EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, ({ worldState }) => { applyNetworkStateToClient(worldState) });
  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, ({ worldState }) => {
    applyNetworkStateToClient(worldState);
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, enable: true });
  })

  // RUNTIME
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA, ({ unbufferedState, delta }) => {
    applyNetworkStateToClient(unbufferedState, delta);
  })
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.LOAD_AVATAR, ({ entityID, avatarId, avatarURL }) => {
    const entity = getEntityByID(entityID)
    const characterAvatar = getMutableComponent(entity, CharacterComponent);
    if (characterAvatar != null) {
      characterAvatar.avatarId = avatarId;
      characterAvatar.avatarURL = avatarURL;
    }
    loadActorAvatar(entity)
  })
}

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
export const addOutgoingEvents = () => {

  // RUNTIME
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.SEND_DATA, ({ buffer }) => {
    Network.instance.transport.sendReliableData(buffer);
    // Network.instance.transport.sendData(buffer);
  });
}
/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
const ENGINE_EVENTS_PROXY = {
  EVENT: 'ENGINE_EVENTS_PROXY_EVENT',
  EVENT_ADD: 'ENGINE_EVENTS_PROXY_EVENT_ADD',
  EVENT_ONCE: 'ENGINE_EVENTS_PROXY_EVENT_ONCE',
  EVENT_REMOVE: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE',
  EVENT_REMOVE_ALL: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE_ALL',
};

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */
export const proxyEngineEvents = (messageQueue: MessageQueue) => {
  const listener = (event: any) => {
    messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event })
  };
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ADD, (ev: any) => {
    const { type } = ev.detail;
    EngineEvents.instance.addEventListener(type, listener, true);
  });
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ONCE, (ev: any) => {
    const { type } = ev.detail;
    EngineEvents.instance.once(type, listener, true);
  });
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE, (ev: any) => {
    const { type } = ev.detail;
    EngineEvents.instance.removeEventListener(type, listener, true);
  });
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, (ev: any) => {
    const { type, deleteEvent } = ev.detail;
    EngineEvents.instance.removeAllListenersForEvent(type, deleteEvent, true);
  });
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT, (ev: any) => {
    const { event } = ev.detail;
    EngineEvents.instance.dispatchEvent(event, true);
  });

  const _addEventListener = EngineEvents.instance.addEventListener;
  EngineEvents.instance.addEventListener = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ADD, { type });
    }
    _addEventListener(type, listener);
  }.bind(EngineEvents.instance);

  const _once = EngineEvents.instance.once;
  EngineEvents.instance.once = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ONCE, { type });
    }
    _once(type, listener);
  }.bind(EngineEvents.instance);

  const _removeEventListener = EngineEvents.instance.removeEventListener;
  EngineEvents.instance.removeEventListener = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE, { type });
    }
    _removeEventListener(type, listener);
  }.bind(EngineEvents.instance);

  const _removeAllListenersForEvent = EngineEvents.instance.removeAllListenersForEvent;
  EngineEvents.instance.removeAllListenersForEvent = function (type: string, deleteEvent: boolean, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, { type, deleteEvent });
    }
    _removeAllListenersForEvent(type, deleteEvent);
  }.bind(EngineEvents.instance);
  
  const _dispatchEvent = EngineEvents.instance.dispatchEvent;
  EngineEvents.instance.dispatchEvent = function (event: any, fromSelf?: boolean, transferable?: Transferable[]) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event }, transferable);
    }
    _dispatchEvent(event);
  }.bind(EngineEvents.instance);
}