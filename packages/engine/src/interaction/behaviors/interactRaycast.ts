import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InteractBehaviorArguments } from "../types";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Object3D, Raycaster, Vector3 } from "three";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Interactive } from "../components/Interactive";
import { Interacts } from "../components/Interacts";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */
export const interactRaycast:Behavior = (entity: Entity, { interactive }:InteractBehaviorArguments, delta: number): void => {
  const clientPosition = getComponent(entity, TransformComponent).position

  // TODO: this is only while we don't have InteractionPointers component, or similar data in Input
  if (!hasComponent(entity, CharacterComponent)) {
    return
  }

  const raycastList:Array<Object3D> = interactive
    .filter(interactiveEntity => {
      // - have object 3d to raycast
      if (!hasComponent(interactiveEntity, Object3DComponent)) {
        return false
      }

      // - distance check
      // TODO: handle parent transform!!!
      const distance = getComponent(interactiveEntity, TransformComponent).position.distanceTo(clientPosition)
      const interactive = getComponent(interactiveEntity, Interactive);

      if (distance > interactive.interactiveDistance) {
        return false
      }

      // - onInteractionCheck is not set or passed
      return (typeof interactive.onInteractionCheck !== 'function' || interactive.onInteractionCheck(entity, interactiveEntity))
    })
    .map(entity => getComponent(entity, Object3DComponent).value )

  if (!raycastList.length) {
    return
  }

  const character = getComponent(entity, CharacterComponent)
  if (!character.viewVector) {
    // console.warn('!character.viewVector')
    return
  }
  const raycaster = new Raycaster();
  // TODO: rayOrigin, rayDirection
  const rayOrigin = clientPosition
  const rayDirection = character.viewVector.clone().normalize().setY(0)

  raycaster.set(rayOrigin, rayDirection);
  const intersections = raycaster.intersectObjects( raycastList );

  const newRayHit = intersections.length? intersections[0] : null
  const interacts = getMutableComponent(entity, Interacts)
  interacts.focusedRayHit = newRayHit
  interacts.focusedInteractive = newRayHit? (newRayHit.object as any).entity : null
}