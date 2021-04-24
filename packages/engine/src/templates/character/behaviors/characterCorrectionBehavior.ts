
/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { ControllerColliderComponent } from "../../../physics/components/ControllerColliderComponent";
import { CharacterComponent } from "../components/CharacterComponent";

let correctionSpeed = 180;
export const characterCorrectionBehavior: Behavior = (entity: Entity, args): void => {

  const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  args.state.push({
    networkId: args.networkId,
    x: collider.controller.transform.translation.x,
    y: collider.controller.transform.translation.y,
    z: collider.controller.transform.translation.z,
    qX: 0, // physx controllers dont have rotation
    qY: 0,
    qZ: 0,
    qW: 1
  })
  if (args.correction == null || args.snapshot == null) return;

  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  if (!actor.initialized || !collider.controller) return;

  correctionSpeed = 180 / (actor.animationVelocity.length() + 1);

  const offsetX = args.correction.x - args.snapshot.x;
  const offsetY = args.correction.y - args.snapshot.y;
  const offsetZ = args.correction.z - args.snapshot.z;

  if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
    collider.controller.updateTransform({
      translation: {
        x: args.snapshot.x,
        y: args.snapshot.y,
        z: args.snapshot.z,
      }
    })
  } else {
    collider.controller.updateTransform({
      translation: {
        x: args.snapshot.x - (offsetX / correctionSpeed),
        y: args.snapshot.y - (offsetY / correctionSpeed),
        z: args.snapshot.z - (offsetZ / correctionSpeed),
      }
    })
  }
};