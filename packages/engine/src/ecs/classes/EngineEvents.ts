import { EventDispatcher } from "../../common/classes/EventDispatcher";
import { Network } from "../../networking/classes/Network";
import { applyNetworkStateToClient } from "../../networking/functions/applyNetworkStateToClient";
import { ClientNetworkSystem } from "../../networking/systems/ClientNetworkSystem";
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { loadScene } from "../../scene/functions/SceneLoading";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { loadActorAvatar } from "../../templates/character/prefabs/NetworkPlayerCharacter";
import { MessageQueue } from "../../worker/MessageQueue";
import { getEntityByID, getMutableComponent } from "../functions/EntityFunctions";
import { Engine } from "./Engine";

const EVENTS = {

  // INITALIZATION
  CONNECT_TO_WORLD: 'CORE_CONNECT_TO_WORLD',
  CONNECT_TO_WORLD_TIMEOUT: 'CORE_CONNECT_TO_WORLD_TIMEOUT',
  JOINED_WORLD: 'CORE_JOINED_WORLD',
  LEAVE_WORLD: 'CORE_LEAVE_WORLD',
  
  LOAD_SCENE: 'CORE_LOAD_SCENE',
  SCENE_LOADED: 'CORE_SCENE_LOADED',
  ENTITY_LOADED: 'CORE_ENTITY_LOADED',

  // Entity
  LOAD_AVATAR: "CORE_LOAD_AVATAR",
  CLIENT_ENTITY_LOAD: "CORE_CLIENT_ENTITY_LOAD",

  // MISC
  USER_ENGAGE: 'CORE_USER_ENGAGE',
};

export class EngineEvents extends EventDispatcher {
  static instance: EngineEvents;
  static EVENTS = EVENTS;
  constructor() {
    super();
    EngineEvents.instance = this;
  }
}

export const addIncomingEvents = () => {

  // call this Event to load the scene
  const doLoadScene = (ev: any) => {
    loadScene(ev.result);
    EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.LOAD_SCENE, doLoadScene)
  }
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.LOAD_SCENE, doLoadScene)

  // this event fires once the scene has loaded
  const onWorldJoined = (ev: any) => {
    console.log(ev)
    applyNetworkStateToClient(ev.worldState);
    PhysicsSystem.simulate = true;
    EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.JOINED_WORLD, onWorldJoined)
  }
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.JOINED_WORLD, onWorldJoined)

  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA, (ev: any) => {
    applyNetworkStateToClient(ev.unbufferedState, ev.delta);
  })
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.LOAD_AVATAR, (ev) => {
    const entity = getEntityByID(ev.entityID)
    const characterAvatar = getMutableComponent(entity, CharacterComponent);
    if (characterAvatar != null) characterAvatar.avatarId = ev.avatarId;
    loadActorAvatar(entity)
  })

  const onUserEngage = () => {
    Engine.hasUserEngaged = true;
    EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.USER_ENGAGE, onUserEngage);
  }
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.USER_ENGAGE, onUserEngage);
}

export const addOutgoingEvents = () => {
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.SEND_DATA, (ev) => {
    Network.instance.transport.sendData(ev.buffer);
  });
}

const ENGINE_EVENTS_PROXY = {
  EVENT: 'ENGINE_EVENTS_PROXY_EVENT',
  EVENT_ADD: 'ENGINE_EVENTS_PROXY_EVENT_ADD',
  EVENT_REMOVE: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE',
};

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
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE, (ev: any) => {
      const { type } = ev.detail;
      this.removeEventListener(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT, (ev: any) => {
      const { event } = ev.detail;
      this.dispatchEvent(event, true);
    });
  }

  addEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ADD, { type });
    }
    super.addEventListener(type, listener)
  }
  
  removeEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE, { type });
    }
    super.removeEventListener(type, listener)
  }
  
  dispatchEvent (event: any, fromSelf?: boolean, transferable?: Transferable[]) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event }, transferable);
    }
    super.dispatchEvent(event);
  }
}