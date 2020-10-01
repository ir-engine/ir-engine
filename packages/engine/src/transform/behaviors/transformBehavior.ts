import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';

export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  const transform = getMutableComponent(entity, TransformComponent);

  transform.position.addScaledVector(transform.velocity, delta);

  const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  if (!object3DComponent) {
    return;
  }

  object3DComponent.value.position.copy(transform.position);
  object3DComponent.value.rotation.setFromQuaternion(transform.rotation);
  // object3DComponent.value.updateMatrixWorld();
};
