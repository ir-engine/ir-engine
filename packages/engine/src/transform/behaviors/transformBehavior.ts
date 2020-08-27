import { Quaternion } from 'three';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
const q: Quaternion = new Quaternion();
let transform: TransformComponent;
export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  transform = getMutableComponent(entity, TransformComponent);
  // if(transform.velocity.length() > 0.0001){
  //   // Do we need to scale velocity by dt?
  //   transform.position.add(transform.velocity.multiplyScalar(delta))
  // }

  const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  if (object3DComponent == undefined) return console.warn('No Object3D located ', console.log(entity.componentTypes));
  object3DComponent.value.position.copy(transform.position)
  object3DComponent.value.rotation.setFromQuaternion(transform.rotation)
};
