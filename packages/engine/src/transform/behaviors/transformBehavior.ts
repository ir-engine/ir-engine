import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../components/TransformComponent';

export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  const transform = getMutableComponent(entity, TransformComponent);

  transform.position.addScaledVector(transform.velocity, delta);

  const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  if (!object3DComponent){
    // this breake a 
    //removeComponent(entity, TransformComponent);
    return; //console.warn("Object is not an object3d", entity.id);
  }

  if (!object3DComponent.value)
    return console.warn("object3D component on entity", entity.id, " is undefined");

    // if(!object3DComponent.value.position){
    //   return console.warn("object3D has no position");
    // }

  object3DComponent.value.position.copy(transform.position);
  object3DComponent.value.rotation.setFromQuaternion(transform.rotation);
  if (transform.scale && transform.scale.length() > 0) {
    object3DComponent.value.scale.copy(transform.scale);
  }
  object3DComponent.value.updateMatrixWorld();
};
