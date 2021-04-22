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
 * @author Fernando Serrano, Robert Long
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
};

/**
 * 
 * @author Fernando Serrano, Robert Long
 */
export class EngineEvents extends EventDispatcher {
  static instance: EngineEvents = new EngineEvents();
  static EVENTS = EVENTS;
  constructor() {
    super();
  }
}

/**
 * 
 * @author Fernando Serrano, Robert Long
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
 * @author Fernando Serrano, Robert Long
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
 * @author Fernando Serrano, Robert Long
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
 * @author Fernando Serrano, Robert Long
 */
export class EngineEventsProxy extends EngineEvents {
  messageQueue: MessageQueue;
  constructor(messageQueue: MessageQueue) {
    super();
    this.messageQueue = messageQueue;
    const listener = (event: any) => {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event })
    };
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ADD, (ev: any) => {
      const { type } = ev.detail;
      this.addEventListener(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ONCE, (ev: any) => {
      const { type } = ev.detail;
      this.once(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE, (ev: any) => {
      const { type } = ev.detail;
      this.removeEventListener(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, (ev: any) => {
      const { type, deleteEvent } = ev.detail;
      this.removeAllListenersForEvent(type, deleteEvent, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT, (ev: any) => {
      const { event } = ev.detail;
      (this as any).dispatchEvent(event, true);
    });
  }
  addEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ADD, { type });
    }
    super.addEventListener(type, listener)
  }
  once(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ONCE, { type });
    }
    super.once(type, listener)
  }
  removeEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE, { type });
    }
    super.removeEventListener(type, listener)
  }
  removeAllListenersForEvent(type: string, deleteEvent: boolean, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, { type, deleteEvent });
    }
    super.removeAllListenersForEvent(type, deleteEvent)
  }
  dispatchEvent (event: any, fromSelf?: boolean, transferable?: Transferable[]) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event }, transferable);
    }
    super.dispatchEvent(event);
  }
}