import { getEntityByID, getMutableComponent } from "./EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { applyNetworkStateToClient } from "../../networking/functions/applyNetworkStateToClient";
import { ClientNetworkSystem } from "../../networking/systems/ClientNetworkSystem";
import { loadScene, SCENE_EVENTS } from "../../scene/functions/SceneLoading";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { loadActorAvatar, CHARACTER_EVENTS } from "../../templates/character/prefabs/NetworkPlayerCharacter";
import { EngineEvents } from "../classes/EngineEvents";

export const addIncomingEvents = () => {

  const loadSceneEvent = (ev: any) => {
    loadScene(ev.result);
    EngineEvents.instance.removeEventListener(SCENE_EVENTS.LOAD_SCENE, loadSceneEvent)
  }
  EngineEvents.instance.addEventListener(SCENE_EVENTS.LOAD_SCENE, loadSceneEvent)

  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA, (ev: any) => {
    applyNetworkStateToClient(ev.unbufferedState, ev.delta);
  })
  EngineEvents.instance.addEventListener(CHARACTER_EVENTS.LOAD_AVATAR, (ev) => {
    const entity = getEntityByID(ev.entityID)
    const characterAvatar = getMutableComponent(entity, CharacterComponent);
    if (characterAvatar != null) characterAvatar.avatarId = ev.avatarId;
    loadActorAvatar(entity)
  })

}

export const addOutgoingEvents = () => {
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.SEND_DATA, (ev) => {
    Network.instance.transport.sendData(ev.buffer);
  });
}