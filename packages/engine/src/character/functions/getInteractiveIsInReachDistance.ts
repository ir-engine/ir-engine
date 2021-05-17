import { Vector3 } from "three";
import { ParityValue } from "../../common/enums/ParityValue";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { getHandPosition, isInXR } from "../../xr/functions/WebXRFunctions";

export const interactiveReachDistance = 3;
export const interactiveReachDistanceVR = 0.5;

export const getInteractiveIsInReachDistance = (entityUser: Entity, interactivePosition: Vector3): ParityValue => {

  if(isInXR(entityUser)) {
    const leftHandPosition = getHandPosition(entityUser, ParityValue.LEFT);
    const rightHandPosition = getHandPosition(entityUser, ParityValue.RIGHT);
    if(leftHandPosition) {
      if(leftHandPosition.distanceTo(interactivePosition) < interactiveReachDistanceVR) {
        return ParityValue.LEFT;
      }
      return ParityValue.NONE;
    }
    if(rightHandPosition) {
      if(rightHandPosition.distanceTo(interactivePosition) < interactiveReachDistanceVR) {
        return ParityValue.RIGHT;
      }
      return ParityValue.NONE;
    }
    // if no hands are enabled, continue and use user transform position
  }
  const userPosition = getComponent(entityUser, TransformComponent).position;
  if (userPosition.distanceTo(interactivePosition) < interactiveReachDistance) {
    return ParityValue.RIGHT; 
  }
  return ParityValue.NONE;
}