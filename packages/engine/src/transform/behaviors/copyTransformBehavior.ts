import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { CopyTransformComponent } from "../components/CopyTransformComponent";

export const copyTransformBehavior: Behavior = (entity: Entity): void => {
  if (!hasComponent(entity, CopyTransformComponent)) {
    return;
  }

  const inputEntity = getMutableComponent(entity, CopyTransformComponent)?.input;
  const outputTransform = getMutableComponent(entity, TransformComponent);
  const inputTransform = getComponent(inputEntity, TransformComponent);

  if (!inputTransform || !outputTransform) {
    // wait for both transforms to appear?
    return;
  }

  outputTransform.position.copy(inputTransform.position);
  outputTransform.rotation.copy(inputTransform.rotation);
  outputTransform.velocity.copy(inputTransform.velocity);

  removeComponent(entity, CopyTransformComponent);
};
