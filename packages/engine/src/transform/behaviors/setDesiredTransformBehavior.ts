import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../components/TransformComponent";
import { DesiredTransformComponent } from "../components/DesiredTransformComponent";

const MAX_IGNORED_DISTANCE = 0.001;
const MAX_IGNORED_ANGLE = 0.001;

export const setDesiredTransformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  const transform = getComponent(entity, TransformComponent);
  const desiredTransform = getComponent(entity, DesiredTransformComponent);

  const positionIsSame = desiredTransform.position === null || transform.position.equals(desiredTransform.position);
  const rotationIsSame = desiredTransform.rotation === null || transform.rotation.equals(desiredTransform.rotation);

  if (positionIsSame && rotationIsSame) {
    // TODO: remove desiredTransform component?
    return;
  }

  if (!positionIsSame) {
    const mutableTransform = getMutableComponent(entity, TransformComponent);
    if (transform.position.distanceTo(desiredTransform.position) <= MAX_IGNORED_DISTANCE) {
      // position is too near, no need to move closer - just copy it
      mutableTransform.position.copy(desiredTransform.position);
    } else {
      // move to desired position
      // TODO: move to desired position
      // TODO: store alpha in DesiredTransformComponent ?
      // TODO: use speed instead of lerp?
      mutableTransform.position.lerp(desiredTransform.position, 0.1);
    }
  }

  if (!rotationIsSame) {
    const mutableTransform = getMutableComponent(entity, TransformComponent);
    if (transform.rotation.angleTo(desiredTransform.rotation) <= MAX_IGNORED_ANGLE) {
      // value is close enough, just copy it
      mutableTransform.rotation.copy(desiredTransform.rotation);
    } else {
      // lerp to desired rotation
      // TODO: lerp to desired rotation
      // TODO: store alpha in DesiredTransformComponent ?
      mutableTransform.rotation.slerp(desiredTransform.rotation, 0.1);
    }
  }
};
