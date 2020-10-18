import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';

export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  const transform = getMutableComponent(entity, TransformComponent);

  if(transform === undefined || transform.position == undefined)
    return console.log("Ignoring transform behavior")

    console.log("Sup with this transform?")
    console.log(transform.position)
    console.log(transform.position.addScaledVector)

  transform.position.addScaledVector(transform.velocity, delta);

  const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  if (!object3DComponent) {
    return;
  }

  object3DComponent.value.position.copy(transform.position);
  object3DComponent.value.rotation.setFromQuaternion(transform.rotation);
  // object3DComponent.value.updateMatrixWorld();
};
