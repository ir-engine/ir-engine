import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import {
  createBox,
  createCylinder,
  createSphere,
  createConvexGeometry,
  createGroundGeometry
} from './PhysicsBehaviors';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Shape, Body } from 'cannon-es';

export const addCollider: Behavior = (entity: Entity, args: { type: string, phase?: string }): void => {
  if (args.phase === 'onRemoved') {
    const collider = getComponent<ColliderComponent>(entity, ColliderComponent, true);
    if (collider) {
      PhysicsManager.instance.physicsWorld.removeBody(collider.collider);
    }
    return
  }

  // phase onAdded
  console.log("*** Adding collider")
  const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);

    console.log("collider type "+collider.type)
    let body;
    if (collider.type === 'box') body = createBox(entity);
    else if (collider.type === 'cylinder') body = createCylinder(entity);
    else if (collider.type === 'sphere') body = createSphere(entity);
    else if (collider.type === 'convex') body = createConvexGeometry(entity, getMutableComponent<Object3DComponent>(entity, Object3DComponent as any).value);
    else if (collider.type === 'ground') body = createGroundGeometry(entity);
    body.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    )
    collider.collider = body;

    // If this entity has an object3d, get the position of that
    // if(hasComponent(entity, Object3DComponent)){
    //   body.position = cannonFromThreeVector(getComponent<Object3DComponent>(entity, Object3DComponent).value.position)
    // } else {
    //   body.position = new Vec3()
    // }


  PhysicsManager.instance.physicsWorld.addBody(collider.collider);
};
