import { Quaternion } from 'cannon-es';
import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/Collider';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Entity } from '../../ecs/classes/Entity';
const quaternion = new Quaternion();
export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onAdded') {
  } else if (args.phase == 'onUpdate') {
    const collider = getComponent<ColliderComponent>(entity, ColliderComponent).collider;
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

    if (args.isKinematic) {
      collider.position.x = transform.position[0];
      collider.position.y = transform.position[1];
      collider.position.z = transform.position[2];
      //  quaternion.set(collider.quaternion.x, collider.quaternion.y, collider.quaternion.z, collider.quaternion.w)
      //  transform.rotation = quaternion.toArray()
    } else {
      transform.position = [collider.position.x, collider.position.y, collider.position.z];
      // console.log(collider.position );
      quaternion.set(collider.quaternion.x, collider.quaternion.y, collider.quaternion.z, collider.quaternion.w);
      transform.rotation = quaternion.toArray();
    }
  } else if (args.phase == 'onRemoved') {
    /*
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const body = object.userData.body
    delete object.userData.body
    PhysicsWorld.instance.physicsWorld.removeBody(body)
    */
  }
};
