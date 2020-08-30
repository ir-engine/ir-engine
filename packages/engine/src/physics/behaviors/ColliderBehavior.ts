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
import { getMutableComponent, hasComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3 } from 'cannon-es';

export const ColliderBehavior: Behavior = (entity: Entity, args: { phase: string }): void => {
  if (args.phase == 'onAdded') {
    const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    if(collider.type !== undefined && collider.collider == undefined){
    let body;
    if (collider.type === 'box') body = createBox(entity);
    else if (collider.type === 'cylinder') body = createCylinder(entity);
    else if (collider.type === 'sphere') body = createSphere(entity);
    else if (collider.type === 'convex') body = createConvexGeometry(entity, getMutableComponent<Object3DComponent>(entity, Object3DComponent as any).value);
    else if (collider.type === 'ground') body = createGroundGeometry(entity);

    collider.collider = body;
      
    // If this entity has an object3d, get the position of that
    // if(hasComponent(entity, Object3DComponent)){
    //   body.position = cannonFromThreeVector(getComponent<Object3DComponent>(entity, Object3DComponent).value.position)
    // } else {
      body.position = new Vec3()
    // }

    PhysicsManager.instance.physicsWorld.addBody(body);
    }
  } else if (args.phase == 'onRemoved') {
    const collider = getComponent<ColliderComponent>(entity, ColliderComponent, true)?.collider;
    if (collider) {
      PhysicsManager.instance.physicsWorld.removeBody(collider);
    }
  }
};
