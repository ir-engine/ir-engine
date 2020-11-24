import { Quaternion } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../components/RigidBody';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Entity } from '../../ecs/classes/Entity';

const quaternion = new Quaternion();

export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {

  if (args.phase == 'onUpdate') {
    const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
    const rigidBody = getComponent<RigidBody>(entity, RigidBody);
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

    if (colliderComponent.collider && transform) {

      if (rigidBody.isKinematic) {

        colliderComponent.collider.position.x = transform.position.x;
        colliderComponent.collider.position.y = transform.position.y;
        colliderComponent.collider.position.z = transform.position.z;
        //  quaternion.set(collider.quaternion.x, collider.quaternion.y, collider.quaternion.z, collider.quaternion.w)
        //  transform.rotation = quaternion.toArray()
      } else {
        console.log("Setting rigidbody");
        transform.position.set(
          colliderComponent.collider.position.x,
          colliderComponent.collider.position.y,
          colliderComponent.collider.position.z
        );
        transform.rotation.set(
          colliderComponent.collider.quaternion.x,
          colliderComponent.collider.quaternion.y,
          colliderComponent.collider.quaternion.z,
          colliderComponent.collider.quaternion.w
        );
      }
    }
  }
  else if (args.phase == 'onRemoved') {
    /*
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const body = object.userData.body
    delete object.userData.body
    PhysicsWorld.instance.physicsWorld.removeBody(body)
    */
  }
};
