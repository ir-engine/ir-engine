import { isClient } from "../../common/functions/isClient";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { PortalComponent } from "../../scene/components/PortalComponent";
import { CharacterComponent } from "../components/CharacterComponent";
import { teleportPlayer } from "../prefabs/NetworkPlayerCharacter";

export const detectUserInPortal = () => {

  if(!Network.instance.localClientEntity) return;

  const actor = getComponent(Network.instance.localClientEntity, CharacterComponent);

  if (!actor.raycastQuery.hits[0] || !actor.raycastQuery.hits[0].body) return;

  const body = actor.raycastQuery.hits[0].body

  if (!body.userData) return;

  const portalComponent = getComponent(body.userData, PortalComponent);

  if (!portalComponent) return;

  if (isClient) {
    EngineEvents.instance.dispatchEvent({
      type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent: {
        location: portalComponent.location,
        displayText: portalComponent.displayText,
        spawnPosition: {
          x: portalComponent.spawnPosition.x,
          y: portalComponent.spawnPosition.y,
          z: portalComponent.spawnPosition.z,
        },
        spawnRotation: {
          x: portalComponent.spawnRotation.x,
          y: portalComponent.spawnRotation.y,
          z: portalComponent.spawnRotation.z,
          w: portalComponent.spawnRotation.w,
        }
      }
      // quaternions don't json properly. threejs nonsense...
      // portalComponent: portalComponent.json()
    });
  } else {
    teleportPlayer(Network.instance.localClientEntity, portalComponent.spawnPosition, portalComponent.spawnRotation);
  }

}